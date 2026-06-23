"use client";

import { useState } from "react";
import { Compass, ArrowRight, RotateCw } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type WeekTask = Extract<PracticeTask, { kind: "weekCycle" }>;
type DayCard = { id: string; imageSrc?: string; label: string };

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

function Day({ day, size = 64, dim = false }: { day: DayCard; size?: number; dim?: boolean }) {
  return (
    <div className="flex flex-col items-center" style={{ opacity: dim ? 0.5 : 1 }}>
      {day.imageSrc ? (
        <img src={day.imageSrc} alt={day.label} className="object-contain" style={{ height: size, width: size }} />
      ) : (
        <div className="flex items-center justify-center rounded-xl bg-[rgba(214,184,108,0.15)]" style={{ height: size, width: size }} />
      )}
      <div className="mt-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#7c4a12]">{day.label}</div>
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
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">A week is made of seven days.</p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">After Sunday, a new week begins — weeks repeat over and over.</p>
          </div>
        </div>

        <div className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-3">
          <WeekStrip days={days} />
          <div className="mt-3 flex items-center justify-center gap-2">
            {days[6] ? <Day day={days[6]} size={44} /> : null}
            <RotateCw className="h-6 w-6 text-[#5b21b6]" />
            {days[0] ? <Day day={days[0]} size={44} /> : null}
            <span className="ml-1 text-sm font-bold text-[#5f4725]">the cycle repeats</span>
          </div>
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
          <span className="text-sm font-bold text-[#a98b52]">Tap the days in order, Monday first.</span>
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
  return (
    <div className="grid grid-cols-3 gap-3">
      {(task.choices ?? []).map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => (d.id === task.correctOptionId ? onCorrect() : onWrong())}
          className="relative flex items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] p-2 shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={d.label} /></span>
          <Day day={d} size={56} />
        </button>
      ))}
    </div>
  );
}

/* ── Activity C: what comes next? (cycle wraps Sunday → Monday) ── */
function NextScene({ task, onCorrect, onWrong }: { task: WeekTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "What Comes Next?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {(task.sequence ?? []).map((d) => <Day key={d.id} day={d} size={52} />)}
        <ArrowRight className="mx-1 h-6 w-6 text-[#5b21b6]" />
        <GapSlot size={52} />
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
        <WeekStrip days={task.strip ?? []} brace={false} />
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
  if (task.scene === "build") return <BuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "count") return <CountScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "next") return <NextScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "missing") return <MissingScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <WhichWeekScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
