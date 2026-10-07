"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] bg-[var(--color-background)] border-r border-[var(--color-border)] p-6 flex flex-col shrink-0">
      <Link
        href="/admin"
        className="text-editorial text-sm tracking-[0.15em] font-bold mb-8"
      >
        SOFIA CMS
      </Link>

      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block py-2 text-[13px] tracking-[0.02em] transition-opacity hover:opacity-60 ${
                  pathname === item.href
                    ? "font-bold border-l-2 border-[var(--color-primary)] pl-2"
                    : "pl-4"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-3 pt-6 border-t border-[var(--color-border)]">
        <Link
          href="/"
          className="block text-[12px] text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
        >
          View Site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-[12px] text-[var(--color-secondary)] hover:text-[var(--color-primary)]"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
