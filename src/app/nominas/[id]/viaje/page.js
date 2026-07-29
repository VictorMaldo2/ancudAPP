import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import ListadoViaje from "@/components/Listadoviaje";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ViajeCategoriaPage({ params }) {
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
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold">Listado de viaje · {categoria.nombre}</h1>
        <Link href={`/nominas/${categoria.id}`} className="text-sm text-club hover:underline">
          ← Volver a la nómina completa
        </Link>
      </div>

      <ListadoViaje categoria={categoria} jugadores={jugadores} />
    </div>
  );
}