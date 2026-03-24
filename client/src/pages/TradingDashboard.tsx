import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TickerTape from '../components/TickerTape';
import PriceBoard from '../components/PriceBoard';
import PriceChart from '../components/PriceChart';
import OrderTicket from '../components/OrderTicket';
import PositionsTable from '../components/PositionsTable';
import TradeHistory from '../components/TradeHistory';
import PortfolioStats from '../components/PortfolioStats';
import { useSocket } from '../hooks/useSocket';
import { usePrices } from '../hooks/usePrices';
import { useStudent } from '../hooks/useStudent';
import { formatTimestamp } from '../utils/formatters';

export default function TradingDashboard() {
  const { callsign } = useParams<{ callsign: string }>();
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState('CL=F');

  const { student, positions, trades, loadStudent, placeOrder, closePosition, setStudent, setPositions, loadPositions } =
    useStudent();
  const { prices: initialPrices } = usePrices();
  const { connected, prices: livePrices, lastPriceUpdate, onStudentUpdate } = useSocket(callsign);

  // Use live prices if available, fall back to HTTP-fetched
  const prices = livePrices.length > 0 ? livePrices : initialPrices;

  useEffect(() => {
    if (callsign) {
      loadStudent(callsign);
    } else {
      navigate('/');
    }
  }, [callsign]);

  // Listen for socket updates for this student
  useEffect(() => {
    if (!student) return;
    onStudentUpdate((data: any) => {
      if (data.studentId === student.id) {
        setStudent((prev: any) => prev ? { ...prev, cash_balance: data.cashBalance } : prev);
        if (data.positions) {
          setPositions(data.positions);
        }
      }
    });
  }, [student, onStudentUpdate, setStudent, setPositions]);

  // Refresh positions when prices update
  useEffect(() => {
    if (student && livePrices.length > 0) {
      loadPositions(student.id);
    }
  }, [livePrices, student]);

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="terminal-label text-sm" style={{ color: 'var(--muted)' }}>
          LOADING TERMINAL...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* TOP BAR */}
      <div className="border-b border-terminal-border px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="terminal-label text-xs font-bold cursor-pointer"
              style={{ color: 'var(--orange)', letterSpacing: '0.1em' }}
              onClick={() => navigate('/')}
            >
              MCU WARGAME TRADING TERMINAL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <span className="terminal-label text-xs block" style={{ color: 'var(--muted)', fontSize: '0.6rem' }}>
                CALLSIGN
              </span>
              <span className="terminal-number text-sm font-bold" style={{ color: 'var(--orange)' }}>
                {student.callsign}
              </span>
            </div>
            <PortfolioStats student={student} positions={positions} prices={prices} />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/leaderboard')}
              className="terminal-label text-xs"
              style={{ color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              LEADERBOARD
            </button>
            <button
              onClick={() => navigate('/')}
              className="terminal-label text-xs"
              style={{ color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              LOGOUT
            </button>
          </div>
        </div>
      </div>

      {/* TICKER TAPE */}
      <TickerTape prices={prices} />

      {/* MAIN PANELS */}
      <div className="flex-1 flex min-h-0" style={{ height: 'calc(100vh - 110px)' }}>
        {/* LEFT — Price Board (38%) */}
        <div className="overflow-auto" style={{ width: '38%', borderRight: '1px solid var(--border)' }}>
          <PriceBoard
            prices={prices}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />
        </div>

        {/* CENTER — Chart (37%) */}
        <div style={{ width: '37%', borderRight: '1px solid var(--border)' }}>
          <PriceChart symbol={selectedSymbol} prices={prices} positions={positions} />
        </div>

        {/* RIGHT — Order Ticket + Positions (25%) */}
        <div className="overflow-auto" style={{ width: '25%' }}>
          <OrderTicket
            student={student}
            prices={prices}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
            onSubmitOrder={placeOrder}
          />
          <div className="border-t border-terminal-border">
            <PositionsTable
              positions={positions}
              prices={prices}
              onClose={closePosition}
            />
          </div>
          <TradeHistory trades={trades} />
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div
        className="border-t border-terminal-border px-4 py-1.5 flex items-center justify-between"
        style={{ background: '#0c0c0c' }}
      >
        <span className="terminal-label" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
          LAST PRICE UPDATE:{' '}
          {lastPriceUpdate ? formatTimestamp(lastPriceUpdate) : 'AWAITING...'}
        </span>
        <span className="terminal-label" style={{ fontSize: '0.6rem', color: 'var(--muted)' }}>
          DATA: YAHOO FINANCE ~15MIN DELAY — EDUCATIONAL USE ONLY
        </span>
        <span className="terminal-label flex items-center gap-1" style={{ fontSize: '0.6rem' }}>
          <span
            className="inline-block w-1.5 h-1.5"
            style={{
              background: connected ? 'var(--green)' : 'var(--red)',
            }}
          />
          <span style={{ color: connected ? 'var(--green)' : 'var(--red)' }}>
            {connected ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </span>
      </div>
    </div>
  );
}
