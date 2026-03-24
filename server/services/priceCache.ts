import YahooFinance from 'yahoo-finance2';
const yahooFinance = new (YahooFinance as any)({ suppressNotices: ['yahooSurvey'] });

interface CachedPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  bid: number;
  ask: number;
  timestamp: string;
  cached: boolean;
  previousPrice?: number;
}

const INSTRUMENT_NAMES: Record<string, string> = {
  'CL=F': 'WTI Crude Oil',
  'BZ=F': 'Brent Crude',
  'NG=F': 'Natural Gas',
  'EURUSD=X': 'EUR/USD',
  'GBPUSD=X': 'GBP/USD',
  'JPY=X': 'USD/JPY',
  'CNY=X': 'USD/CNY',
  'RUB=X': 'USD/RUB',
  'CAD=X': 'USD/CAD',
  'CHF=X': 'USD/CHF',
  'AUD=X': 'AUD/USD',
  'MXN=X': 'USD/MXN',
  'BRL=X': 'USD/BRL',
  'INR=X': 'USD/INR',
  'KRW=X': 'USD/KRW',
  'SAR=X': 'USD/SAR',
};

const ALL_SYMBOLS = Object.keys(INSTRUMENT_NAMES);

let priceCache: CachedPrice[] = [];
let lastFetchTime: Date | null = null;
let fetchInProgress = false;

async function fetchSingleQuote(symbol: string): Promise<CachedPrice | null> {
  try {
    const quote: any = await yahooFinance.quote(symbol);
    if (!quote || !quote.regularMarketPrice) return null;

    const existingPrice = priceCache.find((p) => p.symbol === symbol);

    return {
      symbol,
      name: INSTRUMENT_NAMES[symbol] || symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePct: quote.regularMarketChangePercent || 0,
      bid: quote.bid || quote.regularMarketPrice,
      ask: quote.ask || quote.regularMarketPrice,
      timestamp: new Date().toISOString(),
      cached: false,
      previousPrice: existingPrice?.price,
    };
  } catch (err) {
    console.error(`[PriceCache] Error fetching ${symbol}:`, (err as Error).message);
    return null;
  }
}

export async function fetchAllPrices(): Promise<CachedPrice[]> {
  if (fetchInProgress) return priceCache;
  fetchInProgress = true;

  try {
    console.log(`[PriceCache] Fetching prices for ${ALL_SYMBOLS.length} instruments...`);

    const results = await Promise.allSettled(
      ALL_SYMBOLS.map((symbol) => fetchSingleQuote(symbol))
    );

    const newPrices: CachedPrice[] = [];
    let successCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const symbol = ALL_SYMBOLS[i];

      if (result.status === 'fulfilled' && result.value) {
        newPrices.push(result.value);
        successCount++;
      } else {
        // Keep old cached price if available
        const existing = priceCache.find((p) => p.symbol === symbol);
        if (existing) {
          newPrices.push({ ...existing, cached: true });
        }
      }
    }

    if (newPrices.length > 0) {
      priceCache = newPrices;
      lastFetchTime = new Date();
      console.log(
        `[PriceCache] Updated ${successCount}/${ALL_SYMBOLS.length} prices at ${lastFetchTime.toISOString()}`
      );
    }
  } catch (err) {
    console.error('[PriceCache] Bulk fetch error:', (err as Error).message);
  } finally {
    fetchInProgress = false;
  }

  return priceCache;
}

export function getCachedPrices(): CachedPrice[] {
  return priceCache;
}

export function getCachedPrice(symbol: string): CachedPrice | undefined {
  return priceCache.find((p) => p.symbol === symbol);
}

export function getLastFetchTime(): Date | null {
  return lastFetchTime;
}

export function isCacheStale(): boolean {
  if (!lastFetchTime) return true;
  return Date.now() - lastFetchTime.getTime() > 5 * 60 * 1000; // 5 minutes
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startPricePolling(
  onUpdate: (prices: CachedPrice[]) => void,
  intervalMs = 30000
): void {
  // Initial fetch
  fetchAllPrices().then((prices) => {
    if (prices.length > 0) onUpdate(prices);
  });

  // Poll every 30s
  pollInterval = setInterval(async () => {
    const prices = await fetchAllPrices();
    if (prices.length > 0) onUpdate(prices);
  }, intervalMs);

  console.log(`[PriceCache] Price polling started (every ${intervalMs / 1000}s)`);
}

export function stopPricePolling(): void {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log('[PriceCache] Price polling stopped');
  }
}
