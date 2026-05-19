import React from "react";

export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(10,10,25,0.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 14px", color: "#fff", fontSize: 12 }}>
      <p style={{ opacity: 0.55, marginBottom: 3 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}{p.unit || ""}</p>
      ))}
    </div>
  );
}