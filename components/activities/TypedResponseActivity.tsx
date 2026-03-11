"use client";

import { useState } from "react";
import type { TypedResponseQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function TypedResponseActivity({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: TypedResponseQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [typed, setTyped] = useState("");

  function check() {
    if (normalize(typed) === normalize(questionData.answer)) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        Typed Response
      </div>
      <h2 className="mt-2 text-2xl font-black text-gray-900">
        {questionData.prompt}
      </h2>
      {questionData.helper ? (
        <p className="mt-2 text-sm text-gray-600">{questionData.helper}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder={questionData.placeholder ?? "Type your answer"}
          className="w-full max-w-md rounded-xl border border-gray-300 px-4 py-3 text-lg font-bold text-gray-900 outline-none focus:border-teal-500"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-xl bg-teal-600 px-5 py-3 font-black text-white hover:bg-teal-700"
        >
          Check answer
        </button>
      </div>
    </div>
  );
}
