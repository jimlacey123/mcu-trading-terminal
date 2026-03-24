import { useNavigate } from 'react-router-dom';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useSocket } from '../hooks/useSocket';
import { useEffect } from 'react';
import LeaderboardTable from '../components/LeaderboardTable';
import { formatTimestamp } from '../utils/formatters';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { leaderboard, setLeaderboard, loading, lastUpdated } = useLeaderboard();
  const { leaderboard: liveLeaderboard } = useSocket();

  // Update from socket when available
  useEffect(() => {
    if (liveLeaderboard.length > 0) {
      setLeaderboard(liveLeaderboard);
    }
  }, [liveLeaderboard, setLeaderboard]);

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
              // LEADERBOARD
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

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="panel p-4">
          <div className="terminal-label text-sm mb-4" style={{ color: 'var(--orange)' }}>
            PORTFOLIO RANKINGS
          </div>

          {loading ? (
            <div className="text-center py-12">
              <span className="terminal-label text-sm" style={{ color: 'var(--muted)' }}>
                LOADING...
              </span>
            </div>
          ) : (
            <LeaderboardTable leaderboard={leaderboard} />
          )}
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between">
          <span className="terminal-label" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
            LAST UPDATED: {lastUpdated ? formatTimestamp(lastUpdated) : '—'}
          </span>
          <span className="terminal-label" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
            ALL PRICES DELAYED ~15 MINUTES
          </span>
        </div>
      </div>
    </div>
  );
}
