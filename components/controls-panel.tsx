"use client"

import { useCallback } from "react"

const PRESETS = [
  { a: "VTV", b: "VUG", label: "VTV/VUG (Value vs Growth)" },
  { a: "IVE", b: "IVW", label: "IVE/IVW (Value vs Growth)" },
  { a: "XLF", b: "XLK", label: "XLF/XLK (Financials vs Tech)" },
  { a: "SPY", b: "QQQ", label: "SPY/QQQ (Broad vs Growth-tech)" },
]

interface ControlsPanelProps {
  a: string
  b: string
  rolling: number
  loading: boolean
  onChangeA: (v: string) => void
  onChangeB: (v: string) => void
  onChangeRolling: (v: number) => void
  onUpdate: () => void
}

export function ControlsPanel({
  a,
  b,
  rolling,
  loading,
  onChangeA,
  onChangeB,
  onChangeRolling,
  onUpdate,
}: ControlsPanelProps) {
  const presetValue = `${a}/${b}`

  const handlePresetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const preset = PRESETS.find((p) => `${p.a}/${p.b}` === e.target.value)
      if (preset) {
        onChangeA(preset.a)
        onChangeB(preset.b)
      }
    },
    [onChangeA, onChangeB]
  )

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Preset */}
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label
            htmlFor="preset"
            className="text-xs font-medium text-muted-foreground"
          >
            Preset
          </label>
          <select
            id="preset"
            value={presetValue}
            onChange={handlePresetChange}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
          >
            {PRESETS.map((p) => (
              <option key={`${p.a}/${p.b}`} value={`${p.a}/${p.b}`}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ticker A */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tickerA"
            className="text-xs font-medium text-muted-foreground"
          >
            Numerator (A)
          </label>
          <input
            id="tickerA"
            type="text"
            value={a}
            onChange={(e) => onChangeA(e.target.value.toUpperCase())}
            className="h-9 rounded-lg border border-input bg-background px-3 font-mono text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            maxLength={5}
          />
        </div>

        {/* Ticker B */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="tickerB"
            className="text-xs font-medium text-muted-foreground"
          >
            Denominator (B)
          </label>
          <input
            id="tickerB"
            type="text"
            value={b}
            onChange={(e) => onChangeB(e.target.value.toUpperCase())}
            className="h-9 rounded-lg border border-input bg-background px-3 font-mono text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            maxLength={5}
          />
        </div>

        {/* Rolling Window */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="rolling"
            className="text-xs font-medium text-muted-foreground"
          >
            Rolling Window
          </label>
          <div className="flex gap-2">
            <input
              id="rolling"
              type="number"
              min={5}
              max={252}
              value={rolling}
              onChange={(e) =>
                onChangeRolling(
                  Math.min(252, Math.max(5, Number(e.target.value) || 60))
                )
              }
              className="h-9 w-full rounded-lg border border-input bg-background px-3 font-mono text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Update Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={onUpdate}
          disabled={loading}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </div>
    </div>
  )
}
