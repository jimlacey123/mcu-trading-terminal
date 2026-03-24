export interface Student {
  id: number;
  callsign: string;
  cash_balance: number;
  created_at: string;
  last_active: string;
}

export interface Position {
  id: number;
  student_id: number;
  instrument: string;
  direction: 'LONG' | 'SHORT';
  contracts: number;
  entry_price: number;
  notional_value: number;
  margin_held: number;
  opened_at: string;
  unrealized_pnl?: number;
  current_price?: number;
}

export interface Trade {
  id: number;
  student_id: number;
  instrument: string;
  direction: 'LONG' | 'SHORT';
  contracts: number;
  entry_price: number;
  exit_price: number;
  realized_pnl: number;
  opened_at: string;
  closed_at: string;
  callsign?: string;
}

export interface PriceData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  bid: number;
  ask: number;
  timestamp: string;
  cached: boolean;
  previousPrice?: number;
}

export interface LeaderboardEntry {
  rank: number;
  callsign: string;
  student_id: number;
  cash_balance: number;
  unrealized_pnl: number;
  total_value: number;
  total_pnl: number;
  pnl_pct: number;
  num_trades: number;
  best_trade: number;
  last_active: string;
}

export interface OrderRequest {
  studentId: number;
  instrument: string;
  direction: 'LONG' | 'SHORT';
  size: 'FULL' | 'MINI';
  quantity: number;
}

export interface OrderResponse {
  success: boolean;
  position?: Position;
  newBalance?: number;
  error?: string;
}

export interface CloseResponse {
  success: boolean;
  realizedPnl?: number;
  newBalance?: number;
  error?: string;
}

export interface ProfessorStats {
  totalStudents: number;
  activeToday: number;
  totalTrades: number;
  mostTradedInstrument: string;
  largestGain: number;
  largestLoss: number;
}

export interface ResetEvent {
  id: number;
  scope: string;
  callsign: string | null;
  reset_at: string;
}

export type TimeRange = '1D' | '5D' | '1M' | '3M';

export interface ChartDataPoint {
  timestamp: number;
  date: string;
  price: number;
}
