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

function labelMes(mesKey) {
  // mesKey viene como "YYYY-MM"
  const [anio, mes] = mesKey.split("-");
  const fecha = new Date(Date.UTC(Number(anio), Number(mes) - 1, 1));
  const texto = fecha.toLocaleDateString("es-CL", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
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
  const mesSeleccionado = searchParams?.mes || null;

  // Resumen general por categoría (tarjetas de arriba)
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

  // Resumen por mes de la categoría seleccionada (siempre muestra todos los meses)
  const { rows: meses } = await query(
    `
    SELECT to_char(s.fecha, 'YYYY-MM') AS mes_key,
      COUNT(a.id)::int AS total,
      COUNT(a.id) FILTER (WHERE a.presente)::int AS presentes
    FROM sesiones s
    LEFT JOIN asistencias a ON a.sesion_id = s.id
    WHERE s.categoria_id = $1
    GROUP BY mes_key
    ORDER BY mes_key ASC
    `,
    [categoriaActual.id]
  );

  // Ranking de jugadoras (filtrado por mes si hay uno seleccionado)
  const { rows: jugadoras } = await query(
    `
    SELECT j.id, j.nombre, j.apellido,
      COUNT(a.id)::int AS total,
      COUNT(a.id) FILTER (WHERE a.presente)::int AS presentes,
      COUNT(a.id) FILTER (WHERE a.presente = false AND a.justificado)::int AS justificadas,
      COUNT(a.id) FILTER (WHERE a.presente = false AND NOT a.justificado)::int AS injustificadas
    FROM jugadores j
    LEFT JOIN asistencias a ON a.jugador_id = j.id
    LEFT JOIN sesiones s ON s.id = a.sesion_id
    WHERE j.categoria_id = $1 AND j.activo = true
      AND (s.id IS NULL OR $2::text IS NULL OR to_char(s.fecha, 'YYYY-MM') = $2)
    GROUP BY j.id, j.nombre, j.apellido
    ORDER BY j.apellido ASC
    `,
    [categoriaActual.id, mesSeleccionado]
  );

  const jugadorasOrdenadas = [...jugadoras].sort(
    (a, b) => pct(a.presentes, a.total) - pct(b.presentes, b.total)
  );

  // Evolución por sesión (filtrada por mes si hay uno seleccionado)
  const { rows: sesiones } = await query(
    `
    SELECT s.id, s.fecha,
      COUNT(a.id)::int AS total,
      COUNT(a.id) FILTER (WHERE a.presente)::int AS presentes
    FROM sesiones s
    LEFT JOIN asistencias a ON a.sesion_id = s.id
    WHERE s.categoria_id = $1
      AND ($2::text IS NULL OR to_char(s.fecha, 'YYYY-MM') = $2)
    GROUP BY s.id, s.fecha
    ORDER BY s.fecha ASC
    `,
    [categoriaActual.id, mesSeleccionado]
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

      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-lg font-bold">{categoriaActual.nombre}</h2>
        {mesSeleccionado && (
          <Link
            href={`/estadisticas?categoria=${categoriaActual.id}`}
            className="text-xs font-medium text-club hover:underline flex items-center gap-1"
          >
            ✕ Quitar filtro de {labelMes(mesSeleccionado)}
          </Link>
        )}
      </div>
      <p className="text-slate-500 text-sm mb-6">
        Asistencia {mesSeleccionado ? `en ${labelMes(mesSeleccionado)}` : "general"}:{" "}
        <span className="font-semibold text-slate-700">
          {pct(
            sesiones.reduce((acc, s) => acc + s.presentes, 0),
            sesiones.reduce((acc, s) => acc + s.total, 0)
          )}
          %
        </span>
      </p>

      {/* Asistencia por mes */}
      <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-600">
          Asistencia por mes
        </div>
        <div className="p-4">
          {meses.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">
              Aún no hay sesiones registradas en esta categoría.
            </p>
          ) : (
            <div className="flex items-end gap-3 h-40 overflow-x-auto pb-2">
              {meses.map((m) => {
                const p = pct(m.presentes, m.total);
                const activo = m.mes_key === mesSeleccionado;
                return (
                  <Link
                    key={m.mes_key}
                    href={
                      activo
                        ? `/estadisticas?categoria=${categoriaActual.id}`
                        : `/estadisticas?categoria=${categoriaActual.id}&mes=${m.mes_key}`
                    }
                    className="flex flex-col items-center justify-end h-full min-w-[52px] group"
                  >
                    <span
                      className={`text-[11px] mb-1 font-medium ${
                        activo ? "text-club" : "text-slate-500"
                      }`}
                    >
                      {p}%
                    </span>
                    <div
                      className={`w-8 rounded-t-md transition-all ${
                        activo ? "bg-club" : `${colorBarra(p)} group-hover:opacity-80`
                      }`}
                      style={{ height: `${Math.max(p, 4)}%` }}
                    />
                    <span
                      className={`text-[11px] mt-1.5 ${
                        activo ? "text-club font-semibold" : "text-slate-400"
                      }`}
                    >
                      {labelMes(m.mes_key)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de jugadoras */}
        <div className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 font-semibold text-sm text-slate-600">
            Asistencia por jugadora (menor a mayor)
            {mesSeleccionado && (
              <span className="text-club font-normal"> · {labelMes(mesSeleccionado)}</span>
            )}
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
            {mesSeleccionado && (
              <span className="text-club font-normal"> · {labelMes(mesSeleccionado)}</span>
            )}
          </div>
          <div className="p-4">
            {sesiones.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No hay sesiones registradas {mesSeleccionado ? "en este mes" : "en esta categoría"}.
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
                      <span className="text-[10px] text-slate-400 mt-1">
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