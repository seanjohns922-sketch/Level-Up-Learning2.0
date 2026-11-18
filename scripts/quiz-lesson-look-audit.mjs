import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Every weekly quiz and lesson shares one look: the realm-framed stage, rune
// progress, chunky buttons, the scoped question styles and the slim lesson bar.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const shared = read("components/starpath/StarpathVoyageQuiz.tsx");
for (const piece of ["<QuizStage", "<QuizRuneProgress", "QUIZ_BUTTON.primary", "data-premium-task"]) {
  assert.ok(shared.includes(piece), `the shared weekly quiz must use ${piece}`);
}

const session = read("app/session/page.tsx");
for (const piece of ["<QuizRuneProgress", "QUIZ_BUTTON.primary", "data-premium-task", "getWeeklyQuizTheme(quizRealmId)", "bg-[image:var(--quiz-frame)]"]) {
  assert.ok(session.includes(piece), `the Number and Measurement quizzes must use ${piece}`);
}
assert.ok(!session.includes("<select\n                        value={quizIndex}"), "the old jump dropdown is replaced by tappable runes");

const theme = read("lib/weekly-quiz-theme.ts");
for (const variable of ["--quiz-frame", "--quiz-edge", "--quiz-rune", "--quiz-rune-now"]) {
  assert.ok(theme.includes(variable), `the realm quiz theme must set ${variable}`);
}

assert.ok(read("app/layout.tsx").includes('import "./quiz-premium.css";'), "the question styles must load");
const css = read("app/quiz-premium.css");
assert.ok(css.includes("[data-premium-task]") && !css.includes("rounded-t-xl"), "question styles stay scoped and leave fraction boxes alone");

for (const engine of ["components/PracticeRunner.tsx", "components/lesson/Year2LessonEngine.tsx"]) {
  const source = read(engine);
  assert.ok(source.includes("className={LESSON_LAYOUT}") && source.includes("className={LESSON_HUD_ROW}"), `${engine} must use the slim lesson bar`);
  assert.ok(!source.includes("lg:grid-cols-[300px_1fr]"), `${engine} must not bring back the sidebar`);
}
const rail = read("components/lesson/LessonHUDRail.tsx");
assert.ok(rail.includes("<LessonMasteryTile") && !rail.includes("Solved"), "the lesson bar shows mastery, not the dropped Solved / Challenges tiles");

console.log("PASS quiz and lesson look: framed stage, rune progress, chunky buttons, scoped question styles, slim lesson bar");
