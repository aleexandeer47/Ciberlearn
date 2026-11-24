/*
 * “¿Es estafa?”: revisión instantánea de un mensaje con reglas. Corre en el navegador
 * (el texto no sale del dispositivo). No es infalible: busca las señales más comunes
 * del phishing y explica cada una. La versión con IA (Pro) da una segunda opinión.
 * Reconoce mensajes en español y en inglés, sin importar el idioma de la página.
 */

import type { Lang } from "./i18n";
import { dissectUrl } from "./url";

export type FlagId =
  | "link-odd-tld"
  | "link-shortener"
  | "link-ip"
  | "link-at"
  | "link-punycode"
  | "link-brand-sub"
  | "link-lookalike"
  | "link-http"
  | "urgency"
  | "threat"
  | "code"
  | "credentials"
  | "card"
  | "money"
  | "giftcard"
  | "crypto"
  | "prize"
  | "job"
  | "new-number"
  | "secrecy"
  | "generic"
  | "attachment"
  | "remote"
  | "identity"
  | "bank-data";

export interface Flag {
  id: FlagId;
  weight: number;
  /** Texto del mensaje que activó la señal */
  match: string;
}

export type Risk = "alto" | "medio" | "bajo";

export interface CheckResult {
  risk: Risk;
  score: number;
  flags: Flag[];
  links: { url: string; domain: string }[];
}

// Terminaciones baratas y muy usadas en estafas (no todas las páginas con ellas son falsas).
const ODD_TLDS = new Set(["top", "xyz", "click", "online", "site", "shop", "live", "info", "icu", "buzz", "cyou", "rest", "monster", "sbs", "cfd", "lol", "work", "support", "help", "loan", "win", "vip", "store", "link", "tk", "ml", "ga", "cf", "gq", "zip", "mov"]);
const SHORTENERS = new Set(["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc", "s.id", "rebrand.ly", "t.ly", "bitly.com"]);
// Marcas muy suplantadas: si aparecen en un subdominio de otro dominio, es imitación.
const BRANDS = ["paypal", "amazon", "apple", "icloud", "microsoft", "outlook", "office", "netflix", "google", "gmail", "whatsapp", "facebook", "instagram", "meta", "dhl", "fedex", "ups", "usps", "correos", "banco", "bank", "visa", "mastercard", "binance", "coinbase", "irs", "hacienda", "sat", "tributos", "revenue", "steam", "tiktok", "spotify", "shein", "temu", "mercadolibre", "walmart", "chase", "wellsfargo", "santander", "bbva", "izalcobank", "bancoizalco"];

const P = (es: string, en: string) => new RegExp(`(${es}|${en})`, "i");

