/**
 * Live Stats Bar - Bottom ticker showing real-time global stats
 * Works on GitHub Pages with mock + public API data
 */

import { ddosMonitor } from '../data/cyberIntelligence/ddosAttacks.js';
import { phishingMonitor, zeroDayMonitor } from '../data/cyberIntelligence/phishingAndZeroDay.js';
import { internetOutageMonitor } from '../data/cyberIntelligence/internetOutage.js';
import { liveCurrencyMonitor } from '../data/cyberIntelligence/liveCurrency.js';
import { speedMonitor } from '../data/cyberIntelligence/filteringAndSpeed.js';

export class LiveStatsBar {
  constructor() {
    this.container = null;
    this.updateInterval = null;
    this.createBar();
    this.startUpdates();
  }

  createBar() {
    const div = document.createElement('div');
    div.id = 'live-stats-bar';
    div.innerHTML = `
      <style>
        #live-stats-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 36px;
          background: linear-gradient(90deg, rgba(8,12,20,0.98), rgba(20,10,15,0.98));
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255,42,42,0.2);
          z-index: 997;
          display: flex;
          align-items: center;
          font-family: 'JetBrains Mono', 'Vazirmatn', monospace;
          font-size: 11px;
          color: #e0e0e0;
          overflow: hidden;
          white-space: nowrap;
        }
        .lsb-content {
          display: flex;
          align-items: center;
          gap: 0;
          animation: scrollTicker 120s linear infinite;
          padding-left: 100%;
        }
        @keyframes scrollTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .lsb-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 16px;
          border-right: 1px solid rgba(255,255,255,0.08);
          height: 36px;
          flex-shrink: 0;
        }
        .lsb-item.critical { background: rgba(255,42,42,0.08); }
        .lsb-item.warning { background: rgba(255,136,0,0.08); }
        .lsb-item.success { background: rgba(0,255,136,0.06); }
        .lsb-dot {
          width: 6px; height: 6px; border-radius: 50%;
          animation: pulseDot 1.5s infinite;
        }
        .lsb-dot.red { background: #ff2a2a; }
        .lsb-dot.green { background: #00ff88; }
        .lsb-dot.yellow { background: #ffaa00; }
        .lsb-dot.blue { background: #00d4ff; }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .lsb-label { color: #888; text-transform: uppercase; font-size: 9px; letter-spacing: 0.8px; }
        .lsb-value { color: #fff; font-weight: 700; }
        .lsb-value.red { color: #ff6b6b; }
        .lsb-value.green { color: #00ff88; }
        .lsb-value.yellow { color: #ffaa00; }
        .lsb-value.blue { color: #00d4ff; }
        @media (max-width: 768px) {
          #live-stats-bar { height: 32px; font-size: 10px; }
          .lsb-item { padding: 0 12px; height: 32px; }
        }
      </style>
      <div class="lsb-content" id="lsb-content">
        <div class="lsb-item"><span class="lsb-dot green"></span><span class="lsb-label">System</span><span class="lsb-value">GOD'S EYE VIEW • PERSONAL EDITION V2.4 • LIVE</span></div>
      </div>
    `;
    document.body.appendChild(div);
    this.container = div;
  }

