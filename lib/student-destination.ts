import { type StudentProgress, isPlacementComplete } from "@/data/progress";

export function buildDefaultStudentProgress(year: string): StudentProgress {
  const isGroundLevel = year.trim() === "Prep";
  return {
    year,
    scorePercent: 0,
    status: "ASSIGNED_PROGRAM",
    placementComplete: isGroundLevel,
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
    return "/measurelands";
  }

  if (!isPlacementComplete(args.progress)) {
    return `/pretest?year=${encodeURIComponent(resolvedYear)}`;
  }

  return "/levels";
}
