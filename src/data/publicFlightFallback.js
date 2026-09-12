/**
 * Public API fallback for GitHub Pages (no backend proxy)
 * REAL DATA via Cloudflare Worker + direct APIs + CORS proxies
 * Falls back to mock if all real sources fail
 */

import { WORKER_URL, REAL_APIS } from '../config/proxy.js';

// Updated CORS proxies - corsproxy.io now requires key, so use alternatives
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
  // Worker proxy
  (url) => `${WORKER_URL}/api/proxy?url=${encodeURIComponent(url)}`,
  // Direct worker endpoints
  (url) => {
    if (url.includes('adsb.lol/v2/mil')) return `${WORKER_URL}/api/adsblol/mil`;
    if (url.includes('/lat/') && url.includes('/lon/')) {
      const latMatch = url.match(/lat\/([-\d.]+)/);
      const lonMatch = url.match(/lon\/([-\d.]+)/);
      const distMatch = url.match(/dist\/(\d+)/);
      const lat = latMatch ? latMatch[1] : '35';
      const lon = lonMatch ? lonMatch[1] : '45';
      const dist = distMatch ? distMatch[1] : '250';
      return `${WORKER_URL}/api/adsblol/lat/${lat}/lon/${lon}/dist/${dist}`;
    }
    return `${WORKER_URL}/api/opensky`;
  },
];

export const PUBLIC_APIS = {
  military: REAL_APIS.adsbMil,
  point: REAL_APIS.adsbPoint,
  adsbLolMil: REAL_APIS.adsbMil,
  adsbLolPoint: REAL_APIS.adsbPoint,
  airplanesMil: REAL_APIS.airplanesMil,
  airplanesPoint: REAL_APIS.airplanesPoint,
};

export function isGitHubPages() {
  return typeof window !== 'undefined' && window.location.hostname.includes('github.io');
}

async function fetchWithTimeout(url, options = {}) {
  const { signal, timeout = 8000 } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
  
  try {
    const res = await fetch(url, {
      signal: combinedSignal,
      headers: { 'Accept': 'application/json', ...options.headers },
    });
    clearTimeout(timeoutId);
    return res;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

export async function fetchMilitaryWithFallback(primaryUrl, options = {}) {
  const { signal } = options;
  
  // Try primary (local proxy) first - works in Docker/dev
  try {
    const res = await fetchWithTimeout(primaryUrl, { signal, timeout: 5000 });
    if (res.ok) {
      console.log('[Military] Success via primary:', primaryUrl);
      return res;
    }
    if (res.status !== 404 && res.status !== 403) return res;
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    if (!isGitHubPages()) throw err;
    
    console.log('[Military] Primary failed, trying REAL APIs for GitHub Pages...');
    
    // On GitHub Pages, try REAL APIs
    const realUrls = [
      // Try worker first if configured
      ...(WORKER_URL && !WORKER_URL.includes('yourname') ? [
        `${WORKER_URL}/api/adsblol/mil`,
        `${WORKER_URL}/api/opensky`,
      ] : []),
      // Direct real APIs (adsb.lol works but needs CORS proxy in browser)
      REAL_APIS.adsbMil,
      REAL_APIS.airplanesMil,
    ];
    
    // Try direct real APIs
    for (const realUrl of realUrls) {
      try {
        const res = await fetchWithTimeout(realUrl, { signal, timeout: 6000 });
        if (res.ok) {
          console.log(`[Military] REAL success via ${realUrl}`);
          return res;
        }
      } catch (e) {
        // Try via CORS proxies
        for (const proxy of CORS_PROXIES) {
          try {
            const proxiedUrl = proxy(realUrl);
            const res = await fetchWithTimeout(proxiedUrl, { signal, timeout: 6000 });
            if (res.ok) {
              // Check if response is actually JSON and not error page
              const text = await res.clone().text();
              if (text.includes('"ac"') || text.includes('"aircraft"') || text.startsWith('{')) {
                console.log(`[Military] REAL success via proxy for ${realUrl}`);
                return res;
              }
            }
          } catch (e2) {
            continue;
          }
        }
      }
    }
    
    console.log('[Military] All REAL APIs failed, will use mock fallback in layer');
    throw err;
  }
}

export async function fetchFlightsWithFallback(primaryUrl, viewer, options = {}) {
  const { signal } = options;
  
  // Try primary first (Docker/dev)
  try {
    const res = await fetchWithTimeout(primaryUrl, { signal, timeout: 5000 });
    if (res.ok) {
      return { response: res, source: 'OpenSky Network', isAdsbLol: false };
    }
    if (res.status !== 404 && res.status !== 403) {
      return { response: res, source: 'OpenSky Network', isAdsbLol: false };
    }
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    if (!isGitHubPages()) throw err;
    
    console.log('[Flights] Primary failed, trying REAL APIs for GitHub Pages...');
    
    // Get viewer position
    let lat = 35.0, lon = 45.0;
    try {
      const carto = viewer?.camera?.positionCartographic;
      if (carto) {
        const latRad = carto.latitude;
        const lonRad = carto.longitude;
        if (typeof latRad === 'number' && typeof lonRad === 'number') {
          lat = latRad * 180 / Math.PI;
          lon = lonRad * 180 / Math.PI;
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          lat = 35.0; lon = 45.0;
        }
      }
    } catch {}
    
    const realUrls = [
      ...(WORKER_URL && !WORKER_URL.includes('yourname') ? [
        `${WORKER_URL}/api/adsblol/lat/${lat}/lon/${lon}/dist/250`,
        `${WORKER_URL}/api/opensky?lat=${lat}&lon=${lon}`,
      ] : []),
      REAL_APIS.adsbPoint(lat, lon, 250),
      REAL_APIS.airplanesPoint(lat, lon, 250),
      REAL_APIS.adsbMil,
    ];
    
    for (const realUrl of realUrls) {
      try {
        const res = await fetchWithTimeout(realUrl, { signal, timeout: 6000 });
        if (res.ok) {
          const text = await res.clone().text();
          if (text.includes('"ac"') || text.includes('"states"') || text.startsWith('{')) {
            console.log(`[Flights] REAL success via ${realUrl}`);
            const isAdsbLol = text.includes('"ac"');
            return { 
              response: res, 
              source: realUrl.includes('airplanes.live') ? 'airplanes.live REAL' : realUrl.includes('adsb.lol') ? 'adsb.lol REAL' : 'worker REAL', 
              isAdsbLol 
            };
          }
        }
      } catch (e) {
        // Try via proxies
        for (const proxy of CORS_PROXIES) {
          try {
            const proxiedUrl = proxy(realUrl);
            const res = await fetchWithTimeout(proxiedUrl, { signal, timeout: 6000 });
            if (res.ok) {
              const text = await res.clone().text();
              if (text.includes('"ac"') || text.includes('"states"')) {
                console.log(`[Flights] REAL success via proxy for ${realUrl}`);
                return {
                  response: res,
                  source: 'adsb.lol REAL via proxy',
                  isAdsbLol: true,
                };
              }
            }
          } catch (e2) {
            continue;
          }
        }
      }
    }
    
    console.log('[Flights] All REAL APIs failed, will use mock');
    throw err;
  }
}

export { REAL_APIS };
