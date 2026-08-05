import fs from "node:fs";
import path from "node:path";
import { isAssessmentAnswerCorrect } from "../data/assessments/analysis";
import { getMeasurelandsPosttestForYear, getMeasurelandsPretestForYear } from "../data/assessments/measurelands";
import { fromMeasurelandsTimeResponse, toMeasurelandsTimeResponse } from "../data/assessments/measurelandsPresentation";
import type { Question } from "../data/assessments/posttests";

type Form = { key: string; questions: Question[] };

const forms: Form[] = [
  ...["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((year) => ({
    key: `${year} Pre-Test`,
    questions: getMeasurelandsPretestForYear(year),
  })),
  ...["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((year) => ({
    key: `${year} Post-Test`,
    questions: getMeasurelandsPosttestForYear(year)?.questions ?? [],
  })),
];

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string) {
  if (condition) passed += 1;
  else failures.push(message);
}

check(forms.length === 13, `Expected 13 production forms; found ${forms.length}.`);

const expectedContextAssets = new Map([
  ["y3-measurement-pre-01-v2", "backpack"],
  ["y3-measurement-post-01-v2", "drink-bottle"],
]);

for (const form of forms) {
  check(form.questions.length === 20, `${form.key} has ${form.questions.length} items instead of 20.`);
  for (const question of form.questions) {
    const prefix = `${form.key} ${question.id}`;
    const words = question.prompt.trim().split(/\s+/).filter(Boolean).length;
    check(words <= 40, `${prefix} exceeds 40 words (${words}).`);
    check(!/\benter\b|without punctuation|four digits/i.test(question.prompt), `${prefix} retains input-format instructions in the prompt.`);
    check(!/What is the metres|How long it is|What is (?:x,y|length,width)/i.test(question.prompt), `${prefix} has awkward generated wording: ${question.prompt}`);

    const visual = typeof question.visual === "object" && question.visual !== null && "kind" in question.visual
      ? question.visual as { kind?: unknown; assetName?: unknown; label?: unknown }
      : undefined;
    const kind = visual?.kind ? String(visual.kind) : undefined;
    check(kind !== "convert" && kind !== "concept", `${prefix} uses a redundant ${kind} visual.`);
    if (kind === "contextObject") {
      check(question.type === "mcq", `${prefix} adds contextual art to a non-MCQ assessment task.`);
      check(typeof visual?.assetName === "string" && !/\d|cm|mm|kg|gram|litre|meter|metre/i.test(String(visual.assetName)), `${prefix} contextual art exposes measurement data.`);
    }
    const expectedAsset = expectedContextAssets.get(question.id);
    if (expectedAsset) {
      check(kind === "contextObject", `${prefix} is missing its reviewed contextual visual.`);
      check(visual?.assetName === expectedAsset, `${prefix} uses ${String(visual?.assetName)} instead of ${expectedAsset}.`);
    }
    if (["ruler", "scaleDial", "jug", "thermometer"].includes(kind ?? "")) {
      check(/\b(?:read|shown|show)\b/i.test(question.prompt), `${prefix} includes an instrument that is not required by its prompt.`);
    }
    if (kind === "clock") check(/clock/i.test(question.prompt), `${prefix} includes a clock that is not required by its prompt.`);
    if (kind === "rectangle") check(/\b(?:area|perimeter|boundary|fencing|frame|surface|painted|cover|diagram|plan|outline|shown)\b/i.test(question.prompt), `${prefix} includes an unrelated rectangle diagram.`);
    if (kind === "perimeterShape") check(/\b(?:perimeter|boundary|outside edge|rail)\b/i.test(question.prompt), `${prefix} includes an unrelated boundary plan.`);
    if (kind === "angle") check(/\b(?:read|shown|estimate|protractor)\b/i.test(question.prompt), `${prefix} includes an angle diagram that is not required by its prompt.`);

    if (question.type !== "numeric") continue;
    check(Boolean(question.answerFormat), `${prefix} has no Measurelands answer format.`);
    if (question.answerFormat?.kind === "time") {
      const response = question.correctAnswer.padStart(4, "0");
      check(/^\d{4}$/.test(response), `${prefix} cannot be represented by the HH:MM widget.`);
      check(isAssessmentAnswerCorrect(question, response), `${prefix} rejects the HH:MM widget's canonical response.`);
      const fields = fromMeasurelandsTimeResponse(question.correctAnswer, question.answerFormat.mode);
      const widgetResponse = toMeasurelandsTimeResponse(fields.hour, fields.minute, question.answerFormat.mode, fields.meridiem);
      check(widgetResponse === response, `${prefix} cannot round-trip through its ${question.answerFormat.mode} widget.`);
      check(isAssessmentAnswerCorrect(question, widgetResponse), `${prefix} rejects the displayed time response.`);
      if (question.answerFormat.mode === "12h_meridiem") {
        check(fields.hour.length === 1 || fields.hour.length === 2, `${prefix} does not expose a natural 12-hour value.`);
        check(fields.meridiem === "AM" || fields.meridiem === "PM", `${prefix} has no canonical AM/PM response.`);
      }
    }
    if (question.answerFormat?.kind === "pair") {
      check(question.correctAnswer.includes(question.answerFormat.separator), `${prefix} pair format does not match its canonical answer.`);
    }

    const renderer = "renderer" in question
      ? (question as Question & { renderer?: { payload?: Record<string, unknown> } }).renderer
      : undefined;
    if (renderer?.payload) {
      check(renderer.payload.prompt === question.prompt, `${prefix} renderer prompt differs from the production prompt.`);
      check(renderer.payload.visual === question.visual, `${prefix} renderer visual differs from the production visual.`);
    }
  }
}

