import { PagePlaceholder } from "@/components/PagePlaceholder";
import { copy } from "@/lib/copy";

export default async function Page({ params }: PageProps<"/apps/[slug]">) {
  const resolved = await params;

  return (
    <PagePlaceholder
      title={copy.apps.title}
      intro={`${resolved.slug}`}
      phase="Phase 5"
    />
  );
}
