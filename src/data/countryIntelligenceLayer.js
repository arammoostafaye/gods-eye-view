/**
 * Country Intelligence Layer - Personal Edition
 * Handles country click detection and shows intelligence panel
 * Integrates with cyber threat monitors
 */

import * as Cesium from 'cesium';
import { CountryInfoPanel } from '../ui/countryInfoPanel.js';
import { CyberThreatMap } from '../ui/cyberThreatMap.js';
import { createCountryIntelToolbar } from '../ui/countryIntelToolbar.js';
import { GlobalThreatDashboard } from '../ui/globalThreatDashboard.js';
import { getCountryByCode, getCountryByLatLon } from './countryIntelligence/countryDatabase.js';
import { internetOutageMonitor } from './cyberIntelligence/internetOutage.js';
import { ddosMonitor } from './cyberIntelligence/ddosAttacks.js';
import { phishingMonitor, zeroDayMonitor } from './cyberIntelligence/phishingAndZeroDay.js';
import { speedMonitor } from './cyberIntelligence/filteringAndSpeed.js';
import { liveCurrencyMonitor } from './cyberIntelligence/liveCurrency.js';

let _viewer = null;
let _countryPanel = null;
let _threatMap = null;
let _toolbar = null;
let _dashboard = null;
let _clickHandler = null;
let _enabled = false;

function handleMapClick(movement) {
  if (!_viewer) return;
  
  // Get lat/lon from click
  const pickedPosition = _viewer.scene.pickPosition(movement.position);
  let cartographic = null;
  
  if (pickedPosition) {
    cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
  } else {
    // Fallback: pick ellipsoid
    const ray = _viewer.camera.getPickRay(movement.position);
    if (ray) {
      const intersection = _viewer.scene.globe.pick(ray, _viewer.scene);
      if (intersection) {
        cartographic = Cesium.Cartographic.fromCartesian(intersection);
      }
    }
  }

  if (!cartographic) return;

  const lat = Cesium.Math.toDegrees(cartographic.latitude);
  const lon = Cesium.Math.toDegrees(cartographic.longitude);

  // Don't trigger if clicking on an aircraft, ship, etc. (check if something else was picked)
  const pickedObject = _viewer.scene.pick(movement.position);
  if (pickedObject && pickedObject.id) {
    const id = pickedObject.id;
    // If it's a billboard/entity from other layers, don't show country panel
    // But allow if it's our own threat visualization
    if (typeof id === 'string' && (id.includes('flight') || id.includes('vessel') || id.includes('satellite'))) {
      // Check if user is holding Shift to force country info
      // For now, skip country panel when clicking on tracked objects
      if (!movement.shiftKey) return;
    }
  }

  console.log(`[CountryIntel] Click at ${lat.toFixed(4)}, ${lon.toFixed(4)}`);

  // Find country
  const country = getCountryByLatLon(lat, lon);
  if (country) {
    _countryPanel.showCountry(country.iso2, { lat, lon });
  } else {
    // Still show panel with coords
    _countryPanel.showCountry(null, { lat, lon });
    // Try reverse geocode via API for unknown areas
    reverseGeocode(lat, lon);
  }
}

async function reverseGeocode(lat, lon) {
  try {
    // Try our regional brief API which does Nominatim reverse
    const res = await fetch(`/api/regional-brief?latitude=${lat.toFixed(5)}&longitude=${lon.toFixed(5)}`, { signal: AbortSignal.timeout(5000) }).catch(()=>null);
    if (res && res.ok) {
      const data = await res.json();
      const countryCode = data?.place?.countryCode;
      if (countryCode) {
        const country = getCountryByCode(countryCode);
        if (country) {
          _countryPanel.showCountry(countryCode, { lat, lon });
          return;
        }
        // Even if not in our DB, show what we got
        _countryPanel.showCountry(countryCode, { lat, lon });
      }
    }
  } catch {}
}

