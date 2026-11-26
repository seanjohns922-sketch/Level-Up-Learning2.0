// Level 8 release logic: week counts, final-week completion, live routes, the next-activity path
// and stronghold entry for a real Year 8 student. Runs with the release switches on.
// Run: NEXT_PUBLIC_LEVEL7_LIVE=true node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/level8-release-test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
if (process.env.NEXT_PUBLIC_LEVEL7_LIVE !== 'true') throw new Error('Run with NEXT_PUBLIC_LEVEL7_LIVE=true');
const weeks = await import('../lib/program-weeks.ts');
const progress = await import('../lib/program-progress.ts');
const release = await import('../lib/level8-release.ts');
const routing = await import('../lib/lesson-routing.ts');
const next = await import('../lib/canonical-next-activity.ts');
const entry = await import('../lib/realm-entry.ts');

const LEVEL8 = { number: 12, measurement: 12, space: 10, pattern: 12, statistics: 10, chance: 10 };

// The switch follows Level 7 unless Level 8 is turned off on its own.
assert.equal(release.LEVEL8_LIVE, process.env.NEXT_PUBLIC_LEVEL8_LIVE !== 'false');
assert.match(fs.readFileSync('lib/level8-release.ts', 'utf8'), /LEVEL8_LIVE = LEVEL7_LIVE && process\.env\.NEXT_PUBLIC_LEVEL8_LIVE !== "false"/);

// Week counts match the database's realm_program_week_count for Year 8.
const migration = fs.readFileSync('supabase/migrations/20261128120000_level8_live.sql', 'utf8');
for (const [realm, n] of Object.entries(LEVEL8)) {
  assert.equal(weeks.getProgramWeekCount(realm, 'Year 8'), n, `${realm} Year 8 weeks`);
  assert.deepEqual(weeks.getProgramWeeks(realm, 'Year 8'), Array.from({ length: n }, (_, i) => i + 1));
}
const serverYear8 = migration.match(/when p_working_level='Year 8' then\s+case p_realm_id ([^\n]+)\n\s+([^\n]+)/);
assert.ok(serverYear8, 'migration gives Year 8 its own lengths');
for (const [realm, n] of Object.entries(LEVEL8)) assert.match(`${serverYear8[1]} ${serverYear8[2]}`, new RegExp(`when '${realm}' then ${n}\\b`), `${realm}: server and app agree on ${n} weeks`);

// Week completion: the final week needs only its lessons (the post-test replaces its quiz); other weeks need a passed quiz.
const lessonsOnly = { lessonsCompleted: [true, true, true], quizCompleted: false, quizScore: 0 };
const passed = { lessonsCompleted: [true, true, true], quizCompleted: true, quizScore: 90, quizBestScore: 90 };
for (const [realm, n] of Object.entries(LEVEL8)) {
  assert.equal(progress.isWeekCompleteForRealm(lessonsOnly, realm, n, 'Year 8'), true, `${realm} final week`);
  assert.equal(progress.isWeekCompleteForRealm(lessonsOnly, realm, n - 1, 'Year 8'), false, `${realm} week before final`);
  assert.equal(progress.isWeekCompleteForRealm(passed, realm, n - 1, 'Year 8'), true);
}
assert.match(migration, /p_working_level in \('Year 7','Year 8'\) and required_week\.value::integer=maximum_week/, 'server: final week finishes on lessons at Level 8 too');

// Live routes.
assert.equal(release.level8LiveHref('statistics', 3, 2), '/lesson?year=Year%208&realm_id=statistics&week=3&lessonId=y8-statistics-w3-l2');
assert.equal(release.level8LiveHref('number', 3, 2), '/lesson?year=Year%208&realm_id=number&week=3&lessonId=y8-number-w3-l2');
assert.equal(release.level8LiveHref('space', 4, 'quiz'), '/level8/quiz?year=Year%208&realm_id=space&week=4&type=quiz&n=1');
assert.equal(release.level8LiveHref('space', 10, 'quiz'), '/posttest?year=Year%208&realm_id=space', 'final week goes to the post-test');
assert.equal(release.level8LiveHref('chance', 2, 'week'), '/program?year=Year%208&realm_id=chance&week=2&expedition=1');
assert.equal(release.level8StrongholdHref('pattern'), '/world/expedition/pattern/stronghold');
assert.equal(release.level8StrongholdHref('pattern', { week: 4 }), '/world/expedition/pattern/stronghold?week=4');
assert.equal(release.level8StrongholdHref('pattern', { victory: true }), '/world/expedition/pattern/stronghold?victory=1');
for (const realm of Object.keys(LEVEL8)) {
  assert.equal(routing.buildLessonRoute({ yearLabel: 'Year 8', week: 2, lessonNumber: 1, realmId: realm }), release.level8LiveHref(realm, 2, 1));
}

