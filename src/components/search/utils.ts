import type { SearchResult } from './types'

export function normalizeTicker(value: string): string {
    return value.trim().toUpperCase()
}

export function isTickerFormatValid(value: string): boolean {
    return /^[A-Z]{1,5}$/.test(value)
}

export function formatPercent(value: number | null): string {
    if (value === null) {
        return 'N/A'
    }

    return `${value.toFixed(2)}%`
}

export function formatRatio(value: number | null): string {
    if (value === null) {
        return 'N/A'
    }

    return value.toFixed(2)
}

export function formatPrice(value: number | null): string {
    if (value === null) {
        return 'N/A'
    }

    return `$${value.toFixed(2)}`
}

export function createPendingResult(ticker: string): SearchResult {
    return {
        ticker,
        company: null,
        industry: null,
        price: null,
        dayChangePercent: null,
        metrics: {
            peRatio: null,
            netIncomeGrowth: null,
            growthOverPe: null,
            marketCap: null,
            fiftyTwoWeekRange: null,
        },
    }
}
