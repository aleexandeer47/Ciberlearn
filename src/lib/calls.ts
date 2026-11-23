/*
 * Llamadas simuladas (vishing): el “estafador” habla con la voz del navegador y la persona
 * elige qué responder. Colgar siempre está disponible y siempre es una buena respuesta.
 * Todos los nombres, bancos y números son ficticios. Gratis: la llamada del día. Pro: todas.
 */

import type { Lang } from "./i18n";

type L = Record<Lang, string>;
export type CallEnd = "fell" | "safe";

export interface CallChoice {
  label: L;
  /** Siguiente paso, o cómo termina la llamada */
  next: string | CallEnd;
  /** Comentario cuando esta elección termina la llamada */
  note?: L;
}

export interface CallStep {
  say: L;
  choices: CallChoice[];
}

export interface CallScenario {
  id: string;
  title: L;
  caller: L;
  number: string;
  /** Qué se aprende (se muestra al final) */
  lesson: L;
  steps: Record<string, CallStep>;
}

const l = (es: string, en: string): L => ({ es, en });

export const CALLS: CallScenario[] = [
  {
    id: "fraudes-banco",
    title: l("“Departamento de fraudes” del banco", "The bank's “fraud department”"),
    caller: l("Banco Izalco · Fraudes", "Izalco Bank · Fraud"),
    number: "2200-1234",
    lesson: l(
      "El número que aparece se puede falsificar. El banco nunca te pide códigos, PIN ni la clave: cuelga y llama tú al número de tu tarjeta.",
      "The number on screen can be faked. Your bank never asks for codes, PINs or passwords: hang up and call the number on your card yourself.",
    ),
    steps: {
      start: {
        say: l(
          "Buenas tardes, le habla Andrea, del departamento de fraudes de Banco Izalco. Detectamos una compra de 849 dólares en una tienda de electrónica con su tarjeta. ¿Usted la hizo?",
          "Good afternoon, this is Andrea from the Izalco Bank fraud department. We detected an 849-dollar purchase at an electronics store on your card. Did you make it?",
        ),
        choices: [
          { label: l("No, yo no la hice", "No, I didn't make it"), next: "otp" },
          { label: l("¿Cómo sé que es del banco?", "How do I know you're from the bank?"), next: "proof" },
          {
            label: l("Cuelgo y llamo al número de mi tarjeta", "I hang up and call the number on my card"),
            next: "safe",
            note: l("Perfecto: así hablas con el banco de verdad.", "Perfect: that way you talk to your real bank."),
          },
        ],
      },
      proof: {
        say: l(
          "Lo entiendo, es por su seguridad. Mire el número de la llamada: es el número oficial del banco. Además le confirmo que su tarjeta termina en 4821.",
          "I understand, it's for your safety. Look at the number calling you: it's the bank's official number. I can also confirm your card ends in 4821.",
        ),
        choices: [
          { label: l("Ah, entonces sí es el banco", "Oh, so it really is the bank"), next: "otp" },
          {
            label: l("El número se puede falsificar. Cuelgo.", "Numbers can be faked. I'm hanging up."),
            next: "safe",
            note: l("Exacto: el número y los últimos dígitos se consiguen fácil.", "Exactly: caller ID and the last digits are easy to get."),
          },
        ],
      },
      otp: {
        say: l(
          "Para bloquear la compra le acabo de enviar un código de seis dígitos por mensaje. Léamelo, por favor, para confirmar que es usted. Rápido, la compra se está procesando.",
          "To block the purchase I just sent you a six-digit code by text. Please read it to me to confirm it's you. Quickly, the purchase is going through.",
        ),
        choices: [
          {
            label: l("Le leo el código", "I read her the code"),
            next: "fell",
            note: l("Ese código autorizaba una operación con tu cuenta: con él te vacían la tarjeta.", "That code authorized a transaction on your account: with it they drain your card."),
          },
          {
            label: l("El banco nunca pide códigos. Cuelgo.", "Banks never ask for codes. I'm hanging up."),
            next: "safe",
            note: l("Muy bien: la prisa era la trampa.", "Well done: the rush was the trap."),
          },
        ],
      },
    },
  },
  {
    id: "nieto",
    title: l("Tu nieto en problemas", "Your grandson in trouble"),
    caller: l("Número desconocido", "Unknown number"),
    number: "+1 (713) 555-0144",
    lesson: l(
      "Las voces se pueden imitar con inteligencia artificial. Antes de mandar dinero, cuelga y llama al número de siempre de tu familiar, o usa una palabra clave familiar.",
      "Voices can be cloned with AI. Before sending money, hang up and call your relative's usual number, or use a family code word.",
    ),
    steps: {
      start: {
        say: l(
          "¡Abuela! Soy yo… tuve un accidente con el carro y estoy en la estación de policía. Por favor no le digas a mi mamá, me va a matar.",
          "Grandma! It's me… I had a car accident and I'm at the police station. Please don't tell mom, she'll kill me.",
        ),
        choices: [
          { label: l("¡Ay, mijo! ¿Qué necesitas?", "Oh honey! What do you need?"), next: "money" },
          { label: l("¿Quién habla? Dime tu nombre", "Who is this? Tell me your name"), next: "name" },
          {
            label: l("Cuelgo y llamo a su número de siempre", "I hang up and call his usual number"),
            next: "safe",
            note: l("Lo mejor: en un minuto sabrás si de verdad le pasó algo.", "The best move: in a minute you'll know if something really happened."),
          },
        ],
      },
      name: {
        say: l(
          "¡Abuela, soy tu nieto, el mayor! No me reconoces por la llamada, me golpeé la cara. Necesito ayuda ya.",
          "Grandma, it's your grandson, the oldest! You don't recognize me because of the call, I hurt my face. I need help now.",
        ),
        choices: [
          { label: l("Ay, perdón, ¿qué necesitas?", "Oh, sorry, what do you need?"), next: "money" },
          {
            label: l("Te pregunto nuestra palabra clave", "I ask for our family code word"),
            next: "safe",
            note: l("Un impostor no la sabe. Por eso conviene acordarla en familia.", "An impostor won't know it. That's why families should agree on one."),
          },
        ],
      },
      money: {
        say: l(
          "Te paso al abogado. Dice que con 1,500 dólares me sueltan hoy. Tiene que ser por transferencia o tarjetas de regalo, y por favor que nadie se entere.",
          "I'll put the lawyer on. He says with 1,500 dollars they'll let me go today. It has to be a transfer or gift cards, and please don't let anyone know.",
        ),
        choices: [
          {
            label: l("Voy a mandar el dinero", "I'll send the money"),
            next: "fell",
            note: l("Dinero urgente, secreto y tarjetas de regalo: es la estafa del familiar en apuros.", "Urgent money, secrecy and gift cards: it's the relative-in-trouble scam."),
          },
          {
            label: l("Primero llamo a su mamá", "First I'll call his mom"),
            next: "safe",
            note: l("Romper el secreto desarma la estafa.", "Breaking the secrecy defuses the scam."),
          },
        ],
      },
    },
  },
  {
    id: "soporte-tecnico",
    title: l("Soporte técnico que te llama", "Tech support calling you"),
    caller: l("Soporte técnico", "Tech Support"),
    number: "+1 (800) 555-0199",
    lesson: l(
      "Ninguna empresa te llama para avisar de un virus. Nunca instales programas de acceso remoto porque alguien te lo pide por teléfono.",
      "No company calls you to warn you about a virus. Never install remote-access software because someone on the phone asks you to.",
    ),
    steps: {
      start: {
        say: l(
          "Hola, le llamamos del soporte técnico de su computadora. Detectamos que su equipo está enviando virus y sus cuentas bancarias están en riesgo.",
          "Hello, we're calling from your computer's technical support. We detected that your computer is sending viruses and your bank accounts are at risk.",
        ),
        choices: [
          { label: l("¿Y qué hago?", "So what do I do?"), next: "install" },
          {
            label: l("Nadie me llama por un virus. Cuelgo.", "Nobody calls about a virus. I'm hanging up."),
            next: "safe",
            note: l("Correcto: es una de las estafas más comunes.", "Right: it's one of the most common scams."),
          },
        ],
      },
      install: {
        say: l(
          "Instale el programa que le voy a dictar para que podamos revisar su equipo a distancia. Después entre a su banca en línea para comprobar que todo esté bien.",
          "Install the program I'm going to spell out so we can check your computer remotely. Then log in to your online banking so we can make sure everything's fine.",
        ),
        choices: [
          {
            label: l("Lo instalo y entro a mi banco", "I install it and log in to my bank"),
            next: "fell",
            note: l("Con acceso remoto ven y controlan tu pantalla: así vacían cuentas.", "With remote access they see and control your screen: that's how accounts get emptied."),
          },
          {
            label: l("No instalo nada. Cuelgo.", "I won't install anything. Hanging up."),
            next: "safe",
            note: l("Muy bien. Si te preocupa tu equipo, llévalo a alguien de confianza.", "Well done. If you're worried about your computer, take it to someone you trust."),
          },
        ],
      },
    },
  },
  {
    id: "impuestos",
    title: l("Deuda con la agencia de impuestos", "A debt with the tax agency"),
    caller: l("Agencia Tributaria", "Revenue Agency"),
    number: "2244-0000",
    lesson: l(
      "El gobierno no te amenaza con arrestarte por teléfono ni cobra con tarjetas de regalo. Consulta cualquier deuda en el portal oficial.",
      "The government doesn't threaten to arrest you over the phone or collect with gift cards. Check any debt on the official portal.",
    ),
    steps: {
      start: {
        say: l(
          "Le habla el inspector Ramírez, de la Agencia Tributaria. Usted tiene una deuda de 2,300 dólares. Si no paga hoy, se emitirá una orden de captura.",
          "This is Inspector Ramirez from the Revenue Agency. You owe 2,300 dollars. If you don't pay today, an arrest warrant will be issued.",
        ),
        choices: [
          { label: l("¿Cómo pago?", "How do I pay?"), next: "pay" },
          {
            label: l("Lo reviso en el portal oficial. Cuelgo.", "I'll check on the official portal. Hanging up."),
            next: "safe",
            note: l("Perfecto: las deudas reales se ven en el portal oficial.", "Perfect: real debts show up on the official portal."),
          },
        ],
      },
      pay: {
        say: l(
          "Para evitar la captura, compre tarjetas de regalo por ese monto y díctenos los códigos. No cuelgue, me quedo en línea mientras va a la tienda.",
          "To avoid arrest, buy gift cards for that amount and read us the codes. Don't hang up, I'll stay on the line while you go to the store.",
        ),
        choices: [
          {
            label: l("Voy a la tienda", "I'll go to the store"),
            next: "fell",
            note: l("Ninguna institución cobra con tarjetas de regalo. Es estafa siempre.", "No institution collects with gift cards. It's always a scam."),
          },
          {
            label: l("El gobierno no cobra así. Cuelgo.", "The government doesn't collect like this. Hanging up."),
            next: "safe",
            note: l("Exacto: amenaza + tarjetas de regalo = estafa.", "Exactly: threats + gift cards = scam."),
          },
        ],
      },
    },
  },
];

export const CALL_BY_ID = new Map(CALLS.map((c) => [c.id, c]));

/** La llamada gratuita del día (la misma para todos ese día). */
export function callOfDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  const n = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / 864e5);
  return CALLS[((n % CALLS.length) + CALLS.length) % CALLS.length];
}

export const CALL_XP = { safe: 20, fell: 5, perDay: 3 } as const;
