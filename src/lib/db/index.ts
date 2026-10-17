import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL ?? "";

function isNeonDatabase(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

function createDb() {
  // 1. If running inside Cloudflare Workers / OpenNext with a D1 binding named 'DB'
  try {
    const context = getCloudflareContext();
    if (context?.env?.DB) {
      return drizzleD1(context.env.DB, { schema });
    }
  } catch {
    // Not in Cloudflare runtime (e.g. build time or local node process)
  }

  // 2. Fallback to PostgreSQL / Neon for local dev if DATABASE_URL is provided
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set and Cloudflare D1 binding is not available.");
  }

  if (isNeonDatabase(connectionString)) {
    return drizzleNeonHttp(neon(connectionString), { schema });
  }

  const client = postgres(connectionString, {
    ssl: process.env.NODE_ENV === "production" ? "require" : false,
    max: 10,
  });
  return drizzlePostgresJs(client, { schema });
}

type Db = ReturnType<typeof createDb>;

let pgInstance: Db | null = null;

function getDb(): Db {
  // Always try to get the fresh Cloudflare D1 context if available (request-scoped)
  try {
    const context = getCloudflareContext();
    if (context?.env?.DB) {
      return drizzleD1(context.env.DB, { schema }) as unknown as Db;
    }
  } catch {
    // Fallback to cached Postgres instance for local node environment
  }

  if (!pgInstance) pgInstance = createDb();
  return pgInstance;
}

// Lazy proxy ensures that importing this module never executes or connects at build time
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const currentDb = getDb();
    const value = Reflect.get(currentDb as object, prop);
    return typeof value === "function" ? value.bind(currentDb) : value;
  },
});
