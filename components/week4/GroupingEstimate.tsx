"use client";

export default function GroupingEstimate({
  tensGroups,
  ones,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  tensGroups: number;
  ones: number;
  options: string[];
  answer: string;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-600 mb-2">Fast grouping</div>
      <div className="text-2xl font-extrabold text-gray-900 mb-4">
        What number is shown?
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 mb-4">
        <div className="grid gap-2 mb-3">
          {Array.from({ length: tensGroups }).map((_, gi) => (
            <div key={gi} className="flex gap-1">
              {Array.from({ length: 10 }).map((__, di) => (
                <span
                  key={di}
                  className="inline-block h-4 w-4 rounded-full bg-indigo-600"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: ones }).map((_, oi) => (
            <span
              key={oi}
              className="inline-block h-4 w-4 rounded-full bg-amber-500"
            />
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {options.map((opt, idx) => (
          <button
            key={`${opt}-${idx}`}
            onClick={() => {
              if (opt === answer) onCorrect?.();
              else onWrong?.();
            }}
            className="w-full text-left px-5 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition text-xl font-bold"
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
