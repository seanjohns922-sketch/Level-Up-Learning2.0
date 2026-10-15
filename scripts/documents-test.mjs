import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { classLoginCardsHtml, homeAccessCardsHtml, singleLoginCardHtml } from "../lib/documents/login-cards.ts";
import { learningJourneyHtml, placementBaselineHtml, studentProgressReportHtml } from "../lib/documents/school-reports.ts";
import { buildParentReportHtml } from "../lib/parent-report-print.ts";
import { buildStudentRosterTemplate } from "../lib/student-roster-template.ts";
import { readFileSync } from "node:fs";
import ExcelJS from "exceljs";
import { scopeAndSequenceHtml } from "../lib/documents/scope-sequence.ts";
import { diagnosticReportHtml, realmTestLevel } from "../lib/documents/diagnostic-report.ts";
import { getCurriculumPlan } from "../data/programs/genres.ts";
import { coverageRows, FRAMEWORKS, frameworkAvailable, frameworkCodes } from "../lib/curriculum/frameworks.ts";
import { buildStrandReport } from "../lib/teacher/strand-report.ts";
import { strandReportHtml } from "../lib/documents/strand-report.ts";

// Builds every RELIQ document with sample data. Set DOCS_OUT=<folder> to also
// write the HTML for a visual check.
const out = process.env.DOCS_OUT;
const save = (name, html) => { if (out) { mkdirSync(out, { recursive: true }); writeFileSync(`${out}/${name}.html`, html); } };
const pages = (html) => (html.match(/<section class="page">/g) ?? []).length;
const qr = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const logo = { src: "https://example.test/schools/cobram-primary-logo.png", alt: "Cobram Primary School logo" };
const nasty = `Ava <script>alert(1)</script> & "Co"`;

// Login cards: six per page, escaped, school logo under the QR.
const students = Array.from({ length: 8 }, (_, i) => ({ name: i === 0 ? nasty : `Student ${i + 1}`, username: `student${i + 1}`, password: String(1000 + i) }));
const classCards = classLoginCardsHtml({ schoolName: "Cobram Primary School", schoolLogo: logo, className: "3/4J", classCode: "KXP4TW", websiteHost: "app.level-up.example", qrSrc: qr, students });
assert.equal(pages(classCards), 2);
assert.ok(!classCards.includes("<script>alert(1)</script>"));
assert.ok(classCards.includes("Ava &lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;Co&quot;"));
assert.ok(classCards.includes("Class code") && classCards.includes("Username") && classCards.includes("Password"));
assert.ok(classCards.includes(logo.src));
save("class-login-cards", classCards);

const single = singleLoginCardHtml({ schoolName: "Cobram Primary School", schoolLogo: logo, className: "3/4J", classCode: "KXP4TW", websiteHost: "app.level-up.example", qrSrc: qr, student: students[1] });
assert.equal(pages(single), 1);
save("single-login-card", single);

const home = homeAccessCardsHtml({ websiteHost: "app.level-up.example", cards: [{ name: "Mia Johns", username: "mia.johns", explorerCode: "EXP-7Q4M" }, { name: nasty, username: "x", explorerCode: "y" }] });
assert.equal(pages(home), 1);
assert.ok(!home.includes("<script>alert(1)</script>") && !home.includes(`class="school-logo"`));
save("home-access-cards", home);

// Placement baseline: summary + two strands, then three a page.
const strand = (label, below) => ({ label, placed: 23, baseline: 57, onLevelPct: 61, belowCount: below, levels: [["Year 2", 4], ["Year 3", 12], ["Year 4", 3], ["Year 5", 3], ["Year 6", 1]], gradeRows: [{ grade: "Year 3", levels: [["Year 2", 3], ["Year 3", 7], ["Year 4", 1]] }, { grade: "Year 4", levels: [["Year 2", 1], ["Year 3", 5], ["Year 4", 2], ["Year 5", 3], ["Year 6", 1]] }] });
const placement = placementBaselineHtml({ brand: { schoolName: "Cobram Primary School", schoolLogo: logo }, scopeLabel: "Whole school", strands: ["Number", "Measurement", "Space", "Statistics", "Algebra", "Probability"].map((label, i) => strand(label, 9 - i)) });
assert.equal(pages(placement), 3);
assert.ok(placement.includes("Where students are working") && placement.includes("Page 3 of 3"));
save("placement-baseline", placement);

