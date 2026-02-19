from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import pandas as pd
import yfinance as yf
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ETF Rotation API", version="1.0.0")

# NOTE: Restrict this in production to your deployed Vercel domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RATIO_CACHE_TTL = timedelta(minutes=15)
AUM_CACHE_TTL = timedelta(minutes=60)

ratio_cache: dict[tuple[str, str, str, int], dict[str, Any]] = {}
aum_cache: dict[tuple[str, ...], dict[str, Any]] = {}


def _is_fresh(cached_at: datetime, ttl: timedelta) -> bool:
    return datetime.now(timezone.utc) - cached_at < ttl


def _clean_series(series: pd.Series) -> list[dict[str, Any]]:
    cleaned = series.dropna()
    return [
        {
            "date": idx.strftime("%Y-%m-%d"),
            "value": round(float(value), 6),
        }
        for idx, value in cleaned.items()
    ]


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "ts": datetime.now(timezone.utc).isoformat()}


@app.get("/ratio")
def get_ratio(
    a: str = Query("VTV", min_length=1),
    b: str = Query("VUG", min_length=1),
    start: str = Query("2020-01-01"),
    rolling: int = Query(60, ge=5, le=2520),
) -> dict[str, Any]:
    a_u = a.upper().strip()
    b_u = b.upper().strip()

    if a_u == b_u:
        raise HTTPException(status_code=400, detail="Tickers A and B must be different.")

    cache_key = (a_u, b_u, start, rolling)
    cached = ratio_cache.get(cache_key)
    if cached and _is_fresh(cached["cached_at"], RATIO_CACHE_TTL):
        return cached["payload"]

    try:
        data = yf.download([a_u, b_u], start=start, progress=False, auto_adjust=False)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Error downloading market data: {exc}") from exc

    if data.empty or "Adj Close" not in data:
        raise HTTPException(status_code=404, detail="No data found for provided tickers/start date.")

    adj_close = data["Adj Close"].dropna(how="all")
    if a_u not in adj_close.columns or b_u not in adj_close.columns:
        raise HTTPException(status_code=404, detail="Missing adjusted close data for one or both tickers.")

    ratio = (adj_close[a_u] / adj_close[b_u]).dropna()
    if ratio.empty:
        raise HTTPException(status_code=404, detail="Insufficient overlapping data to compute ratio.")

    ratio_norm = (ratio / ratio.iloc[0]) * 100
    ratio_roll = ratio.pct_change(periods=rolling) * 100

    payload = {
        "meta": {
            "a": a_u,
            "b": b_u,
            "start": start,
            "rolling": rolling,
            "last_updated_utc": datetime.now(timezone.utc).isoformat(),
            "points": int(len(ratio)),
        },
        "series": [
            {"name": "ratio_norm", "points": _clean_series(ratio_norm)},
            {"name": "ratio_roll", "points": _clean_series(ratio_roll)},
        ],
    }

    ratio_cache[cache_key] = {
        "cached_at": datetime.now(timezone.utc),
        "payload": payload,
    }

    return payload


@app.get("/aum_snapshot")
def get_aum_snapshot(
    tickers: str = Query("VTV,VUG,QQQ,SPY"),
) -> dict[str, Any]:
    normalized = tuple(sorted({item.strip().upper() for item in tickers.split(",") if item.strip()}))
    if not normalized:
        raise HTTPException(status_code=400, detail="Provide at least one ticker.")

    cached = aum_cache.get(normalized)
    if cached and _is_fresh(cached["cached_at"], AUM_CACHE_TTL):
        return cached["payload"]

    snapshot: list[dict[str, Any]] = []
    for ticker in normalized:
        total_assets = None
        currency = None
        name = None
        try:
            info = yf.Ticker(ticker).fast_info
            total_assets = info.get("totalAssets")
            currency = info.get("currency")
        except Exception:
            pass

        if total_assets is None:
            try:
                data = yf.Ticker(ticker).info
                total_assets = data.get("totalAssets")
                currency = currency or data.get("currency")
                name = data.get("shortName")
            except Exception:
                pass

        snapshot.append(
            {
                "ticker": ticker,
                "totalAssets": float(total_assets) if total_assets is not None else None,
                "currency": currency,
                "name": name,
            }
        )

    payload = {
        "tickers": list(normalized),
        "last_updated_utc": datetime.now(timezone.utc).isoformat(),
        "snapshot": snapshot,
    }

    aum_cache[normalized] = {
        "cached_at": datetime.now(timezone.utc),
        "payload": payload,
    }

    return payload
