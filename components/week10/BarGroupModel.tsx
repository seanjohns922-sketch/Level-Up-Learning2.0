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
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Bar model: How many altogether?
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: groups }).map((_, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 font-extrabold text-gray-700"
            >
              {perGroup}
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {Array.from({ length: groups }).map((_) => perGroup).join(" + ")}
        </div>
      </div>

      <div className="grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            type="button"
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

