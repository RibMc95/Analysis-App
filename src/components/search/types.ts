export type StockMetrics = {
    peRatio: number | null
    netIncomeGrowth: number | null
    growthOverPe: number | null
    marketCap: string | null
    fiftyTwoWeekRange: string | null
}

export type SearchResult = {
    ticker: string
    company: string | null
    industry: string | null
    price: number | null
    dayChangePercent: number | null
    metrics: StockMetrics
}
