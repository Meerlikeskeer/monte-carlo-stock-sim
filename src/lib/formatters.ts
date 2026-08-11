const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
})

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatCompactCurrency(value: number): string {
  return compactCurrencyFormatter.format(value)
}

/** `value` is already a percent (e.g. 12.3 for 12.3%), not a fraction. */
export function formatPercentValue(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`
}

/** `fraction` is a 0..1 fraction (e.g. 0.36 for 36%). */
export function formatFractionAsPercent(fraction: number): string {
  return percentFormatter.format(fraction)
}
