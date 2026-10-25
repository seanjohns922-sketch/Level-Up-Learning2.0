import { getCurriculumPlan } from "@/data/programs/genres";
import type { CompatProgressRow } from "@/lib/realm-progress-compat";
import { calculateAccuracy } from "@/lib/learning-score";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
import type { TeacherInsight } from "@/lib/teacher-insights";
import {
  getQuizPercent,
  getQuizScore,
  getQuizTotal,
  latestLessonAccuracy,
  numberOrNull,
  parseLessonAttempts,
  parseQuizScores,
  pickPrimaryInsight,
  type InsightCarrier,
} from "@/lib/teacher/progress-parsing";
import { buildTeacherStudentSnapshot } from "@/lib/teacher/teacher-student-snapshot";
import type { LiveRealmId } from "@/lib/realms/realm-registry";

/**
 * Data for the printed strand report: for one student, every live realm they
 * are placed in, with this level's lesson-by-lesson results, weekly quizzes,
 * pre-test, and the strongest skill and focus from the saved lesson insights.
 * Built only from the canonical progress rows the teacher dashboard already loads.
 */

export const STRAND_REPORT_REALMS: LiveRealmId[] = ["number", "measurement", "space", "pattern", "statistics", "chance"];

/** Curriculum plan keys differ from realm ids for two realms. */
const PLAN_GENRE: Record<LiveRealmId, string> = {
  number: "number",
  measurement: "measurement",
  space: "space",
  pattern: "algebra",
  statistics: "statistics",
  chance: "probability",
};

export type StrandReportTone = "support" | "checkIn" | "onTrack" | "strong" | "none";

export type StrandReportLesson = { lesson: number; title: string; accuracy: number | null; focus: boolean };
export type StrandReportWeek = { week: number; current: boolean; quizPercent: number | null; lessons: StrandReportLesson[] };

export type StrandReportRealm = {
  realmId: LiveRealmId;
  realmName: string;
  strand: string;
  levelLabel: string;
  week: number | null;
  totalWeeks: number | null;
  status: { label: string; tone: StrandReportTone };
  lessonAccuracy: { percent: number; correct: number; total: number } | null;
  weeklyQuiz: { percent: number; correct: number; total: number; week: number } | null;
  pretest: number | null;
  strongest: { skill: string; evidence: string } | null;
  focus: { skill: string; action: string } | null;
  weeks: StrandReportWeek[];
};

export type StrandReportNotStarted = { realmId: LiveRealmId; realmName: string; strand: string };

const STATUS: Record<TeacherInsight["status"], { label: string; tone: StrandReportTone }> = {
  "Needs Support": { label: "Needs support", tone: "support" },
  "Quick Check-in Recommended": { label: "Check in", tone: "checkIn" },
  "On Track": { label: "On track", tone: "onTrack" },
  "Ready to Move On": { label: "Strong", tone: "strong" },
};

/** Insight labels that carry no teaching information, so they are not shown as a focus. */
const NO_FOCUS = new Set(["Not enough evidence yet", "No priority gap identified"]);

function latestCounts(carrier: InsightCarrier | undefined): { correct: number; total: number } | null {
  const attempts = Array.isArray(carrier?.attempts)
    ? carrier!.attempts.filter((entry): entry is NonNullable<InsightCarrier["latestSummary"]> => Boolean(entry) && typeof entry === "object")
    : [];
  const latest = [...attempts].reverse().find((entry) => Boolean(entry.completedAt ?? entry.at)) ?? carrier?.latestSummary ?? null;
  const correct = numberOrNull(latest?.correctCount ?? latest?.correctAnswers);
  const total = numberOrNull(latest?.totalQuestions ?? latest?.questionsAnswered);
  return correct != null && total != null && total > 0 ? { correct, total } : null;
}

/** "the student" in generated advice becomes the student's first name. */
function personalise(action: string, firstName: string) {
  return action.replace(/\bthe student\b/g, firstName).replace(/\bThe student\b/g, firstName);
}

