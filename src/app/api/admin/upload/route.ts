import { auth } from "@/lib/auth";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

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
  if (!env.BUCKET) {
    return Response.json(
      { error: "Object storage is not configured (missing R2 binding)" },
      { status: 503 }
    );
  }

  // Keep object keys filesystem-safe and URL-friendly
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `portfolio/${Date.now()}-${safeName}`;

  await env.BUCKET.put(key, file, {
    httpMetadata: { contentType: file.type },
  });

  // Relative URL served by /api/media — identical across dev, preview, production
  return Response.json({ url: `/api/media/${key}` });
}
