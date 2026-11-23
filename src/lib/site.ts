// Nombre del producto: cambiarlo aquí lo cambia en todo el sitio.
export const SITE = {
  name: "Unhooked",
  tagline: {
    es: "Entrena el ojo para detectar estafas digitales",
    en: "Train your eye to spot online scams",
  },
  description: {
    es: "Simulador gratuito para aprender a reconocer phishing en correos, SMS y chats, con casos reales de todo el mundo.",
    en: "Free simulator to learn to spot phishing in emails, texts and chats, built on real scams from around the world.",
  },
  // Correo de contacto para empresas. Vacío = el botón muestra "Próximamente".
  contactEmail: "",
  // Contacto público para privacidad y datos personales (aparece en /privacidad).
  privacyEmail: "ciberlearnsv@gmail.com",
  year: 2026,
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
