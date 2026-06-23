"use client";

import { Compass } from "lucide-react";
import { useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type CapacityTask = Extract<PracticeTask, { kind: "capacityMeasure" }>;

/* ── The Level 1 capacity unit: a measuring cup with water ── */
function CupUnit({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="cup-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fd3f2" />
          <stop offset="100%" stopColor="#3f93bd" />
        </linearGradient>
      </defs>
      {/* cup body (tapered) */}
      <path d="M13 14 H35 L32 40 a2 2 0 0 1 -2 2 H18 a2 2 0 0 1 -2 -2 Z" fill="#fffaf0" stroke="#2c6a8c" strokeWidth="2" strokeLinejoin="round" />
      {/* water */}
      <path d="M14.4 19 H33.6 L31.6 36 a2 2 0 0 1 -2 1.8 H18.4 a2 2 0 0 1 -2 -1.8 Z" fill="url(#cup-water)" />
      {/* rim */}
      <rect x="11" y="11" width="26" height="5" rx="2.5" fill="#e7d6a6" stroke="#2c6a8c" strokeWidth="2" />
      {/* handle */}
      <path d="M35 20 a7 7 0 0 1 0 12" fill="none" stroke="#2c6a8c" strokeWidth="2.4" />
    </svg>
  );
}

/* ── Gold/violet Meazurex shell (matches the other Measurelands cards) ── */
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

/* ── A measured container: the container image above a countable row of cups ── */
function CapacityMeasure({
  imageSrc,
  label,
  cups,
  showCount = false,
  compact = false,
}: {
  imageSrc?: string;
  label: string;
  cups: number;
  showCount?: boolean;
  compact?: boolean;
}) {
  const objH = compact ? 64 : 88;
  const cupSize = compact ? 24 : 30;
  return (
    <div className="flex flex-col items-center">
      {imageSrc ? (
        <img src={imageSrc} alt={label} className="object-contain drop-shadow-[0_8px_14px_rgba(76,40,10,0.18)]" style={{ height: objH }} />
      ) : null}
      <div
        className="mt-2 flex w-full flex-wrap items-center justify-center gap-1 rounded-[18px] border-2 px-2 py-2"
        style={{ borderColor: "rgba(214,184,108,0.55)", background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(236,248,255,0.9))" }}
      >
        {Array.from({ length: cups }).map((_, i) => (
          <CupUnit key={i} size={cupSize} />
        ))}
      </div>
      <div className="mt-1 text-center text-sm font-black uppercase tracking-[0.14em] text-[#7c4a12]">
        {label}{showCount ? ` · ${cups} cups` : ""}
      </div>
    </div>
  );
}

/* ── Intro / teaching ── */
function IntroScene({ task, onCorrect }: { task: CapacityTask; onCorrect: () => void }) {
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
              Now we can measure how much a container holds.
            </p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">
              Fill it with the same cup each time, then count the cups. More cups means it holds more.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(task.teachingItems ?? []).map((item, idx) => (
            <div key={idx} className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-3">
              <CapacityMeasure imageSrc={item.imageSrc} label={item.label} cups={item.cups} showCount compact />
              {item.caption ? <div className="mt-2 text-center text-sm font-bold text-[#5f4725]">{item.caption}</div> : null}
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
            Start Measuring
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ── Activity A/B: count the cups ── */
function CountScene({ task, onCorrect, onWrong }: { task: CapacityTask; onCorrect: () => void; onWrong: () => void }) {
  const c = task.container;
  return (
    <Shell badge={task.badgeLabel ?? "Fill with Cups"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {c ? <CapacityMeasure imageSrc={c.imageSrc} label={c.label} cups={c.cups} /> : null}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={String(value)} />
            </span>
            {value}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Activity C: which holds more / less? ── */
function CompareScene({ task, onCorrect, onWrong }: { task: CapacityTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Holds More?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-3 text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={`${item.label}, ${item.cups} cups`} />
            </span>
            <CapacityMeasure imageSrc={item.imageSrc} label={item.label} cups={item.cups} showCount={!task.hideCounts} compact />
          </button>
        ))}
      </div>
    </Shell>
  );
}

function OrderScene({ task, onCorrect, onWrong }: { task: CapacityTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  const expected = task.orderedIds ?? [];
  const [picked, setPicked] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  function pick(id: string) {
    if (locked || picked.includes(id)) return;
    const next = [...picked, id];
    setPicked(next);
    if (next.length !== expected.length) return;
    const correct = expected.every((eid, i) => next[i] === eid);
    setLocked(true);
    window.setTimeout(() => {
      if (correct) onCorrect();
      else {
        setPicked([]);
        setLocked(false);
        onWrong();
      }
    }, 350);
  }

  return (
    <Shell badge={task.badgeLabel ?? "Order the Capacities"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mb-3 flex min-h-[52px] flex-wrap items-center justify-center gap-2 rounded-[22px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,248,232,0.75)] px-4 py-3">
        {picked.length === 0 ? (
          <span className="text-sm font-bold text-[#a98b52]">Tap the containers from smallest to largest capacity.</span>
        ) : (
          picked.map((id, idx) => {
            const it = items.find((c) => c.id === id);
            return (
              <div key={id} className="inline-flex items-center gap-2 rounded-full border border-[rgba(214,184,108,0.4)] bg-white px-3 py-2 text-sm font-black text-[#5f4725]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f5d791] text-[#2c1c07]">{idx + 1}</span>
                {it?.label}
              </div>
            );
          })
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const step = picked.indexOf(item.id);
          const chosen = step >= 0;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => pick(item.id)}
              disabled={locked || chosen}
              className="relative rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-3 text-left transition hover:-translate-y-1 disabled:opacity-70"
            >
              <span className="absolute right-3 top-3 z-10">
                <OptionReadAloudButton text={`${item.label}, ${item.cups} cups`} />
              </span>
              {chosen ? (
                <div className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e] text-sm font-black text-white">{step + 1}</div>
              ) : null}
              <CapacityMeasure imageSrc={item.imageSrc} label={item.label} cups={item.cups} showCount compact />
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function EqualScene({ task, onCorrect, onWrong }: { task: CapacityTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Find the Same Capacity"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.target ? (
        <div className="rounded-[24px] border border-[rgba(167,139,250,0.35)] bg-[rgba(109,40,217,0.06)] p-3">
          <div className="mb-1 text-center text-xs font-black uppercase tracking-[0.16em] text-[#5b21b6]">Match this capacity</div>
          <CapacityMeasure imageSrc={task.target.imageSrc} label={task.target.label} cups={task.target.cups} showCount compact />
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-3 text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={`${item.label}, ${item.cups} cups`} />
            </span>
            <CapacityMeasure imageSrc={item.imageSrc} label={item.label} cups={item.cups} showCount compact />
          </button>
        ))}
      </div>
    </Shell>
  );
}

export function MeasurelandsCapacityMeasureCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: CapacityTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "compare") return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "order") return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "equal") return <EqualScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <CountScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
