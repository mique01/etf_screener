"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RatioPoint = { date: string; value: number };
type RatioResponse = {
  meta: {
    a: string;
    b: string;
    start: string;
    rolling: number;
    last_updated_utc: string;
    points: number;
  };
  series: { name: string; points: RatioPoint[] }[];
};

type AumRow = {
  ticker: string;
  totalAssets: number | null;
  currency: string | null;
  name: string | null;
};

const PRESETS = [
  ["VTV", "VUG"],
  ["IVE", "IVW"],
  ["XLF", "XLK"],
  ["SPY", "QQQ"],
] as const;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function DashboardPage() {
  const [a, setA] = useState("VTV");
  const [b, setB] = useState("VUG");
  const [rolling, setRolling] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratioData, setRatioData] = useState<RatioResponse | null>(null);
  const [aumData, setAumData] = useState<AumRow[]>([]);

  const presetValue = useMemo(() => `${a}/${b}`, [a, b]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const ratioRes = await fetch(
        `${API_BASE}/ratio?a=${encodeURIComponent(a)}&b=${encodeURIComponent(
          b,
        )}&start=2020-01-01&rolling=${rolling}`,
      );
      if (!ratioRes.ok) {
        throw new Error(`Ratio request failed with ${ratioRes.status}`);
      }
      const ratioJson: RatioResponse = await ratioRes.json();
      setRatioData(ratioJson);

      const aumRes = await fetch(`${API_BASE}/aum_snapshot?tickers=VTV,VUG,QQQ,SPY`);
      if (!aumRes.ok) {
        throw new Error(`AUM request failed with ${aumRes.status}`);
      }
      const aumJson = await aumRes.json();
      setAumData(aumJson.snapshot || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const ratioNorm = ratioData?.series.find((s) => s.name === "ratio_norm")?.points || [];
  const ratioRoll = ratioData?.series.find((s) => s.name === "ratio_roll")?.points || [];

  return (
    <main className="container">
      <h1>Rotation Dashboard Value/Growth</h1>
      <p className="subtle">API Base URL: {API_BASE}</p>

      <section className="card">
        <div className="controls">
          <label>
            Preset
            <select
              value={presetValue}
              onChange={(e) => {
                const [nextA, nextB] = e.target.value.split("/");
                setA(nextA);
                setB(nextB);
              }}
            >
              {PRESETS.map(([pa, pb]) => (
                <option key={`${pa}/${pb}`} value={`${pa}/${pb}`}>
                  {pa}/{pb}
                </option>
              ))}
            </select>
          </label>

          <label>
            Ticker A
            <input value={a} onChange={(e) => setA(e.target.value.toUpperCase())} />
          </label>

          <label>
            Ticker B
            <input value={b} onChange={(e) => setB(e.target.value.toUpperCase())} />
          </label>

          <label>
            Rolling (ruedas)
            <input
              type="number"
              min={5}
              max={252}
              value={rolling}
              onChange={(e) => setRolling(Math.min(252, Math.max(5, Number(e.target.value) || 60)))}
            />
          </label>

          <label>
            &nbsp;
            <button onClick={() => void fetchAll()} disabled={loading}>
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </label>
        </div>

        {error && <div className="error">{error}</div>}
        {ratioData?.meta?.last_updated_utc && (
          <p className="subtle">last_updated_utc: {ratioData.meta.last_updated_utc}</p>
        )}
      </section>

      <section className="charts">
        <div className="card">
          <h3>ratio_norm (base=100)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ratioNorm}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={24} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>ratio_roll (rolling return %)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ratioRoll}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" minTickGap={24} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#16a34a" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h3>AUM Snapshot (VTV, VUG, QQQ, SPY)</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th>Total Assets</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {aumData.map((row) => (
              <tr key={row.ticker}>
                <td>{row.ticker}</td>
                <td>{row.name || "-"}</td>
                <td>{row.totalAssets ? row.totalAssets.toLocaleString() : "N/A"}</td>
                <td>{row.currency || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
