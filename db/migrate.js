require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Falta la variable DATABASE_URL (revisa tu archivo .env)");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  });

  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

  console.log("Creando/actualizando tablas...");
  await pool.query(sql);
  console.log("✅ Listo. Tablas creadas o ya existentes.");

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error al migrar:", err.message);
  process.exit(1);
});
