import Link from "next/link";

const links = [
  { href: "/", label: "Analysis" },
  { href: "/top-traders", label: "Top Traders" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#111] bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Fresh Eye"
            className="h-7 w-auto rounded-full object-contain"
          />
          <span className="font-satoshi text-sm font-medium tracking-tight text-text">
            Fresh<span className="text-accent">Eye</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-[#111] hover:text-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
