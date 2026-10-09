import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";

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

  // Check if BLOB_READ_WRITE_TOKEN is a placeholder (local dev)
  if (
    !process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.BLOB_READ_WRITE_TOKEN.includes("placeholder")
  ) {
    // Local development only — never silently store fake URLs in production
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "File storage is not configured (missing BLOB_READ_WRITE_TOKEN)" },
        { status: 503 }
      );
    }
    const mockUrl = `https://mock-blob.local/portfolio/${Date.now()}-${file.name}`;
    return Response.json({ url: mockUrl });
  }

  const blob = await put(`portfolio/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return Response.json({ url: blob.url });
}
