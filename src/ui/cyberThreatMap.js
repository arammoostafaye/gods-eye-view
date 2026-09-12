/**
 * Cyber Threat Live Map - Personal Edition
 * Visualizes DDoS, Phishing, Zero-Day, Outages on globe
 */

import { ddosMonitor } from '../data/cyberIntelligence/ddosAttacks.js';
import { phishingMonitor, zeroDayMonitor } from '../data/cyberIntelligence/phishingAndZeroDay.js';
import { internetOutageMonitor } from '../data/cyberIntelligence/internetOutage.js';
import { speedMonitor } from '../data/cyberIntelligence/filteringAndSpeed.js';

export class CyberThreatMap {
  constructor(viewer) {
    this.viewer = viewer;
    this.entities = [];
    this.isActive = false;
    this.mode = 'ddos'; // ddos, phishing, zeroday, outage, speed
    this.container = null;
    this.createControlPanel();
  }

  createControlPanel() {
    const div = document.createElement('div');
    div.id = 'cyber-threat-control';
    div.innerHTML = `
      <style>
        #cyber-threat-control {
          position: fixed;
          top: 80px;
          left: 20px;
          width: 360px;
          background: rgba(8,12,20,0.96);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,42,42,0.25);
          border-radius: 16px;
          z-index: 998;
          font-family: 'Vazirmatn', sans-serif;
          color: #e0e0e0;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
          display: none;
          overflow: hidden;
        }
        #cyber-threat-control.active { display: block; }
        .ctc-header {
          background: linear-gradient(135deg, rgba(255,42,42,0.2), rgba(255,136,0,0.15));
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex; justify-content: space-between; align-items: center;
        }
        .ctc-header h3 { margin:0; font-size:14px; color:#fff; display:flex; align-items:center; gap:8px; }
        .ctc-live { display:flex; align-items:center; gap:6px; font-size:11px; color:#00ff88; }
        .ctc-live-dot { width:8px; height:8px; background:#ff2a2a; border-radius:50%; animation: pulseRed 1s infinite; }
        @keyframes pulseRed { 0%{box-shadow:0 0 0 0 rgba(255,42,42,0.7)} 70%{box-shadow:0 0 0 8px rgba(255,42,42,0)} 100%{box-shadow:0 0 0 0 rgba(255,42,42,0)} }
        .ctc-tabs { display:flex; background: rgba(0,0,0,0.3); padding: 6px; gap:4px; }
        .ctc-tab {
          flex:1; padding:8px 4px; border-radius:8px; border:1px solid transparent;
          background: rgba(255,255,255,0.05); color:#aaa; font-size:11px; font-weight:600;
          cursor:pointer; text-align:center; transition: all 0.2s;
        }
        .ctc-tab:hover { background: rgba(255,255,255,0.08); color:#fff; }
        .ctc-tab.active { background: rgba(255,42,42,0.2); border-color: rgba(255,42,42,0.4); color:#fff; }
        .ctc-body { padding: 14px 18px; max-height: 400px; overflow-y:auto; }
        .ctc-body::-webkit-scrollbar { width:4px; }
        .ctc-body::-webkit-scrollbar-thumb { background: rgba(255,42,42,0.3); border-radius:2px; }
        .ctc-stats { display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:14px; }
        .ctc-stat { background: rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:8px 10px; text-align:center; }
        .ctc-stat-val { font-size:18px; font-weight:800; color:#ff6b6b; }
        .ctc-stat-lbl { font-size:10px; color:#888; text-transform:uppercase; margin-top:2px; }
        .ctc-list { display:flex; flex-direction:column; gap:6px; }
        .ctc-item {
          background: rgba(255,255,255,0.03); border-left:3px solid #ff2a2a;
          padding:8px 10px; border-radius:0 8px 8px 0; font-size:11px; line-height:1.4;
          cursor:pointer; transition: all 0.2s;
        }
        .ctc-item:hover { background: rgba(255,42,42,0.08); transform: translateX(2px); }
        .ctc-item .meta { font-size:10px; color:#888; margin-top:3px; }
        .ctc-close { width:28px; height:28px; border-radius:6px; background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.1); color:#fff; cursor:pointer; }
      </style>
      <div class="ctc-header">
        <h3>🛡️ <span id="ctc-title">DDoS Live</span></h3>
        <div style="display:flex; align-items:center; gap:10px;">
          <div class="ctc-live"><div class="ctc-live-dot"></div> LIVE</div>
          <button class="ctc-close" id="ctc-close">✕</button>
        </div>
      </div>
      <div class="ctc-tabs">
        <button class="ctc-tab active" data-mode="ddos">💥 DDoS</button>
        <button class="ctc-tab" data-mode="outage">📵 Outage</button>
        <button class="ctc-tab" data-mode="phishing">🎣 Phish</button>
        <button class="ctc-tab" data-mode="zeroday">0️⃣ Zero-Day</button>
        <button class="ctc-tab" data-mode="speed">⚡ Speed</button>
      </div>
      <div class="ctc-body" id="ctc-body">
        <div class="ctc-stats" id="ctc-stats"></div>
        <div class="ctc-list" id="ctc-list"></div>
      </div>
    `;
    document.body.appendChild(div);
    this.container = div;

    div.querySelector('#ctc-close').onclick = () => this.hide();
    div.querySelectorAll('.ctc-tab').forEach(tab => {
      tab.onclick = () => {
        div.querySelectorAll('.ctc-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        this.mode = tab.dataset.mode;
        this.updateDisplay();
        this.visualize();
      };
    });
  }

  show() {
    this.container.classList.add('active');
    this.isActive = true;
    this.startMonitoring();
    this.visualize();
  }

  hide() {
    this.container.classList.remove('active');
    this.isActive = false;
    this.clearVisualization();
    this.stopMonitoring();
  }

  startMonitoring() {
    ddosMonitor.startMonitoring(15000);
    phishingMonitor.start(20000);
    zeroDayMonitor.start(60000);
    internetOutageMonitor.startMonitoring(30000);
    speedMonitor.start(10000);

    this.updateInterval = setInterval(() => this.updateDisplay(), 5000);
    this.updateDisplay();
  }

  stopMonitoring() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    // Keep monitors running for country panel, but we can leave them
  }

