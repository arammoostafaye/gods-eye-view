/**
 * Country Intelligence Database - Personal Edition
 * Comprehensive data for each country: area, population, birth/death, languages, economy, currency
 * 
 * Sources: World Bank, REST Countries, IMF, custom curated for Iran/Kurdistan focus
 */

export const COUNTRY_DATABASE = {
  IR: {
    iso2: 'IR',
    iso3: 'IRN',
    name: { en: 'Iran', fa: 'ایران', ku: 'ئێران', ar: 'إيران' },
    capital: { en: 'Tehran', fa: 'تهران', ku: 'تاران' },
    lat: 32.4279,
    lon: 53.6880,
    areaKm2: 1648195,
    population: 87900000,
    populationYear: 2024,
    birthRate: 13.2, // per 1000
    deathRate: 5.8,
    birthCountPerDay: 3170,
    deathCountPerDay: 1395,
    officialLanguages: [{ code: 'fa', name: { en: 'Persian', fa: 'فارسی', ku: 'فارسی' } }],
    localDialects: [
      { name: { en: 'Kurdish (Sorani/Kurmanji)', fa: 'کردی (سورانی/کرمانجی)', ku: 'کوردی' }, region: 'Kurdistan, West Azerbaijan, Kermanshah, Ilam', speakers: 10000000 },
      { name: { en: 'Azeri Turkish', fa: 'ترکی آذری', ku: 'ئازەری' }, region: 'Azerbaijan provinces', speakers: 16000000 },
      { name: { en: 'Luri', fa: 'لری', ku: 'لوڕی' }, region: 'Lorestan, Kohgiluyeh', speakers: 5000000 },
      { name: { en: 'Gilaki', fa: 'گیلکی' }, region: 'Gilan', speakers: 3000000 },
      { name: { en: 'Mazandarani', fa: 'مازندرانی' }, region: 'Mazandaran', speakers: 3000000 },
      { name: { en: 'Balochi', fa: 'بلوچی' }, region: 'Sistan-Baluchestan', speakers: 2000000 },
      { name: { en: 'Arabic (Khuzestani)', fa: 'عربی خوزستانی' }, region: 'Khuzestan', speakers: 1500000 },
      { name: { en: 'Turkmen', fa: 'ترکمنی' }, region: 'Golestan', speakers: 500000 },
    ],
    gdpNominalBillionUSD: 413.5,
    gdpRank: 41,
    gdpPerCapitaUSD: 4700,
    economicRankDesc: '41st largest economy, heavily sanctioned',
    currency: { code: 'IRR', name: { en: 'Iranian Rial', fa: 'ریال ایران' }, symbol: '﷼', vsUSD: 42000, tomanVsUSD: 4200, lastUpdated: '2024', blackMarketVsUSD: 580000, blackMarketTomanVsUSD: 58000 },
    internetUsersPercent: 84.1,
    internetFilteringLevel: 9, // 0-10, 10=most filtered
    internetSpeedAvgMbps: { download: 22.5, upload: 12.3, mobile: 35.2 },
    timeZone: 'Asia/Tehran',
    callingCode: '+98',
    flag: '🇮🇷',
  },
  IQ: {
    iso2: 'IQ',
    iso3: 'IRQ',
    name: { en: 'Iraq', fa: 'عراق', ku: 'عێراق', ar: 'العراق' },
    capital: { en: 'Baghdad', fa: 'بغداد', ku: 'بەغدا' },
    lat: 33.2232,
    lon: 43.6793,
    areaKm2: 438317,
    population: 45500000,
    populationYear: 2024,
    birthRate: 26.5,
    deathRate: 4.5,
    birthCountPerDay: 3300,
    deathCountPerDay: 560,
    officialLanguages: [
      { code: 'ar', name: { en: 'Arabic', fa: 'عربی', ku: 'عەرەبی' } },
      { code: 'ku', name: { en: 'Kurdish', fa: 'کردی', ku: 'کوردی' } }
    ],
    localDialects: [
      { name: { en: 'Kurdish Sorani', fa: 'کردی سورانی', ku: 'سۆرانی' }, region: 'Kurdistan Region', speakers: 6000000 },
      { name: { en: 'Kurdish Kurmanji', fa: 'کردی کرمانجی', ku: 'کورمانجی' }, region: 'Duhok, parts of Erbil', speakers: 2000000 },
      { name: { en: 'Iraqi Arabic (Mesopotamian)', fa: 'عربی عراقی' }, region: 'Central/South', speakers: 30000000 },
      { name: { en: 'Turkmen', fa: 'ترکمنی عراق' }, region: 'Kirkuk, Erbil', speakers: 500000 },
    ],
    gdpNominalBillionUSD: 264.2,
    gdpRank: 52,
    gdpPerCapitaUSD: 5800,
    economicRankDesc: '52nd, oil-dependent economy',
    currency: { code: 'IQD', name: { en: 'Iraqi Dinar', fa: 'دینار عراق' }, symbol: 'ع.د', vsUSD: 1310, lastUpdated: '2024' },
    internetUsersPercent: 75.1,
    internetFilteringLevel: 4,
    internetSpeedAvgMbps: { download: 28.3, upload: 15.2, mobile: 32.1 },
    flag: '🇮🇶',
  },
  TR: {
    iso2: 'TR',
    iso3: 'TUR',
    name: { en: 'Turkey', fa: 'ترکیه', ku: 'تورکیا', ar: 'تركيا' },
    capital: { en: 'Ankara', fa: 'آنکارا', ku: 'ئەنقەرە' },
    lat: 38.9637,
    lon: 35.2433,
    areaKm2: 783562,
    population: 85800000,
    populationYear: 2024,
    birthRate: 14.6,
    deathRate: 5.9,
    birthCountPerDay: 3430,
    deathCountPerDay: 1385,
    officialLanguages: [{ code: 'tr', name: { en: 'Turkish', fa: 'ترکی', ku: 'تورکی' } }],
    localDialects: [
      { name: { en: 'Kurdish Kurmanji', ku: 'Kurmancî' }, region: 'Southeast', speakers: 15000000 },
      { name: { en: 'Kurdish Zazaki', ku: 'Zazakî' }, region: 'Tunceli, Elazig', speakers: 2000000 },
      { name: { en: 'Arabic', fa: 'عربی' }, region: 'Hatay, Mardin', speakers: 1000000 },
    ],
    gdpNominalBillionUSD: 905.5,
    gdpRank: 18,
    gdpPerCapitaUSD: 10550,
    economicRankDesc: '18th largest, G20 member',
    currency: { code: 'TRY', name: { en: 'Turkish Lira', fa: 'لیر ترکیه' }, symbol: '₺', vsUSD: 48.6, lastUpdated: '2026-09-12 REAL from open.er-api.com' },
    internetUsersPercent: 82.6,
    internetFilteringLevel: 6,
    internetSpeedAvgMbps: { download: 45.2, upload: 18.5, mobile: 38.7 },
    flag: '🇹🇷',
  },
  SY: {
    iso2: 'SY',
    iso3: 'SYR',
    name: { en: 'Syria', fa: 'سوریه', ku: 'سووریا', ar: 'سوريا' },
    capital: { en: 'Damascus', fa: 'دمشق', ku: 'دیمەشق' },
    lat: 34.8021,
    lon: 38.9968,
    areaKm2: 185180,
    population: 23500000,
    populationYear: 2024,
    birthRate: 22.1,
    deathRate: 5.5,
    birthCountPerDay: 1420,
    deathCountPerDay: 354,
    officialLanguages: [{ code: 'ar', name: { en: 'Arabic', fa: 'عربی', ku: 'عەرەبی' } }],
    localDialects: [
      { name: { en: 'Kurdish Kurmanji', ku: 'Kurmancî' }, region: 'Al-Hasakah, Kobani, Afrin', speakers: 2000000 },
      { name: { en: 'Syriac-Aramaic', fa: 'آرامی' }, region: 'Northeast', speakers: 100000 },
    ],
    gdpNominalBillionUSD: 9.0,
    gdpRank: 129,
    gdpPerCapitaUSD: 400,
    economicRankDesc: 'War-torn, 129th',
    currency: { code: 'SYP', name: { en: 'Syrian Pound', fa: 'لیر سوریه' }, symbol: '£S', vsUSD: 13000, lastUpdated: '2024' },
    internetUsersPercent: 35.2,
    internetFilteringLevel: 8,
    internetSpeedAvgMbps: { download: 8.5, upload: 4.2, mobile: 12.3 },
    flag: '🇸🇾',
  },
  US: {
    iso2: 'US',
    iso3: 'USA',
    name: { en: 'United States', fa: 'ایالات متحده', ku: 'ویلایەتە یەکگرتووەکان' },
    capital: { en: 'Washington D.C.', fa: 'واشینگتن', ku: 'واشنتۆن' },
    lat: 39.8283,
    lon: -98.5795,
    areaKm2: 9833517,
    population: 342000000,
    populationYear: 2024,
    birthRate: 12.0,
    deathRate: 8.8,
    birthCountPerDay: 11230,
    deathCountPerDay: 8240,
    officialLanguages: [{ code: 'en', name: { en: 'English', fa: 'انگلیسی', ku: 'ئینگلیزی' } }],
    localDialects: [{ name: { en: 'Spanish', fa: 'اسپانیایی' }, region: 'Southwest, Florida', speakers: 42000000 }],
    gdpNominalBillionUSD: 27360,
    gdpRank: 1,
    gdpPerCapitaUSD: 80000,
    economicRankDesc: '1st largest economy in the world',
    currency: { code: 'USD', name: { en: 'US Dollar', fa: 'دلار آمریکا' }, symbol: '$', vsUSD: 1, lastUpdated: '2024' },
    internetUsersPercent: 91.8,
    internetFilteringLevel: 1,
    internetSpeedAvgMbps: { download: 180.5, upload: 45.2, mobile: 85.3 },
    flag: '🇺🇸',
  },
  GB: {
    iso2: 'GB',
    iso3: 'GBR',
    name: { en: 'United Kingdom', fa: 'بریتانیا', ku: 'بەریتانیا' },
    capital: { en: 'London', fa: 'لندن', ku: 'لەندەن' },
    lat: 55.3781,
    lon: -3.4360,
    areaKm2: 242495,
    population: 68000000,
    populationYear: 2024,
    birthRate: 11.4,
    deathRate: 9.4,
    birthCountPerDay: 2120,
    deathCountPerDay: 1750,
    officialLanguages: [{ code: 'en', name: { en: 'English', fa: 'انگلیسی', ku: 'ئینگلیزی' } }],
    localDialects: [{ name: { en: 'Welsh', fa: 'ولزی' }, region: 'Wales', speakers: 800000 }],
    gdpNominalBillionUSD: 3340,
    gdpRank: 6,
    gdpPerCapitaUSD: 49100,
    economicRankDesc: '6th largest',
    currency: { code: 'GBP', name: { en: 'British Pound', fa: 'پوند بریتانیا' }, symbol: '£', vsUSD: 0.79, lastUpdated: '2024' },
    internetUsersPercent: 94.8,
    internetFilteringLevel: 2,
    internetSpeedAvgMbps: { download: 110.3, upload: 25.4, mobile: 65.2 },
    flag: '🇬🇧',
  },
  DE: {
    iso2: 'DE',
    iso3: 'DEU',
    name: { en: 'Germany', fa: 'آلمان', ku: 'ئەڵمانیا' },
    capital: { en: 'Berlin', fa: 'برلین', ku: 'بەرلین' },
    lat: 51.1657,
    lon: 10.4515,
    areaKm2: 357022,
    population: 84500000,
    populationYear: 2024,
    birthRate: 9.4,
    deathRate: 11.5,
    birthCountPerDay: 2170,
    deathCountPerDay: 2660,
    officialLanguages: [{ code: 'de', name: { en: 'German', fa: 'آلمانی', ku: 'ئەڵمانی' } }],
    localDialects: [{ name: { en: 'Bavarian', fa: 'بایرنی' }, region: 'Bavaria', speakers: 12000000 }],
    gdpNominalBillionUSD: 4456,
    gdpRank: 3,
    gdpPerCapitaUSD: 52700,
    economicRankDesc: '3rd largest',
    currency: { code: 'EUR', name: { en: 'Euro', fa: 'یورو' }, symbol: '€', vsUSD: 0.92, lastUpdated: '2024' },
    internetUsersPercent: 91.4,
    internetFilteringLevel: 1,
    internetSpeedAvgMbps: { download: 95.4, upload: 35.2, mobile: 58.3 },
    flag: '🇩🇪',
  },
  CN: {
    iso2: 'CN',
    iso3: 'CHN',
    name: { en: 'China', fa: 'چین', ku: 'چین' },
    capital: { en: 'Beijing', fa: 'پکن', ku: 'پەکین' },
    lat: 35.8617,
    lon: 104.1954,
    areaKm2: 9596961,
    population: 1412000000,
    populationYear: 2024,
    birthRate: 7.5,
    deathRate: 7.4,
    birthCountPerDay: 29000,
    deathCountPerDay: 28600,
    officialLanguages: [{ code: 'zh', name: { en: 'Chinese', fa: 'چینی', ku: 'چینی' } }],
    localDialects: [{ name: { en: 'Cantonese', fa: 'کانتونی' }, region: 'Guangdong, Hong Kong', speakers: 85000000 }],
    gdpNominalBillionUSD: 17700,
    gdpRank: 2,
    gdpPerCapitaUSD: 12540,
    economicRankDesc: '2nd largest, manufacturing superpower',
    currency: { code: 'CNY', name: { en: 'Chinese Yuan', fa: 'یوآن چین' }, symbol: '¥', vsUSD: 7.2, lastUpdated: '2024' },
    internetUsersPercent: 76.4,
    internetFilteringLevel: 10,
    internetSpeedAvgMbps: { download: 165.2, upload: 55.3, mobile: 95.4 },
    flag: '🇨🇳',
  },
  RU: {
    iso2: 'RU',
    iso3: 'RUS',
    name: { en: 'Russia', fa: 'روسیه', ku: 'ڕووسیا' },
    capital: { en: 'Moscow', fa: 'مسکو', ku: 'مۆسکۆ' },
    lat: 61.5240,
    lon: 105.3188,
    areaKm2: 17098242,
    population: 146000000,
    populationYear: 2024,
    birthRate: 12.0,
    deathRate: 13.6,
    birthCountPerDay: 4800,
    deathCountPerDay: 5440,
    officialLanguages: [{ code: 'ru', name: { en: 'Russian', fa: 'روسی', ku: 'ڕووسی' } }],
    localDialects: [{ name: { en: 'Tatar', fa: 'تاتاری' }, region: 'Tatarstan', speakers: 5000000 }],
    gdpNominalBillionUSD: 1997,
    gdpRank: 11,
    gdpPerCapitaUSD: 13670,
    economicRankDesc: '11th largest, energy superpower',
    currency: { code: 'RUB', name: { en: 'Russian Ruble', fa: 'روبل روسیه' }, symbol: '₽', vsUSD: 92.5, lastUpdated: '2024' },
    internetUsersPercent: 88.2,
    internetFilteringLevel: 7,
    internetSpeedAvgMbps: { download: 85.3, upload: 88.2, mobile: 32.1 },
    flag: '🇷🇺',
  },
};

