/*
 * Ruta guiada: unidades > lecciones > ejercicios cortos.
 * Todas las marcas, personas, números y dominios son ficticios (ver data.ts).
 * Las respuestas (answer/explain) NUNCA se mandan al navegador: ver publicLesson().
 */

export type Exercise =
  | {
      id: string;
      kind: "veredicto";
      channel: "Correo" | "SMS" | "Chat" | "Llamada";
      from: string;
      text: string;
      answer: "phishing" | "legit";
      explain: string;
    }
  | {
      id: string;
      kind: "opcion" | "enlace";
      prompt: string;
      context?: string;
      options: string[];
      answer: number;
      explain: string;
    };

export interface Lesson {
  id: string;
  title: string;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const v = (
  id: string,
  channel: "Correo" | "SMS" | "Chat" | "Llamada",
  from: string,
  text: string,
  answer: "phishing" | "legit",
  explain: string,
): Exercise => ({ id, kind: "veredicto", channel, from, text, answer, explain });

const o = (id: string, prompt: string, options: string[], answer: number, explain: string, context?: string): Exercise => ({
  id,
  kind: "opcion",
  prompt,
  options,
  answer,
  explain,
  context,
});

const e = (id: string, prompt: string, options: string[], answer: number, explain: string, context?: string): Exercise => ({
  id,
  kind: "enlace",
  prompt,
  options,
  answer,
  explain,
  context,
});

export const UNITS: Unit[] = [
  {
    id: "u1",
    title: "¿Quién te escribe?",
    description: "Remitentes, números y dominios: lo primero que hay que mirar.",
    lessons: [
      {
        id: "u1l1",
        title: "El remitente",
        exercises: [
          v("u1l1e1", "Correo", "Banco Izalco <avisos@bancoizalco.com.sv>", "Tu estado de cuenta de noviembre ya está disponible en la app.", "legit", "Dominio oficial, sin enlaces ni pedidos de datos. Así se ve un aviso normal."),
          v("u1l1e2", "Correo", "Banco Izalco <soporte@bancoizalco-seguridad.net>", "Detectamos un acceso inusual. Confirme su clave aquí.", "phishing", "El dominio es bancoizalco-seguridad.net, no bancoizalco.com.sv, y pide tu clave."),
          o("u1l1e3", "¿Qué parte de un correo es la más difícil de falsificar?", ["El nombre que aparece", "El dominio después de la @", "El logo del banco", "La firma al final"], 1, "El nombre y el logo se copian fácil. El dominio solo lo controla quien lo registró."),
          v("u1l1e4", "SMS", "+1 (305) 555-0172", "Banco Izalco: su tarjeta fue bloqueada. Llame al 2200-0000.", "phishing", "Un banco local no te escribe desde un número de Estados Unidos ni te da otro número para llamar."),
        ],
      },
      {
        id: "u1l2",
        title: "Dominios parecidos",
        exercises: [
          e("u1l2e1", "¿Cuál es el sitio real de Banco Izalco?", ["bancoizalco.com.sv", "bancoizalco-com.sv.net", "banco-izalco.co", "bancoizalco.com.sv.verificar.top"], 0, "El dominio real termina en bancoizalco.com.sv. En el último, el dominio real es verificar.top."),
          e("u1l2e2", "¿Cuál NO es de la empresa Grupo Atlacatl (grupoatlacatl.com.sv)?", ["intranet.grupoatlacatl.com.sv", "correo.grupoatlacatl.com.sv", "grupoatlacatl.com.sv/rrhh", "grupoatlacatl-com.sv.login.net"], 3, "Lo que va justo antes de la primera barra manda: login.net no es de la empresa."),
          o("u1l2e3", "¿Qué cambio de letras usan para engañarte en “bancoizaIco.com.sv”?", ["Una l minúscula por una I mayúscula", "Un punto de más", "Un guion", "No hay ningún cambio"], 0, "Con algunas fuentes la I mayúscula y la l minúscula se ven iguales. Léelo con calma."),
          e("u1l2e4", "La Dirección General de Tributos usa tributos.gob.sv. ¿Cuál es real?", ["tributos-gob.sv", "tributos.gob.sv/declaracion", "tributosgob.com", "gob-sv.tributos.info"], 1, "Las instituciones del gobierno usan .gob.sv. Los demás son imitaciones."),
        ],
      },
      {
        id: "u1l3",
        title: "Repaso: remitentes",
        exercises: [
          v("u1l3e1", "Correo", "Andrea López <andrea.lopez@grupoatlacatl.com.sv>", "Como hablamos ayer, te comparto el horario de diciembre en la intranet.", "legit", "Dominio correcto y hace referencia a algo que sí pasó. No pide nada."),
          v("u1l3e2", "Correo", "Gerencia <gerencia.atlacatl@gmail.com>", "Necesito que hagas una transferencia urgente a un proveedor nuevo. Es confidencial.", "phishing", "Correo personal que se hace pasar por la empresa, urgencia y secreto: fraude del CEO."),
          o("u1l3e3", "Te llega un correo de tu jefe desde Gmail pidiendo tarjetas de regalo. ¿Qué haces?", ["Las compro rápido", "Respondo al mismo correo para confirmar", "Lo confirmo por llamada o en persona", "Reenvío el correo a mis compañeros"], 2, "Confirma siempre por otro canal que tú ya conoces, nunca respondiendo al mismo mensaje."),
          v("u1l3e4", "SMS", "BancoIzalco (código corto 2250)", "Tu código para iniciar sesión es 551204. No lo compartas.", "legit", "Si tú acabas de iniciar sesión, este código es esperado. Lo importante: no compartirlo."),
        ],
      },
    ],
  },
  {
    id: "u2",
    title: "Presión y emociones",
    description: "Urgencia, miedo, premios y familia: cómo te apuran para que no pienses.",
    lessons: [
      {
        id: "u2l1",
        title: "La urgencia",
        exercises: [
          o("u2l1e1", "¿Por qué los estafadores ponen plazos como “en 24 horas”?", ["Porque el banco tiene horario", "Para que actúes sin revisar", "Porque es la ley", "Para ser amables"], 1, "La prisa evita que te detengas a verificar. Un plazo amenazante es una señal clásica."),
          v("u2l1e2", "SMS", "+503 7100-0000", "ÚLTIMO AVISO: su cuenta de Billetera Tunco será eliminada HOY. Verifique ya: tunco-verifica.click", "phishing", "Mayúsculas, amenaza y un dominio .click que no es el de la billetera."),
          v("u2l1e3", "Correo", "EnvíaYa <notificaciones@enviaya.com.sv>", "Tu pedido EY-118230 llega mañana entre 9 y 12. No necesitas hacer nada.", "legit", "Dominio oficial, dato concreto de tu compra y no pide pagos ni datos."),
          o("u2l1e4", "¿Qué frase NO es una señal de urgencia?", ["Responda en 2 horas", "Su cuenta se cerrará hoy", "Puede revisarlo cuando guste", "Última oportunidad"], 2, "Un mensaje legítimo te deja revisar con calma."),
        ],
      },
      {
        id: "u2l2",
        title: "Familia y amigos",
        exercises: [
          v("u2l2e1", "Chat", "+1 (713) 555-0110 (no guardado)", "Ma, soy yo, se me arruinó el cel. ¿Me podés depositar $200 a esta cuenta? Es urgente.", "phishing", "Número nuevo, urgencia y dinero a otra cuenta: la estafa del familiar."),
          o("u2l2e2", "Alguien dice ser tu primo desde otro número y pide dinero. ¿Mejor primera acción?", ["Mandarle la mitad", "Llamarlo a su número de siempre", "Pedirle una foto", "Preguntarle su nombre completo"], 1, "Llama al número que ya tienes guardado. Fotos y nombres se pueden conseguir en redes."),
          o("u2l2e3", "¿Qué acuerdo en familia ayuda contra esta estafa?", ["Compartir contraseñas", "Una palabra clave para emergencias", "Usar siempre WhatsApp", "No contestar a nadie"], 1, "Una palabra clave que solo saben ustedes desarma a cualquier impostor."),
          v("u2l2e4", "Chat", "Mamá (contacto guardado)", "Hija, ¿venís a almorzar el domingo? Hago pupusas.", "legit", "Contacto que ya tenías, conversación normal, sin pedidos de dinero ni urgencia."),
        ],
      },
      {
        id: "u2l3",
        title: "Premios y ofertas",
        exercises: [
          v("u2l3e1", "Correo", "Supermercados La Ceiba <premios@laceiba-regalos.shop>", "¡Ganaste $500! Solo paga $2 de envío para recibir tu tarjeta.", "phishing", "Premio que no buscaste y un cobro pequeño para robar los datos de tu tarjeta."),
          o("u2l3e2", "Un “trabajo” te paga por dar likes, pero antes debes depositar $25. Es:", ["Una oportunidad real", "Una estafa de tareas", "Un trabajo formal", "Un concurso"], 1, "Si para ganar tienes que pagar primero, es estafa."),
          o("u2l3e3", "¿Qué promoción es más creíble?", ["iPhone gratis por responder 3 preguntas", "10% de descuento visible en la app oficial de la tienda", "Bono de $1,000 por compartir un enlace", "Premio por ser el visitante 1,000,000"], 1, "Las promociones reales se pueden comprobar en los canales oficiales de la tienda."),
          v("u2l3e4", "SMS", "+44 7700 900321", "Inversión segura en criptomonedas: duplica tus dólares en 7 días. Responde SÍ.", "phishing", "Nadie garantiza duplicar dinero. Promesas de ganancia rápida = estafa."),
        ],
      },
    ],
  },
  {
    id: "u3",
    title: "Enlaces y archivos",
    description: "Lee un enlace antes de tocarlo y desconfía de los archivos que no pediste.",
    lessons: [
      {
        id: "u3l1",
        title: "Leer un enlace",
        exercises: [
          e("u3l1e1", "¿A qué sitio te lleva realmente este enlace?", ["bancoizalco.com.sv", "verificar-cuenta.co", "login.bancoizalco", "No se puede saber"], 1, "Lo que manda es lo que va justo antes de la primera “/”: verificar-cuenta.co.", "http://bancoizalco.com.sv.verificar-cuenta.co/login"),
          o("u3l1e2", "¿El candado (https) significa que un sitio es confiable?", ["Sí, siempre", "No, solo que la conexión va cifrada", "Solo si es verde", "Sí, si es un banco"], 1, "Los sitios falsos también tienen candado. Revisa el dominio."),
          e("u3l1e3", "¿Cuál enlace es seguro para entrar a EnvíaYa (enviaya.com.sv)?", ["enviaya.com.sv/rastreo", "enviaya-sv.delivery-pago.top", "enviaya.rastreo-paquete.com", "bit.ly/envia-ya"], 0, "Solo el primero está en el dominio oficial. Los acortadores esconden el destino."),
          o("u3l1e4", "Un correo dice “haz clic aquí” pero el enlace es raro. ¿Qué haces?", ["Hago clic para ver", "Escribo yo mismo la dirección oficial", "Respondo preguntando", "Lo reenvío"], 1, "Entra por tu cuenta escribiendo la dirección o usando la app oficial."),
        ],
      },
      {
        id: "u3l2",
        title: "Archivos y QR",
        exercises: [
          o("u3l2e1", "¿Qué archivo adjunto inesperado es más peligroso?", ["foto.jpg", "Factura.pdf.exe", "notas.txt", "horario.png"], 1, "Un .exe disfrazado con doble extensión puede instalar un programa malicioso."),
          v("u3l2e2", "Correo", "Facturación <facturas@distlempa-dte.com>", "Adjuntamos su DTE pendiente. Abra el archivo Factura_DTE.html.", "phishing", "Las facturas electrónicas reales llegan en PDF/JSON, no en .html, y el dominio no es el del proveedor."),
          o("u3l2e3", "Ves un código QR pegado sobre otro en un parqueo para “pagar”. ¿Qué pasa?", ["Es una actualización", "Puede llevarte a un sitio falso de pago", "Los QR son siempre seguros", "Hay que pagar dos veces"], 1, "Pegar un QR falso encima del real es una estafa común. Revisa el enlace antes de pagar."),
          o("u3l2e4", "Antes de abrir un QR, el celular te muestra la dirección. ¿Qué miras?", ["El color del QR", "El dominio real del enlace", "Si tiene logo", "El tamaño"], 1, "Igual que con los enlaces: el dominio antes de la primera “/”."),
        ],
      },
      {
        id: "u3l3",
        title: "Repaso: enlaces",
        exercises: [
          e("u3l3e1", "¿Cuál dominio pertenece a la Billetera Tunco (billeteratunco.com.sv)?", ["billeteratunco.com.sv/ayuda", "billetera-tunco.app", "tunco.billeteratunco-sv.com", "billeteratunco.com.sv.soporte.xyz"], 0, "Solo el primero termina en billeteratunco.com.sv antes de la barra."),
          v("u3l3e2", "SMS", "BancoIzalco (código corto 2250)", "Compra de $12.50 en Súper La Ceiba con tu tarjeta *4821. Si no la reconoces, llama al número de tu tarjeta.", "legit", "No trae enlace y te manda al número de tu propia tarjeta. Así avisa un banco."),
          v("u3l3e3", "Correo", "Soporte TI <it@grupoatlacatl.com.sv.ayuda-login.net>", "Su buzón está lleno. Inicie sesión para ampliarlo.", "phishing", "El dominio real es ayuda-login.net. El resto es un subdominio para confundir."),
          o("u3l3e4", "¿Qué es un acortador como bit.ly?", ["Un sitio del gobierno", "Algo que esconde el destino real del enlace", "Un antivirus", "Un banco"], 1, "No siempre es malo, pero esconde a dónde vas: desconfía si viene en un mensaje inesperado."),
        ],
      },
    ],
  },
  {
    id: "u4",
    title: "Estafas de hoy en El Salvador",
    description: "Remesas, billeteras, compraventas y llamadas: los casos que más circulan.",
    lessons: [
      {
        id: "u4l1",
        title: "Remesas y billeteras",
        exercises: [
          v("u4l1e1", "Chat", "Soporte Billetera Tunco ✅", "Para liberar su remesa retenida, díctenos el código de 6 dígitos que le llegó por SMS.", "phishing", "Nadie legítimo te pide el código. Con él entran a tu cuenta."),
          o("u4l1e2", "Tu remesa “está retenida” y piden pagar $10 para liberarla. ¿Qué haces?", ["Pago para no perderla", "Consulto en la app o agencia oficial", "Pido que me rebajen", "Mando mi DUI"], 1, "Verifica en el canal oficial. Cobros para “liberar” dinero son estafa."),
          v("u4l1e3", "SMS", "RemesaFácil (código corto 3310)", "Tu remesa de $150 ya está disponible. Retírala en cualquier agencia con tu DUI.", "legit", "No pide pagos ni datos por mensaje; te manda a retirar en persona como siempre."),
          o("u4l1e4", "¿Qué dato NUNCA debes dar por chat o llamada?", ["Tu nombre", "El código de verificación (OTP)", "Tu ciudad", "Tu correo"], 1, "El código de verificación es la llave de tu cuenta."),
        ],
      },
      {
        id: "u4l2",
        title: "Compraventa en línea",
        exercises: [
          v("u4l2e1", "Chat", "Comprador en Mercadito", "Ya te pagué. Para recibir el dinero ingresa los datos de tu tarjeta en mercadito-pagos-sv.com", "phishing", "Para recibir dinero no necesitas dar tu tarjeta, y ese no es el dominio de Mercadito."),
          o("u4l2e2", "Vendes algo y el comprador manda una “captura” de transferencia. Lo correcto es:", ["Entregar ya", "Revisar en tu banco que el dinero llegó", "Pedir otra captura", "Confiar si es amable"], 1, "Las capturas se editan. Lo único que vale es ver el dinero en tu cuenta."),
          o("u4l2e3", "Compras en línea y el vendedor pide pagar por fuera de la plataforma. Es:", ["Normal", "Una señal de riesgo", "Más barato y seguro", "Obligatorio"], 1, "Salirte de la plataforma te quita la protección del comprador."),
          v("u4l2e4", "Chat", "Comprador en Mercadito", "Hola, ¿la bici aún está disponible? ¿Puedo verla el sábado en la mañana?", "legit", "Un comprador real pregunta y quiere ver el producto. No hay pagos raros ni enlaces."),
        ],
      },
      {
        id: "u4l3",
        title: "Llamadas y gobierno",
        exercises: [
          v("u4l3e1", "Llamada", "Número desconocido", "“Le hablamos del banco. Para cancelar un cargo no reconocido, díganos el número completo de su tarjeta y el código de atrás.”", "phishing", "El banco ya tiene tus datos y nunca pide el código de seguridad (CVV)."),
          o("u4l3e2", "Te llaman “del banco” y te sientes presionado. ¿Mejor opción?", ["Seguir la llamada", "Colgar y llamar tú al número de tu tarjeta", "Dar solo la mitad de los datos", "Pedir su nombre"], 1, "Cuelga y llama tú a un número oficial que ya conoces."),
          v("u4l3e3", "Correo", "Dirección General de Tributos <notificaciones@tributos.gob.sv>", "Recordatorio: el plazo para presentar tu declaración vence el 30. Ingresa al portal como de costumbre.", "legit", "Dominio .gob.sv oficial, sin enlace para dar datos y te manda al portal de siempre."),
          v("u4l3e4", "SMS", "+503 6000-0000", "Hacienda: tiene una devolución de $312. Ingrese su cuenta bancaria y PIN en devolucion-hacienda.top", "phishing", "Nadie necesita tu PIN para depositarte, y .top no es un dominio del gobierno."),
        ],
      },
    ],
  },
];

export const LESSONS = UNITS.flatMap((u) => u.lessons);
export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));
export const LESSON_ORDER = LESSONS.map((l) => l.id);

/** Una lección está disponible si es la primera o la anterior ya se completó. */
export function isUnlocked(lessonId: string, completed: ReadonlySet<string>) {
  const i = LESSON_ORDER.indexOf(lessonId);
  return i === 0 || (i > 0 && completed.has(LESSON_ORDER[i - 1]));
}

export type PublicExercise =
  | Omit<Extract<Exercise, { kind: "veredicto" }>, "answer" | "explain">
  | Omit<Extract<Exercise, { kind: "opcion" | "enlace" }>, "answer" | "explain">;

/** La lección sin respuestas, para mandar al navegador. */
export function publicLesson(lesson: Lesson): { id: string; title: string; exercises: PublicExercise[] } {
  return {
    id: lesson.id,
    title: lesson.title,
    exercises: lesson.exercises.map((ex) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { answer, explain, ...rest } = ex;
      return rest as PublicExercise;
    }),
  };
}

export const XP = { correct: 10, lessonBonus: 20, repeatCorrect: 5 } as const;
