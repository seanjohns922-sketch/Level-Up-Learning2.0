// Queue every Level 1 question and answer line for Miranda. Questions are generated,
// so each lesson is sampled heavily; a rare line nobody sampled uses the device voice.
import fs from 'node:fs';
import { prepareSpeechText } from '../../lib/speak.ts';
import { level1Answer, level1Speech } from '../../lib/level1-answer.ts';
import { getStatisticaLevel1TaskSet, STATISTICA_LEVEL1_LESSON_IDS } from '../../data/activities/statistica/level1.ts';
import { LEVEL_ONE_LESSON_CONTENT } from '../../data/activities/starpath/level1/index.ts';
import * as measure from '../../data/activities/year1Measurelands/registry.ts';

const file = 'data/audio/voice-fixed-lines.json';
const lines = JSON.parse(fs.readFileSync(file, 'utf8'));
const before = Object.keys(lines).length;
let source = '';
function add(text) {
  if (!text?.trim()) return;
  const row = lines[prepareSpeechText(text)] ??= { kind: 'prompt', paths: [] };
  if (!row.paths.includes(source) && row.paths.length < 5) row.paths.push(source);
}
function task(t) {
  if (!t) return;
  add(t.speakText || level1Speech(t) || t.prompt);
  const answer = level1Answer(t);
  if (answer) add(`Not quite. The answer is ${answer}.`);
}
const levels = ['easy', 'medium', 'hard'];
const ctx = { secondsLeft: 300, totalSeconds: 540, elapsedSeconds: 240, difficulty: 'medium' };
for (let w = 1; w <= 12; w++) {
  const m = await import(`../../data/activities/year1/week${w}.ts`);
  const g = m[`generateWeek${w}Task`];
  for (const l of [1, 2, 3]) { source = `level1/number/${w}:${l}`; for (let i = 0; i < 150; i++) { const d = levels[i % 3]; task(g.length > 2 ? g(`y1-w${w}-l${l}`, undefined, d) : g(`y1-w${w}-l${l}`, d)); } }
}
for (let w = 1; w <= 8; w++) for (const l of [1, 2, 3]) { source = `level1/measurement/${w}:${l}`; measure.resetY1MeasurelandsLessonSessionState?.(); for (let i = 0; i < 150; i++) task(measure.resolveY1MeasurelandsLessonTask(`y1-measurement-w${w}-l${l}`, levels[i % 3])); }
for (const [id, content] of Object.entries(LEVEL_ONE_LESSON_CONTENT)) { source = `level1/${id}`; for (let i = 0; i < 20; i++) { const s = content.createTaskSet(); for (const gen of [...(s.activities ?? []), ...(s.mixedPractice ?? [])]) task(gen(ctx)); } }
for (const id of STATISTICA_LEVEL1_LESSON_IDS) { source = `level1/${id}`; for (let i = 0; i < 20; i++) { const s = getStatisticaLevel1TaskSet(id); for (const gen of [...(s.activities ?? []), ...(s.mixedPractice ?? [])]) task(gen(ctx)); } }
fs.writeFileSync(file, JSON.stringify(lines, null, 2) + '\n');
console.log(`Level 1: ${Object.keys(lines).length - before} new lines queued for recording`);
