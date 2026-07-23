import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const chrome = read("components/quiz/RealmWeeklyQuizChrome.tsx");
const session = read("app/session/page.tsx");
const starpath = read("components/starpath/StarpathDevelopmentQuiz.tsx");

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

console.log("Realm weekly quiz chrome audit passed: all current realms share modern quiz presentation without replacing quiz mechanics.");
