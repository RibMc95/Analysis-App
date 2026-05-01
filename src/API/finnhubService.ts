const BASE = 'https://finnhub.io/api/v1'

function getToken(): string {
    const token = import.meta.env.VITE_FINNHUB_API_KEY
    if (!token) {
        throw new Error('VITE_FINNHUB_API_KEY is not set. Add it to your .env file.')
    }
    return token
}

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url)
    if (res.status === 429) {
        throw Object.assign(new Error('Rate limit reached. Please wait a moment and try again.'), { status: 429 })
    }
    if (!res.ok) {
        throw new Error(`Finnhub request failed with status ${res.status}.`)
    }
    return res.json() as Promise<T>
}

type Profile = {
    name?: string
    finnhubIndustry?: string
    marketCapitalization?: number // millions USD
}

type Quote = {
    c?: number  // current price
    dp?: number // day change %
}

type MetricWrapper = {
    metric?: {
        peNormalizedAnnual?: number
        peBasicExclExtraTTM?: number
        '52WeekHigh'?: number
        '52WeekLow'?: number
    }
}

type ReportedFinancials = {
    data?: Array<{
        year: number
        quarter: number
        report: {
            ic?: Array<{ concept: string; value: number | null }>
        }
    }>
}

export type FinnhubStockData = {
    ticker: string
    company: string | null
    industry: string | null
    currentPrice: number | null
    dayChangePercent: number | null
    fiftyTwoWeekHigh: number | null
    fiftyTwoWeekLow: number | null
    marketCap: number | null
    peRatio: number | null
    netIncomeLastTwoYears: Array<{ year: number | null; value: number }>
    netIncomeGrowthRate: number | null
    peOverGrowth: number | null
}

export type StockSymbol = {
    ticker: string
    company: string
}

type StockSymbolResponse = {
    symbol?: string
    description?: string
}

const STOCK_SYMBOLS_CACHE_KEY = 'finnhub-us-stock-symbols-v1'
const STOCK_SYMBOLS_CACHE_TTL_MS = 6 * 60 * 60 * 1000
const FALLBACK_STOCK_SYMBOLS: StockSymbol[] = [
    { ticker: 'AAPL', company: 'Apple' },
    { ticker: 'MSFT', company: 'Microsoft' },
    { ticker: 'NVDA', company: 'NVIDIA' },
    { ticker: 'AMZN', company: 'Amazon' },
    { ticker: 'GOOGL', company: 'Alphabet Class A' },
    { ticker: 'META', company: 'Meta Platforms' },
    { ticker: 'TSLA', company: 'Tesla' },
    { ticker: 'BRK.B', company: 'Berkshire Hathaway Class B' },
    { ticker: 'AVGO', company: 'Broadcom' },
    { ticker: 'JPM', company: 'JPMorgan Chase' },
    { ticker: 'V', company: 'Visa' },
    { ticker: 'WMT', company: 'Walmart' },
    { ticker: 'XOM', company: 'Exxon Mobil' },
    { ticker: 'MA', company: 'Mastercard' },
    { ticker: 'UNH', company: 'UnitedHealth Group' },
    { ticker: 'JNJ', company: 'Johnson & Johnson' },
    { ticker: 'ORCL', company: 'Oracle' },
    { ticker: 'COST', company: 'Costco Wholesale' },
    { ticker: 'NFLX', company: 'Netflix' },
    { ticker: 'AMD', company: 'Advanced Micro Devices' },
]

function readStockSymbolCache(options?: { allowExpired?: boolean }): StockSymbol[] | null {
    const raw = window.localStorage.getItem(STOCK_SYMBOLS_CACHE_KEY)
    if (!raw) {
        return null
    }

    try {
        const parsed = JSON.parse(raw) as { timestamp?: number; symbols?: StockSymbol[] }
        if (!parsed.timestamp || !Array.isArray(parsed.symbols)) {
            return null
        }

        if (!options?.allowExpired && Date.now() - parsed.timestamp > STOCK_SYMBOLS_CACHE_TTL_MS) {
            return null
        }

        return parsed.symbols
    } catch {
        return null
    }
}

function writeStockSymbolCache(symbols: StockSymbol[]): void {
    try {
        window.localStorage.setItem(STOCK_SYMBOLS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), symbols }))
    } catch {
        // Ignore cache write failures and continue.
    }
}

