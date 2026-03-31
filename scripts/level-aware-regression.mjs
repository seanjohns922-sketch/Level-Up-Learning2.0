#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const moduleCache = new Map();

function loadTsModule(relativePath) {
  const absPath = path.resolve(repoRoot, relativePath);
  if (moduleCache.has(absPath)) {
    return moduleCache.get(absPath);
  }
  const source = fs.readFileSync(absPath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    fileName: absPath,
  }).outputText;

  const loadedModule = { exports: {} };
  moduleCache.set(absPath, loadedModule.exports);
  const context = vm.createContext({
    module: loadedModule,
    exports: loadedModule.exports,
    require: (specifier) => {
      const fromDir = path.dirname(absPath);
      const target =
        specifier.startsWith("@/")
          ? path.resolve(repoRoot, specifier.slice(2))
          : specifier.startsWith(".")
          ? path.resolve(fromDir, specifier)
          : null;

      if (!target) {
        throw new Error(`Unexpected runtime require "${specifier}" while loading ${relativePath}`);
      }

      const withExt = fs.existsSync(target) && fs.statSync(target).isFile()
        ? target
        : fs.existsSync(`${target}.ts`)
        ? `${target}.ts`
        : fs.existsSync(path.join(target, "index.ts"))
        ? path.join(target, "index.ts")
        : null;

      if (!withExt) {
        throw new Error(`Unable to resolve "${specifier}" while loading ${relativePath}`);
      }

      const nestedRelative = path.relative(repoRoot, withExt);
      return loadTsModule(nestedRelative);
    },
    process,
    console,
    __filename: absPath,
    __dirname: path.dirname(absPath),
  });

  new vm.Script(compiled, { filename: absPath }).runInContext(context);
  moduleCache.set(absPath, loadedModule.exports);
  return loadedModule.exports;
}

const engine = loadTsModule("data/activities/year2/lessonEngine.ts");
const { year2NumberRows } = loadTsModule("data/programs/raw/year2NumberRows.ts");
const { YEAR3_PROGRAM } = loadTsModule("data/programs/year3.ts");
const assessments = loadTsModule("data/assessments/api.ts");

const {
  getLevelForLesson,
  buildLessonActivityPool,
  buildQuizActivityPool,
  generateQuestion,
  validateLessonActivityIntentForLevel,
} = engine;

const {
  getPretestForLevel,
  getPosttestForLevel,
  validateAssessmentBlueprintForLevel,
} = assessments;

const findings = [];
const YEAR3_ALLOWED_FACTORS = new Set([2, 3, 4, 5, 10]);
const YEAR3_ALLOWED_FRACTION_DENOMINATORS = new Set([2, 3, 4, 5, 10]);

function addFinding(scope, issue) {
  findings.push(`${scope} | ${issue}`);
}

function checkLesson(programLabel, lesson) {
  const level = getLevelForLesson(lesson);
  const lessonPool = buildLessonActivityPool(level, lesson);
  if (lessonPool.violations.length > 0) {
    for (const violation of lessonPool.violations) {
      addFinding(`${programLabel} ${lesson.id} lesson_pool`, `${violation.reason}: ${violation.message}`);
    }
  }
  if (lessonPool.activities.length === 0) {
    addFinding(`${programLabel} ${lesson.id} lesson_pool`, "No valid lesson activities available.");
    return;
  }

  for (const activity of lessonPool.activities) {
    const validation = validateLessonActivityIntentForLevel(level, lesson, activity);
    if (!validation.valid) {
      for (const violation of validation.violations) {
        addFinding(`${programLabel} ${lesson.id} pre`, `${violation.reason}: ${violation.message}`);
      }
      continue;
    }

    try {
      const question = generateQuestion(level, lesson, activity);
      const post = validateLessonActivityIntentForLevel(level, lesson, activity, question);
      if (!post.valid) {
        for (const violation of post.violations) {
          addFinding(`${programLabel} ${lesson.id} post`, `${violation.reason}: ${violation.message}`);
        }
      }
    } catch (error) {
      addFinding(`${programLabel} ${lesson.id} generate`, error instanceof Error ? error.message : String(error));
    }
  }
}

