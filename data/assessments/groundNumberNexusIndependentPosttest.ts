import type { Question } from "@/data/assessments/posttests";
import {
  createUncalibratedItemStatistics,
  type AssessmentCognitiveCategory,
  type AssessmentItemDifficulty,
  type AssessmentResponseMode,
  type IndependentAssessmentItem,
} from "@/data/assessments/assessmentItemStandard";

type GroundDescriptor =
  | "AC9MFN01"
  | "AC9MFN02"
  | "AC9MFN03"
  | "AC9MFN04"
  | "AC9MFN05"
  | "AC9MFN06"
  | "AC9MFA01";

type CandidateQuestion = Question & IndependentAssessmentItem;
type RuntimeType = "mcq" | "numeric" | "number_order" | "pattern_build";

type ItemSpec = {
  descriptor: GroundDescriptor;
  week: number;
  lesson: number;
  skillId: string;
  skillLabel: string;
  difficulty: AssessmentItemDifficulty;
  cognitiveCategory: AssessmentCognitiveCategory;
  responseMode: AssessmentResponseMode;
  misconceptionTags: readonly string[];
  misconceptionDiagnosis?: boolean;
  contextKey: string;
  structureKey: string;
  prompt: string;
  correctAnswer: string;
  type: RuntimeType;
  visual: Record<string, unknown>;
  options?: readonly string[];
};

function candidate(index: number, spec: ItemSpec, form: "pretest" | "posttest" = "posttest"): CandidateQuestion {
  const selectedAnswerPosition = spec.type === "mcq"
    ? spec.options?.indexOf(spec.correctAnswer)
    : undefined;

  return {
    schemaVersion: 1,
    id: `y0-number-${form === "pretest" ? "pre" : "post"}-${String(index + 1).padStart(2, "0")}-v1`,
    version: "1.0.0",
    realm: "number",
    level: 0,
    form,
    origin: "assessment_authored",
    sourcePool: form,
    bankId: `number-nexus-level-0-${form}-v1`,
    primaryDescriptorCode: spec.descriptor,
    descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }],
    cognitiveCategory: spec.cognitiveCategory,
    difficulty: spec.difficulty,
    isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false,
    responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags,
    contextKey: spec.contextKey,
    structureKey: spec.structureKey,
    ...(selectedAnswerPosition !== undefined
      ? { selectedAnswerPosition: selectedAnswerPosition + 1 }
      : {}),
    prompt: spec.prompt,
    renderer: {
      type: spec.type === "mcq"
        ? "selected_response"
        : spec.type === "numeric"
          ? "numeric_entry"
          : spec.type,
      payload: {
        prompt: spec.prompt,
        correctAnswer: spec.correctAnswer,
        visual: spec.visual,
        ...(spec.options ? { options: spec.options } : {}),
      },
    },
    scoring: { kind: spec.type === "numeric" ? "numeric_tolerance" : "exact", correctResponse: spec.correctAnswer, ...(spec.type === "numeric" ? { tolerance: 0 } : {}) },
    statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: spec.type,
    options: spec.options ? [...spec.options] : undefined,
    correctAnswer: spec.correctAnswer,
    answer: spec.correctAnswer,
    skillId: spec.skillId,
    skillLabel: spec.skillLabel,
    linkedWeeks: [spec.week],
    linkedLessons: [spec.lesson],
    strand: "Number and Algebra",
    curriculumCodes: [spec.descriptor],
    difficultyBand: "ground-number",
    visual: spec.visual,
    inputMode: spec.type === "numeric" ? "decimal" : undefined,
  };
}

