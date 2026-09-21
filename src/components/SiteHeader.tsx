"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { copy } from "@/lib/copy";

const NAV = [
  { href: "/", label: copy.nav.home },
  { href: "/apps", label: copy.nav.apps },
  { href: "/mistakes-book", label: copy.nav.mistakesBook },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/school-logo-512.png"
            alt={copy.school.crestAlt}
            width={36}
            height={35}
            priority
            className="h-9 w-auto"
          />
          <span className="leading-tight">
            <span className="font-display block text-base font-semibold sm:text-lg">
              {copy.school.short}
            </span>
            <span className="text-navy-soft block text-[11px] sm:text-xs">
              {copy.school.name}
            </span>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="ml-auto hidden items-center gap-6 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={
                isActive(pathname, item.href)
                  ? "border-highlight border-b-2 pb-0.5 text-sm text-white"
                  : "text-navy-soft border-b-2 border-transparent pb-0.5 text-sm hover:text-white"
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded border border-white/35 px-3 py-1.5 text-sm hover:border-white/70"
          >
            {copy.nav.signIn}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto rounded border border-white/35 px-3 py-1.5 text-sm md:hidden"
        >
          {open ? copy.nav.closeMenu : copy.nav.menu}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-white/15 px-4 pb-3 md:hidden"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={
                isActive(pathname, item.href)
                  ? "border-highlight block border-l-4 py-2.5 pl-3 text-white"
                  : "text-navy-soft block border-l-4 border-transparent py-2.5 pl-3"
              }
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-navy-soft block border-l-4 border-transparent py-2.5 pl-3"
          >
            {copy.nav.signIn}
          </Link>
        </nav>
      )}
    </header>
  );
}
