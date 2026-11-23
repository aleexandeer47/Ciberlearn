import { linkFlags, SITE_URL } from "./lib.js";

const $ = (id) => document.getElementById(id);
const msg = (k) => chrome.i18n.getMessage(k);
document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = msg(el.dataset.i18n)));
const lang = chrome.i18n.getUILanguage().toLowerCase().startsWith("es") ? "es" : "en";
$("open").href = `${SITE_URL}/${lang}/revisar`;

const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const url = tab?.url ?? "";
const { a, flags } = /^https?:/.test(url) ? linkFlags(url) : { a: null, flags: [] };

if (!a) {
  $("host").textContent = "—";
  $("verdict").textContent = msg("notWeb");
} else {
  // El dominio real resaltado; lo que va antes (subdominio) en gris
  $("host").innerHTML = "";
  if (a.subdomain) {
    const s = document.createElement("span");
    s.className = "sub";
    s.textContent = `${a.subdomain}.`;
    $("host").append(s);
  }
  const d = document.createElement("mark");
  d.textContent = a.domain;
  $("host").append(d);

  const risky = flags.some((f) => f !== "flagHttp");
  $("verdict").textContent = risky ? msg("verdictRisk") : msg("verdictOk");
  $("verdict").className = `verdict ${risky ? "bad" : "ok"}`;
  for (const f of flags) {
    const li = document.createElement("li");
    li.textContent = msg(f);
    $("flags").append(li);
  }
}
