import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

export const db = new Proxy({} as DrizzleD1Database<typeof schema>, {
  get(_target, prop) {
    const { env } = getCloudflareContext() as any;
    const database = drizzle(env.DB, { schema });
    const value = (database as any)[prop];
    return typeof value === "function" ? value.bind(database) : value;
  },
});
