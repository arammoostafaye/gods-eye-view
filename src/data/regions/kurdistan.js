/**
 * Kurdistan Region & Middle East - Camera Presets, Airports, Borders
 * Personal Edition - Focus on Kurdistan, Iran, Iraq, Turkey
 */

export const KURDISTAN_PRESETS = [
  {
    id: 'erbil',
    name: { en: 'Erbil', ku: 'هەولێر', fa: 'اربیل' },
    coords: [44.009, 36.1911, 50000], // lon, lat, height
    description: { en: 'Capital of Kurdistan Region', ku: 'پایتەختی هەرێمی کوردستان', fa: 'پایتخت اقلیم کردستان' },
    airport: 'ORER',
    icon: '🏛️'
  },
  {
    id: 'slemani',
    name: { en: 'Slemani', ku: 'سلێمانی', fa: 'سلیمانی' },
    coords: [45.4346, 35.5571, 40000],
    description: { en: 'Cultural capital', ku: 'پایتەختی ڕۆشنبیری', fa: 'پایتخت فرهنگی' },
    airport: 'ORSU',
    icon: '🎭'
  },
  {
    id: 'duhok',
    name: { en: 'Duhok', ku: 'دهۆک', fa: 'دهوک' },
    coords: [42.9882, 36.8677, 35000],
    airport: 'OSDI',
    icon: '🏔️'
  },
  {
    id: 'kirkuk',
    name: { en: 'Kirkuk', ku: 'کەرکووک', fa: 'کرکوک' },
    coords: [44.379, 35.466, 40000],
    icon: '🛢️',
    description: { en: 'Oil city', ku: 'شاری نەوت', fa: 'شهر نفت' }
  },
  {
    id: 'halabja',
    name: { en: 'Halabja', ku: 'هەڵەبجە', fa: 'حلبچه' },
    coords: [45.985, 35.183, 30000],
    icon: '🕊️'
  }
];

export const IRAN_PRESETS = [
  {
    id: 'tehran',
    name: { en: 'Tehran', fa: 'تهران', ku: 'تاران' },
    coords: [51.389, 35.6892, 80000],
    airport: 'OIII',
    icon: '🏙️'
  },
  {
    id: 'isfahan',
    name: { en: 'Isfahan', fa: 'اصفهان' },
    coords: [51.675, 32.6539, 50000],
    airport: 'OIFM',
    icon: '🕌'
  },
  {
    id: 'tabriz',
    name: { en: 'Tabriz', fa: 'تبریز' },
    coords: [46.2738, 38.08, 45000],
    airport: 'OITT',
    icon: '🧶'
  },
  {
    id: 'sanandaj',
    name: { en: 'Sanandaj', fa: 'سنندج', ku: 'سنە' },
    coords: [47.0, 35.311, 35000],
    airport: 'OICS',
    icon: '🎵'
  },
  {
    id: 'urmia',
    name: { en: 'Urmia', fa: 'ارومیه', ku: 'ورمێ' },
    coords: [45.0766, 37.549, 40000],
    airport: 'OITR',
    icon: '🌊'
  },
  {
    id: 'shiraz',
    name: { en: 'Shiraz', fa: 'شیراز' },
    coords: [52.5311, 29.6103, 50000],
    airport: 'OISS',
    icon: '🍷'
  }
];

