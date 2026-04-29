const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const { Pool } = require("pg");

function getConfigValue(...keys) {
  for (const key of keys) {
    if (process.env[key]) {
      return process.env[key];
    }
  }
  return undefined;
}

async function main() {
  const relativeMigrationPath = process.argv[2];
  if (!relativeMigrationPath) {
    throw new Error("Usage: node scripts/runSqlMigration.js <migration-path>");
  }

  const migrationPath = path.resolve(__dirname, "..", relativeMigrationPath);
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  const sql = fs.readFileSync(migrationPath, "utf8");
  const pool = new Pool({
    host: getConfigValue("DB_HOST", "POSTGRES_HOST") || "localhost",
    port: Number(getConfigValue("DB_PORT", "POSTGRES_PORT") || 5432),
    user: getConfigValue("DB_USER", "POSTGRES_USER"),
    password: getConfigValue("DB_PASSWORD", "POSTGRES_PASSWORD"),
    database: getConfigValue("DB_NAME", "POSTGRES_DB"),
    ssl:
      getConfigValue("DB_SSL") === "true"
        ? { rejectUnauthorized: false }
        : false,
  });

  try {
    await pool.query(sql);
    process.stdout.write(`Applied migration: ${migrationPath}\n`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
