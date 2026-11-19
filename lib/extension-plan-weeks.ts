import type { AssessmentQuestion } from "@/data/assessments/api";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { NEW_CAVE7_PROGRAMS } from "@/data/activities/cave7/curriculum";
import { LEVEL8_PROGRAMS } from "@/data/activities/level8/program";
import { MEASUREMENT7_PROGRAM } from "@/data/activities/year7Measurement/curriculum";
import { NUMBER7_PROGRAM } from "@/data/activities/year7Number/curriculum";
import { SPACE7_PROGRAM } from "@/data/activities/year7Space/curriculum";

export type ExtensionRealm = "number" | "measurement" | "space" | "statistics" | "pattern" | "chance";

type ProgramWeek = { week: number; topic: string; curriculum?: readonly string[]; lessons: ReadonlyArray<{ lesson: number; curriculum?: readonly string[] }> };

function levelProgram(realm: ExtensionRealm, level: 7 | 8): readonly ProgramWeek[] {
  if (level === 8) return LEVEL8_PROGRAMS[realm];
  if (realm === "number") return NUMBER7_PROGRAM;
  if (realm === "measurement") return MEASUREMENT7_PROGRAM;
  if (realm === "space") return SPACE7_PROGRAM;
  return NEW_CAVE7_PROGRAMS[realm];
}

export type ExtensionPlanWeek = { week: number; topic: string; lesson: number };
/** Level 7 and 8 questions name the curriculum descriptor they assess. */
type CodedQuestion = AssessmentQuestion & { primaryDescriptorCode?: string; curriculumCodes?: readonly string[] };

/**
 * Levels 7 and 8 questions carry curriculum codes rather than week links, so the
 * plan matches each wrong answer to the weeks that teach its code and suggests
 * up to three weeks covering the most missed questions, in week order.
 */
export function extensionPlanWeeks(realm: ExtensionRealm, level: 7 | 8, questions: readonly CodedQuestion[], answers: Record<string, string>): ExtensionPlanWeek[] {
  const weeks = levelProgram(realm, level);
  const missed = new Map<number, { count: number; lesson: number }>();
  for (const question of questions) {
    const answer = answers[question.id];
    if (answer !== undefined && answer !== "idk" && isAssessmentAnswerCorrect({ ...question, correctAnswer: String(question.correctAnswer) }, String(answer))) continue;
    const codes = new Set([question.primaryDescriptorCode, ...(question.curriculumCodes ?? [])].filter(Boolean));
    for (const week of weeks) {
      const lesson = week.lessons.find((item) => item.curriculum?.some((code) => codes.has(code)));
      if (!lesson && !week.curriculum?.some((code) => codes.has(code))) continue;
      const entry = missed.get(week.week) ?? { count: 0, lesson: lesson?.lesson ?? 1 };
      missed.set(week.week, { ...entry, count: entry.count + 1 });
    }
  }
  return [...missed.entries()]
    .sort(([weekA, a], [weekB, b]) => b.count - a.count || weekA - weekB)
    .slice(0, 3)
    .sort(([weekA], [weekB]) => weekA - weekB)
    .map(([week, entry]) => ({ week, lesson: entry.lesson, topic: weeks.find((item) => item.week === week)?.topic ?? "" }));
}

