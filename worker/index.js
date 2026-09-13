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

function generateMockMilitaryInstallations(south, west, north, east) {
  // Mock military installations for bbox - some in Middle East
  const mockBases = [
    { id: 1, lat: 35.68, lon: 51.38, tags: { name: "Tehran Air Base", military: "airfield" } },
    { id: 2, lat: 36.19, lon: 44.00, tags: { name: "Erbil Air Base", military: "airfield" } },
    { id: 3, lat: 33.31, lon: 44.36, tags: { name: "Baghdad Military Complex", military: "barracks" } },
    { id: 4, lat: 25.20, lon: 55.27, tags: { name: "Al Dhafra Air Base", military: "airfield" } },
    { id: 5, lat: 41.00, lon: 28.97, tags: { name: "Istanbul Military Zone", military: "base" } },
    { id: 6, lat: 32.08, lon: 34.78, tags: { name: "Tel Aviv Base", military: "base" } },
    { id: 7, lat: 29.37, lon: 47.97, tags: { name: "Kuwait Military Base", military: "base" } },
    { id: 8, lat: 24.71, lon: 46.67, tags: { name: "Riyadh Air Base", military: "airfield" } },
  ];
  
  return mockBases
    .filter(b => b.lat >= south && b.lat <= north && b.lon >= west && b.lon <= east)
    .map(b => ({
      type: "node",
      id: b.id,
      lat: b.lat,
      lon: b.lon,
      tags: b.tags,
      center: { lat: b.lat, lon: b.lon },
    }));
}

function parseFirmsCsvSimple(csv) {
  // Simple CSV parser for FIRMS
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const latIdx = headers.indexOf('latitude');
  const lonIdx = headers.indexOf('longitude');
  const brightIdx = headers.indexOf('bright_ti4') !== -1 ? headers.indexOf('bright_ti4') : headers.indexOf('brightness');
  const frpIdx = headers.indexOf('frp');
  const confIdx = headers.indexOf('confidence');
  const acqDateIdx = headers.indexOf('acq_date');
  const acqTimeIdx = headers.indexOf('acq_time');
  
  const fires = [];
  for (let i = 1; i < Math.min(lines.length, 10000); i++) {
    const cols = lines[i].split(',');
    if (cols.length < 3) continue;
    const lat = parseFloat(cols[latIdx]);
    const lon = parseFloat(cols[lonIdx]);
    if (!isFinite(lat) || !isFinite(lon)) continue;
    fires.push({
      lat,
      lon,
      frp: parseFloat(cols[frpIdx]) || 10,
      confidence: cols[confIdx] || 'n',
      brightness: parseFloat(cols[brightIdx]) || 300,
      acqMs: Date.now(),
      satellite: 'VIIRS',
      sensor: 'VIIRS',
      night: false,
      index: fires.length,
    });
  }
  return fires;
}

function generateMockFires() {
  // Generate mock fires around world + Middle East focus
  const regions = [
    { lat: 35.68, lon: 51.38, count: 5 }, // Tehran
    { lat: 36.19, lon: 44.00, count: 3 }, // Erbil
    { lat: 33.31, lon: 44.36, count: 4 }, // Baghdad
    { lat: 41.00, lon: 28.97, count: 8 }, // Istanbul - more fires
    { lat: 25.20, lon: 55.27, count: 2 }, // Dubai
    { lat: 34.05, lon: -118.24, count: 15 }, // California wildfires
    { lat: 38.90, lon: -77.03, count: 2 }, // DC area
    { lat: -33.86, lon: 151.20, count: 10 }, // Australia
    { lat: 55.75, lon: 37.61, count: 12 }, // Russia
    { lat: 6.5, lon: -10, count: 20 }, // Africa
  ];
  
  const fires = [];
  regions.forEach(region => {
    for (let i = 0; i < region.count; i++) {
      const latOffset = (Math.random() - 0.5) * 2;
      const lonOffset = (Math.random() - 0.5) * 2;
      fires.push({
        lat: region.lat + latOffset,
        lon: region.lon + lonOffset,
        frp: Math.random() * 100 + 5,
        confidence: Math.random() > 0.5 ? 'h' : 'n',
        brightness: 300 + Math.random() * 100,
        acqMs: Date.now() - Math.random() * 24 * 3600 * 1000,
        satellite: Math.random() > 0.5 ? 'N' : 'N21',
        sensor: 'VIIRS',
        night: Math.random() > 0.7,
        index: fires.length,
      });
    }
  });
  return fires;
}