// Student progress report from a snapshot student.
const year = { startsOn: "2026-01-01", endsOn: "2026-12-31" };
const student = {
  id: "s1", name: nasty, yearLevel: "Year 3", classId: "c1", className: "3/4J", lastActive: null, averageAccuracy: 60.3, realmsUsed: 4, learningDays: 37,
  activeThisWeek: true, weeklyTargetMet: true, masteredLevels: 1, status: "on_track", averageGrowth: null,
  realms: [
    { realmId: "number", averageAccuracy: 60, activities: 10, currentLevel: "Year 3", currentWeek: 4, pathwayStatus: "active", pretestScore: 60, posttestScore: null, assessmentScore: 60, assessmentLevel: "Year 3", assessmentType: "pretest", mastered: false, growth: null },
    { realmId: "space", averageAccuracy: 80, activities: 10, currentLevel: "Year 3", currentWeek: 1, pathwayStatus: "active", pretestScore: 70, posttestScore: 88, assessmentScore: 88, assessmentLevel: "Year 2", assessmentType: "posttest", mastered: true, growth: 18 },
  ],
  tests: [{ strand: "number", measured: 2.6, testedAt: "2026-06-05T01:00:00Z", source: "pretest" }, { strand: "space", measured: 3.0, testedAt: "2026-09-09T01:00:00Z", source: "posttest" }],
  testHistory: [{ strand: "space", measured: 2.5, testedAt: "2026-03-01T01:00:00Z", source: "pretest" }, { strand: "space", measured: 3.0, testedAt: "2026-09-09T01:00:00Z", source: "posttest" }],
};
const progress = studentProgressReportHtml({ brand: { schoolName: "Cobram Primary School", schoolLogo: logo }, student, year, windowLabel: "This school year" });
assert.equal(pages(progress), 1);
assert.ok(!progress.includes("<script>alert(1)</script>"));
assert.ok(progress.includes("Not tested") && progress.includes("+0.50"));
save("student-progress-report", progress);

// Learning journey.
const journey = learningJourneyHtml({ brand: { schoolName: "Cobram Primary School", schoolLogo: logo }, journey: {
  student: { id: "s1", name: "Frankie Hicks", yearLevel: "Year 5", className: "5B" },
  levels: [
    { realmId: "number", workingLevel: "Prep", isCurrent: false, currentWeek: null, status: "mastered", pretestScore: null, posttestScore: 90, posttestCompletedAt: "2025-09-10T00:00:00Z" },
    { realmId: "number", workingLevel: "Year 1", isCurrent: false, currentWeek: null, status: "mastered", pretestScore: 50, posttestScore: 88, posttestCompletedAt: "2025-10-10T00:00:00Z" },
    { realmId: "number", workingLevel: "Year 2", isCurrent: true, currentWeek: 3, status: "active", pretestScore: 55, posttestScore: null, posttestCompletedAt: null },
    { realmId: "space", workingLevel: "Year 3", isCurrent: true, currentWeek: 5, status: "active", pretestScore: 70, posttestScore: null, posttestCompletedAt: null },
  ],
} });
assert.equal(pages(journey), 1);
assert.ok(journey.includes("Number Nexus") && journey.includes("Starpath") && journey.includes("2 levels mastered"));
save("learning-journey", journey);

// Parent learning report (no school logo for a home learner).
const parent = buildParentReportHtml({
  student: { id: "p1", name: "Amani Boston", yearLevel: "Year 3", schoolName: null },
  levels: [{ realmId: "number", workingLevel: "Prep", isCurrent: false, currentWeek: null, pretestScore: 40, posttestScore: 90, posttestCompletedAt: "2026-02-01T00:00:00Z" }, { realmId: "number", workingLevel: "Year 1", isCurrent: true, currentWeek: 3, pretestScore: 45, posttestScore: null, posttestCompletedAt: null }],
  lessonsCompleted: 84, learningDays: 37, minutesLearning: 1260, passThreshold: 85,
}, { feed: [{ realmId: "number", label: "Lesson 2: Partitioning", week: 3, correct: 13, attempted: 15, accuracy: 87, completedAt: "2026-10-12T01:00:00Z" }] });
assert.equal(pages(parent), 1);
assert.ok(parent.includes("Amani Boston") && parent.includes("Home learner") && !parent.includes(`class="school-logo"`));
save("parent-learning-report", parent);

