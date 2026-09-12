/**
 * Real Data Fetcher for Cyber Intelligence
 * Tries public APIs that work on GitHub Pages (CORS enabled)
 * Falls back to mock data
 */

const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

async function fetchWithFallback(url, options = {}) {
  const { timeout = 8000, signal } = options;
  
  // Try direct first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
    
    const res = await fetch(url, { signal: combinedSignal, headers: { 'Accept': 'application/json' } });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data) return data;
    }
  } catch (e) {
    // Try proxies
    for (const proxy of CORS_PROXIES) {
      try {
        const proxiedUrl = proxy(url);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
        
        const res = await fetch(proxiedUrl, { signal: combinedSignal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
        }
      } catch (e2) {
        continue;
      }
    }
  }
  return null;
}

// Real currency is handled separately in liveCurrencyReal.js

// Try to fetch real internet outage data from IODA via proxy or Cloudflare Radar
export async function fetchRealOutages() {
  // Try IODA - Internet Outage Detection and Analysis
  // Public API: https://ioda.inetintel.cc.gatech.edu/api/v3/
  // Example: https://api.ioda.caida.org/v2/outages?from=...&until=...
  
  try {
    // Try Cloudflare Radar public data (some endpoints are public)
    // For now, we simulate with more realistic data based on real patterns
    // In future, proxy via your own Cloudflare Worker with API key
    
    // Try to fetch from digitalattackmap or other public sources
    const now = Date.now();
    const from = Math.floor((now - 24*3600*1000) / 1000);
    const until = Math.floor(now / 1000);
    
    // Attempt IODA via allorigins proxy
    const iodaUrl = `https://api.ioda.inetintel.cc.gatech.edu/v2/outages?from=${from}&until=${until}&limit=10`;
    const iodaData = await fetchWithFallback(iodaUrl, { timeout: 5000 }).catch(() => null);
    
    if (iodaData && iodaData.data) {
      console.log('[RealData] IODA outages fetched:', iodaData.data.length);
      return iodaData.data.map(o => ({
        id: `ioda-${o.id}`,
        countryCode: o.entity?.code || 'XX',
        country: o.entity?.name || 'Unknown',
        type: 'infrastructure',
        severity: o.severity || 'medium',
        affectedPercent: 50,
        startTime: new Date(o.start * 1000).toISOString(),
        source: 'IODA REAL',
        lat: 0,
        lon: 0,
        verified: true
      }));
    }
  } catch (e) {
    console.log('[RealData] Outage fetch failed:', e.message);
  }
  
  return null; // Fallback to mock
}

// Try to fetch real DDoS data
export async function fetchRealDDoS() {
  try {
    // Cloudflare Radar DDoS data - try public endpoint via proxy
    // https://radar.cloudflare.com/api/v1/attacks?dateRange=1d
    // Or use https://api.cloudflare.com/client/v4/radar/attacks/layer3/top/attacks?dateRange=7d
    
    // For now, try to fetch from public Cloudflare Radar JSON
    const cfUrl = 'https://radar.cloudflare.com/api/v1/attacks';
    const cfData = await fetchWithFallback(cfUrl, { timeout: 5000 }).catch(() => null);
    
    if (cfData) {
      console.log('[RealData] Cloudflare DDoS data fetched');
      return cfData;
    }
  } catch (e) {
    console.log('[RealData] DDoS fetch failed:', e.message);
  }
  return null;
}

// Try to fetch real phishing data from URLhaus (Abuse.ch) - public API, CORS?
export async function fetchRealPhishing() {
  try {
    // Abuse.ch URLhaus has public API: https://urlhaus-api.abuse.ch/v1/urls/recent/
    // But requires POST and may not have CORS, try via proxy
    const urlhausUrl = 'https://urlhaus.abuse.ch/downloads/text_recent/';
    // This returns plain text list of recent malicious URLs, CORS?
    const data = await fetchWithFallback(urlhausUrl, { timeout: 5000 }).catch(() => null);
    if (data) {
      console.log('[RealData] URLhaus data fetched');
      return data;
    }
  } catch (e) {
    console.log('[RealData] Phishing fetch failed:', e.message);
  }
  return null;
}

export { fetchWithFallback };
