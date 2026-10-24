import { copy } from "@/lib/copy";
import { speedBonus, TIME_TARGETS } from "@/lib/polynomial-tug/timing";
import type { MatchSummary } from "@/lib/polynomial-tug/types";
import styles from "./Tug.module.css";
const c = copy.polynomialTug;
export function ForceMeter({
  pair,
  paused,
}: {
  pair: MatchSummary["pairs"][number];
  paused: boolean;
}) {
  const level = pair.resolved ? pair.lastBasePower : pair.level;
  const target = TIME_TARGETS[Math.max(0, Math.min(3, level - 1))];
  const bonus = pair.resolved
    ? pair.lastSpeedBonus
    : speedBonus(level, pair.elapsedMs, pair.speedEligible);
  return (
    <section
      className={styles.forceMeter}
      aria-label={c.forceTitle}
      data-testid="tug-force"
    >
      <h3>{c.forceTitle}</h3>
      <div className={styles.forceStats}>
        <span>
          {c.difficultyForce}
          <b>+{level}</b>
        </span>
        <span>
          {c.timeBonus}
          <b>+{bonus}</b>
        </span>
        <span>
          {c.teamTime}
          <b>
            {pair.elapsedMs === null ? "—" : c.seconds(pair.elapsedMs / 1000)}
          </b>
        </span>
      </div>
      <p>{c.timeTargets(target.fastMs / 1000, target.steadyMs / 1000)}</p>
      <p>
        {paused
          ? c.clockPaused
          : !pair.speedEligible
            ? c.noTimeBonus
            : c.teamTimeRule}
      </p>
    </section>
  );
}
