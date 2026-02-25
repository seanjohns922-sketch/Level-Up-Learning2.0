"use client";

import { useState } from "react";
import { StaticDotRow } from "@/components/StaticDots";

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1.0;
  u.volume = 1.0;
  synth.speak(u);
}

export default function JoinStories({
  story,
  a,
  b,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  story: string;
  a: number;
  b: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [joined, setJoined] = useState(false);

  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-lg font-extrabold text-gray-900">{story}</div>
        <button
          type="button"
          onClick={() => speak(story)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        {!joined ? (
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="text-xs font-bold text-gray-600 mb-2">Group 1</div>
              <StaticDotRow
                count={a}
                dotSize={20}
                gap={6}
                activeClassName="bg-indigo-500"
                borderClassName="border border-indigo-600"
              />
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-3">
              <div className="text-xs font-bold text-gray-600 mb-2">Group 2</div>
              <StaticDotRow
                count={b}
                dotSize={20}
                gap={6}
                activeClassName="bg-emerald-500"
                borderClassName="border border-emerald-600"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Joined</div>
            <div className="grid gap-2">
              <StaticDotRow
                count={a}
                dotSize={20}
                gap={6}
                activeClassName="bg-indigo-500"
                borderClassName="border border-indigo-600"
              />
              <StaticDotRow
                count={b}
                dotSize={20}
                gap={6}
                activeClassName="bg-emerald-500"
                borderClassName="border border-emerald-600"
              />
            </div>
          </div>
        )}

        {!joined ? (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setJoined(true)}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
            >
              Join
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 text-sm font-bold text-gray-700">How many now?</div>
      <div className="mt-2 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
            type="button"
            disabled={!joined}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
