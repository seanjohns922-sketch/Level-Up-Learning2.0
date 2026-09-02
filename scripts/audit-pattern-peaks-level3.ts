import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PATTERN_PEAKS_PROGRAMS,
  PATTERN_PEAKS_SPINES,
  type PatternPeaksYearLabel,
} from "@/data/programs/patternPeaks";
import { generatePatternPeaksQuestion } from "@/data/activities/patternPeaks/generator";
import { buildLessonActivityPool, getLevelForLesson } from "@/data/activities/year2/lessonEngine";
import { REALM_REGISTRY } from "@/lib/realms/realm-registry";
import { isLessonQuestionSafe } from "@/lib/task-safety";
import { getAllLegends } from "@/data/legends";

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
      assert.equal(currentLesson.activityIdeas.length, 3, `${level} ${currentLesson.title} needs three child-facing activity descriptions.`);
      assert.equal(currentLesson.config?.implementationStatus, "implemented", `${level} ${currentLesson.title} must be implemented.`);
      assert.equal(currentLesson.activityType, "pattern-peaks", `${level} ${currentLesson.title} must use the Pattern Peaks engine.`);
      assert(currentLesson.curriculum.every((code) => allowedDescriptors.has(code)), `${level} ${currentLesson.title} leaks outside ACARA Algebra ownership.`);
      const activities = currentLesson.activities ?? [];
      assert.equal(activities.length, 3, `${level} ${currentLesson.title} must have exactly three rotations.`);
      assert.deepEqual(
        new Set(activities.map((activity) => activity.config.rotationRole)),
        new Set(["fast_thinking", "reasoning", "apply_create"]),
        `${level} ${currentLesson.title} must include fast, reasoning and apply/create rotations.`,
      );
      const pool = buildLessonActivityPool(getLevelForLesson(currentLesson), currentLesson);
      assert.equal(pool.violations.length, 0, `${level} ${currentLesson.title} has rotation policy violations.`);
      assert.equal(pool.activities.length, 3, `${level} ${currentLesson.title} has an empty production activity pool.`);
      for (const activity of activities) {
        for (let sample = 0; sample < 3; sample += 1) {
          const question = generatePatternPeaksQuestion(getLevelForLesson(currentLesson), currentLesson, activity);
          assert(isLessonQuestionSafe(activity, question), `${level} ${currentLesson.title} generated an unsafe ${String(activity.config.rotationRole)} question.`);
          assert("visual" in question && question.visual, `${level} ${currentLesson.title} generated a question without an algebra visual.`);
          assert("helper" in question && question.helper, `${level} ${currentLesson.title} generated a question without guided feedback.`);
        }
      }
      currentLesson.curriculum.forEach((code) => usedDescriptors.add(code));
      mechanics.add(String(currentLesson.config?.mechanic));
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
  "public/videos/legends/patternox-wigglecode.mp4",
  "public/videos/legends/patternox-sequencer.mp4",
  "public/videos/legends/patternox-solver.mp4",
  "public/videos/legends/patternox-codemaster.mp4",
]) {
  assert(fs.existsSync(path.join(root, asset)), `${asset} is missing.`);
}

const demoPanel = fs.readFileSync(path.join(root, "components/demo/DemoReviewPanel.tsx"), "utf8");
assert(demoPanel.includes('{ id: "pattern", label: "Pattern Peaks"'), "Demo Review does not expose Pattern Peaks.");
assert(demoPanel.includes("/pattern-peaks/program?teacher_preview=1"), "Demo Review does not expose Pattern Peaks program previews.");
assert(demoPanel.includes("? levelNumber >= 3"), "Demo Review does not expose the Level 4-6 program blueprints.");
assert(demoPanel.includes("/pattern-peaks/lesson/"), "Demo Review does not expose Pattern Peaks lessons.");
assert(demoPanel.includes('"/legends/pattern-peaks"'), "Demo Review does not expose all Patternox videos.");

const programPreview = fs.readFileSync(path.join(root, "components/pattern-peaks/PatternPeaksProgramPreview.tsx"), "utf8");
assert(programPreview.includes("/pattern-peaks/lesson/"), "Pattern Peaks week cards do not link to implemented lessons.");
assert(programPreview.includes("PATTERNOX_VIDEOS"), "Patternox cards do not expose their showcase videos.");

const patternoxLegends = getAllLegends("pattern-peaks");
assert.equal(patternoxLegends.length, 4, "Pattern Peaks must expose four Level 3-6 Patternox cards.");
assert.deepEqual(
  patternoxLegends.map((legend) => legend.yearLabel),
  ["Year 3", "Year 4", "Year 5", "Year 6"],
  "Patternox cards must cover Levels 3-6 in order.",
);
for (const legend of patternoxLegends) {
  assert(legend.showcaseVideoUrl, `${legend.name} is missing its showcase video.`);
  assert(legend.unlockVideoUrl, `${legend.name} is missing its unlock video.`);
  assert.equal(legend.showcaseVideoUrl, legend.unlockVideoUrl, `${legend.name} must use the same canonical video in both card flows.`);
}

const legendsHall = fs.readFileSync(path.join(root, "app/legends/page.tsx"), "utf8");
assert(legendsHall.includes('route: "/legends/pattern-peaks"'), "The Hall of Legends does not link to the Patternox collection.");
assert(legendsHall.includes('realm.id === "pattern-peaks"'), "Patternox cards are not unlocked in Demo Mode.");
const patternoxCollection = fs.readFileSync(path.join(root, "app/legends/pattern-peaks/page.tsx"), "utf8");
assert(patternoxCollection.includes("isDemoPreviewMode"), "The Patternox collection is not demo-gated.");
assert(patternoxCollection.includes("LegendDetailModal"), "Patternox cards do not use the standard video-enabled card detail.");
const lessonShell = fs.readFileSync(path.join(root, "components/pattern-peaks/PatternPeaksLessonShell.tsx"), "utf8");
assert(lessonShell.includes("Year2LessonEngine"), "Pattern Peaks lessons do not use the shared reviewed lesson engine.");
assert(lessonShell.includes("generatePatternPeaksQuestion"), "Pattern Peaks lessons do not use their curriculum generator.");

const towerPortalConfig = fs.readFileSync(path.join(root, "lib/world3d/tower-realm-chamber-config.ts"), "utf8");
assert(towerPortalConfig.includes('posterAsset: "/images/patternpeaks-home-bg-y6.jpeg"'), "Pattern Peaks tower portal must use the Level 6 realm background, not a card asset.");
const towerChamber = fs.readFileSync(path.join(root, "components/world3d/TowerRealmChamber.tsx"), "utf8");
assert(towerChamber.includes('return "LEVEL 6 PREVIEW"'), "Pattern Peaks tower portal must identify the Level 6 preview.");
const towerEntry = fs.readFileSync(path.join(root, "lib/world3d/tower-realm-entry.ts"), "utf8");
assert(towerEntry.includes('level=Year%206'), "Pattern Peaks tower preview must open Level 6.");

for (const page of ["app/pattern-peaks/page.tsx", "app/pattern-peaks/program/page.tsx", "app/pattern-peaks/lesson/[level]/[week]/[lesson]/page.tsx"]) {
  const source = fs.readFileSync(path.join(root, page), "utf8");
  assert(source.includes("getServerStarpathAccess"), `${page} is not server-gated.`);
}

console.log("Pattern Peaks curriculum audit passed: 4 levels, 32 weeks, 96 lessons, 288 rotations, ACARA ownership, lesson review, gated previews, and assets verified.");
