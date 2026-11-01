"use client";

import { useRef, useState } from "react";
import GroundDragPiece from "@/components/ground/GroundDragPiece";
import { Rabbit, Turtle, Volume2, School, House, Sunrise, Sun, Sunset, Moon, Star, CalendarDays, ArrowLeft, ArrowRight } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { speak } from "@/lib/speak";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type MeasurelandsCompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type MeasurelandsCompareObject = MeasurelandsCompareTask["objects"][number];
type TeachingMoment = NonNullable<MeasurelandsCompareTask["teachingMoments"]>[number];

function isDescendingTarget(mode?: MeasurelandsCompareTask["targetMode"]) {
  return mode === "longest" || mode === "heaviest";
}

const ACCENT_STYLES: Record<
  MeasurelandsCompareObject["accent"],
  {
    border: string;
    glow: string;
    fill: string;
    chip: string;
    text: string;
  }
> = {
  gold: {
    border: "rgba(214, 184, 108, 0.82)",
    glow: "0 16px 36px rgba(180, 120, 20, 0.22)",
    fill: "linear-gradient(135deg, rgba(254, 240, 138, 0.96), rgba(217, 119, 6, 0.9))",
    chip: "rgba(120, 53, 15, 0.9)",
    text: "#fff8e1",
  },
  teal: {
    border: "rgba(94, 234, 212, 0.78)",
    glow: "0 16px 36px rgba(13, 148, 136, 0.2)",
    fill: "linear-gradient(135deg, rgba(153, 246, 228, 0.96), rgba(13, 148, 136, 0.92))",
    chip: "rgba(4, 120, 87, 0.92)",
    text: "#ecfeff",
  },
  violet: {
    border: "rgba(196, 181, 253, 0.82)",
    glow: "0 16px 36px rgba(109, 40, 217, 0.22)",
    fill: "linear-gradient(135deg, rgba(221, 214, 254, 0.98), rgba(109, 40, 217, 0.92))",
    chip: "rgba(76, 29, 149, 0.92)",
    text: "#f5f3ff",
  },
  rose: {
    border: "rgba(253, 164, 175, 0.82)",
    glow: "0 16px 36px rgba(225, 29, 72, 0.18)",
    fill: "linear-gradient(135deg, rgba(254, 205, 211, 0.98), rgba(244, 63, 94, 0.9))",
    chip: "rgba(159, 18, 57, 0.92)",
    text: "#fff1f2",
  },
  sky: {
    border: "rgba(125, 211, 252, 0.82)",
    glow: "0 16px 36px rgba(2, 132, 199, 0.2)",
    fill: "linear-gradient(135deg, rgba(186, 230, 253, 0.96), rgba(2, 132, 199, 0.9))",
    chip: "rgba(3, 105, 161, 0.92)",
    text: "#f0f9ff",
  },
  leaf: {
    border: "rgba(134, 239, 172, 0.82)",
    glow: "0 16px 36px rgba(21, 128, 61, 0.18)",
    fill: "linear-gradient(135deg, rgba(220, 252, 231, 0.98), rgba(34, 197, 94, 0.9))",
    chip: "rgba(22, 101, 52, 0.92)",
    text: "#f0fdf4",
  },
};

