"use client";

import { useState } from "react";
import { Compass, Check, Scale } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type MassTask = Extract<PracticeTask, { kind: "massMeasure" }>;

/* ── The Level 1 mass unit: a brass/stone balance cube ── */
function BalanceCube({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="cube-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3dd9b" />
          <stop offset="100%" stopColor="#dcb863" />
        </linearGradient>
        <linearGradient id="cube-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9c7a35" />
          <stop offset="100%" stopColor="#7c5f25" />
        </linearGradient>
        <linearGradient id="cube-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c19a45" />
          <stop offset="100%" stopColor="#9c7a35" />
        </linearGradient>
      </defs>
      <path d="M24 6l16 9-16 9-16-9Z" fill="url(#cube-top)" stroke="#5f4715" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 15l16 9v16l-16-9Z" fill="url(#cube-left)" stroke="#5f4715" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M40 15l-16 9v16l16-9Z" fill="url(#cube-right)" stroke="#5f4715" strokeWidth="1.4" strokeLinejoin="round" />
      {/* rivet on the top face — reads as a weight */}
      <circle cx="24" cy="15" r="2.4" fill="#fff3cf" stroke="#8a6a22" strokeWidth="1" />
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

/* ── A live balance scale: object on the left pan, N cubes on the right ──
 * Object mass == cube count, so the beam sits level (a fair measurement). */
function BalanceScale({
  imageSrc,
  label,
  cubes,
  showCount = false,
  compact = false,
  unitSizes,
}: {
  imageSrc?: string;
  label: string;
  cubes: number;
  showCount?: boolean;
  compact?: boolean;
  /** Mixed cube sizes (unfair when not all equal). Overrides `cubes`. */
  unitSizes?: number[];
}) {
  const objSize = compact ? 52 : 66;
  const cubeSize = compact ? 22 : 28;
  const sizes = unitSizes ?? Array.from({ length: cubes }, () => cubeSize);
  const Pan = ({ children }: { children: React.ReactNode }) => (
    <div className="flex w-[44%] flex-col items-center">
      <div
        className="flex min-h-[72px] w-full flex-wrap items-end justify-center gap-1 rounded-b-[40px] rounded-t-[12px] border-2 px-2 pb-2 pt-3"
        style={{ borderColor: "rgba(214,184,108,0.6)", background: "rgba(255,255,255,0.94)", boxShadow: "inset 0 -6px 12px rgba(180,120,20,0.12)" }}
      >
        {children}
      </div>
      <div className="mt-1 h-5 w-px bg-[#b9914e]" />
    </div>
  );
  return (
    <div className="relative mx-auto max-w-[440px] rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
      {/* balance indicator: a centred, upright needle = the scale is level/balanced */}
      <div className="relative mx-auto mb-0.5 h-4 w-full">
        <div className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 bg-[rgba(180,120,20,0.3)]" />
        <div className="absolute bottom-0 left-1/2 h-4 w-[3px] -translate-x-1/2 rounded-full bg-[#b45309]" />
        <div className="absolute bottom-[13px] left-1/2 h-2 w-2 -translate-x-1/2 rounded-full border border-[#8a5a16] bg-[#d6b86c]" />
      </div>
      {/* level beam (balanced) */}
      <div className="relative mx-auto h-3 w-[88%] rounded-full" style={{ background: "linear-gradient(90deg,#b45309,#d6b86c,#b45309)" }} />
      <div className="mt-1 flex items-start justify-between">
        <Pan>
          {imageSrc ? (
            <img src={imageSrc} alt={label} className="object-contain" style={{ width: objSize, height: objSize }} />
          ) : (
            <span className="px-2 pb-2 text-sm font-black text-[#5f4725]">{label}</span>
          )}
        </Pan>
        <Pan>
          {sizes.map((s, i) => (
            <BalanceCube key={i} size={s} />
          ))}
        </Pan>
      </div>
      {/* fulcrum */}
      <div className="mx-auto mt-1 h-0 w-0" style={{ borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderBottom: "26px solid #8a5a16" }} />
      <div className="mx-auto h-2 w-28 rounded-full bg-[#8a5a16]" />
      <div className="mt-2 text-center text-sm font-black uppercase tracking-[0.14em] text-[#7c4a12]">
        {label}{showCount ? ` · ${cubes} cubes` : ""}
      </div>
    </div>
  );
}

/* ── Intro / teaching ── */
function IntroScene({ task, onCorrect }: { task: MassTask; onCorrect: () => void }) {
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
              Now we can measure mass with balance cubes.
            </p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">
              Using the same cube each time keeps it fair. More cubes means greater mass.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {(task.teachingItems ?? []).map((item, idx) => (
            <div key={idx} className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-3">
              <BalanceScale imageSrc={item.imageSrc} label={item.label} cubes={item.cubes} showCount compact />
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

/* ── Activity A/B: count the balance cubes ── */
function CountScene({ task, onCorrect, onWrong }: { task: MassTask; onCorrect: () => void; onWrong: () => void }) {
  const obj = task.object;
  return (
    <Shell badge={task.badgeLabel ?? "Measure with Cubes"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {obj ? <BalanceScale imageSrc={obj.imageSrc} label={obj.label} cubes={obj.cubes} /> : null}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {value}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Activity C: which object has greater / less mass? ── */
function CompareScene({ task, onCorrect, onWrong }: { task: MassTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Who Has Greater Mass?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="rounded-[26px] border border-transparent text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
            <BalanceScale imageSrc={item.imageSrc} label={item.label} cubes={item.cubes} showCount={!task.hideCounts} compact />
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Order the measured masses (tap lightest→heaviest, mirrors length realm) ── */
function OrderScene({ task, onCorrect, onWrong }: { task: MassTask; onCorrect: () => void; onWrong: () => void }) {
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
      else { setPicked([]); setLocked(false); onWrong(); }
    }, 350);
  }

  return (
    <Shell badge={task.badgeLabel ?? "Order the Masses"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mb-3 flex min-h-[52px] flex-wrap items-center justify-center gap-2 rounded-[22px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,248,232,0.75)] px-4 py-3">
        {picked.length === 0 ? (
          <span className="text-sm font-bold text-[#a98b52]">Tap the scales from lightest to heaviest.</span>
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
              className="relative rounded-[26px] text-left transition hover:-translate-y-1 disabled:opacity-70"
            >
              {chosen ? (
                <div className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e] text-sm font-black text-white">{step + 1}</div>
              ) : null}
              <BalanceScale imageSrc={item.imageSrc} label={item.label} cubes={item.cubes} showCount compact />
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

/* ── Find the object with the same mass as the target ── */
function EqualScene({ task, onCorrect, onWrong }: { task: MassTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Find the Same Mass"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.target ? (
        <div className="rounded-[24px] border border-[rgba(167,139,250,0.35)] bg-[rgba(109,40,217,0.06)] p-3">
          <div className="mb-1 text-center text-xs font-black uppercase tracking-[0.16em] text-[#5b21b6]">Match this mass</div>
          <BalanceScale imageSrc={task.target.imageSrc} label={task.target.label} cubes={task.target.cubes} showCount compact />
        </div>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => (item.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="rounded-[26px] text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
            <BalanceScale imageSrc={item.imageSrc} label={item.label} cubes={item.cubes} showCount compact />
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Lesson 3: which measurement is FAIR? (all cubes the same size) ── */
function FairChooseScene({ task, onCorrect, onWrong }: { task: MassTask; onCorrect: () => void; onWrong: () => void }) {
  const arrangements = task.fairArrangements ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Is Fair?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 sm:grid-cols-3">
        {arrangements.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => (a.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="rounded-[26px] text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
            <BalanceScale imageSrc={a.imageSrc} label={a.label} cubes={a.units.length} unitSizes={a.units} compact />
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Lesson 3: is this one measurement fair or not? ── */
function FairJudgeScene({ task, onCorrect, onWrong }: { task: MassTask; onCorrect: () => void; onWrong: () => void }) {
  const obj = task.object;
  return (
    <Shell badge={task.badgeLabel ?? "Fair or Unfair?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        <BalanceScale imageSrc={obj?.imageSrc} label={obj?.label ?? ""} cubes={(task.fairUnits ?? []).length} unitSizes={task.fairUnits} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => (opt === !!task.fair ? onCorrect() : onWrong())}
            className="flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {opt ? "Fair" : "Not fair"}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Lesson 3: fix an unfair measurement → use the same cubes ── */
function FairFixScene({ task, onCorrect }: { task: MassTask; onCorrect: () => void }) {
  const obj = task.object;
  const units = task.fairUnits ?? [];
  const [fixed, setFixed] = useState(false);
  function fix() {
    if (fixed) return;
    setFixed(true);
    window.setTimeout(() => onCorrect(), 550);
  }
  return (
    <Shell badge={task.badgeLabel ?? "Fix the Measurement"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        <BalanceScale
          imageSrc={obj?.imageSrc}
          label={obj?.label ?? ""}
          cubes={units.length}
          unitSizes={fixed ? undefined : units}
        />
      </div>
      <button
        type="button"
        onClick={fix}
        disabled={fixed}
        className="flex min-h-[72px] w-full items-center justify-center gap-2 rounded-[22px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fffaf0] text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
      >
        {fixed ? <Check className="h-6 w-6 text-emerald-600" /> : <Scale className="h-6 w-6" />}
        {fixed ? "Fair now!" : "Use the same cubes"}
      </button>
    </Shell>
  );
}

export function MeasurelandsMassMeasureCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: MassTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "compare") return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "order") return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "equal") return <EqualScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "fairChoose") return <FairChooseScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "fairJudge") return <FairJudgeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "fairFix") return <FairFixScene task={task} onCorrect={onCorrect} />;
  return <CountScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
