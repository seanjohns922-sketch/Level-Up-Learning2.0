"use client";

import { useState } from "react";
import { ClickableDotRow } from "@/components/ClickableDots";

export default function GroupBoxesInput({
  total,
  groups,
  onCorrect,
  onWrong,
}: {
  total: number;
  groups: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [typed, setTyped] = useState("");
  const answer = Math.floor(total / groups);
  const remainder = total % groups;

  function check() {
    const n = Number(typed);
    const ok = n === answer;
    if (ok) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        {total} shared into {groups} groups (diagram).
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {Array.from({ length: groups }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Group {i + 1}</div>
            <ClickableDotRow count={answer} dotSize={16} gap={6} />
          </div>
        ))}
      </div>

      {remainder > 0 ? (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="text-xs font-bold text-amber-800 mb-2">Leftover</div>
          <ClickableDotRow
            count={remainder}
            dotSize={16}
            gap={6}
            activeClassName="bg-amber-500"
            borderClassName="border border-amber-300"
          />
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
          placeholder="How many in each?"
          className="w-full max-w-xs px-4 py-3 rounded-xl border border-gray-300 text-lg font-bold"
        />
        <button
          onClick={check}
          className="px-5 py-3 rounded-xl bg-teal-600 text-white font-extrabold hover:bg-teal-700 transition"
          type="button"
        >
          Check
        </button>
      </div>
    </div>
  );
}
