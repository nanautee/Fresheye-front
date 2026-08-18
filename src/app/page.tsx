"use client";

import { useState, useCallback } from "react";
import Nav from "@/components/Nav";
import Chat from "@/components/Chat";
import Stars from "@/components/Stars";

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false);
  const [wallet, setWallet] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleDisconnect = useCallback(async () => {
    try { await window.solana?.disconnect(); } catch { /* */ }
    setWallet(null);
    window.location.reload();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="bg-grid absolute inset-0" />
        <div className="nebula absolute inset-0" />
        <Stars />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Nav
          wallet={wallet}
          onDisconnect={handleDisconnect}
          hasStarted={hasStarted}
          onToggleDashboard={() => setShowDashboard((v) => !v)}
          showDashboard={showDashboard}
          onToggleHistory={() => setShowHistory((v) => !v)}
          showHistory={showHistory}
          onUpgrade={() => window.dispatchEvent(new Event("fresheye:upgrade"))}
        />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
          <Chat
            wallet={wallet}
            onWalletChange={setWallet}
            onHasStarted={() => setHasStarted(true)}
            showDashboard={showDashboard}
            showHistory={showHistory}
          />
        </main>
      </div>
    </div>
  );
}
