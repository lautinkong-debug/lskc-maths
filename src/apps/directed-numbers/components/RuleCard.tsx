import { copy } from "@/lib/copy";
import { moveFor, type Move } from "../lib/moves";
const c = copy.apps.directedNumbers;
export function RuleCard({
  move,
  revealed,
  vertical = false,
  presenting = false,
}: {
  move: Move;
  revealed: boolean;
  vertical?: boolean;
  presenting?: boolean;
}) {
  const active = moveFor(move.op, move.b).cell;
  return (
    <section className="border-grid rounded border p-4">
      <h3 className="font-display text-navy text-xl font-semibold">{c.rule}</h3>
      <table
        className={`mt-3 w-full text-center ${presenting ? "text-xl" : "text-sm"}`}
      >
        <thead>
          <tr>
            <td />
            <th scope="col" className="p-2">
              {c.positive}
            </th>
            <th scope="col" className="p-2">
              {c.negative}
            </th>
          </tr>
        </thead>
        <tbody>
          {(["add", "sub"] as const).map((op) => (
            <tr key={op}>
              <th scope="row" className="p-2 text-left">
                {op === "add" ? c.add : c.subtract}
              </th>
              {(["pos", "neg"] as const).map((sign) => (
                <td
                  key={sign}
                  className={`p-2 ${revealed && move.b !== 0 && active === `${op}-${sign}` ? "bg-highlight/40 text-navy font-bold" : ""}`}
                >
                  {(op === "add") === (sign === "pos")
                    ? vertical
                      ? `↑ ${c.up}`
                      : `→ ${c.right}`
                    : vertical
                      ? `↓ ${c.down}`
                      : `← ${c.left}`}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {move.b === 0 && <p className="mt-3 text-sm">{c.directionZero}</p>}
    </section>
  );
}
