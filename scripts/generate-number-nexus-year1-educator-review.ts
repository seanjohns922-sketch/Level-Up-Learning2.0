import fs from "node:fs";
import path from "node:path";
import {
  YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS,
  YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS,
} from "../data/assessments/year1NumberNexusIndependentBanks";

const HEADERS = ["Item ID", "Form", "Descriptor", "Question summary", "Response type", "Difficulty", "Cognitive category", "Misconception", "Expected answer", "Reviewer verdict", "Wording issue", "Visual issue", "Curriculum issue", "Recommended action"] as const;
const label = (value: string) => value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const items = [...YEAR1_NUMBER_NEXUS_INDEPENDENT_PRETEST_ITEMS, ...YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS];
const rows = items.map((item) => [
  item.id,
  item.form === "pretest" ? "Pre-Test" : "Post-Test",
  item.primaryDescriptorCode,
  item.prompt,
  label(item.responseMode),
  label(item.difficulty),
  label(item.cognitiveCategory),
  item.misconceptionTags.join(", "),
  item.correctAnswer,
  "", "", "", "", "",
]);

if (rows.length !== 40 || new Set(items.map((item) => item.id)).size !== 40) throw new Error("Year 1 review sheet requires 40 unique items.");
if (rows.some((row) => row.length !== HEADERS.length)) throw new Error("Year 1 review rows do not match the approved columns.");

const outputPath = path.join(process.cwd(), "docs/number-nexus/year-1-educator-review-sheet.csv");
fs.writeFileSync(outputPath, `${[HEADERS, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`);
console.log(`Generated ${rows.length} review rows at ${outputPath}.`);
