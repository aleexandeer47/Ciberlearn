"use client";

import { useSearchParams } from "next/navigation";
import { useT } from "@/components/i18n/LangProvider";

export function PasswordNotice() {
  const t = useT();
  if (useSearchParams().get("clave") !== "actualizada") return null;
  return (
    <p className="pop-in rounded-2xl border border-ok/40 bg-ok/10 px-5 py-3 text-sm">
      <strong className="text-ok">{t("Contraseña actualizada.", "Password updated.")}</strong>{" "}
      {t("Cerramos tu sesión en los demás dispositivos.", "We logged you out on your other devices.")}
    </p>
  );
}
