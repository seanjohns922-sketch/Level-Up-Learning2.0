import assert from "node:assert/strict";
import fs from "node:fs";
import {
  additiveAnswerMatchesTarget,
  evaluateAdditiveExpression,
  expectedPartitionTarget,
} from "../lib/math-answer-equivalence.ts";

const source = fs.readFileSync(new URL("../app/session/page.tsx", import.meta.url), "utf8");
const engine = fs.readFileSync(
  new URL("../data/activities/year2/lessonEngine.ts", import.meta.url),
  "utf8",
);

for (const unsafePattern of [
  /\$\{target\s*-\s*10\}\s*\+\s*10\s*\+\s*0/,
  /\$\{target\s*-\s*1\}\s*\+\s*0\s*\+\s*1/,
  /options:\s*shuffle\(\[\s*altText,\s*answerText/,
  /questionData\.standard\.hundreds\s*\+\s*questionData\.standard\.tens\s*\+\s*questionData\.standard\.ones/,
]) {
  assert.equal(
    unsafePattern.test(`${source}\n${engine}`),
    false,
    `Found a partition quiz pattern that can create a mathematically correct distractor: ${unsafePattern}`,
  );
}

assert.match(source, /expectedNumericValue:\s*questionData\.target/);
assert.match(source, /additiveAnswerMatchesTarget/);
assert.match(engine, /options:\s*shuffle\(\[altText,\s*\.\.\.incorrectOptions\]\)/);

for (const [prompt, answer, target] of [
  ["Which is a different way to partition 5195?", "5194 + 0 + 1", 5195],
  ["Which is a different way to partition 3445?", "3444 + 0 + 1", 3445],
  ["Which expanded form matches 425?", "415 + 10 + 0", 425],
]) {
  assert.equal(expectedPartitionTarget(prompt), target);
  assert.equal(evaluateAdditiveExpression(answer), target);
  assert.equal(additiveAnswerMatchesTarget(answer, target), true);
}

assert.equal(additiveAnswerMatchesTarget("0 + 190 + 5", 5195), false);
assert.equal(additiveAnswerMatchesTarget("300 + 140 + 5", 3445), false);

console.log("Weekly quiz math-answer integrity audit passed.");
