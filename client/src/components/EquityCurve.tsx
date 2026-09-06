import { useMemo } from "react";

// Decorative equity curve rendered as an SVG path. Deterministic so it looks the same on every load.
function curve(n: number, seed = 7): number[] {
  let x = seed;
  const rnd = () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
  const out: number[] = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    const drift = 0.06;
    const shock = (rnd() - 0.5) * 1.6;
    v += drift + shock;
    out.push(v);
  }
  return out;
}

export function EquityCurve({ className = "" }: { className?: string }) {
  const { path, area, w, h } = useMemo(() => {
    const w = 640;
    const h = 220;
    const pts = curve(120);
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const sx = (i: number) => (i / (pts.length - 1)) * w;
    const sy = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 24) - 12;
    const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(" ");
    const area = `${d} L${w},${h} L0,${h} Z`;
    return { path: d, area, w, h };
  }, []);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="eq-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#eq-fill)" />
      <path
        d={path}
        fill="none"
        stroke="#34d399"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        className="animate-draw"
      />
    </svg>
  );
}