export function buildStrandReport(input: {
  studentId: string;
  firstName: string;
  progressRows: readonly CompatProgressRow[];
}): { realms: StrandReportRealm[]; notStarted: StrandReportNotStarted[] } {
  const realms: StrandReportRealm[] = [];
  const notStarted: StrandReportNotStarted[] = [];

  for (const realmId of STRAND_REPORT_REALMS) {
    const snapshot = buildTeacherStudentSnapshot({ studentId: input.studentId, realmId, progressRows: input.progressRows });
    const prog = snapshot.progress;
    if (!prog || !snapshot.currentLevel) {
      notStarted.push({ realmId, realmName: snapshot.realm.name, strand: snapshot.realm.strand });
      continue;
    }

    const plan = getCurriculumPlan(snapshot.currentLevel, PLAN_GENRE[realmId]);
    const quizScores = parseQuizScores(prog.quiz_scores);
    const attempts = parseLessonAttempts(prog.lesson_attempts);
    const currentWeek = snapshot.currentWeek ?? 1;

    // Primary insight for the current week (falling back to the latest week with one) drives the status and focus.
    let primary: TeacherInsight | null = null;
    let focusLessonId: string | null = null;
    for (let week = currentWeek; week >= 1 && !primary; week -= 1) {
      const lessons = plan.find((entry) => entry.week === week)?.lessons ?? [];
      const withInsight = lessons
        .map((lesson) => ({ id: lesson.id, insight: attempts[lesson.id]?.latestInsight as TeacherInsight | null | undefined }))
        .filter((entry): entry is { id: string; insight: TeacherInsight } => Boolean(entry.insight));
      primary = pickPrimaryInsight(withInsight.map((entry) => entry.insight));
      focusLessonId = withInsight.find((entry) => entry.insight === primary)?.id ?? null;
    }
    // Only a real gap is a focus: no "needs support" box means no FOCUS tag on a lesson either.
    if (!primary || NO_FOCUS.has(primary.needsSupport)) focusLessonId = null;

    let correct = 0;
    let total = 0;
    let best: { skill: string; title: string; week: number; lesson: number; accuracy: number } | null = null;
    let latestQuiz: StrandReportRealm["weeklyQuiz"] = null;
    const weeks: StrandReportWeek[] = [];

    for (const entry of plan.filter((item) => item.week <= currentWeek)) {
      const lessons = entry.lessons.map((lesson, index) => {
        const carrier = attempts[lesson.id];
        const counts = latestCounts(carrier);
        if (counts) {
          correct += counts.correct;
          total += counts.total;
        }
        const accuracy = latestLessonAccuracy(carrier);
        const insight = carrier?.latestInsight as TeacherInsight | null | undefined;
        if (accuracy != null && insight?.strongestSkill && (!best || accuracy > best.accuracy)) {
          best = { skill: insight.strongestSkill, title: lesson.title, week: entry.week, lesson: index + 1, accuracy };
        }
        return { lesson: index + 1, title: lesson.title, accuracy, focus: lesson.id === focusLessonId };
      });
      const quiz = quizScores[String(entry.week)];
      const quizPercent = getQuizPercent(quiz);
      const quizCorrect = getQuizScore(quiz);
      const quizTotal = getQuizTotal(quiz);
      if (quizPercent != null && quizCorrect != null && quizTotal != null) {
        latestQuiz = { percent: quizPercent, correct: quizCorrect, total: quizTotal, week: entry.week };
      }
      // A week appears once anything in it has been attempted, plus the current week.
      if (entry.week === currentWeek || lessons.some((lesson) => lesson.accuracy != null) || quizPercent != null) {
        weeks.push({ week: entry.week, current: entry.week === currentWeek, quizPercent, lessons });
      }
    }

    const chosen = best as { skill: string; title: string; week: number; lesson: number; accuracy: number } | null;
    const percent = calculateAccuracy(correct, total);
    realms.push({
      realmId,
      realmName: snapshot.realm.name,
      strand: snapshot.realm.strand,
      levelLabel: formatStudentLevelLabel(snapshot.currentLevel),
      week: snapshot.currentWeek,
      totalWeeks: snapshot.realm.totalWeeks,
      status: primary ? STATUS[primary.status] : { label: "Getting started", tone: "none" },
      lessonAccuracy: percent != null ? { percent, correct, total } : null,
      weeklyQuiz: latestQuiz,
      pretest: numberOrNull(prog.pretest_score),
      strongest: chosen ? { skill: chosen.skill, evidence: `Best result: Week ${chosen.week} · L${chosen.lesson} ${chosen.title} (${Math.round(chosen.accuracy)}%)` } : null,
      focus: primary && !NO_FOCUS.has(primary.needsSupport)
        ? { skill: primary.needsSupport, action: personalise(primary.teacherAction, input.firstName) }
        : null,
      weeks,
    });
  }

  return { realms, notStarted };
}
