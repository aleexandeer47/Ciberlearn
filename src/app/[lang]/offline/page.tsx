import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Sin conexión", "Offline"), robots: { index: false } };
}

// Página estática (sin datos de nadie): el service worker la guarda para mostrarla sin internet.
export default async function OfflinePage() {
  const { t } = await getT();
  return (
    <main className="grid flex-1 place-items-center px-6 py-20 text-center">
      <div className="max-w-md">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Logo /> {SITE.name}
        </div>
        <WifiOff className="mx-auto mt-10 h-12 w-12 text-fog" strokeWidth={1.5} aria-hidden />
        <h1 className="mt-4 font-display text-3xl">{t("Estás sin conexión", "You're offline")}</h1>
        <p className="mt-3 text-fog">
          {t("Revisa tu internet y vuelve a intentarlo. Mientras tanto, un consejo:", "Check your internet and try again. Meanwhile, a tip:")}
        </p>
        <p className="mt-4 rounded-2xl bg-field p-4 text-graphite">
          {t(
            "Si un mensaje te apura, te pide claves o códigos, o te ofrece algo demasiado bueno, detente: así empiezan casi todas las estafas.",
            "If a message rushes you, asks for passwords or codes, or offers something too good to be true, stop: that's how almost every scam starts.",
          )}
        </p>
        <Link href="/" className="btn btn-primary mt-8 h-12 px-6">
          {t("Reintentar", "Try again")}
        </Link>
      </div>
    </main>
  );
}
