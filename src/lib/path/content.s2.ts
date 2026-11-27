/*
 * Sección 2 de la ruta: "Las fosas". Continúa después del abismo (4,000 m) por las zonas más profundas
 * del planeta hasta la Fosa de las Marianas, donde espera el Leviatán (la prueba final, en modo batalla).
 * Mismas marcas ficticias que la sección 1. La versión en inglés está en content.s2.en.ts (mismos ids).
 *
 * Los ayudantes se repiten aquí (en vez de importarlos de content.ts) para no crear una importación circular.
 */

import type { Exercise, Unit } from "./content";

type Ch = "Correo" | "SMS" | "Chat" | "Llamada";
const v = (id: string, channel: Ch, from: string, text: string, answer: "phishing" | "legit", explain: string): Exercise => ({
  id,
  kind: "veredicto",
  channel,
  from,
  text,
  answer,
  explain,
});
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
const s = (id: string, channel: Ch, from: string, parts: string[], answer: number[], explain: string): Exercise => ({
  id,
  kind: "senales",
  channel,
  from,
  parts,
  answer,
  explain,
});
const r = (id: string, prompt: string, items: string[], answer: number[], explain: string): Exercise => ({
  id,
  kind: "ordenar",
  prompt,
  items,
  answer,
  explain,
});

/** Opciones de las preguntas rápidas de la batalla (siempre en el mismo orden para responder en 5 segundos). */
export const BOSS_OPTIONS = ["Real", "Trampa"];
const b = (id: string, prompt: string, url: string, real: boolean, explain: string) => e(id, prompt, BOSS_OPTIONS, real ? 0 : 1, explain, url);

