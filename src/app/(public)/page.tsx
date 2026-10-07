import { db } from "@/lib/db";
import { contentItems } from "@/lib/db/schema";
import { contentImages } from "@/lib/db/schema";
import { categories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import GallerySlideshow from "@/components/public/GallerySlideshow";

export const dynamic = "force-dynamic";

async function getHomeImages() {
  const items = await db
    .select({
      id: contentItems.id,
      title: contentItems.title,
      thumbnailUrl: contentItems.thumbnailUrl,
    })
    .from(contentItems)
    .where(eq(contentItems.status, "published"))
    .orderBy(asc(contentItems.sortOrder));

  const images: { id: string; url: string; alt: string }[] = [];

  for (const item of items) {
    const imgs = await db
      .select()
      .from(contentImages)
      .where(eq(contentImages.contentItemId, item.id))
      .orderBy(asc(contentImages.sortOrder));

    for (const img of imgs) {
      images.push({ id: img.id, url: img.url, alt: img.alt });
    }

    if (imgs.length === 0 && item.thumbnailUrl) {
      images.push({
        id: item.id,
        url: item.thumbnailUrl,
        alt: item.title,
      });
    }
  }

  return images;
}

export default async function HomePage() {
  const images = await getHomeImages();

  return <GallerySlideshow images={images} />;
}
