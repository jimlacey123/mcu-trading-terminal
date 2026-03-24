import { useEffect, useRef } from 'react';
import type { PriceData } from '../types';
import { ENERGY_SYMBOLS, FOREX_SYMBOLS, INSTRUMENTS } from '../utils/instruments';
import { formatPrice, formatPercent } from '../utils/formatters';

interface PriceBoardProps {
  prices: PriceData[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
}

export default function PriceBoard({ prices, selectedSymbol, onSelectSymbol }: PriceBoardProps) {
  const priceMap = new Map(prices.map((p) => [p.symbol, p]));
  const prevPricesRef = useRef<Map<string, number>>(new Map());
  const flashTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const newPrevMap = new Map<string, number>();
    prices.forEach((p) => newPrevMap.set(p.symbol, p.price));
    prevPricesRef.current = newPrevMap;
  }, [prices]);

  function renderRow(symbol: string) {
    const p = priceMap.get(symbol);
    const spec = INSTRUMENTS[symbol];
    if (!p || !spec) return null;

    const prev = prevPricesRef.current.get(symbol);
    let flashClass = '';
    if (prev !== undefined && prev !== p.price) {
      flashClass = p.price > prev ? 'flash-green' : 'flash-red';
    }

    const isSelected = symbol === selectedSymbol;

    return (
      <tr
        key={symbol}
        className={`cursor-pointer hover:bg-terminal-border transition-colors ${flashClass} ${
          isSelected ? 'bg-terminal-border' : ''
        }`}
        onClick={() => onSelectSymbol(symbol)}
        style={isSelected ? { borderLeft: '2px solid var(--orange)' } : {}}
      >
        <td className="font-semibold" style={{ color: 'var(--orange)', fontSize: '0.75rem' }}>
          {symbol.replace('=F', '').replace('=X', '')}
        </td>
        <td style={{ color: 'var(--muted)', fontSize: '0.7rem', fontFamily: "'IBM Plex Sans Condensed', sans-serif" }}>
          {spec.name}
        </td>
        <td className="text-right">{formatPrice(p.price, symbol)}</td>
        <td
          className="text-right"
          style={{ color: p.change >= 0 ? 'var(--green)' : 'var(--red)' }}
        >
          {p.change >= 0 ? '+' : ''}
          {p.change.toFixed(spec.priceDecimals)}
        </td>
        <td
          className="text-right"
          style={{ color: p.changePct >= 0 ? 'var(--green)' : 'var(--red)' }}
        >
          {formatPercent(p.changePct)}
        </td>
      </tr>
    );
  }

  return (
    <div className="panel h-full overflow-auto p-2">
      <div className="terminal-label text-xs mb-2 px-1" style={{ color: 'var(--orange)' }}>
        ENERGY FUTURES
      </div>
      <table className="mb-4">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th className="text-right">Last</th>
            <th className="text-right">Chg</th>
            <th className="text-right">%Chg</th>
          </tr>
        </thead>
        <tbody>{ENERGY_SYMBOLS.map(renderRow)}</tbody>
      </table>

      <div className="terminal-label text-xs mb-2 px-1 mt-4" style={{ color: 'var(--orange)' }}>
        FOREX — USD PAIRS
      </div>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th className="text-right">Last</th>
            <th className="text-right">Chg</th>
            <th className="text-right">%Chg</th>
          </tr>
        </thead>
        <tbody>{FOREX_SYMBOLS.map(renderRow)}</tbody>
      </table>
    </div>
  );
}
