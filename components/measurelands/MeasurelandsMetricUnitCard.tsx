"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type MetricTask = Extract<PracticeTask, { kind: "metricUnit" }>;

const ATTR_TINT: Record<string, string> = {
  length: "rgba(91,33,182,0.08)",
  mass: "rgba(180,83,9,0.08)",
  capacity: "rgba(14,116,144,0.08)",
  temperature: "rgba(190,24,93,0.08)",
};

function Shell({ badge, prompt, speakText, children }: { badge: string; prompt: string; speakText?: string; children: React.ReactNode }) {
  return (
    <div className="measurelands-shell space-y-4">
      <div className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]" style={{ borderColor: "rgba(214,184,108,0.38)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>{badge}</div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

/* The object being measured, shown big in its context. */
function ObjectPanel({ task }: { task: MetricTask }) {
  const o = task.object;
  if (!o) return null;
  return (
    <div className="flex flex-col items-center rounded-[26px] border border-[rgba(214,184,108,0.4)] p-4" style={{ background: ATTR_TINT[task.attribute ?? "length"] ?? "rgba(255,252,245,0.96)" }}>
      {o.context ? <div className="mb-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{o.context}</div> : null}
      <div className="text-6xl leading-none">{o.emoji}</div>
      <div className="mt-2 text-xl font-black text-[#2c1c07]">{o.label}</div>
      {task.statement ? <div className="mt-2 rounded-full border border-[rgba(192,86,78,0.5)] bg-[rgba(252,224,224,0.5)] px-3 py-1 text-sm font-bold text-[#8a2b24]">“{task.statement}”</div> : null}
      {task.note ? <div className="mt-2 text-center text-sm font-semibold text-[#5a4423]">{task.note}</div> : null}
    </div>
  );
}

/* Shared unit-chip picker for chooseUnit / accuracyPick / spotMistake. */
function UnitPickScene({ task, onCorrect, onWrong }: { task: MetricTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const pick = (o: string) => {
    if (o === task.correctOption) onCorrect();
    else { setWrong(o); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Choose the Unit"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <ObjectPanel task={task} />
      <div className={`grid gap-3 ${(task.options ?? []).length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
        {(task.options ?? []).map((o) => (
          <button key={o} type="button" onClick={() => pick(o)} className={`relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 px-3 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === o ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={o} /></span>{o}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* Sort objects into unit bins (tap an object, then tap its bin). */
function SortScene({ task, onCorrect, onWrong }: { task: MetricTask; onCorrect: () => void; onWrong: () => void }) {
  const bins = task.bins ?? [];
  const items = task.metricItems ?? [];
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [badBin, setBadBin] = useState<string | null>(null);
  const remaining = items.filter((it) => !placed[it.id]);

  const tapBin = (unit: string) => {
    if (!sel) return;
    const item = items.find((it) => it.id === sel)!;
    if (item.unit === unit) {
      const next = { ...placed, [sel]: unit };
      setPlaced(next);
      setSel(null);
      if (Object.keys(next).length === items.length) onCorrect();
    } else {
      setBadBin(unit); onWrong(); window.setTimeout(() => setBadBin(null), 500);
    }
  };

  return (
    <Shell badge={task.badgeLabel ?? "Sort the Objects"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={`grid gap-3 ${bins.length >= 4 ? "grid-cols-2 sm:grid-cols-4" : `grid-cols-${Math.max(2, bins.length)}`}`}>
        {bins.map((b) => (
          <button key={b.unit} type="button" onClick={() => tapBin(b.unit)} className={`flex min-h-[130px] flex-col rounded-[22px] border-2 p-2 text-center transition ${badBin === b.unit ? "border-[#C0564E] bg-[rgba(252,224,224,0.5)]" : sel ? "border-[#5b21b6] bg-[rgba(91,33,182,0.06)] hover:-translate-y-0.5" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
            <div className="text-lg font-black text-[#5b21b6]">{b.unit}</div>
            <div className="text-[11px] font-bold leading-tight text-[#a98b52]">{b.label}</div>
            <div className="mt-1 flex flex-1 flex-wrap content-start justify-center gap-1">
              {items.filter((it) => placed[it.id] === b.unit).map((it) => (
                <span key={it.id} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-black text-[#2c1c07] shadow-sm">{it.emoji}{it.label}</span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2 rounded-[20px] border border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.95)] p-3">
        {remaining.length === 0 ? (
          <span className="text-sm font-bold text-[#5a4423]">All sorted — nice work!</span>
        ) : (
          remaining.map((it) => (
            <button key={it.id} type="button" onClick={() => setSel(it.id)} className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-2 text-base font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${sel === it.id ? "border-[#5b21b6] bg-[rgba(91,33,182,0.1)]" : "border-[rgba(214,184,108,0.6)] bg-[#fffaf0]"}`}>
              <span className="text-xl">{it.emoji}</span>{it.label}
            </button>
          ))
        )}
      </div>
      <div className="text-center text-[12px] font-bold text-[#a98b52]">{sel ? "Now tap the unit that fits it best." : "Tap an object, then tap the best unit for it."}</div>
    </Shell>
  );
}

/* Choose the tool AND the unit (both must be right). */
function ToolUnitScene({ task, onCorrect, onWrong }: { task: MetricTask; onCorrect: () => void; onWrong: () => void }) {
  const [tool, setTool] = useState<string | null>(null);
  const [wrongTool, setWrongTool] = useState<string | null>(null);
  const [wrongUnit, setWrongUnit] = useState<string | null>(null);
  const pickTool = (id: string) => {
    if (id === task.correctTool) { setTool(id); setWrongTool(null); }
    else { setWrongTool(id); onWrong(); window.setTimeout(() => setWrongTool(null), 600); }
  };
  const pickUnit = (o: string) => {
    if (!tool) return;
    if (o === task.correctOption) onCorrect();
    else { setWrongUnit(o); onWrong(); window.setTimeout(() => setWrongUnit(null), 600); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Tool + Unit"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <ObjectPanel task={task} />
      <div>
        <div className="mb-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#5b21b6]">1 · Choose the tool</div>
        <div className="grid grid-cols-3 gap-3">
          {(task.tools ?? []).map((t) => (
            <button key={t.id} type="button" onClick={() => pickTool(t.id)} className={`flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-[22px] border-2 px-2 text-center text-sm font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrongTool === t.id ? "border-[#C0564E] bg-[#FCE0E0]" : tool === t.id ? "border-[#5b21b6] bg-[rgba(91,33,182,0.1)]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
              <span className="text-3xl">{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
      </div>
      <div className={tool ? "" : "pointer-events-none opacity-45"}>
        <div className="mb-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#5b21b6]">2 · Choose the unit</div>
        <div className={`grid gap-3 ${(task.options ?? []).length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
          {(task.options ?? []).map((o) => (
            <button key={o} type="button" onClick={() => pickUnit(o)} className={`min-h-[56px] rounded-[22px] border-2 px-3 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrongUnit === o ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>{o}</button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* Pick the reason a unit is best. */
function JustifyScene({ task, onCorrect, onWrong }: { task: MetricTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const pick = (r: string) => {
    if (r === task.correctReason) onCorrect();
    else { setWrong(r); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Explain Your Choice"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <ObjectPanel task={task} />
      <div className="grid gap-3">
        {(task.reasonOptions ?? []).map((r) => (
          <button key={r} type="button" onClick={() => pick(r)} className={`relative flex min-h-[58px] items-center justify-center rounded-[22px] border-2 px-4 text-base font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === r ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={r} /></span>{r}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* Intro / teaching briefing with a unit ladder. */
function IntroScene({ task, onCorrect }: { task: MetricTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Choose the unit first</span>
          <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-2 py-0.5 text-[11px] font-black text-[#5b21b6]">then measure</span>
        </div>
        <p className="text-[16px] font-bold leading-snug text-[#2c1c07]">
          Master measurers don&apos;t always use the same unit — they pick the one that <span className="font-black text-[#5b21b6]">matches the size</span> of what they&apos;re measuring.
        </p>
      </div>
      {task.ladder?.length ? (
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
          <div className="mb-2 text-center text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Small unit → big unit</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {task.ladder.map((l) => (
              <div key={l.unit} className="flex flex-col items-center rounded-[18px] border border-[rgba(214,184,108,0.5)] bg-white p-2 text-center">
                <div className="text-3xl leading-none">{l.emoji}</div>
                <div className="mt-1 text-lg font-black text-[#5b21b6]">{l.unit}</div>
                <div className="text-[11px] font-semibold leading-tight text-[#5a4423]">{l.example}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s decide! →</button>
    </Shell>
  );
}

export function MeasurelandsMetricUnitCard({ task, onCorrect, onWrong }: { task: MetricTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "sortBins": return <SortScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "toolAndUnit": return <ToolUnitScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "justify": return <JustifyScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <UnitPickScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
