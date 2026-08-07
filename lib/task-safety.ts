import type { PracticeTask, StarpathObjectTask } from "@/data/activities/year1/practice-task";
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
  "equalGroups",
  "equalGroupsMcq",
  "groupBoxesBuilder",
  "groupBoxes",
  "groupingEstimate",
  "addDotsMatch",
  "addDots",
  "partPartWhole",
  "ppw",
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
  "groundFoundation",
  "groundOrdinal",
  "groundSpatial",
  "repeatingPattern",
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
  "volume",
  "metricConvert",
  "angleReason",
  "investigation",
  "temperature",
  "perimeterCalc",
  "timeQuest",
  "angleQuest",
  "metricUnit",
  "precisionMeasure",
  "time24",
  "timetable",
  "protractor",
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
  "starpathShapeIntro",
  "starpathShapeMatch",
  "starpathShapeSort",
  "starpathShapeScene",
  "starpathObjectShape",
  "starpathShapeName",
  "starpathShapeTapAll",
  "starpathOddOneOut",
  "starpathCollectMission",
  "starpathFinishPicture",
  "starpathShapeBuilder",
  "starpathBuildShapeIdentify",
  "starpathBuildMatch",
  "starpathSpaceMuseum",
  "starpathShapeCompare",
  "starpathFamilySort",
  "starpathWhatChanged",
  "starpathShapeDisguise",
  "starpathShapeFaceOff",
  "starpathMysteryShape",
  "starpathShapeSprint",
  "starpathPositionFind",
  "starpathPositionWord",
  "starpathPositionPlace",
  "starpathPositionPicture",
  "starpathPositionSequence",
  "starpathDirectionPath",
  "starpathDirectionChoice",
  "starpathShapeClassify",
  "starpathViewpoint",
  "starpathTurnMove",
  "starpathRouteDebug",
  "starpathRouteBuild",
  "starpathRouteRecord",
  "starpathShapeHunt",
  "starpathShapeWorkshop",
  "starpathObjectSpotter",
  "starpathObjectCompare",
  "starpathObjectMatch",
  "starpathMapLocate",
  "starpathMapCreate",
  "starpathShapeFeature",
  "starpathMapRoute",
  "starpathSteer",
  "starpathGridReference",
  "starpathGridRoute",
  "starpathComposite",
  "starpathSymmetry",
  "starpathNet",
  "starpathCoordinate",
  "starpathObject",
  "mcq",
  "count",
  "order3",
  "audioPick",
  "numberHunt",
  "groupCountVisual",
]);

export function isPracticeTaskSafe(task: PracticeTask | null | undefined): boolean {
  if (!task || !hasText(task.kind) || !SUPPORTED_PRACTICE_TASK_KINDS.has(task.kind)) return false;
  if (task.kind !== "starpathObject") return true;
  const objectTask = task as StarpathObjectTask;

  if (!hasText(objectTask.prompt) || !hasText(objectTask.speakText) || !hasText(objectTask.feedback.correct) || !hasText(objectTask.feedback.wrong)) {
    return false;
  }

  if (objectTask.mode === "name" || objectTask.mode === "compare") {
    const optionIds = new Set(objectTask.options.map((option) => option.id));
    return objectTask.scene.length > 0 && objectTask.options.length >= 2 && optionIds.size === objectTask.options.length && optionIds.has(objectTask.correctOptionId);
  }

  if (objectTask.mode === "find") {
    const sceneIds = new Set(objectTask.scene.map((item) => item.id));
    return objectTask.scene.length >= 2 && sceneIds.size === objectTask.scene.length && sceneIds.has(objectTask.correctObjectId);
  }

  if (objectTask.mode === "classify") {
    const sceneIds = new Set(objectTask.scene.map((item) => item.id));
    const groupIds = new Set(objectTask.groups.map((group) => group.id));
    return (
      objectTask.scene.length >= 2 &&
      objectTask.groups.length >= 2 &&
      sceneIds.size === objectTask.scene.length &&
      groupIds.size === objectTask.groups.length &&
      objectTask.scene.every((item) => groupIds.has(objectTask.assignments[item.id]))
    );
  }

  if (objectTask.mode !== "build") return false;

  const paletteIds = new Set(objectTask.palette.map((piece) => piece.id));
  const slotIds = new Set(objectTask.slots.map((slot) => slot.id));
  const availableByShape = new Map<string, number>();
  const requiredByShape = new Map<string, number>();
  objectTask.palette.forEach((piece) => availableByShape.set(piece.shape, (availableByShape.get(piece.shape) ?? 0) + 1));
  objectTask.slots.forEach((slot) => requiredByShape.set(slot.shape, (requiredByShape.get(slot.shape) ?? 0) + 1));
  return (
    hasText(objectTask.modelName) &&
    hasText(objectTask.viewBox) &&
    objectTask.palette.length >= objectTask.slots.length &&
    objectTask.slots.length >= 2 &&
    paletteIds.size === objectTask.palette.length &&
    slotIds.size === objectTask.slots.length &&
    // every part has enough palette pieces of its shape to fill it
    [...requiredByShape].every(([shape, count]) => (availableByShape.get(shape) ?? 0) >= count)
  );
}
