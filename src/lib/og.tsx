// Plantilla de las imágenes para compartir (WhatsApp, redes): 1200 × 630, colores de la marca.
import type { ReactNode } from "react";

export const OG_SIZE = { width: 1200, height: 630 };

export function OgFrame({ eyebrow, title, subtitle, badge }: { eyebrow: string; title: string; subtitle?: string; badge?: ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #0a0f1c 0%, #102a5c 60%, #2563eb 130%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 700 }}>
        <svg width="44" height="44" viewBox="0 0 24 24">
          <path d="M12 2.75 19.25 5.5v5.75c0 4.6-3 8.3-7.25 9.99C7.75 19.55 4.75 15.85 4.75 11.25V5.5Z" fill="#3b82f6" />
          <path d="m8.75 12.25 2.25 2.25 4.5-4.75" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Ciberlearn
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#93c5fd", fontWeight: 700 }}>{eyebrow}</div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 32, color: "#cbd5e1", maxWidth: 940 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26, color: "#94a3b8" }}>
        <span>Aprende a detectar estafas digitales</span>
        {badge}
      </div>
    </div>
  );
}

export const ogBadge = (text: string) => (
  <span style={{ display: "flex", background: "#f59e0b", color: "#0a0f1c", padding: "12px 26px", borderRadius: 999, fontSize: 32, fontWeight: 800 }}>
    {text}
  </span>
);
