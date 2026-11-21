import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/SiteHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Qué datos recoge ${SITE.name}, para qué los usa, con quién los comparte y cómo ejercer tus derechos.`,
};

// Cambia esta fecha cada vez que modifiques el contenido.
const UPDATED = "20 de noviembre de 2026";

/*
 * Cada dato, cookie y proveedor que se menciona aquí corresponde a lo que hace el código:
 *  - users / sessions / runs / orders / login_attempts / password_resets / daily_stats (MongoDB)
 *  - cookie "ciberlearn_session" y claves de localStorage/sessionStorage del navegador
 *  - proveedores: MongoDB Atlas, Wompi, Mailjet y el hosting del sitio
 * Si cambia el sistema (nuevos datos, analítica, proveedores), actualiza esta página.
 */

const SECTIONS = [
  { id: "responsable", title: "Quién es responsable" },
  { id: "datos", title: "Qué datos recogemos" },
  { id: "usos", title: "Para qué los usamos" },
  { id: "navegador", title: "Cookies y almacenamiento del navegador" },
  { id: "terceros", title: "Con quién los compartimos" },
  { id: "conservacion", title: "Cuánto tiempo los guardamos" },
  { id: "seguridad", title: "Cómo los protegemos" },
  { id: "derechos", title: "Tus derechos" },
  { id: "menores", title: "Menores de edad" },
  { id: "cambios", title: "Cambios a esta política" },
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-desk-line pt-10">
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed text-graphite">{children}</div>
    </section>
  );
}

function Item({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li className="rounded-2xl border border-desk-line bg-desk-2 p-4">
      <p className="font-semibold text-chalk">{label}</p>
      <p className="mt-1 text-[15px]">{children}</p>
    </li>
  );
}

export default function PrivacidadPage() {
  const mail = SITE.privacyEmail;
  const mailLink = (
    <a href={`mailto:${mail}`} className="font-medium text-brand underline-offset-2 hover:underline">
      {mail}
    </a>
  );

  return (
    <PageShell>
      <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[220px_1fr]">
        {/* Índice */}
        <nav aria-label="Contenido" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow mb-3">Contenido</p>
            <ol className="space-y-1.5 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-fog transition-colors hover:text-chalk">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="max-w-[720px]">
          <span className="eyebrow">Legal</span>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">Política de privacidad</h1>
          <p className="mt-3 text-sm text-fog">Última actualización: {UPDATED}</p>

          <div className="mt-8 rounded-3xl bg-field p-6 leading-relaxed">
            <p className="font-semibold">En resumen</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-graphite">
              <li>Puedes usar el simulador sin crear cuenta.</li>
              <li>Si creas una cuenta, guardamos tu nombre, tu correo y tu progreso.</li>
              <li>No vendemos tus datos ni los usamos para publicidad.</li>
              <li>Los datos de tu tarjeta los maneja Wompi; nosotros nunca los vemos.</li>
              <li>Puedes pedir una copia de tus datos o que borremos tu cuenta escribiendo a {mailLink}.</li>
            </ul>
          </div>

          <div className="mt-12 space-y-10">
            <Section id="responsable" title="Quién es responsable">
              <p>
                {SITE.name} es una plataforma educativa, hecha en El Salvador, para aprender a reconocer intentos de
                phishing y otras estafas digitales. {SITE.name} es responsable de los datos personales que se describen en
                esta política.
              </p>
              <p>Para cualquier tema relacionado con tus datos personales, escríbenos a {mailLink}.</p>
            </Section>

            <Section id="datos" title="Qué datos recogemos">
              <p>Recogemos solo lo necesario para que el servicio funcione:</p>
              <ul className="space-y-3">
                <Item label="Datos de tu cuenta">
                  Tu nombre, tu correo electrónico y tu contraseña. La contraseña nunca se guarda tal cual: guardamos una
                  versión cifrada de forma irreversible (hash). También guardamos la fecha en que creaste la cuenta y la
                  de tu último inicio de sesión.
                </Item>
                <Item label="Tu progreso en el simulador">
                  Las rondas que completas: qué partes de cada mensaje marcaste, tu respuesta, el puntaje y el tiempo que
                  tardaste. Con esto calculamos tu nivel, tus habilidades y tus insignias.
                </Item>
                <Item label="Datos de pago">
                  Si compras el plan Pro, guardamos el plan, el monto, la fecha, el estado del pago y el número de
                  transacción que nos entrega Wompi. No recibimos ni guardamos el número, la fecha de vencimiento ni el
                  código de seguridad de tu tarjeta.
                </Item>
                <Item label="Datos de seguridad">
                  Cuando un inicio de sesión falla, guardamos el correo usado y la hora durante 15 minutos, para frenar
                  intentos de adivinar contraseñas. Si pides recuperar tu contraseña, guardamos una versión cifrada del
                  enlace que te enviamos y su fecha de vencimiento.
                </Item>
                <Item label="Estadísticas de uso">
                  Contamos cuántas visitas y cuántos inicios de sesión hay cada día, como un número total. Ese conteo no
                  guarda tu dirección IP, tu correo ni ningún dato que te identifique.
                </Item>
              </ul>
              <p>
                Los mensajes del simulador (bancos, empresas, personas, números y dominios) son ficticios. Nunca te
                pediremos contraseñas reales, datos bancarios ni documentos de identidad dentro del simulador.
              </p>
            </Section>

            <Section id="usos" title="Para qué los usamos">
              <ul className="list-disc space-y-2 pl-5">
                <li>Crear y mantener tu cuenta, y dejarte iniciar sesión.</li>
                <li>Guardar tu progreso y mostrarte tus estadísticas.</li>
                <li>Procesar la compra del plan Pro y activar tu acceso.</li>
                <li>
                  Enviarte correos necesarios para el servicio, como el enlace para recuperar tu contraseña. No enviamos
                  correos de publicidad.
                </li>
                <li>Proteger las cuentas y el sitio frente a accesos no autorizados y abusos.</li>
                <li>Saber, en números totales, cuánto se usa el sitio para mejorarlo.</li>
              </ul>
              <p>No vendemos, alquilamos ni cedemos tus datos personales a terceros con fines comerciales o publicitarios.</p>
            </Section>

            <Section id="navegador" title="Cookies y almacenamiento del navegador">
              <p>No usamos cookies de publicidad ni de rastreo, ni herramientas de analítica de terceros. Usamos:</p>
              <ul className="space-y-3">
                <Item label="Cookie de sesión (ciberlearn_session)">
                  Se crea cuando inicias sesión y sirve para mantenerte conectado. Es necesaria, no es accesible desde
                  JavaScript y dura hasta 30 días o hasta que cierres sesión.
                </Item>
                <Item label="Almacenamiento local del navegador">
                  Guardamos en tu propio navegador tu preferencia de tema (claro u oscuro), la fecha de tu última visita
                  (para contar una sola visita por día) y, si juegas sin cuenta, el resultado de tu ronda hasta que te
                  registres. Estos datos se quedan en tu dispositivo y puedes borrarlos desde la configuración de tu
                  navegador.
                </Item>
              </ul>
            </Section>

            <Section id="terceros" title="Con quién los compartimos">
              <p>
                Para funcionar usamos proveedores que tratan datos por cuenta nuestra y solo para prestarnos su servicio:
              </p>
              <ul className="space-y-3">
                <Item label="MongoDB Atlas">Aloja la base de datos donde se guardan las cuentas, el progreso y los pagos.</Item>
                <Item label="Wompi (El Salvador)">
                  Procesa los pagos con tarjeta. Cuando pagas, ingresas los datos de tu tarjeta directamente en la página
                  de Wompi, bajo sus propias condiciones y política de privacidad.
                </Item>
                <Item label="Mailjet">Envía los correos del servicio, como la recuperación de contraseña.</Item>
                <Item label="Proveedor de hosting">Aloja y sirve el sitio web.</Item>
              </ul>
              <p>
                Algunos de estos proveedores pueden almacenar o procesar datos en servidores fuera de El Salvador. También
                podríamos compartir datos si una autoridad competente lo exige conforme a la ley.
              </p>
            </Section>

            <Section id="conservacion" title="Cuánto tiempo los guardamos">
              <ul className="list-disc space-y-2 pl-5">
                <li>Datos de tu cuenta y progreso: mientras tu cuenta exista. Si pides borrarla, los eliminamos.</li>
                <li>Sesiones: hasta 30 días, o antes si cierras sesión.</li>
                <li>Intentos de inicio de sesión fallidos: 15 minutos.</li>
                <li>Enlaces de recuperación de contraseña: vencen en 1 hora y se borran de forma automática después.</li>
                <li>
                  Registros de pago: el tiempo que exijan las obligaciones contables y fiscales, aunque borres tu cuenta.
                </li>
              </ul>
            </Section>

            <Section id="seguridad" title="Cómo los protegemos">
              <p>
                Guardamos las contraseñas con un algoritmo de cifrado irreversible, la sesión viaja en una cookie que el
                navegador no deja leer a otros scripts, los enlaces de recuperación sirven una sola vez y limitamos los
                intentos de inicio de sesión. Ningún sistema es infalible, pero trabajamos para proteger tus datos y te
                avisaremos si ocurre un incidente que los afecte.
              </p>
            </Section>

            <Section id="derechos" title="Tus derechos">
              <p>Puedes pedirnos en cualquier momento:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Una copia de los datos personales que tenemos sobre ti.</li>
                <li>Que corrijamos datos incorrectos.</li>
                <li>Que borremos tu cuenta y tus datos.</li>
                <li>Que dejemos de usar tus datos para algún fin en particular.</li>
              </ul>
              <p>
                Escríbenos a {mailLink} desde el correo de tu cuenta. Te responderemos en un plazo máximo de 15 días
                hábiles. Si lo necesitamos para proteger tu cuenta, podemos pedirte que confirmes tu identidad.
              </p>
            </Section>

            <Section id="menores" title="Menores de edad">
              <p>
                {SITE.name} puede usarse en colegios y por estudiantes. Si eres menor de 18 años, crea tu cuenta con
                permiso de tu madre, padre o tutor. Si eres madre, padre o tutor y crees que un menor nos dio datos sin tu
                permiso, escríbenos a {mailLink} y los borraremos.
              </p>
            </Section>

            <Section id="cambios" title="Cambios a esta política">
              <p>
                Si cambiamos la forma en que tratamos tus datos, actualizaremos esta página y la fecha de “Última
                actualización”. Si el cambio es importante, te lo avisaremos por correo o dentro del sitio.
              </p>
              <p>
                ¿Dudas? Escríbenos a {mailLink}. También puedes volver al{" "}
                <Link href="/" className="font-medium text-brand underline-offset-2 hover:underline">
                  inicio
                </Link>
                .
              </p>
            </Section>
          </div>
        </article>
      </div>
    </PageShell>
  );
}
