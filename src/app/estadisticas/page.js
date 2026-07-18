import { query } from "@/lib/db";
import Link from "next/link";

function pct(presentes, total) {
  if (!total) return 0;
  return Math.round((presentes / total) * 1000) / 10;
}

function colorBarra(p) {
  if (p >= 80) return "bg-green-500";
  if (p >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export default async function EstadisticasPage({ searchParams }) {
  const { rows: categorias } = await query(
    "SELECT * FROM categorias ORDER BY nombre ASC"
  );

  if (categorias.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Estadísticas de asistencia</h1>
        <p className="text-slate-500">
          Primero crea categorías y registra asistencia para ver estadísticas.
        </p>
      </div>
    );
  }

  const categoriaId = searchParams?.categoria || categorias[0].id;
  const categoriaActual = categorias.find((c) => c.id === categoriaId) || categorias[0];

  // Resumen general por categoría (para las tarjetas de arriba)
  const { rows: resumenCategorias } = await query(`
    SELECT c.id, c.nombre,
      COUNT(a.id)::int AS total_registros,
      COUNT(a.id) FILTER (WHERE a.presente)::int AS total_presentes
    FROM categorias c
    LEFT JOIN sesiones s ON s.categoria_id = c.id
    LEFT JOIN asistencias a ON a.sesion_id = s.id
    GROUP BY c.id, c.nombre
    ORDER BY c.nombre ASC
  `);

  // Ranking de jugadoras de la categoría seleccionada
  const { rows: jugadoras } = await query(
    `
    SELECT j.id, j.nombre, j.apellido,
      COUNT(a.id)::int AS total,
      COUNT(a.id) FILTER (WHERE a.presente)::int AS presentes,
      COUNT(a.id) FILTER (WHERE a.presente = false AND a.justificado)::int AS justificadas,
      COUNT(a.id) FILTER (WHERE a.presente = false AND NOT a.justificado)::int AS injustificadas
    FROM jugadores j
    LEFT JOIN asistencias a ON a.jugador_id = j.id
    WHERE j.categoria_id = $1 AND j.activo = true
    GROUP BY j.id, j.nombre, j.apellido
    ORDER BY j.apellido ASC
    `,
    [categoriaActual.id]
  );

  const jugadorasOrdenadas = [...jugadoras].sort(
    (a, b) => pct(a.presentes, a.total) - pct(b.presentes, b.total)
  );

  // Evolución sesión por sesión de la categoría seleccionada
  const { rows: sesiones } = await query(
    `
    SELECT s.id, s.fecha,
      COUNT(a.id)::int AS total,
      COUNT(a.id) FILTER (WHERE a.presente)::int AS presentes
    FROM sesiones s
    LEFT JOIN asistencias a ON a.sesion_id = s.id
    WHERE s.categoria_id = $1
    GROUP BY s.id, s.fecha
    ORDER BY s.fecha ASC
    `,
    [categoriaActual.id]
  );

  const totalCategoriaActual = resumenCategorias.find((c) => c.id === categoriaActual.id);
  const pctCategoriaActual = totalCategoriaActual
    ? pct(totalCategoriaActual.total_presentes, totalCategoriaActual.total_registros)
    : 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Estadísticas de asistencia</h1>

      {/* Tarjetas resumen por categoría */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {resumenCategorias.map((c) => {
          const p = pct(c.total_presentes, c.total_registros);
          const activa = c.id === categoriaActual.id;
          return (
            <Link
              key={c.id}
              href={`/estadisticas?categoria=${c.id}`}
              className={`rounded-xl p-4 border transition ${
                activa
                  ? "bg-club text-white border-club shadow-md"
                  : "bg-white border-slate-100 hover:shadow-md"
              }`}
            >
              <div className={`text-xs font-medium mb-1 ${activa ? "text-blue-100" : "text-slate-500"}`}>
                {c.nombre}
              </div>
              <div className="text-2xl font-bold">
                {c.total_registros > 0 ? `${p}%` : "—"}
              </div>
              <div className={`text-xs ${activa ? "text-blue-100" : "text-slate-400"}`}>
                {c.total_registros > 0
                  ? `${c.total_presentes}/${c.total_registros} registros`
                  : "Sin datos"}
              </div>
            </Link>
          );
        })}
      </div>

      <h2 className="text-lg font-bold mb-1">{categoriaActual.nombre}</h2>
      <p className="text-slate-500 text-sm mb-6">
        Asistencia general: <span className="font-semibold text-slate-700">{pctCategoriaActual}%</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de jugadoras */}
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-600">
            Asistencia por jugadora (menor a mayor)
          </div>
          <div className="p-4 flex flex-col gap-3">
            {jugadorasOrdenadas.map((j) => {
              const p = pct(j.presentes, j.total);
              return (
                <div key={j.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">
                      {j.apellido}, {j.nombre}
                    </span>
                    <span className="text-slate-500">
                      {j.total > 0 ? `${p}%` : "Sin registros"}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${colorBarra(p)}`}
                      style={{ width: `${j.total > 0 ? p : 0}%` }}
                    />
                  </div>
                  {j.total > 0 && (
                    <div className="text-xs text-slate-400 mt-1">
                      {j.presentes} presente(s) · {j.justificadas} justificada(s) · {j.injustificadas} sin justificar
                    </div>
                  )}
                </div>
              );
            })}
            {jugadorasOrdenadas.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No hay jugadoras activas en esta categoría.
              </p>
            )}
          </div>
        </div>

        {/* Evolución por sesión */}
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-600">
            Evolución por sesión
          </div>
          <div className="p-4">
            {sesiones.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                Aún no hay sesiones registradas en esta categoría.
              </p>
            ) : (
              <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
                {sesiones.map((s) => {
                  const p = pct(s.presentes, s.total);
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col items-center justify-end h-full min-w-[36px]"
                      title={`${new Date(s.fecha).toLocaleDateString("es-CL", { timeZone: "UTC" })}: ${p}%`}
                    >
                      <span className="text-[10px] text-slate-500 mb-1">{p}%</span>
                      <div
                        className={`w-6 rounded-t-md ${colorBarra(p)}`}
                        style={{ height: `${Math.max(p, 3)}%` }}
                      />
                      <span className="text-[10px] text-slate-400 mt-1 rotate-0">
                        {new Date(s.fecha).toLocaleDateString("es-CL", {
                          day: "2-digit",
                          month: "2-digit",
                          timeZone: "UTC",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}