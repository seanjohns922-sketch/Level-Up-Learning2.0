import {
  createUnplacedStarpathPlacement,
  validateStarpathTeacherPlacement,
  type StarpathPlacementLoadResult,
  type StarpathTeacherPlacementCommand,
} from "@/lib/starpath-placement";

const PERSISTENCE_UNAVAILABLE_REASON =
  "Starpath placement persistence is not available until space-specific database RPCs are deployed.";

export async function loadStarpathPlacement(input: {
  studentId: string;
  classId?: string | null;
  schoolYear?: string | null;
}): Promise<StarpathPlacementLoadResult> {
  return {
    persistence: "unavailable",
    placement: createUnplacedStarpathPlacement(input),
    reason: PERSISTENCE_UNAVAILABLE_REASON,
  };
}

export async function saveStarpathTeacherPlacement(command: StarpathTeacherPlacementCommand): Promise<never> {
  validateStarpathTeacherPlacement(command);
  throw new Error(PERSISTENCE_UNAVAILABLE_REASON);
}
