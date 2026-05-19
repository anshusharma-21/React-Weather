import React from "react";

export default function SunArc({ sunrise, sunset, current }) {
  const W = 320, H = 90, pad = 32;
  const toMin = ([h, m]) => h * 60 + m;
  const total = toMin(sunset) - toMin(sunrise);
  const pct = Math.max(0, Math.min(1, (toMin(current) - toMin(sunrise)) / total));
  const pt = (t) => ({ x: pad + t * (W - 2 * pad), y: H - 12 - Math.sin(t * Math.PI) * (H - 22) });
  const sun = pt(pct);
  const pathD = () => {
    let d = `M${pad} ${H - 12}`;
    for (let i = 0; i <= 60; i++) {
      const p = pt(i / 60);
      d += ` L${p.x} ${p.y}`;
    }
    return d;
  };
  const fmt = ([h, m]) => `${h % 12 || 12}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;

  const sectionLabel = { fontSize: 11, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, color: "#fff", marginBottom: 12 };

  return (
    <div>
      <p style={sectionLabel}>Sun Timeline</p>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 22}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="arcG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF9A3C" />
            <stop offset="100%" stopColor="#FFD166" />
          </linearGradient>
        </defs>
        <path d={pathD()} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2} strokeDasharray="4 4" />
        {pct > 0 && <path d={`M${pad} ${H - 12}${Array.from({ length: Math.round(pct * 60) + 1 }, (_, i) => { const p = pt(i / 60); return ` L${p.x} ${p.y}`; }).join("")}`} fill="none" stroke="url(#arcG)" strokeWidth={3} strokeLinecap="round" />}
        <circle cx={sun.x} cy={sun.y} r={9} fill="#FFD166" opacity={0.95} />
        <text x={sun.x} y={sun.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={9}>☀</text>
        <circle cx={pad} cy={H - 12} r={3} fill="#FF9A3C" />
        <text x={pad} y={H + 14} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize={10}>{fmt(sunrise)}</text>
        <circle cx={W - pad} cy={H - 12} r={3} fill="#FF6B6B" />
        <text x={W-pad} y={H+14} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize={10}>{fmt(sunset)}</text>
      </svg>
    </div>
  );
}