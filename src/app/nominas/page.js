import { query } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NominasPage() {
  const { rows: categorias } = await query(`
    SELECT c.*, COUNT(j.id)::int AS jugadores_count
    FROM categorias c
    LEFT JOIN jugadores j ON j.categoria_id = c.id
    GROUP BY c.id
    ORDER BY c.nombre ASC
  `);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nóminas oficiales</h1>
      <p className="text-slate-500 mb-6">
        Elige una categoría para ver e imprimir la nómina de jugadores.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categorias.map((c) => (
          <Link
            key={c.id}
            href={`/nominas/${c.id}`}
            className="bg-white rounded-xl shadow p-5 border border-slate-100 hover:shadow-md transition"
          >
            <div className="font-semibold text-lg">{c.nombre}</div>
            <div className="text-sm text-slate-500">
              {c.jugadores_count} jugador(es)
            </div>
          </Link>
        ))}
        {categorias.length === 0 && (
          <p className="text-slate-400">Aún no hay categorías creadas.</p>
        )}
      </div>
    </div>
  );
}
