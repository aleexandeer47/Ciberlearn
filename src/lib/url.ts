// Sufijos de dos niveles más comunes en América, Europa y otros países de habla
// inglesa. No es la Public Suffix List completa, pero cubre los casos que enseña el producto.
const TWO_LEVEL_SUFFIXES = new Set([
  "com.sv", "gob.sv", "edu.sv", "org.sv", "net.sv",
  "com.gt", "gob.gt", "com.hn", "gob.hn", "com.ni", "gob.ni", "co.cr", "go.cr", "com.pa", "gob.pa",
  "com.mx", "gob.mx", "com.co", "gov.co", "com.ar", "gob.ar", "com.pe", "gob.pe", "com.ec", "gob.ec",
  "com.bo", "gob.bo", "com.py", "gov.py", "com.uy", "gub.uy", "com.ve", "gob.ve", "gob.cl", "com.do", "gob.do",
  "com.br", "gov.br", "com.es", "gob.es", "org.es",
  "co.uk", "gov.uk", "org.uk", "ac.uk", "com.au", "gov.au", "co.nz", "govt.nz", "co.za", "gov.za",
  "co.in", "gov.in", "com.ph", "gov.ph", "com.sg", "gov.sg", "co.jp", "com.cn", "com.tr",
]);

export interface UrlAnatomy {
  protocol: string;
  /** Lo que va antes del dominio real (puede contener nombres de marcas para engañar). */
  subdomain: string;
  /** El dominio que realmente controla la página: nombre + sufijo. */
  domain: string;
  suffix: string;
  rest: string;
  secure: boolean;
}

export function dissectUrl(input: string): UrlAnatomy | null {
  const raw = input.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `http://${raw}`);
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase();
  const labels = host.split(".").filter(Boolean);
  if (labels.length < 2) return null;

  const lastTwo = labels.slice(-2).join(".");
  const suffixLen = TWO_LEVEL_SUFFIXES.has(lastTwo) && labels.length >= 3 ? 2 : 1;
  const domainLabels = labels.slice(-(suffixLen + 1));
  const suffix = labels.slice(-suffixLen).join(".");
  const subdomain = labels.slice(0, labels.length - domainLabels.length).join(".");

  const shownProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? `${url.protocol}//` : "";
  const rest = `${url.pathname === "/" && !raw.endsWith("/") ? "" : url.pathname}${url.search}${url.hash}`;

  return {
    protocol: shownProtocol,
    subdomain,
    domain: domainLabels.join("."),
    suffix,
    rest,
    secure: url.protocol === "https:",
  };
}
