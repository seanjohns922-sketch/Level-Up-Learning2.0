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

const { getPretestForLevel, getPosttestForLevel } = assessments;

const findings = [];

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

if (!year2Pretest.length) addFinding("Assessments Year 2 pretest", "No questions returned.");
if (!year3Pretest.length) addFinding("Assessments Year 3 pretest", "No questions returned.");
if (!year2Posttest?.questions?.length) addFinding("Assessments Year 2 posttest", "No questions returned.");
if (!year3Posttest?.questions?.length) addFinding("Assessments Year 3 posttest", "No questions returned.");

if (findings.length === 0) {
  console.log("Level-aware regression passed for Year 2 and Year 3 lesson, quiz, and assessment targets.");
  process.exit(0);
}

console.log("Scope | Issue");
for (const finding of findings) {
  console.log(finding);
}
process.exit(1);
