"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { copy } from "@/lib/copy";
import { button, field } from "./components/ui";
const AddSubtractMode = lazy(() => import("./modes/AddSubtractMode"));
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
    return () => window.removeEventListener("hashchange", readHash);
  }, []);
  function choose(next: Mode) {
    window.location.hash = next;
  }
  return (
    <div className="min-w-0 space-y-6">
      <nav
        aria-label={c.mode}
        className="border-grid hidden flex-wrap gap-1 border-b pb-3 sm:flex"
      >
        {modes.map((tab) => (
          <a
            key={tab}
            href={`#${tab}`}
            aria-current={mode === tab ? "page" : undefined}
            className={`${button} ${mode === tab ? "border-navy bg-navy-wash" : ""}`}
          >
            {c.tabs[tab]}
          </a>
        ))}
      </nav>
      <label className="block font-semibold sm:hidden">
        {c.mode}
        <select
          value={mode}
          onChange={(event) => choose(event.target.value as Mode)}
          className={field}
        >
          {modes.map((tab) => (
            <option key={tab} value={tab}>
              {c.tabs[tab]}
            </option>
          ))}
        </select>
      </label>
      {mode === "add-subtract" ? (
        <Suspense fallback={<p>{copy.apps.loading}</p>}>
          <AddSubtractMode
            key={expression ?? "default"}
            initialExpression={expression}
          />
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
