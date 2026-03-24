# MCU WARGAME TRADING TERMINAL

A Bloomberg-style futures and forex trading simulation built for Professional Military Education at Marine Corps University. Students trade energy futures and forex pairs using real-world market data (delayed ~15 minutes) over an entire academic year, starting with $1,000,000 in simulated capital.

This is an educational simulation. It is not connected to any real brokerage and does not execute real trades.

## Prerequisites

- Node.js 18+ and npm
- Git
- A GitHub account (for deployment)
- A Railway account (free tier works — https://railway.app)

## Local Development

```bash
git clone <your-repo-url>
cd mcu-trading-terminal
npm install
npm run dev
```

This starts both the backend (Express on port 3000) and frontend (Vite on port 5173) concurrently. Open http://localhost:5173 in your browser.

The SQLite database is created automatically at `./data/trading.db` on first run.

## Deploying to Railway

1. Push this repository to GitHub.

2. Go to https://railway.app and click **New Project** > **Deploy from GitHub Repo**.

3. Select your repository. Railway will auto-detect Node.js.

4. **Add a Volume** (critical for database persistence):
   - In your service settings, click **Add Volume**
   - Set mount path: `/data`
   - This ensures the SQLite database persists across deploys

5. **Set environment variables** in the Railway dashboard:
   - `DATABASE_PATH` = `/data/trading.db`

6. Deploy. Railway will run `npm run build:all` then `npm run start`.

7. Railway provides a public URL (e.g., `your-app.up.railway.app`). Share this URL with your students.

## Professor Access

Navigate to `[your-url]/professor` from any browser. No password is required.

From the professor console you can:
- View class overview statistics
- See the full leaderboard with last-active timestamps
- Reset individual student accounts
- Reset the entire class (requires typing "RESET" to confirm)
- View a live trade activity log

Recommend bookmarking `/professor` on your own machine.

## Student Instructions

Paste the following into your syllabus or course materials:

> Access the trading terminal at [YOUR URL]. Enter your callsign (any name you choose — this is your permanent identity for the year). You start with $1,000,000 in simulated capital. Trade energy futures (WTI Crude, Brent Crude, Natural Gas) and 13 forex pairs against the USD. All prices are real market data delayed approximately 15 minutes. Your portfolio value, P&L, and rank on the class leaderboard update in real time. There is no password — use the honor system. You can access the terminal and leaderboard from any device, any time, at home or on campus.

## Contract Specifications

### Energy Futures

| Instrument | Symbol | Full Contract | Mini Contract |
|-----------|--------|--------------|---------------|
| WTI Crude Oil | CL=F | 1,000 barrels | 100 barrels |
| Brent Crude | BZ=F | 1,000 barrels | 100 barrels |
| Natural Gas | NG=F | 10,000 MMBtu | 1,000 MMBtu |

### Forex (vs USD)

| Pair | Symbol | Full Lot | Mini Lot |
|------|--------|----------|----------|
| EUR/USD | EURUSD=X | 100,000 EUR | 10,000 EUR |
| GBP/USD | GBPUSD=X | 100,000 GBP | 10,000 GBP |
| USD/JPY | JPY=X | 100,000 USD | 10,000 USD |
| USD/CNY | CNY=X | 100,000 USD | 10,000 USD |
| USD/RUB | RUB=X | 100,000 USD | 10,000 USD |
| USD/CAD | CAD=X | 100,000 USD | 10,000 USD |
| USD/CHF | CHF=X | 100,000 USD | 10,000 USD |
| AUD/USD | AUD=X | 100,000 AUD | 10,000 AUD |
| USD/MXN | MXN=X | 100,000 USD | 10,000 USD |
| USD/BRL | BRL=X | 100,000 USD | 10,000 USD |
| USD/INR | INR=X | 100,000 USD | 10,000 USD |
| USD/KRW | KRW=X | 100,000 USD | 10,000 USD |
| USD/SAR | SAR=X | 100,000 USD | 10,000 USD |

**Margin requirement:** 10% of notional value at entry price.

## Data & Disclaimer

Price data is sourced from Yahoo Finance via the `yahoo-finance2` npm package. Prices are delayed approximately 15 minutes. This application is an educational simulation only. It is not financial advice, is not connected to any real brokerage or exchange, and does not execute real trades. No real money is at risk.

## Academic Year Setup Checklist

- [ ] Deploy to Railway
- [ ] Add a persistent volume mounted at `/data`
- [ ] Set `DATABASE_PATH=/data/trading.db` environment variable
- [ ] Test with one student account (enter a callsign, place a trade, verify on leaderboard)
- [ ] Share the public URL with your class
- [ ] Bookmark `/professor` on your own machine
- [ ] Brief students on contract specifications before their first trading session
