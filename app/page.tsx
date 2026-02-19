"use client"

import { useCallback, useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { ControlsPanel } from "@/components/controls-panel"
import { RatioChart } from "@/components/ratio-chart"
import { AumTable, type AumRow } from "@/components/aum-table"
import { ErrorAlert } from "@/components/error-alert"
import { mergeSeries, type SeriesPoint } from "@/lib/merge-series"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RatioResponse = {
  meta: {
    a: string
    b: string
    start: string
    rolling: number
    last_updated_utc: string
    points?: number
  }
  series: { name: string; points: SeriesPoint[] }[]
}

/* ------------------------------------------------------------------ */
/*  API base – set NEXT_PUBLIC_API_BASE_URL in Vercel Env Vars         */
/*  (Settings > Environment Variables) or in .env.local for local dev. */
/* ------------------------------------------------------------------ */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export default function DashboardPage() {
  const [a, setA] = useState("VTV")
  const [b, setB] = useState("VUG")
  const [rolling, setRolling] = useState(60)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [ratioData, setRatioData] = useState<RatioResponse | null>(null)
  const [aumData, setAumData] = useState<AumRow[]>([])
  const [aumLoading, setAumLoading] = useState(false)

  /* ---------- Env-var guard ---------------------------------------- */
  const envMissing = !API_BASE

  /* ---------- Fetch ratio data ------------------------------------- */
  const fetchRatio = useCallback(async () => {
    if (envMissing) {
      setError(
        "NEXT_PUBLIC_API_BASE_URL is not set. Add it in Vercel Settings > Environment Variables."
      )
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `${API_BASE}/ratio?a=${encodeURIComponent(a)}&b=${encodeURIComponent(
          b
        )}&start=2020-01-01&rolling=${rolling}`
      )
      if (!res.ok)
        throw new Error(`Ratio request failed with status ${res.status}`)
      const json: RatioResponse = await res.json()
      setRatioData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error")
    } finally {
      setLoading(false)
    }
  }, [a, b, rolling, envMissing])

  /* ---------- Fetch AUM snapshot ----------------------------------- */
  const fetchAum = useCallback(async () => {
    if (envMissing) return
    setAumLoading(true)
    try {
      const res = await fetch(
        `${API_BASE}/aum_snapshot?tickers=VTV,VUG,QQQ,SPY`
      )
      if (!res.ok)
        throw new Error(`AUM request failed with status ${res.status}`)
      const json = await res.json()
      setAumData(json.data || json.snapshot || [])
    } catch {
      // AUM errors are non-critical; silently handled
    } finally {
      setAumLoading(false)
    }
  }, [envMissing])

  /* ---------- Initial + auto-refresh on param changes -------------- */
  useEffect(() => {
    void fetchRatio()
  }, [fetchRatio])

  useEffect(() => {
    void fetchAum()
  }, [fetchAum])

  /* ---------- Derived chart data ----------------------------------- */
  const normPoints =
    ratioData?.series.find((s) => s.name === "ratio_norm")?.points || []
  const rollPoints =
    ratioData?.series.find((s) => s.name === "ratio_roll")?.points || []
  const merged = mergeSeries(normPoints, rollPoints)

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <DashboardHeader
          lastUpdated={ratioData?.meta?.last_updated_utc}
        />

        {/* Controls */}
        <ControlsPanel
          a={a}
          b={b}
          rolling={rolling}
          loading={loading}
          onChangeA={setA}
          onChangeB={setB}
          onChangeRolling={setRolling}
          onUpdate={() => {
            void fetchRatio()
            void fetchAum()
          }}
        />

        {/* Error */}
        {error && <ErrorAlert message={error} />}

        {/* Charts – two-column on large screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RatioChart
            title={`Normalized Ratio (${a}/${b})`}
            description="Base = 100 at start date"
            data={merged}
            dataKey="ratio_norm"
            color="hsl(220, 60%, 50%)"
            loading={loading}
          />
          <RatioChart
            title={`Rolling Return (${rolling}d)`}
            description={`Trailing ${rolling}-day return %`}
            data={merged}
            dataKey="ratio_roll"
            color="hsl(160, 50%, 42%)"
            showReferenceLine
            loading={loading}
          />
        </div>

        {/* AUM Table */}
        <AumTable data={aumData} loading={aumLoading} />
      </div>
    </main>
  )
}