export const UNITS_S2: Unit[] = [
  {
    id: "u9",
    title: "Trabajo y compras",
    description: "Empleos que cobran por empezar, tiendas falsas, suscripciones trampa y soporte técnico falso.",
    level: "Avanzado",
    lessons: [
      {
        id: "u9l1",
        title: "Empleos falsos",
        exercises: [
          v("u9l1e1", "Chat", "Reclutadora Ana · Empleos Global", "¡Felicidades! Fuiste seleccionado para trabajar desde casa ganando $45 al día dando “me gusta” a videos. Para activar tu cuenta deposita $25.", "phishing", "Un empleo real no te cobra por empezar. Después piden más depósitos para “liberar” tus ganancias."),
          v("u9l1e2", "Correo", "RRHH Grupo Atlacatl <rrhh@grupoatlacatl.com>", "Gracias por postularte al puesto de Asistente Contable. Te esperamos el martes a las 10 a. m. en nuestras oficinas para la entrevista. Trae tu currículum impreso.", "legit", "Dominio de la empresa, una entrevista en persona y nada de pagos ni datos bancarios: así se ve un proceso real."),
          o("u9l1e3", "Una empresa te ofrece trabajo sin entrevista y te pide foto de tu documento de identidad por ambos lados y una selfie “para el contrato”. ¿Qué haces?", ["Las mando: es para el contrato", "Mando solo el frente", "No mando nada hasta verificar la empresa por su sitio oficial y conocerlos en persona", "Las mando borrosas"], 2, "Con tu documento y una selfie pueden abrir cuentas o pedir préstamos a tu nombre. Una empresa real te entrevista primero."),
          s("u9l1e4", "Chat", "+44 7700 900123", ["Hola, soy Laura de Talento Global.", "Vimos tu perfil y, sin entrevista, el puesto de $1,200 al mes es tuyo.", "Solo debes pagar $30 por el curso de inducción.", "Responde rápido: quedan 2 cupos."], [1, 2, 3], "Trabajo sin entrevista, un pago para empezar y prisa por los “cupos”. Que alguien se presente con nombre no lo vuelve real."),
          o("u9l1e5", "¿Cuál de estas ofertas de empleo es la más creíble?", ["Te cobran $20 por el uniforme antes de la entrevista", "Ganas $300 a la semana solo reenviando paquetes desde tu casa", "Una empresa con sitio oficial te cita a entrevista y no te pide pagos", "Te contratan por chat sin conocerte y piden tu cuenta bancaria para pagarte por adelantado"], 2, "Cobrar por empezar, reenviar paquetes (puede ser lavado de dinero) o pagarte por adelantado sin conocerte son señales clásicas."),
        ],
      },
      {
        id: "u9l2",
        title: "Tiendas falsas y ofertas",
        exercises: [
          v("u9l2e1", "Chat", "ElectroMundo Ofertas 🔥 (página creada hace 6 días)", "BLACK FRIDAY: televisores de 55” a $89. Solo hoy. Paga por transferencia y te lo enviamos gratis.", "phishing", "Página nueva, precio imposible y solo transferencia (sin protección para el comprador): clásica tienda falsa de temporada."),
          e("u9l2e2", "Buscas las ofertas de Súper La Ceiba (laceiba.com). ¿Cuál enlace es de verdad?", ["laceiba-ofertas.shop", "laceiba.com/ofertas", "laceiba.com.descuentos.store", "super-laceiba.com"], 1, "Solo laceiba.com/ofertas está en el dominio de la tienda. Los demás usan el nombre en dominios de otros."),
          v("u9l2e3", "Correo", "Mercadito <ventas@mercadito.com>", "Tu compra #MK-48213 fue confirmada. Llegará entre el 3 y el 5 de diciembre. Puedes seguirla en la app.", "legit", "Dominio oficial, datos concretos de una compra que hiciste y sin pedirte pagos extra."),
          r("u9l2e4", "Encontraste una tienda en línea que no conocías con precios muy bajos. Ordena qué hacer antes de comprar:", ["Pagar con tarjeta o un método que te deje reclamar", "Buscar opiniones o el nombre de la tienda junto a la palabra “estafa”", "Revisar el dominio y desde cuándo existe la página", "Desconfiar si solo aceptan transferencia o cripto"], [2, 1, 3, 0], "Primero mira quién es (dominio y antigüedad), luego qué dice la gente, desconfía de pagos sin protección y, si todo cuadra, paga con un método que te deje reclamar."),
          s("u9l2e5", "SMS", "Número desconocido 7012-4455", ["Mercadito:", "tu pedido tiene un saldo pendiente de $2.10.", "Págalo hoy o se cancelará en", "mercadito.pagos-pendientes.shop"], [1, 2, 3], "Un cobro pequeño inesperado, una amenaza de cancelación y un dominio que no es mercadito.com. Revisa tus pedidos solo en la app."),
        ],
      },
      {
        id: "u9l3",
        title: "Suscripciones y soporte falso",
        exercises: [
          v("u9l3e1", "Correo", "Streamflix <facturacion@streamflix-cuenta.com>", "Tu membresía fue suspendida por un problema con el pago. Actualiza tu tarjeta en las próximas 24 horas para no perder tus perfiles.", "phishing", "El dominio no es el del servicio, hay prisa y te piden la tarjeta por un enlace. Revisa tu cuenta entrando tú a la app."),
          v("u9l3e2", "Llamada", "Número desconocido", "“Le llamamos de Soporte Técnico. Su computadora está enviando virus. Instale este programa para que la arreglemos a distancia.”", "phishing", "Ningún soporte real te llama de la nada por un virus. El programa le da control total de tu equipo al estafador."),
          o("u9l3e3", "En tu pantalla aparece “¡Tu equipo está infectado! Llama YA al 800-555-0199” con una alarma sonando. ¿Qué haces?", ["Llamo al número", "Cierro el navegador (aunque tenga que forzarlo) y no llamo", "Instalo lo que me pidan", "Pago la licencia que me ofrecen"], 1, "Son páginas que asustan con sonidos y ventanas. Cierra el navegador: tu equipo no te avisa de virus con un número de teléfono."),
          v("u9l3e4", "Correo", "Streamflix <info@streamflix.com>", "Tu plan cambia de precio a partir de enero. Puedes ver los detalles o cancelar cuando quieras desde Cuenta, en la app.", "legit", "Dominio oficial, no pide datos y te manda a la app. Avisar de un cambio de precio es normal."),
          s("u9l3e5", "Chat", "Soporte Mercadito ✅", ["Hola, vimos un problema con tu cuenta.", "Para resolverlo, instala la app “AyudaRemota”", "y dinos el código que te llegó por SMS.", "Si no, tu cuenta se cerrará hoy."], [1, 2, 3], "Te piden instalar acceso remoto y el código de verificación, y te amenazan con cerrar tu cuenta. Cualquiera puede poner ✅ en su nombre."),
        ],
      },
    ],
  },
  {
    id: "u10",
    title: "Dinero e inversiones",
    description: "Inversiones milagro, cripto, préstamos falsos, billeteras y códigos QR alterados.",
    level: "Avanzado",
    lessons: [
      {
        id: "u10l1",
        title: "Inversiones milagro y cripto",
        exercises: [
          v("u10l1e1", "Chat", "Asesor Kevin 📈 Cripto Élite", "Con nuestro robot de trading con IA ganas 8% diario garantizado. Mira las capturas de mis clientes 👇 Empieza hoy con $100.", "phishing", "Nadie puede garantizar ganancias diarias. Las capturas se inventan y “IA” es solo el gancho de moda."),
          o("u10l1e2", "Un amigo te invita a una inversión que paga 20% al mes, y ganas más si invitas a otras personas. ¿Qué es?", ["Una buena oportunidad", "Un esquema piramidal: paga a los primeros con el dinero de los nuevos", "Un fondo de inversión normal", "Un ahorro a plazo fijo"], 1, "Ganancias altísimas y premios por reclutar son la marca de una pirámide. Cuando deja de entrar gente, se cae."),
          v("u10l1e3", "Correo", "Billetera Tunco <alertas@billeteratunco.com>", "Tu billetera aún no tiene activada la verificación en dos pasos. Puedes activarla en Ajustes > Seguridad, dentro de la app.", "legit", "Dominio oficial, sin enlaces ni pedidos de datos, y te manda a la app. Recomendarte seguridad es normal."),
          s("u10l1e4", "Chat", "Mentor Cripto 💎", ["Tu inversión ya generó $2,340.", "Para retirarla debes pagar primero $180 de impuestos.", "Hazlo hoy o se congela tu cuenta.", "Te envío la billetera para el depósito."], [0, 1, 2, 3], "Ganancias que no existen, pagar para “retirar”, prisa y otro depósito: así exprimen a quien ya invirtió. Si tienes que pagar para sacar tu dinero, no hay dinero."),
          o("u10l1e5", "Perdiste dinero en una estafa de inversión y te escribe una “firma de abogados” que promete recuperarlo por un adelanto de $200. ¿Qué es?", ["Una ayuda legítima", "Una segunda estafa dirigida a víctimas", "Un trámite del banco", "Un seguro"], 1, "Los estafadores venden listas de víctimas. Nadie serio cobra por adelantado para “recuperar” dinero: acude a tu banco y a la policía."),
        ],
      },
      {
        id: "u10l2",
        title: "Préstamos y billeteras",
        exercises: [
          v("u10l2e1", "SMS", "Número desconocido 7600-3321", "PRÉSTAMO APROBADO por $1,500 sin revisar tu historial. Paga $35 de seguro para recibirlo hoy: prestamoya-sv.online", "phishing", "Un préstamo real no te cobra antes de dártelo, y “sin revisar nada” no existe. El dominio .online tampoco es de un banco."),
          v("u10l2e2", "SMS", "BancoIzalco (código corto 2250)", "Tu solicitud de préstamo #PR-20981 está en revisión. Te contactaremos por la app o en tu agencia.", "legit", "Responde a algo que tú pediste, no trae enlace ni pide pagos y te manda a la app o a la agencia."),
          o("u10l2e3", "Te depositan $40 por error en tu billetera y alguien te pide devolverlos a OTRA cuenta. ¿Qué haces?", ["Los devuelvo rápido a esa cuenta", "No mando nada por mi cuenta: reporto la operación a la billetera para que ella la revierta", "Los gasto", "Le pido el doble"], 1, "Puede ser dinero robado o un depósito que luego se revierte. La billetera revierte lo que llegó por error; tú no mandas nada."),
          e("u10l2e4", "¿Cuál es la página real para entrar a Billetera Tunco (billeteratunco.com)?", ["billeteratunco.com.login-app.net", "app.billeteratunco.com/entrar", "billeteratunco-app.com/entrar", "billetera-tunco.com/entrar"], 1, "app.billeteratunco.com es un subdominio de billeteratunco.com. En el primero, el dominio real es login-app.net."),
          r("u10l2e5", "Te robaron el celular donde tienes la billetera y el banco. Ordena qué hacer:", ["Cambiar las contraseñas desde otro dispositivo", "Llamar al banco y a la billetera para bloquear las cuentas", "Pedir a tu compañía telefónica que bloquee el chip", "Revisar movimientos y denunciar el robo"], [1, 2, 0, 3], "Lo primero es bloquear el dinero y el chip (con él reciben tus códigos), luego cambiar claves y, al final, revisar y denunciar."),
        ],
      },
      {
        id: "u10l3",
        title: "Pagos con QR",
        exercises: [
          o("u10l3e1", "En un restaurante, el QR para pagar está pegado encima de otro QR. ¿Qué haces?", ["Lo escaneo igual", "Pido al personal que lo confirme o pago de otra forma", "Escaneo el de abajo", "Le tomo foto para después"], 1, "Pegar un QR falso encima del real es un truco común: te lleva a una página de pago falsa. Confírmalo con el personal."),
          e("u10l3e2", "Escaneas el QR de un parqueo y se abre esta dirección. ¿Es de la alcaldía (alcaldia.gob)?", ["Sí, es de la alcaldía", "No: el dominio real es pagoparqueo.click", "Sí, porque empieza con “alcaldia.gob”", "No se puede saber"], 1, "El dominio real es pagoparqueo.click; “alcaldia.gob” es solo el comienzo del nombre. Revisa siempre la dirección que abre un QR.", "https://alcaldia.gob.pagoparqueo.click/pagar"),
          v("u10l3e3", "Chat", "Comprador en Mercadito", "Para pagarte el producto, escanea este QR con tu app de Billetera Tunco y confirma con tu PIN.", "phishing", "Para recibir dinero nunca escaneas nada ni pones tu PIN: ese QR es una orden de pago desde tu cuenta."),
          v("u10l3e4", "SMS", "Billetera Tunco", "Recibiste $25.00 de Carlos M. por un pago con QR en tu billetera.", "legit", "Solo te informa que recibiste dinero, sin enlace ni pedidos. Si dudas, confírmalo en la app."),
          s("u10l3e5", "Correo", "Agencia Tributaria <avisos@tributos-gob.com>", ["Agencia Tributaria:", "tiene una multa pendiente de $45.", "Escanee el QR adjunto para pagar con descuento.", "Si no paga en 48 horas, el monto se triplica."], [2, 3], "El dominio tributos-gob.com no es tributos.gob, el QR te lleva a pagar fuera del portal y la amenaza de triplicar es para que no lo pienses."),
        ],
      },
    ],
  },
  {
    id: "u11",
    title: "Redes y relaciones",
    description: "Estafas románticas, chantaje, perfiles falsos y cuentas robadas.",
    level: "Avanzado",
    lessons: [
      {
        id: "u11l1",
        title: "Estafa romántica",
        exercises: [
          v("u11l1e1", "Chat", "Daniel (te escribe desde hace 3 semanas)", "Amor, me retuvieron en aduana un paquete con regalos para ti. Necesito que pagues $300 y te lo devuelvo cuando nos veamos ❤️", "phishing", "Semanas de cariño, nunca una videollamada y de pronto un problema que solo tu dinero resuelve: el guion clásico de la estafa romántica."),
          o("u11l1e2", "¿Cuál es la señal más fuerte de que un perfil romántico en línea es falso?", ["Escribe con faltas", "Siempre tiene una excusa para no hacer videollamada y al final pide dinero", "Vive en otra ciudad", "Le gusta tu música"], 1, "Evitar la cámara y terminar pidiendo dinero es el patrón. Las fotos suelen ser robadas o hechas con IA."),
          v("u11l1e3", "Chat", "Sofía (la conociste en una app de citas)", "¿Nos vemos el sábado en el centro comercial? Te mando mi ubicación cuando llegue 😊", "legit", "Propone verse en un lugar público y no pide dinero ni datos. (Igual, avisa a alguien de confianza.)"),
          s("u11l1e4", "Chat", "Capitán James Miller 🎖️", ["Hola, ¿cómo estuvo tu día?", "Me enamoré de ti con solo leerte.", "Estoy en una plataforma petrolera y no puedo usar mi tarjeta,", "¿me envías $500 por remesa para volver a casa?"], [1, 2, 3], "Amor demasiado rápido, una excusa para no poder pagar y un pedido de dinero. Saludar con cariño no es la señal; lo que viene después sí."),
          r("u11l1e5", "Sospechas que tu tía está en una estafa romántica. Ordena qué hacer:", ["Ayudarla a reportar el perfil y avisar al banco si ya envió dinero", "Hablar con calma, sin culparla", "Buscar juntas las fotos del perfil en internet (búsqueda inversa)", "Proponer una videollamada con esa persona"], [1, 3, 2, 0], "Primero hablar sin juzgar, luego probar (videollamada y búsqueda de fotos) y, si se confirma, reportar y proteger su dinero."),
        ],
      },
      {
        id: "u11l2",
        title: "Chantaje y sextorsión",
        exercises: [
          v("u11l2e1", "Correo", "Tu propio correo (marta.lopez@correo.com)", "Tengo acceso a tu cámara y grabé videos tuyos. Paga $500 en bitcoin en 48 horas o los envío a todos tus contactos.", "phishing", "Es un correo masivo: falsifican el remitente (incluso tu propio correo) y a veces muestran una contraseña vieja filtrada, pero no tienen ningún video. No pagues ni respondas."),
          o("u11l2e2", "Alguien te amenaza con publicar fotos íntimas tuyas si no le pagas. ¿Qué es lo mejor?", ["Pagar para que se detenga", "No pagar, dejar de responder, guardar pruebas, reportar la cuenta y pedir ayuda (familia o policía)", "Borrar todo y no contárselo a nadie", "Negociar un precio menor"], 1, "Pagar no lo detiene: piden más. Guarda capturas, bloquea, reporta y busca apoyo. No es tu culpa."),
          v("u11l2e3", "Chat", "Prima Laura (contacto guardado)", "Oye, alguien está usando mis fotos en un perfil falso para pedir dinero. Si te escribe, no le hagas caso y repórtalo 🙏", "legit", "Un contacto conocido que avisa de una suplantación sin pedirte nada. Si dudas, confírmalo llamándola."),
          s("u11l2e4", "Chat", "Número desconocido", ["Hola, ¿eres tú la de esta foto?", "Si no me depositas $200 en 1 hora,", "se la mando a tu familia y a tu trabajo.", "Responde rápido."], [1, 2, 3], "Plazo corto, amenaza y pedido de dinero: es extorsión. No pagues; guarda pruebas, bloquea y reporta."),
          o("u11l2e5", "¿Por qué un estafador quiere pasar rápido la conversación de una red social a WhatsApp o Telegram?", ["Porque es más cómodo", "Para salir de la plataforma que podría detectar y bloquear su cuenta", "Porque tiene mejor señal", "Porque es obligatorio"], 1, "Fuera de la red social nadie modera la conversación ni puede bloquear su perfil por reportes."),
        ],
      },
      {
        id: "u11l3",
        title: "Perfiles falsos y cuentas robadas",
        exercises: [
          v("u11l3e1", "Chat", "Andrea López (contacto guardado)", "¡Ayúdame a ganar un concurso! Te va a llegar un código por SMS, mándamelo porfa 🙏", "phishing", "Es el robo de cuentas en cadena: el código sirve para registrar TU WhatsApp en otro celular. Su cuenta ya fue robada."),
          v("u11l3e2", "Chat", "Súper La Ceiba (perfil oficial, 250 mil seguidores)", "Nuestro sorteo de diciembre se publica en laceiba.com/sorteos. Nunca pedimos pagos para entregar premios.", "legit", "Te manda a su dominio oficial y aclara que no cobra por premios. Igual, entra escribiendo tú la dirección."),
          o("u11l3e3", "Un perfil con el nombre y la foto de tu amigo te agrega de nuevo, aunque ya son amigos. ¿Qué es lo más probable?", ["Abrió una segunda cuenta para el trabajo", "Un perfil clonado para pedirle dinero a sus contactos", "Un error de la red social", "Nada importante"], 1, "Clonan el perfil para engañar a sus contactos. Confírmalo con tu amigo por otro medio y reporta el perfil."),
          e("u11l3e4", "Te llega un enlace para recuperar tu cuenta de la red social Conecta (conecta.com). ¿Cuál es real?", ["conecta.com.recuperar-cuenta.net", "conecta-soporte.com", "help.conecta.com/recuperar", "conecta.help-center.xyz"], 2, "help.conecta.com pertenece a conecta.com. Los demás usan el nombre en dominios ajenos."),
          r("u11l3e5", "Te robaron tu cuenta de WhatsApp. Ordena qué hacer:", ["Avisar a tus contactos que no respondan pedidos de dinero", "Volver a registrar tu número en WhatsApp para recuperar el acceso", "Activar la verificación en dos pasos con un PIN", "Pedir ayuda en el soporte oficial si no logras entrar"], [1, 0, 3, 2], "Primero intenta recuperar tu número, avisa a tus contactos, pide ayuda al soporte oficial si no puedes y, al volver, activa la verificación en dos pasos."),
        ],
      },
    ],
  },
  {
    id: "u12",
    title: "IA y deepfakes",
    description: "Voces clonadas, videos falsos y chatbots que se hacen pasar por personas o empresas.",
    level: "Avanzado",
    lessons: [
      {
        id: "u12l1",
        title: "Voces clonadas",
        exercises: [
          v("u12l1e1", "Llamada", "Número desconocido", "(La voz es idéntica a la de tu hijo.) “Ma, choqué el carro y me tienen detenido. Manda $800 a esta cuenta, no le digas a papá.”", "phishing", "Con unos segundos de audio de redes sociales se clona una voz. Cuelga y llama tú a su número de siempre o pide la palabra clave familiar."),
          o("u12l1e2", "¿Cuál es la mejor defensa familiar contra las voces clonadas con IA?", ["No subir nunca fotos", "Acordar una palabra clave secreta que se pide en emergencias", "Cambiar de número cada mes", "Contestar solo de noche"], 1, "Una palabra que solo conoce tu familia no la puede adivinar la IA. Pídela si te llaman con urgencia."),
          v("u12l1e3", "Llamada", "Banco Izalco (2200-1234)", "“Le llamamos por una compra de $45 en Súper La Ceiba. Si la reconoce, no tiene que hacer nada. Si no, llame al número de su tarjeta.”", "legit", "No te pide códigos, claves ni datos, y te manda al número de tu tarjeta. Así avisa un banco real."),
          s("u12l1e4", "Llamada", "Aparece como “Jefe Roberto”", ["Hola, soy Roberto.", "Estoy en una reunión con el cliente,", "necesito que pagues hoy esta factura a una cuenta nueva.", "No me llames, te escribo después."], [2, 3], "Que la voz suene igual no prueba nada. Una cuenta nueva, la prisa y el “no me llames” son las señales. Confírmalo por otro canal."),
          r("u12l1e5", "Te llama un familiar con voz desesperada pidiendo dinero urgente. Ordena qué hacer:", ["Llamarle tú al número que ya tenías guardado", "Colgar sin enviar nada", "Avisar al resto de la familia", "Pedirle la palabra clave familiar"], [3, 1, 0, 2], "Pide la palabra clave; si no la sabe o dudas, cuelga sin enviar nada, llama tú a su número de siempre y avisa a la familia."),
        ],
      },
      {
        id: "u12l2",
        title: "Videos falsos (deepfakes)",
        exercises: [
          v("u12l2e1", "Chat", "Canal “Noticias Finanzas HD”", "VIDEO: el presidente de Banco Izalco recomienda esta plataforma que duplica tu dinero en 7 días 👉 invierte-ya.top", "phishing", "Los videos de famosos o directivos se falsifican con IA. Nadie serio promete duplicar tu dinero, y ese enlace no es de ningún banco."),
          o("u12l2e2", "¿Qué detalle puede delatar un video falso hecho con IA?", ["Que tenga buena iluminación", "Labios que no coinciden con la voz, parpadeos raros o bordes borrosos en la cara", "Que dure más de un minuto", "Que tenga subtítulos"], 1, "Los deepfakes fallan en detalles: boca desincronizada, piel demasiado lisa, parpadeos extraños. Pero mejoran rápido: lo más seguro es verificar la fuente."),
          o("u12l2e3", "En una videollamada tu jefe se ve real, pero pide una transferencia urgente y la imagen se congela cuando le preguntas algo personal. ¿Qué haces?", ["Transfiero", "Cuelgo y lo confirmo por un canal conocido antes de hacer nada", "Mando la mitad", "Le pido que repita la petición"], 1, "Ya existen videollamadas falsas en vivo. Ante dinero urgente, confirma siempre por otro canal."),
          v("u12l2e4", "Correo", "Grupo Atlacatl <comunicaciones@grupoatlacatl.com>", "Esta semana publicamos en la intranet el video del gerente con el balance del año. Lo puedes ver en la sección Avisos.", "legit", "Dominio de la empresa, te manda a la intranet que ya usas y no pide nada."),
          s("u12l2e5", "Chat", "Famoso Oficial 🌟 (perfil de 3 días)", ["Hola, soy yo en este video 👇", "Estoy regalando $1,000 a mis seguidores.", "Solo paga $15 de envío para recibirlo.", "Escríbele a mi asistente: +1 555 0147"], [1, 2, 3], "Regalo que no buscaste, un cobro “de envío” y un número extranjero: el video puede ser falso, pero las señales son las de siempre."),
        ],
      },
      {
        id: "u12l3",
        title: "Chatbots y soporte con IA",
        exercises: [
          v("u12l3e1", "Chat", "Asistente Virtual Banco Izalco 🤖", "Hola, soy la IA del banco. Para desbloquear tu cuenta escribe tu número de tarjeta, la fecha de vencimiento y el código de 3 dígitos.", "phishing", "Ningún asistente, humano o IA, necesita tu tarjeta completa y el código de seguridad. Un chat amable y rápido puede ser 100% falso."),
          o("u12l3e2", "Buscas “soporte Billetera Tunco” y el primer resultado es un anuncio con un número de WhatsApp. ¿Qué haces?", ["Escribo a ese número", "Entro a billeteratunco.com o a la app y uso el contacto oficial", "Llamo al primer número que aparezca", "Le doy mis datos al que responda más rápido"], 1, "Los estafadores pagan anuncios con números de “soporte”. Usa solo el contacto que aparece en la app o en el sitio oficial."),
          v("u12l3e3", "Correo", "Banco Izalco <avisos@bancoizalco.com>", "Ahora puedes chatear con nuestro asistente virtual dentro de la app. Nunca te pedirá tu clave ni códigos.", "legit", "Dominio oficial, te manda a la app y deja claro qué nunca te pedirá."),
          o("u12l3e4", "Un correo de phishing escrito con IA no tiene faltas y usa tu nombre. ¿En qué te fijas entonces?", ["En que tenga faltas", "En el dominio, en lo que te pide y en la prisa", "En el logo", "En la hora de envío"], 1, "La IA escribe perfecto. Lo que no puede cambiar es que el dominio no sea el real, que te pida datos o que te apure."),
          s("u12l3e5", "Chat", "Soporte Streamflix 🤖", ["¡Hola, Marta! Soy tu asistente.", "Tu cuenta tiene un cobro duplicado de $12.", "Para devolvértelo, instala la app “ReembolsoRápido”", "y comparte tu pantalla mientras entras al banco."], [2, 3], "Usa tu nombre y un problema creíble, pero instalar una app y compartir pantalla con tu banco abierto les da acceso a todo."),
        ],
      },
    ],
  },
  {
    id: "u13",
    title: "El Leviatán de las Marianas",
    description: "La prueba final: trampas casi perfectas y el enfrentamiento contra el Leviatán. Aquí no llega la luz.",
    level: "Experto",
    lessons: [
      {
        id: "u13l1",
        title: "Ataques combinados",
        exercises: [
          o("u13l1e1", "Te llega un SMS del banco con un código que no pediste y, un minuto después, te llama el “banco” para “cancelar la operación”. ¿Qué está pasando?", ["Una coincidencia", "Están intentando entrar a tu cuenta y necesitan que les dictes ese código", "El banco te está protegiendo", "Es un error del sistema"], 1, "El SMS es real porque el estafador inició la operación con tu clave. La llamada es para que le dictes el código. Cuelga y llama tú al banco."),
          e("u13l1e2", "¿A qué sitio te lleva este enlace?", ["bancoizalco.com", "bancoizalco-seguro.top", "A los dos", "A ninguno"], 1, "Todo lo que va antes de la “@” se ignora, aunque traiga caracteres codificados como %2F. El sitio real es bancoizalco-seguro.top.", "https://bancoizalco.com%2Flogin@bancoizalco-seguro.top"),
          v("u13l1e3", "Correo", "Distribuidora Lempa <cobros@distlempa.com>", "Por auditoría cambiamos de banco. Adjuntamos la carta firmada con la nueva cuenta para el pago de la factura de diciembre.", "phishing", "El correo puede ser real (buzón hackeado) y la carta también se falsifica. Un cambio de cuenta solo se confirma llamando al número que ya tenías."),
          v("u13l1e4", "SMS", "BancoIzalco (código corto 2250)", "Tu código para autorizar la transferencia de $1,250 a la cuenta ****8812 es 448190. Si no la estás haciendo tú, NO lo compartas.", "legit", "El mensaje es real: viene del código corto del banco y no trae enlace. Pero si tú no estás transfiriendo, alguien tiene tu clave: no compartas el código y llama al banco."),
          o("u13l1e5", "Entras a un sitio idéntico al de tu banco: tiene candado y la dirección es bancoizalco.com-seguridad.net. ¿El candado lo vuelve seguro?", ["Sí, el candado garantiza que es el banco", "No: el candado solo cifra la conexión, no dice quién es el dueño", "Sí, si el logo es el correcto", "Solo en el celular"], 1, "Cualquier sitio, incluso uno falso, puede tener candado. Lo que importa es el dominio: aquí es com-seguridad.net."),
          s("u13l1e6", "Correo", "Banco Izalco <avisos@bancoizalco.com>", ["Hola, Marta:", "Por seguridad, cambiamos tu método de verificación.", "Desde hoy ya no recibirás códigos por SMS;", "usa la app para aprobar tus operaciones."], [], "No hay señales: dominio oficial, no te pide datos ni enlaces, y te manda a la app. Una noticia inesperada no siempre es trampa."),
          r("u13l1e7", "Un compañero hizo clic en un enlace de phishing en la computadora del trabajo. Ordena qué hacer:", ["Cambiar su contraseña desde otro equipo", "Desconectar el equipo de la red", "Avisar de inmediato al área de TI", "Revisar con TI si se instaló algo y qué cuentas se tocaron"], [1, 2, 0, 3], "Primero aislar el equipo, avisar a TI, cambiar la contraseña desde un equipo limpio y luego revisar juntos el alcance."),
        ],
      },
      {
        id: "u13l2",
        title: "Lo real que parece trampa",
        exercises: [
          v("u13l2e1", "SMS", "Agencia Tributaria (código corto 1111)", "URGENTE: hoy vence el plazo de tu declaración anual. Hazla en el portal de siempre para evitar multas.", "legit", "Asusta y dice “urgente”, pero no trae enlace ni pide datos y te manda al portal que conoces. La prisa sola no lo vuelve trampa."),
          v("u13l2e2", "Correo", "Banco Izalco <seguridad@bancoizalco.com>", "Bloqueamos tu tarjeta por una compra sospechosa en otro país. Para desbloquearla, llama al número que está detrás de tu tarjeta.", "legit", "Dominio oficial y te manda al número de tu tarjeta, no a un enlace ni a un número del mensaje."),
          v("u13l2e3", "Chat", "Mamá (contacto guardado)", "Hija, ¿me pasas el código que te llegó? Es que estoy cambiando de celular y WhatsApp me lo pide 🙏", "phishing", "Aunque sea su contacto real, puede estar robado. WhatsApp manda el código al número de quien cambia de celular, nunca al tuyo."),
          e("u13l2e4", "¿Cuál de estos es el inicio de sesión real de Grupo Atlacatl (grupoatlacatl.com)?", ["login.microsoftonline.grupoatlacatl-sso.com", "grupoatlacatl.com.sso-login.net", "sso.grupoatlacatl.com/login?redirect=intranet", "grupoatlacatl-login.com"], 2, "sso.grupoatlacatl.com es un subdominio de la empresa; lo que va después del “?” no cambia el sitio."),
          v("u13l2e5", "Correo", "EnvíaYa <notificaciones@enviaya.com>", "Tu paquete requiere el pago de $4.50 de impuestos de importación. Págalo desde la app de EnvíaYa, en Mis envíos > Pendientes.", "legit", "Hay un cobro, pero te manda a pagarlo dentro de la app oficial, no a un enlace. Si dudas, revísalo en la app sin usar el correo."),
          s("u13l2e6", "SMS", "BancoIzalco (código corto 2250)", ["Banco Izalco:", "compra de $1.00 en VERIFICACION-TARJETA.", "Si no la reconoces, entra a", "bancoizalco.com.cargo-revision.top"], [2, 3], "Aparece en el mismo hilo que tus SMS reales del banco, pero te manda a cargo-revision.top. Un banco real te manda al número de tu tarjeta, no a un enlace."),
          o("u13l2e7", "¿Cuál de estas acciones es SIEMPRE segura ante un mensaje que dice ser de tu banco?", ["Responder al mensaje preguntando si es real", "Tocar el enlace solo para mirar", "Abrir tú la app del banco o llamar al número de tu tarjeta", "Llamar al número que viene en el mensaje"], 2, "Responder, tocar el enlace o llamar al número del mensaje te deja en manos del estafador. Usa siempre un canal que tú ya conoces."),
        ],
      },
      {
        id: "u13l3",
        title: "Enfrentamiento: el Leviatán",
        boss: true,
        exercises: [
          b("u13l3e1", "¿Es el sitio de Banco Izalco?", "https://login.bancoizalco.com/entrar", true, "login.bancoizalco.com es un subdominio del banco: es real."),
          b("u13l3e2", "¿Es el sitio de Banco Izalco?", "https://bancoizalco.com.login-seguro.top", false, "El dominio real es login-seguro.top; “bancoizalco.com” es solo el comienzo del nombre."),
          b("u13l3e3", "¿Es el sitio de Banco Izalco?", "https://bancoizaIco.com/entrar", false, "Es una I mayúscula en lugar de la l: bancoizaIco.com es otro dominio."),
          b("u13l3e4", "¿Es el sitio de Banco Izalco?", "https://bancoizalco.com@entrar-seguro.net", false, "Lo que va antes de la “@” se ignora: el sitio real es entrar-seguro.net."),
          b("u13l3e5", "¿Es el sitio de Banco Izalco?", "https://bancoizalco.com/ayuda?ref=premios-izalco.top", true, "El dominio es bancoizalco.com; lo que va después del “?” no cambia el sitio."),
          b("u13l3e6", "¿Es el sitio de Banco Izalco?", "https://bancoizalco-com.net/clientes", false, "bancoizalco-com.net es un dominio distinto: el guion lo cambia todo."),
          b("u13l3e7", "¿Es de la Agencia Tributaria (tributos.gob)?", "https://portal.tributos.gob/declaracion", true, "portal.tributos.gob es un subdominio oficial."),
          b("u13l3e8", "¿Es de la Agencia Tributaria (tributos.gob)?", "https://tributos.gob.pagos-sv.com/multa", false, "El dominio real es pagos-sv.com; “tributos.gob” es solo el comienzo."),
          b("u13l3e9", "¿Es de Billetera Tunco (billeteratunco.com)?", "https://xn--billeteratnco-7kb.com", false, "“xn--” delata un dominio con letras de otro alfabeto que imita al real."),
          b("u13l3e10", "¿Es de Billetera Tunco (billeteratunco.com)?", "https://app.billeteratunco.com/pagar", true, "app.billeteratunco.com es un subdominio de la billetera: es real."),
          b("u13l3e11", "¿Es de Mercadito (mercadito.com)?", "https://mercadito.com.co/ofertas", false, "mercadito.com.co es otro dominio (termina en .com.co), no mercadito.com."),
          b("u13l3e12", "¿Es de Mercadito (mercadito.com)?", "https://ayuda.mercadito.com/pedidos", true, "ayuda.mercadito.com es un subdominio de mercadito.com: es real."),
        ],
      },
    ],
  },
];
