"use client";

export default function BarGroupModel({
  groups,
  perGroup,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  groups: number;
  perGroup: number;
  options: string[];
  answer: string;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  function choose(opt: string) {
    if (opt === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="text-lg font-extrabold text-slate-900 mb-3">
        Bar model: How many altogether?
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mb-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: groups }).map((_, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-extrabold text-slate-700"
            >
              {perGroup}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {Array.from({ length: groups }).map(() => perGroup).join(" + ")}
        </div>
      </div>

      <div className="grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            type="button"
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