const RULES: { id: FlagId; weight: number; re: RegExp }[] = [
  // Incluye el lenguaje de las falsas multas y cobros (VMT, 2026): "vencida", "último recordatorio", "antes que aumente"
  { id: "urgency", weight: 2, re: P("urgente|inmediat\\w*|hoy mismo|en las pr[oó]ximas \\d+ ?(horas|h)|[uú]ltim[oa] (aviso|oportunidad|recordatorio)|antes de las \\d|expira|vence hoy|de lo contrario|vencid[ao]|antes (de )?que aument\\w*|recargos?\\b|(en|dentro de) (dos|tres|\\d+) d[ií]as( h[aá]biles)?", "urgent|immediately|right away|within \\d+ ?(hours|h)|final (notice|warning|reminder)|last chance|expires? today|act now|or else|overdue|past due|before it (goes up|increases)|late fees?|within (two|three|\\d+) (business )?days") },
  { id: "threat", weight: 2, re: P("suspend\\w*|bloque\\w*|cancelad[ao]|eliminad[ao]|desactivad[ao]|multa|demanda|orden de captura|perder[aá]s?", "suspend\\w*|locked|blocked|deactivat\\w*|deleted|closed|fine|lawsuit|arrest warrant|you will lose") },
  { id: "code", weight: 4, re: P("c[oó]digo (de verificaci[oó]n|de 6|sms)|c[oó]digo que (te|le) (lleg|acaba)|d[ií]ctame|d[ií]ctenos|d[ií]game el c[oó]digo|p[aá]same el c[oó]digo|m[aá]ndame el c[oó]digo|\\botp\\b", "verification code|the code (you|we) (just )?(got|sent|received)|6-digit code|(read|tell) (me|us) the code|send me the code|one-time (code|password)|\\botp\\b") },
  { id: "credentials", weight: 4, re: P("contrase[nñ]a|clave (de acceso|de tu)|\\bpin\\b|usuario y clave|inicia sesi[oó]n|confirm[ae] (tus|sus) datos|verifica (tu|su) (cuenta|identidad)", "password|\\bpin\\b|log ?in to|sign in to|confirm your (details|information|account)|verify your (account|identity)|username and password") },
  { id: "card", weight: 4, re: P("datos de (tu|su) tarjeta|n[uú]mero completo de (tu|su) tarjeta|\\bcvv\\b|c[oó]digo de seguridad|fecha de vencimiento|actualiza (tu|su) tarjeta", "card details|full card number|\\bcvv\\b|security code|expir(y|ation) date|update your card") },
  { id: "money", weight: 3, re: P("transfi[eé]re\\w*|deposit(a|e|es|en|ar)? \\$|por error|devu[eé]lv\\w* (a esta|el dinero)|env[ií]a(me|nos)? (\\$|dinero|los)|m[aá]nda(me|nos) (\\$|dinero|los)|paga \\$|pague|regres[aá]s? los \\$|cuenta de un amigo|otra cuenta|anticipo|cobro de", "transfer \\$|transfer (the|this) money|deposit \\$|by mistake|send it back|send me the deposit|send (me|us) (\\$|money)|send the \\$\\d+ back|pay \\$|wire (me|\\$|the money)|a friend's account|other account|advance payment|processing fee|shipping fee|sign-up fee") },
  { id: "identity", weight: 4, re: P("foto de (tu|su) (documento|dui|c[eé]dula|identificaci[oó]n|pasaporte|ine)|selfie", "photo of (your|both sides)|selfie|your (id|passport|driver's license) photo") },
  { id: "giftcard", weight: 4, re: P("tarjetas? de regalo|gift ?cards?|c[oó]digos? de (las )?tarjetas", "gift ?cards?|itunes card|google play card|steam card") },
  { id: "crypto", weight: 3, re: P("bitcoin|cripto\\w*|usdt|inversi[oó]n segura|duplica tu dinero|ganancias garantizadas|invert[ií] \\$|saqu[eé] \\$|el asesor", "bitcoin|crypto\\w*|usdt|guaranteed (returns|profit)|double your money|safe investment|i invested \\$|made \\$[\\d,]+ in \\d+ days|the advisor") },
  // Incluye las encuestas que "pagan" (BCR, 2026)
  { id: "prize", weight: 3, re: P("ganaste|has ganado|felicidades|premio|sorteo|seleccionad[oa]|bono de \\$|reembolso de \\$|devoluci[oó]n de \\$|encuesta (pagada|remunerada)|(te |le )?pag(amos|an|ar[aá]n?) \\$?\\d+|\\$\\d+ por (responder|llenar|completar|contestar)|promete \\$", "you('ve| have)? won(?!['’]t)\\b|congratulations|prize|winner|selected|giveaway|refund of \\$|bonus of \\$|\\$\\d+ (government )?grant|paid survey|\\$\\d+ for (answering|completing|filling)|we('ll)? pay you \\$?\\d+") },
  // Datos de la cuenta bancaria para "depositarte" un premio o pago
  { id: "bank-data", weight: 3, re: P("cuenta de cobro|n[uú]mero de (tu |su )?cuenta|selecciona (tu|su) banco|nombre del beneficiario|datos bancarios", "bank account (number|details)|account number|select your bank|beneficiary name|banking details") },
  { id: "job", weight: 3, re: P("trabajo desde casa|gana \\$?\\d+ (al d[ií]a|diarios)|dando (me gusta|likes)|tareas vip|sin experiencia", "work from home|earn \\$?\\d+ (a|per) day|liking videos|vip tasks|no experience needed") },
  { id: "new-number", weight: 3, re: P("(este es|es) mi (n[uú]mero|cel) nuevo|cambi[eé] de n[uú]mero|se me (cay[oó]|arruin[oó]|perdi[oó]) el cel", "(this is )?my new number|i changed my number|i (dropped|lost|broke) my phone") },
  { id: "secrecy", weight: 2, re: P("no le digas a nadie|que quede entre nosotros|confidencial|no (me )?llames|no puedo hablar", "don'?t tell anyone|keep (this|it) between us|confidential|don'?t call( me)?|can'?t talk") },
  { id: "generic", weight: 1, re: P("estimad[oa] (cliente|usuario|contribuyente)|querid[oa] (cliente|usuario)", "dear (customer|user|client|taxpayer|account holder)") },
  { id: "attachment", weight: 3, re: /\.(zip|rar|exe|scr|apk|html?|js|vbs|iso|img|msi)\b/i },
  { id: "remote", weight: 3, re: P("anydesk|teamviewer|instal[ae] (esta|la) (app|aplicaci[oó]n)|acceso remoto|soporte t[eé]cnico", "anydesk|teamviewer|install (this|the) app|remote access|tech support") },
];

