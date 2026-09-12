/**
 * Simple i18n system for God's Eye View - Personal Edition
 * Supports ku (Sorani), fa, en, tr, ar
 * Auto-detects browser language, falls back to en
 */
import ku from './ku.json' with { type: 'json' };
import fa from './fa.json' with { type: 'json' };
import en from './en.json' with { type: 'json' };

const bundles = { ku, fa, en, ckb: ku, 'ku-IQ': ku, 'fa-IR': fa };

const RTL_LANGS = new Set(['ku', 'fa', 'ar', 'ckb', 'fa-IR', 'ku-IQ']);

let currentLang = 'en';
let currentBundle = en;

function detectLanguage() {
  const saved = localStorage.getItem('gev-lang');
  if (saved && bundles[saved]) return saved;
  
  const browser = navigator.language || navigator.languages?.[0] || 'en';
  const short = browser.split('-')[0];
  
  // Kurdish detection
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
  
  // Set HTML attributes
  document.documentElement.lang = currentLang;
  document.documentElement.dir = RTL_LANGS.has(currentLang) ? 'rtl' : 'ltr';
  
  // Add font for Persian/Kurdish
  if (RTL_LANGS.has(currentLang)) {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    document.body.style.fontFamily = "'Vazirmatn', 'Inter', sans-serif";
  }
  
  localStorage.setItem('gev-lang', currentLang);
  return currentLang;
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
  initI18n(lang);
  window.location.reload(); // Simple reload for now
  return true;
}

export function isRTL() {
  return RTL_LANGS.has(currentLang);
}

// Available languages for UI
export const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'fa', name: 'Persian', native: 'فارسی', flag: '🇮🇷' },
  { code: 'ku', name: 'Kurdish', native: 'کوردی', flag: '☀️' },
];

export default { initI18n, t, getCurrentLang, setLanguage, isRTL, LANGUAGES };
