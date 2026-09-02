import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PATTERN_PEAKS_PROGRAMS,
  PATTERN_PEAKS_SPINES,
  type PatternPeaksYearLabel,
} from "@/data/programs/patternPeaks";
import { REALM_REGISTRY } from "@/lib/realms/realm-registry";

const root = process.cwd();
const descriptorSets: Record<PatternPeaksYearLabel, Set<string>> = {
  "Year 3": new Set(["AC9M3A01", "AC9M3A02", "AC9M3A03"]),
  "Year 4": new Set(["AC9M4A01", "AC9M4A02"]),
  "Year 5": new Set(["AC9M5A01", "AC9M5A02"]),
  "Year 6": new Set(["AC9M6A01", "AC9M6A02", "AC9M6A03"]),
};

for (const level of Object.keys(PATTERN_PEAKS_PROGRAMS) as PatternPeaksYearLabel[]) {
  const program = PATTERN_PEAKS_PROGRAMS[level];
  const levelNumber = Number(level.replace("Year ", ""));
  const allowedDescriptors = descriptorSets[level];
  const usedDescriptors = new Set<string>();
  const mechanics = new Set<string>();

  assert.equal(program.length, 8, `${level} must contain eight weeks.`);
  assert.equal(PATTERN_PEAKS_SPINES[level].length, 8, `${level} must contain eight week purposes.`);
  assert.equal(new Set(program.map((week) => week.topic)).size, 8, `${level} needs eight distinct topics.`);

  for (const [weekIndex, week] of program.entries()) {
    assert.equal(week.week, weekIndex + 1, `${level} week ${weekIndex + 1} is out of sequence.`);
    assert.equal(week.lessons.length, 3, `${level} week ${week.week} must contain three lessons.`);
    assert(PATTERN_PEAKS_SPINES[level][weekIndex]!.purpose.length >= 55, `${level} week ${week.week} needs a specific purpose.`);
    for (const [lessonIndex, currentLesson] of week.lessons.entries()) {
      assert.equal(currentLesson.id, `y${levelNumber}-algebra-w${week.week}-l${lessonIndex + 1}`, `${currentLesson.title} has a non-canonical id.`);
      assert(currentLesson.focus.length >= 55, `${level} ${currentLesson.title} needs a specific learning focus.`);
      assert.equal(currentLesson.activityIdeas.length, 1, `${level} ${currentLesson.title} needs one primary mechanic.`);
      assert.equal(currentLesson.config?.implementationStatus, "blueprint", `${level} ${currentLesson.title} must remain blueprint-only.`);
      assert(currentLesson.curriculum.every((code) => allowedDescriptors.has(code)), `${level} ${currentLesson.title} leaks outside ACARA Algebra ownership.`);
      currentLesson.curriculum.forEach((code) => usedDescriptors.add(code));
      mechanics.add(currentLesson.activityIdeas[0]!);
    }
  }
  assert.deepEqual(usedDescriptors, allowedDescriptors, `${level} does not cover its complete ACARA Algebra descriptor set.`);
  assert.equal(mechanics.size, 24, `${level} needs a distinct mechanic for every lesson blueprint.`);
}

assert.equal(REALM_REGISTRY.pattern.status, "coming_soon", "Pattern Peaks must remain review-only.");
assert.equal(REALM_REGISTRY.pattern.isSelectable, false, "Pattern Peaks must not be selectable by students yet.");
assert.equal(REALM_REGISTRY.pattern.totalWeeks, 8, "Pattern Peaks needs the agreed eight-week contract.");
assert.deepEqual(REALM_REGISTRY.pattern.levelLabels, ["Year 3", "Year 4", "Year 5", "Year 6"]);

for (const asset of [
  "public/images/patternpeaks-home-bg-y3.jpeg",
  "public/images/patternpeaks-home-bg-y4.jpeg",
  "public/images/patternpeaks-home-bg-y5.jpeg",
  "public/images/patternpeaks-home-bg-y6.jpeg",
  "public/cards/patternox-wigglecode-y3-front.png",
  "public/cards/patternox-wigglecode-y3-back.png",
  "public/cards/patternox-sequencer-y4-front.png",
  "public/cards/patternox-sequencer-y4-back.png",
  "public/cards/patternox-solver-y5-front.png",
  "public/cards/patternox-solver-y5-back.png",
  "public/cards/patternox-codemaster-y6-front.png",
  "public/cards/patternox-codemaster-y6-back.png",
]) {
  assert(fs.existsSync(path.join(root, asset)), `${asset} is missing.`);
}

const demoPanel = fs.readFileSync(path.join(root, "components/demo/DemoReviewPanel.tsx"), "utf8");
assert(demoPanel.includes('{ id: "pattern", label: "Pattern Peaks"'), "Demo Review does not expose Pattern Peaks.");
assert(demoPanel.includes("/pattern-peaks/program?teacher_preview=1"), "Demo Review does not expose Pattern Peaks program previews.");
assert(demoPanel.includes("? levelNumber >= 3"), "Demo Review does not expose the Level 4-6 program blueprints.");

for (const page of ["app/pattern-peaks/page.tsx", "app/pattern-peaks/program/page.tsx"]) {
  const source = fs.readFileSync(path.join(root, page), "utf8");
  assert(source.includes("getServerStarpathAccess"), `${page} is not server-gated.`);
}

console.log("Pattern Peaks curriculum audit passed: 4 levels, 32 weeks, 96 lessons, ACARA ownership, gated previews, and assets verified.");
