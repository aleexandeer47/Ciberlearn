// Nombre del producto: cambiarlo aquí lo cambia en todo el sitio.
export const SITE = {
  name: "Unhooked",
  /** Dominio oficial (sin "/" final). Es la dirección que ve Google: canónicas, sitemap y robots.txt. */
  url: "https://www.unhooked.website",
  // Título y descripción que muestra Google para la página principal ("Unhooked | <tagline>").
  tagline: {
    es: "Aprende a detectar phishing y estafas digitales",
    en: "Learn to spot phishing and online scams",
  },
  description: {
    es: "Aprende a identificar correos fraudulentos, mensajes falsos, estafas por WhatsApp y ataques de phishing. Practica gratis con el simulador interactivo de Unhooked.",
    en: "Learn to spot fraudulent emails, fake messages, WhatsApp scams and phishing attacks. Practice for free with Unhooked’s interactive simulator.",
  },
  // Correo de contacto para empresas. Vacío = el botón muestra "Próximamente".
  contactEmail: "",
  // Contacto público para privacidad y datos personales (aparece en /privacidad).
  privacyEmail: "ciberlearnsv@gmail.com",
  year: 2026,
  /** Google Tag Manager (Google Analytics). Solo se carga en producción y con permiso del aviso de cookies. Vacío = sin analítica. */
  gtmId: "GTM-MPHPC842",
  /**
   * Identificación del proveedor que exige la Ley de Protección al Consumidor de El Salvador
   * (art. 4 letra q) para vender en línea. Se muestra en /terminos; los campos vacíos no aparecen.
   * COMPLÉTALOS antes de vender: nombre o razón social, NIT, dirección y teléfono.
   */
  provider: {
    legalName: "",
    nit: "",
    address: "",
    phone: "",
  },
} as const;
