import React from "react";

export default function Gauge({ value, max, label, color }) {
  const pct = Math.min(value / max, 1);
  const cx = 70, cy = 70, r = 50;
  const toXY = (deg) => ({
    x: cx + r * Math.cos(((deg - 90) * Math.PI) / 180),
    y: cy + r * Math.sin(((deg - 90) * Math.PI) / 180),
  });
  const trackStart = toXY(-140), trackEnd = toXY(140), arcEnd = toXY(-140 + pct * 280);
  const large = pct * 280 > 180 ? 1 : 0;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={140} height={92} viewBox="0 0 140 92">
        <path d={`M${trackStart.x} ${trackStart.y} A${r} ${r} 0 1 1 ${trackEnd.x} ${trackEnd.y}`} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={8} strokeLinecap="round" />
        {pct > 0 && <path d={`M${trackStart.x} ${trackStart.y} A${r} ${r} 0 ${large} 1 ${arcEnd.x} ${arcEnd.y}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />}
        <text x={cx} y={63} textAnchor="middle" fill="white" fontSize={18} fontWeight={700}>{value}{label === "Humidity" || label === "Cloud Cover" ? "%" : ""}</text>
        <text x={cx} y={79} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={9}>{label}</text>
      </svg>
    </div>
  );
}