/*
 * Llamadas simuladas (vishing). Cada llamada puede ser una ESTAFA o una llamada REAL, y la persona
 * no sabe cuál le toca hasta el final: escucha, responde y, al terminar, decide qué era.
 * La experiencia depende de juzgar bien (ver callXp): colgar siempre ya no da puntos gratis.
 * Todos los nombres, bancos y números son ficticios. Gratis: la llamada del día. Pro: aleatorias.
 */

import type { Lang } from "./i18n";

type L = Record<Lang, string>;
/** fell: cayó en la estafa · safe: se negó o colgó · ok: siguió una llamada real con normalidad · declined: ni contestó */
export type CallEnd = "fell" | "safe" | "ok" | "declined";
/** Lo que la persona cree que era la llamada */
export type CallVerdict = "estafa" | "real";

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
  /** true: es una estafa · false: es una llamada real */
  scam: boolean;
  title: L;
  /** Lo que la persona sabe antes de contestar (para poder juzgar) */
  context: L;
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
    scam: true,
    context: l("Tienes una tarjeta de Banco Izalco.", "You have an Izalco Bank card."),
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
    scam: true,
    context: l("Tienes un nieto que vive en otra ciudad. El número no está en tus contactos.", "You have a grandson who lives in another city. The number isn't in your contacts."),
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
    scam: true,
    context: l("Tienes una computadora en casa y no has pedido ayuda técnica a nadie.", "You have a computer at home and haven't asked anyone for tech help."),
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
    scam: true,
    context: l("Pagas tus impuestos cada año.", "You pay your taxes every year."),
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
  // ───────── Llamadas REALES: no todo es estafa. Se reconocen porque no piden códigos, claves,
  // dinero ni secreto, no apuran y encajan con lo que la persona ya sabe. ─────────
  {
    id: "cita-clinica",
    scam: false,
    context: l("La semana pasada sacaste una cita con la doctora Méndez en la Clínica Los Pinos.", "Last week you booked an appointment with Dr. Méndez at Los Pinos Clinic."),
    title: l("La clínica confirma tu cita", "The clinic confirms your appointment"),
    caller: l("Clínica Los Pinos", "Los Pinos Clinic"),
    number: "2250-3300",
    lesson: l(
      "Era real: confirmaba una cita que tú habías sacado, no pidió datos, pagos ni códigos, y no te apuró. Si dudas, igual puedes colgar y llamar tú a la clínica.",
      "It was real: it confirmed an appointment you had booked, didn't ask for data, payments or codes, and didn't rush you. If in doubt, you can still hang up and call the clinic yourself.",
    ),
    steps: {
      start: {
        say: l(
          "Buenos días, le llamamos de la Clínica Los Pinos para confirmar su cita con la doctora Méndez este jueves a las diez de la mañana. ¿Nos confirma su asistencia?",
          "Good morning, this is Los Pinos Clinic calling to confirm your appointment with Dr. Méndez this Thursday at ten in the morning. Can you confirm you'll attend?",
        ),
        choices: [
          { label: l("Sí, ahí estaré", "Yes, I'll be there"), next: "ok", note: l("Solo confirmaba tu cita: no pidió nada más.", "It only confirmed your appointment: it asked for nothing else.") },
          { label: l("¿Necesitan algún dato mío?", "Do you need any of my details?"), next: "datos" },
          {
            label: l("Cuelgo y llamo yo a la clínica", "I hang up and call the clinic myself"),
            next: "safe",
            note: l("Verificar nunca está mal, aunque esta vez no hacía falta.", "Verifying is never wrong, though this time it wasn't needed."),
          },
        ],
      },
      datos: {
        say: l(
          "No, nada más su confirmación. Si quiere cambiar la hora, puede llamarnos al número que aparece en su tarjeta de citas.",
          "No, just your confirmation. If you want to change the time, you can call us at the number on your appointment card.",
        ),
        choices: [
          { label: l("Perfecto, confirmo", "Perfect, I confirm"), next: "ok", note: l("Te dio una forma de verificar por tu cuenta: señal de llamada real.", "It gave you a way to verify on your own: a sign of a real call.") },
          { label: l("Igual cuelgo y llamo yo", "I'll still hang up and call myself"), next: "safe", note: l("Está bien ser precavido.", "Being careful is fine.") },
        ],
      },
    },
  },
  {
    id: "paquete-real",
    scam: false,
    context: l("Ayer compraste unos audífonos en una tienda en línea, con envío a domicilio.", "Yesterday you bought headphones from an online store, with home delivery."),
    title: l("El repartidor de tu compra", "The courier with your order"),
    caller: l("Repartidor · Envíos del Valle", "Courier · Valley Deliveries"),
    number: "7012-4455",
    lesson: l(
      "Era real: esperabas ese paquete, ya estaba pagado y no te pidió datos ni cobros. La estafa del paquete te cobra un “envío” o te pide un código.",
      "It was real: you were expecting that package, it was already paid for and they didn't ask for data or fees. The package scam charges you “shipping” or asks for a code.",
    ),
    steps: {
      start: {
        say: l(
          "Hola, buenas, soy el repartidor de Envíos del Valle. Traigo un paquete a su nombre de una tienda en línea. Ya estoy por su casa, ¿me indica cuál es el portón?",
          "Hi there, I'm the courier from Valley Deliveries. I have a package in your name from an online store. I'm near your house, which gate is yours?",
        ),
        choices: [
          { label: l("Es el portón negro, ya salgo", "It's the black gate, I'm coming out"), next: "ok", note: l("Era tu compra y no pidió nada raro.", "It was your order and nothing odd was asked.") },
          { label: l("¿Tengo que pagar algo?", "Do I have to pay anything?"), next: "pago" },
          {
            label: l("No me fío. Cuelgo.", "I don't trust it. I'm hanging up."),
            next: "safe",
            note: l("Sin riesgo, pero esta vez sí era tu compra.", "No risk, but this time it really was your order."),
          },
        ],
      },
      pago: {
        say: l("No, ya está pagado en la tienda. Solo necesito que me firme de recibido.", "No, it's already paid at the store. I just need you to sign for it."),
        choices: [
          { label: l("Ya salgo a recibirlo", "I'm coming out to get it"), next: "ok", note: l("Ya pagado y sin códigos: era real.", "Already paid and no codes: it was real.") },
          { label: l("Mejor cuelgo", "I'd rather hang up"), next: "safe", note: l("Sin riesgo, pero era tu paquete.", "No risk, but it was your package.") },
        ],
      },
    },
  },
  {
    id: "banco-real",
    scam: false,
    context: l("Tienes una tarjeta de Banco Izalco. Hace un rato compraste en el supermercado.", "You have an Izalco Bank card. A while ago you shopped at the supermarket."),
    title: l("Tu banco revisa una compra", "Your bank checks a purchase"),
    caller: l("Banco Izalco", "Izalco Bank"),
    number: "2200-1234",
    lesson: l(
      "Era real: el número era el mismo que usan los estafadores, pero la diferencia está en lo que piden. El banco real solo preguntó sí o no, no pidió códigos ni PIN y te mandó a sus canales oficiales.",
      "It was real: the number was the same one scammers use, but the difference is in what they ask. The real bank only asked yes or no, didn't ask for codes or a PIN and sent you to its official channels.",
    ),
    steps: {
      start: {
        say: l(
          "Buenas tardes, le saluda Carlos, de Banco Izalco. Vimos una compra de cincuenta y dos dólares en un supermercado con su tarjeta. ¿La reconoce? No necesito ningún dato suyo, solo un sí o un no.",
          "Good afternoon, this is Carlos from Izalco Bank. We saw a fifty-two-dollar purchase at a supermarket on your card. Do you recognize it? I don't need any of your details, just a yes or no.",
        ),
        choices: [
          { label: l("Sí, fui yo", "Yes, that was me"), next: "ok", note: l("Coincidía con tu compra y no pidió nada.", "It matched your purchase and asked for nothing.") },
          { label: l("No la reconozco", "I don't recognize it"), next: "bloqueo" },
          {
            label: l("Cuelgo y llamo al número de mi tarjeta", "I hang up and call the number on my card"),
            next: "safe",
            note: l("La mejor costumbre: el banco te lo habría confirmado.", "The best habit: the bank would have confirmed it."),
          },
        ],
      },
      bloqueo: {
        say: l(
          "Entendido, ya bloqueé la tarjeta. Para la reposición visite una agencia o llame al número de atrás de su tarjeta. Recuerde: nunca le pediremos códigos ni su PIN.",
          "Understood, I've blocked the card. For a replacement, visit a branch or call the number on the back of your card. Remember: we'll never ask for codes or your PIN.",
        ),
        choices: [
          { label: l("Gracias, iré a la agencia", "Thanks, I'll go to the branch"), next: "ok", note: l("Te mandó a sus canales oficiales: señal de llamada real.", "It sent you to official channels: a sign of a real call.") },
          { label: l("Cuelgo y llamo yo para confirmar", "I hang up and call to confirm"), next: "safe", note: l("Muy bien hecho, aunque era el banco.", "Well done, even though it was the bank.") },
        ],
      },
    },
  },
  {
    id: "hija-real",
    scam: false,
    context: l("Tu hija Ana te llama desde su número de siempre, guardado en tus contactos.", "Your daughter Ana is calling from her usual number, saved in your contacts."),
    title: l("Tu hija te llama", "Your daughter calls you"),
    caller: l("Ana (hija)", "Ana (daughter)"),
    number: "7788-0012",
    lesson: l(
      "Era real: llamó desde su número guardado, no pidió dinero ni secreto, y supo la palabra clave de la familia. Desconfiar de todo tampoco ayuda: fíjate en lo que te piden.",
      "It was real: she called from her saved number, didn't ask for money or secrecy, and knew the family code word. Distrusting everything doesn't help either: look at what they ask for.",
    ),
    steps: {
      start: {
        say: l(
          "¡Hola, mamá! Ya voy saliendo del trabajo. ¿Necesitas que pase comprando algo para la cena?",
          "Hi, mom! I'm just leaving work. Do you need me to pick up anything for dinner?",
        ),
        choices: [
          { label: l("Sí, trae pan y leche, gracias", "Yes, bring bread and milk, thanks"), next: "ok", note: l("Una llamada normal: nada que pedir ni que esconder.", "A normal call: nothing to ask for and nothing to hide.") },
          { label: l("¿Segura que eres tú?", "Are you sure it's you?"), next: "prueba" },
          { label: l("Cuelgo y la llamo yo", "I hang up and call her back"), next: "safe", note: l("Sin riesgo: te habría contestado ella.", "No risk: she would have answered.") },
        ],
      },
      prueba: {
        say: l(
          "¡Ja, ja, claro, mamá! Te llamo de mi número de siempre. ¿Quieres la palabra de la familia? Es “mango”.",
          "Ha, of course, mom! I'm calling from my usual number. Want the family code word? It's “mango”.",
        ),
        choices: [
          { label: l("Ah, sí eres tú. Trae pan.", "Oh, it is you. Bring bread."), next: "ok", note: l("Supo la palabra clave: buena costumbre familiar.", "She knew the code word: a good family habit.") },
          { label: l("Igual cuelgo y te llamo", "I'll still hang up and call you"), next: "safe", note: l("Sin riesgo, aunque era ella.", "No risk, though it was her.") },
        ],
      },
    },
  },
];

