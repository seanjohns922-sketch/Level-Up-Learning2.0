import type { PracticeTask, StarpathGroundAssessmentTask, StarpathObjectTask } from "@/data/activities/year1/practice-task";
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
  // Pattern Peaks lessons let the generator choose each question's kind, so a
  // "solve the ?" item can render as a typed input even in a rotation slot that
  // was seeded as multiple choice.
  const isPatternPeaks = typeof activity.config?.patternSkill === "string";
  return mode.startsWith("y6_") || isPatternPeaks;
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
  "starpathGroundAssessment",
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
  "starpathCrossSection",
  "starpathCartesian",
  "starpathTessellation",
  "statisticaCollect",
  "statisticaConcept",
  "statisticaDisplayStudio",
  "statisticaMediaAnalysis",
  "statisticaClassify",
  "statisticaInference",
  "statisticaPictograph",
  "statisticaShape",
  "statisticaInvestigation",
  "statisticaLineGraph",
  "statisticaRank",
  "statisticaGap",
  "statisticaTapGraph",
  "statisticaTable",
  "statisticaSort",
  "statisticaTally",
  "statisticaGraph",
  "patternPeaksQuestion",
  "starpathLevel6Assessment",
  "starpathCoordinate",
  "starpathTransform",
  "starpathObject",
  "mcq",
  "count",
  "order3",
  "audioPick",
  "numberHunt",
  "groupCountVisual",
  "chanceSpinTally",
  "chanceAutoTally",
  "chanceBuildFair",
  "chanceDependentDraw",
  "chanceCompare",
  "chancePredictCount",
  "chanceDiceRace",
  "chanceScalePortal",
  "chanceFormMatch",
  "chanceProbabilityForge",
  "chanceSimulationLab",
  "chanceModelDebugger",
  "chanceMasterTrial",
  "chanceQuizQuestion",
]);

