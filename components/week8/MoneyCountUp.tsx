"use client";

import { renderCoins } from "@/components/week7/moneyAssets";

function JumpRow({ from, jump, to }: { from: number; jump: number; to: number }) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
      <div className="px-3 py-1 rounded-lg bg-gray-100">${from}</div>
      <div className="text-gray-500">→</div>
      <div className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700">+{jump}</div>
      <div className="text-gray-500">→</div>
      <div className="px-3 py-1 rounded-lg bg-gray-100">${to}</div>
    </div>
  );
}

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

export default function MoneyCountUp({
  have,
  cost,
  options,
  answer,
  onCorrect,
  onWrong,
  promptPrefix,
}: {
  have: number;
  cost: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
  promptPrefix?: string;
}) {
  const prompt = promptPrefix
    ? `${promptPrefix} You only have $${have} and the cost is $${cost}. How much more do you need?`
    : `You only have $${have} and the cost is $${cost}. How much more do you need?`;

  const jump1 = Math.min(5 - (have % 5 || 5), cost - have);
  const mid = have + jump1;
  const jump2 = cost - mid;

  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-lg font-extrabold text-gray-900">{prompt}</div>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">You have</div>
          {renderCoins(have)}
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">Cost</div>
          {renderCoins(cost)}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 mb-4 grid gap-2">
        <JumpRow from={have} jump={jump1} to={mid} />
        {jump2 > 0 ? <JumpRow from={mid} jump={jump2} to={cost} /> : null}
      </div>

      <div className="mt-2 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
            type="button"
          >
            ${opt}
          </button>
        ))}
      </div>
    </div>
  );
}
