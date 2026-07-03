import { query } from "@/lib/db";
import { crearSesionYRedirigir } from "@/lib/actions";
import Link from "next/link";

export default async function AsistenciaPage() {
  const [categoriasRes, sesionesRes] = await Promise.all([
    query("SELECT * FROM categorias ORDER BY nombre ASC"),
    query(`
      SELECT s.*, c.nombre AS categoria_nombre,
        COUNT(a.id)::int AS total,
        COUNT(a.id) FILTER (WHERE a.presente = true)::int AS presentes
      FROM sesiones s
      JOIN categorias c ON c.id = s.categoria_id
      LEFT JOIN asistencias a ON a.sesion_id = s.id
      GROUP BY s.id, c.nombre
      ORDER BY s.fecha DESC
      LIMIT 20
    `),
  ]);

  const categorias = categoriasRes.rows;
  const sesiones = sesionesRes.rows;
  const hoy = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Asistencia</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-5 border border-slate-100">
            <h2 className="font-semibold mb-4">Nueva sesión de entrenamiento</h2>
            {categorias.length === 0 ? (
              <p className="text-sm text-slate-500">
                Primero crea una categoría en{" "}
                <a href="/categorias" className="text-club underline">Categorías</a>.
              </p>
            ) : (
              <form action={crearSesionYRedirigir} className="flex flex-col gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                  <select name="categoriaId" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club">
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
                  <input name="fecha" type="date" required defaultValue={hoy} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                </div>
                <button className="bg-club hover:bg-club-dark text-white font-medium rounded-lg py-2 text-sm transition">
                  Comenzar a tomar asistencia →
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-600">
              Últimas sesiones
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-2">Fecha</th>
                  <th className="text-left px-4 py-2">Categoría</th>
                  <th className="text-left px-4 py-2">Presentes</th>
                  <th className="text-right px-4 py-2">Acción</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      {new Date(s.fecha).toLocaleDateString("es-CL", { timeZone: "UTC" })}
                    </td>
                    <td className="px-4 py-2">{s.categoria_nombre}</td>
                    <td className="px-4 py-2">
                      {s.presentes}/{s.total}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/asistencia/tomar/${s.id}`}
                        className="text-club hover:underline text-xs font-medium"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
                {sesiones.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                      Aún no hay sesiones registradas
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