// Scope and sequence from the real curriculum plan.
for (const [yearLabel, genreId, realmName] of [["Year 3", "number", "Number Nexus"], ["Year 7", "number", "Number Nexus"]]) {
  const plan = getCurriculumPlan(yearLabel, genreId);
  const scope = scopeAndSequenceHtml({ realmName, strandLabel: "Number", yearLabel, weeks: plan.map((week) => ({ week: week.week, topic: week.topic, lessons: week.lessons.map((lesson) => lesson.title), codes: week.lessons.flatMap((lesson) => lesson.curriculum ?? []) })) });
  assert.equal(pages(scope), 1);
  assert.ok(scope.includes(plan[0].topic.replace(/&/g, "&amp;")) && scope.includes(`Number · ${yearLabel.replace("Year", "Level")}`));
  save(`scope-${yearLabel.replace(" ", "-").toLowerCase()}`, scope);
}

// Scope and sequence in each curriculum, with the code-by-code coverage pages.
{
  const plan = getCurriculumPlan("Year 3", "number");
  const lessons = plan.flatMap((week) => week.lessons.map((lesson, index) => ({ week: week.week, lesson: index + 1, title: lesson.title, ac9: lesson.curriculum ?? [] })));
  const build = (framework) => scopeAndSequenceHtml({
    realmName: "Number Nexus", strandLabel: "Number", yearLabel: "Year 3", curriculumMeta: FRAMEWORKS[framework].meta,
    weeks: plan.map((week) => ({ week: week.week, topic: week.topic, lessons: week.lessons.map((lesson) => lesson.title), codes: frameworkCodes(framework, week.lessons.flatMap((lesson) => lesson.curriculum ?? []), "Year 3") })),
    coverage: coverageRows(framework, "Year 3", "number", lessons),
  });
  const aus = build("aus");
  assert.ok(pages(aus) >= 2 && aus.includes("code by code") && aus.includes("1/2, 1/3, 1/4, 1/5 and 1/10"));
  // Codes are listed in full: a range such as "AC9M3N03–N05" would claim N04 is taught.
  assert.ok(!/AC9M\dN\d\d–/.test(aus));
  const vic = build("vic");
  assert.ok(vic.includes("Victorian Curriculum 2.0") && vic.includes("VC2M3N02") && !vic.includes(">AC9M3N01<"));
  // Odd and even numbers are Level 3 in Victoria but Year 4 in AC9, so Level 3 shows the gap.
  assert.ok(coverageRows("vic", "Year 3", "number", lessons).some((row) => row.codes[0] === "VC2M3N01" && row.uncovered));
  const nsw = build("nsw");
  assert.ok(nsw.includes("MA2-RN-01") && nsw.includes("Representing numbers using place value A"));
  assert.equal(frameworkAvailable("nsw", "Year 7", "number"), false);
  save("scope-year-3-vic", vic);
  save("scope-year-3-nsw", nsw);
}


// Strand report: one student across realms, built from progress rows like the teacher dashboard loads.
{
  const genreFor = { number: "number", measurement: "measurement", space: "space", pattern: "algebra" };
  const row = (realm_id, year, week, base) => {
    const plan = getCurriculumPlan(year, genreFor[realm_id]);
    const lesson_attempts = {};
    const quiz_scores = {};
    for (const entry of plan.filter((item) => item.week <= week)) {
      entry.lessons.forEach((lesson, index) => {
        if (entry.week === week && index === 2) return; // current week: last lesson not done yet
        const correct = Math.min(15, Math.round((base + entry.week + index * 3) / 100 * 15));
        const accuracy = Math.round(correct / 15 * 100);
        lesson_attempts[lesson.id] = {
          attempts: [{ correctCount: correct, totalQuestions: 15, completedAt: "2026-09-01T00:00:00Z" }],
          latestInsight: {
            status: accuracy >= 90 ? "Ready to Move On" : accuracy >= 75 ? "On Track" : accuracy >= 55 ? "Quick Check-in Recommended" : "Needs Support",
            strongestSkill: lesson.title, needsSupport: accuracy < 75 ? lesson.title : "No priority gap identified",
            teacherAction: `Show one worked example on ${lesson.title.toLowerCase()}, then ask the student to solve a similar problem aloud.`,
            confidence: "High", evidenceCount: 15,
          },
        };
      });
      if (entry.week < week) quiz_scores[String(entry.week)] = { score: Math.min(15, Math.round((base + 6) / 100 * 15)), total: 15, passed: base + 6 >= 80 };
    }
    return { student_id: "s1", realm_id, year, is_current: true, week, status: "IN_PROGRESS", pretest_score: base + 5, completed_lesson_ids: Object.keys(lesson_attempts), unlocked_legends: [], quiz_scores, lesson_attempts };
  };
  const progressRows = [row("number", "Year 3", 2, 58), row("measurement", "Year 3", 4, 74), row("space", "Year 3", 8, 82), row("pattern", "Year 3", 3, 64)];
  const report = buildStrandReport({ studentId: "s1", firstName: "Ryan", progressRows });
  assert.equal(report.realms.length, 4);
  assert.deepEqual(report.notStarted.map((realm) => realm.realmId), ["statistics", "chance"]);
  const number = report.realms.find((realm) => realm.realmId === "number");
  assert.ok(number.lessonAccuracy && number.weeks.length === 2 && number.weeks[1].current);
  assert.ok(number.focus && number.focus.action.includes("ask Ryan to solve"));
  const html = strandReportHtml({ student: "Ryan Heard", className: "3/4J", schoolName: "Cobram Primary School", yearLevel: "Year 3", ...report });
  // Overview, one page per realm, and a continuation page for the realm with eight weeks of results.
  assert.equal(pages(html), 6);
  assert.ok(html.includes("Strand report") && html.includes("Not started yet") && html.includes("Try this:"));
  save("strand-report", html);
}

