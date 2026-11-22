import { ArrowRight, CalendarDays, Mail, Megaphone, MessageSquare, Smartphone, Swords } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { ReviewDemo } from "@/components/landing/ReviewDemo";
import { ScamWall } from "@/components/landing/ScamWall";
import { SignalCards } from "@/components/landing/SignalCards";
import { UrlDissector } from "@/components/landing/UrlDissector";
import { Mark } from "@/components/Mark";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { SCENARIOS } from "@/lib/scenarios/data";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

const B2B = [
  "Plan Pro para cada persona de tu equipo",
  "Panel con el avance de cada empleado y sus puntos débiles",
  "Informe de capacitación descargable",
  "Simulacros de phishing, solo con autorización de cada empleado",
];

const DAILY = [
  {
    href: "/diaria",
    icon: CalendarDays,
    title: "La estafa del día",
    text: "Un caso nuevo cada día: ¿trampa o real? 30 segundos para mantener tu racha.",
    cta: "Ver el caso de hoy",
  },
  {
    href: "/reto",
    icon: Swords,
    title: "Reta a un amigo",
    text: "Manda 5 mensajes por WhatsApp y descubre quién de tu familia detecta más estafas.",
    cta: "Crear un reto",
  },
  {
    href: "/alertas",
    icon: Megaphone,
    title: "Alertas de la comunidad",
    text: "Estafas que están llegando ahora en El Salvador, reportadas por la gente y revisadas.",
    cta: "Ver alertas",
  },
];

const Arrow = () => (
  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
);

export default function Home() {
  const phishingCount = SCENARIOS.filter((s) => s.verdict === "phishing").length;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero: pila centrada + área de producto con orbes */}
        <section id="lupa" className="scroll-mt-20 overflow-x-clip">
          <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
            <div data-enter className="mx-auto max-w-[720px] text-center">
              <span style={i(0)} className="eyebrow">
                Simulador de phishing · El Salvador
              </span>
              <h1 style={i(1)} className="mt-4 font-display text-[clamp(2.5rem,6.5vw,3.5rem)] leading-[1.05]">
                ¿Picarías el <Mark>anzuelo</Mark>?
              </h1>
              <p style={i(2)} className="mx-auto mt-6 max-w-[600px] text-lg leading-relaxed text-fog">
                El “banco” que te bloquea la cuenta, el paquete retenido, tu hijo con número nuevo. Entrena el ojo con{" "}
                {SCENARIOS.length} mensajes ficticios antes de que te pase de verdad.
              </p>
              <div style={i(3)} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/simulador" className="btn btn-primary group h-12 px-6 text-base">
                  Empezar la prueba
                  <Arrow />
                </Link>
                <Link href="#enlaces" className="btn btn-ghost h-12 px-6 text-base">
                  Disecciona un enlace
                </Link>
              </div>
              {/* En lugar de avatares y estrellas inventadas: los canales reales que entrena */}
              <div style={i(4)} className="mt-8 flex items-center justify-center gap-3">
                <span className="flex" aria-hidden>
                  {[Mail, MessageSquare, Smartphone].map((Icon, n) => (
                    <span
                      key={n}
                      className={`grid h-10 w-10 place-items-center rounded-full border-2 border-desk bg-field text-brand ${n ? "-ml-3" : ""}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                  ))}
                </span>
                <p className="text-left text-sm font-medium">
                  {SCENARIOS.length} mensajes de correo, SMS y chat
                  <span className="block text-fog">
                    {phishingCount} trampas · sin registro · 5 minutos
                  </span>
                </p>
              </div>
            </div>

            <HeroPreview />
          </div>
        </section>

        {/* Banda de color: el demo que se revisa solo */}
        <section className="band-field overflow-x-clip">
          <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
            <ReviewDemo />
          </div>
        </section>

        {/* Diseccionador */}
        <section id="enlaces" className="scroll-mt-20">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <span className="eyebrow">Herramienta gratis</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">Lee un enlace como lo leería un experto</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-fog">
                El nombre de un banco puede aparecer en cualquier parte del enlace. Lo único que importa es el dominio
                real, justo antes de la primera barra.
              </p>
            </div>
            <UrlDissector />
          </div>
        </section>

        {/* Señales, sobre la sección alterna */}
        <section className="bg-desk-3">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="eyebrow">Lo que vas a aprender</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">Las 8 señales de una estafa</h2>
              <p className="mt-5 max-w-sm text-lg leading-relaxed text-fog">
                Casi todas las estafas combinan dos o tres. Toca una para ver cómo se ve en un mensaje.
              </p>
            </div>
            <div className="rounded-3xl border border-desk-line bg-desk-2 px-6">
              <SignalCards />
            </div>
          </div>
        </section>

        {/* Muro de estafas */}
        <section>
          <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
            <div className="mx-auto mb-12 max-w-[720px] text-center">
              <span className="eyebrow">Muro de estafas</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">Mensajes que llegan todos los días</h2>
              <p className="mt-5 text-lg leading-relaxed text-fog">
                Algunos son trampas y otros son reales. ¿Sabrías cuál es cuál?
              </p>
            </div>
            <ScamWall />
          </div>
        </section>

        {/* Hábito diario y comunidad */}
        <section className="bg-desk-3">
          <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
            <div className="mx-auto mb-12 max-w-[720px] text-center">
              <span className="eyebrow">Todos los días</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">Un minuto al día te cuida todo el año</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {DAILY.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  className="group flex flex-col rounded-3xl border border-desk-line bg-desk-2 p-6 transition-colors hover:border-brand"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-field text-brand">
                    <d.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <p className="mt-4 font-display text-xl">{d.title}</p>
                  <p className="mt-1 flex-1 text-fog">{d.text}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-brand">
                    {d.cta} <Arrow />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Empresas: banda de color con botón oscuro */}
        <section id="empresas" className="band-field scroll-mt-20">
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2">
            <div>
              <span className="eyebrow">Plan Empresa</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">
                Basta con que una persona de tu equipo haga clic
              </h2>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-graphite">
                Capacita a tu equipo completo en español, con ejemplos locales. Pensado para pymes, instituciones educativas
                y cooperativas.
              </p>
              <ul className="mt-6 space-y-3">
                {B2B.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    {b}
                  </li>
                ))}
              </ul>
              <Link href="/empresa" className="btn btn-dark group mt-8 h-12 px-6">
                Ver plan Empresa
                <Arrow />
              </Link>
            </div>
          </div>
        </section>

        {/* Cierre */}
        <section>
          <div className="mx-auto max-w-[1200px] px-4 py-24 text-center sm:px-6">
            <span className="eyebrow">Hazlo en 5 minutos</span>
            <h2 className="mx-auto mt-4 max-w-[720px] font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05]">
              {SCENARIOS.length} mensajes. ¿Cuántos te habrían engañado?
            </h2>
            <Link href="/simulador" className="btn btn-primary group mt-10 h-12 px-6 text-base">
              Hacer la prueba gratis
              <Arrow />
            </Link>
            <div className="mx-auto mt-16 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
              {[
                ["Todo es ficticio", "Bancos, empresas, personas y dominios son inventados. No imitamos marcas reales."],
                ["No pedimos tus datos", "Puedes jugar sin cuenta y nunca te pediremos contraseñas ni información personal."],
                ["Pasa en tu navegador", "Sin cuenta, tus respuestas no salen de tu navegador."],
              ].map(([t, d], n) => (
                <div key={t} className={`rounded-3xl p-6 ${n === 0 ? "bg-mint" : "border border-desk-line"}`}>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-sm leading-relaxed text-fog">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
