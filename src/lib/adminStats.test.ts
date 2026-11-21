import { describe, expect, it } from "vitest";
import {
  buildSeries,
  money,
  shortUserAgent,
  summarizeRevenue,
  sumLast,
  withinRetract,
  type PaidOrder,
} from "./adminStats";
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

  it("descuenta los reembolsos: total quita la venta, parcial resta lo devuelto", () => {
    const r = summarizeRevenue(
      [
        { amount: 29.99, provider: "wompi", livemode: true, paidAt: daysAgo(2), planId: "pro-anual", refund: { amount: 29.99 } },
        { amount: 29.99, provider: "wompi", livemode: true, paidAt: daysAgo(3), planId: "pro-anual", refund: { amount: 10 } },
        { amount: 3.99, provider: "wompi", livemode: true, paidAt: daysAgo(1), planId: "pro-mensual" },
      ],
      now,
    );
    expect(r.realTotal).toBe(23.98);
    expect(r.realCount).toBe(2);
    expect(r.refundCount).toBe(2);
    expect(r.refundedTotal).toBe(39.99);
    expect(r.byPlan.find((p) => p.planId === "pro-anual")).toEqual({ planId: "pro-anual", count: 1, total: 19.99 });
  });
});

describe("retracto y navegador", () => {
  it("el retracto dura 8 días desde el pago", () => {
    expect(withinRetract(daysAgo(7.9), 8, now)).toBe(true);
    expect(withinRetract(daysAgo(8), 8, now)).toBe(false);
    expect(withinRetract(undefined, 8, now)).toBe(false);
  });

  it("resume el user-agent", () => {
    const chromeWin =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
    const edge = `${chromeWin} Edg/131.0.0.0`;
    const iphone =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    expect(shortUserAgent(chromeWin)).toBe("Chrome · Windows");
    expect(shortUserAgent(edge)).toBe("Edge · Windows");
    expect(shortUserAgent(iphone)).toBe("Safari · iOS");
    expect(shortUserAgent(null)).toBe("—");
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
