/**
 * Cyber Intelligence Proxy - Personal Edition
 * Mock APIs for internet outages, DDoS, phishing, zero-day, filtering, speed
 * In production, these would proxy to real threat intel APIs
 */

export function cyberIntelProxy() {
  return {
    name: 'cyber-intel-proxy',
    configureServer(server) {
      // Internet outages - NetBlocks style
      server.middlewares.use('/api/internet-outages', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const mockOutages = [
          {
            id: `outage-${Date.now()}-ir`,
            countryCode: 'IR',
            country: 'Iran',
            region: 'Tehran, Isfahan, Mashhad',
            type: 'government_shutdown',
            severity: 'critical',
            affectedPercent: 85,
            startTime: new Date(Date.now() - 2*3600*1000).toISOString(),
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
            id: `outage-${Date.now()}-sy`,
            countryCode: 'SY',
            country: 'Syria',
            region: 'Damascus, Aleppo',
            type: 'infrastructure_damage',
            severity: 'high',
            affectedPercent: 60,
            startTime: new Date(Date.now() - 5*3600*1000).toISOString(),
            durationHours: 5,
            reason: 'Fiber cut due to conflict',
            source: 'IODA',
            lat: 33.5138,
            lon: 36.2765,
            verified: true,
            trafficDropPercent: 65,
            asnsAffected: ['AS11024']
          }
        ];

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ outages: mockOutages, source: 'NetBlocks + IODA', timestamp: Date.now() }));
      });

      // DDoS attacks
      server.middlewares.use('/api/ddos-attacks', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const dataCenters = [
          { name: 'Tehran DC1', country: 'IR', lat: 35.6892, lon: 51.3890, provider: 'Pars Online' },
          { name: 'Frankfurt DC', country: 'DE', lat: 50.1109, lon: 8.6821, provider: 'Hetzner' },
          { name: 'Virginia DC', country: 'US', lat: 39.0438, lon: -77.4874, provider: 'AWS' },
        ];

        const attacks = dataCenters.map((dc, i) => ({
          id: `ddos-${Date.now()}-${i}`,
          type: ['UDP Flood', 'DNS Amplification', 'SYN Flood'][i % 3],
          vector: ['UDP', 'DNS', 'SYN'][i % 3],
          severity: ['high', 'critical', 'medium'][i % 3],
          target: { ...dc, ip: `1.2.3.${i}`, asn: `AS${1000+i}` },
          source: { country: ['CN','RU','US'][i%3], lat: 30+Math.random()*20, lon: 40+Math.random()*20 },
          metrics: { gbps: 50 + Math.random()*200, mpps: 10 + Math.random()*50, durationSec: 300 + Math.random()*3600 },
          startTime: new Date(Date.now() - Math.random()*3600*1000).toISOString(),
          status: 'active',
          targetIndustry: 'Telecom'
        }));

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ attacks, source: 'Cloudflare Radar', timestamp: Date.now() }));
      });

      // Country info - REST Countries + World Bank enrichment
      server.middlewares.use('/api/country-info', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const url = new URL(req.url, 'http://localhost');
        const code = url.searchParams.get('code')?.toUpperCase() || 'IR';

        // In production, fetch from REST Countries, World Bank, exchangerate-api
        // For now, return that we have local data
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({ 
          code,
          message: 'Use local database - Personal Edition has embedded data',
          sources: ['World Bank', 'REST Countries', 'IMF', 'exchangerate-api.com'],
          timestamp: Date.now()
        }));
      });

      // Phishing
      server.middlewares.use('/api/phishing-live', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({
          active: 150 + Math.floor(Math.random()*100),
          source: 'Abuse.ch URLhaus + PhishTank',
          timestamp: Date.now()
        }));
      });

      // Zero-day
      server.middlewares.use('/api/zeroday-live', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({
          active: 12,
          cisaKev: 8,
          source: 'CISA KEV + ThreatFox',
          timestamp: Date.now()
        }));
      });

      // Internet speed
      server.middlewares.use('/api/internet-speed', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({
          source: 'Ookla Speedtest Global Index + Cloudflare Radar',
          timestamp: Date.now(),
          note: 'Live speed data requires Ookla API key, using local DB with jitter'
        }));
      });

      // Filtering level
      server.middlewares.use('/api/filtering-level', async (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({
          source: 'OONI + Freedom House',
          timestamp: Date.now()
        }));
      });
    }
  };
}
