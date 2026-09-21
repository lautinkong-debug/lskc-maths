import { PagePlaceholder } from "@/components/PagePlaceholder";
import { copy } from "@/lib/copy";

export default function Page() {
  return (
    <PagePlaceholder
      title={copy.apps.title}
      intro={copy.apps.intro}
      phase="Phase 5"
    />
  );
}
