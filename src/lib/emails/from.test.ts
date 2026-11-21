import { describe, expect, it } from "vitest";
import { parseFrom } from "./from";

describe("parseFrom", () => {
  it("separa nombre y correo", () => {
    expect(parseFrom("Ciberlearn <hola@ciberlearn.com>")).toEqual({ name: "Ciberlearn", email: "hola@ciberlearn.com" });
    expect(parseFrom('"Equipo Ciberlearn" <no-responder@x.com>')).toEqual({ name: "Equipo Ciberlearn", email: "no-responder@x.com" });
  });

  it("acepta solo el correo y usa el nombre por defecto", () => {
    expect(parseFrom("yo@gmail.com")).toEqual({ name: "Ciberlearn", email: "yo@gmail.com" });
    expect(parseFrom("'yo@gmail.com'")).toEqual({ name: "Ciberlearn", email: "yo@gmail.com" });
  });

  it("rechaza valores inválidos", () => {
    expect(parseFrom("")).toBeNull();
    expect(parseFrom("Ciberlearn")).toBeNull();
    expect(parseFrom("Ciberlearn <no-es-correo>")).toBeNull();
  });
});
