import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import { buildYear1NumberNexusWeeklyQuiz, type Year1NumberNexusQuizQuestion } from "../data/quizzes/year1NumberNexus";
import { buildYear1Week11PatternQuizItems, type Year1Week11PatternQuizItem } from "../data/quizzes/year1Week11Patterns";
import { YEAR1_PROGRAM } from "../data/programs/year1";

const allowedDescriptors = new Set([
  "AC9M1N01", "AC9M1N02", "AC9M1N03", "AC9M1N04",
  "AC9M1N05", "AC9M1N06", "AC9M1A01", "AC9M1A02",
]);

const allIds = new Set<string>();
let routes = 0;
let questions = 0;

for (let week = 1; week <= 12; week += 1) {
  const quiz = week === 11 ? buildYear1Week11PatternQuizItems() : buildYear1NumberNexusWeeklyQuiz(week);
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  const programWeek = YEAR1_PROGRAM.find((item) => item.week === week);
  assert(config, `Week ${week} quiz config is missing.`);
  assert(programWeek, `Week ${week} program metadata is missing.`);
  assert.equal(config.totalQuestions, 15, `Week ${week} config must require 15 questions.`);
  assert.equal(config.questionsPerLesson, 5, `Week ${week} config must require five questions per lesson.`);
  assert.equal(config.passPercent, 80, `Week ${week} pass threshold must remain 80%.`);
  assert.equal(quiz.length, 15, `Week ${week} must build exactly 15 questions.`);

  for (const lesson of [1, 2, 3] as const) {
    assert.equal(quiz.filter((item) => item.lessonTag === lesson).length, 5, `Week ${week} Lesson ${lesson} must contribute five questions.`);
  }

  for (const item of quiz) {
    assert(!allIds.has(item.id), `Duplicate Year 1 quiz ID: ${item.id}`);
    allIds.add(item.id);
    assert(item.prompt.trim().length > 0, `${item.id} has no prompt.`);
    if (week === 11) {
      const patternItem = item as Year1Week11PatternQuizItem;
      assert(patternItem.options.length >= 3, `${item.id} requires at least three answer options.`);
      assert.equal(new Set(patternItem.options).size, patternItem.options.length, `${item.id} has duplicate answer options.`);
      assert(patternItem.options.includes(patternItem.answer), `${item.id} does not include its correct answer.`);
    } else {
      const bankItem = item as Year1NumberNexusQuizQuestion;
      if (bankItem.kind === "mcq" || bankItem.kind === "audio") {
        assert(bankItem.options && bankItem.options.length >= 3, `${item.id} requires at least three answer options.`);
        assert.equal(new Set(bankItem.options).size, bankItem.options.length, `${item.id} has duplicate answer options.`);
        assert(Number.isInteger(bankItem.correctIndex) && bankItem.correctIndex! >= 0 && bankItem.correctIndex! < bankItem.options.length, `${item.id} has an invalid correct index.`);
      } else {
        assert(bankItem.correctValue && bankItem.correctValue.trim().length > 0, `${item.id} has no constructed-response answer.`);
      }
      assert(bankItem.descriptorCodes.length > 0, `${item.id} has no curriculum descriptor.`);
      assert(bankItem.descriptorCodes.every((code: string) => allowedDescriptors.has(code)), `${item.id} contains an out-of-realm descriptor.`);
    }
  }

  routes += 1;
  questions += quiz.length;
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/quizzes/year1NumberNexus.ts"), "utf8");
const patternBankSource = fs.readFileSync(path.join(process.cwd(), "data/quizzes/year1Week11Patterns.ts"), "utf8");
const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
const assessmentApi = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");

assert(!bankSource.includes("data/activities/year1/week"), "Year 1 quiz bank imports lesson generators.");
assert(!bankSource.includes("generateWeek"), "Year 1 quiz bank calls lesson generation.");
assert(!patternBankSource.includes("generateWeek"), "Week 11 quiz bank calls lesson generation.");
assert(sessionSource.includes('year === "Year 1"') && sessionSource.includes("buildYear1NumberNexusWeeklyQuiz(Number(week))"), "Live Year 1 quiz routes do not dispatch to the independent bank.");
assert(!assessmentApi.includes("year1NumberNexus") && !assessmentApi.includes("year1Week11Patterns"), "A weekly quiz bank leaked into assessment resolution.");
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'), "Final-week quiz does not present the Post-Test action.");
assert(sessionSource.includes("`/posttest?year=${encodeURIComponent(year)}${realmParam}`"), "Final-week quiz does not route to the Post-Test.");
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"), "Final-week quiz still loops to the final week.");

console.log(`Year 1 Number Nexus weekly quiz audit passed: ${routes}/12 routes, ${questions} questions, exact 5-5-5 allocation, 80% threshold, independent banks, and no Week 13 navigation.`);
