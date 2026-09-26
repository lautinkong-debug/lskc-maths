import Link from "next/link";
import { HomeContent } from "@/components/home/HomeContent";
import { LatestUploads } from "@/components/home/LatestUploads";
import { FeaturedApps } from "@/components/home/FeaturedApps";
import { copy } from "@/lib/copy";

function ParabolaGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        d="M3 3 Q 12 29 21 3"
        fill="none"
        className="stroke-navy"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <line
        x1="1.5"
        y1="16.5"
        x2="22.5"
        y2="16.5"
        className="stroke-navy"
        strokeWidth="1.3"
        opacity="0.4"
      />
      <circle
        cx="12"
        cy="18.6"
        r="2"
        className="fill-highlight stroke-navy"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function RedPenGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
      <path
        d="M4 13 L 9 18 L 20 5"
        fill="none"
        className="stroke-crimson"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="3"
        y1="21.5"
        x2="21"
        y2="21.5"
        className="stroke-crimson"
        strokeWidth="1.2"
        opacity="0.4"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <HomeContent />

      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <section className="grid gap-5 py-10 sm:grid-cols-2 lg:py-14">
          <Link
            href="/apps"
            className="border-grid border-t-navy group hover:bg-navy-wash border border-t-[3px] bg-white p-6 lg:p-8"
          >
            <ParabolaGlyph />
            <h2 className="font-display text-card text-navy lg:text-section mt-3 font-semibold">
              {copy.home.appsCardTitle}
            </h2>
            <p className="text-graphite/80 mt-2 max-w-prose">
              {copy.home.appsCardBody}
            </p>
            <span className="text-navy text-meta mt-4 inline-block group-hover:underline">
              {copy.home.appsCardAction} &rarr;
            </span>
          </Link>

          <Link
            href="/mistakes-book"
            className="border-grid border-t-crimson group hover:bg-crimson-wash border border-t-[3px] bg-white p-6 lg:p-8"
          >
            <RedPenGlyph />
            <h2 className="font-display text-card text-crimson-deep lg:text-section mt-3 font-semibold">
              {copy.home.booksCardTitle}
            </h2>
            <p className="text-graphite/80 mt-2 max-w-prose">
              {copy.home.booksCardBody}
            </p>
            <span className="text-crimson-deep text-meta mt-4 inline-block group-hover:underline">
              {copy.home.booksCardAction} &rarr;
            </span>
          </Link>
        </section>

        <FeaturedApps />
        <LatestUploads />
      </div>
    </main>
  );
}
