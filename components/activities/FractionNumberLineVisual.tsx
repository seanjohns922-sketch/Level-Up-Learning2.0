"use client";

import { FractionText } from "@/components/FractionText";
import type { FractionNumberLineVisualData } from "@/data/activities/year2/lessonEngine";

function clampUnit(value: number) {
  return Math.min(1, Math.max(0, value));
}

export default function FractionNumberLineVisual({
  visual,
}: {
  visual: FractionNumberLineVisualData;
}) {
  const maxValue = Math.max(1, visual.maxValue ?? 1);
  const markers =
    Array.isArray(visual.markers) && visual.markers.length > 0
      ? visual.markers.map((marker) => ({
          ...marker,
          left: clampUnit(marker.position / maxValue) * 100,
          tone: marker.tone ?? "sky",
        }))
      : [
          {
            label: visual.leftLabel,
            left: clampUnit(visual.leftPosition / maxValue) * 100,
            tone: "sky" as const,
          },
          {
            label: visual.rightLabel,
            left: clampUnit(visual.rightPosition / maxValue) * 100,
            tone: "emerald" as const,
          },
        ];

  return (
    <div className="mt-5 rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(239,246,255,0.92)_55%,_rgba(224,242,254,0.92))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
        {visual.title ?? "Fraction number line"}
      </div>
      <div className="mt-4 rounded-[28px] bg-white px-8 py-8 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
        <div className="relative h-[170px]">
          <div className="absolute left-0 right-0 top-[72px] h-[3px] bg-slate-800" />
          <div className="absolute left-[-1px] top-[66px] h-0 w-0 border-y-[7px] border-y-transparent border-r-[11px] border-r-slate-800" />
          <div className="absolute right-[-1px] top-[66px] h-0 w-0 border-y-[7px] border-y-transparent border-l-[11px] border-l-slate-800" />

          {Array.from({ length: maxValue + 1 }, (_, index) => index).map((value) => (
            <div
              key={value}
              className="absolute top-[58px] z-10 w-px text-center"
              style={{ left: `${(value / maxValue) * 100}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={[
                  "mx-auto rounded-full",
                  value === 0 ? "h-8 w-[3px] bg-slate-950" : "h-5 w-[2px] bg-slate-400",
                ].join(" ")}
              />
              <div
                className={[
                  "mt-2 -translate-x-1/2 whitespace-nowrap text-center",
                  value === 0
                    ? "text-[18px] font-extrabold text-slate-950"
                    : "text-[14px] font-bold text-slate-600",
                ].join(" ")}
              >
                {value}
              </div>
            </div>
          ))}

          {markers.map((marker, index) => (
            <div
              key={`${marker.label}-${index}`}
              className="absolute z-20"
              style={{ left: `${marker.left}%`, transform: "translateX(-50%)", top: "18px" }}
            >
              <div
                className={[
                  "mx-auto h-5 w-5 rounded-full border-2 shadow-[0_0_0_8px_rgba(148,163,184,0.12)]",
                  marker.tone === "sky"
                    ? "border-sky-700 bg-sky-500"
                    : marker.tone === "violet"
                      ? "border-violet-700 bg-violet-500"
                    : "border-emerald-700 bg-emerald-500",
                ].join(" ")}
              />
              <div className="mt-3 flex justify-center">
                <div className="rounded-xl bg-white px-3 py-2 text-slate-950 shadow-sm ring-1 ring-slate-200">
                  <FractionText value={marker.label} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