const root = process.cwd();
const cardSource = fs.readFileSync(path.join(root, "components/assessment/AssessmentQuestionCard.tsx"), "utf8");
const widgetSource = fs.readFileSync(path.join(root, "components/assessment/MeasurelandsAnswerWidget.tsx"), "utf8");
const protractorCardSource = fs.readFileSync(path.join(root, "components/measurelands/MeasurelandsProtractorCard.tsx"), "utf8");
const metricUnitCardSource = fs.readFileSync(path.join(root, "components/measurelands/MeasurelandsMetricUnitCard.tsx"), "utf8");
check(cardSource.includes("<MeasurelandsAnswerWidget"), "AssessmentQuestionCard does not route Measurelands numeric items to the dedicated widget.");
check(widgetSource.includes("format.unit") && widgetSource.includes('label="Hour"') && widgetSource.includes('label="Minutes"'), "Measurelands answer widget does not render fixed units and structured time fields.");
check(widgetSource.includes('(["AM", "PM"] as const)') && widgetSource.includes('aria-label="Choose AM or PM"'), "Contextual 12-hour questions do not render the AM/PM chooser.");
check(protractorCardSource.includes("showInteractiveReading={!assessmentMode}"), "Assessment construction protractor exposes its live numerical reading.");
check(protractorCardSource.includes('guidance={assessmentMode ? "none"'), "Assessment protractor read/misconception scenes expose guidance.");
check(!protractorCardSource.includes("Target: {target}° — drag") || protractorCardSource.includes("!assessmentMode ?"), "Assessment construction protractor exposes a target hint.");
check(metricUnitCardSource.includes('<MeasurelandsObjectArt name={o.label}'), "Metric-unit assessment tasks still render object emoji instead of commissioned art.");
check(fs.existsSync(path.join(root, "public/images/measurelands/week2-3d/parcel.png")), "The Level 5 parcel unit-choice task has no commissioned art asset.");

for (const id of ["y5-measurement-post-06-v2", "y5-measurement-post-12-v2", "y5-measurement-pre-16-v2"]) {
  const question = forms.flatMap((form) => form.questions).find((item) => item.id === id);
  check((question?.visual as { kind?: unknown } | undefined)?.kind === "perimeterShape", `${id} does not expose its labelled boundary plan.`);
}
check(toMeasurelandsTimeResponse("7", "25", "12h_meridiem", "AM") === "0725", "7:25 AM is not accepted as canonical 0725.");
check(toMeasurelandsTimeResponse("7", "15", "12h_meridiem", "PM") === "1915", "7:15 PM is not accepted as canonical 1915.");
check(toMeasurelandsTimeResponse("12", "20", "12h_meridiem", "AM") === "0020", "12:20 AM is not converted to canonical midnight time.");
check(toMeasurelandsTimeResponse("12", "13", "12h_meridiem", "PM") === "1213", "12:13 PM is not converted to canonical midday time.");
check(toMeasurelandsTimeResponse("0", "20", "12h_meridiem", "AM") === "", "12-hour inputs accept hour zero.");
check(toMeasurelandsTimeResponse("7", "5", "12h_meridiem", "AM") === "", "Time inputs accept an incomplete minute value.");

console.log(`Measurelands assessment-presentation audit: ${passed} passed, ${failures.length} failed across ${forms.length} production forms.`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
}
