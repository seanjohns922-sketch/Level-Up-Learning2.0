import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getLowerLessonGuide, isNativeLessonIntro, lessonNumberFromId, LESSON_GUIDES } from '../data/lesson-guides/lower-level.ts';
import { PROGRAMS_BY_YEAR } from '../data/programs/index.ts';
import { PATTERN_PEAKS_PROGRAMS, getPatternPeaksLessonConceptIntro } from '../data/programs/patternPeaks.ts';
import { STATISTICA_PROGRAMS } from '../data/programs/statistica.ts';
import { CHANCE_HOLLOW_PROGRAMS } from '../data/programs/chanceHollow.ts';
const topics = JSON.parse(fs.readFileSync('data/lesson-guides/lower-level-topics.json', 'utf8'));
const assignments = JSON.parse(fs.readFileSync('data/lesson-guides/lower-level-map.json', 'utf8'));
let covered = 0, native = 0, added = 0;
const seen = new Set();
function check(realm, level, week, lesson, hasNative = false) {
  const key = `${realm}:${level}:${week}:${lesson}`;
  assert(!seen.has(key), `Duplicate lesson ${key}`); seen.add(key);
  const guide = getLowerLessonGuide(realm, level, week, lesson);
  assert(hasNative || guide, `Missing introduction: ${key}`);
  covered++; if (hasNative) native++; else added++;
}
for (let level = 1; level <= 6; level++) {
  for (const week of PROGRAMS_BY_YEAR[`Year ${level}`]) for (const lesson of week.lessons) check('number', level, week.week, lesson.lesson);
  const measurement = await import(`../data/activities/year${level}Measurelands/registry.ts`);
  const mp = await import(`../data/programs/year${level}Measurelands.ts`);
  for (const week of mp[`YEAR${level}_MEASURELANDS_PROGRAM`]) for (const lesson of week.lessons) {
    measurement[`resetY${level}MeasurelandsLessonSessionState`]();
    const task = measurement[`resolveY${level}MeasurelandsLessonTask`](lesson.id, 'easy');
    check('measurement', level, week.week, lesson.lesson, isNativeLessonIntro(task));
  }
  const words = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];
  const space = await import(`../data/activities/starpath/level${level}/index.ts`);
  for (const [id, content] of Object.entries(space[`LEVEL_${words[level]}_LESSON_CONTENT`])) {
    const week = Number(id.match(/-w(\d+)/)?.[1]);
    check('space', level, week, lessonNumberFromId(id), isNativeLessonIntro(content.createTaskSet().teaching()));
  }
  const stats = await import(`../data/activities/statistica/level${level}.ts`);
  for (const week of STATISTICA_PROGRAMS[level]) for (const lesson of week.lessons) {
    check('statistics', level, week.week, lesson.lesson, isNativeLessonIntro(stats[`getStatisticaLevel${level}TaskSet`](lesson.id).teaching()));
  }
  for (const week of PATTERN_PEAKS_PROGRAMS[`Year ${level}`] ?? []) for (const lesson of week.lessons) {
    check('pattern', level, week.week, lesson.lesson, !!getPatternPeaksLessonConceptIntro(`Year ${level}`, week.week, lesson.lesson));
  }
  for (const week of CHANCE_HOLLOW_PROGRAMS[level] ?? []) for (const lesson of week.lessons) check('chance', level, week.week, lesson.lesson, true);
}
assert.equal(covered, 780);
for (const [key, topic] of Object.entries(assignments)) {
  assert(seen.has(key), `Guide mapped to a nonexistent lesson: ${key}`);
  assert(topics[topic], `Unknown topic ${topic}`);
}
for (const [key, guide] of Object.entries(topics)) {
  assert(guide.idea.length > 15 && guide.example.trim().length > 0 && guide.tip.length > 12, `Incomplete ${key}`);
  assert(guide.steps.length >= 2 && guide.steps.length <= 3, `Keep ${key} concise`);
  assert(guide.steps.every(step => step.trim().length > 8));
}
// Lesson-specific guides: every Number lesson in Levels 1–6 has its own, complete, concise guide.
let own = 0;
for (const [realm, levels] of Object.entries(LESSON_GUIDES)) for (const [level, set] of Object.entries(levels)) for (const [key, guide] of Object.entries(set)) {
  assert(seen.has(`${realm}:${level}:${key}`), `Lesson guide for a nonexistent lesson: ${realm}:${level}:${key}`);
  assert(guide.idea.length > 15 && guide.idea.length <= 140, `Idea length ${realm}:${level}:${key}`);
  assert(guide.example.trim().length > 2 && guide.tip.length > 12, `Incomplete ${realm}:${level}:${key}`);
  assert(guide.steps.length >= 2 && guide.steps.length <= 4 && guide.steps.every(step => step.trim().length > 8 && step.length <= 170), `Steps ${realm}:${level}:${key}`);
  own++;
}
for (let level = 1; level <= 6; level++) for (const week of PROGRAMS_BY_YEAR[`Year ${level}`]) for (const lesson of week.lessons)
  assert(LESSON_GUIDES.number[level]?.[`${week.week}:${lesson.lesson}`], `Number lesson without its own guide: ${level}:${week.week}:${lesson.lesson}`);
for (const level of [0, 7, 8, undefined]) assert.equal(getLowerLessonGuide('number', level, 1, 1), null);
assert.equal(getLowerLessonGuide('number', 1, 99, 1), null);
assert.equal(lessonNumberFromId('y6-measurement-w8-l3'), 3);
assert.equal(isNativeLessonIntro({ kind: 'area', scene: 'formulaIntro' }), true);
assert.equal(isNativeLessonIntro({ kind: 'area', scene: 'breakIntro' }), true);
assert.equal(isNativeLessonIntro({ kind: 'protractor', scene: 'learn' }), true);
assert.equal(isNativeLessonIntro({ kind: 'protractor', scene: 'construct' }), false);
assert.equal(isNativeLessonIntro({ kind: 'area', scene: 'splitChoose' }), false);
// Teaching scenes must route to unscored progression; reopening help must pause both engines.
const taskRenderer = fs.readFileSync('components/TaskRenderer.tsx', 'utf8');
assert.match(taskRenderer, /isNativeLessonIntro\(task\)/);
assert.match(taskRenderer, /if \(isIntroTask && advanceIntro\)\s*\{\s*advanceIntro\(\);\s*return;/);
const runner = fs.readFileSync('components/PracticeRunner.tsx', 'utf8');
assert.match(runner, /helpOpenRef\.current \|\| pauseLessonClockRef\.current \? s : s - 1/);
assert.match(runner, /markCorrect: closeHelp, markCorrectSoft: \(\) => \{\}, markWrong: \(\) => \{\}/);
const engine = fs.readFileSync('components/lesson/Year2LessonEngine.tsx', 'utf8');
assert.match(engine, /skillGuideOpenRef\.current \? c : c - 1/);
const guide = fs.readFileSync('components/lesson/LowerLessonGuide.tsx', 'utf8');
for (const part of ['Read whole guide', 'Read example', 'Step ${i + 1}', 'Tip. ${guide.tip}', 'Read instructions']) assert(guide.includes(part), `Missing narration: ${part}`);
console.log(`PASS: ${covered} lesson starts; ${native} existing guides retained; ${added} written guides (${own} lesson-specific). Ground and Levels 7–8 excluded.`);
