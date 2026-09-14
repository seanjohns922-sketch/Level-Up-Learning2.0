import type { Question } from "@/data/assessments/posttests";
import { createUncalibratedItemStatistics, type AssessmentCognitiveCategory, type AssessmentItemDifficulty, type AssessmentResponseMode, type IndependentAssessmentItem } from "@/data/assessments/assessmentItemStandard";

type Descriptor = "AC9MFM01" | "AC9MFM02";
type CandidateQuestion = Question & IndependentAssessmentItem;
type Domain = "attribute_compare" | "routine_sequence";
type ItemSpec = {
  descriptor: Descriptor; week: number; lesson: number; skillId: string; skillLabel: string;
  difficulty: AssessmentItemDifficulty; cognitiveCategory: AssessmentCognitiveCategory; responseMode: AssessmentResponseMode;
  misconceptionTags: readonly string[]; misconceptionDiagnosis?: boolean; contextKey: string; structureKey: string;
  prompt: string; correctAnswer: string; domain: Domain; options?: readonly string[];
};

function candidate(index: number, spec: ItemSpec, form: "pretest" | "posttest" = "posttest"): CandidateQuestion {
  let comparisonVisual: Record<string, unknown> | undefined;
  if (["compare_length", "compare_mass", "counterintuitive_mass"].includes(spec.skillId)) {
    const mass = spec.skillId !== "compare_length";
    const first = spec.correctAnswer.endsWith("1");
    const labelled = ["1", "2"].map(id => spec.options?.find(option => option.endsWith(id)) ?? id);
    const objectNames = form === "pretest" ? (index === 9 ? ["Block", "Ball"] : ["Stone", "Box"]) : (index === 9 ? ["Book", "Toy"] : ["Bag", "Cup"]);
    const labels = mass && labelled.every(label => ["1", "2"].includes(label)) ? objectNames : labelled;
    if (labels !== labelled) spec = { ...spec, correctAnswer: labels[first ? 0 : 1]! };
    const values = mass ? (first ? [105, 65] : [65, 105]) : (first ? [235, 145] : [145, 235]);
    comparisonVisual = { type: "ground_measurement_comparison", attribute: mass ? "mass" : "length", labels, values,
      description: mass ? `A balance holding ${labels[0]} and ${labels[1]}. The ${first ? labels[0] : labels[1]} pan is lower.` : `Two aligned strips labelled ${labels.join(" and ")}. Both begin at the dashed line.` };
    const equalLabel = mass ? "They have the same mass" : "They are the same length";
    const alternate = labels[first ? 1 : 0]!;
    const options = !mass ? [equalLabel, alternate, spec.correctAnswer] : spec.skillId === "counterintuitive_mass" ? [spec.correctAnswer, alternate, equalLabel] : [labels[0]!, labels[1]!, equalLabel];
    spec = { ...spec, prompt: mass ? "Look at the balance. Which is heavier?" : "Look at the two strips. Which is longer?", options, responseMode: "selected_response" };
  }
  const selected = spec.options !== undefined;
  const selectedAnswerPosition = spec.options?.indexOf(spec.correctAnswer);
  return {
    schemaVersion: 1, id: `y0-measurement-${form === "pretest" ? "pre" : "post"}-${String(index + 1).padStart(2, "0")}-v3`, version: "3.0.0",
    realm: "measurement", level: 0, form, origin: "assessment_authored", sourcePool: form,
    bankId: `measurelands-level-0-${form}-v3`, primaryDescriptorCode: spec.descriptor, descriptorCodes: [spec.descriptor],
    curriculumLessonMapping: [{ week: spec.week, lesson: spec.lesson }], cognitiveCategory: spec.cognitiveCategory,
    difficulty: spec.difficulty, isTransfer: spec.cognitiveCategory === "transfer",
    requiresReasoning: spec.cognitiveCategory === "reasoning" || spec.cognitiveCategory === "transfer",
    misconceptionDiagnosis: spec.misconceptionDiagnosis ?? false, responseMode: spec.responseMode,
    misconceptionTags: spec.misconceptionTags, contextKey: spec.contextKey, structureKey: spec.structureKey,
    ...(selected ? { selectedAnswerPosition: (selectedAnswerPosition ?? -1) + 1 } : {}), prompt: spec.prompt,
    renderer: { type: selected ? "selected_response" : "numeric_entry", payload: { domain: spec.domain, prompt: spec.prompt, correctAnswer: spec.correctAnswer, ...(spec.options ? { options: spec.options } : {}) } },
    visual: comparisonVisual,
    scoring: { kind: "exact", correctResponse: spec.correctAnswer }, statistics: createUncalibratedItemStatistics(spec.difficulty),
    type: selected ? "mcq" : "numeric", options: spec.options ? [...spec.options] : undefined, correctAnswer: spec.correctAnswer,
    answer: spec.correctAnswer, skillId: spec.skillId, skillLabel: spec.skillLabel, linkedWeeks: [spec.week], linkedLessons: [spec.lesson],
    strand: "Measurement", curriculumCodes: [spec.descriptor], difficultyBand: "prep-measurement", inputMode: selected ? undefined : "decimal",
  };
}

