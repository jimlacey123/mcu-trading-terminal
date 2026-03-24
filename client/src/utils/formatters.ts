import { INSTRUMENTS } from './instruments';

export function formatCurrency(value: number, showSign = false): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = value < 0 ? '-$' : showSign && value > 0 ? '+$' : '$';
  return `${prefix}${formatted}`;
}

export function formatPnl(value: number): string {
  return formatCurrency(value, true);
}

export function formatPrice(value: number, symbol?: string): string {
  const decimals = symbol && INSTRUMENTS[symbol] ? INSTRUMENTS[symbol].priceDecimals : 2;
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}
