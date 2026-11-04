"use client";

import { createContext, useContext, type ReactNode } from "react";

/** True inside a Level 1 or Level 2 lesson, so shared cards can show the new look without touching other levels. */
export const Level1LookContext = createContext(false);
export const useLevel1Look = () => useContext(Level1LookContext);

/** Turns the new look on for one quiz question area, in Levels 1 and 2, and every Level 3 realm. */
export function NewLookScope({ level, realm, children }: { level: number; realm: string; children: ReactNode }) {
  if (level >= 3 && level <= 5 && realm === "chance") return <div data-chance-level={String(level)}>{children}</div>;
  if (level >= 3 && level <= 5 && realm === "pattern") return <div data-pattern-level={String(level)}>{children}</div>;
  if (level >= 3 && level <= 5 && (realm === "space" || realm === "measurement")) return <div data-l3-look={realm === "space" ? "space-quiz" : realm}>{children}</div>;
  if (level >= 3 && level <= 6 && realm === "statistics") return <Level1LookContext.Provider value><div data-level1-look="statistics" data-statistica-level={String(level)}>{children}</div></Level1LookContext.Provider>;
  if (level !== 1 && level !== 2) return <>{children}</>;
  const look = realm === "measurement" ? "measurement" : realm === "space" ? "space" : realm === "statistics" ? "statistics" : "number";
  return (
    <Level1LookContext.Provider value>
      <div data-level1-look={look} data-number-nexus-level={look === "number" && level === 2 ? "2" : undefined}>{children}</div>
    </Level1LookContext.Provider>
  );
}