const POSTTEST_SPECS: readonly ItemSpec[] = [
  {
    descriptor: "AC9MFN01", week: 1, lesson: 1, skillId: "numeral_quantity", skillLabel: "Match Numerals and Quantities",
    difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response",
    misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "ground-seven-crystals", structureKey: "ground-select-numeral-for-collection",
    prompt: "Choose the number.", correctAnswer: "7", type: "mcq", options: ["6", "8", "7"],
    visual: { type: "number_ground_collection", count: 7, token: "crystal" },
  },
  {
    descriptor: "AC9MFN02", week: 4, lesson: 1, skillId: "subitise_to_five", skillLabel: "See Quantities to Five",
    difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response",
    misconceptionTags: ["subitising-vs-counting"], contextKey: "ground-four-stars", structureKey: "ground-enter-subitised-total",
    prompt: "How many stars?", correctAnswer: "4", type: "numeric",
    visual: { type: "number_ground_collection", count: 4, token: "star", arrangement: "subitise" },
  },
  {
    descriptor: "AC9MFN03", week: 3, lesson: 1, skillId: "count_collection", skillLabel: "Count a Collection",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["counting-one-to-one"], contextKey: "ground-thirteen-robots", structureKey: "ground-enter-counted-total",
    prompt: "How many robots?", correctAnswer: "13", type: "numeric",
    visual: { type: "number_ground_collection", count: 13, token: "robot" },
  },
  {
    descriptor: "AC9MFN04", week: 6, lesson: 1, skillId: "missing_part", skillLabel: "Find a Missing Part",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["part-whole-conservation"], contextKey: "ground-seven-split", structureKey: "ground-enter-missing-part",
    prompt: "The whole is 7. One part is 3. What is the missing part?", correctAnswer: "4", type: "numeric",
    visual: { type: "number_ground_part_whole", whole: 7, parts: [3, null] },
  },
  {
    descriptor: "AC9MFN05", week: 9, lesson: 1, skillId: "add_to_situation", skillLabel: "Solve an Add-To Story",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["operation-story-structure"], contextKey: "ground-robots-arrive", structureKey: "ground-enter-add-to-result",
    prompt: "There are 3 robots. 2 more arrive. How many now?", correctAnswer: "5", type: "numeric",
    visual: { type: "number_ground_change", start: 3, change: 2, action: "add", token: "robot" },
  },
  {
    descriptor: "AC9MFN06", week: 10, lesson: 1, skillId: "equal_sharing", skillLabel: "Share Equally",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "ground-six-two-boxes", structureKey: "ground-enter-equal-share-size",
    prompt: "Share 6 equally into 2 boxes. How many in each box?", correctAnswer: "3", type: "numeric",
    visual: { type: "number_ground_groups", total: 6, bins: 2 },
  },
  {
    descriptor: "AC9MFA01", week: 11, lesson: 1, skillId: "continue_pattern", skillLabel: "Continue a Pattern",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response",
    misconceptionTags: ["repeating-unit"], contextKey: "ground-star-crystal-next", structureKey: "ground-select-next-pattern-token",
    prompt: "What comes next?", correctAnswer: "star", type: "mcq", options: ["robot", "star", "crystal"],
    visual: { type: "number_ground_pattern", sequence: ["star", "crystal", "star", "crystal", "?"] },
  },
  {
    descriptor: "AC9MFN01", week: 2, lesson: 2, skillId: "number_sequence", skillLabel: "Complete a Number Sequence",
    difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response",
    misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "ground-eleven-to-fourteen", structureKey: "ground-enter-sequence-gap",
    prompt: "What number is missing?", correctAnswer: "13", type: "numeric",
    visual: { type: "number_ground_path", values: [11, 12, null, 14] },
  },
  {
    descriptor: "AC9MFN03", week: 4, lesson: 2, skillId: "compare_collections", skillLabel: "Compare Collections",
    difficulty: "moderate", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true,
    misconceptionTags: ["cardinality-and-arrangement"], contextKey: "ground-nine-rearranged", structureKey: "ground-diagnose-arrangement-conservation",
    prompt: "Which box has more?", correctAnswer: "They have the same", type: "mcq", options: ["Box A", "They have the same", "Box B"],
    visual: { type: "number_ground_compare", groups: [{ id: "A", count: 9, token: "crystal", layout: "spread" }, { id: "B", count: 9, token: "crystal", layout: "close" }] },
  },
  {
    descriptor: "AC9MFN04", week: 6, lesson: 2, skillId: "combine_parts", skillLabel: "Combine Parts",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["part-whole-conservation"], contextKey: "ground-two-six-combine", structureKey: "ground-enter-combined-whole",
    prompt: "The parts are 2 and 6. What is the whole?", correctAnswer: "8", type: "numeric",
    visual: { type: "number_ground_part_whole", whole: null, parts: [2, 6] },
  },
  {
    descriptor: "AC9MFN05", week: 9, lesson: 2, skillId: "take_away_situation", skillLabel: "Solve a Take-Away Story",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["operation-story-structure"], contextKey: "ground-eight-three-leave", structureKey: "ground-enter-take-away-result",
    prompt: "There are 8 crystals. 3 roll away. How many stay?", correctAnswer: "5", type: "numeric",
    visual: { type: "number_ground_change", start: 8, change: 3, action: "remove", token: "crystal" },
  },
  {
    descriptor: "AC9MFN06", week: 10, lesson: 2, skillId: "equal_grouping", skillLabel: "Make Equal Groups",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "ground-eight-pairs", structureKey: "ground-enter-number-of-groups",
    prompt: "Make groups of 2. How many groups?", correctAnswer: "4", type: "numeric",
    visual: { type: "number_ground_groups", total: 8, bins: 4, distribution: [2, 2, 2, 2] },
  },
  {
    descriptor: "AC9MFN01", week: 3, lesson: 3, skillId: "order_numbers", skillLabel: "Order Numbers",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "manipulated_response",
    misconceptionTags: ["numeral-quantity-disconnect"], contextKey: "ground-five-eight-twelve", structureKey: "ground-build-ascending-order",
    prompt: "Put the numbers in order. Smallest first.", correctAnswer: "5||8||12", type: "number_order", options: ["12", "5", "8"],
    visual: { type: "number_ground_path", values: [5, 12, 8] },
  },
  {
    descriptor: "AC9MFN02", week: 4, lesson: 3, skillId: "match_subitised_sets", skillLabel: "Match Quantities to Five",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response",
    misconceptionTags: ["subitising-vs-counting"], contextKey: "ground-five-two-arrangements", structureKey: "ground-select-shared-subitised-total",
    prompt: "How many are in each box?", correctAnswer: "5", type: "mcq", options: ["4", "5", "3"],
    visual: { type: "number_ground_compare", groups: [{ id: "A", count: 5, token: "star", layout: "dice" }, { id: "B", count: 5, token: "star", layout: "line" }] },
  },
  {
    descriptor: "AC9MFN03", week: 5, lesson: 3, skillId: "compare_counted_sets", skillLabel: "Find Fewer",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "selected_response",
    misconceptionTags: ["counting-one-to-one"], contextKey: "ground-fourteen-twelve", structureKey: "ground-select-fewer-counted-collection",
    prompt: "Which box has fewer?", correctAnswer: "Box B", type: "mcq", options: ["They have the same", "Box B", "Box A"],
    visual: { type: "number_ground_compare", groups: [{ id: "A", count: 14, token: "robot" }, { id: "B", count: 12, token: "robot" }] },
  },
  {
    descriptor: "AC9MFN04", week: 6, lesson: 3, skillId: "repair_part_whole", skillLabel: "Repair a Part-Whole Model",
    difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response",
    misconceptionTags: ["part-whole-conservation"], contextKey: "ground-ten-six-three", structureKey: "ground-enter-part-to-repair-whole",
    prompt: "The whole is 10. The parts show 6 and 3. How many are missing?", correctAnswer: "1", type: "numeric",
    visual: { type: "number_ground_part_whole", whole: 10, parts: [6, 3, null] },
  },
  {
    descriptor: "AC9MFN05", week: 9, lesson: 3, skillId: "choose_change_story", skillLabel: "Interpret a Change Story",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true,
    misconceptionTags: ["operation-story-structure"], contextKey: "ground-six-two-roll-away", structureKey: "ground-select-story-matching-change",
    prompt: "Which story matches the picture?", correctAnswer: "6 crystals. 2 roll away.", type: "mcq",
    options: ["6 crystals. 2 roll away.", "6 crystals. 2 more arrive.", "2 crystals. 6 more arrive."],
    visual: { type: "number_ground_change", start: 6, change: 2, action: "remove", token: "crystal" },
  },
  {
    descriptor: "AC9MFN06", week: 10, lesson: 3, skillId: "judge_fair_share", skillLabel: "Judge Equal Sharing",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true,
    misconceptionTags: ["equal-sharing-vs-grouping"], contextKey: "ground-eight-five-three", structureKey: "ground-judge-unequal-share",
    prompt: "Is this sharing fair?", correctAnswer: "No", type: "mcq", options: ["Yes", "No"],
    visual: { type: "number_ground_groups", total: 8, bins: 2, distribution: [5, 3] },
  },
  {
    descriptor: "AC9MFN04", week: 12, lesson: 3, skillId: "part_whole_transfer", skillLabel: "Use Part-Whole Thinking",
    difficulty: "challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionDiagnosis: true,
    misconceptionTags: ["part-whole-conservation"], contextKey: "ground-ten-four-hidden", structureKey: "ground-transfer-hidden-part",
    prompt: "There are 10 stars. You can see 4. How many are hidden?", correctAnswer: "6", type: "numeric",
    visual: { type: "number_ground_part_whole", whole: 10, parts: [4, null] },
  },
  {
    descriptor: "AC9MFA01", week: 11, lesson: 3, skillId: "build_pattern", skillLabel: "Continue a Repeating Pattern",
    difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "manipulated_response",
    misconceptionTags: ["repeating-unit"], contextKey: "ground-star-crystal-two-gaps", structureKey: "ground-build-two-pattern-terms",
    prompt: "Build the next 2 parts.", correctAnswer: "star||crystal", type: "pattern_build", options: ["star", "crystal", "robot"],
    visual: { type: "number_ground_pattern", sequence: ["star", "crystal", "star", "crystal", "?", "?"], answerSlots: 2 },
  },
] as const;

