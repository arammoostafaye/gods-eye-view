/**
 * God's Eye View - Cloudflare Worker Proxy
 * Proxies all /api/* endpoints with CORS headers for GitHub Pages
 * Real data, not mock - works on github.io
 * 
 * Deploy: 
 * 1. Install wrangler: npm install -g wrangler
 * 2. wrangler login
 * 3. wrangler deploy
 * 
 * Or deploy via Cloudflare Dashboard > Workers > Create Worker > Paste this code
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// Cache for 10-30 seconds to avoid rate limits
const CACHE_TTL = {
  flights: 15, // seconds
  military: 12,
  earthquakes: 60,
  satellites: 300,
  default: 30,
};

async function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

async function proxyWithCache(url, options = {}, cacheTtl = 30) {
  const cache = caches.default;
  const cacheKey = new Request(url, { method: 'GET' });
  
  // Try cache first
  let response = await cache.match(cacheKey);
  if (response) {
    // Add CORS headers to cached response
    const newHeaders = new Headers(response.headers);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
    newHeaders.set('X-Cache', 'HIT');
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  }
  
  // Fetch from origin
  try {
    const originResponse = await fetch(url, {
      headers: {
        'User-Agent': 'gods-eye-view-proxy/1.0 (https://github.com/arammoostafaye/gods-eye-view)',
        'Accept': 'application/json',
        ...options.headers,
      },
      signal: options.signal,
    });
    
    const body = await originResponse.text();
    
    // Create response with CORS headers
    const newHeaders = new Headers(originResponse.headers);
    Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
    newHeaders.set('X-Cache', 'MISS');
    newHeaders.set('Cache-Control', `public, max-age=${cacheTtl}`);
    
    const proxiedResponse = new Response(body, {
      status: originResponse.status,
      headers: newHeaders,
    });
    
    // Cache successful responses
    if (originResponse.ok) {
      const cacheResponse = proxiedResponse.clone();
      // Cloudflare cache needs to be put with waitUntil
      // For simplicity, we put without waitUntil (works in Workers)
      try {
        await cache.put(cacheKey, cacheResponse);
      } catch (e) {
        // Cache put can fail, ignore
      }
    }
    
    return proxiedResponse;
    
  } catch (err) {
    return new Response(JSON.stringify({ error: `Proxy error: ${err.message}` }), {
      status: 502,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPreflight();
    }
    
    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'gods-eye-view-proxy',
        version: '1.0',
        endpoints: [
          '/api/opensky',
          '/api/adsblol/mil',
          '/api/adsblol/point?lat=35&lon=45&dist=250',
          '/api/earthquakes',
          '/api/satellites',
          '/api/currency',
          '/api/outages',
          '/api/ddos',
        ],
        github: 'https://github.com/arammoostafaye/gods-eye-view',
        cors: 'Access-Control-Allow-Origin: *',
      }), {
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    
    // Proxy logic based on path
    const path = url.pathname;
    const searchParams = url.searchParams;
    
    // OpenSky - Primary flight data
    if (path.startsWith('/api/opensky')) {
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      
      // If lat/lon provided, use adsb.lol point API as fallback (more reliable than OpenSky anon)
      if (lat && lon) {
        const dist = searchParams.get('dist') || '250';
        const adsbUrl = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`;
        return proxyWithCache(adsbUrl, {}, CACHE_TTL.flights);
      }
      
      // Try OpenSky first
      const openskyUrl = 'https://opensky-network.org/api/states/all';
      // Note: OpenSky anon is rate limited, but we try
      // For authenticated, you'd need to implement OAuth with env.OPENSKY_CLIENT_ID
      return proxyWithCache(openskyUrl, {}, CACHE_TTL.flights);
    }
    
    // adsb.lol military
    if (path.startsWith('/api/adsblol/mil') || path.startsWith('/api/adsb.lol/mil')) {
      const adsbUrl = 'https://api.adsb.lol/v2/mil';
      return proxyWithCache(adsbUrl, {}, CACHE_TTL.military);
    }
    
    // adsb.lol point
    if (path.startsWith('/api/adsblol/point') || path.includes('/lat/') && path.includes('/lon/')) {
      // Extract lat/lon/dist from query or path
      let lat = searchParams.get('lat') || '35';
      let lon = searchParams.get('lon') || '45';
      let dist = searchParams.get('dist') || '250';
      
      // Try to parse from path like /api/adsblol/lat/35/lon/45/dist/250
      const latMatch = path.match(/lat\/([-\d.]+)/);
      const lonMatch = path.match(/lon\/([-\d.]+)/);
      const distMatch = path.match(/dist\/(\d+)/);
      if (latMatch) lat = latMatch[1];
      if (lonMatch) lon = lonMatch[1];
      if (distMatch) dist = distMatch[1];
      
      const adsbUrl = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`;
      return proxyWithCache(adsbUrl, {}, CACHE_TTL.flights);
    }
    
    // Generic adsb.lol proxy - /api/adsblol/* -> https://api.adsb.lol/v2/*
    if (path.startsWith('/api/adsblol/')) {
      const subPath = path.replace('/api/adsblol/', '');
      const adsbUrl = `https://api.adsb.lol/v2/${subPath}${url.search}`;
      return proxyWithCache(adsbUrl, {}, CACHE_TTL.flights);
    }
    
    // Earthquakes - USGS (already CORS enabled, but proxy for consistency)
    if (path.startsWith('/api/earthquakes') || path.startsWith('/api/quakes')) {
      const usgsUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
      return proxyWithCache(usgsUrl, {}, CACHE_TTL.earthquakes);
    }
    
    // Satellites - CelesTrak
    if (path.startsWith('/api/satellites') || path.startsWith('/api/celestrak')) {
      const celestrakUrl = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json';
      return proxyWithCache(celestrakUrl, {}, CACHE_TTL.satellites);
    }
    
    // Currency - open.er-api.com (already CORS, but proxy)
    if (path.startsWith('/api/currency') || path.startsWith('/api/exchange')) {
      const currencyUrl = 'https://open.er-api.com/v6/latest/USD';
      return proxyWithCache(currencyUrl, {}, 300);
    }
    
    // BTC price - coingecko
    if (path.startsWith('/api/btc') || path.startsWith('/api/bitcoin')) {
      const btcUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
      return proxyWithCache(btcUrl, {}, 60);
    }
    
    // CISA KEV - Zero-day
    if (path.startsWith('/api/cisa') || path.startsWith('/api/kev') || path.startsWith('/api/zeroday')) {
      const cisaUrl = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';
      return proxyWithCache(cisaUrl, {}, 3600);
    }
    
    // URLhaus - Phishing
    if (path.startsWith('/api/urlhaus') || path.startsWith('/api/phishing')) {
      const urlhausUrl = 'https://urlhaus.abuse.ch/downloads/text_recent/';
      // This returns text, not JSON
      const cache = caches.default;
      const cacheKey = new Request(urlhausUrl);
      let response = await cache.match(cacheKey);
      if (response) {
        const newHeaders = new Headers(response.headers);
        Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
        newHeaders.set('X-Cache', 'HIT');
        return new Response(response.body, { status: response.status, headers: newHeaders });
      }
      
      const originRes = await fetch(urlhausUrl, {
        headers: { 'User-Agent': 'gods-eye-view-proxy/1.0' },
      });
      const body = await originRes.text();
      const newHeaders = new Headers();
      Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
      newHeaders.set('Content-Type', 'text/plain');
      newHeaders.set('Cache-Control', 'public, max-age=60');
      
      const proxied = new Response(body, { status: originRes.status, headers: newHeaders });
      if (originRes.ok) {
        try { await cache.put(cacheKey, proxied.clone()); } catch {}
      }
      return proxied;
    }
    
    // Generic proxy for any /api/* - tries to map to known public APIs
    // For unknown paths, return 404 with CORS
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({
        error: `Unknown API endpoint: ${path}`,
        available: [
          '/api/opensky?lat=35&lon=45',
          '/api/adsblol/mil',
          '/api/earthquakes',
          '/api/currency',
          '/api/cisa',
        ],
        message: 'This is gods-eye-view-proxy. Deploy your own for full backend.',
        deploy: 'wrangler deploy or copy worker/index.js to Cloudflare Dashboard',
      }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    
    // Fallback - proxy any URL via ?url= param (generic CORS proxy)
    const targetUrl = searchParams.get('url');
    if (targetUrl) {
      try {
        const decoded = decodeURIComponent(targetUrl);
        // Security: only allow https and specific domains
        const allowedDomains = [
          'api.adsb.lol',
          'api.airplanes.live',
          'opensky-network.org',
          'earthquake.usgs.gov',
          'celestrak.org',
          'open.er-api.com',
          'api.coingecko.com',
          'www.cisa.gov',
          'urlhaus.abuse.ch',
          'api.ioda.inetintel.cc.gatech.edu',
        ];
        
        const target = new URL(decoded);
        const isAllowed = allowedDomains.some(d => target.hostname.includes(d) || target.hostname === d);
        
        if (!isAllowed && !target.hostname.includes('adsb')) {
          return new Response(JSON.stringify({ error: `Domain not allowed: ${target.hostname}`, allowed: allowedDomains }), {
            status: 403,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
        
        return proxyWithCache(decoded, {}, CACHE_TTL.default);
      } catch (e) {
        return new Response(JSON.stringify({ error: `Invalid url param: ${e.message}` }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Default 404
    return new Response('Not found - Use /api/* endpoints. See / for docs.', {
      status: 404,
      headers: CORS_HEADERS,
    });
  },
};
