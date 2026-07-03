# 🏐 Mi Club de Vóleibol

Aplicación web para gestionar un club de vóleibol: categorías, jugadores, asistencia a entrenamientos y nóminas oficiales imprimibles.

**Stack:** Next.js 14 (App Router) + React + **JavaScript puro** + **pg (node-postgres, sin ORM)** + PostgreSQL + Tailwind CSS + NextAuth.

---

## 1. Requisitos

- Node.js 18 o superior
- Una cuenta en [Railway](https://railway.app)

---

## 2. Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
```

Edita `.env` y completa:
- `DATABASE_URL`: la connection string de tu Postgres (local o de Railway, ver paso 3)
- `PGSSL`: pon `"true"` si te conectas a un Postgres remoto (Railway externo), `"false"` si es local
- `NEXTAUTH_SECRET`: genera uno con `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` para desarrollo local

```bash
# 3. Crear las tablas en la base de datos (ejecuta db/schema.sql)
npm run db:migrate

# 4. Crear el primer usuario administrador + categorías de ejemplo
npm run db:seed

# 5. Levantar el proyecto
npm run dev
```

Abre `http://localhost:3000` — inicia sesión con el email/password que definiste en `.env` (por defecto `admin@miclub.cl` / `cambiar123`).

**⚠️ Cambia la contraseña del admin apenas puedas.**

---

## 3. Desplegar en Railway

### Paso 1: Crear el proyecto y la base de datos
1. Entra a [railway.app](https://railway.app) y crea un **New Project**.
2. Agrega el plugin **PostgreSQL** ("New" → "Database" → "Add PostgreSQL").
3. Railway generará automáticamente la variable `DATABASE_URL`.

### Paso 2: Subir tu código
```bash
git init
git add .
git commit -m "Primera versión app club de vóleibol"
git remote add origin TU_REPO_URL
git push -u origin main
```

### Paso 3: Crear el servicio web en Railway
1. **New → GitHub Repo** y selecciona tu repositorio.
2. Railway detecta que es un proyecto Next.js automáticamente.
3. En **Variables** del servicio, agrega:
   - `DATABASE_URL` → click en "Add Reference" y selecciona la del plugin Postgres
   - `PGSSL` → `"true"`
   - `NEXTAUTH_SECRET` → genera uno nuevo (distinto al de local)
   - `NEXTAUTH_URL` → la URL pública que te da Railway, ej: `https://tu-app.up.railway.app`
   - `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` → tus credenciales reales de admin

### Paso 4: Crear las tablas en producción
Con la [Railway CLI](https://docs.railway.app/guides/cli):

```bash
railway login
railway link      # selecciona tu proyecto
railway run npm run db:migrate
railway run npm run db:seed
```

Esto ejecuta `db/schema.sql` contra tu base de Railway y crea tu usuario administrador.

### Paso 5: ¡Listo!
Railway construye y despliega automáticamente en cada `git push`. Abre la URL que te entrega Railway.

---

## 4. Estructura del proyecto

```
db/schema.sql               → definición de tablas en SQL puro
db/migrate.js                → ejecuta schema.sql contra DATABASE_URL
db/seed.js                   → crea el primer admin y categorías de ejemplo
src/lib/db.js                → pool de conexión pg + helper query()
src/lib/auth.js               → configuración de login (NextAuth) usando pg
src/lib/actions.js            → todas las funciones para crear/editar/eliminar (SQL directo)
src/app/categorias/           → CRUD de categorías
src/app/jugadores/            → CRUD de jugadores
src/app/asistencia/           → tomar y revisar asistencia por sesión
src/app/nominas/              → nómina oficial imprimible por categoría
```

Todas las consultas usan **queries parametrizadas** (`$1, $2...`) para evitar inyección SQL — no hay ORM de por medio.

---

## 5. Si más adelante cambias el esquema

`db/schema.sql` usa `CREATE TABLE IF NOT EXISTS`, así que puedes agregar nuevas tablas ahí y volver a correr `npm run db:migrate` sin problema. Pero si necesitas **modificar una columna existente** (ej. agregar un campo a una tabla que ya existe), tendrás que escribir tú el `ALTER TABLE` correspondiente, ya que no hay una herramienta de migraciones automática — es SQL puro y manual, tal como pediste.

---

## 6. Funcionalidades incluidas (MVP)

- ✅ Login con roles (Administrador / Entrenador)
- ✅ Gestión de categorías
- ✅ Gestión de jugadores (RUT, edad, posición, número de camiseta, etc.)
- ✅ Registro de sesiones de entrenamiento y toma de asistencia (presente/justificado/observación)
- ✅ Historial de asistencia por sesión
- ✅ Nómina oficial por categoría, lista para imprimir o exportar a PDF (desde el navegador: "Imprimir → Guardar como PDF")
- ✅ Diseño responsive (funciona en celular, tablet y escritorio)

## 7. Ideas para siguientes iteraciones

- Reporte de % de asistencia por jugador/temporada
- Control de pagos/mensualidades por jugador
- Subida de foto de carnet/perfil de cada jugador
- Notificaciones (WhatsApp/email) de entrenamientos y partidos
- Calendario de partidos y resultados
- Gestión de usuarios entrenadores desde la misma app (hoy se crean vía SQL directo o un script)