const POSTTEST_SPECS: readonly ItemSpec[] = [
  { descriptor: "AC9MFM01", week: 1, lesson: 1, skillId: "identify_attribute", skillLabel: "Identify Length", difficulty: "easy", cognitiveCategory: "recall", responseMode: "selected_response", misconceptionTags: ["attribute-confusion"], contextKey: "ground-ribbon-attribute", structureKey: "ground-name-length-attribute", prompt: "We want to find which ribbon is longer. What attribute are we comparing?", correctAnswer: "Length", domain: "attribute_compare", options: ["Mass", "Length", "Capacity"] },
  { descriptor: "AC9MFM02", week: 5, lesson: 1, skillId: "week_cycle", skillLabel: "Know the Week", difficulty: "easy", cognitiveCategory: "recall", responseMode: "constructed_response", misconceptionTags: ["routine-sequence"], contextKey: "ground-days-in-week", structureKey: "ground-week-day-count", prompt: "Enter the number of days in one week.", correctAnswer: "7", domain: "routine_sequence" },
  { descriptor: "AC9MFM01", week: 1, lesson: 1, skillId: "compare_length", skillLabel: "Compare Length Directly", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["visual-position-length"], contextKey: "ground-aligned-strips", structureKey: "ground-select-farther-endpoint", prompt: "Two strips start at the same line. Strip 2 reaches farther than Strip 1. Which strip is longer?", correctAnswer: "Strip 2", domain: "attribute_compare", options: ["Strip 1", "Strip 2", "They are the same length"] },
  { descriptor: "AC9MFM01", week: 2, lesson: 1, skillId: "compare_mass", skillLabel: "Compare Mass Directly", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["attribute-confusion"], contextKey: "ground-balance-two-objects", structureKey: "ground-read-lower-balance-side", prompt: "A balance tips down on the side holding Object 1. Which object is heavier?", correctAnswer: "Object 1", domain: "attribute_compare", options: ["Object 2", "They have the same mass", "Object 1"] },
  { descriptor: "AC9MFM01", week: 3, lesson: 1, skillId: "compare_capacity", skillLabel: "Compare Capacity Directly", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["attribute-confusion"], contextKey: "ground-pour-container-one", structureKey: "ground-read-leftover-pour", prompt: "Container 1 fills Container 2 and still has water left. Which container holds more?", correctAnswer: "Container 1", domain: "attribute_compare", options: ["They hold the same", "Container 1", "Container 2"] },
  { descriptor: "AC9MFM01", week: 4, lesson: 1, skillId: "compare_duration", skillLabel: "Compare Event Duration", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["duration-comparison-evidence"], contextKey: "ground-clap-story-duration", structureKey: "ground-select-longer-familiar-event", prompt: "Which usually takes longer?", correctAnswer: "Listening to a whole story", domain: "attribute_compare", options: ["One clap", "Listening to a whole story", "One blink"] },
  { descriptor: "AC9MFM02", week: 6, lesson: 1, skillId: "time_of_day", skillLabel: "Recognise Morning", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["day-part-sequence"], contextKey: "ground-breakfast-day-part", structureKey: "ground-match-breakfast-morning", prompt: "When do people usually eat breakfast?", correctAnswer: "Morning", domain: "routine_sequence", options: ["Night", "Afternoon", "Morning"] },
  { descriptor: "AC9MFM01", week: 1, lesson: 2, skillId: "compare_length", skillLabel: "Identify the Longer Object", difficulty: "easy", cognitiveCategory: "understanding", responseMode: "constructed_response", misconceptionTags: ["visual-position-length"], contextKey: "ground-numbered-aligned-lines", structureKey: "ground-enter-longer-object-label", prompt: "Lines 1 and 2 start together. Line 2 reaches farther. Enter the label number of the longer line.", correctAnswer: "2", domain: "attribute_compare" },
  { descriptor: "AC9MFM02", week: 5, lesson: 2, skillId: "day_sequence", skillLabel: "Continue the Week", difficulty: "moderate", cognitiveCategory: "understanding", responseMode: "selected_response", misconceptionTags: ["routine-sequence"], contextKey: "ground-friday-next-day", structureKey: "ground-day-after-friday", prompt: "Which day comes after Friday?", correctAnswer: "Saturday", domain: "routine_sequence", options: ["Monday", "Saturday", "Thursday"] },
  { descriptor: "AC9MFM01", week: 2, lesson: 2, skillId: "compare_mass", skillLabel: "Identify the Heavier Object", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["attribute-confusion"], contextKey: "ground-numbered-balance", structureKey: "ground-enter-lower-side-label", prompt: "A balance holds Object 1 and Object 2. The side with Object 1 is lower. Enter the label number of the heavier object.", correctAnswer: "1", domain: "attribute_compare" },
  { descriptor: "AC9MFM01", week: 3, lesson: 2, skillId: "compare_capacity", skillLabel: "Identify Greater Capacity", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["attribute-confusion"], contextKey: "ground-numbered-container-pour", structureKey: "ground-enter-source-with-leftover", prompt: "Container 2 fills Container 1 and has some water left. Enter the label number of the container that holds more.", correctAnswer: "2", domain: "attribute_compare" },
  { descriptor: "AC9MFM02", week: 5, lesson: 2, skillId: "day_sequence", skillLabel: "Locate a Day in the Week", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["routine-sequence"], contextKey: "ground-wednesday-position", structureKey: "ground-weekday-position-from-monday", prompt: "Count Monday as day 1 and Tuesday as day 2. Enter the day number for Wednesday.", correctAnswer: "3", domain: "routine_sequence" },
  { descriptor: "AC9MFM01", week: 4, lesson: 2, skillId: "compare_duration", skillLabel: "Identify the Longer Event", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["duration-comparison-evidence"], contextKey: "ground-numbered-event-duration", structureKey: "ground-enter-longer-event-label", prompt: "Event 1 is one jump. Event 2 is eating lunch. Enter the label number of the event that usually takes longer.", correctAnswer: "2", domain: "attribute_compare" },
  { descriptor: "AC9MFM02", week: 6, lesson: 2, skillId: "day_part_sequence", skillLabel: "Order Parts of the Day", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["day-part-sequence"], contextKey: "ground-lunch-position", structureKey: "ground-day-part-position", prompt: "Use this order: morning, lunchtime, afternoon, night time. Enter the position number of lunchtime.", correctAnswer: "2", domain: "routine_sequence" },
  { descriptor: "AC9MFM01", week: 1, lesson: 3, skillId: "fair_length_compare", skillLabel: "Align for a Fair Length Comparison", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["visual-position-length"], contextKey: "ground-shifted-ribbon-labels", structureKey: "ground-enter-longer-after-alignment", prompt: "Ribbon 1 and Ribbon 2 are moved to the same start line. Ribbon 1 then reaches farther. Enter the label number of the longer ribbon.", correctAnswer: "1", domain: "attribute_compare" },
  { descriptor: "AC9MFM01", week: 2, lesson: 3, skillId: "counterintuitive_mass", skillLabel: "Use Balance Evidence", difficulty: "moderate", cognitiveCategory: "application", responseMode: "constructed_response", misconceptionTags: ["attribute-confusion"], contextKey: "ground-big-box-small-bag", structureKey: "ground-enter-heavy-despite-size", prompt: "A large empty box is Object 1. A small full bag is Object 2. A balance tips down under Object 2. Enter the label number of the heavier object.", correctAnswer: "2", domain: "attribute_compare" },
  { descriptor: "AC9MFM01", week: 3, lesson: 3, skillId: "capacity_reasoning", skillLabel: "Explain Capacity Evidence", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["attribute-confusion"], contextKey: "ground-tall-wide-capacity", structureKey: "ground-trust-pour-over-height", prompt: "A short wide container fills a tall thin container and has water left. Why does the short container hold more?", correctAnswer: "The pouring test gives direct evidence", domain: "attribute_compare", options: ["Short containers always hold more", "The pouring test gives direct evidence", "Tall containers cannot hold water"] },
  { descriptor: "AC9MFM02", week: 7, lesson: 3, skillId: "relative_day_reasoning", skillLabel: "Reason About Tomorrow", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["routine-sequence"], contextKey: "ground-tuesday-tomorrow", structureKey: "ground-relative-day-from-given-day", prompt: "Today is Tuesday. Which statement is correct?", correctAnswer: "Tomorrow is Wednesday", domain: "routine_sequence", options: ["Tomorrow is always Friday", "Tomorrow is Wednesday", "Yesterday is Wednesday"] },
  { descriptor: "AC9MFM01", week: 4, lesson: 3, skillId: "duration_reasoning", skillLabel: "Use Duration Evidence", difficulty: "challenging", cognitiveCategory: "reasoning", responseMode: "selected_response", misconceptionDiagnosis: true, misconceptionTags: ["duration-comparison-evidence"], contextKey: "ground-favourite-duration", structureKey: "ground-reject-familiarity-duration", prompt: "Sam likes jumping more than story time. Story time lasts much longer. Which event has the greater duration?", correctAnswer: "Story time, because it lasts longer", domain: "attribute_compare", options: ["Jumping, because Sam likes it", "They must take the same time", "Story time, because it lasts longer"] },
  { descriptor: "AC9MFM01", week: 8, lesson: 3, skillId: "comparison_transfer", skillLabel: "Transfer Direct Capacity Evidence", difficulty: "very_challenging", cognitiveCategory: "transfer", responseMode: "constructed_response", misconceptionDiagnosis: true, misconceptionTags: ["attribute-confusion"], contextKey: "ground-three-container-transfer", structureKey: "ground-transitive-pour-comparison", prompt: "Container 1 fills Container 2 with some left. Container 2 fills Container 3 with some left. Enter the label number of the container that holds the most.", correctAnswer: "1", domain: "attribute_compare" },
];

