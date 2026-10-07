import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, contentImages } from "@/lib/db/schema";
import { contentUpdateSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [item] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, id))
    .limit(1);

  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const images = await db
    .select()
    .from(contentImages)
    .where(eq(contentImages.contentItemId, item.id))
    .orderBy(contentImages.sortOrder);

  return Response.json({ item, images });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json();
  const result = contentUpdateSchema.safeParse(body);

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) {
        fieldErrors[key] = [];
      }
      fieldErrors[key].push(issue.message);
    }
    return Response.json({ errors: fieldErrors }, { status: 400 });
  }

  const { imageUrls, ...itemData } = result.data;

  const [updated] = await db
    .update(contentItems)
    .set(itemData)
    .where(eq(contentItems.id, id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Replace all images if imageUrls is provided
  if (imageUrls !== undefined) {
    await db.delete(contentImages).where(eq(contentImages.contentItemId, id));
    if (imageUrls.length > 0) {
      await db.insert(contentImages).values(
        imageUrls.map((img, i) => ({
          contentItemId: id,
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder ?? i,
        }))
      );
    }
  }

  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await db.delete(contentItems).where(eq(contentItems.id, id));

  return Response.json({ success: true });
}
