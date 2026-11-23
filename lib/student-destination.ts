import { type StudentProgress, isPlacementComplete } from "@/data/progress";
import { buildLessonRoute } from "@/lib/lesson-routing";

export function buildGroundFirstLessonRoute() {
  return buildLessonRoute({ yearLabel: "Prep", week: 1, lessonNumber: 1, realmId: "number" });
}

export function buildDefaultStudentProgress(year: string): StudentProgress {
  return {
    year,
    scorePercent: 0,
    status: "ASSIGNED_PROGRAM",
    placementComplete: false,
    assignedWeek: 1,
    requiredWeeks: [],
    optionalWeeks: [],
    unlockedLegends: [],
  };
}

export function resolveStudentDestination(args: {
  progress: StudentProgress | null | undefined;
  introSeen: boolean;
  fallbackYear?: string | null;
}) {
  const resolvedYear = args.progress?.year?.trim() || args.fallbackYear?.trim() || "Year 1";
  const isGroundLevel = resolvedYear === "Prep";

  if (!args.introSeen) {
    return "/home";
  }

  if (isGroundLevel) {
    // Each Ground realm now resolves its own baseline or existing program.
    return "/world";
  }

  if (!isPlacementComplete(args.progress)) {
    return `/pretest?year=${encodeURIComponent(resolvedYear)}`;
  }

  // After placement, students land in their 3D world. Each realm resolves its
  // own level and resumes or pre-tests from there.
  return "/world";
}
