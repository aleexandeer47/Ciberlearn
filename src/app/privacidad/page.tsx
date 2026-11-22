import type { Metadata } from "next";
import { A, Item, LegalPage, MailLink, Section } from "@/components/legal/LegalPage";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Qué datos recoge ${SITE.name}, para qué los usa, con quién los comparte y cómo ejercer tus derechos.`,
};

/*
 * Cada dato, cookie y proveedor que se menciona aquí corresponde a lo que hace el código:
 *  - users / sessions / runs / orders / consents / login_attempts / password_resets / daily_stats /
 *    lesson_attempts / xp_events / ai_chats / orgs / phish_campaigns / phish_targets /
 *    challenges / challenge_plays / daily_answers / scam_reports (MongoDB)
 *  - cookie "ciberlearn_session" y claves de localStorage/sessionStorage del navegador (ver /cookies)
 *  - proveedores: MongoDB Atlas, Wompi, Mailjet, Anthropic y Vercel
 * Si cambia el sistema (nuevos datos, analítica, proveedores), actualiza esta página y su versión en src/lib/legal.ts.
 */

const SECTIONS = [
  { id: "responsable", title: "Quién es responsable" },
  { id: "datos", title: "Qué datos recogemos" },
  { id: "usos", title: "Para qué los usamos" },
  { id: "base", title: "Tu consentimiento" },
  { id: "empresa", title: "Si te unes a una empresa" },
  { id: "navegador", title: "Cookies" },
  { id: "terceros", title: "Con quién los compartimos" },
  { id: "conservacion", title: "Cuánto tiempo los guardamos" },
  { id: "seguridad", title: "Cómo los protegemos" },
  { id: "derechos", title: "Tus derechos" },
  { id: "menores", title: "Menores de edad" },
  { id: "cambios", title: "Cambios a esta política" },
];

export default function PrivacidadPage() {
  return (
    <LegalPage
      doc="privacidad"
      sections={SECTIONS}
      summary={
        <ul className="list-disc space-y-1 pl-5">
          <li>Puedes usar el simulador sin crear cuenta.</li>
          <li>Para una cuenta solo pedimos tu nombre, tu correo y una contraseña.</li>
          <li>No vendemos tus datos ni los usamos para publicidad.</li>
          <li>Los datos de tu tarjeta los maneja Wompi; nosotros nunca los vemos.</li>
          <li>
            Puedes pedir una copia de tus datos, corregirlos o borrar tu cuenta escribiendo a <MailLink />.
          </li>
        </ul>
      }
    >
      <Section id="responsable" title="Quién es responsable">
        <p>
          {SITE.name} es una plataforma educativa, hecha en El Salvador, para aprender a reconocer intentos de phishing y
          otras estafas digitales. {SITE.name} es responsable del tratamiento de los datos personales que se describen en
          esta política, conforme a la Ley para la Protección de Datos Personales de El Salvador (Decreto Legislativo
          n.º 144 de 2024). Los datos de identificación del responsable están en los{" "}
          <A href={`${LEGAL.terminos.path}#proveedor`}>Términos y condiciones</A>.
        </p>
        <p>
          Para cualquier tema relacionado con tus datos personales, escríbenos a <MailLink />.
        </p>
      </Section>

      <Section id="datos" title="Qué datos recogemos">
        <p>Recogemos solo lo necesario para que el servicio funcione. No pedimos DUI, teléfono, dirección ni fecha de nacimiento.</p>
        <ul className="space-y-3">
          <Item label="Datos de tu cuenta">
            Tu nombre (para saludarte y para tu certificado), tu correo electrónico (para iniciar sesión y recuperar tu
            contraseña) y tu contraseña. La contraseña nunca se guarda tal cual: guardamos una versión cifrada de forma
            irreversible (hash). También guardamos la fecha en que creaste la cuenta y la de tu último inicio de sesión.
          </Item>
          <Item label="Registro de tus aceptaciones">
            Cuando aceptas los Términos y condiciones y esta Política de privacidad (al crear tu cuenta o al comprar),
            guardamos qué documento y qué versión aceptaste, el texto exacto de la casilla, la fecha y hora, el formulario
            donde lo hiciste, la dirección IP y el tipo de navegador. Sirve para demostrar que diste tu consentimiento y
            cuándo.
          </Item>
          <Item label="Tu progreso">
            Las rondas del simulador que completas (qué partes de cada mensaje marcaste, tu respuesta, el puntaje y el
            tiempo), las lecciones de la ruta, tus vidas y tu XP. Con esto calculamos tu nivel, tus habilidades y tus
            insignias.
          </Item>
          <Item label="Estafa del día y retos">
            Tu respuesta diaria y tu racha de días seguidos. Si creas un reto, guardamos los mensajes que te tocaron, tu
            puntaje y tu apodo, que verá quien reciba el enlace. Si juegas un reto ajeno, guardamos tu puntaje y el nombre que
            escribas para la tabla del reto (puedes usar un apodo o dejarlo vacío); lo verá cualquiera con el enlace.
          </Item>
          <Item label="Tarjeta de logro y certificado (opcionales)">
            Si decides compartir tu tarjeta de logro, creamos un enlace público que muestra tu apodo, nivel, XP, lecciones y
            racha; nunca tu nombre ni tu correo, y puedes dejar de compartirla cuando quieras. Si tienes el certificado Pro,
            quien tenga su código puede verificarlo y verá tu nombre, tu puntaje y la fecha.
          </Item>
          <Item label="Reportes de estafas">
            Si reportas una estafa, guardamos el canal, el remitente y el texto que pegues. Lo revisamos antes de publicarlo,
            podemos corregirlo para quitar datos personales y nunca mostramos quién lo envió. Guardamos tu cuenta junto al
            reporte para limitar abusos y para contar los “a mí también me llegó”.
          </Item>
          <Item label="Ranking (opcional)">
            Un apodo y un país, si decides ponerlos. En el ranking público solo se muestran tu apodo, tu país y tu XP;
            nunca tu nombre ni tu correo. Puedes ocultarte del ranking cuando quieras.
          </Item>
          <Item label="Datos de pago">
            Si compras el plan Pro, guardamos el plan, el monto, la fecha, el estado del pago y el número de transacción
            que nos entrega Wompi. No recibimos ni guardamos el número, la fecha de vencimiento ni el código de seguridad
            de tu tarjeta.
          </Item>
          <Item label="Chats con IA (plan Pro)">
            Cuando esta función esté disponible, guardaremos los mensajes que escribas en esas conversaciones y su
            resultado. Esos mensajes se envían a nuestro proveedor de inteligencia artificial para generar las respuestas.
            Es un ejercicio: no escribas datos reales en esos chats.
          </Item>
          <Item label="Datos de seguridad">
            Cuando un inicio de sesión falla, guardamos el correo usado y la hora durante 15 minutos, para frenar intentos
            de adivinar contraseñas. Si pides recuperar tu contraseña, guardamos una versión cifrada del enlace que te
            enviamos y su fecha de vencimiento.
          </Item>
          <Item label="Estadísticas de uso">
            Contamos cuántas visitas y cuántos inicios de sesión hay cada día, como un número total. Ese conteo no guarda
            tu dirección IP, tu correo ni ningún dato que te identifique.
          </Item>
        </ul>
        <p>
          No tratamos datos sensibles (salud, creencias, origen étnico, datos biométricos y similares). Los mensajes del
          simulador (bancos, empresas, personas, números y dominios) son ficticios. Nunca te pediremos contraseñas
          reales, datos bancarios ni documentos de identidad dentro de los ejercicios.
        </p>
      </Section>

      <Section id="usos" title="Para qué los usamos">
        <ul className="list-disc space-y-2 pl-5">
          <li>Crear y mantener tu cuenta, y dejarte iniciar sesión.</li>
          <li>Guardar tu progreso, mostrarte tus estadísticas y, si lo eliges, mostrarte en el ranking.</li>
          <li>Procesar la compra del plan Pro, activar tu acceso y atender reembolsos.</li>
          <li>
            Enviarte correos necesarios para el servicio, como el enlace para recuperar tu contraseña. No enviamos correos
            de publicidad.
          </li>
          <li>Proteger las cuentas y el sitio frente a accesos no autorizados y abusos.</li>
          <li>Demostrar que aceptaste nuestros términos y esta política.</li>
          <li>Saber, en números totales, cuánto se usa el sitio para mejorarlo.</li>
        </ul>
        <p>
          No usamos tus datos para otros fines, no tomamos decisiones automatizadas que te afecten legalmente y no
          vendemos, alquilamos ni cedemos tus datos personales a terceros con fines comerciales o publicitarios.
        </p>
      </Section>

      <Section id="base" title="Tu consentimiento">
        <p>
          Tratamos tus datos con tu consentimiento libre, expreso e informado, que das al marcar la casilla de esta
          política al crear tu cuenta o al comprar. La casilla de esta política está separada de la de los Términos y
          condiciones, y ninguna viene marcada de antemano.
        </p>
        <p>
          Puedes retirar tu consentimiento cuando quieras escribiendo a <MailLink />. Como sin estos datos no podemos
          mantener tu cuenta, retirarlo implica cerrarla y borrar tus datos, salvo los que la ley nos obligue a conservar
          (por ejemplo, los registros de pago).
        </p>
      </Section>

      <Section id="empresa" title="Si te unes a una empresa">
        <p>
          Con el plan Empresa, una organización paga Pro para su equipo. Si te unes a una desde su enlace de invitación, te
          pedimos una autorización aparte, que queda registrada con la fecha, para que:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            El encargado de esa empresa vea tu nombre, tu correo, las lecciones que completaste, tu XP, tus rondas y tu
            puntaje promedio en el simulador, la señal que más se te escapa, cuándo entraste por última vez y los resultados
            de los simulacros.
          </li>
          <li>
            La empresa te envíe simulacros de phishing: correos de práctica que imitan una estafa. Guardamos a quién se
            envió cada uno, cuándo y si abriste su enlace. Esos correos nunca piden datos.
          </li>
        </ul>
        <p>
          La empresa no ve tu contraseña, tus pagos personales, tus conversaciones con la IA ni el registro de tus
          aceptaciones. Puedes salir de la empresa cuando quieras desde la página Empresa; desde ese momento deja de ver tu
          avance. Si quieres que también se borren los resultados de simulacros anteriores, escríbenos a <MailLink />.
        </p>
      </Section>

      <Section id="navegador" title="Cookies">
        <p>
          Solo usamos una cookie necesaria para mantener tu sesión y algunos datos que se quedan en tu propio navegador. No
          usamos cookies de publicidad, de rastreo ni analítica de terceros. El detalle está en la{" "}
          <A href={LEGAL.cookies.path}>Política de cookies</A>.
        </p>
      </Section>

      <Section id="terceros" title="Con quién los compartimos">
        <p>
          Si te unes a una empresa, su encargado recibe los datos de tu avance que se describen en{" "}
          <A href="#empresa">Si te unes a una empresa</A>, porque tú lo autorizas. Además, para funcionar usamos
          proveedores que tratan datos por cuenta nuestra y solo para prestarnos su servicio:
        </p>
        <ul className="space-y-3">
          <Item label="MongoDB Atlas">Aloja la base de datos donde se guardan las cuentas, el progreso y los pagos.</Item>
          <Item label="Vercel">Aloja y sirve el sitio web.</Item>
          <Item label="Wompi (El Salvador)">
            Procesa los pagos con tarjeta. Cuando pagas, ingresas los datos de tu tarjeta directamente en la página de
            Wompi, bajo sus propias condiciones y política de privacidad.
          </Item>
          <Item label="Mailjet">Envía los correos del servicio, como la recuperación de contraseña.</Item>
          <Item label="Anthropic">
            Generará las respuestas de los chats de práctica con IA cuando estén disponibles. Recibe los mensajes de esas
            conversaciones y nada más.
          </Item>
        </ul>
        <p>
          Algunos de estos proveedores almacenan o procesan datos en servidores fuera de El Salvador (por ejemplo, en
          Estados Unidos). Al aceptar esta política autorizas esa transferencia, que se limita a lo necesario para prestar
          el servicio. También podríamos compartir datos si una autoridad competente lo exige conforme a la ley.
        </p>
      </Section>

      <Section id="conservacion" title="Cuánto tiempo los guardamos">
        <ul className="list-disc space-y-2 pl-5">
          <li>Datos de tu cuenta y progreso: mientras tu cuenta exista. Si pides borrarla, los eliminamos.</li>
          <li>
            Registro de tus aceptaciones: mientras tu cuenta exista y, si hiciste una compra, el mismo tiempo que el
            registro de ese pago.
          </li>
          <li>
            Resultados de simulacros de tu empresa: mientras la empresa tenga su cuenta, o hasta que pidas borrarlos.
          </li>
          <li>Retos y sus partidas: se borran de forma automática a los 90 días.</li>
          <li>Respuestas de la estafa del día: 180 días (la racha se queda en tu cuenta).</li>
          <li>Reportes de estafas: los publicados, mientras sigan siendo útiles para alertar; los rechazados, hasta 90 días.</li>
          <li>Sesiones: hasta 30 días, o antes si cierras sesión.</li>
          <li>Conversaciones de los chats con IA: se borran de forma automática a los 30 días.</li>
          <li>Registro detallado de XP para el ranking semanal: 60 días (tu XP total se queda en tu cuenta).</li>
          <li>Intentos de inicio de sesión fallidos: 15 minutos.</li>
          <li>Enlaces de recuperación de contraseña: vencen en 1 hora y se borran de forma automática después.</li>
          <li>Registros de pago: el tiempo que exijan las obligaciones contables y fiscales, aunque borres tu cuenta.</li>
        </ul>
      </Section>

      <Section id="seguridad" title="Cómo los protegemos">
        <p>
          Guardamos las contraseñas con un algoritmo de cifrado irreversible, el sitio funciona solo por conexión cifrada
          (HTTPS), la sesión viaja en una cookie que el navegador no deja leer a otros scripts, los enlaces de
          recuperación sirven una sola vez y limitamos los intentos de inicio de sesión. Ningún sistema es infalible, pero
          trabajamos para proteger tus datos y, si ocurre un incidente que los afecte, te avisaremos y lo informaremos a
          las autoridades como indique la ley.
        </p>
      </Section>

      <Section id="derechos" title="Tus derechos">
        <p>La Ley para la Protección de Datos Personales te da derecho a:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-chalk">Acceso:</strong> saber qué datos tenemos sobre ti y recibir una copia.
          </li>
          <li>
            <strong className="text-chalk">Rectificación:</strong> corregir datos incorrectos o incompletos.
          </li>
          <li>
            <strong className="text-chalk">Cancelación:</strong> que borremos tu cuenta y tus datos.
          </li>
          <li>
            <strong className="text-chalk">Oposición:</strong> que dejemos de usar tus datos para algún fin en particular.
          </li>
          <li>
            <strong className="text-chalk">Portabilidad:</strong> recibir tus datos en un formato que puedas llevar a otro
            servicio.
          </li>
          <li>Retirar tu consentimiento en cualquier momento.</li>
        </ul>
        <p>
          Escríbenos a <MailLink /> desde el correo de tu cuenta, diciendo qué derecho quieres ejercer. Es gratis. Te
          responderemos en un plazo máximo de 15 días hábiles. Si lo necesitamos para proteger tu cuenta, podemos pedirte
          que confirmes tu identidad. Si no quedas conforme con nuestra respuesta, puedes acudir a la autoridad de
          protección de datos que establece la ley.
        </p>
      </Section>

      <Section id="menores" title="Menores de edad">
        <p>
          {SITE.name} puede usarse en colegios y por estudiantes. Si eres menor de 18 años, necesitas el permiso de tu
          madre, padre o tutor para crear una cuenta y para comprar. Si eres madre, padre o tutor y crees que un menor nos
          dio datos sin tu permiso, escríbenos a <MailLink /> y los borraremos.
        </p>
      </Section>

      <Section id="cambios" title="Cambios a esta política">
        <p>
          Si cambiamos la forma en que tratamos tus datos, actualizaremos esta página, su fecha y su número de versión. Si
          el cambio es importante, te lo avisaremos por correo o dentro del sitio y, cuando la ley lo exija, te pediremos
          que lo aceptes de nuevo.
        </p>
      </Section>
    </LegalPage>
  );
}
