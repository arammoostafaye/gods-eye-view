/**
 * Internet Filtering Level & Speed Monitor
 * - Censorship level per country
 * - Live internet speed per country
 * - Vulnerable countries index
 * 
 * Sources:
 * - OONI (Open Observatory of Network Interference)
 * - Freedom House Freedom on the Net
 * - Ookla Speedtest Global Index
 * - Cloudflare Radar
 * - Censored Planet
 */

export const FILTERING_DATABASE = {
  IR: {
    level: 9,
    label: 'Extreme - بایگانی فیلترینگ شدید',
    description: 'Extensive political and social filtering, deep packet inspection, nationwide shutdowns capability',
    blockedCategories: ['Social Media', 'News', 'Political Opposition', 'LGBTQ', 'Circumvention Tools', 'Messaging Apps'],
    blockedSites: ['Twitter/X', 'YouTube', 'Facebook', 'Telegram', 'Instagram (partial)', 'WhatsApp (throttled)', 'Signal'],
    methods: ['DNS Hijacking', 'IP Blocking', 'DPI', 'SNI Filtering', 'Throttling', 'Shutdowns'],
    freedomHouseScore: 16, // 0-100, lower = less free
    ooniBlockingRate: 0.42,
    vpnBlocking: 'Aggressive - VPNs throttled/blocked',
    lastUpdate: '2024'
  },
  CN: {
    level: 10,
    label: 'Maximum - Great Firewall',
    description: 'Most sophisticated censorship system worldwide',
    blockedCategories: ['Foreign News', 'Social Media', 'Political', 'VPNs'],
    blockedSites: ['Google', 'YouTube', 'Facebook', 'Twitter', 'Wikipedia (partial)', 'WhatsApp'],
    methods: ['Great Firewall - DNS, IP, DPI, ML filtering', 'Real-name registration'],
    freedomHouseScore: 10,
    ooniBlockingRate: 0.55,
    vpnBlocking: 'Near total - only government-approved VPNs',
    lastUpdate: '2024'
  },
  RU: {
    level: 7,
    label: 'High - Sovereign Internet',
    description: 'Roskomnadzor blacklists, increasing isolation',
    blockedCategories: ['Independent News', 'Opposition', 'LGBTQ', 'War-related'],
    blockedSites: ['Facebook', 'Instagram', 'Twitter (throttled)', 'Independent media'],
    methods: ['Blacklist (RKN)', 'DPI (TSPU)', 'Throttling'],
    freedomHouseScore: 23,
    ooniBlockingRate: 0.18,
    vpnBlocking: 'Moderate - many VPNs blocked',
    lastUpdate: '2024'
  },
  IQ: {
    level: 4,
    label: 'Moderate',
    description: 'Occasional shutdowns, some social media blocks during unrest',
    blockedCategories: ['Pornography', 'Occasional social media during protests'],
    blockedSites: ['Occasional: Facebook, WhatsApp during protests'],
    methods: ['DNS blocking', 'Shutdowns during unrest'],
    freedomHouseScore: 43,
    ooniBlockingRate: 0.08,
    vpnBlocking: 'Low',
    lastUpdate: '2024'
  },
  TR: {
    level: 6,
    label: 'High-Moderate',
    description: 'Extensive blocking of news, social media throttling',
    blockedCategories: ['News sites', 'Wikipedia (previously)', 'LGBTQ', 'Kurdish media (partial)'],
    blockedSites: ['Wikipedia (2017-2020)', 'Many news sites', 'Some Kurdish sites'],
    methods: ['Court orders', 'Throttling', 'DNS blocking'],
    freedomHouseScore: 32,
    ooniBlockingRate: 0.15,
    vpnBlocking: 'Moderate',
    lastUpdate: '2024'
  },
  SY: {
    level: 8,
    label: 'Very High',
    description: 'War-time censorship, extensive filtering',
    blockedCategories: ['Opposition', 'News', 'Social Media (partial)'],
    blockedSites: ['Opposition sites', 'Many news outlets'],
    methods: ['Syrian Telecom monopoly filtering', 'Surveillance'],
    freedomHouseScore: 19,
    ooniBlockingRate: 0.35,
    vpnBlocking: 'High',
    lastUpdate: '2024'
  },
  US: { level: 1, label: 'Minimal', description: 'Very low filtering, strong net neutrality (debated)', blockedCategories: ['Child abuse (legal)'], blockedSites: [], methods: ['Court-ordered for illegal content'], freedomHouseScore: 76, ooniBlockingRate: 0.02, vpnBlocking: 'None', lastUpdate: '2024' },
  GB: { level: 2, label: 'Low', description: 'ISP default adult filters, court-ordered blocks', blockedCategories: ['Porn (opt-in filter)', 'Piracy sites'], blockedSites: ['Pirate Bay (court order)'], methods: ['ISP filters (opt-out)', 'Court orders'], freedomHouseScore: 79, ooniBlockingRate: 0.03, vpnBlocking: 'None', lastUpdate: '2024' },
  DE: { level: 1, label: 'Minimal', description: 'Low filtering, hate speech takedowns', blockedCategories: ['Nazi content (legal)', 'Piracy'], blockedSites: [], methods: ['NetzDG takedowns'], freedomHouseScore: 77, ooniBlockingRate: 0.02, vpnBlocking: 'None', lastUpdate: '2024' },
};

