/**
 * Telegram Prices - Dollar & Gold to Toman from Telegram Channels
 * Scrapes public t.me/s/ pages without needing Telegram API key
 * For full MTProto, need api_id/api_hash
 * 
 * Popular channels:
 * - @Bonbast - bonbast.com - دلار، طلا
 * - @TalaSard - طلا و سکه
 * - @nerkhbazar - نرخ بازار
 * - @dollar_tehran - دلار تهران
 * - @prices_ir - قیمت‌ها
 */

const CACHE = new Map();
const CACHE_TTL = 30000; // 30 sec

function getCached(key) {
  const e = CACHE.get(key);
  if (e && Date.now() - e.ts < CACHE_TTL) return e.data;
  return null;
}
function setCached(key, data) { CACHE.set(key, { ts: Date.now(), data }); }

// Parse Persian numbers
function parsePersianNumber(str) {
  if (!str) return null;
  // Convert Persian digits to English
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const englishDigits = '0123456789';
  let cleaned = str;
  for (let i = 0; i < 10; i++) {
    cleaned = cleaned.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
  }
  // Remove commas, spaces, تومان, ریال
  cleaned = cleaned.replace(/[,،\s]/g, '').replace(/تومان|ریال|دلار|Toman|Rial/g, '');
  const num = parseInt(cleaned);
  return Number.isFinite(num) ? num : null;
}

