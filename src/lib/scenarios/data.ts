import type { Scenario } from "./types";

/*
 * Todas las marcas, personas, números y dominios de estos escenarios son
 * ficticios. No uses nombres de bancos, instituciones ni empresas reales:
 * el producto enseña a reconocer patrones, no a imitar marcas concretas.
 *
 * Marcas ficticias usadas:
 *  - Banco Izalco (dominio legítimo: bancoizalco.com.sv)
 *  - EnvíaYa Express (paquetería, dominio legítimo: enviaya.com.sv)
 *  - Grupo Atlacatl (empresa del usuario, dominio: grupoatlacatl.com.sv)
 *  - Dirección General de Tributos (gobierno, dominio: tributos.gob.sv)
 */

export const SCENARIOS: Scenario[] = [
  {
    id: "banco-bloqueo",
    channel: "email",
    verdict: "phishing",
    difficulty: 1,
    context: "Eres cliente de Banco Izalco. Su dominio oficial es bancoizalco.com.sv.",
    from: {
      name: "Banco Izalco",
      address: { t: "seguridad@bancoizalco-alertas.com", s: "dominio" },
    },
    subject: [{ t: "URGENTE: su cuenta será bloqueada en 24 horas", s: "urgencia" }],
    time: "7:42",
    body: [
      [{ t: "Estimado cliente:", s: "saludo" }],
      [
        "Hemos detectado actividad inusual en su banca en línea.",
        { t: "Si no verifica su identidad en las próximas 24 horas, su cuenta será suspendida de forma permanente.", s: "urgencia" },
      ],
      [
        "Para evitarlo, ingrese al siguiente enlace: ",
        { t: "www.bancoizalco.com.sv/verificar", s: "enlace", href: "http://bancoizalco.verificar-cuenta.co/login" },
      ],
      [{ t: "Tenga a mano su usuario, contraseña y el código que le llegará por SMS.", s: "datos" }],
      ["Atentamente, Departamento de Seguridad."],
    ],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "El dominio no es el del banco",
        explanation:
          "El correo viene de bancoizalco-alertas.com, no de bancoizalco.com.sv. Cualquiera puede registrar un dominio que contenga el nombre de una marca.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "Amenaza con un plazo corto",
        explanation:
          "“24 horas” y “suspensión permanente” buscan que actúes con miedo y no te detengas a verificar. Un banco real no cierra tu cuenta por un correo sin respuesta.",
      },
      {
        id: "saludo",
        category: "contexto",
        title: "Saludo genérico",
        explanation:
          "“Estimado cliente” en vez de tu nombre: el mensaje se envió a miles de personas a la vez. Tu banco sabe cómo te llamas.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "El enlace lleva a otro sitio",
        explanation:
          "El texto muestra bancoizalco.com.sv, pero la dirección real es bancoizalco.verificar-cuenta.co. Lo que importa es lo que va justo antes de la primera barra “/”: ahí termina en verificar-cuenta.co.",
      },
      {
        id: "datos",
        category: "solicitud",
        title: "Pide contraseña y código",
        explanation:
          "Ningún banco te pide la contraseña ni el código SMS por correo. Con esos dos datos pueden entrar a tu cuenta y hacer transferencias.",
      },
    ],
    takeaway:
      "Si un correo del banco te preocupa, no uses sus enlaces: abre la app o escribe tú mismo la dirección del banco en el navegador.",
  },
  {
    id: "paquete-aduana",
    channel: "sms",
    verdict: "phishing",
    difficulty: 1,
    context: "No estás esperando ningún paquete. Te llega este SMS desde un número desconocido.",
    from: { name: "EnviaYa", address: { t: "+1 (786) 555-0143", s: "numero" } },
    time: "13:05",
    body: [
      [
        { t: "EnvíaYa: Su paquete está retenido en aduana por un saldo pendiente de $1.95.", s: "inesperado" },
        { t: "Pague hoy o será devuelto al remitente:", s: "urgencia" },
        " ",
        { t: "enviaya-sv.delivery-pago.top/p/8812", s: "enlace", href: "https://enviaya-sv.delivery-pago.top/p/8812" },
      ],
    ],
    signals: [
      {
        id: "inesperado",
        category: "contexto",
        title: "Un paquete que no esperabas",
        explanation:
          "Si no compraste nada, no hay paquete. Piden un monto pequeño para que no lo pienses, pero lo que buscan son los datos de tu tarjeta.",
      },
      {
        id: "numero",
        category: "remitente",
        title: "Número extranjero",
        explanation:
          "Una paquetería salvadoreña no te escribiría desde un número de Estados Unidos (+1). Los estafadores usan números baratos o virtuales.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "“Pague hoy”",
        explanation: "La amenaza de devolución es para que pagues rápido sin comprobar nada.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "Dominio raro",
        explanation:
          "El dominio real es delivery-pago.top. Las terminaciones como .top, .xyz o .click son baratas y se usan mucho en estafas. La paquetería real usa enviaya.com.sv.",
      },
    ],
    takeaway:
      "Para saber si tienes un envío, entra a la web oficial de la paquetería escribiendo tú la dirección y busca el número de guía de tu compra.",
  },
  {
    id: "mami-numero-nuevo",
    channel: "chat",
    verdict: "phishing",
    difficulty: 2,
    context: "Tu hijo Kevin vive en Houston y a veces te pide ayuda. Te escriben desde un número que no tienes guardado.",
    from: { name: { t: "+1 (832) 555-0198", s: "nuevo" }, address: "Número no guardado" },
    time: "21:17",
    body: [
      [{ t: "Hola mami, soy yo, Kevin. Se me cayó el cel y este es mi número nuevo.", s: "nuevo" }, " Guardalo."],
      ["Fijate que tengo un problema y me da pena contarte."],
      [
        { t: "Necesito que me mandés $350 hoy mismo para pagar la renta, si no me sacan del apartamento.", s: "dinero" },
      ],
      [{ t: "No puedo hablar ahorita porque el micrófono del cel no sirve, por eso te escribo.", s: "nollamar" }],
      [{ t: "Te paso la cuenta de un amigo porque la mía está bloqueada.", s: "cuenta" }],
    ],
    signals: [
      {
        id: "nuevo",
        category: "suplantacion",
        title: "“Este es mi número nuevo”",
        explanation:
          "Es el inicio típico de esta estafa: el estafador se hace pasar por un familiar y te pide que borres o ignores el número anterior.",
      },
      {
        id: "dinero",
        category: "solicitud",
        title: "Pide dinero urgente",
        explanation:
          "Una emergencia con plazo (la renta, un accidente, una multa) es la manera de que mandes el dinero antes de pensarlo.",
      },
      {
        id: "nollamar",
        category: "contexto",
        title: "Evita la llamada",
        explanation:
          "Siempre hay una excusa para no hablar por teléfono, porque con una llamada reconocerías que no es tu hijo.",
      },
      {
        id: "cuenta",
        category: "solicitud",
        title: "Cuenta de un tercero",
        explanation:
          "Si el dinero va a la cuenta de “un amigo”, no hay forma de recuperarlo. Es la señal más clara de fraude.",
      },
    ],
    takeaway:
      "Antes de mandar dinero, llama al número de siempre o hazle una pregunta que solo tu familiar sabría responder. Pueden acordar en familia una palabra clave para emergencias.",
  },
  {
    id: "banco-estado-cuenta",
    channel: "email",
    verdict: "legit",
    difficulty: 2,
    context: "Eres cliente de Banco Izalco y cada mes recibes tu estado de cuenta por correo.",
    from: { name: "Banco Izalco", address: "notificaciones@bancoizalco.com.sv" },
    subject: ["Su estado de cuenta de octubre está disponible"],
    time: "6:00",
    body: [
      ["Hola, María Fernanda:"],
      ["Su estado de cuenta de octubre de la cuenta terminada en 4821 ya está disponible."],
      [
        "Puede consultarlo en la app Banco Izalco o en banca en línea, escribiendo bancoizalco.com.sv en su navegador.",
      ],
      [
        "Recuerde: nunca le pediremos su contraseña, PIN ni códigos de verificación por correo, SMS ni llamada.",
      ],
      ["Banco Izalco. Este es un mensaje automático, no responda a este correo."],
    ],
    signals: [],
    legitReasons: [
      "Viene del dominio oficial bancoizalco.com.sv.",
      "Te llama por tu nombre y muestra solo los últimos 4 dígitos de la cuenta.",
      "No tiene enlaces ni adjuntos: te pide entrar por tu cuenta a la app o la web.",
      "No hay urgencia ni amenazas, y no pide ningún dato.",
    ],
    takeaway:
      "Un mensaje legítimo no te apura, no te pide datos y te deja entrar por el camino de siempre. Desconfiar de todo tampoco sirve: la clave es saber qué revisar.",
  },
  {
    id: "jefe-tarjetas",
    channel: "email",
    verdict: "phishing",
    difficulty: 2,
    context:
      "Trabajas en Grupo Atlacatl (dominio grupoatlacatl.com.sv). Tu gerente general es Ricardo Menjívar.",
    from: { name: "Ricardo Menjívar", address: { t: "ricardo.menjivar.gerencia@gmail.com", s: "gmail" } },
    subject: ["Favor rápido"],
    time: "10:31",
    body: [
      ["Hola, ¿estás en la oficina?"],
      [
        "Estoy en una reunión con un cliente y no puedo atender llamadas.",
        { t: "Necesito que compres 5 tarjetas de regalo de $100 para un detalle a los clientes.", s: "tarjetas" },
      ],
      [{ t: "Mandame los códigos por aquí apenas las tengas, es para antes de las 12.", s: "urgencia" }],
      [{ t: "Por favor, que quede entre nosotros, es una sorpresa.", s: "secreto" }],
      ["Enviado desde mi teléfono"],
    ],
    signals: [
      {
        id: "gmail",
        category: "remitente",
        title: "Correo personal, no de la empresa",
        explanation:
          "El nombre es el de tu gerente, pero el correo es de Gmail. El nombre que aparece se puede poner a mano; lo que importa es la dirección.",
      },
      {
        id: "tarjetas",
        category: "solicitud",
        title: "Tarjetas de regalo",
        explanation:
          "Los estafadores piden tarjetas de regalo porque los códigos se cambian por dinero al instante y no se pueden rastrear ni devolver.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "Plazo y prisa",
        explanation: "“Antes de las 12” y “apenas las tengas” buscan que no consultes con nadie.",
      },
      {
        id: "secreto",
        category: "suplantacion",
        title: "Pide que lo guardes en secreto",
        explanation:
          "Pedir discreción es para que no lo confirmes con otra persona. Una compra real de la empresa pasa por el proceso de siempre.",
      },
    ],
    takeaway:
      "Si un jefe te pide dinero, compras o pagos fuera de lo normal, confírmalo por otro medio (llamada, Teams o en persona), nunca respondiendo al mismo correo.",
  },
  {
    id: "devolucion-renta",
    channel: "email",
    verdict: "phishing",
    difficulty: 2,
    context: "Declaraste renta este año. El dominio oficial de la Dirección General de Tributos es tributos.gob.sv.",
    from: { name: "Dirección General de Tributos", address: { t: "devoluciones@dgt-devoluciones.com", s: "dominio" } },
    subject: [{ t: "Tiene una devolución de $487.30 pendiente de cobro", s: "premio" }],
    time: "16:48",
    body: [
      ["Contribuyente:"],
      [
        { t: "Tras revisar su declaración, usted tiene derecho a una devolución de $487.30.", s: "premio" },
        "Para recibirla en su cuenta, complete el formulario adjunto.",
      ],
      [{ t: "Ingrese su número de DUI, número de cuenta bancaria y el PIN de su tarjeta de débito.", s: "datos" }],
      ["Si no lo envía antes del viernes, el monto será anulado."],
    ],
    attachments: [{ name: "Formulario_Devolucion_2026.zip", s: "adjunto" }],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "El gobierno no usa .com",
        explanation:
          "Las instituciones del gobierno salvadoreño usan dominios .gob.sv. Un dominio .com con la palabra “devoluciones” lo puede registrar cualquiera.",
      },
      {
        id: "premio",
        category: "oferta",
        title: "Dinero inesperado",
        explanation:
          "Un monto exacto y atractivo despierta interés y baja la guardia. Si tienes una devolución real, la consultas en el portal oficial.",
      },
      {
        id: "datos",
        category: "solicitud",
        title: "Pide el PIN",
        explanation:
          "Para depositarte dinero nadie necesita tu PIN. Con el DUI, la cuenta y el PIN pueden suplantarte y vaciar la tarjeta.",
      },
      {
        id: "adjunto",
        category: "adjunto",
        title: "Archivo .zip",
        explanation:
          "Un .zip inesperado puede esconder un programa malicioso. Los formularios oficiales se llenan en el portal web, no se envían comprimidos por correo.",
      },
    ],
    takeaway:
      "Para cualquier trámite con el gobierno, entra tú mismo al portal oficial (.gob.sv). Nunca abras adjuntos comprimidos que no pediste.",
  },
  {
    id: "codigo-solicitado",
    channel: "sms",
    verdict: "legit",
    difficulty: 3,
    context: "Hace un minuto intentaste iniciar sesión en la app de Banco Izalco desde un teléfono nuevo.",
    from: { name: "BancoIzalco", address: "Código corto 2250" },
    time: "9:14",
    body: [
      [
        "Banco Izalco: tu código de verificación es 482913. Vence en 5 minutos.",
        "No lo compartas con nadie. Banco Izalco nunca te lo pedirá por llamada ni mensaje.",
      ],
    ],
    signals: [],
    legitReasons: [
      "Llega justo después de que tú pediste iniciar sesión: el contexto tiene sentido.",
      "No trae enlaces y no te pide responder nada.",
      "Te advierte que no compartas el código, que es justo lo contrario de lo que haría un estafador.",
    ],
    takeaway:
      "Un código de verificación es legítimo cuando tú lo pediste. Si te llega sin haberlo pedido, alguien está intentando entrar a tu cuenta: no lo compartas con nadie y cambia tu contraseña.",
  },
  {
    id: "trabajo-likes",
    channel: "chat",
    verdict: "phishing",
    difficulty: 1,
    context: "No has aplicado a ningún trabajo. Te escribe un número desconocido.",
    from: { name: { t: "Recursos Humanos ✅", s: "desconocido" }, address: "+44 7700 900412" },
    time: "11:02",
    body: [
      [{ t: "¡Hola! Te contactamos de una agencia de marketing digital, tu perfil fue seleccionado.", s: "desconocido" }],
      [{ t: "Puedes ganar de $50 a $200 diarios solo dando “me gusta” a videos desde tu celular.", s: "oferta" }],
      ["No necesitas experiencia, solo 20 minutos al día."],
      [{ t: "Para activar tu cuenta de tareas VIP debes hacer un depósito inicial de $30, que se te devuelve con tu primer pago.", s: "deposito" }],
      ["¿Te interesa? Responde SÍ para comenzar."],
    ],
    signals: [
      {
        id: "desconocido",
        category: "contexto",
        title: "Nadie te contactó por tu perfil",
        explanation:
          "Si no aplicaste a nada, nadie te “seleccionó”. El emoji ✅ en el nombre es para que parezca una cuenta verificada, y cualquiera lo puede poner.",
      },
      {
        id: "oferta",
        category: "oferta",
        title: "Ganancia fácil",
        explanation:
          "Mucho dinero por casi nada de trabajo. Al principio a veces pagan centavos para que confíes y luego deposites más.",
      },
      {
        id: "deposito",
        category: "solicitud",
        title: "Pagar para trabajar",
        explanation:
          "Un trabajo real nunca te pide dinero para empezar. Este es el punto donde pierdes el dinero, y los “niveles VIP” solo piden depósitos cada vez mayores.",
      },
    ],
    takeaway:
      "Si para ganar dinero primero tienes que pagar, es estafa. Bloquea y reporta el número.",
  },
  {
    id: "ti-contrasena",
    channel: "email",
    verdict: "phishing",
    difficulty: 3,
    context: "Trabajas en Grupo Atlacatl (dominio grupoatlacatl.com.sv). Soporte de TI usa ese mismo dominio.",
    from: { name: "Soporte TI - Grupo Atlacatl", address: { t: "soporte@grupoatlacatl-com.net", s: "dominio" } },
    subject: ["Aviso: su contraseña de correo vence hoy"],
    time: "8:20",
    body: [
      ["Hola,"],
      [
        "Por políticas de seguridad, su contraseña de correo corporativo vence hoy.",
        { t: "Si no la renueva antes de las 17:00, perderá el acceso a su buzón y archivos.", s: "urgencia" },
      ],
      [
        "Puede mantener su contraseña actual haciendo clic aquí: ",
        { t: "Mantener mi contraseña", s: "enlace", href: "https://grupoatlacatl-com.net/owa/auth/renovar" },
      ],
      ["Gracias, Soporte TI."],
    ],
    signals: [
      {
        id: "dominio",
        category: "remitente",
        title: "Dominio casi igual",
        explanation:
          "grupoatlacatl-com.net imita a grupoatlacatl.com.sv cambiando un punto por un guion. Es difícil de ver si no lees la dirección completa.",
      },
      {
        id: "urgencia",
        category: "urgencia",
        title: "Pérdida de acceso con hora límite",
        explanation: "Amenazar con perder tus archivos antes de las 17:00 es para que hagas clic sin consultar a TI.",
      },
      {
        id: "enlace",
        category: "enlace",
        title: "Botón hacia un sitio falso",
        explanation:
          "El botón no muestra la dirección. Al pasar el mouse se ve que lleva a grupoatlacatl-com.net, una página que copia el inicio de sesión para robar tu contraseña.",
      },
    ],
    takeaway:
      "Ante cualquier aviso de TI que te pida iniciar sesión, entra al correo como siempre o llama a soporte. Antes de hacer clic, pasa el mouse sobre el enlace para ver a dónde lleva.",
  },
  {
    id: "rrhh-vacaciones",
    channel: "email",
    verdict: "legit",
    difficulty: 3,
    context:
      "Trabajas en Grupo Atlacatl (dominio grupoatlacatl.com.sv). En la reunión del lunes, RR. HH. anunció que enviaría el calendario de vacaciones.",
    from: { name: "Andrea López - Recursos Humanos", address: "andrea.lopez@grupoatlacatl.com.sv" },
    subject: ["Calendario de vacaciones de fin de año"],
    time: "14:10",
    body: [
      ["Buenas tardes, equipo:"],
      ["Como comentamos en la reunión del lunes, ya está publicado el calendario de vacaciones de diciembre."],
      [
        "Pueden revisarlo en la intranet: ",
        { t: "intranet.grupoatlacatl.com.sv/rrhh/vacaciones", href: "https://intranet.grupoatlacatl.com.sv/rrhh/vacaciones" },
      ],
      ["Si tienen dudas, pueden escribirme o pasar por mi oficina en el segundo nivel."],
      ["Saludos, Andrea López. Recursos Humanos."],
    ],
    signals: [],
    legitReasons: [
      "Viene del dominio correcto de la empresa, grupoatlacatl.com.sv.",
      "Lo anunciaron en una reunión: lo esperabas.",
      "El enlace lleva a un subdominio de la empresa (intranet.grupoatlacatl.com.sv), y el texto coincide con la dirección real.",
      "No hay urgencia, no pide datos y ofrece hablar en persona.",
    ],
    takeaway:
      "Un enlace es confiable cuando el dominio real (lo que va antes de la primera “/”) es el de la organización, por ejemplo intranet.grupoatlacatl.com.sv. Si tienes duda, igual puedes entrar a la intranet por tu cuenta.",
  },
];
