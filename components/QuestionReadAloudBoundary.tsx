"use client";

import type { ReactNode } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";

export default function QuestionReadAloudBoundary({
  text,
  speechKey,
  children,
}: {
  text: string;
  speechKey: string;
  children: ReactNode;
}) {
  return (
    <div className="question-read-aloud-boundary w-full">
      <style>{`
        .question-read-aloud-boundary:has(> .question-read-aloud-content [data-read-aloud-button="true"][data-read-aloud-kind="prompt"]) > .question-read-aloud-fallback {
          display: none;
        }
      `}</style>
      <div className="question-read-aloud-fallback mb-3 flex justify-end">
        <ReadAloudBtn
          text={text}
          speechKey={speechKey}
          size="md"
          label="Read question"
        />
      </div>
      <div className="question-read-aloud-content">{children}</div>
    </div>
  );
}
