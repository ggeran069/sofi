"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

interface MobileSettings {
  site_name?: string;
  tagline?: string;
  [key: string]: string | undefined;
}

export default function MobileNav({
  categories,
  settings,
}: {
  categories: MobileCategory[];
  settings: MobileSettings;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile header bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[var(--color-background)] border-b border-[var(--color-border)] z-50 flex items-center justify-between px-[var(--spacing-margin-mobile)]">
        <Link href="/" className="text-editorial text-sm font-bold tracking-[0.15em]">
          {settings.site_name || "SOFIA"}
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-editorial-sm text-[12px]"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* Full-screen overlay */}
      {isOpen && (
        <div
          ref={navRef}
          className="md:hidden fixed inset-0 bg-[var(--color-background)] z-40 flex flex-col items-start justify-center px-[var(--spacing-margin-mobile)]"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <nav>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/portfolio?cat=${cat.slug}`}
                    className="block text-editorial text-3xl tracking-[0.15em] font-bold leading-tight py-2 transition-opacity hover:opacity-60"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li className="pt-4">
                <Link
                  href="/about"
                  className="block text-editorial text-3xl tracking-[0.15em] font-bold leading-tight py-2 transition-opacity hover:opacity-60"
                >
                  Info
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block text-editorial text-3xl tracking-[0.15em] font-bold leading-tight py-2 transition-opacity hover:opacity-60"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Spacer for mobile header */}
      <div className="md:hidden h-14" />
    </>
  );
}
