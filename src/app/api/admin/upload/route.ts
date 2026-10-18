import { auth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Images live in Workers KV (free tier, 25MB per value) instead of R2.
// The client resizes to ≤2048px WebP before uploading, so values are
// typically a few hundred KB — well inside KV free limits (1GB storage,
// 1000 writes/day, 100k reads/day).
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return Response.json(
      { error: "File too large. Maximum size is 10MB" },
      { status: 400 }
    );
  }

  const { env } = getCloudflareContext() as any;
  if (!env.MEDIA) {
    return Response.json(
      { error: "Object storage is not configured (missing KV binding)" },
      { status: 503 }
    );
  }

  // Keep object keys filesystem-safe and URL-friendly
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `portfolio/${Date.now()}-${safeName}`;

  await env.MEDIA.put(key, await file.arrayBuffer(), {
    metadata: { contentType: file.type },
  });

  // Relative URL served by /api/media — identical across dev, preview, production
  return Response.json({ url: `/api/media/${key}` });
}