// Scrape t.me/s/ channel public page
async function scrapeTelegramChannel(channel) {
  try {
    const url = `https://t.me/s/${channel}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    
    // Extract messages - look for price patterns
    // Pattern: دلار ... 58,000 تومان or طلا ... 
    const dollarPatterns = [
      /دلار[^0-9]*([۰-۹0-9,،]+)\s*تومان/g,
      /Dollar[^0-9]*([0-9,]+)\s*Toman/gi,
      /USD[^0-9]*([0-9,]+)/gi,
    ];
    
    const goldPatterns = [
      /طلا[^0-9]*([۰-۹0-9,،]+)/g,
      /سکه[^0-9]*([۰-۹0-9,،]+)/g,
      /Gold[^0-9]*([0-9,]+)/gi,
    ];

    const messages = [];
    // Simple extraction of message text from t.me/s/ HTML
    const msgRegex = /<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/g;
    let match;
    let count = 0;
    while ((match = msgRegex.exec(html)) !== null && count < 20) {
      const text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 10) {
        messages.push(text);
        count++;
      }
    }

    return { channel, messages, htmlLength: html.length, scrapedAt: Date.now() };
  } catch (e) {
    return { channel, error: e.message, messages: [], scrapedAt: Date.now() };
  }
}

// Mock prices based on real Bonbast pattern
function generateMockTelegramPrices() {
  const now = Date.now();
  const baseDollar = 58000 + Math.floor((Math.random()-0.5)*2000); // Toman
  const baseGold = 3500000 + Math.floor((Math.random()-0.5)*100000); // Toman per gram 18k
  
  return {
    dollar: {
      tehran: baseDollar,
      bonbast: baseDollar + Math.floor((Math.random()-0.5)*500),
      herat: baseDollar - 200 + Math.floor((Math.random()-0.5)*500),
      sulaymaniyah: baseDollar + 100 + Math.floor((Math.random()-0.5)*500), // سلیمانی
      change: parseFloat(((Math.random()-0.5)*2).toFixed(2)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      unit: 'تومان',
      source: 'Telegram @Bonbast + @dollar_tehran MOCK'
    },
    gold: {
      gram18k: baseGold,
      gram24k: Math.floor(baseGold * 1.333),
      ounce: Math.floor(baseGold * 31.1),
      sekeEmami: baseGold * 8.13 + Math.floor((Math.random()-0.5)*500000), // سکه امامی
      sekeBahar: baseGold * 8.13 - 100000 + Math.floor((Math.random()-0.5)*500000),
      change: parseFloat(((Math.random()-0.5)*1.5).toFixed(2)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      unit: 'تومان',
      source: 'Telegram @TalaSard MOCK'
    },
    timestamp: now,
    real: false
  };
}

export function telegramPricesProxy() {
  return {
    name: 'telegram-prices-proxy',
    configureServer(server) {
      server.middlewares.use('/api/telegram-prices', async (req, res) => {
        if (req.method !== 'GET') { res.statusCode = 405; res.end('{}'); return; }
        
        const url = new URL(req.url, 'http://localhost');
        const channel = url.searchParams.get('channel') || 'all';
        
        const cacheKey = `tg-${channel}`;
        const cached = getCached(cacheKey);
        if (cached) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(cached));
          return;
        }

        // Try scrape real Telegram channels (public t.me/s/ without API key)
        if (channel !== 'all') {
          const scraped = await scrapeTelegramChannel(channel);
          const result = {
            channel,
            scraped,
            prices: generateMockTelegramPrices(), // For now mock prices, but with real channel messages
            note: 'Scraped t.me/s/ public page - no API key needed. For full MTProto need api_id/api_hash',
            timestamp: Date.now(),
            real: scraped.messages.length > 0
          };
          setCached(cacheKey, result);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
          return;
        }

        // All channels
        try {
          // Try scrape 2-3 popular channels in parallel
          const channels = ['bonbast', 'dollar_tehran', 'TalaSard'];
          const results = await Promise.all(
            channels.map(ch => scrapeTelegramChannel(ch).catch(() => ({ channel: ch, messages: [], error: 'failed' })))
          );
          
          const prices = generateMockTelegramPrices();
          // If we got real messages, try parse prices from them
          results.forEach(r => {
            if (r.messages && r.messages.length) {
              r.messages.forEach(msg => {
                // Look for dollar price in message
                const dollarMatch = msg.match(/([۰-۹0-9,،]{4,})\s*تومان/);
                if (dollarMatch) {
                  const num = parsePersianNumber(dollarMatch[1]);
                  if (num && num > 10000 && num < 200000) {
                    prices.dollar.bonbast = num;
                    prices.dollar.source = `Telegram @${r.channel} REAL scraped`;
                    prices.real = true;
                  }
                }
              });
            }
          });

          const result = {
            channels: results,
            prices,
            sources: ['t.me/s/bonbast', 't.me/s/dollar_tehran', 't.me/s/TalaSard'],
            howTo: {
              noKey: 't.me/s/CHANNEL - public page scraping, no API key, we do this now',
              withKey: 'Telegram MTProto - need api_id/api_hash from my.telegram.org + channel access',
              bot: 'Bot API - create bot @BotFather, add to channel as admin, get updates'
            },
            timestamp: Date.now(),
            real: results.some(r => r.messages.length > 0)
          };
          
          setCached(cacheKey, result);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(result));
          return;
          
        } catch (e) {
          console.warn('[Telegram] Failed', e.message);
        }

        // Fallback mock
        const mock = {
          prices: generateMockTelegramPrices(),
          source: 'Mock - Telegram channels require scraping',
          timestamp: Date.now(),
          real: false
        };
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(mock));
      });

      // Specific endpoint for Bonbast
      server.middlewares.use('/api/bonbast', async (req, res) => {
        const cached = getCached('bonbast');
        if (cached) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(cached));
          return;
        }

        try {
          // Try bonbast.com API (unofficial)
          const bonbastRes = await fetch('https://bonbast.com/api', { signal: AbortSignal.timeout(5000) }).catch(()=>null);
          if (bonbastRes && bonbastRes.ok) {
            const data = await bonbastRes.json();
            const result = { data, source: 'bonbast.com REAL', timestamp: Date.now(), real: true };
            setCached('bonbast', result);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify(result));
            return;
          }
        } catch {}

        // Mock bonbast
        const mock = {
          usd: { buy: 57900, sell: 58100, change: 150 },
          eur: { buy: 63000, sell: 63200 },
          gold_18k: 3500000,
          seke_emami: 28500000,
          source: 'Mock bonbast',
          timestamp: Date.now(),
          real: false
        };
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(mock));
      });
    }
  };
}
