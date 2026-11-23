import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

type DocId = keyof typeof LEGAL;

/** Plantilla de las páginas legales: índice lateral, resumen y secciones. */
export async function LegalPage({
  doc,
  sections,
  summary,
  children,
}: {
  doc: DocId;
  sections: { id: string; title: string }[];
  summary?: ReactNode;
  children: ReactNode;
}) {
  const { lang, t } = await getT();
  const meta = LEGAL[doc];
  return (
    <PageShell>
      <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[220px_1fr]">
        <nav aria-label={t("Contenido", "Contents")} className="hidden lg:block">
          <div className="sticky top-24 space-y-8">
            <div>
              <p className="eyebrow mb-3">{t("Contenido", "Contents")}</p>
              <ol className="space-y-1.5 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-fog transition-colors hover:text-chalk">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="eyebrow mb-3">{t("Documentos", "Documents")}</p>
              <ul className="space-y-1.5 text-sm">
                {(Object.keys(LEGAL) as DocId[]).map((id) => (
                  <li key={id}>
                    <Link
                      href={LEGAL[id].path}
                      aria-current={id === doc ? "page" : undefined}
                      className={id === doc ? "font-medium text-chalk" : "text-fog transition-colors hover:text-chalk"}
                    >
                      {LEGAL[id].title[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        <article className="max-w-[720px]">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{meta.title[lang]}</h1>
          <p className="mt-3 text-sm text-fog">
            {t("Última actualización", "Last updated")}: {meta.updated[lang]} · {t("Versión", "Version")} {meta.version}
          </p>
          {lang === "en" && (
            <p className="mt-3 text-sm text-fog">
              This is a translation for your convenience. If the English and Spanish versions differ, the Spanish version
              prevails.
            </p>
          )}

          {summary && (
            <div className="mt-8 rounded-3xl bg-field p-6 leading-relaxed">
              <p className="font-semibold">{t("En resumen", "In short")}</p>
              <div className="mt-2 text-graphite">{summary}</div>
            </div>
          )}

          <div className="mt-12 space-y-10">{children}</div>
        </article>
      </div>
    </PageShell>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-desk-line pt-10">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-graphite">{children}</div>
    </section>
  );
}

export function Item({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <li className="rounded-2xl border border-desk-line bg-desk-2 p-4">
      <p className="font-semibold text-chalk">{label}</p>
      <div className="mt-1 text-[15px]">{children}</div>
    </li>
  );
}

export function A({ href, children }: { href: string; children: ReactNode }) {
  const cls = "font-medium text-brand underline-offset-2 hover:underline";
  return href.startsWith("/") ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <a href={href} className={cls} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

export function MailLink() {
  return <A href={`mailto:${SITE.privacyEmail}`}>{SITE.privacyEmail}</A>;
}

/** Datos del proveedor (LPC art. 4 q). Solo se muestran los que están completos en SITE.provider. */
export async function ProviderInfo() {
  const { t } = await getT();
  const p = SITE.provider;
  const rows: [string, string][] = [
    [t("Nombre o razón social", "Legal name"), p.legalName],
    [t("Nombre comercial", "Trade name"), SITE.name],
    [t("NIT", "Tax ID (NIT)"), p.nit],
    [t("Dirección", "Address"), p.address],
    [t("Teléfono", "Phone"), p.phone],
    [t("Correo", "Email"), SITE.privacyEmail],
  ];
  return (
    <dl className="grid gap-x-6 gap-y-2 rounded-2xl border border-desk-line bg-desk-2 p-5 text-[15px] sm:grid-cols-[auto_1fr]">
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-fog">{k}</dt>
            <dd className="text-chalk">{v}</dd>
          </div>
        ))}
    </dl>
  );
}
