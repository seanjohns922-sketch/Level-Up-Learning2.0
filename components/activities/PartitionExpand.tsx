"use client";

import { useState } from "react";
import type { PartitionExpandQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

export default function PartitionExpand({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: PartitionExpandQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [values, setValues] = useState({
    hundreds: questionData.mode === "flexible_partition" ? String(questionData.standard.hundreds) : "",
    tens: "0",
    ones: "0",
  });

  function setValue(key: "hundreds" | "tens" | "ones", next: string) {
    setValues((current) => ({
      ...current,
      [key]: next.replace(/[^\d]/g, ""),
    }));
  }

  function numericValue(key: "hundreds" | "tens" | "ones") {
    return Number(values[key] || "0");
  }

  function check() {
    const hundreds = numericValue("hundreds");
    const tens = numericValue("tens");
    const ones = numericValue("ones");

    const isCorrect =
      questionData.mode === "flexible_partition"
        ? hundreds + tens + ones === questionData.target
        : hundreds === questionData.standard.hundreds &&
          tens === questionData.standard.tens &&
          ones === questionData.standard.ones;

    if (isCorrect) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
          Partition & Expand
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          <ReadAloudBtn text={questionData.prompt} />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { key: "hundreds" as const, label: "Hundreds" },
          { key: "tens" as const, label: "Tens" },
          { key: "ones" as const, label: "Ones" },
        ].map((item) => (
          <label
            key={item.key}
            className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              {item.label}
            </div>
            <input
              value={values[item.key]}
              onChange={(event) => setValue(item.key, event.target.value)}
              inputMode="numeric"
              className="mt-3 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-3xl font-black text-gray-900 outline-none focus:border-teal-500"
              placeholder="0"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          Your expression
        </div>
        <div className="mt-2 text-3xl font-black text-teal-900">
          {numericValue("hundreds")} + {numericValue("tens")} + {numericValue("ones")} ={" "}
          {numericValue("hundreds") + numericValue("tens") + numericValue("ones")}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
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
