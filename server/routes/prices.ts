import { Router, Request, Response } from 'express';
import { getCachedPrices, isCacheStale, getLastFetchTime } from '../services/priceCache';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new (YahooFinance as any)({ suppressNotices: ['yahooSurvey'] });

const router = Router();

router.get('/prices', (_req: Request, res: Response) => {
  const prices = getCachedPrices();
  const stale = isCacheStale();
  const lastFetch = getLastFetchTime();

  res.json({
    prices,
    stale,
    lastFetchTime: lastFetch?.toISOString() || null,
    count: prices.length,
  });
});

router.get('/prices/history/:symbol', async (req: Request, res: Response) => {
  const symbol = String(req.params.symbol);
  const range = (req.query.range as string) || '5d';

  // Map range to yahoo-finance2 chart parameters
  const rangeMap: Record<string, { period1: Date; interval: string }> = {
    '1d': {
      period1: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      interval: '5m',
    },
    '5d': {
      period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      interval: '15m',
    },
    '1mo': {
      period1: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      interval: '1h',
    },
    '3mo': {
      period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      interval: '1d',
    },
  };

  const config = rangeMap[range] || rangeMap['5d'];

  try {
    const result: any = await yahooFinance.chart(symbol, {
      period1: config.period1,
      interval: config.interval as any,
    });

    const dataPoints = (result.quotes || [])
      .filter((q: any) => q.close != null)
      .map((q: any) => ({
        timestamp: new Date(q.date).getTime(),
        date: new Date(q.date).toISOString(),
        price: q.close,
      }));

    res.json({ symbol, range, data: dataPoints });
  } catch (err) {
    console.error(`[Prices] History fetch error for ${symbol}:`, (err as Error).message);
    res.json({ symbol, range, data: [], error: 'Failed to fetch history' });
  }
});

export default router;