function checkYear3MultiplicativeRestriction(lesson) {
  const level = getLevelForLesson(lesson);
  const lessonPool = buildLessonActivityPool(level, lesson);
  for (const activity of lessonPool.activities) {
    let question;
    try {
      question = generateQuestion(level, lesson, activity);
    } catch (error) {
      addFinding(`Year 3 ${lesson.id} factor_check`, error instanceof Error ? error.message : String(error));
      continue;
    }

    if (question.kind === "equal_groups") {
      if (!YEAR3_ALLOWED_FACTORS.has(question.groups) || !YEAR3_ALLOWED_FACTORS.has(question.itemsPerGroup)) {
        addFinding(`Year 3 ${lesson.id} factor_check`, `equal_groups used ${question.groups} groups of ${question.itemsPerGroup}.`);
      }
    }

    if (question.kind === "arrays") {
      if (!YEAR3_ALLOWED_FACTORS.has(question.rows) || !YEAR3_ALLOWED_FACTORS.has(question.columns)) {
        addFinding(`Year 3 ${lesson.id} factor_check`, `arrays used ${question.rows} x ${question.columns}.`);
      }
    }

    if (question.kind === "division_groups") {
      if (!YEAR3_ALLOWED_FACTORS.has(question.groups) || !YEAR3_ALLOWED_FACTORS.has(question.groupSize)) {
        addFinding(`Year 3 ${lesson.id} factor_check`, `division_groups used ${question.groups} groups of ${question.groupSize}.`);
      }
    }

    if (question.kind === "fact_family") {
      if (!YEAR3_ALLOWED_FACTORS.has(question.family[0]) || !YEAR3_ALLOWED_FACTORS.has(question.family[1])) {
        addFinding(`Year 3 ${lesson.id} factor_check`, `fact_family used ${question.family[0]} and ${question.family[1]}.`);
      }
    }

    if (question.kind === "skip_count") {
      if (!YEAR3_ALLOWED_FACTORS.has(question.step)) {
        addFinding(`Year 3 ${lesson.id} factor_check`, `skip_count used step ${question.step}.`);
      }
    }

    if (question.kind === "mixed_word_problem") {
      const factorCandidates = new Set();
      const prompt = question.prompt;
      const groupedMatches = [
        ...prompt.matchAll(/\b(\d+)\s+bags\s+with\s+(\d+)\b/gi),
        ...prompt.matchAll(/\b(\d+)\s+rows\s+with\s+(\d+)\b/gi),
        ...prompt.matchAll(/\binto\s+(\d+)\s+(?:equal\s+)?groups\b/gi),
        ...prompt.matchAll(/\bgroups\s+of\s+(\d+)\b/gi),
      ];

      for (const match of groupedMatches) {
        for (const value of match.slice(1)) {
          if (!value) continue;
          const parsed = Number(value);
          if (parsed > 1 && parsed <= 10) {
            factorCandidates.add(parsed);
          }
        }
      }

      if ([...factorCandidates].some((value) => !YEAR3_ALLOWED_FACTORS.has(value))) {
        addFinding(`Year 3 ${lesson.id} factor_check`, `mixed_word_problem prompt used restricted factor outside set: ${question.prompt}`);
      }
    }
  }
}

function checkYear3Week9SkipCounting(lesson) {
  const level = getLevelForLesson(lesson);
  const lessonPool = buildLessonActivityPool(level, lesson);
  const distribution = new Map([
    [100, { friendly: 0, nonFriendly: 0 }],
    [1000, { friendly: 0, nonFriendly: 0 }],
  ]);

  for (const activity of lessonPool.activities) {
    const activityStep =
      typeof activity.config?.step === "number" ? activity.config.step : undefined;
    if (
      (activity.activityType !== "skip_count" && activity.sourceActivityType !== "skip_count") ||
      (activityStep !== 100 && activityStep !== 1000)
    ) {
      continue;
    }

    for (let sample = 0; sample < 24; sample += 1) {
      let question;
      try {
        question = generateQuestion(level, lesson, activity);
      } catch (error) {
        addFinding(`Year 3 ${lesson.id} skip_hundreds`, error instanceof Error ? error.message : String(error));
        continue;
      }

      const prompt = question.prompt;
      const expectedStep = activityStep;
      const values =
        question.kind === "skip_count"
          ? question.sequence.filter((value) => value !== -1)
          : ((prompt.split(". ").pop() ?? prompt).match(/\d+/g) ?? []).map(Number);
      if (values.length < 3) {
        addFinding(`Year 3 ${lesson.id} skip_hundreds`, `Expected multiple sequence values in prompt: ${prompt}`);
        continue;
      }

      for (let index = 1; index < values.length; index += 1) {
        const difference = Math.abs(values[index] - values[index - 1]);
        if (difference % expectedStep !== 0 || difference < expectedStep || difference > expectedStep * 2) {
          addFinding(`Year 3 ${lesson.id} skip_counting`, `Sequence changed by ${difference} instead of ${expectedStep}: ${prompt}`);
          break;
        }
        const placeDelta =
          Math.floor(values[index] / expectedStep) - Math.floor(values[index - 1] / expectedStep);
        const expectedDirection = values[index] > values[index - 1] ? 1 : -1;
        if (placeDelta !== expectedDirection && placeDelta !== expectedDirection * 2) {
          addFinding(`Year 3 ${lesson.id} skip_counting`, `Sequence changed digits outside the ${expectedStep}s place: ${prompt}`);
          break;
        }
      }

      const constantSuffix = values.every((value) => value % expectedStep === values[0] % expectedStep);
      if (!constantSuffix) {
        addFinding(`Year 3 ${lesson.id} skip_counting`, `Digits below the ${expectedStep}s place did not stay constant: ${prompt}`);
      }

      const counts = distribution.get(expectedStep);
      if (!counts) continue;
      if (values[0] % expectedStep === 0) {
        counts.friendly += 1;
      } else {
        counts.nonFriendly += 1;
      }
    }
  }

  for (const [step, counts] of distribution.entries()) {
    if (counts.friendly === 0 && counts.nonFriendly === 0) {
      addFinding(`Year 3 ${lesson.id} skip_counting`, `No samples found for step ${step}.`);
      continue;
    }
    const total = counts.friendly + counts.nonFriendly;
    const friendlyRatio = total > 0 ? counts.friendly / total : 0;
    if (friendlyRatio < 0.4) {
      addFinding(`Year 3 ${lesson.id} skip_counting`, `Friendly starts are too rare for step ${step}. Saw ${counts.friendly} friendly and ${counts.nonFriendly} non-friendly.`);
    }
  }
}

