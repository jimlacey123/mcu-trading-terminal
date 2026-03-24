import { INSTRUMENTS } from './instruments';

export function calculateNotionalValue(
  symbol: string,
  price: number,
  contracts: number,
  size: 'FULL' | 'MINI'
): number {
  const spec = INSTRUMENTS[symbol];
  if (!spec) return 0;
  const contractSize = size === 'FULL' ? spec.fullContractSize : spec.miniContractSize;
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
  const spec = INSTRUMENTS[symbol];
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
    // EUR/USD, GBP/USD, AUD/USD — price is USD per 1 foreign unit
    if (direction === 'LONG') {
      return (currentPrice - entryPrice) * contracts * contractSize;
    } else {
      return (entryPrice - currentPrice) * contracts * contractSize;
    }
  } else {
    // USD/JPY, USD/CNY, etc. — price is foreign units per 1 USD
    if (direction === 'LONG') {
      // LONG USD (short foreign)
      return (1 / currentPrice - 1 / entryPrice) * contracts * contractSize * currentPrice;
    } else {
      // SHORT USD (long foreign)
      return (1 / entryPrice - 1 / currentPrice) * contracts * contractSize * currentPrice;
    }
  }
}

export function inferContractSize(
  symbol: string,
  notionalValue: number,
  entryPrice: number,
  contracts: number
): number {
  // Reverse-calculate the contract size from stored notional
  if (entryPrice === 0 || contracts === 0) return 0;
  return notionalValue / (entryPrice * contracts);
}
