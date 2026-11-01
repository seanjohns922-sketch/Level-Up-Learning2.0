import assert from 'node:assert/strict';
import { groundAnswer } from '../lib/ground-answer.ts';
import { GROUND_LESSON_CONTENT } from '../data/activities/starpath/ground/index.ts';
import * as measure from '../data/activities/prepMeasurelands/registry.ts';

// Every Ground question must tell a child a real answer after a wrong attempt.
const TEACHING = new Set(['starpathShapeIntro']);
let checked = 0;
const bad = /undefined|null|NaN|\[object|-\d+-\d|, then ([^,.]+), then \1\b/;
function check(task, where) {
  if (!task) return;
  if (TEACHING.has(task.kind) || task.scene === 'intro' || task.demo) return;
  const answer = groundAnswer(task);
  assert(answer?.say?.trim(), `${where}: ${task.kind}/${task.scene ?? task.mode ?? ''} has no answer`);
  assert(!bad.test(answer.say), `${where}: bad answer "${answer.say}"`);
  for (const picture of answer.pictures ?? []) assert(picture.src, `${where}: picture without art`);
  if (task.kind === 'measurementCompare' && task.scene === 'order' && !answer.pictures && !task.fillState) for (const id of task.orderedIds) assert(answer.say.includes(task.objects.find((o) => o.id === id).label), where);
  if (task.kind === 'groundOrderTap' && !task.pathNumerals?.length) for (const tile of task.tiles) assert(answer.say.includes(String(tile.numeral)), where);
  checked += 1;
}
for (let w = 1; w <= 12; w++) {
  const m = await import(`../data/activities/prep/week${w}.ts`);
  m[`resetPrepWeek${w}TaskSessionState`]?.();
  for (const l of [1, 2, 3]) for (let i = 0; i < 90; i++) { let task; try { task = m[`generatePrepWeek${w}Task`](`y0-w${w}-l${l}`, ['easy', 'medium', 'hard'][i % 3]); } catch { continue; } check(task, `N${w}.${l}`); }
}
for (let w = 1; w <= 8; w++) for (const l of [1, 2, 3]) {
  measure.resetPrepMeasurelandsLessonSessionState?.();
  for (let i = 0; i < 90; i++) check(measure.resolvePrepMeasurelandsLessonTask(`y0-measurement-w${w}-l${l}`, ['easy', 'medium', 'hard'][i % 3]), `M${w}.${l}`);
}
const ctx = { secondsLeft: 300, totalSeconds: 540, elapsedSeconds: 240, difficulty: 'medium' };
for (const [id, content] of Object.entries(GROUND_LESSON_CONTENT)) {
  for (let i = 0; i < 12; i++) {
    const set = content.createTaskSet();
    for (const gen of set.activities ?? []) check(gen(ctx), id);
    for (const gen of set.mixedPractice ?? []) check(gen(ctx), id);
  }
}
assert(checked > 3000, `Only ${checked} questions checked`);
console.log(`PASS: ${checked} Ground questions give a real answer after a wrong attempt`);
