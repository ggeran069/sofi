# SOFIA

Portfolio site for Sofia — styling, design, art direction. Next.js 15 + Drizzle + Postgres (Neon).

## Local development

```bash
cp .env.example .env       # fill in values
npm install
npm run db:push            # create/sync schema (requires DATABASE_URL)
npm run db:setup           # seed admin user + default data
npm run dev
```

## Deploying to Cloudflare

The app runs on Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare).

### One-time setup

1. Create a Workers project (done via `wrangler.jsonc` in this repo).
2. Set production secrets — `.env` is **not** read in production:

   ```bash
   npx wrangler secret put DATABASE_URL      # your Neon connection string
   npx wrangler secret put AUTH_SECRET       # openssl rand -base64 32
   npx wrangler secret put AUTH_URL          # https://sofi.<subdomain>.workers.dev
   npx wrangler secret put BLOB_READ_WRITE_TOKEN
   ```

3. Point `AUTH_URL` at your workers.dev URL (or custom domain).

### Database

`DATABASE_URL` must be a Neon URL (`*.neon.tech`) in production — those use the
Neon HTTP driver, which is the only way to reach Postgres from Workers. Apply
schema changes from your machine, not from the Cloudflare build:

```bash
DATABASE_URL="<neon url>" npm run db:push
DATABASE_URL="<neon url>" npm run db:setup
```

### Build & deploy

```bash
npm run deploy      # builds with OpenNext and deploys to Workers
```

For Cloudflare Workers Builds (git-connected), set the build command to
`npx opennextjs-cloudflare build` — it does not need `DATABASE_URL`.
