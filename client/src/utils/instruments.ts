export interface InstrumentSpec {
  symbol: string;
  name: string;
  category: 'ENERGY' | 'FOREX';
  fullContractSize: number;
  miniContractSize: number;
  unit: string;
  priceDecimals: number;
  quotingConvention: 'USD_PER_UNIT' | 'UNITS_PER_USD';
}

export const INSTRUMENTS: Record<string, InstrumentSpec> = {
  'CL=F': {
    symbol: 'CL=F',
    name: 'WTI Crude Oil',
    category: 'ENERGY',
    fullContractSize: 1000,
    miniContractSize: 100,
    unit: 'barrels',
    priceDecimals: 2,
    quotingConvention: 'USD_PER_UNIT',
  },
  'BZ=F': {
    symbol: 'BZ=F',
    name: 'Brent Crude',
    category: 'ENERGY',
    fullContractSize: 1000,
    miniContractSize: 100,
    unit: 'barrels',
    priceDecimals: 2,
    quotingConvention: 'USD_PER_UNIT',
  },
  'NG=F': {
    symbol: 'NG=F',
    name: 'Natural Gas',
    category: 'ENERGY',
    fullContractSize: 10000,
    miniContractSize: 1000,
    unit: 'MMBtu',
    priceDecimals: 2,
    quotingConvention: 'USD_PER_UNIT',
  },
  'EURUSD=X': {
    symbol: 'EURUSD=X',
    name: 'Euro',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'EUR',
    priceDecimals: 4,
    quotingConvention: 'USD_PER_UNIT',
  },
  'GBPUSD=X': {
    symbol: 'GBPUSD=X',
    name: 'British Pound',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'GBP',
    priceDecimals: 4,
    quotingConvention: 'USD_PER_UNIT',
  },
  'JPY=X': {
    symbol: 'JPY=X',
    name: 'Japanese Yen',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'CNY=X': {
    symbol: 'CNY=X',
    name: 'Chinese Yuan',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'RUB=X': {
    symbol: 'RUB=X',
    name: 'Russian Ruble',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'CAD=X': {
    symbol: 'CAD=X',
    name: 'Canadian Dollar',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'CHF=X': {
    symbol: 'CHF=X',
    name: 'Swiss Franc',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'AUD=X': {
    symbol: 'AUD=X',
    name: 'Australian Dollar',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'AUD',
    priceDecimals: 4,
    quotingConvention: 'USD_PER_UNIT',
  },
  'MXN=X': {
    symbol: 'MXN=X',
    name: 'Mexican Peso',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'BRL=X': {
    symbol: 'BRL=X',
    name: 'Brazilian Real',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'INR=X': {
    symbol: 'INR=X',
    name: 'Indian Rupee',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'KRW=X': {
    symbol: 'KRW=X',
    name: 'South Korean Won',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
  'SAR=X': {
    symbol: 'SAR=X',
    name: 'Saudi Riyal',
    category: 'FOREX',
    fullContractSize: 100000,
    miniContractSize: 10000,
    unit: 'USD',
    priceDecimals: 4,
    quotingConvention: 'UNITS_PER_USD',
  },
};

export const ENERGY_SYMBOLS = Object.keys(INSTRUMENTS).filter(
  (s) => INSTRUMENTS[s].category === 'ENERGY'
);

export const FOREX_SYMBOLS = Object.keys(INSTRUMENTS).filter(
  (s) => INSTRUMENTS[s].category === 'FOREX'
);

export const ALL_SYMBOLS = Object.keys(INSTRUMENTS);

export function getContractSize(symbol: string, size: 'FULL' | 'MINI'): number {
  const spec = INSTRUMENTS[symbol];
  if (!spec) return 0;
  return size === 'FULL' ? spec.fullContractSize : spec.miniContractSize;
}

export function getContractSizeLabel(symbol: string, size: 'FULL' | 'MINI'): string {
  const spec = INSTRUMENTS[symbol];
  if (!spec) return '';
  const contractSize = size === 'FULL' ? spec.fullContractSize : spec.miniContractSize;
  if (spec.category === 'ENERGY') {
    return `1 CONTRACT = ${contractSize.toLocaleString()} ${spec.unit.toUpperCase()}`;
  }
  return `1 LOT = ${contractSize.toLocaleString()} UNITS`;
}
