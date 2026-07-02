"use client";

import { useState } from "react";
import { Compass, ArrowRight } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsEventBadge } from "@/components/measurelands/MeasurelandsEventBadge";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type TimeTask = Extract<PracticeTask, { kind: "timeSequence" }>;
type When = "yesterday" | "today" | "tomorrow";

const WHEN_LABEL: Record<When, string> = { yesterday: "Yesterday", today: "Today", tomorrow: "Tomorrow" };
const WHEN_ORDER: Record<When, number> = { yesterday: 0, today: 1, tomorrow: 2 };

/* ── Gold/violet Meazurex shell (matches the Calendar Quest cards) ── */
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

/* ── A single event tile on the timeline ── */
function EventTile({ when, label, icon, today }: { when: When; label: string; icon: string; today: boolean }) {
  return (
    <div
      className="flex w-[116px] shrink-0 flex-col items-center gap-2 rounded-[22px] border-2 px-3 py-3 text-center"
      style={{
        borderColor: today ? "rgba(91,33,182,0.7)" : "rgba(214,184,108,0.55)",
        background: today ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.92)",
      }}
    >
      <span className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: today ? "#5b21b6" : "#a98b52" }}>
        {WHEN_LABEL[when]}
      </span>
      <MeasurelandsEventBadge iconKey={icon} label={label} size="lg" />
      <span className="text-sm font-black leading-tight text-[#2c1c07]">{label}</span>
    </div>
  );
}

/* ── A horizontal Yesterday -> Today -> Tomorrow timeline of placed events ── */
function Timeline({ slots }: { slots: TimeTask["slots"] }) {
  const ordered = [...(slots ?? [])].sort((a, b) => WHEN_ORDER[a.when] - WHEN_ORDER[b.when]);
  return (
    <div className="mx-auto flex max-w-[480px] flex-wrap items-center justify-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(252,244,225,0.98))] p-4 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
      {ordered.map((s, i) => (
        <div key={s.when} className="flex items-center gap-2">
          <EventTile when={s.when} label={s.label} icon={s.icon} today={s.when === "today"} />
          {i < ordered.length - 1 ? <ArrowRight className="h-7 w-7 shrink-0 text-[#b4781e]" strokeWidth={3} /> : null}
        </div>
      ))}
    </div>
  );
}

/* ── Text option buttons (with an event icon when the option is an event) ── */
function TextOptions({
  options,
  correct,
  iconByLabel,
  onCorrect,
  onWrong,
}: {
  options: string[];
  correct?: string;
  iconByLabel?: Record<string, string>;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((value) => {
        const iconKey = iconByLabel?.[value];
        return (
          <button
            key={value}
            type="button"
            onClick={() => (value === correct ? onCorrect() : onWrong())}
            className="relative flex min-h-[72px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={value} /></span>
            {iconKey ? <MeasurelandsEventBadge iconKey={iconKey} label={value} size="md" /> : null}
            {value}
          </button>
        );
      })}
    </div>
  );
}