const NET_INCOME_CONCEPTS = [
    'NetIncomeLoss',
    'NetIncome',
    'ProfitLoss',
    'us-gaap_NetIncomeLoss',
    'us-gaap_NetIncome',
    'us-gaap_ProfitLoss',
]

function extractNetIncome(data: ReportedFinancials): Array<{ year: number | null; value: number }> {
    const annuals = (data.data ?? [])
        .filter((d) => d.quarter === 0)
        .sort((a, b) => b.year - a.year)
        .slice(0, 2)

    return annuals.flatMap((entry) => {
        const ic = entry.report.ic ?? []
        const row = ic.find((r) => NET_INCOME_CONCEPTS.includes(r.concept))
        if (!row || row.value == null) return []
        return [{ year: entry.year, value: row.value }]
    })
}

export async function fetchStockData(ticker: string): Promise<FinnhubStockData> {
    const t = getToken()
    const url = (path: string) => `${BASE}${path}&token=${t}`

    const [profile, quote, metricsData, financials] = await Promise.all([
        fetchJson<Profile>(url(`/stock/profile2?symbol=${ticker}`)),
        fetchJson<Quote>(url(`/quote?symbol=${ticker}`)),
        fetchJson<MetricWrapper>(url(`/stock/metric?symbol=${ticker}&metric=all`)),
        fetchJson<ReportedFinancials>(url(`/stock/financials-reported?symbol=${ticker}&freq=annual`)),
    ])

    // Finnhub returns an empty object {} for unknown tickers
    if (!profile.name) {
        throw new Error(`No data found for "${ticker}". Make sure it is a valid US equity symbol.`)
    }

    const netIncomeLastTwoYears = extractNetIncome(financials)
    const peRatio =
        metricsData.metric?.peNormalizedAnnual ?? metricsData.metric?.peBasicExclExtraTTM ?? null

    let netIncomeGrowthRate: number | null = null
    if (netIncomeLastTwoYears.length === 2) {
        const [recent, prior] = netIncomeLastTwoYears
        if (prior.value !== 0) {
            netIncomeGrowthRate = ((recent.value - prior.value) / Math.abs(prior.value)) * 100
        }
    }

    const peOverGrowth =
        netIncomeGrowthRate !== null && peRatio !== null && netIncomeGrowthRate !== 0
            ? peRatio / netIncomeGrowthRate
            : null

    const marketCap =
        typeof profile.marketCapitalization === 'number'
            ? profile.marketCapitalization * 1_000_000
            : null

    return {
        ticker,
        company: profile.name ?? null,
        industry: profile.finnhubIndustry ?? null,
        currentPrice: quote.c ?? null,
        dayChangePercent: quote.dp ?? null,
        fiftyTwoWeekHigh: metricsData.metric?.['52WeekHigh'] ?? null,
        fiftyTwoWeekLow: metricsData.metric?.['52WeekLow'] ?? null,
        marketCap,
        peRatio,
        netIncomeLastTwoYears,
        netIncomeGrowthRate,
        peOverGrowth,
    }
}

export async function fetchAllStockSymbols(): Promise<StockSymbol[]> {
    const cached = readStockSymbolCache()
    if (cached && cached.length > 0) {
        return cached
    }

    try {
        const token = getToken()
        const rows = await fetchJson<StockSymbolResponse[]>(`${BASE}/stock/symbol?exchange=US&token=${token}`)

        const unique = new Map<string, StockSymbol>()
        for (const row of rows) {
            const ticker = row.symbol?.trim().toUpperCase() ?? ''
            const company = row.description?.trim() ?? ''
            if (!ticker || !company || unique.has(ticker)) {
                continue
            }
            unique.set(ticker, { ticker, company })
        }

        const symbols = Array.from(unique.values()).sort((a, b) => a.ticker.localeCompare(b.ticker))
        if (symbols.length === 0) {
            throw new Error('No symbols returned by Finnhub.')
        }

        writeStockSymbolCache(symbols)
        return symbols
    } catch {
        const staleCache = readStockSymbolCache({ allowExpired: true })
        if (staleCache && staleCache.length > 0) {
            return staleCache
        }

        return FALLBACK_STOCK_SYMBOLS
    }
}
