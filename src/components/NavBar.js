"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

function getLinks(role) {
  const base = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/categorias", label: "Categorías" },
    { href: "/jugadores", label: "Jugadores" },
    { href: "/asistencia", label: "Asistencia" },
    { href: "/estadisticas", label: "Estadísticas" },
    { href: "/nominas", label: "Nóminas" },
  ];
  if (role === "ADMIN") {
    base.push({ href: "/usuarios", label: "Usuarios" });
  }
  return base;
}

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
  const links = getLinks(session.user?.role);

  return (
    <nav className="no-print sticky top-0 z-50 bg-gradient-to-r from-club to-club-dark backdrop-blur-md shadow-lg shadow-club-dark/10 origin-top transition-transform duration-300 ease-out hover:scale-[1.03] hover:shadow-xl hover:shadow-club-dark/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative flex items-center justify-between h-22">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <span className="flex items-center justify-center w-20 h-20 shrink-0 transition-transform duration-200 ease-out group-hover:scale-110">
              <Image src="/blanco.png" alt="Logo" width={80} height={80} className="object-contain" />
            </span>
            
            <span className="text-white font-semibold text-[15px] tracking-tight whitespace-nowrap">
            
            </span>
          </Link>

          {/* Links desktop - centrados, con animación de escala */}
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            {links.map((l) => {
              const active = pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative px-3 py-2 text-[15.5px] font-medium whitespace-nowrap rounded-lg
                    transition-all duration-200 ease-out
                    hover:scale-110 hover:-translate-y-0.5
                    ${active ? "text-white" : "text-blue-100/80 hover:text-white"}`}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-[3px] left-3 right-3 h-[1.5px] bg-white rounded-full origin-center
                      transition-transform duration-200 ease-out
                      ${active ? "scale-x-100" : "scale-x-0"}
                      group-hover:scale-x-100`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Usuario desktop */}
          <div className="hidden md:block relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center rounded-full border border-white/25 hover:border-white/40 transition-all duration-200 ease-out p-0.5 hover:scale-110"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-club-dark text-xs font-bold">
                {getIniciales(nombre)}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-[fadeIn_0.15s_ease-out]">
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
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white transition-transform duration-200 hover:scale-110"
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
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active ? "bg-white/15 text-white" : "text-blue-100/80 hover:bg-white/10"
                  }`}
                >
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