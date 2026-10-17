import { drizzle as drizzleD1, DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzlePostgresJs, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeonHttp, NeonHttpDatabase } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

type AppDatabase = DrizzleD1Database<typeof schema> & PostgresJsDatabase<typeof schema> & NeonHttpDatabase<typeof schema>;

const connectionString = process.env.DATABASE_URL ?? "";

function isNeonDatabase(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

function createDb() {
  try {
    const context = getCloudflareContext();
    if (context?.env?.DB) {
      return drizzleD1(context.env.DB, { schema });
    }
  } catch {
    // Fallback if not in Cloudflare runtime
  }

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

let cachedDb: any = null;

function getDb() {
  try {
    const context = getCloudflareContext();
    if (context?.env?.DB) {
      return drizzleD1(context.env.DB, { schema });
    }
  } catch {
    // Use cached fallback for local node environment
  }

  if (!cachedDb) {
    cachedDb = createDb();
  }
  return cachedDb;
}

// Lazy proxy that delegates to the active runtime driver without union type clashes
export const db = new Proxy({} as AppDatabase, {
  get(_target, prop) {
    const currentDb = getDb();
    const value = Reflect.get(currentDb as object, prop);
    return typeof value === "function" ? value.bind(currentDb) : value;
  },
});
