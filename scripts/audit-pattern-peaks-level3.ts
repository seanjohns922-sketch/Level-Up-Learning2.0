import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PATTERN_PEAKS_LEVEL3_PROGRAM } from "@/data/programs/patternPeaks";
import { REALM_REGISTRY } from "@/lib/realms/realm-registry";

const root = process.cwd();
const allowedDescriptors = new Set(["AC9M3A01", "AC9M3A02", "AC9M3A03"]);

assert.equal(PATTERN_PEAKS_LEVEL3_PROGRAM.length, 8, "Level 3 must contain eight weeks.");
assert.equal(new Set(PATTERN_PEAKS_LEVEL3_PROGRAM.map((week) => week.topic)).size, 8, "Each week needs a distinct topic.");

for (const [weekIndex, week] of PATTERN_PEAKS_LEVEL3_PROGRAM.entries()) {
  assert.equal(week.week, weekIndex + 1, `Week ${weekIndex + 1} is out of sequence.`);
  assert.equal(week.lessons.length, 3, `Week ${week.week} must contain three lessons.`);
  for (const [lessonIndex, lesson] of week.lessons.entries()) {
    assert.equal(lesson.id, `y3-algebra-w${week.week}-l${lessonIndex + 1}`, `${lesson.title} has a non-canonical id.`);
    assert(lesson.focus.length >= 45, `${lesson.title} needs a specific learning focus.`);
    assert(lesson.activityIdeas.length === 1, `${lesson.title} needs one distinct primary mechanic.`);
    assert(lesson.curriculum.every((code) => allowedDescriptors.has(code)), `${lesson.title} uses a descriptor outside Level 3 Algebra.`);
  }
}

assert.equal(REALM_REGISTRY.pattern.status, "coming_soon", "Pattern Peaks must remain review-only.");
assert.equal(REALM_REGISTRY.pattern.isSelectable, false, "Pattern Peaks must not be selectable by students yet.");
assert.equal(REALM_REGISTRY.pattern.totalWeeks, 8, "Pattern Peaks needs the agreed eight-week contract.");
assert.deepEqual(REALM_REGISTRY.pattern.levelLabels, ["Year 3", "Year 4", "Year 5", "Year 6"]);

for (const asset of [
  "public/images/patternpeaks-home-bg-y3.jpeg",
  "public/cards/patternox-wigglecode-y3-front.png",
  "public/cards/patternox-wigglecode-y3-back.png",
]) {
  assert(fs.existsSync(path.join(root, asset)), `${asset} is missing.`);
}

const demoPanel = fs.readFileSync(path.join(root, "components/demo/DemoReviewPanel.tsx"), "utf8");
assert(demoPanel.includes('{ id: "pattern", label: "Pattern Peaks"'), "Demo Review does not expose Pattern Peaks.");
assert(demoPanel.includes("/pattern-peaks/program?teacher_preview=1"), "Demo Review does not expose the Level 3 week preview.");

for (const page of ["app/pattern-peaks/page.tsx", "app/pattern-peaks/program/page.tsx"]) {
  const source = fs.readFileSync(path.join(root, page), "utf8");
  assert(source.includes("getServerStarpathAccess"), `${page} is not server-gated.`);
}

console.log("Pattern Peaks Level 3 foundation audit passed: 8 weeks, 24 lessons, gated preview, and assets verified.");
