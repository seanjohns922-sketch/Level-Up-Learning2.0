"use client";

import { useRef, useState } from "react";
import { TaskRenderer } from "@/components/TaskRenderer";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

const WRONG_PREFIX = "__measurelands_task_incorrect__";

export function MeasurelandsAssessmentTask({
  questionId,
  task,
  value,
  correctToken,
  onRecord,
  onClear,
}: {
  questionId: string;
  task: PracticeTask;
  value: string;
  correctToken: string;
  onRecord: (value: string) => void;
  onClear: () => void;
}) {
  const recordedRef = useRef(Boolean(value));
  const [taskNonce, setTaskNonce] = useState(0);

  const record = (nextValue: string) => {
    if (recordedRef.current) return;
    recordedRef.current = true;
    onRecord(nextValue);
    // Lesson cards can set local correct/incorrect feedback before invoking the
    // callback. Assessments record the response without revealing correctness.
    setTaskNonce((nonce) => nonce + 1);
  };

  const hasRecordedAnswer = Boolean(value);

  const changeAnswer = () => {
    recordedRef.current = false;
    onClear();
    setTaskNonce((nonce) => nonce + 1);
  };

  return (
    <div className="relative">
      <div className={hasRecordedAnswer ? "pointer-events-none select-none" : undefined}>
        <TaskRenderer
          key={`${questionId}:${taskNonce}`}
          task={task}
          taskNonce={taskNonce}
          callbacks={{
            markCorrect: () => record(correctToken),
            markCorrectSoft: () => record(correctToken),
            markWrong: () => record(`${WRONG_PREFIX}:${questionId}`),
            markAttempted: () => undefined,
          }}
        />
      </div>
      {hasRecordedAnswer && (
        <div className="absolute inset-0 z-20 flex items-end justify-center rounded-3xl p-4">
          <div className="flex items-center gap-3 rounded-full border border-amber-300/60 bg-amber-50 p-2 pl-5 text-base font-black text-amber-950 shadow-lg">
            <span>Answer recorded</span>
            <button
              type="button"
              onClick={changeAnswer}
              className="rounded-full bg-amber-900 px-5 py-2.5 text-sm font-black text-white transition hover:bg-amber-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              Change answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
