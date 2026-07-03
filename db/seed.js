require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Falta la variable DATABASE_URL (revisa tu archivo .env)");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
  });

  const email = process.env.SEED_ADMIN_EMAIL || "admin@miclub.cl";
  const password = process.env.SEED_ADMIN_PASSWORD || "cambiar123";
  const hashed = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, 'ADMIN')
     ON CONFLICT (email) DO NOTHING`,
    ["Administrador", email, hashed]
  );

  const categorias = ["Sub14", "Sub16", "Sub18", "Adulto"];
  for (const nombre of categorias) {
    await pool.query(
      `INSERT INTO categorias (nombre) VALUES ($1) ON CONFLICT (nombre) DO NOTHING`,
      [nombre]
    );
  }

  console.log("✅ Usuario admin:");
  console.log("   Email:", email);
  console.log("   Password:", password);
  console.log("✅ Categorías de ejemplo creadas:", categorias.join(", "));

  await pool.end();
}

main().catch((err) => {
  console.error("❌ Error al hacer seed:", err.message);
  process.exit(1);
});
