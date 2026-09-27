import { Math as Tex } from "@/components/Math";
import { copy } from "@/lib/copy";
import { journeyText, moveText, signed, type Journey } from "../lib/moves";
const c = copy.apps.directedNumbers;
export function Working({
  journey,
  completedMoves,
  active,
  presenting,
}: {
  journey: Journey;
  completedMoves: number;
  active: number;
  presenting: boolean;
}) {
  const rows = journey.moves.slice(0, completedMoves).map((_, index) => {
    const value = journey.moves
      .slice(0, index + 1)
      .reduce(
        (sum, move) => sum + (move.op === "+" ? move.b : -move.b),
        journey.start,
      );
    const tail = journey.moves.slice(index + 1);
    return {
      value,
      tex:
        "= " +
        (tail.length
          ? journeyText({ start: value, moves: tail })
          : signed(value)),
    };
  });
  return (
    <section className="border-grid bg-paper min-w-0 rounded border p-4">
      <h3 className="font-display text-navy text-xl font-semibold">
        {c.working}
      </h3>
      <div
        className={`mt-3 space-y-3 overflow-x-auto pb-2 ${presenting ? "text-4xl" : "text-2xl"}`}
      >
        <div className="flex w-max items-baseline gap-2">
          <Tex>{`(${signed(journey.start)})`.replaceAll("−", "-")}</Tex>
          {journey.moves.map((move, index) => (
            <Tex
              key={index}
              className={index === active ? "bg-highlight/40 px-1" : ""}
            >
              {moveText(move).replaceAll("−", "-")}
            </Tex>
          ))}
        </div>
        {rows.map((row, i) => (
          <div key={i} className={i === active ? "bg-highlight/40" : ""}>
            <Tex
              className={`inline-block ${i === journey.moves.length - 1 ? "border-navy border-b-4 border-double pb-1" : ""}`}
            >
              {row.tex.replaceAll("−", "-")}
            </Tex>
          </div>
        ))}
      </div>
    </section>
  );
}