function checkYear3Week9Lesson3Estimation(lesson) {
  const numberLineActivities = lesson.activities.filter((activity) => activity.activityType === "number_line");
  const numberLineWrappers = lesson.activities.filter(
    (activity) => activity.config?.sourceActivityType === "number_line"
  );

  if (numberLineActivities.length !== 1) {
    addFinding(`Year 3 ${lesson.id} estimation`, `Expected exactly 1 rounding activity, found ${numberLineActivities.length}.`);
  }
  if (numberLineWrappers.length > 0) {
    addFinding(`Year 3 ${lesson.id} estimation`, "Lesson should not include number_line wrappers beyond the single rounding activity.");
  }

  const level = getLevelForLesson(lesson);
  const lessonPool = buildLessonActivityPool(level, lesson);
  for (const activity of lessonPool.activities) {
    let question;
    try {
      question = generateQuestion(level, lesson, activity);
    } catch (error) {
      addFinding(`Year 3 ${lesson.id} estimation`, error instanceof Error ? error.message : String(error));
      continue;
    }

    if (activity.activityType === "number_line") {
      if (question.kind !== "number_line" || question.mode !== "rounding") {
        addFinding(`Year 3 ${lesson.id} estimation`, "The single number_line activity must stay as a rounding question.");
      }
      continue;
    }

    const isEstimationWrapper =
      question.kind === "multiple_choice" && activity.config?.sourceActivityType === "mixed_word_problem";
    if (question.kind !== "mixed_word_problem" && !isEstimationWrapper) {
      addFinding(`Year 3 ${lesson.id} estimation`, `Expected estimation word problems after rounding, got ${question.kind}.`);
      continue;
    }

    if (!/About how many/i.test(question.prompt)) {
      addFinding(`Year 3 ${lesson.id} estimation`, `Estimation prompt missing 'About how many': ${question.prompt}`);
    }
  }
}

function checkYear3FractionLessonAlignment(lesson) {
  const allowedByLesson = {
    "y3-w11-l1": ["area_model_select"],
    "y3-w11-l2": ["set_model_select"],
    "y3-w11-l3": ["build_the_whole"],
    "y3-w12-l1": [
      "equivalent_fraction_match",
      "equivalent_fraction_build",
      "equivalent_fraction_yes_no",
    ],
    "y3-w12-l2": ["number_line_place"],
    "y3-w12-l3": ["fraction_compare"],
  };

  const allowed = allowedByLesson[lesson.id];
  if (!allowed) return;

  for (const activity of lesson.activities) {
    if (!allowed.includes(activity.activityType)) {
      addFinding(`Year 3 ${lesson.id} fractions`, `Unexpected activity type ${activity.activityType} for fraction lesson.`);
    }
  }

  const level = getLevelForLesson(lesson);
  const lessonPool = buildLessonActivityPool(level, lesson);
  for (const activity of lessonPool.activities) {
    let question;
    try {
      question = generateQuestion(level, lesson, activity);
    } catch (error) {
      addFinding(`Year 3 ${lesson.id} fractions`, error instanceof Error ? error.message : String(error));
      continue;
    }

    if (!allowed.includes(question.kind)) {
      addFinding(`Year 3 ${lesson.id} fractions`, `Generated ${question.kind} instead of ${allowed.join(", ")}.`);
    }
  }
}

