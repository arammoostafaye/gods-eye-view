/**
 * Advanced i18n system for God's Eye View - Personal Edition V2.4
 * Supports ku (Sorani), fa, en with full RTL and dynamic updates
 * No reload needed - updates all UI in place
 */
import ku from './ku.json' with { type: 'json' };
import fa from './fa.json' with { type: 'json' };
import en from './en.json' with { type: 'json' };

const bundles = { ku, fa, en, ckb: ku, 'ku-IQ': ku, 'fa-IR': fa };

const RTL_LANGS = new Set(['ku', 'fa', 'ar', 'ckb', 'fa-IR', 'ku-IQ']);

let currentLang = 'en';
let currentBundle = en;
let listeners = new Set();

// Layer name translations - maps layer id to translation key
const LAYER_TRANSLATION_KEYS = {
  'flights': 'layers.aircraft',
  'military': 'layers.militaryFlights',
  'earthquakes': 'layers.earthquakes',
  'satellites': 'layers.satellites',
  'rocketLaunches': 'layers.rocketLaunches',
  'traffic': 'layers.traffic',
  'cctv': 'layers.cctv',
  'radio': 'layers.radio',
  'bikeshare': 'layers.bikeshare',
  'aisLiveVessels': 'layers.liveAisVessels',
  'militaryInstallations': 'layers.militaryInstallations',
  'militaryAwareness': 'layers.militaryAwareness',
  'country-intel': 'layers.countryIntel',
};

function detectLanguage() {
  const saved = localStorage.getItem('gev-lang');
  if (saved && bundles[saved]) return saved;
  
  const browser = navigator.language || navigator.languages?.[0] || 'en';
  const short = browser.split('-')[0];
  
  if (browser.includes('ku') || short === 'ckb') return 'ku';
  if (short === 'fa') return 'fa';
  if (bundles[browser]) return browser;
  if (bundles[short]) return short;
  
  return 'en';
}

export function initI18n(lang = null) {
  const target = lang || detectLanguage();
  currentLang = bundles[target] ? target : 'en';
  currentBundle = bundles[currentLang] || en;
  
  applyLanguageAttributes();
  applyRTLStyles();
  localStorage.setItem('gev-lang', currentLang);
  
  // Notify listeners
  listeners.forEach(cb => {
    try { cb(currentLang); } catch {}
  });
  
  return currentLang;
}

function applyLanguageAttributes() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = RTL_LANGS.has(currentLang) ? 'rtl' : 'ltr';
  document.body.dir = RTL_LANGS.has(currentLang) ? 'rtl' : 'ltr';
  document.body.setAttribute('data-lang', currentLang);
  
  // Add font for Persian/Kurdish
  if (RTL_LANGS.has(currentLang)) {
    if (!document.querySelector('link[href*="Vazirmatn"]')) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    document.body.style.fontFamily = "'Vazirmatn', 'Inter', 'Segoe UI', sans-serif";
  } else {
    document.body.style.fontFamily = "'Inter', 'JetBrains Mono', sans-serif";
  }
}

function applyRTLStyles() {
  const isRTL = RTL_LANGS.has(currentLang);
  
  // Create or update RTL style element
  let rtlStyle = document.getElementById('rtl-styles');
  if (!rtlStyle) {
    rtlStyle = document.createElement('style');
    rtlStyle.id = 'rtl-styles';
    document.head.appendChild(rtlStyle);
  }
  
  if (isRTL) {
    rtlStyle.textContent = `
      /* RTL Layout Fixes */
      body[data-lang="fa"], body[data-lang="ku"] {
        direction: rtl;
        text-align: right;
      }
      
      /* Flip panels for RTL */
      body[data-lang="fa"] #data-toggles,
      body[data-lang="ku"] #data-toggles {
        right: auto !important;
        left: 20px !important;
      }
      
      body[data-lang="fa"] #scenes-panel,
      body[data-lang="ku"] #scenes-panel {
        right: auto !important;
        left: 20px !important;
      }
      
      body[data-lang="fa"] #country-intel-panel,
      body[data-lang="ku"] #country-intel-panel {
        right: auto !important;
        left: 20px !important;
      }
      
      body[data-lang="fa"] #cyber-threat-control,
      body[data-lang="ku"] #cyber-threat-control {
        left: auto !important;
        right: 20px !important;
      }
      
      /* Language switcher stays left in RTL? Actually move to right */
      body[data-lang="fa"] #language-switcher,
      body[data-lang="ku"] #language-switcher {
        left: auto !important;
        right: 20px !important;
      }
      
      /* Text alignment */
      body[data-lang="fa"] .data-toggle-row,
      body[data-lang="ku"] .data-toggle-row {
        direction: rtl;
        text-align: right;
      }
      
      body[data-lang="fa"] .data-toggle-left,
      body[data-lang="ku"] .data-toggle-left {
        flex-direction: row-reverse;
      }
      
      body[data-lang="fa"] .data-toggle-right,
      body[data-lang="ku"] .data-toggle-right {
        flex-direction: row-reverse;
      }
      
      /* Title bar RTL */
      body[data-lang="fa"] #title-bar,
      body[data-lang="ku"] #title-bar {
        direction: rtl;
        text-align: right;
        left: auto;
        right: 20px;
      }
      
      /* Quick jump presets RTL */
      body[data-lang="fa"] #kurdistan-presets,
      body[data-lang="ku"] #kurdistan-presets {
        direction: rtl;
      }
      
      /* Country intel panel RTL */
      body[data-lang="fa"] #country-intel-panel .cip-header,
      body[data-lang="ku"] #country-intel-panel .cip-header {
        direction: rtl;
      }
      
      body[data-lang="fa"] .cip-grid,
      body[data-lang="ku"] .cip-grid {
        direction: rtl;
      }
      
      /* Live stats bar RTL */
      body[data-lang="fa"] #live-stats-bar,
      body[data-lang="ku"] #live-stats-bar {
        direction: rtl;
      }
      
      /* Toolbar RTL */
      body[data-lang="fa"] #country-intel-toolbar,
      body[data-lang="ku"] #country-intel-toolbar {
        direction: rtl;
      }
      
      /* General RTL fixes */
      body[data-lang="fa"] [data-i18n],
      body[data-lang="ku"] [data-i18n] {
        direction: rtl;
        text-align: right;
      }
    `;
  } else {
    rtlStyle.textContent = `
      body { direction: ltr; text-align: left; }
    `;
  }
}

