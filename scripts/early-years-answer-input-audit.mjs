#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
const findings = [];

function requirePattern(relativePath, pattern, message) {
  if (!pattern.test(read(relativePath))) findings.push(`${relativePath}: ${message}`);
}

function rejectPattern(relativePath, pattern, message) {
  if (pattern.test(read(relativePath))) findings.push(`${relativePath}: ${message}`);
}

for (const relativePath of ["data/activities/year1/week1.ts", "data/activities/year1/week2.ts"]) {
  rejectPattern(
    relativePath,
    /(?:type|write)\s+(?:the\s+)?(?:number\s+)?word/i,
    "early-years number work must not require spelling a number word"
  );
}

rejectPattern(
  "app/session/page.tsx",
  /prompt:\s*`Write the word for \$\{answer\}\.`/,
  "weekly quiz requires a written number word"
);

requirePattern(
  "components/TaskRenderer.tsx",
  /<TypeTheNumber[^>]+mode="number"/,
  "typeNumber tasks must collect a numeral"
);
requirePattern(
  "app/session/page.tsx",
  /<NumberLineTap\s+key=\{currentQuiz\.id\}/,
  "quiz number-line taps must reset for each question"
);
requirePattern(
  "app/session/page.tsx",
  /<NumberLineJump\s+key=\{currentQuiz\.id\}/,
  "quiz number-line jumps must reset for each question"
);
requirePattern(
  "components/NumberLineTap.tsx",
  /e\.pointerType === "touch" \? 24[\s\S]+range \* 0\.025/,
  "number-line taps must provide a touch-friendly, range-bounded correct zone"
);

for (const relativePath of [
  "data/assessments/pretests/prep.ts",
  "data/assessments/pretests/year1.ts",
  "data/assessments/pretests/year2.ts",
]) {
  rejectPattern(relativePath, /type:\s*["'](?:typed|text|input)["']/i, "pre-test contains a free-text answer");
}

const posttests = read("data/assessments/posttests.ts");
for (const levelId of ["prep", "y1", "y2"]) {
  const typedPattern = new RegExp(`(?:id:\\s*["']${levelId}[^"']*["'][\\s\\S]{0,180}type:\\s*["'](?:typed|text|input)["'])`, "i");
  if (typedPattern.test(posttests)) {
    findings.push(`data/assessments/posttests.ts: ${levelId} post-test contains a free-text answer`);
  }
}

if (findings.length > 0) {
  console.error("Early-years answer input audit failed:\n" + findings.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Early-years answer input audit passed.");
console.log("- Number-word recognition uses numeral entry rather than spelling.");
console.log("- Ground, Level 1 and Level 2 pre-tests contain no free-text fields.");
console.log("- Number-line quiz interactions reset between questions.");
console.log("- Number-line correct zones remain usable with touch, pen and mouse input.");
