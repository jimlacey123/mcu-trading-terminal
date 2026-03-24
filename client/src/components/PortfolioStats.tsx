import type { Student, Position } from '../types';
import { formatCurrency, formatPnl } from '../utils/formatters';
import { calculateUnrealizedPnl, inferContractSize } from '../utils/pnlCalculations';
import type { PriceData } from '../types';

interface PortfolioStatsProps {
  student: Student;
  positions: Position[];
  prices: PriceData[];
}

const STARTING_BALANCE = 1000000;

export default function PortfolioStats({ student, positions, prices }: PortfolioStatsProps) {
  const priceMap = new Map(prices.map((p) => [p.symbol, p]));

  let totalUnrealizedPnl = 0;
  for (const pos of positions) {
    const cached = priceMap.get(pos.instrument);
    const currentPrice = cached?.price || pos.entry_price;
    const contractSize = inferContractSize(
      pos.instrument,
      pos.notional_value,
      pos.entry_price,
      pos.contracts
    );
    totalUnrealizedPnl += calculateUnrealizedPnl(
      pos.instrument,
      pos.direction,
      pos.entry_price,
      currentPrice,
      pos.contracts,
      contractSize
    );
  }

  const totalValue = student.cash_balance + totalUnrealizedPnl;
  const allTimePnl = totalValue - STARTING_BALANCE;

  return (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <div className="terminal-label text-xs mb-1">PORTFOLIO VALUE</div>
        <div className="terminal-number text-xl font-bold" style={{ color: 'var(--text)' }}>
          {formatCurrency(totalValue)}
        </div>
      </div>
      <div className="text-center">
        <div className="terminal-label text-xs mb-1">ALL-TIME P&L</div>
        <div
          className="terminal-number text-lg font-semibold"
          style={{ color: allTimePnl >= 0 ? 'var(--green)' : 'var(--red)' }}
        >
          {formatPnl(allTimePnl)}
        </div>
      </div>
      <div className="text-center">
        <div className="terminal-label text-xs mb-1">UNREALIZED</div>
        <div
          className="terminal-number text-sm"
          style={{ color: totalUnrealizedPnl >= 0 ? 'var(--green)' : 'var(--red)' }}
        >
          {formatPnl(totalUnrealizedPnl)}
        </div>
      </div>
    </div>
  );
}
