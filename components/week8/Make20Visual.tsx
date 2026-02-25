"use client";

function TenFrame({ filled }: { filled: number }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-6 w-6 rounded-full border",
            i < filled ? "bg-indigo-500 border-indigo-600" : "bg-white border-gray-200",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

export default function Make20Visual({
  a,
  b,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  a: number;
  b: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const firstFrame = Math.min(10, a);
  const secondFrame = Math.max(0, a - 10);

  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        Make 20 using a visual.
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <div className="text-sm font-bold text-gray-600 mb-3">
          {a} + {b}
        </div>
        <div className="grid md:grid-cols-3 gap-4 items-center">
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">First number</div>
            <div className="grid gap-3">
              <TenFrame filled={firstFrame} />
              <TenFrame filled={secondFrame} />
            </div>
          </div>
          <div className="text-4xl font-black text-gray-600 text-center">+</div>
          <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Second number</div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: b }).map((_, i) => (
                <span
                  key={i}
                  className="h-6 w-6 rounded-full border border-emerald-600 bg-emerald-500"
                />
              ))}
            </div>
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
