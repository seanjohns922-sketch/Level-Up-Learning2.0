import fs from "node:fs";
import path from "node:path";
import { GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS } from "../data/assessments/groundStarpathIndependentPosttest";

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

const label = (value: string) => value
  .split("_")
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(" ");
const csvCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

function expectedAnswer(item: (typeof GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS)[number]): string {
  const task = item.practiceTask;
  if (!task) return String(item.correctAnswer);
  if (task.kind === "starpathShapeMatch" || task.kind === "starpathObjectShape" || task.kind === "starpathShapeName" || task.kind === "starpathShapeClassify" || task.kind === "starpathPositionWord" || task.kind === "starpathPositionPicture" || task.kind === "starpathDirectionChoice") {
    return task.correctOptionId;
  }
  if (task.kind === "starpathOddOneOut") return task.oddOptionId;
  if (task.kind === "starpathPositionFind") return task.correctId;
  if (task.kind === "starpathGroundAssessment" && task.mode === "route") return task.answerMoves.join(" then ");
  if (task.kind === "starpathGroundAssessment") {
    return task.answer.map((answer) => `${answer.tokenId} at row ${answer.r + 1}, column ${answer.c + 1}`).join("; ");
  }
  return "Validated interaction";
}

const rows = GROUND_STARPATH_INDEPENDENT_POSTTEST_ITEMS.map((item) => [
  item.id,
  "Post-Test",
  item.primaryDescriptorCode,
  item.prompt,
  label(item.responseMode),
  label(item.difficulty),
  label(item.cognitiveCategory),
  item.misconceptionTags.join(", "),
  expectedAnswer(item),
  "",
  "",
  "",
  "",
  "",
]);

if (rows.length !== 20 || rows.some((row) => row.length !== HEADERS.length)) {
  throw new Error("Ground Starpath educator review sheet requires 20 complete rows.");
}

const outputDir = path.join(process.cwd(), "docs/starpath");
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, "ground-educator-review-sheet.csv");
fs.writeFileSync(outputPath, `${[HEADERS, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`);
console.log(`Generated ${rows.length} review rows at ${outputPath}.`);
