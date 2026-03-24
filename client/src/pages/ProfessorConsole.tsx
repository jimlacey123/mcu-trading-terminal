import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LeaderboardTable from '../components/LeaderboardTable';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatCurrency, formatPnl, formatPrice, formatTimestamp } from '../utils/formatters';
import type { ProfessorStats, Trade } from '../types';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export default function ProfessorConsole() {
  const navigate = useNavigate();
  const { leaderboard, loading: lbLoading, refreshLeaderboard } = useLeaderboard();
  const [stats, setStats] = useState<ProfessorStats | null>(null);
  const [activity, setActivity] = useState<Trade[]>([]);
  const [resetConfirm, setResetConfirm] = useState<{ studentId: number; callsign: string } | null>(null);
  const [resetAllText, setResetAllText] = useState('');
  const [showResetAll, setShowResetAll] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/professor/stats`);
      setStats(await res.json());
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/professor/activity`);
      setActivity(await res.json());
    } catch (err) {
      console.error('Failed to fetch activity:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchActivity();
  }, [fetchStats, fetchActivity]);

  async function handleResetStudent(studentId: number, callsign: string) {
    setResetConfirm({ studentId, callsign });
  }

  async function confirmResetStudent() {
    if (!resetConfirm) return;

    try {
      const res = await fetch(`${API_BASE}/api/professor/reset/${resetConfirm.studentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (data.success) {
        setResetConfirm(null);
        refreshLeaderboard();
        fetchStats();
        fetchActivity();
      }
    } catch (err) {
      console.error('Reset failed:', err);
    }
  }

  async function handleResetAll() {
    if (resetAllText !== 'RESET') return;

    try {
      const res = await fetch(`${API_BASE}/api/professor/reset-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'RESET' }),
      });
      const data = await res.json();
      if (data.success) {
        setShowResetAll(false);
        setResetAllText('');
        refreshLeaderboard();
        fetchStats();
        fetchActivity();
      }
    } catch (err) {
      console.error('Reset all failed:', err);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="border-b border-terminal-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <span
              className="terminal-label text-xs font-bold cursor-pointer"
              style={{ color: 'var(--orange)', letterSpacing: '0.1em' }}
              onClick={() => navigate('/')}
            >
              MCU WARGAME TRADING TERMINAL
            </span>
            <span className="terminal-label text-xs ml-4" style={{ color: 'var(--muted)' }}>
              // PROFESSOR CONSOLE
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="terminal-label text-xs"
            style={{ color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            ← BACK TO TERMINAL
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {/* SECTION 1 — Class Overview Stats */}
        <div className="terminal-label text-sm mb-3" style={{ color: 'var(--orange)' }}>
          CLASS OVERVIEW
        </div>
        <div className="grid grid-cols-6 gap-3 mb-8">
          {[
            { label: 'TOTAL STUDENTS', value: stats?.totalStudents ?? '—' },
            { label: 'ACTIVE TODAY', value: stats?.activeToday ?? '—' },
            { label: 'TOTAL TRADES', value: stats?.totalTrades ?? '—' },
            { label: 'MOST TRADED', value: stats?.mostTradedInstrument?.replace('=F', '').replace('=X', '') ?? '—' },
            {
              label: 'LARGEST GAIN',
              value: stats?.largestGain ? formatPnl(stats.largestGain) : '—',
              color: 'var(--green)',
            },
            {
              label: 'LARGEST LOSS',
              value: stats?.largestLoss ? formatPnl(stats.largestLoss) : '—',
              color: 'var(--red)',
            },
          ].map((item, i) => (
            <div key={i} className="panel p-3 text-center">
              <div className="terminal-label text-xs mb-1" style={{ fontSize: '0.6rem' }}>
                {item.label}
              </div>
              <div
                className="terminal-number text-lg font-bold"
                style={{ color: (item as any).color || 'var(--text)' }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 2 — Full Leaderboard */}
        <div className="terminal-label text-sm mb-3" style={{ color: 'var(--orange)' }}>
          FULL LEADERBOARD
        </div>
        <div className="panel p-4 mb-8">
          {lbLoading ? (
            <div className="text-center py-8">
              <span className="terminal-label text-sm" style={{ color: 'var(--muted)' }}>LOADING...</span>
            </div>
          ) : (
            <LeaderboardTable
              leaderboard={leaderboard}
              showProfessorControls
              onResetStudent={handleResetStudent}
            />
          )}
        </div>

        {/* Reset Confirmation Modal */}
        {resetConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="panel p-6 max-w-md">
              <div className="terminal-label text-sm mb-4" style={{ color: 'var(--red)' }}>
                RESET ACCOUNT
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--text)' }}>
                Reset <strong style={{ color: 'var(--orange)' }}>{resetConfirm.callsign}</strong>?
                This will restore $1,000,000 and wipe all trades. This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmResetStudent}
                  className="flex-1 py-2 text-xs terminal-label font-semibold"
                  style={{ background: 'var(--red)', color: '#000', border: 'none', cursor: 'pointer' }}
                >
                  CONFIRM RESET
                </button>
                <button
                  onClick={() => setResetConfirm(null)}
                  className="flex-1 py-2 text-xs terminal-label"
                  style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3 — Reset Entire Class */}
        <div className="terminal-label text-sm mb-3" style={{ color: 'var(--orange)' }}>
          CLASS MANAGEMENT
        </div>
        <div className="panel p-4 mb-8">
          {!showResetAll ? (
            <button
              onClick={() => setShowResetAll(true)}
              className="px-4 py-2 text-xs terminal-label font-semibold"
              style={{ background: 'var(--red)', color: '#000', border: 'none', cursor: 'pointer' }}
            >
              RESET ALL ACCOUNTS
            </button>
          ) : (
            <div>
              <p className="text-sm mb-3" style={{ color: 'var(--red)' }}>
                This will reset ALL student accounts to $1,000,000 and wipe ALL trade history.
                This cannot be undone. Type <strong>RESET</strong> to confirm.
              </p>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={resetAllText}
                  onChange={(e) => setResetAllText(e.target.value.toUpperCase())}
                  placeholder='TYPE "RESET"'
                  className="flex-1 text-sm"
                />
                <button
                  onClick={handleResetAll}
                  disabled={resetAllText !== 'RESET'}
                  className="px-4 py-2 text-xs terminal-label font-semibold"
                  style={{
                    background: resetAllText === 'RESET' ? 'var(--red)' : 'var(--border)',
                    color: resetAllText === 'RESET' ? '#000' : 'var(--muted)',
                    border: 'none',
                    cursor: resetAllText === 'RESET' ? 'pointer' : 'not-allowed',
                  }}
                >
                  CONFIRM RESET ALL
                </button>
                <button
                  onClick={() => { setShowResetAll(false); setResetAllText(''); }}
                  className="px-4 py-2 text-xs terminal-label"
                  style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4 — Trade Activity Log */}
        <div className="terminal-label text-sm mb-3" style={{ color: 'var(--orange)' }}>
          TRADE ACTIVITY LOG (LAST 50)
        </div>
        <div className="panel p-4">
          {activity.length === 0 ? (
            <div className="text-center py-8">
              <span className="terminal-label text-sm" style={{ color: 'var(--muted)' }}>NO TRADES YET</span>
            </div>
          ) : (
            <div className="overflow-auto" style={{ maxHeight: '400px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Callsign</th>
                    <th>Instrument</th>
                    <th>Direction</th>
                    <th className="text-right">Contracts</th>
                    <th className="text-right">Entry</th>
                    <th className="text-right">Exit</th>
                    <th className="text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>
                        {formatTimestamp(t.closed_at)}
                      </td>
                      <td style={{ color: 'var(--orange)', fontFamily: "'IBM Plex Sans Condensed'" }}>
                        {t.callsign}
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>
                        {t.instrument.replace('=F', '').replace('=X', '')}
                      </td>
                      <td style={{ color: t.direction === 'LONG' ? 'var(--green)' : 'var(--red)', fontSize: '0.75rem' }}>
                        {t.direction}
                      </td>
                      <td className="text-right" style={{ fontSize: '0.75rem' }}>{t.contracts}</td>
                      <td className="text-right" style={{ fontSize: '0.75rem' }}>
                        {formatPrice(t.entry_price, t.instrument)}
                      </td>
                      <td className="text-right" style={{ fontSize: '0.75rem' }}>
                        {formatPrice(t.exit_price, t.instrument)}
                      </td>
                      <td
                        className="text-right font-semibold"
                        style={{ color: t.realized_pnl >= 0 ? 'var(--green)' : 'var(--red)' }}
                      >
                        {formatPnl(t.realized_pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-terminal-border px-6 py-2 text-center">
        <span className="terminal-label" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
          DATA: YAHOO FINANCE ~15MIN DELAY — EDUCATIONAL USE ONLY
        </span>
      </div>
    </div>
  );
}
