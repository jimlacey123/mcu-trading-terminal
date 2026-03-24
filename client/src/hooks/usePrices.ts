import { useState, useEffect } from 'react';
import type { PriceData, ChartDataPoint } from '../types';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function usePrices() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, []);

  async function fetchPrices() {
    try {
      const res = await fetch(`${API_BASE}/api/prices`);
      const data = await res.json();
      setPrices(data.prices || []);
    } catch (err) {
      console.error('Failed to fetch prices:', err);
    } finally {
      setLoading(false);
    }
  }

  return { prices, loading, refreshPrices: fetchPrices };
}

export async function fetchPriceHistory(
  symbol: string,
  range: string
): Promise<ChartDataPoint[]> {
  try {
    const res = await fetch(`${API_BASE}/api/prices/history/${encodeURIComponent(symbol)}?range=${range}`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Failed to fetch price history:', err);
    return [];
  }
}
