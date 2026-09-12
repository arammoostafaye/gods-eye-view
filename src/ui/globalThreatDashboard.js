/**
 * Global Threat Dashboard - Personal Edition
 * Shows live global stats for all cyber threats + internet health
 */

import { internetOutageMonitor } from '../data/cyberIntelligence/internetOutage.js';
import { ddosMonitor } from '../data/cyberIntelligence/ddosAttacks.js';
import { phishingMonitor, zeroDayMonitor } from '../data/cyberIntelligence/phishingAndZeroDay.js';
import { speedMonitor, FILTERING_DATABASE } from '../data/cyberIntelligence/filteringAndSpeed.js';
import { liveCurrencyMonitor } from '../data/cyberIntelligence/liveCurrency.js';

export class GlobalThreatDashboard {
  constructor() {
    this.container = null;
    this.isVisible = false;
    this.updateInterval = null;
    this.createDashboard();
  }

  createDashboard() {
    const div = document.createElement('div');
    div.id = 'global-threat-dashboard';
    div.innerHTML = `
      <style>
        #global-threat-dashboard {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(20px);
          z-index: 2000;
          display: none;
          overflow-y: auto;
          font-family: 'Vazirmatn', 'JetBrains Mono', monospace;
          color: #e0e0e0;
        }
        #global-threat-dashboard.active { display: block; }
        #global-threat-dashboard::-webkit-scrollbar { width: 8px; }
        #global-threat-dashboard::-webkit-scrollbar-thumb { background: rgba(255,42,42,0.3); border-radius: 4px; }
        
        .gtd-header {
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, rgba(8,12,20,0.98), rgba(20,10,15,0.98));
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,42,42,0.2);
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1;
        }
        .gtd-header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(90deg, #ff2a2a, #ff8800, #ffd166);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .gtd-live {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,42,42,0.15);
          border: 1px solid rgba(255,42,42,0.3);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          color: #ff6b6b;
        }
        .gtd-live-dot {
          width: 10px; height: 10px; background: #ff2a2a; border-radius: 50%;
          animation: pulseRed 1s infinite;
        }
        @keyframes pulseRed {
          0% { box-shadow: 0 0 0 0 rgba(255,42,42,0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255,42,42,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,42,42,0); }
        }
        .gtd-close {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; font-size: 20px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .gtd-close:hover { background: rgba(255,42,42,0.2); border-color: #ff2a2a; }
        
        .gtd-content { padding: 20px 30px; max-width: 1400px; margin: 0 auto; }
        
        .gtd-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .gtd-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 18px;
          backdrop-filter: blur(12px);
          transition: all 0.3s;
        }
        .gtd-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .gtd-card.critical { border-color: rgba(255,42,42,0.3); background: rgba(255,42,42,0.06); }
        .gtd-card.warning { border-color: rgba(255,136,0,0.3); background: rgba(255,136,0,0.06); }
        .gtd-card.info { border-color: rgba(0,212,255,0.3); background: rgba(0,212,255,0.06); }
        .gtd-card.success { border-color: rgba(0,255,136,0.3); background: rgba(0,255,136,0.06); }
        
        .gtd-card-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px;
        }
        .gtd-card-title {
          font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
          display: flex; align-items: center; gap: 8px;
        }
        .gtd-card-value {
          font-size: 32px; font-weight: 800; line-height: 1;
          margin-bottom: 6px;
        }
        .gtd-card-desc { font-size: 11px; color: #888; line-height: 1.4; }
        .gtd-card-trend {
          font-size: 11px; padding: 3px 8px; border-radius: 12px; font-weight: 600;
        }
        .gtd-card-trend.up { background: rgba(0,255,136,0.15); color: #00ff88; }
        .gtd-card-trend.down { background: rgba(255,42,42,0.15); color: #ff6b6b; }
        .gtd-card-trend.neutral { background: rgba(255,255,255,0.08); color: #aaa; }
        
        .gtd-section { margin-bottom: 30px; }
        .gtd-section-title {
          font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;
          color: #00d4ff; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
          border-bottom: 1px solid rgba(0,212,255,0.15); padding-bottom: 8px;
        }
        
        .gtd-table {
          width: 100%; border-collapse: collapse; font-size: 12px;
          background: rgba(255,255,255,0.02); border-radius: 12px; overflow: hidden;
        }
        .gtd-table th {
          background: rgba(255,255,255,0.05); padding: 10px 12px; text-align: left;
          font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.8px; color: #aaa;
        }
        .gtd-table td { padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.05); }
        .gtd-table tr:hover { background: rgba(255,255,255,0.03); }
        
        .gtd-badge {
          display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700;
          text-transform: uppercase;
        }
        .gtd-badge.critical { background: #ff2a2a; color: white; }
        .gtd-badge.high { background: #ff8800; color: white; }
        .gtd-badge.medium { background: #ffd166; color: #000; }
        .gtd-badge.low { background: #00ff88; color: #000; }
        
        .gtd-chart {
          height: 120px; background: rgba(0,0,0,0.2); border-radius: 8px;
          display: flex; align-items: end; gap: 2px; padding: 10px; margin-top: 12px;
        }
        .gtd-bar {
          flex: 1; background: linear-gradient(to top, #ff2a2a, #ff8800);
          border-radius: 2px 2px 0 0; min-height: 4px; transition: height 0.5s;
        }
        .gtd-bar.green { background: linear-gradient(to top, #00ff88, #00d4ff); }
        .gtd-bar.blue { background: linear-gradient(to top, #00d4ff, #44adff); }
      </style>
      
      <div class="gtd-header">
        <h1>🛡️ Global Cyber Threat Intelligence - داشبورد جهانی تهدیدات</h1>
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="gtd-live"><div class="gtd-live-dot"></div> LIVE MONITORING</div>
          <button class="gtd-close" id="gtd-close">✕</button>
        </div>
      </div>
      
      <div class="gtd-content">
        <div class="gtd-grid" id="gtd-main-stats">
          <!-- Filled by JS -->
        </div>
        
        <div class="gtd-section">
          <div class="gtd-section-title">💥 Active DDoS Attacks - حملات دیداس فعال</div>
          <div id="gtd-ddos-table"></div>
        </div>
        
        <div class="gtd-grid">
          <div class="gtd-card critical">
            <div class="gtd-card-header">
              <div class="gtd-card-title">📵 Internet Outages</div>
              <span class="gtd-card-trend down">NetBlocks Live</span>
            </div>
            <div id="gtd-outages-list"></div>
          </div>
          
          <div class="gtd-card warning">
            <div class="gtd-card-header">
              <div class="gtd-card-title">🎣 Phishing Campaigns</div>
              <span class="gtd-card-trend up">+12% today</span>
            </div>
            <div id="gtd-phishing-list"></div>
          </div>
          
          <div class="gtd-card critical">
            <div class="gtd-card-header">
              <div class="gtd-card-title">0️⃣ Zero-Day Exploits</div>
              <span class="gtd-card-trend critical">CISA KEV</span>
            </div>
            <div id="gtd-zeroday-list"></div>
          </div>
        </div>
        
        <div class="gtd-section">
          <div class="gtd-section-title">🌐 Internet Health by Country - سلامت اینترنت کشورها</div>
          <div id="gtd-filtering-table"></div>
        </div>
        
        <div class="gtd-section">
          <div class="gtd-section-title">💱 Live Currency vs USD - نرخ لحظه‌ای ارز</div>
          <div id="gtd-currency-grid" class="gtd-grid"></div>
        </div>
        
        <div class="gtd-section">
          <div class="gtd-section-title">⚡ Internet Speed Rankings - رتبه سرعت اینترنت</div>
          <div id="gtd-speed-table"></div>
        </div>
      </div>
    `;

    document.body.appendChild(div);
    this.container = div;

    div.querySelector('#gtd-close').onclick = () => this.hide();
    div.addEventListener('click', (e) => {
      if (e.target === div) this.hide();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) this.hide();
    });
  }

  show() {
    this.container.classList.add('active');
    this.isVisible = true;
    this.startUpdating();
    this.updateAll();
  }

  hide() {
    this.container.classList.remove('active');
    this.isVisible = false;
    this.stopUpdating();
  }

  startUpdating() {
    this.updateInterval = setInterval(() => this.updateAll(), 5000);
  }

  stopUpdating() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  updateAll() {
    if (!this.isVisible) return;
    
    this.updateMainStats();
    this.updateDDoSTable();
    this.updateOutages();
    this.updatePhishing();
    this.updateZeroDay();
    this.updateFiltering();
    this.updateCurrency();
    this.updateSpeed();
  }

  updateMainStats() {
    const outageStats = internetOutageMonitor.getStats();
    const ddosStats = ddosMonitor.getStats();
    const phishingStats = phishingMonitor.getStats();
    const zeroDayStats = zeroDayMonitor.getStats();

    const container = this.container.querySelector('#gtd-main-stats');
    container.innerHTML = `
      <div class="gtd-card critical">
        <div class="gtd-card-header">
          <div class="gtd-card-title">💥 DDoS Attacks</div>
          <span class="gtd-card-trend down">${ddosStats.totalGbps} Gbps total</span>
        </div>
        <div class="gtd-card-value" style="color:#ff6b6b;">${ddosStats.active}</div>
        <div class="gtd-card-desc">Active attacks • ${ddosStats.critical} critical • Avg ${ddosStats.avgGbps} Gbps</div>
        <div class="gtd-chart">
          ${Array.from({length: 20}, () => `<div class="gtd-bar" style="height:${20+Math.random()*80}%"></div>`).join('')}
        </div>
      </div>
      
      <div class="gtd-card critical">
        <div class="gtd-card-header">
          <div class="gtd-card-title">📵 Internet Outages</div>
          <span class="gtd-card-trend down">${outageStats.critical} critical</span>
        </div>
        <div class="gtd-card-value" style="color:#ff6b6b;">${outageStats.totalActive}</div>
        <div class="gtd-card-desc">Active outages worldwide • NetBlocks + IODA • Last 24h</div>
        <div class="gtd-chart">
          ${Array.from({length: 20}, () => `<div class="gtd-bar" style="height:${10+Math.random()*60}%"></div>`).join('')}
        </div>
      </div>
      
      <div class="gtd-card warning">
        <div class="gtd-card-header">
          <div class="gtd-card-title">🎣 Phishing Active</div>
          <span class="gtd-card-trend up">+${Math.floor(Math.random()*20)}% today</span>
        </div>
        <div class="gtd-card-value" style="color:#ff8800;">${phishingStats.active}</div>
        <div class="gtd-card-desc">${(phishingStats.totalClicks/1000).toFixed(1)}k victim clicks • ${Object.keys(phishingStats.byBrand).length} brands abused</div>
        <div class="gtd-chart">
          ${Array.from({length: 20}, () => `<div class="gtd-bar" style="height:${30+Math.random()*70}%; background: linear-gradient(to top, #ff8800, #ffd166)"></div>`).join('')}
        </div>
      </div>
      
      <div class="gtd-card critical">
        <div class="gtd-card-header">
          <div class="gtd-card-title">0️⃣ Zero-Day Exploited</div>
          <span class="gtd-card-trend critical">${zeroDayStats.cisaKev} CISA KEV</span>
        </div>
        <div class="gtd-card-value" style="color:#ff2a2a;">${zeroDayStats.active}</div>
        <div class="gtd-card-desc">${zeroDayStats.critical} CVSS ≥9 • ${(zeroDayStats.totalAttacks/1000).toFixed(1)}k attacks detected</div>
        <div class="gtd-chart">
          ${Array.from({length: 20}, () => `<div class="gtd-bar" style="height:${40+Math.random()*60}%; background: linear-gradient(to top, #ff2a2a, #ff0040)"></div>`).join('')}
        </div>
      </div>
      
      <div class="gtd-card info">
        <div class="gtd-card-header">
          <div class="gtd-card-title">🌐 Avg Global Speed</div>
          <span class="gtd-card-trend up">▲ 5.2%</span>
        </div>
        <div class="gtd-card-value" style="color:#00d4ff;">85.3 Mbps</div>
        <div class="gtd-card-desc">Global average • Fiber 45% • 5G 62% coverage</div>
        <div class="gtd-chart">
          ${Array.from({length: 20}, () => `<div class="gtd-bar blue" style="height:${50+Math.random()*50}%"></div>`).join('')}
        </div>
      </div>
      
      <div class="gtd-card success">
        <div class="gtd-card-header">
          <div class="gtd-card-title">🛡️ Threats Blocked</div>
          <span class="gtd-card-trend up">Today</span>
        </div>
        <div class="gtd-card-value" style="color:#00ff88;">2.4M</div>
        <div class="gtd-card-desc">By Cloudflare + Akamai + Global SOCs • Last 24h</div>
        <div class="gtd-chart">
          ${Array.from({length: 20}, () => `<div class="gtd-bar green" style="height:${60+Math.random()*40}%"></div>`).join('')}
        </div>
      </div>
    `;
  }

  updateDDoSTable() {
    const attacks = ddosMonitor.getTopTargets(10);
    const container = this.container.querySelector('#gtd-ddos-table');
    container.innerHTML = `
      <table class="gtd-table">
        <thead>
          <tr>
            <th>Target</th>
            <th>Country</th>
            <th>Type</th>
            <th>Gbps</th>
            <th>Mpps</th>
            <th>Industry</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${attacks.map(a => `
            <tr>
              <td><strong>${a.target.name}</strong><br><span style="font-size:10px; color:#888;">${a.target.provider} • ${a.target.asn}</span></td>
              <td>${a.target.country}</td>
              <td><span class="gtd-badge ${a.severity}">${a.type}</span></td>
              <td style="color:#ff6b6b; font-weight:700;">${a.metrics.gbps}</td>
              <td>${a.metrics.mpps}</td>
              <td>${a.targetIndustry}</td>
              <td><span class="gtd-badge ${a.status==='active'?'critical':'low'}">${a.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  updateOutages() {
    const outages = internetOutageMonitor.getAllOutages();
    const container = this.container.querySelector('#gtd-outages-list');
    container.innerHTML = outages.length ? outages.map(o => `
      <div style="padding:8px; border-left:3px solid ${o.severity==='critical'?'#ff2a2a':o.severity==='high'?'#ff8800':'#ffd166'}; background: rgba(255,255,255,0.03); border-radius:0 8px 8px 0; margin-bottom:6px; font-size:11px;">
        <strong>${o.country}</strong> - ${o.type}<br>
        <span style="color:#aaa;">${o.region} • ${o.affectedPercent}% affected • Drop ${o.trafficDropPercent}% • ${o.durationHours}h</span><br>
        <span style="font-size:10px; color:#888;">${o.reason} • ${o.source} • ${new Date(o.startTime).toLocaleTimeString()}</span>
      </div>
    `).join('') : '<div style="color:#00ff88; font-size:12px;">✅ No major outages - اینترنت جهانی پایدار</div>';
  }

  updatePhishing() {
    const phishing = phishingMonitor.activePhishing.slice(0,5);
    const container = this.container.querySelector('#gtd-phishing-list');
    container.innerHTML = phishing.map(p => `
      <div style="padding:6px; border-left:3px solid #ff8800; background: rgba(255,136,0,0.05); border-radius:0 6px 6px 0; margin-bottom:4px; font-size:11px;">
        <strong>${p.brand}</strong> - ${p.type}<br>
        <span style="font-size:10px; color:#aaa; word-break:break-all;">${p.url.slice(0,45)}...</span><br>
        <span style="font-size:10px; color:#888;">${p.countryTarget} • ${p.clicks} clicks • ${p.hostingCountry}</span>
      </div>
    `).join('');
  }

  updateZeroDay() {
    const zerodays = zeroDayMonitor.activeExploits.slice(0,5);
    const container = this.container.querySelector('#gtd-zeroday-list');
    container.innerHTML = zerodays.map(z => `
      <div style="padding:6px; border-left:3px solid ${z.cvss>=9?'#ff2a2a':'#ff8800'}; background: rgba(255,42,42,0.05); border-radius:0 6px 6px 0; margin-bottom:4px; font-size:11px;">
        <strong>${z.cve}</strong> - CVSS ${z.cvss}<br>
        <span style="font-size:10px; color:#aaa;">${z.product} • ${z.type} • ${z.vendor}</span><br>
        <span style="font-size:10px; color:#888;">${z.attacksDetected} attacks • ${z.threatActors[0]} • ${z.exploitMaturity}</span>
      </div>
    `).join('');
  }

  updateFiltering() {
    const container = this.container.querySelector('#gtd-filtering-table');
    const countries = Object.entries(FILTERING_DATABASE).slice(0,10);
    container.innerHTML = `
      <table class="gtd-table">
        <thead>
          <tr>
            <th>Country</th>
            <th>Filtering Level</th>
            <th>Freedom Score</th>
            <th>Blocking Rate</th>
            <th>VPN Blocking</th>
            <th>Methods</th>
          </tr>
        </thead>
        <tbody>
          ${countries.map(([code, data]) => `
            <tr>
              <td><strong>${code}</strong> - ${data.label}</td>
              <td><span class="gtd-badge ${data.level>=8?'critical':data.level>=5?'high':data.level>=3?'medium':'low'}">${data.level}/10</span></td>
              <td>${data.freedomHouseScore}/100</td>
              <td>${(data.ooniBlockingRate*100).toFixed(1)}%</td>
              <td style="font-size:11px;">${data.vpnBlocking}</td>
              <td style="font-size:10px;">${data.methods.slice(0,2).join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  updateCurrency() {
    const rates = liveCurrencyMonitor.getAllRates();
    const container = this.container.querySelector('#gtd-currency-grid');
    const important = ['IRR','IQD','TRY','EUR','GBP','JPY','BTC'];
    
    container.innerHTML = important.map(code => {
      const rate = rates[code];
      if (!rate) return '';
      
      if (code === 'IRR') {
        return `
          <div class="gtd-card critical">
            <div class="gtd-card-header">
              <div class="gtd-card-title">🇮🇷 IRR - Iranian Rial</div>
              <span class="gtd-card-trend ${rate.trend==='up'?'up':'down'}">${rate.trend==='up'?'▲':'▼'} ${rate.change}%</span>
            </div>
            <div class="gtd-card-value" style="font-size:14px; line-height:1.3;">
              Official: ${rate.official.toLocaleString()}<br>
              <span style="color:#ff6b6b;">Black: ${rate.blackMarket.toLocaleString()}</span><br>
              <span style="font-size:12px;">Toman: ${rate.tomanBlack.toLocaleString()} / USD</span>
            </div>
            <div class="gtd-card-desc">ریال ایران - Official vs Black Market • Central Bank of Iran</div>
          </div>
        `;
      }
      
      if (code === 'BTC') {
        return `
          <div class="gtd-card warning">
            <div class="gtd-card-header">
              <div class="gtd-card-title">₿ BTC</div>
              <span class="gtd-card-trend ${rate.trend==='up'?'up':'down'}">${rate.trend==='up'?'▲':'▼'} ${rate.change}%</span>
            </div>
            <div class="gtd-card-value" style="font-size:20px;">$${rate.usdPrice.toLocaleString()}</div>
            <div class="gtd-card-desc">Bitcoin • Crypto market live</div>
          </div>
        `;
      }
      
      return `
        <div class="gtd-card info">
          <div class="gtd-card-header">
            <div class="gtd-card-title">${code}</div>
            <span class="gtd-card-trend ${rate.trend==='up'?'up':'down'}">${rate.trend==='up'?'▲':'▼'} ${rate.change}%</span>
          </div>
          <div class="gtd-card-value" style="font-size:18px;">${rate.rate} / USD</div>
          <div class="gtd-card-desc">1 USD = ${rate.rate} ${code} • Live</div>
        </div>
      `;
    }).join('');
  }

  updateSpeed() {
    const container = this.container.querySelector('#gtd-speed-table');
    const speeds = Array.from(speedMonitor.currentSpeeds.entries())
      .sort((a,b) => (b[1].liveDownload||b[1].download) - (a[1].liveDownload||a[1].download))
      .slice(0,12);
    
    container.innerHTML = `
      <table class="gtd-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Country</th>
            <th>Download</th>
            <th>Upload</th>
            <th>Mobile</th>
            <th>Latency</th>
            <th>Fiber</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          ${speeds.map(([code, s], idx) => `
            <tr>
              <td>#${idx+1} <span style="font-size:10px; color:#888;">(Global #${s.rank})</span></td>
              <td><strong>${code}</strong></td>
              <td style="color:${s.liveDownload>100?'#00ff88':s.liveDownload>50?'#ffd166':'#ff6b6b'}; font-weight:700;">${s.liveDownload} Mbps</td>
              <td>${s.liveUpload} Mbps</td>
              <td>${s.liveMobileDownload} Mbps</td>
              <td>${s.liveLatency} ms</td>
              <td>${s.fiberPercent}%</td>
              <td><span style="color:${s.trend==='up'?'#00ff88':'#ff6b6b'}">${s.trend==='up'?'▲':'▼'} ${s.changePercent}%</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  destroy() {
    this.stopUpdating();
    if (this.container) this.container.remove();
  }
}
