# Stock Analysis Dashboard

A React + TypeScript + Vite frontend for researching stock metrics powered by **Finnhub API**.

## Quick Start

1. **Get a Finnhub API key** (free): <https://finnhub.io>

2. **Set up environment:**

   ```bash
   cp .env.example .env
   # Edit .env and paste your API key
   ```

3. **Install & run:**

   ```bash
   npm install
   npm run dev
   ```

   Frontend opens at: <http://localhost:5173>

## Features

- Real-time stock quotes (price, day change)
- Company info (name, industry)
- Financial metrics:
  - P/E ratio
  - 52-week high/low
  - Market cap
  - Net income (last 2 years)
  - Growth rate & Growth/P/E ratio

## Build

```bash
npm run build
```

Production-ready React app is output to `dist/`.

To deploy with Docker:

```bash
docker build --build-arg VITE_FINNHUB_API_KEY=your_key . -t stock-app
docker run -p 80:80 stock-app
```

## Project Structure

- `src/components/search/` — Ticker search UI (React)
- `src/API/finnhubService.ts` — Finnhub API client (TypeScript)
- `vite.config.ts` — Vite dev server config
- `Dockerfile` — Multi-stage nginx build
