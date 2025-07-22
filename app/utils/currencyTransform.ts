type Currency = "EUR" | "USD"

const currencyMap = {
    "EUR": "€",
    "USD": "$"
}

interface ConvertOptions {
    amount: number // original amount
    from: Currency
    to: Currency
    fxRate: number // e.g. 1 EUR = 1.1 USD => fxRate = 1.1
    markupPercent?: number // % markup, e.g. 5 means +5%
    markupFixed?: number // additional flat markup
}

export function convertCurrencyWithMarkup({
    amount,
    from,
    to,
    fxRate,
    markupPercent = 0,
    markupFixed = 0,
}: ConvertOptions): {
    original: number
    final: number
    currency: Currency
    totalMarkup: number
} {
    const withMarkup = amount + (amount * markupPercent) / 100 + markupFixed
    const finalAmount = from === to ? withMarkup : withMarkup * fxRate

    return {
        original: amount,
        final: Math.round(finalAmount * 100) / 100, // rounded to 2 decimals
        currency: to,
        totalMarkup: Math.round((finalAmount - amount * fxRate) * 100) / 100,
    }
}

export function convertCurrency(amount: number, currency: Currency) {
    return `${currencyMap[currency]}${amount}`
}
