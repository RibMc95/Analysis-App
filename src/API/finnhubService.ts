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
    growthOverPe: number | null
}

const NET_INCOME_CONCEPTS = ['NetIncomeLoss', 'NetIncome', 'ProfitLoss']

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

    const growthOverPe =
        netIncomeGrowthRate !== null && peRatio !== null && peRatio !== 0
            ? netIncomeGrowthRate / peRatio
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
        growthOverPe,
    }
}
