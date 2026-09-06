import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as schema from "./schema.js";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. See .env.example.");
}

// Render's external Postgres URLs require SSL; internal URLs and local dev do not.
const useSsl = /render\.com|sslmode=require/.test(connectionString) || process.env.PGSSL === "true";

export const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
});

export const db = drizzle(pool, { schema });

export async function runMigrations() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // Works from both src/ (tsx) and dist/ (compiled) since drizzle/ sits at the server root.
  const migrationsFolder = path.resolve(here, "../../drizzle");
  await migrate(db, { migrationsFolder });
}