const POSTTEST_ORDER = [0, 2, 1, 3, 4, 6, 5, 7, 8, 9, 10, 11, 12, 14, 13, 15, 16, 17, 18, 19] as const;

export const GROUND_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS = POSTTEST_ORDER.map(
  (specIndex, index) => candidate(index, POSTTEST_SPECS[specIndex]!),
);

// Parallel content coverage and intended demand, with separate assessment examples.
const PRETEST_TASKS = [
 {prompt:"We want to find which skipping rope is longer. What attribute are we comparing?",correctAnswer:"Length",options:["Length","Capacity","Mass"]},
 {prompt:"One whole week goes from Monday to Sunday. How many days is that?",correctAnswer:"7"},
 {prompt:"Two pencils start at the same line. Pencil 1 reaches farther than Pencil 2. Which pencil is longer?",correctAnswer:"Pencil 1",options:["They are the same length","Pencil 2","Pencil 1"]},
 {prompt:"A balance tips down on the side holding Bag 2. Which bag is heavier?",correctAnswer:"Bag 2",options:["Bag 2","Bag 1","They have the same mass"]},
 {prompt:"Jug 2 fills Jug 1 and still has water left. Which jug holds more?",correctAnswer:"Jug 2",options:["Jug 1","They hold the same","Jug 2"]},
 {prompt:"Which usually takes longer?",correctAnswer:"Walking around the playground",options:["Walking around the playground","One finger click","One blink"]},
 {prompt:"When do children usually arrive at school to begin their day?",correctAnswer:"Morning",options:["Afternoon","Night","Morning"]},
 {prompt:"Straws 1 and 2 start together. Straw 1 reaches farther. Enter the label number of the longer straw.",correctAnswer:"1"},
 {prompt:"Which day comes after Saturday?",correctAnswer:"Sunday",options:["Friday","Monday","Sunday"]},
 {prompt:"A balance holds Bag 1 and Bag 2. The side with Bag 2 is lower. Enter the label number of the heavier bag.",correctAnswer:"2"},
 {prompt:"Jug 1 fills Jug 2 and has water left. Enter the label number of the jug that holds more.",correctAnswer:"1"},
 {prompt:"Count Monday as day 1 and Tuesday as day 2. Enter the day number for Thursday.",correctAnswer:"4"},
 {prompt:"Event 1 is eating breakfast. Event 2 is one clap. Enter the label number of the event that usually takes longer.",correctAnswer:"1"},
 {prompt:"Use this order: morning, lunchtime, afternoon, night time. Enter the position number of afternoon.",correctAnswer:"3"},
 {prompt:"Rope 1 and Rope 2 are moved to the same start line. Rope 2 then reaches farther. Enter the label number of the longer rope.",correctAnswer:"2"},
 {prompt:"A small full tin is Object 1. A large empty carton is Object 2. A balance tips down under Object 1. Enter the label number of the heavier object.",correctAnswer:"1"},
 {prompt:"A wide low jug fills a narrow tall bottle and has water left. Why does the jug hold more?",correctAnswer:"The pouring test shows it holds more",options:["Tall bottles are always empty","The pouring test shows it holds more","Every wide jug holds more than every bottle"]},
 {prompt:"Today is Thursday. Which statement is correct?",correctAnswer:"Tomorrow is Friday",options:["Tomorrow is Friday","Yesterday is Friday","Tomorrow is always Monday"]},
 {prompt:"Alex likes one clap more than singing a whole song. The song lasts much longer. Which event has the greater duration?",correctAnswer:"The song, because it lasts longer",options:["The song, because it lasts longer","The clap, because Alex likes it","They must take the same time"]},
 {prompt:"Jug 3 fills Jug 1 with some left. Jug 1 fills Jug 2 with some left. Enter the label number of the jug that holds the most.",correctAnswer:"3"},
] satisfies readonly Pick<ItemSpec,"prompt"|"correctAnswer"|"options">[];
export const GROUND_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS = POSTTEST_ORDER.map((specIndex,index)=>
 candidate(index,{...POSTTEST_SPECS[specIndex]!,...PRETEST_TASKS[specIndex]!,contextKey:`ground-measurement-baseline-${specIndex+1}`},"pretest"));
