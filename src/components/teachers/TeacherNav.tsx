"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { teacherNavigationCopy as c } from "@/lib/teacherNavigationCopy";
import s from "./teacher.module.css";

export function TeacherNav() {
  const pathname = usePathname();
  const { role } = useAuth();
  if (pathname === "/manage") return null;
  const links: { href: string; label: string }[] = [
    { href: "/manage", label: c.workspace },
    { href: "/challenges", label: c.rooms },
    { href: "/manage/upload", label: c.upload },
    { href: "/manage/books", label: c.books },
    { href: "/manage/topics", label: c.topics },
  ];
  if (role === "admin")
    links.push({ href: "/admin/teachers", label: c.access });
  return (
    <nav aria-label={c.navigation} className={s.navigation}>
      {links.map(({ href, label }) => {
        const active =
          pathname === href ||
          (href === "/challenges" && pathname.startsWith("/challenges/"));
        return (
          <Link
            key={href}
            href={href}
            prefetch={false}
            aria-current={
              active ? (pathname === href ? "page" : "location") : undefined
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
