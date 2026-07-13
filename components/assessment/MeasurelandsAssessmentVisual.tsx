"use client";

import type { MzVisual } from "@/data/assessments/measurelandsVisuals";
import { MeasurelandsScale } from "@/components/measurelands/MeasurelandsScale";
import { MeasurelandsJug } from "@/components/measurelands/MeasurelandsJug";
import { MeasurelandsThermometer } from "@/components/measurelands/MeasurelandsThermometer";
import { MeasurelandsAngle } from "@/components/measurelands/MeasurelandsAngle";
import { ClockFace } from "@/components/measurelands/MeasurelandsAnalogClockCard";
import { MeasurelandsVolumeBuilder } from "@/components/measurelands/MeasurelandsVolumeBuilder";
import { MeasurelandsObjectArt } from "@/components/measurelands/MeasurelandsObjectArt";
import { RulerWithObject } from "@/components/measurelands/MeasurelandsRulerCard";

// Assessment visuals REUSE the real Measurelands lesson instruments so pre/post
// tests look and feel exactly like the lessons — on a parchment panel (the lesson
// surface). Golden rule: show only what the question GIVES, never the answer.

const INK = "#4a3611";
const GOLD_DEEP = "#9a7328";
const GOLD = "#c79a3e";

function Panel({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border px-4 py-4" style={{ borderColor: "rgba(184,137,58,0.4)", background: "linear-gradient(150deg,#fdf6e6,#f7ecd2)" }}>
      {label ? <div className="mb-2 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: GOLD_DEEP }}>{label}</div> : null}
      <div className="flex items-center justify-center">{children}</div>
    </div>
  );
}

// ── Rectangle (area/perimeter) — dimensions labelled, never the total. Sample
//    shapes (for "what is area/perimeter?") render label-free. ──────────────────
function RectShape({ w, h, mode, unit = "", sample = false }: { w: number; h: number; mode: string; unit?: string; sample?: boolean }) {
  const scale = 110 / Math.max(w, h), rw = w * scale, rh = h * scale, ox = (260 - rw) / 2, oy = (150 - rh) / 2;
  const u = unit ? ` ${unit}` : "";
  return (
    <svg viewBox="0 0 260 150" style={{ maxHeight: 170 }} className="w-full">
      <rect x={ox} y={oy} width={rw} height={rh} rx={3} fill={mode === "area" ? "rgba(199,154,62,0.2)" : "none"} stroke={GOLD} strokeWidth={mode === "perimeter" ? 5 : 3} />
      {sample ? null : (
        <>
          <text x={ox + rw / 2} y={oy - 8} fontSize={13} fontWeight={800} textAnchor="middle" fill={INK}>{w}{u}</text>
          <text x={ox - 10} y={oy + rh / 2} fontSize={13} fontWeight={800} textAnchor="middle" fill={INK} transform={`rotate(-90 ${ox - 10} ${oy + rh / 2})`}>{h}{u}</text>
        </>
      )}
    </svg>
  );
}

// ── Metric conversion — GIVEN value → target unit as "?" (no answer) ───────────
function Convert({ fromValue, fromUnit, toUnit }: { fromValue: number; fromUnit: string; toUnit: string }) {
  const chip = (main: string, sub: string, strong: boolean) => (
    <div className="rounded-2xl px-5 py-3 text-center" style={{ background: strong ? "rgba(199,154,62,0.16)" : "#fff8e8", border: `2px solid ${strong ? GOLD : GOLD_DEEP}` }}>
      <div className="text-3xl font-black" style={{ color: INK }}>{main}</div>
      <div className="text-sm font-bold" style={{ color: GOLD_DEEP }}>{sub}</div>
    </div>
  );
  return (
    <div className="flex items-center justify-center gap-4">
      {chip(String(fromValue), fromUnit, false)}
      <div className="text-3xl" style={{ color: GOLD_DEEP }}>→</div>
      {chip("?", toUnit, true)}
    </div>
  );
}

// ── Object cards (compare / sequence) — real art with emoji fallback ───────────
function Objects({ items, caption }: { items: Array<{ label: string; emoji: string }>; caption?: string }) {
  return (
    <div className={`grid w-full gap-3 ${items.length <= 2 ? "grid-cols-2" : items.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
      {items.map((it, i) => (
        <div key={i} className="flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center" style={{ background: "#fff8e8", border: `1px solid ${GOLD_DEEP}` }}>
          <MeasurelandsObjectArt name={it.label} emoji={it.emoji} size={54} />
          <span className="text-[12px] font-bold" style={{ color: INK }}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

const CONCEPT_ICON: Record<string, string> = {
  clock: "🕐", calendar: "📅", duration: "⏱️", convert: "🔁", tools: "🛠️", angle: "📐",
};
// Concept cards reuse the REAL instrument (shown neutral) where one exists, so
// "choose the unit / what does X measure" still looks like the lessons.
function Concept({ icon, label }: { icon: string; label: string }) {
  if (icon === "ruler") return <RulerWithObject rulerCm={12} precision />;
  if (icon === "scale") return <MeasurelandsScale value={0} unit="kg" max={5} majorStep={1} minorStep={0.5} size={210} />;
  if (icon === "jug") return <MeasurelandsJug value={0} unit="L" max={2} majorStep={1} minorStep={0.5} size={190} />;
  if (icon === "thermometer") return <MeasurelandsThermometer value={22} max={50} size={140} />;
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#fff8e8", border: `2px solid ${GOLD}` }}>
        <span className="text-4xl">{CONCEPT_ICON[icon] ?? "📐"}</span>
      </div>
      <div className="text-xl font-black" style={{ color: INK }}>{label}</div>
    </div>
  );
}

// step helpers for the reused instruments
function scaleSteps(unit: string, max: number) {
  return unit === "kg" ? { majorStep: 1, minorStep: 0.5 } : { majorStep: Math.max(100, Math.round(max / 5)), minorStep: Math.max(50, Math.round(max / 10)) };
}
function jugSteps(unit: string, max: number) {
  return unit === "L" ? { majorStep: 1, minorStep: 0.5 } : { majorStep: 250, minorStep: 125 };
}

export default function MeasurelandsAssessmentVisual({ visual }: { visual: MzVisual }) {
  switch (visual.kind) {
    case "ruler":
      return (
        <Panel label="Measure the length">
          <RulerWithObject
            rulerCm={Math.max(10, Math.ceil(visual.toCm) + 2)}
            object={{ label: "pencil", icon: "✏️", lengthCm: visual.toCm, startCm: 0 }}
            precision
          />
        </Panel>
      );
    case "scaleDial": {
      const s = scaleSteps(visual.unit, visual.max);
      return <Panel label="Read the scale"><MeasurelandsScale value={visual.value} unit={visual.unit} max={visual.max} majorStep={s.majorStep} minorStep={s.minorStep} size={230} /></Panel>;
    }
    case "jug": {
      const s = jugSteps(visual.unit, visual.max);
      return <Panel label="Read the jug"><MeasurelandsJug value={visual.value} unit={visual.unit} max={visual.max} majorStep={s.majorStep} minorStep={s.minorStep} size={210} /></Panel>;
    }
    case "thermometer":
      return <Panel label="Read the temperature"><MeasurelandsThermometer value={visual.value} max={Math.max(50, Math.ceil((visual.value + 5) / 10) * 10)} size={150} /></Panel>;
    case "clock":
      return <Panel label="Read the clock"><ClockFace hour={visual.hour} minute={visual.minute} size={220} /></Panel>;
    case "angle": {
      const known = visual.known ?? visual.single ?? 45;
      // The given angle as two rays + shaded turn-arc, sitting on a horizontal
      // base (reads as "on a straight line"). The unknown stays unshown.
      return <Panel label="Angle reasoning"><MeasurelandsAngle kind="angle" turn={known} rot={0} rightMark={visual.single === 90} size={240} /></Panel>;
    }
    case "cubes":
      return <Panel label="Picture the prism"><MeasurelandsVolumeBuilder dims={{ l: visual.l, w: visual.w, h: visual.h }} cubes={[]} outline size={240} /></Panel>;
    case "rectangle":
      return <Panel label={visual.mode === "perimeter" ? "Distance around the edge" : "Space inside"}><RectShape w={visual.w} h={visual.h} mode={visual.mode} unit={visual.unit} sample={visual.sample} /></Panel>;
    case "convert":
      return <Panel label="Convert the unit"><Convert fromValue={visual.fromValue} fromUnit={visual.fromUnit} toUnit={visual.toUnit} /></Panel>;
    case "objects":
      return <Panel label={visual.caption ?? "Look at each one"}><Objects items={visual.items} caption={visual.caption} /></Panel>;
    case "concept":
      return <Panel><Concept icon={visual.icon} label={visual.label} /></Panel>;
    default:
      return null;
  }
}
