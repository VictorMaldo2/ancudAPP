"use client";

import { useState } from "react";

export default function ListadoViaje({ categoria, jugadores }) {
  const [seleccionados, setSeleccionados] = useState(
    () => new Set(jugadores.map((j) => j.id))
  );
  const [datos, setDatos] = useState({
    rival: "",
    fecha: "",
    horaSalida: "",
    lugarEncuentro: "",
    lugarPartido: "",
    notas: "",
  });

  function toggle(id) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function seleccionarTodas() {
    setSeleccionados(new Set(jugadores.map((j) => j.id)));
  }

  function quitarTodas() {
    setSeleccionados(new Set());
  }

  const jugadorasQueViajan = jugadores.filter((j) => seleccionados.has(j.id));

  return (
    <div>
      {/* Panel de edición (no se imprime) */}
      <div className="no-print bg-white rounded-xl shadow p-5 border border-slate-100 mb-6">
        <h2 className="font-semibold mb-4">Datos del viaje/partido</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rival / Torneo</label>
            <input
              value={datos.rival}
              onChange={(e) => setDatos({ ...datos, rival: e.target.value })}
              placeholder="Ej: vs Murano Pto Montt"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
            <input
              type="date"
              value={datos.fecha}
              onChange={(e) => setDatos({ ...datos, fecha: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hora de salida</label>
            <input
              type="time"
              value={datos.horaSalida}
              onChange={(e) => setDatos({ ...datos, horaSalida: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lugar de encuentro</label>
            <input
              value={datos.lugarEncuentro}
              onChange={(e) => setDatos({ ...datos, lugarEncuentro: e.target.value })}
              placeholder="Ej: Castro"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lugar del partido</label>
            <input
              value={datos.lugarPartido}
              onChange={(e) => setDatos({ ...datos, lugarPartido: e.target.value })}
              placeholder="Ej: Gimnasio Fiscal Ancud"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <input
              value={datos.notas}
              onChange={(e) => setDatos({ ...datos, notas: e.target.value })}
              placeholder="Ej: Llevar uniforme completo"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-slate-700">
            ¿Quiénes viajan? ({jugadorasQueViajan.length}/{jugadores.length})
          </h3>
          <div className="flex gap-2">
            <button onClick={seleccionarTodas} className="text-xs font-medium text-club hover:underline">
              Seleccionar todas
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={quitarTodas} className="text-xs font-medium text-slate-500 hover:underline">
              Quitar todas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-72 overflow-y-auto border border-slate-100 rounded-lg p-2">
          {jugadores.map((j) => (
            <label
              key={j.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={seleccionados.has(j.id)}
                onChange={() => toggle(j.id)}
                className="w-4 h-4 accent-club"
              />
              {j.apellido}, {j.nombre}
              {j.numero_camiseta != null && (
                <span className="text-slate-400"> #{j.numero_camiseta}</span>
              )}
            </label>
          ))}
          {jugadores.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center col-span-2">
              No hay jugadoras activas en esta categoría.
            </p>
          )}
        </div>

        <button
          onClick={() => window.print()}
          className="mt-5 bg-club hover:bg-club-dark text-white font-medium rounded-lg px-4 py-2 text-sm transition"
        >
          🖨️ Imprimir listado de viaje
        </button>
      </div>

      {/* Vista imprimible */}
      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 print:shadow-none print:border-none">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Listado de Viaje / Partido</h2>
          <p className="text-slate-600">Categoría: {categoria.nombre}</p>
          {datos.rival && <p className="text-slate-600">{datos.rival}</p>}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-6 border-y border-slate-200 py-4">
          <p><span className="font-semibold">Fecha:</span> {datos.fecha || "—"}</p>
          <p><span className="font-semibold">Hora de salida:</span> {datos.horaSalida || "—"}</p>
          <p><span className="font-semibold">Lugar de encuentro:</span> {datos.lugarEncuentro || "—"}</p>
          <p><span className="font-semibold">Lugar del partido:</span> {datos.lugarPartido || "—"}</p>
          {datos.notas && (
            <p className="col-span-2"><span className="font-semibold">Notas:</span> {datos.notas}</p>
          )}
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="text-left py-2 px-2">N°</th>
              <th className="text-left py-2 px-2">Apellido y Nombre</th>
              <th className="text-left py-2 px-2">RUT</th>
              <th className="text-left py-2 px-2">Camiseta</th>
             
            </tr>
          </thead>
          <tbody>
            {jugadorasQueViajan.map((j, i) => (
              <tr key={j.id} className="border-b border-slate-200">
                <td className="py-2 px-2">{i + 1}</td>
                <td className="py-2 px-2 font-medium">{j.apellido}, {j.nombre}</td>
                <td className="py-2 px-2">{j.rut || "—"}</td>
                <td className="py-2 px-2">{j.numero_camiseta ?? "—"}</td>
                <td className="py-2 px-2">___________</td>
              </tr>
            ))}
          </tbody>
        </table>

        {jugadorasQueViajan.length === 0 && (
          <p className="text-center text-slate-400 py-6">
            No has seleccionado jugadoras para este viaje todavía.
          </p>
        )}

        <div className="mt-10 flex justify-between text-sm">
          <div className="text-center">
            <div className="border-t border-slate-400 w-40 mt-10 pt-1">Firma Entrenador</div>
          </div>
          <div className="text-center">
            <div className="border-t border-slate-400 w-40 mt-10 pt-1">Firma Dirigente/Club</div>
          </div>
        </div>
      </div>
    </div>
  );
}