/**
 * Country Intelligence Panel - Personal Edition
 * Shows comprehensive country info on click/selection
 * 
 * Features:
 * - Area, population, birth/death, languages, dialects
 * - Economic rank, currency vs USD
 * - Internet filtering, speed, outages
 * - Cyber vulnerabilities
 * - Live stats
 */

import { getCountryByCode, getCountryByLatLon, formatCurrencyVsUSD } from '../data/countryIntelligence/countryDatabase.js';
import { getFilteringByCountry, getSpeedByCountry, getVulnerabilityByCountry, speedMonitor } from '../data/cyberIntelligence/filteringAndSpeed.js';
import { internetOutageMonitor } from '../data/cyberIntelligence/internetOutage.js';
import { ddosMonitor } from '../data/cyberIntelligence/ddosAttacks.js';
import { phishingMonitor, zeroDayMonitor } from '../data/cyberIntelligence/phishingAndZeroDay.js';
import { liveCurrencyMonitor } from '../data/cyberIntelligence/liveCurrency.js';

export class CountryInfoPanel {
  constructor(viewer) {
    this.viewer = viewer;
    this.currentCountry = null;
    this.container = null;
    this.createPanel();
    this.attachEvents();
  }

  createPanel() {
    const div = document.createElement('div');
    div.id = 'country-intel-panel';
    div.innerHTML = `
      <style>
        #country-intel-panel {
          position: fixed;
          top: 80px;
          right: 20px;
          width: 420px;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          background: rgba(8,12,20,0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 16px;
          z-index: 999;
          font-family: 'Vazirmatn', 'Segoe UI', sans-serif;
          color: #e0e0e0;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.1);
          display: none;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        #country-intel-panel.active { display: block; }
        #country-intel-panel::-webkit-scrollbar { width: 6px; }
        #country-intel-panel::-webkit-scrollbar-thumb { background: rgba(0,212,255,0.3); border-radius: 3px; }
        
        .cip-header {
          position: sticky;
          top: 0;
          background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(255,42,42,0.15));
          backdrop-filter: blur(20px);
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px 16px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1;
        }
        .cip-flag { font-size: 32px; margin-right: 12px; }
        .cip-title { flex: 1; }
        .cip-title h2 { margin: 0; font-size: 20px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
        .cip-title .native { font-size: 13px; color: #00d4ff; margin-top: 2px; direction: rtl; }
        .cip-close {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;
        }
        .cip-close:hover { background: rgba(255,42,42,0.2); border-color: #ff2a2a; }
        
        .cip-body { padding: 16px 20px; }
        .cip-section { margin-bottom: 20px; }
        .cip-section-title {
          font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px;
          color: #00d4ff; margin-bottom: 10px; font-weight: 700;
          display: flex; align-items: center; gap: 6px;
          border-bottom: 1px solid rgba(0,212,255,0.15); padding-bottom: 6px;
        }
        .cip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cip-stat {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding: 10px 12px;
        }
        .cip-stat-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
        .cip-stat-value { font-size: 14px; font-weight: 600; color: #fff; line-height: 1.3; }
        .cip-stat-value.small { font-size: 12px; }
        .cip-stat-value.negative { color: #ff6b6b; }
        .cip-stat-value.positive { color: #00ff88; }
        .cip-full { grid-column: 1 / -1; }
        
        .cip-list { display: flex; flex-direction: column; gap: 6px; }
        .cip-list-item {
          background: rgba(255,255,255,0.03); border-left: 3px solid rgba(0,212,255,0.5);
          padding: 8px 10px; border-radius: 0 8px 8px 0; font-size: 12px; line-height: 1.4;
        }
        .cip-list-item.kurdish { border-left-color: #ff2a2a; background: rgba(255,42,42,0.08); }
        .cip-list-item.persian { border-left-color: #00ff88; background: rgba(0,255,136,0.08); }
        
        .cip-badge {
          display: inline-block; padding: 2px 8px; border-radius: 12px;
          font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .cip-badge.critical { background: rgba(255,42,42,0.2); color: #ff6b6b; border: 1px solid rgba(255,42,42,0.3); }
        .cip-badge.high { background: rgba(255,136,0,0.2); color: #ffaa44; border: 1px solid rgba(255,136,0,0.3); }
        .cip-badge.medium { background: rgba(255,209,102,0.2); color: #ffd166; border: 1px solid rgba(255,209,102,0.3); }
        .cip-badge.low { background: rgba(0,255,136,0.15); color: #00ff88; border: 1px solid rgba(0,255,136,0.2); }
        .cip-badge.filtered-9 { background: #ff2a2a; color: white; }
        .cip-badge.filtered-10 { background: #000; color: #ff2a2a; border: 1px solid #ff2a2a; }
        
        .cip-threat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
        .cip-threat {
          background: linear-gradient(135deg, rgba(255,42,42,0.1), rgba(255,42,42,0.05));
          border: 1px solid rgba(255,42,42,0.2); border-radius: 8px; padding: 8px; text-align: center;
        }
        .cip-threat-count { font-size: 20px; font-weight: 800; color: #ff6b6b; }
        .cip-threat-label { font-size: 10px; color: #aaa; text-transform: uppercase; }
        
        .cip-progress { height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-top: 6px; }
        .cip-progress-bar { height: 100%; background: linear-gradient(90deg, #00d4ff, #00ff88); border-radius: 3px; transition: width 0.5s ease; }
        .cip-progress-bar.danger { background: linear-gradient(90deg, #ff2a2a, #ff8800); }
        
        .cip-live-dot {
          width: 8px; height: 8px; background: #00ff88; border-radius: 50%;
          display: inline-block; margin-right: 6px; animation: livePulse 1.5s infinite;
        }
        @keyframes livePulse {
          0% { box-shadow: 0 0 0 0 rgba(0,255,136,0.7); }
          70% { box-shadow: 0 0 0 6px rgba(0,255,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,255,136,0); }
        }
        .cip-live-dot.critical { background: #ff2a2a; animation: livePulseCritical 1s infinite; }
        @keyframes livePulseCritical {
          0% { box-shadow: 0 0 0 0 rgba(255,42,42,0.7); }
          70% { box-shadow: 0 0 0 8px rgba(255,42,42,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,42,42,0); }
        }
        
        .cip-actions { display: flex; gap: 8px; margin-top: 16px; }
        .cip-action-btn {
          flex: 1; padding: 10px; border-radius: 10px; border: 1px solid rgba(0,212,255,0.3);
          background: rgba(0,212,255,0.1); color: #00d4ff; font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s; text-align: center;
        }
        .cip-action-btn:hover { background: rgba(0,212,255,0.2); transform: translateY(-1px); }
        .cip-action-btn.primary { background: #00d4ff; color: #000; border-color: #00d4ff; }
        .cip-action-btn.danger { border-color: rgba(255,42,42,0.4); background: rgba(255,42,42,0.15); color: #ff6b6b; }
      </style>
      
      <div class="cip-header">
        <div style="display:flex; align-items:center;">
          <span class="cip-flag" id="cip-flag">🌍</span>
          <div class="cip-title">
            <h2 id="cip-name">Select a Country</h2>
            <div class="native" id="cip-native">Click on map - روی نقشه کلیک کنید</div>
          </div>
        </div>
        <button class="cip-close" id="cip-close">✕</button>
      </div>
      
      <div class="cip-body" id="cip-body">
        <div style="text-align:center; padding: 40px 20px; color: #666;">
          <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
          <div style="font-size: 14px; line-height: 1.5;">
            Click anywhere on the globe to see detailed country intelligence<br>
            <span style="font-size: 12px; color: #888; direction: rtl;">روی هر کشور کلیک کنید تا اطلاعات کامل را ببینید</span>
          </div>
          <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; text-align: left;">
            <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; font-size: 11px;">
              <div style="color: #00d4ff;">📊 Demographics</div>
              <div style="color: #888; margin-top: 4px;">Population, birth/death, area</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; font-size: 11px;">
              <div style="color: #00ff88;">💰 Economy</div>
              <div style="color: #888; margin-top: 4px;">GDP rank, currency vs USD</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; font-size: 11px;">
              <div style="color: #ff2a2a;">🌐 Internet</div>
              <div style="color: #888; margin-top: 4px;">Filtering, speed, outages</div>
            </div>
            <div style="background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; font-size: 11px;">
              <div style="color: #ff8800;">🛡️ Cyber</div>
              <div style="color: #888; margin-top: 4px;">DDoS, phishing, zero-day</div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(div);
    this.container = div;

    div.querySelector('#cip-close').onclick = () => this.hide();
  }

  attachEvents() {
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.container.classList.contains('active')) {
        this.hide();
      }
    });
  }

  showCountry(countryCode, latlon = null) {
    const country = getCountryByCode(countryCode) || (latlon ? getCountryByLatLon(latlon.lat, latlon.lon) : null);
    if (!country) {
      this.showUnknownLocation(latlon);
      return;
    }

    this.currentCountry = country;
    const filtering = getFilteringByCountry(country.iso2);
    const speed = speedMonitor.getByCountry(country.iso2);
    const vuln = getVulnerabilityByCountry(country.iso2);
    const outage = internetOutageMonitor.getOutageByCountry(country.iso2);
    const ddosAttacks = ddosMonitor.getAttacksByCountry(country.iso2);
    const phishingStats = phishingMonitor.getStats();
    const zeroDayStats = zeroDayMonitor.getStats();
    const liveRate = liveCurrencyMonitor.getRate(country.currency.code) || null;
    const iranLive = country.iso2 === 'IR' ? liveCurrencyMonitor.formatIranCurrency() : null;

    const flag = country.flag || '🏳️';
    const nativeName = country.name.fa || country.name.ku || country.name.en;

    this.container.querySelector('#cip-flag').textContent = flag;
    this.container.querySelector('#cip-name').innerHTML = `${country.name.en} <span style="font-size:12px; color:#888;">${country.iso2}</span>`;
    this.container.querySelector('#cip-native').textContent = `${nativeName} - ${country.name.ku || ''} - ${country.capital.en}`;

    const body = this.container.querySelector('#cip-body');
    body.innerHTML = `
      <!-- Demographics -->
      <div class="cip-section">
        <div class="cip-section-title">📊 Demographics - جمعیت و مساحت</div>
        <div class="cip-grid">
          <div class="cip-stat">
            <div class="cip-stat-label">Area - مساحت</div>
            <div class="cip-stat-value">${country.areaKm2.toLocaleString()} km²</div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">Population - جمعیت</div>
            <div class="cip-stat-value">${(country.population/1000000).toFixed(1)}M (${country.populationYear})</div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">Births / Day - زاد و ولد روزانه</div>
            <div class="cip-stat-value positive">+${country.birthCountPerDay.toLocaleString()} <span style="font-size:10px; color:#888;">${country.birthRate}/1000</span></div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">Deaths / Day - مرگ و میر روزانه</div>
            <div class="cip-stat-value negative">-${country.deathCountPerDay.toLocaleString()} <span style="font-size:10px; color:#888;">${country.deathRate}/1000</span></div>
          </div>
          <div class="cip-stat cip-full">
            <div class="cip-stat-label">Growth - رشد</div>
            <div class="cip-stat-value">${((country.birthRate - country.deathRate)/10).toFixed(2)}% annual <span style="font-size:11px; color:#888;">Net +${(country.birthCountPerDay - country.deathCountPerDay).toLocaleString()}/day</span></div>
            <div class="cip-progress"><div class="cip-progress-bar" style="width:${Math.min(100, (country.population/200000000)*100)}%"></div></div>
          </div>
        </div>
      </div>

      <!-- Languages -->
      <div class="cip-section">
        <div class="cip-section-title">🗣️ Languages - زبان‌ها</div>
        <div class="cip-list">
          ${country.officialLanguages.map(l => `
            <div class="cip-list-item"><strong>${l.name.en}</strong> - ${l.name.fa || ''} ${l.name.ku ? '/ '+l.name.ku : ''} <span class="cip-badge low">Official</span></div>
          `).join('')}
          ${country.localDialects.slice(0,6).map(d => `
            <div class="cip-list-item ${d.name.en.toLowerCase().includes('kurd') ? 'kurdish' : d.name.en.toLowerCase().includes('persian')||d.name.en.toLowerCase().includes('farsi') ? 'persian' : ''}">
              <strong>${d.name.en}</strong> ${d.name.fa ? '- '+d.name.fa : ''}<br>
              <span style="font-size:11px; color:#aaa;">📍 ${d.region} • 👥 ${d.speakers ? (d.speakers/1000000).toFixed(1)+'M speakers' : ''}</span>
            </div>
          `).join('')}
          ${country.localDialects.length > 6 ? `<div style="font-size:11px; color:#666; text-align:center; margin-top:4px;">+${country.localDialects.length-6} more dialects</div>` : ''}
        </div>
      </div>

      <!-- Economy -->
      <div class="cip-section">
        <div class="cip-section-title">💰 Economy - اقتصاد</div>
        <div class="cip-grid">
          <div class="cip-stat">
            <div class="cip-stat-label">GDP Rank - رتبه جهانی</div>
            <div class="cip-stat-value">#${country.gdpRank} <span style="font-size:11px; color:#888;">${country.economicRankDesc}</span></div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">GDP Nominal</div>
            <div class="cip-stat-value">$${country.gdpNominalBillionUSD}B</div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">GDP Per Capita</div>
            <div class="cip-stat-value">$${country.gdpPerCapitaUSD.toLocaleString()}</div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">Currency - پول</div>
            <div class="cip-stat-value small">${country.currency.code} ${country.currency.symbol}</div>
          </div>
          <div class="cip-stat cip-full">
            <div class="cip-stat-label">Exchange Rate vs USD - نرخ به دلار <span class="cip-live-dot" style="width:6px; height:6px;"></span> LIVE</div>
            <div class="cip-stat-value small" style="line-height:1.4;">
              ${iranLive ? `
                <div style="background: rgba(255,42,42,0.1); padding:6px; border-radius:6px; margin-bottom:4px;">
                  <strong>🇮🇷 ${iranLive.official}</strong><br>
                  <strong style="color:#ff6b6b;">${iranLive.blackMarket}</strong>
                  <span style="font-size:10px; color:${iranLive.trend==='up'?'#00ff88':'#ff6b6b'}"> ${iranLive.trend==='up'?'▲':'▼'} ${iranLive.change}%</span>
                </div>
              ` : ''}
              ${formatCurrencyVsUSD(country)}
              ${liveRate ? `<br><span style="color:#00d4ff;">LIVE: 1 USD = ${liveRate.rate} ${country.currency.code} <span style="font-size:10px; color:${liveRate.trend==='up'?'#00ff88':'#ff6b6b'}">${liveRate.trend==='up'?'▲':'▼'} ${liveRate.change}%</span></span>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Internet -->
      <div class="cip-section">
        <div class="cip-section-title"><span class="cip-live-dot"></span> Internet Intelligence - اینترنت</div>
        <div class="cip-grid">
          <div class="cip-stat">
            <div class="cip-stat-label">Filtering Level - سطح فیلترینگ</div>
            <div class="cip-stat-value"><span class="cip-badge filtered-${filtering.level}">${filtering.level}/10 ${filtering.label}</span></div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">Freedom House</div>
            <div class="cip-stat-value">${filtering.freedomHouseScore}/100 <span style="font-size:10px;">${filtering.freedomHouseScore < 30 ? 'Not Free' : filtering.freedomHouseScore < 60 ? 'Partly Free' : 'Free'}</span></div>
            <div class="cip-progress"><div class="cip-progress-bar ${filtering.freedomHouseScore < 30 ? 'danger' : ''}" style="width:${filtering.freedomHouseScore}%"></div></div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">Download Speed - سرعت دانلود</div>
            <div class="cip-stat-value">${speed.liveDownload || speed.download} Mbps <span style="font-size:10px; color:${speed.trend==='up'?'#00ff88':'#ff6b6b'}">${speed.trend==='up'?'▲':'▼'} ${speed.changePercent}%</span></div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">Upload / Latency</div>
            <div class="cip-stat-value small">${speed.liveUpload || speed.upload} Mbps / ${speed.liveLatency || speed.latency}ms</div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">Mobile Speed</div>
            <div class="cip-stat-value">${speed.liveMobileDownload || speed.mobileDownload} Mbps</div>
          </div>
          <div class="cip-stat">
            <div class="cip-stat-label">World Rank - رتبه جهانی</div>
            <div class="cip-stat-value">#${speed.rank} <span style="font-size:10px; color:#888;">Fiber ${speed.fiberPercent}%</span></div>
          </div>
          ${outage ? `
          <div class="cip-stat cip-full" style="border: 1px solid rgba(255,42,42,0.4); background: rgba(255,42,42,0.1);">
            <div class="cip-stat-label"><span class="cip-live-dot critical"></span> LIVE OUTAGE - قطعی زنده!</div>
            <div class="cip-stat-value small" style="color:#ff6b6b;">
              ${outage.type} - ${outage.affectedPercent}% affected<br>
              ${outage.region} - ${outage.reason}<br>
              Traffic drop: ${outage.trafficDropPercent}% - ${outage.durationHours}h
            </div>
          </div>
          ` : `
          <div class="cip-stat cip-full" style="border: 1px solid rgba(0,255,136,0.2);">
            <div class="cip-stat-label">✅ Internet Status</div>
            <div class="cip-stat-value small" style="color:#00ff88;">No active outage detected - اینترنت پایدار</div>
          </div>
          `}
        </div>
        <div style="margin-top:10px; font-size:11px; color:#888; line-height:1.4;">
          <strong>Blocked:</strong> ${filtering.blockedSites.slice(0,4).join(', ')}<br>
          <strong>Methods:</strong> ${filtering.methods.slice(0,3).join(', ')}
        </div>
      </div>

      <!-- Cyber Threats -->
      <div class="cip-section">
        <div class="cip-section-title"><span class="cip-live-dot critical"></span> Cyber Threats - تهدیدات سایبری</div>
        
        <div class="cip-threat-grid">
          <div class="cip-threat">
            <div class="cip-threat-count">${ddosAttacks.length}</div>
            <div class="cip-threat-label">Active DDoS</div>
          </div>
          <div class="cip-threat">
            <div class="cip-threat-count">${phishingStats.byCountry?.[country.iso2] || 0}</div>
            <div class="cip-threat-label">Phishing targeting</div>
          </div>
          <div class="cip-threat">
            <div class="cip-threat-count">${vuln.score}</div>
            <div class="cip-threat-label">Vuln Score /10</div>
          </div>
          <div class="cip-threat">
            <div class="cip-threat-count">${zeroDayStats.active}</div>
            <div class="cip-threat-label">Zero-Day active</div>
          </div>
        </div>

        <div style="margin-top:12px;">
          <div class="cip-stat-label">Vulnerability - آسیب پذیری</div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
            <span class="cip-badge ${vuln.level.toLowerCase().includes('critical') ? 'critical' : vuln.level.toLowerCase().includes('high') ? 'high' : vuln.level.toLowerCase().includes('medium') ? 'medium' : 'low'}">${vuln.level}</span>
            <span style="font-size:11px; color:#aaa;">Unpatched: ${(vuln.unpatchedRate*100).toFixed(0)}% • Infra risk: ${vuln.criticalInfraRisk}</span>
          </div>
          <div class="cip-progress"><div class="cip-progress-bar danger" style="width:${vuln.score*10}%"></div></div>
          <div style="font-size:11px; color:#888; margin-top:6px; line-height:1.4;">
            <strong>Reasons:</strong> ${vuln.reasons.join(', ')}<br>
            <strong>Top APTs:</strong> ${vuln.topThreats.join(', ')}
          </div>
        </div>

        ${ddosAttacks.length > 0 ? `
        <div style="margin-top:12px;">
          <div class="cip-stat-label">🔥 Live DDoS on this country - حملات دیداس فعال</div>
          <div class="cip-list" style="margin-top:6px;">
            ${ddosAttacks.slice(0,3).map(a => `
              <div class="cip-list-item" style="border-left-color:#ff2a2a;">
                <strong>${a.type}</strong> - ${a.metrics.gbps} Gbps / ${a.metrics.mpps} Mpps<br>
                <span style="font-size:11px; color:#aaa;">${a.target.name} • ${a.targetIndustry} • ${a.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>

      <div class="cip-actions">
        <button class="cip-action-btn primary" id="cip-fly">✈️ Fly Here</button>
        <button class="cip-action-btn" id="cip-cctv">📹 Traffic Cams</button>
        <button class="cip-action-btn danger" id="cip-threats">🛡️ Threat Map</button>
      </div>

      <div style="text-align:center; margin-top:16px; font-size:10px; color:#555;">
        Data: World Bank, REST Countries, Cloudflare Radar, NetBlocks, Abuse.ch, CISA KEV, OONI<br>
        Live updates every 15-30s • Last: ${new Date().toLocaleTimeString()}
      </div>
    `;

    // Actions
    body.querySelector('#cip-fly')?.addEventListener('click', () => {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(country.lon, country.lat, 2000000),
        duration: 2
      });
    });

    body.querySelector('#cip-cctv')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('gev:toggle-layer', { detail: { layer: 'cctv', enabled: true }}));
      window.dispatchEvent(new CustomEvent('gev:fly-to-city', { detail: { city: country.iso2.toLowerCase() }}));
    });

    body.querySelector('#cip-threats')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('gev:show-cyber-threats', { detail: { country: country.iso2 }}));
    });

    this.show();
  }

  showUnknownLocation(latlon) {
    this.container.querySelector('#cip-flag').textContent = '🌊';
    this.container.querySelector('#cip-name').textContent = latlon ? `${latlon.lat.toFixed(2)}, ${latlon.lon.toFixed(2)}` : 'Ocean / Unknown';
    this.container.querySelector('#cip-native').textContent = 'Open ocean or unmapped region';

    const body = this.container.querySelector('#cip-body');
    body.innerHTML = `
      <div style="text-align:center; padding:20px; color:#888;">
        <div style="font-size:32px; margin-bottom:12px;">🌊</div>
        <div>No country data for this location.<br>Try clicking on land.</div>
        ${latlon ? `<div style="margin-top:12px; font-family:monospace; font-size:12px; background: rgba(255,255,255,0.05); padding:8px; border-radius:6px;">Lat: ${latlon.lat.toFixed(4)}<br>Lon: ${latlon.lon.toFixed(4)}</div>` : ''}
        <div class="cip-actions" style="margin-top:16px;">
          <button class="cip-action-btn primary" onclick="document.getElementById('country-intel-panel').classList.remove('active')">Close</button>
        </div>
      </div>
    `;
    this.show();
  }

  show() {
    this.container.classList.add('active');
  }

  hide() {
    this.container.classList.remove('active');
  }

  destroy() {
    if (this.container) this.container.remove();
  }
}
