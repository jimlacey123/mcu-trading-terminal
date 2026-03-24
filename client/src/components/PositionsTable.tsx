import type { Position, PriceData } from '../types';
import { INSTRUMENTS } from '../utils/instruments';
import { formatPrice, formatPnl } from '../utils/formatters';
import { calculateUnrealizedPnl, inferContractSize } from '../utils/pnlCalculations';

interface PositionsTableProps {
  positions: Position[];
  prices: PriceData[];
  onClose: (positionId: number) => void;
}

export default function PositionsTable({ positions, prices, onClose }: PositionsTableProps) {
  const priceMap = new Map(prices.map((p) => [p.symbol, p]));

  if (positions.length === 0) {
    return (
      <div className="p-3">
        <div className="terminal-label text-xs mb-2" style={{ color: 'var(--orange)' }}>
          OPEN POSITIONS
        </div>
        <div className="terminal-label text-xs text-center py-6" style={{ color: 'var(--muted)' }}>
          NO OPEN POSITIONS
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="terminal-label text-xs mb-2" style={{ color: 'var(--orange)' }}>
        OPEN POSITIONS ({positions.length})
      </div>
      <div className="overflow-auto" style={{ maxHeight: '300px' }}>
        <table>
          <thead>
            <tr>
              <th>Instr</th>
              <th>Dir</th>
              <th>Qty</th>
              <th className="text-right">Entry</th>
              <th className="text-right">Current</th>
              <th className="text-right">P&L</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => {
              const cached = priceMap.get(pos.instrument);
              const currentPrice = cached?.price || pos.entry_price;
              const spec = INSTRUMENTS[pos.instrument];
              const contractSize = inferContractSize(
                pos.instrument,
                pos.notional_value,
                pos.entry_price,
                pos.contracts
              );

              const pnl = calculateUnrealizedPnl(
                pos.instrument,
                pos.direction,
                pos.entry_price,
                currentPrice,
                pos.contracts,
                contractSize
              );

              return (
                <tr key={pos.id}>
                  <td style={{ fontSize: '0.7rem' }}>
                    {pos.instrument.replace('=F', '').replace('=X', '')}
                  </td>
                  <td
                    style={{
                      fontSize: '0.7rem',
                      color: pos.direction === 'LONG' ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    {pos.direction}
                  </td>
                  <td style={{ fontSize: '0.7rem' }}>{pos.contracts}</td>
                  <td className="text-right" style={{ fontSize: '0.7rem' }}>
                    {formatPrice(pos.entry_price, pos.instrument)}
                  </td>
                  <td className="text-right" style={{ fontSize: '0.7rem' }}>
                    {formatPrice(currentPrice, pos.instrument)}
                  </td>
                  <td
                    className="text-right font-semibold"
                    style={{
                      fontSize: '0.7rem',
                      color: pnl >= 0 ? 'var(--green)' : 'var(--red)',
                    }}
                  >
                    {formatPnl(pnl)}
                  </td>
                  <td>
                    <button
                      onClick={() => onClose(pos.id)}
                      className="px-2 py-0.5 text-xs terminal-label"
                      style={{
                        border: '1px solid var(--red)',
                        color: 'var(--red)',
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      CLOSE
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
