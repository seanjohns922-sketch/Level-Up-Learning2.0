"use client";

import type { ProgressRealmScope } from "@/data/progress";
import { buildLessonId } from "@/lib/lesson-routing";
import { getLastRealm, setLastRealm } from "@/lib/last-realm";
import { getRealmAvailability, resolveRealmEntryRoute } from "@/lib/realm-entry";
import { resolveCanonicalNextActivity } from "@/lib/canonical-next-activity";
import { readProgramStore } from "@/lib/program-progress";
import { getRealmDefinition, isLiveRealmId, tryCanonicalRealmId, type LiveRealmId } from "@/lib/realms/realm-registry";
import {
  lessonResumeHasProgress,
  loadLessonResume,
  loadPretestResume,
  pretestResumeHasProgress,
} from "@/lib/resume-state";
import {
  getActiveStudentIdentity,
  getActiveStudentProfile,
} from "@/lib/studentIdentity";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";

export type ActiveLearningContext = "lesson" | "session" | "pretest" | "posttest";

type ActiveLearningDestination = {
  context: ActiveLearningContext;
  route: string;
  updatedAt: number;
};

const ACTIVE_LEARNING_KEY_VERSION = "active_learning_v1";

function activeLearningKey(studentId: string) {
  return `lul:${studentId}:${ACTIVE_LEARNING_KEY_VERSION}`;
}

function getCurrentStudentId() {
  return getActiveStudentIdentity().studentId;
}

function progressRealmFromRoute(route: string): LiveRealmId {
  const params = new URL(route, "https://level-up-learning.local").searchParams;
  const explicit = tryCanonicalRealmId(params.get("realm_id"));
  if (explicit && isLiveRealmId(explicit)) return explicit;
  return route.startsWith("/starpath") ? "space" : route.startsWith("/measurelands") ? "measurement" : "number";
}

export function rememberActiveLearningDestination(context: ActiveLearningContext) {
  if (typeof window === "undefined") return;
  const studentId = getCurrentStudentId();
  if (!studentId) return;

  try {
    const route = `${window.location.pathname}${window.location.search}`;
    const destination: ActiveLearningDestination = { context, route, updatedAt: Date.now() };
    localStorage.setItem(activeLearningKey(studentId), JSON.stringify(destination));
    setLastRealm(getRealmDefinition(progressRealmFromRoute(route)).portalId);
  } catch {
    // Storage can be unavailable in restricted browser modes; learning remains usable.
  }
}

function readActiveLearningDestination(): ActiveLearningDestination | null {
  if (typeof window === "undefined") return null;
  const studentId = getCurrentStudentId();
  if (!studentId) return null;
  try {
    const raw = localStorage.getItem(activeLearningKey(studentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveLearningDestination>;
    if (!parsed.route?.startsWith("/") || !parsed.context || typeof parsed.updatedAt !== "number") return null;
    return parsed as ActiveLearningDestination;
  } catch {
    return null;
  }
}

function resolveSavedResumeRoute(destination: ActiveLearningDestination | null) {
  if (!destination) return null;
  const url = new URL(destination.route, "https://level-up-learning.local");
  const realmId: ProgressRealmScope = progressRealmFromRoute(destination.route);

  if (destination.context === "pretest") {
    const year = url.searchParams.get("year")?.trim();
    if (!year) return null;
    return pretestResumeHasProgress(loadPretestResume(year, realmId)) ? destination.route : null;
  }

  if (destination.context === "lesson") {
    const lessonId = url.searchParams.get("lessonId")?.trim();
    return lessonId && lessonResumeHasProgress(loadLessonResume(lessonId)) ? destination.route : null;
  }

  if (destination.context === "session" && url.searchParams.get("type") === "lesson") {
    const year = url.searchParams.get("year")?.trim();
    const week = Number(url.searchParams.get("week") ?? "");
    const lessonNumber = Number(url.searchParams.get("n") ?? "1");
    if (!year || !Number.isFinite(week) || week < 1) return null;
    const lessonId = buildLessonId({ yearLabel: year, week, lessonNumber, realmId });
    return lessonResumeHasProgress(loadLessonResume(lessonId)) ? destination.route : null;
  }

  return null;
}

export async function resolveContinueLearningRoute() {
  if (typeof window === "undefined") return "/realms";

  const resumeRoute = resolveSavedResumeRoute(readActiveLearningDestination());
  const studentId = getCurrentStudentId();
  if (resumeRoute && studentId) {
    const resumeRealm: ProgressRealmScope = progressRealmFromRoute(resumeRoute);
    const restored = await restoreStudentStateFromServer(studentId, resumeRealm);
    if (!restored.progress) throw new Error("Canonical progress was not found for the saved activity");
    return resumeRoute;
  }

  const lastRealm = getLastRealm();
  if (!lastRealm) return "/realms";
  const availability = getRealmAvailability(lastRealm);
  if (!availability?.enabled) return "/realms";

  if (!studentId) return "/login";
  const restored = await restoreStudentStateFromServer(studentId, availability.progressRealmId);
  if (!restored.progress) throw new Error("Canonical realm progress was not found");
  const profile = getActiveStudentProfile();
  const entryRoute = resolveRealmEntryRoute({
    realmId: availability.progressRealmId,
    progress: restored.progress,
    fallbackYear: profile?.yearLevel ?? "Year 1",
    introSeen: restored.introSeen,
  });
  if (entryRoute.startsWith("/pretest") || entryRoute === "/home") return entryRoute;
  return resolveCanonicalNextActivity({
    realmId: availability.progressRealmId,
    progress: restored.progress,
    store: readProgramStore(),
  }).route;
}