function generateMockVessels(maxCount = 1000) {
  const vesselTypes = ['Cargo', 'Tanker', 'Fishing', 'Tug', 'Passenger', 'Military'];
  const regions = [
    { lat: 25.20, lon: 55.27, count: 40, name: 'Dubai Port' }, // Persian Gulf busy
    { lat: 35.68, lon: 51.38, count: 5, name: 'Caspian' },
    { lat: 41.00, lon: 28.97, count: 60, name: 'Bosphorus - Istanbul' }, // Very busy strait
    { lat: 33.31, lon: 44.36, count: 10, name: 'Persian Gulf' },
    { lat: 36.19, lon: 44.00, count: 5, name: 'Inland' },
    { lat: 40.71, lon: -74.00, count: 50, name: 'New York' },
    { lat: 51.50, lon: -0.12, count: 40, name: 'London Thames' },
    { lat: 35.68, lon: 139.69, count: 50, name: 'Tokyo Bay' },
  ];
  
  const vessels = [];
  regions.forEach(region => {
    for (let i = 0; i < region.count && vessels.length < maxCount; i++) {
      const latOffset = (Math.random() - 0.5) * 2;
      const lonOffset = (Math.random() - 0.5) * 2;
      const mmsi = String(100000000 + Math.floor(Math.random() * 900000000));
      vessels.push({
        mmsi,
        name: `${region.name} ${vesselTypes[Math.floor(Math.random() * vesselTypes.length)]} ${i + 1}`,
        lat: region.lat + latOffset,
        lon: region.lon + lonOffset,
        speed: Math.random() * 15 + 2,
        course: Math.random() * 360,
        heading: Math.random() * 360,
        type: vesselTypes[Math.floor(Math.random() * vesselTypes.length)],
        type_specific: vesselTypes[Math.floor(Math.random() * vesselTypes.length)],
        destination: region.name,
        last_position_UTC: new Date().toISOString(),
        last_position_epoch: Date.now() / 1000,
        imo: String(9000000 + Math.floor(Math.random() * 999999)),
      });
    }
  });
  
  return vessels.slice(0, maxCount);
}

function generateMockVesselTrack(mmsi) {
  // Generate mock track for a vessel
  const baseLat = 25 + Math.random() * 10;
  const baseLon = 55 + Math.random() * 10;
  const samples = [];
  for (let i = 0; i < 20; i++) {
    samples.push({
      lat: baseLat + (Math.random() - 0.5) * 0.5 + i * 0.01,
      lon: baseLon + (Math.random() - 0.5) * 0.5 + i * 0.01,
      timestamp: Date.now() - (20 - i) * 60000,
    });
  }
  return samples;
}

