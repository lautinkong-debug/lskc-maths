"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { teacherNavigationCopy as c } from "@/lib/teacherNavigationCopy";
import s from "./teacher.module.css";

type Action = { title: string; href: string; detail: string };
const sections: { title: string; actions: Action[] }[] = [
  {
    title: c.lesson,
    actions: [
      { title: c.browse, href: "/", detail: c.browseHelp },
      { title: c.apps, href: "/apps", detail: c.appsHelp },
      { title: c.games, href: "/apps/classroom-games", detail: c.gamesHelp },
    ],
  },
  {
    title: c.classroom,
    actions: [
      { title: c.rooms, href: "/challenges", detail: c.roomsHelp },
      { title: c.tug, href: "/polynomial-tug", detail: c.tugHelp },
    ],
  },
  {
    title: c.resources,
    actions: [
      { title: c.upload, href: "/manage/upload", detail: c.uploadHelp },
      { title: c.books, href: "/manage/books", detail: c.booksHelp },
      { title: c.topics, href: "/manage/topics", detail: c.topicsHelp },
    ],
  },
];

function ActionLink({ title, href, detail }: Action) {
  return (
    <Link className={s.action} href={href} prefetch={false}>
      <strong>{title}</strong>
      <span aria-hidden="true" className={s.arrow}>
        →
      </span>
      <span className={s.detail}>{detail}</span>
    </Link>
  );
}

export function TeacherWorkspace() {
  const { role } = useAuth();
  return (
    <main className={s.page}>
      <header className={s.heading}>
        <h1>{c.workspace}</h1>
        <p>{c.workspaceIntro}</p>
      </header>
      <div className={s.groups}>
        {sections.map(({ title, actions }) => (
          <section key={title} className={s.group}>
            <h2>{title}</h2>
            <div className={s.links}>
              {actions.map((action) => (
                <ActionLink key={action.href} {...action} />
              ))}
              {title === c.resources && role === "admin" && (
                <ActionLink
                  title={c.access}
                  href="/admin/teachers"
                  detail={c.accessHelp}
                />
              )}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
