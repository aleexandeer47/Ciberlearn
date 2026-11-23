import { requestLang } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { teamReport } from "@/lib/server/org";
import { getCurrentUser } from "@/lib/server/session";

// Celdas que empiezan con = + - @ se anteponen con ' para que Excel no las ejecute como fórmula.
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Fechas en formato ISO (AAAA-MM-DD): se leen igual en cualquier país y hoja de cálculo.
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

/** Informe del equipo en CSV. Solo el encargado de la empresa. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user?.org || user.org.role !== "owner") return new Response("No encontrado", { status: 404 });
  const { orgs } = await collections();
  const org = await orgs.findOne({ _id: user.org._id, ownerId: user._id });
  if (!org) return new Response("No encontrado", { status: 404 });

  const lang = await requestLang();
  const en = lang === "en";
  const r = await teamReport(org._id, lang);
  const header = en
    ? ["name", "email", "role", "joined", "last_login", "lessons_completed", "lessons_total", "path_progress_pct", "xp", "simulator_rounds", "average_score", "weak_spot", "drills_received", "drills_fell_for"]
    : [
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
      m.role === "owner" ? (en ? "manager" : "encargado") : en ? "employee" : "empleado",
      iso(m.joinedAt),
      iso(m.lastLoginAt),
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
  const slug = org.name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || (en ? "company" : "empresa");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${en ? "report" : "informe"}-${slug}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
