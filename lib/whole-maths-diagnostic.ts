import {
  AC_DESCRIPTOR_COUNTS_BY_LEVEL,
  AC_PRIMARY_LEVELS,
  AC_STRANDS,
  type AcPrimaryLevel,
  type AcStrand,
} from "@/lib/curriculum/ac-standards";
import type { LiveRealmId } from "@/lib/realms/realm-registry";

export const DIAGNOSTIC_MASTERY = 85;
export const DIAGNOSTIC_FLOOR = 40;
export const DIAGNOSTIC_QUESTIONS_PER_LEVEL = 10;
export const WHOLE_MATHS_WEIGHT_TOTAL = 139;

export type DiagnosticCheckpoint = "start" | "mid" | "end" | "ad_hoc";
export type DiagnosticFlag = "review_support" | "extension_ready_to_bridge" | null;

export type DiagnosticStrandDefinition = {
  strand: AcStrand;
  realmId: LiveRealmId | null;
  available: boolean;
  unavailableReason?: string;
};

const DIAGNOSTIC_STRAND_ORDER: readonly AcStrand[] = [
  "number",
  "measurement",
  "space",
  "statistics",
  "algebra",
  "probability",
];

export const DIAGNOSTIC_STRANDS: readonly DiagnosticStrandDefinition[] =
  DIAGNOSTIC_STRAND_ORDER.map((strandId) => {
    const strand = AC_STRANDS[strandId];
    const realmId: LiveRealmId | null =
      strand.id === "number" ||
      strand.id === "measurement" ||
      strand.id === "space" ||
      strand.id === "statistics"
        ? strand.id
        : null;
    return realmId
      ? { strand: strand.id, realmId, available: true }
      : {
          strand: strand.id,
          realmId: null,
          available: false,
          unavailableReason: `${strand.label} level tests will activate when its realm is released.`,
        };
  });

export const AVAILABLE_DIAGNOSTIC_STRANDS = DIAGNOSTIC_STRANDS.filter(
  (strand): strand is DiagnosticStrandDefinition & { realmId: LiveRealmId; available: true } =>
    strand.available && strand.realmId !== null,
);

export type DiagnosticProbeScore = {
  level: string;
  score: number;
  total: number;
  percent: number;
  curriculumCodes?: string[];
  questionIds?: string[];
};

export type DiagnosticPlacementDecision = {
  measuredLevel: number;
  recommendedLevel: string;
  placementChanged: boolean;
  flag: DiagnosticFlag;
  shouldProbeNext: boolean;
};

export function diagnosticLevelNumber(level: string): number {
  if (level === "Prep" || level === "Foundation") return 0;
  const parsed = Number(level.replace(/\D/g, ""));
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 6) {
    throw new Error(`Unsupported diagnostic level: ${level}`);
  }
  return parsed;
}

export function diagnosticLevelLabel(level: number): string {
  const bounded = Math.max(0, Math.min(6, Math.trunc(level)));
  return bounded === 0 ? "Prep" : `Year ${bounded}`;
}

function measuredLevelForProbe(level: number, percent: number): number {
  if (percent >= DIAGNOSTIC_MASTERY) return Math.min(6, level + 0.9);
  if (percent >= DIAGNOSTIC_FLOOR) {
    const fraction = (percent - DIAGNOSTIC_FLOOR) / (DIAGNOSTIC_MASTERY - DIAGNOSTIC_FLOOR);
    return Math.min(6, level + fraction);
  }
  const fractionBelow = (DIAGNOSTIC_FLOOR - percent) / DIAGNOSTIC_FLOOR;
  return Math.max(0, level - Math.min(0.9, fractionBelow));
}

