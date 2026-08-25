"use client";

import { readProgress } from "@/data/progress";
import {
  getPlayableWeeks,
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
  readProgramStore,
} from "@/lib/program-progress";
import { buildLessonId, buildLessonRoute } from "@/lib/lesson-routing";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { isNumberNexusLevel } from "@/lib/number-nexus-visuals";
import { resolveCanonicalNextActivity } from "@/lib/canonical-next-activity";

export type WorldGateState = "locked" | "available" | "current" | "completed";
export type WorldDistrictState = "locked" | "available" | "current" | "completed";

export type NumberNexusLevel3District = {
  id: string;
  label: string;
  weekRangeLabel: string;
  weeks: number[];
  state: WorldDistrictState;
  spawnPointId: string;
};

export type NumberNexusLevel3LessonGate = {
  id: string;
  label: string;
  week: number;
  lessonNumber: number;
  lessonId: string;
  route: string;
  state: WorldGateState;
  spawnPointId: string;
};

export type NumberNexusLevel3WeekNode = {
  id: string;
  label: string;
  week: number;
  districtId: string;
  route: string;
  state: WorldGateState;
  spawnPointId: string;
  nextActivityType: "lesson" | "quiz";
  lessonNumber?: number;
  lessonId?: string;
};

export type NumberNexusLevel3WorldState = {
  realmId: "number";
  level: RealmLevelId;
  currentWeek: number;
  currentDistrictId: string;
  playableWeeks: number[];
  completedWeeks: number[];
  currentLesson: number | null;
  districts: NumberNexusLevel3District[];
  weekNodes: NumberNexusLevel3WeekNode[];
  lessonGates: NumberNexusLevel3LessonGate[];
  quizGate: {
    id: string;
    label: string;
    week: number;
    route: string;
    state: WorldGateState;
    spawnPointId: string;
  };
  nextActivity: {
    label: string;
    route: string;
    gateId: string;
    spawnPointId: string;
  };
};

const REALM_ID = "number" as const;

const LEVEL_3_DISTRICTS: Array<{
  id: string;
  label: string;
  weekRangeLabel: string;
  weeks: number[];
  spawnPointId: string;
}> = [
  {
    id: "counting-district",
    label: "Counting District",
    weekRangeLabel: "Weeks 1-3",
    weeks: [1, 2, 3],
    spawnPointId: "district-counting-district",
  },
  {
    id: "number-bridge",
    label: "Number Bridge",
    weekRangeLabel: "Weeks 4-6",
    weeks: [4, 5, 6],
    spawnPointId: "district-number-bridge",
  },
  {
    id: "calculation-core",
    label: "Calculation Core",
    weekRangeLabel: "Weeks 7-9",
    weeks: [7, 8, 9],
    spawnPointId: "district-calculation-core",
  },
  {
    id: "mastery-sector",
    label: "Mastery Sector",
    weekRangeLabel: "Weeks 10-11",
    weeks: [10, 11],
    spawnPointId: "district-mastery-sector",
  },
  {
    id: "legend-tower",
    label: "Legend Tower",
    weekRangeLabel: "Week 12",
    weeks: [12],
    spawnPointId: "district-legend-tower",
  },
];

function gateStateForLesson(args: {
  lessonNumber: number;
  completed: boolean;
  previousCompleted: boolean;
  weekPlayable: boolean;
}): WorldGateState {
  if (args.completed) return "completed";
  if (!args.weekPlayable) return "locked";
  if (args.lessonNumber === 1 || args.previousCompleted) return args.lessonNumber === 1 ? "current" : "available";
  return "locked";
}

function districtStateFor(args: {
  weeks: readonly number[];
  currentWeek: number;
  playableWeeks: number[];
  completedWeeks: number[];
}): WorldDistrictState {
  if (args.weeks.every((week) => args.completedWeeks.includes(week))) return "completed";
  if (args.weeks.includes(args.currentWeek)) return "current";
  if (args.weeks.some((week) => args.playableWeeks.includes(week))) return "available";
  return "locked";
}

function weekStateFor(args: {
  week: number;
  currentWeek: number;
  playableWeeks: number[];
  completedWeeks: number[];
}): WorldGateState {
  if (args.completedWeeks.includes(args.week)) return "completed";
  if (args.week === args.currentWeek) return "current";
  if (args.playableWeeks.includes(args.week)) return "available";
  return "locked";
}