export const MIDDLE_EAST_PRESETS = [
  {
    id: 'persian-gulf',
    name: { en: 'Persian Gulf', fa: 'خلیج فارس', ku: 'کەنداوی فارس' },
    coords: [51.5, 26.5, 600000],
    icon: '🚢',
    description: { en: 'Strait of Hormuz - World oil chokepoint', fa: 'تنگه هرمز - گلوگاه نفت جهان' }
  },
  {
    id: 'kurdistan-region',
    name: { en: 'Greater Kurdistan', ku: 'کوردستانی گەورە', fa: 'کردستان بزرگ' },
    coords: [44.5, 37.0, 800000],
    icon: '☀️'
  },
  {
    id: 'baghdad',
    name: { en: 'Baghdad', fa: 'بغداد' },
    coords: [44.3661, 33.3152, 60000],
    airport: 'ORBI',
    icon: '🏛️'
  },
  {
    id: 'istanbul',
    name: { en: 'Istanbul', fa: 'استانبول', ku: 'ئەستەمبوڵ' },
    coords: [28.9784, 41.0082, 70000],
    airport: 'LTFM',
    icon: '🕌'
  },
  {
    id: 'zagros',
    name: { en: 'Zagros Mountains', fa: 'کوه‌های زاگرس', ku: 'چیاکانی زاگرۆس' },
    coords: [48.0, 34.0, 500000],
    icon: '🏔️'
  }
];

// Airports in region with ICAO
export const REGIONAL_AIRPORTS = {
  // Kurdistan Region
  'ORER': { name: 'Erbil International', city: 'Erbil', coords: [44.009, 36.1911], country: 'Kurdistan' },
  'ORSU': { name: 'Sulaimaniyah International', city: 'Slemani', coords: [45.4346, 35.5571], country: 'Kurdistan' },
  // Iran
  'OIII': { name: 'Mehrabad', city: 'Tehran', coords: [51.312, 35.6892], country: 'Iran' },
  'OIIE': { name: 'Imam Khomeini', city: 'Tehran', coords: [51.152, 35.4161], country: 'Iran' },
  'OIFM': { name: 'Shahid Beheshti', city: 'Isfahan', coords: [51.8617, 32.7508], country: 'Iran' },
  'OITT': { name: 'Shahid Madani', city: 'Tabriz', coords: [46.235, 38.1339], country: 'Iran' },
  'OICS': { name: 'Sanandaj', city: 'Sanandaj', coords: [47.009, 35.2458], country: 'Iran' },
  // Iraq
  'ORBI': { name: 'Baghdad International', city: 'Baghdad', coords: [44.2346, 33.2625], country: 'Iraq' },
  'ORNI': { name: 'Najaf', city: 'Najaf', coords: [44.4042, 32.0], country: 'Iraq' },
  // Turkey
  'LTFM': { name: 'Istanbul Airport', city: 'Istanbul', coords: [28.815, 41.275], country: 'Turkey' },
  'LTBJ': { name: 'Adnan Menderes', city: 'Izmir', coords: [27.155, 38.2924], country: 'Turkey' },
};

// Airlines to highlight (Iranian, Kurdish, Turkish)
export const REGIONAL_AIRLINES = {
  'IRA': 'Iran Air',
  'IRM': 'Mahan Air',
  'IRC': 'Iran Aseman',
  'KIS': 'Kish Air',
  'QSM': 'Qeshm Air',
  'THR': 'ATA Airlines',
  'THY': 'Turkish Airlines',
  'PGT': 'Pegasus',
  'IAW': 'Iraqi Airways',
};

// GeoJSON border for Kurdistan (approximate - for visualization)
export const KURDISTAN_BORDER_GEOJSON = {
  type: 'Feature',
  properties: { name: 'Kurdistan Region Approximate' },
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [42.5, 37.5], [44.0, 37.8], [45.5, 37.5], [46.5, 36.8],
      [46.0, 35.5], [45.0, 34.8], [43.5, 34.5], [42.0, 35.0],
      [41.5, 36.0], [42.5, 37.5]
    ]]
  }
};

export const ALL_PRESETS = [...KURDISTAN_PRESETS, ...IRAN_PRESETS, ...MIDDLE_EAST_PRESETS];

export function getPresetById(id) {
  return ALL_PRESETS.find(p => p.id === id);
}

export function getPresetsByRegion(region) {
  switch(region) {
    case 'kurdistan': return KURDISTAN_PRESETS;
    case 'iran': return IRAN_PRESETS;
    case 'middleEast': return MIDDLE_EAST_PRESETS;
    default: return ALL_PRESETS;
  }
}
