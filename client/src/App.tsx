import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EntryScreen from './pages/EntryScreen';
import TradingDashboard from './pages/TradingDashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfessorConsole from './pages/ProfessorConsole';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryScreen />} />
        <Route path="/dashboard/:callsign" element={<TradingDashboard />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/professor" element={<ProfessorConsole />} />
      </Routes>
      <div className="watermark">
        PRICES DELAYED ~15 MIN — EDUCATIONAL SIMULATION ONLY
      </div>
    </BrowserRouter>
  );
}
