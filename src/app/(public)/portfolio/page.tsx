import { db } from "@/lib/db";
import { contentItems } from "@/lib/db/schema";
import { categories } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";
import ContentCard from "@/components/public/ContentCard";

export const dynamic = "force-dynamic";

async function getPortfolioData(categorySlug?: string) {
  let query = db
    .select({
      id: contentItems.id,
      title: contentItems.title,
      slug: contentItems.slug,
      description: contentItems.description,
      thumbnailUrl: contentItems.thumbnailUrl,
      categoryId: contentItems.categoryId,
      sortOrder: contentItems.sortOrder,
    })
    .from(contentItems)
    .where(eq(contentItems.status, "published"))
    .orderBy(asc(contentItems.sortOrder));

  const items = await query;
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder));

  let filtered = items;
  if (categorySlug) {
    const cat = cats.find((c) => c.slug === categorySlug);
    if (cat) {
      filtered = items.filter((item) => item.categoryId === cat.id);
    }
  }

  return { items: filtered, categories: cats };
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const { items, categories: cats } = await getPortfolioData(cat);

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)]">
      {/* Category filter */}
      <div className="flex gap-6 mb-10 overflow-x-auto pb-2">
        <Link
          href="/portfolio"
          className={`text-[14px] tracking-[0.02em] font-semibold whitespace-nowrap transition-opacity hover:opacity-60 ${
            !cat ? "font-bold" : ""
          }`}
        >
          All
        </Link>
        {cats.map((c) => (
          <Link
            key={c.id}
            href={`/portfolio?cat=${c.slug}`}
            className={`text-[14px] tracking-[0.02em] font-semibold whitespace-nowrap transition-opacity hover:opacity-60 ${
              cat === c.slug ? "font-bold" : ""
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[var(--spacing-gutter)]">
          {items.map((item) => {
            const cat = cats.find((c) => c.id === item.categoryId);
            return (
              <ContentCard
                key={item.id}
                slug={item.slug}
                title={item.title}
                thumbnailUrl={item.thumbnailUrl}
                description={item.description}
                category={cat ? { name: cat.name, slug: cat.slug } : null}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 text-[var(--color-secondary)] text-editorial-sm">
          No projects yet
        </div>
      )}
    </div>
  );
}
