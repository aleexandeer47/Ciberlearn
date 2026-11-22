"use client";

import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { useState } from "react";

/** Compartir un enlace del sitio: WhatsApp, copiar y el menú nativo del celular. `path` es relativo al sitio. */
export function ShareButtons({ path, text, compact = false }: { path: string; text: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const url = () => `${window.location.origin}${path}`;
  const size = compact ? "h-10 px-4 text-sm" : "h-12 px-5";

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${text} ${path}`)}`}
        onClick={(e) => {
          // Al tocar se completa con el dominio actual (igual en servidor y navegador hasta ese momento)
          e.currentTarget.href = `https://wa.me/?text=${encodeURIComponent(`${text} ${url()}`)}`;
        }}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn ${size} bg-[#25D366] text-[#08311a] hover:brightness-95`}
      >
        <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
        WhatsApp
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url());
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* sin permiso de portapapeles: no pasa nada */
          }
        }}
        className={`btn btn-ghost ${size}`}
      >
        {copied ? <Check className="h-4 w-4 text-ok" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
        {copied ? "Copiado" : "Copiar enlace"}
      </button>
      <button
        type="button"
        onClick={() => {
          if (navigator.share) navigator.share({ text, url: url() }).catch(() => {});
        }}
        className={`btn btn-ghost ${size} sm:hidden`}
        aria-label="Más opciones para compartir"
      >
        <Share2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
