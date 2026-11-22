import { ImageResponse } from "next/og";

// Ícono para “Agregar a pantalla de inicio” en iPhone/iPad.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #2563eb 0%, #0a0f1c 100%)",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24">
          <path d="M12 2.75 19.25 5.5v5.75c0 4.6-3 8.3-7.25 9.99C7.75 19.55 4.75 15.85 4.75 11.25V5.5Z" fill="#ffffff" />
          <path d="m8.75 12.25 2.25 2.25 4.5-4.75" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
