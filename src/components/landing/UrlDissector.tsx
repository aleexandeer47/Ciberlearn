"use client";

import { useId, useState } from "react";
import { useLang, useT } from "@/components/i18n/LangProvider";
import type { Lang } from "@/lib/i18n";
import { dissectUrl } from "@/lib/url";

const EXAMPLES: Record<Lang, string[]> = {
  es: [
    "http://bancoizalco.verificar-cuenta.co/login",
    "https://intranet.grupoatlacatl.com/rrhh",
    "https://grupoatlacatl-com.net/owa/auth",
    "enviaya.delivery-pago.top/p/8812",
  ],
  en: [
    "http://izalcobank.verify-account.co/login",
    "https://intranet.atlacatlgroup.com/hr",
    "https://atlacatlgroup-com.net/owa/auth",
    "shipnow.delivery-fee.top/p/8812",
  ],
};

// Marcas ficticias del simulador; si aparecen fuera de su dominio, es imitación.
const BRANDS = ["bancoizalco", "izalcobank", "enviaya", "shipnow", "grupoatlacatl", "atlacatlgroup", "tributos", "revenue", "banco", "bank", "paypal", "netflix", "amazon", "apple", "microsoft", "google"];

export function UrlDissector() {
  const lang = useLang();
  const t = useT();
  const examples = EXAMPLES[lang];
  const [value, setValue] = useState(examples[0]);
  const inputId = useId();
  const a = dissectUrl(value);

  return (
    <div className="rounded-3xl border border-desk-line bg-desk-2 p-5 sm:p-8">
      <label htmlFor={inputId} className="mb-2 block text-sm text-fog">
        {t("Pega o escribe cualquier enlace", "Paste or type any link")}
      </label>
      <input
        id={inputId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        inputMode="url"
        className="w-full rounded-xl border border-desk-line bg-desk px-4 py-3.5 font-mono text-sm text-chalk outline-none transition-colors placeholder:text-fog/50 focus:border-accent"
        placeholder="https://..."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            className={`btn max-w-full truncate px-3 py-1.5 font-mono text-[11px] font-normal ${
              ex === value ? "bg-brand text-white" : "btn-ghost text-fog"
            }`}
          >
            {ex.replace(/^https?:\/\//, "").slice(0, 34)}
            {ex.replace(/^https?:\/\//, "").length > 34 ? "…" : ""}
          </button>
        ))}
      </div>

      <div className="mt-8 min-h-[150px]" aria-live="polite">
        {a ? (
          <>
            <p className="font-mono text-base leading-[2.1] [overflow-wrap:anywhere] sm:text-xl">
              {a.protocol && <span className="text-fog/70">{a.protocol}</span>}
              {a.subdomain && (
                <span className="rounded bg-desk-3 px-1 text-fog" title={t("Subdominio", "Subdomain")}>
                  {a.subdomain}.
                </span>
              )}
              <span key={a.domain} className="reveal-item rounded bg-hl px-1 font-semibold text-ink">
                {a.domain}
              </span>
              {a.rest && <span className="text-fog/70">{a.rest}</span>}
            </p>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <p className="rounded-xl bg-desk p-3">
                <span className="mb-1 block font-mono text-[11px] text-accent">{t("Dominio real", "Real domain")}</span>
                <span className="font-semibold">{a.domain}</span>
                {t(": es quien controla la página. Lo demás se puede inventar.", ": whoever owns it controls the page. Everything else can be made up.")}
              </p>
              <p className="rounded-xl bg-desk p-3">
                <span className="mb-1 block font-mono text-[11px] text-fog">{t("Subdominio", "Subdomain")}</span>
                {a.subdomain ? (
                  <>
                    {t(`“${a.subdomain}” lo elige el dueño de ${a.domain}.`, `“${a.subdomain}” is chosen by whoever owns ${a.domain}.`)}{" "}
                    {BRANDS.some((b) => a.subdomain.includes(b) && !a.domain.includes(b))
                      ? t("Usa el nombre de otra marca para engañarte.", "It uses another brand's name to fool you.")
                      : t("Es normal si el dominio es el correcto.", "That's normal if the domain is the right one.")}
                  </>
                ) : (
                  t("No tiene. El enlace va directo al dominio.", "None. The link goes straight to the domain.")
                )}
              </p>
              <p className="rounded-xl bg-desk p-3">
                <span className="mb-1 block font-mono text-[11px] text-fog">{t("Candado", "Padlock")}</span>
                {a.secure
                  ? t(
                      "Usa https, pero eso solo cifra la conexión: un sitio falso también puede tenerlo.",
                      "It uses https, but that only encrypts the connection: a fake site can have it too.",
                    )
                  : a.protocol
                    ? t("Sin https. Nunca escribas datos aquí.", "No https. Never type your data here.")
                    : t("Sin protocolo escrito: fíjate en el dominio igual.", "No protocol written: check the domain anyway.")}
              </p>
            </div>
          </>
        ) : (
          <p className="text-fog">{t("Escribe un enlace completo, por ejemplo bancoizalco.com", "Type a full link, for example izalcobank.com")}</p>
        )}
      </div>
    </div>
  );
}
