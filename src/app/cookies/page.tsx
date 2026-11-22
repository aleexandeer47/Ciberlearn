import type { Metadata } from "next";
import { A, LegalPage, MailLink, Section } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: `Qué cookies y qué datos guarda ${SITE.name} en tu navegador, y por qué no necesitamos pedirte permiso para ellos.`,
};

/*
 * Debe coincidir con el código:
 *  - cookie ciberlearn_session          src/lib/server/session.ts
 *  - localStorage ciberlearn-theme      src/components/theme/theme.ts
 *  - localStorage ciberlearn-simple     src/components/theme/SimpleMode.tsx
 *  - Cache Storage ciberlearn-*         public/sw.js
 *  - localStorage ciberlearn-visit-day  src/components/VisitBeacon.tsx
 *  - sessionStorage ciberlearn:pendingRun src/components/simulator/Summary.tsx
 * Si agregas analítica, publicidad o cualquier herramienta de terceros que guarde datos en el navegador,
 * necesitarás un aviso de consentimiento ANTES de activarla, y actualizar esta página.
 */

const SECTIONS = [
  { id: "que-son", title: "Qué son" },
  { id: "lista", title: "Lo que usamos" },
  { id: "terceros", title: "Cookies de terceros" },
  { id: "consentimiento", title: "¿Por qué no hay aviso de cookies?" },
  { id: "control", title: "Cómo borrarlas" },
];

const ROWS = [
  {
    name: "ciberlearn_session",
    kind: "Cookie",
    purpose: "Mantiene tu sesión iniciada. Sin ella no podrías entrar a tu cuenta.",
    duration: "30 días o hasta que cierres sesión",
    type: "Necesaria",
  },
  {
    name: "ciberlearn-theme",
    kind: "Almacenamiento local",
    purpose: "Recuerda si elegiste el modo claro u oscuro.",
    duration: "Hasta que la borres",
    type: "Preferencia",
  },
  {
    name: "ciberlearn-simple",
    kind: "Almacenamiento local",
    purpose: "Recuerda si activaste la letra grande (modo sencillo).",
    duration: "Hasta que la borres",
    type: "Preferencia",
  },
  {
    name: "ciberlearn-static / ciberlearn-pages",
    kind: "Caché de la app",
    purpose:
      "Si instalas la app, guarda los archivos del sitio para que cargue más rápido y una página de “sin conexión”. No guarda páginas con tus datos.",
    duration: "Hasta que se actualice o desinstales la app",
    type: "Funcional",
  },
  {
    name: "ciberlearn-visit-day",
    kind: "Almacenamiento local",
    purpose: "Guarda solo la fecha de hoy, para contar tu visita una sola vez al día en el total de visitas. No te identifica.",
    duration: "Se reemplaza cada día",
    type: "Funcional",
  },
  {
    name: "ciberlearn:pendingRun",
    kind: "Almacenamiento de sesión",
    purpose: "Si juegas sin cuenta, guarda el resultado de tu ronda para sumarlo a tu progreso si te registras.",
    duration: "Hasta que cierres la pestaña",
    type: "Funcional",
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      doc="cookies"
      sections={SECTIONS}
      summary={
        <ul className="list-disc space-y-1 pl-5">
          <li>Usamos una sola cookie, y es para mantener tu sesión.</li>
          <li>No usamos cookies de publicidad, de rastreo ni analítica de terceros.</li>
          <li>Por eso no te mostramos un aviso para aceptar cookies.</li>
        </ul>
      }
    >
      <Section id="que-son" title="Qué son">
        <p>
          Las cookies y el almacenamiento local son pequeños datos que un sitio guarda en tu navegador para recordar algo,
          por ejemplo que ya iniciaste sesión. Se quedan en tu dispositivo.
        </p>
      </Section>

      <Section id="lista" title="Lo que usamos">
        <p>Esta es la lista completa de lo que {SITE.name} guarda en tu navegador:</p>
        <div className="overflow-x-auto rounded-2xl border border-desk-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-desk-2 text-fog">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Para qué sirve</th>
                <th className="px-4 py-3 font-medium">Duración</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.name} className="border-t border-desk-line align-top">
                  <td className="px-4 py-3">
                    <code className="font-mono text-[13px] text-chalk">{r.name}</code>
                    <p className="mt-0.5 text-xs text-fog">{r.kind}</p>
                  </td>
                  <td className="px-4 py-3">{r.purpose}</td>
                  <td className="px-4 py-3">{r.duration}</td>
                  <td className="px-4 py-3">{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Las fuentes tipográficas se sirven desde nuestro propio dominio, así que cargar el sitio no envía tus datos a
          otras empresas.
        </p>
      </Section>

      <Section id="terceros" title="Cookies de terceros">
        <p>
          {SITE.name} no instala cookies de terceros. Cuando pagas el plan Pro, te llevamos a la página de Wompi, que puede
          usar sus propias cookies bajo su política. Eso ocurre en el sitio de Wompi, no en el nuestro.
        </p>
      </Section>

      <Section id="consentimiento" title="¿Por qué no hay aviso de cookies?">
        <p>
          Los avisos de cookies sirven para pedir permiso antes de usar cookies que no son necesarias, como las de
          publicidad o las que te siguen entre sitios. Nosotros no usamos ninguna de esas: la cookie de sesión es
          indispensable para que puedas entrar a tu cuenta, y lo demás son preferencias y datos que se quedan en tu
          navegador y no te identifican.
        </p>
        <p>
          Si algún día agregamos herramientas de analítica o de terceros, te pediremos permiso antes de activarlas y
          actualizaremos esta página.
        </p>
      </Section>

      <Section id="control" title="Cómo borrarlas">
        <p>
          Puedes borrar las cookies y el almacenamiento del sitio desde la configuración de tu navegador (en la mayoría,
          en “Privacidad” o “Datos de sitios”). Si borras la cookie de sesión, tendrás que volver a iniciar sesión.
        </p>
        <p>
          Más sobre cómo tratamos tus datos en la <A href={LEGAL.privacidad.path}>Política de privacidad</A>. ¿Dudas?
          Escríbenos a <MailLink />.
        </p>
      </Section>
    </LegalPage>
  );
}
