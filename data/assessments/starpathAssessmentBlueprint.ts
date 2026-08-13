import { getStarpathProgram } from "@/data/starpath/program-registry";
import type { StarpathLevelId } from "@/lib/starpath-levels";
import { STARPATH_MISCONCEPTION_IDS, getStarpathMisconception } from "./starpathMisconceptions";

export type StarpathAssessmentKind = "pretest" | "posttest";
export type StarpathAssessmentLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type StarpathDifficultyBand = "accessible" | "moderate" | "challenging";
export type StarpathCognitiveCategory = "recall" | "understanding" | "application" | "reasoning" | "transfer";
export type StarpathCurriculumMappingStatus = "aligned" | "mapped-unverified" | "missing";

export type StarpathFormBlueprint = {
  kind: StarpathAssessmentKind;
  questionCount: 20;
  passPercent: 85;
  purpose: string;
  difficultyMix: Readonly<Record<StarpathDifficultyBand, number>>;
  cognitiveDemandMix: Readonly<Record<StarpathCognitiveCategory, number>>;
  responseMix: { selectedResponseMaximum: number; constructedOrManipulatedMinimum: number };
  orderingRules: readonly string[];
  scaffoldRules: readonly string[];
};

export type StarpathDescriptorBlueprint = {
  code: string;
  descriptor: string;
  learningIntentions: readonly string[];
  successCriteria: readonly string[];
  allocation: Readonly<Record<StarpathAssessmentKind, number>>;
  difficultyMix: string;
  reasoningMix: string;
  misconceptionIds: readonly string[];
  curriculumMapping: {
    implementationStatus: StarpathCurriculumMappingStatus;
    currentWeeks: readonly number[];
    note: string;
  };
  questionBlueprint: {
    pretestArchetypes: readonly string[];
    posttestArchetypes: readonly string[];
  };
};

export type StarpathLevelAssessmentBlueprint = {
  level: StarpathAssessmentLevel;
  levelId: StarpathLevelId;
  yearLabel: string;
  approvalStatus: "conditionally-approved";
  releaseBlocked: true;
  forms: readonly StarpathFormBlueprint[];
  descriptors: readonly StarpathDescriptorBlueprint[];
};

const ORDERING_RULES = [
  "Spiral descriptor evidence through the form and never place more than 2 items from one descriptor consecutively.",
  "Begin with accessible independent responses, not lesson examples or recognition-only warm-ups.",
  "Distribute reasoning, misconception and transfer evidence throughout the form.",
  "Do not repeat a context, interaction structure, correct-answer position or distinctive visual scaffold consecutively.",
] as const;

const SCAFFOLD_RULES = [
  "Provide only the spatial information required to answer; never display a strategy, defining feature, intermediate move or solution cue.",
  "Count drawing, placing, sorting, constructing, routing and transforming as manipulated responses only when the student produces the answer.",
  "Use selected response only for misconception diagnosis, conceptual comparison, interpretation or evaluation.",
  "Read-aloud must read or neutrally restate the task without naming the target feature, relation, direction, coordinate change or transformation.",
  "Assessment contexts, values, distractors, payloads and visual scaffolds must be independent from lesson and weekly-quiz banks.",
] as const;

