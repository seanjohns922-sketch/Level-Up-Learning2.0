#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const engine = read("components/lesson/Year2LessonEngine.tsx");
const practiceRunner = read("components/PracticeRunner.tsx");
const lessonPage = read("app/lesson/page.tsx");
const sessionPage = read("app/session/page.tsx");
const typed = read("components/activities/TypedResponseActivity.tsx");
const multipleChoice = read("components/activities/MultipleChoiceActivity.tsx");
const benchmarkSort = read("components/activities/BenchmarkSort.tsx");
const wrongHandler = engine.slice(
  engine.indexOf("function handleWrong"),
  engine.indexOf("function handleNextQuestion")
);
const submittedAnswerAdapters = [
  "AdditionStrategy.tsx",
  "AreaModelSelect.tsx",
  "Arrays.tsx",
  "BenchmarkSort.tsx",
  "BuildTheWhole.tsx",
  "DivisionGroups.tsx",
  "EqualGroups.tsx",
  "EquivalentFractionBar.tsx",
  "FactFamily.tsx",
  "FactFamilyWrite.tsx",
  "FractionCompare.tsx",
  "FractionDecimalPercentMatch.tsx",
  "MixedWordProblem.tsx",
  "NumberLineActivity.tsx",
  "NumberLinePlace.tsx",
  "NumberOrder.tsx",
  "OddEvenSort.tsx",
  "PartitionExpand.tsx",
  "PlaceValueBuilder.tsx",
  "SetModelSelect.tsx",
  "SkipCount.tsx",
  "SubtractionStrategy.tsx",
  "TypedResponseActivity.tsx",
].map((file) => read(`components/activities/${file}`));

const results = [];
function check(label, ok) {
  results.push({ label, ok });
}

check(
  "Configured Number Nexus lessons hold an incorrect question",
  engine.includes("setWrongFeedback({ studentAnswer: submittedAnswer, correctAnswer, explanation })") &&
    !/function handleWrong[\s\S]*?setTimeout\(\(\) => loadNextQuestion\(\), 1200\)/.test(engine)
);
check(
  "Incorrect feedback advances only through the explicit Next Question action",
  engine.includes("status === \"wrong\" && wrongFeedback") &&
    engine.includes("onClick={handleNextQuestion}") &&
    engine.includes('feedbackLockRef.current === "incorrect" && !fromIncorrectButton') &&
    engine.includes("Next Question")
);
check(
  "A wrong submission cannot generate or count the next question before Next Question",
  !wrongHandler.includes("loadNextQuestion(") &&
    !wrongHandler.includes("setQuestionsAnswered(") &&
    engine.includes('loadNextQuestion({ fromIncorrectButton: true })')
);
check(
  "The held activity cannot be changed after the first wrong submission",
  engine.includes('disabled={status === "wrong"}') &&
    engine.includes('status === "wrong" ? "pointer-events-none min-w-0 border-0 p-0"')
);
check(
  "A wrong submission is scored exactly once",
  engine.includes("scoredThisTurnRef.current = true") &&
    engine.includes("if (finished || status !== \"idle\" || scoredThisTurnRef.current) return;")
);
check(
  "Mistake review retains the submitted answer, stable task ID and generated task",
  engine.includes("studentAnswer: submittedAnswer") &&
    engine.includes("taskId: `${resumeLessonKey}-q${currentQuestionSequence}`") &&
    engine.includes("taskData: currentQuestion")
);
check(
  "Wrong feedback and the generated question are retained by lesson resume",
  engine.includes("wrongFeedback,") &&
    engine.includes("if (snap.wrongFeedback) setWrongFeedback(snap.wrongFeedback)") &&
    engine.includes("currentQuestion,")
);
check(
  "Typed responses pass the student's submitted value to the shared engine",
  typed.includes("onWrong?.(typed)") &&
    engine.includes("<fieldset") &&
    engine.includes('disabled={status === "wrong"}')
);
check(
  "Multiple choice passes the selected option and locks after submission",
  multipleChoice.includes("onWrong?.(option)") &&
    multipleChoice.includes('if (renderMode === "lesson" && submitted) return;') &&
    multipleChoice.includes('renderMode === "lesson" && submitted && !isMultiSelect')
);
check(
  "Number Nexus custom task adapters preserve a submitted response",
  submittedAnswerAdapters.every(
    (source) => source.includes("onWrong?: (studentAnswer?: string) => void") && !source.includes("onWrong?.()")
  )
);
check(
  "Interactive benchmark sorting remains neutral until the full arrangement is evaluated",
  !benchmarkSort.includes("feedbackById") && !benchmarkSort.includes("value?.category === category")
);
check(
  "Level 1 keeps its existing guided correction and explicit Next action",
  practiceRunner.includes("setAwaitingWrongNext(true)") &&
    practiceRunner.includes("onClick={continueAfterWrong}") &&
    practiceRunner.includes("Next Question") &&
    practiceRunner.includes('status === "wrong" ? s : s - 1') &&
    practiceRunner.includes("taskData: task")
);
check(
  "Configured lessons (including Levels 3 and 6) use the corrected shared engine",
  lessonPage.includes("<Year2LessonEngine")
);
check(
  "Quiz and assessment session rendering does not use the lesson engine",
  !sessionPage.includes("Year2LessonEngine")
);

const failures = results.filter((result) => !result.ok);
console.log("\nGuided Lesson Feedback Audit\n" + "=".repeat(60));
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}`);
}
console.log("=".repeat(60));
console.log(`${results.length - failures.length}/${results.length} checks passed.`);

if (failures.length > 0) process.exit(1);
