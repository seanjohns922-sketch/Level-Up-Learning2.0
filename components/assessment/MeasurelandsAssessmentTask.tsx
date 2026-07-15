"use client";

import { useRef } from "react";
import { TaskRenderer } from "@/components/TaskRenderer";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

const WRONG_PREFIX = "__measurelands_task_incorrect__";

export function MeasurelandsAssessmentTask({
  questionId,
  task,
  value,
  correctToken,
  onRecord,
}: {
  questionId: string;
  task: PracticeTask;
  value: string;
  correctToken: string;
  onRecord: (value: string) => void;
}) {
  const recordedRef = useRef(Boolean(value));

  const record = (nextValue: string) => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    onRecord(nextValue);
  };

  const hasRecordedAnswer = Boolean(value);

  return (
    <div className="relative">
      <div className={hasRecordedAnswer ? "pointer-events-none select-none opacity-75" : undefined}>
        <TaskRenderer
          task={task}
          taskNonce={0}
          callbacks={{
            markCorrect: () => record(correctToken),
            markCorrectSoft: () => record(correctToken),
            markWrong: () => record(`${WRONG_PREFIX}:${questionId}`),
            markAttempted: () => undefined,
          }}
        />
      </div>
      {hasRecordedAnswer && (
        <div className="absolute inset-0 z-20 flex items-end justify-center rounded-3xl bg-slate-950/10 p-4">
          <div className="rounded-full border border-amber-300/60 bg-amber-50 px-6 py-3 text-base font-black text-amber-950 shadow-lg">
            Answer recorded
          </div>
        </div>
      )}
    </div>
  );
}
