import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

// Proxy that dynamically resolves the Cloudflare D1 binding on every request
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const { env } = getCloudflareContext();
    const database = drizzle(env.DB, { schema });
    const value = (database as any)[prop];
    return typeof value === "function" ? value.bind(database) : value;
  },
});
