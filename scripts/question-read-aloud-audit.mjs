import fs from "node:fs";

const checks = [
  {
    name: "shared prompt controls are marked",
    file: "components/ReadAloudBtn.tsx",
    patterns: ['data-read-aloud-button="true"', "data-read-aloud-kind={kind}"],
  },
  {
    name: "answer-choice controls are marked separately",
    file: "components/OptionReadAloudButton.tsx",
    patterns: ['kind="option"'],
  },
  {
    name: "legacy practice tasks have a prompt fallback",
    file: "components/TaskRenderer.tsx",
    patterns: ["QuestionReadAloudBoundary", "getTaskReadAloudText(props.task)"],
  },
  {
    name: "curriculum lesson activities have a prompt fallback",
    file: "components/lesson/LessonRenderer.tsx",
    patterns: ["QuestionReadAloudBoundary", "questionData.prompt"],
  },
  {
    name: "fallback hides when an activity supplies prompt audio",
    file: "components/QuestionReadAloudBoundary.tsx",
    patterns: [":has(", 'data-read-aloud-kind="prompt"', 'label="Read question"'],
  },
  {
    name: "match-pairs instructions and choices are readable",
    file: "components/MatchThePair.tsx",
    patterns: ["match-the-pair-instructions", "OptionReadAloudButton"],
  },
  {
    name: "weekly quizzes expose current-question audio",
    file: "app/session/page.tsx",
    patterns: ["currentQuizPrompt", 'aria-label="Read question aloud"'],
  },
  {
    name: "pre-tests expose prompt audio",
    file: "app/pretest/page.tsx",
    patterns: ["promptAction=", "<ReadAloudBtn text={question.prompt}", 'rate={realmId === "space" ? 0.85 : undefined}'],
  },
  {
    name: "post-tests expose prompt audio",
    file: "app/posttest/page.tsx",
    patterns: ["promptAction=", "<ReadAloudBtn text={q.prompt}", 'rate={realmId === "space" ? 0.85 : undefined}'],
  },
  {
    name: "read-aloud controls support a scoped speech rate",
    file: "components/ReadAloudBtn.tsx",
    patterns: ["ReadAloudRateProvider", "ReadAloudRateContext", "rate: speechRate"],
  },
  {
    name: "Starpath quizzes use the shared task renderer",
    file: "components/starpath/StarpathVoyageQuiz.tsx",
    patterns: ["<TaskRenderer"],
  },
  {
    name: "Starpath post-tests use the shared task renderer",
    file: "components/starpath/StarpathPostTest.tsx",
    patterns: ["<TaskRenderer"],
  },
];

let passed = 0;
const failures = [];

for (const check of checks) {
  const source = fs.readFileSync(check.file, "utf8");
  const missing = check.patterns.filter((pattern) => !source.includes(pattern));
  if (missing.length === 0) {
    passed += 1;
  } else {
    failures.push(`${check.name}: ${check.file} is missing ${missing.join(", ")}`);
  }
}

console.log(`Question read-aloud audit: ${passed} passed, ${failures.length} failed.`);
for (const failure of failures) console.error(`- ${failure}`);

if (failures.length > 0) process.exit(1);
