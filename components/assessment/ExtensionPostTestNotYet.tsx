"use client";

import { useRouter } from "next/navigation";
import type { AssessmentQuestion } from "@/data/assessments/api";
import { analyzeAssessmentResult, type AssessmentResultProfile } from "@/data/assessments/analysis";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import type { Cave7Realm } from "@/lib/cave7-config";
import { level7LiveHref } from "@/lib/level7-release";
import { getRealmDefinition } from "@/lib/realms/realm-registry";
import type { RealmLessonThemeId } from "@/components/lesson/RealmLessonHome";
import { PostTestNotYet, postTestNotYetMessage } from "@/components/assessment/PostTestNotYet";
import type { ExtensionPlanWeek } from "@/lib/extension-plan-weeks";

/**
 * The result of a Level 7 or 8 post-test, worked out exactly as it is saved
 * (score, strengths, weak areas and suggested weeks), so the screen can show it
 * straight after the learner finishes.
 */
export function extensionPostTestResult(questions: readonly AssessmentQuestion[], answers: Record<string, string>, level: 7 | 8) {
  return analyzeAssessmentResult({
    questions: questions.map((question) => ({ ...question, correctAnswer: String(question.correctAnswer) })),
    answers,
    yearLevel: level,
    testType: "post",
    passThreshold: ASSESSMENT_THRESHOLDS.posttestPassPercent,
  });
}

/** Levels 7 and 8 share the "not yet" post-test screen every other level uses. */
export function ExtensionPostTestNotYet({
  realm,
  level,
  result,
  plan,
  onRetry,
}: {
  realm: RealmLessonThemeId;
  level: 7 | 8;
  result: AssessmentResultProfile;
  plan: readonly ExtensionPlanWeek[];
  onRetry: () => void;
}) {
  const router = useRouter();
  const year = `Year ${level}`;
  const realmName = getRealmDefinition(realm).name;
  const planWeeks = plan.map((item) => ({ week: item.week, skill: item.topic || undefined }));
  const weekHref = (week: number) =>
    level === 7 ? level7LiveHref(realm as Cave7Realm, week, "week") : `/program?year=${encodeURIComponent(year)}&realm_id=${realm}&week=${week}&legacy=1`;
  const message = postTestNotYetMessage(result.score, result.total, result.percentage);
  const speech = [
    `${message.title}. ${message.sub}`,
    `${realmName}, Level ${level}, post-test results. You scored ${result.score} out of ${result.total}, which is ${result.percentage} percent.`,
    planWeeks.length ? `Your plan: start with Week ${planWeeks.map((item) => item.week).join(", then Week ")}, then retry the post-test.` : "Retry the post-test when you're ready.",
    `Score ${ASSESSMENT_THRESHOLDS.posttestPassPercent} percent or more to unlock your RELIQ card.`,
    "Once you've finished your plan, you can replay any week and retry the post-test whenever you're ready.",
  ].join(" ");

  return (
    <PostTestNotYet
      realmId={realm}
      realmName={realmName}
      levelLabel={`Level ${level}`}
      levelNumber={level}
      year={year}
      score={result.score}
      total={result.total}
      percent={result.percentage}
      planWeeks={planWeeks}
      strengths={result.strengths.slice(0, 2).map((item) => item.skillLabel)}
      speech={speech}
      speechKey={`assessment-results-${realm}-${year}-posttest`}
      onStartWeek={(week) => router.push(weekHref(week))}
      onPractise={() => {
        const first = plan[0];
        if (!first) return router.push(weekHref(1));
        router.push(level === 7 ? level7LiveHref(realm as Cave7Realm, first.week, first.lesson) : weekHref(first.week));
      }}
      onRetry={onRetry}
      onBack={() => router.push("/world")}
      backLabel="Back to my world"
    />
  );
}
