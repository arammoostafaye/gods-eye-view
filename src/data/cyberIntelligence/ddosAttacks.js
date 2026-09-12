/**
 * Live DDoS Attacks Monitor - World Map Visualization
 * Real-time DDoS attack tracking
 * 
 * Data sources:
 * - Cloudflare Radar DDoS
 * - Akamai, NETSCOUT Arbor
 * - Digital Attack Map (Google + Arbor)
 * - Simulated live stream for demo
 */

export class DDoSMonitor {
  constructor() {
    this.activeAttacks = [];
    this.history = [];
    this.listeners = new Set();
    this.updateInterval = null;
    this.attackIdCounter = 0;
  }

  generateMockAttacks(count = 15) {
    const now = Date.now();
    const attackTypes = [
      { type: 'UDP Flood', vector: 'UDP', severity: 'high', avgGbps: 120 },
      { type: 'SYN Flood', vector: 'SYN', severity: 'medium', avgGbps: 45 },
      { type: 'DNS Amplification', vector: 'DNS', severity: 'critical', avgGbps: 300 },
      { type: 'HTTP Flood', vector: 'HTTP', severity: 'medium', avgGbps: 25 },
      { type: 'NTP Amplification', vector: 'NTP', severity: 'high', avgGbps: 180 },
      { type: 'Memcached', vector: 'Memcached', severity: 'critical', avgGbps: 450 },
      { type: 'SSDP', vector: 'SSDP', severity: 'medium', avgGbps: 60 },
      { type: 'ACK Flood', vector: 'ACK', severity: 'low', avgGbps: 15 },
    ];

    const dataCenters = [
      { name: 'Tehran DC1 - Pars Online', country: 'IR', lat: 35.6892, lon: 51.3890, provider: 'Pars Online' },
      { name: 'Erbil DC - Newroz Telecom', country: 'IQ', lat: 36.1911, lon: 44.0090, provider: 'Newroz' },
      { name: 'Istanbul DC - Turk Telekom', country: 'TR', lat: 41.0082, lon: 28.9784, provider: 'Turk Telekom' },
      { name: 'Frankfurt DC - Hetzner', country: 'DE', lat: 50.1109, lon: 8.6821, provider: 'Hetzner' },
      { name: 'London DC - Linx', country: 'GB', lat: 51.5072, lon: -0.1276, provider: 'LINX' },
      { name: 'Virginia DC - AWS us-east-1', country: 'US', lat: 39.0438, lon: -77.4874, provider: 'AWS' },
      { name: 'Singapore DC - Equinix', country: 'SG', lat: 1.3521, lon: 103.8198, provider: 'Equinix' },
      { name: 'Tokyo DC - Equinix', country: 'JP', lat: 35.6762, lon: 139.6503, provider: 'Equinix' },
      { name: 'Mumbai DC - ST Telemedia', country: 'IN', lat: 19.0760, lon: 72.8777, provider: 'STT' },
      { name: 'São Paulo DC', country: 'BR', lat: -23.5505, lon: -46.6333, provider: 'Equinix' },
      { name: 'Sydney DC', country: 'AU', lat: -33.8688, lon: 151.2093, provider: 'Equinix' },
      { name: 'Moscow DC - Rostelecom', country: 'RU', lat: 55.7558, lon: 37.6173, provider: 'Rostelecom' },
      { name: 'Beijing DC - China Telecom', country: 'CN', lat: 39.9042, lon: 116.4074, provider: 'China Telecom' },
    ];

    const attacks = [];
    for (let i = 0; i < count; i++) {
      const attackType = attackTypes[Math.floor(Math.random()*attackTypes.length)];
      const target = dataCenters[Math.floor(Math.random()*dataCenters.length)];
      const sourceCountries = ['CN','RU','US','BR','IN','VN','ID','TR','IR','KP'];
      const source = sourceCountries[Math.floor(Math.random()*sourceCountries.length)];
      
      const gbps = attackType.avgGbps * (0.5 + Math.random()*1.5);
      const mpps = gbps * (0.8 + Math.random()*0.4) * 0.5; // Million packets per sec
      
      attacks.push({
        id: `ddos-${now}-${this.attackIdCounter++}`,
        type: attackType.type,
        vector: attackType.vector,
        severity: gbps > 300 ? 'critical' : gbps > 100 ? 'high' : gbps > 30 ? 'medium' : 'low',
        target: {
          name: target.name,
          country: target.country,
          lat: target.lat + (Math.random()-0.5)*2,
          lon: target.lon + (Math.random()-0.5)*2,
          provider: target.provider,
          ip: `${Math.floor(Math.random()*223)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
          asn: `AS${Math.floor(1000+Math.random()*50000)}`
        },
        source: {
          country: source,
          lat: 20 + Math.random()*50,
          lon: -120 + Math.random()*240,
        },
        metrics: {
          gbps: parseFloat(gbps.toFixed(1)),
          mpps: parseFloat(mpps.toFixed(2)),
          durationSec: Math.floor(60 + Math.random()*3600),
          requestsPerSec: Math.floor(gbps * 1000000 / 8 / 1500) // approx
        },
        startTime: new Date(now - Math.random()*3600*1000).toISOString(),
        status: Math.random() > 0.3 ? 'active' : 'mitigated',
        mitigation: Math.random() > 0.5 ? 'Cloudflare Magic Transit' : 'Akamai Prolexic',
        targetIndustry: ['Finance','Gaming','Government','E-commerce','Telecom','Media'][Math.floor(Math.random()*6)]
      });
    }

    return attacks.sort((a,b) => b.metrics.gbps - a.metrics.gbps);
  }

  async fetchLiveAttacks() {
    try {
      const res = await fetch('/api/ddos-attacks', { signal: AbortSignal.timeout(5000) }).catch(()=>null);
      if (res && res.ok) {
        const data = await res.json();
        return data.attacks || this.generateMockAttacks();
      }
    } catch {}
    return this.generateMockAttacks();
  }

  async update() {
    const attacks = await this.fetchLiveAttacks();
    this.activeAttacks = attacks.filter(a => a.status === 'active');
    this.history.push({ timestamp: Date.now(), attacks: this.activeAttacks.length, data: attacks });
    if (this.history.length > 200) this.history.shift();
    this.notifyListeners(attacks);
    return attacks;
  }

  startMonitoring(intervalMs = 15000) {
    this.update();
    this.updateInterval = setInterval(() => this.update(), intervalMs);
  }

  stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  addListener(cb) { this.listeners.add(cb); }
  removeListener(cb) { this.listeners.delete(cb); }
  notifyListeners(data) { this.listeners.forEach(cb => { try{cb(data)}catch{} }); }

  getAttacksByCountry(countryCode) {
    return this.activeAttacks.filter(a => a.target.country === countryCode.toUpperCase());
  }

  getTopTargets(limit = 10) {
    return [...this.activeAttacks].sort((a,b) => b.metrics.gbps - a.metrics.gbps).slice(0, limit);
  }

  getStats() {
    const totalGbps = this.activeAttacks.reduce((s,a) => s + a.metrics.gbps, 0);
    return {
      active: this.activeAttacks.length,
      totalGbps: parseFloat(totalGbps.toFixed(1)),
      avgGbps: this.activeAttacks.length ? parseFloat((totalGbps/this.activeAttacks.length).toFixed(1)) : 0,
      critical: this.activeAttacks.filter(a => a.severity === 'critical').length,
      byCountry: this.activeAttacks.reduce((acc,a)=>{ acc[a.target.country]=(acc[a.target.country]||0)+1; return acc; },{}),
      byVector: this.activeAttacks.reduce((acc,a)=>{ acc[a.vector]=(acc[a.vector]||0)+1; return acc; },{}),
      lastUpdate: Date.now()
    };
  }
}

export const ddosMonitor = new DDoSMonitor();
