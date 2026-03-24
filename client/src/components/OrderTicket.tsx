import { useState, useEffect } from 'react';
import type { Student, PriceData } from '../types';
import { INSTRUMENTS, ALL_SYMBOLS, getContractSize } from '../utils/instruments';
import { calculateNotionalValue, calculateMarginRequired } from '../utils/pnlCalculations';
import { formatCurrency } from '../utils/formatters';

interface OrderTicketProps {
  student: Student;
  prices: PriceData[];
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  onSubmitOrder: (order: {
    instrument: string;
    direction: 'LONG' | 'SHORT';
    size: 'FULL' | 'MINI';
    quantity: number;
  }) => Promise<any>;
}

export default function OrderTicket({
  student,
  prices,
  selectedSymbol,
  onSelectSymbol,
  onSubmitOrder,
}: OrderTicketProps) {
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [size, setSize] = useState<'FULL' | 'MINI'>('FULL');
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const priceMap = new Map(prices.map((p) => [p.symbol, p]));
  const currentPrice = priceMap.get(selectedSymbol)?.price || 0;
  const spec = INSTRUMENTS[selectedSymbol];

  const notionalValue = calculateNotionalValue(selectedSymbol, currentPrice, quantity, size);
  const marginRequired = calculateMarginRequired(notionalValue);
  const cashAvailable = student.cash_balance;
  const afterTrade = cashAvailable - marginRequired;
  const insufficientMargin = marginRequired > cashAvailable;

  useEffect(() => {
    setError('');
    setSuccess('');
  }, [selectedSymbol, direction, size, quantity]);

  async function handleSubmit() {
    if (insufficientMargin || submitting) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    const result = await onSubmitOrder({
      instrument: selectedSymbol,
      direction,
      size,
      quantity,
    });

    if (result.success) {
      setSuccess(`ORDER FILLED — ${direction} ${quantity}x ${selectedSymbol}`);
      setQuantity(1);
    } else {
      setError(result.error || 'Order failed');
    }

    setSubmitting(false);
  }

  return (
    <div className="p-3">
      <div className="terminal-label text-xs mb-3" style={{ color: 'var(--orange)' }}>
        ORDER TICKET
      </div>

      {/* Instrument selector */}
      <div className="mb-3">
        <label className="terminal-label text-xs block mb-1">INSTRUMENT</label>
        <select
          value={selectedSymbol}
          onChange={(e) => onSelectSymbol(e.target.value)}
          className="w-full text-sm"
        >
          {ALL_SYMBOLS.map((s) => (
            <option key={s} value={s}>
              {s.replace('=F', '').replace('=X', '')} — {INSTRUMENTS[s].name}
            </option>
          ))}
        </select>
      </div>

      {/* Direction */}
      <div className="mb-3">
        <label className="terminal-label text-xs block mb-1">DIRECTION</label>
        <div className="flex gap-1">
          {(['LONG', 'SHORT'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirection(d)}
              className="flex-1 py-1.5 text-xs terminal-label font-semibold"
              style={{
                background: direction === d ? 'var(--orange)' : 'transparent',
                color: direction === d ? '#000' : 'var(--muted)',
                border: `1px solid ${direction === d ? 'var(--orange)' : 'var(--border)'}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mb-3">
        <label className="terminal-label text-xs block mb-1">SIZE</label>
        <div className="flex gap-1">
          {(['FULL', 'MINI'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className="flex-1 py-1.5 text-xs terminal-label font-semibold"
              style={{
                background: size === s ? 'var(--orange)' : 'transparent',
                color: size === s ? '#000' : 'var(--muted)',
                border: `1px solid ${size === s ? 'var(--orange)' : 'var(--border)'}`,
              }}
            >
              {s === 'FULL' ? 'FULL CONTRACT' : 'MINI (1/10)'}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <label className="terminal-label text-xs block mb-1">QUANTITY (1-50)</label>
        <input
          type="number"
          min={1}
          max={50}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
          className="w-full text-sm"
        />
      </div>

      {/* Calculated values */}
      <div className="border border-terminal-border p-2 mb-4 space-y-1">
        <div className="flex justify-between">
          <span className="terminal-label text-xs">NOTIONAL VALUE</span>
          <span className="terminal-number text-xs">{formatCurrency(notionalValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="terminal-label text-xs">MARGIN REQUIRED</span>
          <span className="terminal-number text-xs">{formatCurrency(marginRequired)}</span>
        </div>
        <div className="flex justify-between">
          <span className="terminal-label text-xs">CASH AVAILABLE</span>
          <span className="terminal-number text-xs">{formatCurrency(cashAvailable)}</span>
        </div>
        <div className="flex justify-between border-t border-terminal-border pt-1">
          <span className="terminal-label text-xs">AFTER TRADE</span>
          <span
            className="terminal-number text-xs font-semibold"
            style={{ color: afterTrade >= 0 ? 'var(--text)' : 'var(--red)' }}
          >
            {formatCurrency(afterTrade)}
          </span>
        </div>
      </div>

      {/* Insufficient margin warning */}
      {insufficientMargin && (
        <div
          className="text-center py-1 mb-2 terminal-label text-xs"
          style={{ color: 'var(--red)', border: '1px solid var(--red)' }}
        >
          INSUFFICIENT MARGIN
        </div>
      )}

      {/* Error / Success messages */}
      {error && (
        <div className="text-center py-1 mb-2 terminal-label text-xs" style={{ color: 'var(--red)' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="text-center py-1 mb-2 terminal-label text-xs" style={{ color: 'var(--green)' }}>
          {success}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={insufficientMargin || submitting || currentPrice === 0}
        className="btn-orange w-full py-2 text-sm"
      >
        {submitting ? 'SUBMITTING...' : 'SUBMIT ORDER'}
      </button>
    </div>
  );
}
