"use client";

import Link from "next/link";

const short = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`;

interface NavProps {
  wallet?: string | null;
  onDisconnect?: () => void;
  hasStarted?: boolean;
  onToggleDashboard?: () => void;
  showDashboard?: boolean;
  onToggleHistory?: () => void;
  showHistory?: boolean;
  onUpgrade?: () => void;
}

export default function Nav({
  wallet,
  onDisconnect,
  hasStarted,
  onToggleDashboard,
  showDashboard,
  onToggleHistory,
  showHistory,
  onUpgrade,
}: NavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#111] bg-black/80 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-5xl grid-cols-3 items-center px-6">
        {/* Logo — left */}
        <Link href="/" className="group flex items-center gap-3 justify-start">
          <div className="relative">
            <img
              src="/logo.png"
              alt="Fresh Eye"
              className="h-7 w-auto rounded-full object-contain transition-all duration-300 group-hover:scale-110"
            />
            <div className="absolute -inset-2 rounded-full bg-accent/10 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          <span className="font-satoshi text-lg font-bold tracking-tight text-text">
            Fresh<span className="text-accent">Eye</span>
          </span>
          <a
            href="https://www.producthunt.com/posts/fresh-eye?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-fresh-eye"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 hidden sm:block opacity-80 transition-opacity hover:opacity-100"
          >
            <img
              alt="Fresh Eye - AI-powered crypto strategy analyst | Product Hunt"
              width="140"
              height="30"
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=PLACEHOLDER&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-fresh-eye&t=1"
              className="h-[30px] w-auto"
            />
          </a>
        </Link>

        {/* Nav — center */}
        <nav className="flex items-center justify-center gap-1">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-[#111] hover:text-text"
          >
            Analysis
          </Link>
          <Link
            href="/top-traders"
            className="rounded-md px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-[#111] hover:text-text"
          >
            Top Traders
          </Link>
        </nav>

        {/* Actions — right */}
        <div className="flex items-center justify-end gap-2">
          {wallet && hasStarted && (
            <>
              <button
                onClick={onUpgrade}
                className="rounded-lg border border-accent/30 px-3 py-1.5 font-mono text-xs text-accent transition-all hover:border-accent hover:bg-accent/10"
              >
                ⚡ Upgrade
              </button>
              <button
                onClick={onToggleDashboard}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
                  showDashboard
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-[#222] text-muted hover:border-accent/30 hover:text-text"
                }`}
              >
                📊
              </button>
              <button
                onClick={onToggleHistory}
                className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-all ${
                  showHistory
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-[#222] text-muted hover:border-accent/30 hover:text-text"
                }`}
              >
                📜
              </button>
              <div className="mx-1 h-5 w-px bg-[#222]" />
            </>
          )}

          {wallet ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-[#1a1a1a] bg-card/30 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-profit" />
                <span className="font-mono text-xs text-text">{short(wallet)}</span>
              </div>
              <button
                onClick={onDisconnect}
                className="rounded-md px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:text-loss"
              >
                disconnect
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="rounded-lg border border-[#222] px-3 py-1.5 font-mono text-xs text-muted transition-all hover:border-accent/30 hover:text-text"
            >
              Connect
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