// Maths diagnostic report: start, mid and end, with level probes.
const probe = (level, percent, codes) => ({ level, score: Math.round(percent / 10), total: 10, percent, curriculumCodes: codes });
const levelsAt = { start: [3.0, 4.0, 2.5, 3.5, 2.5, 3.0], mid: [3.5, 4.5, 3.5, 4.0, 3.0, 3.5], end: [4.0, 4.5, 4.0, 4.5, 3.5, 4.0] };
const strandsOrder = ["number", "measurement", "space", "statistics", "algebra", "probability"];
const letter = { measurement: "M", space: "SP", statistics: "ST", algebra: "A", probability: "P" };
const sitting = (checkpoint, month) => ({
  checkpoint, status: "completed", overall_level: null, completed_at: `2026-${month}-15T01:00:00Z`, created_at: `2026-${month}-15T01:00:00Z`,
  strand_results: strandsOrder.map((strand, i) => ({ strand, status: "completed", measured_level: levelsAt[checkpoint][i], probe_scores: strand === "number"
    ? [probe("Year 4", 92, ["AC9M4N01", "AC9M4N06"]), probe("Year 5", 40, ["AC9M5N04", "AC9M5N05"])]
    : [probe("Year 4", 85, [`AC9M4${letter[strand]}01`]), probe("Year 5", 45, [`AC9M5${letter[strand]}02`])] })),
});
const diagnostic = diagnosticReportHtml({ brand: { schoolName: "Cobram Primary School", schoolLogo: logo }, student: { name: "Frankie Hicks", yearLevel: "Year 5", className: "5B" }, sittings: [sitting("start", "02"), sitting("mid", "06"), sitting("end", "12")] });
assert.equal(pages(diagnostic), 2);
assert.ok(diagnostic.includes("Where Frankie finished the year") && diagnostic.includes("In Term 4 (October to December), Year 5 students are expected to be at 5.0"));
assert.ok(diagnostic.includes("AC9M4N01") && diagnostic.includes("AC9M5N04") && diagnostic.includes("Doing well") && diagnostic.includes("Work on next"));
save("diagnostic-report", diagnostic);