export function getNumberNexusWorldState(options: { preview?: boolean; level?: RealmLevelId } = {}): NumberNexusLevel3WorldState {
  const progress = readProgress(REALM_ID);
  const level = options.level ?? (isNumberNexusLevel(progress?.year) ? progress.year : "Year 3");
  const levelCode = level === "Prep" ? "prep" : `l${level.replace(/\D/g, "")}`;
  const store = readProgramStore();
  const currentWeek = getRecommendedAssignedWeek(
    store,
    level,
    progress?.assignedWeek,
    progress?.requiredWeeks,
    REALM_ID,
    progress?.teacherAdvancedWeeks,
  );
  const playableWeeks = getPlayableWeeks(
    store,
    level,
    progress?.requiredWeeks,
    progress?.optionalWeeks,
    REALM_ID,
    progress?.teacherAdvancedWeeks,
    progress?.assignedWeek,
  );
  const weekProgress = getWeekProgress(store, level, currentWeek, REALM_ID);
  const weekPlayable = playableWeeks.includes(currentWeek);
  const completedWeeks = Array.from({ length: 12 }, (_, index) => index + 1).filter((week) =>
    isWeekComplete(getWeekProgress(store, level, week, REALM_ID)),
  );
  const districts = LEVEL_3_DISTRICTS.map((district) => ({
    ...district,
    weeks: [...district.weeks],
    state: districtStateFor({
      weeks: district.weeks,
      currentWeek,
      playableWeeks,
      completedWeeks,
    }),
  }));
  const currentDistrictId = districts.find((district) => district.weeks.includes(currentWeek))?.id ?? districts[0].id;
  const withPreviewParam = (route: string) => {
    if (!options.preview) return route;
    const separator = route.includes("?") ? "&" : "?";
    return `${route}${separator}teacher_preview=1`;
  };

  const lessonGates = [1, 2, 3].map((lessonNumber) => {
    const lessonId = buildLessonId({ yearLabel: level, week: currentWeek, lessonNumber, realmId: REALM_ID });
    return {
      id: `number-${levelCode}-w${currentWeek}-l${lessonNumber}-gate`,
      label: `Week ${currentWeek} Lesson ${lessonNumber}`,
      week: currentWeek,
      lessonNumber,
      lessonId,
      route: withPreviewParam(buildLessonRoute({ yearLabel: level, week: currentWeek, lessonNumber, realmId: REALM_ID })),
      state: gateStateForLesson({
        lessonNumber,
        completed: weekProgress.lessonsCompleted[lessonNumber - 1] === true,
        previousCompleted: lessonNumber === 1 || weekProgress.lessonsCompleted[lessonNumber - 2] === true,
        weekPlayable,
      }),
      spawnPointId: `number-${levelCode}-w${currentWeek}-l${lessonNumber}-gate`,
    };
  });
  const firstIncompleteLesson = lessonGates.find((gate) => gate.state !== "completed" && gate.state !== "locked");
  const quizUnlocked = weekPlayable && weekProgress.lessonsCompleted.filter(Boolean).length >= 3;
  const quizGate = {
    id: `number-${levelCode}-w${currentWeek}-quiz-gate`,
    label: `Week ${currentWeek} Quiz`,
    week: currentWeek,
    route: withPreviewParam(`/session?year=${encodeURIComponent(level)}&week=${currentWeek}&type=quiz&n=1`),
    state: weekProgress.quizCompleted || isWeekComplete(weekProgress)
      ? "completed" as const
      : quizUnlocked
      ? "available" as const
      : "locked" as const,
    spawnPointId: `number-${levelCode}-w${currentWeek}-quiz-gate`,
  };
  const nextGate = firstIncompleteLesson ?? (quizGate.state === "available" ? quizGate : lessonGates[0]);
  const weekNodes = districts.flatMap((district) =>
    district.weeks.map((week) => {
      const nodeWeekProgress = getWeekProgress(store, level, week, REALM_ID);
      const nodeWeekPlayable = playableWeeks.includes(week);
      const firstOpenLessonNumber = [1, 2, 3].find((lessonNumber) => {
        if (nodeWeekProgress.lessonsCompleted[lessonNumber - 1] === true) return false;
        return lessonNumber === 1 || nodeWeekProgress.lessonsCompleted[lessonNumber - 2] === true;
      }) ?? 1;
      const lessonsDone = nodeWeekProgress.lessonsCompleted.filter(Boolean).length >= 3;
      const nodeState = weekStateFor({ week, currentWeek, playableWeeks, completedWeeks });
      const nextActivityType: NumberNexusLevel3WeekNode["nextActivityType"] =
        lessonsDone && !nodeWeekProgress.quizCompleted ? "quiz" : "lesson";
      const lessonId = buildLessonId({
        yearLabel: level,
        week,
        lessonNumber: firstOpenLessonNumber,
        realmId: REALM_ID,
      });
      const route = `/program?year=${encodeURIComponent(level)}&week=${week}&legacy=1`;

      return {
        id: `number-${levelCode}-w${week}-week-gate`,
        label: `Week ${week}`,
        week,
        districtId: district.id,
        route: withPreviewParam(route),
        state: nodeWeekPlayable || nodeState === "completed" ? nodeState : "locked",
        spawnPointId: `number-${levelCode}-w${week}-week-gate`,
        nextActivityType,
        lessonNumber: nextActivityType === "lesson" ? firstOpenLessonNumber : undefined,
        lessonId: nextActivityType === "lesson" ? lessonId : undefined,
      };
    }),
  );
  const currentWeekNode = weekNodes.find((node) => node.week === currentWeek);
  const canonicalNext = progress
    ? resolveCanonicalNextActivity({ realmId: REALM_ID, progress, store })
    : { label: nextGate.label, route: nextGate.route.replace(/([?&])teacher_preview=1(?:&|$)/, "$1").replace(/[?&]$/, "") };

  return {
    realmId: REALM_ID,
    level,
    currentWeek,
    currentDistrictId,
    playableWeeks,
    completedWeeks,
    currentLesson: firstIncompleteLesson?.lessonNumber ?? null,
    districts,
    weekNodes,
    lessonGates,
    quizGate,
    nextActivity: {
      label: canonicalNext.label,
      route: withPreviewParam(canonicalNext.route),
      gateId: currentWeekNode?.id ?? nextGate.id,
      spawnPointId: currentWeekNode?.spawnPointId ?? nextGate.spawnPointId,
    },
  };
}

export function getNumberNexusLevel3WorldState(options: { preview?: boolean } = {}): NumberNexusLevel3WorldState {
  return getNumberNexusWorldState({ ...options, level: "Year 3" });
}
