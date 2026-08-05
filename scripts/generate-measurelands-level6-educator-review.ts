import fs from "node:fs";
import path from "node:path";
import {
  YEAR6_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR6_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/year6MeasurelandsIndependentBanks";

const HEADERS = [
  "Item ID",
  "Form",
  "Descriptor",
  "Question summary",
  "Response type",
  "Difficulty",
  "Cognitive category",
  "Misconception",
  "Expected answer",
  "Reviewer verdict",
  "Wording issue",
  "Visual issue",
  "Curriculum issue",
  "Recommended action",
] as const;

const responseLabels: Record<string, string> = {
  constructed_response: "Constructed response",
  explanation: "Structured explanation",
  justification: "Selected justification",
};

const label = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const items = [
  ...YEAR6_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS,
  ...YEAR6_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS,
];

const rows = items.map((item) => [
  item.id,
  item.form === "pretest" ? "Pre-Test" : "Post-Test",
  item.primaryDescriptorCode,
  item.prompt,
  responseLabels[item.responseMode] ?? label(item.responseMode),
  label(item.difficulty),
  label(item.cognitiveCategory),
  item.misconceptionTags.join(", "),
  item.correctAnswer,
  "Approved",
  "",
  "",
  "",
  "Proceed to pilot calibration",
]);

if (rows.length !== 40) {
  throw new Error(`Expected 40 Level 6 candidate rows, received ${rows.length}.`);
}
if (new Set(items.map((item) => item.id)).size !== 40) {
  throw new Error("Level 6 educator review rows contain duplicate item IDs.");
}
if (
  items.filter((item) => item.form === "pretest").length !== 20
  || items.filter((item) => item.form === "posttest").length !== 20
) {
  throw new Error("Level 6 educator review rows must contain 20 items per form.");
}
if (rows.some((row) => row.length !== HEADERS.length)) {
  throw new Error("Level 6 educator review rows do not match the approved columns.");
}

const outputPath = path.join(
  process.cwd(),
  "docs/measurelands/level-6-educator-review-sheet.csv",
);
const csv = [HEADERS, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
fs.writeFileSync(outputPath, `${csv}\n`);
console.log(`Generated ${rows.length} review rows at ${outputPath}.`);
