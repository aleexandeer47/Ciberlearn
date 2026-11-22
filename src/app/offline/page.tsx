import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Sin conexión", robots: { index: false } };

// Página estática (sin datos de nadie): el service worker la guarda para mostrarla sin internet.
export default function OfflinePage() {
  return (
    <main className="grid flex-1 place-items-center px-6 py-20 text-center">
      <div className="max-w-md">
        <div className="flex items-center justify-center gap-2 text-lg font-semibold">
          <Logo /> Ciberlearn
        </div>
        <WifiOff className="mx-auto mt-10 h-12 w-12 text-fog" strokeWidth={1.5} aria-hidden />
        <h1 className="mt-4 font-display text-3xl">Estás sin conexión</h1>
        <p className="mt-3 text-fog">Revisa tu internet y vuelve a intentarlo. Mientras tanto, un consejo:</p>
        <p className="mt-4 rounded-2xl bg-field p-4 text-graphite">
          Si un mensaje te apura, te pide claves o códigos, o te ofrece algo demasiado bueno, detente: así empiezan casi
          todas las estafas.
        </p>
        <Link href="/" className="btn btn-primary mt-8 h-12 px-6">
          Reintentar
        </Link>
      </div>
    </main>
  );
}
