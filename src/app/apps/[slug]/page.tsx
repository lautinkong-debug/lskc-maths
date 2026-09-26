import { notFound } from "next/navigation";
import { getApp } from "@/apps/registry";
import { AppHost } from "@/components/AppHost";

export default async function Page({ params }: PageProps<"/apps/[slug]">) {
  const { slug } = await params;
  if (!getApp(slug)) notFound();
  return <AppHost slug={slug} />;
}
