"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  createAnalysis,
  getSubscription,
  getTiers,
  createPayment,
  getPayStatus,
  type SubscriptionInfo,
  type Tier,
  type PayCreateResponse,
} from "@/lib/api";
import { usePolling } from "@/hooks/usePolling";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK = ["Review my strategy", "Find mistakes", "Assess risk"];

const short = (a: string) => `${a.slice(0, 4)}...${a.slice(-4)}`;

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

interface ChatProps {
  wallet: string | null;
  onWalletChange: (w: string | null) => void;
  onHasStarted?: () => void;
  showDashboard: boolean;
  showHistory: boolean;
}

export default function Chat({ wallet, onWalletChange, onHasStarted, showDashboard, showHistory }: ChatProps) {
  const [manual, setManual] = useState(false);
  const [manualAddr, setManualAddr] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [payData, setPayData] = useState<PayCreateResponse | null>(null);
  const [payPoll, setPayPoll] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [startedNotified, setStartedNotified] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { result } = usePolling(jobId, busy);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasStarted = messages.length > 0;
  const activeWallet = wallet ?? (manual ? manualAddr.trim() : "");
  const connected = activeWallet.length > 0;

  // Listen for upgrade trigger from Nav
  useEffect(() => {
    const handler = () => setShowPayModal(true);
    window.addEventListener("fresheye:upgrade", handler);
    return () => window.removeEventListener("fresheye:upgrade", handler);
  }, []);

  // Timer for elapsed seconds while analyzing
  useEffect(() => {
    if (busy) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [busy]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (hasStarted) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, hasStarted]);

  // Notify parent when started
  useEffect(() => {
    if (hasStarted && !startedNotified && onHasStarted) {
      onHasStarted();
      setStartedNotified(true);
    }
  }, [hasStarted, startedNotified, onHasStarted]);

  const loadSubInfo = useCallback(async () => {
    if (!activeWallet) return;
    try {
      setSubInfo(await getSubscription(activeWallet));
    } catch { /* ignore */ }
  }, [activeWallet]);

  useEffect(() => { loadSubInfo(); }, [loadSubInfo]);

  useEffect(() => {
    getTiers().then(setTiers).catch(() => {});
  }, []);

  // Poll payment status
  useEffect(() => {
    if (!payPoll || !activeWallet) return;
    const iv = setInterval(async () => {
      try {
        const st = await getPayStatus(activeWallet);
        if (st.status === "active") {
          setPayPoll(false);
          setShowPayModal(false);
          setPayData(null);
          loadSubInfo();
          setMessages((m) => [...m, { role: "assistant", content: "✅ Subscription activated! You can ask questions now." }]);
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(iv);
  }, [payPoll, activeWallet, loadSubInfo]);

  // Handle completed results
  useEffect(() => {
    if (result && (result.status === "done" || result.status === "error")) {
      const content = result.status === "done" ? result.answer! : (result.error ?? "Error");
      setMessages((m) => {
        const last = m[m.length - 1];
        if (last && last.role === "assistant" && last.content === content) return m;
        return [...m, { role: "assistant", content }];
      });
      setBusy(false);
      setJobId(null);
      loadSubInfo();
    }
  }, [result, loadSubInfo]);

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
      onWalletChange(res.publicKey.toString());
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
    onWalletChange(null);
    setManual(false);
    setManualAddr("");
  };

  const handlePay = async (tierId: string) => {
    if (!connected) return;
    try {
      const data = await createPayment(activeWallet, tierId);
      setPayData(data);
      setPayPoll(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    }
  };

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      if (msg.includes("limit_reached") || msg.includes("402")) {
        setShowPayModal(true);
        loadSubInfo();
      }
      setError(msg);
      setBusy(false);
    }
  };

  const isLooking = busy || (!!(result && (result.status === "queued" || result.status === "processing")));

  // ─── HERO MODE (before first question) ───
  if (!hasStarted) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center">
        {/* Logo */}
        <div className="relative mb-8 fade-up">
          <img
            src="/logo.png"
            alt="Fresh Eye"
            className="h-28 w-auto rounded-full object-contain"
          />
          <div className="absolute -inset-4 rounded-full bg-accent/8 blur-2xl" />
        </div>

        {/* Tagline */}
        <div className="mb-2 text-center fade-up" style={{ animationDelay: "0.1s" }}>
          <h1 className="font-satoshi text-4xl font-light leading-tight tracking-tight sm:text-5xl">
            A fresh look at your
            <span className="font-semibold text-accent"> crypto strategy</span>
          </h1>
        </div>

        <p className="mb-10 max-w-md text-center text-sm font-light leading-relaxed text-muted fade-up" style={{ animationDelay: "0.2s" }}>
          Connect your wallet and we'll analyze your trades — winrate, fees,
          mistakes. Not copy-trading. A mirror.
        </p>

        {/* Wallet connection */}
        {!wallet && !manual && (
          <div className="mb-8 w-full max-w-lg fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col gap-3 rounded-2xl border border-[#1a1a1a] bg-card/30 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
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
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/50 bg-accent/5 px-5 py-2.5 font-satoshi text-sm font-medium text-accent transition-all hover:bg-accent hover:text-black hover:shadow-lg hover:shadow-accent/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                {connecting ? "Connecting…" : "Connect Phantom"}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-4">
              <button
                disabled
                title="Coming soon"
                className="cursor-not-allowed font-mono text-[11px] text-muted/50"
              >
                telegram <span className="text-accent/50">[soon]</span>
              </button>
              <button
                onClick={() => setManual(true)}
                className="font-mono text-[11px] text-muted underline-offset-4 transition-colors hover:text-text hover:underline"
              >
                or paste a wallet address
              </button>
            </div>
          </div>
        )}

        {/* Manual address input */}
        {!wallet && manual && (
          <div className="mb-8 w-full max-w-lg fade-up">
            <div className="rounded-2xl border border-[#1a1a1a] bg-card/30 p-5 backdrop-blur-sm">
              <label className="mb-2 block font-mono text-[11px] uppercase tracking-widest text-muted">
                wallet address (solana)
              </label>
              <input
                value={manualAddr}
                onChange={(e) => setManualAddr(e.target.value)}
                placeholder="paste your address…"
                className="w-full rounded-xl border border-[#222] bg-black/60 px-4 py-3 font-mono text-sm text-text outline-none transition-all placeholder:text-muted/40 focus:border-accent/60 focus:shadow-lg focus:shadow-accent/5"
              />
              {connected && (
                <p className="mt-2 font-mono text-[11px] text-profit">
                  → using {short(activeWallet)}
                </p>
              )}
              <button
                onClick={() => setManual(false)}
                className="mt-3 font-mono text-xs text-muted transition-colors hover:text-text"
              >
                ← back
              </button>
            </div>
          </div>
        )}

        {/* Input (hero mode) */}
        <div className="w-full max-w-xl fade-up" style={{ animationDelay: "0.4s" }}>
          <InputBar
            input={input}
            setInput={setInput}
            onSubmit={submit}
            busy={busy}
            connected={connected}
            isLooking={isLooking}
            placeholder={connected ? "ask about your strategy…" : "connect a wallet to begin…"}
          />
          {error && <p className="mt-3 text-center font-mono text-xs text-loss">{error}</p>}
        </div>

        {/* Quick prompts */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 fade-up" style={{ animationDelay: "0.5s" }}>
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              disabled={busy || !connected}
              className="rounded-full border border-[#222] bg-card/30 px-4 py-2 font-mono text-[11px] text-muted transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-text disabled:opacity-40"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── CHAT MODE (after first question) ───
  return (
    <div className="flex min-h-[70vh] flex-col">
      {/* Messages area */}
      <div className="flex-1 space-y-4 pb-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} index={i} />
        ))}

        {/* Looking animation */}
        {isLooking && (
          <div className="message-appear flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
              <EyeSmall />
            </div>
            <div className="rounded-2xl rounded-tl-sm border border-accent/20 bg-accent/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/60" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/40 [animation-delay:0.15s]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent/20 [animation-delay:0.3s]" />
                <span className="ml-2 font-mono text-xs text-muted">analyzing…</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Dashboard */}
      {showDashboard && (
        <div className="mb-4">
          <p className="font-mono text-xs text-muted">Dashboard coming soon…</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <PayModal
          payData={payData}
          tiers={tiers}
          onPay={handlePay}
          onClose={() => { setShowPayModal(false); setPayData(null); setPayPoll(false); }}
        />
      )}

      {/* Bottom input bar */}
      <div className="sticky bottom-0 border-t border-[#111] bg-black/90 pt-4 pb-6 backdrop-blur-xl">
        <InputBar
          input={input}
          setInput={setInput}
          onSubmit={submit}
          busy={busy}
          connected={connected}
          isLooking={isLooking}
          placeholder="ask about your strategy…"
        />
        {error && <p className="mt-2 text-center font-mono text-xs text-loss">{error}</p>}
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ───

function InputBar({
  input,
  setInput,
  onSubmit,
  busy,
  connected,
  isLooking,
  placeholder,
}: {
  input: string;
  setInput: (v: string) => void;
  onSubmit: (q: string) => void;
  busy: boolean;
  connected: boolean;
  isLooking: boolean;
  placeholder: string;
}) {
  return (
    <div className="relative rounded-2xl border border-[#222] bg-card/30 transition-all focus-within:border-accent/40 focus-within:shadow-lg focus-within:shadow-accent/5">
      <div className="flex items-start gap-3 px-5 pt-4 pb-14">
        <span className="select-none pt-0.5 font-mono text-accent" aria-hidden>&gt;</span>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(input);
            }
          }}
          rows={2}
          placeholder={placeholder}
          className="flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed text-text outline-none placeholder:text-muted/40"
        />
      </div>

      {isLooking && (
        <div className="pointer-events-none absolute inset-x-5 top-2 bottom-14 overflow-hidden">
          <div className="scan-line absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
        </div>
      )}

      <button
        onClick={() => onSubmit(input)}
        disabled={busy || !input.trim() || !connected}
        className="absolute right-3 bottom-3 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-satoshi text-sm font-medium text-black transition-all hover:brightness-110 hover:shadow-lg hover:shadow-accent/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <EyeGlyph />
        {isLooking ? "Looking…" : "Look"}
      </button>
    </div>
  );
}

