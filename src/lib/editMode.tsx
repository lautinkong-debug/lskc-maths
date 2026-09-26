"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/lib/auth";

interface EditModeState {
  editing: boolean;
  toggle: () => void;
}

const EditModeContext = createContext<EditModeState | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { role, user } = useAuth();
  const isTeacher = role === "teacher" || role === "admin";
  const scope = isTeacher && user ? user.uid : "no-editor";
  return (
    <EditModeSession key={scope} isTeacher={isTeacher}>
      {children}
    </EditModeSession>
  );
}

function EditModeSession({
  children,
  isTeacher,
}: {
  children: ReactNode;
  isTeacher: boolean;
}) {
  const [requested, setRequested] = useState(false);
  const value = useMemo(
    () => ({
      editing: isTeacher && requested,
      toggle: () => {
        if (isTeacher) setRequested((current) => !current);
      },
    }),
    [isTeacher, requested],
  );
  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode(): EditModeState {
  const value = useContext(EditModeContext);
  if (!value) throw new Error("useEditMode must be inside EditModeProvider.");
  return value;
}
