/**
 * Language Switcher UI - Personal Edition V2.4
 * Full app translation with RTL support, no reload needed
 */
import { LANGUAGES, getCurrentLang, setLanguage, t, isRTL } from '../i18n/index.js';

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
        background: rgba(10,10,15,0.92);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 12px;
        padding: 6px;
        display: flex;
        gap: 4px;
        font-family: 'Vazirmatn', 'Inter', sans-serif;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        transition: all 0.3s ease;
      }
      #language-switcher button {
        padding: 8px 12px;
        background: rgba(255,255,255,0.06);
        border: 1px solid transparent;
        border-radius: 8px;
        color: #aaa;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 80px;
        justify-content: center;
      }
      #language-switcher button.active {
        background: linear-gradient(135deg, rgba(255,42,42,0.3), rgba(255,136,0,0.2));
        border-color: rgba(255,42,42,0.5);
        color: #fff;
        box-shadow: 0 2px 8px rgba(255,42,42,0.2);
      }
      #language-switcher button:hover {
        background: rgba(255,255,255,0.12);
        color: #fff;
        transform: translateY(-1px);
      }
      #language-switcher button.active:hover {
        background: linear-gradient(135deg, rgba(255,42,42,0.4), rgba(255,136,0,0.3));
      }
      /* RTL - move to right side */
      body[data-lang="fa"] #language-switcher,
      body[data-lang="ku"] #language-switcher {
        left: auto;
        right: 20px;
        direction: rtl;
      }
      @media (max-width: 768px) {
        #language-switcher {
          bottom: 50px;
          left: 10px;
          right: 10px;
          justify-content: center;
          padding: 8px;
        }
        body[data-lang="fa"] #language-switcher,
        body[data-lang="ku"] #language-switcher {
          left: 10px;
          right: 10px;
        }
        #language-switcher button {
          flex: 1;
          min-width: auto;
          padding: 10px 8px;
          font-size: 11px;
        }
      }
    </style>
  `;

  LANGUAGES.forEach(lang => {
    const btn = document.createElement('button');
    btn.innerHTML = `${lang.flag} ${lang.native}`;
    btn.title = `${lang.name} - ${lang.native}`;
    btn.dataset.lang = lang.code;
    if (lang.code === getCurrentLang()) btn.classList.add('active');
    
    btn.onclick = () => {
      // Update active state
      container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Change language with animation
      const success = setLanguage(lang.code);
      if (success) {
        // Show toast notification
        showLanguageToast(lang);
      }
    };
    
    container.appendChild(btn);
  });

  document.body.appendChild(container);
  
  // Listen for language changes from other sources
  window.addEventListener('gev:language-changed', (e) => {
    const newLang = e.detail.lang;
    container.querySelectorAll('button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === newLang);
    });
  });
  
  return container;
}

function showLanguageToast(lang) {
  // Create toast notification
  let toast = document.getElementById('lang-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lang-toast';
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(8,12,20,0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(0,212,255,0.3);
      border-radius: 16px;
      padding: 20px 30px;
      color: #fff;
      font-family: 'Vazirmatn', sans-serif;
      font-size: 14px;
      z-index: 3000;
      text-align: center;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
      animation: langToastIn 0.3s ease, langToastOut 0.3s ease 2s forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes langToastIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes langToastOut {
        from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); pointer-events: none; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
  }
  
  const messages = {
    en: `Language changed to English<br><small style="color:#888">Whole app is now in English • LTR layout</small>`,
    fa: `زبان به فارسی تغییر کرد<br><small style="color:#888">کل اپ فارسی شد • چیدمان راست به چپ</small>`,
    ku: `زمان گۆڕدرا بۆ کوردی<br><small style="color:#888">هەموو ئەپەکە بوو بە کوردی • ڕیزکردنی ڕاست بۆ چەپ</small>`
  };
  
  toast.innerHTML = `
    <div style="font-size: 32px; margin-bottom: 8px;">${lang.flag}</div>
    <div>${messages[lang.code] || messages.en}</div>
  `;
  toast.style.display = 'block';
  
  // Reset animation
  toast.style.animation = 'none';
  toast.offsetHeight; // Trigger reflow
  toast.style.animation = 'langToastIn 0.3s ease, langToastOut 0.3s ease 2s forwards';
  
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 2500);
}
