import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

function loadTypeScriptModule(relativePath, mocks = {}) {
  const filename = path.join(root, relativePath);
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: filename,
  }).outputText;
  const module = { exports: {} };
  const localRequire = (specifier) => {
    if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
    throw new Error(`Unexpected import ${specifier} while loading ${relativePath}`);
  };
  const execute = new Function("exports", "require", "module", "__filename", "__dirname", output);
  execute(module.exports, localRequire, module, filename, path.dirname(filename));
  return module.exports;
}

const realmRegistry = loadTypeScriptModule("lib/realms/realm-registry.ts");
const snapshotModule = loadTypeScriptModule("lib/teacher/teacher-student-snapshot.ts", {
  "@/lib/realms/realm-registry": realmRegistry,
  "@/lib/studentLevelLabel": {
    normalizeWorkingLevelLabel: (value) => value ?? null,
  },
});
const insightModule = loadTypeScriptModule("lib/teacher-insights.ts", {
  "@/lib/skill-coaching": {
    resolveCoachingKey: () => "fixture-skill",
    getSkillCoaching: () => ({
      teacherAction: "Use one focused worked example.",
      misconception: "Fixture misconception",
      suggestedPractice: "Fixture practice",
    }),
  },
});

const {
  buildTeacherStudentSnapshot,
  getRealmWeekNumbers,
  selectCanonicalTeacherProgressRow,
} = snapshotModule;
const { buildHeuristicTeacherInsight } = insightModule;

function progressRow(overrides) {
  return {
    student_id: "student-1",
    realm_id: "number",
    year: "Year 6",
    is_current: true,
    week: 4,
    status: "LEARNING",
    pretest_score: 60,
    placement_complete: true,
    required_weeks: [],
    optional_weeks: [],
    completed_lesson_ids: [],
    unlocked_legends: [],
    quiz_scores: {},
    lesson_attempts: [],
    weekly_quiz_attempts: [],
    assessment_attempts: [],
    updated_at: "2026-08-04T00:00:00.000Z",
    ...overrides,
  };
}

const numberAssessment = {
  id: "number-pretest-1",
  realmId: "number",
  workingLevel: "Year 6",
  assessmentType: "pretest",
  attemptNumber: 1,
  correctCount: 17,
  totalQuestions: 20,
  scorePercent: 85,
  passed: true,
  completedAt: "2026-08-01T00:00:00.000Z",
  placementResult: {},
  questionResults: [],
};
const measurementAssessment = {
  ...numberAssessment,
  id: "measurement-pretest-1",
  realmId: "measurement",
  workingLevel: "Year 5",
  scorePercent: 65,
  passed: false,
};
const override = {
  id: "override-1",
  student_id: "student-1",
  realm_id: "measurement",
  working_level: "Year 5",
  week: 5,
  advanced_to_week: 7,
  teacher_id: "teacher-1",
  reason: "teacher_professional_judgement",
  notes: null,
  created_at: "2026-08-03T00:00:00.000Z",
};

const fixtureRows = [
  progressRow({
    realm_id: "number",
    year: "Year 6",
    week: 4,
    required_weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    assessment_attempts: [numberAssessment],
  }),
  progressRow({
    realm_id: "measurement",
    year: "Year 5",
    week: 7,
    required_weeks: [2, 5, 6, 7],
    optional_weeks: [1, 3, 4, 8, 9],
    teacher_advanced_weeks: [5],
    teacher_overrides: [override],
    assessment_attempts: [measurementAssessment],
    updated_at: "2026-08-04T01:00:00.000Z",
  }),
  progressRow({
    realm_id: "number",
    year: "Year 5",
    week: 12,
    is_current: false,
    updated_at: "2026-08-04T02:00:00.000Z",
  }),
];

// One student may have different placements in each realm. Selection must be exact.
const numberSnapshot = buildTeacherStudentSnapshot({
  studentId: "student-1",
  realmId: "number",
  progressRows: fixtureRows,
});
const measurementSnapshot = buildTeacherStudentSnapshot({
  studentId: "student-1",
  realmId: "measurement",
  progressRows: fixtureRows,
});
const spaceSnapshot = buildTeacherStudentSnapshot({
  studentId: "student-1",
  realmId: "space",
  progressRows: fixtureRows,
});

assert.equal(numberSnapshot.currentLevel, "Year 6");
assert.equal(numberSnapshot.currentWeek, 4);
assert.equal(numberSnapshot.assessments[0].id, "number-pretest-1");
assert.equal(measurementSnapshot.currentLevel, "Year 5");
assert.equal(measurementSnapshot.currentWeek, 7);
assert.equal(measurementSnapshot.assessments[0].id, "measurement-pretest-1");
assert.equal(spaceSnapshot.placementState, "not_placed");
assert.equal(spaceSnapshot.currentLevel, null);
assert.equal(spaceSnapshot.currentWeek, null);

