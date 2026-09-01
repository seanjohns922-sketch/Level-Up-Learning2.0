import type { StudentProgress } from "@/data/progress";
import { buildLessonRoute } from "@/lib/lesson-routing";
import {
  getRecommendedAssignedWeek,
  getWeekProgress,
  hasCompletedRequiredWeeks,
  type ProgramProgressStore,
} from "@/lib/program-progress";
import { getLastProgramWeek } from "@/lib/program-weeks";
import type { LiveRealmId } from "@/lib/realms/realm-registry";

export type CanonicalNextActivity = {
  type: "lesson" | "quiz" | "posttest" | "realm-complete";
  label: string;
  route: string;
  week?: number;
  lessonNumber?: number;
};

function realmQuery(realmId: LiveRealmId) {
  return realmId === "number" ? "" : `&realm_id=${encodeURIComponent(realmId)}`;
}

export function resolveCanonicalNextActivity(input: {
  realmId: LiveRealmId;
  progress: StudentProgress;
  store: ProgramProgressStore;
}): CanonicalNextActivity {
  const { realmId, progress, store } = input;
  const year = progress.year;
  if (progress.status === "PASSED") {
    return { type: "realm-complete", label: `${year} complete`, route: `/${realmId === "number" ? "number-nexus" : realmId === "measurement" ? "measurelands" : realmId === "space" ? "starpath" : "statistica"}` };
  }

  const requiredWeeks = progress.requiredWeeks ?? [];
  const lastWeek = getLastProgramWeek(realmId);
  const requiredComplete = requiredWeeks.length > 0 && hasCompletedRequiredWeeks(
    store,
    year,
    requiredWeeks,
    realmId,
    progress.teacherAdvancedWeeks,
  );
  const lastWeekProgress = getWeekProgress(store, year, lastWeek, realmId);
  const openPathComplete = requiredWeeks.length === 0 && lastWeekProgress.lessonsCompleted.filter(Boolean).length === 3;
  if (requiredComplete || openPathComplete) {
    return {
      type: "posttest",
      label: `${year} Post-Test`,
      route: `/posttest?year=${encodeURIComponent(year)}${realmQuery(realmId)}`,
    };
  }

  const week = getRecommendedAssignedWeek(
    store,
    year,
    progress.assignedWeek,
    requiredWeeks,
    realmId,
    progress.teacherAdvancedWeeks,
  );
  const weekProgress = getWeekProgress(store, year, week, realmId);
  const lessonNumber = [1, 2, 3].find((candidate) => !weekProgress.lessonsCompleted[candidate - 1]);
  if (lessonNumber != null) {
    return {
      type: "lesson",
      label: `Week ${week} Lesson ${lessonNumber}`,
      route: buildLessonRoute({ yearLabel: year, week, lessonNumber, realmId }),
      week,
      lessonNumber,
    };
  }

  return {
    type: "quiz",
    label: `Week ${week} Quiz`,
    route: `/session?year=${encodeURIComponent(year)}&week=${week}&type=quiz&n=1${realmQuery(realmId)}`,
    week,
  };
}
