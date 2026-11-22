/*
 * La estafa del día: un caso distinto cada día (mismo caso para todos), con racha de días seguidos.
 * Todas las marcas, personas, números y dominios son ficticios.
 * Las respuestas (answer/explain/tip) solo se mandan al navegador después de responder.
 */

export interface DailyCase {
  id: string;
  channel: "Correo" | "SMS" | "Chat" | "Llamada" | "Redes";
  from: string;
  text: string;
  answer: "phishing" | "legit";
  explain: string;
  /** Consejo corto para recordar */
  tip: string;
}

const c = (
  id: string,
  channel: DailyCase["channel"],
  from: string,
  text: string,
  answer: DailyCase["answer"],
  explain: string,
  tip: string,
): DailyCase => ({ id, channel, from, text, answer, explain, tip });

export const DAILY_CASES: DailyCase[] = [
  c("d01", "SMS", "+503 7845-1120", "EnvíaYa: tu paquete está retenido en aduana. Paga $1.95 de impuesto aquí: enviaya-aduana.top", "phishing", "Un cobro pequeño para “liberar” un paquete es la forma de robar los datos de tu tarjeta. El dominio no es enviaya.com.sv.", "Revisa tus envíos solo en la app o web oficial."),
  c("d02", "Correo", "Banco Izalco <avisos@bancoizalco.com.sv>", "Hola Marta, tu nueva tarjeta de débito ya fue enviada a tu agencia. Puedes retirarla con tu DUI a partir del lunes.", "legit", "Dominio oficial, dato concreto y te manda a la agencia en persona. No pide nada por correo.", "Un aviso legítimo no te pide datos ni te apura."),
  c("d03", "Chat", "+1 (832) 555-0199", "Hola, ¿sos la hija de doña Carmen? Le mandé una remesa por error a su número, ¿me la puede devolver a esta cuenta?", "phishing", "La “remesa por error” es una excusa para que mandes dinero real. Si de verdad llegó algo, la agencia lo resuelve.", "Nunca devuelvas dinero que “llegó por error” sin hablar con tu banco."),
  c("d04", "Llamada", "Número desconocido", "“Le habla el gerente de la agencia. Detectamos una clonación de su tarjeta. Para bloquearla necesito el código que le acaba de llegar por SMS.”", "phishing", "El código que te llega es para autorizar una operación. Ningún gerente lo necesita.", "Cuelga y llama tú al número que está detrás de tu tarjeta."),
  c("d05", "SMS", "Tributos (código corto 1111)", "DGT: Recuerda que el plazo para tu declaración de renta vence el 30 de abril. Hazla en el portal de siempre.", "legit", "No trae enlace ni pide datos; solo recuerda una fecha y te manda al portal que ya conoces.", "Los recordatorios reales no te dan enlaces para pagar."),
  c("d06", "Redes", "Súper La Ceiba Ofertas 🎁 (página nueva)", "¡Cumplimos 50 años! Regalamos 300 canastas. Comenta “QUIERO” y llena tus datos en laceiba-50anios.site", "phishing", "Página recién creada, regalo masivo y un dominio que no es el de la tienda. Buscan tus datos y tu tarjeta.", "Comprueba las promociones en la web oficial de la tienda."),
  c("d07", "Correo", "RRHH Grupo Atlacatl <rrhh@grupoatlacatl.com.sv>", "Te compartimos el calendario de vacaciones de diciembre. Está publicado en la intranet, sección Avisos.", "legit", "Viene del dominio de la empresa y te manda a la intranet que ya usas, sin enlaces raros.", "Lo normal es que te manden a un lugar que ya conoces."),
  c("d08", "Chat", "Soporte Billetera Tunco", "Su cuenta será suspendida por falta de verificación. Envíe foto de su DUI por ambos lados y una selfie a este chat.", "phishing", "Con tu DUI y una selfie pueden abrir cuentas o pedir préstamos a tu nombre. El soporte real no lo pide por chat.", "Tus documentos solo se suben dentro de la app oficial."),
  c("d09", "SMS", "+503 6012-3344", "Felicidades, tu número fue seleccionado para un bono de $200 del gobierno. Regístrate en bono-familias-sv.com", "phishing", "Los programas del gobierno usan dominios .gob.sv y no avisan por SMS desde números personales.", "Si no es .gob.sv, no es del gobierno."),
  c("d10", "Correo", "EnvíaYa <notificaciones@enviaya.com.sv>", "Tu pedido EY-773104 fue entregado hoy a las 3:12 p. m. ¿Cómo fue tu experiencia? Califícanos en la app.", "legit", "Dominio oficial, dato concreto de una entrega y no pide pagos ni datos.", "Pregúntate: ¿esperaba este mensaje?"),
  c("d11", "Llamada", "Se muestra “Mamá” (contacto guardado)", "Una voz llorando: “¡Me asaltaron! Estoy en la delegación, necesito que deposites $300 ya para que me suelten. No le digas a nadie.”", "phishing", "Los estafadores pueden falsificar el número que aparece y fingir la voz. El “no le digas a nadie” impide que verifiques.", "Cuelga y llama tú al número de siempre o usa la palabra clave familiar."),
  c("d12", "SMS", "BancoIzalco (código corto 2250)", "Banco Izalco: retiro de $40.00 en cajero La Gran Vía. Si no lo reconoces, llama al número de tu tarjeta.", "legit", "Te avisa de una operación y te manda al número de tu propia tarjeta, no a un enlace.", "Las alertas reales no te piden datos por respuesta."),
  c("d13", "Correo", "Netflixx Soporte <billing@stream-pagos.com>", "No pudimos procesar tu pago. Actualiza tu tarjeta en las próximas 12 horas para no perder tu cuenta.", "phishing", "Un nombre mal escrito, un dominio que no es del servicio y urgencia por actualizar la tarjeta.", "Revisa tus suscripciones entrando tú a la app, no por el correo."),
  c("d14", "Chat", "Comprador en Mercadito", "Te deposité de más por error 😅 Te mandé $150 en vez de $100. ¿Me regresás los $50 a esta otra cuenta?", "phishing", "Te muestran un depósito falso o que luego se revierte, y tú pierdes los $50 reales.", "Solo cuenta el dinero que ves en tu banco, no las capturas."),
  c("d15", "Correo", "Distribuidora Lempa <cobros@distlempa.com.sv>", "Adjuntamos la factura de noviembre (DTE en PDF y JSON). Gracias por su compra.", "legit", "Un proveedor conocido, desde su dominio, con el formato esperado y sin cambios de cuenta.", "Lo raro es cuando cambian la cuenta bancaria, no la factura normal."),
  c("d16", "SMS", "+503 7711-0098", "Tu número de WhatsApp será dado de baja hoy. Para mantenerlo, responde con el código de 6 dígitos que te llegará.", "phishing", "Ese código sirve para registrar tu cuenta en otro celular. Nadie te dará de baja por no enviarlo.", "Activa la verificación en dos pasos con un PIN."),
  c("d17", "Redes", "Inversiones Cuscatlán Trading 📈", "Testimonio: “Invertí $100 y en 10 días saqué $1,200”. Escríbele al asesor y empieza hoy.", "phishing", "Nadie garantiza multiplicar el dinero en días. Los testimonios y capturas se inventan.", "Ganancias garantizadas = estafa."),
  c("d18", "Correo", "Mesa de ayuda <mesadeayuda@grupoatlacatl.com.sv>", "Hola, el técnico pasará mañana a las 9 a. m. a revisar la impresora del segundo piso, como pediste.", "legit", "Responde a algo que tú pediste, desde el dominio interno y sin pedir claves.", "El contexto importa: ¿tú lo pediste?"),
  c("d19", "Llamada", "Número desconocido", "“Somos de la compañía de teléfono. Para darle un celular nuevo gratis necesitamos verificar su identidad: dígame el código que le llegó.”", "phishing", "Con ese código pueden duplicar tu chip y recibir tus mensajes del banco.", "Ningún regalo requiere dictar códigos."),
  c("d20", "SMS", "RemesaFácil (código corto 3310)", "RemesaFácil: tu envío de $250 de Carlos M. ya está disponible para retiro en agencia o depósito en tu cuenta.", "legit", "No pide pagos ni datos; te deja retirar como siempre en la agencia o en tu cuenta.", "Si te piden pagar para “liberar” una remesa, desconfía."),
  c("d21", "Correo", "Soporte <seguridad@bancoizalco.com.sv.alerta-login.net>", "Inicio de sesión desde un dispositivo desconocido. Si no fuiste tú, protege tu cuenta aquí.", "phishing", "El dominio real es alerta-login.net. Lo de antes es un subdominio para que parezca del banco.", "Lee el dominio de derecha a izquierda desde la primera “/”."),
  c("d22", "Chat", "Prima Laura (contacto guardado)", "¿Ya viste el video de los 15 años de Sofi? Te lo pasé al grupo de la familia 😍", "legit", "Contacto conocido, conversación normal, sin enlaces raros ni pedidos de dinero o códigos.", "No todo es trampa: lo normal no pide nada."),
  c("d23", "SMS", "+503 6200-4411", "PNC: tiene una multa de tránsito pendiente de $57. Pague hoy con 50% de descuento en pagomulta-sv.online", "phishing", "Las multas se consultan en los portales oficiales .gob.sv; el descuento “solo hoy” busca que pagues sin revisar.", "Consulta multas solo en sitios .gob.sv."),
  c("d24", "Correo", "Mercadito <ventas@mercadito.com.sv>", "Tu publicación “Bicicleta montañera” tiene 3 nuevas preguntas. Respóndelas desde la app.", "legit", "Dominio oficial y te manda a la app, sin pedir datos ni pagos.", "Entra por la app y verás lo mismo."),
  c("d25", "Chat", "Agencia de empleos Global 🌎", "Trabajo desde casa: $40 diarios por dar “me gusta” a videos. Solo deposita $20 de inscripción para empezar.", "phishing", "Un trabajo real no te cobra por empezar. Después piden más depósitos para “desbloquear” pagos.", "Si tienes que pagar para trabajar, es estafa."),
  c("d26", "Llamada", "2200-1234 (número oficial del banco)", "“Le llamamos para confirmar una compra de $890. Para cancelarla, ingrese su PIN en el teclado ahora.”", "phishing", "El número que aparece se puede falsificar y el banco jamás te pide tu PIN, ni por teclado.", "Tu PIN es solo para el cajero, nunca para una llamada."),
  c("d27", "SMS", "+503 7900-1235", "Hola, soy Diego del colegio de tu hijo. Necesito que confirmes tus datos para la excursión aquí: colegio-excursion.click", "phishing", "Un número desconocido, un dominio .click y un pretexto escolar para conseguir tus datos.", "Confirma con el colegio por el canal de siempre."),
  c("d28", "Correo", "Banco Izalco <avisos@bancoizalco.com.sv>", "Recuerda: nunca te pediremos tu clave, PIN o códigos por llamada, SMS o correo. Si alguien lo hace, cuelga.", "legit", "Es un aviso educativo desde el dominio oficial y no pide ninguna acción.", "Los bancos avisan, no piden."),
  c("d29", "Redes", "Perfil “Andrea Rivera” (amiga de una amiga)", "Hola guapa, vendo mi iPhone casi nuevo en $150 porque me voy del país. Si te interesa, me mandas el anticipo y te lo envío.", "phishing", "Precio muy bajo, prisa por irse y anticipo antes de ver el producto: estafa de compraventa.", "Compra en persona y paga al recibir."),
  c("d30", "SMS", "EnvíaYa (código corto 4040)", "EnvíaYa: tu paquete llega hoy entre 2 y 5 p. m. Si no estarás, reprograma desde la app.", "legit", "Mensaje informativo sin enlace ni cobro; te manda a la app oficial.", "La diferencia con la trampa: aquí no te cobran nada."),
];