// Registry controls journey length and lesson/quiz structure.
assert.equal(realmRegistry.getRealmDefinition("number").totalWeeks, 12);
assert.equal(realmRegistry.getRealmDefinition("number").lessonsPerWeek, 3);
assert.equal(realmRegistry.getRealmDefinition("number").hasWeeklyQuiz, true);
assert.deepEqual(getRealmWeekNumbers("number"), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
assert.equal(realmRegistry.getRealmDefinition("measurement").totalWeeks, 8);
assert.equal(realmRegistry.getRealmDefinition("measurement").lessonsPerWeek, 3);
assert.equal(realmRegistry.getRealmDefinition("measurement").hasWeeklyQuiz, true);
assert.deepEqual(getRealmWeekNumbers("measurement"), [1, 2, 3, 4, 5, 6, 7, 8]);
assert.deepEqual(measurementSnapshot.requiredWeeks, [2, 5, 6, 7]);
assert.deepEqual(measurementSnapshot.optionalWeeks, [1, 3, 4, 8]);
assert.equal(measurementSnapshot.pathway, "targeted");

// Missing and failed reads must not invent placement, Week 1, zero accuracy, or another realm.
const unavailableSnapshot = buildTeacherStudentSnapshot({
  studentId: "student-1",
  realmId: "measurement",
  progressRows: fixtureRows,
  sourceAvailable: false,
});
assert.equal(unavailableSnapshot.placementState, "unavailable");
assert.equal(unavailableSnapshot.currentLevel, null);
assert.equal(unavailableSnapshot.currentWeek, null);

// Teacher advancement remains an audit event and does not fabricate attempts or scores.
assert.deepEqual(measurementSnapshot.progress.teacher_advanced_weeks, [5]);
assert.deepEqual(measurementSnapshot.progress.teacher_overrides, [override]);
assert.deepEqual(measurementSnapshot.progress.lesson_attempts, []);
assert.deepEqual(measurementSnapshot.progress.weekly_quiz_attempts, []);

// Current rows win within a realm; unrelated telemetry cannot participate in selection.
assert.equal(
  selectCanonicalTeacherProgressRow("student-1", "number", fixtureRows).year,
  "Year 6",
);
assert.equal(selectCanonicalTeacherProgressRow("other-student", "number", fixtureRows), null);

// Coaching must admit low evidence and must not reteach a mastered weakest skill.
const noEvidence = buildHeuristicTeacherInsight({
  studentId: "student-1",
  level: "Year 5",
  strand: "Measurement",
  week: 7,
  accuracy: 0,
  questionsAnswered: 0,
});
assert.equal(noEvidence.confidence, "Low");
assert.equal(noEvidence.needsSupport, "Not enough evidence yet");
assert.match(noEvidence.teacherAction, /Continue learning/i);

const littleEvidence = buildHeuristicTeacherInsight({
  studentId: "student-1",
  level: "Year 5",
  strand: "Measurement",
  week: 7,
  accuracy: 100,
  questionsAnswered: 2,
  topicSummaries: [{ label: "Area", correct: 2, total: 2, accuracy: 100 }],
});
assert.equal(littleEvidence.confidence, "Low");
assert.equal(littleEvidence.needsSupport, "Not enough evidence yet");

const masteredEvidence = buildHeuristicTeacherInsight({
  studentId: "student-1",
  level: "Year 5",
  strand: "Measurement",
  week: 7,
  accuracy: 90,
  questionsAnswered: 20,
  topicSummaries: [
    { label: "Area", correct: 9, total: 10, accuracy: 90 },
    { label: "Angles", correct: 10, total: 10, accuracy: 100 },
  ],
});
assert.equal(masteredEvidence.confidence, "High");
assert.equal(masteredEvidence.needsSupport, "No priority gap identified");
assert.doesNotMatch(masteredEvidence.teacherAction, /reteach/i);

const supportEvidence = buildHeuristicTeacherInsight({
  studentId: "student-1",
  level: "Year 5",
  strand: "Measurement",
  week: 7,
  accuracy: 55,
  questionsAnswered: 20,
  topicSummaries: [
    { label: "Area", correct: 3, total: 10, accuracy: 30 },
    { label: "Angles", correct: 8, total: 10, accuracy: 80 },
  ],
});
assert.equal(supportEvidence.confidence, "High");
assert.equal(supportEvidence.needsSupport, "Area");

// Every educator surface must consume the canonical realm selector/snapshot.
const sourceContracts = [
  ["Dashboard", "app/teacher/dashboard/page.tsx", /selectCanonicalTeacherProgressRow/],
  ["Students tab", "components/teacher/StrandStudentsPanel.tsx", /buildTeacherStudentSnapshot/],
  ["Student Insights", "app/teacher/student-insights/page.tsx", /buildTeacherStudentSnapshot/],
  ["Live Class", "components/teacher/LiveClassPanel.tsx", /selectCanonicalTeacherProgressRow/],
  ["Curriculum", "components/teacher/CurriculumExplorer.tsx", /selectCanonicalTeacherProgressRow/],
];
for (const [label, relativePath, pattern] of sourceContracts) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  assert.match(source, pattern, `${label} must consume canonical teacher progress`);
}

const dashboardSource = fs.readFileSync(path.join(root, "app/teacher/dashboard/page.tsx"), "utf8");
assert.match(
  dashboardSource,
  /selectCanonicalTeacherProgressRow\(student\.id, analyticsRealmId, progress\)/,
  "Expanded student view must stay scoped to the selected analytics realm",
);
assert.doesNotMatch(
  dashboardSource,
  /getStudentProgress\(student\.id/,
  "Expanded student view must not use the legacy cross-realm selector",
);

const insightsSource = fs.readFileSync(path.join(root, "app/teacher/student-insights/page.tsx"), "utf8");
assert.match(insightsSource, /snapshot\.currentLevel/);
assert.match(insightsSource, /snapshot\.currentWeek/);
assert.match(insightsSource, /Progress unavailable/);
assert.match(insightsSource, /Not placed/);

const liveSource = fs.readFileSync(path.join(root, "components/teacher/LiveClassPanel.tsx"), "utf8");
assert.match(liveSource, /Waiting to start/);
assert.match(liveSource, /Current accuracy/);
assert.doesNotMatch(liveSource, /realm.*\?\?.*["']number["']/i);

console.log("Teacher canonical snapshot audit passed.");
console.log("Realm isolation, 12/8-week journeys, targeted pathways, missing placement,");
console.log("teacher overrides, assessment identity, telemetry isolation, and coaching confidence verified.");
