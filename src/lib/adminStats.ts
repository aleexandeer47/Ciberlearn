// Cálculos del panel de administración. Funciones puras (se prueban sin base de datos).

export interface PaidOrder {
  amount: number;
  provider: "wompi" | "mock";
  livemode?: boolean;
  paidAt?: Date;
  planId: string;
  /** Si se reembolsó: lo devuelto se resta de las ganancias */
  refund?: { amount: number };
}

/** Dinero real = cobrado por Wompi en modo productivo. Lo demás (simulado o pruebas) va aparte. */
export const isRealMoney = (o: PaidOrder) => o.provider === "wompi" && o.livemode === true;

const cents = (n: number) => Math.round(n * 100);

export function summarizeRevenue(orders: PaidOrder[], now = new Date()) {
  const since30 = now.getTime() - 30 * 864e5;
  let real = 0,
    real30 = 0,
    realCount = 0,
    test = 0,
    testCount = 0,
    refunded = 0,
    refundCount = 0;
  const byPlan = new Map<string, { count: number; total: number }>();

  for (const o of orders) {
    // Neto: lo cobrado menos lo devuelto
    const back = o.refund ? cents(o.refund.amount) : 0;
    const c = cents(o.amount) - back;
    if (isRealMoney(o)) {
      if (back) {
        refunded += back;
        refundCount++;
      }
      real += c;
      if (c > 0) realCount++;
      if (o.paidAt && o.paidAt.getTime() >= since30) real30 += c;
      if (c > 0) {
        const p = byPlan.get(o.planId) ?? { count: 0, total: 0 };
        p.count++;
        p.total += c;
        byPlan.set(o.planId, p);
      }
    } else {
      test += c;
      testCount++;
    }
  }

  return {
    realTotal: real / 100,
    realLast30: real30 / 100,
    realCount,
    testTotal: test / 100,
    testCount,
    refundedTotal: refunded / 100,
    refundCount,
    byPlan: [...byPlan.entries()].map(([planId, v]) => ({ planId, count: v.count, total: v.total / 100 })),
  };
}

export interface DayPoint {
  day: string;
  visits: number;
  logins: number;
  signups: number;
}

/** Une los contadores diarios y los registros por día en una serie continua (días sin datos = 0). */
export function buildSeries(
  days: string[],
  stats: { _id: string; visits?: number; logins?: number }[],
  signups: { _id: string; n: number }[],
): DayPoint[] {
  const s = new Map(stats.map((x) => [x._id, x]));
  const r = new Map(signups.map((x) => [x._id, x.n]));
  return days.map((day) => ({
    day,
    visits: s.get(day)?.visits ?? 0,
    logins: s.get(day)?.logins ?? 0,
    signups: r.get(day) ?? 0,
  }));
}

export const sumLast = (series: DayPoint[], n: number, key: "visits" | "logins" | "signups") =>
  series.slice(-n).reduce((a, p) => a + p[key], 0);

/** ¿Sigue dentro del plazo de retracto (días naturales desde el pago)? */
export const withinRetract = (paidAt: Date | undefined, days: number, now = new Date()) =>
  !!paidAt && now.getTime() - paidAt.getTime() < days * 864e5;

/** "Chrome · Windows" a partir del user-agent; el texto completo queda en la base y en el CSV. */
export function shortUserAgent(ua: string | null | undefined) {
  if (!ua) return "—";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\/|Opera/.test(ua)
      ? "Opera"
      : /SamsungBrowser/.test(ua)
        ? "Samsung Internet"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS/.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Otro";
  const os = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iPod/.test(ua)
      ? "iOS"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "otro sistema";
  return `${browser} · ${os}`;
}

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
