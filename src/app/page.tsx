import Image from "next/image";

/**
 * Phase 0 placeholder. Phase 1 replaces this with the real Home page
 * (graph-paper hero, the two entry cards, latest uploads).
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <Image
        src="/school-logo-512.png"
        alt="S.T.F.A. Lee Shau Kee College crest"
        width={128}
        height={124}
        priority
      />

      <div>
        <h1 className="text-navy text-3xl font-semibold">LSKC Mathematics</h1>
        <p className="text-graphite/70 mt-2 text-sm">
          S.T.F.A. Lee Shau Kee College &middot; Mathematics Department
        </p>
      </div>

      <div className="border-grid w-full rounded border bg-white px-6 py-5 text-left">
        <p className="text-graphite text-sm font-medium">
          Phase 0 complete &mdash; the project is set up.
        </p>
        <ul className="text-graphite/75 mt-3 space-y-1 text-sm">
          <li>Next.js, TypeScript and Tailwind are running.</li>
          <li>
            Firebase is wired to the local emulators, not to a real project.
          </li>
          <li>Next up (Phase 1): the design system and the real Home page.</li>
        </ul>
      </div>

      <p className="text-graphite/50 text-xs">
        Emulator control panel:{" "}
        <a
          className="text-navy underline underline-offset-2"
          href="http://localhost:4000"
        >
          localhost:4000
        </a>
      </p>
    </main>
  );
}