function MeasurementShell({
  badge,
  prompt,
  speakText,
  children,
}: {
  badge: string;
  prompt: string;
  speakText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="measurelands-shell space-y-4">
      <div
        className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
        style={{
          borderColor: "rgba(214,184,108,0.38)",
          background:
            "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)",
        }}
      >
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
          style={{
            background: "rgba(91,33,182,0.08)",
            border: "1px solid rgba(167,139,250,0.34)",
            color: "#5b21b6",
          }}
        >
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">
            {prompt}
          </div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function CompareVisual({
  item,
  compact = false,
  showWater = false,
  animateFill = false,
}: {
  item: MeasurelandsCompareObject | TeachingMoment["left"] | TeachingMoment["right"];
  compact?: boolean;
  /** Only capacity fill-state tasks (and the intro demo) should show liquid.
   *  Capacity compare/order tasks leave the container EMPTY so size = capacity. */
  showWater?: boolean;
  /** Intro demo only: water pours up to the brim to model "how much it can hold". */
  animateFill?: boolean;
}) {
  const accent = ACCENT_STYLES[item.accent];
  const axis = item.axis;
  const trackSize = compact ? 152 : 188;
  const fillLength = Math.round((item.compareValue / 10) * trackSize);
  const fillHeight = Math.round((item.compareValue / 10) * (compact ? 122 : 150));
  const capacityWidth = Math.round((compact ? 62 : 74) + (item.compareValue / 10) * (compact ? 34 : 44));
  const capacityHeight = Math.round((compact ? 88 : 108) + (item.compareValue / 10) * (compact ? 38 : 52));
  const waterLevel = typeof item.waterLevel === "number" ? item.waterLevel : 0;
  const waterHeight = Math.round(capacityHeight * Math.max(0, Math.min(1, waterLevel)));
  // Liquid is only drawn for fill-state tasks or the intro demo; compare/order
  // capacity cards stay empty so the container's SIZE is the only capacity cue.
  const renderWater = axis === "capacity" && (animateFill || (showWater && waterLevel > 0));
  const massTrackSize = compact ? 118 : 146;
  const massFillLength = Math.max(
    Math.round((item.compareValue / 10) * massTrackSize),
    compact ? 12 : 16,
  );
  const massPanDrop = Math.round((item.compareValue / 10) * (compact ? 12 : 16));

  const axisLabel =
    axis === "mass"
      ? "Weight"
      : axis === "length"
        ? "Length"
        : axis === "capacity"
          ? "Capacity"
          : axis === "duration"
            ? "Time"
            : axis === "day"
              ? "Day"
              : axis === "timeofday"
                ? "Time of Day"
                : axis === "calendar"
                  ? "Calendar"
                  : "Height";

  // ── Real image path ──────────────────────────────────────────────────────
  // For size attributes (length, height, capacity) the image itself scales with
  // compareValue so the SIZE carries the answer (the longest pencil looks
  // longest, the bucket looks bigger than the cup). Recognition attributes
  // (duration / day / time of day) stay a fixed size — the scene, not the
  // artwork scaling, carries the meaning.
  const sizeScaled = axis === "capacity" || axis === "length" || axis === "height";
  const imageBox = sizeScaled
    ? Math.round((compact ? 52 : 64) + (item.compareValue / 10) * (compact ? 48 : 80))
    : compact
      ? 96
      : 120;
  const isDayAxis = axis === "day";
  const isWeekendDay = isDayAxis && item.compareValue >= 5;
  const capacityGaugeWidth = compact ? 80 : 96;
  const capacityGaugeHeight = compact ? 106 : 126;

  // Fill-state tasks (scene "sort", or any task flagged `fillState`): show the
  // fixed fillable gauge with water — one consistent container so the LEVEL is
  // the only variable. Works with or without an imageSrc (the gauge is drawn).
  if (item.imageSrc || (axis === "capacity" && showWater)) {
    if (axis === "capacity" && showWater) {
      const gaugeWaterHeight = Math.round(capacityGaugeHeight * Math.max(0, Math.min(1, waterLevel)));
      return (
        <div
          className="measurelands-compare-visual rounded-[26px] border px-4 py-4 text-center"
          style={{
            borderColor: accent.border,
            background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,232,0.96))",
            boxShadow: accent.glow,
          }}
        >
          <div className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#5f4725]">
            {item.label}
          </div>
          <div className="measurelands-visual-stage flex h-[160px] items-end justify-center">
            <div
              className="relative flex items-end justify-center overflow-hidden rounded-[24px] border-[3px] border-[#ead6a8] bg-[#fffaf0] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
              style={{
                width: capacityGaugeWidth,
                height: capacityGaugeHeight,
              }}
            >
              <div
                className="absolute inset-x-0 top-[7px] border-t border-dashed"
                style={{ borderColor: "rgba(120,53,15,0.28)" }}
              />
              {renderWater ? (
                <div
                  className="absolute inset-x-0 bottom-0 rounded-b-[18px]"
                  style={{
                    height: gaugeWaterHeight,
                    background:
                      "linear-gradient(180deg, rgba(125,211,252,0.88) 0%, rgba(45,212,191,0.92) 100%)",
                    boxShadow: animateFill ? "0 -8px 18px rgba(45,212,191,0.26)" : "none",
                    transition: animateFill ? "height 0.7s ease" : undefined,
                  }}
                />
              ) : null}
            </div>
          </div>
          <div
            className="mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
            style={{ background: accent.chip, color: accent.text }}
          >
            {axisLabel}
          </div>
        </div>
      );
    }

    // Compare (A) / order (B) / sequence / intro: ONLY the flat container image.
    return (
      <div
        className="measurelands-compare-visual rounded-[26px] border px-4 py-4 text-center"
        style={{
          borderColor: accent.border,
          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,232,0.96))",
          boxShadow: accent.glow,
        }}
      >
        <div className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#5f4725]">{item.label}</div>
        <div className="measurelands-visual-stage flex h-[160px] items-end justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageSrc}
            alt={item.label}
            draggable={false}
            style={{ width: imageBox, height: imageBox, objectFit: "contain" }}
          />
        </div>
        {isDayAxis ? (
          <div className="mt-2 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 7 }, (_, index) => (
                <span
                  key={`${item.label}-day-${index}`}
                  className="rounded-full transition-all"
                  style={{
                    width: index === item.compareValue ? 14 : 8,
                    height: index === item.compareValue ? 14 : 8,
                    background: index === item.compareValue ? accent.chip : "rgba(120,53,15,0.18)",
                    boxShadow: index === item.compareValue ? accent.glow : "none",
                  }}
                />
              ))}
            </div>
            <div
              className="inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
              style={{
                background: isWeekendDay ? "rgba(91,33,182,0.12)" : "rgba(2,132,199,0.1)",
                color: isWeekendDay ? "#6d28d9" : "#075985",
                border: `1px solid ${isWeekendDay ? "rgba(167,139,250,0.34)" : "rgba(125,211,252,0.38)"}`,
              }}
            >
              {isWeekendDay ? "Weekend" : "School Day"}
            </div>
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-center gap-2">
          <div
            className="inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
            style={{ background: accent.chip, color: accent.text }}
          >
            {axisLabel}
          </div>
          {/* Read-aloud support for non-readers (Foundation): the scene does the
              work, the speaker + label are support. A span (not a button) so it
              can live inside the parent answer button; stopPropagation keeps a
              speaker tap from selecting the answer. */}
          {(axis === "duration" || axis === "day" || axis === "timeofday" || axis === "calendar") && (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Hear: ${item.label}`}
              onClick={(e) => { e.stopPropagation(); void speak(item.label, undefined, "manual"); }}
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center rounded-full border border-[#ead6a8] bg-white/80 p-1.5 text-[#5f4725] transition hover:bg-white"
            >
              <Volume2 className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="measurelands-compare-visual rounded-[26px] border px-4 py-4 text-center"
      style={{
        borderColor: accent.border,
        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,232,0.96))",
        boxShadow: accent.glow,
      }}
    >
      {axis === "mass" ? (
        // For mass, use the bar and pan position as a gentle clue:
        // heavier objects get a longer weight bar and sit slightly lower.
        <div className="measurelands-visual-stage flex h-[160px] flex-col items-center justify-end">
          <div
            className={compact ? "text-6xl" : "text-7xl sm:text-8xl"}
            style={{ transform: `translateY(${massPanDrop}px)` }}
          >
            {item.icon}
          </div>
          <div className="mb-3 mt-2 text-sm font-black uppercase tracking-[0.14em] text-[#5f4725]">
            {item.label}
          </div>
          <div className="flex w-full max-w-[180px] flex-col items-center gap-2">
            <div
              className="mx-auto h-3 rounded-full bg-[rgba(120,53,15,0.1)]"
              style={{ width: compact ? 118 : 146 }}
            >
              <div
                className="h-3 rounded-full"
                style={{
                  width: massFillLength,
                  background: accent.fill,
                  boxShadow: accent.glow,
                }}
              />
            </div>
            <div
              className="rounded-b-[14px] rounded-t-[6px] transition-all"
              style={{
                width: compact ? 78 : 96,
                height: 10,
                background: "linear-gradient(180deg, rgba(120,53,15,0.16), rgba(120,53,15,0.28))",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.28)",
                transform: `translateY(${Math.round(massPanDrop * 0.3)}px)`,
              }}
            />
          </div>
        </div>
      ) : axis === "capacity" ? (
        <>
          <div className="mb-2 text-4xl sm:text-5xl">{item.icon}</div>
          <div className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#5f4725]">
            {item.label}
          </div>
          <div className="measurelands-visual-stage flex h-[160px] items-end justify-center">
            <div
              className="relative flex items-end justify-center overflow-hidden rounded-[24px] border-[3px] border-[#ead6a8] bg-[#fffaf0] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
              style={{
                width: capacityWidth,
                height: capacityHeight,
                minWidth: compact ? 78 : 96,
              }}
            >
              {/* Brim / "full" line — marks how much the container can hold. */}
              <div
                className="absolute inset-x-0 top-[7px] border-t border-dashed"
                style={{ borderColor: "rgba(120,53,15,0.28)" }}
              />
              {/* Liquid: only for fill-state tasks (static) or the intro demo (animated). */}
              {renderWater ? (
                <div
                  className="absolute inset-x-0 bottom-0 transition-all"
                  style={{
                    height: animateFill ? capacityHeight - 7 : waterHeight,
                    background: accent.fill,
                    boxShadow: accent.glow,
                    transformOrigin: "bottom",
                    animation: animateFill ? "mzFillToBrim 3.2s ease-in-out infinite" : undefined,
                  }}
                />
              ) : null}
              <div className="pointer-events-none absolute inset-0 rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent_45%)]" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-2 text-4xl sm:text-5xl">{item.icon}</div>
          <div className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-[#5f4725]">
            {item.label}
          </div>
          {axis === "length" ? (
            <div className="mx-auto flex h-16 w-full max-w-[210px] items-center justify-start rounded-full border border-[#ead6a8] bg-[#fffaf0] px-2">
              <div
                className="rounded-full"
                style={{
                  width: fillLength,
                  minWidth: 34,
                  height: compact ? 22 : 26,
                  background: accent.fill,
                }}
              />
            </div>
          ) : (
            <div className="measurelands-visual-stage flex h-[160px] items-end justify-center">
              <div className="relative flex h-[150px] w-20 items-end justify-center rounded-[22px] border border-[#ead6a8] bg-[#fffaf0] pb-2">
                <div
                  className="rounded-t-[20px] rounded-b-[10px]"
                  style={{
                    width: compact ? 34 : 40,
                    height: fillHeight,
                    minHeight: 34,
                    background: accent.fill,
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
      <div
        className="mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
        style={{ background: accent.chip, color: accent.text }}
      >
        {axisLabel}
      </div>
    </div>
  );
}

function TeachingMomentRow({ moment }: { moment: TeachingMoment }) {
  const trioObjects = moment.objects;
  const shouldShowTeachingWater = (item: TeachingMoment["left"] | TeachingMoment["right"]) =>
    item.axis === "capacity" && typeof item.waterLevel === "number" && item.waterLevel > 0;
  return (
    <div className="rounded-[28px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-4 shadow-[0_10px_30px_rgba(91,33,182,0.06)]">
      <div className="mb-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
        {moment.title}
      </div>
      {trioObjects && trioObjects.length > 0 ? (
        <div
          className={`grid gap-3 ${trioObjects.length === 4 ? "grid-cols-2 lg:grid-cols-4" : trioObjects.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {trioObjects.map((item, index) => (
            <CompareVisual
              key={`${moment.id}-${item.label}-${index}`}
              item={{ ...item, id: `${moment.id}-${index}` }}
              compact
              showWater={shouldShowTeachingWater(item)}
              animateFill={shouldShowTeachingWater(item)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <CompareVisual
            item={moment.left}
            compact
            showWater={shouldShowTeachingWater(moment.left)}
            animateFill={shouldShowTeachingWater(moment.left)}
          />
          <CompareVisual
            item={moment.right}
            compact
            showWater={shouldShowTeachingWater(moment.right)}
            animateFill={shouldShowTeachingWater(moment.right)}
          />
        </div>
      )}
      <div className="mt-3 text-center text-sm font-semibold text-[#5f4725]">
        {moment.narration}
      </div>
    </div>
  );
}

/* Mini container glyph for fill-state bins — a small jar filled to `fill` (0..1)
   so the option visually matches the container the student is reading. */
function FillGlyph({ fill }: { fill: number }) {
  const level = Math.max(0, Math.min(1, fill));
  const waterFill = "linear-gradient(135deg, rgba(186,230,253,0.98), rgba(2,132,199,0.92))";
  return (
    <div
      className="relative overflow-hidden rounded-[14px] rounded-t-[8px] border-[3px] border-[#cbb078] bg-[#fffaf0] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
      style={{ width: 52, height: 64 }}
      aria-hidden
    >
      {/* brim / full line */}
      <div
        className="absolute inset-x-0 top-[5px] border-t border-dashed"
        style={{ borderColor: "rgba(120,53,15,0.3)" }}
      />
      {level > 0 ? (
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: level >= 1 ? "100%" : `${Math.round(level * 100)}%`,
            background: waterFill,
          }}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent_45%)]" />
    </div>
  );
}

/* ── Activity C: sort one object into the HEAVY or LIGHT basket ── */
function SortScene({
  task,
  onCorrect,
  onWrong,
}: {
  task: MeasurelandsCompareTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const item = task.objects[0];
  const bins = task.bins ?? [
    { id: "heavy", label: "Heavy", icon: "🪨" },
    { id: "light", label: "Light", icon: "🪶" },
  ];
  return (
    <MeasurementShell
      badge={task.badgeLabel ?? "Heavy or Light Sort"}
      prompt={task.prompt}
      speakText={task.speakText ?? task.prompt}
    >
      {item ? (
        <div className="mx-auto max-w-[260px]">
          <GroundDragPiece
            label={`Drag ${item.label} to a basket`}
            className="w-full rounded-[28px]"
            onPlace={(target) => { if (target) (target === task.correctOptionId ? onCorrect() : onWrong()); }}
          >
            <CompareVisual item={item} showWater />
          </GroundDragPiece>
        </div>
      ) : null}
      {bins.every((bin) => ["morning", "afternoon", "evening", "night"].includes(String(bin.icon))) ? <SunSlider bins={bins} onChoose={(id) => (id === task.correctOptionId ? onCorrect() : onWrong())} /> : <div className={`mt-4 grid gap-4 ${bins.length >= 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2"}`}>
        {bins.map((bin) => (
          <div key={bin.id} className="relative" data-ground-drop={bin.id}>
            <button
              type="button"
              onClick={() => (bin.id === task.correctOptionId ? onCorrect() : onWrong())}
              className="flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-[26px] border-2 transition hover:-translate-y-1 active:scale-[0.98]"
              style={{
                borderColor: "rgba(214,184,108,0.6)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,232,0.96))",
              }}
            >
              {typeof bin.fill === "number" ? (
                <FillGlyph fill={bin.fill} />
              ) : bin.icon === "quick" ? (
                <Rabbit className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "slow" ? (
                <Turtle className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "weekday" ? (
                <School className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "weekend" ? (
                <House className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "morning" ? (
                <Sunrise className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "afternoon" ? (
                <Sun className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "evening" ? (
                <Sunset className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "night" ? (
                <Moon className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "today" ? (
                <Star className="h-12 w-12 text-[#f6b93b]" fill="#f6b93b" />
              ) : bin.icon === "another-day" ? (
                <CalendarDays className="h-12 w-12 text-[#5f4725]" />
              ) : bin.icon === "yesterday" ? (
                <ArrowLeft className="h-12 w-12 text-[#7c8794]" />
              ) : bin.icon === "tomorrow" ? (
                <ArrowRight className="h-12 w-12 text-[#34616f]" />
              ) : (
                <span className="text-5xl sm:text-6xl">{bin.icon}</span>
              )}
              <span className="text-base font-black uppercase tracking-[0.14em] text-[#5f4725]">{bin.label}</span>
            </button>
            <OptionReadAloudButton text={bin.label} className="absolute right-3 top-3 z-10" />
          </div>
        ))}
      </div>}
    </MeasurementShell>
  );
}

/* ── Activity A & B: tap objects into the correct order (Prep-friendly drag) ── */
function OrderScene({
  task,
  onCorrect,
  onWrong,
}: {
  task: MeasurelandsCompareTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const orderedIds = task.orderedIds ?? task.objects.map((o) => o.id);
  const slotCount = orderedIds.length;
  const descending = isDescendingTarget(task.targetMode);
  const axis = task.objects[0]?.axis;
  const isMass = axis === "mass";
  const isCapacity = axis === "capacity";
  // Ordering by fill level (Lesson 3) uses fullness labels, not size labels.
  const isFill = Boolean(task.fillState);
  // Ordering days / times of day uses positional labels (First → Last).
  const isDay = axis === "day" || axis === "timeofday";
  const slotLabels = task.orderLabels && task.orderLabels.length === slotCount
    ? task.orderLabels
    : isDay
    ? orderedIds.map((_, i) => (i === 0 ? "First" : i === slotCount - 1 ? "Last" : "Next"))
    : isFill
    ? slotCount === 3
      ? ["Empty", "Middle", "Full"]
      : ["Empty", "Next", "Next", "Full"]
    : slotCount === 3
      ? isMass
        ? descending
          ? ["Heaviest", "Middle", "Lightest"]
          : ["Lightest", "Middle", "Heaviest"]
        : isCapacity
          ? descending
            ? ["Holds More", "Middle", "Holds Less"]
            : ["Holds Less", "Middle", "Holds More"]
          : descending
          ? ["Longest", "Middle", "Shortest"]
          : ["Shortest", "Middle", "Longest"]
      : isMass
        ? descending
          ? ["Heaviest", "Next", "Next", "Lightest"]
          : ["Lightest", "Next", "Next", "Heaviest"]
        : isCapacity
          ? descending
            ? ["Largest Capacity", "Next", "Next", "Smallest Capacity"]
            : ["Smallest Capacity", "Next", "Next", "Largest Capacity"]
          : orderedIds.map((_, i) => `#${i + 1}`);

  const [placed, setPlaced] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);

  const byId = (id: string) => task.objects.find((o) => o.id === id)!;
  const bank = task.objects.filter((o) => !placed.includes(o.id));

  function placeObject(id: string) {
    if (locked || placed.includes(id) || placed.length >= slotCount) return;
    const next = [...placed, id];
    setPlaced(next);
    if (next.length === slotCount) {
      const correct = next.every((pid, i) => pid === orderedIds[i]);
      setLocked(true);
      if (correct) {
        window.setTimeout(() => onCorrect(), 450);
      } else {
        setShake(true);
        window.setTimeout(() => onWrong(), 700);
      }
    }
  }

  function removeFromSlot(index: number) {
    if (locked) return;
    setPlaced((current) => current.filter((_, i) => i !== index));
  }

  const allCorrect = locked && placed.every((pid, i) => pid === orderedIds[i]);

  return (
    <MeasurementShell
      badge={task.badgeLabel ?? "Meazurex's Sorting Machine"}
      prompt={task.prompt}
      speakText={task.speakText ?? task.prompt}
    >
      {/* Ordered slots */}
      <div
        data-ground-drop="order-slots"
        data-day-train={isDay ? "true" : undefined}
        className={`measurelands-order-slots grid gap-3 ${slotCount === 4 ? "md:grid-cols-4" : "md:grid-cols-3"} ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
      >
        {Array.from({ length: slotCount }).map((_, index) => {
          const id = placed[index];
          const item = id ? byId(id) : null;
          const slotState =
            locked && id ? (id === orderedIds[index] ? "right" : "wrong") : "idle";
          return (
            <div key={index} className="text-center">
              <div className="mb-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#7c3aed]">
                {slotLabels[index]}
              </div>
              <button
                type="button"
                onClick={() => id && removeFromSlot(index)}
                className="measurelands-order-slot w-full rounded-[26px] border-2 border-dashed p-1 transition"
                style={{
                  borderColor:
                    slotState === "right"
                      ? "rgba(34,197,94,0.8)"
                      : slotState === "wrong"
                      ? "rgba(244,63,94,0.8)"
                      : "rgba(167,139,250,0.5)",
                  background: id ? "transparent" : "rgba(167,139,250,0.06)",
                  minHeight: "var(--measurelands-order-slot-height, 210px)",
                }}
              >
                {item ? (
                  <CompareVisual item={item} compact showWater={isFill} />
                ) : (
                  <div className="measurelands-empty-slot flex h-[200px] items-center justify-center text-5xl text-[#c4b5fd]">
                    {index + 1}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Object bank */}
      <div className="measurelands-option-bank mt-4 rounded-[26px] border border-[rgba(214,184,108,0.34)] bg-[rgba(255,252,245,0.92)] p-3">
        <div className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-[#5f4725]">
          {bank.length > 0 ? "Drag each one into place" : allCorrect ? "Perfect order!" : "Tap a slot to undo"}
        </div>
        <div className={`grid gap-3 ${slotCount === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          {bank.map((item) => (
            <div key={item.id} className="relative">
              <GroundDragPiece
                label={`Place ${item.label}`}
                disabled={locked}
                onPlace={(target) => { if (target === "order-slots" || target === null) placeObject(item.id); }}
                className="w-full rounded-[28px] border border-transparent transition focus:outline-none focus:ring-4"
              >
                <CompareVisual item={item} compact showWater={isFill} />
              </GroundDragPiece>
              <OptionReadAloudButton text={item.label} className="absolute right-3 top-3 z-10" />
            </div>
          ))}
          {bank.length === 0 && !allCorrect ? (
            <div className="col-span-full text-center text-sm font-semibold text-[#9f1239]">
              Not quite — let&apos;s try again.
            </div>
          ) : null}
        </div>
      </div>
    </MeasurementShell>
  );
}

/* ── Activity C: which object continues the length sequence? ── */
function SequenceScene({
  task,
  onCorrect,
  onWrong,
}: {
  task: MeasurelandsCompareTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const prefix = task.sequencePrefix ?? [];
  const axis = (prefix[0] ?? task.objects[0])?.axis;
  const isFill = Boolean(task.fillState);
  const sequenceHint =
    axis === "mass"
      ? "Look at the pattern. They are getting heavier. Which object comes next?"
      : "Look at the pattern. They are getting bigger. Which object comes next?";
  return (
    <MeasurementShell
      badge={task.badgeLabel ?? "Which Comes Next?"}
      prompt={task.prompt}
      speakText={task.speakText ?? sequenceHint}
    >
      {/* The growing sequence with a mystery slot */}
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.34)] bg-[rgba(255,252,245,0.92)] p-3">
        <div className="grid items-center gap-3" style={{ gridTemplateColumns: `repeat(${prefix.length + 1}, minmax(0, 1fr))` }}>
          {prefix.map((item) => (
            <CompareVisual key={item.id} item={item} compact showWater={isFill} />
          ))}
          <div
            className="measurelands-sequence-slot flex h-[220px] items-center justify-center rounded-[26px] border-2 border-dashed text-6xl font-black text-[#c4b5fd]"
            style={{ borderColor: "rgba(167,139,250,0.5)", background: "rgba(167,139,250,0.06)" }}
          >
            ?
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="measurelands-option-bank mt-4 grid gap-4 md:grid-cols-3">
        {task.objects.map((item) => (
          <div key={item.id} className="relative">
            <button
              type="button"
              onClick={() => (item.id === task.correctOptionId ? onCorrect() : onWrong())}
              className="w-full rounded-[28px] border border-transparent transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
            >
              <CompareVisual item={item} compact showWater={isFill} />
            </button>
            <OptionReadAloudButton text={item.label} className="absolute right-3 top-3 z-10" />
          </div>
        ))}
      </div>
    </MeasurementShell>
  );
}

/** Ground comparisons: the child carries the answer to a small scene, which then acts it out. */
function PairStage({ axis, acted }: { axis?: string; acted: boolean }) {
  const label = axis === "mass" ? "Put it on the scale" : axis === "capacity" ? "Bring it to the tap" : axis === "duration" ? "Bring it to the race" : "Bring it to the start line";
  return <div data-ground-drop="pair-stage" className="relative mb-4 flex min-h-[116px] items-center justify-center overflow-hidden rounded-[26px] border-4 border-dashed border-[#d6b86c] bg-[#fff5dc]">
    {axis === "mass" ? <svg viewBox="0 0 240 100" aria-hidden="true" className="h-24 w-56"><path d="M120 34v58M84 94h72" stroke="#3c2a63" strokeWidth="7" strokeLinecap="round" /><g className="transition-transform duration-500" style={{ transform: acted ? "rotate(-10deg)" : "none", transformOrigin: "120px 34px" }}><path d="M36 34h168" stroke="#3c2a63" strokeWidth="7" strokeLinecap="round" /><path d="M18 52h36l-7 16H25zM186 52h36l-7 16h-22z" fill="#a78bfa" stroke="#3c2a63" strokeWidth="3" /></g></svg>
    : axis === "capacity" ? <svg viewBox="0 0 200 100" aria-hidden="true" className="h-24 w-48"><path d="M20 14h90q14 0 14 14v14" fill="none" stroke="#8f98a8" strokeWidth="13" /><path d="M124 48v42" stroke="#5cc4ee" strokeWidth="7" strokeLinecap="round" className={acted ? "opacity-100" : "opacity-0"} /></svg>
    : axis === "duration" ? <div className="h-6 w-3/4 overflow-hidden rounded-full bg-white"><div className="h-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-700" style={{ width: acted ? "100%" : "4%" }} /></div>
    : <div className="absolute inset-y-2 left-6 w-2 rounded bg-[#3c2a63]" />}
    <span className="absolute bottom-1 text-sm font-black text-[#5f4725]">{label}</span>
  </div>;
}

/** Ground times of day: the sun moves across the sky and the child stops it at the right part of the day. */
function SunSlider({ bins, onChoose }: { bins: NonNullable<MeasurelandsCompareTask["bins"]>; onChoose: (id: string) => void }) {
  const [spot, setSpot] = useState(0);
  const sky = useRef<HTMLDivElement>(null);
  const move = (x: number) => { const r = sky.current?.getBoundingClientRect(); if (r) setSpot(Math.max(0, Math.min(bins.length - 1, Math.floor(((x - r.left) / r.width) * bins.length)))); };
  const colours = ["#ffd9a8", "#8fd3ff", "#ff9d6e", "#1e2a5a"];
  return <div className="mt-4">
    <div ref={sky} data-sun-sky role="slider" tabIndex={0} aria-label="Time of day" aria-valuemin={1} aria-valuemax={bins.length} aria-valuenow={spot + 1} aria-valuetext={bins[spot]?.label}
      onKeyDown={(e) => { if (e.key === "ArrowRight") setSpot((v) => Math.min(bins.length - 1, v + 1)); if (e.key === "ArrowLeft") setSpot((v) => Math.max(0, v - 1)); }}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); move(e.clientX); }} onPointerMove={(e) => { if (e.buttons || e.pointerType === "touch") move(e.clientX); }}
      className="relative h-36 cursor-grab touch-none select-none overflow-hidden rounded-[26px] transition-colors duration-300" style={{ background: colours[spot] ?? colours[0] }}>
      <span className="absolute h-20 w-20 -translate-x-1/2 rounded-full shadow-lg transition-all duration-200" style={{ left: `${((spot + .5) / bins.length) * 100}%`, top: `${16 + Math.abs(spot - (bins.length - 1) / 2) * 22}px`, background: spot === bins.length - 1 ? "#e5e7eb" : "radial-gradient(circle at 35% 30%,#fff3a0,#ffc62e 65%,#f08c00)" }} />
    </div>
    <div className="mt-3 flex flex-wrap items-center justify-center gap-4"><span className="text-3xl font-black text-[#3c2a63]">{bins[spot]?.label}</span>
      <button type="button" onClick={() => onChoose(bins[spot]!.id)} className="min-h-16 rounded-2xl px-10 text-xl font-black text-[#fff8e1]" style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96))" }}>This one</button></div>
  </div>;
}

/** Ground Filling the Springs: the child makes the water level instead of only spotting it. */
const FILL_MARKS = [0, 0.18, 0.5, 0.82, 1];
function FillDragScene({ task, onCorrect, onWrong }: { task: MeasurelandsCompareTask; onCorrect: () => void; onWrong: () => void }) {
  const target = task.objects.find((o) => o.id === task.correctOptionId)?.waterLevel ?? 0.5;
  const word = target === 0 ? "empty" : target < 0.3 ? "nearly empty" : target < 0.7 ? "half full" : target < 1 ? "nearly full" : "full";
  const prompt = `Drag the water until the spring is ${word}.`;
  const [level, setLevel] = useState(target < 0.3 ? 1 : 0);
  const track = useRef<HTMLDivElement>(null);
  const setFrom = (y: number) => { const r = track.current?.getBoundingClientRect(); if (r) setLevel(Math.max(0, Math.min(1, (r.bottom - y) / r.height))); };
  const nearest = FILL_MARKS.reduce((a, b) => (Math.abs(b - level) < Math.abs(a - level) ? b : a));
  return <MeasurementShell badge={task.badgeLabel ?? "Fill the Spring"} prompt={prompt} speakText={prompt}>
    <div className="flex flex-wrap items-center justify-center gap-6 rounded-[26px] bg-[#e8f7ff] p-4">
      <div className="relative h-64 w-44 overflow-hidden rounded-b-[34px] border-[6px] border-t-0 border-[#3c2a63] bg-white/70"><div className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-sky-300 to-blue-600" style={{ height: `${level * 100}%` }} /></div>
      <div ref={track} data-fill-track role="slider" tabIndex={0} aria-label="Water level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level * 100)}
        onKeyDown={(e) => { if (e.key === "ArrowUp") setLevel((v) => Math.min(1, v + 0.05)); if (e.key === "ArrowDown") setLevel((v) => Math.max(0, v - 0.05)); }}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setFrom(e.clientY); }}
        onPointerMove={(e) => { if (e.buttons || e.pointerType === "touch") setFrom(e.clientY); }}
        className="relative h-64 w-20 cursor-grab touch-none select-none">
        <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 rounded-full bg-[#caa55c]" />
        <div className="absolute left-1/2 h-20 w-20 -translate-x-1/2 translate-y-1/2 rounded-full shadow-lg" style={{ bottom: `${level * 100}%`, background: "radial-gradient(circle at 35% 30%,#ffe29c,#ffb12e 60%,#c76f00)" }} />
      </div>
      <button type="button" onClick={() => (nearest === target ? onCorrect() : onWrong())} className="min-h-20 rounded-2xl px-10 text-2xl font-black text-[#fff8e1]" style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96))" }}>Check</button>
    </div>
  </MeasurementShell>;
}

/** One teaching moment at a time, so young students never have to scroll to reach the button. */
function IntroMoments({ moments, onDone, header }: { moments: NonNullable<MeasurelandsCompareTask["teachingMoments"]>; onDone: () => void; header: React.ReactNode }) {
  const [page, setPage] = useState(0);
  const moment = moments[page];
  const last = page >= moments.length - 1;
  return (
    <>
      {page === 0 ? header : null}
      {moment ? <TeachingMomentRow key={moment.id} moment={moment} /> : null}
      <div className="mt-5 flex items-center justify-center gap-4">
        {moments.length > 1 ? <span className="flex gap-2" aria-label={`Example ${page + 1} of ${moments.length}`}>{moments.map((m, i) => <span key={m.id} className={`h-3 w-3 rounded-full ${i === page ? "bg-[#78350f]" : "bg-[#e5d3a8]"}`} />)}</span> : null}
        <button
          type="button"
          onClick={() => (last ? onDone() : setPage((value) => value + 1))}
          className="min-h-16 rounded-full px-8 py-3 text-xl font-black uppercase tracking-[0.1em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)] transition hover:brightness-110"
          style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}
        >
          {last ? "Start Exploring" : "Next"}
        </button>
      </div>
    </>
  );
}

export function MeasurelandsCompareTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: MeasurelandsCompareTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  // Tied to the task, so a finished animation never carries into the next question.
  const [actedOn, setActedOn] = useState<{ task: MeasurelandsCompareTask; id: string } | null>(null);
  const acted = actedOn?.task === task ? actedOn.id : null;
  if (task.scene === "trio" && task.fillState) {
    return <FillDragScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
  if (task.scene === "sort") {
    return <SortScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
  if (task.scene === "order") {
    return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
  if (task.scene === "sequence") {
    return <SequenceScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
  if (task.scene === "intro") {
    return (
      <MeasurementShell
        badge={task.badgeLabel ?? "Meazurex Mission"}
        prompt={task.prompt}
        speakText={task.speakText ?? task.prompt}
      >
        <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-3 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
          <IntroMoments moments={task.teachingMoments ?? []} onDone={onCorrect} header={
          <div className="mb-3 flex items-start gap-3 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-3xl shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
              {task.introIcon ?? "⏳"}
            </div>
            <div className="space-y-1">
              <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">
                Meazurex
              </div>
              {(task.introBody ?? [
                "The Fog of Forgetfulness has mixed up all the lengths in Length Lands.",
                "Some things are longer. Some things are shorter. Some things are taller.",
                "Let's become Length Explorers and compare carefully.",
              ]).map((line, i) => (
                <p
                  key={i}
                  className={`text-base font-semibold leading-snug ${i === 0 ? "text-[#2c1c07]" : "text-[#5f4725]"}`}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>
          } />
        </div>
      </MeasurementShell>
    );
  }

  const promptVerb = task.targetMode === "taller" ? "Which is taller?" : task.prompt;
  const playable = task.scene === "pair";
  const pick = (id: string) => {
    if (id !== task.correctOptionId) return onWrong();
    if (!playable && task.objects[0]?.axis !== "day") return onCorrect();
    setActedOn({ task, id });
    window.setTimeout(onCorrect, 750);
  };

  return (
    <MeasurementShell
      badge={task.badgeLabel ?? "Length Explorer"}
      prompt={promptVerb}
      speakText={task.speakText ?? promptVerb}
    >
      {playable ? <PairStage axis={task.objects[0]?.axis} acted={acted !== null} /> : null}
      <div
        className={`grid gap-4 ${task.scene === "trio" ? "md:grid-cols-3" : "md:grid-cols-2"}`}
      >
        {task.objects.map((item) => (
          <div key={item.id} className="relative" data-ground-flip={acted === item.id && item.axis === "day" ? "" : undefined}>
            {playable ? <GroundDragPiece
              label={`Choose ${item.label}`}
              className="w-full rounded-[28px]"
              onPlace={(target) => { if (target === "pair-stage" || target === null) pick(item.id); }}
            >
              <CompareVisual item={item} showWater={Boolean(task.fillState)} />
            </GroundDragPiece> : <button
              type="button"
              onClick={() => pick(item.id)}
              className="group w-full rounded-[28px] border border-transparent text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(124,58,237,0.3)]"
            >
              <CompareVisual item={item} showWater={Boolean(task.fillState)} />
            </button>}
            <OptionReadAloudButton text={item.label} className="absolute right-3 top-3 z-10" />
          </div>
        ))}
      </div>
    </MeasurementShell>
  );
}
