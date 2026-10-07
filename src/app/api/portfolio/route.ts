import { db } from "@/lib/db";
import { contentItems, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cat = searchParams.get("cat");

  const query = cat
    ? db
        .select({
          id: contentItems.id,
          title: contentItems.title,
          slug: contentItems.slug,
          description: contentItems.description,
          thumbnailUrl: contentItems.thumbnailUrl,
          categoryId: contentItems.categoryId,
          sortOrder: contentItems.sortOrder,
          createdAt: contentItems.createdAt,
          categoryName: categories.name,
        })
        .from(contentItems)
        .innerJoin(categories, eq(contentItems.categoryId, categories.id))
        .where(
          and(
            eq(contentItems.status, "published"),
            eq(categories.slug, cat)
          )
        )
    : db
        .select({
          id: contentItems.id,
          title: contentItems.title,
          slug: contentItems.slug,
          description: contentItems.description,
          thumbnailUrl: contentItems.thumbnailUrl,
          categoryId: contentItems.categoryId,
          sortOrder: contentItems.sortOrder,
          createdAt: contentItems.createdAt,
          categoryName: categories.name,
        })
        .from(contentItems)
        .leftJoin(categories, eq(contentItems.categoryId, categories.id))
        .where(eq(contentItems.status, "published"));

  const items = await query;

  return Response.json(items, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}
