import { db } from "@/lib/db";
import { contentItems, categories } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getContentWithCategories() {
  return db
    .select({
      id: contentItems.id,
      title: contentItems.title,
      slug: contentItems.slug,
      status: contentItems.status,
      featured: contentItems.featured,
      createdAt: contentItems.createdAt,
      categoryName: categories.name,
    })
    .from(contentItems)
    .leftJoin(categories, eq(contentItems.categoryId, categories.id))
    .orderBy(desc(contentItems.createdAt));
}

export default async function ContentListPage() {
  const items = await getContentWithCategories();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-editorial text-lg tracking-[0.15em]">Content</h1>
        <Link
          href="/admin/content/new"
          className="border border-[var(--color-border)] px-4 py-2 text-editorial-sm text-[11px] bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors"
        >
          New Content
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] text-[var(--color-secondary)]">
          No content yet.{" "}
          <Link href="/admin/content/new" className="underline">
            Create your first piece.
          </Link>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 pr-4 text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)]">
                  Title
                </th>
                <th className="text-left py-3 pr-4 text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)]">
                  Category
                </th>
                <th className="text-left py-3 pr-4 text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)]">
                  Status
                </th>
                <th className="text-left py-3 pr-4 text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)]">
                  Featured
                </th>
                <th className="text-left py-3 pr-4 text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)]">
                  Date
                </th>
                <th className="text-left py-3 text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--color-surface-dim)] hover:bg-[var(--color-surface)]"
                >
                  <td className="py-3 pr-4">
                    <Link
                      href={`/admin/content/${item.id}/edit`}
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-secondary)]">
                    {item.categoryName ?? "-"}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`inline-block text-[10px] tracking-[0.08em] uppercase font-semibold px-2 py-0.5 ${
                        item.status === "published"
                          ? "bg-[var(--color-primary)] text-[var(--color-background)]"
                          : "border border-[var(--color-border)]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-secondary)]">
                    {item.featured ? "Yes" : "-"}
                  </td>
                  <td className="py-3 pr-4 text-[var(--color-secondary)]">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/admin/content/${item.id}/edit`}
                      className="text-[11px] tracking-[0.05em] uppercase font-semibold hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
