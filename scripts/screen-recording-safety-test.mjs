import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { activityHarness } from './test-support/activity-harness.mjs';

for (const file of ['components/StudentScreenRecorder.tsx', 'components/teacher/StudentScreenViewer.tsx', 'lib/screen-recorder.ts']) {
  assert(!fs.existsSync(file), `Retired recording entry point must stay deleted: ${file}`);
}
function sources(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? sources(file) : /\.(?:[cm]?[jt]sx?|html)$/.test(file) ? [file] : [];
  });
}
const forbidden = /rrweb|screen_events|StudentScreenRecorder|StudentScreenViewer|startScreenRecording|getDisplayMedia|new\s+MediaRecorder|Live Screen|\.channel\(\s*['"`]screen-/i;
for (const root of ['app', 'components', 'lib', 'data', 'public']) {
  for (const file of sources(root)) assert(!forbidden.test(fs.readFileSync(file, 'utf8')), `Recording code/control found: ${file}`);
}
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
for (const name of [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {}), ...Object.keys(lock.packages ?? {})]) {
  assert(!/(?:^|\/)(?:@rrweb\/|(?:rrweb|rrdom)(?:-|\/|$))/.test(name), `Recording dependency found: ${name}`);
}

// Exercise the actual drawer rendering and close control with representative data.
let closed = false;
const props = {
  open: true, onClose: () => { closed = true; },
  student: { id: 'synthetic', displayName: 'Audit Student', status: 'needs_support', currentWeek: 2,
    currentLesson: 'L3', currentLessonTitle: 'Fraction practice', currentActivityLabel: 'Compare fractions',
    currentQuestionText: 'Which fraction is larger?', latestSelectedAnswer: '1/2', latestCorrectAnswer: '3/4',
    latestAnswerCorrect: false, questionsAnswered: 5, correctCount: 4, scoreSource: 'live',
    currentLessonStatus: 'active', aiIssue: 'Needs fraction support', aiSuggestedAction: 'Use a fraction strip' },
  events: [{ id: 'event', event_type: 'lesson_completed', created_at: new Date().toISOString(), payload: {} }],
};
const drawer = activityHarness('components/teacher/LiveStudentDrawer.tsx', props, 'LiveStudentDrawer');
const rendered = drawer.text(drawer.render());
for (const label of ['Audit Student', 'Needs Support', 'Fraction practice', 'Compare fractions', 'Which fraction is larger?', '4/5', '80%', 'Completed lesson', 'Use a fraction strip']) {
  assert(rendered.includes(label), `Live tracking lost: ${label}`);
}
assert(!/Live Screen|screen shar/i.test(rendered));
drawer.click('✕'); assert(closed, 'Close control must still work');
props.student.currentLessonStatus = 'completed'; props.student.scoreSource = 'canonical';
assert(drawer.text(drawer.render()).includes('Final accuracy'));
props.open = false; assert.equal(drawer.render(), null);

const live = fs.readFileSync('components/teacher/LiveClassPanel.tsx', 'utf8');
assert(live.includes('config: { private: true }'), 'Live Class must support private-only server containment');
for (const table of ['live_student_activity', 'live_activity_events', 'student_lesson_attempts', 'student_weekly_quiz_attempts']) {
  assert(live.includes(`table: "${table}"`), `Live Class subscription lost: ${table}`);
}
assert(live.includes('setInterval(loadRows, 30000)'), 'Keep tracking refresh fallback');
const policy = fs.readFileSync('supabase/manual/screen-sharing-retirement/prepare.sql', 'utf8');
assert(policy.includes("not like 'screen-%'") && policy.includes('as restrictive for all'));
assert(policy.includes('as restrictive for insert') && policy.includes('with check (false)'));
assert(policy.includes('public.can_view_class('));
console.log('PASS: recording code/dependencies/controls absent; Live Class drawer, completion reporting and refresh paths preserved. Server SQL and old-client containment still require staging/production verification.');
