/**
 * Persian & Kurdish Voice Control - Personal Edition Feature H
 * Web Speech API + Whisper.cpp fallback for fa/ku
 * 
 * Supports commands in English, Persian (Farsi), and Kurdish (Sorani/Kurmanji)
 */

// Persian and Kurdish command translations
export const VOICE_COMMANDS = {
  // Navigation
  go_to: {
    en: ['go to', 'fly to', 'show', 'navigate to'],
    fa: ['برو به', 'پرواز به', 'نمایش', 'بریم به'],
    ku: ['بڕۆ بۆ', 'فڕین بۆ', 'نیشان بدە', 'با بچین بۆ'],
    ckb: ['بڕۆ بۆ', 'فڕین بۆ']
  },
  zoom_in: {
    en: ['zoom in', 'closer', 'magnify'],
    fa: ['زوم کن', 'نزدیک شو', 'بزرگنمایی'],
    ku: ['نزیک ببەوە', 'گەورە بکە'],
  },
  zoom_out: {
    en: ['zoom out', 'farther', 'wider'],
    fa: ['زوم اوت', 'دور شو', 'کوچک نمایی'],
    ku: ['دوور بکەوە', 'بچووک بکە'],
  },
  // Layers
  show_flights: {
    en: ['show flights', 'aircraft', 'planes'],
    fa: ['پروازها را نشان بده', 'هواپیماها', 'پروازها'],
    ku: ['فڕۆکەکان نیشان بدە', 'فڕۆکەکان'],
  },
  show_ships: {
    en: ['show ships', 'vessels', 'boats'],
    fa: ['کشتی ها', 'شناورها'],
    ku: ['کەشتییەکان'],
  },
  show_satellites: {
    en: ['show satellites', 'space'],
    fa: ['ماهواره ها', 'فضا'],
    ku: ['مانگە دەستکردەکان'],
  },
  show_cctv: {
    en: ['show cameras', 'cctv', 'traffic cams'],
    fa: ['دوربین ها', 'ترافیک', 'دوربین تهران'],
    ku: ['کامێراکان', 'ترافیک'],
  },
  // Tracking
  track: {
    en: ['track', 'follow', 'select'],
    fa: ['دنبال کن', 'تعقیب', 'انتخاب'],
    ku: ['شوێن بکەوە', 'هەڵبژێرە'],
  },
  stop_tracking: {
    en: ['stop tracking', 'untrack', 'deselect'],
    fa: ['توقف تعقیب', 'لغو'],
    ku: ['وەستاندنی شوێنکەوتن'],
  },
  // Places - Personal Edition
  tehran: {
    en: ['tehran'],
    fa: ['تهران'],
    ku: ['تاران'],
  },
  erbil: {
    en: ['erbil', 'hawler'],
    fa: ['اربیل'],
    ku: ['هەولێر', 'hewler'],
  },
  slemani: {
    en: ['slemani', 'sulaimaniyah'],
    fa: ['سلیمانی'],
    ku: ['سلێمانی'],
  },
  duhok: {
    en: ['duhok', 'dohuk'],
    fa: ['دهوک'],
    ku: ['دهۆک'],
  },
  kurdistan: {
    en: ['kurdistan', 'greater kurdistan'],
    fa: ['کردستان', 'کردستان بزرگ'],
    ku: ['کوردستان', 'کوردستانی گەورە'],
  },
  persian_gulf: {
    en: ['persian gulf'],
    fa: ['خلیج فارس'],
    ku: ['کەنداوی فارس'],
  }
};

