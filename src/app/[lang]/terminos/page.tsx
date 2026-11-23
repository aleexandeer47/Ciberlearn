import type { Metadata } from "next";
import { A, LegalPage, MailLink, ProviderInfo, Section } from "@/components/legal/LegalPage";
import { LEGAL, RETRACT_DAYS } from "@/lib/legal";
import { AI_LIMITS } from "@/lib/ai/personas";
import { BUSINESS, FAMILY } from "@/lib/business";
import { PLANS } from "@/lib/plans";
import { getLang } from "@/lib/i18n-server";
import { SITE } from "@/lib/site";
import { TermsEn } from "./en";

export async function generateMetadata(): Promise<Metadata> {
  const en = (await getLang()) === "en";
  return {
    title: LEGAL.terminos.title[en ? "en" : "es"],
    description: en
      ? `The rules for using ${SITE.name}: accounts, Pro plan, payments, refunds and responsibilities.`
      : `Las reglas para usar ${SITE.name}: cuentas, plan Pro, pagos, reembolsos y responsabilidades.`,
  };
}

const SECTIONS = [
  { id: "proveedor", title: "Quiénes somos" },
  { id: "servicio", title: `Qué es ${SITE.name}` },
  { id: "cuenta", title: "Tu cuenta" },
  { id: "uso", title: "Uso permitido" },
  { id: "planes", title: "Plan gratis y plan Pro" },
  { id: "empresa", title: "Plan Empresa" },
  { id: "familia", title: "Pro Familiar y clases" },
  { id: "retracto", title: "Retracto y reembolsos" },
  { id: "ia", title: "Funciones con IA" },
  { id: "comunidad", title: "Retos y alertas de la comunidad" },
  { id: "propiedad", title: "Propiedad intelectual" },
  { id: "disponibilidad", title: "Disponibilidad y cambios" },
  { id: "responsabilidad", title: "Responsabilidad" },
  { id: "suspension", title: "Suspensión y cierre de cuentas" },
  { id: "cambios", title: "Cambios a estos términos" },
  { id: "ley", title: "Ley aplicable y reclamos" },
];