// Add more countries dynamically via function
import { getExtendedCountry, createCountryFromExtended, EXTENDED_COUNTRIES } from './extendedDatabase.js';

export function getCountryByCode(code) {
  if (!code) return null;
  const upper = code.toUpperCase();
  if (COUNTRY_DATABASE[upper]) return COUNTRY_DATABASE[upper];
  // Fallback to extended
  const extended = createCountryFromExtended(upper);
  if (extended) return extended;
  return null;
}

export function getCountryByLatLon(lat, lon) {
  // Combine both databases for lookup
  const allCountries = { ...COUNTRY_DATABASE };
  // Add extended countries that are not already in main
  Object.keys(EXTENDED_COUNTRIES).forEach(code => {
    if (!allCountries[code]) {
      const ext = createCountryFromExtended(code);
      if (ext) allCountries[code] = ext;
    }
  });

  let closest = null;
  let minDist = Infinity;
  for (const country of Object.values(allCountries)) {
    const dist = Math.hypot(lat - country.lat, lon - country.lon);
    if (dist < minDist) {
      minDist = dist;
      closest = country;
    }
  }
  // Only return if within ~15 degrees (~1500km)
  return minDist < 15 ? closest : null;
}

export function getAllCountriesExtended() {
  const all = { ...COUNTRY_DATABASE };
  Object.keys(EXTENDED_COUNTRIES).forEach(code => {
    if (!all[code]) {
      const ext = createCountryFromExtended(code);
      if (ext) all[code] = ext;
    }
  });
  return Object.values(all);
}

