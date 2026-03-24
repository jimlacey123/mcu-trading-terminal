import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { fetchPriceHistory } from '../hooks/usePrices';
import { INSTRUMENTS } from '../utils/instruments';
import { formatPrice, formatCurrency } from '../utils/formatters';
import type { ChartDataPoint, Position, PriceData, TimeRange } from '../types';

interface PriceChartProps {
  symbol: string;
  prices: PriceData[];
  positions: Position[];
}

const RANGE_OPTIONS: { label: string; value: TimeRange; apiRange: string }[] = [
  { label: '1D', value: '1D', apiRange: '1d' },
  { label: '5D', value: '5D', apiRange: '5d' },
  { label: '1M', value: '1M', apiRange: '1mo' },
  { label: '3M', value: '3M', apiRange: '3mo' },
];

export default function PriceChart({ symbol, prices, positions }: PriceChartProps) {
  const [range, setRange] = useState<TimeRange>('5D');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const spec = INSTRUMENTS[symbol];
  const currentPrice = prices.find((p) => p.symbol === symbol)?.price;
  const entryPosition = positions.find((p) => p.instrument === symbol);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const apiRange = RANGE_OPTIONS.find((r) => r.value === range)?.apiRange || '5d';
    fetchPriceHistory(symbol, apiRange).then((data) => {
      if (!cancelled) {
        setChartData(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [symbol, range]);

  function formatXAxis(timestamp: number) {
    const d = new Date(timestamp);
    if (range === '1D') {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const priceDecimals = spec?.priceDecimals || 2;

  return (
    <div className="panel h-full flex flex-col p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="terminal-label text-xs" style={{ color: 'var(--orange)' }}>
            {spec?.name || symbol}
          </span>
          <span className="terminal-label text-xs ml-2" style={{ color: 'var(--muted)' }}>
            {symbol}
          </span>
        </div>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className="px-2 py-1 text-xs terminal-label"
              style={{
                background: range === opt.value ? 'var(--orange)' : 'transparent',
                color: range === opt.value ? '#000' : 'var(--muted)',
                border: `1px solid ${range === opt.value ? 'var(--orange)' : 'var(--border)'}`,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="terminal-label text-sm" style={{ color: 'var(--muted)' }}>
              LOADING...
            </span>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <span className="terminal-label text-sm" style={{ color: 'var(--muted)' }}>
              NO DATA AVAILABLE
            </span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff6600" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff6600" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatXAxis}
                stroke="#333"
                tick={{ fill: '#666', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                axisLine={{ stroke: '#222' }}
                tickLine={false}
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="#333"
                tick={{ fill: '#666', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                axisLine={{ stroke: '#222' }}
                tickLine={false}
                tickFormatter={(v) => v.toFixed(priceDecimals)}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: '#0f0f0f',
                  border: '1px solid #222',
                  borderRadius: 0,
                  fontFamily: 'IBM Plex Mono',
                  fontSize: 12,
                }}
                labelFormatter={(ts) => new Date(ts as number).toLocaleString()}
                formatter={(value: number) => [value.toFixed(priceDecimals), 'Price']}
              />
              {entryPosition && (
                <ReferenceLine
                  y={entryPosition.entry_price}
                  stroke="#ff6600"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  label={{
                    value: 'YOUR ENTRY',
                    fill: '#ff6600',
                    fontSize: 10,
                    fontFamily: 'IBM Plex Sans Condensed',
                    position: 'right',
                  }}
                />
              )}
              <Area
                type="monotone"
                dataKey="price"
                stroke="#ff6600"
                strokeWidth={1.5}
                fill="url(#priceGradient)"
                dot={false}
                activeDot={{ r: 3, fill: '#ff6600' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom info */}
      <div className="mt-2 flex items-center justify-between border-t border-terminal-border pt-2">
        <div>
          {currentPrice && (
            <span className="terminal-number text-lg font-bold" style={{ color: 'var(--text)' }}>
              {formatPrice(currentPrice, symbol)}
            </span>
          )}
        </div>
        <div className="terminal-label text-xs" style={{ color: 'var(--muted)' }}>
          {spec?.category === 'ENERGY'
            ? `1 CONTRACT = ${spec.fullContractSize.toLocaleString()} ${spec.unit.toUpperCase()}`
            : `1 LOT = ${spec?.fullContractSize.toLocaleString()} UNITS`}
        </div>
      </div>
    </div>
  );
}
