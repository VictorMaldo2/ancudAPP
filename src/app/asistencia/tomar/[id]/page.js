import { query } from "@/lib/db";
import { guardarAsistencia } from "@/lib/actions";
import { notFound } from "next/navigation";

export default async function TomarAsistenciaPage({ params }) {
  const { rows: sesionRows } = await query(
    `SELECT s.*, c.nombre AS categoria_nombre
     FROM sesiones s
     JOIN categorias c ON c.id = s.categoria_id
     WHERE s.id = $1`,
    [params.id]
  );
  const sesion = sesionRows[0];
  if (!sesion) return notFound();

  const { rows: jugadores } = await query(
    `SELECT * FROM jugadores WHERE categoria_id = $1 AND activo = true ORDER BY apellido ASC`,
    [sesion.categoria_id]
  );

  const { rows: asistenciasExistentes } = await query(
    `SELECT * FROM asistencias WHERE sesion_id = $1`,
    [sesion.id]
  );
  const asistenciaMap = new Map(asistenciasExistentes.map((a) => [a.jugador_id, a]));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        Asistencia · {sesion.categoria_nombre}
      </h1>
      <p className="text-slate-500 mb-6">
        {new Date(sesion.fecha).toLocaleDateString("es-CL", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })}
      </p>

      {jugadores.length === 0 ? (
        <p className="text-slate-500">
          No hay jugadores activos en esta categoría todavía.
        </p>
      ) : (
        <form action={guardarAsistencia} className="bg-white rounded-xl shadow border border-slate-100 overflow-hidden">
          <input type="hidden" name="sesionId" value={sesion.id} />

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Jugador</th>
                  <th className="text-center px-4 py-3">Presente</th>
                  <th className="text-center px-4 py-3">Justificado</th>
                  <th className="text-left px-4 py-3">Observación</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((j) => {
                  const existente = asistenciaMap.get(j.id);
                  return (
                    <tr key={j.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium">
                        <input type="hidden" name="jugadorId" value={j.id} />
                        {j.apellido}, {j.nombre}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          name={`presente-${j.id}`}
                          defaultChecked={existente?.presente ?? false}
                          className="w-5 h-5 accent-club"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          name={`justificado-${j.id}`}
                          defaultChecked={existente?.justificado ?? false}
                          className="w-5 h-5 accent-amber-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          name={`obs-${j.id}`}
                          defaultValue={existente?.observacion || ""}
                          placeholder="Opcional"
                          className="w-full border border-slate-300 rounded-lg px-2 py-1 text-sm"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
            <button className="bg-club hover:bg-club-dark text-white font-medium rounded-lg px-5 py-2.5 text-sm transition">
              Guardar asistencia
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
