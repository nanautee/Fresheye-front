"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getWalletAnalysis,
  type WalletAnalysis,
  type TradeRow,
  type TokenStats,
} from "@/lib/api";

const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;

export default function Dashboard({ wallet }: { wallet: string | null }) {
  const [data, setData] = useState<WalletAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "trades" | "tokens">("overview");

  const load = useCallback(async () => {
    if (!wallet) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getWalletAnalysis(wallet);
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => { load(); }, [load]);

  if (!wallet) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-card/40 p-6 text-center backdrop-blur-sm">
        <p className="font-mono text-sm text-muted">Connect a wallet to view dashboard</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-card/40 p-6 text-center backdrop-blur-sm">
        <div className="scan-line mx-auto h-px w-32 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <p className="mt-3 font-mono text-xs text-muted">loading portfolio data…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-card/40 p-6 text-center backdrop-blur-sm">
        <p className="font-mono text-sm text-loss">&gt; {error ?? "No data"}</p>
        <button onClick={load} className="mt-2 font-mono text-xs text-accent hover:underline">retry</button>
      </div>
    );
  }

  const s = data.stats;
  const trades = data.trades ?? [];

  return (
    <div className="fade-up w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-satoshi text-lg font-medium text-text">Portfolio</h2>
          <p className="font-mono text-[11px] text-muted">
            {short(wallet)} · {s.period_from} — {s.period_to}
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-[#222] px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/40 hover:text-text"
        >
          ↻ refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(["overview", "trades", "tokens"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
              tab === t
                ? "bg-accent/15 text-accent"
                : "text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewStats stats={s} />}
      {tab === "trades" && <TradesTable trades={trades} />}
      {tab === "tokens" && <TokensBreakdown tokens={s.tokens ?? []} />}
    </div>
  );
}

function OverviewStats({ stats: s }: { stats: WalletAnalysis["stats"] }) {
  const winColor = s.winrate >= 50 ? "text-profit" : s.winrate >= 30 ? "text-accent" : "text-loss";
  const pnlColor = s.net_pnl_sol >= 0 ? "text-profit" : "text-loss";
  const pfColor = s.profit_factor >= 1 ? "text-profit" : "text-loss";

  return (
    <div className="fade-up space-y-3">
      {/* Hero stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Winrate" value={`${s.winrate.toFixed(1)}%`} color={winColor} />
        <StatCard label="Net PnL" value={`${s.net_pnl_sol >= 0 ? "+" : ""}${s.net_pnl_sol.toFixed(4)} SOL`} color={pnlColor} />
        <StatCard label="Profit Factor" value={s.profit_factor.toFixed(2)} color={pfColor} />
        <StatCard label="Total Trades" value={`${s.total_trades}`} />
      </div>

      {/* Details grid */}
      <div className="rounded-xl border border-[#1a1a1a] bg-black/50 p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3">
          <DetailRow label="Buys" value={`${s.buys}`} />
          <DetailRow label="Sells" value={`${s.sells}`} />
          <DetailRow label="Wins" value={`${s.wins}`} />
          <DetailRow label="Losses" value={`${s.losses}`} />
          <DetailRow label="Avg Profit" value={`+${s.avg_profit_pct.toFixed(1)}%`} color="text-profit" />
          <DetailRow label="Avg Loss" value={`${s.avg_loss_pct.toFixed(1)}%`} color="text-loss" />
          <DetailRow label="Avg Position" value={`${s.avg_position_sol.toFixed(4)} SOL`} />
          <DetailRow label="Avg Hold Time" value={`${s.avg_holding_hours.toFixed(1)}h`} />
          <DetailRow label="Total Fees" value={`${s.total_fees_sol.toFixed(4)} SOL`} />
          <DetailRow label="Best Trade" value={`+${s.biggest_win_pct.toFixed(1)}%`} color="text-profit" />
          <DetailRow label="Worst Trade" value={`-${s.biggest_loss_pct.toFixed(1)}%`} color="text-loss" />
          <DetailRow label="Open Positions" value={`${s.open_positions}`} />
        </div>
      </div>

      {/* PnL bar chart (last 10 trades) */}
      <PnlChart trades={[]} />
    </div>
  );
}

function TradesTable({ trades }: { trades: TradeRow[] }) {
  return (
    <div className="fade-up overflow-x-auto rounded-xl border border-[#1a1a1a] bg-black/50">
      <table className="w-full font-mono text-xs">
        <thead>
          <tr className="border-b border-[#1a1a1a] text-left text-muted">
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Kind</th>
            <th className="px-3 py-2">Token</th>
            <th className="px-3 py-2 text-right">Amount</th>
            <th className="px-3 py-2 text-right">PnL</th>
            <th className="px-3 py-2 text-right">Hold</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((t, i) => (
            <tr key={i} className="border-b border-[#111] transition-colors hover:bg-accent/5">
              <td className="px-3 py-2 text-muted">{t.date}</td>
              <td className="px-3 py-2">
                <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                  t.kind === "buy"
                    ? "bg-profit/15 text-profit"
                    : t.kind === "sell"
                      ? "bg-loss/15 text-loss"
                      : "bg-[#222] text-muted"
                }`}>
                  {t.kind}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="text-text">{t.token_name || short(t.token)}</span>
              </td>
              <td className="px-3 py-2 text-right text-text">{t.amount_sol.toFixed(4)}</td>
              <td className={`px-3 py-2 text-right font-medium ${
                t.pnl_sol > 0 ? "text-profit" : t.pnl_sol < 0 ? "text-loss" : "text-muted"
              }`}>
                {t.pnl_sol !== 0 ? `${t.pnl_sol > 0 ? "+" : ""}${t.pnl_sol.toFixed(4)}` : "—"}
              </td>
              <td className="px-3 py-2 text-right text-muted">
                {t.holding_hours > 0 ? `${t.holding_hours.toFixed(1)}h` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {trades.length === 0 && (
        <p className="p-4 text-center text-muted">No trades parsed</p>
      )}
    </div>
  );
}

function TokensBreakdown({ tokens }: { tokens: TokenStats[] }) {
  if (tokens.length === 0) {
    return (
      <div className="rounded-xl border border-[#1a1a1a] bg-black/50 p-6 text-center">
        <p className="font-mono text-sm text-muted">No token data</p>
      </div>
    );
  }

  const maxPnl = Math.max(...tokens.map((t) => Math.abs(t.pnl_sol)), 0.001);

  return (
    <div className="fade-up space-y-2">
      {tokens.map((t, i) => {
        const pct = Math.abs(t.pnl_sol) / maxPnl * 100;
        const color = t.pnl_sol >= 0 ? "bg-profit" : "bg-loss";
        const textColor = t.pnl_sol >= 0 ? "text-profit" : "text-loss";
        return (
          <div key={i} className="rounded-xl border border-[#1a1a1a] bg-black/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-sm text-text">{t.name || short(t.mint)}</span>
                <span className="ml-2 font-mono text-[10px] text-muted">{t.trades} trades</span>
              </div>
              <span className={`font-mono text-sm font-medium ${textColor}`}>
                {t.pnl_sol >= 0 ? "+" : ""}{t.pnl_sol.toFixed(4)} SOL
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#222]">
              <div
                className={`h-full rounded-full ${color} transition-all`}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
              <span>buy: {t.buy_sol.toFixed(4)} SOL</span>
              <span>sell: {t.sell_sol.toFixed(4)} SOL</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PnlChart(_props: { trades: TradeRow[] }) {
  return null; // placeholder — will add a real chart later
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-[#1a1a1a] bg-black/50 p-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</p>
      <p className={`mt-1 font-satoshi text-xl font-medium ${color ?? "text-text"}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] text-muted">{label}</span>
      <span className={`font-mono text-sm ${color ?? "text-text"}`}>{value}</span>
    </div>
  );
}