  updateStats() {
    const content = document.getElementById('lsb-content');
    if (!content) return;

    const ddosStats = ddosMonitor.getStats();
    const phishingStats = phishingMonitor.getStats();
    const zeroDayStats = zeroDayMonitor.getStats();
    const outageStats = internetOutageMonitor.getStats();
    const currencyRates = liveCurrencyMonitor.getAllRates();

    // Format currency - Iran focus
    const irrRate = currencyRates?.IRR;
    const irrText = irrRate ? `IRR: ${irrRate.blackMarket?.toLocaleString() || irrRate.blackMarket}﷼ / $${irrRate.tomanBlack?.toLocaleString() || '58,000'}T` : 'IRR: Loading...';

    const items = [
      { label: 'DDoS', value: `${ddosStats.active} active • ${ddosStats.totalGbps} Gbps`, dot: 'red', cls: ddosStats.critical > 0 ? 'critical' : '' },
      { label: 'Outages', value: `${outageStats.active} countries • ${outageStats.critical} critical`, dot: 'yellow', cls: outageStats.critical > 0 ? 'warning' : '' },
      { label: 'Phishing', value: `${phishingStats.active} URLs • ${phishingStats.totalClicks} clicks`, dot: 'red', cls: 'critical' },
      { label: 'Zero-Day', value: `${zeroDayStats.active} CVEs • ${zeroDayStats.critical} critical`, dot: 'red', cls: zeroDayStats.critical > 0 ? 'critical' : '' },
      { label: 'Currency', value: irrText, dot: 'blue', cls: '' },
      { label: 'USD/TRY', value: `₺${currencyRates?.TRY?.rate || '48.6'}`, dot: 'blue', cls: '' },
      { label: 'BTC', value: `$${currencyRates?.BTC?.usdPrice?.toLocaleString() || '67,000'}`, dot: 'yellow', cls: '' },
      { label: 'Iran Filter', value: 'Level 9/10 Extreme', dot: 'red', cls: 'critical' },
      { label: 'Kurdistan', value: '🏔️ 6M Sorani • 2M Kurmanji • Erbil • Slemani • Duhok', dot: 'green', cls: 'success' },
      { label: 'Flights', value: `${window.__flightCount || 0} tracked • Live via airplanes.live`, dot: 'green', cls: 'success' },
    ];

    // Add random live events
    const events = [
      '📵 Iran: Throttling detected - 23% traffic drop',
      '💥 DDoS: 245 Gbps attack on Tehran DC1 mitigated',
      '🎣 Phishing: Fake Bank Melli Iran - 1,243 clicks blocked',
      '0️⃣ CVE-2024-38193: Windows exploit active in wild',
      '🇮🇷 Tehran: Internet speed 22.5 Mbps ↓ 12.3 ↑',
      '🏔️ Erbil: Newroz Telecom - 32 Mbps • Filtering Level 4',
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    const html = [
      `<div class="lsb-item success"><span class="lsb-dot green"></span><span class="lsb-label">System</span><span class="lsb-value">GOD'S EYE VIEW • V2.4 • ${new Date().toLocaleTimeString()} • LIVE</span></div>`,
      ...items.map(item => `
        <div class="lsb-item ${item.cls}">
          <span class="lsb-dot ${item.dot}"></span>
          <span class="lsb-label">${item.label}</span>
          <span class="lsb-value ${item.dot}">${item.value}</span>
        </div>
      `),
      `<div class="lsb-item warning"><span class="lsb-dot yellow"></span><span class="lsb-label">Live</span><span class="lsb-value yellow">${randomEvent}</span></div>`,
      `<div class="lsb-item"><span class="lsb-dot blue"></span><span class="lsb-label">GitHub</span><span class="lsb-value">arammoostafaye.github.io/gods-eye-view • Personal Edition • Kurdistan & Iran Focus</span></div>`,
    ].join('');

    content.innerHTML = html + html; // Duplicate for seamless scroll
  }

  startUpdates() {
    this.updateStats();
    this.updateInterval = setInterval(() => this.updateStats(), 10000);

    // Listen for flight count updates
    window.addEventListener('gev:flight-count', (e) => {
      window.__flightCount = e.detail?.count || 0;
    });

    // Update monitors if available
    try {
      ddosMonitor.startMonitoring(15000);
      phishingMonitor.startMonitoring(20000);
      zeroDayMonitor.startMonitoring(60000);
      internetOutageMonitor.startMonitoring(30000);
      liveCurrencyMonitor.start(30000);
      speedMonitor.startMonitoring(60000);
    } catch (e) {
      console.log('[LiveStatsBar] Some monitors failed to start:', e.message);
    }
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}

export function createLiveStatsBar() {
  return new LiveStatsBar();
}
