import { defineConfig } from "drizzle-kit";

// The schema targets Cloudflare D1 (SQLite), not Postgres. `db:generate` emits
// SQL into ./drizzle; apply it to the database with wrangler:
//   npx wrangler d1 execute sofi-db --remote --file=drizzle/<migration>.sql
//   npx wrangler d1 execute sofi-db --local  --file=drizzle/<migration>.sql
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
});
