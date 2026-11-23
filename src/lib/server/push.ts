import "server-only";
import webpush from "web-push";
import { caseForDay } from "@/lib/daily";
import { dayKey } from "@/lib/dayKey";
import { collections } from "./db";

/** Las notificaciones se activan solo con las claves VAPID configuradas. */
export const pushEnabled = () => !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY;

let configured = false;
function setup() {
  if (configured) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  configured = true;
}

/** Envía el recordatorio de la estafa del día a todas las suscripciones, en el idioma de cada una. */
export async function sendDailyReminders() {
  if (!pushEnabled()) return { sent: 0, removed: 0, skipped: true };
  setup();
  const { pushSubs } = await collections();
  const day = dayKey();
  const payload = {
    es: { title: "La estafa del día", body: `¿Trampa o real? Hoy: un mensaje de “${caseForDay(day, "es").from}”. 30 segundos.`, url: "/es/diaria" },
    en: { title: "Scam of the day", body: `Scam or real? Today: a message from “${caseForDay(day, "en").from}”. 30 seconds.`, url: "/en/diaria" },
  };
  let sent = 0;
  let removed = 0;
  const subs = await pushSubs.find({}).toArray();
  for (let i = 0; i < subs.length; i += 20) {
    await Promise.all(
      subs.slice(i, i + 20).map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, JSON.stringify(payload[s.lang] ?? payload.es), { TTL: 6 * 3600 });
          sent++;
          await pushSubs.updateOne({ _id: s._id }, { $set: { lastSentAt: new Date() } });
        } catch (e) {
          // 404/410: la persona desactivó las notificaciones o desinstaló; se borra
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) {
            await pushSubs.deleteOne({ _id: s._id });
            removed++;
          } else console.error("[push]", code ?? e);
        }
      }),
    );
  }
  return { sent, removed, skipped: false };
}
