import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import postgres from "postgres";
import { neon } from "@neondatabase/serverless";
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
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  // Cloudflare Workers cannot open raw TCP connections, so Neon databases
  // use the HTTP driver. Local/other Postgres databases keep postgres.js.
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

let instance: Db | null = null;

function getDb(): Db {
  if (!instance) instance = createDb();
  return instance;
}

// Lazy proxy so that importing this module never connects (or throws) at
// build time, when DATABASE_URL is not available.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    const value = Reflect.get(getDb() as object, prop);
    return typeof value === "function" ? value.bind(getDb()) : value;
  },
});
