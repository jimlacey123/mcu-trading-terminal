import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ASCII_HEADER = `
███╗   ███╗ ██████╗██╗   ██╗    ██╗    ██╗ █████╗ ██████╗  ██████╗  █████╗ ███╗   ███╗███████╗
████╗ ████║██╔════╝██║   ██║    ██║    ██║██╔══██╗██╔══██╗██╔════╝ ██╔══██╗████╗ ████║██╔════╝
██╔████╔██║██║     ██║   ██║    ██║ █╗ ██║███████║██████╔╝██║  ███╗███████║██╔████╔██║█████╗
██║╚██╔╝██║██║     ██║   ██║    ██║███╗██║██╔══██║██╔══██╗██║   ██║██╔══██║██║╚██╔╝██║██╔══╝
██║ ╚═╝ ██║╚██████╗╚██████╔╝    ╚███╔███╔╝██║  ██║██║  ██║╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
╚═╝     ╚═╝ ╚═════╝ ╚═════╝      ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
`.trim();

const SUBTITLE_1 = 'T R A D I N G   T E R M I N A L';
const SUBTITLE_2 = 'PROFESSIONAL MILITARY EDUCATION // MARINE CORPS UNIVERSITY';

export default function EntryScreen() {
  const [callsign, setCallsign] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = callsign.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';
      const res = await fetch(`${API_BASE}/api/student/${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error('Failed to connect');
      navigate(`/dashboard/${encodeURIComponent(trimmed)}`);
    } catch (err) {
      setError('CONNECTION FAILED — CHECK SERVER STATUS');
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      {/* ASCII Art Header */}
      <pre
        className="terminal-number text-center leading-none mb-2"
        style={{
          color: 'var(--orange)',
          fontSize: 'clamp(0.35rem, 1vw, 0.65rem)',
          whiteSpace: 'pre',
        }}
      >
        {ASCII_HEADER}
      </pre>

      {/* Subtitles */}
      <div
        className="terminal-label text-center mb-1"
        style={{ color: 'var(--orange)', fontSize: '0.9rem', letterSpacing: '0.25em' }}
      >
        {SUBTITLE_1}
      </div>
      <div
        className="terminal-label text-center mb-12"
        style={{ color: 'var(--muted)', fontSize: '0.7rem', letterSpacing: '0.15em' }}
      >
        {SUBTITLE_2}
      </div>

      {/* Callsign Input */}
      <form onSubmit={handleSubmit} className="w-full max-w-md px-6">
        <label
          className="terminal-label text-xs block mb-2"
          style={{ color: 'var(--muted)' }}
        >
          ENTER CALLSIGN:
        </label>
        <div className="flex items-center border border-terminal-border" style={{ background: 'var(--bg)' }}>
          <span className="terminal-number text-sm px-3" style={{ color: 'var(--orange)' }}>
            &gt;
          </span>
          <input
            type="text"
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            placeholder=""
            autoFocus
            className="flex-1 py-3 text-lg terminal-number border-none outline-none"
            style={{
              background: 'transparent',
              color: 'var(--text)',
              caretColor: 'var(--orange)',
            }}
          />
          <span className="blink terminal-number text-lg pr-3" style={{ color: 'var(--orange)' }}>
            █
          </span>
        </div>

        {error && (
          <div className="mt-2 terminal-label text-xs" style={{ color: 'var(--red)' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !callsign.trim()}
          className="btn-orange w-full mt-4 py-3 text-sm"
        >
          {loading ? 'CONNECTING...' : 'ENTER TERMINAL'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-12 flex flex-col items-center gap-3">
        <button
          onClick={() => navigate('/professor')}
          className="terminal-label text-xs"
          style={{
            color: 'var(--muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          PROFESSOR ACCESS →
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="terminal-label text-xs"
          style={{
            color: 'var(--muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.1em',
          }}
        >
          LEADERBOARD →
        </button>
      </div>

      {/* Disclaimer */}
      <div
        className="mt-16 terminal-label text-center"
        style={{ color: 'rgba(102,102,102,0.5)', fontSize: '0.6rem', letterSpacing: '0.12em' }}
      >
        PRICES DELAYED ~15 MIN — EDUCATIONAL SIMULATION ONLY — NOT FINANCIAL ADVICE
      </div>
    </div>
  );
}
