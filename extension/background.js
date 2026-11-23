import { SITE_URL } from "./lib.js";

// Clic derecho sobre un enlace o un texto seleccionado: lo abre en “¿Es estafa?”.
// Va después del “#”, así el contenido no se envía al servidor: se analiza en el navegador.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({ id: "check-link", title: chrome.i18n.getMessage("menuLink"), contexts: ["link"] });
  chrome.contextMenus.create({ id: "check-text", title: chrome.i18n.getMessage("menuText"), contexts: ["selection"] });
});

chrome.contextMenus.onClicked.addListener((info) => {
  const text = info.menuItemId === "check-link" ? info.linkUrl : info.selectionText;
  if (!text) return;
  const lang = chrome.i18n.getUILanguage().toLowerCase().startsWith("es") ? "es" : "en";
  chrome.tabs.create({ url: `${SITE_URL}/${lang}/revisar#t=${encodeURIComponent(text.slice(0, 2000))}` });
});
