import { bump } from "@/lib/server/metrics";

// Cuenta una visita. El navegador lo llama como máximo una vez al día (VisitBeacon).
// No guarda IP, cookies ni ningún dato de la persona: solo suma 1 al contador del día.
export async function POST(req: Request) {
  // Solo se aceptan avisos enviados desde el propio sitio, para que otra página
  // no pueda inflar las estadísticas desde el navegador de sus visitantes.
  const site = req.headers.get("sec-fetch-site");
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  let sameOrigin = site === "same-origin";
  if (!site && origin && host) {
    try {
      sameOrigin = new URL(origin).host === host;
    } catch {
      sameOrigin = false; // p. ej. "Origin: null"
    }
  }
  if (!sameOrigin) return new Response(null, { status: 403 });

  await bump("visits");
  return new Response(null, { status: 204 });
}
