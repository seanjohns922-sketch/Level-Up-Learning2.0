import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { classLoginCardsHtml, homeAccessCardsHtml, singleLoginCardHtml } from "../lib/documents/login-cards.ts";
import { learningJourneyHtml, placementBaselineHtml, studentProgressReportHtml } from "../lib/documents/school-reports.ts";
import { buildParentReportHtml } from "../lib/parent-report-print.ts";

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

console.log("PASS every RELIQ document builds, escapes its data and paginates");
