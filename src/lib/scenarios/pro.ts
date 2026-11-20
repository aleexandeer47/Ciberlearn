import type { Scenario } from "./types";

/*
 * Pack Pro: mensajes más difíciles. Solo se envían al navegador de cuentas Pro
 * (las páginas que los usan revisan el plan en el servidor).
 * Marcas ficticias nuevas: Mercadito (compraventa), Billetera Tunco (pagos),
 * Supermercados La Ceiba y Distribuidora Lempa (proveedor).
 */

export const PRO_SCENARIOS: Scenario[] = [
  {
    id: "mercadito-comprador",
    channel: "chat",
    verdict: "phishing",
    difficulty: 3,
    context: "Publicaste tu bicicleta en Mercadito por $180. Te escribe un supuesto comprador.",
    from: { name: "Carlos M.", address: "Comprador en Mercadito" },
    time: "19:40",
    body: [
      ["¡Buenas! Me interesa la bici, la compro al precio que pide."],
      [{ t: "Ya le hice el pago por Mercadito Pagos, para recibirlo solo tiene que confirmar sus datos aquí:", s: "yapague" }],
      [{ t: "mercadito-pagos-sv.com/recibir/48291", s: "enlace", href: "https://mercadito-pagos-sv.com/recibir/48291" }],
      [{ t: "Le va a pedir los datos de su tarjeta para depositarle, es normal.", s: "tarjeta" }],
      [{ t: "Apúrese porque el enlace vence en 30 minutos y se cancela la compra.", s: "urgencia" }],
    ],
    signals: [
      {
        id: "yapague",
        category: "contexto",
        title: "“Ya te pagué” sin ver nada",
        explanation:
          "Un comprador real pregunta, negocia o quiere ver la bici. Decir que ya pagó antes de conocer el producto es el gancho de esta estafa.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "Sitio que imita a la plataforma",
        explanation:
          "mercadito-pagos-sv.com no es Mercadito: es un dominio aparte. Si un pago fuera real, lo verías dentro de la app, no en un enlace que te mandan por chat.",
      },
      {
        id: "tarjeta",
        category: "solicitud",
        title: "Tarjeta para recibir dinero",
        explanation:
          "Para recibir dinero nunca necesitas dar el número, la fecha y el CVV de tu tarjeta. Con eso te pueden cobrar a ti.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "Plazo de 30 minutos",
        explanation: "La prisa evita que revises la app y notes que no hay ningún pago.",
      },
    ],
    takeaway:
      "Al vender en línea, confirma los pagos dentro de la app o de tu banco. Si te piden datos de tu tarjeta para pagarte, es estafa.",
  },
  {
    id: "dte-proveedor",
    channel: "email",
    verdict: "phishing",
    difficulty: 3,
    context:
      "Trabajas en contabilidad de Grupo Atlacatl. Distribuidora Lempa es proveedor real y escribe desde @distlempa.com.sv.",
    from: { name: "Facturación Distribuidora Lempa", address: { t: "facturacion@distlempa-dte.com", s: "dominio" } },
    subject: ["DTE pendiente de pago: Factura electrónica 0031-2291"],
    time: "11:18",
    body: [
      ["Estimados, adjuntamos el documento tributario electrónico de la compra de octubre."],
      [{ t: "Les informamos que cambiamos de banco: a partir de hoy los pagos deben hacerse a la nueva cuenta indicada en el documento.", s: "cuenta" }],
      ["Para ver el DTE, abra el archivo adjunto desde su computadora."],
      ["Saludos cordiales, Departamento de Facturación."],
    ],
    attachments: [{ name: "DTE_0031-2291.html", s: "adjunto" }],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "Dominio parecido, no el real",
        explanation:
          "El proveedor usa distlempa.com.sv; este correo viene de distlempa-dte.com. Con la factura electrónica (DTE) aparecieron muchos correos falsos de “facturas”.",
      },
      {
        id: "cuenta",
        category: "solicitud",
        title: "Cambio de cuenta bancaria",
        explanation:
          "Avisar por correo que un proveedor “cambió de banco” es la base del fraude a empresas: si pagas a la cuenta nueva, el dinero va al estafador.",
      },
      {
        id: "adjunto",
        category: "adjunto",
        title: "Factura en .html",
        explanation:
          "Un DTE real llega como PDF y JSON. Un .html se abre en el navegador y suele mostrar un inicio de sesión falso para robarte la contraseña del correo.",
      },
    ],
    takeaway:
      "Cualquier cambio de cuenta de un proveedor se confirma llamando al número que ya tienes registrado, nunca al que viene en el correo.",
  },
  {
    id: "billetera-codigo",
    channel: "chat",
    verdict: "phishing",
    difficulty: 2,
    context: "Usas la app Billetera Tunco. Te escribe un contacto que dice ser soporte.",
    from: { name: { t: "Soporte Billetera Tunco 🛡️", s: "soporte" }, address: "+503 7000-0000 (no guardado)" },
    time: "08:05",
    body: [
      ["Hola, le saluda el equipo de seguridad de Billetera Tunco."],
      ["Detectamos un intento de acceso a su cuenta desde otro país."],
      [{ t: "Para bloquearlo, le acabamos de enviar un código de 6 dígitos por SMS. Por favor díctenoslo por aquí.", s: "codigo" }],
      [{ t: "Si no lo hace en 5 minutos, perderá su saldo.", s: "urgencia" }],
    ],
    signals: [
      {
        id: "soporte",
        category: "suplantacion",
        title: "Soporte que te escribe primero",
        explanation:
          "Las empresas no te escriben desde un número personal ni ponen escuditos en el nombre. Los canales de soporte están dentro de la app.",
      },
      {
        id: "codigo",
        category: "solicitud",
        title: "Pide el código SMS",
        explanation:
          "El código que te llega es la llave de tu cuenta: el estafador lo provoca al intentar entrar y te lo pide para completar el acceso.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "Amenaza de perder el saldo",
        explanation: "El miedo a perder dinero hace que dictes el código sin pensar.",
      },
    ],
    takeaway: "Un código de verificación no se comparte con nadie, ni con “soporte”. Si alguien te lo pide, es para entrar a tu cuenta.",
  },
  {
    id: "envio-real",
    channel: "sms",
    verdict: "legit",
    difficulty: 3,
    context:
      "Ayer compraste unos audífonos en línea y te dieron el número de guía EY-559201. EnvíaYa usa el dominio enviaya.com.sv.",
    from: { name: "EnviaYa", address: "Código corto 7350" },
    time: "10:12",
    body: [
      [
        "EnvíaYa: tu paquete EY-559201 sale hoy a ruta de entrega. Llegará entre 2:00 y 5:00 p. m.",
        "Detalle en enviaya.com.sv/rastreo. No se requiere ningún pago.",
      ],
    ],
    signals: [],
    legitReasons: [
      "Coincide con una compra que sí hiciste y con tu número de guía.",
      "Viene de un código corto, no de un número extranjero.",
      "El dominio es el oficial (enviaya.com.sv) y no hay enlace que pida datos.",
      "Aclara que no hay nada que pagar.",
    ],
    takeaway: "El mismo tipo de mensaje puede ser real o falso: lo que decide es el contexto (¿esperabas el paquete?) y los detalles (dominio, pagos, datos).",
  },
  {
    id: "reset-no-pedido",
    channel: "email",
    verdict: "legit",
    difficulty: 3,
    context: "Eres cliente de Banco Izalco (bancoizalco.com.sv). No has pedido cambiar tu contraseña.",
    from: { name: "Banco Izalco", address: "notificaciones@bancoizalco.com.sv" },
    subject: ["Se solicitó un cambio de contraseña"],
    time: "23:51",
    body: [
      ["Hola, María Fernanda:"],
      ["Recibimos una solicitud para cambiar la contraseña de tu banca en línea."],
      ["Si no fuiste tú, no hagas nada: tu contraseña actual sigue funcionando y la solicitud vence en 30 minutos."],
      ["Si te preocupa, entra a la app Banco Izalco y revisa tus dispositivos conectados."],
    ],
    signals: [],
    legitReasons: [
      "Viene del dominio oficial y te llama por tu nombre.",
      "No tiene enlaces ni te pide datos: te dice que no hagas nada.",
      "Te manda a la app, por el camino de siempre.",
    ],
    takeaway:
      "Un aviso que no pediste no siempre es phishing: puede ser alguien probando tu correo. Si el mensaje no te pide nada, no hay riesgo. Cambia tu contraseña desde la app si quieres estar tranquilo.",
  },
  {
    id: "super-aniversario",
    channel: "email",
    verdict: "phishing",
    difficulty: 2,
    context: "Compras a veces en Supermercados La Ceiba, cuyo dominio es superlaceiba.com.sv.",
    from: { name: "Supermercados La Ceiba", address: { t: "premios@superlaceiba-aniversario.shop", s: "dominio" } },
    subject: [{ t: "🎉 ¡Ganaste una gift card de $500 por nuestro aniversario!", s: "premio" }],
    time: "12:30",
    body: [
      ["Felicidades, fuiste seleccionado entre nuestros clientes frecuentes."],
      [
        "Responde una encuesta de 3 preguntas y reclama tu premio:",
        { t: "Reclamar mi gift card", s: "enlace", href: "https://superlaceiba-aniversario.shop/encuesta" },
      ],
      [{ t: "Solo pagas $1.50 de envío con tu tarjeta.", s: "envio" }],
      [{ t: "Quedan 12 premios disponibles.", s: "escasez" }],
    ],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "Dominio .shop desconocido",
        explanation: "El súper usa superlaceiba.com.sv. Un dominio con “aniversario” y terminación .shop lo registró otra persona.",
      },
      {
        id: "premio",
        category: "oferta",
        title: "Premio que no buscaste",
        explanation: "Ganar algo en un sorteo en el que no participaste es la carnada más vieja.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "Botón hacia el dominio falso",
        explanation: "Al pasar el mouse se ve que lleva a superlaceiba-aniversario.shop, no al sitio del súper.",
      },
      {
        id: "envio",
        category: "solicitud",
        title: "“Solo pagas el envío”",
        explanation:
          "El cobro pequeño es para obtener los datos completos de tu tarjeta. Muchas veces termina en cargos recurrentes que no autorizaste.",
      },
      {
        id: "escasez",
        category: "urgencia",
        title: "Escasez inventada",
        explanation: "“Quedan 12” busca que actúes antes de pensarlo.",
      },
    ],
    takeaway: "Si un premio te pide pagar algo, no es un premio. Revisa las promociones en las redes oficiales de la tienda.",
  },
];
