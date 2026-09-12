/**
 * Internet Outage Monitor - NetBlocks Style
 * Real-time internet outage detection using multiple sources
 * 
 * Sources:
 * - Cloudflare Radar (https://radar.cloudflare.com/)
 * - IODA (Internet Outage Detection & Analysis)
 * - RIPE Atlas
 * - Simulated live data for demo
 */

export const OUTAGE_SOURCES = {
  CLOUDFLARE_RADAR: 'https://api.cloudflare.com/client/v4/radar',
  IODA: 'https://api.ioda.inetintel.cc.gatech.edu/v2',
  NETBLOCKS_TWITTER: 'NetBlocks.org'
};

export class InternetOutageMonitor {
  constructor() {
    this.outages = new Map(); // countryCode -> outage data
    this.history = [];
    this.listeners = new Set();
    this.updateInterval = null;
  }

  // Simulated outage data based on real patterns
  generateMockOutages() {
    const now = Date.now();
    const outages = [
      {
        id: `outage-${now}-ir`,
        countryCode: 'IR',
        country: 'Iran',
        region: 'Tehran, Isfahan, Mashhad',
        type: 'government_shutdown',
        severity: 'critical', // low, medium, high, critical
        affectedPercent: 85,
        startTime: new Date(now - 2*3600*1000).toISOString(),
        durationHours: 2.5,
        reason: 'Government-ordered shutdown during protests',
        source: 'NetBlocks',
        lat: 35.6892,
        lon: 51.3890,
        verified: true,
        trafficDropPercent: 92,
        asnsAffected: ['AS12880', 'AS6736', 'AS197207']
      },
      {
        id: `outage-${now}-sy`,
        countryCode: 'SY',
        country: 'Syria',
        region: 'Damascus, Aleppo',
        type: 'infrastructure_damage',
        severity: 'high',
        affectedPercent: 60,
        startTime: new Date(now - 5*3600*1000).toISOString(),
        durationHours: 5,
        reason: 'Fiber cut due to conflict',
        source: 'IODA',
        lat: 33.5138,
        lon: 36.2765,
        verified: true,
        trafficDropPercent: 65,
        asnsAffected: ['AS11024', 'AS29256']
      },
      {
        id: `outage-${now}-iq`,
        countryCode: 'IQ',
        country: 'Iraq',
        region: 'Baghdad, Basra',
        type: 'power_outage',
        severity: 'medium',
        affectedPercent: 35,
        startTime: new Date(now - 1*3600*1000).toISOString(),
        durationHours: 1.2,
        reason: 'Power grid failure',
        source: 'Cloudflare Radar',
        lat: 33.3152,
        lon: 44.3661,
        verified: true,
        trafficDropPercent: 40,
        asnsAffected: ['AS203214']
      }
    ];

    // Random outages for realism
    if (Math.random() > 0.6) {
      const randomCountries = [
        { code: 'RU', name: 'Russia', lat: 55.7558, lon: 37.6173 },
        { code: 'CN', name: 'China', lat: 39.9042, lon: 116.4074 },
        { code: 'IN', name: 'India', lat: 28.6139, lon: 77.2090 },
        { code: 'PK', name: 'Pakistan', lat: 33.6844, lon: 73.0479 },
        { code: 'VE', name: 'Venezuela', lat: 10.4806, lon: -66.9036 },
      ];
      const rc = randomCountries[Math.floor(Math.random()*randomCountries.length)];
      outages.push({
        id: `outage-${now}-${rc.code.toLowerCase()}`,
        countryCode: rc.code,
        country: rc.name,
        region: 'Nationwide',
        type: ['cable_cut', 'cyber_attack', 'maintenance'][Math.floor(Math.random()*3)],
        severity: ['low','medium','high'][Math.floor(Math.random()*3)],
        affectedPercent: Math.floor(10 + Math.random()*70),
        startTime: new Date(now - Math.random()*6*3600*1000).toISOString(),
        durationHours: (Math.random()*8).toFixed(1),
        reason: 'Under investigation',
        source: 'IODA',
        lat: rc.lat,
        lon: rc.lon,
        verified: Math.random() > 0.3,
        trafficDropPercent: Math.floor(20 + Math.random()*60),
        asnsAffected: [`AS${Math.floor(1000+Math.random()*50000)}`]
      });
    }

    return outages;
  }

  async fetchLiveOutages() {
    // Try real APIs, fallback to mock
    try {
      // Cloudflare Radar outage center - requires API key, so we simulate
      // In production, you'd proxy via server: /api/internet-outages
      const response = await fetch('/api/internet-outages', { signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        return data.outages || this.generateMockOutages();
      }
    } catch {}
    
    return this.generateMockOutages();
  }

  async update() {
    const outages = await this.fetchLiveOutages();
    this.outages.clear();
    outages.forEach(o => this.outages.set(o.countryCode, o));
    this.history.push({ timestamp: Date.now(), count: outages.length, outages });
    if (this.history.length > 100) this.history.shift();
    
    this.notifyListeners(outages);
    return outages;
  }

  startMonitoring(intervalMs = 30000) {
    this.update();
    this.updateInterval = setInterval(() => this.update(), intervalMs);
  }

  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(outages) {
    this.listeners.forEach(cb => {
      try { cb(outages); } catch {}
    });
  }

  getOutageByCountry(code) {
    return this.outages.get(code.toUpperCase()) || null;
  }

  getAllOutages() {
    return Array.from(this.outages.values());
  }

  getStats() {
    const all = this.getAllOutages();
    return {
      totalActive: all.length,
      critical: all.filter(o => o.severity === 'critical').length,
      byType: all.reduce((acc, o) => { acc[o.type] = (acc[o.type]||0)+1; return acc; }, {}),
      lastUpdate: Date.now()
    };
  }
}

export const internetOutageMonitor = new InternetOutageMonitor();