  updateDisplay() {
    if (!this.container.classList.contains('active')) return;

    const statsDiv = this.container.querySelector('#ctc-stats');
    const listDiv = this.container.querySelector('#ctc-list');
    const title = this.container.querySelector('#ctc-title');

    switch(this.mode) {
      case 'ddos': {
        const stats = ddosMonitor.getStats();
        title.textContent = `DDoS Live - ${stats.active} active`;
        statsDiv.innerHTML = `
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.active}</div><div class="ctc-stat-lbl">Active Attacks</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.totalGbps}</div><div class="ctc-stat-lbl">Total Gbps</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.critical}</div><div class="ctc-stat-lbl">Critical</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.avgGbps}</div><div class="ctc-stat-lbl">Avg Gbps</div></div>
        `;
        listDiv.innerHTML = ddosMonitor.getTopTargets(8).map(a => `
          <div class="ctc-item" data-lat="${a.target.lat}" data-lon="${a.target.lon}">
            <strong>${a.type}</strong> - ${a.metrics.gbps} Gbps → ${a.target.country}
            <div class="meta">${a.target.name} • ${a.target.provider} • ${a.targetIndustry}</div>
          </div>
        `).join('');
        break;
      }
      case 'outage': {
        const stats = internetOutageMonitor.getStats();
        const outages = internetOutageMonitor.getAllOutages();
        title.textContent = `Outages - ${stats.totalActive} active`;
        statsDiv.innerHTML = `
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.totalActive}</div><div class="ctc-stat-lbl">Active</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.critical}</div><div class="ctc-stat-lbl">Critical</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${Object.keys(stats.byType).length}</div><div class="ctc-stat-lbl">Types</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">📡</div><div class="ctc-stat-lbl">NetBlocks</div></div>
        `;
        listDiv.innerHTML = outages.map(o => `
          <div class="ctc-item" style="border-left-color:${o.severity==='critical'?'#ff2a2a':o.severity==='high'?'#ff8800':'#ffd166'}" data-lat="${o.lat}" data-lon="${o.lon}">
            <strong>${o.country}</strong> - ${o.type} - ${o.affectedPercent}% affected
            <div class="meta">${o.region} • Drop ${o.trafficDropPercent}% • ${o.durationHours}h • ${o.source}</div>
          </div>
        `).join('');
        break;
      }
      case 'phishing': {
        const stats = phishingMonitor.getStats();
        title.textContent = `Phishing Live - ${stats.active} active`;
        statsDiv.innerHTML = `
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.active}</div><div class="ctc-stat-lbl">Active URLs</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${(stats.totalClicks/1000).toFixed(1)}k</div><div class="ctc-stat-lbl">Victim Clicks</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${Object.keys(stats.byBrand).length}</div><div class="ctc-stat-lbl">Brands Abused</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">🎣</div><div class="ctc-stat-lbl">Live Feed</div></div>
        `;
        listDiv.innerHTML = phishingMonitor.activePhishing.slice(0,8).map(p => `
          <div class="ctc-item" style="border-left-color:#ff8800" data-lat="${p.lat}" data-lon="${p.lon}">
            <strong>${p.brand}</strong> - ${p.type}
            <div class="meta">${p.url.slice(0,50)}... • ${p.countryTarget} • ${p.clicks} clicks • ${p.reportedBy}</div>
          </div>
        `).join('');
        break;
      }
      case 'zeroday': {
        const stats = zeroDayMonitor.getStats();
        title.textContent = `Zero-Day - ${stats.active} exploited`;
        statsDiv.innerHTML = `
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.active}</div><div class="ctc-stat-lbl">In Wild</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.critical}</div><div class="ctc-stat-lbl">CVSS ≥9</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${stats.cisaKev}</div><div class="ctc-stat-lbl">CISA KEV</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${(stats.totalAttacks/1000).toFixed(1)}k</div><div class="ctc-stat-lbl">Attacks</div></div>
        `;
        listDiv.innerHTML = zeroDayMonitor.activeExploits.slice(0,8).map(z => `
          <div class="ctc-item" style="border-left-color:${z.cvss>=9?'#ff2a2a':'#ff8800'}" data-lat="${z.lat}" data-lon="${z.lon}">
            <strong>${z.cve}</strong> - ${z.product} - CVSS ${z.cvss}
            <div class="meta">${z.type} • ${z.vendor} • ${z.attacksDetected} attacks • ${z.exploitMaturity}</div>
          </div>
        `).join('');
        break;
      }
      case 'speed': {
        const speeds = Array.from(speedMonitor.currentSpeeds.entries()).slice(0,10);
        title.textContent = `Internet Speed Live`;
        statsDiv.innerHTML = `
          <div class="ctc-stat"><div class="ctc-stat-val">⚡</div><div class="ctc-stat-lbl">Live Monitor</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">${speeds.length}</div><div class="ctc-stat-lbl">Countries</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">📶</div><div class="ctc-stat-lbl">Ookla Data</div></div>
          <div class="ctc-stat"><div class="ctc-stat-val">🌐</div><div class="ctc-stat-lbl">Real-time</div></div>
        `;
        listDiv.innerHTML = speeds.map(([code, s]) => `
          <div class="ctc-item" style="border-left-color:#00d4ff">
            <strong>${code}</strong> - ${s.liveDownload} Mbps ↓ / ${s.liveUpload} Mbps ↑
            <div class="meta">Mobile ${s.liveMobileDownload} Mbps • Latency ${s.liveLatency}ms • Rank #${s.rank} • ${s.trend==='up'?'▲':'▼'} ${s.changePercent}%</div>
          </div>
        `).join('');
        break;
      }
    }

    // Click to fly
    listDiv.querySelectorAll('.ctc-item').forEach(item => {
      item.onclick = () => {
        const lat = parseFloat(item.dataset.lat);
        const lon = parseFloat(item.dataset.lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1000000),
            duration: 1.5
          });
        }
      };
    });
  }

  visualize() {
    this.clearVisualization();
    
    const addBillboard = (lat, lon, color, scale, label) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
      const entity = this.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 10000),
        billboard: {
          image: this.createCircleImage(color),
          scale: scale,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: label ? {
          text: label,
          font: '11px monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -30),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        } : undefined
      });
      this.entities.push(entity);
    };

    const addLine = (lat1, lon1, lat2, lon2, color) => {
      const entity = this.viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([lon1, lat1, lon2, lat2]),
          width: 2,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            color: color
          }),
          arcType: Cesium.ArcType.GEODESIC
        }
      });
      this.entities.push(entity);
    };

    switch(this.mode) {
      case 'ddos':
        ddosMonitor.activeAttacks.forEach(attack => {
          const intensity = Math.min(1, attack.metrics.gbps / 300);
          const color = intensity > 0.7 ? Cesium.Color.RED : intensity > 0.4 ? Cesium.Color.ORANGE : Cesium.Color.YELLOW;
          addBillboard(attack.target.lat, attack.target.lon, color, 0.5 + intensity, `${attack.metrics.gbps} Gbps`);
          addLine(attack.source.lat, attack.source.lon, attack.target.lat, attack.target.lon, color.withAlpha(0.6));
        });
        break;
      case 'outage':
        internetOutageMonitor.getAllOutages().forEach(outage => {
          const color = outage.severity === 'critical' ? Cesium.Color.RED : outage.severity === 'high' ? Cesium.Color.ORANGE : Cesium.Color.YELLOW;
          addBillboard(outage.lat, outage.lon, color, 0.8, `${outage.country} ${outage.affectedPercent}%`);
        });
        break;
      case 'phishing':
        phishingMonitor.activePhishing.slice(0,20).forEach(p => {
          addBillboard(p.lat, p.lon, Cesium.Color.ORANGE, 0.4, p.brand);
        });
        break;
      case 'zeroday':
        zeroDayMonitor.activeExploits.forEach(z => {
          const color = z.cvss >= 9 ? Cesium.Color.RED : Cesium.Color.ORANGE;
          addBillboard(z.lat, z.lon, color, 0.6, z.cve);
        });
        break;
      case 'speed':
        Array.from(speedMonitor.currentSpeeds.entries()).forEach(([code, s]) => {
          // Find country lat/lon from database
          const lat = 20 + Math.random()*50; // placeholder, should use real coords
          const lon = -100 + Math.random()*200;
          const speedColor = s.liveDownload > 100 ? Cesium.Color.GREEN : s.liveDownload > 50 ? Cesium.Color.YELLOW : Cesium.Color.RED;
          // addBillboard(lat, lon, speedColor, 0.3, `${code} ${s.liveDownload}Mbps`);
        });
        break;
    }
  }

  createCircleImage(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${Math.floor(color.red*255)},${Math.floor(color.green*255)},${Math.floor(color.blue*255)},0.8)`;
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,0.8)`;
    ctx.lineWidth = 2;
    ctx.stroke();
    return canvas;
  }

  clearVisualization() {
    this.entities.forEach(e => this.viewer.entities.remove(e));
    this.entities = [];
  }

  destroy() {
    this.clearVisualization();
    if (this.container) this.container.remove();
    if (this.updateInterval) clearInterval(this.updateInterval);
  }
}
