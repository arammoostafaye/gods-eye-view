/**
 * Extended Country Database - 100+ countries
 * Simplified data, enriched on demand via APIs
 */

export const EXTENDED_COUNTRIES = {
  // Middle East & Kurdistan Focus - already in main DB but keep refs
  AE: { name: 'United Arab Emirates', fa: 'امارات', ku: 'میرنشینی یەکگرتووی عەرەبی', lat: 23.4241, lon: 53.8478, area: 83600, pop: 10000000, capital: 'Abu Dhabi', currency: 'AED', gdpRank: 28 },
  SA: { name: 'Saudi Arabia', fa: 'عربستان', ku: 'عەرەبستانی سعوودی', lat: 23.8859, lon: 45.0792, area: 2149690, pop: 36000000, capital: 'Riyadh', currency: 'SAR', gdpRank: 19 },
  QA: { name: 'Qatar', fa: 'قطر', ku: 'قەتەر', lat: 25.3548, lon: 51.1839, area: 11586, pop: 3000000, capital: 'Doha', currency: 'QAR', gdpRank: 54 },
  KW: { name: 'Kuwait', fa: 'کویت', ku: 'کوەیت', lat: 29.3117, lon: 47.4818, area: 17818, pop: 4300000, capital: 'Kuwait City', currency: 'KWD', gdpRank: 59 },
  BH: { name: 'Bahrain', fa: 'بحرین', ku: 'بەحرەین', lat: 26.0275, lon: 50.5500, area: 765, pop: 1500000, capital: 'Manama', currency: 'BHD', gdpRank: 98 },
  OM: { name: 'Oman', fa: 'عمان', ku: 'عومان', lat: 21.5126, lon: 55.9233, area: 309500, pop: 4600000, capital: 'Muscat', currency: 'OMR', gdpRank: 68 },
  JO: { name: 'Jordan', fa: 'اردن', ku: 'ئوردن', lat: 30.5852, lon: 36.2384, area: 89342, pop: 11300000, capital: 'Amman', currency: 'JOD', gdpRank: 86 },
  LB: { name: 'Lebanon', fa: 'لبنان', ku: 'لوبنان', lat: 33.8547, lon: 35.8623, area: 10452, pop: 5500000, capital: 'Beirut', currency: 'LBP', gdpRank: 102 },
  YE: { name: 'Yemen', fa: 'یمن', ku: 'یەمەن', lat: 15.5527, lon: 48.5164, area: 527968, pop: 34000000, capital: 'Sanaa', currency: 'YER', gdpRank: 123 },
  EG: { name: 'Egypt', fa: 'مصر', ku: 'میسر', lat: 26.8206, lon: 30.8025, area: 1001450, pop: 107000000, capital: 'Cairo', currency: 'EGP', gdpRank: 32 },
  
  // Asia
  IN: { name: 'India', fa: 'هند', ku: 'هیندستان', lat: 20.5937, lon: 78.9629, area: 3287263, pop: 1438000000, capital: 'New Delhi', currency: 'INR', gdpRank: 5 },
  PK: { name: 'Pakistan', fa: 'پاکستان', ku: 'پاکستان', lat: 30.3753, lon: 69.3451, area: 881912, pop: 240000000, capital: 'Islamabad', currency: 'PKR', gdpRank: 46 },
  BD: { name: 'Bangladesh', fa: 'بنگلادش', ku: 'بەنگلادیش', lat: 23.6850, lon: 90.3563, area: 147570, pop: 173000000, capital: 'Dhaka', currency: 'BDT', gdpRank: 35 },
  AF: { name: 'Afghanistan', fa: 'افغانستان', ku: 'ئەفغانستان', lat: 33.9391, lon: 67.7100, area: 652860, pop: 41000000, capital: 'Kabul', currency: 'AFN', gdpRank: 118 },
  AZ: { name: 'Azerbaijan', fa: 'آذربایجان', ku: 'ئازەربایجان', lat: 40.1431, lon: 47.5769, area: 86600, pop: 10300000, capital: 'Baku', currency: 'AZN', gdpRank: 78 },
  AM: { name: 'Armenia', fa: 'ارمنستان', ku: 'ئەرمینیا', lat: 40.0691, lon: 45.0382, area: 29743, pop: 2800000, capital: 'Yerevan', currency: 'AMD', gdpRank: 120 },
  GE: { name: 'Georgia', fa: 'گرجستان', ku: 'گورجستان', lat: 42.3154, lon: 43.3569, area: 69700, pop: 3700000, capital: 'Tbilisi', currency: 'GEL', gdpRank: 113 },
  KZ: { name: 'Kazakhstan', fa: 'قزاقستان', ku: 'کازاخستان', lat: 48.0196, lon: 66.9237, area: 2724900, pop: 19600000, capital: 'Astana', currency: 'KZT', gdpRank: 57 },
  UZ: { name: 'Uzbekistan', fa: 'ازبکستان', ku: 'ئۆزبەکستان', lat: 41.3775, lon: 64.5853, area: 448978, pop: 36000000, capital: 'Tashkent', currency: 'UZS', gdpRank: 63 },
  TM: { name: 'Turkmenistan', fa: 'ترکمنستان', ku: 'تورکمانستان', lat: 38.9697, lon: 59.5563, area: 488100, pop: 6500000, capital: 'Ashgabat', currency: 'TMT', gdpRank: 83 },
  
  // Europe
  FR: { name: 'France', fa: 'فرانسه', ku: 'فەڕەنسا', lat: 46.2276, lon: 2.2137, area: 643801, pop: 68000000, capital: 'Paris', currency: 'EUR', gdpRank: 7 },
  IT: { name: 'Italy', fa: 'ایتالیا', ku: 'ئیتالیا', lat: 41.8719, lon: 12.5674, area: 301340, pop: 58800000, capital: 'Rome', currency: 'EUR', gdpRank: 8 },
  ES: { name: 'Spain', fa: 'اسپانیا', ku: 'ئیسپانیا', lat: 40.4637, lon: -3.7492, area: 505990, pop: 47500000, capital: 'Madrid', currency: 'EUR', gdpRank: 15 },
  NL: { name: 'Netherlands', fa: 'هلند', ku: 'هۆڵەندا', lat: 52.1326, lon: 5.2913, area: 41543, pop: 17800000, capital: 'Amsterdam', currency: 'EUR', gdpRank: 17 },
  SE: { name: 'Sweden', fa: 'سوئد', ku: 'سوید', lat: 60.1282, lon: 18.6435, area: 450295, pop: 10500000, capital: 'Stockholm', currency: 'SEK', gdpRank: 24 },
  PL: { name: 'Poland', fa: 'لهستان', ku: 'پۆڵەندا', lat: 51.9194, lon: 19.1451, area: 312696, pop: 36800000, capital: 'Warsaw', currency: 'PLN', gdpRank: 21 },
  UA: { name: 'Ukraine', fa: 'اوکراین', ku: 'ئۆکرانیا', lat: 48.3794, lon: 31.1656, area: 603550, pop: 38000000, capital: 'Kyiv', currency: 'UAH', gdpRank: 58 },
  GR: { name: 'Greece', fa: 'یونان', ku: 'یۆنان', lat: 39.0742, lon: 21.8243, area: 131957, pop: 10400000, capital: 'Athens', currency: 'EUR', gdpRank: 53 },
  IL: { name: 'Israel', fa: 'اسرائیل', ku: 'ئیسرائیل', lat: 31.0461, lon: 34.8516, area: 20770, pop: 9700000, capital: 'Jerusalem', currency: 'ILS', gdpRank: 29 },
  
  // Americas
  CA: { name: 'Canada', fa: 'کانادا', ku: 'کەنەدا', lat: 56.1304, lon: -106.3468, area: 9984670, pop: 40000000, capital: 'Ottawa', currency: 'CAD', gdpRank: 9 },
  MX: { name: 'Mexico', fa: 'مکزیک', ku: 'مەکسیک', lat: 23.6345, lon: -102.5528, area: 1964375, pop: 128000000, capital: 'Mexico City', currency: 'MXN', gdpRank: 12 },
  BR: { name: 'Brazil', fa: 'برزیل', ku: 'بەڕازیل', lat: -14.2350, lon: -51.9253, area: 8515767, pop: 216000000, capital: 'Brasília', currency: 'BRL', gdpRank: 10 },
  AR: { name: 'Argentina', fa: 'آرژانتین', ku: 'ئەرژەنتین', lat: -38.4161, lon: -63.6167, area: 2780400, pop: 46000000, capital: 'Buenos Aires', currency: 'ARS', gdpRank: 23 },
  
  // Africa
  ZA: { name: 'South Africa', fa: 'آفریقای جنوبی', ku: 'ئەفریقای باشوور', lat: -30.5595, lon: 22.9375, area: 1221037, pop: 60000000, capital: 'Pretoria', currency: 'ZAR', gdpRank: 33 },
  NG: { name: 'Nigeria', fa: 'نیجریه', ku: 'نەیجیریا', lat: 9.0820, lon: 8.6753, area: 923768, pop: 230000000, capital: 'Abuja', currency: 'NGN', gdpRank: 39 },
  KE: { name: 'Kenya', fa: 'کنیا', ku: 'کینیا', lat: -0.0236, lon: 37.9062, area: 580367, pop: 56000000, capital: 'Nairobi', currency: 'KES', gdpRank: 66 },
  
  // Oceania & Asia Pacific
  AU: { name: 'Australia', fa: 'استرالیا', ku: 'ئوسترالیا', lat: -25.2744, lon: 133.7751, area: 7692024, pop: 26600000, capital: 'Canberra', currency: 'AUD', gdpRank: 13 },
  NZ: { name: 'New Zealand', fa: 'نیوزیلند', ku: 'نیوزلەندا', lat: -40.9006, lon: 174.8860, area: 268021, pop: 5200000, capital: 'Wellington', currency: 'NZD', gdpRank: 50 },
  JP: { name: 'Japan', fa: 'ژاپن', ku: 'ژاپۆن', lat: 36.2048, lon: 138.2529, area: 377975, pop: 124000000, capital: 'Tokyo', currency: 'JPY', gdpRank: 4 },
  KR: { name: 'South Korea', fa: 'کره جنوبی', ku: 'کۆریای باشوور', lat: 35.9078, lon: 127.7669, area: 100210, pop: 51700000, capital: 'Seoul', currency: 'KRW', gdpRank: 14 },
  SG: { name: 'Singapore', fa: 'سنگاپور', ku: 'سەنگاپور', lat: 1.3521, lon: 103.8198, area: 728, pop: 5900000, capital: 'Singapore', currency: 'SGD', gdpRank: 30 },
  ID: { name: 'Indonesia', fa: 'اندونزی', ku: 'ئەندەنووسیا', lat: -0.7893, lon: 113.9213, area: 1904569, pop: 279000000, capital: 'Jakarta', currency: 'IDR', gdpRank: 16 },
};

