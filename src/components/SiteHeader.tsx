import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SITE } from "@/lib/site";
import { getCurrentUser } from "@/lib/server/session";

export function Logo() {
  return (
    // Escudo con una marca de revisión: un solo color, sin recuadro.
    <svg viewBox="0 0 24 24" aria-hidden className="h-6 w-6 text-brand">
      <path
        d="M12 2.75 19.25 5.5v5.75c0 4.6-3 8.3-7.25 9.99C7.75 19.55 4.75 15.85 4.75 11.25V5.5Z"
        fill="currentColor"
      />
      <path d="m8.75 12.25 2.25 2.25 4.5-4.75" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GuestNav() {
  return (
    <>
      <Link href="/entrar" className="rounded-lg px-2 py-2 font-medium text-chalk transition-colors hover:text-brand">
        Entrar
      </Link>
      <Link href="/registro" className="btn btn-primary h-10 whitespace-nowrap px-4 text-sm sm:px-5">
        <span className="sm:hidden">Crear cuenta</span>
        <span className="hidden sm:inline">Crear cuenta gratis</span>
      </Link>
    </>
  );
}

async function UserNav() {
  const user = await getCurrentUser();
  if (!user) return <GuestNav />;
  return (
    <Link
      href="/progreso"
      className="group flex items-center gap-2.5 rounded-full border border-desk-line py-1 pl-1 pr-3.5 transition-colors hover:border-fog/60"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-semibold text-white">
        {user.name.slice(0, 1).toUpperCase()}
      </span>
      <span className="hidden text-chalk sm:inline">Mi progreso</span>
      {user.isPro && (
        <span className="rounded-full bg-brand px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">Pro</span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-desk-line/70 bg-desk/85 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1200px] grid-cols-[1fr_auto] items-center px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight">
          <Logo />
          {SITE.name}
        </Link>
        {/* Enlaces al centro (escritorio) */}
        <nav className="hidden items-center gap-1 text-[15px] font-medium md:flex" aria-label="Principal">
          {[
            ["/ruta", "Ruta"],
            ["/simulador", "Simulador"],
            ["/ia", "Chats IA"],
            ["/ranking", "Ranking"],
            ["/planes", "Planes"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg px-2.5 py-2 text-chalk transition-colors hover:text-brand">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-1 text-[15px] sm:gap-2">
          <ThemeToggle />
          <Suspense fallback={<GuestNav />}>
            <UserNav />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-desk-line/70">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-4 py-8 text-sm text-fog sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {SITE.year} {SITE.name}. Hecho en El Salvador.
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          <span>Todos los mensajes, marcas y personas del simulador son ficticios.</span>
          <Link href="/privacidad" className="font-medium text-chalk hover:text-brand">
            Política de privacidad
          </Link>
        </p>
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
