// ── Lesson Coach Review builder (pure, rule-based, deterministic) ─────────────
// Turns the existing LessonPerformanceSummary into a short, positive, actionable
// coach review. No AI, no per-question teaching — just friendly framing of data
// the lesson already computed. Level-aware caps keep Ground simple.

import { getSkillCoaching, resolveCoachingKey } from "@/lib/skill-coaching";

type TopicSummary = { label: string; correct: number; total: number; accuracy: number };

export type CoachReviewInput = {
  levelNumber?: number;
  accuracy: number;
  topicSummaries: TopicSummary[];
  strengths: TopicSummary[];
  areasToImprove: TopicSummary[];
  practisedSkills?: string[];
  nextUpLabel?: string;
  lessonId?: string | null;
};

export type CoachReview = {
  practised: string[];
  didWell: string[];
  keepPractising: string[];
  coachTip?: string;
  nextUpLabel?: string;
};

export function buildCoachReview(input: CoachReviewInput): CoachReview {
  const junior = (input.levelNumber ?? 1) <= 2;
  const maxPractised = junior ? 2 : 3;
  const maxWell = junior ? 1 : 2;
  const maxFocus = junior ? 1 : 2; // Ground: at most one focus area

  const topicLabels = input.topicSummaries.map((t) => t.label);
  const coaching = getSkillCoaching(
    resolveCoachingKey({ lessonId: input.lessonId, topicLabels, practisedSkills: input.practisedSkills })
  );

  // What you practised — prefer authored skills, else observed topics.
  const practised = (input.practisedSkills && input.practisedSkills.length
    ? input.practisedSkills
    : topicLabels
  ).slice(0, maxPractised);

  // What you did well — real strengths first, else an honest, positive line.
  const strong = input.strengths.filter((s) => s.total >= 2 && s.accuracy >= 75);
  const didWell: string[] = [];
  if (strong.length > 0) {
    didWell.push(coaching.strengthLine ?? "You showed strong understanding today!");
    if (!junior && strong.length > 1) didWell.push("Nice, consistent work across the lesson.");
  } else if (input.accuracy >= 60) {
    didWell.push("You stuck with it and finished — great effort!");
  } else {
    didWell.push("You gave it a great go — every try helps you learn!");
  }

  // Keep practising — only if there's a meaningful, fixable gap (never punitive).
  const weak = input.areasToImprove.filter((a) => a.total >= 2 && a.accuracy < 60);
  const keepPractising: string[] = [];
  if (weak.length > 0 && input.accuracy < 95) {
    keepPractising.push(coaching.focusLine ?? coaching.tip);
    if (!junior && weak.length > 1) {
      // a second, generic-but-actionable nudge for older students
      keepPractising.push("Take your time and re-check before you answer.");
    }
  }

  return {
    practised,
    didWell: didWell.slice(0, maxWell),
    keepPractising: keepPractising.slice(0, maxFocus),
    coachTip: coaching.tip, // one short rule; positive even when there's no weakness
    nextUpLabel: input.nextUpLabel,
  };
}
