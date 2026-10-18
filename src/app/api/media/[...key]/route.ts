import { getCloudflareContext } from "@opennextjs/cloudflare";

// Public read of uploaded media from Workers KV. URLs stored in the database
// are relative (/api/media/portfolio/...), so they resolve the same way in
// next dev, wrangler preview, and the deployed Worker.
//
// Responses are cached at the edge (Cache API), so repeat views of the same
// image don't consume KV read quota — keys are timestamp-prefixed and
// immutable, so a cached copy can never go stale.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const cacheKey = new Request(request.url);
  // `default` is Cloudflare's Cache API, only typed in workers-types
  const cache = (caches as any).default as Cache;

  const cached = await cache.match(cacheKey);
  if (cached) {
    return cached;
  }

  const { env } = getCloudflareContext() as any;
  const { value, metadata } = await env.MEDIA.getWithMetadata(key.join("/"));

  if (!value) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "content-type",
    (metadata as { contentType?: string } | null)?.contentType ??
      "application/octet-stream"
  );
  // Keys are unique per upload (timestamp-prefixed), so content is immutable
  headers.set("cache-control", "public, max-age=31536000, immutable");

  const response = new Response(value, { headers });
  await cache.put(cacheKey, response.clone());

  return response;
}
