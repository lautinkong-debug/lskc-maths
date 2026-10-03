"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { copy } from "@/lib/copy";
import { useAuth } from "@/lib/auth";
import { useEditMode } from "@/lib/editMode";

const NAV = [
  { href: "/", label: copy.nav.home },
  { href: "/apps", label: copy.nav.apps },
  { href: "/join", label: copy.nav.joinChallenge },
  { href: "/mistakes-book", label: copy.nav.mistakesBook },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, role, loading, signOutUser } = useAuth();
  const { editing, toggle } = useEditMode();
  const isTeacher = role === "teacher" || role === "admin";
  const canEditPage =
    pathname === "/" || pathname === "/apps" || pathname === "/mistakes-book";
  const accountLinks = (
    <>
      {isTeacher && canEditPage && (
        <button
          type="button"
          aria-pressed={editing}
          onClick={() => {
            toggle();
            setOpen(false);
          }}
          className={`rounded border px-3 py-1.5 text-sm ${editing ? "border-highlight text-highlight" : "border-white/35 text-white hover:border-white/70"}`}
        >
          {copy.nav.editPage}
        </button>
      )}
      {isTeacher && (
        <Link
          href="/challenges"
          onClick={() => setOpen(false)}
          className="text-navy-soft text-sm hover:text-white"
        >
          {copy.challenges.myTitle}
        </Link>
      )}
      {isTeacher && (
        <Link
          href="/manage/topics"
          onClick={() => setOpen(false)}
          className="text-navy-soft text-sm hover:text-white"
        >
          {copy.nav.manage}
        </Link>
      )}
      {role === "admin" && (
        <Link
          href="/admin/teachers"
          onClick={() => setOpen(false)}
          className="text-navy-soft text-sm hover:text-white"
        >
          {copy.nav.teachers}
        </Link>
      )}
      {user ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="text-navy-soft break-all hover:text-white"
          >
            {user.email ?? copy.auth.account}
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOutUser();
            }}
            className="rounded border border-white/35 px-3 py-1.5 hover:border-white/70"
          >
            {copy.nav.signOut}
          </button>
        </div>
      ) : !loading ? (
        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="rounded border border-white/35 px-3 py-1.5 text-sm hover:border-white/70"
        >
          {copy.nav.signIn}
        </Link>
      ) : null}
    </>
  );

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
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
          className="ml-auto hidden items-center gap-4 whitespace-nowrap xl:flex"
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
          {accountLinks}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="ml-auto min-h-11 rounded border border-white/35 px-3 py-1.5 text-sm xl:hidden"
        >
          {open ? copy.nav.closeMenu : copy.nav.menu}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-white/15 px-4 pb-3 xl:hidden"
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
          <div className="flex flex-col gap-3 border-t border-white/15 py-3">
            {accountLinks}
          </div>
        </nav>
      )}
    </header>
  );
}