function getCctvSeedSources() {
  // Seed catalog from src/data/cctv.js CAMERA_SEEDS
  return [
    { id: 'tehran-azadi-w', name: 'Azadi Square West - میدان آزادی', city: 'Tehran', cityId: 'tehran', provider: 'Tehran Traffic', lat: 35.6997, lon: 51.3378, headingDeg: 95, fovDeg: 72, rangeM: 850, mountHeightM: 28, groundElevationM: 1200, feedType: 'image', sourceKind: 'seed' },
    { id: 'tehran-milad-n', name: 'Milad Tower North', city: 'Tehran', cityId: 'tehran', provider: 'Tehran Traffic', lat: 35.7448, lon: 51.3753, headingDeg: 180, fovDeg: 70, rangeM: 900, mountHeightM: 32, groundElevationM: 1250, feedType: 'image', sourceKind: 'seed' },
    { id: 'tehran-valiasr-s', name: 'Valiasr Square South', city: 'Tehran', cityId: 'tehran', provider: 'Tehran Traffic', lat: 35.7152, lon: 51.4078, headingDeg: 10, fovDeg: 68, rangeM: 750, mountHeightM: 24, groundElevationM: 1180, feedType: 'image', sourceKind: 'seed' },
    { id: 'erbil-citadel-n', name: 'Erbil Citadel North - قەڵا', city: 'Erbil', cityId: 'erbil', provider: 'Erbil Traffic', lat: 36.1925, lon: 44.0084, headingDeg: 185, fovDeg: 70, rangeM: 720, mountHeightM: 30, groundElevationM: 420, feedType: 'image', sourceKind: 'seed' },
    { id: 'erbil-airport-e', name: 'Erbil Airport East', city: 'Erbil', cityId: 'erbil', provider: 'Erbil Traffic', lat: 36.2375, lon: 44.0211, headingDeg: 270, fovDeg: 68, rangeM: 800, mountHeightM: 26, groundElevationM: 410, feedType: 'image', sourceKind: 'seed' },
    { id: 'slemani-salem-st', name: 'Salem Street - شەقامی سالم', city: 'Slemani', cityId: 'slemani', provider: 'Slemani Traffic', lat: 35.5651, lon: 45.4321, headingDeg: 210, fovDeg: 70, rangeM: 700, mountHeightM: 22, groundElevationM: 800, feedType: 'image', sourceKind: 'seed' },
    { id: 'duhok-zawa', name: 'Zawa Mountain View', city: 'Duhok', cityId: 'duhok', provider: 'Duhok Traffic', lat: 36.8851, lon: 42.9884, headingDeg: 170, fovDeg: 78, rangeM: 950, mountHeightM: 35, groundElevationM: 600, feedType: 'image', sourceKind: 'seed' },
    { id: 'baghdad-green-zone', name: 'Baghdad Green Zone Gate', city: 'Baghdad', cityId: 'baghdad', provider: 'Baghdad Traffic', lat: 33.3152, lon: 44.3661, headingDeg: 220, fovDeg: 70, rangeM: 750, mountHeightM: 24, groundElevationM: 34, feedType: 'image', sourceKind: 'seed' },
    { id: 'istanbul-bosphorus', name: 'Bosphorus Bridge View', city: 'Istanbul', cityId: 'istanbul', provider: 'Istanbul Traffic', lat: 41.0082, lon: 29.0784, headingDeg: 135, fovDeg: 76, rangeM: 900, mountHeightM: 30, groundElevationM: 50, feedType: 'image', sourceKind: 'seed' },
    { id: 'nyc-midtown-w', name: 'Midtown West @ 34th', city: 'New York', cityId: 'nyc', provider: 'NYC DOT', lat: 40.7589, lon: -73.9851, headingDeg: 206, fovDeg: 74, rangeM: 880, mountHeightM: 26, groundElevationM: 10, feedType: 'image', sourceKind: 'seed' },
    { id: 'london-city-a1', name: 'City Cluster A1', city: 'London', cityId: 'london', provider: 'TfL', lat: 51.5154, lon: -0.0928, headingDeg: 220, fovDeg: 71, rangeM: 720, mountHeightM: 27, groundElevationM: 15, feedType: 'image', sourceKind: 'seed' },
    { id: 'dubai-difc-loop', name: 'DIFC Loop', city: 'Dubai', cityId: 'dubai', provider: 'Dubai RTA', lat: 25.2048, lon: 55.2708, headingDeg: 196, fovDeg: 70, rangeM: 720, mountHeightM: 26, groundElevationM: 5, feedType: 'image', sourceKind: 'seed' },
  ];
}

