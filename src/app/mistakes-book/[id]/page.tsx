import { PagePlaceholder } from "@/components/PagePlaceholder";
import { copy } from "@/lib/copy";

export default async function Page({
  params,
}: PageProps<"/mistakes-book/[id]">) {
  const resolved = await params;

  return (
    <PagePlaceholder
      title={copy.books.title}
      intro={`${resolved.id}`}
      phase="Phase 4"
    />
  );
}
