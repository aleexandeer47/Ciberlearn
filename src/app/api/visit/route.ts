import { bump } from "@/lib/server/metrics";

// Cuenta una visita. El navegador lo llama como máximo una vez al día (VisitBeacon).
// No guarda IP, cookies ni ningún dato de la persona: solo suma 1 al contador del día.
export async function POST() {
  await bump("visits");
  return new Response(null, { status: 204 });
}
