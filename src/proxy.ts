import { NextResponse, type NextRequest } from "next/server";
import { isLang, LANG_COOKIE, LANG_HEADER, negotiate, type Lang } from "@/lib/i18n";

// Todas las páginas viven en app/[lang]/. Este proxy decide el idioma y reescribe
// la ruta por dentro, así las direcciones públicas no cambian:
//   /ruta     -> /es/ruta o /en/ruta (según cookie o idioma del navegador)
//   /en/ruta  -> se sirve tal cual y recuerda "en" en la cookie
// No hace redirecciones: cada idioma se puede cachear por separado.

const YEAR = 60 * 60 * 24 * 365;

function withLang(req: NextRequest, lang: Lang) {
  const h = new Headers(req.headers);
  h.set(LANG_HEADER, lang);
  return h;
}

function remember(res: NextResponse, lang: Lang) {
  res.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: YEAR, sameSite: "lax" });
  return res;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get(LANG_COOKIE)?.value;
  const seg = pathname.split("/")[1];

  if (isLang(seg)) {
    const res = NextResponse.next({ request: { headers: withLang(req, seg) } });
    return cookie === seg ? res : remember(res, seg);
  }

  const lang = isLang(cookie) ? cookie : negotiate(req.headers.get("accept-language"));
  const url = req.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.rewrite(url, { request: { headers: withLang(req, lang) } });
  return isLang(cookie) ? res : remember(res, lang);
}

export const config = {
  // Fuera: API (webhook de Wompi), archivos internos, íconos, manifiesto, service worker
  // y cualquier archivo con extensión (imágenes de /public, etc.).
  matcher: ["/((?!api/|_next/|app-icon|apple-icon|icon\\.svg|manifest\\.webmanifest|sw\\.js|favicon\\.ico|.*\\.[A-Za-z0-9]+$).*)"],
};
