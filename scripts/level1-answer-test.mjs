import assert from 'node:assert/strict';
import { level1Answer, level1Speech } from '../lib/level1-answer.ts';
import { getStatisticaLevel1TaskSet, STATISTICA_LEVEL1_LESSON_IDS } from '../data/activities/statistica/level1.ts';
import { LEVEL_ONE_LESSON_CONTENT } from '../data/activities/starpath/level1/index.ts';
import * as measure from '../data/activities/year1Measurelands/registry.ts';

// These cannot be failed (they step to the answer) or say their own answer, or read the answer from another field.
const OWN_ANSWER = new Set(['fillTheJar', 'numberLadder', 'numberLineJump', 'chartFill', 'matchPairs', 'countObjects', 'mabBuild', 'tensOnesMcq', 'partitionTwoWays', 'splitStepper', 'placeValueDice', 'equalGroups', 'equalGroupsMcq', 'groupBoxes', 'countCircle', 'typeNumber', 'mixedReviewSprint', 'targetedRevision', 'funGames', 'starpathShapeDisguise', 'starpathShapeFaceOff', 'starpathMysteryShape']);
const GENERIC = ['answer', 'correctAnswer', 'targetNumber', 'numbers'];
const bad = /undefined|null|NaN|\[object|^\s*$/;
const seen = new Set(); let checked = 0;
const move = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
function check(t, where) {
  if (!t || t.scene === 'intro') return;
  seen.add(t.kind);
  const speech = t.speakText || level1Speech(t) || t.prompt;
  assert(speech?.trim(), `${where}: ${t.kind} has nothing to read aloud`);
  assert(!bad.test(speech), `${where}: bad speech "${speech}"`);
  const answer = level1Answer(t);
  if (!answer) assert(OWN_ANSWER.has(t.kind) || GENERIC.some((k) => t[k] != null), `${where}: ${t.kind}/${t.scene ?? t.mode ?? ''} has no answer`);
  if (answer) assert(!bad.test(answer), `${where}: bad answer "${answer}"`);
  if (t.kind === 'starpathRouteBuild') {
    let { r, c } = t.start; const blocked = t.blocked ?? []; const stops = [...(t.checkpoints ?? [])];
    for (const word of answer.split(', ')) {
      r += move[word][0]; c += move[word][1];
      assert(r >= 0 && c >= 0 && r < t.rows && c < t.cols, `${where}: route leaves grid`);
      assert(!blocked.some((b) => b.r === r && b.c === c), `${where}: route hits a block`);
      const i = stops.findIndex((s) => s.r === r && s.c === c); if (i >= 0) stops.splice(i, 1);
    }
    assert(r === t.goal.r && c === t.goal.c && !stops.length, `${where}: route misses the goal`);
  }
  if (t.kind === 'ppw' && t.mode !== 'build') assert(Number(answer) > 0, where);
  if (t.kind === 'addDots') assert(t.a > 0 && t.b > 0, `${where}: 0 + 0 style question`);
  if (t.kind === 'capacityMeasure' && t.scene === 'count') assert(t.container.label !== 'Cup', where);
  checked += 1;
}
const levels = ['easy', 'medium', 'hard'];
for (let w = 1; w <= 12; w++) {
  const m = await import(`../data/activities/year1/week${w}.ts`);
  const g = m[`generateWeek${w}Task`];
  for (const l of [1, 2, 3]) for (let i = 0; i < 90; i++) {
    const d = levels[i % 3];
    check(g.length > 2 ? g(`y1-w${w}-l${l}`, undefined, d) : g(`y1-w${w}-l${l}`, d), `N${w}.${l}`);
  }
}
for (let w = 1; w <= 8; w++) for (const l of [1, 2, 3]) {
  measure.resetY1MeasurelandsLessonSessionState?.();
  for (let i = 0; i < 90; i++) check(measure.resolveY1MeasurelandsLessonTask(`y1-measurement-w${w}-l${l}`, levels[i % 3]), `M${w}.${l}`);
}
const ctx = { secondsLeft: 300, totalSeconds: 540, elapsedSeconds: 240, difficulty: 'medium' };
for (const [id, content] of Object.entries(LEVEL_ONE_LESSON_CONTENT)) for (let i = 0; i < 12; i++) {
  const set = content.createTaskSet();
  for (const gen of [...(set.activities ?? []), ...(set.mixedPractice ?? [])]) check(gen(ctx), id);
}
for (const id of STATISTICA_LEVEL1_LESSON_IDS) for (let i = 0; i < 12; i++) {
  const set = getStatisticaLevel1TaskSet(id);
  for (const gen of [...(set.activities ?? []), ...(set.mixedPractice ?? [])]) check(gen(ctx), id);
}
assert(checked > 5000 && seen.size > 90, `Only ${checked} questions across ${seen.size} types`);
console.log(`PASS: ${checked} Level 1 questions across ${seen.size} types can be read aloud and answered`);
