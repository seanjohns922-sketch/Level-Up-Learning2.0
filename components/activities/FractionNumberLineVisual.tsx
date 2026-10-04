"use client";

import { useState } from "react";
import { FractionText } from "@/components/FractionText";
import type { FractionNumberLineVisualData } from "@/data/activities/year2/lessonEngine";
import { getRealmTheme } from "@/lib/useRealmTheme";

function parseFractionValue(label: string) {
  const trimmed = label.trim();
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedMatch) {
    const whole = Number(mixedMatch[1]);
    const numerator = Number(mixedMatch[2]);
    const denominator = Number(mixedMatch[3]);
    if (!Number.isFinite(whole) || !Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return whole + numerator / denominator;
  }

  const simpleMatch = trimmed.match(/^(\d+)\/(\d+)$/);
  if (simpleMatch) {
    const numerator = Number(simpleMatch[1]);
    const denominator = Number(simpleMatch[2]);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return null;
    }
    return numerator / denominator;
  }

  const wholeValue = Number(trimmed);
  return Number.isFinite(wholeValue) ? wholeValue : null;
}

function clampRange(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function FractionNumberLineVisual({
  visual,
  interactive = false,
  previewLabel,
  lockedLabels = [],
  successLabel,
  wrongLabel,
}: {
  visual: FractionNumberLineVisualData;
  interactive?: boolean;
  previewLabel?: string | null;
  lockedLabels?: string[];
  successLabel?: string | null;
  wrongLabel?: string | null;
}) {
  const min = visual.min ?? 0;
  const max = Math.max(min + 1, visual.max ?? visual.maxValue ?? 1);
  const subdivisions = visual.subdivisions;
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const getPercent = (value: number) => {
    const clamped = clampRange(value, min, max);
    return ((clamped - min) / (max - min)) * 100;
  };

  const markers =
    Array.isArray(visual.markers) && visual.markers.length > 0
      ? visual.markers.map((marker) => {
          const rawValue = marker.value ?? marker.position ?? parseFractionValue(marker.label) ?? 0;
          return {
            ...marker,
            rawValue,
            left: getPercent(rawValue),
            tone: marker.tone ?? "sky",
          };
        })
      : [
          {
            label: visual.leftLabel,
            rawValue: visual.leftPosition,
            left: getPercent(visual.leftPosition),
            tone: "sky" as const,
          },
          {
            label: visual.rightLabel,
            rawValue: visual.rightPosition,
            left: getPercent(visual.rightPosition),
            tone: "emerald" as const,
          },
        ];

  const previewMarker = markers.find((marker) => marker.label === previewLabel) ?? null;

  const positionedMarkers = [...markers]
    .sort((left, right) => left.left - right.left)
    .reduce<Array<(typeof markers)[number] & { lane: number }>>((acc, marker) => {
      const previous = acc[acc.length - 1];
      const tooClose = previous ? marker.left - previous.left < 8 : false;
      const lane = tooClose ? (previous.lane + 1) % 3 : 0;
      acc.push({
        ...marker,
        lane,
      });
      return acc;
    }, []);

  const activeLabel = hoveredLabel ?? previewLabel ?? successLabel ?? wrongLabel ?? null;
  const benchmarkTicks = min === 0 && max === 1 && !subdivisions ? [0.25, 1 / 3, 0.5, 2 / 3, 0.75] : [];
  const wholeTicks: number[] = [];
  for (let value = Math.ceil(min); value <= Math.floor(max); value += 1) {
    wholeTicks.push(value);
  }
  const subdivisionTicks: number[] = [];
  if (subdivisions && subdivisions >= 2) {
    const startWhole = Math.floor(min);
    const endWhole = Math.ceil(max);
    for (let whole = startWhole; whole < endWhole; whole += 1) {
      for (let part = 1; part < subdivisions; part += 1) {
        const value = whole + part / subdivisions;
        if (value > min && value < max) {
          subdivisionTicks.push(value);
        }
      }
    }
  }

  if (visual.jumps) {
    const jump = visual.jumps;
    const theme = getRealmTheme('number');
    const x = (value: number) => 40 + (value - min) / (max - min) * 640;
    const end = jump.start + jump.step * jump.count;
    const direction = Math.sign(jump.step);
    const ticks = Math.round((max - min) * (subdivisions ?? 1));
    return <figure className="my-5 rounded-2xl border p-4" style={{ background: theme.surfaceTint, borderColor: theme.borderRing, color: theme.ctaFrom }}>
      <figcaption className="text-center text-lg font-bold">{jump.count} {jump.count === 1 ? 'jump' : 'jumps'} {direction > 0 ? 'right' : 'left'} · each <FractionText value={jump.label} size="sm" /></figcaption>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 720 180" className="mx-auto w-full min-w-[520px] max-w-4xl" role="img" aria-label={`Number line from ${min} to ${max}. Start at P. ${jump.count} equal jumps ${direction > 0 ? 'right' : 'left'}, each ${jump.label}. The destination is marked with a question mark.`}>
          <path d="M 30 90 H 690 M 36 85 L 30 90 L 36 95 M 684 85 L 690 90 L 684 95" fill="none" stroke="currentColor" strokeWidth="2" />
          {Array.from({ length: ticks + 1 }, (_, index) => {
            const value = min + index / (subdivisions ?? 1);
            const whole = Math.abs(value - Math.round(value)) < 1e-8;
            return <g key={index}>
              <path d={`M ${x(value)} ${whole ? 81 : 85} V ${whole ? 99 : 95}`} stroke="currentColor" strokeWidth={whole ? 2 : 1} />
              {whole && <text x={x(value)} y="120" textAnchor="middle" fill="currentColor" fontSize="17">{Math.round(value)}</text>}
            </g>;
          })}
          {Array.from({ length: jump.count }, (_, index) => {
            const from = x(jump.start + index * jump.step), to = x(jump.start + (index + 1) * jump.step);
            return <g key={index} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={`M ${from} 84 C ${from} 34, ${to} 34, ${to} 80`} />
              <path d={`M ${to - 4} 73 L ${to} 81 L ${to + 4} 73`} />
            </g>;
          })}
          <circle cx={x(jump.start)} cy="90" r="5" fill="currentColor" />
          <text x={x(jump.start)} y="150" textAnchor="middle" fontWeight="bold" fontSize="20" fill="currentColor">P</text>
          <circle cx={x(end)} cy="90" r="5" fill="white" stroke="currentColor" strokeWidth="2" />
          <text x={x(end)} y="150" textAnchor="middle" fontWeight="bold" fontSize="22" fill="currentColor">?</text>
        </svg>
      </div>
    </figure>;
  }

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

          {benchmarkTicks.map((value) => (
            <div
              key={`benchmark-${value}`}
              className="absolute top-[63px] z-[5] w-px text-center"
              style={{ left: `${getPercent(value)}%`, transform: "translateX(-50%)" }}
            >
              <div className="mx-auto h-4 w-px rounded-full bg-sky-300/80" />
            </div>
          ))}

          {subdivisionTicks.map((value) => (
            <div
              key={`subdivision-${value}`}
              className="absolute top-[61px] z-[6] w-px text-center"
              style={{ left: `${getPercent(value)}%`, transform: "translateX(-50%)" }}
            >
              <div className="mx-auto h-4 w-px rounded-full bg-slate-300/80" />
            </div>
          ))}

          {wholeTicks.map((value) => (
            <div
              key={value}
              className="absolute top-[58px] z-10 w-px text-center"
              style={{ left: `${getPercent(value)}%`, transform: "translateX(-50%)" }}
            >
              <div
                className={[
                  "mx-auto rounded-full",
                  value === 0 ? "h-8 w-[3px] bg-slate-950" : "h-5 w-[2px] bg-slate-400",
                ].join(" ")}
              />
              <div
                className={[
                  "mt-2 whitespace-nowrap text-center",
                  value === 0
                    ? "text-[18px] font-extrabold text-slate-950"
                    : "text-[14px] font-bold text-slate-600",
                ].join(" ")}
              >
                {value}
              </div>
            </div>
          ))}

          {previewMarker ? (
            <div
              className="absolute z-[15] transition-all duration-150"
              style={{ left: `${previewMarker.left}%`, transform: "translateX(-50%)", top: "26px" }}
            >
              <div className="mx-auto h-8 w-8 rounded-full border-2 border-dashed border-sky-400 bg-sky-200/30 shadow-[0_0_0_10px_rgba(56,189,248,0.08)]" />
              <div className="mx-auto mt-2 h-[42px] w-px bg-gradient-to-b from-sky-300/80 to-transparent" />
            </div>
          ) : null}

          {positionedMarkers.map((marker, index) => {
            const isActive = activeLabel === marker.label;
            const isLocked = lockedLabels.includes(marker.label);
            const isSuccess = successLabel === marker.label;
            const isWrong = wrongLabel === marker.label;
            const showLabel = !interactive || isActive || isLocked;

            return (
              <div
                key={`${marker.label}-${index}`}
                className={[
                  "absolute z-20 transition-all duration-200",
                  isWrong ? "animate-pulse" : "",
                ].join(" ")}
                style={{
                  left: `${marker.left}%`,
                  transform: "translateX(-50%)",
                  top: `${18 + marker.lane * 16}px`,
                }}
              >
                <button
                  type="button"
                  onMouseEnter={() => interactive && setHoveredLabel(marker.label)}
                  onMouseLeave={() =>
                    interactive && setHoveredLabel((current) => (current === marker.label ? null : current))
                  }
                  onFocus={() => interactive && setHoveredLabel(marker.label)}
                  onBlur={() =>
                    interactive && setHoveredLabel((current) => (current === marker.label ? null : current))
                  }
                  onClick={() => interactive && setHoveredLabel((current) => (current === marker.label ? null : marker.label))}
                  className="group flex flex-col items-center outline-none"
                  aria-label={marker.label}
                >
                  <div
                    className={[
                      "mx-auto h-5 w-5 rounded-full border-2 transition-all duration-200",
                      isActive || isLocked
                        ? "shadow-[0_0_0_10px_rgba(56,189,248,0.14)] scale-110"
                        : "shadow-[0_0_0_8px_rgba(148,163,184,0.12)]",
                      isSuccess ? "border-emerald-700 bg-emerald-500 shadow-[0_0_0_12px_rgba(34,197,94,0.18)]" : "",
                      isWrong ? "border-rose-600 bg-rose-400 shadow-[0_0_0_12px_rgba(248,113,113,0.14)]" : "",
                      marker.tone === "sky"
                        ? "border-sky-700 bg-sky-500"
                        : marker.tone === "violet"
                          ? "border-violet-700 bg-violet-500"
                          : "border-emerald-700 bg-emerald-500",
                    ].join(" ")}
                  />
                  <div className="mt-2 h-[34px] w-px bg-gradient-to-b from-slate-300/80 to-transparent" />
                  <div
                    className={[
                      "mt-1 rounded-xl bg-white px-3 py-2 text-slate-950 shadow-sm ring-1 ring-slate-200 transition-all duration-150",
                      showLabel ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
                      isActive ? "ring-sky-300 shadow-[0_8px_24px_rgba(56,189,248,0.16)]" : "",
                    ].join(" ")}
                  >
                    <FractionText value={marker.label} size="sm" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
