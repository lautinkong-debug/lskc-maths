import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getApp } from "@/apps/registry";
import { AppHost } from "@/components/AppHost";
import { copy } from "@/lib/copy";

export async function generateMetadata({
  params,
}: PageProps<"/apps/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getApp(slug)?.title ?? copy.apps.title };
}

export default async function Page({ params }: PageProps<"/apps/[slug]">) {
  const { slug } = await params;
  if (!getApp(slug)) notFound();
  return <AppHost slug={slug} />;
}
