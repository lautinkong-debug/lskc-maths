import { useEffect, useRef, useState } from "react";
import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { parse, type Ast } from "../lib/parse";
import { expressionTex } from "../lib/steps";
import { Keypad } from "./Keypad";
import { button, field, primary } from "./ui";

const c = copy.apps.directedNumbers;
export function ArithmeticInput({
  value,
  onChange,
  onLoad,
  presenting,
  accepts = () => true,
  scopeMessage,
}: {
  value: string;
  onChange: (value: string) => void;
  onLoad: (ast: Ast) => void;
  presenting: boolean;
  accepts?: (ast: Ast) => boolean;
  scopeMessage?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [keypad, setKeypad] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const parsed = parse(value);
  const valid = parsed.ok && accepts(parsed.value);
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse), (max-width: 639px)");
    const update = () => setKeypad(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  function load() {
    setSubmitted(true);
    if (parsed.ok && valid) onLoad(parsed.value);
    else {
      ref.current?.focus();
      if (!parsed.ok)
        ref.current?.setSelectionRange(parsed.span.start, parsed.span.end);
    }
  }
  function press(key: string) {
    if (key === "enter") {
      load();
      return;
    }
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const from =
      key === "backspace" && start === end ? Math.max(0, start - 1) : start;
    const insert =
      key === "a/b"
        ? "/"
        : key === "space"
          ? " "
          : key === "backspace" || key === "clear"
            ? ""
            : key;
    const next =
      key === "clear" ? "" : value.slice(0, from) + insert + value.slice(end);
    const cursor = key === "clear" ? 0 : from + insert.length;
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
      <label htmlFor="dn-arithmetic-input" className="font-semibold">
        {c.expression}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id="dn-arithmetic-input"
          ref={ref}
          value={value}
          maxLength={81}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={submitted && !valid}
          aria-describedby="dn-arithmetic-help"
          className={`${field} flex-1 basis-52 font-mono`}
        />
        <button className={`${primary} mt-1`} type="submit">
          {c.arithmetic.load}
        </button>
      </div>
      <div id="dn-arithmetic-help" className="mt-2 overflow-x-auto text-sm">
        {parsed.ok && valid ? (
          <>
            <span className="text-pencil mr-2">{c.echo}</span>
            <Tex>{expressionTex(parsed.value)}</Tex>
          </>
        ) : (
          <p
            className="text-crimson-deep"
            role={submitted ? "alert" : undefined}
          >
            {parsed.ok ? scopeMessage : parsed.message}
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
          {keypad && <Keypad onKey={press} />}
        </>
      )}
    </form>
  );
}
