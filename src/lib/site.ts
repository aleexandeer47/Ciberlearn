// Nombre del producto: cambiarlo aquí lo cambia en todo el sitio.
export const SITE = {
  name: "Unhooked",
  /** Dominio oficial (sin "/" final). Es la dirección que ve Google: canónicas, sitemap y robots.txt. */
  url: "https://www.unhooked.website",
  // Título y descripción que muestra Google para la página principal ("Unhooked | <tagline>").
  // Palabras clave principales (investigación SEO, nov. 2026): phishing, estafas por internet, estafas por WhatsApp,
  // smishing (SMS), vishing (llamadas), correos falsos, enlaces falsos, suplantación de identidad, fraude bancario.
  tagline: {
    es: "Aprende a detectar phishing y estafas por internet",
    en: "Learn to spot phishing and online scams",
  },
  description: {
    es: "Aprende a detectar phishing y estafas por internet: correos falsos, estafas por WhatsApp, SMS y llamadas. Practica gratis con el simulador de Unhooked.",
    en: "Learn to spot phishing and online scams: fake emails, WhatsApp scams, texts and calls. Practice for free with Unhooked’s interactive simulator.",
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
   * Son datos personales: NO van aquí (el repositorio es público). Se leen de las variables de
   * entorno PROVIDER_LEGAL_NAME, PROVIDER_NIT, PROVIDER_ADDRESS y PROVIDER_PHONE
   * (.env.local en tu computadora y Environment Variables en Vercel).
   */
  provider: {
    legalName: process.env.PROVIDER_LEGAL_NAME ?? "",
    nit: process.env.PROVIDER_NIT ?? "",
    address: process.env.PROVIDER_ADDRESS ?? "",
    phone: process.env.PROVIDER_PHONE ?? "",
  },
} as const;
