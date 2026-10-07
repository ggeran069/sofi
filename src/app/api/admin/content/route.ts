import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, contentImages, categories } from "@/lib/db/schema";
import { contentCreateSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db
    .select({
      id: contentItems.id,
      title: contentItems.title,
      slug: contentItems.slug,
      description: contentItems.description,
      longDescription: contentItems.longDescription,
      categoryId: contentItems.categoryId,
      status: contentItems.status,
      featured: contentItems.featured,
      thumbnailUrl: contentItems.thumbnailUrl,
      sortOrder: contentItems.sortOrder,
      metadata: contentItems.metadata,
      createdAt: contentItems.createdAt,
      updatedAt: contentItems.updatedAt,
      categoryName: categories.name,
    })
    .from(contentItems)
    .leftJoin(categories, eq(contentItems.categoryId, categories.id))
    .orderBy(desc(contentItems.createdAt));

  return Response.json(items);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = contentCreateSchema.safeParse(body);

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

  const [created] = await db
    .insert(contentItems)
    .values(itemData)
    .returning();

  if (imageUrls && imageUrls.length > 0) {
    await db.insert(contentImages).values(
      imageUrls.map((img) => ({
        contentItemId: created.id,
        url: img.url,
        alt: img.alt,
        sortOrder: img.sortOrder,
      }))
    );
  }

  return Response.json(created, { status: 201 });
}
