const STAR_COUNT = 90;

interface Star {
  left: number;
  top: number;
  size: number;
  o: number;
  color: string;
  dur: number;
  delay: number;
  dx: number;
  dy: number;
}

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const ACCENT = "rgba(245,166,35,1)";
const TEAL = "rgba(78,221,196,1)";
const WHITE = "rgba(240,240,240,1)";

const STARS: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => {
  const side = hash(i * 7 + 1);
  const left = side < 0.4 ? hash(i * 13 + 3) * 22 : 78 + hash(i * 17 + 5) * 22;
  const r = hash(i * 29 + 9);
  const big = hash(i * 31 + 6) > 0.93;
  const color = r > 0.84 ? TEAL : r > 0.6 ? WHITE : ACCENT;
  return {
    left,
    top: 3 + hash(i * 41 + 11) * 94,
    size: big ? 2.6 + hash(i * 53 + 7) * 1.2 : 1 + hash(i * 53 + 7) * 2,
    o: big ? 0.5 + hash(i * 67 + 13) * 0.4 : 0.06 + hash(i * 67 + 13) * 0.3,
    color,
    dur: 5 + hash(i * 83 + 17) * 8,
    delay: hash(i * 97 + 21) * 10,
    dx: (hash(i * 101 + 23) - 0.5) * 22,
    dy: (hash(i * 109 + 27) - 0.5) * 16,
  };
});

export default function Stars() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {STARS.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            boxShadow: `0 0 ${Math.round(s.size * 3)}px ${s.color}`,
            ["--o" as string]: s.o,
            ["--dx" as string]: `${s.dx}px`,
            ["--dy" as string]: `${s.dy}px`,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite, drift ${s.dur * 1.4}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
