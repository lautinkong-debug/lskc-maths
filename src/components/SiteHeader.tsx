"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { portalCopy as c } from "@/lib/portalCopy";
import { useAuth } from "@/lib/auth";
import { useEditMode } from "@/lib/editMode";

const destinations = [
  { href: "/", label: c.forms },
  { href: "/apps", label: c.apps },
  { href: "/mistakes-book", label: c.books },
  { href: "/manage", label: c.teacher },
];
function active(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/forms/");
  if (
    href === "/manage" &&
    (pathname.startsWith("/challenges") || pathname.startsWith("/admin"))
  )
    return true;
  return pathname === href || pathname.startsWith(href + "/");
}
export function SiteHeader() {
  const pathname = usePathname();
  const { user, role, loading, signOutUser } = useAuth();
  const { editing, toggle } = useEditMode();
  const [menu, setMenu] = useState<string | null>(null);
  const open = menu === pathname;
  const header = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = () => setMenu(null);
  const teacher = role === "teacher" || role === "admin";
  const editable =
    teacher && ["/", "/apps", "/mistakes-book"].includes(pathname);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenu(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(null);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  const links = destinations.map((item) => (
    <Link
      key={item.href}
      prefetch={false}
      href={item.href}
      onClick={close}
      aria-current={active(pathname, item.href) ? "page" : undefined}
    >
      {item.label}
    </Link>
  ));
  const tools = (
    <>
      {editable && (
        <button
          type="button"
          aria-pressed={editing}
          onClick={() => {
            toggle();
            close();
          }}
        >
          {copy.nav.editPage}
        </button>
      )}
      {!loading &&
        (user ? (
          <>
            <Link href="/login" prefetch={false} onClick={close}>
              {user.email ?? c.account}
            </Link>
            <button
              type="button"
              onClick={() => {
                close();
                void signOutUser();
              }}
            >
              {copy.nav.signOut}
            </button>
          </>
        ) : (
          <Link href="/login" prefetch={false} onClick={close}>
            {copy.nav.signIn}
          </Link>
        ))}
    </>
  );
  return (
    <header ref={header} className="portal-masthead">
      <a
        href="#site-content"
        className="studio-skip"
        onClick={(event) => {
          const target = document.getElementById("site-content");
          if (target) {
            event.preventDefault();
            close();
            target.focus({ preventScroll: true });
            target.scrollIntoView({ block: "start" });
          }
        }}
      >
        {copy.studio.skip}
      </a>
      <div className="portal-mast-inner">
        <Link
          href="/"
          prefetch={false}
          onClick={close}
          className="portal-wordmark"
          aria-label={c.rootHome}
        >
          <Image
            src="/school-logo-512.png"
            alt=""
            width={42}
            height={41}
            priority
          />
          <span>
            <strong>{copy.school.short}</strong>
            <small>{copy.school.name}</small>
          </span>
        </Link>
        <nav aria-label={c.navigation} className="portal-nav">
          {links}
        </nav>
        <div className="portal-head-actions">
          <Link
            href="/join"
            prefetch={false}
            className="portal-join"
            aria-current={active(pathname, "/join") ? "page" : undefined}
            onClick={close}
          >
            {c.join}
          </Link>
          <button
            ref={trigger}
            type="button"
            className="portal-menu-button"
            aria-expanded={open}
            aria-controls="portal-menu"
            onClick={() => setMenu(open ? null : pathname)}
          >
            <span aria-hidden="true" className="portal-menu-icon">
              <i />
              <i />
            </span>
            <span className="portal-mobile-menu-label">{c.menu}</span>
            <span className="portal-account-label">{c.account}</span>
          </button>
        </div>
        {open && (
          <div className="portal-menu-panel" id="portal-menu">
            <nav aria-label={c.navigation} className="portal-mobile-links">
              {links}
            </nav>
            <div className="portal-account">{tools}</div>
          </div>
        )}
      </div>
    </header>
  );
}