export const GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS: readonly CandidateQuestion[] =
  POSTTEST_SPECS.map((spec, index) => candidate(index, spec));

// Independently authored examples; curriculum, response mode and intended demand
// match the corresponding post-test item. Difficulty remains uncalibrated.
const PRETEST_TASKS = [
 { prompt: "Choose the number.", correctAnswer: "6", options: ["6", "9", "5"], visual: {type:"number_ground_collection",count:6,token:"robot"} },
 { prompt: "How many crystals?", correctAnswer: "3", visual: {type:"number_ground_collection",count:3,token:"crystal",arrangement:"subitise"} },
 { prompt: "How many stars?", correctAnswer: "14", visual: {type:"number_ground_collection",count:14,token:"star"} },
 { prompt: "The whole is 8. One part is 5. What is the missing part?", correctAnswer: "3", visual: {type:"number_ground_part_whole",whole:8,parts:[5,null]} },
 { prompt: "There are 4 stars. 2 more arrive. How many now?", correctAnswer: "6", visual: {type:"number_ground_change",start:4,change:2,action:"add",token:"star"} },
 { prompt: "Share 8 equally into 2 boxes. How many in each box?", correctAnswer: "4", visual: {type:"number_ground_groups",total:8,bins:2} },
 { prompt: "What comes next?", correctAnswer: "crystal", options:["robot","star","crystal"], visual: {type:"number_ground_pattern",sequence:["crystal","robot","crystal","robot","?"]} },
 { prompt: "What number is missing?", correctAnswer: "14", visual: {type:"number_ground_path",values:[12,13,null,15]} },
 { prompt: "Which box has more?", correctAnswer: "They have the same", options:["Box B","Box A","They have the same"], visual: {type:"number_ground_compare",groups:[{id:"A",count:8,token:"star",layout:"close"},{id:"B",count:8,token:"star",layout:"spread"}]} },
 { prompt: "The parts are 3 and 6. What is the whole?", correctAnswer: "9", visual: {type:"number_ground_part_whole",whole:null,parts:[3,6]} },
 { prompt: "There are 9 robots. 2 leave. How many stay?", correctAnswer: "7", visual: {type:"number_ground_change",start:9,change:2,action:"remove",token:"robot"} },
 { prompt: "Make groups of 2. How many groups?", correctAnswer: "5", visual: {type:"number_ground_groups",total:10,bins:5,distribution:[2,2,2,2,2]} },
 { prompt: "Put the numbers in order. Smallest first.", correctAnswer: "4||9||13", options:["9","13","4"], visual: {type:"number_ground_path",values:[9,13,4]} },
 { prompt: "How many are in each box?", correctAnswer: "4", options:["4","3","5"], visual: {type:"number_ground_compare",groups:[{id:"A",count:4,token:"crystal",layout:"line"},{id:"B",count:4,token:"crystal",layout:"dice"}]} },
 { prompt: "Which box has fewer?", correctAnswer: "Box A", options:["They have the same","Box B","Box A"], visual: {type:"number_ground_compare",groups:[{id:"A",count:11,token:"crystal"},{id:"B",count:13,token:"crystal"}]} },
 { prompt: "The whole is 10. The parts show 5 and 3. How many are missing?", correctAnswer: "2", visual: {type:"number_ground_part_whole",whole:10,parts:[5,3,null]} },
 { prompt: "Which story matches the picture?", correctAnswer: "7 robots. 3 leave.", options:["7 robots. 3 more arrive.","7 robots. 3 leave.","3 robots. 7 more arrive."], visual: {type:"number_ground_change",start:7,change:3,action:"remove",token:"robot"} },
 { prompt: "Is this sharing fair?", correctAnswer: "Yes", options:["Yes","No"], visual: {type:"number_ground_groups",total:8,bins:2,distribution:[4,4]} },
 { prompt: "There are 10 crystals. You can see 3. How many are hidden?", correctAnswer: "7", visual: {type:"number_ground_part_whole",whole:10,parts:[3,null]} },
 { prompt: "Build the next 2 parts.", correctAnswer: "robot||star", options:["star","crystal","robot"], visual: {type:"number_ground_pattern",sequence:["robot","star","robot","star","?","?"],answerSlots:2} },
] satisfies readonly Pick<ItemSpec,"prompt"|"correctAnswer"|"visual"|"options">[];
export const GROUND_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS: readonly CandidateQuestion[] =
 PRETEST_TASKS.map((task,index)=>candidate(index,{...POSTTEST_SPECS[index]!,...task,contextKey:`ground-number-baseline-${index+1}`},"pretest"));