function installClickHandler(viewer) {
  if (_clickHandler) return;
  _clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  _clickHandler.setInputAction(handleMapClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  console.log('[CountryIntel] Click handler installed - click any country');
}

function removeClickHandler() {
  if (_clickHandler) {
    _clickHandler.destroy();
    _clickHandler = null;
  }
}

const countryIntelligenceLayer = {
  id: 'countryIntel',
  name: 'Country Intelligence',
  icon: '🌍',
  source: 'World Bank, REST Countries, Cloudflare Radar, NetBlocks, Abuse.ch, CISA',
  updateInterval: 30000,

  init(viewer) {
    _viewer = viewer;
    _countryPanel = new CountryInfoPanel(viewer);
    _threatMap = new CyberThreatMap(viewer);
    _dashboard = new GlobalThreatDashboard();
    _toolbar = createCountryIntelToolbar(viewer);
    
    // Add dashboard handler to toolbar after creation
    setTimeout(() => {
      const dashBtn = document.querySelector('[data-action="dashboard"]');
      if (dashBtn) {
        dashBtn.addEventListener('click', () => {
          _dashboard.show();
        });
      }
    }, 100);
    
    console.log('[CountryIntel] Initialized - Personal Edition');

    // Start monitors (they will be used by panel)
    internetOutageMonitor.startMonitoring(30000);
    ddosMonitor.startMonitoring(15000);
    phishingMonitor.start(20000);
    zeroDayMonitor.start(60000);
    speedMonitor.start(10000);
    liveCurrencyMonitor.start(30000);

    // Listen for custom events
    window.addEventListener('gev:show-country', (e) => {
      const { countryCode, lat, lon } = e.detail || {};
      if (countryCode) {
        _countryPanel.showCountry(countryCode, lat && lon ? { lat, lon } : null);
      }
    });

    window.addEventListener('gev:show-cyber-threats', (e) => {
      const { country, mode } = e.detail || {};
      if (mode && _threatMap) _threatMap.mode = mode;
      _threatMap.show();
      if (country) {
        // Filter to country if provided
        _threatMap.mode = 'ddos';
        _threatMap.updateDisplay();
      }
    });

    window.addEventListener('gev:show-dashboard', () => {
      if (_dashboard) _dashboard.show();
    });

    window.addEventListener('gev:fly-to-country', (e) => {
      const { countryCode } = e.detail || {};
      const country = getCountryByCode(countryCode);
      if (country && _viewer) {
        _viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(country.lon, country.lat, 2000000),
          duration: 2
        });
      }
    });
  },

  enable(viewer) {
    _enabled = true;
    _viewer = viewer;
    installClickHandler(viewer);
    console.log('[CountryIntel] Enabled - click any country for intel');
    
    if (_toolbar) _toolbar.style.display = 'flex';
    if (_countryPanel) {
      // Dispatch ready event for toolbar
      window.dispatchEvent(new CustomEvent('gev:country-intel-ready', { detail: { layer: countryIntelligenceLayer }}));
      window.__countryIntelLayer = countryIntelligenceLayer;
    }
    
    // Show hint
    const hint = document.createElement('div');
    hint.id = 'country-intel-hint';
    hint.innerHTML = `
      <style>
        #country-intel-hint {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0,212,255,0.15);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 12px;
          padding: 10px 18px;
          color: #fff;
          font-family: 'Vazirmatn', sans-serif;
          font-size: 13px;
          z-index: 997;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: fadeInOut 4s ease forwards;
        }
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
          15% { opacity: 1; transform: translateX(-50%) translateY(0); }
          85% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-10px); pointer-events: none; }
        }
      </style>
      🌍 Click any country for intelligence • روی هر کشور کلیک کنید
    `;
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 4000);
  },

  disable() {
    _enabled = false;
    removeClickHandler();
    if (_countryPanel) _countryPanel.hide();
    if (_threatMap) _threatMap.hide();
    if (_toolbar) _toolbar.style.display = 'none';
  },

  async update() {
    // Update monitors
    try {
      await Promise.all([
        internetOutageMonitor.update().catch(()=>{}),
        ddosMonitor.update().catch(()=>{}),
        phishingMonitor.update().catch(()=>{}),
        zeroDayMonitor.update().catch(()=>{}),
        speedMonitor.update().catch(()=>{}),
        liveCurrencyMonitor.update().catch(()=>{})
      ]);
    } catch {}
  },

  destroy() {
    removeClickHandler();
    if (_countryPanel) {
      _countryPanel.destroy();
      _countryPanel = null;
    }
    if (_threatMap) {
      _threatMap.destroy();
      _threatMap = null;
    }
    if (_dashboard) {
      _dashboard.destroy();
      _dashboard = null;
    }
    if (_toolbar) {
      _toolbar.remove();
      _toolbar = null;
    }
    internetOutageMonitor.stopMonitoring();
    ddosMonitor.stopMonitoring();
    phishingMonitor.stop();
    zeroDayMonitor.stop();
    speedMonitor.stop();
    _viewer = null;
  },

  // Public API for other modules
  showCountry(countryCode, latlon) {
    if (_countryPanel) _countryPanel.showCountry(countryCode, latlon);
  },

  showThreatMap(mode = 'ddos') {
    if (_threatMap) {
      _threatMap.mode = mode;
      _threatMap.show();
    }
  },

  showDashboard() {
    if (_dashboard) _dashboard.show();
  },

  getStats() {
    const outageStats = internetOutageMonitor.getStats();
    const ddosStats = ddosMonitor.getStats();
    const phishingStats = phishingMonitor.getStats();
    const zeroDayStats = zeroDayMonitor.getStats();
    
    return {
      count: outageStats.totalActive + ddosStats.active + phishingStats.active,
      lastUpdate: Date.now(),
      source: 'Country Intel + Cyber Threats',
      details: {
        outages: outageStats.totalActive,
        ddos: ddosStats.active,
        phishing: phishingStats.active,
        zeroDay: zeroDayStats.active
      }
    };
  },

  // For UI toggles
  getCyberThreatMap() { return _threatMap; },
  getCountryPanel() { return _countryPanel; }
};

export default countryIntelligenceLayer;
