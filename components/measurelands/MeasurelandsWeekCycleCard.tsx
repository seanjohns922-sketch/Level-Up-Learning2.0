"use client";

import { useState } from "react";
import { Compass, ArrowRight, RotateCw, Sun, Leaf, Wind, Cloud, Snowflake, Sprout, TreePine, Gift } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type WeekTask = Extract<PracticeTask, { kind: "weekCycle" }>;
type DayCard = { id: string; imageSrc?: string; label: string };

const MONTH_VISUALS: Record<
  string,
  {
    Icon: typeof Sun;
    bg: string;
    icon: string;
    ring: string;
    accent: string;
    cue: string;
  }
> = {
  January: { Icon: Sun, bg: "linear-gradient(135deg,#fde68a,#f59e0b)", icon: "#7c2d12", ring: "rgba(245,158,11,0.35)", accent: "#b45309", cue: "Summer" },
  February: { Icon: Sun, bg: "linear-gradient(135deg,#fdba74,#f97316)", icon: "#7c2d12", ring: "rgba(249,115,22,0.35)", accent: "#c2410c", cue: "Sunny Days" },
  March: { Icon: Leaf, bg: "linear-gradient(135deg,#fde68a,#84cc16)", icon: "#365314", ring: "rgba(132,204,22,0.35)", accent: "#4d7c0f", cue: "Autumn Begins" },
  April: { Icon: Leaf, bg: "linear-gradient(135deg,#fcd34d,#65a30d)", icon: "#365314", ring: "rgba(101,163,13,0.35)", accent: "#4d7c0f", cue: "Falling Leaves" },
  May: { Icon: Wind, bg: "linear-gradient(135deg,#c4b5fd,#93c5fd)", icon: "#4338ca", ring: "rgba(99,102,241,0.28)", accent: "#4f46e5", cue: "Cool Winds" },
  June: { Icon: Cloud, bg: "linear-gradient(135deg,#cbd5e1,#94a3b8)", icon: "#334155", ring: "rgba(148,163,184,0.35)", accent: "#475569", cue: "Cloudy Days" },
  July: { Icon: Snowflake, bg: "linear-gradient(135deg,#bfdbfe,#60a5fa)", icon: "#1d4ed8", ring: "rgba(96,165,250,0.35)", accent: "#2563eb", cue: "Winter" },
  August: { Icon: Cloud, bg: "linear-gradient(135deg,#dbeafe,#93c5fd)", icon: "#1d4ed8", ring: "rgba(147,197,253,0.35)", accent: "#2563eb", cue: "Cold Mornings" },
  September: { Icon: Sprout, bg: "linear-gradient(135deg,#bbf7d0,#4ade80)", icon: "#166534", ring: "rgba(74,222,128,0.35)", accent: "#16a34a", cue: "Spring" },
  October: { Icon: TreePine, bg: "linear-gradient(135deg,#86efac,#22c55e)", icon: "#166534", ring: "rgba(34,197,94,0.35)", accent: "#15803d", cue: "Growing Green" },
  November: { Icon: Sun, bg: "linear-gradient(135deg,#fef08a,#facc15)", icon: "#854d0e", ring: "rgba(250,204,21,0.35)", accent: "#ca8a04", cue: "Warm Spring" },
  December: { Icon: Gift, bg: "linear-gradient(135deg,#fecaca,#f87171)", icon: "#991b1b", ring: "rgba(248,113,113,0.35)", accent: "#dc2626", cue: "Celebration Time" },
};

