import type { Metadata } from "next";
import { A, LegalPage, MailLink, ProviderInfo, Section } from "@/components/legal/LegalPage";
import { LEGAL, RETRACT_DAYS } from "@/lib/legal";
import { AI_LIMITS } from "@/lib/ai/personas";
import { PLANS } from "@/lib/plans";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: `Las reglas para usar ${SITE.name}: cuentas, plan Pro, pagos, reembolsos y responsabilidades.`,
};

const SECTIONS = [
  { id: "proveedor", title: "Quiénes somos" },
  { id: "servicio", title: "Qué es Ciberlearn" },
  { id: "cuenta", title: "Tu cuenta" },
  { id: "uso", title: "Uso permitido" },
  { id: "planes", title: "Plan gratis y plan Pro" },
  { id: "retracto", title: "Retracto y reembolsos" },
  { id: "ia", title: "Chats con IA" },
  { id: "propiedad", title: "Propiedad intelectual" },
  { id: "disponibilidad", title: "Disponibilidad y cambios" },
  { id: "responsabilidad", title: "Responsabilidad" },
  { id: "suspension", title: "Suspensión y cierre de cuentas" },
  { id: "cambios", title: "Cambios a estos términos" },
  { id: "ley", title: "Ley aplicable y reclamos" },
];

export default function TerminosPage() {
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

      <Section id="servicio" title="Qué es Ciberlearn">
        <p>
          {SITE.name} es un servicio educativo en línea para aprender a reconocer phishing y otras estafas digitales,
          mediante un simulador, una ruta guiada de lecciones, un ranking y, para el plan Pro, ejercicios avanzados.
        </p>
        <p>
          Todos los mensajes, marcas, personas, números y enlaces que aparecen en los ejercicios son ficticios o se usan
          solo como ejemplo con fines educativos. {SITE.name} no es un servicio de seguridad, no revisa mensajes reales que
          recibas y no sustituye la asesoría de tu banco, de la Policía Nacional Civil ni de un profesional.
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

      <Section id="retracto" title="Retracto y reembolsos">
        <p>
          Conforme a la Ley de Protección al Consumidor, en las compras en línea tienes derecho de retracto: puedes
          cancelar tu compra dentro de los {RETRACT_DAYS} días siguientes, sin dar explicaciones, y te devolvemos el total.
          Cómo pedirlo, los plazos y los demás casos de devolución están en la{" "}
          <A href={LEGAL.reembolsos.path}>Política de reembolso</A>, que forma parte de estos términos.
        </p>
      </Section>

      <Section id="ia" title="Chats con IA">
        <p>
          Los chats con IA serán exclusivos del plan Pro y todavía no están disponibles. Cuando lo estén:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Una inteligencia artificial hará el papel de un estafador ficticio para que practiques.</li>
          <li>Las respuestas las genera una máquina y pueden contener errores; no son consejos profesionales.</li>
          <li>No escribas datos reales (contraseñas, números de tarjeta, DUI, direcciones) en esos chats.</li>
          <li>Habrá un límite de uso justo de {AI_LIMITS.proPerDay} conversaciones por día.</li>
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
          Salvador.
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
      </Section>
    </LegalPage>
  );
}
