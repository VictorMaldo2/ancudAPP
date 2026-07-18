import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import Link from "next/link";

function edad(fechaNacimiento) {
  if (!fechaNacimiento) return "—";
  const fecha = new Date(fechaNacimiento);
  const hoy = new Date();
  let e = hoy.getUTCFullYear() - fecha.getUTCFullYear();
  const m = hoy.getUTCMonth() - fecha.getUTCMonth();
  if (m < 0 || (m === 0 && hoy.getUTCDate() < fecha.getUTCDate())) e--;
  return e;
}

export default async function NominaCategoriaPage({ params }) {
  const { rows: categoriaRows } = await query(
    "SELECT * FROM categorias WHERE id = $1",
    [params.id]
  );
  const categoria = categoriaRows[0];
  if (!categoria) return notFound();

  const { rows: jugadores } = await query(
    `SELECT * FROM jugadores WHERE categoria_id = $1 AND activo = true ORDER BY apellido ASC`,
    [params.id]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
  <h1 className="text-2xl font-bold">Nómina · {categoria.nombre}</h1>
  <div className="flex gap-2">
    <Link
      href={`/nominas/${categoria.id}/viaje`}
      className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg px-4 py-2 text-sm transition"
    >
      🚌 Listado de viaje
    </Link>
    <PrintButton />
  </div>
</div>

      <div className="bg-white rounded-xl shadow border border-slate-100 p-6 print:shadow-none print:border-none">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Nómina Oficial de Jugadoras</h2>
          <p className="text-slate-600">Categoría: {categoria.nombre}</p>
          <p className="text-xs text-slate-400">
            Generado el {new Date().toLocaleDateString("es-CL")}
          </p>
        </div>

        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-800">
              <th className="text-left py-2 px-2">N°</th>
              <th className="text-left py-2 px-2">Apellido y Nombre</th>
              <th className="text-left py-2 px-2">RUT</th>
              <th className="text-left py-2 px-2">Edad</th>
              <th className="text-left py-2 px-2">Posición</th>
              <th className="text-left py-2 px-2">Camiseta</th>
            </tr>
          </thead>
          <tbody>
            {jugadores.map((j, i) => (
              <tr key={j.id} className="border-b border-slate-200">
                <td className="py-2 px-2">{i + 1}</td>
                <td className="py-2 px-2 font-medium">
                  {j.apellido}, {j.nombre}
                </td>
                <td className="py-2 px-2">{j.rut || "—"}</td>
                <td className="py-2 px-2">{edad(j.fecha_nacimiento)}</td>
                <td className="py-2 px-2">{j.posicion || "—"}</td>
                <td className="py-2 px-2">{j.numero_camiseta ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {jugadores.length === 0 && (
          <p className="text-center text-slate-400 py-6">
            No hay jugadores activos en esta categoría.
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
