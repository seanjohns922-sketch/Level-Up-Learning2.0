// Level 7 release logic: week counts, final-week completion, live routes and the next-activity
// path for a real Year 7 student. Runs with the release switch on.
// Run: NEXT_PUBLIC_LEVEL7_LIVE=true node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/level7-release-test.mjs
import assert from 'node:assert/strict';
if (process.env.NEXT_PUBLIC_LEVEL7_LIVE !== 'true') throw new Error('Run with NEXT_PUBLIC_LEVEL7_LIVE=true');
const weeks = await import('../lib/program-weeks.ts');
const progress = await import('../lib/program-progress.ts');
const release = await import('../lib/level7-release.ts');
const routing = await import('../lib/lesson-routing.ts');
const next = await import('../lib/canonical-next-activity.ts');

const LEVEL7 = { number: 12, measurement: 12, space: 10, pattern: 12, statistics: 10, chance: 8 };
const EARLIER = { number: 12, measurement: 8, space: 8, pattern: 8, statistics: 6, chance: 6 };

// Week counts: Level 7 has its own length; earlier years are unchanged.
for (const [realm, n] of Object.entries(LEVEL7)) {
  assert.equal(weeks.getProgramWeekCount(realm, 'Year 7'), n, `${realm} Year 7 weeks`);
  assert.equal(weeks.getProgramWeekCount(realm, 'Year 6'), EARLIER[realm], `${realm} Year 6 weeks`);
  assert.equal(weeks.getProgramWeekCount(realm), EARLIER[realm], `${realm} default weeks`);
  assert.deepEqual(weeks.getProgramWeeks(realm, 'Year 7'), Array.from({ length: n }, (_, i) => i + 1));
}

// Week completion: Level 7's final week needs only its lessons; other weeks need a passed quiz.
const lessonsOnly = { lessonsCompleted: [true, true, true], quizCompleted: false, quizScore: 0 };
const passed = { lessonsCompleted: [true, true, true], quizCompleted: true, quizScore: 90, quizBestScore: 90 };
for (const [realm, n] of Object.entries(LEVEL7)) {
  assert.equal(progress.isWeekCompleteForRealm(lessonsOnly, realm, n, 'Year 7'), true, `${realm} final week`);
  assert.equal(progress.isWeekCompleteForRealm(lessonsOnly, realm, n - 1, 'Year 7'), false, `${realm} week before final`);
  assert.equal(progress.isWeekCompleteForRealm(passed, realm, n - 1, 'Year 7'), true);
}
// Probability: Week 6 is final for Years 1–6 but has a quiz in Level 7.
assert.equal(progress.isWeekCompleteForRealm(lessonsOnly, 'chance', 6, 'Year 6'), true);
assert.equal(progress.isWeekCompleteForRealm(lessonsOnly, 'chance', 6, 'Year 7'), false);

// Week lists are clamped to the student's year.
assert.deepEqual(progress.normalizeWeekList([1, 7, 10, 11], 'statistics', 'Year 7'), [1, 7, 10]);
assert.deepEqual(progress.normalizeWeekList([1, 7, 10], 'statistics', 'Year 6'), [1]);

// Live routes.
assert.equal(release.LEVEL7_LIVE, true);
assert.equal(release.level7LiveHref('statistics', 3, 2), '/lesson?year=Year%207&realm_id=statistics&week=3&lessonId=y7-statistics-w3-l2');
assert.equal(release.level7LiveHref('number', 3, 2), '/lesson?year=Year%207&realm_id=number&week=3&lessonId=y7-w3-l2');
assert.equal(release.level7LiveHref('space', 4, 'quiz'), '/level7/quiz?year=Year%207&realm_id=space&week=4&type=quiz&n=1');
assert.equal(release.level7LiveHref('space', 10, 'quiz'), '/posttest?year=Year%207&realm_id=space', 'final week goes to the post-test');
assert.equal(release.level7LiveHref('chance', 2, 'week'), '/program?year=Year%207&realm_id=chance&week=2&expedition=1');
for (const realm of Object.keys(LEVEL7)) {
  assert.equal(routing.buildLessonRoute({ yearLabel: 'Year 7', week: 2, lessonNumber: 1, realmId: realm }), release.level7LiveHref(realm, 2, 1));
}
assert.ok(!routing.buildLessonRoute({ yearLabel: 'Year 6', week: 2, lessonNumber: 1, realmId: 'statistics' }).includes('Year%207'));

// Next activity for a Year 7 Statistics student on the full pathway.
const progressFor = (week) => ({ year: 'Year 7', status: 'ASSIGNED_PROGRAM', placementComplete: true, assignedWeek: week, requiredWeeks: Array.from({ length: 10 }, (_, i) => i + 1), optionalWeeks: [], teacherAdvancedWeeks: [] });
const storeWith = (weeksDone, finalLessons, partial) => {
  const store = {};
  for (let w = 1; w <= weeksDone; w++) store[progress.makeProgramProgressKey('Year 7', w, 'statistics')] = { lessonsCompleted: [true, true, true], quizCompleted: true, quizScore: 100, quizBestScore: 100 };
  if (finalLessons) store[progress.makeProgramProgressKey('Year 7', 10, 'statistics')] = { lessonsCompleted: [true, true, true], quizCompleted: false };
  if (partial) store[progress.makeProgramProgressKey('Year 7', weeksDone + 1, 'statistics')] = partial;
  return store;
};
let step = next.resolveCanonicalNextActivity({ realmId: 'statistics', progress: progressFor(1), store: {} });
assert.equal(step.type, 'lesson');
assert.equal(step.route, release.level7LiveHref('statistics', 1, 1));
step = next.resolveCanonicalNextActivity({ realmId: 'statistics', progress: progressFor(3), store: storeWith(2, false, { lessonsCompleted: [true, true, true], quizCompleted: false }) });
assert.equal(step.type, 'quiz');
assert.equal(step.route, release.level7LiveHref('statistics', 3, 'quiz'));
step = next.resolveCanonicalNextActivity({ realmId: 'statistics', progress: progressFor(10), store: storeWith(9, true) });
assert.equal(step.type, 'posttest', JSON.stringify(step));
// Before the change, Week 6 of 10 would have triggered the post-test.
step = next.resolveCanonicalNextActivity({ realmId: 'statistics', progress: progressFor(7), store: storeWith(6, false) });
assert.equal(step.type, 'lesson');
assert.equal(step.week, 7);
console.log('PASS Level 7 release: week counts, final-week completion, live routes and next-activity path.');
