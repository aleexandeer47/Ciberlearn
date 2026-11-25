import Link from "next/link";
import { Suspense } from "react";
import { CookiePrefsLink } from "@/components/analytics/Analytics";
import { AccountFallback, AccountPill, GuestLinks } from "@/components/auth/HeaderAccount";
import { LangSwitch } from "@/components/i18n/LangProvider";
import { InstallApp } from "@/components/pwa/Pwa";
import { SettingsMenu } from "@/components/settings/SettingsMenu";
import type { T } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";
import { getCurrentUser } from "@/lib/server/session";

const nav = (t: T) =>
  [
    ["/ruta", t("Ruta", "Path")],
    ["/diaria", t("Hoy", "Today")],
    ["/simulador", t("Simulador", "Simulator")],
    ["/reto", t("Retos", "Challenges")],
    ["/alertas", t("Alertas", "Alerts")],
    ["/ia", t("Chats IA", "AI chats")],
    ["/ranking", "Ranking"],
    ["/planes", t("Planes", "Pricing")],
  ] as const;

export function Logo() {
  return (
    // Anzuelo roto dentro de un escudo: un solo color, sin recuadro.
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 text-brand">
      <path
        d="M12 2.75 19.25 5.5v5.75c0 4.6-3 8.3-7.25 9.99C7.75 19.55 4.75 15.85 4.75 11.25V5.5Z"
        fill="currentColor"
      />
      <path d="m8.75 12.25 2.25 2.25 4.5-4.75" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Sesión confirmada por el servidor; además actualiza lo que el navegador recuerda (ver HeaderAccount). */
async function UserNav() {
  const user = await getCurrentUser();
  if (!user) return <GuestLinks forget />;
  return <AccountPill initial={user.name.slice(0, 1).toUpperCase()} pro={user.isPro} remember />;
}

export async function SiteHeader() {
  const { t } = await getT();
  const NAV = nav(t);
  return (
    <header className="sticky top-0 z-30 border-b border-desk-line/70 bg-desk/85 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1200px] grid-cols-[1fr_auto] items-center px-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label={SITE.name} className="flex min-w-0 items-center gap-2 text-[17px] font-semibold tracking-tight">
          <Logo />
          {/* En celulares muy angostos (menos de 360 px) solo el escudo, para que quepan los botones */}
          <span className="max-[359px]:hidden">{SITE.name}</span>
        </Link>
        {/* Enlaces al centro (escritorio) */}
        <nav className="hidden items-center gap-0.5 text-[15px] font-medium lg:flex" aria-label={t("Principal", "Main")}>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg px-2.5 py-2 text-chalk transition-colors hover:text-brand">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-1 text-[15px] sm:gap-2">
          {/* El idioma queda a la vista (quien llega de otro país lo busca primero); lo demás, en la tuerca */}
          <LangSwitch />
          <SettingsMenu />
          <Suspense fallback={<AccountFallback />}>
            <UserNav />
          </Suspense>
        </div>
      </div>
      {/* Celular y tableta: fila de accesos que se desliza de lado */}
      <nav
        aria-label={t("Principal", "Main")}
        className="flex gap-1 overflow-x-auto border-t border-desk-line/50 px-3 py-1.5 text-sm font-medium [scrollbar-width:none] lg:hidden"
      >
        {NAV.map(([href, label]) => (
          <Link key={href} href={href} className="shrink-0 rounded-full px-3 py-1.5 text-chalk transition-colors hover:bg-desk-3">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export async function SiteFooter() {
  const { lang, t } = await getT();
  return (
    <footer className="mt-auto border-t border-desk-line/70">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-8 text-sm text-fog sm:px-6">
        <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            ["/revisar", t("¿Es estafa?", "Is it a scam?")],
            ["/llamadas", t("Llamadas simuladas", "Simulated calls")],
            ["/empresa", t("Para empresas", "For business")],
            ["/familia", t("Pro Familiar", "Family plan")],
            ["/clase", t("Para colegios", "For schools")],
            ["/mayores", t("Para mayores", "For seniors")],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="font-medium text-chalk hover:text-brand">
              {label}
            </Link>
          ))}
          {Object.values(LEGAL).map((d) => (
            <Link key={d.path} href={d.path} className="font-medium text-chalk hover:text-brand">
              {d.title[lang]}
            </Link>
          ))}
          <a href={`mailto:${SITE.privacyEmail}`} className="font-medium text-chalk hover:text-brand">
            {t("Contacto", "Contact")}
          </a>
          <CookiePrefsLink />
          <InstallApp />
        </nav>
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
          <p>
            © {SITE.year} {SITE.name}
          </p>
          <p>
            {t(
              "Todos los mensajes, marcas y personas del simulador son ficticios.",
              "All messages, brands and people in the simulator are fictional.",
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Envoltorio común de las páginas internas. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">{children}</main>
      <SiteFooter />
    </>
  );
}
