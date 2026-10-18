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
  const c = copy.lessonWorkspace;
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
          <div>
            <span className={styles.activeDot} aria-hidden="true" />
            <strong>{active}</strong>
          </div>
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-controls={id}
            onClick={() => setCollapsed(!collapsed)}
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="3"
                width="16"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path d="M7 3v14" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            {collapsed ? c.showMenu : c.hideMenu}
          </button>
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
