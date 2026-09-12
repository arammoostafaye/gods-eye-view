/**
 * Proxy configuration for GitHub Pages
 * Real data via Cloudflare Worker with CORS
 * 
 * Deploy worker/index.js to Cloudflare Workers, then set WORKER_URL here
 * 
 * For now, tries multiple public proxies + direct, falls back to mock
 */

// Deployed Worker - REAL DATA via Cloudflare
export const WORKER_URL = 'https://gods-eye-view-proxy.divarsport.workers.dev';

// Fallback public CORS proxies (unreliable, but try) - worker first!
export const FALLBACK_PROXIES = [
  (url) => `${WORKER_URL}/api/proxy?url=${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
];

// Check if worker is available
export async function isWorkerAvailable() {
  if (!WORKER_URL || WORKER_URL.includes('yourname')) {
    return false;
  }
  // Worker URL is set to real deployed worker
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${WORKER_URL}/health`, { signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);
    return res && res.ok;
  } catch {
    // Even if health check fails, assume worker is available if URL is set
    return true;
  }
}

// Get API URL - uses worker if on GitHub Pages and worker available, otherwise direct or proxy
export function getApiUrl(path) {
  const isGitHubPages = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  
  if (isGitHubPages && WORKER_URL && !WORKER_URL.includes('yourname')) {
    // Use worker
    // path like /api/opensky?lat=35&lon=45 -> https://worker.workers.dev/api/opensky?lat=35&lon=45
    return `${WORKER_URL}${path}`;
  }
  
  // Otherwise use local proxy (for Docker/dev)
  return path;
}

// Real API endpoints (direct, no proxy needed for some)
export const REAL_APIS = {
  // These have CORS enabled
  currency: 'https://open.er-api.com/v6/latest/USD',
  btc: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
  cisaKev: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
  earthquakes: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
  
  // These need CORS proxy (no CORS header)
  adsbMil: 'https://api.adsb.lol/v2/mil',
  adsbPoint: (lat, lon, dist = 250) => `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`,
  
  // Alternative that was blocking but try
  airplanesMil: 'https://api.airplanes.live/v2/mil',
  airplanesPoint: (lat, lon, dist = 250) => `https://api.airplanes.live/v2/point/${lat}/${lon}/${dist}`,
};