function MessageBubble({ message, index }: { message: Message; index: number }) {
  if (message.role === "user") {
    return (
      <div className="message-appear flex items-start gap-3" style={{ animationDelay: `${index * 0.05}s` }}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
          <span className="font-mono text-xs text-accent">you</span>
        </div>
        <div className="mt-1 rounded-2xl rounded-tl-sm border border-[#222] bg-card/30 px-4 py-3 font-mono text-sm leading-relaxed text-text/90">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="message-appear flex items-start gap-3" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
        <EyeSmall />
      </div>
      <div className="mt-1 max-w-2xl rounded-2xl rounded-tl-sm border border-accent/15 bg-accent/[0.03] px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap text-text">
        {message.content}
      </div>
    </div>
  );
}

function PayModal({
  payData,
  tiers,
  onPay,
  onClose,
}: {
  payData: PayCreateResponse | null;
  tiers: Tier[];
  onPay: (id: string) => void;
  onClose: () => void;
}) {
  if (payData) {
    return (
      <div className="mb-4 rounded-2xl border border-accent/20 bg-card/40 p-6 backdrop-blur-sm message-appear">
        <div className="text-center">
          <p className="mb-4 font-satoshi text-sm font-medium text-text">
            Send {payData.amount_sol} SOL to activate {payData.tier_id}
          </p>
          {payData.qr && (
            <img src={payData.qr} alt="Solana Pay QR" className="mx-auto mb-4 h-52 w-52 rounded-xl border border-[#222]" />
          )}
          <p className="mb-1 font-mono text-[11px] text-muted">or copy address:</p>
          <p className="mb-2 font-mono text-[11px] break-all text-text">{payData.recipient}</p>
          <p className="mb-4 font-mono text-[10px] text-accent">
            amount: {payData.amount_sol} SOL
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            <p className="font-mono text-xs text-muted">Waiting for payment…</p>
          </div>
          <button
            onClick={onClose}
            className="mt-4 font-mono text-xs text-muted transition-colors hover:text-text"
          >
            cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-accent/20 bg-card/40 p-5 backdrop-blur-sm message-appear">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-satoshi text-sm font-medium text-text">Choose a plan</p>
        <button onClick={onClose} className="font-mono text-xs text-muted hover:text-text">✕</button>
      </div>
      <p className="mb-4 font-mono text-[11px] text-muted">Pay SOL, Solana Pay QR generated automatically</p>
      <div className="grid gap-2.5">
        {tiers.map((t) => (
          <button
            key={t.id}
            onClick={() => t.sol > 0 && onPay(t.id)}
            disabled={t.sol === 0}
            className={`flex items-center justify-between rounded-xl border px-4 py-3.5 transition-all ${
              t.sol === 0
                ? "border-[#222] bg-card/10 text-muted"
                : "border-accent/20 hover:border-accent hover:bg-accent/5"
            }`}
          >
            <div className="text-left">
              <p className="font-satoshi text-sm font-medium text-text">{t.name}</p>
              <p className="font-mono text-[11px] text-muted">
                {t.questions > 0 ? `${t.questions} questions` : t.days > 0 ? `${t.days} days unlimited` : "free"}
              </p>
            </div>
            <span className="font-mono text-sm font-medium text-accent">
              {t.sol === 0 ? "Free" : `${t.sol} SOL`}
            </span>
          </button>
        ))}
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

function EyeSmall() {
  return (
    <svg width="14" height="9" viewBox="0 0 16 10" fill="none" className="shrink-0 text-accent">
      <path
        d="M0 5C0 5 2.5 0 8 0C13.5 0 16 5 16 5C16 5 13.5 10 8 10C2.5 10 0 5 0 5Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <circle cx="8" cy="5" r="2" fill="currentColor" />
    </svg>
  );
}
