/**
 * Merge two series of {date, value} points by date into a single array
 * suitable for Recharts. Handles missing early points gracefully.
 */
export type SeriesPoint = { date: string; value: number }

export interface MergedPoint {
  date: string
  ratio_norm?: number
  ratio_roll?: number
}

export function mergeSeries(
  normPoints: SeriesPoint[],
  rollPoints: SeriesPoint[]
): MergedPoint[] {
  const map = new Map<string, MergedPoint>()

  for (const p of normPoints) {
    map.set(p.date, { date: p.date, ratio_norm: p.value })
  }

  for (const p of rollPoints) {
    const existing = map.get(p.date)
    if (existing) {
      existing.ratio_roll = p.value
    } else {
      map.set(p.date, { date: p.date, ratio_roll: p.value })
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => a.date.localeCompare(b.date)
  )
}

export function formatBillions(value: number | null): string {
  if (value === null || value === undefined) return "N/A"
  const billions = value / 1e9
  if (billions >= 1) {
    return `$${billions.toFixed(2)}B`
  }
  const millions = value / 1e6
  if (millions >= 1) {
    return `$${millions.toFixed(1)}M`
  }
  return `$${value.toLocaleString()}`
}
