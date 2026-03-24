import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { PriceData, LeaderboardEntry } from '../types';

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function useSocket(callsign?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string>('');
  const studentUpdateCallbackRef = useRef<((data: any) => void) | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      if (callsign) {
        socket.emit('subscribe', { callsign });
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('priceUpdate', (data: { prices: PriceData[]; timestamp: string }) => {
      setPrices(data.prices);
      setLastPriceUpdate(data.timestamp);
    });

    socket.on('leaderboardUpdate', (data: { leaderboard: LeaderboardEntry[] }) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on('studentUpdate', (data: any) => {
      if (studentUpdateCallbackRef.current) {
        studentUpdateCallbackRef.current(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [callsign]);

  const onStudentUpdate = useCallback((callback: (data: any) => void) => {
    studentUpdateCallbackRef.current = callback;
  }, []);

  return {
    connected,
    prices,
    leaderboard,
    lastPriceUpdate,
    onStudentUpdate,
  };
}
