import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

export const db: any = new Proxy({}, {
  get(_target, prop) {
    const { env } = getCloudflareContext();
    const database = drizzle((env as any).DB, { schema });
    const value = (database as any)[prop];
    return typeof value === "function" ? value.bind(database) : value;
  },
});
