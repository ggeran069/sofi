import { getCloudflareContext } from "@opennextjs/cloudflare";

// Public read of uploaded media from the R2 bucket. URLs stored in the
// database are relative (/api/media/portfolio/...), so they resolve the same
// way in next dev, wrangler preview, and the deployed Worker.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;

  const { env } = getCloudflareContext() as any;
  const object = await env.BUCKET.get(key.join("/"));

  if (!object) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  // Keys are unique per upload (timestamp-prefixed), so content is immutable
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
