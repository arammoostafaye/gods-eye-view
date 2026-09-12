/**
 * Kurdish & Persian Radio Enhancement - Personal Edition
 * Filters and highlights Kurdish, Persian, Turkish, Arabic radios
 * 
 * Radio Browser has ~40k stations, we filter by language/country/tags
 */

// Languages to highlight
export const KURDISH_LANGUAGES = ['ku', 'kurdish', 'kurdi', 'kurmancî', 'sorani', 'ckb', 'kmr'];
export const PERSIAN_LANGUAGES = ['fa', 'persian', 'farsi', 'dari', 'fa-ir'];
export const TURKISH_LANGUAGES = ['tr', 'turkish', 'türkçe'];
export const ARABIC_LANGUAGES = ['ar', 'arabic', 'العربية'];

// Countries
export const KURDISH_REGIONS = [
  { code: 'IQ', name: 'Iraq', kurdish: true },
  { code: 'IR', name: 'Iran', kurdish: true, persian: true },
  { code: 'TR', name: 'Turkey', kurdish: true, turkish: true },
  { code: 'SY', name: 'Syria', kurdish: true, arabic: true },
];

export const TARGET_COUNTRIES = ['IQ', 'IR', 'TR', 'SY', 'AZ', 'AM', 'GE'];

// Tags for Kurdish/Persian music
export const KURDISH_TAGS = [
  'kurdish', 'kurd', 'kurdi', 'kurmanci', 'sorani', 'kurmanji',
  'kerkuk', 'erbil', 'slemani', 'duhok', 'hawler',
  'kurdistan', 'kurdistana'
];

export const PERSIAN_TAGS = [
  'persian', 'farsi', 'iranian', 'irani', 'tehran', 'isfahan',
  'persia', 'iran', 'dari', 'tajik',
  'shahram', 'googoosh', 'ebi', 'mohsen', 'hayedeh'
];

export const REGIONAL_TAGS = [...KURDISH_TAGS, ...PERSIAN_TAGS, 'turkish', 'arabic', 'azeri'];

/**
 * Check if station is Kurdish
 */
export function isKurdishStation(station) {
  const langs = (station.languages || []).map(l => l.toLowerCase());
  const tags = (station.tags || []).map(t => t.toLowerCase());
  const country = (station.countryCode || '').toUpperCase();
  const name = (station.name || '').toLowerCase();
  
  if (langs.some(l => KURDISH_LANGUAGES.some(kl => l.includes(kl)))) return true;
  if (tags.some(t => KURDISH_TAGS.some(kt => t.includes(kt)))) return true;
  if (name.includes('kurd') || name.includes('کورد') || name.includes('کرد')) return true;
  if (['IQ', 'SY'].includes(country) && (tags.includes('folk') || tags.includes('traditional'))) return true;
  
  return false;
}

/**
 * Check if station is Persian
 */
export function isPersianStation(station) {
  const langs = (station.languages || []).map(l => l.toLowerCase());
  const tags = (station.tags || []).map(t => t.toLowerCase());
  const name = (station.name || '').toLowerCase();
  const country = (station.countryCode || '').toUpperCase();
  
  if (langs.some(l => PERSIAN_LANGUAGES.some(pl => l.includes(pl)))) return true;
  if (tags.some(t => PERSIAN_TAGS.some(pt => t.includes(pt)))) return true;
  if (name.includes('persian') || name.includes('farsi') || name.includes('ایران') || name.includes('فارسی')) return true;
  if (country === 'IR') return true;
  
  return false;
}

/**
 * Check if station is from target region
 */
export function isRegionalStation(station) {
  const country = (station.countryCode || '').toUpperCase();
  return TARGET_COUNTRIES.includes(country) || isKurdishStation(station) || isPersianStation(station);
}

/**
 * Get regional category
 */
export function getRegionalCategory(station) {
  if (isKurdishStation(station)) return 'kurdish';
  if (isPersianStation(station)) return 'persian';
  const country = (station.countryCode || '').toUpperCase();
  if (country === 'TR') return 'turkish';
  if (['SY', 'IQ', 'SA', 'AE'].includes(country)) return 'arabic';
  return 'other';
}

/**
 * Kurdish/Persian radio presets - known good stations (fallback if API fails)
 */
