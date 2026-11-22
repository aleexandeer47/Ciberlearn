import type { Metadata } from "next";
import { A, Item, LegalPage, MailLink, Section } from "@/components/legal/LegalPage";
import { LEGAL, REFUND_DAYS, RETRACT_DAYS } from "@/lib/legal";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de reembolso",
  description: `Cuándo y cómo pedir la devolución de tu pago del plan Pro de ${SITE.name}.`,
};

const SECTIONS = [
  { id: "retracto", title: "Derecho de retracto" },
  { id: "otros", title: "Otros casos con devolución" },
  { id: "sin-reembolso", title: "Cuándo no hay reembolso" },
  { id: "como", title: "Cómo pedirlo" },
  { id: "plazos", title: "Plazos y forma de devolución" },
  { id: "reclamos", title: "Si no estás conforme" },
];

export default function ReembolsosPage() {
  return (
    <LegalPage
      doc="reembolsos"
      sections={SECTIONS}
      summary={
        <ul className="list-disc space-y-1 pl-5">
          <li>
            Tienes <strong className="text-chalk">{RETRACT_DAYS} días</strong> desde tu compra para pedir el reembolso
            completo, sin dar explicaciones.
          </li>
          <li>Si te cobramos de más o Pro no se activó, te devolvemos el dinero en cualquier momento.</li>
          <li>
            Te devolvemos el dinero a la misma tarjeta en un máximo de {REFUND_DAYS} días desde que nos escribes.
          </li>
        </ul>
      }
    >
      <Section id="retracto" title="Derecho de retracto">
        <p>
          El plan Pro se compra en línea, así que la Ley de Protección al Consumidor te da derecho de retracto: puedes
          cancelar tu compra dentro de los <strong className="text-chalk">{RETRACT_DAYS} días</strong> siguientes a la
          fecha de pago, sin decir por qué y sin ningún costo.
        </p>
        <p>
          Te devolvemos el 100&nbsp;% de lo que pagaste, aunque ya hayas usado las funciones Pro durante esos días. Al
          hacerlo, tu cuenta vuelve al plan gratis; tu progreso no se borra.
        </p>
        <p>
          Si extendiste Pro con una segunda compra, cada pago tiene sus propios {RETRACT_DAYS} días de retracto.
        </p>
        <p>
          Lo mismo aplica a Pro Familiar y al plan Empresa: quien compra tiene {RETRACT_DAYS} días desde cada pago (la compra del año o la de
          puestos adicionales) para pedir la devolución completa. Al devolverlo se quita lo que compró ese pago: el año del
          plan o los puestos agregados.
        </p>
      </Section>

      <Section id="otros" title="Otros casos con devolución">
        <p>Además del retracto, te devolvemos el dinero en cualquier momento si:</p>
        <ul className="space-y-3">
          <Item label="Cobro duplicado o equivocado">
            Te cobramos dos veces el mismo plan o un monto distinto del que aparecía al comprar.
          </Item>
          <Item label="Pagaste y Pro no se activó">
            Si no logramos activarlo, te devolvemos el pago completo.
          </Item>
          <Item label="Dejamos de dar el servicio">
            Si cerramos {SITE.name}, quitamos una función incluida en Pro mientras lo tenías pagado o cerramos tu cuenta sin
            que hayas incumplido los términos, te devolvemos la parte proporcional de los días que no pudiste usar.
          </Item>
        </ul>
      </Section>

      <Section id="sin-reembolso" title="Cuándo no hay reembolso">
        <p>
          Pasados los {RETRACT_DAYS} días del retracto, y fuera de los casos anteriores, no devolvemos la parte del periodo
          que no hayas usado. Como el plan Pro no se renueva solo, nunca te cobraremos un periodo que no hayas comprado.
        </p>
        <p>
          Tampoco hay reembolso si cerramos tu cuenta por un incumplimiento grave de los{" "}
          <A href={LEGAL.terminos.path}>Términos y condiciones</A>, como usar el sitio para estafar o entrar a cuentas
          ajenas.
        </p>
      </Section>

      <Section id="como" title="Cómo pedirlo">
        <p>
          Escríbenos a <MailLink /> desde el correo de tu cuenta, con el asunto “Reembolso”. Incluye, si la tienes, la
          referencia del pago (aparece en la página que se muestra al terminar de pagar y empieza con “anz_”). No hace falta
          llenar ningún formulario ni explicar el motivo.
        </p>
        <p>Te confirmaremos por correo que recibimos tu solicitud.</p>
      </Section>

      <Section id="plazos" title="Plazos y forma de devolución">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Hacemos la devolución en un máximo de {REFUND_DAYS} días desde que recibimos tu solicitud, a la misma tarjeta
            con la que pagaste, por medio de Wompi.
          </li>
          <li>
            Después, tu banco puede tardar unos días más en mostrar el dinero en tu estado de cuenta; ese plazo depende del
            banco.
          </li>
          <li>Te devolvemos el monto completo, sin descontar comisiones.</li>
        </ul>
      </Section>

      <Section id="reclamos" title="Si no estás conforme">
        <p>
          Si no respondemos o no estás de acuerdo con la respuesta, puedes acudir a la{" "}
          <A href="https://www.defensoria.gob.sv">Defensoría del Consumidor</A>. También puedes pedir a tu banco la
          reversión del pago, como lo permite la Ley de Protección al Consumidor para las compras en línea.
        </p>
      </Section>
    </LegalPage>
  );
}
