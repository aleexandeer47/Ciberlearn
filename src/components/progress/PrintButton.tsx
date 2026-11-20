"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn btn-primary px-5 py-2.5 text-sm">
      Descargar PDF / imprimir
    </button>
  );
}
