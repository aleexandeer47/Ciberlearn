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

export type Level = "Básico" | "Intermedio" | "Avanzado" | "Experto";

export interface Unit {
  id: string;
  title: string;
  description: string;
  level: Level;
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
    level: "Básico",
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
    level: "Básico",
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
    level: "Intermedio",
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
    level: "Intermedio",
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
  {
    id: "u5",
    title: "Redes sociales y mensajería",
    description: "Cuentas robadas, perfiles falsos, sorteos e inversiones que no existen.",
    level: "Intermedio",
    lessons: [
      {
        id: "u5l1",
        title: "Cuentas robadas",
        exercises: [
          v("u5l1e1", "Chat", "Carlos (contacto guardado)", "Te va a llegar un código por SMS, es de un sorteo en el que te inscribí. Mandámelo porfa 🙏", "phishing", "Le robaron la cuenta a Carlos. Ese código sirve para registrar TU cuenta en otro celular."),
          o("u5l1e2", "¿Para qué sirve el código de 6 dígitos que llega cuando alguien registra tu número en una app de mensajería?", ["Para entrar a un sorteo", "Para que ese celular se quede con tu cuenta", "Para verificar tu edad", "No sirve para nada"], 1, "Quien tenga ese código puede abrir tu cuenta en su teléfono y escribirle a todos tus contactos."),
          o("u5l1e3", "¿Qué te protege mejor si alguien llega a conseguir ese código?", ["Cambiar tu foto de perfil", "Activar la verificación en dos pasos con un PIN propio", "Salirte de los grupos", "Bloquear al contacto"], 1, "Con el PIN de dos pasos, el código solo no basta para quedarse con tu cuenta."),
          v("u5l1e4", "Chat", "Grupo: Familia López", "Tía Rosa: Ya llegué a la casa, gracias por traerme 😊", "legit", "Conversación normal en un grupo que ya conoces. No pide códigos, dinero ni enlaces."),
        ],
      },
      {
        id: "u5l2",
        title: "Perfiles falsos",
        exercises: [
          o("u5l2e1", "Te quejas en público del banco y una página “Banco Izalco Oficial” con 300 seguidores te pide tu tarjeta por mensaje privado. Es:", ["Atención al cliente", "Una página falsa que se aprovecha de las quejas públicas", "Un canal nuevo del banco", "Un sorteo"], 1, "Los estafadores buscan quejas y responden rápido haciéndose pasar por soporte. El banco no pide tu tarjeta por chat."),
          v("u5l2e2", "Chat", "Súper La Ceiba ✔ (perfil creado hace 2 días)", "¡Felicidades! Ganaste una canasta navideña. Para el envío, ingresa los datos de tu tarjeta en laceiba-canastas.shop", "phishing", "Perfil recién creado, premio que no buscaste, pide tarjeta y el dominio no es el de la tienda."),
          o("u5l2e3", "¿Qué señal NO te ayuda a saber si un perfil es oficial?", ["Que lo enlace la página web oficial", "Su antigüedad y sus publicaciones", "Que tenga el logo y diga “oficial” en el nombre", "El dominio de los enlaces que comparte"], 2, "Cualquiera puede copiar un logo y escribir “oficial”. Comprueba desde la web oficial."),
          v("u5l2e4", "Correo", "Billetera Tunco <comunidad@billeteratunco.com.sv>", "Síguenos en redes: los enlaces oficiales están en billeteratunco.com.sv/redes. Nunca te pediremos claves por mensaje.", "legit", "Dominio oficial y te manda a comprobar los perfiles en su propia web."),
        ],
      },
      {
        id: "u5l3",
        title: "Sorteos, inversiones y romance",
        exercises: [
          v("u5l3e1", "Chat", "Inversiones Pacífico 📈", "Gané $800 esta semana con este grupo 😱 Entra con $50 y el asesor te lo multiplica. Mira mis capturas.", "phishing", "Ganancias garantizadas y capturas como prueba: las capturas se fabrican y el dinero no vuelve."),
          o("u5l3e2", "En una plataforma ves que tus ganancias crecen, pero para retirar te piden pagar un “impuesto” primero. ¿Qué pasa?", ["Es normal en inversiones", "Es estafa: el saldo es falso y seguirán pidiendo pagos", "Pago y retiro", "Pido un descuento"], 1, "El saldo que ves es inventado. Cada pago “para retirar” lleva a otro cobro."),
          o("u5l3e3", "Alguien que conociste en línea hace semanas nunca acepta videollamada y ahora necesita dinero para un boleto. Probablemente es:", ["Mala suerte", "Una estafa romántica", "Un sorteo", "Un error del banco"], 1, "Ganarse tu confianza durante semanas y luego pedir dinero es el patrón de la estafa romántica."),
          o("u5l3e4", "¿Cuál sorteo es más creíble?", ["Mensaje privado de un desconocido que dice que ganaste", "Publicación en la página oficial con bases, fechas y ganador anunciado en público", "Correo que pide $5 para entregarte el premio", "SMS desde un número extranjero"], 1, "Los sorteos reales tienen bases públicas y no te cobran por entregar el premio."),
        ],
      },
    ],
  },
  {
    id: "u6",
    title: "Tus cuentas y contraseñas",
    description: "Contraseñas fuertes, verificación en dos pasos, tu chip y las apps falsas.",
    level: "Avanzado",
    lessons: [
      {
        id: "u6l1",
        title: "Contraseñas",
        exercises: [
          o("u6l1e1", "¿Cuál contraseña es más segura?", ["Izalco2026!", "maria1990", "tres-pupusas-de-loroco-sin-curtido", "12345678"], 2, "Una frase larga y rara es más difícil de adivinar que una palabra corta con símbolos."),
          o("u6l1e2", "Usas la misma contraseña en todo y se filtra la de una tienda en línea. ¿Qué riesgo corres?", ["Ninguno", "Que la prueben en tu correo y en tu banco", "Solo pierdes la cuenta de la tienda", "Que se borre tu cuenta"], 1, "Los atacantes prueban las contraseñas filtradas en otros sitios. Usa una distinta en cada uno."),
          o("u6l1e3", "¿Para qué sirve un gestor de contraseñas?", ["Para compartirlas con amigos", "Para crear y recordar una distinta por sitio, y no autocompletarla en sitios falsos", "Para quitarles seguridad", "Para imprimirlas"], 1, "Además, si el dominio no coincide, el gestor no rellena la contraseña: es una alarma útil."),
          o("u6l1e4", "¿Dónde es seguro escribir la contraseña de tu banco?", ["En un formulario que llegó por correo", "Solo en la app oficial o en la dirección que tú escribes", "En un chat de soporte", "Respondiendo un SMS"], 1, "Tu contraseña solo va en el sitio o la app oficial a los que entras por tu cuenta."),
        ],
      },
      {
        id: "u6l2",
        title: "Verificación en dos pasos",
        exercises: [
          o("u6l2e1", "¿Qué hace la verificación en dos pasos?", ["Te pide algo más que la contraseña para entrar", "Te cambia la contraseña", "Bloquea los anuncios", "Te da dos cuentas"], 0, "Aunque roben tu contraseña, les falta el segundo paso."),
          o("u6l2e2", "¿Cuál segundo paso es más difícil de robar con una página falsa?", ["Código por SMS", "Código por correo", "Llave de seguridad física (USB o NFC)", "Pregunta secreta"], 2, "La llave física verifica el dominio real del sitio: en una página falsa simplemente no funciona."),
          o("u6l2e3", "Te llega un código para AUTORIZAR una transferencia que no hiciste. ¿Qué significa?", ["Un error del banco", "Que alguien ya tiene tu usuario y clave: no compartas el código y llama al banco", "Que ganaste algo", "Que debes reenviarlo"], 1, "El código llega porque alguien inició la operación con tus datos. Cambia tu clave y avisa al banco."),
          o("u6l2e4", "Alguien te llama y te pide ese código “solo para verificar que eres tú”. ¿Quién puede necesitarlo?", ["El banco", "Tu compañía de teléfono", "Nadie: el código es solo para ti", "La policía"], 2, "Ninguna empresa legítima te pide que le dictes un código de verificación."),
        ],
      },
      {
        id: "u6l3",
        title: "Tu celular y tus apps",
        exercises: [
          o("u6l3e1", "Tu celular queda de repente “sin servicio” y te llegan correos de cambio de contraseña. ¿Qué puede estar pasando?", ["Una falla de la antena", "Que duplicaron tu chip (SIM) para recibir tus códigos", "Que se acabó el saldo", "Una actualización"], 1, "Con un duplicado de tu chip reciben tus SMS. Llama a tu compañía de teléfono desde otro celular cuanto antes."),
          v("u6l3e2", "SMS", "+503 7000-1111", "Banco Izalco: descargue la nueva app de seguridad desde izalco-seguro.apk para evitar el bloqueo de su cuenta.", "phishing", "Un archivo .apk por SMS instala una app fuera de la tienda oficial, normalmente para espiar tu celular."),
          o("u6l3e3", "¿Dónde es seguro descargar la app de tu banco?", ["De un enlace por SMS", "De la tienda oficial de tu celular, revisando que el desarrollador sea el banco", "De un grupo de chat", "De cualquier sitio que tenga el logo"], 1, "Incluso en la tienda oficial hay copias: revisa el nombre del desarrollador y las descargas."),
          o("u6l3e4", "Una app de linterna pide permiso para leer tus SMS y ver tu pantalla. ¿Qué haces?", ["Acepto todo", "Niego los permisos y la desinstalo", "Se los doy solo hoy", "La recomiendo"], 1, "Una linterna no necesita tus mensajes. Con esos permisos pueden leer tus códigos del banco."),
        ],
      },
    ],
  },
  {
    id: "u7",
    title: "Estafas en el trabajo",
    description: "Fraude del jefe, facturas con cuentas cambiadas y soporte técnico falso.",
    level: "Avanzado",
    lessons: [
      {
        id: "u7l1",
        title: "El jefe y las transferencias",
        exercises: [
          v("u7l1e1", "Correo", "Ricardo Méndez, Gerente <r.mendez@grupoatlacatl.com.sv>", "Recibí la cotización. La revisamos el lunes en la reunión de las 10. Gracias.", "legit", "Dominio correcto, tono normal y no pide pagos ni secretos."),
          v("u7l1e2", "Correo", "Ricardo Méndez, Gerente <r.mendez@grupoatIacatl.com.sv>", "Estoy en una reunión. Haz hoy una transferencia de $4,800 a esta cuenta. No lo comentes con nadie.", "phishing", "Mira el dominio: “atIacatl” lleva una I mayúscula en vez de l. Además: urgencia, dinero y secreto."),
          o("u7l1e3", "¿Qué regla protege mejor a una empresa del fraude del jefe?", ["Responder rápido", "Confirmar por llamada a un número conocido toda transferencia nueva o cambio de cuenta, y que la aprueben dos personas", "Usar solo correo personal", "Pagar en efectivo"], 1, "Un proceso fijo de verificación funciona aunque el correo parezca perfecto."),
          o("u7l1e4", "Te piden comprar tarjetas de regalo para “unos clientes” y mandar los códigos en foto. Es:", ["Un trámite contable", "Fraude: el dinero de esas tarjetas no se puede recuperar", "Un bono para ti", "Normal en diciembre"], 1, "Las tarjetas de regalo son como efectivo: una vez enviados los códigos, se pierden."),
        ],
      },
      {
        id: "u7l2",
        title: "Facturas y proveedores",
        exercises: [
          v("u7l2e1", "Correo", "Distribuidora Lempa <cobros@distlempa.com.sv>", "Adjuntamos la factura de octubre (DTE en PDF y JSON). Los datos de pago son los mismos de siempre.", "legit", "Dominio del proveedor, formato esperado de factura electrónica y sin cambios en los datos de pago."),
          v("u7l2e2", "Correo", "Distribuidora Lempa <cobros@distlempa.com.sv>", "Por una auditoría cambiamos de banco. Desde hoy paguen a la cuenta 0099-1123-44. Es urgente para evitar recargos.", "phishing", "Aunque el dominio sea el real, el buzón pudo ser hackeado. Un cambio de cuenta con prisa se confirma por teléfono."),
          o("u7l2e3", "La factura trae un botón “Ver factura” que pide el usuario y la clave de tu correo. ¿Qué haces?", ["Pongo mi clave", "No la pongo: entro al portal oficial por mi cuenta", "La reenvío a mi jefe", "Respondo con mi clave"], 1, "Ver una factura nunca requiere la contraseña de tu correo."),
          o("u7l2e4", "¿Qué dato de una factura cambian más los estafadores?", ["El logo", "El número de cuenta bancaria", "La fecha", "El NIT del cliente"], 1, "Cambiar solo la cuenta hace que el pago real termine en manos del estafador."),
        ],
      },
      {
        id: "u7l3",
        title: "Soporte técnico falso",
        exercises: [
          v("u7l3e1", "Llamada", "Número desconocido", "“Somos de soporte técnico. Su computadora tiene un virus; instale este programa para que la revisemos a distancia.”", "phishing", "Nadie te llama para avisar de un virus. Ese programa les da control total de tu computadora."),
          o("u7l3e2", "Aparece una ventana con alarma: “Su equipo está bloqueado, llame al 800-…”. ¿Qué haces?", ["Llamo", "Cierro el navegador (forzándolo si hace falta) y no llamo", "Pago para desbloquear", "Apago el router"], 1, "Es una página web que asusta. Cerrarla basta; el número es de los estafadores."),
          v("u7l3e3", "Correo", "Mesa de ayuda <mesadeayuda@grupoatlacatl.com.sv>", "Abrimos el ticket #4471 que reportaste ayer sobre la impresora. Pasaremos a tu escritorio mañana.", "legit", "Responde a algo que tú pediste, desde el dominio de la empresa y sin pedir claves."),
          o("u7l3e4", "Alguien de “TI” te pide tu contraseña para arreglar tu cuenta. ¿Qué respondes?", ["Se la doy", "TI no necesita mi contraseña; lo confirmo con la mesa de ayuda oficial", "Se la mando por escrito", "Le doy la mitad"], 1, "El personal de TI real puede restablecer tu cuenta sin conocer tu contraseña."),
        ],
      },
    ],
  },
  {
    id: "u8",
    title: "Prueba final: nivel experto",
    description: "Trampas casi perfectas, mensajes reales que parecen falsos y un caso completo. Aquí hasta los expertos se equivocan.",
    level: "Experto",
    lessons: [
      {
        id: "u8l1",
        title: "Enlaces imposibles",
        exercises: [
          e("u8l1e1", "¿A qué sitio te lleva realmente este enlace?", ["bancoizalco.com.sv", "login-seguro.top", "A los dos", "A ninguno: no abre"], 1, "Todo lo que va antes de la “@” se trata como un nombre de usuario y se ignora. El sitio real es login-seguro.top.", "https://bancoizalco.com.sv@login-seguro.top/inicio"),
          o("u8l1e2", "La barra de direcciones muestra “xn--bancoizlco-7fg.com.sv” en lugar del nombre que esperabas. ¿Qué significa?", ["Es la versión técnica de un dominio con letras de otro alfabeto: no es bancoizalco.com.sv", "Es el sitio oficial cifrado", "Es un error del navegador, ignóralo", "Es la versión móvil del banco"], 0, "Los dominios con letras especiales (como una “а” cirílica) se escriben así por dentro. Se ven iguales al real, pero son otro sitio."),
          e("u8l1e3", "El enlace empieza con el dominio real del banco. ¿Dónde terminas?", ["En bancoizalco.com.sv", "En bancoizalco-clientes.top, tras pasar por el banco", "En ninguno", "En la app del banco"], 1, "Es una redirección: el banco te reenvía a lo que diga “destino”. Mira también lo que viene después del “?”.", "https://bancoizalco.com.sv/salir?destino=https://bancoizalco-clientes.top/clave"),
          e("u8l1e4", "¿Cuál de estos enlaces SÍ está en el sitio de la DGT (tributos.gob.sv)?", ["tributos.gob.sv.consulta-dte.com/inicio", "tributos-gob.sv/dte", "portal.tributos.gob.sv/dte/consulta?ref=tributos.gob.sv.xyz", "tributos.gob.sv-dte.com"], 2, "El dominio es lo que va antes de la primera “/”: portal.tributos.gob.sv. Lo que viene después del “?” no cambia el sitio."),
          o("u8l1e5", "Abres el adjunto “Comprobante.html” y aparece el inicio de sesión de Grupo Atlacatl. La dirección empieza con “file:///C:/Users/…”. ¿Qué pasa?", ["Es la intranet en modo sin conexión", "Es una página falsa guardada en tu computadora: lo que escribas se envía al atacante", "Es seguro porque no tiene “http”", "Es un PDF"], 1, "Un .html adjunto puede dibujar cualquier página de inicio de sesión. No hay dominio que revisar porque está en tu disco."),
          e("u8l1e6", "Expandes un enlace acortado y ves: https://mercadito.com.sv.pagos.mercadito-sv.com/confirmar. ¿Quién es el dueño de ese sitio?", ["mercadito.com.sv", "mercadito-sv.com", "com.sv", "pagos.mercadito"], 1, "Se lee de derecha a izquierda desde la primera “/”: el dominio registrado es mercadito-sv.com. Todo lo demás son subdominios que puso el estafador."),
        ],
      },
      {
        id: "u8l2",
        title: "Mensajes casi perfectos",
        exercises: [
          v("u8l2e1", "Correo", "Banco Izalco <avisos@bancoizalco.com.sv>", "Actualizamos los términos de tu cuenta. Puedes leerlos en la sección Documentos de la app. No tienes que hacer nada.", "legit", "Dominio oficial, sin enlaces ni pedidos, y te manda a la app que ya tienes. No todo es trampa."),
          v("u8l2e2", "Correo", "Banco Izalco <avisos@bancoizalco.com.sv>", "Por una actualización del sistema, responda a este correo con su usuario y clave para mantener activa su banca en línea.", "phishing", "El remitente se puede falsificar o venir de una cuenta hackeada. Lo que delata la trampa es el pedido: un banco jamás pide tu clave."),
          v("u8l2e3", "Chat", "Andrea López (contacto guardado)", "¡Hola! Te mandé por error un código de 6 dígitos a tu número, ¿me lo pasás porfa? 🙏", "phishing", "Es un contacto real con la cuenta robada. El código es para quitarte la tuya y seguir la cadena."),
          v("u8l2e4", "SMS", "BancoIzalco (código corto 2250)", "Banco Izalco: compra rechazada de $849.00 en ElectroMundo. Si no la reconoce, bloquee su tarjeta en bancoizalco-alertas.com", "phishing", "Los SMS falsos pueden aparecer en el mismo hilo que los reales. El dominio bancoizalco-alertas.com no es el del banco."),
          v("u8l2e5", "Llamada", "Aparece como 2200-1234 (el número oficial del banco)", "“Soy del área de fraudes. Para revertir el cargo le enviaré un código; léamelo para confirmar que es usted.”", "phishing", "El número que aparece en pantalla se puede falsificar. El código es para autorizar una operación con tu cuenta."),
          v("u8l2e6", "Correo", "EnvíaYa <notificaciones@enviaya.com.sv>", "Tu paquete EY-552910 no se entregó porque no había nadie. Reprograma desde la app de EnvíaYa o llama al número de nuestra web.", "legit", "Dominio oficial, no trae enlace ni cobro, y te manda a la app o a la web de siempre."),
        ],
      },
      {
        id: "u8l3",
        title: "El caso completo",
        exercises: [
          o("u8l3e1", "Trabajas en finanzas. Un proveedor de siempre escribe desde su correo real, en el mismo hilo de las facturas, y te pasa una cuenta bancaria nueva. ¿Qué haces?", ["La actualizo: el correo es el real", "Pido la carta del banco por correo", "Llamo al proveedor al número que ya teníamos registrado, no al del correo", "Pago la mitad a cada cuenta"], 2, "Si su buzón fue hackeado, el estafador responde dentro del hilo real y también puede falsificar la carta. Solo una llamada a un número conocido lo confirma."),
          o("u8l3e2", "Esa noche te llegan 15 notificaciones seguidas para aprobar un inicio de sesión que no hiciste. ¿Qué haces?", ["Apruebo una para que paren", "Rechazo todas, cambio mi contraseña y aviso a TI", "Apago el celular", "Las ignoro"], 1, "Ya tienen tu contraseña y esperan que apruebes por cansancio. Rechaza y cambia la contraseña."),
          o("u8l3e3", "Un “documento compartido” te pide entrar con tu cuenta de trabajo y luego una app llamada “Visor de PDF” pide permiso para “leer tu correo y enviar correos en tu nombre”. ¿Qué es lo peligroso?", ["Nada, es un visor", "Darle a esa app acceso a tu correo, aunque no hayas escrito tu contraseña en ningún sitio falso", "Que sea un PDF", "Que pida iniciar sesión"], 1, "Con ese permiso la app lee y envía correos por ti, incluso si cambias la contraseña después. Un visor de PDF no necesita tu correo."),
          v("u8l3e4", "Llamada", "Número desconocido", "“Soy el gerente general.” (La voz suena igual a la suya.) “Estoy en una reunión, haz hoy una transferencia a este proveedor. No me llames, no puedo hablar.”", "phishing", "Las voces se pueden clonar con IA a partir de videos o audios. “No me llames” es justo lo que impide verificar."),
          v("u8l3e5", "Correo", "Soporte TI <soporte@grupoatlacatl.com.sv>", "El viernes a las 6 p. m. haremos mantenimiento del correo. Puede que no funcione por 30 minutos. No tienes que hacer nada.", "legit", "Aviso informativo desde el dominio de la empresa, sin enlaces ni pedidos de claves."),
          o("u8l3e6", "Te das cuenta de que escribiste tu contraseña en una página falsa hace 10 minutos. ¿Qué es lo mejor?", ["Esperar a ver si pasa algo", "Cambiarla desde el sitio oficial, cerrar las sesiones abiertas, avisar a TI o al banco y revisar movimientos", "Borrar el correo para no dejar rastro", "Cambiar solo la contraseña de tu correo personal"], 1, "Actuar en minutos hace la diferencia. Avisar no es vergonzoso: ayuda a frenar el ataque para todos."),
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
