import { NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS } from "../numberNexusAssessmentBlueprint";
import { MEASURELANDS_ASSESSMENT_BLUEPRINTS } from "../measurelandsAssessmentBlueprint";
import { STARPATH_ASSESSMENT_BLUEPRINTS } from "../starpathAssessmentBlueprint";
import { STATISTICA_ASSESSMENT_BLUEPRINTS } from "../statisticaAssessmentBlueprint";
import { PATTERN_PEAKS_ASSESSMENT_BLUEPRINTS } from "../patternPeaksAssessmentBlueprint";
import { CHANCE_HOLLOW_ASSESSMENT_BLUEPRINTS } from "../chanceHollowAssessmentBlueprint";
import { AUSTRALIAN_CURRICULUM_V9_PAGES, CURRICULUM_PDF_SHA256 } from "../australianCurriculumV9Catalogue";
import { ASSESSMENT_FORMS, ASSESSMENT_LEVELS, ASSESSMENT_DESIGN_VERSION, type DesignedRealm } from "./assessmentContract";
import { MEASUREMENT_LEVEL_5_SKILL_SLOTS } from "./measurementLevel5";

import { PREP_NUMBER_SLOTS, PREP_MEASUREMENT_SLOTS, PREP_SPACE_SLOTS } from "./prep";

import { DESCRIPTOR_SCOPE_CORRECTIONS, assessmentToolPolicy } from "./curriculumScope";
import { NUMBER_SLOTS } from "./number";
import { MEASUREMENT_SLOTS } from "./measurement";
import { SPACE_SLOTS } from "./space";
import { STATISTICS_SLOTS } from "./statistics";
import { PATTERN_SLOTS } from "./pattern";
import { CHANCE_SLOTS } from "./chance";
import type { SkillSlot } from "./assessmentContract";
const authored: Record<DesignedRealm, Partial<Record<number, readonly SkillSlot[]>>> = {
 number: {0:PREP_NUMBER_SLOTS,...NUMBER_SLOTS}, measurement: {0:PREP_MEASUREMENT_SLOTS,5:MEASUREMENT_LEVEL_5_SKILL_SLOTS,...MEASUREMENT_SLOTS},
 space:{0:PREP_SPACE_SLOTS,...SPACE_SLOTS},statistics:STATISTICS_SLOTS,pattern:PATTERN_SLOTS,chance:CHANCE_SLOTS,
};

type ExistingDescriptor = {
  code: string; description?: string; descriptor?: string; allocation: { pretest: number; posttest: number };
  learningIntentions?: readonly string[]; successCriteria?: readonly string[];
};
type ExistingBlueprint = { level: number; descriptors: readonly ExistingDescriptor[] };
const sources: Record<DesignedRealm, readonly ExistingBlueprint[]> = {
  number: NUMBER_NEXUS_ASSESSMENT_BLUEPRINTS, measurement: MEASURELANDS_ASSESSMENT_BLUEPRINTS,
  space: STARPATH_ASSESSMENT_BLUEPRINTS, statistics: STATISTICA_ASSESSMENT_BLUEPRINTS,
  pattern: PATTERN_PEAKS_ASSESSMENT_BLUEPRINTS, chance: CHANCE_HOLLOW_ASSESSMENT_BLUEPRINTS,
};

/** Design inventory. No legacy "approved" flag is treated as five-form release approval. */
export const PROGRAM_ASSESSMENT_BLUEPRINTS = (Object.keys(ASSESSMENT_LEVELS) as DesignedRealm[]).flatMap(realm =>
  ASSESSMENT_LEVELS[realm].map(level => {
    const existing = sources[realm].find(b => b.level === level);
    if (!existing) throw new Error(`Missing curriculum blueprint: ${realm} ${level}`);
    const skillSlots = (authored[realm][level] ?? []).map(slot=>({...slot,tools:assessmentToolPolicy(slot.descriptor)}));
    const countBy = (key: "cognitiveDemand" | "expectedDifficulty" | "response") => Object.fromEntries([...new Set(skillSlots.map(s=>s[key]))].map(value=>[value,skillSlots.filter(s=>s[key]===value).length]));
    return {
      id: `${realm}-${level}`, realm, level, version: ASSESSMENT_DESIGN_VERSION,
      status: "blueprint-drafted" as const, calibration: "uncalibrated" as const,
      sourcePdfSha256: CURRICULUM_PDF_SHA256,
      forms: ASSESSMENT_FORMS.map(kind => ({ kind, questionCount: 20, maximumScore: 20, slotIds: skillSlots.map(s=>s.id), cognitiveProfile:countBy("cognitiveDemand"), difficultyProfile:countBy("expectedDifficulty"), responseProfile:countBy("response") })),
      descriptors: existing.descriptors.map(d => ({
        code: d.code, description: DESCRIPTOR_SCOPE_CORRECTIONS[d.code] ?? d.description ?? d.descriptor ?? d.code,
        sourcePages: AUSTRALIAN_CURRICULUM_V9_PAGES[d.code] ?? [],
        itemsPerForm: d.allocation.pretest,
        legacyPostAllocation: d.allocation.posttest,
        sourceLearningIntentions: [...(d.learningIntentions ?? []), ...(d.successCriteria ?? [])],
        evidenceRequirements: skillSlots.filter(slot=>slot.descriptor===d.code).map(slot=>slot.evidence),
        evidenceReview: "source-scope-reviewed; authored-form-evidence-pending" as const,
      })),
      // Complete authored slots take precedence over historical form metadata.
      skillSlots,
      releaseEvidence: [] as string[],
    };
  }),
);

export function curriculumAssessmentOwnership(code: string) {
  if (code === "AC9MFST01") return { scope: "excluded-by-program-scope", owners: [], note: "Prep assessment/progression focuses on Number, Measurement and Space. This descriptor is not scored as zero." };
  const owners = PROGRAM_ASSESSMENT_BLUEPRINTS.filter(b => b.descriptors.some(d => d.code === code)).map(b => b.id);
  return { scope: owners.length ? "included" : "unassigned", owners,
    note: owners.length > 1 ? "Shared evidence: preserve the original curriculum strand and prevent duplicate weighting in overall reporting." : "" };
}
