import { useEffect, useRef, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { expressionTex, parseAdditive } from "../lib/steps";
import type { Ast } from "../lib/parse";
import { Keypad } from "./Keypad";
import { button, field, primary } from "./ui";
const c = copy.apps.directedNumbers;
export function AdditiveInput({
  value,
  onChange,
  onLoad,
  presenting,
}: {
  value: string;
  onChange: (v: string) => void;
  onLoad: (ast: Ast) => void;
  presenting: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null),
    [keypad, setKeypad] = useState(false),
    [submitted, setSubmitted] = useState(false);
  const parsed = parseAdditive(value);
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse), (max-width: 639px)");
    const update = () => setKeypad(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  function submit() {
    setSubmitted(true);
    if (parsed.ok) onLoad(parsed.value);
    else {
      ref.current?.focus();
      ref.current?.setSelectionRange(parsed.span.start, parsed.span.end);
    }
  }
  function key(key: string) {
    if (key === "enter") {
      submit();
      return;
    }
    const el = ref.current,
      start = el?.selectionStart ?? value.length,
      end = el?.selectionEnd ?? value.length;
    const from =
      key === "backspace" && start === end ? Math.max(0, start - 1) : start;
    const insertion =
      key === "a/b"
        ? "/"
        : key === "space"
          ? " "
          : key === "backspace"
            ? ""
            : key;
    const next =
      key === "clear"
        ? ""
        : value.slice(0, from) + insertion + value.slice(end);
    const cursor = key === "clear" ? 0 : from + insertion.length;
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(cursor, cursor);
    });
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="min-w-0"
    >
      <label htmlFor="dn-bracket-input" className="font-semibold">
        {c.expression}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="dn-bracket-input"
          ref={ref}
          value={value}
          maxLength={81}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} flex-1 basis-52`}
          aria-invalid={!parsed.ok}
          aria-describedby="dn-bracket-help"
        />
        <button className={`${primary} mt-1`}>{c.bracketLesson.load}</button>
      </div>
      <div id="dn-bracket-help" className="mt-2 overflow-x-auto text-sm">
        {parsed.ok ? (
          <>
            <span>{c.echo} </span>
            <Tex>
              {expressionTex(
                parsed.value,
                value.includes(".") && !value.includes("/")
                  ? "decimal"
                  : "improper",
              )}
            </Tex>
          </>
        ) : (
          <p
            role={submitted ? "alert" : undefined}
            className="text-crimson-deep"
          >
            {parsed.message}
          </p>
        )}
      </div>
      {!presenting && (
        <>
          <button
            type="button"
            className={`${button} mt-3`}
            aria-expanded={keypad}
            onClick={() => setKeypad(!keypad)}
          >
            {keypad ? c.hideKeypad : c.showKeypad}
          </button>
          {keypad && <Keypad onKey={key} />}
        </>
      )}
    </form>
  );
}
