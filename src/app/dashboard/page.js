import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [categoriasRes, jugadoresRes, sesionesRes] = await Promise.all([
    query("SELECT COUNT(*) FROM categorias"),
    query("SELECT COUNT(*) FROM jugadores WHERE activo = true"),
    query("SELECT COUNT(*) FROM sesiones WHERE creado_por = $1", [session?.user?.id]),
  ]);

  const cards = [
    { label: "Categorías", value: categoriasRes.rows[0].count, href: "/categorias", icon: "📋" },
    { label: "Jugadoras activas", value: jugadoresRes.rows[0].count, href: "/jugadores", icon: "🏐" },
    { label: "Mis sesiones registradas", value: sesionesRes.rows[0].count, href: "/asistencia", icon: "✅" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">
        Hola, {session?.user?.name} 👋
      </h1>
      <p className="text-slate-500 mb-6">
        Rol: {session?.user?.role === "ADMIN" ? "Administrador" : "Entrenador"}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="bg-white rounded-xl shadow p-5 hover:shadow-md transition border border-slate-100"
          >
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="text-2xl font-bold text-slate-800">{c.value}</div>
            <div className="text-sm text-slate-500">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-5 border border-slate-100">
        <h2 className="font-semibold mb-3">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/asistencia" className="bg-club text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-club-dark transition">
            + Tomar asistencia
          </Link>
          <Link href="/jugadores" className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
            + Agregar jugadora
          </Link>
          <Link href="/nominas" className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition">
            🖨️ Ver nóminas
          </Link>
        </div>
      </div>
    </div>
  );
}