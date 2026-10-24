import { copy } from "@/lib/copy";
import { ENERGY_CAP, SKILLS } from "@/lib/polynomial-tug/skills";
import type { MatchSummary, Skill } from "@/lib/polynomial-tug/types";
import styles from "./Tug.module.css";
const c = copy.polynomialTug;
export function SkillTray({
  pair,
  disabled,
  onActivate,
}: {
  pair: MatchSummary["pairs"][number];
  disabled: boolean;
  onActivate: (skill: Skill) => void;
}) {
  return (
    <section
      id="team-skills"
      className={styles.skillTray}
      aria-label={c.skillsTitle}
    >
      <h3>{c.skillsTitle}</h3>
      <div className={styles.energyLabel}>
        <span>{c.energy}</span>
        <b>
          {pair.energy} / {ENERGY_CAP}
        </b>
      </div>
      <div
        className={styles.energy}
        role="progressbar"
        aria-label={c.energy}
        aria-valuemin={0}
        aria-valuemax={ENERGY_CAP}
        aria-valuenow={pair.energy}
      >
        {Array.from({ length: ENERGY_CAP }, (_, i) => (
          <i key={i} data-filled={i < pair.energy} />
        ))}
      </div>
      <p>{c.energyRule}</p>
      <div className={styles.skillButtons}>
        {SKILLS.map((skill) => {
          const locked = pair.level < skill.level;
          const active =
            pair.armed === skill.id || (skill.id === "shield" && pair.shield);
          const blocked =
            disabled ||
            locked ||
            pair.energy < skill.cost ||
            pair.skillUsed ||
            pair.resolved ||
            active;
          return (
            <button
              key={skill.id}
              data-skill={skill.id}
              data-active={active}
              disabled={blocked}
              aria-label={c.activate(c.skills[skill.id].name)}
              onClick={() => onActivate(skill.id)}
            >
              <span className={styles.skillIcon} aria-hidden="true">
                {skill.symbol}
              </span>
              <span>
                <b>{c.skills[skill.id].name}</b>
                <small>{c.skills[skill.id].detail}</small>
                <em>
                  {locked
                    ? c.unlockSkill(skill.level)
                    : active
                      ? skill.id === "shield"
                        ? c.shieldActive
                        : c.armed(c.skills[skill.id].name)
                      : c.skillCost(skill.cost)}
                </em>
              </span>
            </button>
          );
        })}
      </div>
      <a className={styles.skillJump} href="#tug-question-panel">
        {c.backToQuestion}
      </a>
      {pair.skillUsed && (
        <p role="status" className={styles.skillNotice}>
          {c.skillUsed}
        </p>
      )}
    </section>
  );
}
