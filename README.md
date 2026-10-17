# SOFI

Portfolio site for Sofia — styling, design, art direction. Next.js 15 + Drizzle + Cloudflare D1 (Workers via OpenNext).

## Local development

```bash
cp .env.example .env       # fill in AUTH_SECRET at minimum
npm install
npm run db:seed:local      # schema + seed data into the local D1 mirror
npm run dev
```

`next dev` talks to a local D1 mirror (`.wrangler/state`) via the
`initOpenNextCloudflareForDev()` shim in `next.config.ts` — the same binding the
production Worker uses.

Login at `/admin/login`: `admin@sofia.com` / `changeme123` (change it).

## Database (Cloudflare D1)

The database is D1 (`sofi-db`, binding `DB` in `wrangler.jsonc`). After editing
`src/lib/db/schema.ts`:

```bash
npm run db:generate                                        # emit SQL into ./drizzle
npx wrangler d1 execute sofi-db --remote --file=drizzle/<migration>.sql -y
npx wrangler d1 execute sofi-db --local  --file=drizzle/<migration>.sql -y
```

Re-seed with `npm run db:seed` (remote) / `npm run db:seed:local` (local) —
both are idempotent.

## Image uploads

Uploads go to Vercel Blob (`@vercel/blob`), which is HTTP-based and works on
Workers. It needs a read/write token from a Vercel Blob store:

- Local: `BLOB_READ_WRITE_TOKEN` in `.env` (and `.dev.vars` for preview). With
  the placeholder value, uploads return a fake `mock-blob.local` URL.
- Production: set it as a Worker secret. Without it the upload API returns 503.

## Deploying to Cloudflare

The app runs on Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare).

### Secrets

`.env` is **not** read in production — set secrets on the Worker:

```bash
npx wrangler secret put AUTH_SECRET             # openssl rand -base64 32
npx wrangler secret put AUTH_URL                # https://sofi.<subdomain>.workers.dev
npx wrangler secret put BLOB_READ_WRITE_TOKEN
```

`AUTH_URL` must point at the deployed URL (workers.dev or custom domain).

### Build & deploy

```bash
npm run deploy      # builds with OpenNext and deploys to Workers
npm run preview     # production build under local wrangler dev (uses .dev.vars)
```

For Cloudflare Workers Builds (git-connected), set the build command to
`npx opennextjs-cloudflare build`.