export function isPracticeTaskSafe(task: PracticeTask | null | undefined): boolean {
  if (!task || !hasText(task.kind) || !SUPPORTED_PRACTICE_TASK_KINDS.has(task.kind)) return false;
  if (task.kind === "chanceQuizQuestion") {
    return hasText(task.prompt)
      && hasText(task.speakText)
      && task.options.length >= 3
      && new Set(task.options).size === task.options.length
      && task.options.every(hasText)
      && task.options.includes(task.answer)
      && hasText(task.feedback.correct)
      && hasText(task.feedback.wrong);
  }
  if (task.kind === "statisticaMediaAnalysis") {
    const optionIds = new Set(task.options.map((option) => option.id));
    return hasText(task.prompt)
      && hasText(task.speakText)
      && hasText(task.claim)
      && hasText(task.data.title)
      && hasText(task.data.unit)
      && task.data.labels.length >= 2
      && task.data.labels.length === task.data.values.length
      && task.data.labels.every(hasText)
      && task.data.values.every((value) => Number.isFinite(value) && value >= 0)
      && task.options.length >= 2
      && optionIds.size === task.options.length
      && task.options.every((option) => hasText(option.label))
      && task.correctOptionIds.length === 1
      && optionIds.has(task.correctOptionIds[0]!);
  }
  if (task.kind === "starpathLevel6Assessment") {
    if (!hasText(task.prompt) || !hasText(task.speakText) || !hasText(task.contextLabel)) return false;
    if (!hasText(task.feedback.correct) || task.feedback.correct !== task.feedback.wrong) return false;
    if (task.mode === "diagnose") {
      const optionIds = new Set((task.options ?? []).map((option) => option.id));
      return (task.options?.length ?? 0) >= 2
        && optionIds.size === task.options?.length
        && optionIds.has(task.correctOptionId ?? "");
    }
    if (task.mode === "crossSectionProfile") {
      return task.profileAnswer?.length === 3
        && task.profileAnswer.every((value) => Number.isInteger(value) && value >= 1 && value <= 6);
    }
    if (task.mode === "coordinatePlot") {
      const range = task.range ?? 4;
      const pointKeys = new Set((task.targetPoints ?? []).map((point) => `${point.x}:${point.y}`));
      return Number.isInteger(range)
        && range >= 3
        && range <= 6
        && (task.targetPoints?.length ?? 0) >= 1
        && (task.targetPoints?.length ?? 0) <= 3
        && pointKeys.size === task.targetPoints?.length
        && (task.targetPoints ?? []).every((point) => Number.isInteger(point.x) && Number.isInteger(point.y) && Math.abs(point.x) <= range && Math.abs(point.y) <= range);
    }
    if (task.mode === "transformChain") {
      return Boolean(task.start)
        && Number.isInteger(task.start?.x)
        && Number.isInteger(task.start?.y)
        && (task.operations?.length ?? 0) >= 2
        && (task.operations?.length ?? 0) <= 3
        && (task.operations ?? []).every((operation) => hasText(operation.label) && (operation.kind !== "translate" || (Number.isInteger(operation.dx) && Number.isInteger(operation.dy))));
    }
    return Boolean(task.ruleAnswer)
      && Number.isInteger(task.ruleAnswer?.across)
      && Number.isInteger(task.ruleAnswer?.down)
      && Number.isInteger(task.ruleAnswer?.quarterTurns)
      && Math.abs(task.ruleAnswer?.across ?? 0) <= 6
      && Math.abs(task.ruleAnswer?.down ?? 0) <= 6
      && (task.ruleAnswer?.quarterTurns ?? -1) >= 0
      && (task.ruleAnswer?.quarterTurns ?? 4) <= 3;
  }
  if (task.kind === "starpathGroundAssessment") {
    const assessmentTask = task as StarpathGroundAssessmentTask;
    if (!hasText(assessmentTask.prompt) || !hasText(assessmentTask.speakText)) return false;
    if (
      !Number.isInteger(assessmentTask.rows)
      || !Number.isInteger(assessmentTask.cols)
      || assessmentTask.rows < 1
      || assessmentTask.cols < 1
      || assessmentTask.rows > 12
      || assessmentTask.cols > 12
    ) return false;
    const isBoardCell = (r: number, c: number) => (
      Number.isInteger(r)
      && Number.isInteger(c)
      && r >= 0
      && r < assessmentTask.rows
      && c >= 0
      && c < assessmentTask.cols
    );
    if (assessmentTask.mode === "route") return assessmentTask.answerMoves.length > 0;
    const tokenIds = new Set(assessmentTask.tokens.map((token) => token.id));
    const answerCells = new Set(assessmentTask.answer.map((answer) => `${answer.r}:${answer.c}`));
    const fixedCells = new Set((assessmentTask.fixed ?? []).map((item) => `${item.r}:${item.c}`));
    return assessmentTask.tokens.length > 0
      && tokenIds.size === assessmentTask.tokens.length
      && assessmentTask.answer.length === assessmentTask.tokens.length
      && answerCells.size === assessmentTask.answer.length
      && fixedCells.size === (assessmentTask.fixed ?? []).length
      && assessmentTask.answer.every((answer) => (
        tokenIds.has(answer.tokenId)
        && isBoardCell(answer.r, answer.c)
        && !fixedCells.has(`${answer.r}:${answer.c}`)
      ))
      && (assessmentTask.fixed ?? []).every((item) => isBoardCell(item.r, item.c));
  }
  if (task.kind === "chanceSpinTally" || task.kind === "chanceAutoTally") {
    return hasText(task.prompt)
      && Array.isArray(task.draw) && task.draw.length >= 2
      && Array.isArray(task.labels) && task.labels.length >= 2
      && Number.isInteger(task.spins) && task.spins >= 1
      && task.labels.every((label) => hasText(label.key) && hasText(label.name));
  }
  if (task.kind === "chanceBuildFair") {
    return hasText(task.prompt)
      && Array.isArray(task.colours) && task.colours.length === 2
      && Number.isInteger(task.maxParts) && task.maxParts >= 2
      && task.colours.every((c) => hasText(c.key) && hasText(c.name) && hasText(c.colour));
  }
  if (task.kind === "chanceDependentDraw") {
    return hasText(task.prompt) && hasText(task.question)
      && Array.isArray(task.bag) && task.bag.length >= 2
      && task.bag.every((g) => hasText(g.key) && hasText(g.name) && hasText(g.colour) && Number.isInteger(g.count) && g.count >= 1)
      && (task.action === "replace" || task.action === "keep")
      && task.bag.some((g) => g.key === task.drawKey)
      && task.bag.some((g) => g.key === task.askKey)
      && Array.isArray(task.options) && task.options.length >= 2
      && new Set(task.options).size === task.options.length
      && task.options.includes(task.answer);
  }
  if (task.kind === "chancePredictCount") {
    return hasText(task.prompt)
      && Array.isArray(task.wedges) && task.wedges.length >= 2
      && hasText(task.targetKey) && hasText(task.targetName)
      && Number.isInteger(task.spins) && task.spins >= 1
      && task.wedges.includes(task.targetKey);
  }
  if (task.kind === "chanceCompare") {
    return hasText(task.prompt)
      && Array.isArray(task.tools) && task.tools.length >= 2
      && task.tools.every((t) => hasText(t.label) && Boolean(t.visual))
      && Array.isArray(task.options) && task.options.length >= 2
      && new Set(task.options).size === task.options.length
      && task.options.includes(task.answer);
  }
  if (task.kind === "chanceDiceRace") {
    const choiceIds = new Set(task.choices.map((choice) => choice.id));
    return hasText(task.prompt)
      && task.choices.length >= 2
      && choiceIds.size === task.choices.length
      && choiceIds.has(task.answerId)
      && task.choices.every((choice) => hasText(choice.label)
        && choice.playerDifferences.length > 0
        && choice.chanziaDifferences.length > 0
        && [...choice.playerDifferences, ...choice.chanziaDifferences].every((value) => Number.isInteger(value) && value >= 0 && value <= 5))
      && hasText(task.opponentName)
      && hasText(task.opponentImage)
      && Number.isInteger(task.winningScore)
      && task.winningScore >= 1;
  }
  if (task.kind === "chanceScalePortal") {
    return hasText(task.prompt) && hasText(task.sourceLabel)
      && Number.isFinite(task.targetValue) && task.targetValue >= 0 && task.targetValue <= 1
      && Number.isFinite(task.scaleStep) && task.scaleStep > 0 && task.scaleStep <= 0.25;
  }
  if (task.kind === "chanceFormMatch") {
    return hasText(task.prompt) && hasText(task.anchorLabel)
      && Array.isArray(task.options) && task.options.length >= 3
      && task.options.some((o) => o.correct) && task.options.every((o) => hasText(o.label));
  }
  if (task.kind === "chanceProbabilityForge") {
    return hasText(task.prompt) && hasText(task.targetLabel)
      && Number.isInteger(task.total) && task.total >= 2
      && Number.isInteger(task.targetWinning) && task.targetWinning >= 0 && task.targetWinning <= task.total
      && Number.isInteger(task.initialWinning) && task.initialWinning >= 0 && task.initialWinning <= task.total
      && (task.sourceWinning === undefined || (Number.isInteger(task.sourceWinning) && task.sourceWinning >= 0 && task.sourceWinning <= task.total));
  }
  if (task.kind === "chanceSimulationLab") {
    return hasText(task.prompt) && hasText(task.targetName)
      && Number.isInteger(task.total) && task.total >= 2
      && Number.isInteger(task.winning) && task.winning >= 1 && task.winning < task.total
      && task.stages.length >= 1 && task.stages.length <= 3
      && task.stages.every((stage) => Number.isInteger(stage) && stage >= 5 && stage <= 1000);
  }
  if (task.kind === "chanceModelDebugger") {
    const ids = new Set(task.machines.map((machine) => machine.id));
    return hasText(task.prompt) && hasText(task.scenario) && hasText(task.reason)
      && task.machines.length >= 3 && ids.size === task.machines.length && ids.has(task.answerId)
      && task.machines.every((machine) => hasText(machine.title) && hasText(machine.detail));
  }
  if (task.kind === "chanceMasterTrial") {
    return hasText(task.prompt) && hasText(task.opponentName) && hasText(task.opponentImage)
      && Number.isInteger(task.total) && task.total >= 2
      && Number.isInteger(task.targetWinning) && task.targetWinning >= 1 && task.targetWinning < task.total
      && Number.isInteger(task.trials) && task.trials >= 10
      && Number.isInteger(task.observed) && task.observed >= 0 && task.observed <= task.trials;
  }
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
