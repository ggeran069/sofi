import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, contentItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { categoryUpdateSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const result = categoryUpdateSchema.safeParse(body);

  if (!result.success) {
    return Response.json(
      { errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updates = result.data;
  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(categories)
    .set(updates)
    .where(eq(categories.id, id))
    .returning();

  if (!updated) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  return Response.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const referencingItems = await db
    .select({ count: sql<number>`count(*)` })
    .from(contentItems)
    .where(eq(contentItems.categoryId, id));

  if (Number(referencingItems[0].count) > 0) {
    return Response.json(
      { error: "Cannot delete category with existing content items" },
      { status: 409 }
    );
  }

  await db.delete(categories).where(eq(categories.id, id));

  return Response.json({ success: true });
}