export function decideDiagnosticPlacement(
  currentLevel: string,
  probes: readonly DiagnosticProbeScore[],
): DiagnosticPlacementDecision {
  if (probes.length === 0) throw new Error("At least one diagnostic probe is required.");
  const current = diagnosticLevelNumber(currentLevel);
  const ordered = [...probes].sort(
    (left, right) => diagnosticLevelNumber(left.level) - diagnosticLevelNumber(right.level),
  );
  const first = ordered[0]!;
  const last = ordered.at(-1)!;
  const firstPercent = first.percent;

  if (firstPercent < DIAGNOSTIC_FLOOR) {
    return {
      measuredLevel: measuredLevelForProbe(current, firstPercent),
      recommendedLevel: currentLevel,
      placementChanged: false,
      flag: "review_support",
      shouldProbeNext: false,
    };
  }

  let lastMastered = current;
  for (const probe of ordered) {
    const level = diagnosticLevelNumber(probe.level);
    if (probe.percent >= DIAGNOSTIC_MASTERY) {
      lastMastered = Math.max(lastMastered, level);
      continue;
    }
    if (probe.percent >= DIAGNOSTIC_FLOOR) {
      return {
        measuredLevel: measuredLevelForProbe(level, probe.percent),
        recommendedLevel: diagnosticLevelLabel(Math.max(current, level)),
        placementChanged: level > current,
        flag: null,
        shouldProbeNext: false,
      };
    }
    return {
      measuredLevel: measuredLevelForProbe(level, probe.percent),
      recommendedLevel: diagnosticLevelLabel(Math.max(current, lastMastered)),
      placementChanged: lastMastered > current,
      flag: "extension_ready_to_bridge",
      shouldProbeNext: false,
    };
  }

  const lastLevel = diagnosticLevelNumber(last.level);
  const nextLevel = Math.min(6, lastLevel + 1);
  return {
    measuredLevel: measuredLevelForProbe(lastLevel, last.percent),
    recommendedLevel: diagnosticLevelLabel(Math.max(current, lastMastered)),
    placementChanged: lastMastered > current,
    flag: null,
    shouldProbeNext: last.percent >= DIAGNOSTIC_MASTERY && nextLevel > lastLevel,
  };
}

export function computeWholeMathsLevel(
  measuredLevels: Partial<Record<AcStrand, number | null>>,
): number | null {
  const strands = Object.values(AC_STRANDS) as Array<(typeof AC_STRANDS)[AcStrand]>;
  if (strands.some((strand) => measuredLevels[strand.id] == null)) return null;
  const reachedPoints = strands.reduce(
    (sum, strand) => sum + curriculumPointsReached(strand.id, measuredLevels[strand.id]!),
    0,
  );
  return wholeMathsLevelForCurriculumPoints(reachedPoints);
}

// A strand level is a position inside that year's curriculum: 3.5 means
// halfway through the Year 3 descriptor load. A level of 4.0 therefore carries
// all descriptors below Year 4, while 4.5 carries half of Year 4. The Level 6
// ceiling represents the completed F-6 continuum because the product has no
// Level 7 primary band.
export function curriculumPointsReached(strand: AcStrand, measuredLevel: number): number {
  if (!Number.isFinite(measuredLevel)) throw new Error("A measured strand level must be finite.");
  const bounded = Math.max(0, Math.min(6, measuredLevel));
  if (bounded === 6) return AC_STRANDS[strand].weight;

  const activeLevel = Math.floor(bounded) as AcPrimaryLevel;
  const completed = AC_PRIMARY_LEVELS
    .filter((level) => level < activeLevel)
    .reduce<number>((sum, level) => sum + AC_DESCRIPTOR_COUNTS_BY_LEVEL[level][strand], 0);
  const fraction = bounded - activeLevel;
  return completed + fraction * AC_DESCRIPTOR_COUNTS_BY_LEVEL[activeLevel][strand];
}

export function wholeMathsLevelForCurriculumPoints(curriculumPoints: number): number {
  if (!Number.isFinite(curriculumPoints)) throw new Error("Curriculum points must be finite.");
  const bounded = Math.max(0, Math.min(WHOLE_MATHS_WEIGHT_TOTAL, curriculumPoints));
  let completedPoints = 0;

  // Levels 0-5 are continuous bands. Level 6 is the reporting ceiling and
  // includes the remaining Year 6 descriptor load.
  for (const level of AC_PRIMARY_LEVELS.slice(0, 6)) {
    const levelPoints = Object.values(AC_DESCRIPTOR_COUNTS_BY_LEVEL[level]).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (bounded <= completedPoints + levelPoints) {
      return Math.round((level + (bounded - completedPoints) / levelPoints) * 100) / 100;
    }
    completedPoints += levelPoints;
  }
  return 6;
}

export function computeReachedCurriculumPoints(
  measuredLevels: Partial<Record<AcStrand, number | null>>,
): number | null {
  const strands = Object.keys(AC_STRANDS) as AcStrand[];
  if (strands.some((strand) => measuredLevels[strand] == null)) return null;
  return Math.round(
    strands.reduce(
      (sum, strand) => sum + curriculumPointsReached(strand, measuredLevels[strand]!),
      0,
    ) * 100,
  ) / 100;
}

export function diagnosticAvailableWeight(): number {
  return AVAILABLE_DIAGNOSTIC_STRANDS.reduce(
    (sum, strand) => sum + AC_STRANDS[strand.strand].weight,
    0,
  );
}
