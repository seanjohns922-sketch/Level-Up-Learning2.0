"use client";

export default function CompareBars({
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
  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  const max = Math.max(a, b);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm font-bold text-gray-600 mb-2">{story}</div>
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Compare the numbers. How many more?
      </div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 grid gap-3">
        <div>
          <div className="text-xs font-bold text-gray-600 mb-2">Tom</div>
          <div className="h-6 rounded-lg bg-teal-400" style={{ width: `${(a / max) * 100}%` }} />
          <div className="text-xs text-gray-600 mt-1">{a}</div>
        </div>
        <div>
          <div className="text-xs font-bold text-gray-600 mb-2">Mia</div>
          <div className="h-6 rounded-lg bg-teal-200" style={{ width: `${(b / max) * 100}%` }} />
          <div className="text-xs text-gray-600 mt-1">{b}</div>
        </div>
        <div className="mt-2">
          <div className="text-xs font-bold text-gray-600 mb-2">Count by 1s</div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${max}, minmax(0, 1fr))`, gap: 4 }}>
            {Array.from({ length: max }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-2 w-full rounded bg-gray-200" />
                <div className="mt-1 text-[10px] text-gray-600">{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
