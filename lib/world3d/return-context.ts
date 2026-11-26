"use client";

import { getRealmDefinition, type CanonicalRealmId } from "@/lib/realms/realm-registry";
import { LEVEL8_LIVE, level8StrongholdHref } from "@/lib/level8-release";
import { isLevel8Realm } from "@/lib/level8-config";

const RETURN_CONTEXT_KEY = "lul:world3d:return-context:v2";
const RETURN_CONTEXT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
// Each realm's 3D world, remembered on this device once a student has entered it,
// so "back" keeps them in 3D across new tabs and days instead of dropping to 2D.
const REALM_HOMES_KEY = "lul:world3d:realm-homes:v1";
const REALM_HOME_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

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
  try {
    rememberRealmHome(context);
  } catch {
    /* no-op — entry proceeds without a remembered return path */
  }
}

type RealmHome = { level: string; href: string; savedAt: number };

/** The realm's 3D world without the district spawn, keeping preview and level. */
function realmWorldHref(returnHref: string) {
  try {
    const url = new URL(returnHref, "https://reliq.local");
    const kept = new URLSearchParams();
    for (const key of ["teacher_preview", "level"]) {
      const value = url.searchParams.get(key);
      if (value) kept.set(key, value);
    }
    const query = kept.toString();
    return `${url.pathname}${query ? `?${query}` : ""}`;
  } catch {
    return returnHref;
  }
}

function readRealmHomes(): Record<string, RealmHome> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REALM_HOMES_KEY) ?? "{}") as Record<string, RealmHome>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function rememberRealmHome(context: World3DReturnContext) {
  if (typeof window === "undefined") return;
  try {
    const homes = readRealmHomes();
    homes[context.realmId] = { level: context.level, href: realmWorldHref(context.returnHref), savedAt: Date.now() };
    window.localStorage.setItem(REALM_HOMES_KEY, JSON.stringify(homes));
  } catch {
    /* no-op — storage unavailable */
  }
}

/** The realm's 3D world when this student has played it on this device recently. */
function rememberedRealmHome(realmId: CanonicalRealmId, level: string) {
  const home = readRealmHomes()[realmId];
  if (!home || typeof home.href !== "string" || !home.href.startsWith("/world/")) return null;
  if (home.level !== level || Date.now() - home.savedAt > REALM_HOME_MAX_AGE_MS) return null;
  return home.href;
}

/** A realm's 3D world for a level. Levels 7 and 8 live in the 3D Expedition; a Level 8 student goes to their stronghold. */
export function realm3DWorldHref(realmId: CanonicalRealmId, level: string | null | undefined, preview = false) {
  if (level === "Year 8" && !preview && LEVEL8_LIVE && isLevel8Realm(realmId)) return level8StrongholdHref(realmId);
  const params = new URLSearchParams();
  let pathname = `/world/${getRealmDefinition(realmId).slug}`;
  if (level === "Year 7" || level === "Year 8") {
    pathname = "/world/expedition";
    params.set("realm", realmId);
  } else if (level) {
    params.set("level", level);
  }
  if (preview) params.set("teacher_preview", "1");
  const query = params.toString();
  return `${pathname}${query ? `?${query}` : ""}`;
}

/** Where "back" goes for this realm when it isn't the exact activity left from 3D:
 * the same realm's 3D world (from this visit, remembered on this device, or fresh). */
function realmFallback(context: World3DReturnContext | null, input: { realmId: CanonicalRealmId; level: string }) {
  if (context && context.realmId === input.realmId && context.level === input.level) return realmWorldHref(context.returnHref);
  return rememberedRealmHome(input.realmId, input.level) ?? realm3DWorldHref(input.realmId, input.level);
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
  if (!context || !contextMatchesWeek(context, input)) return realmFallback(context, input);
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
  if (!context || !contextMatchesWeek(context, input)) return realmFallback(context, input);
  if (context.activity?.activityType !== "lesson") return realmFallback(context, input);
  if (context.activity.lessonNumber !== input.lessonNumber) return realmFallback(context, input);
  if (context.activity.lessonId !== input.lessonId) return realmFallback(context, input);
  return context.returnHref;
}

export function getWorld3DReturnPathForQuiz(input: {
  realmId: CanonicalRealmId;
  level: string;
  week: number;
}) {
  const context = readWorld3DReturnContext();
  if (!context || !contextMatchesWeek(context, input)) return realmFallback(context, input);
  if (context.activity?.activityType !== "quiz") return realmFallback(context, input);
  return context.returnHref;
}

export function getWorld3DReturnPathForPosttest(input: {
  realmId: CanonicalRealmId;
  level: string;
}) {
  const context = readWorld3DReturnContext();
  if (!context || context.realmId !== input.realmId || context.level !== input.level) return realmFallback(context, input);
  if (context.activity?.activityType !== "posttest") return realmFallback(context, input);
  return context.returnHref;
}

/** Where a student goes when their level is not one this realm's 3D world builds:
 * Levels 7 and 8 continue in the Expedition, anything else returns to the Tower. */
export function realmOutside3DHref(realmId: CanonicalRealmId, level: string | null | undefined, preview = false) {
  if (level === "Year 7" || level === "Year 8") return realm3DWorldHref(realmId, level, preview);
  return preview ? "/world/tower?teacher_preview=1" : "/world/tower";
}
