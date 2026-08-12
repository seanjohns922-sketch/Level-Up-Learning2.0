import fs from "node:fs";
import path from "node:path";
import {
  LEVEL1_STARPATH_INDEPENDENT_POSTTEST_ITEMS,
  LEVEL1_STARPATH_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/level1StarpathIndependentAssessments";

const HEADERS = ["Item ID", "Form", "Descriptor", "Question summary", "Response type", "Difficulty", "Cognitive category", "Misconception", "Expected answer", "Reviewer verdict", "Wording issue", "Visual issue", "Curriculum issue", "Recommended action"];
const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const label = (value: string) => value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

const rows = [
  ...LEVEL1_STARPATH_INDEPENDENT_PRETEST_ITEMS.map((item) => [item, "Pre-Test"] as const),
  ...LEVEL1_STARPATH_INDEPENDENT_POSTTEST_ITEMS.map((item) => [item, "Post-Test"] as const),
].map(([item, form]) => [
  item.id, form, item.primaryDescriptorCode, item.prompt, label(item.responseMode), label(item.difficulty),
  label(item.cognitiveCategory), item.misconceptionTags.join(", "), "Validated interaction", "", "", "", "", "",
]);

if (rows.length !== 40 || rows.some((row) => row.length !== HEADERS.length)) throw new Error("Year 1 Starpath review sheet requires 40 complete rows.");
const output = path.join(process.cwd(), "docs/starpath/level1-educator-review-sheet.csv");
fs.writeFileSync(output, `${[HEADERS, ...rows].map((row) => row.map(csv).join(",")).join("\n")}\n`);
console.log(`Generated ${rows.length} review rows at ${output}.`);
