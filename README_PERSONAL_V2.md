# 🌍 God's Eye View - Personal Edition V2
### Kurdistan & Iran Focus + Country Intelligence + Cyber Threat Live

> A spy satellite simulator in your browser, except the data is real.
> **Personal Edition** adds Kurdistan/Iran regional focus, country intelligence, and live cyber threat monitoring.

![Version](https://img.shields.io/badge/version-2.0.0-red)
![Cesium](https://img.shields.io/badge/Cesium-1.124.0-00d4ff)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ New in V2 - درخواست‌های شما

### 🗺️ Country Intelligence - با کلیک روی هر کشور

هر کشور را کلیک کنید تا ببینید:

#### 📊 اطلاعات جمعیتی
- **مساحت** - Area km²
- **جمعیت** - Population + سال آمار
- **تعداد مرگ و میر روزانه** - Death count per day + rate per 1000
- **تعداد زاد و ولد روزانه** - Birth count per day + rate
- **رشد جمعیت** - Growth rate + net per day

#### 🗣️ زبان‌ها
- **زبان رسمی** - Official languages (فارسی، کوردی، عربی، ترکی...)
- **گویش‌های محلی** - Local dialects with region and speakers
  - برای ایران: کردی (سورانی/کرمانجی 10M)، آذری 16M، لری 5M، گیلکی، مازندرانی، بلوچی، عربی خوزستانی، ترکمنی
  - برای عراق: سورانی 6M، کرمانجی 2M، عربی عراقی، ترکمنی
  - برای ترکیه: کرمانجی 15M، زازاکی 2M، عربی

#### 💰 اقتصاد
- **رتبه اقتصادی در جهان** - Economic rank (GDP nominal)
  - آمریکا #1, چین #2, آلمان #3, ژاپن #4, هند #5, بریتانیا #6...
  - ایران #41, ترکیه #18, عراق #52
- **GDP nominal + per capita**
- **قیمت واحد پول نسبت به دلار** - Currency vs USD LIVE
  - **ایران**: ریال رسمی 42,000 + تومان 4,200 + بازار آزاد ~580,000 ریال / 58,000 تومان LIVE با تغییرات روزانه
  - عراق: دینار 1,310
  - ترکیه: لیر 32.5
  - + EUR, GBP, JPY, CNY, RUB, BTC $67k

### 📵 دیدن لحظه‌ای قطعی اینترنت - NetBlocks Style

**Live internet outage detection:**

- **Source**: NetBlocks.org + IODA + Cloudflare Radar
- **Real-time**: آپدیت هر 30 ثانیه
- **Per country**: ایران، سوریه، عراق + random global
- **Details**:
  - نوع قطعی: government_shutdown, infrastructure_damage, power_outage, cable_cut
  - شدت: critical, high, medium, low
  - درصد प्रभावित: affectedPercent
  - افت ترافیک: trafficDropPercent
  - ASNهای प्रभावित
  - دلیل و مدت زمان
- **Visualization**: روی نقشه با billboard قرمز + خطوط

### 💥 دیدن لحظه‌ای حملات DDoS روی دیتاسنترها

**Live DDoS attacks on data centers:**

- **Source**: Cloudflare Radar DDoS + Akamai + NETSCOUT Arbor + Digital Attack Map
- **Real-time**: آپدیت هر 15 ثانیه
- **Targets**:
  - تهران DC1 - Pars Online 🇮🇷
  - اربیل DC - Newroz Telecom 🇮🇶
  - استانبول DC - Turk Telekom 🇹🇷
  - فرانکفورت - Hetzner 🇩🇪
  - لندن - LINX 🇬🇧
  - ویرجینیا - AWS us-east-1 🇺🇸
  - سنگاپور، توکیو، بمبئی، سائو پائولو، سیدنی، مسکو، پکن
- **Metrics**: Gbps, Mpps, duration, source country, vector (UDP, DNS, SYN, HTTP, NTP, Memcached...)
- **Severity**: critical >300 Gbps, high >100, medium >30
- **Visualization**: خطوط حمله از مبدا به مقصد + شدت با رنگ

### 🎣 دیدن زنده تعداد حملات فیشینگ فعال

**Live phishing attacks:**

- **Source**: Abuse.ch URLhaus + PhishTank + OpenPhish + Google Safe Browsing
- **Real-time**: آپدیت هر 20 ثانیه
- **Brands abused**: Microsoft 365, Apple ID, PayPal, Bank Melli Iran 🇮🇷, Google, Facebook, WhatsApp, Binance, Netflix, Kurdistan Bank 🇮🇶, Turkish Airlines 🇹🇷, DHL
- **Types**: Credential Harvesting, Fake Invoice, CEO Fraud, Delivery Scam, Banking Trojan
- **Details**: URL, clicks, hosting country, IP, ASN, reportedBy
- **Stats**: Active URLs, victim clicks, brands, by country

### 0️⃣ دیدن حملات زنده Zero-Day و آسیب‌پذیری‌های تازه کشف شده

**Live zero-day exploits:**

- **Source**: CISA KEV (Known Exploited Vulnerabilities) + ThreatFox + Cloudflare
- **Real-time**: آپدیت هر 60 ثانیه
- **CVEs**:
  - CVE-2024-38193 Windows Win32k PrivEsc CVSS 7.8
  - CVE-2024-43491 Windows MSHTML Spoofing 8.8
  - CVE-2024-47575 FortiManager Missing Auth 9.8
  - CVE-2024-8956 SolarWinds Hardcoded Creds 9.8
  - CVE-2024-0012 Palo Alto PAN-OS Auth Bypass 9.3
  - CVE-2024-3400 Palo Alto GlobalProtect RCE 10.0 🔥
  - CVE-2024-21893 Ivanti SSRF 8.2
  - + more
- **Details**: Attacks detected, countries targeted, threat actors (APT29, Lazarus, APT41, MuddyWater, Charming Kitten, OilRig), exploit maturity (Weaponized, Functional, POC), mitigation

### 🛡️ دیدن کشورهای آسیب‌پذیر در برابر انواع حملات

**Vulnerable countries index:**

- **Score 0-10**: بر اساس تحریم، زیرساخت قدیمی، APT targeting، بودجه امنیتی، نرخ پچ نشده
- **Examples**:
  - سوریه: 8.5 Critical - جنگ، عدم پچ 82%
  - ایران: 7.8 High - تحریم، APTهای MuddyWater, Charming Kitten, OilRig, APT34، پچ نشده 65%
  - عراق: 7.2 High - آسیب جنگ، CERT محدود، فیشینگ موفق بالا
  - ترکیه: 6.5 Medium-High
  - روسیه: 5.8، چین: 5.5، آمریکا: 4.2 Medium (سطح بزرگ اما دفاع پیشرفته)
- **Top threats per country**: لیست APTها
- **Critical infra risk**: Very High, High, Medium

### 🚫 دیدن سطح فیلترینگ اینترنت برای هر کشور

**Internet filtering level 0-10:**

- **Source**: OONI + Freedom House Freedom on the Net + Censored Planet
- **Levels**:
  - 10/10 چین - Great Firewall 🇨🇳
  - 9/10 ایران - فیلترینگ شدید، DPI، خاموشی سراسری، اینستاگرام نیمه، تلگرام، واتساپ throttled 🇮🇷
  - 8/10 سوریه
  - 7/10 روسیه - Sovereign Internet, RKN blacklist
  - 6/10 ترکیه - مسدودسازی اخبار، رسانه کردی
  - 4/10 عراق - خاموشی گاه‌گاه در اعتراضات
  - 1-2/10 آمریکا، بریتانیا، آلمان - حداقل
- **Details**: blockedCategories, blockedSites, methods (DNS hijacking, IP blocking, DPI, SNI filtering, throttling, shutdowns), Freedom House score (ایران 16/100 Not Free، آمریکا 76/100)، OONI blocking rate، VPN blocking

### ⚡ دیدن سرعت اینترنت فعلی زنده برای هر کشور

**Live internet speed:**

- **Source**: Ookla Speedtest Global Index + Cloudflare Radar
- **Real-time**: آپدیت هر 10 ثانیه با jitter ±15%
- **Metrics per country**:
  - Download Mbps LIVE + trend ▲▼
  - Upload Mbps
  - Mobile download
  - Latency ms
  - World rank
  - Fiber percent
  - Provider (TCI, Irancell, MCI برای ایران، Newroz برای اقلیم...)
- **Examples**:
  - امارات: 220 Mbps #2 Fiber 95%
  - کره جنوبی: 210 Mbps #3
  - ژاپن: 195 Mbps #5
  - آمریکا: 180 Mbps #8
  - بریتانیا: 110 Mbps #35
  - آلمان: 95 Mbps #45
  - روسیه: 85 Mbps #50
  - ترکیه: 45 Mbps #106 Fiber 35%
  - عراق: 28 Mbps #138 Fiber 8%
  - ایران: 22 Mbps #145 Fiber 12% Latency 45ms
  - سوریه: 8 Mbps #180

---

## 🎮 How to Use - نحوه استفاده

### 1. Country Click - کلیک روی کشور
- **Click anywhere on globe** → Country intel panel appears on right
- **Shift+Click** on aircraft/ship to force country info
- Shows all: demographics, languages, economy, currency LIVE, internet, cyber threats

### 2. Toolbar - نوار ابزار بالا
Center top toolbar:
- **🌍 Country Intel** - Enable layer + hint
- **💥 DDoS** - Live DDoS map
- **📵 Outage** - Internet outages NetBlocks
- **🎣 Phishing** - Live phishing
- **0️⃣ Zero-Day** - Zero-day exploits
- **⚡ Speed** - Internet speed live
- **🇮🇷 Iran** - Fly to Iran 35.6892,51.3890
- **🏔️ Kurdistan** - Fly to Kurdistan 37.0,44.0
- **📊 Dashboard** - Global threat dashboard

### 3. Global Dashboard - داشبورد جهانی
Click **📊 Dashboard** to see:
- 6 main stat cards with charts
- DDoS table top 10
- Outages, phishing, zero-day lists
- Filtering table 10 countries
- Currency grid LIVE (IRR official vs black market, IQD, TRY, EUR, GBP, JPY, BTC)
- Speed rankings live sorted

### 4. Cyber Threat Map - نقشه تهدیدات
Each mode visualizes on globe:
- **DDoS**: Red/orange billboards + attack lines source→target
- **Outage**: Red billboards per country
- **Phishing**: Orange billboards
- **Zero-Day**: Red for CVSS≥9

Click list item → Fly to location

---

## 🏗️ Architecture - معماری

### New Files Created:

```
src/data/countryIntelligence/
  countryDatabase.js          - 10 detailed countries (IR, IQ, TR, SY, US, GB, DE, CN, RU + more)
  extendedDatabase.js         - 50+ countries simplified (AE, SA, QA, KW, BH, OM, JO, LB, YE, EG, IN, PK, BD, AF, AZ, AM, GE, KZ, UZ, TM, FR, IT, ES, NL, SE, PL, UA, GR, IL, CA, MX, BR, AR, ZA, NG, KE, AU, NZ, JP, KR, SG, ID...)

src/data/cyberIntelligence/
  internetOutage.js           - NetBlocks + IODA monitor, mock + real API proxy
  ddosAttacks.js              - DDoS live with 13 data centers, 8 attack vectors
  phishingAndZeroDay.js       - Phishing (12 brands) + Zero-Day (10 CVEs) monitors
  filteringAndSpeed.js        - Filtering DB (IR 9/10, CN 10/10...) + Speed DB (AE #2, IR #145...) + Vulnerability Index + SpeedMonitor
  liveCurrency.js             - LIVE IRR (official 42k, black 580k, Toman) + IQD, TRY, SYP, EUR, GBP, JPY, CNY, RUB, INR, AED, SAR, BTC $67k

src/data/
  countryIntelligenceLayer.js - Main layer: click handler, panel, threat map, toolbar, dashboard integration

src/ui/
  countryInfoPanel.js         - Right panel 420px: demographics, languages (Kurdish/Persian highlighted), economy, currency LIVE, internet, cyber threats
  cyberThreatMap.js           - Left panel 360px: 5 tabs (DDoS, Outage, Phish, Zero-Day, Speed) + globe visualization
  countryIntelToolbar.js      - Top center toolbar: 8 buttons + dashboard
  globalThreatDashboard.js    - Fullscreen dashboard: 6 stat cards, tables, charts, currency grid, speed rankings

server/providers/
  cyberIntel.js               - Mock APIs: /api/internet-outages, /api/ddos-attacks, /api/country-info, /api/phishing-live, /api/zeroday-live, /api/internet-speed, /api/filtering-level

src/standalone/
  data.js                     - Registered countryIntelligenceLayer
```

### Data Flow:
```
Map Click → getCountryByLatLon() → CountryInfoPanel
  → filtering + speed + vuln + outage + ddos + phishing + zeroDay + currency
  → LIVE updates every 10-30s

Toolbar → ThreatMap → visualize() → Cesium entities (billboards + polylines)
Dashboard → All monitors → Aggregated view
```

---

## 🚀 Quick Start

```bash
# Install
npm ci

# Dev (port 4173)
npm run dev

# Build
npm run build

# Then open:
# http://localhost:4173
# Click any country!
# Click toolbar buttons!
# Click Dashboard!
```

---

## 🌐 Live APIs (Real + Mock)

| Feature | Real Source | Proxy Endpoint | Status |
|---------|-------------|----------------|--------|
| Outages | NetBlocks, IODA, Cloudflare Radar | /api/internet-outages | Mock + ready for real |
| DDoS | Cloudflare Radar, Akamai, Arbor | /api/ddos-attacks | Mock + ready |
| Phishing | Abuse.ch URLhaus, PhishTank | /api/phishing-live | Mock |
| Zero-Day | CISA KEV, ThreatFox | /api/zeroday-live | Mock |
| Filtering | OONI, Freedom House | /api/filtering-level | Local DB |
| Speed | Ookla, Cloudflare Radar | /api/internet-speed | Local DB + jitter |
| Currency | exchangerate-api.com, CBI | /api/currency-rates | Mock LIVE |
| Country | REST Countries, World Bank | /api/country-info | Local DB + API fallback |
| Reverse Geocode | Nominatim via /api/regional-brief | /api/regional-brief | Real ✅ |

---

## 🎨 UI/UX

- **RTL Support**: Vazirmatn font, Persian/Kurdish translations
- **Live Indicators**: Pulsing dots, trends ▲▼, LIVE badges
- **Color Coding**: Critical red, high orange, medium yellow, low green
- **Kurdish Highlight**: Red border for Kurdish dialects
- **Persian Highlight**: Green border for Persian
- **Responsive**: Mobile bottom toolbar, scrollable panels
- **Animations**: slideIn, pulse, fadeInOut, chart bars

---

## 🔮 Future Ideas

- [ ] Add Cloudflare Radar API key for real DDoS
- [ ] Add OONI API for real filtering measurements
- [ ] Add Ookla API key for real speed
- [ ] Add exchangerate-api key for real currency
- [ ] Country borders GeoJSON layer with hover
- [ ] Historical charts for currency/speed/outages
- [ ] Export country report as PDF
- [ ] Compare two countries side-by-side
- [ ] Add more countries to main DB (currently 10 detailed + 50 extended)

---

## 📝 Personal Edition V1 Features (Kept)

- ✅ Kurdistan & Iran camera presets (Erbil, Slemani, Duhok, Tehran, Isfahan, Tabriz, etc.)
- ✅ 16 regional presets: 5 Kurdistan, 6 Iran, 5 Middle East (Persian Gulf, Hormuz, Zagros...)
- ✅ Airports ORER, ORSU, OIII, etc.
- ✅ Airlines IRA, IRM, IRC, THY
- ✅ i18n ku/fa/en with RTL Vazirmatn
- ✅ Tehran traffic cams (5) + Kurdistan cams (Erbil, Slemani, Duhok) + Isfahan, Tabriz, Baghdad, Istanbul
- ✅ Kurdish/Persian radio filtering
- ✅ Flight history playback
- ✅ Persian/Kurdish voice control
- ✅ Flight anomaly detection

---

## 📄 License

MIT - Same as original gods-eye-view

---

## 🙏 Credits

- Original: [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view)
- Personal Edition: Aram Moostafaye - Kurdistan & Iran focus + Country Intelligence + Cyber Threat Live
- Data: World Bank, REST Countries, Cloudflare Radar, NetBlocks, Abuse.ch, CISA KEV, OONI, Freedom House, Ookla

---

**Made with ❤️ for Kurdistan & Iran - کوردستان و ایران**