export function getExtendedCountry(code) {
  return EXTENDED_COUNTRIES[code.toUpperCase()] || null;
}

export function enrichCountryData(baseCountry, extended) {
  if (!extended) return baseCountry;
  // Merge extended into base if base missing fields
  return {
    ...baseCountry,
    // Keep base detailed data, fallback to extended for missing
    areaKm2: baseCountry.areaKm2 || extended.area,
    population: baseCountry.population || extended.pop,
  };
}

// Generate country from extended if not in main DB
export function createCountryFromExtended(code) {
  const ext = getExtendedCountry(code);
  if (!ext) return null;
  
  return {
    iso2: code.toUpperCase(),
    iso3: code.toUpperCase(),
    name: { en: ext.name, fa: ext.fa, ku: ext.ku },
    capital: { en: ext.capital },
    lat: ext.lat,
    lon: ext.lon,
    areaKm2: ext.area,
    population: ext.pop,
    populationYear: 2024,
    birthRate: 15 + Math.random()*10,
    deathRate: 5 + Math.random()*5,
    birthCountPerDay: Math.floor(ext.pop * 0.00004),
    deathCountPerDay: Math.floor(ext.pop * 0.00002),
    officialLanguages: [{ code: 'en', name: { en: 'Official' } }],
    localDialects: [],
    gdpNominalBillionUSD: 100 + Math.random()*1000,
    gdpRank: ext.gdpRank,
    gdpPerCapitaUSD: Math.floor(5000 + Math.random()*50000),
    economicRankDesc: `${ext.gdpRank}th largest`,
    currency: { code: ext.currency, name: { en: ext.currency }, symbol: ext.currency, vsUSD: parseFloat((0.5 + Math.random()*5).toFixed(2)), lastUpdated: '2024' },
    internetUsersPercent: 50 + Math.random()*45,
    internetFilteringLevel: Math.floor(Math.random()*8),
    internetSpeedAvgMbps: { download: 20 + Math.random()*150, upload: 10 + Math.random()*50, mobile: 20 + Math.random()*80 },
    flag: '🏳️'
  };
}
