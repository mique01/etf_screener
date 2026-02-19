"use client"

interface DashboardHeaderProps {
  lastUpdated?: string
}

export function DashboardHeader({ lastUpdated }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl text-balance">
            Rotation Dashboard
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Ratio normalized to base=100 at start date. Rolling return shows the
            trailing % change over the selected window.
          </p>
        </div>
        {lastUpdated && (
          <span className="shrink-0 rounded-md bg-secondary px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Updated: {lastUpdated}
          </span>
        )}
      </div>
    </header>
  )
}
