import type { SearchResult } from './types'

export function normalizeTicker(value: string): string {
    return value.trim().toUpperCase()
}

export function isTickerFormatValid(value: string): boolean {
    return /^[A-Z0-9.\-/]{1,15}$/.test(value)
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

export function formatMarketCap(value: number | null): string {
    if (value === null) {
        return 'N/A'
    }

    const abs = Math.abs(value)
    if (abs >= 1_000_000_000_000) {
        return `$${(value / 1_000_000_000_000).toFixed(2)}T`
    }

    if (abs >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`
    }

    if (abs >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`
    }

    return `$${value.toFixed(0)}`
}

export function formatNetIncome(value: number): string {
    const abs = Math.abs(value)
    if (abs >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(2)}B`
    }

    if (abs >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`
    }

    if (abs >= 1_000) {
        return `$${(value / 1_000).toFixed(2)}K`
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
            peOverGrowth: null,
            netIncomeLastTwoYears: [],
            marketCap: null,
            fiftyTwoWeekRange: null,
        },
    }
}
