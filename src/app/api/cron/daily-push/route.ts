import { sendDailyReminders } from "@/lib/server/push";

/**
 * Recordatorio diario. Lo llama Vercel Cron (vercel.json) con el encabezado
 * "Authorization: Bearer CRON_SECRET"; sin ese secreto no hace nada.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("No autorizado", { status: 401 });
  const r = await sendDailyReminders();
  return Response.json(r);
}
