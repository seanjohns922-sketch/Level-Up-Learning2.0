import { isGroundStarpathLevel, type StarpathLevelId } from "@/lib/starpath-levels";
import { STARPATH_REALM_ID } from "@/lib/starpath-routes";

export type StarpathPlacementSource =
  | "pre_test"
  | "teacher_assigned"
  | "teacher_override"
  | "default";
export type StarpathPlacementStatus =
  | "unplaced"
  | "teacher_assigned"
  | "pre_test_required"
  | "program_ready"
  | "level_complete";
export type StarpathPathway = "unplaced" | "full" | "targeted" | "mastered";
export type StarpathAssessmentStatus = "not_required" | "not_started" | "in_progress" | "completed";
export type StarpathNextLevelStatus = "locked" | "available" | "complete";

export type StarpathPlacement = {
  realmId: typeof STARPATH_REALM_ID;
  studentId: string;
  classId: string | null;
  schoolYear: string | null;
  workingLevel: StarpathLevelId | null;
  source: StarpathPlacementSource;
  status: StarpathPlacementStatus;
  pathway: StarpathPathway;
  assignedWeeks: number[];
  completedWeeks: number[];
  currentWeek: number | null;
  currentLesson: number | null;
  preTestStatus: StarpathAssessmentStatus;
  postTestStatus: StarpathAssessmentStatus;
  levelComplete: boolean;
  nextLevelStatus: StarpathNextLevelStatus;
  createdAt: string | null;
  updatedAt: string | null;
};

export type StarpathTeacherPlacementCommand = {
  realmId: typeof STARPATH_REALM_ID;
  studentId: string;
  classId: string | null;
  workingLevel: StarpathLevelId;
  source: "teacher_assigned" | "teacher_override";
  entryMode: "pre_test" | "direct";
};

export type StarpathPlacementPersistence = "unavailable" | "persistent";

export type StarpathPlacementLoadResult = {
  persistence: StarpathPlacementPersistence;
  placement: StarpathPlacement;
  reason: string | null;
};

export type StarpathShellState =
  | "unplaced"
  | "teacher-assigned"
  | "pre-test-required"
  | "program-ready"
  | "ground-level"
  | "level-complete";

export function createUnplacedStarpathPlacement(input: {
  studentId: string;
  classId?: string | null;
  schoolYear?: string | null;
}): StarpathPlacement {
  return {
    realmId: STARPATH_REALM_ID,
    studentId: input.studentId,
    classId: input.classId ?? null,
    schoolYear: input.schoolYear ?? null,
    workingLevel: null,
    source: "default",
    status: "unplaced",
    pathway: "unplaced",
    assignedWeeks: [],
    completedWeeks: [],
    currentWeek: null,
    currentLesson: null,
    preTestStatus: "not_started",
    postTestStatus: "not_started",
    levelComplete: false,
    nextLevelStatus: "locked",
    createdAt: null,
    updatedAt: null,
  };
}

export function deriveStarpathShellState(placement: StarpathPlacement): StarpathShellState {
  if (!placement.workingLevel || placement.status === "unplaced") return "unplaced";
  if (isGroundStarpathLevel(placement.workingLevel)) return "ground-level";
  if (placement.status === "pre_test_required") return "pre-test-required";
  if (placement.status === "level_complete" || placement.levelComplete) return "level-complete";
  if (placement.status === "program_ready") return "program-ready";
  return "teacher-assigned";
}

export function validateStarpathTeacherPlacement(command: StarpathTeacherPlacementCommand) {
  if (command.realmId !== STARPATH_REALM_ID) throw new Error("Starpath placement requires realm_id=space");
  if (!command.studentId.trim()) throw new Error("Starpath placement requires a student ID");
  if (isGroundStarpathLevel(command.workingLevel) && command.entryMode === "pre_test") {
    throw new Error("Ground Level does not use a Starpath pre-test");
  }
  return command;
}

export function placementRequiresStarpathPreTest(placement: StarpathPlacement) {
  return placement.workingLevel !== null &&
    !isGroundStarpathLevel(placement.workingLevel) &&
    placement.preTestStatus !== "not_required" &&
    placement.status === "pre_test_required";
}