const FORM_PROFILES: Record<StarpathAssessmentLevel, Record<StarpathAssessmentKind, Omit<StarpathFormBlueprint, "kind" | "questionCount" | "passPercent" | "purpose" | "orderingRules" | "scaffoldRules"> | null>> = {
  0: { pretest: null, posttest: { difficultyMix: { accessible: 8, moderate: 8, challenging: 4 }, cognitiveDemandMix: { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, responseMix: { selectedResponseMaximum: 10, constructedOrManipulatedMinimum: 10 } } },
  1: { pretest: { difficultyMix: { accessible: 10, moderate: 8, challenging: 2 }, cognitiveDemandMix: { recall: 4, understanding: 7, application: 6, reasoning: 3, transfer: 0 }, responseMix: { selectedResponseMaximum: 8, constructedOrManipulatedMinimum: 12 } }, posttest: { difficultyMix: { accessible: 7, moderate: 8, challenging: 5 }, cognitiveDemandMix: { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, responseMix: { selectedResponseMaximum: 8, constructedOrManipulatedMinimum: 12 } } },
  2: { pretest: { difficultyMix: { accessible: 8, moderate: 9, challenging: 3 }, cognitiveDemandMix: { recall: 3, understanding: 6, application: 7, reasoning: 4, transfer: 0 }, responseMix: { selectedResponseMaximum: 6, constructedOrManipulatedMinimum: 14 } }, posttest: { difficultyMix: { accessible: 6, moderate: 9, challenging: 5 }, cognitiveDemandMix: { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, responseMix: { selectedResponseMaximum: 6, constructedOrManipulatedMinimum: 14 } } },
  3: { pretest: { difficultyMix: { accessible: 7, moderate: 9, challenging: 4 }, cognitiveDemandMix: { recall: 2, understanding: 6, application: 7, reasoning: 4, transfer: 1 }, responseMix: { selectedResponseMaximum: 4, constructedOrManipulatedMinimum: 16 } }, posttest: { difficultyMix: { accessible: 5, moderate: 9, challenging: 6 }, cognitiveDemandMix: { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, responseMix: { selectedResponseMaximum: 4, constructedOrManipulatedMinimum: 16 } } },
  4: { pretest: { difficultyMix: { accessible: 6, moderate: 10, challenging: 4 }, cognitiveDemandMix: { recall: 2, understanding: 5, application: 7, reasoning: 5, transfer: 1 }, responseMix: { selectedResponseMaximum: 3, constructedOrManipulatedMinimum: 17 } }, posttest: { difficultyMix: { accessible: 4, moderate: 9, challenging: 7 }, cognitiveDemandMix: { recall: 1, understanding: 4, application: 7, reasoning: 6, transfer: 2 }, responseMix: { selectedResponseMaximum: 3, constructedOrManipulatedMinimum: 17 } } },
  5: { pretest: { difficultyMix: { accessible: 5, moderate: 10, challenging: 5 }, cognitiveDemandMix: { recall: 1, understanding: 5, application: 7, reasoning: 5, transfer: 2 }, responseMix: { selectedResponseMaximum: 2, constructedOrManipulatedMinimum: 18 } }, posttest: { difficultyMix: { accessible: 3, moderate: 9, challenging: 8 }, cognitiveDemandMix: { recall: 1, understanding: 3, application: 6, reasoning: 7, transfer: 3 }, responseMix: { selectedResponseMaximum: 2, constructedOrManipulatedMinimum: 18 } } },
  6: { pretest: { difficultyMix: { accessible: 4, moderate: 10, challenging: 6 }, cognitiveDemandMix: { recall: 1, understanding: 4, application: 6, reasoning: 6, transfer: 3 }, responseMix: { selectedResponseMaximum: 1, constructedOrManipulatedMinimum: 19 } }, posttest: { difficultyMix: { accessible: 2, moderate: 8, challenging: 10 }, cognitiveDemandMix: { recall: 0, understanding: 3, application: 6, reasoning: 7, transfer: 4 }, responseMix: { selectedResponseMaximum: 1, constructedOrManipulatedMinimum: 19 } } },
};

const LEVEL_IDS: Record<StarpathAssessmentLevel, StarpathLevelId> = { 0: "ground", 1: "level-1", 2: "level-2", 3: "level-3", 4: "level-4", 5: "level-5", 6: "level-6" };

function form(level: StarpathAssessmentLevel, kind: StarpathAssessmentKind): StarpathFormBlueprint | null {
  const profile = FORM_PROFILES[level][kind];
  if (!profile) return null;
  return {
    kind,
    questionCount: 20,
    passPercent: 85,
    purpose: kind === "pretest"
      ? "Diagnose independent entry knowledge without familiarity or lesson-scaffold inflation."
      : "Demonstrate independent mastery through spatial construction, application, reasoning and transfer.",
    ...profile,
    orderingRules: ORDERING_RULES,
    scaffoldRules: SCAFFOLD_RULES,
  };
}

function descriptor(
  level: StarpathAssessmentLevel,
  code: string,
  allocation: number,
  learningIntentions: readonly string[],
  successCriteria: readonly string[],
  misconceptionIds: readonly string[],
  pretestArchetypes: readonly string[],
  posttestArchetypes: readonly string[],
): StarpathDescriptorBlueprint {
  const program = getStarpathProgram(LEVEL_IDS[level]);
  const source = program.descriptors.find((item) => item.code === code);
  if (!source) throw new Error(`${program.yearLabel} is missing ${code}.`);
  const currentWeeks = program.weeks.filter((week) => week.descriptorCodes.includes(code)).map((week) => week.week);
  const curriculumAudited = level === 2 || level === 3 || level === 4 || level === 5;
  return {
    code,
    descriptor: source.text,
    learningIntentions,
    successCriteria,
    allocation: { pretest: level === 0 ? 0 : allocation, posttest: allocation },
    difficultyMix: "Items must span the form-level difficulty bands and must not repeat one familiar procedure or visual arrangement.",
    reasoningMix: "Selected items diagnose misconceptions; manipulated items require the student to construct, place, move, transform or explain spatial evidence independently.",
    misconceptionIds,
    curriculumMapping: {
      implementationStatus: curriculumAudited ? "aligned" : "mapped-unverified",
      currentWeeks,
      note: curriculumAudited
        ? `Aligned to audited Starpath Weeks ${currentWeeks.join(", ")}; all 24 lessons and seven independent weekly quizzes passed Level ${level} curriculum validation.`
        : `Mapped to Starpath Weeks ${currentWeeks.join(", ")}; full lesson and weekly-quiz coverage must pass before independent-bank authoring.`,
    },
    questionBlueprint: { pretestArchetypes: level === 0 ? [] : pretestArchetypes, posttestArchetypes },
  };
}

type DescriptorDefinition = [
  code: string,
  allocation: number,
  learningIntentions: readonly string[],
  successCriteria: readonly string[],
  misconceptionIds: readonly string[],
  pretestArchetypes: readonly string[],
  posttestArchetypes: readonly string[],
];

const BLUEPRINT_DEFINITIONS: Array<{
  level: StarpathAssessmentLevel;
  allocations: DescriptorDefinition[];
}> = [
  { level: 0, allocations: [
    ["AC9MFSP01", 10, ["Recognise, name, sort and create familiar shapes.", "Find familiar shapes within environmental objects and give a simple reason."], ["I can create or sort familiar shapes using visible features.", "I can identify a shape in an object and show why it matches."], ["shape-orientation-invariance", "shape-colour-size", "shape-in-object", "classification-single-rule"], ["Create a familiar shape or picture from an unfamiliar palette.", "Sort shapes and select or record the feature used."], ["Construct a picture meeting two shape conditions.", "Find a shape in a new object and give a visual reason.", "Repair a flawed shape classification."]],
    ["AC9MFSP02", 10, ["Describe the position and location of themselves and objects relative to named people and objects.", "Interpret and create relative positions within familiar spaces."], ["I can say where a person or object is using a clear reference.", "I can place a person or object in a stated relative position."], ["position-without-reference", "viewpoint-left-right"], ["Place a person or object in a stated relative position.", "Select the scene that matches a relative-position description."], ["Build a small scene from relative-position instructions.", "Record a position using a word or oral choice after constructing it.", "Interpret several location clues that use named references."]],
  ] },
  { level: 1, allocations: [
    ["AC9M1SP01", 12, ["Make, compare and classify familiar shapes and environmental objects.", "Identify similarities and differences that remain after size, colour or orientation changes."], ["I can construct a closed familiar shape.", "I can classify the same collection in more than one valid way and explain the rule."], ["shape-orientation-invariance", "shape-colour-size", "shape-feature-count", "shape-in-object", "classification-single-rule"], ["Construct or repair a familiar shape.", "Sort objects by a stated feature."], ["Create two valid classifications for one collection.", "Build a shape and identify a similarity and difference.", "Diagnose a classification that relies on colour rather than shape."]],
    ["AC9M1SP02", 8, ["Give and follow ordered directions within a space.", "Create, test and repair routes from a stated starting position."], ["I can author directions another person could follow.", "I can find and repair a route step while preserving the destination and constraints."], ["viewpoint-left-right", "route-start-order", "route-destination-only"], ["Follow a short route from a marked start.", "Add a missing instruction to reach a goal."], ["Construct a route satisfying a checkpoint condition.", "Repair one incorrect move and explain the change.", "Write or record a complete route for another navigator."]],
  ] },
  { level: 2, allocations: [
    ["AC9M2SP01", 10, ["Recognise, compare and classify shapes using sides and spatial terms.", "Use straight, curved, opposite and parallel accurately."], ["I can classify unfamiliar orientations using their boundaries.", "I can compare two shapes with correct feature language."], ["shape-orientation-invariance", "shape-feature-count", "classification-single-rule", "straight-curved-boundary", "parallel-opposite-confusion"], ["Mark straight and curved boundaries on a shape.", "Sort shapes by side and edge properties."], ["Construct a shape meeting stated side conditions.", "Compare two unfamiliar shapes and record a valid reason.", "Diagnose an incorrect parallel or opposite claim."]],
    ["AC9M2SP02", 10, ["Locate features in two-dimensional representations of familiar spaces.", "Follow and give pathways using map evidence."], ["I can locate a feature from a map and describe its position.", "I can construct or record a pathway that another person can follow."], ["viewpoint-left-right", "route-start-order", "route-destination-only", "map-symbol-representation", "map-viewpoint", "map-relative-location"], ["Locate a named feature using an unfamiliar map key.", "Follow a pathway and place the endpoint."], ["Author a route between two landmarks.", "Place a missing landmark from two clues.", "Diagnose a route that reaches the goal but breaks a condition."]],
  ] },
  { level: 3, allocations: [
    ["AC9M3SP01", 8, ["Make, compare and classify objects by key spatial features.", "Connect faces, edges and vertices with suitability for use."], ["I can build or classify an object from feature constraints.", "I can justify why an object's features suit a purpose."], ["object-feature-vocabulary", "object-use-without-features"], ["Build or select an object from feature information.", "Compare two objects using faces, edges and vertices."], ["Construct an object meeting several feature constraints.", "Choose an object for a purpose and record the spatial reason.", "Compare possible objects and justify which spatial features best suit a purpose."]],
    ["AC9M3SP02", 12, ["Interpret and create two-dimensional representations of familiar environments.", "Locate landmarks relative to one another and make a readable map."], ["I can use a key to interpret an unfamiliar map.", "I can create a map satisfying relative-location clues and use it to navigate."], ["map-symbol-representation", "map-viewpoint", "map-relative-location", "route-start-order"], ["Interpret a map key and locate related landmarks.", "Place landmarks from simple relative clues."], ["Create a readable map from several constraints.", "Navigate between landmarks using the completed representation.", "Diagnose and repair a map that violates one clue."]],
  ] },
  { level: 4, allocations: [
    ["AC9M4SP01", 7, ["Represent and approximate composite shapes and objects using familiar components.", "Compare alternative decompositions and infer hidden structure."], ["I can create a composite representation from constraints.", "I can explain what an approximation includes, omits or cannot prove."], ["object-view-consistency", "composite-decomposition", "approximation-as-exact"], ["Compose a target form from familiar components.", "Identify a missing or hidden component from views."], ["Create two valid decompositions of one form.", "Improve a flawed approximation and justify the change.", "Coordinate front, side and top evidence."]],
    ["AC9M4SP02", 6, ["Create and interpret grid reference systems.", "Use grid references and directions to locate and describe pathways."], ["I can construct and label a valid grid reference system.", "I can author an unambiguous grid-referenced pathway."], ["grid-reference-coordinate-order", "grid-path-reference", "route-destination-only"], ["Locate cells and landmarks from grid references.", "Complete a pathway using references and directions."], ["Create a grid and place landmarks from references.", "Write a pathway for another navigator.", "Repair a route containing a reference error."]],
    ["AC9M4SP03", 7, ["Recognise and test line and rotational symmetry.", "Create symmetrical patterns and pictures."], ["I can construct and test a reflection across a stated line.", "I can create rotational symmetry and identify its matching turns."], ["line-symmetry-visual-balance", "rotational-line-symmetry", "transformation-reference"], ["Complete a reflected half across a stated line.", "Test a figure at marked rotations."], ["Construct line symmetry including a diagonal line.", "Create a rotationally symmetric pattern and record matching turns.", "Diagnose a visually balanced but non-symmetric design."]],
  ] },
  { level: 5, allocations: [
    ["AC9M5SP01", 7, ["Connect objects to nets and build objects from nets.", "Use face adjacency and orientation to test and refine nets."], ["I can construct a valid net and predict how it folds.", "I can justify face relationships after folding."], ["net-face-count", "net-adjacency-fold", "object-view-consistency"], ["Match an object and net using face evidence.", "Track a labelled face through a fold."], ["Create and test a valid net.", "Repair an overlapping or incorrectly adjacent net.", "Compare two valid nets for the same object."]],
    ["AC9M5SP02", 6, ["Construct and use a grid coordinate system.", "Describe position and movement with coordinates and directional language."], ["I can establish axes, origin, scale and coordinate order.", "I can plot, move and describe points consistently."], ["coordinate-order-scale", "coordinate-movement-change", "route-destination-only"], ["Build axes and plot stated coordinates.", "Describe one coordinate movement."], ["Construct a coordinate system for supplied data.", "Plan and record a constrained coordinate route.", "Diagnose swapped coordinates or inconsistent scale."]],
    ["AC9M5SP03", 7, ["Describe and perform translations, reflections and rotations.", "Recognise invariant features and resulting symmetries."], ["I can construct an image under a stated transformation.", "I can explain what changed and what remained invariant."], ["transformation-invariants", "transformation-reference", "coordinate-movement-change"], ["Perform one stated transformation.", "Identify invariants from an original and image."], ["Construct a reflection or rotation using its reference.", "Compare transformations and justify the classification.", "Repair an image that violates one invariant."]],
  ] },
  { level: 6, allocations: [
    ["AC9M6SP01", 6, ["Compare parallel cross-sections of objects.", "Use section behaviour to recognise relationships to right prisms."], ["I can predict and construct a cross-section from a stated cut.", "I can use a sequence of sections to justify whether an object behaves like a right prism."], ["cross-section-face", "parallel-sections-congruent"], ["Predict a section from cut direction and position.", "Compare a short sequence of parallel sections."], ["Construct sections for an unfamiliar object.", "Infer object structure from changing sections.", "Diagnose the claim that all parallel sections are congruent."]],
    ["AC9M6SP02", 6, ["Locate points in all four quadrants of a Cartesian plane.", "Describe coordinate changes when points move."], ["I can plot and record signed ordered pairs, including axis points.", "I can infer and reverse a coordinate movement rule."], ["coordinate-order-scale", "coordinate-movement-change", "quadrant-sign"], ["Plot points across four quadrants.", "Describe an axis-aligned coordinate change."], ["Construct a multi-quadrant path from constraints.", "Infer a movement rule from original and image points.", "Diagnose sign, axis or coordinate-order errors."]],
    ["AC9M6SP03", 8, ["Use ordered combinations of transformations.", "Create and justify tessellations and geometric patterns."], ["I can construct a transformation chain in order.", "I can create a tessellation with no gaps or overlaps and describe its transformations."], ["transformation-invariants", "transformation-reference", "transformation-order", "tessellation-gap-overlap"], ["Apply a two-step transformation chain.", "Test whether a pattern tessellates."], ["Create and describe a tessellation from a transformation rule.", "Compare reversed transformation sequences.", "Repair a pattern with a gap, overlap or broken invariant."]],
  ] },
];

export const STARPATH_ASSESSMENT_BLUEPRINTS: readonly StarpathLevelAssessmentBlueprint[] = BLUEPRINT_DEFINITIONS.map(({ level, allocations }) => {
  const program = getStarpathProgram(LEVEL_IDS[level]);
  return {
    level,
    levelId: LEVEL_IDS[level],
    yearLabel: program.yearLabel,
    approvalStatus: "conditionally-approved",
    releaseBlocked: true,
    forms: ([form(level, "pretest"), form(level, "posttest")].filter(Boolean) as StarpathFormBlueprint[]),
    descriptors: allocations.map((args) => descriptor(level, ...args)),
  };
});

export function validateStarpathAssessmentBlueprints(levelFilter?: StarpathAssessmentLevel): string[] {
  const issues: string[] = [];
  const expectedConstructed = [10, 12, 14, 16, 17, 18, 19];
  const blueprints = levelFilter === undefined ? STARPATH_ASSESSMENT_BLUEPRINTS : STARPATH_ASSESSMENT_BLUEPRINTS.filter((item) => item.level === levelFilter);

  for (const blueprint of blueprints) {
    const program = getStarpathProgram(blueprint.levelId);
    if (blueprint.approvalStatus !== "conditionally-approved" || blueprint.releaseBlocked !== true) issues.push(`${blueprint.yearLabel} must remain release-blocked until curriculum and bank audits pass.`);
    if (blueprint.descriptors.map((item) => item.code).join("|") !== program.descriptors.map((item) => item.code).join("|")) issues.push(`${blueprint.yearLabel} descriptor ownership differs from the canonical Starpath program.`);
    for (const kind of blueprint.level === 0 ? ["posttest"] as const : ["pretest", "posttest"] as const) {
      const allocation = blueprint.descriptors.reduce((sum, item) => sum + item.allocation[kind], 0);
      if (allocation !== 20) issues.push(`${blueprint.yearLabel} ${kind} allocation is ${allocation}; expected 20.`);
    }
    for (const formBlueprint of blueprint.forms) {
      if (Object.values(formBlueprint.difficultyMix).reduce((sum, count) => sum + count, 0) !== 20) issues.push(`${blueprint.yearLabel} ${formBlueprint.kind} difficulty mix does not total 20.`);
      if (Object.values(formBlueprint.cognitiveDemandMix).reduce((sum, count) => sum + count, 0) !== 20) issues.push(`${blueprint.yearLabel} ${formBlueprint.kind} cognitive mix does not total 20.`);
      if (formBlueprint.responseMix.constructedOrManipulatedMinimum !== expectedConstructed[blueprint.level]) issues.push(`${blueprint.yearLabel} ${formBlueprint.kind} constructed-response quota is incorrect.`);
      if (formBlueprint.responseMix.constructedOrManipulatedMinimum + formBlueprint.responseMix.selectedResponseMaximum !== 20) issues.push(`${blueprint.yearLabel} ${formBlueprint.kind} response mix does not total 20.`);
    }
    for (const item of blueprint.descriptors) {
      if (!item.learningIntentions.length || !item.successCriteria.length) issues.push(`${item.code} has incomplete intentions or success criteria.`);
      if (!item.curriculumMapping.currentWeeks.length) issues.push(`${item.code} has no curriculum mapping.`);
      if (!item.questionBlueprint.posttestArchetypes.length || (blueprint.level > 0 && !item.questionBlueprint.pretestArchetypes.length)) issues.push(`${item.code} has an incomplete question blueprint.`);
      if (!item.misconceptionIds.length) issues.push(`${item.code} has no misconception coverage.`);
      for (const id of item.misconceptionIds) {
        if (!STARPATH_MISCONCEPTION_IDS.has(id)) issues.push(`${item.code} references unknown misconception ${id}.`);
        else if (!getStarpathMisconception(id)?.descriptorCodes.includes(item.code)) issues.push(`${item.code} uses misconception ${id} outside its descriptor mapping.`);
      }
    }
  }
  return Array.from(new Set(issues));
}

export function validateStarpathAssessmentBlueprintForLevel(level: number): string[] {
  if (!Number.isInteger(level) || level < 0 || level > 6) return [`Unsupported Starpath assessment level ${level}.`];
  return validateStarpathAssessmentBlueprints(level as StarpathAssessmentLevel);
}
