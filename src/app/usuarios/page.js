import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { crearUsuario, eliminarUsuario } from "@/lib/actions";
import ConfirmButton from "@/components/ConfirmButton";

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="bg-white rounded-xl shadow p-6 border border-slate-100 text-center">
        <p className="text-slate-600">
          Solo un Administrador puede gestionar usuarios.
        </p>
      </div>
    );
  }

  const { rows: usuarios } = await query(
    "SELECT id, name, email, role FROM users ORDER BY name ASC"
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Usuarios</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow p-5 border border-slate-100">
            <h2 className="font-semibold mb-4">Nuevo usuario</h2>
            <form action={crearUsuario} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input name="name" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input name="email" type="email" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña *</label>
                <input name="password" type="password" required minLength={6} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol *</label>
                <select name="role" required className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-club">
                  <option value="ENTRENADOR">Entrenador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <button className="bg-club hover:bg-club-dark text-white font-medium rounded-lg py-2 text-sm transition">
                Crear usuario
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
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Rol</th>
                  <th className="text-right px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {u.role === "ADMIN" ? "Administrador" : "Entrenador"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== session.user.id && (
                       <ConfirmButton
  action={eliminarUsuario}
  fields={{ id: u.id }}
  className="text-red-600 hover:underline text-xs"
  message={`¿Eliminar el usuario "${u.name}"? Ya no podrá iniciar sesión.`}
/>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}