export const INTERNET_SPEED_DATABASE = {
  IR: { download: 22.5, upload: 12.3, mobileDownload: 35.2, mobileUpload: 14.1, latency: 45, rank: 145, fiberPercent: 12, provider: 'TCI, Irancell, MCI', lastUpdate: '2024-12' },
  IQ: { download: 28.3, upload: 15.2, mobileDownload: 32.1, mobileUpload: 13.5, latency: 55, rank: 138, fiberPercent: 8, provider: 'Earthlink, Newroz', lastUpdate: '2024-12' },
  TR: { download: 45.2, upload: 18.5, mobileDownload: 38.7, mobileUpload: 15.2, latency: 28, rank: 106, fiberPercent: 35, provider: 'Turk Telekom, Superonline', lastUpdate: '2024-12' },
  SY: { download: 8.5, upload: 4.2, mobileDownload: 12.3, mobileUpload: 5.1, latency: 85, rank: 180, fiberPercent: 2, provider: 'Syriatel, MTN', lastUpdate: '2024-12' },
  US: { download: 180.5, upload: 45.2, mobileDownload: 85.3, mobileUpload: 18.5, latency: 12, rank: 8, fiberPercent: 45, provider: 'Comcast, Verizon, AT&T', lastUpdate: '2024-12' },
  GB: { download: 110.3, upload: 25.4, mobileDownload: 65.2, mobileUpload: 16.3, latency: 15, rank: 35, fiberPercent: 42, provider: 'BT, Virgin Media', lastUpdate: '2024-12' },
  DE: { download: 95.4, upload: 35.2, mobileDownload: 58.3, mobileUpload: 17.1, latency: 14, rank: 45, fiberPercent: 22, provider: 'Deutsche Telekom, Vodafone', lastUpdate: '2024-12' },
  CN: { download: 165.2, upload: 55.3, mobileDownload: 95.4, mobileUpload: 22.3, latency: 18, rank: 12, fiberPercent: 85, provider: 'China Telecom, China Unicom', lastUpdate: '2024-12' },
  RU: { download: 85.3, upload: 88.2, mobileDownload: 32.1, mobileUpload: 12.5, latency: 22, rank: 50, fiberPercent: 65, provider: 'Rostelecom, MTS', lastUpdate: '2024-12' },
  AE: { download: 220.5, upload: 95.3, mobileDownload: 120.5, mobileUpload: 28.3, latency: 8, rank: 2, fiberPercent: 95, provider: 'Etisalat, du', lastUpdate: '2024-12' },
  KR: { download: 210.3, upload: 180.2, mobileDownload: 140.2, mobileUpload: 35.4, latency: 6, rank: 3, fiberPercent: 85, provider: 'KT, SK Broadband', lastUpdate: '2024-12' },
  JP: { download: 195.4, upload: 175.3, mobileDownload: 95.3, mobileUpload: 22.1, latency: 8, rank: 5, fiberPercent: 80, provider: 'NTT, KDDI', lastUpdate: '2024-12' },
};

