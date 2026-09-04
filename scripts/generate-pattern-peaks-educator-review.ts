import { mkdirSync, writeFileSync } from "node:fs";
import { PATTERN_PEAKS_WEEKLY_QUIZ_FORMS } from "@/data/activities/patternPeaks/weeklyQuizBank";
import { PATTERN_PEAKS_INDEPENDENT_ASSESSMENT_FORMS } from "@/data/assessments/patternPeaksIndependentBanks";

const outDir = `${process.cwd()}/docs/pattern-peaks`;
mkdirSync(outDir, { recursive: true });

function csvCell(value: unknown) {
  const text = String(value ?? "").replaceAll('"', '""');
  return `"${text}"`;
}

const weeklyRows = [["level", "week", "lesson_origin", "question", "response_type", "answer", "visual", "read_aloud"]];
for (const form of PATTERN_PEAKS_WEEKLY_QUIZ_FORMS) {
  form.tasks.forEach((task, index) => {
    if (task.kind !== "patternPeaksQuestion") return;
    weeklyRows.push([
      String(form.level), String(form.week), String(Math.floor(index / 5) + 1), task.question.prompt,
      task.question.kind, task.question.answer, task.question.visual?.type ?? "none", task.speakText,
    ]);
  });
}

const assessmentRows = [["level", "form", "id", "descriptor", "week_link", "cognitive", "difficulty", "response_mode", "question", "answer", "visual", "misconception"]];
for (const items of Object.values(PATTERN_PEAKS_INDEPENDENT_ASSESSMENT_FORMS)) {
  for (const item of items) {
    const task = item.practiceTask;
    if (task?.kind !== "patternPeaksQuestion") continue;
    assessmentRows.push([
      String(item.level), item.form, item.id, item.primaryDescriptorCode, item.linkedWeeks?.join("|") ?? "",
      item.cognitiveCategory, item.difficulty, item.responseMode, task.question.prompt, task.question.answer,
      task.question.visual?.type ?? "none", item.misconceptionTags.join("|"),
    ]);
  }
}

writeFileSync(`${outDir}/weekly-quizzes-educator-review.csv`, weeklyRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n");
writeFileSync(`${outDir}/pre-post-tests-educator-review.csv`, assessmentRows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n");
console.log(`Generated ${weeklyRows.length - 1} weekly and ${assessmentRows.length - 1} Pre/Post educator-review rows.`);
