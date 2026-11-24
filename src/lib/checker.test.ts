import { describe, expect, it } from "vitest";
import { checkMessage, FLAG_TEXT, findLinks } from "./checker";
import { DAILY_CASES } from "./daily";
import { DAILY_EN } from "./daily.en";

const ids = (t: string) => checkMessage(t).flags.map((f) => f.id);

describe("¿Es estafa? (reglas)", () => {
  it("marca alto riesgo cuando piden el código o la tarjeta", () => {
    expect(checkMessage("Le habla el banco. Díctenos el código de verificación que le llegó por SMS.").risk).toBe("alto");
    expect(checkMessage("Para recibir el pago ingrese el número de su tarjeta y el CVV").risk).toBe("alto");
    expect(checkMessage("Read me the verification code we just sent you").risk).toBe("alto");
  });

  it("lee los enlaces como un experto", () => {
    expect(ids("Verifique aquí: http://bancoizalco.verificar-cuenta.co/login")).toEqual(expect.arrayContaining(["link-brand-sub", "link-http"]));
    expect(ids("Pague hoy: enviaya.delivery-pago.top/p/1")).toContain("link-odd-tld");
    expect(ids("https://paypal.com@login-seguro.top/inicio")).toContain("link-at");
    expect(ids("security@micr0soft-login.com sign in at micr0soft-login.com/confirm")).toContain("link-lookalike");
    expect(ids("mira esto bit.ly/abc123")).toContain("link-shortener");
    expect(findLinks("escribe a soporte@empresa.com")).toEqual([]);
  });

  it("reconoce señales en los dos idiomas", () => {
    expect(ids("Hola mami, este es mi número nuevo. Mándame $300, no le digas a nadie")).toEqual(
      expect.arrayContaining(["new-number", "money", "secrecy"]),
    );
    expect(ids("Hi mom, this is my new number. Don't tell anyone, I need you to send me $300")).toEqual(
      expect.arrayContaining(["new-number", "secrecy"]),
    );
    expect(ids("Congratulations! You won a $500 gift card")).toEqual(expect.arrayContaining(["prize", "giftcard"]));
  });

  it("no exagera con un aviso normal", () => {
    expect(checkMessage("Tu pedido EY-773104 fue entregado hoy. Califícanos en la app.").risk).toBe("bajo");
    expect(checkMessage("Hi Martha, your new debit card is ready at your branch.").risk).toBe("bajo");
  });

  it("detecta la mayoría de las estafas del día (en los dos idiomas) sin marcar todos los mensajes reales", () => {
    const phish = DAILY_CASES.filter((c) => c.answer === "phishing");
    const caught = (t: string) => checkMessage(t).risk !== "bajo";
    expect(phish.filter((c) => caught(`${c.from} ${c.text}`)).length / phish.length).toBeGreaterThan(0.7);
    expect(phish.filter((c) => caught(`${DAILY_EN[c.id].from} ${DAILY_EN[c.id].text}`)).length / phish.length).toBeGreaterThan(0.7);
    const legit = DAILY_CASES.filter((c) => c.answer === "legit");
    expect(legit.filter((c) => checkMessage(`${c.from} ${c.text}`).risk === "alto").length).toBeLessThan(legit.length / 2);
  });

  it("reconoce las estafas que circulan en El Salvador (VMT y BCR, 2026)", () => {
    const ids = (t: string) => checkMessage(t).flags.map((f) => f.id);
    // Frases citadas por el VMT en las falsas multas
    expect(ids("Su multa de tráfico está vencida. Multa vencida, último recordatorio antes que aumente")).toEqual(
      expect.arrayContaining(["urgency", "threat"]),
    );
    expect(checkMessage("Su multa de tráfico está vencida. Multa vencida, último recordatorio antes que aumente").risk).not.toBe("bajo");
    // Encuesta que "paga" y pide la cuenta (BCR)
    const bcr = "Gana $75 por responder una encuesta. Para pagarte, llena tu cuenta de cobro, el nombre del beneficiario y selecciona tu banco.";
    expect(ids(bcr)).toEqual(expect.arrayContaining(["prize", "bank-data"]));
    expect(checkMessage(bcr).risk).toBe("alto");
    // Un aviso normal sigue siendo de bajo riesgo
    expect(checkMessage("Tu factura de agua del mes está disponible en la app.").risk).toBe("bajo");
  });

  it("cada señal tiene explicación en los dos idiomas", () => {
    expect(Object.keys(FLAG_TEXT.en).sort()).toEqual(Object.keys(FLAG_TEXT.es).sort());
  });
});
