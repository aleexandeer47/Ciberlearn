import { CalendarDays, HeartHandshake, Phone, Type } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/SiteHeader";
import { ListenButton, SimpleModeButton } from "@/components/theme/SimpleMode";

export const metadata: Metadata = {
  title: "Para personas mayores",
  description: "Aprende a reconocer estafas con letra grande, mensajes que se pueden escuchar y consejos simples.",
};

const RULES = [
  ["Nadie de verdad te pide códigos ni claves", "Ni el banco, ni la compañía de teléfono, ni un familiar. Si te piden el código que te llegó por mensaje, es una estafa."],
  ["Si te apuran, detente", "“Es urgente”, “hoy se bloquea su cuenta”, “no le digas a nadie”: la prisa es la trampa. Cuelga y respira."],
  ["Llama tú al número de siempre", "Si te llaman “del banco” o un familiar con otro número, cuelga y llama tú al número que ya conoces."],
  ["Premios que no buscaste no existen", "Si ganaste algo sin participar o te piden pagar para recibirlo, es una estafa."],
  ["Ante la duda, pregunta", "Muéstrale el mensaje a un hijo, nieto o persona de confianza antes de hacer cualquier cosa."],
];

export default function MayoresPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">Para personas mayores y sus familias</span>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Aprender a no caer, con calma y letra grande</h1>
        <p className="mt-4 text-xl leading-relaxed text-graphite">
          Las estafas por llamada y por WhatsApp buscan sobre todo a personas mayores. Aquí puedes practicar a tu ritmo,
          con letra grande y escuchando los mensajes en voz alta.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-3xl bg-field p-6">
          <Type className="h-8 w-8 shrink-0 text-brand" aria-hidden />
          <p className="min-w-56 flex-1 text-lg">
            Activa la <strong>letra grande</strong>. También puedes usar el botón <strong>“Aa”</strong> de arriba en cualquier página.
          </p>
          <SimpleModeButton />
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl">Las 5 reglas de oro</h2>
            <ListenButton text={RULES.map(([t, d], n) => `Regla ${n + 1}: ${t}. ${d}`).join(" ")} className="text-base text-brand" />
          </div>
          <ol className="mt-6 space-y-4">
            {RULES.map(([t, d], n) => (
              <li key={t} className="flex gap-4 rounded-3xl border border-desk-line bg-desk-2 p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand font-display text-2xl text-white">{n + 1}</span>
                <span>
                  <span className="block text-xl font-semibold">{t}</span>
                  <span className="mt-1 block text-lg leading-relaxed text-graphite">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link href="/diaria" className="rounded-3xl border border-desk-line bg-desk-2 p-6 transition-colors hover:border-brand">
            <CalendarDays className="h-8 w-8 text-[#f97316]" aria-hidden />
            <p className="mt-3 text-xl font-semibold">Practica con un mensaje al día</p>
            <p className="mt-1 text-lg text-graphite">Un solo mensaje, una sola pregunta: ¿es trampa o es real? Puedes escucharlo.</p>
          </Link>
          <Link href="/simulador" className="rounded-3xl border border-desk-line bg-desk-2 p-6 transition-colors hover:border-brand">
            <Phone className="h-8 w-8 text-brand" aria-hidden />
            <p className="mt-3 text-xl font-semibold">Prueba con 10 mensajes</p>
            <p className="mt-1 text-lg text-graphite">Sin crear cuenta. Al final te explicamos cada uno.</p>
          </Link>
        </section>

        <section className="mt-12 flex flex-wrap items-center gap-5 rounded-3xl border border-desk-line bg-desk-2 p-6">
          <HeartHandshake className="h-10 w-10 shrink-0 text-brand" aria-hidden />
          <div className="min-w-56 flex-1">
            <p className="text-xl font-semibold">¿Quieres cuidar a tus papás?</p>
            <p className="mt-1 text-lg text-graphite">
              Con Pro Familiar, hasta 5 personas entrenan con todo incluido y tú ves cómo van.
            </p>
          </div>
          <Link href="/familia" className="btn btn-primary h-14 px-7 text-lg">
            Ver Pro Familiar
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
