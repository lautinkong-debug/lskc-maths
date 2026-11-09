import Link from "next/link";
import { ACTIVE_LEVELS } from "@/lib/constants";
import { portalCopy as c } from "@/lib/portalCopy";

export function FormChooser() {
  return (
    <nav className="form-chooser" aria-label={c.forms}>
      {[ACTIVE_LEVELS.slice(0, 3), ACTIVE_LEVELS.slice(3)].map(
        (group, index) => (
          <div className="form-band" key={group[0]}>
            <h2>{index === 0 ? c.junior : c.senior}</h2>
            <div className="form-tiles">
              {group.map((level) => (
                <Link
                  key={level}
                  href={`/forms/${level.toLowerCase()}`}
                  prefetch={false}
                  aria-label={c.formName(level)}
                >
                  <span>{level}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        ),
      )}
    </nav>
  );
}
