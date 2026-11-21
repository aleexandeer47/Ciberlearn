import { collections } from "@/lib/server/db";
import { teamReport } from "@/lib/server/org";
import { getCurrentUser } from "@/lib/server/session";

// Celdas que empiezan con = + - @ se anteponen con ' para que Excel no las ejecute como fórmula.
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const sv = (d: Date | null) => (d ? d.toLocaleDateString("es-SV", { timeZone: "America/El_Salvador" }) : "");

/** Informe del equipo en CSV. Solo el encargado de la empresa. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.org || user.org.role !== "owner") return new Response("No encontrado", { status: 404 });
  const { orgs } = await collections();
  const org = await orgs.findOne({ _id: user.org._id, ownerId: user._id });
  if (!org) return new Response("No encontrado", { status: 404 });

  const r = await teamReport(org._id);
  const header = [
    "nombre",
    "correo",
    "rol",
    "se_unio",
    "ultima_entrada",
    "lecciones_completadas",
    "lecciones_totales",
    "avance_ruta_pct",
    "xp",
    "rondas_simulador",
    "puntaje_promedio",
    "punto_debil",
    "simulacros_recibidos",
    "simulacros_cayo",
  ];
  const lines = r.rows.map((m) =>
    [
      m.name,
      m.email,
      m.role === "owner" ? "encargado" : "empleado",
      sv(m.joinedAt),
      sv(m.lastLoginAt),
      m.lessonsDone,
      r.totalLessons,
      Math.round((m.lessonsDone / r.totalLessons) * 100),
      m.xp,
      m.runs,
      m.avgScore,
      m.weakest ?? "",
      m.simsSent,
      m.simsClicked,
    ]
      .map(cell)
      .join(","),
  );
  const csv = "﻿" + [header.join(","), ...lines].join("\r\n");
  const slug = org.name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "empresa";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="informe-${slug}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
