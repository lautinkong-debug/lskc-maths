import Link from "next/link";
import { copy } from "@/lib/copy";

type Props = {
  title: string;
  intro?: string;
  /** Which phase of PLAN.md builds this page for real. */
  phase: string;
};

/**
 * Stand-in for a route that exists but isn't built yet, so every link in the
 * site leads somewhere honest instead of a 404.
 */
export function PagePlaceholder({ title, intro, phase }: Props) {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 lg:py-14">
      <h1 className="font-display text-section text-navy lg:text-hero font-semibold lg:leading-tight">
        {title}
      </h1>
      {intro && <p className="text-graphite/80 mt-3 max-w-prose">{intro}</p>}

      <div className="border-grid mt-8 max-w-prose border border-dashed bg-white p-6">
        <p className="font-medium">{copy.common.comingSoon}</p>
        <p className="text-pencil text-meta mt-1">
          {copy.common.comingSoonBody} ({phase})
        </p>
        <Link
          href="/"
          className="text-navy text-meta mt-4 inline-block underline underline-offset-4"
        >
          {copy.common.backToHome}
        </Link>
      </div>
    </main>
  );
}
