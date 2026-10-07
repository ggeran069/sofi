import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder));

  return Response.json(allCategories);
}
