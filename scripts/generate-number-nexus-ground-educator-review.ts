import fs from "node:fs";
import path from "node:path";
import { GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS } from "../data/assessments/groundNumberNexusIndependentPosttest";

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
  selected_response: "Selected response",
  manipulated_response: "Manipulated response",
};
const label = (value: string) => value
  .split("_")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const rows = GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS.map((item) => [
  item.id,
  "Post-Test",
  item.primaryDescriptorCode,
  item.prompt,
  responseLabels[item.responseMode] ?? label(item.responseMode),
  label(item.difficulty),
  label(item.cognitiveCategory),
  item.misconceptionTags.join(", "),
  item.correctAnswer,
  "",
  "",
  "",
  "",
  "",
]);

if (rows.length !== 20 || new Set(GROUND_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS.map((item) => item.id)).size !== 20) {
  throw new Error("Ground Number Nexus review sheet requires 20 unique items.");
}
if (rows.some((row) => row.length !== HEADERS.length)) {
  throw new Error("Ground Number Nexus review rows do not match the approved columns.");
}

const outputPath = path.join(process.cwd(), "docs/number-nexus/ground-educator-review-sheet.csv");
fs.writeFileSync(
  outputPath,
  `${[HEADERS, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`,
);
console.log(`Generated ${rows.length} review rows at ${outputPath}.`);

