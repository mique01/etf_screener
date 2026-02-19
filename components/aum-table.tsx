"use client"

import { formatBillions } from "@/lib/merge-series"

export interface AumRow {
  ticker: string
  totalAssets: number | null
  currency: string | null
  fundFamily?: string | null
  asOf?: string | null
  name?: string | null
}

interface AumTableProps {
  data: AumRow[]
  loading: boolean
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-6">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

export function AumTable({ data, loading }: AumTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          AUM Snapshot
        </h3>
        <p className="text-xs text-muted-foreground">
          Total assets under management for VTV, VUG, QQQ, SPY
        </p>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : data.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No AUM data available
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                  Ticker
                </th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                  Fund Family
                </th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                  Total Assets
                </th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                  Currency
                </th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                  As Of
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.ticker}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-3 font-mono text-sm font-semibold text-foreground">
                    {row.ticker}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {row.fundFamily || row.name || "-"}
                  </td>
                  <td className="py-3 text-right font-mono text-sm text-foreground">
                    {formatBillions(row.totalAssets)}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {row.currency || "-"}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {row.asOf || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
