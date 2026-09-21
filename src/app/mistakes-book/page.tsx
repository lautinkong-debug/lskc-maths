import { PagePlaceholder } from "@/components/PagePlaceholder";
import { copy } from "@/lib/copy";

export default function Page() {
  return (
    <PagePlaceholder
      title={copy.books.title}
      intro={copy.books.intro}
      phase="Phase 4"
    />
  );
}
