/** "Ciberlearn <hola@dominio.com>" o "hola@dominio.com" -> { name, email }. null si no es válido. */
export function parseFrom(value: string, defaultName = "Ciberlearn"): { name: string; email: string } | null {
  const v = value.trim().replace(/^["']|["']$/g, "");
  const m = v.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  const email = (m ? m[2] : v).trim();
  const name = (m ? m[1] : "").trim() || defaultName;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { name, email } : null;
}
