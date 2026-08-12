import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const chrome = read("components/quiz/RealmWeeklyQuizChrome.tsx");
const session = read("app/session/page.tsx");
const starpath = read("components/starpath/StarpathDevelopmentQuiz.tsx");
const starpathVoyage = read("components/starpath/StarpathVoyageQuiz.tsx");

for (const realm of ["number", "measurement", "space"]) {
  assert.ok(chrome.includes(`${realm}: {`), `Missing ${realm} quiz theme`);
}

for (const marker of [
  "Number Nexus",
  "Measurelands",
  "Starpath",
  "getQuizArtwork",
  "Back to Week",
  "questionCount",
  "ReadAloudBtn",
]) {
  assert.ok(chrome.includes(marker), `Missing shared quiz chrome marker: ${marker}`);
}

assert.match(session, /<RealmWeeklyQuizChrome/);
assert.match(session, /realm=\{quizRealmId\}/);
assert.match(session, /questionCount=\{quizQuestions\.length \|\| 15\}/);
assert.match(session, /const currentQuiz = quizQuestions\[quizIndex\]/);
assert.match(session, /onClick=\{submitQuiz\}/);
assert.match(session, /saveNumberWeeklyQuizAttempt/);

assert.match(starpath, /<RealmWeeklyQuizChrome/);
assert.match(starpath, /realm="space"/);
assert.match(starpath, /preserves Starpath routing/);

assert.match(starpathVoyage, /if \(!task \|\| currentAnswer !== undefined\) return;/);
assert.match(starpathVoyage, /Answer submitted/);
assert.doesNotMatch(starpathVoyage, /changeAnswer|Change Answer/);
assert.doesNotMatch(starpathVoyage, /delete next\[String\(index\)\]/);

console.log("Realm weekly quiz audit passed: shared presentation is intact and submitted Starpath answers are immutable.");
