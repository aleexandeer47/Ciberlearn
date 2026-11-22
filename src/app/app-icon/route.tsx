import { ImageResponse } from "next/og";

// Ícono de la app instalada (PWA) en PNG, generado a partir del escudo de la marca.
// ?size=192|512  ·  &maskable=1 deja margen para los íconos redondos de Android.
export function GET(request: Request) {
  const url = new URL(request.url);
  const size = url.searchParams.get("size") === "512" ? 512 : 192;
  const maskable = url.searchParams.get("maskable") === "1";
  const shield = Math.round(size * (maskable ? 0.52 : 0.7));

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
          borderRadius: maskable ? 0 : size * 0.22,
        }}
      >
        <svg width={shield} height={shield} viewBox="0 0 24 24">
          <path d="M12 2.75 19.25 5.5v5.75c0 4.6-3 8.3-7.25 9.99C7.75 19.55 4.75 15.85 4.75 11.25V5.5Z" fill="#ffffff" />
          <path d="m8.75 12.25 2.25 2.25 4.5-4.75" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: size, height: size, headers: { "Cache-Control": "public, max-age=604800, immutable" } },
  );
}
