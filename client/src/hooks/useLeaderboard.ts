import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardEntry } from '../types';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard`);
      const data = await res.json();
      setLeaderboard(data);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return { leaderboard, setLeaderboard, loading, lastUpdated, refreshLeaderboard: fetchLeaderboard };
}
