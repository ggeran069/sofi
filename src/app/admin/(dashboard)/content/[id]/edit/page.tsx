import { db } from "@/lib/db";
import { contentItems, contentImages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import ContentForm from "@/components/admin/ContentForm";

export const dynamic = "force-dynamic";

async function getContentWithImages(id: string) {
  const [item] = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.id, id));

  if (!item) return null;

  const images = await db
    .select()
    .from(contentImages)
    .where(eq(contentImages.contentItemId, id))
    .orderBy(asc(contentImages.sortOrder));

  return {
    item: {
      ...item,
      status: item.status as "draft" | "published",
      metadata: (item.metadata as Record<string, unknown>) ?? null,
    },
    images,
  };
}

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getContentWithImages(id);

  if (!data) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-editorial text-lg tracking-[0.15em] mb-8">
        Edit Content
      </h1>
      <ContentForm initialData={data} />
    </div>
  );
}
