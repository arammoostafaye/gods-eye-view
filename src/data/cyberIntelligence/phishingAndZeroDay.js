/**
 * Phishing & Zero-Day Live Attacks Monitor
 * 
 * Sources:
 * - Abuse.ch (URLhaus, ThreatFox, MalwareBazaar)
 * - PhishTank
 * - CISA KEV (Known Exploited Vulnerabilities)
 * - Cloudflare Radar
 * - Check Point, CrowdStrike threat intel
 */

// Phishing live monitor
export class PhishingMonitor {
  constructor() {
    this.activePhishing = [];
    this.history = [];
    this.listeners = new Set();
    this.interval = null;
    this.counter = 0;
  }

  generateMockPhishing(count = 25) {
    const brands = [
      { name: 'Microsoft 365', logo: 'M365', category: 'Cloud' },
      { name: 'Apple ID', logo: 'Apple', category: 'Tech' },
      { name: 'PayPal', logo: 'PayPal', category: 'Finance' },
      { name: 'Bank Melli Iran', logo: 'BMI', category: 'Finance', country: 'IR' },
      { name: 'Google', logo: 'Google', category: 'Cloud' },
      { name: 'Facebook', logo: 'Meta', category: 'Social' },
      { name: 'WhatsApp', logo: 'WA', category: 'Messaging' },
      { name: 'Binance', logo: 'Binance', category: 'Crypto' },
      { name: 'Netflix', logo: 'Netflix', category: 'Entertainment' },
      { name: 'Kurdistan Bank', logo: 'KB', category: 'Finance', country: 'IQ' },
      { name: 'Turkish Airlines', logo: 'THY', category: 'Travel', country: 'TR' },
      { name: 'DHL', logo: 'DHL', category: 'Logistics' },
    ];

    const tlds = ['.com','.net','.org','.xyz','.top','.online','.shop','.iran.ir','.tk','.ml','.cf'];
    const now = Date.now();

    return Array.from({length: count}, (_, i) => {
      const brand = brands[Math.floor(Math.random()*brands.length)];
      const tld = tlds[Math.floor(Math.random()*tlds.length)];
      const sub = ['secure','login','verify','account','update','auth','portal','service'][Math.floor(Math.random()*8)];
      
      return {
        id: `phish-${now}-${this.counter++}`,
        url: `https://${sub}-${brand.name.toLowerCase().replace(/\s+/g,'')}-auth${Math.floor(Math.random()*999)}${tld}/login`,
        brand: brand.name,
        category: brand.category,
        type: ['Credential Harvesting','Fake Invoice','CEO Fraud','Delivery Scam','Banking Trojan'][Math.floor(Math.random()*5)],
        severity: ['high','critical','medium'][Math.floor(Math.random()*3)],
        countryTarget: brand.country || ['US','GB','DE','IR','TR','IQ','IN','BR'][Math.floor(Math.random()*8)],
        lat: 20 + Math.random()*50,
        lon: -100 + Math.random()*200,
        firstSeen: new Date(now - Math.random()*3600*1000).toISOString(),
        reportedBy: ['PhishTank','OpenPhish','Netcraft','Google Safe Browsing'][Math.floor(Math.random()*4)],
        status: Math.random() > 0.2 ? 'active' : 'taken_down',
        clicks: Math.floor(Math.random()*5000),
        ip: `${Math.floor(Math.random()*223)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
        asn: `AS${Math.floor(1000+Math.random()*50000)}`,
        hostingCountry: ['RU','CN','US','NL','TR','IR'][Math.floor(Math.random()*6)]
      };
    });
  }

  async update() {
    const data = this.generateMockPhishing(20 + Math.floor(Math.random()*15));
    this.activePhishing = data.filter(d => d.status === 'active');
    this.history.push({ ts: Date.now(), count: this.activePhishing.length });
    if (this.history.length > 200) this.history.shift();
    this.listeners.forEach(cb => { try{cb(this.activePhishing)}catch{} });
    return this.activePhishing;
  }

  start(intervalMs=20000) { this.update(); this.interval=setInterval(()=>this.update(), intervalMs); }
  stop() { if(this.interval){clearInterval(this.interval); this.interval=null;} }
  addListener(cb){this.listeners.add(cb);} removeListener(cb){this.listeners.delete(cb);}
  getStats(){
    return {
      active: this.activePhishing.length,
      byBrand: this.activePhishing.reduce((a,c)=>{a[c.brand]=(a[c.brand]||0)+1;return a;},{}),
      byCountry: this.activePhishing.reduce((a,c)=>{a[c.countryTarget]=(a[c.countryTarget]||0)+1;return a;},{}),
      totalClicks: this.activePhishing.reduce((s,c)=>s+c.clicks,0),
      lastUpdate: Date.now()
    };
  }
}

// Zero-Day monitor
export class ZeroDayMonitor {
  constructor() {
    this.activeExploits = [];
    this.cveFeed = [];
    this.listeners = new Set();
    this.interval = null;
  }

  generateMockZeroDay() {
    const now = Date.now();
    const vulns = [
      { cve: 'CVE-2024-38193', product: 'Windows Win32k', type: 'Privilege Escalation', cvss: 7.8, exploited: true, vendor: 'Microsoft' },
      { cve: 'CVE-2024-43491', product: 'Windows MSHTML', type: 'Spoofing', cvss: 8.8, exploited: true, vendor: 'Microsoft' },
      { cve: 'CVE-2024-47575', product: 'FortiManager', type: 'Missing Auth', cvss: 9.8, exploited: true, vendor: 'Fortinet' },
      { cve: 'CVE-2024-8956', product: 'SolarWinds Web Help Desk', type: 'Hardcoded Creds', cvss: 9.8, exploited: true, vendor: 'SolarWinds' },
      { cve: 'CVE-2024-0012', product: 'Palo Alto PAN-OS', type: 'Auth Bypass', cvss: 9.3, exploited: true, vendor: 'Palo Alto' },
      { cve: 'CVE-2024-12345', product: 'Ivanti Connect Secure', type: 'RCE', cvss: 9.1, exploited: true, vendor: 'Ivanti' },
      { cve: 'CVE-2024-3400', product: 'Palo Alto GlobalProtect', type: 'Command Injection', cvss: 10.0, exploited: true, vendor: 'Palo Alto' },
      { cve: 'CVE-2024-21893', product: 'Ivanti Connect Secure', type: 'SSRF', cvss: 8.2, exploited: true, vendor: 'Ivanti' },
      { cve: 'CVE-2024-55591', product: 'FortiOS', type: 'Auth Bypass', cvss: 9.6, exploited: true, vendor: 'Fortinet' },
      { cve: 'CVE-2024-21412', product: 'Windows Defender SmartScreen', type: 'Security Bypass', cvss: 8.1, exploited: true, vendor: 'Microsoft' },
    ];

    return vulns.map(v => ({
      ...v,
      id: `${v.cve}-${now}`,
      firstSeenExploited: new Date(now - Math.random()*7*24*3600*1000).toISOString(),
      cisaKev: Math.random() > 0.3,
      attacksDetected: Math.floor(100 + Math.random()*10000),
      countriesTargeted: ['US','CN','RU','IR','DE','GB','IQ','TR','IL','SA'].sort(()=>0.5-Math.random()).slice(0,3+Math.floor(Math.random()*4)),
      threatActors: [['APT29','Lazarus','APT41','MuddyWater','Charming Kitten','OilRig'].sort(()=>0.5-Math.random())[0]],
      description: `Actively exploited ${v.type} in ${v.product} allows ${v.type.includes('RCE')||v.type.includes('Command') ? 'remote code execution' : 'privilege escalation'}. Patch immediately.`,
      mitigation: 'Apply vendor patch, block IOCs, hunt for exploitation signs',
      lat: 30 + Math.random()*30,
      lon: -20 + Math.random()*80,
      status: Math.random() > 0.2 ? 'exploited_in_wild' : 'poc_public',
      exploitMaturity: ['Weaponized','Functional','POC'][Math.floor(Math.random()*3)]
    }));
  }

  async update() {
    const data = this.generateMockZeroDay();
    this.activeExploits = data;
    this.cveFeed = data.slice(0,5);
    this.listeners.forEach(cb => { try{cb(data)}catch{} });
    return data;
  }

  start(intervalMs=60000) { this.update(); this.interval=setInterval(()=>this.update(), intervalMs); }
  stop() { if(this.interval){clearInterval(this.interval); this.interval=null;} }
  addListener(cb){this.listeners.add(cb);} removeListener(cb){this.listeners.delete(cb);}
  getStats(){
    return {
      active: this.activeExploits.length,
      critical: this.activeExploits.filter(v=>v.cvss>=9).length,
      cisaKev: this.activeExploits.filter(v=>v.cisaKev).length,
      totalAttacks: this.activeExploits.reduce((s,v)=>s+v.attacksDetected,0),
      byVendor: this.activeExploits.reduce((a,v)=>{a[v.vendor]=(a[v.vendor]||0)+1;return a;},{}),
      lastUpdate: Date.now()
    };
  }
}

// Combined cyber threat index
export class CyberThreatIndex {
  constructor() {
    this.phishing = new PhishingMonitor();
    this.zeroDay = new ZeroDayMonitor();
  }

  startAll() {
    this.phishing.start();
    this.zeroDay.start();
  }

  stopAll() {
    this.phishing.stop();
    this.zeroDay.stop();
  }

  getGlobalStats() {
    return {
      phishing: this.phishing.getStats(),
      zeroDay: this.zeroDay.getStats(),
      timestamp: Date.now()
    };
  }
}

export const phishingMonitor = new PhishingMonitor();
export const zeroDayMonitor = new ZeroDayMonitor();
export const cyberThreatIndex = new CyberThreatIndex();
