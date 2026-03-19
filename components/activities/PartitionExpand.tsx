"use client";

import { useState } from "react";
import type { PartitionExpandQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

type PlaceKey = "thousands" | "hundreds" | "tens" | "ones";

export default function PartitionExpand({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: PartitionExpandQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const hasThousands = (questionData.standard.thousands ?? 0) > 0 || questionData.target >= 1000;

  const places: { key: PlaceKey; label: string }[] = [
    ...(hasThousands ? [{ key: "thousands" as const, label: "Thousands" }] : []),
    { key: "hundreds", label: "Hundreds" },
    { key: "tens", label: "Tens" },
    { key: "ones", label: "Ones" },
  ];

  const [values, setValues] = useState<Record<PlaceKey, string>>({
    thousands: questionData.mode === "flexible_partition" ? String(questionData.standard.thousands ?? 0) : "",
    hundreds: questionData.mode === "flexible_partition" ? String(questionData.standard.hundreds) : "",
    tens: "0",
    ones: "0",
  });

  function setValue(key: PlaceKey, next: string) {
    setValues((current) => ({
      ...current,
      [key]: next.replace(/[^\d]/g, ""),
    }));
  }

  function numericValue(key: PlaceKey) {
    return Number(values[key] || "0");
  }

  function check() {
    const thousands = numericValue("thousands");
    const hundreds = numericValue("hundreds");
    const tens = numericValue("tens");
    const ones = numericValue("ones");
    const sum = thousands + hundreds + tens + ones;

    const std = questionData.standard;
    const stdThousands = std.thousands ?? 0;

    const isCorrect =
      questionData.mode === "flexible_partition"
        ? sum === questionData.target &&
          (thousands !== stdThousands ||
            hundreds !== std.hundreds ||
            tens !== std.tens ||
            ones !== std.ones)
        : thousands === stdThousands &&
          hundreds === std.hundreds &&
          tens === std.tens &&
          ones === std.ones;

    if (isCorrect) onCorrect?.();
    else onWrong?.();
  }

  const sum = places.reduce((s, p) => s + numericValue(p.key), 0);
  const expression = places.map((p) => numericValue(p.key)).join(" + ");

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

      <div className={`mt-6 grid gap-4 ${hasThousands ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
        {places.map((item) => (
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
          {expression} = {sum}
        </div>
        {questionData.mode === "flexible_partition" ? (
          <div className="mt-2 text-sm text-teal-800">
            Make the same total in a different way from the standard partition.
          </div>
        ) : null}
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
