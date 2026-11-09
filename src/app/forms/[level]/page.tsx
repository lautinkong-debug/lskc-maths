import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ACTIVE_LEVELS } from "@/lib/constants";
import { portalCopy as c } from "@/lib/portalCopy";
import { FormResources } from "@/components/resources/FormResources";

export function generateStaticParams() {
  return ACTIVE_LEVELS.map((level) => ({ level: level.toLowerCase() }));
}
function resolveLevel(raw: string) {
  return (
    ACTIVE_LEVELS.find((level) => level.toLowerCase() === raw.toLowerCase()) ??
    notFound()
  );
}
export async function generateMetadata({
  params,
}: PageProps<"/forms/[level]">): Promise<Metadata> {
  return { title: c.formTitle(resolveLevel((await params).level)) };
}
export default async function FormPage({
  params,
}: PageProps<"/forms/[level]">) {
  const level = resolveLevel((await params).level);
  return (
    <main className="portal-page form-page">
      <Link prefetch={false} className="portal-back" href="/">
        ← {c.collections}
      </Link>
      <header className="form-page-header">
        <div>
          <h1 className="portal-heading">{c.formTitle(level)}</h1>
          <p>{c.formIntro}</p>
        </div>
        <nav aria-label={c.jump} className="form-switcher">
          {ACTIVE_LEVELS.map((item) => (
            <Link
              key={item}
              prefetch={false}
              href={`/forms/${item.toLowerCase()}`}
              aria-label={c.formName(item)}
              aria-current={item === level ? "page" : undefined}
            >
              {item}
            </Link>
          ))}
        </nav>
      </header>
      <nav className="form-jumps" aria-label={c.libraries}>
        <a href="#form-apps">{c.apps}</a>
        <a href="#form-books">{c.books}</a>
      </nav>
      <FormResources key={level} level={level} />
    </main>
  );
}
