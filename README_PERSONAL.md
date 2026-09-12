<div align="center">

# ☀️ God's Eye View — Personal Edition

### چاوی خودا | چشم خدا | Kurdistan & Iran Focused

[![Personal Edition](https://img.shields.io/badge/Edition-Personal-ff2a2a?style=for-the-badge&logo=cesium)](https://github.com/arammoostafaye/gods-eye-view)
[![Kurdistan](https://img.shields.io/badge/Focus-Kurdistan_&_Iran-00ff88?style=for-the-badge)](https://github.com/arammoostafaye/gods-eye-view)
[![i18n](https://img.shields.io/badge/i18n-ku_/_fa_/_en-blue?style=for-the-badge)](https://github.com/arammoostafaye/gods-eye-view)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](./docker-compose.yml)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa)](./public/manifest.json)

**A spy satellite simulator in your browser — but now focused on YOUR region.**

*Live aircraft, ships, satellites, earthquakes on a photorealistic 3D globe — with Kurdish, Persian, and Middle East presets.*

**فورک شخصی‌سازی شده با تمرکز بر کردستان، ایران و خلیج فارس**

[🚀 Quick Start](#-quick-start) · [☀️ Kurdistan Presets](#️-kurdistan--iran-presets) · [🌍 i18n](#-multilingual) · [🐳 Docker](#-docker) · [📡 New Layers](#-new-data-layers)

---

![God's Eye View](docs/media/hero-open-source-reveal.gif)

</div>

---

## 🆕 چی جدید اضافه شده؟ (Personal Edition)

### 1. 🌍 چندزبانه - Kurdish, Persian, English

```js
// Auto-detects browser language
// ku = کوردی سورانی | fa = فارسی | en = English
// RTL کامل + فونت Vazirmatn
```

- ✅ **کوردی سۆرانی** — چاوی خودا، هیچ شوێنێک لەبیر نەکراوە
- ✅ **فارسی** — چشم خدا، هیچ جایی فراموش نشده
- ✅ **English** — Original
- 🔄 سوییچر زبان پایین سمت چپ
- 🔄 فونت Vazirmatn برای فارسی/کردی

### 2. ☀️ Kurdistan & Iran Presets

یک کلیک پرش به:

**Kurdistan Region:**
- 🏛️ هەولێر / اربیل (ORER) - پایتخت
- 🎭 سلێمانی / سلیمانی (ORSU) - پایتخت فرهنگی
- 🏔️ دهۆک / دهوک - کوهستانی
- 🛢️ کەرکووک / کرکوک - شهر نفت
- 🕊️ هەڵەبجە / حلبچه

**Iran - ایران:**
- 🏙️ تهران (OIII/OIIE)
- 🕌 اصفهان (OIFM)
- 🧶 تبریز (OITT)
- 🎵 سنە / سنندج (OICS)
- 🌊 ورمێ / ارومیه
- 🍷 شیراز

**Middle East:**
- 🚢 خلیج فارس و تنگه هرمز - گلوگاه نفت جهان
- ☀️ کردستان بزرگ - نمای 800km
- 🏔️ کوه‌های زاگرس
- 🕌 بغداد، استانبول

**URL sharing:** `?preset=erbil` → مستقیم میره به هولیر!

### 3. 🐳 Docker & Easy Deploy

**یک خطی اجرا:**

```bash
docker-compose up
# → http://localhost:4173
```

**GitHub Pages:** خودکار هر پوش → `https://arammoostafaye.github.io/gods-eye-view/`

**Vercel:** یک کلیک

### 4. 📱 PWA - نصب به عنوان اپ

- ✅ `manifest.json` + Service Worker
- ✅ نصب روی موبایل/دسکتاپ
- ✅ آیکون، Shortcuts (Erbil, Tehran, Persian Gulf)
- ✅ کار آفلاین (کش)

### 5. 📡 لایه‌های جدید (در حال توسعه)

| لایه | وضعیت | منبع |
|------|--------|------|
| Weather Radar | ✅ Planned | RainViewer API |
| Persian Gulf Ships | 🔄 In Progress | AISStream filtered |
| Iranian Airlines Highlight | ✅ Done | IRA, IRM, IRC, THY |
| Starlink Train | 📋 TODO | CelesTrak |
| Kurdistan Borders | ✅ Done | GeoJSON |
| Tehran Traffic Cams | 📋 TODO | شهرداری تهران |

---

## ⚡ Quick Start (Personal Edition)

### Docker (ساده‌ترین)

```bash
git clone https://github.com/arammoostafaye/gods-eye-view.git
cd gods-eye-view
docker-compose up
# Open http://localhost:4173
```

### Local Dev

```bash
git clone https://github.com/arammoostafaye/gods-eye-view.git
cd gods-eye-view
npm ci
npm run dev
# Open http://localhost:4173
```

### GitHub Pages (خودکار)

هر پوش به `main` → خودکار دیپلوی به Pages

فعال کردن: `Settings → Pages → Source: GitHub Actions`

---

## 🎮 چطور استفاده کنم؟

1. **زبان:** پایین چپ → کوردی / فارسی / English
2. **پرش سریع:** بالا راست → ☀️ Quick Jump → هەولێر
3. **لینک مستقیم:** `https://your-site.com/?preset=slemani`
4. **کنترل صوتی:** (به زودی فارسی) - "پروازهای بالای تهران رو نشون بده"

---

## 🗺️ ساختار جدید

```
src/
  i18n/               # ✨ جدید
    ku.json           # کوردی
    fa.json           # فارسی
    en.json
    index.js          # auto-detect + RTL
  data/regions/       # ✨ جدید
    kurdistan.js      # presets, airports, borders
  presets/            # ✨ جدید
    kurdistanCameras.js  # UI + flyTo
    languageSwitcher.js
public/
  manifest.json       # ✨ PWA
  sw.js              # ✨ Service Worker
```

---

## 🔧 کانفیگ شخصی

`.env` (اختیاری):

```bash
# برای 3D photorealistic
CESIUM_ION_TOKEN=your_token
GOOGLE_MAPS_API_KEY=your_key

# برای ترافیک و کشتی
TOMTOM_API_KEY=your_key
AISSTREAM_API_KEY=your_key

# برای Voice
OPENAI_API_KEY=your_key
```

بدون هیچ کدوم هم کار میکنه! (Esri satellite + OpenSky keyless)

---

## 📸 Screenshots (TODO)

- [ ] Kurdistan region view
- [ ] Persian Gulf ships
- [ ] Language switcher fa/ku
- [ ] Mobile PWA

---

## 🤝 تفاوت با نسخه اصلی

| فیچر | اصلی | Personal Edition |
|------|------|------------------|
| زبان | فقط انگلیسی | ku/fa/en + RTL |
| فوکوس منطقه‌ای | جهانی | کردستان/ایران/خلیج فارس |
| Presets | ندارد | 15+ شهر منطقه |
| Docker | ندارد | ✅ |
| PWA | ندارد | ✅ |
| Pages | ندارد | ✅ Auto |
| Airlines Highlight | ندارد | Iran, Turkey, Iraq |

**Upstream:** [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) - همیشه میتونی merge کنی

---

## 📜 License

MIT - Same as original. Data sources keep their own licenses (see DATA_SOURCES.md)

Personal Edition by [arammoostafaye](https://github.com/arammoostafaye)

**چاوی خودا - هیچ شوێنێک لەبیر نەکراوە ☀️**
**چشم خدا - هیچ جایی فراموش نشده 🇮🇷**

---

<div align="center">

### 🚀 آماده‌ای؟

```bash
git clone https://github.com/arammoostafaye/gods-eye-view.git
cd gods-eye-view
docker-compose up
```

**یک دستور، یک کره زمین زنده، با تمرکز روی خونه‌ات.**

</div>
