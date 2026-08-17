import Nav from "@/components/Nav";
import Chat from "@/components/Chat";
import Stars from "@/components/Stars";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background: cosmic sky */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div className="bg-grid absolute inset-0" />
        <div className="nebula absolute inset-0" />
        <Stars />
        <div className="bg-vignette absolute inset-0" />
      </div>

      <div className="relative z-10">
        <Nav />
        <main className="mx-auto max-w-3xl px-6 pt-28 sm:pt-36">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-accent/70">
            fresh eye · mirror protocol
          </p>

          <h1 className="mt-6 max-w-2xl font-satoshi text-4xl font-light leading-[1.08] tracking-tight sm:text-[3.4rem]">
            A fresh look at your
            <span className="font-normal text-accent"> crypto strategy</span>
          </h1>

          <p className="mt-6 max-w-lg text-sm font-light leading-relaxed text-muted">
            Connect your wallet and we will read your trades — winrate, fees,
            mistakes. Not copy-trading. A mirror of your strategy.
          </p>

          <div className="mt-10 w-full max-w-xl">
            <Chat />
          </div>

          <p className="mt-8 font-mono text-[11px] text-muted/50">
            &gt; informational purposes only · not financial advice
          </p>
        </main>
      </div>
    </div>
  );
}
