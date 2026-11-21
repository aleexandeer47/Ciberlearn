# Ciberlearn

Simulador en español para aprender a reconocer phishing en correos, SMS y chats, con escenarios pensados para El Salvador. Tiene cuentas, estadísticas por persona y un plan Pro de pago.

## Puesta en marcha

```bash
cp .env.example .env.local   # y ajusta los valores
npm install
npm run db:init              # crea la base "anzuelo" y sus índices en MongoDB
npm run dev                  # http://localhost:3000
npm test
```

Requiere MongoDB (local en `mongodb://127.0.0.1:27017` o Atlas).

## Planes y pagos

- **Gratis**: simulador clásico, cuenta, nivel/XP, skills e insignias, últimas 3 rondas.
- **Pro** (`src/lib/plans.ts`): $3.99 por 30 días o $29.99 por 365 días. Pack avanzado, contrarreloj, entrenamiento dirigido, historial completo y certificado.

Los pagos usan **enlaces de pago de Wompi El Salvador** (pago único; no hay cobro automático):

1. `startCheckout` crea una orden `pending` con una referencia única y un enlace en `POST https://api.wompi.sv/EnlacePago`.
2. Wompi llama a `POST /api/wompi/webhook`. Se valida el header `wompi_hash` (HMAC-SHA256 del body crudo con el API Secret), el monto y la referencia.
3. `fulfillOrder` marca la orden como pagada y extiende `proUntil`. Es idempotente: un webhook repetido no suma días dos veces.
4. `/pago/resultado` solo muestra el estado; **el plan solo se activa con el webhook**.

`PAYMENTS_MODE=mock` (por defecto) reemplaza Wompi por una página de pago simulado. Solo funciona fuera de producción (`next dev`).

### Pasar a Wompi real

1. En `panel.wompi.sv` crea el aplicativo y copia el App ID y el API Secret.
2. En `.env.local`: `PAYMENTS_MODE=wompi`, `WOMPI_APP_ID`, `WOMPI_API_SECRET` y `APP_URL` con tu dominio público.
3. Wompi necesita llegar al webhook: en local usa un túnel (ngrok, cloudflared) y pon esa URL en `APP_URL`.
4. Con el comercio en modo desarrollo, las transacciones de prueba llegan con `EsProductiva: false`. En producción se ignoran salvo que `WOMPI_ALLOW_TEST=true`.

## Panel de administración (`/admin`)

Muestra visitas, inicios de sesión, usuarios nuevos, gratis vs Pro, ganancias (solo pagos reales de Wompi; los simulados aparecen aparte), un gráfico de 30 días y los últimos usuarios y pagos.

1. Crea tu cuenta normal en `/registro`.
2. Dale permiso de administrador: `npm run admin -- tucorreo@ejemplo.com` (para quitarlo: `--quitar`).
3. Entra en `/admin`. Sin sesión te manda a `/admin/entrar`; una cuenta sin permiso recibe 404.

Las visitas se cuentan una vez por navegador y por día (`/api/visit`, colección `daily_stats`), sin guardar datos personales. Los inicios de sesión se cuentan al crear cada sesión.

## Correos (recuperar contraseña)

`/recuperar` envía un enlace de un solo uso que vence en 1 hora. `/restablecer` cambia la contraseña, cierra las demás sesiones e inicia sesión.

Para enviar correos de verdad, en `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxx
EMAIL_FROM="Ciberlearn <no-responder@tudominio.com>"   # dominio verificado en Resend
```

Sin esa clave no se envía nada: en desarrollo el enlace aparece en la pantalla y en la consola del servidor. Para usar otro servicio, cambia solo `sendEmail` en `src/lib/server/email.ts`. La plantilla del correo está en `src/lib/emails/resetPassword.ts`.

## Base de datos (MongoDB, base `anzuelo`)

| Colección | Contenido |
|---|---|
| `users` | email (único), nombre, hash scrypt de la contraseña, `proUntil` |
| `sessions` | sha256 del token de la cookie, vencimiento con TTL (30 días) |
| `runs` | cada ronda: modo, puntaje y por respuesta las señales encontradas y su categoría |
| `orders` | órdenes de pago: referencia, plan, monto, estado, id de transacción |
| `login_attempts` | intentos fallidos (TTL 15 min, máximo 8 por correo) |
| `password_resets` | sha256 del token del enlace, vence en 1 h, un solo uso (máximo 3 pedidos cada 15 min) |

El servidor **recalcula** el puntaje de cada ronda a partir de lo que la persona marcó (`src/app/actions/runs.ts`); no confía en los puntos que manda el navegador.

## Estructura

- `src/lib/scenarios/data.ts` / `pro.ts`: escenarios gratis y Pro (marcas ficticias).
- `src/lib/scoring.ts`, `src/lib/stats.ts`: puntaje, niveles, skills, racha e insignias (funciones puras con pruebas).
- `src/lib/server/`: Mongo, sesiones, contraseñas, cobro y Wompi.
- `src/app/actions/`: server actions de auth, rondas y cobro.
- `src/app/progreso`, `planes`, `simulador/[modo]`, `certificado`, `pago/*`: páginas.
