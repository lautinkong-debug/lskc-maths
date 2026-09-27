import { useEffect, useRef, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { journeyText, parseJourney, type Journey } from "../lib/moves";
import { Keypad } from "./Keypad";
import { button, field, primary } from "./ui";
const c = copy.apps.directedNumbers;
export function ExpressionInput({
  value,
  onChange,
  onLoad,
  presenting,
}: {
  value: string;
  onChange: (value: string) => void;
  onLoad: (journey: Journey) => void;
  presenting: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [keypad, setKeypad] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const parsed = parseJourney(value);
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse), (max-width: 639px)");
    const update = () => setKeypad(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  function load() {
    setSubmitted(true);
    if (parsed.ok) onLoad(parsed.value);
    else {
      input.current?.focus();
      input.current?.setSelectionRange(parsed.span.start, parsed.span.end);
    }
  }
  function key(key: string) {
    if (key === "enter") {
      load();
      return;
    }
    const el = input.current;
    const start = el?.selectionStart ?? value.length,
      end = el?.selectionEnd ?? value.length;
    let next = value,
      cursor = start;
    if (key === "clear") {
      next = "";
      cursor = 0;
    } else if (key === "backspace") {
      const from = start === end ? Math.max(0, start - 1) : start;
      next = value.slice(0, from) + value.slice(end);
      cursor = from;
    } else {
      const insertion = key === "a/b" ? "/" : key === "space" ? " " : key;
      next = value.slice(0, start) + insertion + value.slice(end);
      cursor = start + insertion.length;
    }
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(cursor, cursor);
    });
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        load();
      }}
      className="min-w-0"
    >
      <label className="block font-semibold" htmlFor="dn-expression">
        {c.expression}
      </label>
      <div className="flex flex-wrap items-start gap-2">
        <input
          id="dn-expression"
          ref={input}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={81}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={submitted && !parsed.ok}
          aria-describedby="dn-expression-help"
          className={`${field} flex-1 basis-48 font-mono`}
        />
        <button type="submit" className={`${primary} mt-1`}>
          {c.load}
        </button>
      </div>
      <div id="dn-expression-help" className="mt-2 overflow-x-auto text-sm">
        {parsed.ok ? (
          <>
            <span className="text-pencil mr-2">{c.echo}</span>
            <Tex>{journeyText(parsed.value).replaceAll("−", "-")}</Tex>
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
          <p className="text-pencil mt-2 text-sm">{c.chainHint}</p>
          <button
            type="button"
            aria-expanded={keypad}
            onClick={() => setKeypad(!keypad)}
            className={`${button} mt-3`}
          >
            {keypad ? c.hideKeypad : c.showKeypad}
          </button>
          {keypad && <Keypad onKey={key} />}
        </>
      )}
    </form>
  );
}
