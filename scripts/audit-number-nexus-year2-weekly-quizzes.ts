import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { YEAR1_WEEKLY_QUIZZES } from "../app/config/lesson-config";
import { buildYear2NumberNexusWeeklyQuiz } from "../data/quizzes/year2NumberNexus";

const allowedDescriptors = new Set([
  "AC9M2N01", "AC9M2N02", "AC9M2N03", "AC9M2N04", "AC9M2N05", "AC9M2N06",
  "AC9M2A01", "AC9M2A02", "AC9M2A03",
]);
const allIds = new Set<string>();
let questions = 0;

for (let week = 1; week <= 12; week += 1) {
  const quiz = buildYear2NumberNexusWeeklyQuiz(week);
  const config = YEAR1_WEEKLY_QUIZZES.find((item) => item.week === week);
  assert(config, `Week ${week} quiz config is missing.`);
  assert.equal(config.totalQuestions, 15);
  assert.equal(config.questionsPerLesson, 5);
  assert.equal(config.passPercent, 80);
  assert.equal(quiz.length, 15, `Week ${week} must build 15 questions.`);

  for (const lesson of [1, 2, 3] as const) {
    assert.equal(quiz.filter((item) => item.lessonTag === lesson).length, 5, `Week ${week} Lesson ${lesson} must contribute five questions.`);
  }
  const contentSignatures = quiz.map(({ id: _id, skillId: _skillId, lessonTag: _lessonTag, descriptorCodes: _descriptorCodes, ...item }) => JSON.stringify(item));
  assert.equal(new Set(contentSignatures).size, 15, `Week ${week} contains duplicate complete questions.`);

  for (const item of quiz) {
    assert(!allIds.has(item.id), `Duplicate quiz ID: ${item.id}`);
    allIds.add(item.id);
    assert(item.prompt.trim());
    assert(item.descriptorCodes.length > 0);
    assert(item.descriptorCodes.every((code) => allowedDescriptors.has(code)), `${item.id} contains an out-of-realm descriptor.`);
    if (item.kind === "mcq" || item.kind === "audio") {
      assert(item.options && item.options.length >= 3);
      assert.equal(new Set(item.options).size, item.options.length);
      assert(Number.isInteger(item.correctIndex) && item.correctIndex! >= 0 && item.correctIndex! < item.options.length);
    } else {
      assert(item.correctValue?.trim());
      assert(Number.isFinite(Number(item.correctValue)));
    }
  }
  questions += quiz.length;
}

const bankSource = fs.readFileSync(path.join(process.cwd(), "data/quizzes/year2NumberNexus.ts"), "utf8");
const sessionSource = fs.readFileSync(path.join(process.cwd(), "app/session/page.tsx"), "utf8");
const assessmentApi = fs.readFileSync(path.join(process.cwd(), "data/assessments/api.ts"), "utf8");
assert(!bankSource.includes("data/activities"));
assert(!bankSource.includes("generateQuestion"));
assert(sessionSource.includes('!isMeasurementRealm && year === "Year 2"'));
assert(sessionSource.includes("buildYear2NumberNexusWeeklyQuiz(Number(week))"));
assert(!assessmentApi.includes("data/quizzes/year2NumberNexus"));
assert(sessionSource.includes('isFinalQuizWeek ? "Continue to Post-Test"'));
assert(sessionSource.includes("`/posttest?year=${encodeURIComponent(year)}${realmParam}`"));
assert(!sessionSource.includes("Math.min(12, Number(week) + 1)"));

console.log(`Year 2 Number Nexus weekly quiz audit passed: 12/12 routes, ${questions} valid questions, exact 5-5-5 allocation, 80% threshold, independent bank, and no Week 13 navigation.`);