// Frases de advertencia (“nunca te pediremos tu clave”): no cuentan como pedido.
const WARNING = /nunca|jam[aá]s|no (te|le) (pediremos|pedimos|solicitamos)|no (lo|la) compartas|never|will not ask|won'?t ask|don'?t share/i;
// Reglas que solo cuentan cuando de verdad piden algo
const ASKS = new Set<FlagId>(["code", "credentials", "card"]);
const sentenceOf = (text: string, index: number) => {
  const start = Math.max(text.lastIndexOf(".", index), text.lastIndexOf("\n", index)) + 1;
  const ends = [".", "\n"].map((c) => text.indexOf(c, index)).filter((x) => x >= 0);
  return text.slice(start, ends.length ? Math.min(...ends) : text.length);
};

const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<>"')]+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"')]*)?)/gi;

/** Enlaces que aparecen en el texto, con su dominio real. */
export function findLinks(text: string) {
  const out: { url: string; domain: string; subdomain: string; suffix: string; secure: boolean; raw: string }[] = [];
  for (const m of text.matchAll(URL_RE)) {
    const raw = m[1].replace(/[.,;:!?]+$/, "");
    // Correos electrónicos no son enlaces: el dominio del remitente se revisa aparte
    const before = text[(m.index ?? 0) - 1];
    if (before === "@") continue;
    const a = dissectUrl(raw);
    if (a) out.push({ url: raw, domain: a.domain, subdomain: a.subdomain, suffix: a.suffix, secure: a.secure, raw });
  }
  return out;
}

const looksLike = (domain: string) => {
  const name = domain.split(".")[0];
  // Números en lugar de letras (micr0soft, paypa1) o marca con guiones (bank-secure, apple-id-support)
  return BRANDS.some((b) => {
    if (name === b) return false;
    const deLeet = name.replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/5/g, "s");
    return (deLeet !== name && deLeet.includes(b)) || (name.includes(b) && /-/.test(name));
  });
};

export function checkMessage(text: string): CheckResult {
  const flags: Flag[] = [];
  const add = (id: FlagId, weight: number, match: string) => {
    if (!flags.some((f) => f.id === id)) flags.push({ id, weight, match: match.slice(0, 80) });
  };

  const links = findLinks(text);
  // El dominio de un remitente (alguien@dominio) se revisa igual que un enlace
  const senders = [...text.matchAll(/@((?:[a-z0-9-]+\.)+[a-z]{2,})/gi)].flatMap((m) => {
    const a = dissectUrl(m[1]);
    return a ? [{ url: m[1], domain: a.domain, subdomain: a.subdomain, suffix: a.suffix, secure: true, raw: m[1] }] : [];
  });
  for (const l of [...links, ...senders]) {
    const host = l.subdomain ? `${l.subdomain}.${l.domain}` : l.domain;
    const tld = l.suffix.split(".").pop() ?? "";
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) add("link-ip", 4, l.raw);
    if (l.raw.includes("@")) add("link-at", 4, l.raw);
    if (/xn--/.test(host)) add("link-punycode", 4, l.raw);
    if (SHORTENERS.has(l.domain) || SHORTENERS.has(host)) add("link-shortener", 2, l.raw);
    if (ODD_TLDS.has(tld)) add("link-odd-tld", 3, l.raw);
    if (BRANDS.some((b) => l.subdomain.includes(b) && !l.domain.includes(b))) add("link-brand-sub", 4, l.raw);
    if (looksLike(l.domain)) add("link-lookalike", 3, l.raw);
    if (/^http:\/\//i.test(l.raw)) add("link-http", 1, l.raw);
  }
  for (const r of RULES) {
    for (const m of text.matchAll(new RegExp(r.re.source, "gi"))) {
      if (ASKS.has(r.id) && WARNING.test(sentenceOf(text, m.index ?? 0))) continue;
      add(r.id, r.weight, m[0]);
      break;
    }
  }

  const score = flags.reduce((a, f) => a + f.weight, 0);
  // Pedir códigos, claves o tarjeta, o un enlace claramente falso, ya es riesgo alto por sí solo
  const severe = flags.some((f) => f.weight >= 4);
  const risk: Risk = severe || score >= 6 ? "alto" : score >= 3 ? "medio" : "bajo";
  return { risk, score, flags: flags.sort((a, b) => b.weight - a.weight), links: links.map(({ url, domain }) => ({ url, domain })) };
}