// Realm tests stand in for diagnostics: pre-test = Start, May-July post-test
// = Mid, November-December post-test = End; September post-tests don't count.
assert.equal(realmTestLevel("Year 4", 90), 4);
assert.ok(Math.abs(realmTestLevel("Year 4", 62.5) - 3.5) < 1e-9);
assert.equal(realmTestLevel("Year 5", 10), 3.25);
const realmRow = (realm_id, assessment_type, working_level, score_percent, completed_at) => ({ realm_id, assessment_type, working_level, score_percent, completed_at });
const testsOnly = diagnosticReportHtml({
  brand: { schoolName: "Cobram Primary School", schoolLogo: logo }, student: { name: "Abigail Tozer", yearLevel: "Year 4", className: "3/4J" }, sittings: [], year: 2026,
  realmTests: [
    realmRow("number", "pretest", "Year 3", 95, "2026-02-03T01:00:00Z"), realmRow("number", "pretest", "Year 3", 95, "2026-02-03T01:05:00Z"),
    realmRow("number", "pretest", "Year 4", 30, "2026-02-05T01:00:00Z"),
    realmRow("number", "posttest", "Year 4", 70, "2026-06-10T01:00:00Z"),
    realmRow("number", "posttest", "Year 4", 99, "2026-09-10T01:00:00Z"),
    realmRow("number", "posttest", "Year 5", 50, "2026-12-01T01:00:00Z"),
    realmRow("space", "pretest", "Year 4", 62.5, "2026-02-04T01:00:00Z"),
    realmRow("space", "pretest", "Year 3", 99, "2025-11-01T01:00:00Z"),
  ],
});
assert.equal(pages(testsOnly), 1);
// Number start: the placement chain ends on the Year 4 pre-test, floored at 3.0 by the Year 3 pass.
assert.ok(testsOnly.includes("pre-tests · 2 of 6 strands"));
assert.ok(testsOnly.includes("post-tests · 2 of 6 strands")); // Space carries forward until replaced
// Growth compares Number and Space at both ends: start 3.12, end (4.22 and 3.5) 4.05.
assert.ok(testsOnly.includes("+0.9 levels"));
assert.ok(testsOnly.includes("appear once Abigail's tests have recorded their questions"));
assert.ok(testsOnly.includes("Where Abigail finished the year"));
save("diagnostic-report-tests-only", testsOnly);

// Brody: pre-tests sat in September are judged against Term 3 (2.75 for a
// Year 3), not the start of the year.
const brody = diagnosticReportHtml({
  brand: { schoolName: "Cobram Primary School", schoolLogo: logo }, student: { name: "Brody Ambrose", yearLevel: "Year 3", className: "3/4J" }, sittings: [], year: 2026,
  realmTests: [
    realmRow("number", "pretest", "Year 3", 80, "2026-09-02T01:00:00Z"),
    realmRow("measurement", "pretest", "Year 2", 58, "2026-09-02T01:00:00Z"),
    realmRow("space", "pretest", "Year 3", 53.5, "2026-09-02T01:00:00Z"),
    { ...realmRow("statistics", "pretest", "Year 3", 40, "2026-09-03T01:00:00Z"), question_results: [
      ...[true, true, true, false].map((correct) => ({ correct, curriculum_codes: ["AC9M3ST01"], curriculum_skill: { id: "AC9M3ST01", label: "Collect and record data" } })),
      ...[false, false, true].map((correct) => ({ correct, curriculum_codes: ["AC9M3ST03"], curriculum_skill: { id: "AC9M3ST03", label: "Interpret data displays" } })),
      ...[true, true].map((correct) => ({ correct, curriculum_codes: ["AC9M3ST02"], curriculum_skill: { id: "AC9M3ST02", label: "Choose a display" } })),
    ] },
  ],
});
assert.ok(brody.includes("In Term 3 (July to September), Year 3 students are expected to be at 2.75"));
assert.ok(!brody.includes(">Above level<") && brody.includes(">Below level<"));
// Page 2 from the pre-test's own questions: best 100% and 75%, next step 33%.
assert.equal(pages(brody), 2);
assert.ok(brody.includes("from the September pre-test") && brody.includes("Choose a display") && brody.includes("Interpret data displays"));
assert.ok(brody.indexOf("Choose a display") < brody.indexOf("Collect and record data") && brody.indexOf("Collect and record data") < brody.indexOf("Interpret data displays"));
save("diagnostic-report-brody", brody);

// Student import template: headings unchanged (the import reads them), RELIQ styling and logo.
const logoPng = readFileSync("public/brand/reliq-logo.png");
const workbook = new ExcelJS.Workbook();
await workbook.xlsx.load(await buildStudentRosterTemplate([{ name: "3/4J", status: "active" }], { logoPng }));
const sheet = workbook.getWorksheet("Students");
assert.deepEqual(sheet.getRow(1).values.slice(1), ["First Name", "Last Name", "Year Level", "Class", "Student Code", "Access Code"]);
assert.equal(sheet.getCell("B1").fill.fgColor.argb, "FF121314");
assert.equal(workbook.getWorksheet("Instructions").getImages().length, 1);
if (out) writeFileSync(`${out}/reliq-student-import-template.xlsx`, Buffer.from(await workbook.xlsx.writeBuffer()));

console.log("PASS every RELIQ document builds, escapes its data and paginates");
