#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

function loadTsModule(relativePath) {
  const absPath = path.resolve(repoRoot, relativePath);
  const source = fs.readFileSync(absPath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    fileName: absPath,
  }).outputText;

  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: () => {
      throw new Error(`Unexpected runtime require while loading ${relativePath}`);
    },
    process,
    console,
    __filename: absPath,
    __dirname: path.dirname(absPath),
  });

  new vm.Script(compiled, { filename: absPath }).runInContext(context);
  return module.exports;
}

const lessonEngine = loadTsModule("data/activities/year2/lessonEngine.ts");
const rowsModule = loadTsModule("data/programs/raw/year2NumberRows.ts");

const {
  validateLessonActivityIntent,
  generateYear2Question,
  buildYear2QuizActivityPool,
} = lessonEngine;
const { year2NumberRows } = rowsModule;

const targetWeeks = new Set([1, 2, 3, 4, 8, 10, 11, 12]);
const findings = [];

function addFinding(week, lesson, layer, issue, reason) {
  findings.push({ week, lesson, layer, issue, reason });
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

for (const week of Array.from(targetWeeks).sort((a, b) => a - b)) {
  const weekRows = year2NumberRows
    .filter((row) => row.week === week)
    .sort((a, b) => a.lesson - b.lesson);

  if (weekRows.length !== 3) {
    addFinding(week, "-", "week", `Expected 3 lessons, found ${weekRows.length}`, "alignment");
    continue;
  }

  for (const row of weekRows) {
    const lesson = toLesson(row);
    const lessonLabel = `L${row.lesson}`;

    for (const activity of row.activities) {
      const pre = validateLessonActivityIntent(lesson, activity);
      if (!pre.valid) {
        for (const violation of pre.violations) {
          addFinding(
            week,
            lessonLabel,
            activity.activityType,
            violation.message,
            violation.reason
          );
        }
        continue;
      }

      let question;
      try {
        question = generateYear2Question(lesson, activity);
      } catch (error) {
        addFinding(
          week,
          lessonLabel,
          activity.activityType,
          `Generation failed: ${error instanceof Error ? error.message : String(error)}`,
          "alignment"
        );
        continue;
      }

      const post = validateLessonActivityIntent(lesson, activity, question);
      if (!post.valid) {
        for (const violation of post.violations) {
          addFinding(
            week,
            lessonLabel,
            activity.activityType,
            violation.message,
            violation.reason
          );
        }
      }
    }

    const quizPool = buildYear2QuizActivityPool(lesson, { allowGenericFallback: false });
    if (quizPool.activities.length === 0) {
      addFinding(
        week,
        lessonLabel,
        "quiz_pool",
        "No valid quiz activities available for lesson.",
        "alignment"
      );
    }
    if (quizPool.violations.length > 0) {
      for (const violation of quizPool.violations) {
        addFinding(
          week,
          lessonLabel,
          "quiz_pool",
          violation.message,
          violation.reason
        );
      }
    }
  }
}

if (findings.length === 0) {
  console.log("Year 2 smoke QA passed for weeks 1,2,3,4,8,10,11,12.");
  process.exit(0);
}

console.log("Week | Lesson | Layer | Reason | Issue");
for (const finding of findings) {
  console.log(
    `${finding.week} | ${finding.lesson} | ${finding.layer} | ${finding.reason} | ${finding.issue}`
  );
}
process.exit(1);
