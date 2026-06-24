"use client";

import { Compass, ArrowRight, ArrowDown, ArrowUp } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type NavTask = Extract<PracticeTask, { kind: "calendarNavigate" }>;

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/* ── Gold/violet Meazurex shell (matches the Find-the-Date card) ── */
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
    <div className="space-y-4">
      <div
        className="rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
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
          <div className="flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── A large, colourful month calendar grid (highlight a start date; optionally tappable) ── */
function CalendarGrid({
  days,
  startWeekday,
  monthLabel,
  start,
  onTapDate,
}: {
  days: number;
  startWeekday: number;
  monthLabel?: string;
  start?: number;
  onTapDate?: (date: number) => void;
}) {
  const cells: Array<number | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  return (
    <div className="mx-auto max-w-[480px] rounded-[28px] border border-[rgba(214,184,108,0.4)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(252,244,225,0.98))] p-4 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
      <div className="mb-3 rounded-[18px] bg-[rgba(109,40,217,0.1)] px-4 py-2 text-center text-sm font-black uppercase tracking-[0.18em] text-[#5b21b6]">
        {monthLabel ?? "Measurelands Month"}
      </div>
      <div className="mb-1 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-[11px] font-black uppercase text-[#a98b52]">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((date, i) => {
          if (date === null) return <div key={`blank-${i}`} />;
          const isStart = start === date;
          const tappable = !!onTapDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onTapDate?.(date)}
              disabled={!tappable}
              className="relative flex aspect-square items-center justify-center rounded-[14px] border-2 text-lg font-black transition disabled:cursor-default"
              style={{
                borderColor: isStart ? "rgba(180,120,20,0.85)" : "rgba(214,184,108,0.5)",
                background: isStart ? "rgba(214,184,108,0.34)" : "rgba(255,255,255,0.9)",
                color: "#2c1c07",
                boxShadow: tappable ? "0 2px 0 rgba(180,120,20,0.12)" : undefined,
              }}
            >
              {date}
              {isStart ? (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#b4781e] px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#fff8e1] shadow">
                  start
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── A small "path" of two dates with an arrow — the date moving forward/back ── */
function NumberPath({ from, direction }: { from: number; direction: "next" | "before" }) {
  const known = (
    <div className="flex h-20 w-20 items-center justify-center rounded-[20px] border-2 border-[rgba(180,120,20,0.85)] bg-[rgba(214,184,108,0.3)] text-4xl font-black text-[#2c1c07] shadow">
      {from}
    </div>
  );
  const unknown = (
    <div className="flex h-20 w-20 items-center justify-center rounded-[20px] border-2 border-dashed border-[rgba(124,58,237,0.6)] bg-[rgba(124,58,237,0.08)] text-4xl font-black text-[#7c3aed]">
      ?
    </div>
  );
  return (
    <div className="flex items-center justify-center gap-3 py-1">
      {direction === "next" ? known : unknown}
      <ArrowRight className="h-9 w-9 shrink-0 text-[#b4781e]" strokeWidth={3} />
      {direction === "next" ? unknown : known}
    </div>
  );
}

/* ── Intro / teaching ── */
function IntroScene({ task, onCorrect }: { task: NavTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">Dates move in order. We can step forward and back.</p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">If today is the 10th, the next date is 11.</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-5">
          {[9, 10, 11].map((n, i) => (
            <div key={n} className="flex items-center gap-3">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-[18px] border-2 text-3xl font-black text-[#2c1c07]"
                style={{
                  borderColor: n === 10 ? "rgba(180,120,20,0.85)" : "rgba(214,184,108,0.5)",
                  background: n === 10 ? "rgba(214,184,108,0.34)" : "rgba(255,255,255,0.9)",
                }}
              >
                {n}
              </div>
              {i < 2 ? <ArrowRight className="h-7 w-7 text-[#b4781e]" strokeWidth={3} /> : null}
            </div>
          ))}
        </div>
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

/* ── Activity A/B: what comes next / what came before (number MCQ) ── */
function StepScene({ task, onCorrect, onWrong }: { task: NavTask; onCorrect: () => void; onWrong: () => void }) {
  const direction = task.scene === "before" ? "before" : "next";
  return (
    <Shell badge={task.badgeLabel ?? (direction === "next" ? "What Comes Next?" : "What Came Before?")} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <NumberPath from={task.fromDate ?? 1} direction={direction} />
      <CalendarGrid days={task.days} startWeekday={task.startWeekday} monthLabel={task.monthLabel} start={task.fromDate} />
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="relative flex min-h-[80px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-4xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={String(value)} /></span>
            {value}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Activity C: calendar explorer — jump one week later/earlier (tap the date) ── */
function ExploreScene({ task, onCorrect, onWrong }: { task: NavTask; onCorrect: () => void; onWrong: () => void }) {
  const earlier = task.direction === "earlier";
  return (
    <Shell badge={task.badgeLabel ?? "Calendar Explorer"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mx-auto mb-3 flex max-w-[480px] items-center justify-center gap-2 rounded-full border border-[rgba(167,139,250,0.34)] bg-[rgba(109,40,217,0.08)] px-4 py-2 text-sm font-black text-[#5b21b6]">
        {earlier ? <ArrowUp className="h-5 w-5" strokeWidth={3} /> : <ArrowDown className="h-5 w-5" strokeWidth={3} />}
        One week {earlier ? "earlier" : "later"} is one row {earlier ? "up" : "down"}.
      </div>
      <CalendarGrid
        days={task.days}
        startWeekday={task.startWeekday}
        monthLabel={task.monthLabel}
        start={task.fromDate}
        onTapDate={(date) => (date === task.targetDate ? onCorrect() : onWrong())}
      />
    </Shell>
  );
}

export function MeasurelandsCalendarNavigateCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: NavTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "explore") return <ExploreScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <StepScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
