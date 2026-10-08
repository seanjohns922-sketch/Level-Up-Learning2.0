import assert from 'node:assert/strict';
import fs from 'node:fs';
import { programs } from '../data/programs/index.ts';
import { buildLessonActivityPool, generateQuestion, getLevelForLesson } from '../data/activities/year2/lessonEngine.ts';
import { PATTERN_PEAKS_PROGRAMS } from '../data/programs/patternPeaks.ts';
import { STATISTICA_PROGRAMS } from '../data/programs/statistica.ts';
import { CHANCE_HOLLOW_PROGRAMS } from '../data/programs/chanceHollow.ts';
import { generatePatternPeaksQuestion } from '../data/activities/patternPeaks/generator.ts';
const seedStart = Number(process.env.AUDIT_SEED ?? 20261008);
let seed = seedStart;
Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const report = { seed: seedStart, samples: 0, mathematicalChecks: 0, lessons: {}, kinds: {}, issues: [], examples: {} };
function inspect(task, context) {
  assert(task && typeof task.kind === 'string', `${context}: missing task`);
  report.samples++;
  report.kinds[task.kind] = (report.kinds[task.kind] ?? 0) + 1;
  report.examples[`${task.kind}:${task.mode ?? task.scene ?? ''}`] ??= {context, task};
  function finite(value, field) {
    if (typeof value === 'number' && !Number.isFinite(value)) report.issues.push(`${context}: non-finite ${field}`);
    if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) finite(child, `${field}.${key}`);
  }
  finite(task, 'task');
  const prompt = task.prompt ?? '';
  let expected;
  const direct = prompt.replaceAll(',', '').match(/^(?:Calculate |Work out )?(-?\d+(?:\.\d+)?)\s*([+×÷−-])\s*(-?\d+(?:\.\d+)?)\s*=\s*\?$/);
  if (direct) {
    const a = Number(direct[1]), b = Number(direct[3]);
    expected = direct[2] === '+' ? a+b : ['−','-'].includes(direct[2]) ? a-b : direct[2] === '×' ? a*b : a/b;
  }
  const estimate = prompt.match(/^Round two-digit numbers to the nearest 10\. Estimate (\d+) × (\d+)\.$/);
  if (estimate) expected = [Number(estimate[1]),Number(estimate[2])].map(n => n < 10 ? n : Math.floor((n+5)/10)*10).reduce((a,b)=>a*b);
  const missing = prompt.match(/^If (\d+) \+ \? = (\d+), what is the missing number\?$/);
  if (missing) expected = Number(missing[2])-Number(missing[1]);
  if (task.kind === 'addition_strategy') expected = task.a + task.b;
  if (task.kind === 'subtraction_strategy') expected = task.total - task.remove;
  if (task.kind === 'arrays' && task.mode !== 'repeated_addition') expected = task.rows * task.columns;
  if (expected !== undefined && typeof task.answer !== 'undefined' && Number.isFinite(expected)) {
    report.mathematicalChecks++;
    const actual = Number(String(task.answer).replaceAll(',',''));
    if (!Number.isFinite(actual) || Math.abs(actual-expected)>1e-7) report.issues.push(`${context}: mathematical answer ${task.answer} should be ${expected}: ${JSON.stringify(task)}`);
  }

  if (['multiple_choice','mcq'].includes(task.kind) && Array.isArray(task.options) && task.options.every(option => ['string','number'].includes(typeof option))) {
    const options = task.options.map(String);
    if ('answer' in task && !options.includes(String(task.answer))) report.issues.push(`${context}: answer absent from options ${JSON.stringify(task)}`);
    if (new Set(options).size !== options.length) report.issues.push(`${context}: duplicate options ${JSON.stringify(task)}`);
  }
}
function sample(realm, level, lesson, generators) {
  const key = `${realm}:${level}:${lesson.id}`;
  assert(!report.lessons[key], `Duplicate ${key}`);
  report.lessons[key] = 0;
  for (const generate of generators) for (let index = 0; index < 30; index++) {
    const difficulty = ['easy','medium','hard'][index % 3];
    inspect(generate(difficulty), `${key}:${index}`); report.lessons[key]++;
  }
}
for (let level = 0; level <= 6; level++) {
  for (const week of programs[level]) {
    let legacy;
    if (level < 2) legacy = await import(`../data/activities/${level === 0 ? 'prep' : 'year1'}/week${week.week}.ts`);
    for (const lesson of week.lessons) {
      if (level >= 2) {
        const pool = buildLessonActivityPool(getLevelForLesson(lesson), lesson);
        assert.equal(pool.violations.length, 0, lesson.id);
        sample('number',level,lesson,pool.activities.map(activity => () => generateQuestion(getLevelForLesson(lesson),lesson,activity)));
      } else {
        const prefix = level === 0 ? 'Prep' : '';
        legacy[`reset${prefix}Week${week.week}TaskSessionState`]?.();
        sample('number',level,lesson,[difficulty => level === 1 && [4,5,6,7].includes(week.week)
          ? legacy[`generateWeek${week.week}Task`](lesson.id,undefined,difficulty)
          : legacy[`generate${prefix}Week${week.week}Task`](lesson.id,difficulty)]);
      }
    }
  }
  const folder = level === 0 ? 'prepMeasurelands' : `year${level}Measurelands`;
  const prefix = level === 0 ? 'Prep' : `Y${level}`;
  const registry = await import(`../data/activities/${folder}/registry.ts`);
  const mp = await import(`../data/programs/${folder}.ts`);
  for (const week of mp[`${level === 0 ? 'PREP' : `YEAR${level}`}_MEASURELANDS_PROGRAM`]) for (const lesson of week.lessons) {
    registry[`reset${prefix}MeasurelandsLessonSessionState`]();
    sample('measurement',level,lesson,[difficulty => registry[`resolve${prefix}MeasurelandsLessonTask`](lesson.id,difficulty)]);
  }
  const names = ['GROUND','LEVEL_ONE','LEVEL_TWO','LEVEL_THREE','LEVEL_FOUR','LEVEL_FIVE','LEVEL_SIX'];
  const space = await import(`../data/activities/starpath/${level === 0 ? 'ground' : `level${level}`}/index.ts`);
  for (const [id, content] of Object.entries(space[`${names[level]}_LESSON_CONTENT`])) {
    const tasks = content.createTaskSet(); sample('space',level,{id},[tasks.teaching,...tasks.activities].map(generate => difficulty => generate({ difficulty, secondsLeft: 300, totalSeconds: 540, elapsedSeconds: 240 })));
  }
  if (level >= 1) {
    const statistics = await import(`../data/activities/statistica/level${level}.ts`);
    for (const week of STATISTICA_PROGRAMS[level]) for (const lesson of week.lessons) {
      const tasks = statistics[`getStatisticaLevel${level}TaskSet`](lesson.id);
      sample('statistics',level,lesson,[tasks.teaching,...tasks.activities].map(generate => difficulty => generate({ difficulty, secondsLeft: 300, totalSeconds: 540, elapsedSeconds: 240 })));
    }
  }
  if (level >= 3) {
    for (const week of PATTERN_PEAKS_PROGRAMS[`Year ${level}`]) for (const lesson of week.lessons) {
      sample('pattern',level,lesson,lesson.activities.map(activity => () => generatePatternPeaksQuestion(level,lesson,activity)));
    }
    const chance = await import(`../data/activities/chanceHollow/level${level}.ts`);
    for (const week of CHANCE_HOLLOW_PROGRAMS[level]) for (const lesson of week.lessons) {
      const tasks = chance[`getChanceHollowLevel${level}TaskSet`](lesson.id);
      sample('chance',level,lesson,[tasks.teaching,...tasks.activities].map(generate => difficulty => generate({ difficulty, secondsLeft: 300, totalSeconds: 540, elapsedSeconds: 240 })));
    }
  }
}
const target = process.env.AUDIT_OUTPUT;
if (target) fs.writeFileSync(target,JSON.stringify(report,null,2));
console.log(`${Object.keys(report.lessons).length} lessons; ${report.samples} samples; ${Object.keys(report.kinds).length} task kinds; seed ${seedStart}.`);
assert.equal(report.issues.length,0,report.issues.slice(0,15).join('\n'));
console.log('PASS: G–6 generated task structure, finite numeric data, and primitive choice answer availability/uniqueness. This does not certify mathematical correctness of every task kind.');