export const CALL_BY_ID = new Map(CALLS.map((c) => [c.id, c]));

export const CALL_XP = { right: 20, wrongVerdict: 8, fell: 5, declined: 2, perDay: 3 } as const;

/**
 * XP de una llamada: lo que se premia es JUZGAR bien, no colgar.
 *  - Caer en una estafa: 5 · Rechazar sin escuchar: 2
 *  - Terminar sin caer y adivinar qué era: 20; equivocarse: 8
 */
export function callXp(call: Pick<CallScenario, "scam">, outcome: CallEnd, verdict: CallVerdict | null): number {
  if (outcome === "declined") return CALL_XP.declined;
  if (outcome === "fell") return CALL_XP.fell;
  const right = verdict !== null && (verdict === "estafa") === call.scam;
  return right ? CALL_XP.right : CALL_XP.wrongVerdict;
}

/** La llamada gratuita del día (la misma para todos ese día). */
export function callOfDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  const n = Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / 864e5);
  // Salto coprimo con el total: recorre todas las llamadas, pero mezclando estafas y reales
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const step = [5, 3, 7, 11, 1].find((k) => gcd(k, CALLS.length) === 1)!;
  return CALLS[(((n * step) % CALLS.length) + CALLS.length) % CALLS.length];
}

/** Una llamada al azar (sin repetir la anterior), para Pro. */
export function randomCall(ids: string[], last?: string) {
  const pool = ids.length > 1 ? ids.filter((id) => id !== last) : ids;
  return CALL_BY_ID.get(pool[Math.floor(Math.random() * pool.length)])!;
}
