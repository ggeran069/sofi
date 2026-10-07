import { db } from "@/lib/db";
import { contentItems } from "@/lib/db/schema";
import { contentImages } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GallerySlideshow from "@/components/public/GallerySlideshow";

export const dynamic = "force-dynamic";

async function getContent(slug: string) {
  const items = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.slug, slug))
    .limit(1);

  if (items.length === 0) return null;

  const item = items[0];
  const images = await db
    .select()
    .from(contentImages)
    .where(eq(contentImages.contentItemId, item.id))
    .orderBy(asc(contentImages.sortOrder));

  return { ...item, images };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getContent(slug);
  if (!item) return { title: "Not Found" };
  return {
    title: item.title,
    description: item.description || undefined,
    openGraph: item.thumbnailUrl ? { images: [item.thumbnailUrl] } : undefined,
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getContent(slug);
  if (!item) notFound();

  const slides =
    item.images.length > 0
      ? item.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }))
      : item.thumbnailUrl
        ? [{ id: item.id, url: item.thumbnailUrl, alt: item.title }]
        : [];

  return (
    <div>
      {/* Gallery */}
      {slides.length > 0 && <GallerySlideshow images={slides} />}

      {/* Content */}
      <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)] max-w-[800px]">
        <Link
          href="/portfolio"
          className="text-[12px] tracking-[0.1em] uppercase text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          &larr; Back to Portfolio
        </Link>

        <h1 className="text-editorial text-xl tracking-[0.15em] font-bold mt-6 mb-4">
          {item.title}
        </h1>

        {item.description && (
          <p className="text-[var(--color-secondary)] text-[14px] mb-6">
            {item.description}
          </p>
        )}

        {item.longDescription && (
          <div className="prose prose-sm max-w-none text-[14px] leading-relaxed">
            {item.longDescription}
          </div>
        )}
      </div>
    </div>
  );
}
