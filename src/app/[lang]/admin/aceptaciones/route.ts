import { exportConsents } from "@/lib/server/admin";
import { getCurrentUser } from "@/lib/server/session";

// Valor de celda CSV. Las celdas que empiezan con = + - @ se anteponen con ' para que
// Excel no las ejecute como fórmula (el user-agent o el correo los escribe la persona).
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const sv = (d: Date) =>
  d.toLocaleString("es-SV", { timeZone: "America/El_Salvador", dateStyle: "short", timeStyle: "medium" });

/** Exporta las aceptaciones (todas o las de la búsqueda ?q=). Solo administradores. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user?.isAdmin) return new Response("No encontrado", { status: 404 });

  const q = new URL(request.url).searchParams.get("q") ?? "";
  const rows = await exportConsents(q);
  const header = [
    "fecha_utc",
    "fecha_el_salvador",
    "correo",
    "documento",
    "version",
    "texto_aceptado",
    "formulario",
    "referencia_pago",
    "ip",
    "navegador",
    "id_usuario",
    "id_registro",
  ];
  const lines = rows.map((c) =>
    [
      c.acceptedAt.toISOString(),
      sv(c.acceptedAt),
      c.email,
      c.document,
      c.version,
      c.text,
      c.source,
      c.orderRef ?? "",
      c.ip ?? "",
      c.userAgent ?? "",
      c.userId.toHexString(),
      c._id.toHexString(),
    ]
      .map(cell)
      .join(","),
  );
  // BOM: Excel abre el archivo como UTF-8 (tildes y ñ correctas)
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="aceptaciones-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
