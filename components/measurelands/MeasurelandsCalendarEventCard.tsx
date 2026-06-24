"use client";

import { Compass } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsEventBadge } from "@/components/measurelands/MeasurelandsEventBadge";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type EventTask = Extract<PracticeTask, { kind: "calendarEvent" }>;
type EventMark = { date: number; label: string; icon: string };

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/* ── Gold/violet Meazurex shell (matches the other Calendar Quest cards) ── */
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

/* ── A large month calendar with event icons on dates (optionally tappable) ── */
function CalendarGrid({
  days,
  startWeekday,
  monthLabel,
  events = [],
  highlightDate,
  onTapDate,
}: {
  days: number;
  startWeekday: number;
  monthLabel?: string;
  events?: EventMark[];
  highlightDate?: number;
  onTapDate?: (date: number) => void;
}) {
  const eventByDate = new Map(events.map((e) => [e.date, e]));
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
          const ev = eventByDate.get(date);
          const isHi = highlightDate === date;
          const tappable = !!onTapDate;
          return (
            <button
              key={date}
              type="button"
              onClick={() => onTapDate?.(date)}
              disabled={!tappable}
              className="relative flex aspect-square items-center justify-center rounded-[14px] border-2 text-lg font-black transition disabled:cursor-default"
              style={{
                borderColor: isHi ? "rgba(91,33,182,0.8)" : "rgba(214,184,108,0.5)",
                background: isHi ? "rgba(124,58,237,0.16)" : "rgba(255,255,255,0.9)",
                color: "#2c1c07",
                boxShadow: tappable ? "0 2px 0 rgba(180,120,20,0.12)" : undefined,
              }}
            >
              <span className={ev ? "text-sm leading-none text-[#5f4725]" : ""}>{date}</span>
              {ev ? (
                <span className="absolute -right-2 -top-2">
                  <MeasurelandsEventBadge iconKey={ev.icon} label={ev.label} size="sm" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Intro / teaching ── */
function IntroScene({ task, onCorrect }: { task: EventTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">I use my calendar to remember important events.</p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">Calendars help us know when things happen.</p>
          </div>
        </div>
        <CalendarGrid days={task.days} startWeekday={task.startWeekday} monthLabel={task.monthLabel} events={task.events} />
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

/* ── Activity A: when is the event? (number MCQ) ── */
function WhenScene({ task, onCorrect, onWrong }: { task: EventTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "When Is the Event?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <CalendarGrid days={task.days} startWeekday={task.startWeekday} monthLabel={task.monthLabel} events={task.events} />
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

/* ── Activity B: place the event (tap the date to drop it on) ── */
function PlaceScene({ task, onCorrect, onWrong }: { task: EventTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Place the Event"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mx-auto mb-3 flex max-w-[480px] items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-[rgba(124,58,237,0.45)] bg-[rgba(124,58,237,0.06)] px-4 py-3">
        <MeasurelandsEventBadge iconKey={task.placeIcon ?? "party"} label={task.placeLabel ?? "Event"} size="lg" />
        <span className="text-lg font-black text-[#5b21b6]">{task.placeLabel}</span>
      </div>
      <CalendarGrid
        days={task.days}
        startWeekday={task.startWeekday}
        monthLabel={task.monthLabel}
        onTapDate={(date) => (date === task.targetDate ? onCorrect() : onWrong())}
      />
    </Shell>
  );
}

/* ── Activity C: which event comes first/last? (text options) ── */
function CompareScene({ task, onCorrect, onWrong }: { task: EventTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Which Comes First?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <CalendarGrid days={task.days} startWeekday={task.startWeekday} monthLabel={task.monthLabel} events={task.events} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(task.textOptions ?? []).map((value) => {
          const ev = task.events?.find((e) => e.label === value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => (value === task.correctTextOption ? onCorrect() : onWrong())}
              className="relative flex min-h-[72px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={value} /></span>
              {ev ? <MeasurelandsEventBadge iconKey={ev.icon} label={ev.label} size="md" /> : null}
              {value}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

export function MeasurelandsCalendarEventCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: EventTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "place") return <PlaceScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "compare") return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <WhenScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