export const DAILY_BY_ID = new Map(DAILY_CASES.map((x) => [x.id, x]));

/** Días desde 2026-01-01 para una fecha "AAAA-MM-DD". */
function dayNumber(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return Math.floor((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / 864e5);
}

/** El caso del día: el mismo para todos ese día, y no se repite hasta pasar por todos. */
export function caseForDay(day: string) {
  const n = DAILY_CASES.length;
  return DAILY_CASES[((dayNumber(day) % n) + n) % n];
}

/** El día anterior a "AAAA-MM-DD". */
export function prevDay(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - 864e5).toISOString().slice(0, 10);
}

export type DailyState = { lastDay: string; streak: number; best: number };

/** Nueva racha al responder hoy: sigue si respondió ayer, si no vuelve a 1. */
export function nextStreak(prev: DailyState | undefined | null, today: string): DailyState {
  if (prev?.lastDay === today) return prev;
  const streak = prev?.lastDay === prevDay(today) ? prev.streak + 1 : 1;
  return { lastDay: today, streak, best: Math.max(prev?.best ?? 0, streak) };
}

/** Racha que se muestra: si no respondió ayer ni hoy, ya se cortó. */
export function currentStreak(s: DailyState | undefined | null, today: string) {
  if (!s) return 0;
  return s.lastDay === today || s.lastDay === prevDay(today) ? s.streak : 0;
}

export const DAILY_XP = { correct: 15, wrong: 5 } as const;

export type PublicDailyCase = Omit<DailyCase, "answer" | "explain" | "tip">;
export const publicDaily = ({ id, channel, from, text }: DailyCase): PublicDailyCase => ({ id, channel, from, text });
