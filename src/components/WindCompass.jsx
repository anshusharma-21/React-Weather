import React from "react";

export default function WindCompass({ direction, speed }) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const angle = (dirs.indexOf(direction) || 0) * 45;
  const cx = 60, cy = 60, r = 50;
  const sectionLabel = { fontSize: 11, textTransform: "uppercase", letterSpacing: 2, opacity: 0.6, color: "#fff", marginBottom: 12 };

  return (
    <div style={{ textAlign: "center" }}>
      <p style={sectionLabel}>Wind Direction</p>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
        {dirs.map((d, i) => {
          const a = ((i * 45 - 90) * Math.PI) / 180;
          return (
            <text key={d} x={cx + (r - 12) * Math.cos(a)} y={cy + (r - 12) * Math.sin(a)} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.55)" fontSize={9}>{d}</text>
          );
        })}
        <g transform={`rotate(${angle},${cx},${cy})`}>
          <polygon points={`${cx},${cy - r + 16} ${cx - 5},${cy + 8} ${cx + 5},${cy + 8}`} fill="#FFD166" opacity={0.9} />
          <polygon points={`${cx},${cy + r - 16} ${cx - 4},${cy - 6} ${cx + 4},${cy - 6}`} fill="rgba(255,255,255,0.18)" />
        </g>
        <circle cx={cx} cy={cy} r={3.5} fill="white" />
        <text x={cx} y={cy + 20} textAnchor="middle" fill="white" fontSize={11} fontWeight={600}>{speed} km/h</text>
      </svg>
    </div>
  );
}