// Next activity for a Year 8 Statistics student on the full pathway, through to the final battle.
const progressFor = (week) => ({ year: 'Year 8', status: 'ASSIGNED_PROGRAM', placementComplete: true, assignedWeek: week, requiredWeeks: Array.from({ length: 10 }, (_, i) => i + 1), optionalWeeks: [], teacherAdvancedWeeks: [] });
const storeWith = (weeksDone, finalLessons, partial) => {
  const store = {};
  for (let w = 1; w <= weeksDone; w++) store[progress.makeProgramProgressKey('Year 8', w, 'statistics')] = { lessonsCompleted: [true, true, true], quizCompleted: true, quizScore: 100, quizBestScore: 100 };
  if (finalLessons) store[progress.makeProgramProgressKey('Year 8', 10, 'statistics')] = { lessonsCompleted: [true, true, true], quizCompleted: false };
  if (partial) store[progress.makeProgramProgressKey('Year 8', weeksDone + 1, 'statistics')] = partial;
  return store;
};
let step = next.resolveCanonicalNextActivity({ realmId: 'statistics', progress: progressFor(1), store: {} });
assert.equal(step.type, 'lesson');
assert.equal(step.route, release.level8LiveHref('statistics', 1, 1));
step = next.resolveCanonicalNextActivity({ realmId: 'statistics', progress: progressFor(3), store: storeWith(2, false, { lessonsCompleted: [true, true, true], quizCompleted: false }) });
assert.equal(step.type, 'quiz');
assert.equal(step.route, release.level8LiveHref('statistics', 3, 'quiz'));
step = next.resolveCanonicalNextActivity({ realmId: 'statistics', progress: progressFor(10), store: storeWith(9, true) });
assert.equal(step.type, 'posttest', JSON.stringify(step));
assert.equal(step.route, release.level8LiveHref('statistics', 10, 'posttest'));
step = next.resolveCanonicalNextActivity({ realmId: 'statistics', progress: progressFor(7), store: storeWith(6, false) });
assert.equal(step.type, 'lesson');
assert.equal(step.week, 7);
console.log('PASS Level 8 release: week counts (app and server), final-week completion, live routes and next-activity path.');

// Every stronghold uses the same canonical week gates as the caves and the earlier realm maps.
for (const [realm, n] of Object.entries(LEVEL8)) {
  const required = weeks.getProgramWeeks(realm, 'Year 8');
  const playable = (store, assigned = 1, advanced = []) => progress.getPlayableWeeks(store, 'Year 8', required, [], realm, advanced, assigned);
  assert.deepEqual(playable({}), [1], `${realm}: later portals start locked`);
  const key = progress.makeProgramProgressKey('Year 8', 1, realm);
  assert.deepEqual(playable({ [key]: { ...passed, quizScore: 79, quizBestScore: 79 } }), [1]);
  assert.deepEqual(playable({ [key]: { ...passed, quizScore: 80, quizBestScore: 80 } }), [1, 2]);
  assert.deepEqual(playable({}, 3, [1, 2]), [1, 2, 3], `${realm}: teacher advancement is retained`);
  const completed = Object.fromEntries(required.map(w => [progress.makeProgramProgressKey('Year 8', w, realm), w === n ? lessonsOnly : passed]));
  assert.deepEqual(playable(completed), required);
  assert.equal(progress.hasCompletedRequiredWeeks(completed, 'Year 8', required, realm, []), true, `${realm}: every week done opens the Core chamber`);
  assert.equal(entry.resolveRealmEntryRoute({ realmId: realm, progress: progressFor(1), fallbackYear: 'Year 8', introSeen: true }), release.level8StrongholdHref(realm));
  assert.equal(entry.resolveRealmEntryRoute({ realmId: realm, progress: { ...progressFor(1), placementComplete: false }, fallbackYear: 'Year 8', introSeen: true }), `/pretest?year=Year%208&realm_id=${realm}`);
}
console.log('PASS stronghold portals: 80% weekly pass, teacher advancement, Core chamber after every week, and stronghold entry in all six realms.');
