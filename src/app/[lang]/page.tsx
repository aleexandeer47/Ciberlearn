import { ArrowRight, CalendarDays, Mail, Megaphone, MessageSquare, PhoneCall, ScanSearch, Smartphone, Swords } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { ReviewDemo } from "@/components/landing/ReviewDemo";
import { ScamWall } from "@/components/landing/ScamWall";
import { SignalCards } from "@/components/landing/SignalCards";
import { UrlDissector } from "@/components/landing/UrlDissector";
import { Mark } from "@/components/Mark";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { getT } from "@/lib/i18n-server";
import { getScenarios } from "@/lib/scenarios/data";

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: { languages: { es: "/es", en: "/en" } } };
}

const Arrow = () => (
  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
);

export default async function Home() {
  const { lang, t } = await getT();
  const SCENARIOS = getScenarios(lang);
  const phishingCount = SCENARIOS.filter((s) => s.verdict === "phishing").length;

  const B2B = [
    t("Plan Pro para cada persona de tu equipo", "Pro plan for everyone on your team"),
    t("Panel con el avance de cada empleado y sus puntos débiles", "Dashboard with each employee's progress and weak spots"),
    t("Informe de capacitación descargable", "Downloadable training report"),
    t("Simulacros de phishing, solo con autorización de cada empleado", "Phishing drills, only with each employee's consent"),
  ];

  const DAILY = [
    {
      href: "/revisar",
      icon: ScanSearch,
      title: t("¿Es estafa?", "Is it a scam?"),
      text: t(
        "¿Te llegó algo raro? Pégalo y mira al instante qué señales de estafa tiene. Gratis.",
        "Got something odd? Paste it and instantly see which scam signs it has. Free.",
      ),
      cta: t("Revisar un mensaje", "Check a message"),
    },
    {
      href: "/llamadas",
      icon: PhoneCall,
      title: t("Llamadas simuladas", "Simulated calls"),
      text: t(
        "Contesta la llamada de un “estafador” con voz y practica qué decir, sin riesgo.",
        "Answer a call from a voiced “scammer” and practice what to say, risk-free.",
      ),
      cta: t("Recibir una llamada", "Take a call"),
    },
    {
      href: "/diaria",
      icon: CalendarDays,
      title: t("La estafa del día", "Scam of the day"),
      text: t(
        "Un caso nuevo cada día: ¿trampa o real? 30 segundos para mantener tu racha.",
        "A new case every day: scam or real? 30 seconds to keep your streak.",
      ),
      cta: t("Ver el caso de hoy", "See today's case"),
    },
    {
      href: "/reto",
      icon: Swords,
      title: t("Reta a un amigo", "Challenge a friend"),
      text: t(
        "Manda 5 mensajes por WhatsApp y descubre quién de tu familia detecta más estafas.",
        "Send 5 messages over WhatsApp and find out who in your family spots the most scams.",
      ),
      cta: t("Crear un reto", "Create a challenge"),
    },
    {
      href: "/alertas",
      icon: Megaphone,
      title: t("Alertas de la comunidad", "Community alerts"),
      text: t(
        "Estafas que están llegando ahora, reportadas por la gente y revisadas.",
        "Scams going around right now, reported by people and reviewed.",
      ),
      cta: t("Ver alertas", "See alerts"),
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero: pila centrada + área de producto con orbes */}
        <section id="lupa" className="scroll-mt-20 overflow-x-clip">
          <div className="mx-auto max-w-[1200px] px-4 pb-24 pt-16 sm:px-6 sm:pt-24">
            <div data-enter className="mx-auto max-w-[720px] text-center">
              <span style={i(0)} className="eyebrow">
                {t("Simulador de phishing gratis", "Free phishing simulator")}
              </span>
              <h1 style={i(1)} className="mt-4 font-display text-[clamp(2.5rem,6.5vw,3.5rem)] leading-[1.05]">
                {t(
                  <>
                    ¿Picarías el <Mark>anzuelo</Mark>?
                  </>,
                  <>
                    Would you take the <Mark>bait</Mark>?
                  </>,
                )}
              </h1>
              <p style={i(2)} className="mx-auto mt-6 max-w-[600px] text-lg leading-relaxed text-fog">
                {t(
                  `El “banco” que te bloquea la cuenta, el paquete retenido, tu hijo con número nuevo. Entrena el ojo con ${SCENARIOS.length} mensajes ficticios antes de que te pase de verdad.`,
                  `The “bank” locking your account, the parcel on hold, your kid with a new number. Train your eye with ${SCENARIOS.length} fictional messages before it happens for real.`,
                )}
              </p>
              <div style={i(3)} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/simulador" className="btn btn-primary group h-12 px-6 text-base">
                  {t("Empezar la prueba", "Start the test")}
                  <Arrow />
                </Link>
                <Link href="#enlaces" className="btn btn-ghost h-12 px-6 text-base">
                  {t("Disecciona un enlace", "Dissect a link")}
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
                  {t(`${SCENARIOS.length} mensajes de correo, SMS y chat`, `${SCENARIOS.length} emails, texts and chats`)}
                  <span className="block text-fog">
                    {t(
                      `${phishingCount} trampas · sin registro · 5 minutos`,
                      `${phishingCount} traps · no sign-up · 5 minutes`,
                    )}
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
              <span className="eyebrow">{t("Herramienta gratis", "Free tool")}</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">
                {t("Lee un enlace como lo leería un experto", "Read a link the way an expert would")}
              </h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-fog">
                {t(
                  "El nombre de un banco puede aparecer en cualquier parte del enlace. Lo único que importa es el dominio real, justo antes de la primera barra.",
                  "A bank's name can show up anywhere in a link. The only thing that matters is the real domain, right before the first slash.",
                )}
              </p>
            </div>
            <UrlDissector />
          </div>
        </section>

        {/* Señales, sobre la sección alterna */}
        <section className="bg-desk-3">
          <div className="mx-auto grid max-w-[1200px] gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="eyebrow">{t("Lo que vas a aprender", "What you'll learn")}</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">
                {t("Las 8 señales de una estafa", "The 8 signs of a scam")}
              </h2>
              <p className="mt-5 max-w-sm text-lg leading-relaxed text-fog">
                {t(
                  "Casi todas las estafas combinan dos o tres. Toca una para ver cómo se ve en un mensaje.",
                  "Almost every scam combines two or three. Tap one to see how it looks in a message.",
                )}
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
              <span className="eyebrow">{t("Muro de estafas", "Scam wall")}</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">
                {t("Mensajes que llegan todos los días", "Messages that arrive every day")}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-fog">
                {t(
                  "Algunos son trampas y otros son reales. ¿Sabrías cuál es cuál?",
                  "Some are traps and some are real. Could you tell which is which?",
                )}
              </p>
            </div>
            <ScamWall />
          </div>
        </section>

        {/* Hábito diario y comunidad */}
        <section className="bg-desk-3">
          <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
            <div className="mx-auto mb-12 max-w-[720px] text-center">
              <span className="eyebrow">{t("Todos los días", "Every day")}</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">
                {t("Un minuto al día te cuida todo el año", "One minute a day keeps you safe all year")}
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              <span className="eyebrow">{t("Plan Empresa", "Business plan")}</span>
              <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">
                {t("Basta con que una persona de tu equipo haga clic", "It only takes one person on your team to click")}
              </h2>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-graphite">
                {t(
                  "Capacita a tu equipo completo en español o inglés, con casos reales. Pensado para pymes, instituciones educativas y cooperativas.",
                  "Train your whole team in English or Spanish, with real-world cases. Built for small businesses, schools and nonprofits.",
                )}
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
                {t("Ver plan Empresa", "See Business plan")}
                <Arrow />
              </Link>
            </div>
          </div>
        </section>

        {/* Cierre */}
        <section>
          <div className="mx-auto max-w-[1200px] px-4 py-24 text-center sm:px-6">
            <span className="eyebrow">{t("Hazlo en 5 minutos", "Done in 5 minutes")}</span>
            <h2 className="mx-auto mt-4 max-w-[720px] font-display text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05]">
              {t(
                `${SCENARIOS.length} mensajes. ¿Cuántos te habrían engañado?`,
                `${SCENARIOS.length} messages. How many would have fooled you?`,
              )}
            </h2>
            <Link href="/simulador" className="btn btn-primary group mt-10 h-12 px-6 text-base">
              {t("Hacer la prueba gratis", "Take the free test")}
              <Arrow />
            </Link>
            <div className="mx-auto mt-16 grid max-w-4xl gap-4 text-left sm:grid-cols-3">
              {[
                [
                  t("Todo es ficticio", "Everything is fictional"),
                  t(
                    "Bancos, empresas, personas y dominios son inventados. No imitamos marcas reales.",
                    "Banks, companies, people and domains are made up. We don't imitate real brands.",
                  ),
                ],
                [
                  t("No pedimos tus datos", "We don't ask for your data"),
                  t(
                    "Puedes jugar sin cuenta y nunca te pediremos contraseñas ni información personal.",
                    "You can play without an account and we'll never ask for passwords or personal information.",
                  ),
                ],
                [
                  t("Pasa en tu navegador", "It stays in your browser"),
                  t("Sin cuenta, tus respuestas no salen de tu navegador.", "Without an account, your answers never leave your browser."),
                ],
              ].map(([title, d], n) => (
                <div key={title} className={`rounded-3xl p-6 ${n === 0 ? "bg-mint" : "border border-desk-line"}`}>
                  <p className="font-semibold">{title}</p>
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
