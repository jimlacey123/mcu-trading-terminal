import {
  getAllStudents,
  getPositionsByStudent,
  getTradeCountMap,
  getBestTradeMap,
} from '../services/database';
import { getCachedPrice } from '../services/priceCache';
import { calculateUnrealizedPnl, inferContractSize } from '../utils/pnlCalculations';

const STARTING_BALANCE = 1000000.0;

export function buildLeaderboard() {
  const students = getAllStudents();
  const tradeCountMap = getTradeCountMap();
  const bestTradeMap = getBestTradeMap();

  const entries = students.map((student: any) => {
    const positions = getPositionsByStudent(student.id);

    let totalUnrealizedPnl = 0;
    for (const pos of positions) {
      const cached = getCachedPrice(pos.instrument);
      const currentPrice = cached?.price || pos.entry_price;
      const contractSize = inferContractSize(pos.notional_value, pos.entry_price, pos.contracts);
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
    const totalPnl = totalValue - STARTING_BALANCE;
    const pnlPct = (totalPnl / STARTING_BALANCE) * 100;

    return {
      student_id: student.id,
      callsign: student.callsign,
      cash_balance: student.cash_balance,
      unrealized_pnl: totalUnrealizedPnl,
      total_value: totalValue,
      total_pnl: totalPnl,
      pnl_pct: pnlPct,
      num_trades: tradeCountMap.get(student.id) || 0,
      best_trade: bestTradeMap.get(student.id) || 0,
      last_active: student.last_active,
    };
  });

  // Sort by total value descending
  entries.sort((a: any, b: any) => b.total_value - a.total_value);

  // Add ranks
  return entries.map((entry: any, index: number) => ({
    rank: index + 1,
    ...entry,
  }));
}
