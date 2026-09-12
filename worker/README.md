# God's Eye View - Cloudflare Worker Proxy

This worker proxies all real APIs with CORS headers so GitHub Pages can fetch real data, not mock.

## Why needed?

GitHub Pages is static hosting - no backend. The main app uses `/api/*` proxies via Vite dev server for:
- OpenSky Network (flights)
- adsb.lol (military flights)
- USGS (earthquakes) - already CORS
- etc.

On `github.io`, `/api/*` returns 404 → red UNAVAILABLE.

This worker proxies real APIs with `Access-Control-Allow-Origin: *` so browser can fetch directly.

## Deploy (2 minutes)

### Option 1: Cloudflare Dashboard (Easiest)

1. Go to https://dash.cloudflare.com/ → Workers & Pages → Create Application → Create Worker
2. Name: `gods-eye-view-proxy`
3. Click "Deploy" then "Edit Code"
4. Copy paste `worker/index.js` content
5. Save and Deploy
6. Copy your worker URL: `https://gods-eye-view-proxy.your-subdomain.workers.dev`
7. Update `src/config/proxy.js`: set `WORKER_URL = 'https://your-worker-url'`
8. Commit and push - flights will be REAL on GitHub Pages!

### Option 2: Wrangler CLI

```bash
npm install -g wrangler
wrangler login
cd worker
wrangler deploy
```

Copy the URL it gives you.

### Option 3: Use existing public proxy (temporary)

If you don't want to deploy, the app will try:
- `https://api.allorigins.win/raw?url=...`
- `https://thingproxy.freeboard.io/fetch/...`

But these are unreliable. Better to deploy your own worker (free tier: 100k requests/day).

## Endpoints proxied

- `/api/opensky?lat=35&lon=45` → `https://api.adsb.lol/v2/lat/35/lon/45/dist/250`
- `/api/adsblol/mil` → `https://api.adsb.lol/v2/mil`
- `/api/earthquakes` → USGS
- `/api/currency` → open.er-api.com (REAL rates)
- `/api/cisa` → CISA KEV (1709 real CVEs)
- `/api/urlhaus` → URLhaus (real phishing URLs)
- `/api/btc` → coingecko (real BTC price)
- Generic: `/api/proxy?url=ENCODED_URL` - proxies any allowed domain with CORS

## Cost

Cloudflare Workers free tier:
- 100,000 requests/day
- 10ms CPU per request
- Enough for personal use

If you need more, $5/month for 10M requests.

## Security

Worker only allows specific domains:
- api.adsb.lol
- api.airplanes.live
- opensky-network.org
- earthquake.usgs.gov
- open.er-api.com
- api.coingecko.com
- cisa.gov
- urlhaus.abuse.ch

Prevents abuse as open proxy.

## After deploying

Update `src/config/proxy.js`:

```js
export const WORKER_URL = 'https://gods-eye-view-proxy.yourname.workers.dev';
```

Then:

```bash
git add src/config/proxy.js
git commit -m "Add real proxy worker URL"
git push
```

Wait 1 minute for GitHub Pages deploy, then test with `?v=YOUR_COMMIT`.

Flights, military, etc. will be REAL, not mock, not red UNAVAILABLE.

## فارسی

این ورکر همه APIها رو با CORS پراکسی میکنه تا GitHub Pages بتونه دیتای واقعی بگیره.

### دیپلوی:

1. برو https://dash.cloudflare.com/ → Workers → Create Worker
2. اسم: `gods-eye-view-proxy`
3. کد `worker/index.js` رو paste کن
4. Deploy کن
5. URL رو کپی کن: `https://...workers.dev`
6. تو `src/config/proxy.js` بذار:
```js
export const WORKER_URL = 'https://url-تو.workers.dev';
```
7. پوش کن - دیگه قرمز نیست، واقعی میشه!

رایگان: 100k درخواست در روز
