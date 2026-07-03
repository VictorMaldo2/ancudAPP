"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/categorias", label: "Categorías", icon: "📋" },
  { href: "/jugadores", label: "Jugadores", icon: "🏐" },
  { href: "/asistencia", label: "Asistencia", icon: "✅" },
  { href: "/nominas", label: "Nóminas", icon: "🖨️" },
];

function getIniciales(nombre) {
  if (!nombre) return "?";
  const partes = nombre.trim().split(" ");
  const primeras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() || "");
  return primeras.join("");
}

export default function NavBar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  if (!session) return null;

  const nombre = session.user?.name || "";
  const rol = session.user?.role === "ADMIN" ? "Administrador" : "Entrenador";

  return (
    <nav className="no-print sticky top-0 z-50 bg-gradient-to-r from-club to-club-dark/95 backdrop-blur-md shadow-lg shadow-club-dark/10 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <span className="flex items-center justify-center w-15 h-15 rounded-xl bg-white/15 shadow-inner group-hover:bg-white/25 transition overflow-hidden p-1">
  <Image
    src="/blanco.png"
    alt="Logo del club"
    width={40}
    height={40}
    className="object-contain"
  />
</span>
            <div className="leading-tight">
              <div className="text-white font-bold text-xl tracking-tight">
                Club voleibol Ancud
              </div>
              <div className="text-blue-100/70 text-sm font-medium hidden sm:block">
                Panel de gestión
              </div>
            </div>
          </Link>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-1 bg-black/10 rounded-full p-1">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                   key={l.href}
  href={l.href}
  className={`relative px-4 py-2.5 rounded-full text-base font-medium transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? "bg-white text-club-dark shadow-sm"
                      : "text-blue-50/90 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="text-base">{l.icon}</span>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Usuario desktop */}
          <div className="hidden md:block relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white text-club-dark text-xs font-bold">
                {getIniciales(nombre)}
              </span>
              <span className="text-white text-sm font-medium max-w-[100px] truncate">
                {nombre}
              </span>
              <svg
                className={`w-3.5 h-3.5 text-white/70 transition-transform ${menuOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-800 truncate">{nombre}</div>
                  <div className="text-xs text-slate-500">{rol}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          {/* Botón hamburguesa mobile */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 text-white"
            onClick={() => setOpen(!open)}
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menú mobile */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            open ? "max-h-96 pb-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 pt-1">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                    active
                      ? "bg-white text-club-dark"
                      : "text-blue-50/90 hover:bg-white/10"
                  }`}
                >
                  <span>{l.icon}</span>
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-club-dark text-xs font-bold">
                {getIniciales(nombre)}
              </span>
              <div className="leading-tight">
                <div className="text-white text-sm font-medium">{nombre}</div>
                <div className="text-blue-100/70 text-xs">{rol}</div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-500/90 hover:bg-red-600 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}