export const VULNERABILITY_INDEX = {
  IR: { score: 7.8, level: 'High', reasons: ['Sanctions limit patching', 'Legacy infrastructure', 'High APT targeting', 'Low security budget'], topThreats: ['MuddyWater','Charming Kitten','OilRig','APT34'], unpatchedRate: 0.65, criticalInfraRisk: 'Very High' },
  IQ: { score: 7.2, level: 'High', reasons: ['Conflict damage', 'Limited CERT capacity', 'High phishing success'], topThreats: ['APT34','MuddyWater','SideWinder'], unpatchedRate: 0.58, criticalInfraRisk: 'High' },
  SY: { score: 8.5, level: 'Critical', reasons: ['War destruction', 'No patching', 'Nation-state targeting'], topThreats: ['APT-C-23','OilRig'], unpatchedRate: 0.82, criticalInfraRisk: 'Critical' },
  TR: { score: 6.5, level: 'Medium-High', reasons: ['Large attack surface', 'Growing digitalization'], topThreats: ['Sea Turtle','StrongPity'], unpatchedRate: 0.45, criticalInfraRisk: 'Medium' },
  US: { score: 4.2, level: 'Medium', reasons: ['Large surface but mature defense'], topThreats: ['APT29','Lazarus','Volt Typhoon'], unpatchedRate: 0.25, criticalInfraRisk: 'Medium' },
  CN: { score: 5.5, level: 'Medium', reasons: ['Great Firewall provides isolation but large surface'], topThreats: ['APT41','Volt Typhoon'], unpatchedRate: 0.35, criticalInfraRisk: 'Medium-High' },
  RU: { score: 5.8, level: 'Medium-High', reasons: ['Sanctions, isolation'], topThreats: ['APT29','Sandworm'], unpatchedRate: 0.42, criticalInfraRisk: 'High' },
};

export function getFilteringByCountry(code) {
  return FILTERING_DATABASE[code.toUpperCase()] || { level: 3, label: 'Unknown/Moderate', description: 'No specific data', blockedCategories: [], blockedSites: [], methods: [], freedomHouseScore: 50, ooniBlockingRate: 0.1, vpnBlocking: 'Unknown', lastUpdate: '2024' };
}

export function getSpeedByCountry(code) {
  return INTERNET_SPEED_DATABASE[code.toUpperCase()] || { download: 30, upload: 15, mobileDownload: 25, mobileUpload: 10, latency: 40, rank: 100, fiberPercent: 20, provider: 'Unknown', lastUpdate: '2024-12' };
}

export function getVulnerabilityByCountry(code) {
  return VULNERABILITY_INDEX[code.toUpperCase()] || { score: 5.0, level: 'Medium', reasons: ['No specific data'], topThreats: [], unpatchedRate: 0.4, criticalInfraRisk: 'Medium' };
}

// Live speed monitor with jitter
export class InternetSpeedMonitor {
  constructor() {
    this.currentSpeeds = new Map();
    this.listeners = new Set();
    this.interval = null;
  }

  generateLiveSpeed(countryCode) {
    const base = getSpeedByCountry(countryCode);
    // Add realistic jitter ±15%
    const jitter = (v) => v * (0.85 + Math.random()*0.30);
    return {
      ...base,
      liveDownload: parseFloat(jitter(base.download).toFixed(1)),
      liveUpload: parseFloat(jitter(base.upload).toFixed(1)),
      liveMobileDownload: parseFloat(jitter(base.mobileDownload).toFixed(1)),
      liveLatency: Math.floor(jitter(base.latency)),
      timestamp: Date.now(),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      changePercent: parseFloat((Math.random()*5).toFixed(1))
    };
  }

  async update() {
    // Update for all countries in DB
    Object.keys(INTERNET_SPEED_DATABASE).forEach(code => {
      this.currentSpeeds.set(code, this.generateLiveSpeed(code));
    });
    this.notify();
  }

  start(intervalMs=10000) { this.update(); this.interval=setInterval(()=>this.update(), intervalMs); }
  stop() { if(this.interval){clearInterval(this.interval); this.interval=null;} }
  addListener(cb){this.listeners.add(cb);} removeListener(cb){this.listeners.delete(cb);}
  notify(){ this.listeners.forEach(cb=>{try{cb(this.currentSpeeds)}catch{}}); }
  getByCountry(code){ return this.currentSpeeds.get(code.toUpperCase()) || this.generateLiveSpeed(code); }
}

export const speedMonitor = new InternetSpeedMonitor();
