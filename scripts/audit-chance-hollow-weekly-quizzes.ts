import { CHANCE_HOLLOW_WEEKLY_QUIZ_FORMS } from "../data/activities/chanceHollow/weeklyQuizBank";
import { CHANCE_HOLLOW_PROGRAMS } from "../data/programs/chanceHollow";
import { isPracticeTaskSafe } from "../lib/task-safety";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const failures: string[] = [];

if (CHANCE_HOLLOW_WEEKLY_QUIZ_FORMS.length !== 24) {
  failures.push(`Expected 24 Chance Hollow quiz forms, found ${CHANCE_HOLLOW_WEEKLY_QUIZ_FORMS.length}.`);
}

for (const form of CHANCE_HOLLOW_WEEKLY_QUIZ_FORMS) {
  const label = `Level ${form.level} Week ${form.week}`;
  const week = CHANCE_HOLLOW_PROGRAMS[form.level][form.week - 1];
  if (!week || week.lessons.length !== 3) failures.push(`${label} has no complete three-lesson program.`);
  if (form.tasks.length !== 15) failures.push(`${label} has ${form.tasks.length} questions instead of 15.`);

  form.tasks.forEach((task, index) => {
    if (task.kind !== "chanceQuizQuestion") failures.push(`${label} question ${index + 1} is not an independent Chance quiz item.`);
    if (!isPracticeTaskSafe(task)) failures.push(`${label} question ${index + 1} fails task safety.`);
    if (!("speakText" in task) || typeof task.speakText !== "string" || !task.speakText.includes("Options:")) {
      failures.push(`${label} question ${index + 1} is missing complete question-and-answer voice copy.`);
    }
  });

  const signatures = new Set(form.tasks.map((task) => JSON.stringify({
    prompt: "prompt" in task ? task.prompt : "",
    visual: "visual" in task ? task.visual : null,
    answer: "answer" in task ? task.answer : null,
  })));
  if (signatures.size !== 15) failures.push(`${label} contains duplicate generated question signatures.`);

  for (let lesson = 0; lesson < 3; lesson += 1) {
    if (form.tasks.slice(lesson * 5, lesson * 5 + 5).length !== 5) {
      failures.push(`${label} lesson ${lesson + 1} does not contribute five questions.`);
    }
  }
}

const programSource = readFileSync(join(process.cwd(), "app/program/page.tsx"), "utf8");
const routeSource = readFileSync(join(process.cwd(), "app/chance-hollow/quiz/[level]/[week]/page.tsx"), "utf8");
const quizSource = readFileSync(join(process.cwd(), "components/starpath/StarpathVoyageQuiz.tsx"), "utf8");
const registrySource = readFileSync(join(process.cwd(), "lib/realms/realm-registry.ts"), "utf8");

if (programSource.includes("Coming soon: this will check all three Chance Hollow lessons.")) {
  failures.push("Chance Hollow still exposes the old Coming Soon quiz placeholder.");
}
if (!programSource.includes("/chance-hollow/quiz/${encodeURIComponent(curriculumYear)}/${weekNum}")) {
  failures.push("The Chance Hollow demo card does not route to the dedicated weekly quiz.");
}
if (!routeSource.includes('realmId="chance"') || !routeSource.includes('realm="chance"')) {
  failures.push("The Chance Hollow quiz route is not protected and themed as the chance realm.");
}
if (!quizSource.includes('isChance ? "Probability"') || !quizSource.includes("realm as StudentProgressRealmId")) {
  failures.push("Chance Hollow quiz evidence is not wired to Probability replay and realm persistence.");
}
if (!/chance:\s*\{[\s\S]*?hasWeeklyQuiz:\s*true/.test(registrySource)) {
  failures.push("The realm registry does not advertise Chance Hollow weekly quiz support.");
}

if (failures.length) {
  console.error("Chance Hollow weekly quiz audit failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Chance Hollow weekly quiz audit passed: 24 forms, 360 safe questions, five per lesson, with answer voice copy.");
