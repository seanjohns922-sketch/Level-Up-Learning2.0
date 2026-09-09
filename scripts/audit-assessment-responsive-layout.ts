import fs from "node:fs";
import path from "node:path";
import { getPosttestForYearLabel, getPretestForYearLabel } from "@/data/assessments/api";

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), "utf8");
const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const realms = ["number", "measurement", "space", "statistics", "pattern", "chance"] as const;
const years = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const renderers = new Set<string>();
let questionCount = 0;

for (const realm of realms) {
  let realmQuestions = 0;
  for (const year of years) {
    const forms = [
      getPretestForYearLabel(year, realm),
      getPosttestForYearLabel(year, realm)?.questions ?? [],
    ];
    for (const questions of forms) {
      realmQuestions += questions.length;
      questionCount += questions.length;
      for (const question of questions) {
        renderers.add(question.practiceTask?.kind ?? question.type ?? "mcq");
      }
    }
  }
  assert(realmQuestions > 0, `${realm} has no pre/post assessment questions to render.`);
}

const shell = read("components/assessment/AssessmentShell.tsx");
const nativeTask = read("components/assessment/MeasurelandsAssessmentTask.tsx");
const questionCard = read("components/assessment/AssessmentQuestionCard.tsx");
const gridReference = read("components/starpath/StarpathGridReferenceCard.tsx");
const css = read("app/globals.css");

assert(shell.includes("data-assessment-realm"), "Assessment shell must expose the realm for scoped presentation.");
assert(shell.includes("data-wide-content"), "Assessment shell must identify lesson-native assessment content.");
assert(nativeTask.includes("assessment-native-task"), "Lesson-native tasks need the shared responsive wrapper.");
assert(nativeTask.includes("data-assessment-task-kind"), "Lesson-native tasks need a task-kind layout hook.");
assert(questionCard.includes("assessment-standard-choice-layout"), "Standard choices need the shared responsive layout.");
assert(questionCard.includes("assessment-measurelands-option-layout"), "Measurelands visual choices need the compact layout.");
assert(css.includes('@media (min-width: 1024px) and (max-height: 900px)'), "Landscape assessment compaction is missing.");
assert(css.includes('.assessment-native-task[data-assessment-task-kind='), "Complex assessment task overrides are missing.");
assert(!gridReference.includes('min-w-[330px]'), "Starpath grid reference must not force horizontal scrolling.");

console.log(`Assessment responsive layout audit passed: ${questionCount} questions, ${renderers.size} renderer types, ${realms.length} realms.`);
