import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { settings } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import Sidebar from "@/components/public/Sidebar";
import MobileNav from "@/components/public/MobileNav";

export const dynamic = "force-dynamic";

async function getLayoutData() {
  try {
    const cats = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.sortOrder));
    const allSettings = await db.select().from(settings);
    const settingsMap = Object.fromEntries(
      allSettings.map((s) => [s.key, s.value])
    );
    return { categories: cats, settings: settingsMap };
  } catch {
    return {
      categories: [
        { id: "fallback-1", name: "Fashion", slug: "fashion", sortOrder: 0, description: null, createdAt: new Date() },
        { id: "fallback-2", name: "Video", slug: "video", sortOrder: 1, description: null, createdAt: new Date() },
        { id: "fallback-3", name: "Design", slug: "design", sortOrder: 2, description: null, createdAt: new Date() },
      ],
      settings: { site_name: "SOFIA", tagline: "STYLING, DESIGN, ART DIRECTION" },
    };
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getLayoutData();

  return (
    <>
      <div className="hidden md:block">
        <Sidebar categories={data.categories} settings={data.settings} />
      </div>
      <main className="md:ml-[var(--spacing-sidebar)] min-h-screen">
        {children}
      </main>
      <MobileNav categories={data.categories} settings={data.settings} />
    </>
  );
}
