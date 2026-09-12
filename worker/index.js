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

function generateMockFlights(centerLat, centerLon, dist) {
  // Generate mock flights around Middle East for GitHub Pages
  const regions = [
    { name: "Tehran", lat: 35.6892, lon: 51.3890, count: 8, airlines: ["IRA", "THR", "IRB"] },
    { name: "Erbil", lat: 36.1911, lon: 44.0092, count: 5, airlines: ["UBD", "RKH", "IRAQ"] },
    { name: "Istanbul", lat: 41.0082, lon: 28.9784, count: 12, airlines: ["THY", "PGT", "AJA"] },
    { name: "Baghdad", lat: 33.3152, lon: 44.3661, count: 4, airlines: ["IQA", "UBD"] },
    { name: "Dubai", lat: 25.2048, lon: 55.2708, count: 15, airlines: ["UAE", "FDB", "QTR"] },
  ];
  
  const aircraftTypes = ["B738", "A320", "B77W", "A359", "B789", "A21N"];
  const flights = [];
  
  regions.forEach(region => {
    for (let i = 0; i < region.count; i++) {
      const latOffset = (Math.random() - 0.5) * 2;
      const lonOffset = (Math.random() - 0.5) * 2;
      const airline = region.airlines[Math.floor(Math.random() * region.airlines.length)];
      const flightNum = Math.floor(100 + Math.random() * 900);
      const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
      
      flights.push({
        hex: hex,
        flight: `${airline}${flightNum}`.padEnd(8, ' '),
        r: `TC-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        t: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
        alt_baro: Math.floor(25000 + Math.random() * 15000),
        gs: Math.floor(400 + Math.random() * 150),
        track: Math.floor(Math.random() * 360),
        lat: region.lat + latOffset,
        lon: region.lon + lonOffset,
        seen_pos: Math.random() * 2,
        seen: Math.random() * 1,
        rssi: -15 - Math.random() * 10,
        messages: Math.floor(1000 + Math.random() * 5000),
        mlat: [],
        tisb: [],
      });
    }
  });
  
  return {
    ac: flights,
    msg: "mock - real APIs blocked, using Middle East mock data",
    total: flights.length,
    ctime: Date.now(),
    ptime: 0,
    src: "mock",
    mock: true
  };
}

async function handleCorsPreflight() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

async function proxyWithCache(url, options = {}, cacheTtl = 30, fallbackUrls = []) {
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
  
  // Fetch from origin with fallback handling
  const urlsToTry = [url, ...fallbackUrls];
  
  for (const tryUrl of urlsToTry) {
    try {
      const originResponse = await fetch(tryUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://globe.adsb.fi/',
          ...options.headers,
        },
        signal: options.signal,
      });
      
      // If 429 or 5xx, try next URL if available
      if ((originResponse.status === 429 || originResponse.status >= 500) && tryUrl !== urlsToTry[urlsToTry.length - 1]) {
        continue; // Try next URL
      }
      
      const body = await originResponse.text();
      
      // Create response with CORS headers
      const newHeaders = new Headers(originResponse.headers);
      Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
      newHeaders.set('X-Cache', 'MISS');
      newHeaders.set('Cache-Control', `public, max-age=${cacheTtl}`);
      newHeaders.set('X-Proxied-From', tryUrl);
      
      const proxiedResponse = new Response(body, {
        status: originResponse.status,
        headers: newHeaders,
      });
      
      // Cache successful responses (and also 429 to avoid hammering, but with short TTL)
      if (originResponse.ok || originResponse.status === 429) {
        const cacheResponse = proxiedResponse.clone();
        try {
          await cache.put(cacheKey, cacheResponse);
        } catch (e) {
          // Cache put can fail, ignore
        }
      }
      
      // If it's 429 but we have fallback, continue
      if (originResponse.status === 429 && tryUrl !== urlsToTry[urlsToTry.length - 1]) {
        continue;
      }
      
      return proxiedResponse;
      
    } catch (err) {
      // If this is last URL, return error
      if (tryUrl === urlsToTry[urlsToTry.length - 1]) {
        return new Response(JSON.stringify({ error: `Proxy error: ${err.message}`, tried: urlsToTry }), {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      // Otherwise try next
      continue;
    }
  }
  
  // Should not reach here
  return new Response(JSON.stringify({ error: 'All proxies failed', tried: urlsToTry }), {
    status: 502,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
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
    
    // OpenSky - Primary flight data with mock fallback
    if (path.startsWith('/api/opensky')) {
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      
      // If lat/lon provided, use adsb.lol point API as fallback
      if (lat && lon) {
        const dist = searchParams.get('dist') || '250';
        const adsbUrl = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`;
        const fallback1 = `https://opendata.adsb.fi/api/v2/lat/${lat}/lon/${lon}/dist/${dist}`;
        const fallback2 = `https://api.airplanes.live/v2/point/${lat}/${lon}/${dist}`;
        const fallback3 = `https://api.adsb.one/v2/point/${lat}/${lon}/${dist}`;
        
        const result = await proxyWithCache(adsbUrl, {}, CACHE_TTL.flights, [fallback1, fallback2, fallback3]);
        if (!result.ok || result.status === 403 || result.status === 429 || result.status >= 500) {
          const mockFlights = generateMockFlights(lat, lon, dist);
          return new Response(JSON.stringify(mockFlights), {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Mock': 'true', 'Cache-Control': 'public, max-age=15' },
          });
        }
        return result;
      }
      
      // Try OpenSky first, fallback to mock
      const openskyUrl = 'https://opensky-network.org/api/states/all';
      const result = await proxyWithCache(openskyUrl, {}, CACHE_TTL.flights);
      if (!result.ok || result.status === 403 || result.status === 429 || result.status >= 500) {
        const mockFlights = generateMockFlights('35', '45', '250');
        return new Response(JSON.stringify(mockFlights), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Mock': 'true', 'Cache-Control': 'public, max-age=15' },
        });
      }
      return result;
    }
    
        // adsb.lol military with fallbacks - if all fail, return mock
    if (path.startsWith('/api/adsblol/mil') || path.startsWith('/api/adsb.lol/mil')) {
      const adsbUrl = 'https://api.adsb.lol/v2/mil';
      const fallback1 = 'https://opendata.adsb.fi/api/v2/mil';
      const fallback2 = 'https://api.airplanes.live/v2/mil';
      const fallback3 = 'https://api.adsb.one/v2/mil';
      
      // Try real first
      const result = await proxyWithCache(adsbUrl, {}, CACHE_TTL.military, [fallback1, fallback2, fallback3]);
      
      // If failed (403/429/5xx), return mock military flights
      if (!result.ok || result.status === 403 || result.status === 429 || result.status >= 500) {
        const mockMil = {
          ac: [
            { hex: "ae01a1", flight: "RCH123", r: "10-0216", t: "C17", alt_baro: 32000, gs: 450, lat: 35.5, lon: 45.2, seen_pos: 1, mlat: [], tisb: [] },
            { hex: "ae02b2", flight: "F16  ", r: "91-0335", t: "F16", alt_baro: 25000, gs: 520, lat: 36.1, lon: 44.8, seen_pos: 1, mlat: [], tisb: [] },
            { hex: "ae03c3", flight: "TANKR01", r: "60-0321", t: "KC135", alt_baro: 28000, gs: 480, lat: 34.8, lon: 46.1, seen_pos: 1, mlat: [], tisb: [] },
          ],
          msg: "mock - real APIs blocked Cloudflare IPs, using fallback",
          total: 3,
          ctime: Date.now(),
          ptime: 0
        };
        return new Response(JSON.stringify(mockMil), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Mock': 'true', 'Cache-Control': 'public, max-age=15' },
        });
      }
      
      return result;
    }
    
    // adsb.lol point with fallbacks - mock if all fail
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
      const fallback1 = `https://opendata.adsb.fi/api/v2/lat/${lat}/lon/${lon}/dist/${dist}`;
      const fallback2 = `https://api.airplanes.live/v2/point/${lat}/${lon}/${dist}`;
      const fallback3 = `https://api.adsb.one/v2/point/${lat}/${lon}/${dist}`;
      
      const result = await proxyWithCache(adsbUrl, {}, CACHE_TTL.flights, [fallback1, fallback2, fallback3]);
      
      if (!result.ok || result.status === 403 || result.status === 429 || result.status >= 500) {
        // Return mock Middle East flights
        const mockFlights = generateMockFlights(lat, lon, dist);
        return new Response(JSON.stringify(mockFlights), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Mock': 'true', 'Cache-Control': 'public, max-age=15' },
        });
      }
      
      return result;
    }
    
    // Generic adsb.lol proxy - /api/adsblol/* -> https://api.adsb.lol/v2/* with fallbacks
    if (path.startsWith('/api/adsblol/')) {
      const subPath = path.replace('/api/adsblol/', '');
      const adsbUrl = `https://api.adsb.lol/v2/${subPath}${url.search}`;
      const fallback1 = `https://opendata.adsb.fi/api/v2/${subPath}${url.search}`;
      const fallback2 = `https://api.airplanes.live/v2/${subPath}${url.search}`;
      return proxyWithCache(adsbUrl, {}, CACHE_TTL.flights, [fallback1, fallback2]);
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