function checkYear3FractionDenominators(lesson) {
  const level = getLevelForLesson(lesson);
  const lessonPool = buildLessonActivityPool(level, lesson);

  function collectFractions(question) {
    const labels = [];
    if ("fractionLabel" in question && typeof question.fractionLabel === "string") {
      labels.push(question.fractionLabel);
    }
    if ("targetFraction" in question && typeof question.targetFraction === "string") {
      labels.push(question.targetFraction);
    }
    if ("fractions" in question && Array.isArray(question.fractions)) {
      labels.push(...question.fractions.filter((value) => typeof value === "string"));
    }
    if ("leftFraction" in question && typeof question.leftFraction === "string") {
      labels.push(question.leftFraction);
    }
    if ("rightFraction" in question && typeof question.rightFraction === "string") {
      labels.push(question.rightFraction);
    }
    if ("options" in question && Array.isArray(question.options)) {
      labels.push(
        ...question.options.filter(
          (value) => typeof value === "string" && /^\d+\/\d+$/.test(value)
        )
      );
    }
    return labels;
  }

  for (const activity of lessonPool.activities) {
    let question;
    try {
      question = generateQuestion(level, lesson, activity);
    } catch (error) {
      addFinding(`Year 3 ${lesson.id} fraction_denominators`, error instanceof Error ? error.message : String(error));
      continue;
    }
    const labels = collectFractions(question);
    for (const label of labels) {
      const denominator = Number(label.split("/")[1]);
      if (!YEAR3_ALLOWED_FRACTION_DENOMINATORS.has(denominator)) {
        addFinding(`Year 3 ${lesson.id} fraction_denominators`, `Found disallowed denominator in ${label}.`);
      }
    }
  }
}

function toLesson(row) {
  return {
    id: `y2-w${row.week}-l${row.lesson}`,
    week: row.week,
    lesson: row.lesson,
    title: row.topic,
    focus: row.focus,
    activityIdeas: [row.activity],
    curriculum: row.curriculum,
    activities: row.activities,
  };
}

function checkQuiz(programLabel, lesson) {
  if (!lesson) {
    addFinding(`${programLabel} quiz`, "Missing lesson for quiz regression target.");
    return;
  }
  const level = getLevelForLesson(lesson);
  const quizPool = buildQuizActivityPool(level, lesson, { allowGenericFallback: false });
  if (quizPool.violations.length > 0) {
    for (const violation of quizPool.violations) {
      addFinding(`${programLabel} ${lesson.id} quiz_pool`, `${violation.reason}: ${violation.message}`);
    }
  }
  if (quizPool.activities.length === 0) {
    addFinding(`${programLabel} ${lesson.id} quiz_pool`, "No valid quiz activities available.");
  }
}

const year2Targets = [1, 6, 8, 9, 10, 12];
for (const week of year2Targets) {
  const lesson = year2NumberRows
    .filter((row) => row.week === week)
    .sort((a, b) => a.lesson - b.lesson)
    .map(toLesson)[0];
  if (!lesson) {
    addFinding(`Year 2 W${week}`, "Missing lesson for regression target.");
    continue;
  }
  checkLesson("Year 2", lesson);
}

const year3Targets = [1, 6, 12];
for (const week of year3Targets) {
  const weekPlan = YEAR3_PROGRAM.find((item) => item.week === week);
  const lesson = weekPlan?.lessons?.[0];
  if (!lesson) {
    addFinding(`Year 3 W${week}`, "Missing lesson for regression target.");
    continue;
  }
  checkLesson("Year 3", lesson);
}

const year3Week3Lesson3 = YEAR3_PROGRAM.find((item) => item.week === 3)?.lessons?.find(
  (lesson) => lesson.lesson === 3
);
if (!year3Week3Lesson3) {
  addFinding("Year 3 W3 L3", "Missing lesson for regression target.");
} else {
  checkLesson("Year 3", year3Week3Lesson3);
}

const year3Week4 = YEAR3_PROGRAM.find((item) => item.week === 4);
if (!year3Week4?.lessons?.length) {
  addFinding("Year 3 W4", "Missing lessons for regression target.");
} else {
  for (const lesson of year3Week4.lessons) {
    checkLesson("Year 3", lesson);
  }
}

