import fs from "node:fs";
import path from "node:path";
import { YEAR1_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS, YEAR1_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS } from "../data/assessments/year1MeasurelandsIndependentBanks";

const HEADERS = ["Item ID", "Form", "Descriptor", "Question summary", "Response type", "Difficulty", "Cognitive category", "Misconception", "Expected answer", "Reviewer verdict", "Wording issue", "Visual issue", "Curriculum issue", "Recommended action"] as const;
const responseLabels: Record<string, string> = { constructed_response: "Constructed response", selected_response: "Selected response" };
const label = (value: string) => value.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const items = [...YEAR1_MEASURELANDS_INDEPENDENT_PRETEST_ITEMS, ...YEAR1_MEASURELANDS_INDEPENDENT_POSTTEST_ITEMS];
const rows = items.map((item) => [item.id, item.form === "pretest" ? "Pre-Test" : "Post-Test", item.primaryDescriptorCode, item.prompt, responseLabels[item.responseMode] ?? label(item.responseMode), label(item.difficulty), label(item.cognitiveCategory), item.misconceptionTags.join(", "), item.correctAnswer, "", "", "", "", ""]);
if (rows.length !== 40 || new Set(items.map((item) => item.id)).size !== 40) throw new Error("Level 1 review sheet requires 40 unique items.");
if (rows.some((row) => row.length !== HEADERS.length)) throw new Error("Level 1 review rows do not match the approved columns.");
const outputPath = path.join(process.cwd(), "docs/measurelands/level-1-educator-review-sheet.csv");
fs.writeFileSync(outputPath, `${[HEADERS, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`);
console.log(`Generated ${rows.length} review rows at ${outputPath}.`);