export function t(key, fallback = null) {
  const keys = key.split('.');
  let value = currentBundle;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return fallback || key;
    }
  }
  return typeof value === 'string' ? value : fallback || key;
}

export function getCurrentLang() {
  return currentLang;
}

export function setLanguage(lang) {
  if (!bundles[lang]) {
    console.warn(`Language ${lang} not supported`);
    return false;
  }
  
  const prevLang = currentLang;
  currentLang = lang;
  currentBundle = bundles[lang] || en;
  
  applyLanguageAttributes();
  applyRTLStyles();
  localStorage.setItem('gev-lang', currentLang);
  
  // Update all translatable elements
  updateAllTranslations();
  
  // Notify listeners
  listeners.forEach(cb => {
    try { cb(currentLang, prevLang); } catch {}
  });
  
  // Dispatch event for other components
  window.dispatchEvent(new CustomEvent('gev:language-changed', { 
    detail: { lang: currentLang, prevLang, isRTL: RTL_LANGS.has(currentLang) } 
  }));
  
  console.log(`[i18n] Language changed to ${lang}, RTL: ${RTL_LANGS.has(lang)}`);
  return true;
}

function updateAllTranslations() {
  // Update elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key);
    if (translation && translation !== key) {
      // Preserve inner HTML structure if it has children, otherwise set text
      if (el.children.length === 0) {
        el.textContent = translation;
      } else {
        // For elements with children, only update if it's a simple text node
        const textNode = Array.from(el.childNodes).find(n => n.nodeType === 3);
        if (textNode) {
          textNode.textContent = translation;
        }
      }
    }
  });
  
  // Update title and subtitle if they have data-i18n
  const titleBar = document.getElementById('title-bar');
  if (titleBar) {
    const subtitle = titleBar.querySelector('.subtitle');
    if (subtitle) {
      subtitle.textContent = t('app.subtitle', subtitle.textContent);
    }
  }
  
  // Update data layer names
  updateLayerTranslations();
  
  // Update panel titles
  updatePanelTitles();
}

function updateLayerTranslations() {
  // Update layer toggle rows
  document.querySelectorAll('.data-toggle-row').forEach(row => {
    const layerId = row.dataset.layerId;
    const key = LAYER_TRANSLATION_KEYS[layerId];
    if (key) {
      const nameEl = row.querySelector('.data-name');
      if (nameEl) {
        const translated = t(key);
        if (translated !== key) {
          nameEl.textContent = translated;
        }
      }
    }
  });
}

function updatePanelTitles() {
  // Update panel headers that have hardcoded English
  const panelMappings = {
    'DATA LAYERS': 'panels.dataLayers',
    'SCENES': 'panels.scenes',
    'DISPLAY': 'panels.display',
    'CCTV': 'panels.cctv',
    'CONTEXT': 'panels.context',
    'VISUAL PRESETS': 'panels.visualPresets',
    'LOCATION': 'panels.location',
  };
  
  document.querySelectorAll('.panel-title, .section-title, [data-panel-title]').forEach(el => {
    const text = el.textContent.trim();
    const key = panelMappings[text];
    if (key) {
      const translated = t(key);
      if (translated !== key) {
        el.textContent = translated;
      }
    }
  });
  
  // Update specific known elements
  const dataTogglesHeader = document.querySelector('#data-toggles .panel-header');
  if (dataTogglesHeader) {
    const text = dataTogglesHeader.textContent.trim();
    if (panelMappings[text]) {
      dataTogglesHeader.textContent = t(panelMappings[text]);
    }
  }
}

export function isRTL() {
  return RTL_LANGS.has(currentLang);
}

export function addLanguageChangeListener(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function translateLayerName(layerId, fallbackName) {
  const key = LAYER_TRANSLATION_KEYS[layerId];
  if (key) {
    const translated = t(key);
    return translated !== key ? translated : fallbackName;
  }
  return fallbackName;
}

// Available languages for UI
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'fa', name: 'Persian', native: 'فارسی', flag: '🇮🇷' },
  { code: 'ku', name: 'Kurdish', native: 'کوردی', flag: '☀️' },
];

export default { initI18n, t, getCurrentLang, setLanguage, isRTL, LANGUAGES, addLanguageChangeListener, translateLayerName };
