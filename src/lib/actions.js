"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ---------- CATEGORÍAS ----------
export async function crearCategoria(formData) {
  const nombre = String(formData.get("nombre") || "").trim();
  const descripcion = String(formData.get("descripcion") || "").trim();
  if (!nombre) return;

  await query(
    "INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2)",
    [nombre, descripcion || null]
  );
  revalidatePath("/categorias");
}

export async function eliminarCategoria(formData) {
  const id = String(formData.get("id"));
  await query("DELETE FROM categorias WHERE id = $1", [id]);
  revalidatePath("/categorias");
}

// ---------- JUGADORES ----------
export async function crearJugador(formData) {
  const nombre = String(formData.get("nombre") || "").trim();
  const apellido = String(formData.get("apellido") || "").trim();
  const rut = String(formData.get("rut") || "").trim();
  const categoriaId = String(formData.get("categoriaId") || "");
  const telefono = String(formData.get("telefono") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const posicion = String(formData.get("posicion") || "").trim();
  const numeroCamisetaRaw = String(formData.get("numeroCamiseta") || "").trim();
  const fechaNacimientoRaw = String(formData.get("fechaNacimiento") || "").trim();

  if (!nombre || !apellido || !categoriaId) return;

  await query(
    `INSERT INTO jugadores
      (nombre, apellido, rut, categoria_id, telefono, email, posicion, numero_camiseta, fecha_nacimiento)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      nombre,
      apellido,
      rut || null,
      categoriaId,
      telefono || null,
      email || null,
      posicion || null,
      numeroCamisetaRaw ? parseInt(numeroCamisetaRaw, 10) : null,
      fechaNacimientoRaw || null,
    ]
  );
  revalidatePath("/jugadores");
}

export async function eliminarJugador(formData) {
  const id = String(formData.get("id"));
  await query("DELETE FROM jugadores WHERE id = $1", [id]);
  revalidatePath("/jugadores");
}

export async function toggleJugadorActivo(formData) {
  const id = String(formData.get("id"));
  await query("UPDATE jugadores SET activo = NOT activo WHERE id = $1", [id]);
  revalidatePath("/jugadores");
}

// ---------- ASISTENCIA ----------
export async function crearSesionYRedirigir(formData) {
  const categoriaId = String(formData.get("categoriaId") || "");
  const fecha = String(formData.get("fecha") || "");
  if (!categoriaId || !fecha) return;

  const { rows } = await query(
    "INSERT INTO sesiones (categoria_id, fecha) VALUES ($1, $2) RETURNING id",
    [categoriaId, fecha]
  );

  redirect(`/asistencia/tomar/${rows[0].id}`);
}

export async function guardarAsistencia(formData) {
  const sesionId = String(formData.get("sesionId"));
  const jugadorIds = formData.getAll("jugadorId").map(String);

  for (const jugadorId of jugadorIds) {
    const presente = formData.get(`presente-${jugadorId}`) === "on";
    const justificado = formData.get(`justificado-${jugadorId}`) === "on";
    const observacion = String(formData.get(`obs-${jugadorId}`) || "").trim();

    await query(
      `INSERT INTO asistencias (sesion_id, jugador_id, presente, justificado, observacion)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (sesion_id, jugador_id)
       DO UPDATE SET presente = $3, justificado = $4, observacion = $5`,
      [sesionId, jugadorId, presente, justificado, observacion || null]
    );
  }

  revalidatePath("/asistencia");
  redirect("/asistencia");
}
