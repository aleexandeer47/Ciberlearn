"use client";

import { useT } from "@/components/i18n/LangProvider";

export function PrintButton() {
  const t = useT();
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary px-5 py-2.5 text-sm">
      {t("Descargar PDF / imprimir", "Download PDF / print")}
    </button>
  );
}
