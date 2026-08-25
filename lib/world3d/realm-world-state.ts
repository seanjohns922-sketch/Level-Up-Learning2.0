"use client";

import { readProgress, type ProgressRealmScope } from "@/data/progress";
import { buildLessonId, buildLessonRoute } from "@/lib/lesson-routing";
import {
  getPlayableWeeks,
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
  readProgramStore,
} from "@/lib/program-progress";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { resolveCanonicalNextActivity } from "@/lib/canonical-next-activity";

export type RealmWorldGateState = "locked" | "available" | "current" | "completed";

export type RealmWorldDistrictDefinition = {
  id: string;
  label: string;
  weeks: readonly number[];
  accent: string;
  motif: string;
};

export type RealmWorldDistrict = Omit<RealmWorldDistrictDefinition, "weeks"> & {
  weeks: number[];
  weekRangeLabel: string;
  state: RealmWorldGateState;
  spawnPointId: string;
};

export type RealmWorldWeekNode = {
  id: string;
  label: string;
  week: number;
  districtId: string;
  route: string;
  state: RealmWorldGateState;
  spawnPointId: string;
  nextActivityType: "lesson" | "quiz";
  lessonNumber?: number;
  lessonId?: string;
};

export type RealmWorldState = {
  realmId: ProgressRealmScope;
  level: RealmLevelId;
  currentWeek: number;
  currentDistrictId: string;
  playableWeeks: number[];
  completedWeeks: number[];
  districts: RealmWorldDistrict[];
  weekNodes: RealmWorldWeekNode[];
  nextActivity: {
    label: string;
    route: string;
    gateId: string;
    spawnPointId: string;
  };
};

function rangeLabel(weeks: readonly number[]) {
  return weeks.length === 1 ? `Week ${weeks[0]}` : `Weeks ${weeks[0]}-${weeks[weeks.length - 1]}`;
}

function stateForWeek(input: {
  week: number;
  currentWeek: number;
  playableWeeks: number[];
  completedWeeks: number[];
}): RealmWorldGateState {
  if (input.completedWeeks.includes(input.week)) return "completed";
  if (input.week === input.currentWeek) return "current";
  if (input.playableWeeks.includes(input.week)) return "available";
  return "locked";
}

function stateForDistrict(input: {
  weeks: readonly number[];
  currentWeek: number;
  playableWeeks: number[];
  completedWeeks: number[];
}): RealmWorldGateState {
  if (input.weeks.every((week) => input.completedWeeks.includes(week))) return "completed";
  if (input.weeks.includes(input.currentWeek)) return "current";
  if (input.weeks.some((week) => input.playableWeeks.includes(week))) return "available";
  return "locked";
}

export function getRealmWorldState(input: {
  realmId: ProgressRealmScope;
  level: RealmLevelId;
  totalWeeks: number;
  districts: readonly RealmWorldDistrictDefinition[];
  preview?: boolean;
}): RealmWorldState {
  const progress = readProgress(input.realmId);
  const store = readProgramStore();
  const levelCode = input.level === "Prep" ? "prep" : `l${input.level.replace(/\D/g, "")}`;
  const currentWeek = getRecommendedAssignedWeek(
    store,
    input.level,
    progress?.assignedWeek,
    progress?.requiredWeeks,
    input.realmId,
    progress?.teacherAdvancedWeeks,
  );
  const playableWeeks = getPlayableWeeks(
    store,
    input.level,
    progress?.requiredWeeks,
    progress?.optionalWeeks,
    input.realmId,
    progress?.teacherAdvancedWeeks,
    progress?.assignedWeek,
  );
  const completedWeeks = Array.from({ length: input.totalWeeks }, (_, index) => index + 1).filter((week) =>
    isWeekComplete(getWeekProgress(store, input.level, week, input.realmId)),
  );
  const withPreview = (route: string) => {
    if (!input.preview) return route;
    return `${route}${route.includes("?") ? "&" : "?"}teacher_preview=1`;
  };
  const districts = input.districts.map((district) => ({
    ...district,
    weeks: [...district.weeks],
    weekRangeLabel: rangeLabel(district.weeks),
    state: stateForDistrict({ weeks: district.weeks, currentWeek, playableWeeks, completedWeeks }),
    spawnPointId: `${input.realmId}-${levelCode}-${district.id}-return`,
  }));
  const currentDistrictId = districts.find((district) => district.weeks.includes(currentWeek))?.id ?? districts[0].id;
  const weekNodes = districts.flatMap((district) => district.weeks.map((week) => {
    const progressForWeek = getWeekProgress(store, input.level, week, input.realmId);
    const firstOpenLessonNumber = [1, 2, 3].find((lessonNumber) => {
      if (progressForWeek.lessonsCompleted[lessonNumber - 1]) return false;
      return lessonNumber === 1 || progressForWeek.lessonsCompleted[lessonNumber - 2];
    }) ?? 1;
    const nextActivityType: RealmWorldWeekNode["nextActivityType"] =
      progressForWeek.lessonsCompleted.filter(Boolean).length >= 3 && !progressForWeek.quizCompleted ? "quiz" : "lesson";
    const lessonId = buildLessonId({
      yearLabel: input.level,
      week,
      lessonNumber: firstOpenLessonNumber,
      realmId: input.realmId,
    });
    const state = stateForWeek({ week, currentWeek, playableWeeks, completedWeeks });
    const route = `/program?year=${encodeURIComponent(input.level)}&week=${week}&legacy=1${input.realmId === "number" ? "" : `&realm_id=${encodeURIComponent(input.realmId)}`}`;
    return {
      id: `${input.realmId}-${levelCode}-w${week}-week-gate`,
      label: `Week ${week}`,
      week,
      districtId: district.id,
      route: withPreview(route),
      state: playableWeeks.includes(week) || state === "completed" ? state : "locked",
      spawnPointId: `${input.realmId}-${levelCode}-w${week}-week-gate`,
      nextActivityType,
      lessonNumber: nextActivityType === "lesson" ? firstOpenLessonNumber : undefined,
      lessonId: nextActivityType === "lesson" ? lessonId : undefined,
    } satisfies RealmWorldWeekNode;
  }));
  const currentNode = weekNodes.find((node) => node.week === currentWeek) ?? weekNodes[0];
  const canonicalNext = progress
    ? resolveCanonicalNextActivity({ realmId: input.realmId, progress, store })
    : {
        label: currentNode.nextActivityType === "quiz" ? `Week ${currentWeek} Quiz` : `Week ${currentWeek} Lesson ${currentNode.lessonNumber ?? 1}`,
        route: currentNode.nextActivityType === "quiz"
          ? `/session?year=${encodeURIComponent(input.level)}&week=${currentWeek}&type=quiz&n=1${input.realmId === "number" ? "" : `&realm_id=${encodeURIComponent(input.realmId)}`}`
          : buildLessonRoute({ yearLabel: input.level, week: currentWeek, lessonNumber: currentNode.lessonNumber ?? 1, realmId: input.realmId }),
      };

  return {
    realmId: input.realmId,
    level: input.level,
    currentWeek,
    currentDistrictId,
    playableWeeks,
    completedWeeks,
    districts,
    weekNodes,
    nextActivity: {
      label: canonicalNext.label,
      route: withPreview(canonicalNext.route),
      gateId: currentNode.id,
      spawnPointId: currentNode.spawnPointId,
    },
  };
}
