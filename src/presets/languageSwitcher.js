/**
 * Language Switcher UI - Personal Edition
 */
import { LANGUAGES, getCurrentLang, setLanguage } from '../i18n/index.js';

export function createLanguageSwitcher() {
  const container = document.createElement('div');
  container.id = 'language-switcher';
  container.innerHTML = `
    <style>
      #language-switcher {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 1000;
        background: rgba(10,10,15,0.9);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px;
        padding: 6px;
        display: flex;
        gap: 4px;
        font-family: 'Vazirmatn', 'Inter', sans-serif;
      }
      #language-switcher button {
        padding: 6px 10px;
        background: rgba(255,255,255,0.05);
        border: 1px solid transparent;
        border-radius: 6px;
        color: #aaa;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      #language-switcher button.active {
        background: rgba(255,42,42,0.25);
        border-color: #ff2a2a;
        color: #fff;
      }
      #language-switcher button:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }
    </style>
  `;

  LANGUAGES.forEach(lang => {
    const btn = document.createElement('button');
    btn.innerHTML = `${lang.flag} ${lang.native}`;
    btn.title = lang.name;
    if (lang.code === getCurrentLang()) btn.classList.add('active');
    btn.onclick = () => setLanguage(lang.code);
    container.appendChild(btn);
  });

  document.body.appendChild(container);
  return container;
}
