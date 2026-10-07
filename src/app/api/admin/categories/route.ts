import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, contentItems } from "@/lib/db/schema";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validations";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  return Response.json(allCategories);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = categoryCreateSchema.safeParse(body);

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

  const [created] = await db
    .insert(categories)
    .values(result.data)
    .returning();

  return Response.json(created, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!Array.isArray(body)) {
    return Response.json(
      { error: "Expected an array of { id, ...updates }" },
      { status: 400 }
    );
  }

  for (const item of body) {
    if (!item.id) {
      return Response.json(
        { error: "Each item must have an id" },
        { status: 400 }
      );
    }

    const { id, ...updates } = item;
    const result = categoryUpdateSchema.safeParse(updates);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) {
          fieldErrors[key] = [];
        }
        fieldErrors[key].push(issue.message);
      }
      return Response.json({ errors: { id, ...fieldErrors } }, { status: 400 });
    }

    await db
      .update(categories)
      .set(result.data)
      .where(eq(categories.id, id));
  }

  return Response.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return Response.json({ error: "Category id is required" }, { status: 400 });
  }

  // Check if any content items reference this category
  const referencingItems = await db
    .select({ id: contentItems.id })
    .from(contentItems)
    .where(eq(contentItems.categoryId, id))
    .limit(1);

  if (referencingItems.length > 0) {
    return Response.json(
      { error: "Cannot delete category: it has associated content items" },
      { status: 409 }
    );
  }

  await db.delete(categories).where(eq(categories.id, id));

  return Response.json({ success: true });
}
