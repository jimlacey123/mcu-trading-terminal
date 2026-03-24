import { useState, useCallback } from 'react';
import type { Student, Position, Trade } from '../types';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function useStudent() {
  const [student, setStudent] = useState<Student | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStudent = useCallback(async (callsign: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/student/${encodeURIComponent(callsign)}`);
      const data = await res.json();
      setStudent(data);

      if (data.id) {
        await Promise.all([
          loadPositions(data.id),
          loadTrades(data.id),
        ]);
      }
    } catch (err) {
      console.error('Failed to load student:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPositions = useCallback(async (studentId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/student/${studentId}/positions`);
      const data = await res.json();
      setPositions(data);
    } catch (err) {
      console.error('Failed to load positions:', err);
    }
  }, []);

  const loadTrades = useCallback(async (studentId: number) => {
    try {
      const res = await fetch(`${API_BASE}/api/student/${studentId}/trades?limit=30`);
      const data = await res.json();
      setTrades(data);
    } catch (err) {
      console.error('Failed to load trades:', err);
    }
  }, []);

  const placeOrder = useCallback(
    async (order: {
      instrument: string;
      direction: 'LONG' | 'SHORT';
      size: 'FULL' | 'MINI';
      quantity: number;
    }) => {
      if (!student) return { success: false, error: 'No student loaded' };

      try {
        const res = await fetch(`${API_BASE}/api/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: student.id, ...order }),
        });
        const data = await res.json();

        if (data.success) {
          setStudent((prev) => prev ? { ...prev, cash_balance: data.newBalance } : prev);
          await loadPositions(student.id);
          await loadTrades(student.id);
        }

        return data;
      } catch (err) {
        return { success: false, error: 'Network error' };
      }
    },
    [student, loadPositions, loadTrades]
  );

  const closePosition = useCallback(
    async (positionId: number) => {
      if (!student) return { success: false, error: 'No student loaded' };

      try {
        const res = await fetch(`${API_BASE}/api/close/${positionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();

        if (data.success) {
          setStudent((prev) => prev ? { ...prev, cash_balance: data.newBalance } : prev);
          await loadPositions(student.id);
          await loadTrades(student.id);
        }

        return data;
      } catch (err) {
        return { success: false, error: 'Network error' };
      }
    },
    [student, loadPositions, loadTrades]
  );

  const refreshData = useCallback(async () => {
    if (student) {
      await Promise.all([loadPositions(student.id), loadTrades(student.id)]);
    }
  }, [student, loadPositions, loadTrades]);

  return {
    student,
    setStudent,
    positions,
    setPositions,
    trades,
    loading,
    loadStudent,
    loadPositions,
    placeOrder,
    closePosition,
    refreshData,
  };
}
