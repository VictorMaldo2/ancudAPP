"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-club hover:bg-club-dark text-white font-medium rounded-lg px-4 py-2 text-sm transition"
    >
      🖨️ Imprimir / Exportar PDF
    </button>
  );
}
