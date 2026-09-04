"use client";

import type { PracticeTask } from "@/data/activities/year1/practice-task";
import MultipleChoiceActivity from "@/components/activities/MultipleChoiceActivity";
import TypedResponseActivity from "@/components/activities/TypedResponseActivity";

type PatternTask = Extract<PracticeTask, { kind: "patternPeaksQuestion" }>;

export function PatternPeaksQuestionCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: PatternTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const question = task.question;
  if (question.kind === "typed_response") {
    return (
      <TypedResponseActivity
        questionData={question}
        renderMode="quiz"
        realmId="pattern"
        onCorrect={onCorrect}
        onWrong={onWrong}
      />
    );
  }

  return (
    <MultipleChoiceActivity
      questionData={question}
      renderMode="quiz"
      realmId="pattern"
      onCorrect={onCorrect}
      onWrong={onWrong}
    />
  );
}