export function getAllCountries() {
  return Object.values(COUNTRY_DATABASE);
}

// Economic rank description generator
export function formatEconomicRank(rank) {
  if (rank === 1) return '1st - Largest economy in the world';
  if (rank === 2) return '2nd - Second largest';
  if (rank === 3) return '3rd - Third largest';
  return `${rank}th largest economy`;
}

export function formatCurrencyVsUSD(country) {
  const c = country.currency;
  if (!c) return 'N/A';
  if (country.iso2 === 'IR') {
    return `${c.code}: Official ${c.vsUSD.toLocaleString()} IRR/USD (Toman: ${c.tomanVsUSD.toLocaleString()}), Black Market ~${c.blackMarketVsUSD.toLocaleString()} IRR / ${c.blackMarketTomanVsUSD.toLocaleString()} Toman`;
  }
  if (c.vsUSD === 1) return `1 USD = 1 ${c.code} (Base)`;
  if (c.vsUSD < 1) return `1 ${c.code} = ${(1/c.vsUSD).toFixed(2)} USD | 1 USD = ${c.vsUSD} ${c.code}`;
  return `1 USD = ${c.vsUSD.toLocaleString()} ${c.code} | 1 ${c.code} = ${(1/c.vsUSD).toFixed(4)} USD`;
}
