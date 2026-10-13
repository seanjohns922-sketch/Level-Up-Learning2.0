import assert from "node:assert/strict";
import { buildCards, buildPeerCards, buildTrendRows } from "../lib/class-group-dashboard.ts";

const cls = (classId, students, active7d, atTarget, quiz, quizStudents, lesson, lessonStudents) => ({
  classId, students, active7d, atTarget,
  quizAverageSum: quiz * quizStudents, quizStudents, lessonAverageSum: lesson * lessonStudents, lessonStudents,
});
const rp = (classId, realmId, period, average, count, lessons) => ({
  classId, realmId, period, accuracySum: average * count, accuracyCount: count, students: 5, lessons,
});
const dashboard = {
  generatedAt: "2026-10-13T00:00:00Z",
  scope: "group",
  group: { id: "g", name: "3/4 classes" },
  classIds: ["j", "h", "n"],
  periods: { recentStart: "2026-09-28", recentEnd: "2026-10-09", previousStart: "2026-09-14", previousEnd: "2026-09-25" },
  classes: [cls("j", 24, 15, 14, 71, 20, 75, 22), cls("h", 23, 17, 15, 74, 20, 78, 21), cls("n", 23, 19, 12, 77, 18, 70, 20)],
  realmPeriods: [
    // Number down everywhere -> whole group
    rp("j", "number", "previous", 80, 20, 30), rp("j", "number", "recent", 68, 20, 22),
    rp("h", "number", "previous", 78, 20, 30), rp("h", "number", "recent", 66, 20, 29),
    rp("n", "number", "previous", 76, 20, 30), rp("n", "number", "recent", 65, 20, 30),
    // Measurement up in 3/4J only -> ahead of group
    rp("j", "measurement", "previous", 68, 10, 10), rp("j", "measurement", "recent", 81, 10, 10),
    rp("h", "measurement", "previous", 70, 10, 10), rp("h", "measurement", "recent", 71, 10, 10),
    // Space: too little class evidence -> no row
    rp("j", "space", "previous", 90, 2, 2), rp("j", "space", "recent", 40, 2, 2),
  ],
  weekTopics: [
    { classId: "j", realmId: "number", workingLevel: "Year 4", week: 3, accuracySum: 52 * 6, accuracyCount: 6, students: 6 },
    { classId: "h", realmId: "number", workingLevel: "Year 4", week: 3, accuracySum: 70 * 8, accuracyCount: 8, students: 8 },
    { classId: "j", realmId: "number", workingLevel: "Year 4", week: 4, accuracySum: 90 * 6, accuracyCount: 6, students: 6 },
  ],
};

// Cards: class figure beside the exact group figure (sums, not averages of averages).
assert.deepEqual(buildCards(dashboard, "j"), [
  { label: "Active this week", value: "15 of 24", compare: "3/4 classes: 51 of 70" },
  { label: "At target this week", value: "58%", compare: "3/4 classes: 59%" },
  { label: "Quiz average", value: "71%", compare: "3/4 classes: 74%" },
  { label: "Lesson average", value: "75%", compare: "3/4 classes: 74%" },
]);
assert.equal(buildCards(dashboard, "missing"), null);

// Trends: whole-group drop, just-this-class lesson drop, ahead of group, weakest topic vs others.
const rows = buildTrendRows(dashboard, "j", (id) => ({ number: "Number Nexus", measurement: "Measurelands" })[id] ?? id, (r, l, w) => (w === 3 ? "Fractions" : null));
// "Group" columns are the other classes, so 3/4J's own drop can't make the rest look the same.
assert.deepEqual(rows.map((r) => [r.key, r.tag, r.classValue, r.groupValue]), [
  ["realm-number", "whole", "−12 pts", "−11 pts"],
  ["realm-measurement", "ahead", "+13 pts", "+1 pts"],
  ["lessons", "class", "−19%", "−1%"],
  ["topic-number-Year 4-3", "class", "52%", "70%"],
]);
assert.equal(rows[3].title, "Fractions");
assert.match(rows[0].detail, /Down in the other classes in the group too/);

// Peer cards: quiz average per class, null without quiz evidence.
assert.deepEqual(buildPeerCards({ ...dashboard, classes: [cls("x", 10, 4, 2, 0, 0, 60, 5)] }), [{ classId: "x", active7d: 4, students: 10, quizAverage: null }]);

// School scope labels and no trends without evidence.
const school = { ...dashboard, scope: "school", group: null, realmPeriods: [], weekTopics: [] };
assert.equal(buildCards(school, "j")[0].compare, "School: 51 of 70");
assert.deepEqual(buildTrendRows(school, "j", (id) => id, () => null), []);

console.log("PASS class group dashboard");
