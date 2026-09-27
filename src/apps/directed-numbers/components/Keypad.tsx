import { copy } from "@/lib/copy";
const c = copy.apps.directedNumbers;
export function Keypad({ onKey }: { onKey: (key: string) => void }) {
  const keys = [
    "7",
    "8",
    "9",
    "+",
    "(",
    ")",
    "4",
    "5",
    "6",
    "−",
    "[",
    "]",
    "1",
    "2",
    "3",
    "×",
    "÷",
    "a/b",
    "0",
    ".",
    "space",
    "backspace",
    "clear",
    "enter",
  ];
  const label = (key: string) =>
    key === "space"
      ? c.space
      : key === "backspace"
        ? c.backspace
        : key === "clear"
          ? c.clear
          : key === "enter"
            ? c.enter
            : key === "a/b"
              ? c.fraction
              : key;
  return (
    <div
      role="group"
      aria-label={c.keypad}
      className="mt-3 grid grid-cols-6 gap-1.5"
    >
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          aria-label={label(key)}
          onClick={() => onKey(key)}
          className={`border-grid-strong min-h-12 rounded border px-1 text-sm font-semibold ${key === "enter" ? "bg-navy text-paper" : "bg-paper text-navy hover:bg-navy-wash"}`}
        >
          {key === "backspace" ? "⌫" : label(key)}
        </button>
      ))}
    </div>
  );
}
