# Stock Analysis Dashboard

A modern React + TypeScript web app for researching stock metrics powered by the **Finnhub API**.

## 🚀 Quick Start

### 1. Get an API Key

Sign up for free at [finnhub.io](https://finnhub.io) and generate your API token.

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and add your Finnhub API key:
# VITE_FINNHUB_API_KEY=your_token_here
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open <http://localhost:5173> in your browser.

## 📊 Features

Search any stock ticker to see:

- **Real-time Price Data**: Current price, day change percentage
- **Company Info**: Name, industry classification
- **Financial Metrics**:
  - P/E Ratio
  - 52-week high & low
  - Market capitalization
  - Net income (last 2 years with growth rate)
  - Growth/P/E ratio

## 📁 Project Structure

```
src/
├── components/search/        # UI components
│   ├── TickerApp.tsx        # Main search container
│   ├── SearchPanel.tsx      # Input form
│   ├── ResultsPanel.tsx     # Results display
│   ├── InvalidTickerModal.tsx # Error modal
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Helper functions
├── API/
│   └── finnhubService.ts    # Finnhub API client
└── styles/                   # CSS files
```

## 🏗️ Building

### Development Build

```bash
npm run build
```

### Production Docker Image

```bash
docker build --build-arg VITE_FINNHUB_API_KEY=your_key . -t stock-app
docker run -p 80:80 stock-app
```

The built app is served via nginx at `http://localhost`.

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **API**: Finnhub Stock Data API
- **Production**: nginx (Docker)
- **Dev Dependencies**: ESLint, TypeScript

## 📝 Available Scripts

- `npm run dev` — Start Vite dev server
- `npm run build` — Build for production
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint

## 🔑 Environment Variables

Create a `.env` file in the project root:

```
VITE_FINNHUB_API_KEY=your_finnhub_token
```

See `.env.example` for reference.

## 📦 Dependencies

### Production

- `react@^19.2.5`
- `react-dom@^19.2.5`

### Development

- `vite@^8` — Build tool & dev server
- `typescript@~6.0.2` — Type checking
- `eslint@^10` — Code linting
- `@vitejs/plugin-react@^6` — Vite React integration

## ✨ Key Features

### Smart Error Handling

- Detects rate limits and shows user-friendly messages
- Validates ticker format before API calls
- Graceful fallback for missing/invalid data

### Financial Calculations

- **Growth Rate**: Year-over-year net income change
- **Growth/P/E**: Growth rate divided by P/E ratio (value metric)

### Recent Tickers

- Automatically saves last 5 searched tickers for quick re-access

### Real-time Data

- Direct Finnhub API calls (no backend proxy needed)
- 60-second cache via Finnhub's native rate limiting

## 🚀 Deployment

### Docker

```bash
# Build with your API key
docker build \
  --build-arg VITE_FINNHUB_API_KEY=your_key \
  -t stock-analysis-app .

# Run on port 80
docker run -p 80:80 stock-analysis-app
```

### Static Hosting (Netlify, Vercel, etc.)

```bash
npm run build
# Deploy the 'dist' folder
```

## 📖 Finnhub API

This app uses four Finnhub endpoints:

- `/stock/profile2` — Company info
- `/quote` — Price data
- `/stock/metric` — Financial metrics (P/E, 52-week range)
- `/stock/financials-reported` — Historical net income

## 🤝 Contributing

Feel free to fork, modify, and improve!

## 📄 License

MIT
