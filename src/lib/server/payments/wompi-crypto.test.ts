import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyRedirectSignature, verifyWebhookSignature } from "./wompi-crypto";

const SECRET = "secreto-de-prueba";
const sign = (s: string) => createHmac("sha256", SECRET).update(s).digest("hex");

describe("firma de webhook", () => {
  const body = '{"IdTransaccion":"abc","ResultadoTransaccion":"ExitosaAprobada","Monto":3.99}';

  it("acepta el body firmado tal cual llegó", () => {
    expect(verifyWebhookSignature(body, sign(body), SECRET)).toBe(true);
    expect(verifyWebhookSignature(body, sign(body).toUpperCase(), SECRET)).toBe(true);
  });

  it("rechaza body alterado, firma ausente o secreto vacío", () => {
    expect(verifyWebhookSignature(body.replace("3.99", "0.01"), sign(body), SECRET)).toBe(false);
    expect(verifyWebhookSignature(body, null, SECRET)).toBe(false);
    expect(verifyWebhookSignature(body, sign(body), "")).toBe(false);
    expect(verifyWebhookSignature(body, "zz", SECRET)).toBe(false);
  });
});

describe("firma del redirect", () => {
  it("concatena en el orden documentado", () => {
    const p = { identificadorEnlaceComercio: "ord_1", idTransaccion: "tx9", idEnlace: "15", monto: "3.99" };
    expect(verifyRedirectSignature({ ...p, hash: sign("ord_1tx9153.99") }, SECRET)).toBe(true);
    expect(verifyRedirectSignature({ ...p, hash: sign("tx9ord_1153.99") }, SECRET)).toBe(false);
  });
});
