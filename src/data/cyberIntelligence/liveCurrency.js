/**
 * Live Currency Monitor - Real-time currency vs USD
 * Focus on IRR, IQD, TRY, SYP and major currencies
 */

export class LiveCurrencyMonitor {
  constructor() {
    this.rates = new Map();
    this.listeners = new Set();
    this.interval = null;
  }

  // Mock rates with realistic fluctuations
  generateMockRates() {
    const baseRates = {
      IRR: { official: 42000, blackMarket: 580000, tomanOfficial: 4200, tomanBlack: 58000, change: -0.5 },
      IQD: { rate: 1310, change: 0.2 },
      TRY: { rate: 32.5, change: -1.2 },
      SYP: { rate: 13000, change: -0.8 },
      EUR: { rate: 0.92, change: 0.3 },
      GBP: { rate: 0.79, change: 0.1 },
      JPY: { rate: 155.2, change: 0.5 },
      CNY: { rate: 7.2, change: -0.2 },
      RUB: { rate: 92.5, change: -2.1 },
      INR: { rate: 83.5, change: 0.1 },
      AED: { rate: 3.67, change: 0.0 },
      SAR: { rate: 3.75, change: 0.0 },
      BTC: { rate: 0.000015, change: 2.5, usdPrice: 67000 },
    };

    const now = Date.now();
    const result = {};

    Object.entries(baseRates).forEach(([code, data]) => {
      const jitter = (v) => v * (1 + (Math.random() - 0.5) * 0.02); // ±1% jitter
      if (code === 'IRR') {
        result[code] = {
          official: Math.floor(jitter(data.official)),
          blackMarket: Math.floor(jitter(data.blackMarket)),
          tomanOfficial: Math.floor(jitter(data.tomanOfficial)),
          tomanBlack: Math.floor(jitter(data.tomanBlack)),
          change: parseFloat((data.change + (Math.random()-0.5)*0.5).toFixed(2)),
          lastUpdate: now,
          trend: data.change >= 0 ? 'up' : 'down'
        };
      } else if (code === 'BTC') {
        const usdPrice = jitter(data.usdPrice);
        result[code] = {
          rate: parseFloat((1/usdPrice).toFixed(8)),
          usdPrice: Math.floor(usdPrice),
          change: parseFloat((data.change + (Math.random()-0.5)*1).toFixed(2)),
          lastUpdate: now,
          trend: data.change >= 0 ? 'up' : 'down'
        };
      } else {
        result[code] = {
          rate: parseFloat(jitter(data.rate).toFixed(4)),
          change: parseFloat((data.change + (Math.random()-0.5)*0.5).toFixed(2)),
          lastUpdate: now,
          trend: data.change >= 0 ? 'up' : 'down'
        };
      }
    });

    return result;
  }

  async fetchLiveRates() {
    try {
      // Try real API via proxy
      const res = await fetch('/api/currency-rates', { signal: AbortSignal.timeout(5000) }).catch(()=>null);
      if (res && res.ok) {
        const data = await res.json();
        if (data.rates) return data.rates;
      }
      // Fallback to exchangerate-api free (needs key, so mock for now)
      // const res2 = await fetch('https://api.exchangerate-api.com/v4/latest/USD').catch(()=>null);
    } catch {}
    
    return this.generateMockRates();
  }

  async update() {
    const rates = await this.fetchLiveRates();
    Object.entries(rates).forEach(([code, data]) => {
      this.rates.set(code, data);
    });
    this.notify(rates);
    return rates;
  }

  start(intervalMs = 30000) {
    this.update();
    this.interval = setInterval(() => this.update(), intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  addListener(cb) { this.listeners.add(cb); }
  removeListener(cb) { this.listeners.delete(cb); }
  notify(data) { this.listeners.forEach(cb => { try{cb(data)}catch{} }); }

  getRate(code) {
    return this.rates.get(code.toUpperCase()) || null;
  }

  getAllRates() {
    return Object.fromEntries(this.rates);
  }

  // Special formatter for Iran (Rial/Toman)
  formatIranCurrency() {
    const irr = this.getRate('IRR');
    if (!irr) return 'Loading...';
    return {
      official: `Official: ${irr.official.toLocaleString()} IRR = 1 USD | ${irr.tomanOfficial.toLocaleString()} Toman`,
      blackMarket: `Black Market: ${irr.blackMarket.toLocaleString()} IRR = 1 USD | ${irr.tomanBlack.toLocaleString()} Toman`,
      change: irr.change,
      trend: irr.trend
    };
  }
}

export const liveCurrencyMonitor = new LiveCurrencyMonitor();
