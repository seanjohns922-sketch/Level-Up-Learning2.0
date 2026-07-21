"use client";

import { readProgress, type ProgressRealmScope } from "@/data/progress";
import { buildLessonId } from "@/lib/lesson-routing";
import { getLastRealm, getLastStarpathRoute, setLastRealm } from "@/lib/last-realm";
import { getRealmAvailability, resolveRealmEntryRoute } from "@/lib/realm-entry";
import { STARPATH_WORLD_ROUTE } from "@/lib/starpath-routes";
import {
  lessonResumeHasProgress,
  loadLessonResume,
  loadPretestResume,
  pretestResumeHasProgress,
} from "@/lib/resume-state";
import {
  getActiveStudentIdentity,
  getActiveStudentProfile,
  hasActiveStudentSeenIntro,
} from "@/lib/studentIdentity";

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

function realmFromRoute(route: string): "number-nexus" | "measurelands" {
  const params = new URL(route, "https://level-up-learning.local").searchParams;
  return params.get("realm_id") === "measurement" ? "measurelands" : "number-nexus";
}

export function rememberActiveLearningDestination(context: ActiveLearningContext) {
  if (typeof window === "undefined") return;
  const studentId = getCurrentStudentId();
  if (!studentId) return;

  try {
    const route = `${window.location.pathname}${window.location.search}`;
    const destination: ActiveLearningDestination = { context, route, updatedAt: Date.now() };
    localStorage.setItem(activeLearningKey(studentId), JSON.stringify(destination));
    setLastRealm(realmFromRoute(route));
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
  const realmId: ProgressRealmScope = url.searchParams.get("realm_id") === "measurement" ? "measurement" : "number";

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

export function resolveContinueLearningRoute() {
  if (typeof window === "undefined") return "/realms";

  const resumeRoute = resolveSavedResumeRoute(readActiveLearningDestination());
  if (resumeRoute) return resumeRoute;

  const lastRealm = getLastRealm();
  if (!lastRealm) return "/realms";
  // Starpath is demo/preview (no saved-progress resume), so send them back to the
  // exact Starpath world they were in rather than a different realm or the Tower.
  if (lastRealm === "starpath-realm") return getLastStarpathRoute() ?? STARPATH_WORLD_ROUTE;
  const availability = getRealmAvailability(lastRealm);
  if (!availability?.enabled) return "/realms";

  const profile = getActiveStudentProfile();
  return resolveRealmEntryRoute({
    realmId: availability.progressRealmId,
    progress: readProgress(availability.progressRealmId),
    fallbackYear: profile?.yearLevel ?? "Year 1",
    introSeen: hasActiveStudentSeenIntro(profile?.studentId),
  });
}
