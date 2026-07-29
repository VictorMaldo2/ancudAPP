import { query } from "@/lib/db";
import { crearJugador, eliminarJugador, toggleJugadorActivo, editarJugador } from "@/lib/actions";
import ConfirmButton from "@/components/ConfirmButton";

function toInputDate(fecha) {
  if (!fecha) return "";
  const d = new Date(fecha);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default async function JugadoresPage() {
  const [jugadoresRes, categoriasRes] = await Promise.all([
    query(`
      SELECT j.*, c.nombre AS categoria_nombre
      FROM jugadores j
      JOIN categorias c ON c.id = j.categoria_id
      ORDER BY c.nombre ASC, j.apellido ASC
    `),
    query("SELECT * FROM categorias ORDER BY nombre ASC"),
  ]);

  const jugadores = jugadoresRes.rows;
  const categorias = categoriasRes.rows;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Jugadores</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-5 border border-slate-100">
            <h2 className="font-semibold mb-4">Nuevo jugador</h2>
            {categorias.length === 0 ? (
              <p className="text-sm text-slate-500">
                Primero crea una categoría en la sección{" "}
                <a href="/categorias" className="text-club underline">
                  Categorías
                </a>
                .
              </p>
            ) : (
              <form action={crearJugador} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                    <input name="nombre" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellido *</label>
                    <input name="apellido" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría *</label>
                  <select name="categoriaId" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club">
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">RUT</label>
                  <input name="rut" placeholder="12.345.678-9" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de nacimiento</label>
                  <input name="fechaNacimiento" type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Posición</label>
                    <input name="posicion" placeholder="Ej: Central" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">N° camiseta</label>
                    <input name="numeroCamiseta" type="number" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                  <input name="telefono" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input name="email" type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
                </div>

                <button className="bg-club hover:bg-club-dark text-white font-medium rounded-lg py-2 text-sm transition mt-1">
                  Agregar jugador
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-slate-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Jugador</th>
                  <th className="text-left px-4 py-3">Categoría</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">RUT</th>
                  <th className="text-left px-4 py-3">Estado</th>
                  <th className="text-right px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((j) => (
                  <tr key={j.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-medium">
                      {j.apellido}, {j.nombre}
                      {j.numero_camiseta != null && (
                        <span className="text-slate-400"> #{j.numero_camiseta}</span>
                      )}
                      <details className="mt-1.5">
                        <summary className="text-club cursor-pointer hover:underline select-none text-xs font-normal">
                          Editar datos
                        </summary>
                        <form
                          action={editarJugador}
                          className="mt-2 flex flex-col gap-2 border border-slate-200 rounded-lg p-3 bg-slate-50 max-w-xs"
                        >
                          <input type="hidden" name="id" value={j.id} />

                          <div className="grid grid-cols-2 gap-2">
                            <input name="nombre" defaultValue={j.nombre} required placeholder="Nombre" className="border border-slate-300 rounded px-2 py-1.5 text-xs" />
                            <input name="apellido" defaultValue={j.apellido} required placeholder="Apellido" className="border border-slate-300 rounded px-2 py-1.5 text-xs" />
                          </div>

                          <select name="categoriaId" defaultValue={j.categoria_id} required className="border border-slate-300 rounded px-2 py-1.5 text-xs">
                            {categorias.map((c) => (
                              <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                          </select>

                          <input name="rut" defaultValue={j.rut || ""} placeholder="RUT" className="border border-slate-300 rounded px-2 py-1.5 text-xs" />

                          <input name="fechaNacimiento" type="date" defaultValue={toInputDate(j.fecha_nacimiento)} className="border border-slate-300 rounded px-2 py-1.5 text-xs" />

                          <div className="grid grid-cols-2 gap-2">
                            <input name="posicion" defaultValue={j.posicion || ""} placeholder="Posición" className="border border-slate-300 rounded px-2 py-1.5 text-xs" />
                            <input name="numeroCamiseta" type="number" defaultValue={j.numero_camiseta ?? ""} placeholder="N° camiseta" className="border border-slate-300 rounded px-2 py-1.5 text-xs" />
                          </div>

                          <input name="telefono" defaultValue={j.telefono || ""} placeholder="Teléfono" className="border border-slate-300 rounded px-2 py-1.5 text-xs" />
                          <input name="email" type="email" defaultValue={j.email || ""} placeholder="Email" className="border border-slate-300 rounded px-2 py-1.5 text-xs" />

                          <button className="mt-1 bg-club hover:bg-club-dark text-white rounded px-2 py-1.5 text-xs font-medium">
                            Guardar cambios
                          </button>
                        </form>
                      </details>
                    </td>
                    <td className="px-4 py-3">{j.categoria_nombre}</td>
                    <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{j.rut || "—"}</td>
                    <td className="px-4 py-3">
                      <form action={toggleJugadorActivo}>
                        <input type="hidden" name="id" value={j.id} />
                        <button
                          className={`text-xs font-medium px-2 py-1 rounded-full ${
                            j.activo
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {j.activo ? "Activo" : "Inactivo"}
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3 text-right">
                     <ConfirmButton
  action={eliminarJugador}
  fields={{ id: j.id }}
  className="text-red-600 hover:underline text-xs"
  message={`¿Eliminar a ${j.nombre} ${j.apellido}? Se eliminará también su historial de asistencia.`}
/>
                    </td>
                  </tr>
                ))}
                {jugadores.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Aún no hay jugadores
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