"use client";
import Link from "next/link";
import { lazy, Suspense, useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { button, field } from "./components/ui";
import styles from "./DirectedNumbers.module.css";
const AddSubtractMode = lazy(() => import("./modes/AddSubtractMode"));
const NumberLineMode = lazy(() => import("./modes/NumberLineMode"));
const BracketsMode = lazy(() => import("./modes/BracketsMode"));
const MultiplyDivideMode = lazy(() => import("./modes/MultiplyDivideMode"));
const MixedMode = lazy(() => import("./modes/MixedMode"));
const PlayHub = lazy(() => import("./play/PlayHub"));
const SignMagnitudeMode = lazy(() => import("./modes/SignMagnitudeMode"));
const TextbookMode = lazy(() => import("./modes/TextbookMode"));
const c = copy.apps.directedNumbers;
type Mode = keyof typeof c.tabs;
const modes = Object.keys(c.tabs) as Mode[];
export default function DirectedNumbers() {
  const [mode, setMode] = useState<Mode>("add-subtract");
  const [expression, setExpression] = useState<string | undefined>();
  useEffect(() => {
    function readHash() {
      const [name, ...rest] = window.location.hash.slice(1).split(":e=");
      setMode(modes.includes(name as Mode) ? (name as Mode) : "add-subtract");
      try {
        setExpression(
          rest.length ? decodeURIComponent(rest.join(":e=")) : undefined,
        );
      } catch {
        setExpression(undefined);
      }
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
    };
  }, []);
  function choose(next: Mode) {
    setMode(next);
    setExpression(undefined);
    if (window.location.hash !== `#${next}`)
      window.history.pushState(null, "", `#${next}`);
  }
  return (
    <div
      className="min-w-0 space-y-6"
      onClickCapture={(event) => {
        if (
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        )
          return;
        const href = (event.target as Element)
          .closest("a")
          ?.getAttribute("href");
        if (href?.startsWith("#") && modes.includes(href.slice(1) as Mode)) {
          event.preventDefault();
          choose(href.slice(1) as Mode);
        }
      }}
    >
      <nav aria-label={c.journeyLabel} className={styles.navigation}>
        <a
          href="#add-subtract"
          aria-current={mode !== "play" ? "page" : undefined}
        >
          <span aria-hidden="true">01</span>
          {c.learnNav}
        </a>
        <a href="#play" aria-current={mode === "play" ? "page" : undefined}>
          <span aria-hidden="true">02</span>
          {c.playNav}
        </a>
        <Link href="/join">
          <span aria-hidden="true">03</span>
          {c.competeNav}
          <span aria-hidden="true">↗</span>
        </Link>
      </nav>
      {mode !== "play" && (
        <nav aria-label={c.mode} className={styles.lessons}>
          {modes
            .filter((tab) => tab !== "play")
            .map((tab) => (
              <a
                key={tab}
                href={`#${tab}`}
                aria-current={mode === tab ? "page" : undefined}
              >
                {c.tabs[tab]}
              </a>
            ))}
        </nav>
      )}
      {mode !== "play" && (
        <label className="block font-semibold sm:hidden">
          {c.mode}
          <select
            value={mode}
            onChange={(event) => choose(event.target.value as Mode)}
            className={field}
          >
            {modes
              .filter((tab) => tab !== "play")
              .map((tab) => (
                <option key={tab} value={tab}>
                  {c.tabs[tab]}
                </option>
              ))}
          </select>
        </label>
      )}
      {mode === "add-subtract" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <AddSubtractMode
            key={expression ?? "default"}
            initialExpression={expression}
          />
        </Suspense>
      ) : mode === "number-line" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <NumberLineMode />
        </Suspense>
      ) : mode === "brackets" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <BracketsMode
            key={expression ?? "default"}
            initialExpression={expression}
          />
        </Suspense>
      ) : mode === "multiply-divide" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <MultiplyDivideMode
            key={expression ?? "default"}
            initialExpression={expression}
          />
        </Suspense>
      ) : mode === "mixed" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <MixedMode
            key={expression ?? "default"}
            initialExpression={expression}
          />
        </Suspense>
      ) : mode === "sign-magnitude" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <SignMagnitudeMode
            key={expression ?? "default"}
            initialExpression={expression}
          />
        </Suspense>
      ) : mode === "textbook" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <TextbookMode
            key={expression ?? "default"}
            initialQuestion={expression}
          />
        </Suspense>
      ) : mode === "play" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <PlayHub />
        </Suspense>
      ) : (
        <section className="graph-paper border-grid rounded border p-8">
          <h2 className="font-display text-navy text-2xl font-semibold">
            {c.tabs[mode]}
          </h2>
          <p className="mt-4 font-semibold">{c.later}</p>
          <p className="mt-2">{c.laterBody}</p>
          <a
            href="#add-subtract"
            className={`${button} mt-6 inline-flex items-center`}
          >
            {c.returnToLesson}
          </a>
        </section>
      )}
    </div>
  );
}
