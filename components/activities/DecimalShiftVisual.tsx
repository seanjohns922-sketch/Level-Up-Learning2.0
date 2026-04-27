"use client";

import type { DecimalShiftVisualData } from "@/data/activities/year2/lessonEngine";

const PLACE_COLUMNS = [
  "Thousands",
  "Hundreds",
  "Tens",
  "Ones",
  "Tenths",
  "Hundredths",
  "Thousandths",
] as const;

function mapDigitsToPlaces(value: string) {
  const [wholeRaw = "0", decimalRaw = ""] = value.split(".");
  const whole = wholeRaw.replace(/\D/g, "") || "0";
  const decimal = decimalRaw.replace(/\D/g, "");
  const wholeDigits = whole.split("");
  const decimalDigits = decimal.split("");

  const cells = {
    Thousands: "",
    Hundreds: "",
    Tens: "",
    Ones: "",
    Tenths: "",
    Hundredths: "",
    Thousandths: "",
  } as Record<(typeof PLACE_COLUMNS)[number], string>;

  const wholeTargets: Array<(typeof PLACE_COLUMNS)[number]> = ["Ones", "Tens", "Hundreds", "Thousands"];
  wholeDigits
    .slice(-4)
    .reverse()
    .forEach((digit, index) => {
      const target = wholeTargets[index];
      if (target) cells[target] = digit;
    });

  const decimalTargets: Array<(typeof PLACE_COLUMNS)[number]> = ["Tenths", "Hundredths", "Thousandths"];
  decimalDigits.slice(0, 3).forEach((digit, index) => {
    const target = decimalTargets[index];
    if (target) cells[target] = digit;
  });

  return cells;
}

function renderCellValue(value: string, hidden = false) {
  if (hidden) {
    return <span className="text-slate-300">?</span>;
  }
  if (value === "") {
    return <span className="text-slate-300">0</span>;
  }
  return value;
}

export default function DecimalShiftVisual({
  visual,
}: {
  visual: DecimalShiftVisualData;
}) {
  const before = mapDigitsToPlaces(visual.original);
  const after = visual.result ? mapDigitsToPlaces(visual.result) : null;
  const shiftLabel =
    visual.factor === 10 ? "1 place" : visual.factor === 100 ? "2 places" : "3 places";

  return (
    <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-cyan-700">
        Place Value Shift
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
        <span className="text-lg font-black text-slate-900">{visual.original}</span>
        <span className="text-cyan-700 text-xl font-black">× {visual.factor}</span>
        <span className="text-cyan-700 text-sm font-bold">
          digits shift left {shiftLabel}
        </span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[700px] rounded-2xl border border-cyan-100 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-cyan-100 bg-cyan-100/60">
            {PLACE_COLUMNS.map((place) => (
              <div
                key={place}
                className="px-2 py-2 text-center text-[11px] font-black uppercase tracking-[0.12em] text-cyan-800"
              >
                {place}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 border-b border-cyan-100">
            {PLACE_COLUMNS.map((place) => (
              <div
                key={`before-${place}`}
                className="px-2 py-3 text-center text-2xl font-black text-slate-900"
              >
                {renderCellValue(before[place])}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {PLACE_COLUMNS.map((place) => (
              <div
                key={`after-${place}`}
                className={[
                  "px-2 py-3 text-center text-2xl font-black",
                  visual.hideResult ? "text-cyan-500" : "text-slate-900",
                ].join(" ")}
              >
                {renderCellValue(after?.[place] ?? "", visual.hideResult)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
