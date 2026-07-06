import type { PracticeTask } from "@/data/activities/year1/practice-task";
import type { LessonActivity } from "@/data/programs/types";
import type { Year2QuestionData } from "@/data/activities/year2/lessonEngine";

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function hasMultipleChoiceShape(question: Extract<Year2QuestionData, { kind: "multiple_choice" }>) {
  return Array.isArray(question.options) && question.options.length >= 2 && hasText(question.answer);
}

function hasTypedResponseShape(question: Extract<Year2QuestionData, { kind: "typed_response" }>) {
  return question.answer !== undefined && question.answer !== null && hasText(question.prompt);
}

export function canRenderByGeneratedKind(activity: LessonActivity) {
  const mode = typeof activity.config?.mode === "string" ? activity.config.mode : "";
  return mode.startsWith("y6_");
}

export function isLessonQuestionSafe(
  activity: LessonActivity,
  questionData: Year2QuestionData | null | undefined
): boolean {
  if (!activity || !questionData) return false;

  switch (activity.activityType) {
    case "place_value_builder":
      return questionData.kind === "place_value_builder";
    case "number_order":
      return questionData.kind === "number_order";
    case "partition_expand":
      return questionData.kind === "partition_expand";
    case "number_line":
      return questionData.kind === "number_line";
    case "area_model_select":
      return questionData.kind === "area_model_select";
    case "set_model_select":
      return questionData.kind === "set_model_select";
    case "build_the_whole":
      return questionData.kind === "build_the_whole";
    case "number_line_place":
      return questionData.kind === "number_line_place";
    case "fraction_compare":
      return questionData.kind === "fraction_compare";
    case "equivalent_fraction_match":
      return questionData.kind === "equivalent_fraction_match";
    case "fraction_decimal_percent_match":
      return questionData.kind === "fraction_decimal_percent_match";
    case "benchmark_sort":
      return questionData.kind === "benchmark_sort";
    case "equivalent_fraction_build":
      return questionData.kind === "equivalent_fraction_build";
    case "equivalent_fraction_yes_no":
      return questionData.kind === "equivalent_fraction_yes_no";
    case "addition_strategy":
      return questionData.kind === "addition_strategy";
    case "equal_groups":
      return questionData.kind === "equal_groups";
    case "arrays":
      return questionData.kind === "arrays";
    case "division_groups":
      return questionData.kind === "division_groups";
    case "mixed_word_problem":
      return questionData.kind === "mixed_word_problem";
    case "review_quiz":
      return (
        questionData.kind === "review_quiz" &&
        isLessonQuestionSafe(
          { activityType: questionData.activityType, weight: 1, config: {} },
          questionData.question
        )
      );
    case "subtraction_strategy":
      return questionData.kind === "subtraction_strategy";
    case "fact_family":
      return questionData.kind === "fact_family";
    case "odd_even_sort":
      return questionData.kind === "odd_even_sort";
    case "skip_count":
      return questionData.kind === "skip_count";
    case "multiple_choice":
      if (questionData.kind === "multiple_choice") {
        return hasMultipleChoiceShape(questionData);
      }
      return canRenderByGeneratedKind(activity) && questionData.kind === "typed_response"
        ? hasTypedResponseShape(questionData)
        : false;
    case "typed_response":
      if (questionData.kind === "typed_response") {
        return hasTypedResponseShape(questionData);
      }
      return canRenderByGeneratedKind(activity) && questionData.kind === "multiple_choice"
        ? hasMultipleChoiceShape(questionData)
        : false;
    case "speed_round":
      return questionData.kind === "speed_round";
    default:
      return false;
  }
}

const SUPPORTED_PRACTICE_TASK_KINDS = new Set<string>([
  "matchPairs",
  "countObjects",
  "fillTheJar",
  "countCircle",
  "typeNumber",
  "numberLadder",
  "numberLineTap",
  "numberLineJump",
  "chartFill",
  "tensOnesMcq",
  "partitionTwoWays",
  "splitStepper",
  "mabBuild",
  "placeValueDice",
  "equalGroupsMaker",
  "equalGroupsMcq",
  "groupBoxesBuilder",
  "groupingEstimate",
  "addDotsMatch",
  "partPartWhole",
  "mentalAdd",
  "subtractTakeAway",
  "subtractMoveToTaken",
  "subtractMissingPart",
  "subtractBar",
  "mentalSubtract",
  "storyOpChoice",
  "missingOperation",
  "storySolve",
  "moneyMakeAmount",
  "moneyChange",
  "moneyEnough",
  "joinStories",
  "combineGroups",
  "compareGroups",
  "make20Visual",
  "moneyAddPrices",
  "moneyHowMuchMore",
  "moneyChangeUp",
  "buildStory",
  "twoMats",
  "whatHappened",
  "barModel",
  "compareBars",
  "strategySelect",
  "shareDrag",
  "shareDeal",
  "shareFair",
  "groupBoxesInput",
  "groupBoxesTap",
  "missingGroupSize",
  "packBoxes",
  "groupGrabBags",
  "howManyGroups",
  "tapGroupsSkipCount",
  "buildGroupsSkipCount",
  "chooseSkipCount",
  "arrayBuilder",
  "barGroupModel",
  "missingGroupCount",
  "groupStory",
  "howManyGroupsStory",
  "twoStepGrouping",
  "flashFacts",
  "make10Builder",
  "missingNumberFacts",
  "doubleIt",
  "nearDouble",
  "doubleDetective",
  "gridRace",
  "factMatch",
  "climbLadder",
  "mixedReviewSprint",
  "strategyChoice",
  "targetedRevision",
  "funGames",
  "groundMatch",
  "groundOrdinal",
  "groundSpatial",
  "measurementCompare",
  "measurePath",
  "measureValidity",
  "rulerMeasure",
  "unitChoice",
  "estimateMeasure",
  "capacity",
  "duration",
  "clockMinute",
  "perimeter",
  "area",
  "temperature",
  "perimeterCalc",
  "timeQuest",
  "angleQuest",
  "massMeasure",
  "massUnit",
  "massScale",
  "capacityMeasure",
  "durationUnit",
  "weekCycle",
  "calendarFind",
  "calendarNavigate",
  "calendarEvent",
  "timeSequence",
  "routineSequence",
  "toolChoice",
  "balanceScale",
  "analogClock",
  "groundCollect",
  "groundBuild",
  "groundCompare",
  "groundFlash",
  "groundGrowingCount",
  "groundHunt",
  "groundOrderTap",
  "groundSequence",
  "groundTapCount",
  "groundMoveCount",
  "groundFeed",
  "groundSoundCount",
  "mcq",
  "count",
  "order3",
  "audioPick",
  "numberHunt",
  "groupCountVisual",
]);

export function isPracticeTaskSafe(task: PracticeTask | null | undefined): boolean {
  return !!task && hasText(task.kind) && SUPPORTED_PRACTICE_TASK_KINDS.has(task.kind);
}
