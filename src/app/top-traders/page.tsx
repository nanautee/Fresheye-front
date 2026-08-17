"use client";

import Nav from "@/components/Nav";
import { TRADERS, shortWallet } from "@/data/traders";

const fmtUSD = (n: number) => {
  const sign = n >= 0 ? "+" : "−";
  const abs = Math.abs(n);
  const body =
    abs >= 1000
      ? `${(abs / 1000).toFixed(abs >= 100000 ? 0 : 1)}K`
      : String(Math.round(abs));
  return `${sign}$${body}`;
};

function Avatar({ src, name }: { src: string; name: string }) {
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      className="h-9 w-9 shrink-0 rounded-full border border-[#2a2a2a] object-cover"
      onError={(e) => {
        const el = e.currentTarget;
        if (el.dataset.fb) return;
        el.dataset.fb = "1";
        el.style.display = "none";
      }}
    />
  );
}

export default function TopTradersPage() {
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 pt-12 pb-20">
        <h1 className="font-satoshi text-2xl font-light tracking-tight">Top Traders</h1>
        <p className="mt-2 text-sm font-light text-muted">
          Aggregated from KOL Explorer, refreshed hourly. Numbers only, no AI.
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-[#1a1a1a]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1a1a] bg-card/60 text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">Trader</th>
                <th className="px-4 py-3 font-medium">PnL 7d</th>
                <th className="px-4 py-3 font-medium">PnL 30d</th>
                <th className="px-4 py-3 font-medium">Trades</th>
                <th className="px-4 py-3 font-medium">Winrate</th>
              </tr>
            </thead>
            <tbody>
              {TRADERS.map((t) => (
                <tr key={t.wallet} className="border-b border-[#141414] last:border-0 hover:bg-card/40">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar src={t.avatar} name={t.name} />
                      <div>
                        <a
                          href={`https://x.com/${t.handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-satoshi font-bold transition-colors hover:text-accent"
                        >
                          {t.name}
                          <span className="ml-2 text-xs font-medium text-muted">@{t.handle}</span>
                        </a>
                        <div className="text-xs text-muted/70">{shortWallet(t.wallet)}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`num px-4 py-3.5 font-bold ${t.pnl7d >= 0 ? "text-profit" : "text-loss"}`}>
                    {fmtUSD(t.pnl7d)}
                  </td>
                  <td className={`num px-4 py-3.5 font-bold ${t.pnl30d >= 0 ? "text-profit" : "text-loss"}`}>
                    {fmtUSD(t.pnl30d)}
                  </td>
                  <td className="num px-4 py-3.5">{t.trades.toLocaleString("en-US")}</td>
                  <td className="num px-4 py-3.5">{t.winrate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted/60">
          Avatars and data aggregated from third-party analytics (KOL Explorer).
          Informational purposes only.
        </p>
      </main>
    </div>
  );
}
