import type { PriceData } from '../types';
import { formatPrice } from '../utils/formatters';

interface TickerTapeProps {
  prices: PriceData[];
}

export default function TickerTape({ prices }: TickerTapeProps) {
  if (prices.length === 0) return null;

  // Double the items for seamless scrolling
  const items = [...prices, ...prices];

  return (
    <div className="w-full overflow-hidden border-b border-terminal-border" style={{ background: '#0c0c0c' }}>
      <div className="ticker-scroll flex whitespace-nowrap py-1">
        {items.map((p, i) => (
          <span key={`${p.symbol}-${i}`} className="inline-flex items-center gap-2 px-4 text-xs">
            <span className="terminal-label" style={{ fontSize: '0.65rem', color: '#999' }}>
              {p.symbol.replace('=F', '').replace('=X', '')}
            </span>
            <span className="terminal-number" style={{ fontSize: '0.7rem' }}>
              {formatPrice(p.price, p.symbol)}
            </span>
            <span
              className="terminal-number"
              style={{
                fontSize: '0.65rem',
                color: p.change >= 0 ? 'var(--green)' : 'var(--red)',
              }}
            >
              {p.change >= 0 ? '+' : ''}
              {p.change.toFixed(p.symbol.includes('=X') ? 4 : 2)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
