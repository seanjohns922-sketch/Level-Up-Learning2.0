"use client";

import type { CanonicalRealmId } from "@/lib/realms/realm-registry";

const RETURN_CONTEXT_KEY = "lul:world3d:return-context:v2";
const RETURN_CONTEXT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

type World3DActivityContext =
  | { activityType: "lesson"; lessonNumber: number; lessonId: string }
  | { activityType: "quiz" }
  | { activityType: "posttest" };

export type World3DReturnContext = {
  source: "3d";
  realmId: CanonicalRealmId;
  level: string;
  districtId: string;
  week: number;
  spawnPointId: string;
  returnHref: string;
  createdAt: number;
  activity?: World3DActivityContext;
};

type World3DWeekEntry = Omit<World3DReturnContext, "source" | "createdAt" | "activity">;

function writeWorld3DReturnContext(context: World3DReturnContext) {
  if (typeof window === "undefined") return;
  // Storage can throw (private mode, sandboxed preview iframe, locked-down
  // devices). Remembering the return spawn must never block entering the world.
  try {
    window.sessionStorage.setItem(RETURN_CONTEXT_KEY, JSON.stringify(context));
  } catch {
    /* no-op — entry proceeds without a remembered return path */
  }
}

export function rememberWorld3DWeekEntry(context: World3DWeekEntry) {
  writeWorld3DReturnContext({
    ...context,
    source: "3d",
    createdAt: Date.now(),
  });
}

export function rememberWorld3DPosttestEntry(context: World3DWeekEntry) {
  writeWorld3DReturnContext({
    ...context,
    source: "3d",
    createdAt: Date.now(),
    activity: { activityType: "posttest" },
  });
}

export function readWorld3DReturnContext(): World3DReturnContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(RETURN_CONTEXT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<World3DReturnContext>;
    const valid =
      parsed.source === "3d" &&
      Boolean(parsed.realmId) &&
      typeof parsed.level === "string" &&
      typeof parsed.districtId === "string" &&
      typeof parsed.week === "number" &&
      typeof parsed.spawnPointId === "string" &&
      parsed.returnHref?.startsWith("/") &&
      typeof parsed.createdAt === "number" &&
      Date.now() - parsed.createdAt <= RETURN_CONTEXT_MAX_AGE_MS;

    if (!valid) {
      clearWorld3DReturnContext();
      return null;
    }
    return parsed as World3DReturnContext;
  } catch {
    clearWorld3DReturnContext();
    return null;
  }
}

export function clearWorld3DReturnContext() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(RETURN_CONTEXT_KEY);
  } catch {
    /* no-op — storage unavailable */
  }
}

function contextMatchesWeek(
  context: World3DReturnContext,
  input: { realmId: CanonicalRealmId; level: string; week: number },
) {
  return context.realmId === input.realmId && context.level === input.level && context.week === input.week;
}

export function preserveWorld3DReturnContextForLesson(input: {
  realmId: CanonicalRealmId;
  level: string;
  week: number;
  lessonNumber: number;
  lessonId: string;
}) {
  const context = readWorld3DReturnContext();
  if (!context || !contextMatchesWeek(context, input)) return;
  writeWorld3DReturnContext({
    ...context,
    activity: {
      activityType: "lesson",
      lessonNumber: input.lessonNumber,
      lessonId: input.lessonId,
    },
  });
}

export function preserveWorld3DReturnContextForQuiz(input: {
  realmId: CanonicalRealmId;
  level: string;
  week: number;
}) {
  const context = readWorld3DReturnContext();
  if (!context || !contextMatchesWeek(context, input)) return;
  writeWorld3DReturnContext({ ...context, activity: { activityType: "quiz" } });
}

export function getWorld3DReturnPathForWeek(input: {
  realmId: CanonicalRealmId;
  level: string;
  week: number;
}) {
  const context = readWorld3DReturnContext();
  if (!context || !contextMatchesWeek(context, input)) return null;
  return context.returnHref;
}

export function getWorld3DReturnPathForLesson(input: {
  realmId: CanonicalRealmId;
  level: string;
  week: number;
  lessonNumber: number;
  lessonId: string;
}) {
  const context = readWorld3DReturnContext();
  if (!context || !contextMatchesWeek(context, input)) return null;
  if (context.activity?.activityType !== "lesson") return null;
  if (context.activity.lessonNumber !== input.lessonNumber) return null;
  if (context.activity.lessonId !== input.lessonId) return null;
  return context.returnHref;
}

export function getWorld3DReturnPathForQuiz(input: {
  realmId: CanonicalRealmId;
  level: string;
  week: number;
}) {
  const context = readWorld3DReturnContext();
  if (!context || !contextMatchesWeek(context, input)) return null;
  if (context.activity?.activityType !== "quiz") return null;
  return context.returnHref;
}

export function getWorld3DReturnPathForPosttest(input: {
  realmId: CanonicalRealmId;
  level: string;
}) {
  const context = readWorld3DReturnContext();
  if (!context || context.realmId !== input.realmId || context.level !== input.level) return null;
  if (context.activity?.activityType !== "posttest") return null;
  return context.returnHref;
}