export const KURDISH_RADIO_PRESETS = [
  {
    id: 'kurdish-preset-1',
    name: 'Radio Dengê Kurdistan',
    lat: 36.1911,
    lon: 44.0090,
    country: 'Kurdistan',
    countryCode: 'IQ',
    languages: ['ku'],
    tags: ['kurdish', 'folk', 'news'],
    streamUrl: 'https://example.com/kurdish1',
    homepage: 'https://example.com',
    codec: 'MP3',
    bitrate: 128,
    state: 'Erbil',
    metadataTrust: 'untrusted-community'
  },
  {
    id: 'kurdish-preset-2',
    name: 'Radio Nawa - Slemani',
    lat: 35.5571,
    lon: 45.4346,
    country: 'Kurdistan',
    countryCode: 'IQ',
    languages: ['ku', 'ar'],
    tags: ['kurdish', 'pop'],
    streamUrl: 'https://example.com/kurdish2',
    homepage: 'https://example.com',
    codec: 'MP3',
    bitrate: 128,
    state: 'Slemani',
    metadataTrust: 'untrusted-community'
  },
  {
    id: 'persian-preset-1',
    name: 'Radio Farda - Tehran',
    lat: 35.6892,
    lon: 51.3890,
    country: 'Iran',
    countryCode: 'IR',
    languages: ['fa'],
    tags: ['persian', 'news', 'talk'],
    streamUrl: 'https://example.com/persian1',
    homepage: 'https://example.com',
    codec: 'MP3',
    bitrate: 128,
    state: 'Tehran',
    metadataTrust: 'untrusted-community'
  },
  {
    id: 'persian-preset-2',
    name: 'Radio Javan - Persian Pop',
    lat: 35.6892,
    lon: 51.3890,
    country: 'Iran',
    countryCode: 'IR',
    languages: ['fa'],
    tags: ['persian', 'pop', 'music'],
    streamUrl: 'https://example.com/persian2',
    homepage: 'https://example.com',
    codec: 'MP3',
    bitrate: 128,
    state: 'Tehran',
    metadataTrust: 'untrusted-community'
  }
];

// Enhanced categories for radio filter UI
export const REGIONAL_RADIO_CATEGORIES = [
  { id: 'all', label: 'All Stations', label_fa: 'همه', label_ku: 'هەموو', color: '#b9fbff' },
  { id: 'kurdish', label: 'Kurdish - کوردی', label_fa: 'کردی', label_ku: 'کوردی', color: '#ff2a2a' },
  { id: 'persian', label: 'Persian - فارسی', label_fa: 'فارسی', label_ku: 'فارسی', color: '#00ff88' },
  { id: 'turkish', label: 'Turkish - Türkçe', label_fa: 'ترکی', label_ku: 'تورکی', color: '#ff8800' },
  { id: 'arabic', label: 'Arabic - العربية', label_fa: 'عربی', label_ku: 'عەرەبی', color: '#44adff' },
  { id: 'regional', label: 'Middle East', label_fa: 'خاورمیانه', label_ku: 'ڕۆژهەڵاتی ناوەڕاست', color: '#ffd166' },
];

/**
 * Filter stations by regional category
 */
export function filterByRegionalCategory(stations, category) {
  if (!category || category === 'all') return stations;
  
  return stations.filter(station => {
    switch(category) {
      case 'kurdish': return isKurdishStation(station);
      case 'persian': return isPersianStation(station);
      case 'turkish': return (station.countryCode === 'TR' || (station.languages || []).some(l => l.toLowerCase().includes('tr')));
      case 'arabic': return (station.languages || []).some(l => l.toLowerCase().includes('ar')) || ['SY','IQ','SA','AE','EG'].includes(station.countryCode);
      case 'regional': return isRegionalStation(station);
      default: return true;
    }
  });
}

/**
 * Rank regional stations by proximity to Kurdistan/Iran
 */
export function rankRegionalStations(stations, anchor = { lat: 36.1911, lon: 44.0090 }) {
  const targetLat = anchor.lat;
  const targetLon = anchor.lon;
  
  return [...stations].sort((a, b) => {
    // Kurdish/Persian first
    const aScore = (isKurdishStation(a) ? 0 : isPersianStation(a) ? 1 : 2);
    const bScore = (isKurdishStation(b) ? 0 : isPersianStation(b) ? 1 : 2);
    if (aScore !== bScore) return aScore - bScore;
    
    // Then by distance to anchor
    const distA = Math.hypot(a.lat - targetLat, a.lon - targetLon);
    const distB = Math.hypot(b.lat - targetLat, b.lon - targetLon);
    return distA - distB;
  });
}
