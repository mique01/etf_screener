"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface RatioChartProps {
  title: string
  description: string
  data: Array<Record<string, unknown>>
  dataKey: string
  color: string
  showReferenceLine?: boolean
  loading?: boolean
}

function ChartSkeleton() {
  return (
    <div className="flex h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span className="text-xs text-muted-foreground">Loading chart data...</span>
      </div>
    </div>
  )
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md">
      <p className="mb-1 font-mono text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold text-foreground">
        {payload[0].value?.toFixed(2)}
      </p>
    </div>
  )
}

export function RatioChart({
  title,
  description,
  data,
  dataKey,
  color,
  showReferenceLine = false,
  loading = false,
}: RatioChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      {loading ? (
        <ChartSkeleton />
      ) : data.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center">
          <span className="text-sm text-muted-foreground">
            No data available
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(0 0% 90%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(0 0% 42%)" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(0 0% 90%)" }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(0 0% 42%)" }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            {showReferenceLine && (
              <ReferenceLine
                y={0}
                stroke="hsl(0 0% 60%)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
