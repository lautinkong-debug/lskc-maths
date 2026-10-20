"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { copy } from "@/lib/copy";
import styles from "./similarity.module.css";

/** Keep one lesson mounted when switching between inline and classroom views. */
export function PracticeFrame({
  classroom,
  active,
  onExit,
  header,
  children,
}: {
  classroom: boolean;
  active: boolean;
  onExit: () => void;
  header: ReactNode;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current!;
    node.close();
    if (classroom && active) node.showModal();
    else node.show();
    return () => node.close();
  }, [classroom, active]);
  return (
    <dialog
      ref={dialog}
      className={styles.practiceFrame}
      data-classroom={classroom && active}
      data-testid="practice-classroom"
      aria-label={copy.similarity.classroom}
      onCancel={(event) => {
        event.preventDefault();
        onExit();
      }}
    >
      {classroom && header}
      {children}
    </dialog>
  );
}