const year3Week5 = YEAR3_PROGRAM.find((item) => item.week === 5);
if (!year3Week5?.lessons?.length) {
  addFinding("Year 3 W5", "Missing lessons for regression target.");
} else {
  for (const lesson of year3Week5.lessons) {
    checkLesson("Year 3", lesson);
  }
}

const year3Week6 = YEAR3_PROGRAM.find((item) => item.week === 6);
if (!year3Week6?.lessons?.length) {
  addFinding("Year 3 W6", "Missing lessons for regression target.");
} else {
  for (const lesson of year3Week6.lessons) {
    checkLesson("Year 3", lesson);
  }
}

for (const week of [7, 8, 10]) {
  const weekPlan = YEAR3_PROGRAM.find((item) => item.week === week);
  if (!weekPlan?.lessons?.length) {
    addFinding(`Year 3 W${week}`, "Missing multiplicative lessons for regression target.");
    continue;
  }
  for (const lesson of weekPlan.lessons) {
    checkLesson("Year 3", lesson);
    checkYear3MultiplicativeRestriction(lesson);
  }
}

const year3Week9Lesson1 = YEAR3_PROGRAM.find((item) => item.week === 9)?.lessons?.find(
  (lesson) => lesson.lesson === 1
);
if (!year3Week9Lesson1) {
  addFinding("Year 3 W9 L1", "Missing skip-count lesson for regression target.");
} else {
  checkLesson("Year 3", year3Week9Lesson1);
  checkYear3Week9SkipCounting(year3Week9Lesson1);
}

const year3Week9Lesson3 = YEAR3_PROGRAM.find((item) => item.week === 9)?.lessons?.find(
  (lesson) => lesson.lesson === 3
);
if (!year3Week9Lesson3) {
  addFinding("Year 3 W9 L3", "Missing estimation lesson for regression target.");
} else {
  checkLesson("Year 3", year3Week9Lesson3);
  checkYear3Week9Lesson3Estimation(year3Week9Lesson3);
}

for (const week of [11, 12]) {
  const weekPlan = YEAR3_PROGRAM.find((item) => item.week === week);
  if (!weekPlan?.lessons?.length) {
    addFinding(`Year 3 W${week}`, "Missing fraction lessons for regression target.");
    continue;
  }
  for (const lesson of weekPlan.lessons) {
    checkLesson("Year 3", lesson);
    checkYear3FractionLessonAlignment(lesson);
    checkYear3FractionDenominators(lesson);
  }
}

checkQuiz(
  "Year 2",
  year2NumberRows
    .filter((row) => row.week === 9)
    .sort((a, b) => a.lesson - b.lesson)
    .map(toLesson)[0]
);
checkQuiz(
  "Year 2",
  year2NumberRows
    .filter((row) => row.week === 10)
    .sort((a, b) => a.lesson - b.lesson)
    .map(toLesson)[0]
);
checkQuiz("Year 3", YEAR3_PROGRAM.find((item) => item.week === 6)?.lessons?.[0]);

const year2Pretest = getPretestForLevel(2);
const year3Pretest = getPretestForLevel(3);
const year2Posttest = getPosttestForLevel(2);
const year3Posttest = getPosttestForLevel(3);
const year3AssessmentValidation = validateAssessmentBlueprintForLevel(3);

if (!year2Pretest.length) addFinding("Assessments Year 2 pretest", "No questions returned.");
if (!year3Pretest.length) addFinding("Assessments Year 3 pretest", "No questions returned.");
if (!year2Posttest?.questions?.length) addFinding("Assessments Year 2 posttest", "No questions returned.");
if (!year3Posttest?.questions?.length) addFinding("Assessments Year 3 posttest", "No questions returned.");
if (year3Pretest.length !== 20) addFinding("Assessments Year 3 pretest", `Expected 20 questions, got ${year3Pretest.length}.`);
if ((year3Posttest?.questions?.length ?? 0) !== 20) addFinding("Assessments Year 3 posttest", `Expected 20 questions, got ${year3Posttest?.questions?.length ?? 0}.`);
for (const issue of year3AssessmentValidation) {
  addFinding("Assessments Year 3 blueprint", issue);
}

if (findings.length === 0) {
  console.log("Level-aware regression passed for Year 2 and Year 3 lesson, quiz, and assessment targets.");
  process.exit(0);
}

console.log("Scope | Issue");
for (const finding of findings) {
  console.log(finding);
}
process.exit(1);
