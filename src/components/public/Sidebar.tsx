"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface SidebarCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

interface SidebarSettings {
  site_name?: string;
  tagline?: string;
  [key: string]: string | undefined;
}

function SidebarContent({
  categories,
  settings,
}: {
  categories: SidebarCategory[];
  settings: SidebarSettings;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("cat");

  return (
    <aside className="fixed left-0 top-0 h-screen w-[var(--spacing-sidebar)] border-r border-[var(--color-border)] bg-[var(--color-background)] z-40 flex flex-col p-[var(--spacing-margin-mobile)] pt-[var(--spacing-margin-desktop)]">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="block">
          <h1 className="text-editorial text-xl tracking-[0.15em] font-bold leading-none">
            {settings.site_name || "SOFIA"}
          </h1>
        </Link>
        <p className="text-[10px] tracking-[0.15em] text-[var(--color-secondary)] mt-2 uppercase">
          {settings.tagline || "STYLING, DESIGN, ART DIRECTION"}
        </p>
      </div>

      {/* Main navigation */}
      <nav aria-label="Main navigation" className="flex-1">
        <ul className="space-y-0">
          {categories.map((cat) => {
            const href = `/portfolio?cat=${cat.slug}`;
            const isActive =
              (pathname === "/portfolio" && activeCat === cat.slug) ||
              (pathname === "/" && !activeCat && cat.slug === "fashion");
            return (
              <li key={cat.id}>
                <Link
                  href={href}
                  className={`block py-1 text-[14px] font-semibold tracking-[0.02em] leading-[2] transition-opacity hover:opacity-60 ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="w-4 h-px bg-[var(--color-primary)] my-4" />

        {/* Secondary navigation */}
        <ul className="space-y-0">
          <li>
            <Link
              href="/about"
              className={`block py-1 text-[14px] font-semibold tracking-[0.02em] leading-[2] transition-opacity hover:opacity-60 ${
                pathname === "/about" ? "font-bold" : ""
              }`}
            >
              Info
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={`block py-1 text-[14px] font-semibold tracking-[0.02em] leading-[2] transition-opacity hover:opacity-60 ${
                pathname === "/contact" ? "font-bold" : ""
              }`}
            >
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom */}
      <div className="text-[10px] tracking-[0.03em] text-[var(--color-secondary)] uppercase">
        &copy; {new Date().getFullYear()} {settings.site_name || "SOFIA"}
      </div>
    </aside>
  );
}

export default function Sidebar(props: {
  categories: SidebarCategory[];
  settings: SidebarSettings;
}) {
  return (
    <Suspense fallback={
      <aside className="fixed left-0 top-0 h-screen w-[var(--spacing-sidebar)] border-r border-[var(--color-border)] bg-[var(--color-background)] z-40 flex flex-col p-[var(--spacing-margin-mobile)] pt-[var(--spacing-margin-desktop)]">
        <div className="mb-8">
          <h1 className="text-editorial text-xl tracking-[0.15em] font-bold leading-none">
            {props.settings.site_name || "SOFIA"}
          </h1>
        </div>
      </aside>
    }>
      <SidebarContent {...props} />
    </Suspense>
  );
}