function generateCctvPlaceholderSvg(cameraId, label, city) {
  const hue = Math.abs(hashString(cameraId)) % 360;
  const hue2 = (hue + 46) % 360;
  const now = new Date().toISOString().slice(0, 19) + 'Z';
  const safeLabel = label.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const safeCity = city.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const safeId = cameraId.replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  
  return `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"960\" height=\"540\" viewBox=\"0 0 960 540\">
  <defs>
    <linearGradient id=\"bg\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">
      <stop offset=\"0%\" stop-color=\"hsl(${hue}, 35%, 10%)\" />
      <stop offset=\"60%\" stop-color=\"hsl(${hue2}, 42%, 6%)\" />
      <stop offset=\"100%\" stop-color=\"#020509\" />
    </linearGradient>
    <pattern id=\"scan\" width=\"8\" height=\"8\" patternUnits=\"userSpaceOnUse\">
      <rect width=\"8\" height=\"8\" fill=\"transparent\" />
      <rect y=\"0\" width=\"8\" height=\"1\" fill=\"rgba(255,255,255,0.08)\" />
      <rect y=\"4\" width=\"8\" height=\"1\" fill=\"rgba(255,255,255,0.05)\" />
    </pattern>
  </defs>
  <rect width=\"960\" height=\"540\" fill=\"url(#bg)\" />
  <rect width=\"960\" height=\"540\" fill=\"url(#scan)\" />
  <g fill=\"none\" stroke=\"rgba(180,248,255,0.2)\" stroke-width=\"1\">
    <rect x=\"70\" y=\"80\" width=\"820\" height=\"380\" rx=\"8\" />
    <line x1=\"70\" y1=\"270\" x2=\"890\" y2=\"270\" />
    <line x1=\"480\" y1=\"80\" x2=\"480\" y2=\"460\" />
  </g>
  <g fill=\"#9cefff\" font-family=\"monospace\" text-transform=\"uppercase\">
    <text x=\"74\" y=\"54\" font-size=\"16\" letter-spacing=\"2\">CCTV LIVE - GITHUB PAGES</text>
    <text x=\"74\" y=\"512\" font-size=\"14\" letter-spacing=\"1.5\">${safeLabel} · ${safeCity}</text>
    <text x=\"74\" y=\"486\" font-size=\"13\" letter-spacing=\"1.3\">${safeId} · PLACEHOLDER FRAME</text>
    <text x=\"704\" y=\"54\" font-size=\"12\">${now}</text>
    <text x=\"74\" y=\"100\" font-size=\"12\" fill=\"rgba(255,255,255,0.5)\">GitHub Pages - Seed catalog, no live upstream</text>
  </g>
</svg>`;
}

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

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
        version: '2.0',
        endpoints: [
          '/api/opensky?lat=35&lon=45&dist=250',
          '/api/adsblol/mil',
          '/api/adsblol/point?lat=35&lon=45&dist=250',
          '/api/earthquakes',
          '/api/satellites',
          '/api/currency',
          '/api/btc',
          '/api/cisa',
          '/api/urlhaus',
          '/api/military-installations?south=35&west=44&north=37&east=46',
          '/api/overpass (POST)',
          '/api/firms',
          '/api/ais-live?maxRows=1000',
          '/api/ais-live/track?mmsi=123',
          '/api/cctv/sources',
          '/api/cctv/health',
          '/api/cctv/frame/{id}?label=&city=&lat=&lon=',
          '/api/cctv/stream/{id}',
        ],
        github: 'https://github.com/arammoostafaye/gods-eye-view',
        cors: 'Access-Control-Allow-Origin: *',
        mock: 'Some endpoints return mock when real APIs block Cloudflare or need API keys',
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

    // ===== NEW: Military Installations - Overpass API proxy =====
    if (path.startsWith('/api/military-installations')) {
      const south = searchParams.get('south');
      const west = searchParams.get('west');
      const north = searchParams.get('north');
      const east = searchParams.get('east');
      
      if (!south || !west || !north || !east) {
        return new Response(JSON.stringify({ error: 'bbox required: south,west,north,east' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      
      // Validate bbox size (max 10 degrees)
      const southNum = parseFloat(south);
      const northNum = parseFloat(north);
      const westNum = parseFloat(west);
      const eastNum = parseFloat(east);
      if (Math.abs(northNum - southNum) > 10 || Math.abs(eastNum - westNum) > 10) {
        return new Response(JSON.stringify({ error: 'bbox too large, max 10 degrees' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      
      const bbox = `${south},${west},${north},${east}`;
      const ql = `[out:json][timeout:20];(nwr[\"military\"~\"^(airfield|naval_base|range|barracks|base)$\"](${bbox});nwr[\"landuse\"=\"military\"](${bbox}););out center tags geom 700;`;
      
      const overpassUrls = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://overpass.private.coffee/api/interpreter',
      ];
      
      for (const overpassUrl of overpassUrls) {
        try {
          const res = await fetch(overpassUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'gods-eye-view-proxy/1.0',
            },
            body: `data=${encodeURIComponent(ql)}`,
            signal: AbortSignal.timeout(15000),
          });
          
          if (!res.ok) continue;
          const data = await res.json();
          const elements = Array.isArray(data.elements) ? data.elements.slice(0, 700) : [];
          
          const payload = {
            elements,
            saturated: elements.length >= 700,
            elementCap: 700,
            retrievedAt: new Date().toISOString(),
            status: 'ready',
            source: 'overpass',
            overpass: overpassUrl,
          };
          
          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
          });
        } catch (e) {
          continue;
        }
      }
      
      // If all Overpass fail, return empty but OK (not UNAVAILABLE) - with mock fallback for Middle East
      const mockElements = generateMockMilitaryInstallations(southNum, westNum, northNum, eastNum);
      return new Response(JSON.stringify({
        elements: mockElements,
        saturated: false,
        elementCap: 700,
        retrievedAt: new Date().toISOString(),
        status: 'mock',
        source: 'mock - overpass blocked',
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Mock': 'true' },
      });
    }

    // ===== NEW: Overpass direct proxy =====
    if (path.startsWith('/api/overpass')) {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed, use POST' }), {
          status: 405,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      
      try {
        const body = await request.text();
        // Simple validation - must have data param
        if (!body.includes('data=')) {
          return new Response(JSON.stringify({ error: 'Missing data param' }), {
            status: 400,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
        
        const overpassUrls = [
          'https://overpass-api.de/api/interpreter',
          'https://overpass.kumi.systems/api/interpreter',
          'https://overpass.private.coffee/api/interpreter',
        ];
        
        for (const overpassUrl of overpassUrls) {
          try {
            const res = await fetch(overpassUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'gods-eye-view-proxy/1.0',
              },
              body,
              signal: AbortSignal.timeout(15000),
            });
            const text = await res.text();
            return new Response(text, {
              status: res.status,
              headers: { ...CORS_HEADERS, 'Content-Type': res.headers.get('content-type') || 'application/json', 'Cache-Control': 'public, max-age=60' },
            });
          } catch (e) {
            continue;
          }
        }
        
        return new Response(JSON.stringify({ error: 'All Overpass mirrors failed' }), {
          status: 502,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // ===== NEW: FIRMS Active Fires - NASA FIRMS with mock fallback =====
    if (path.startsWith('/api/firms')) {
      // Try to get FIRMS data if key is available via env, otherwise mock
      const firmsKey = env?.FIRMS_MAP_KEY;
      
      if (firmsKey) {
        try {
          const sources = ['VIIRS_NOAA20_NRT', 'VIIRS_SNPP_NRT'];
          const allFires = [];
          
          for (const source of sources.slice(0, 2)) {
            try {
              const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${firmsKey}/${source}/world/1`;
              const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
              if (!res.ok) continue;
              const csv = await res.text();
              const fires = parseFirmsCsvSimple(csv);
              allFires.push(...fires);
              if (allFires.length > 5000) break;
            } catch (e) {
              continue;
            }
          }
          
          if (allFires.length > 0) {
            return new Response(JSON.stringify({
              fetchedAt: Date.now(),
              stale: false,
              ttlMs: 30 * 60 * 1000,
              sources: sources,
              count: allFires.length,
              fires: allFires.slice(0, 10000),
            }), {
              status: 200,
              headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
            });
          }
        } catch (e) {
          // fall through to mock
        }
      }
      
      // Mock fires for Middle East and world
      const mockFires = generateMockFires();
      return new Response(JSON.stringify({
        fetchedAt: Date.now(),
        stale: false,
        ttlMs: 30 * 60 * 1000,
        sources: ['MOCK'],
        count: mockFires.length,
        fires: mockFires,
        mock: true,
        message: 'Mock fires - set FIRMS_MAP_KEY in worker env for real data',
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Mock': 'true', 'Cache-Control': 'public, max-age=300' },
      });
    }

    // ===== NEW: AIS Live Vessels - mock fallback (AISStream needs websocket + key) =====
    if (path.startsWith('/api/ais-live')) {
      // Handle track sub-route
      if (path.includes('/track')) {
        const mmsi = searchParams.get('mmsi') || 'unknown';
        return new Response(JSON.stringify({
          mmsi,
          samples: generateMockVesselTrack(mmsi),
        }), {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
        });
      }
      
      // Main AIS live endpoint - mock vessels for GitHub Pages
      const maxRows = parseInt(searchParams.get('maxRows') || '12000');
      const mockVessels = generateMockVessels(maxRows);
      
      return new Response(JSON.stringify({
        status: 'live',
        rows: mockVessels,
        count: mockVessels.length,
        newestPositionAt: new Date().toISOString(),
        source: 'mock - set AISSTREAM_API_KEY for real feed',
        mock: true,
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'X-Mock': 'true', 'Cache-Control': 'public, max-age=30' },
      });
    }

    // ===== NEW: CCTV Sources - seed catalog for GitHub Pages =====
    if (path.startsWith('/api/cctv/sources')) {
      const sources = getCctvSeedSources();
      return new Response(JSON.stringify({ sources }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=900' },
      });
    }

    // ===== NEW: CCTV Health =====
    if (path.startsWith('/api/cctv/health')) {
      const sources = getCctvSeedSources();
      const cameras = sources.map(s => ({
        id: s.id,
        status: 'ok',
        sourceKind: 'seed',
        label: s.provider,
        message: 'Seed catalog - static frame',
        updatedAt: Date.now(),
      }));
      return new Response(JSON.stringify({ cameras }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
      });
    }

    // ===== NEW: CCTV Frame - placeholder SVG =====
    if (path.startsWith('/api/cctv/frame/')) {
      const cameraId = decodeURIComponent(path.replace('/api/cctv/frame/', '').split('?')[0]);
      const label = searchParams.get('label') || cameraId;
      const city = searchParams.get('city') || 'GLOBAL';
      
      // Try to fetch real frame from upstream if we have catalog with URLs
      // For GitHub Pages, return synthetic SVG placeholder
      const svg = generateCctvPlaceholderSvg(cameraId, label, city);
      
      return new Response(svg, {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store', 'X-CCTV-Source': 'synthetic' },
      });
    }

    // ===== NEW: CCTV Stream =====
    if (path.startsWith('/api/cctv/stream/')) {
      const cameraId = decodeURIComponent(path.replace('/api/cctv/stream/', '').split('?')[0]);
      return new Response(JSON.stringify({
        id: cameraId,
        feedType: 'image',
        mediaUrl: null,
        frameUrl: `/api/cctv/frame/${encodeURIComponent(cameraId)}`,
        provider: 'Seed Catalog',
        sourceKind: 'seed',
      }), {
        status: 200,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // ===== NEW: CCTV Media - proxy or 404 =====
    if (path.startsWith('/api/cctv/media/')) {
      return new Response(JSON.stringify({ error: 'No media URL for seed cameras - use frame endpoint' }), {
        status: 404,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }
    
    // Generic proxy for any /api/* - tries to map to known public APIs
    // For unknown paths, return 404 with CORS
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({
        error: `Unknown API endpoint: ${path}`,
        available: [
          '/api/opensky?lat=35&lon=45&dist=250',
          '/api/adsblol/mil',
          '/api/adsblol/point?lat=35&lon=45&dist=250',
          '/api/earthquakes',
          '/api/currency',
          '/api/btc',
          '/api/cisa',
          '/api/urlhaus',
          '/api/military-installations?south=35&west=44&north=37&east=46',
          '/api/overpass (POST)',
          '/api/firms',
          '/api/ais-live?maxRows=1000',
          '/api/cctv/sources',
          '/api/cctv/health',
          '/api/cctv/frame/{id}',
          '/api/cctv/stream/{id}',
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
          'opendata.adsb.fi',
          'api.adsb.one',
          'opensky-network.org',
          'earthquake.usgs.gov',
          'celestrak.org',
          'open.er-api.com',
          'api.coingecko.com',
          'www.cisa.gov',
          'urlhaus.abuse.ch',
          'api.ioda.inetintel.cc.gatech.edu',
          'overpass-api.de',
          'overpass.kumi.systems',
          'overpass.private.coffee',
          'lz4.overpass-api.de',
          'firms.modaps.eosdis.nasa.gov',
          'data.austintexas.gov',
          'cctv.austinmobility.io',
          'cwwp2.dot.ca.gov',
          'api.tfl.gov.uk',
          's3-eu-west-1.amazonaws.com',
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
