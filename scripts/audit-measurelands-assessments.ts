import { getPosttestForYearLabel, getPretestForYearLabel } from "../data/assessments/api";
import { getMeasurelandsPosttestForYear, getMeasurelandsPretestForYear } from "../data/assessments/measurelands";
import {
  getMeasurelandsFormStandard,
  validateIndependentMeasurelandsForm,
} from "../data/assessments/measurelandsAssessmentArchitecture";
import type { IndependentAssessmentItem } from "../data/assessments/assessmentItemStandard";
import type { Question } from "../data/assessments/posttests";
import { getLastProgramWeek } from "../lib/program-weeks";

type YearLabel = "Prep" | `Year ${1 | 2 | 3 | 4 | 5 | 6}`;
type ProductionItem = Question & IndependentAssessmentItem;

const years: readonly YearLabel[] = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const failures: string[] = [];
let passed = 0;
function check(condition: boolean, message: string): void {
  if (condition) passed += 1;
  else failures.push(message);
}

const globalIds = new Set<string>();
for (const [level, year] of years.entries()) {
  const kinds = level === 0 ? (["posttest"] as const) : (["pretest", "posttest"] as const);
  for (const kind of kinds) {
    const direct = (kind === "pretest"
      ? getMeasurelandsPretestForYear(year)
      : getMeasurelandsPosttestForYear(year)?.questions ?? []) as ProductionItem[];
    const api = (kind === "pretest"
      ? getPretestForYearLabel(year, "measurement")
      : getPosttestForYearLabel(year, "measurement")?.questions ?? []) as ProductionItem[];
    const standard = getMeasurelandsFormStandard(level as 0 | 1 | 2 | 3 | 4 | 5 | 6, kind);
    const scope = `${year} ${kind}`;

    check(direct.length === 20, `${scope} must resolve 20 questions.`);
    check(JSON.stringify(direct.map((item) => item.id)) === JSON.stringify(api.map((item) => item.id)), `${scope} API resolver differs from the Measurelands resolver.`);
    check(new Set(direct.map((item) => item.id)).size === direct.length, `${scope} repeats an item ID.`);
    check(direct.every((item) => item.realm === "measurement" && item.level === level && item.form === kind), `${scope} contains incorrectly assigned metadata.`);
    check(direct.every((item) => item.origin === "assessment_authored" && item.sourcePool === kind), `${scope} contains lesson or quiz reuse.`);
    check(direct.every((item) => item.curriculumLessonMapping.every((mapping) => mapping.week >= 1 && mapping.week <= 8)), `${scope} maps outside the 8-week Measurelands program.`);
    check(direct.every((item) => item.primaryDescriptorCode.startsWith(level === 0 ? "AC9MFM" : `AC9M${level}M`)), `${scope} contains a descriptor from another year level.`);
    check(direct.every((item) => !/\bmoney\b|\bcoins?\b|\bdollars?\b|\bcents?\b/i.test(`${item.prompt} ${JSON.stringify(item.renderer.payload)}`)), `${scope} contains excluded money content.`);
    check(direct.every((item) => !/circle|radius|diameter|circumference/i.test(`${item.prompt} ${JSON.stringify(item.renderer.payload)}`)), `${scope} contains removed circle-measurement content.`);
    check(Boolean(standard), `${scope} has no approved blueprint standard.`);
    if (standard) check(validateIndependentMeasurelandsForm(standard, direct).length === 0, `${scope} fails canonical blueprint validation.`);

    for (const item of direct) {
      check(!globalIds.has(item.id), `${scope} reuses global item ID ${item.id}.`);
      globalIds.add(item.id);
    }
  }
}

check(getMeasurelandsPretestForYear("Prep").length === 0, "Ground must not expose a pre-test.");
check(getLastProgramWeek("measurement") === 8, "Measurelands final week must remain Week 8.");
check(getLastProgramWeek("number") === 12, "Number Nexus final week regressed while validating Measurelands.");
check(globalIds.size === 260, `Expected 260 globally unique production items; found ${globalIds.size}.`);

console.log(`Measurelands production assessment audit: ${passed} passed, ${failures.length} failed across 13 forms and ${globalIds.size} items.`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
}
