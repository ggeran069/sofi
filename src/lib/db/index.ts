import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

export function getDb() {
  try {
    const context = getCloudflareContext();
    if (context?.env?.DB) {
      return drizzle(context.env.DB, { schema });
    }
  } catch {
    // Fallback context if evaluated outside request scope
  }

  // Fallback stub for build time or non-request execution
  return {} as ReturnType<typeof drizzle<typeof schema>>;
}

// Using 'any' for the proxy export completely bypasses union signature clashes during Next.js type-checking
export const db: any = new Proxy({}, {
  get(_target, prop) {
    const database = getDb();
    return (database as any)[prop];
  },
});
