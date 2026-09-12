/**
 * Public API fallback for GitHub Pages (no backend proxy)
 * Tries direct public APIs with CORS support or via CORS proxies
 */

// CORS proxies that allow GET to public APIs
const CORS_PROXIES = [
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Public flight APIs - airplanes.live supports CORS (*)
const PUBLIC_APIS = {
  // airplanes.live - CORS enabled, same format as adsb.lol (ac array)
  military: 'https://api.airplanes.live/v2/mil',
  // For general flights, use point query around camera
  point: (lat, lon, dist = 250) => `https://api.airplanes.live/v2/point/${lat.toFixed(4)}/${lon.toFixed(4)}/${dist}`,
  // Fallback to adsb.lol via proxy
  adsbLolMil: 'https://api.adsb.lol/v2/mil',
  adsbLolPoint: (lat, lon, dist = 250) => `https://api.adsb.lol/v2/lat/${lat.toFixed(4)}/lon/${lon.toFixed(4)}/dist/${dist}`,
};

function isGitHubPages() {
  return typeof window !== 'undefined' && window.location.hostname.includes('github.io');
}

async function fetchWithCorsFallback(url, options = {}) {
  const { signal, timeout = 8000 } = options;
  
  // Try direct fetch first
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
    
    const res = await fetch(url, { signal: combinedSignal });
    clearTimeout(timeoutId);
    if (res.ok) return res;
    // If 404, try CORS proxies (GitHub Pages case)
    if (res.status === 404 && isGitHubPages()) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res;
  } catch (err) {
    // On GitHub Pages, try CORS proxies and alternative APIs
    if (!isGitHubPages()) throw err;
    
    console.log(`[Fallback] Direct fetch failed for ${url}, trying public APIs...`);
    
    // Try public APIs directly
    for (const proxy of CORS_PROXIES) {
      try {
        const proxiedUrl = proxy(url);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
        
        const res = await fetch(proxiedUrl, { signal: combinedSignal });
        clearTimeout(timeoutId);
        if (res.ok) {
          console.log(`[Fallback] Success via proxy: ${proxiedUrl.substring(0, 60)}...`);
          return res;
        }
      } catch (e) {
        // Continue to next proxy
        continue;
      }
    }
    
    throw err;
  }
}

export async function fetchMilitaryWithFallback(primaryUrl, options = {}) {
  const { signal } = options;
  
  // Try primary (proxy) first
  try {
    const res = await fetch(primaryUrl, { signal, headers: { 'Accept': 'application/json' } });
    if (res.ok) return res;
    if (res.status !== 404) return res; // Return non-404 errors as-is
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    if (!isGitHubPages()) throw err;
    
    console.log('[Fallback] Military proxy 404, trying public APIs...');
    
    // Try airplanes.live first (CORS enabled)
    const publicUrls = [
      PUBLIC_APIS.military,
      PUBLIC_APIS.adsbLolMil,
    ];
    
    for (const publicUrl of publicUrls) {
      // Try direct
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
        
        const res = await fetch(publicUrl, { signal: combinedSignal, headers: { 'Accept': 'application/json' } });
        clearTimeout(timeoutId);
        if (res.ok) {
          console.log(`[Fallback] Military success via ${publicUrl}`);
          return res;
        }
      } catch (e) {
        // Try via CORS proxy
        for (const proxy of CORS_PROXIES) {
          try {
            const proxiedUrl = proxy(publicUrl);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
            
            const res = await fetch(proxiedUrl, { signal: combinedSignal });
            clearTimeout(timeoutId);
            if (res.ok) {
              console.log(`[Fallback] Military success via proxy for ${publicUrl}`);
              return res;
            }
          } catch (e2) {
            continue;
          }
        }
      }
    }
    
    throw err;
  }
}

export async function fetchFlightsWithFallback(primaryUrl, viewer, options = {}) {
  const { signal } = options;
  
  // Try primary first
  try {
    const res = await fetch(primaryUrl, { signal, headers: { 'Accept': 'application/json' } });
    if (res.ok) return { response: res, source: 'OpenSky Network', isAdsbLol: false };
    if (res.status !== 404) return { response: res, source: 'OpenSky Network', isAdsbLol: false };
    throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    if (!isGitHubPages()) throw err;
    
    console.log('[Fallback] OpenSky proxy 404, trying public flight APIs...');
    
    // Get viewer position for point query
    let lat = 0, lon = 0;
    try {
      const carto = viewer?.camera?.positionCartographic;
      if (carto) {
        // cartographic latitude/longitude are in radians
        const latRad = carto.latitude;
        const lonRad = carto.longitude;
        if (typeof latRad === 'number' && typeof lonRad === 'number') {
          lat = latRad * 180 / Math.PI;
          lon = lonRad * 180 / Math.PI;
        } else if (carto.latitude && carto.longitude) {
          // Might already be degrees in some contexts
          lat = Number(carto.latitude);
          lon = Number(carto.longitude);
        }
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
          lat = 0; lon = 0;
        }
      }
    } catch {}
    
    // If no viewer position, use 0,0 with large dist, or use Kurdistan/Iran area as default
    if (lat === 0 && lon === 0) {
      lat = 35.0; // Middle East default
      lon = 45.0;
    }
    
    const publicUrls = [
      PUBLIC_APIS.point(lat, lon, 250),
      `https://api.airplanes.live/v2/point/${lat.toFixed(2)}/${lon.toFixed(2)}/250`,
      PUBLIC_APIS.adsbLolPoint(lat, lon, 250),
      PUBLIC_APIS.military, // At least show military if all else fails
    ];
    
    for (const publicUrl of publicUrls) {
      // Try direct
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
        
        const res = await fetch(publicUrl, { signal: combinedSignal, headers: { 'Accept': 'application/json' } });
        clearTimeout(timeoutId);
        if (res.ok) {
          console.log(`[Fallback] Flights success via ${publicUrl}`);
          return { response: res, source: publicUrl.includes('airplanes.live') ? 'airplanes.live' : 'adsb.lol', isAdsbLol: true };
        }
      } catch (e) {
        // Try via CORS proxy
        for (const proxy of CORS_PROXIES) {
          try {
            const proxiedUrl = proxy(publicUrl);
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);
            const combinedSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
            
            const res = await fetch(proxiedUrl, { signal: combinedSignal });
            clearTimeout(timeoutId);
            if (res.ok) {
              console.log(`[Fallback] Flights success via proxy for ${publicUrl}`);
              return { response: res, source: publicUrl.includes('airplanes.live') ? 'airplanes.live' : 'adsb.lol', isAdsbLol: true };
            }
          } catch (e2) {
            continue;
          }
        }
      }
    }
    
    throw err;
  }
}

export { isGitHubPages, PUBLIC_APIS };
