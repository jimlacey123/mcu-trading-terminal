import type { LeaderboardEntry } from '../types';
import { formatCurrency, formatPnl, formatPercent, formatTimestamp } from '../utils/formatters';

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  showProfessorControls?: boolean;
  onResetStudent?: (studentId: number, callsign: string) => void;
}

export default function LeaderboardTable({
  leaderboard,
  showProfessorControls = false,
  onResetStudent,
}: LeaderboardTableProps) {
  function getRankStyle(rank: number) {
    if (rank === 1) return { borderLeft: '3px solid #FFD700' };
    if (rank === 2) return { borderLeft: '3px solid #C0C0C0' };
    if (rank === 3) return { borderLeft: '3px solid #CD7F32' };
    return {};
  }

  if (leaderboard.length === 0) {
    return (
      <div className="terminal-label text-sm text-center py-8" style={{ color: 'var(--muted)' }}>
        NO STUDENTS ENROLLED
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Callsign</th>
            <th className="text-right">Start</th>
            <th className="text-right">Current Value</th>
            <th className="text-right">Total P&L</th>
            <th className="text-right">P&L %</th>
            <th className="text-right"># Trades</th>
            <th className="text-right">Best Trade</th>
            {showProfessorControls && <th className="text-right">Last Active</th>}
            {showProfessorControls && <th></th>}
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.student_id} style={getRankStyle(entry.rank)}>
              <td>
                <span
                  className="terminal-number font-bold"
                  style={{
                    color:
                      entry.rank === 1
                        ? '#FFD700'
                        : entry.rank === 2
                        ? '#C0C0C0'
                        : entry.rank === 3
                        ? '#CD7F32'
                        : 'var(--muted)',
                  }}
                >
                  {entry.rank}
                </span>
              </td>
              <td>
                <span style={{ color: 'var(--orange)', fontFamily: "'IBM Plex Sans Condensed', sans-serif", letterSpacing: '0.05em' }}>
                  {entry.callsign}
                </span>
              </td>
              <td className="text-right" style={{ color: 'var(--muted)' }}>
                {formatCurrency(1000000)}
              </td>
              <td className="text-right font-semibold">{formatCurrency(entry.total_value)}</td>
              <td
                className="text-right font-semibold"
                style={{ color: entry.total_pnl >= 0 ? 'var(--green)' : 'var(--red)' }}
              >
                {formatPnl(entry.total_pnl)}
              </td>
              <td
                className="text-right"
                style={{ color: entry.pnl_pct >= 0 ? 'var(--green)' : 'var(--red)' }}
              >
                {formatPercent(entry.pnl_pct)}
              </td>
              <td className="text-right">{entry.num_trades}</td>
              <td
                className="text-right"
                style={{ color: entry.best_trade > 0 ? 'var(--green)' : 'var(--muted)' }}
              >
                {entry.best_trade ? formatPnl(entry.best_trade) : '—'}
              </td>
              {showProfessorControls && (
                <td className="text-right" style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                  {entry.last_active ? formatTimestamp(entry.last_active) : '—'}
                </td>
              )}
              {showProfessorControls && onResetStudent && (
                <td className="text-right">
                  <button
                    onClick={() => onResetStudent(entry.student_id, entry.callsign)}
                    className="px-2 py-0.5 text-xs terminal-label"
                    style={{
                      border: '1px solid var(--red)',
                      color: 'var(--red)',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    RESET
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
