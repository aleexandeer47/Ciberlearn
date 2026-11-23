import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/*
 * Política de seguridad de contenido (CSP), versión "sin nonces" de la guía de Next
 * (node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md):
 * el sitio usa prerenderizado parcial (cacheComponents), que es incompatible con nonces.
 * - Solo se cargan scripts, estilos, fuentes e imágenes del propio sitio.
 * - frame-ancestors 'none': nadie puede meter el sitio en un iframe (clickjacking).
 * - form-action permite Wompi, adonde redirige el pago.
 * - Google Tag Manager / Analytics: solo se cargan si la persona acepta en el aviso de cookies.
 * - 'unsafe-eval' solo en desarrollo (lo usa React para mostrar errores).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://www.googletagmanager.com https://*.google-analytics.com",
  "font-src 'self'",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://*.wompi.sv",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Respaldo de frame-ancestors para navegadores antiguos
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // No mandar rutas completas (p. ej. /restablecer?token=...) a otros sitios
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // /es/sitemap.xml y /en/sitemap.xml se sirven desde archivos fijos (src/app/sitemap-es.xml, sitemap-en.xml).
  async rewrites() {
    return [
      { source: "/es/sitemap.xml", destination: "/sitemap-es.xml" },
      { source: "/en/sitemap.xml", destination: "/sitemap-en.xml" },
    ];
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // El panel y las páginas de cuenta no deben guardarse en cachés intermedias
      {
        source: "/(admin|progreso|certificado|pago|restablecer|empresa|simulacro|familia|clase)(.*)",
        headers: [{ key: "Cache-Control", value: "private, no-store" }],
      },
      // Service worker: siempre la versión más nueva y solo scripts propios
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
