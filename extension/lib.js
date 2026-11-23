// Lectura de enlaces para la extensión. Es una copia mínima de src/lib/url.ts y src/lib/checker.ts
// (la extensión no comparte código con el sitio): si cambian allá, actualiza aquí también.

export const SITE_URL = "https://www.unhooked.website";

const TWO_LEVEL = new Set([
  "com.sv", "gob.sv", "com.gt", "com.hn", "com.ni", "co.cr", "com.pa", "com.mx", "gob.mx", "com.co", "gov.co", "com.ar", "gob.ar",
  "com.pe", "gob.pe", "com.ec", "com.bo", "com.py", "com.uy", "com.ve", "gob.cl", "com.do", "com.br", "gov.br", "com.es", "gob.es",
  "co.uk", "gov.uk", "org.uk", "ac.uk", "com.au", "gov.au", "co.nz", "co.za", "co.in", "gov.in", "com.ph", "com.sg", "co.jp", "com.tr",
]);
const ODD_TLDS = new Set(["top", "xyz", "click", "online", "site", "shop", "live", "info", "icu", "buzz", "cyou", "rest", "monster", "sbs", "cfd", "lol", "work", "support", "help", "loan", "win", "vip", "store", "link", "tk", "ml", "ga", "cf", "gq", "zip", "mov"]);
const BRANDS = ["paypal", "amazon", "apple", "icloud", "microsoft", "outlook", "office", "netflix", "google", "gmail", "whatsapp", "facebook", "instagram", "meta", "dhl", "fedex", "ups", "usps", "correos", "banco", "bank", "visa", "mastercard", "binance", "coinbase", "irs", "hacienda", "steam", "tiktok", "spotify", "shein", "temu", "mercadolibre", "walmart", "chase", "santander", "bbva"];

/** { domain, subdomain, suffix, secure } del enlace, o null. */
export function dissect(input) {
  let url;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(input) ? input : `http://${input}`);
  } catch {
    return null;
  }
  const labels = url.hostname.toLowerCase().split(".").filter(Boolean);
  if (labels.length < 2) return null;
  const n = TWO_LEVEL.has(labels.slice(-2).join(".")) && labels.length >= 3 ? 2 : 1;
  const domainLabels = labels.slice(-(n + 1));
  return {
    protocol: url.protocol,
    domain: domainLabels.join("."),
    subdomain: labels.slice(0, labels.length - domainLabels.length).join("."),
    suffix: labels.slice(-n).join("."),
    secure: url.protocol === "https:",
    hasAt: url.username !== "" || input.includes("@"),
  };
}

/** Señales de riesgo de un enlace: ids que el popup traduce con chrome.i18n. */
export function linkFlags(input) {
  const a = dissect(input);
  if (!a) return { a: null, flags: [] };
  const host = a.subdomain ? `${a.subdomain}.${a.domain}` : a.domain;
  const name = a.domain.split(".")[0];
  const deLeet = name.replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/5/g, "s");
  const flags = [];
  if (a.protocol === "http:") flags.push("flagHttp");
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) flags.push("flagIp");
  if (a.hasAt) flags.push("flagAt");
  if (/xn--/.test(host)) flags.push("flagPunycode");
  if (ODD_TLDS.has(a.suffix.split(".").pop())) flags.push("flagTld");
  if (BRANDS.some((b) => a.subdomain.includes(b) && !a.domain.includes(b))) flags.push("flagBrandSub");
  if (BRANDS.some((b) => name !== b && ((deLeet !== name && deLeet.includes(b)) || (name.includes(b) && name.includes("-"))))) flags.push("flagLookalike");
  return { a, flags };
}
