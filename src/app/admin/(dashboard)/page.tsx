import { db } from "@/lib/db";
import { contentItems, categories } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contentItems);

  const [publishedResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contentItems)
    .where(eq(contentItems.status, "published"));

  const [draftResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contentItems)
    .where(eq(contentItems.status, "draft"));

  const [categoryResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(categories);

  return {
    total: totalResult.count,
    published: publishedResult.count,
    drafts: draftResult.count,
    categories: categoryResult.count,
  };
}

async function getRecentItems() {
  return db
    .select({
      id: contentItems.id,
      title: contentItems.title,
      status: contentItems.status,
      createdAt: contentItems.createdAt,
    })
    .from(contentItems)
    .orderBy(desc(contentItems.createdAt))
    .limit(5);
}

export default async function AdminDashboard() {
  const [stats, recentItems] = await Promise.all([getStats(), getRecentItems()]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-editorial text-lg tracking-[0.15em]">Dashboard</h1>
        <Link
          href="/admin/content/new"
          className="border border-[var(--color-border)] px-4 py-2 text-editorial-sm text-[11px] bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors"
        >
          New Content
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="border-0 bg-white p-6">
          <p className="text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)] mb-1">
            Total Content
          </p>
          <p className="text-3xl font-light tracking-[0.05em]">{stats.total}</p>
        </div>
        <div className="border-0 bg-white p-6">
          <p className="text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)] mb-1">
            Published
          </p>
          <p className="text-3xl font-light tracking-[0.05em]">{stats.published}</p>
        </div>
        <div className="border-0 bg-white p-6">
          <p className="text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)] mb-1">
            Drafts
          </p>
          <p className="text-3xl font-light tracking-[0.05em]">{stats.drafts}</p>
        </div>
        <div className="border-0 bg-white p-6">
          <p className="text-[11px] tracking-[0.1em] uppercase font-semibold text-[var(--color-secondary)] mb-1">
            Categories
          </p>
          <p className="text-3xl font-light tracking-[0.05em]">{stats.categories}</p>
        </div>
      </div>

      <div>
        <h2 className="text-editorial text-[13px] tracking-[0.15em] mb-4">
          Recent Content
        </h2>
        {recentItems.length === 0 ? (
          <p className="text-[13px] text-[var(--color-secondary)]">
            No content yet. Create your first piece.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-surface-dim)]">
            {recentItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-4">
                  <Link
                    href={`/admin/content/${item.id}/edit`}
                    className="text-[13px] hover:underline"
                  >
                    {item.title}
                  </Link>
                  <span
                    className={`text-[10px] tracking-[0.08em] uppercase font-semibold px-2 py-0.5 ${
                      item.status === "published"
                        ? "bg-[var(--color-primary)] text-[var(--color-background)]"
                        : "border border-[var(--color-border)]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <span className="text-[12px] text-[var(--color-secondary)]">
                  {formatDate(item.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
