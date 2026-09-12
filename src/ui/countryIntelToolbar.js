/**
 * Country Intel Toolbar - Adds quick access buttons
 */

export function createCountryIntelToolbar(viewer) {
  const toolbar = document.createElement('div');
  toolbar.id = 'country-intel-toolbar';
  toolbar.innerHTML = `
    <style>
      #country-intel-toolbar {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 995;
        display: flex;
        gap: 8px;
        background: rgba(8,12,20,0.85);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 8px 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      }
      .cit-btn {
        padding: 8px 14px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
        color: #ccc;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
        font-family: 'Vazirmatn', sans-serif;
      }
      .cit-btn:hover {
        background: rgba(0,212,255,0.15);
        border-color: rgba(0,212,255,0.3);
        color: #fff;
        transform: translateY(-1px);
      }
      .cit-btn.active {
        background: rgba(0,212,255,0.2);
        border-color: #00d4ff;
        color: #fff;
      }
      .cit-btn.danger {
        border-color: rgba(255,42,42,0.3);
      }
      .cit-btn.danger:hover {
        background: rgba(255,42,42,0.15);
        border-color: #ff2a2a;
      }
      .cit-btn.danger.active {
        background: rgba(255,42,42,0.2);
        border-color: #ff2a2a;
      }
      .cit-separator {
        width: 1px;
        background: rgba(255,255,255,0.1);
        margin: 0 4px;
      }
      @media (max-width: 768px) {
        #country-intel-toolbar {
          top: auto;
          bottom: 80px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 90vw;
        }
        .cit-btn { padding: 6px 10px; font-size: 11px; }
      }
    </style>
    <button class="cit-btn" data-action="country-help" title="Click any country - روی هر کشور کلیک کنید">🌍 Country Intel</button>
    <div class="cit-separator"></div>
    <button class="cit-btn danger" data-action="ddos" title="Live DDoS attacks">💥 DDoS</button>
    <button class="cit-btn danger" data-action="outage" title="Internet outages - قطعی اینترنت">📵 Outage</button>
    <button class="cit-btn danger" data-action="phishing" title="Live phishing">🎣 Phishing</button>
    <button class="cit-btn danger" data-action="zeroday" title="Zero-day exploits">0️⃣ Zero-Day</button>
    <button class="cit-btn" data-action="speed" title="Internet speed">⚡ Speed</button>
    <div class="cit-separator"></div>
    <button class="cit-btn" data-action="iran" title="Fly to Iran - پرواز به ایران">🇮🇷 Iran</button>
    <button class="cit-btn" data-action="kurdistan" title="Fly to Kurdistan - کوردستان">🏔️ Kurdistan</button>
    <div class="cit-separator"></div>
    <button class="cit-btn" data-action="dashboard" title="Global Dashboard - داشبورد جهانی" style="background: linear-gradient(135deg, rgba(255,42,42,0.2), rgba(255,136,0,0.2)); border-color: rgba(255,42,42,0.4);">📊 Dashboard</button>
  `;

  document.body.appendChild(toolbar);

  // Event handlers
  toolbar.querySelectorAll('.cit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      
      switch(action) {
        case 'country-help':
          // Toggle country intel layer
          window.dispatchEvent(new CustomEvent('gev:toggle-layer', { 
            detail: { layer: 'countryIntel', enabled: true }
          }));
          // Show hint
          btn.classList.add('active');
          setTimeout(() => btn.classList.remove('active'), 2000);
          break;
          
        case 'ddos':
        case 'outage':
        case 'phishing':
        case 'zeroday':
        case 'speed':
          // Toggle threat map mode
          const isActive = btn.classList.contains('active');
          toolbar.querySelectorAll('[data-action="ddos"],[data-action="outage"],[data-action="phishing"],[data-action="zeroday"],[data-action="speed"]').forEach(b => b.classList.remove('active'));
          
          if (!isActive) {
            btn.classList.add('active');
            window.dispatchEvent(new CustomEvent('gev:show-cyber-threats', { 
              detail: { mode: action }
            }));
            // Directly trigger threat map if available
            if (window.__countryIntelLayer) {
              window.__countryIntelLayer.showThreatMap(action);
            } else {
              // Fallback: dispatch event that countryIntel layer listens to
              const event = new CustomEvent('gev:show-cyber-threats', { detail: { country: null } });
              window.dispatchEvent(event);
              // Also try to find and trigger via global
              setTimeout(() => {
                const threatMapEl = document.getElementById('cyber-threat-control');
                if (threatMapEl) {
                  threatMapEl.classList.add('active');
                  // Click the corresponding tab
                  const tab = threatMapEl.querySelector(`[data-mode="${action}"]`);
                  if (tab) tab.click();
                }
              }, 100);
            }
          } else {
            // Hide threat map
            const threatMapEl = document.getElementById('cyber-threat-control');
            if (threatMapEl) threatMapEl.classList.remove('active');
            if (window.__countryIntelLayer?.getCyberThreatMap) {
              window.__countryIntelLayer.getCyberThreatMap()?.hide();
            }
          }
          break;
          
        case 'iran':
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(53.6880, 32.4279, 3500000),
            duration: 2.5,
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-45), roll: 0 }
          });
          // Also show Iran info
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('gev:show-country', { detail: { countryCode: 'IR' } }));
          }, 2600);
          break;
          
        case 'kurdistan':
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(44.0, 37.0, 800000),
            duration: 2.5,
            orientation: { heading: 0, pitch: Cesium.Math.toRadians(-50), roll: 0 }
          });
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('gev:show-country', { detail: { countryCode: 'IQ' } }));
          }, 2600);
          break;

        case 'dashboard':
          // Will be handled by layer, but also dispatch
          window.dispatchEvent(new CustomEvent('gev:show-dashboard'));
          if (window.__countryIntelLayer?.showDashboard) {
            window.__countryIntelLayer.showDashboard();
          }
          break;
      }
    });
  });

  // Make country intel layer globally accessible for toolbar
  window.addEventListener('gev:country-intel-ready', (e) => {
    window.__countryIntelLayer = e.detail.layer;
  });

  return toolbar;
}
