import { describe, expect, it } from "vitest";
import { buildSeries, money, summarizeRevenue, sumLast, type PaidOrder } from "./adminStats";
import { dayKey, lastDays } from "./dayKey";

const now = new Date("2026-11-20T18:00:00Z");
const daysAgo = (n: number) => new Date(now.getTime() - n * 864e5);

describe("summarizeRevenue", () => {
  const orders: PaidOrder[] = [
    { amount: 29.99, provider: "wompi", livemode: true, paidAt: daysAgo(2), planId: "pro-anual" },
    { amount: 3.99, provider: "wompi", livemode: true, paidAt: daysAgo(45), planId: "pro-mensual" },
    { amount: 3.99, provider: "wompi", livemode: true, paidAt: daysAgo(1), planId: "pro-mensual" },
    { amount: 29.99, provider: "mock", livemode: false, paidAt: daysAgo(1), planId: "pro-anual" },
    { amount: 3.99, provider: "wompi", livemode: false, paidAt: daysAgo(1), planId: "pro-mensual" },
  ];

  it("separa el dinero real de los pagos simulados y de prueba", () => {
    const r = summarizeRevenue(orders, now);
    expect(r.realTotal).toBe(37.97);
    expect(r.realCount).toBe(3);
    expect(r.testTotal).toBe(33.98);
    expect(r.testCount).toBe(2);
  });

  it("cuenta los últimos 30 días y agrupa por plan sin errores de redondeo", () => {
    const r = summarizeRevenue(orders, now);
    expect(r.realLast30).toBe(33.98);
    expect(r.byPlan.find((p) => p.planId === "pro-mensual")).toEqual({ planId: "pro-mensual", count: 2, total: 7.98 });
  });

  it("sin pagos da cero", () => {
    expect(summarizeRevenue([], now)).toMatchObject({ realTotal: 0, testTotal: 0, realCount: 0 });
  });
});

describe("series diarias", () => {
  it("usa la fecha de El Salvador (UTC-6)", () => {
    // 02:00 UTC del 21 = 20:00 del 20 en El Salvador
    expect(dayKey(new Date("2026-11-21T02:00:00Z"))).toBe("2026-11-20");
    expect(lastDays(3, now)).toEqual(["2026-11-18", "2026-11-19", "2026-11-20"]);
  });

  it("rellena con cero los días sin datos y suma rangos", () => {
    const days = lastDays(3, now);
    const s = buildSeries(days, [{ _id: "2026-11-20", visits: 5, logins: 2 }], [{ _id: "2026-11-18", n: 1 }]);
    expect(s).toEqual([
      { day: "2026-11-18", visits: 0, logins: 0, signups: 1 },
      { day: "2026-11-19", visits: 0, logins: 0, signups: 0 },
      { day: "2026-11-20", visits: 5, logins: 2, signups: 0 },
    ]);
    expect(sumLast(s, 1, "visits")).toBe(5);
    expect(sumLast(s, 3, "signups")).toBe(1);
  });

  it("formatea dinero en dólares", () => {
    expect(money(1234.5)).toBe("$1,234.50");
  });
});
