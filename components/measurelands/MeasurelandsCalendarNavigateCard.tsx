"use client";

import { Compass, ArrowRight, ArrowDown, ArrowUp } from "lucide-react";
import { useRef, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type NavTask = Extract<PracticeTask, { kind: "calendarNavigate" }>;

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const EVENT_ICON: Record<string, string> = {
  birthday: "🎂",
  library: "📚",
  swimming: "🏊",
  sport: "⚽",
  excursion: "🚌",
  assembly: "🎤",
  music: "🎵",
  holiday: "⭐",
  grandparent: "👵",
  disco: "🎉",
  soccer: "⚽",
  bookfair: "📖",
};

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

/* ── A large, colourful month calendar grid (highlight a start date; optionally tappable) ── */
function CalendarGrid({
  days,
  startWeekday,
  monthLabel,
  start,
  endDate,
  pathDates,
  tappedOrder,
  events,
  onTapDate,
}: {
  days: number;
  startWeekday: number;
  monthLabel?: string;
  start?: number;
  /** W7 "between": the finish date (flagged). */
  endDate?: number;
  /** W7 "between": the day-cells the student counts (from+1 … to). If given,
   *  only these cells are tappable. */
  pathDates?: number[];
  /** W7 "between": path dates already tapped, in order (shows the count badge). */
  tappedOrder?: number[];
  /** Familiar events shown on the calendar. */
  events?: Array<{ date: number; label: string; icon: string }>;
  onTapDate?: (date: number) => void;
}) {
  const cells: Array<number | null> = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const pathSet = new Set(pathDates ?? []);
  const eventByDate = new Map((events ?? []).map((event) => [event.date, event]));
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
          const isEnd = endDate === date;
          const inPath = pathSet.has(date);
          const event = eventByDate.get(date);
          const order = tappedOrder ? tappedOrder.indexOf(date) : -1;
          const isTapped = order >= 0;
          // If pathDates is given we're in "count the jumps" mode: only path
          // cells are tappable. Otherwise (explore) every cell is tappable.
          const tappable = !!onTapDate && (pathDates ? inPath && !isTapped : true);
          const border = isStart
            ? "rgba(180,120,20,0.85)"
            : isEnd
            ? "rgba(124,58,237,0.8)"
            : isTapped
            ? "rgba(15,118,110,0.85)"
            : inPath
            ? "rgba(124,58,237,0.55)"
            : "rgba(214,184,108,0.5)";
          const background = isStart
            ? "rgba(214,184,108,0.34)"
            : isEnd
            ? "rgba(124,58,237,0.12)"
            : isTapped
            ? "rgba(15,118,110,0.16)"
            : inPath
            ? "rgba(124,58,237,0.06)"
            : "rgba(255,255,255,0.9)";
          return (
            <button
              key={date}
              type="button"
              onClick={() => (tappable ? onTapDate?.(date) : undefined)}
              disabled={!tappable}
              className="relative flex aspect-square items-center justify-center rounded-[14px] border-2 text-lg font-black transition disabled:cursor-default"
              style={{
                borderColor: border,
                background,
                borderStyle: inPath && !isTapped ? "dashed" : "solid",
                color: "#2c1c07",
                boxShadow: tappable ? "0 2px 0 rgba(180,120,20,0.12)" : undefined,
              }}
            >
              {date}
              {event ? (
                <span
                  className="absolute -top-2 left-1/2 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-full bg-white px-1 text-sm shadow-[0_4px_10px_rgba(76,29,149,0.16)]"
                  aria-label={event.label}
                  title={event.label}
                >
                  {EVENT_ICON[event.icon] ?? event.icon}
                </span>
              ) : null}
              {isStart ? (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#b4781e] px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-[#fff8e1] shadow">start</span>
              ) : null}
              {isEnd ? (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#7c3aed] px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow">finish</span>
              ) : null}
              {isTapped ? (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0f766e] text-[10px] font-black text-white shadow">{order + 1}</span>
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
  const from = task.fromDate ?? 10;
  const to = task.toDate;
  const path = to ? Array.from({ length: Math.max(0, to - from) }, (_, i) => from + 1 + i) : undefined;
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">
              {task.events?.length ? "Start at today. Count forward to the event." : "Dates move in order. We can step forward and back."}
            </p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">
              {task.events?.length ? "Do not count today as day one." : "If today is the 10th, the next date is 11."}
            </p>
          </div>
        </div>
        {task.events?.length ? (
          <CalendarGrid
            days={task.days}
            startWeekday={task.startWeekday}
            monthLabel={task.monthLabel}
            start={from}
            endDate={to}
            pathDates={path}
            events={task.events}
          />
        ) : (
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

/* ── W7 L1‑B: count the days BETWEEN two dates. Tap each day from the start+1 to
 * the finish — you count the JUMPS, not the start date (exclusive). ── */
function BetweenScene({ task, onCorrect }: { task: NavTask; onCorrect: () => void }) {
  const from = task.fromDate ?? 1;
  const to = task.toDate ?? from + 1;
  const answer = Math.max(0, to - from);
  const path = Array.from({ length: answer }, (_, i) => from + 1 + i);
  const [tapped, setTapped] = useState<number[]>([]);
  const wonRef = useRef(false);
  const done = tapped.length >= answer;
  function tap(date: number) {
    if (wonRef.current || !path.includes(date) || tapped.includes(date)) return;
    const next = [...tapped, date];
    setTapped(next);
    if (next.length >= answer && !wonRef.current) {
      wonRef.current = true;
      window.setTimeout(onCorrect, 1300);
    }
  }
  return (
    <Shell badge={task.badgeLabel ?? "Count the Days Between"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mx-auto max-w-[480px] rounded-full border border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.95)] px-4 py-2 text-center text-base font-black text-[#7c4a12]">
        {done ? `${answer} days between the ${from} and the ${to}!` : `Days counted: ${tapped.length}`}
      </div>
      <CalendarGrid days={task.days} startWeekday={task.startWeekday} monthLabel={task.monthLabel} start={from} endDate={to} pathDates={path} tappedOrder={tapped} onTapDate={tap} />
      <div className="text-center text-sm font-bold text-[#5f4725]">Start on the {from}. Tap each day after it, up to the {to} — count the jumps.</div>
    </Shell>
  );
}

/* ── W7 L1‑C: two counts shown — pick the correct one (fence‑post fix). ── */
function WhichCountScene({ task, onCorrect, onWrong }: { task: NavTask; onCorrect: () => void; onWrong: () => void }) {
  const from = task.fromDate ?? 3;
  const to = task.toDate ?? 7;
  const answer = task.correctAnswer ?? to - from;
  const path = Array.from({ length: Math.max(0, to - from) }, (_, i) => from + 1 + i);
  return (
    <Shell badge={task.badgeLabel ?? "Which Count Is Correct?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <CalendarGrid days={task.days} startWeekday={task.startWeekday} monthLabel={task.monthLabel} start={from} endDate={to} pathDates={path} />
      <div className="grid grid-cols-2 gap-3">
        {(task.options ?? [answer, answer + 1]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === answer ? onCorrect() : onWrong())}
            className="relative flex min-h-[80px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-3xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${value} days`} /></span>
            {value} days
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── W7 L2-A: count forward from today until a familiar event. Count the days
 * after today; do not count today as day 1. ── */
function UntilScene({ task, onCorrect }: { task: NavTask; onCorrect: () => void }) {
  const from = task.fromDate ?? 1;
  const to = task.toDate ?? from + 1;
  const answer = Math.max(0, to - from);
  const path = Array.from({ length: answer }, (_, i) => from + 1 + i);
  const event = (task.events ?? []).find((item) => item.label === task.askEventLabel) ?? task.events?.[0];
  const [tapped, setTapped] = useState<number[]>([]);
  const wonRef = useRef(false);
  const done = tapped.length >= answer;
  function tap(date: number) {
    if (wonRef.current || !path.includes(date) || tapped.includes(date)) return;
    const nextExpected = path[tapped.length];
    if (date !== nextExpected) return;
    const next = [...tapped, date];
    setTapped(next);
    if (next.length >= answer && !wonRef.current) {
      wonRef.current = true;
      window.setTimeout(onCorrect, 1200);
    }
  }
  return (
    <Shell badge={task.badgeLabel ?? "Count the Days Until"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mx-auto max-w-[520px] rounded-full border border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.95)] px-4 py-2 text-center text-base font-black text-[#7c4a12]">
        {done ? `${answer} days until ${event?.label ?? "the event"}!` : `Start at today. Days counted: ${tapped.length}`}
      </div>
      <CalendarGrid
        days={task.days}
        startWeekday={task.startWeekday}
        monthLabel={task.monthLabel}
        start={from}
        endDate={to}
        pathDates={path}
        tappedOrder={tapped}
        events={task.events}
        onTapDate={tap}
      />
      <div className="text-center text-sm font-bold text-[#5f4725]">
        Do not count today. Tap the next date first, then count forward to the event.
      </div>
    </Shell>
  );
}

function EventOptionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-h-[76px] items-center justify-center gap-3 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={label} /></span>
      {icon ? <span className="text-2xl leading-none" aria-hidden>{EVENT_ICON[icon] ?? icon}</span> : null}
      <span>{label}</span>
    </button>
  );
}

/* ── W7 L2-B/C: compare event dates and choose the event matching a calendar
 * clue (next, furthest away, or exact days until). ── */
function EventChoiceScene({ task, onCorrect, onWrong }: { task: NavTask; onCorrect: () => void; onWrong: () => void }) {
  const from = task.fromDate ?? 1;
  const selected = (task.events ?? []).find((event) => event.label === task.correctTextOption);
  const path = selected ? Array.from({ length: Math.max(0, selected.date - from) }, (_, i) => from + 1 + i) : undefined;
  return (
    <Shell badge={task.badgeLabel ?? "Plan My Week"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <CalendarGrid
        days={task.days}
        startWeekday={task.startWeekday}
        monthLabel={task.monthLabel}
        start={from}
        endDate={selected?.date}
        pathDates={path}
        events={task.events}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(task.textOptions ?? []).map((label) => {
          const event = (task.events ?? []).find((item) => item.label === label);
          return (
            <EventOptionButton
              key={label}
              label={label}
              icon={event?.icon}
              onClick={() => (label === task.correctTextOption ? onCorrect() : onWrong())}
            />
          );
        })}
      </div>
    </Shell>
  );
}

// Southern-hemisphere seasons (Australian curriculum): summer Dec–Feb,
// autumn Mar–May, winter Jun–Aug, spring Sep–Nov. Keyed by 3-letter month.
const SEASON_BY_MONTH: Record<string, "summer" | "autumn" | "winter" | "spring"> = {
  Dec: "summer", Jan: "summer", Feb: "summer",
  Mar: "autumn", Apr: "autumn", May: "autumn",
  Jun: "winter", Jul: "winter", Aug: "winter",
  Sep: "spring", Oct: "spring", Nov: "spring",
};
const SEASON_STYLE: Record<string, { label: string; emoji: string; bg: string; border: string }> = {
  summer: { label: "Summer", emoji: "☀️", bg: "rgba(251,191,36,0.16)", border: "rgba(245,158,11,0.55)" },
  autumn: { label: "Autumn", emoji: "🍂", bg: "rgba(234,88,12,0.12)", border: "rgba(234,88,12,0.5)" },
  winter: { label: "Winter", emoji: "❄️", bg: "rgba(56,189,248,0.16)", border: "rgba(14,165,233,0.55)" },
  spring: { label: "Spring", emoji: "🌸", bg: "rgba(236,72,153,0.12)", border: "rgba(236,72,153,0.5)" },
};
function seasonFor(monthLabel?: string) {
  const key = (monthLabel ?? "").slice(0, 3);
  const s = SEASON_BY_MONTH[key];
  return s ? SEASON_STYLE[s] : undefined;
}

/* ── W7 L1‑A: months of the year / days in each month (the AC9M2M03 months
 * beat), with southern-hemisphere season visuals. Text options (which month
 * next, shown on a season-tinted strip) or number options (days in a month,
 * with a calendar grid to count). ── */
function MonthsScene({ task, onCorrect, onWrong }: { task: NavTask; onCorrect: () => void; onWrong: () => void }) {
  const useText = Boolean(task.textOptions?.length);
  const bannerSeason = seasonFor(task.monthName);
  return (
    <Shell badge={task.badgeLabel ?? "Months of the Year"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.monthStrip?.length ? (
        <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
          <div className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-[#a98b52]">The months in order</div>
          <div className="flex items-stretch justify-center gap-2 overflow-x-auto">
            {task.monthStrip.map((m, i) => {
              const season = seasonFor(m.label);
              return (
                <div
                  key={i}
                  className="flex min-w-[64px] flex-col items-center justify-center gap-1 rounded-[16px] border-2 px-2 py-3 text-center"
                  style={{
                    borderColor: m.blank ? "rgba(124,58,237,0.7)" : m.highlight ? "rgba(180,120,20,0.85)" : season?.border ?? "rgba(214,184,108,0.5)",
                    borderStyle: m.blank ? "dashed" : "solid",
                    background: m.blank ? "rgba(124,58,237,0.07)" : m.highlight ? "rgba(214,184,108,0.34)" : season?.bg ?? "rgba(255,255,255,0.92)",
                  }}
                >
                  <span className="text-xl leading-none" aria-hidden>{m.blank ? "❓" : season?.emoji ?? ""}</span>
                  <span className={`text-base font-black ${m.blank ? "text-[#7c3aed]" : "text-[#2c1c07]"}`}>{m.blank ? "?" : m.label}</span>
                  {!m.blank && season ? (
                    <span className="text-[9px] font-black uppercase tracking-wide text-[#7a5b28]">{season.label}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : task.monthName ? (
        <div className="flex flex-col items-center gap-3">
          <div
            className="mx-auto flex w-full max-w-[480px] items-center justify-center gap-3 rounded-[26px] border-2 px-6 py-4"
            style={{
              borderColor: bannerSeason?.border ?? "rgba(124,58,237,0.35)",
              background: bannerSeason?.bg ?? "rgba(124,58,237,0.06)",
            }}
          >
            {bannerSeason ? (
              <span className="text-3xl leading-none" aria-hidden>{bannerSeason.emoji}</span>
            ) : (
              <Compass className="h-8 w-8 text-[#5b21b6]" />
            )}
            <span className="text-3xl font-black text-[#2c1c07]">{task.monthName}</span>
            {bannerSeason ? (
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#7a5b28]">{bannerSeason.label}</span>
            ) : null}
          </div>
          {typeof task.days === "number" ? (
            <CalendarGrid days={task.days} startWeekday={task.startWeekday ?? 0} monthLabel={task.monthName} />
          ) : null}
        </div>
      ) : null}
      {useText ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(task.textOptions ?? []).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => (value === task.correctTextOption ? onCorrect() : onWrong())}
              className="relative flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={value} /></span>
              {value}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {(task.options ?? []).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
              className="relative flex min-h-[80px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-3xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${value} days`} /></span>
              {value}
            </button>
          ))}
        </div>
      )}
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
  if (task.scene === "between") return <BetweenScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "whichCount") return <WhichCountScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "until") return <UntilScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "eventCompare" || task.scene === "eventPlan") return <EventChoiceScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "months") return <MonthsScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <StepScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
