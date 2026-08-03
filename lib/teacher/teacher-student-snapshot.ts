import type { CompatProgressRow } from "@/lib/realm-progress-compat";
import {
  getRealmDefinition,
  requireCanonicalRealmId,
  tryCanonicalRealmId,
  type CanonicalRealmId,
  type RealmRegistryEntry,
} from "@/lib/realms/realm-registry";
import { normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";

export type TeacherPlacementState = "placed" | "not_placed" | "unavailable";
export type TeacherPathway = "placement_pending" | "full" | "targeted" | "level_complete";

export type TeacherStudentSnapshot = {
  studentId: string;
  realmId: CanonicalRealmId;
  realm: RealmRegistryEntry;
  placementState: TeacherPlacementState;
  progress: CompatProgressRow | null;
  currentLevel: string | null;
  currentWeek: number | null;
  pathway: TeacherPathway | null;
  requiredWeeks: number[];
  optionalWeeks: number[];
  lessonAttempts: unknown;
  weeklyQuizAttempts: CompatProgressRow["weekly_quiz_attempts"];
  assessments: NonNullable<CompatProgressRow["assessment_attempts"]>;
  updatedAt: string | null;
};

type ProgressIdentity = {
  student_id: string;
  realm_id?: string | null;
  is_current?: boolean | null;
  updated_at?: string | null;
};

function updatedAtValue(value?: string | null) {
  if (!value) return 0;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function selectCanonicalTeacherProgressRow<T extends ProgressIdentity>(
  studentId: string,
  realmId: string,
  rows: readonly T[],
): T | null {
  const canonicalRealmId = requireCanonicalRealmId(realmId);
  const realmRows = rows.filter(
    (row) =>
      row.student_id === studentId &&
      row.realm_id != null &&
      tryCanonicalRealmId(row.realm_id) === canonicalRealmId,
  );

  const currentRows = realmRows.filter((row) => row.is_current === true);
  const candidates = currentRows.length > 0 ? currentRows : realmRows;
  return [...candidates].sort(
    (a, b) => updatedAtValue(b.updated_at) - updatedAtValue(a.updated_at),
  )[0] ?? null;
}

function parseWeekList(value: unknown, maximum: number | null): number[] {
  let source = value;
  if (typeof source === "string") {
    try {
      source = JSON.parse(source);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(source)) return [];

  return [...new Set(source.map(Number))]
    .filter(
      (week) =>
        Number.isInteger(week) &&
        week > 0 &&
        (maximum == null || week <= maximum),
    )
    .sort((a, b) => a - b);
}

function resolvePathway(
  progress: CompatProgressRow,
  requiredWeeks: number[],
  totalWeeks: number | null,
): TeacherPathway {
  const status = (progress.status ?? "").trim().toUpperCase();
  if (status === "PASSED" || status === "COMPLETED" || status === "COMPLETE") {
    return "level_complete";
  }
  if (progress.placement_complete === false && progress.week == null) {
    return "placement_pending";
  }
  if (totalWeeks != null && requiredWeeks.length > 0 && requiredWeeks.length < totalWeeks) {
    return "targeted";
  }
  return "full";
}

export function buildTeacherStudentSnapshot(input: {
  studentId: string;
  realmId: string;
  progressRows: readonly CompatProgressRow[];
  sourceAvailable?: boolean;
}): TeacherStudentSnapshot {
  const realmId = requireCanonicalRealmId(input.realmId);
  const realm = getRealmDefinition(realmId);
  const sourceAvailable = input.sourceAvailable ?? true;
  const progress = sourceAvailable
    ? selectCanonicalTeacherProgressRow(input.studentId, realmId, input.progressRows)
    : null;

  if (!progress) {
    return {
      studentId: input.studentId,
      realmId,
      realm,
      placementState: sourceAvailable ? "not_placed" : "unavailable",
      progress: null,
      currentLevel: null,
      currentWeek: null,
      pathway: null,
      requiredWeeks: [],
      optionalWeeks: [],
      lessonAttempts: null,
      weeklyQuizAttempts: [],
      assessments: [],
      updatedAt: null,
    };
  }

  const requiredWeeks = parseWeekList(progress.required_weeks, realm.totalWeeks);
  const optionalWeeks = parseWeekList(progress.optional_weeks, realm.totalWeeks);
  const currentWeek =
    Number.isInteger(progress.week) &&
    (progress.week ?? 0) > 0 &&
    (realm.totalWeeks == null || (progress.week ?? 0) <= realm.totalWeeks)
      ? progress.week
      : null;

  return {
    studentId: input.studentId,
    realmId,
    realm,
    placementState: "placed",
    progress,
    currentLevel: normalizeWorkingLevelLabel(progress.year) ?? progress.year ?? null,
    currentWeek,
    pathway: resolvePathway(progress, requiredWeeks, realm.totalWeeks),
    requiredWeeks,
    optionalWeeks,
    lessonAttempts: progress.lesson_attempts ?? null,
    weeklyQuizAttempts: progress.weekly_quiz_attempts ?? [],
    assessments: progress.assessment_attempts ?? [],
    updatedAt: progress.updated_at ?? null,
  };
}

export function getRealmWeekNumbers(realmId: string): number[] {
  const totalWeeks = getRealmDefinition(realmId).totalWeeks;
  return totalWeeks == null
    ? []
    : Array.from({ length: totalWeeks }, (_, index) => index + 1);
}
