"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createAnalysis,
  getSubscriptions,
  subscribe,
  unsubscribe,
  getHistory,
  type HistoryRecord,
} from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";
import Dashboard from "@/components/Dashboard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SolanaProvider {
  isPhantom?: boolean;
  publicKey: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
}

declare global {
  interface Window {
    solana?: SolanaProvider;
  }
}

const QUICK = ["Review my strategy", "Find mistakes", "Assess risk"];

const short = (a: string) => `${a.slice(0, 4)}…${a.slice(-4)}`;
const userId = 1;

export default function Chat() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [manualAddr, setManualAddr] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subs, setSubs] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const { result } = usePolling(jobId, busy);

  const activeWallet = wallet ?? (manual ? manualAddr.trim() : "");
  const connected = activeWallet.length > 0;

  const loadSubs = useCallback(async () => {
    try {
      setSubs(await getSubscriptions(userId));
    } catch { /* ignore */ }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(await getHistory(undefined, 10));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadSubs(); loadHistory(); }, [loadSubs, loadHistory]);

  const connectPhantom = async () => {
    setError(null);
    const provider = window.solana;
    if (!provider?.isPhantom) {
      setManual(true);
      setError("Phantom not detected. Install the extension, or paste a wallet address below.");
      return;
    }
    setConnecting(true);
    try {
      const res = await provider.connect();
      setWallet(res.publicKey.toString());
      setManual(false);
      setError(null);
    } catch {
      setError("Connection cancelled.");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try { await window.solana?.disconnect(); } catch { /* ignore */ }
    setWallet(null);
    setManual(false);
    setManualAddr("");
  };

  const handleSubscribe = async () => {
    if (!connected) return;
    try {
      if (isSubscribed) {
        await unsubscribe(userId, activeWallet);
      } else {
        await subscribe(userId, activeWallet);
      }
      await loadSubs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    }
  };

  const isSubscribed = subs.includes(activeWallet);

  const submit = async (question: string) => {
    if (busy) return;
    if (!question.trim()) return;
    if (!connected) {
      setError("Connect a wallet first.");
      return;
    }
    setError(null);
    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setBusy(true);
    setJobId(null);
    try {
      const job = await createAnalysis({ wallet: activeWallet, question });
      setJobId(job.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      setBusy(false);
    }
  };

  if (result && (result.status === "done" || result.status === "error")) {
    const content = result.status === "done" ? result.answer! : (result.error ?? "Error");
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || last.content !== content) {
      setMessages((m) => [...m, { role: "assistant", content }]);
    }
    setBusy(false);
    setJobId(null);
    loadHistory();
  }

  const isLooking =
    busy || (result && (result.status === "queued" || result.status === "processing"));

  return (
    <div className="w-full">
      {/* Auth / registration panel */}
      {wallet ? (
        <div className="fade-up flex items-center justify-between rounded-xl border border-[#1a1a1a] bg-card/40 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="pulse-dot h-2 w-2 rounded-full bg-profit" />
            <div>
              <p className="font-mono text-sm text-text">{short(wallet)}</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                phantom · connected
              </p>
            </div>
          </div>
          <button
            onClick={disconnect}
            className="font-mono text-xs text-muted transition-colors hover:text-loss"
          >
            disconnect
          </button>
        </div>
      ) : manual ? (
        <div className="fade-up rounded-xl border border-[#1a1a1a] bg-card/40 p-5 backdrop-blur-sm">
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-muted">
            wallet address (solana)
          </label>
          <input
            value={manualAddr}
            onChange={(e) => setManualAddr(e.target.value)}
            placeholder="paste your address…"
            className="w-full rounded-lg border border-[#222] bg-black/60 px-3.5 py-2.5 font-mono text-sm text-text outline-none transition-colors placeholder:text-muted/40 focus:border-accent/60"
          />
          {connected && (
            <p className="mt-2 font-mono text-[11px] text-profit">
              → using {short(activeWallet)}
            </p>
          )}
          <button
            onClick={disconnect}
            className="mt-3 font-mono text-xs text-muted transition-colors hover:text-text"
          >
            ← back
          </button>
        </div>
      ) : (
        <div className="fade-up rounded-xl border border-[#1a1a1a] bg-card/40 p-5 backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-satoshi text-sm font-medium text-text">
                Register to sync your trades
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                sign in with a wallet to link your addresses
              </p>
            </div>
            <button
              onClick={connectPhantom}
              disabled={connecting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-accent/60 px-4 py-2 font-satoshi text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              {connecting ? "Connecting…" : "Connect Phantom"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              disabled
              title="Coming soon"
              className="cursor-not-allowed font-mono text-xs text-muted/60"
            >
              continue with telegram <span className="text-accent/70">[soon]</span>
            </button>
            <button
              onClick={() => setManual(true)}
              className="font-mono text-xs text-muted underline-offset-4 transition-colors hover:text-text hover:underline"
            >
              or paste a wallet address
            </button>
          </div>
        </div>
      )}

      {/* Subscribe + Dashboard buttons */}
      {connected && (
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleSubscribe}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
              isSubscribed
                ? "border border-profit/30 text-profit/60 hover:border-loss/40 hover:text-loss"
                : "border border-accent/40 text-accent hover:bg-accent hover:text-black"
            }`}
          >
            {isSubscribed ? "✓ Subscribed · click to unsubscribe" : "🔔 Subscribe"}
          </button>
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="rounded-lg border border-[#222] px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-text"
          >
            {showDashboard ? "✕ close dashboard" : "📊 dashboard"}
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="font-mono text-xs text-muted transition-colors hover:text-text"
          >
            {showHistory ? "hide history" : "📜 history"}
          </button>
        </div>
      )}

      {/* History */}
      {showHistory && history.length > 0 && (
        <div className="fade-up mt-3 max-h-48 overflow-y-auto rounded-xl border border-[#1a1a1a] bg-black/50 p-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted">
            recent analyses
          </p>
          {history.map((h, i) => (
            <div key={i} className="border-b border-[#1a1a1a] py-2 last:border-0">
              <p className="font-mono text-[11px] text-muted">
                {new Date(h.date).toLocaleDateString()} · {short(h.wallet)} · {h.question}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard */}
      {showDashboard && (
        <div className="mt-4">
          <Dashboard wallet={activeWallet} />
        </div>
      )}

      {/* Terminal */}
      <div className="mt-4">
        {messages.length > 0 && (
          <div className="fade-up mb-3 max-h-72 space-y-2.5 overflow-y-auto rounded-xl border border-[#1a1a1a] bg-black/50 p-3">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="fade-up pl-2 font-mono text-sm leading-relaxed text-text/85">
                  <span className="mr-2 text-accent">$</span>
                  {m.content}
                </div>
              ) : (
                <div
                  key={i}
                  className="fade-up rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap text-text"
                >
                  {m.content}
                </div>
              )
            )}
          </div>
        )}

        <div className="relative">
          <div className="flex items-start gap-2 rounded-xl border border-[#222] bg-black/70 px-4 pt-3.5 pb-12 transition-colors focus-within:border-accent/50">
            <span className="select-none font-mono text-accent" aria-hidden>
              &gt;
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={2}
              placeholder={connected ? "ask about your strategy…" : "connect a wallet to begin…"}
              className="flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed text-text outline-none placeholder:text-muted/40"
            />
          </div>

          {isLooking && (
            <div className="pointer-events-none absolute inset-x-3 top-2 bottom-12 overflow-hidden">
              <div className="scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
            </div>
          )}

          <button
            onClick={() => submit(input)}
            disabled={busy || !input.trim() || !connected}
            className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 font-satoshi text-sm font-medium text-black transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <EyeGlyph />
            {isLooking ? "Looking…" : "Look"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              disabled={busy || !connected}
              className="rounded-full border border-[#222] bg-card/40 px-3 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-accent/40 hover:text-text disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>

        {error && <p className="mt-3 font-mono text-xs text-loss">&gt; {error}</p>}
      </div>
    </div>
  );
}

function EyeGlyph() {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" className="shrink-0">
      <path
        d="M0 5C0 5 2.5 0 8 0C13.5 0 16 5 16 5C16 5 13.5 10 8 10C2.5 10 0 5 0 5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="5" r="2" fill="currentColor" />
    </svg>
  );
}
