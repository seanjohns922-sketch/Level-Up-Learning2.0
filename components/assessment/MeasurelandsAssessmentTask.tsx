"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
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
  const usesEditableStarpathClassification = task.kind === "starpathObject" && task.mode === "classify";

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
          assessmentMode
          editableAssessmentMode={usesEditableStarpathClassification}
          assessmentAnswer={value}
          callbacks={{
            markCorrect: () => record(correctToken),
            markCorrectSoft: () => record(correctToken),
            markWrong: () => record(`${WRONG_PREFIX}:${questionId}`),
            markAttempted: () => undefined,
            recordAssessmentAnswer: (correct) =>
              record(correct ? correctToken : `${WRONG_PREFIX}:${questionId}`),
          }}
        />
      </div>
      {hasRecordedAnswer ? (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={changeAnswer}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-amber-800 bg-white px-4 py-2 text-sm font-black text-amber-950 transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Change response
          </button>
        </div>
      ) : null}
    </div>
  );
}