// City coordinates for voice nav
export const VOICE_DESTINATIONS = {
  tehran: { lat: 35.6892, lon: 51.3890, alt: 50000, fa: 'تهران', ku: 'تاران', en: 'Tehran' },
  erbil: { lat: 36.1911, lon: 44.0090, alt: 30000, fa: 'اربیل', ku: 'هەولێر', en: 'Erbil' },
  slemani: { lat: 35.5571, lon: 45.4346, alt: 25000, fa: 'سلیمانی', ku: 'سلێمانی', en: 'Slemani' },
  duhok: { lat: 36.8677, lon: 42.9882, alt: 25000, fa: 'دهوک', ku: 'دهۆک', en: 'Duhok' },
  isfahan: { lat: 32.6546, lon: 51.6680, alt: 30000, fa: 'اصفهان', ku: 'ئەسفەهان', en: 'Isfahan' },
  tabriz: { lat: 38.0808, lon: 46.2919, alt: 30000, fa: 'تبریز', ku: 'تەورێز', en: 'Tabriz' },
  shiraz: { lat: 29.5918, lon: 52.5837, alt: 30000, fa: 'شیراز', ku: 'شیراز', en: 'Shiraz' },
  baghdad: { lat: 33.3152, lon: 44.3661, alt: 40000, fa: 'بغداد', ku: 'بەغدا', en: 'Baghdad' },
  istanbul: { lat: 41.0082, lon: 28.9784, alt: 50000, fa: 'استانبول', ku: 'ئەستەمبوڵ', en: 'Istanbul' },
  kurdistan: { lat: 37.0, lon: 44.0, alt: 800000, fa: 'کردستان', ku: 'کوردستان', en: 'Kurdistan' },
  persian_gulf: { lat: 26.5, lon: 52.0, alt: 600000, fa: 'خلیج فارس', ku: 'کەنداوی فارس', en: 'Persian Gulf' },
  zagros: { lat: 33.5, lon: 47.5, alt: 500000, fa: 'زاگرس', ku: 'زاگرۆس', en: 'Zagros Mountains' }
};

export class PersianVoiceControl {
  constructor(viewer, options = {}) {
    this.viewer = viewer;
    this.options = {
      lang: options.lang || 'fa-IR', // fa-IR, ku, en-US
      continuous: true,
      interimResults: true,
      ...options
    };
    
    this.recognition = null;
    this.isListening = false;
    this.onCommandCallback = null;
    this.whisperWorker = null;
    
    this.initWebSpeech();
    this.createUI();
  }

  initWebSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[Voice] Web Speech API not supported');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.options.continuous;
    this.recognition.interimResults = this.options.interimResults;
    this.recognition.lang = this.options.lang;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateUIState();
      console.log('[Voice] Listening...', this.options.lang);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.updateUIState();
      // Auto-restart if should be listening
      if (this.shouldBeListening) {
        setTimeout(() => this.start(), 500);
      }
    };

    this.recognition.onresult = (event) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim();
      const isFinal = event.results[last].isFinal;
      
      this.updateTranscript(transcript, isFinal);
      
      if (isFinal) {
        this.processCommand(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.warn('[Voice] Error:', event.error);
      if (event.error === 'not-allowed') {
        this.shouldBeListening = false;
        alert('Microphone permission denied. Please allow microphone access.');
      }
    };
  }

  createUI() {
    const container = document.createElement('div');
    container.id = 'persian-voice-control';
    container.innerHTML = `
      <style>
        #persian-voice-control {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1001;
          font-family: 'Vazirmatn', 'Segoe UI', sans-serif;
        }
        #voice-mic-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ff2a2a, #ff8800);
          border: 3px solid rgba(255,255,255,0.2);
          color: white;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(255,42,42,0.4);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #voice-mic-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(255,42,42,0.6);
        }
        #voice-mic-btn.listening {
          background: linear-gradient(135deg, #00ff88, #00d4ff);
          animation: pulse 1.5s infinite;
          box-shadow: 0 4px 20px rgba(0,255,136,0.5);
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.7); }
          70% { box-shadow: 0 0 0 15px rgba(0,255,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
        }
        #voice-transcript {
          position: absolute;
          bottom: 80px;
          right: 0;
          background: rgba(10,10,15,0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0,212,255,0.3);
          border-radius: 12px;
          padding: 12px 16px;
          min-width: 250px;
          max-width: 350px;
          color: #fff;
          font-size: 14px;
          display: none;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        #voice-transcript.active {
          display: block;
        }
        #voice-transcript .interim {
          color: #888;
          font-style: italic;
        }
        #voice-transcript .final {
          color: #00ff88;
          font-weight: 600;
        }
        #voice-lang-switch {
          position: absolute;
          bottom: 70px;
          right: 0;
          display: flex;
          gap: 6px;
          background: rgba(10,10,15,0.9);
          padding: 6px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        #voice-lang-switch button {
          padding: 4px 10px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          color: #aaa;
          font-size: 11px;
          cursor: pointer;
        }
        #voice-lang-switch button.active {
          background: rgba(0,212,255,0.2);
          border-color: #00d4ff;
          color: #fff;
        }
        #voice-commands-help {
          position: absolute;
          bottom: 80px;
          right: 70px;
          background: rgba(10,10,15,0.95);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px;
          min-width: 280px;
          color: #ccc;
          font-size: 11px;
          display: none;
          max-height: 300px;
          overflow-y: auto;
        }
        #voice-commands-help.active {
          display: block;
        }
        #voice-commands-help h5 {
          margin: 0 0 8px 0;
          color: #00d4ff;
          font-size: 12px;
        }
        #voice-commands-help .cmd {
          display: flex;
          justify-content: space-between;
          padding: 3px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        #voice-commands-help .cmd-fa {
          color: #ff2a2a;
          direction: rtl;
        }
      </style>
      <div id="voice-transcript"></div>
      <div id="voice-commands-help">
        <h5>🎤 Voice Commands - فرمان صوتی</h5>
        <div class="cmd"><span>Go to Tehran</span><span class="cmd-fa">برو به تهران</span></div>
        <div class="cmd"><span>Show Erbil</span><span class="cmd-fa">هەولێر نیشان بدە</span></div>
        <div class="cmd"><span>Show flights</span><span class="cmd-fa">پروازها را نشان بده</span></div>
        <div class="cmd"><span>Zoom in</span><span class="cmd-fa">زوم کن</span></div>
        <div class="cmd"><span>Track flight</span><span class="cmd-fa">دنبال کن</span></div>
        <div class="cmd"><span>Show cameras</span><span class="cmd-fa">دوربین تهران</span></div>
        <div class="cmd"><span>Show Kurdistan</span><span class="cmd-fa">کردستان - کوردستان</span></div>
      </div>
      <div id="voice-lang-switch">
        <button data-lang="en-US" class="active">EN</button>
        <button data-lang="fa-IR">فا</button>
        <button data-lang="ku">کو</button>
      </div>
      <button id="voice-mic-btn" title="Voice Control - کنترل صوتی">🎤</button>
    `;

    document.body.appendChild(container);

    const micBtn = container.querySelector('#voice-mic-btn');
    const transcriptDiv = container.querySelector('#voice-transcript');
    const helpDiv = container.querySelector('#voice-commands-help');

    micBtn.onclick = () => {
      if (this.isListening) {
        this.stop();
      } else {
        this.start();
      }
    };

    micBtn.onmouseenter = () => {
      helpDiv.classList.add('active');
    };
    micBtn.onmouseleave = () => {
      helpDiv.classList.remove('active');
    };

    // Lang switch
    container.querySelectorAll('#voice-lang-switch button').forEach(btn => {
      btn.onclick = () => {
        container.querySelectorAll('#voice-lang-switch button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.options.lang = btn.dataset.lang;
        if (this.recognition) {
          this.recognition.lang = this.options.lang;
          if (this.isListening) {
            this.stop();
            setTimeout(() => this.start(), 300);
          }
        }
      };
    });

    this.micBtn = micBtn;
    this.transcriptDiv = transcriptDiv;
    this.container = container;
  }

  updateUIState() {
    if (!this.micBtn) return;
    if (this.isListening) {
      this.micBtn.classList.add('listening');
      this.micBtn.textContent = '🔴';
      this.transcriptDiv.classList.add('active');
    } else {
      this.micBtn.classList.remove('listening');
      this.micBtn.textContent = '🎤';
      // Keep transcript visible for 3s after stop
      setTimeout(() => {
        if (!this.isListening) {
          this.transcriptDiv.classList.remove('active');
        }
      }, 3000);
    }
  }

  updateTranscript(text, isFinal) {
    if (!this.transcriptDiv) return;
    const cls = isFinal ? 'final' : 'interim';
    this.transcriptDiv.innerHTML = `<span class="${cls}">${isFinal ? '✓ ' : '... '}${text}</span>`;
  }

  start() {
    if (!this.recognition) {
      alert('Voice recognition not supported in this browser. Use Chrome/Edge.');
      return;
    }
    this.shouldBeListening = true;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('[Voice] Start failed:', e);
    }
  }

  stop() {
    this.shouldBeListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  processCommand(transcript) {
    const lower = transcript.toLowerCase().trim();
    console.log('[Voice] Command:', transcript);

    // Try to match against all commands
    let matched = null;
    let matchedIntent = null;

    for (const [intent, translations] of Object.entries(VOICE_COMMANDS)) {
      const allPhrases = [...(translations.en || []), ...(translations.fa || []), ...(translations.ku || []), ...(translations.ckb || [])];
      for (const phrase of allPhrases) {
        if (lower.includes(phrase.toLowerCase())) {
          matched = phrase;
          matchedIntent = intent;
          break;
        }
      }
      if (matched) break;
    }

    // Check destinations
    for (const [destKey, dest] of Object.entries(VOICE_DESTINATIONS)) {
      const names = [destKey, dest.en.toLowerCase(), dest.fa, dest.ku].filter(Boolean);
      for (const name of names) {
        if (lower.includes(name.toLowerCase())) {
          this.executeGoTo(dest);
          this.showFeedback(`✈️ ${dest.en} - ${dest.fa} - ${dest.ku}`);
          return;
        }
      }
    }

    if (matchedIntent) {
      this.executeIntent(matchedIntent, transcript);
      this.showFeedback(`✓ ${matchedIntent}: "${matched}"`);
    } else {
      // Try fuzzy: if transcript contains city name without "go to"
      this.showFeedback(`? "${transcript}" - not recognized`);
    }

    if (this.onCommandCallback) {
      this.onCommandCallback(matchedIntent, transcript);
    }
  }

  executeIntent(intent, transcript) {
    switch(intent) {
      case 'zoom_in':
        this.viewer.camera.zoomIn(5000);
        break;
      case 'zoom_out':
        this.viewer.camera.zoomOut(5000);
        break;
      case 'show_flights':
        window.dispatchEvent(new CustomEvent('gev:toggle-layer', { detail: { layer: 'flights', enabled: true }}));
        break;
      case 'show_ships':
        window.dispatchEvent(new CustomEvent('gev:toggle-layer', { detail: { layer: 'ships', enabled: true }}));
        break;
      case 'show_satellites':
        window.dispatchEvent(new CustomEvent('gev:toggle-layer', { detail: { layer: 'satellites', enabled: true }}));
        break;
      case 'show_cctv':
        window.dispatchEvent(new CustomEvent('gev:toggle-layer', { detail: { layer: 'cctv', enabled: true }}));
        break;
      case 'stop_tracking':
        window.dispatchEvent(new CustomEvent('gev:stop-tracking'));
        break;
      case 'tehran':
        this.executeGoTo(VOICE_DESTINATIONS.tehran);
        break;
      case 'erbil':
        this.executeGoTo(VOICE_DESTINATIONS.erbil);
        break;
      case 'slemani':
        this.executeGoTo(VOICE_DESTINATIONS.slemani);
        break;
      case 'duhok':
        this.executeGoTo(VOICE_DESTINATIONS.duhok);
        break;
      case 'kurdistan':
        this.executeGoTo(VOICE_DESTINATIONS.kurdistan);
        break;
      case 'persian_gulf':
        this.executeGoTo(VOICE_DESTINATIONS.persian_gulf);
        break;
    }
  }

  executeGoTo(dest) {
    if (!dest) return;
    this.viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(dest.lon, dest.lat, dest.alt),
      duration: 2.5,
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-45),
        roll: 0
      }
    });
  }

  showFeedback(msg) {
    if (!this.transcriptDiv) return;
    this.transcriptDiv.innerHTML = `<span class="final">${msg}</span>`;
    this.transcriptDiv.classList.add('active');
  }

  onCommand(callback) {
    this.onCommandCallback = callback;
  }

  destroy() {
    this.stop();
    if (this.container) this.container.remove();
  }
}

export function createPersianVoiceControl(viewer, options) {
  return new PersianVoiceControl(viewer, options);
}