const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ── Gold/violet Meazurex shell ── */
function Shell({
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
          background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)",
        }}
      >
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
          style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}
        >
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function Day({ day, size = 64, dim = false }: { day: DayCard; size?: number; dim?: boolean }) {
  const monthVisual = MONTH_VISUALS[day.label] ?? null;
  const monthIndex = monthVisual ? MONTH_ORDER.indexOf(day.label) : -1;
  const showMonthDots = monthIndex >= 0 && size >= 48;
  return (
    <div className="flex flex-col items-center" style={{ opacity: dim ? 0.5 : 1 }}>
      {day.imageSrc ? (
        <div
          className="relative overflow-hidden rounded-[18px] border bg-white shadow-[0_10px_24px_rgba(120,53,15,0.08)]"
          style={{
            height: size,
            width: size,
            borderColor: monthVisual?.ring ?? "rgba(214,184,108,0.32)",
          }}
        >
          <img src={day.imageSrc} alt={day.label} className="h-full w-full object-contain" style={{ height: size, width: size }} />
        </div>
      ) : monthVisual ? (
        <div
          className="relative flex items-center justify-center overflow-hidden rounded-[18px] border shadow-[0_10px_24px_rgba(120,53,15,0.08)]"
          style={{
            height: size,
            width: size,
            borderColor: monthVisual.ring,
            background: monthVisual.bg,
          }}
        >
          <div
            className="absolute inset-x-0 bottom-0"
            style={{
              height: `${Math.max(12, Math.round(size * 0.22))}px`,
              background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,248,232,0.42))",
            }}
          />
          <div
            className="absolute left-[12%] top-[16%] rounded-full bg-white/30"
            style={{ width: size * 0.16, height: size * 0.16 }}
          />
          <div
            className="absolute right-[12%] bottom-[20%] rounded-full bg-white/20"
            style={{ width: size * 0.12, height: size * 0.12 }}
          />
          <monthVisual.Icon className="relative h-[50%] w-[50%]" style={{ color: monthVisual.icon }} />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-xl bg-[rgba(214,184,108,0.15)]" style={{ height: size, width: size }} />
      )}
      <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#7c4a12]">{day.label}</div>
      {monthVisual ? <div className="text-[8px] font-black uppercase tracking-[0.12em]" style={{ color: monthVisual.accent }}>{monthVisual.cue}</div> : null}
      {showMonthDots ? (
        <div className="mt-1 flex items-center justify-center gap-[2px]">
          {MONTH_ORDER.map((month, index) => (
            <span
              key={`${day.id}-${month}`}
              className="rounded-full"
              style={{
                width: index === monthIndex ? 8 : 4,
                height: 4,
                background: index === monthIndex ? monthVisual?.accent : "rgba(124,74,18,0.18)",
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function GapSlot({ size = 64 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center rounded-xl border-2 border-dashed text-2xl font-black text-[#a98b52]"
        style={{ height: size, width: size, borderColor: "rgba(214,184,108,0.7)", background: "rgba(255,248,232,0.6)" }}
      >
        ?
      </div>
      <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-transparent">.</div>
    </div>
  );
}

function MiniDayCell({ text }: { text: string }) {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.96)] text-[11px] font-black uppercase tracking-[0.04em] text-[#7c4a12] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
      {text}
    </div>
  );
}

/* ── A single numbered week row (7 dated cells) ── */
function NumberedWeekRow({ dates, dim = false }: { dates: number[]; dim?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" style={{ opacity: dim ? 0.55 : 1 }}>
      {dates.map((d) => (
        <MiniDayCell key={d} text={String(d)} />
      ))}
    </div>
  );
}

function CalendarPage({
  rows,
  highlightRow,
  caption,
  numbered = false,
}: {
  rows: number;
  highlightRow?: number;
  caption?: string;
  numbered?: boolean;
}) {
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="mx-auto max-w-[520px] rounded-[28px] border border-[rgba(214,184,108,0.4)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(252,244,225,0.98))] p-4 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
      <div className="mb-3 flex items-center justify-between rounded-[18px] bg-[rgba(109,40,217,0.08)] px-4 py-2">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-[#5b21b6]">Calendar Page</div>
        {caption ? <div className="text-[11px] font-bold text-[#7c4a12]">{caption}</div> : null}
      </div>
      <div className="grid gap-2">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const isHighlighted = highlightRow === rowIndex;
          return (
            <div
              key={`row-${rowIndex}`}
              className="rounded-[18px] border px-2 py-2"
              style={{
                borderColor: isHighlighted ? "rgba(91,33,182,0.45)" : "rgba(214,184,108,0.24)",
                background: isHighlighted ? "rgba(109,40,217,0.08)" : "rgba(255,255,255,0.72)",
              }}
            >
              <div className="mb-1 text-left text-[9px] font-black uppercase tracking-[0.16em] text-[#a98b52]">
                Week {rowIndex + 1}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {dayLabels.map((label, cellIndex) => (
                  <MiniDayCell
                    key={`${rowIndex}-${cellIndex}`}
                    text={numbered ? String(rowIndex * 7 + cellIndex + 1) : label}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── A week strip with the "1 WEEK" brace underneath ── */
function WeekStrip({ days, brace = true }: { days: Array<DayCard | null>; brace?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap items-end justify-center gap-1.5">
        {days.map((d, i) => (d ? <Day key={d.id} day={d} size={52} /> : <GapSlot key={`gap-${i}`} size={52} />))}
      </div>
      {brace ? (
        <div className="mt-1 w-full max-w-[460px]">
          <div className="h-2 rounded-b-xl border-x-2 border-b-2" style={{ borderColor: "rgba(124,58,237,0.5)" }} />
          <div className="mt-1 text-center text-sm font-black uppercase tracking-[0.18em] text-[#5b21b6]">1 Week</div>
        </div>
      ) : null}
    </div>
  );
}

/* ── Intro / teaching ── */
function IntroScene({ task, onCorrect }: { task: WeekTask; onCorrect: () => void }) {
  const days = task.teachingDays ?? [];
  const introTitle = task.introTitle ?? "Meazurex";
  const introBody = task.introBody ?? ["A week is made of seven days.", "After Sunday, a new week begins — weeks repeat over and over."];
  const introVisual = task.introVisual ?? (typeof task.weekRows === "number" && task.weekRows > 1 ? "weekToMonth" : "weekCycle");
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="measurelands-calendar-intro rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">{introTitle}</div>
            {introBody.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className={`text-base font-semibold leading-relaxed ${index === 0 ? "text-[#2c1c07]" : "text-[#5f4725]"}`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        {introVisual === "weekToMonth" ? (
          <div className="measurelands-week-month-grid grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-3">
              <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#7c3aed]">1 Week</div>
              <WeekStrip days={days} />
            </div>
            <CalendarPage rows={task.weekRows ?? 4} highlightRow={typeof task.highlightRow === "number" ? task.highlightRow : 0} caption="1 Month = several weeks" numbered />
          </div>
        ) : introVisual === "monthCycle" ? (
          <div className="measurelands-month-cycle rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-4">
            <div className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.18em] text-[#7c3aed]">12 Months = 1 Year</div>
            <div className="measurelands-month-grid grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {days.map((month) => (
                <div key={month.id} className="flex justify-center">
                  <Day day={month} size={64} />
                </div>
              ))}
            </div>
            {days.length > 0 ? (
              <div className="mt-4 flex items-center justify-center gap-2 text-center">
                <Day day={days[days.length - 1]!} size={52} />
                <RotateCw className="h-5 w-5 text-[#5b21b6]" />
                <Day day={days[0]!} size={52} />
                <span className="text-sm font-bold text-[#5f4725]">the year starts again</span>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-3">
            <WeekStrip days={days} />
            <div className="mt-3 flex items-center justify-center gap-2">
              {days[6] ? <Day day={days[6]} size={44} /> : null}
              <RotateCw className="h-6 w-6 text-[#5b21b6]" />
              {days[0] ? <Day day={days[0]} size={44} /> : null}
              <span className="ml-1 text-sm font-bold text-[#5f4725]">the cycle repeats</span>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onCorrect}
            className="rounded-full px-6 py-3 text-lg font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)] transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}
          >
            Start
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ── Activity A: build the week (tap Monday → Sunday) ── */
function BuildScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  const expected = task.orderedIds ?? [];
  const [picked, setPicked] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const byId = (id: string) => items.find((d) => d.id === id);

  function pick(id: string) {
    if (locked || picked.includes(id)) return;
    const next = [...picked, id];
    setPicked(next);
    if (next.length !== expected.length) return;
    const correct = expected.every((eid, i) => next[i] === eid);
    setLocked(true);
    window.setTimeout(() => {
      if (correct) onCorrect();
      else { setPicked([]); setLocked(false); onWrong(); }
    }, 400);
  }

  return (
    <Shell badge={task.badgeLabel ?? "Build the Week"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mb-3 flex min-h-[60px] flex-wrap items-center justify-center gap-1.5 rounded-[22px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,248,232,0.75)] p-3">
        {picked.length === 0 ? (
          <span className="text-sm font-bold text-[#a98b52]">{task.speakText ?? "Tap the items in order."}</span>
        ) : (
          picked.map((id, idx) => {
            const d = byId(id);
            return d ? (
              <div key={id} className="relative">
                <span className="absolute -left-1 -top-1 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#5b21b6] text-[10px] font-black text-white">{idx + 1}</span>
                <Day day={d} size={44} />
              </div>
            ) : null;
          })
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((d) => {
          const chosen = picked.includes(d.id);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => pick(d.id)}
              disabled={locked || chosen}
              className="relative rounded-[18px] border-2 bg-white p-2 transition hover:-translate-y-0.5 disabled:opacity-40"
              style={{ borderColor: "rgba(214,184,108,0.4)" }}
            >
              <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={d.label} /></span>
              <Day day={d} size={56} />
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

/* ── Activity B: how many days in a week? ── */
function CountScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "How Many Days?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        <WeekStrip days={task.items ?? []} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={String(value)} /></span>
            {value}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Pick a day card from choices (used by "next" and "missing") ── */
function DayChoiceRow({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  const largeMonthChoices = (task.choices ?? []).every((choice) => !choice.imageSrc && MONTH_VISUALS[choice.label]);
  return (
    <div className={`grid gap-3 ${largeMonthChoices ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-3"}`}>
      {(task.choices ?? []).map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => (d.id === task.correctOptionId ? onCorrect() : onWrong())}
          className="relative flex items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] p-3 shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={d.label} /></span>
          <Day day={d} size={largeMonthChoices ? 74 : 56} />
        </button>
      ))}
    </div>
  );
}

/* ── Activity C: what comes next? (cycle wraps Sunday → Monday) ── */
function NextScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "What Comes Next?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {(task.sequence ?? []).map((d) => <Day key={d.id} day={d} size={78} />)}
        <ArrowRight className="mx-1 h-6 w-6 text-[#5b21b6]" />
        <GapSlot size={78} />
      </div>
      <DayChoiceRow task={task} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

/* ── Quiz: which day is missing from the week strip? ── */
function MissingScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Missing Day"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(task.strip ?? []).map((day, index) => (
            day ? <Day key={day.id} day={day} size={70} /> : <GapSlot key={`missing-gap-${index}`} size={70} />
          ))}
        </div>
      </div>
      <DayChoiceRow task={task} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

/* ── Quiz: which group shows one full week? ── */
function WhichWeekScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Find a Full Week"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3">
        {(task.groups ?? []).map((g, idx) => (
          <button
            key={g.id}
            type="button"
            onClick={() => (g.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="rounded-[24px] border-2 border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.92)] p-3 transition hover:-translate-y-0.5"
          >
            <div className="mb-1 text-left text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">Group {idx + 1}</div>
            <div className="flex flex-wrap items-end justify-center gap-1.5">
              {g.days.map((d) => <Day key={d.id} day={d} size={44} />)}
            </div>
          </button>
        ))}
      </div>
    </Shell>
  );
}

function TextChoiceButtons({ options, onPick }: { options: string[]; onPick: (value: string) => void }) {
  return (
    <div className={`grid gap-3 ${options.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
      {options.map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onPick(value)}
          className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 py-3 text-center text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <span className="absolute right-3 top-3 z-10">
            <OptionReadAloudButton text={value} />
          </span>
          {value}
        </button>
      ))}
    </div>
  );
}

function WeekOrMonthScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  const options = task.textOptions ?? [];
  const isMonth = task.visualMode === "month";
  return (
    <Shell badge={task.badgeLabel ?? "Week or Month?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {isMonth ? (
        <CalendarPage rows={task.weekRows ?? 4} caption={task.visualLabel ?? "One month = several week rows"} numbered={task.numbered} />
      ) : (
        <CalendarPage rows={1} caption={task.visualLabel ?? "One week = one row"} numbered={task.numbered} />
      )}
      <TextChoiceButtons
        options={options}
        onPick={(value) => (value === task.correctTextOption ? onCorrect() : onWrong())}
      />
    </Shell>
  );
}

function FindWeeksScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Find the Weeks"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <CalendarPage
        rows={task.weekRows ?? 4}
        highlightRow={typeof task.highlightRow === "number" ? task.highlightRow : undefined}
        caption={task.visualLabel ?? "A month has several week rows"}
        numbered={task.numbered}
      />
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={String(value)} /></span>
            {value}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function WhichBiggerScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  const options = task.textOptions ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Is Bigger?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 sm:grid-cols-2">
        <CalendarPage rows={1} caption="1 Week" numbered={task.numbered} />
        <CalendarPage rows={task.weekRows ?? 4} caption="1 Month" numbered={task.numbered} />
      </div>
      <TextChoiceButtons
        options={options}
        onPick={(value) => (value === task.correctTextOption ? onCorrect() : onWrong())}
      />
    </Shell>
  );
}

/* ── Activity A: build a month by stacking 4 week-rows (in date order) ── */
function MonthBuildScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  const weeks = task.monthWeeks ?? [];
  const expected = task.orderedIds ?? [];
  const [placed, setPlaced] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const byId = (id: string) => weeks.find((w) => w.id === id);
  const tray = weeks.filter((w) => !placed.includes(w.id));

  function pick(id: string) {
    if (locked || placed.includes(id)) return;
    const next = [...placed, id];
    setPlaced(next);
    if (next.length !== expected.length) return;
    const ok = expected.every((eid, i) => next[i] === eid);
    setLocked(true);
    window.setTimeout(() => {
      if (ok) onCorrect();
      else { setPlaced([]); setLocked(false); onWrong(); }
    }, 450);
  }

  return (
    <Shell badge={task.badgeLabel ?? "Build the Month"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="measurelands-month-build-grid grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        {/* month frame */}
        <div className="mx-auto w-full max-w-[520px] rounded-[28px] border border-[rgba(214,184,108,0.4)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(252,244,225,0.98))] p-4 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
          <div className="mb-3 flex items-center justify-between rounded-[18px] bg-[rgba(109,40,217,0.08)] px-4 py-2">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-[#5b21b6]">Calendar Page</div>
            <div className="text-[11px] font-bold text-[#7c4a12]">1 Month = 4 weeks</div>
          </div>
          <div className="grid gap-2">
            {expected.map((_, i) => {
              const placedId = placed[i];
              const wk = placedId ? byId(placedId) : null;
              return (
                <div
                  key={`slot-${i}`}
                  className="rounded-[18px] border-2 px-2 py-2"
                  style={{
                    borderStyle: wk ? "solid" : "dashed",
                    borderColor: wk ? "rgba(91,33,182,0.4)" : "rgba(214,184,108,0.6)",
                    background: wk ? "rgba(109,40,217,0.06)" : "rgba(255,248,232,0.5)",
                    minHeight: 52,
                  }}
                >
                  <div className="mb-1 text-left text-[9px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Week {i + 1}</div>
                  {wk ? <NumberedWeekRow dates={wk.dates} /> : <div className="text-center text-xs font-bold text-[#a98b52]">tap a week to add it</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* tray of week rows to place */}
        <div className="measurelands-option-bank space-y-2">
          {tray.length === 0 ? (
            <div className="text-center text-sm font-black uppercase tracking-[0.14em] text-[#5b21b6]">A month is full!</div>
          ) : (
            tray.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => pick(w.id)}
                disabled={locked}
                className="w-full rounded-[18px] border-2 border-[rgba(214,184,108,0.5)] bg-white p-2 transition hover:-translate-y-0.5"
              >
                <NumberedWeekRow dates={w.dates} />
              </button>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}

export function MeasurelandsWeekCycleCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: WeekTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "buildMonth") return <MonthBuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "build") return <BuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "count") return <CountScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "next") return <NextScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "missing") return <MissingScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "weekOrMonth") return <WeekOrMonthScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "findWeeks") return <FindWeeksScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "whichBigger") return <WhichBiggerScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <WhichWeekScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
