import { query } from "@/lib/db";
import { crearCategoria, eliminarCategoria } from "@/lib/actions";
import ConfirmButton from "@/components/ConfirmButton";

export default async function CategoriasPage() {
  const { rows: categorias } = await query(`
    SELECT c.*, COUNT(j.id)::int AS jugadores_count
    FROM categorias c
    LEFT JOIN jugadores j ON j.categoria_id = c.id
    GROUP BY c.id
    ORDER BY c.nombre ASC
  `);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-5 border border-slate-100">
            <h2 className="font-semibold mb-4">Nueva categoría</h2>
            <form action={crearCategoria} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre *
                </label>
                <input
                  name="nombre"
                  required
                  placeholder="Ej: Sub16 Damas"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descripción
                </label>
                <input
                  name="descripcion"
                  placeholder="Opcional"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club"
                />
              </div>
              <button className="bg-club hover:bg-club-dark text-white font-medium rounded-lg py-2 text-sm transition">
                Crear categoría
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Nombre</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Descripción</th>
                  <th className="text-left px-4 py-3">Jugadoras</th>
                  <th className="text-right px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{c.nombre}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                      {c.descripcion || "—"}
                    </td>
                    <td className="px-4 py-3">{c.jugadores_count}</td>
                    <td className="px-4 py-3 text-right">
                     <ConfirmButton
  action={eliminarCategoria}
  fields={{ id: c.id }}
  className="text-red-600 hover:underline text-xs"
  message={`¿Eliminar la categoría "${c.nombre}"? Se eliminarán también sus jugadoras y sesiones asociadas.`}
/>
                    </td>
                  </tr>
                ))}
                {categorias.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      Aún no hay categorías
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}