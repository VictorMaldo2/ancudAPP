-- Esquema de base de datos para el club de vóleibol
-- gen_random_uuid() viene incluido en PostgreSQL 13+ (Railway usa una versión reciente), no requiere extensión.

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'ENTRENADOR' CHECK (role IN ('ADMIN', 'ENTRENADOR')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text UNIQUE NOT NULL,
  descripcion text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jugadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellido text NOT NULL,
  rut text UNIQUE,
  fecha_nacimiento date,
  telefono text,
  email text,
  posicion text,
  numero_camiseta integer,
  activo boolean NOT NULL DEFAULT true,
  categoria_id uuid NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sesiones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL,
  notas text,
  categoria_id uuid NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asistencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  presente boolean NOT NULL DEFAULT false,
  justificado boolean NOT NULL DEFAULT false,
  observacion text,
  sesion_id uuid NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
  jugador_id uuid NOT NULL REFERENCES jugadores(id) ON DELETE CASCADE,
  UNIQUE (sesion_id, jugador_id)
);

CREATE INDEX IF NOT EXISTS idx_jugadores_categoria ON jugadores(categoria_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_categoria ON sesiones(categoria_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_sesion ON asistencias(sesion_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_jugador ON asistencias(jugador_id);
