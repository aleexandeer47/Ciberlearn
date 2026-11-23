# Extensión de Unhooked para Chrome (y Edge, Brave, Opera)

Muestra el **dominio real** de la página que estás viendo, marca las señales típicas de estafa (terminaciones baratas,
marcas en un dominio ajeno, letras de otro alfabeto, “@”, sin https) y, con **clic derecho** sobre un enlace o un texto,
lo abre en “¿Es estafa?” de Unhooked. Español e inglés según el idioma del navegador.

**Privacidad:** no lee el contenido de las páginas ni el historial. Solo mira la dirección de la pestaña cuando abres el
popup (permiso `activeTab`). Lo que mandas a revisar va después del `#` en la dirección, así que no llega a ningún servidor.

## Probarla en tu computadora

1. Abre `chrome://extensions` y activa **Modo de desarrollador**.
2. **Cargar extensión sin empaquetar** → elige esta carpeta `extension/`.
3. Fija el ícono en la barra y ábrelo en cualquier página.

## Publicarla en la Chrome Web Store

1. Crea una cuenta de desarrollador en <https://chrome.google.com/webstore/devconsole> (pago único de US$5).
2. Comprime **el contenido** de esta carpeta en un `.zip` (que `manifest.json` quede en la raíz del zip).
3. Sube el zip, agrega capturas (1280×800), descripción en español e inglés y el enlace a la política de privacidad:
   `https://TU-DOMINIO/privacidad`.
4. En “Prácticas de privacidad” declara que no recopilas datos de usuarios.

Si cambias de dominio, actualiza `SITE_URL` en `lib.js` y vuelve a subir la versión (sube `version` en `manifest.json`).
