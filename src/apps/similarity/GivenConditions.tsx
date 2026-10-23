import { useState, useSyncExternalStore } from "react";
import { copy } from "@/lib/copy";
import { GeometryText } from "./Notation";
import { questionGivens } from "./givens";
import type { SourceQuestion } from "./types";
import styles from "./similarity.module.css";

const spaciousScreen = "(min-width: 1000px) and (min-height: 600px)";
const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(spaciousScreen);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const screenSnapshot = () => window.matchMedia(spaciousScreen).matches;
const serverSnapshot = () => false;

/** Screen-space reference: camera and triangle transformations never move it. */
export function GivenConditions({ question }: { question: SourceQuestion }) {
  const spacious = useSyncExternalStore(
    subscribe,
    screenSnapshot,
    serverSnapshot,
  );
  const [choice, setChoice] = useState<boolean | null>(null);
  const open = choice ?? spacious;
  const c = copy.similarity;
  return (
    <section
      className={styles.givenConditions}
      data-testid="given-conditions"
      data-open={open}
      aria-label={c.givenConditions}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setChoice(!open)}
      >
        {c.givenConditions}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <div hidden={!open}>
        <ul>
          {questionGivens[question.id].map((given, i) => (
            <li key={i}>
              <GeometryText>{given}</GeometryText>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
