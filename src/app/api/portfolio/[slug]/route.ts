import { db } from "@/lib/db";
import { contentItems, contentImages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [item] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.slug, slug))
    .limit(1);

  if (!item || item.status !== "published") {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const images = await db
    .select()
    .from(contentImages)
    .where(eq(contentImages.contentItemId, item.id))
    .orderBy(contentImages.sortOrder);

  return Response.json({ item, images });
}