export default async function TerminosPage() {
  if ((await getLang()) === "en") return <TermsEn />;
  const m = PLANS["pro-mensual"];
  const y = PLANS["pro-anual"];
  return (
    <LegalPage
      doc="terminos"
      sections={SECTIONS}
      summary={
        <ul className="list-disc space-y-1 pl-5">
          <li>{SITE.name} es una plataforma para aprender a detectar estafas digitales con ejemplos ficticios.</li>
          <li>El plan Pro es un pago único, sin renovación automática.</li>
          <li>
            Tienes {RETRACT_DAYS} días desde tu compra para pedir la devolución completa, sin dar explicaciones.
          </li>
          <li>No uses el contenido para engañar a nadie.</li>
        </ul>
      }
    >
      <Section id="proveedor" title="Quiénes somos">
        <p>
          Estos términos regulan el uso del sitio {SITE.name} y la compra del plan Pro. El proveedor del servicio es:
        </p>
        <ProviderInfo />
        <p>
          Al crear una cuenta o comprar, marcas una casilla para aceptar estos términos, separada de la casilla de la{" "}
          <A href={LEGAL.privacidad.path}>Política de privacidad</A>. Guardamos un registro de esa aceptación con la
          fecha, la versión del documento y el formulario donde la diste.
        </p>
      </Section>

      <Section id="servicio" title={`Qué es ${SITE.name}`}>
        <p>
          {SITE.name} es un servicio educativo en línea, en español e inglés y disponible en todo el mundo, para aprender a
          reconocer phishing y otras estafas digitales, mediante un simulador, una ruta guiada de lecciones, un ranking y,
          para el plan Pro, ejercicios avanzados.
        </p>
        <p>
          Todos los mensajes, marcas, personas, números y enlaces que aparecen en los ejercicios son ficticios o se usan
          solo como ejemplo con fines educativos. {SITE.name} no es un servicio de seguridad, no revisa mensajes reales que
          recibas y no sustituye la asesoría de tu banco, de la policía ni de un profesional.
        </p>
        <p>
          El certificado de finalización del plan Pro es un reconocimiento interno de que completaste el entrenamiento; no
          es un título ni una certificación profesional acreditada.
        </p>
      </Section>

      <Section id="cuenta" title="Tu cuenta">
        <ul className="list-disc space-y-2 pl-5">
          <li>Puedes usar el simulador sin cuenta. Para guardar tu progreso, entrar a la ruta o comprar, necesitas una.</li>
          <li>Da un correo que sea tuyo y que puedas revisar: es la única forma de recuperar tu cuenta.</li>
          <li>
            Cuida tu contraseña. Eres responsable de lo que se haga con tu cuenta si compartes tu contraseña. Si crees que
            alguien entró a tu cuenta, cámbiala y escríbenos.
          </li>
          <li>
            Si eres menor de 18 años, necesitas el permiso de tu madre, padre o tutor para crear una cuenta y para comprar.
          </li>
          <li>La cuenta es personal: no la vendas ni la compartas.</li>
        </ul>
      </Section>

      <Section id="uso" title="Uso permitido">
        <p>Al usar {SITE.name} te comprometes a no:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Usar los mensajes, técnicas o materiales del sitio para engañar, estafar o hacer daño a otras personas.</li>
          <li>Intentar entrar a cuentas ajenas, a nuestros sistemas o a nuestras bases de datos.</li>
          <li>Hacer trampa en el ranking, automatizar respuestas o sobrecargar el sitio a propósito.</li>
          <li>Elegir un apodo ofensivo, que suplante a otra persona o que contenga datos personales.</li>
          <li>Copiar o revender el contenido del sitio sin permiso.</li>
        </ul>
        <p>Podemos cambiar apodos que incumplan estas reglas y quitar del ranking puntajes obtenidos con trampa.</p>
      </Section>

      <Section id="planes" title="Plan gratis y plan Pro">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            El plan gratis no tiene costo ni vence. Sus funciones se describen en la página de{" "}
            <A href="/planes">Planes</A>.
          </li>
          <li>
            El plan Pro cuesta US${m.price.toFixed(2)} por {m.days} días o US${y.price.toFixed(2)} por {y.days} días. El
            precio que ves al comprar es el total que se te cobra.
          </li>
          <li>
            Es un <strong className="text-chalk">pago único</strong>: no guardamos tu tarjeta y no hay cobros
            automáticos ni renovación. Si vuelves a pagar antes de que venza, los días se suman.
          </li>
          <li>
            El pago lo procesa Wompi con tarjeta de crédito o débito. Pro se activa en cuanto Wompi confirma el pago. Si
            te cobraron y Pro no se activó, escríbenos y lo resolvemos o te devolvemos el dinero.
          </li>
          <li>Las funciones marcadas como “próximamente” no están incluidas todavía en lo que pagas.</li>
        </ul>
      </Section>

      <Section id="empresa" title="Plan Empresa">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Quien compra el plan Empresa es el <strong className="text-chalk">encargado</strong> de su organización. Al
            comprar declara que puede contratar en nombre de ella. El encargado también ocupa un puesto.
          </li>
          <li>
            Cuesta US${BUSINESS.seatPrice} por persona al año, desde {BUSINESS.minSeats} personas, en un pago único sin
            renovación automática. Se pueden agregar puestos pagando la parte proporcional de los días que faltan.
          </li>
          <li>
            Cada persona se une con su propia cuenta desde el enlace de invitación y tiene Pro mientras el plan de la
            empresa esté vigente. Si sale de la empresa o el encargado la quita, conserva su cuenta y su progreso, pero pierde
            el Pro de la empresa.
          </li>
          <li>
            Al unirse, cada persona autoriza de forma expresa que el encargado vea su avance y le envíe simulacros. Esa
            autorización queda registrada.
          </li>
          <li>
            Los simulacros de phishing solo pueden enviarse a personas que se unieron al equipo y deben usarse únicamente
            para capacitar. El encargado no puede usarlos para sancionar a nadie de forma automática ni para obtener datos:
            los simulacros nunca piden contraseñas ni información.
          </li>
          <li>
            El encargado puede asignar un área a cada persona; eso abre las lecciones clave de esa área sin cambiar el resto
            de la ruta. El índice de preparación y el informe para gerencia son orientativos: resumen el avance en la
            plataforma, no certifican la seguridad de la empresa.
          </li>
          <li>
            El encargado debe tratar el avance de su equipo y los correos que le reporten como información confidencial y
            usarla solo para capacitación y seguridad.
          </li>
        </ul>
      </Section>

      <Section id="familia" title="Pro Familiar y clases">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Pro Familiar cuesta US${FAMILY.price} al año y cubre hasta {FAMILY.seats} personas, incluida quien lo compra. Es un
            pago único sin renovación automática. Cada persona se une con su propia cuenta desde el enlace de invitación y
            autoriza que quien administra el plan vea su avance.
          </li>
          <li>
            El modo colegio es gratis. El docente es responsable de usar el avance de sus estudiantes solo con fines
            educativos. Los estudiantes menores de edad deben unirse con permiso de su madre, padre o tutor.
          </li>
        </ul>
      </Section>

      <Section id="retracto" title="Retracto y reembolsos">
        <p>
          Conforme a la Ley de Protección al Consumidor, en las compras en línea tienes derecho de retracto: puedes
          cancelar tu compra dentro de los {RETRACT_DAYS} días siguientes, sin dar explicaciones, y te devolvemos el total.
          Cómo pedirlo, los plazos y los demás casos de devolución están en la{" "}
          <A href={LEGAL.reembolsos.path}>Política de reembolso</A>, que forma parte de estos términos.
        </p>
      </Section>

      <Section id="ia" title="Funciones con IA">
        <p>
          Los chats con IA y el revisor “¿Es estafa?” serán exclusivos del plan Pro y todavía no están disponibles. Cuando lo
          estén:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>En los chats, una inteligencia artificial hará el papel de un estafador ficticio para que practiques.</li>
          <li>
            “¿Es estafa?” dará una opinión orientativa sobre un mensaje que pegues. No es una garantía: si tienes dudas,
            confirma siempre por el canal oficial.
          </li>
          <li>Las respuestas las genera una máquina y pueden contener errores; no son consejos profesionales.</li>
          <li>No escribas datos reales (contraseñas, números de tarjeta, documentos, direcciones) en ellas.</li>
          <li>Habrá un límite de uso justo de {AI_LIMITS.proPerDay} usos por día.</li>
        </ul>
      </Section>

      <Section id="comunidad" title="Retos y alertas de la comunidad">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Los nombres que escribas en un reto y los reportes de estafas que envíes deben ser respetuosos y no pueden
            contener datos personales de otras personas (nombres, números de cuenta, documentos, direcciones).
          </li>
          <li>
            Al enviar un reporte nos autorizas a publicarlo sin tu nombre para alertar a otras personas, después de
            revisarlo. Podemos corregirlo para quitar datos personales, rechazarlo o retirarlo.
          </li>
          <li>
            Las alertas son aportes de la comunidad con fines de prevención: no son denuncias oficiales ni afirmamos quién
            está detrás de cada mensaje. Si fuiste víctima de una estafa, llama a tu banco y denuncia ante la policía de
            tu país.
          </li>
          <li>No uses los retos ni las alertas para enviar enlaces peligrosos, publicidad o mensajes ofensivos.</li>
        </ul>
      </Section>

      <Section id="propiedad" title="Propiedad intelectual">
        <p>
          Los textos, ejercicios, diseño, logotipo y código de {SITE.name} son de {SITE.name} o se usan con licencia. Puedes
          usarlos para aprender y compartir enlaces al sitio, pero no copiarlos ni publicarlos como propios. Los nombres de
          marcas que aparecen en los ejemplos pertenecen a sus dueños y se mencionan solo para enseñar a reconocer
          suplantaciones; no significan que esas empresas tengan relación con {SITE.name}.
        </p>
      </Section>

      <Section id="disponibilidad" title="Disponibilidad y cambios del servicio">
        <p>
          Trabajamos para que el sitio esté siempre disponible, pero puede haber interrupciones por mantenimiento o fallas
          de nuestros proveedores. Podemos mejorar, cambiar o quitar ejercicios y funciones. Si quitamos una función
          incluida en el plan Pro mientras lo tienes pagado, o si dejamos de ofrecer el servicio, te devolveremos la parte
          proporcional de los días que no pudiste usar.
        </p>
      </Section>

      <Section id="responsabilidad" title="Responsabilidad">
        <p>
          {SITE.name} te ayuda a reconocer estafas, pero ningún entrenamiento garantiza que nunca serás víctima de una.
          No somos responsables de las decisiones que tomes fuera del sitio ni de los daños que cause un tercero que te
          estafe. Respondemos por los daños que se deriven de nuestro propio incumplimiento, conforme a la ley.
        </p>
        <p>
          Nada de lo que dicen estos términos limita los derechos que te reconoce la Ley de Protección al Consumidor de El
          Salvador ni los derechos que, como consumidor, te dan las leyes de tu país de residencia y que no se pueden
          renunciar.
        </p>
      </Section>

      <Section id="suspension" title="Suspensión y cierre de cuentas">
        <p>
          Puedes cerrar tu cuenta cuando quieras escribiendo a <MailLink />. Podemos suspender o cerrar una cuenta que
          incumpla gravemente estos términos (por ejemplo, intentos de entrar a cuentas ajenas o usar el sitio para
          estafar). Si la cuenta tenía Pro vigente y la cerramos sin que hayas incumplido estos términos, te devolvemos los
          días no usados.
        </p>
      </Section>

      <Section id="cambios" title="Cambios a estos términos">
        <p>
          Si cambiamos estos términos, publicaremos la nueva versión aquí con su fecha. Si el cambio te afecta de forma
          importante, te avisaremos con anticipación. Los cambios no se aplican a un plan Pro que ya pagaste: se respetan
          las condiciones vigentes el día de tu compra.
        </p>
      </Section>

      <Section id="ley" title="Ley aplicable y reclamos">
        <p>
          Estos términos se rigen por las leyes de la República de El Salvador. Si tienes un problema, escríbenos primero a{" "}
          <MailLink /> y te responderemos en un plazo máximo de 15 días hábiles. Si no quedas conforme, puedes presentar
          tu reclamo ante la <A href="https://www.defensoria.gob.sv">Defensoría del Consumidor</A>.
        </p>
        <p>
          Si vives fuera de El Salvador, conservas los derechos que te dan las leyes de consumo de tu país y puedes acudir a
          la autoridad de protección al consumidor de tu país. Los precios están en dólares estadounidenses; tu banco puede
          aplicar una comisión o un tipo de cambio por la compra internacional.
        </p>
      </Section>
    </LegalPage>
  );
}
