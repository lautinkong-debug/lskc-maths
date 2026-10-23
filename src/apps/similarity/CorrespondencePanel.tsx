import { copy } from "@/lib/copy";
import { Math as MathText } from "@/components/Math";
import { GeometryText } from "./Notation";
import type { Correspondence, CorrespondencePair } from "./correspondence";
import styles from "./similarity.module.css";

const c = copy.similarity;
export function CorrespondencePanel({
  correspondence,
  pair,
  onCompare,
}: {
  correspondence: Correspondence;
  pair: CorrespondencePair;
  onCompare: (key: string) => void;
}) {
  return (
    <div
      className={styles.conclusionCorrespondence}
      data-testid="similarity-correspondence"
    >
      <h3>{c.correspondenceTitle}</h3>
      <p className={styles.vertexOrder}>
        <GeometryText>
          {correspondence.vertices.map(([a, b]) => `${a} ↔ ${b}`).join(" · ")}
        </GeometryText>
      </p>
      <div
        className={styles.pairKinds}
        role="group"
        aria-label={c.correspondingParts}
      >
        {(["side", "angle"] as const).map((kind) => (
          <button
            key={kind}
            aria-pressed={pair.kind === kind}
            onClick={() =>
              onCompare(correspondence.pairs.find((p) => p.kind === kind)!.key)
            }
          >
            {kind === "side" ? c.correspondingSides : c.correspondingAngles}
          </button>
        ))}
      </div>
      <div
        className={styles.pairChoices}
        role="group"
        aria-label={c.chooseCorrespondingPair}
      >
        {correspondence.pairs
          .filter((p) => p.kind === pair.kind)
          .map((p) => (
            <button
              key={p.key}
              aria-pressed={pair.key === p.key}
              onClick={() => onCompare(p.key)}
            >
              <GeometryText>{p.label}</GeometryText>
            </button>
          ))}
      </div>
      <select
        className={styles.pairSelect}
        aria-label={c.chooseCorrespondingPair}
        value={pair.key}
        onChange={(event) => onCompare(event.target.value)}
      >
        {(["side", "angle"] as const).map((kind) => (
          <optgroup
            key={kind}
            label={
              kind === "side" ? c.correspondingSides : c.correspondingAngles
            }
          >
            {correspondence.pairs
              .filter((p) => p.kind === kind)
              .map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
      {pair.kind === "side" && (
        <p className={styles.pairRatio}>
          {c.selectedSideRatio}{" "}
          <MathText>{`\\dfrac{${pair.members[0].name}}{${pair.members[1].name}}`}</MathText>
        </p>
      )}
      <p className={styles.pairHint}>
        {pair.kind === "side" ? c.sidePairHint : c.anglePairHint}
      </p>
    </div>
  );
}
