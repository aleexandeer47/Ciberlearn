import "server-only";
import { dayKey } from "@/lib/dayKey";
import { collections } from "./db";

/** Suma 1 al contador del día. Nunca rompe la petición si la base falla. */
export async function bump(field: "visits" | "logins") {
  try {
    const { dailyStats } = await collections();
    await dailyStats.updateOne({ _id: dayKey() }, { $inc: { [field]: 1 } }, { upsert: true });
  } catch (e) {
    console.error("[metrics] no se pudo contar", field, e);
  }
}