/* ── Intro / teaching: Tuesday -> Wednesday (Today) ── */
function IntroScene({ task, onCorrect }: { task: TimeTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">Yesterday means the day before today.</p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">If today is Wednesday, yesterday was Tuesday.</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-5">
          {[
            { day: "Tuesday", sub: "Yesterday", today: false },
            { day: "Wednesday", sub: "Today", today: true },
          ].map((d, i) => (
            <div key={d.day} className="flex items-center gap-3">
              <div
                className="flex w-[130px] flex-col items-center gap-1 rounded-[20px] border-2 px-3 py-4 text-center"
                style={{
                  borderColor: d.today ? "rgba(91,33,182,0.7)" : "rgba(214,184,108,0.55)",
                  background: d.today ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.92)",
                }}
              >
                <span className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: d.today ? "#5b21b6" : "#a98b52" }}>{d.sub}</span>
                <span className="text-xl font-black text-[#2c1c07]">{d.day}</span>
              </div>
              {i < 1 ? <ArrowRight className="h-7 w-7 text-[#b4781e]" strokeWidth={3} /> : null}
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

/* ── Which event happened [yesterday/today]? / Which came first? (timeline + MCQ) ── */
function PickScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const iconByLabel = Object.fromEntries((task.slots ?? []).map((s) => [s.label, s.icon]));
  return (
    <Shell badge={task.badgeLabel ?? "Time Journey"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <Timeline slots={task.slots} />
      <TextOptions
        options={task.textOptions ?? []}
        correct={task.correctTextOption}
        iconByLabel={iconByLabel}
        onCorrect={onCorrect}
        onWrong={onWrong}
      />
    </Shell>
  );
}

/* ── What comes next? / Plan tomorrow (timeline + a glowing future tile + MCQ) ── */
function NextScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const iconByLabel = Object.fromEntries((task.buildItems ?? []).map((it) => [it.label, it.icon]));
  return (
    <Shell badge={task.badgeLabel ?? "What Comes Next?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mx-auto flex max-w-[480px] flex-wrap items-center justify-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(252,244,225,0.98))] p-4 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        {[...(task.slots ?? [])]
          .sort((a, b) => WHEN_ORDER[a.when] - WHEN_ORDER[b.when])
          .map((s) => (
            <div key={s.when} className="flex items-center gap-2">
              <EventTile when={s.when} label={s.label} icon={s.icon} today={s.when === "today"} />
              <ArrowRight className="h-7 w-7 shrink-0 text-[#b4781e]" strokeWidth={3} />
            </div>
          ))}
        {/* glowing future "?" tile */}
        <div
          className="flex w-[116px] shrink-0 flex-col items-center gap-2 rounded-[22px] border-2 border-dashed px-3 py-3 text-center shadow-[0_0_22px_rgba(124,58,237,0.35)]"
          style={{ borderColor: "rgba(124,58,237,0.7)", background: "rgba(124,58,237,0.12)" }}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#7c3aed]">Tomorrow</span>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[rgba(124,58,237,0.5)] bg-white text-3xl font-black text-[#7c3aed]">?</span>
          <span className="text-sm font-black leading-tight text-[#7c3aed]">Coming up</span>
        </div>
      </div>
      <TextOptions
        options={task.textOptions ?? []}
        correct={task.correctTextOption}
        iconByLabel={iconByLabel}
        onCorrect={onCorrect}
        onWrong={onWrong}
      />
    </Shell>
  );
}

/* ── What does yesterday mean? (definition MCQ, no timeline) ── */
function MeaningScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "What Does It Mean?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-1 gap-3">
        {(task.textOptions ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctTextOption ? onCorrect() : onWrong())}
            className="relative flex min-h-[64px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={value} /></span>
            {value}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Build the timeline: tap the events into Yesterday -> Today -> Tomorrow order ── */
function BuildScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.buildItems ?? [];
  const expected = task.orderedWhen ?? [];
  const [placed, setPlaced] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const byLabel = (label: string) => items.find((it) => it.label === label);
  const tray = items.filter((it) => !placed.includes(it.label));

  function pick(label: string) {
    if (locked || placed.includes(label)) return;
    const item = byLabel(label);
    if (!item) return;
    const slotIndex = placed.length;
    if (item.when !== expected[slotIndex]) {
      onWrong();
      return;
    }
    const next = [...placed, label];
    setPlaced(next);
    if (next.length === expected.length) {
      setLocked(true);
      window.setTimeout(onCorrect, 450);
    }
  }

  return (
    <Shell badge={task.badgeLabel ?? "Build the Timeline"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {/* timeline slots filling left -> right */}
      <div className="mx-auto flex max-w-[480px] flex-wrap items-center justify-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[linear-gradient(180deg,rgba(255,252,245,0.98),rgba(252,244,225,0.98))] p-4">
        {expected.map((when, i) => {
          const filledLabel = placed[i];
          const item = filledLabel ? byLabel(filledLabel) : null;
          return (
            <div key={when} className="flex items-center gap-2">
              {item ? (
                <EventTile when={item.when} label={item.label} icon={item.icon} today={item.when === "today"} />
              ) : (
                <div
                  className="flex h-[120px] w-[116px] shrink-0 flex-col items-center justify-center gap-1 rounded-[22px] border-2 border-dashed px-2 text-center"
                  style={{ borderColor: "rgba(214,184,108,0.6)", background: "rgba(255,248,232,0.5)" }}
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{WHEN_LABEL[when]}</span>
                  <span className="text-xs font-bold text-[#a98b52]">tap an event</span>
                </div>
              )}
              {i < expected.length - 1 ? <ArrowRight className="h-7 w-7 shrink-0 text-[#b4781e]" strokeWidth={3} /> : null}
            </div>
          );
        })}
      </div>
      {/* tray of shuffled events */}
      <div className="grid grid-cols-3 gap-3">
        {tray.length === 0 ? (
          <div className="col-span-3 text-center text-sm font-black uppercase tracking-[0.14em] text-[#5b21b6]">Timeline complete!</div>
        ) : (
          tray.map((it) => {
            return (
              <button
                key={it.label}
                type="button"
                onClick={() => pick(it.label)}
                disabled={locked}
                className="flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-[22px] border-2 border-[rgba(214,184,108,0.55)] bg-white px-2 py-2 text-center transition hover:-translate-y-0.5"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#a98b52]">{WHEN_LABEL[it.when]}</span>
                <MeasurelandsEventBadge iconKey={it.icon} label={it.label} size="md" />
                <span className="text-xs font-black leading-tight text-[#2c1c07]">{it.label}</span>
              </button>
            );
          })
        )}
      </div>
    </Shell>
  );
}

/* ── Sort the events into Yesterday / Today / Tomorrow columns ── */
function SortScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.buildItems ?? [];
  const columns = task.orderedWhen ?? ["yesterday", "today", "tomorrow"];
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, When>>({});
  const [locked, setLocked] = useState(false);
  const byLabel = (label: string) => items.find((it) => it.label === label);
  const tray = items.filter((it) => !(it.label in placed));

  function tapColumn(col: When) {
    if (locked || !selected) return;
    const item = byLabel(selected);
    if (!item) return;
    if (item.when !== col) {
      setSelected(null);
      onWrong();
      return;
    }
    const next = { ...placed, [selected]: col };
    setSelected(null);
    setPlaced(next);
    if (Object.keys(next).length === items.length) {
      setLocked(true);
      window.setTimeout(onCorrect, 450);
    }
  }

  return (
    <Shell badge={task.badgeLabel ?? "Sort the Events"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {/* columns */}
      <div className="grid grid-cols-3 gap-2">
        {columns.map((col) => {
          const here = items.filter((it) => placed[it.label] === col);
          return (
            <button
              key={col}
              type="button"
              onClick={() => tapColumn(col)}
              disabled={locked || !selected}
              className="flex min-h-[150px] flex-col items-center gap-2 rounded-[22px] border-2 px-2 py-3 transition disabled:cursor-default"
              style={{
                borderColor: col === "today" ? "rgba(91,33,182,0.7)" : "rgba(214,184,108,0.55)",
                background: col === "today" ? "rgba(124,58,237,0.1)" : "rgba(255,252,245,0.9)",
                boxShadow: selected && !locked ? "0 2px 0 rgba(180,120,20,0.12)" : undefined,
              }}
            >
              <span className="text-[11px] font-black uppercase tracking-[0.14em]" style={{ color: col === "today" ? "#5b21b6" : "#a98b52" }}>
                {WHEN_LABEL[col]}
              </span>
              {here.map((it) => {
                return (
                  <span key={it.label} className="flex flex-col items-center gap-1 rounded-[16px] border-2 border-[rgba(124,58,237,0.4)] bg-white px-2 py-1.5">
                    <MeasurelandsEventBadge iconKey={it.icon} label={it.label} size="md" />
                    <span className="text-[11px] font-black leading-tight text-[#2c1c07]">{it.label}</span>
                  </span>
                );
              })}
            </button>
          );
        })}
      </div>
      {/* tray of events to sort */}
      <div className="grid grid-cols-3 gap-3">
        {tray.length === 0 ? (
          <div className="col-span-3 text-center text-sm font-black uppercase tracking-[0.14em] text-[#5b21b6]">All sorted!</div>
        ) : (
          tray.map((it) => {
            const isSel = selected === it.label;
            return (
              <button
                key={it.label}
                type="button"
                onClick={() => setSelected(isSel ? null : it.label)}
                disabled={locked}
                className="flex min-h-[84px] flex-col items-center justify-center gap-1 rounded-[22px] border-2 px-2 py-2 text-center transition hover:-translate-y-0.5"
                style={{
                  borderColor: isSel ? "rgba(91,33,182,0.8)" : "rgba(214,184,108,0.55)",
                  background: isSel ? "rgba(124,58,237,0.12)" : "white",
                }}
              >
                <MeasurelandsEventBadge iconKey={it.icon} label={it.label} size="md" />
                <span className="text-xs font-black leading-tight text-[#2c1c07]">{it.label}</span>
              </button>
            );
          })
        )}
      </div>
      <p className="text-center text-xs font-bold text-[#a98b52]">{selected ? "Now tap a column" : "Tap an event, then tap its column"}</p>
    </Shell>
  );
}

export function MeasurelandsTimeSequenceCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: TimeTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "meaning") return <MeaningScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "build") return <BuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "sort") return <SortScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "next") return <NextScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <PickScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
