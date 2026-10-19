"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { copy } from "@/lib/copy";
import styles from "./LessonWorkspace.module.css";

/** Navigation can fold away without remounting the active teaching activity. */
export function LessonWorkspace({
  subject,
  symbol,
  active,
  navigation,
  presenting = false,
  children,
}: {
  subject: string;
  symbol: string;
  active: string;
  navigation: ReactNode;
  presenting?: boolean;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const id = useId();
  const mobileTitle = useRef<HTMLSpanElement>(null);
  const hideButton = useRef<HTMLButtonElement>(null);
  const showButton = useRef<HTMLButtonElement>(null);
  const c = copy.lessonWorkspace;
  function toggleSidebar(next: boolean) {
    setCollapsed(next);
    requestAnimationFrame(() =>
      (next ? showButton : hideButton).current?.focus({ preventScroll: true }),
    );
  }
  return (
    <div
      className={styles.workspace}
      data-collapsed={collapsed}
      data-mobile-open={mobileOpen}
      data-projecting={presenting || undefined}
      data-testid="lesson-workspace"
      data-lesson-studio="true"
    >
      <div className={styles.mobileBar}>
        <span ref={mobileTitle} tabIndex={-1}>
          {active}
        </span>
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={id}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? c.closeMenu : c.menu}{" "}
          <span aria-hidden="true">{mobileOpen ? "−" : "+"}</span>
        </button>
      </div>
      <aside className={styles.rail} id={id}>
        <button
          type="button"
          ref={hideButton}
          className={styles.railToggle}
          aria-controls={id}
          aria-expanded={!collapsed}
          onClick={() => toggleSidebar(true)}
        >
          <span aria-hidden="true">‹</span> {c.hideMenu}
        </button>
        <div className={styles.identity}>
          <span className={styles.symbol} aria-hidden="true">
            {symbol}
          </span>
          <div>
            <p>{c.studio}</p>
            <strong>{subject}</strong>
          </div>
        </div>
        <div
          onClick={(event) => {
            if ((event.target as Element).closest("a, button")) {
              setMobileOpen(false);
              if (mobileOpen)
                mobileTitle.current?.focus({ preventScroll: true });
            }
          }}
        >
          {navigation}
        </div>
      </aside>
      <div className={styles.stage}>
        <header className={styles.stageHeader}>
          {collapsed && (
            <button
              type="button"
              ref={showButton}
              className={styles.restoreMenu}
              aria-expanded={false}
              aria-controls={id}
              onClick={() => toggleSidebar(false)}
            >
              <span aria-hidden="true">›</span> {c.showMenu}
            </button>
          )}
          <div>
            <span className={styles.activeDot} aria-hidden="true" />
            <strong>{active}</strong>
          </div>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
