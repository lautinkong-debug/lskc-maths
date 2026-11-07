import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { appTitles } from "@/apps/appRoutes";
import { AppHost } from "@/components/AppHost";
import { copy } from "@/lib/copy";
import { readAppListing } from "@/lib/server/appListing";

export const dynamicParams = false;
// Built ahead and refreshed at most once a minute, so a whole class is served
// from the CDN with no server work per student, and a teacher's listing still
// reaches them within a minute.
export const revalidate = 60;

export function generateStaticParams() {
  return Object.keys(appTitles).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/apps/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: appTitles[slug] ?? copy.apps.title };
}

export default async function Page({ params }: PageProps<"/apps/[slug]">) {
  const { slug } = await params;
  if (!Object.hasOwn(appTitles, slug)) notFound();
  const listing = await readAppListing(slug);
  return (
    <AppHost
      slug={slug}
      title={listing?.title || appTitles[slug]}
      hidden={listing?.visible === false}
    />
  );
}
