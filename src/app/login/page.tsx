import { PagePlaceholder } from "@/components/PagePlaceholder";
import { copy } from "@/lib/copy";

export default function Page() {
  return (
    <PagePlaceholder
      title={copy.auth.signInTitle}
      intro={copy.auth.signInIntro}
      phase="Phase 2"
    />
  );
}
