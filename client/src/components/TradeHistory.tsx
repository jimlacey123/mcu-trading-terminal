import { useState } from 'react';
import type { Trade } from '../types';
import { formatPrice, formatPnl, formatDate } from '../utils/formatters';

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="p-3 border-t border-terminal-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="terminal-label text-xs w-full text-left flex items-center justify-between"
        style={{ color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
      >
        <span>TRADE HISTORY ({trades.length})</span>
        <span>{expanded ? '▼' : '▶'}</span>
      </button>

      {expanded && (
        <div className="mt-2 overflow-auto" style={{ maxHeight: '250px' }}>
          {trades.length === 0 ? (
            <div className="terminal-label text-xs text-center py-4" style={{ color: 'var(--muted)' }}>
              NO CLOSED TRADES
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Instr</th>
                  <th>Dir</th>
                  <th className="text-right">Entry</th>
                  <th className="text-right">Exit</th>
                  <th className="text-right">P&L</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                      {formatDate(t.closed_at)}
                    </td>
                    <td style={{ fontSize: '0.7rem' }}>
                      {t.instrument.replace('=F', '').replace('=X', '')}
                    </td>
                    <td
                      style={{
                        fontSize: '0.7rem',
                        color: t.direction === 'LONG' ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {t.direction}
                    </td>
                    <td className="text-right" style={{ fontSize: '0.7rem' }}>
                      {formatPrice(t.entry_price, t.instrument)}
                    </td>
                    <td className="text-right" style={{ fontSize: '0.7rem' }}>
                      {formatPrice(t.exit_price, t.instrument)}
                    </td>
                    <td
                      className="text-right font-semibold"
                      style={{
                        fontSize: '0.7rem',
                        color: t.realized_pnl >= 0 ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {formatPnl(t.realized_pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