/** Explicación de cada señal, en el idioma de la página. */
export const FLAG_TEXT: Record<Lang, Record<FlagId, { title: string; why: string }>> = {
  es: {
    "link-odd-tld": { title: "Enlace con terminación sospechosa", why: "Terminaciones como .top, .xyz, .click o .shop son baratas y se usan mucho en estafas. Los bancos y el gobierno casi nunca las usan." },
    "link-shortener": { title: "Enlace acortado", why: "Un acortador esconde a dónde vas. En un mensaje inesperado, ábrelo solo si confías en quien lo mandó." },
    "link-ip": { title: "Enlace a una dirección IP", why: "Las páginas reales usan un nombre de dominio, no números. Es típico de páginas falsas temporales." },
    "link-at": { title: "Enlace con “@”", why: "Todo lo que va antes de la “@” se ignora: el sitio real es lo que va después. Es un truco para disfrazar el destino." },
    "link-punycode": { title: "Dominio con letras de otro alfabeto", why: "“xn--” indica letras especiales que imitan a las normales. Se ve igual al sitio real, pero es otro." },
    "link-brand-sub": { title: "Marca conocida en un dominio ajeno", why: "El nombre de la marca aparece antes del dominio real, que es de otra persona. Es la forma más común de imitar un sitio." },
    "link-lookalike": { title: "Dominio que imita una marca", why: "Cambia letras por números o agrega guiones para parecerse a una marca conocida." },
    "link-http": { title: "Enlace sin https", why: "La conexión no va cifrada. Nunca escribas datos en un sitio así." },
    urgency: { title: "Te apuran", why: "Los plazos cortos buscan que actúes sin pensar ni consultar a nadie." },
    threat: { title: "Amenaza con bloquear o castigar", why: "El miedo a perder tu cuenta o dinero es una de las palancas favoritas de los estafadores." },
    code: { title: "Pide un código de verificación", why: "Ese código es la llave de tu cuenta. Nadie legítimo te lo pide, ni el banco ni “soporte”." },
    credentials: { title: "Pide tu contraseña o que inicies sesión", why: "Entra siempre por la app o escribiendo tú la dirección, nunca desde un enlace que te mandaron." },
    card: { title: "Pide datos de tarjeta", why: "Para recibir dinero o “verificar” nunca necesitas dar el número, la fecha y el código de tu tarjeta." },
    money: { title: "Pide dinero o pagos", why: "Una transferencia o un “pequeño cobro” inesperado es el corazón de casi toda estafa." },
    giftcard: { title: "Pide tarjetas de regalo", why: "Los estafadores piden tarjetas de regalo porque el dinero no se puede rastrear ni recuperar." },
    crypto: { title: "Inversión o criptomonedas", why: "Nadie garantiza ganancias. Las promesas de multiplicar el dinero son estafa." },
    prize: { title: "Premio o dinero inesperado", why: "Si no participaste en nada, no ganaste nada. Es la carnada más vieja." },
    job: { title: "Trabajo fácil que paga mucho", why: "Si para ganar primero tienes que pagar o depositar, es estafa." },
    "new-number": { title: "“Este es mi número nuevo”", why: "Así empieza la estafa del familiar. Llama al número de siempre antes de hacer nada." },
    secrecy: { title: "Pide secreto o evita la llamada", why: "Impedir que lo confirmes con alguien es parte del engaño." },
    generic: { title: "Saludo genérico", why: "“Estimado cliente” en vez de tu nombre: lo enviaron a miles de personas." },
    attachment: { title: "Archivo peligroso", why: "Archivos .zip, .exe, .apk o .html inesperados pueden instalar programas maliciosos o mostrar páginas falsas." },
    remote: { title: "Pide instalar una app o dar acceso remoto", why: "Con acceso remoto pueden controlar tu computadora o celular y tu banca." },
    identity: { title: "Pide foto de tu documento o una selfie", why: "Con tu documento y una selfie pueden abrir cuentas o pedir préstamos a tu nombre. Solo se suben dentro de la app oficial." },
    "bank-data": { title: "Pide los datos de tu cuenta bancaria", why: "Para “depositarte” un premio o un pago te piden tu cuenta y tu banco. Con eso intentan entrar a tu cuenta o usarla para mover dinero de estafas." },
  },
  en: {
    "link-odd-tld": { title: "Link with a suspicious ending", why: "Endings like .top, .xyz, .click or .shop are cheap and widely used in scams. Banks and governments almost never use them." },
    "link-shortener": { title: "Shortened link", why: "A shortener hides where you're going. In an unexpected message, only open it if you trust the sender." },
    "link-ip": { title: "Link to an IP address", why: "Real sites use a domain name, not numbers. It's typical of temporary fake pages." },
    "link-at": { title: "Link with “@”", why: "Everything before the “@” is ignored: the real site is what comes after. It's a trick to disguise the destination." },
    "link-punycode": { title: "Domain with letters from another alphabet", why: "“xn--” means special letters that imitate normal ones. It looks like the real site, but it's another one." },
    "link-brand-sub": { title: "Well-known brand on someone else's domain", why: "The brand name appears before the real domain, which belongs to someone else. It's the most common way to imitate a site." },
    "link-lookalike": { title: "Domain imitating a brand", why: "It swaps letters for numbers or adds hyphens to look like a well-known brand." },
    "link-http": { title: "Link without https", why: "The connection isn't encrypted. Never type your data on a site like that." },
    urgency: { title: "They're rushing you", why: "Short deadlines are meant to make you act without thinking or asking anyone." },
    threat: { title: "Threatens to lock or punish you", why: "Fear of losing your account or money is one of scammers' favorite levers." },
    code: { title: "Asks for a verification code", why: "That code is the key to your account. Nobody legitimate asks for it, not your bank or “support”." },
    credentials: { title: "Asks for your password or to sign in", why: "Always go in through the app or by typing the address yourself, never from a link you were sent." },
    card: { title: "Asks for card details", why: "To receive money or “verify” something, you never need to give your card number, expiry date and code." },
    money: { title: "Asks for money or payments", why: "An unexpected transfer or “small fee” is at the heart of almost every scam." },
    giftcard: { title: "Asks for gift cards", why: "Scammers ask for gift cards because the money can't be traced or recovered." },
    crypto: { title: "Investment or crypto", why: "Nobody can guarantee profits. Promises to multiply your money are scams." },
    prize: { title: "Unexpected prize or money", why: "If you didn't enter anything, you didn't win anything. It's the oldest bait there is." },
    job: { title: "Easy job that pays a lot", why: "If you have to pay or deposit first to earn, it's a scam." },
    "new-number": { title: "“This is my new number”", why: "That's how the family-member scam starts. Call the usual number before doing anything." },
    secrecy: { title: "Asks for secrecy or avoids a call", why: "Stopping you from checking with someone is part of the trick." },
    generic: { title: "Generic greeting", why: "“Dear customer” instead of your name: it was sent to thousands of people." },
    attachment: { title: "Dangerous file", why: "Unexpected .zip, .exe, .apk or .html files can install malware or show fake pages." },
    remote: { title: "Asks you to install an app or give remote access", why: "With remote access they can control your computer or phone and your banking." },
    identity: { title: "Asks for a photo of your ID or a selfie", why: "With your ID and a selfie they can open accounts or take out loans in your name. Upload them only inside the official app." },
    "bank-data": { title: "Asks for your bank account details", why: "To “deposit” a prize or payment they ask for your account and bank. They use it to try to get into your account or to move scam money through it." },
  },
};
