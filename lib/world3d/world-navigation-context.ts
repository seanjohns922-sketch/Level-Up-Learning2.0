"use client";

const WORLD_NAVIGATION_CONTEXT_KEY = "lul:world3d:navigation-context:v1";
const WORLD_NAVIGATION_CONTEXT_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export type WorldNavigationContext = {
  source: "central-world";
  destination: "my-home";
  returnHref: string;
  returnSpawnPointId: "my-home-exit-spawn";
  createdAt: number;
};

export function rememberCentralWorldHomeEntry(teacherPreview = false) {
  if (typeof window === "undefined") return;
  const context: WorldNavigationContext = {
    source: "central-world",
    destination: "my-home",
    returnHref: `/world?spawn=my-home-exit-spawn${teacherPreview ? "&teacher_preview=1" : ""}`,
    returnSpawnPointId: "my-home-exit-spawn",
    createdAt: Date.now(),
  };
  window.sessionStorage.setItem(WORLD_NAVIGATION_CONTEXT_KEY, JSON.stringify(context));
}

export function readWorldNavigationContext(): WorldNavigationContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(WORLD_NAVIGATION_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WorldNavigationContext>;
    const valid = parsed.source === "central-world"
      && parsed.destination === "my-home"
      && typeof parsed.returnHref === "string"
      && parsed.returnHref.startsWith("/world?spawn=my-home-exit-spawn")
      && parsed.returnSpawnPointId === "my-home-exit-spawn"
      && typeof parsed.createdAt === "number"
      && Date.now() - parsed.createdAt <= WORLD_NAVIGATION_CONTEXT_MAX_AGE_MS;
    if (!valid) {
      clearWorldNavigationContext();
      return null;
    }
    return parsed as WorldNavigationContext;
  } catch {
    clearWorldNavigationContext();
    return null;
  }
}

export function clearWorldNavigationContext() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(WORLD_NAVIGATION_CONTEXT_KEY);
}

export function getCentralWorldHomeReturnPath() {
  const context = readWorldNavigationContext();
  return context?.source === "central-world" && context.destination === "my-home"
    ? context.returnHref
    : null;
}
