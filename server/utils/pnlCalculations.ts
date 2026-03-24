// Server-side copy of P&L calculations
// Mirrors client/src/utils/pnlCalculations.ts

interface InstrumentSpec {
  category: 'ENERGY' | 'FOREX';
  quotingConvention: 'USD_PER_UNIT' | 'UNITS_PER_USD';
}

const INSTRUMENT_SPECS: Record<string, InstrumentSpec> = {
  'CL=F': { category: 'ENERGY', quotingConvention: 'USD_PER_UNIT' },
  'BZ=F': { category: 'ENERGY', quotingConvention: 'USD_PER_UNIT' },
  'NG=F': { category: 'ENERGY', quotingConvention: 'USD_PER_UNIT' },
  'EURUSD=X': { category: 'FOREX', quotingConvention: 'USD_PER_UNIT' },
  'GBPUSD=X': { category: 'FOREX', quotingConvention: 'USD_PER_UNIT' },
  'JPY=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'CNY=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'RUB=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'CAD=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'CHF=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'AUD=X': { category: 'FOREX', quotingConvention: 'USD_PER_UNIT' },
  'MXN=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'BRL=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'INR=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'KRW=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
  'SAR=X': { category: 'FOREX', quotingConvention: 'UNITS_PER_USD' },
};

const CONTRACT_SIZES: Record<string, { full: number; mini: number }> = {
  'CL=F': { full: 1000, mini: 100 },
  'BZ=F': { full: 1000, mini: 100 },
  'NG=F': { full: 10000, mini: 1000 },
};

// All forex default
const FOREX_LOT = { full: 100000, mini: 10000 };

export function getContractSize(symbol: string, size: 'FULL' | 'MINI'): number {
  const cs = CONTRACT_SIZES[symbol];
  if (cs) return size === 'FULL' ? cs.full : cs.mini;
  const spec = INSTRUMENT_SPECS[symbol];
  if (spec && spec.category === 'FOREX') {
    return size === 'FULL' ? FOREX_LOT.full : FOREX_LOT.mini;
  }
  return 0;
}

export function calculateNotionalValue(
  symbol: string,
  price: number,
  contracts: number,
  size: 'FULL' | 'MINI'
): number {
  const contractSize = getContractSize(symbol, size);
  return price * contracts * contractSize;
}

export function calculateMarginRequired(notionalValue: number): number {
  return notionalValue * 0.1;
}

export function calculateUnrealizedPnl(
  symbol: string,
  direction: 'LONG' | 'SHORT',
  entryPrice: number,
  currentPrice: number,
  contracts: number,
  contractSize: number
): number {
  const spec = INSTRUMENT_SPECS[symbol];
  if (!spec) return 0;

  if (spec.category === 'ENERGY') {
    if (direction === 'LONG') {
      return (currentPrice - entryPrice) * contracts * contractSize;
    } else {
      return (entryPrice - currentPrice) * contracts * contractSize;
    }
  }

  // FOREX
  if (spec.quotingConvention === 'USD_PER_UNIT') {
    if (direction === 'LONG') {
      return (currentPrice - entryPrice) * contracts * contractSize;
    } else {
      return (entryPrice - currentPrice) * contracts * contractSize;
    }
  } else {
    if (direction === 'LONG') {
      return (1 / currentPrice - 1 / entryPrice) * contracts * contractSize * currentPrice;
    } else {
      return (1 / entryPrice - 1 / currentPrice) * contracts * contractSize * currentPrice;
    }
  }
}

export function inferContractSize(
  notionalValue: number,
  entryPrice: number,
  contracts: number
): number {
  if (entryPrice === 0 || contracts === 0) return 0;
  return notionalValue / (entryPrice * contracts);
}
