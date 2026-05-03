"use client";

import { useState } from "react";
import { speak } from "@/lib/speak";

export default function StoryOpChoice({
  story,
  answer,
  variant,
  onCorrect,
  onWrong,
}: {
  story: string;
  answer: "add" | "subtract";
  variant: "choice" | "sort";
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<"add" | "subtract" | null>(null);

  function choose(v: "add" | "subtract") {
    setPicked(v);
    if (v === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-sm font-bold text-gray-600">
          {variant === "sort" ? "Sort the story" : "Choose the operation"}
        </div>
        <button
          onClick={() => speak(story)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
          type="button"
        >
          🔊 Read
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800">
        {story}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <button
          onClick={() => choose("add")}
          className={[
            "px-5 py-4 rounded-2xl border text-lg font-black transition",
            picked === "add"
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
          type="button"
        >
          ➕ {variant === "sort" ? "Addition Box" : "Add"}
        </button>
        <button
          onClick={() => choose("subtract")}
          className={[
            "px-5 py-4 rounded-2xl border text-lg font-black transition",
            picked === "subtract"
              ? "border-rose-500 bg-rose-50"
              : "border-gray-200 hover:bg-gray-50",
          ].join(" ")}
          type="button"
        >
          ➖ {variant === "sort" ? "Subtraction Box" : "Subtract"}
        </button>
      </div>
    </div>
  );
}
