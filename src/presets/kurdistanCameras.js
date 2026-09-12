/**
 * Kurdistan & Iran Camera Presets - Quick Jump Feature
 * Integrates with Cesium viewer
 */
import * as Cesium from 'cesium';
import { ALL_PRESETS, getPresetById } from '../data/regions/kurdistan.js';

export function createKurdistanPresetsUI(viewer) {
  // Create container
  const container = document.createElement('div');
  container.id = 'kurdistan-presets';
  container.innerHTML = `
    <style>
      #kurdistan-presets {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 1000;
        background: rgba(10,10,15,0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,42,42,0.3);
        border-radius: 12px;
        padding: 12px;
        min-width: 220px;
        font-family: 'Vazirmatn', 'Inter', sans-serif;
        color: #fff;
        max-height: 70vh;
        overflow-y: auto;
      }
      #kurdistan-presets h3 {
        margin: 0 0 10px 0;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        color: #ff2a2a;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      #kurdistan-presets .preset-group {
        margin-bottom: 14px;
      }
      #kurdistan-presets .preset-group-title {
        font-size: 11px;
        color: #888;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      #kurdistan-presets .preset-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 10px;
        margin: 4px 0;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        color: #fff;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
        text-align: left;
      }
      #kurdistan-presets .preset-btn:hover {
        background: rgba(255,42,42,0.2);
        border-color: #ff2a2a;
        transform: translateX(-2px);
      }
      #kurdistan-presets .preset-btn .icon {
        font-size: 16px;
      }
      #kurdistan-presets .preset-btn .name {
        flex: 1;
      }
      #kurdistan-presets.collapsed {
        width: 44px;
        min-width: 44px;
        height: 44px;
        overflow: hidden;
        cursor: pointer;
      }
      #kurdistan-presets.collapsed > *:not(h3) {
        display: none;
      }
    </style>
    <h3>☀️ <span data-i18n="presets.title">Quick Jump</span></h3>
    <div class="preset-group">
      <div class="preset-group-title">Kurdistan</div>
      <div id="presets-kurdistan"></div>
    </div>
    <div class="preset-group">
      <div class="preset-group-title">Iran - ایران</div>
      <div id="presets-iran"></div>
    </div>
    <div class="preset-group">
      <div class="preset-group-title">Middle East</div>
      <div id="presets-middle"></div>
    </div>
  `;

  document.body.appendChild(container);

  // Populate
  const kurdistanEl = container.querySelector('#presets-kurdistan');
  const iranEl = container.querySelector('#presets-iran');
  const middleEl = container.querySelector('#presets-middle');

  ALL_PRESETS.forEach(preset => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.innerHTML = `<span class="icon">${preset.icon || '📍'}</span><span class="name">${preset.name.en}</span>`;
    btn.title = preset.description?.en || preset.name.en;
    btn.onclick = () => flyToPreset(viewer, preset);

    if (['erbil','slemani','duhok','kirkuk','halabja'].includes(preset.id)) {
      kurdistanEl.appendChild(btn);
    } else if (['tehran','isfahan','tabriz','sanandaj','urmia','shiraz'].includes(preset.id)) {
      iranEl.appendChild(btn);
    } else {
      middleEl.appendChild(btn);
    }
  });

  // Handle URL preset param
  const urlParams = new URLSearchParams(window.location.search);
  const presetParam = urlParams.get('preset');
  if (presetParam) {
    const preset = getPresetById(presetParam);
    if (preset) {
      setTimeout(() => flyToPreset(viewer, preset), 2000);
    }
  }

  // Collapse/expand on title click
  const title = container.querySelector('h3');
  title.style.cursor = 'pointer';
  title.onclick = () => {
    container.classList.toggle('collapsed');
  };

  return container;
}

export function flyToPreset(viewer, preset) {
  if (!viewer || !preset) return;
  
  const [lon, lat, height] = preset.coords;
  
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    },
    duration: 2.5,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT
  });

  // Show toast
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = `Flying to ${preset.name.en} ${preset.icon || ''}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Update URL without reload
  const url = new URL(window.location);
  url.searchParams.set('preset', preset.id);
  window.history.replaceState({}, '', url);
}

export function initPresetsFromURL(viewer) {
  const urlParams = new URLSearchParams(window.location.search);
  const preset = urlParams.get('preset');
  if (preset) {
    const p = getPresetById(preset);
    if (p) {
      // Wait for viewer to be ready
      setTimeout(() => flyToPreset(viewer, p), 1500);
    }
  }
}
