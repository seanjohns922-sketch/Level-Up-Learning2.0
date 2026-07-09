"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsVolumeBuilder, prismCubes, type Cube, type Dims } from "@/components/measurelands/MeasurelandsVolumeBuilder";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type VolumeTask = Extract<PracticeTask, { kind: "volume" }>;

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

function unitLabel(t: VolumeTask): string { return t.unit ?? "cubic units"; }
function unitSpoken(t: VolumeTask): string { return t.unit === "cm³" ? "cubic centimetres" : t.unit === "m³" ? "cubic metres" : "cubic units"; }
function ctxLine(t: VolumeTask) { return t.context ? <div className="text-center text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{t.emoji} {t.context}</div> : null; }
const panel = "rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3";

function LayerToggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return <button type="button" onClick={() => set(!on)} className="mx-auto block rounded-full border-2 border-[rgba(214,184,108,0.6)] bg-white px-4 py-1 text-[12px] font-black uppercase tracking-wide text-[#7c4a12] shadow-sm">{on ? "Hide layers" : "See the layers"}</button>;
}

function OptionRow({ options, correct, unit, spoken, onCorrect, onWrong }: { options: number[]; correct: number; unit: string; spoken: string; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((n) => (
        <button key={n} type="button" onClick={() => (n === correct ? onCorrect() : (setWrong(n), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === n ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
          <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={`${n} ${spoken}`} /></span>{n} {unit}
        </button>
      ))}
    </div>
  );
}

function Keypad({ answer, unit, hint, onCorrect, onWrong }: { answer: number; unit: string; hint: string; onCorrect: () => void; onWrong: () => void }) {
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong">("idle");
  const add = (d: string) => { setStatus("idle"); setTyped((c) => (c === "0" ? d : c.length >= 4 ? c : `${c}${d}`)); };
  const check = () => { if (!typed) return; if (Number(typed) === answer) onCorrect(); else { setStatus("wrong"); onWrong(); } };
  return (
    <div className="rounded-[24px] border-2 border-[rgba(214,184,108,0.52)] bg-white p-3 shadow-sm">
      <div className={`mb-2 flex items-center justify-center gap-2 rounded-[20px] border-2 px-4 py-2 ${status === "wrong" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.58)] bg-[#fffaf0]"}`}>
        <div className="min-w-[64px] text-center text-3xl font-black tabular-nums text-[#2c1c07]">{typed || "?"}</div>
        <div className="text-lg font-black text-[#7c3aed]">{unit}</div>
      </div>
      <div className="mb-2 text-center text-xs font-bold text-[#6b4d23]">{status === "wrong" ? "Try again." : hint}</div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => add(d)} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5">{d}</button>
        ))}
        <button type="button" onClick={() => { setStatus("idle"); setTyped(""); }} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-white py-2.5 text-sm font-black uppercase text-[#7c4a12] shadow-sm">Clear</button>
        <button type="button" onClick={() => add("0")} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm">0</button>
        <button type="button" onClick={check} className="rounded-[16px] border-2 border-[#7c3aed] bg-[#7c3aed] py-2.5 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Go</button>
      </div>
    </div>
  );
}

/* ── L1 Build — tap-to-build, layer by layer ── */
function BuildScene({ task, onCorrect }: { task: VolumeTask; onCorrect: () => void }) {
  const dims = task.dims ?? { l: 3, w: 2, h: 2 };
  const { l, w, h } = dims;
  const perLayer = l * w, total = l * w * h;
  const prefill = task.prefill ?? 0;
  const [cubes, setCubes] = useState<Cube[]>(() => { const c: Cube[] = []; for (let z = 0; z < prefill; z++) for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) c.push({ x, y, z }); return c; });
  const [layer, setLayer] = useState(prefill);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [done, setDone] = useState(prefill >= h);
  const [predicted, setPredicted] = useState(!task.predict);

  const ghost: Cube[] = [];
  if (predicted && celebrate === null && !done) {
    for (let y = 0; y < w; y++) for (let x = 0; x < l; x++) if (!cubes.some((c) => c.x === x && c.y === y && c.z === layer)) ghost.push({ x, y, z: layer });
  }
  const tap = (x: number, y: number) => {
    if (cubes.some((c) => c.x === x && c.y === y && c.z === layer)) return;
    const next = [...cubes, { x, y, z: layer }];
    setCubes(next);
    if (next.filter((c) => c.z === layer).length >= perLayer) {
      setCelebrate(layer);
      window.setTimeout(() => { setCelebrate(null); if (layer + 1 >= h) setDone(true); else setLayer(layer + 1); }, 1150);
    }
  };

  if (!predicted) {
    return (
      <Shell badge={task.badgeLabel ?? "Predict First"} prompt="How many cubes will you need?" speakText={`This prism is ${l} by ${w} by ${h}. Predict how many cubes you will need to fill it, then build it to check.`}>
        <div className={panel}><MeasurelandsVolumeBuilder dims={dims} cubes={[]} outline /></div>
        <Keypad answer={total} unit={unitLabel(task)} hint={`${l} × ${w} × ${h} — predict, then build to check.`} onCorrect={() => setPredicted(true)} onWrong={() => { /* free prediction */ }} />
      </Shell>
    );
  }
  return (
    <Shell badge={task.badgeLabel ?? "Build the Prism"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>
        {ctxLine(task)}
        <MeasurelandsVolumeBuilder dims={dims} cubes={cubes} outline={!done} litLayer={celebrate} tapCells={ghost} onTapCell={tap} />
        {done ? (
          <p className="mt-1 text-center text-base font-black text-[#16a34a]">🎉 You built a {l} × {w} × {h} prism — {total} {unitLabel(task)}!</p>
        ) : celebrate !== null ? (
          <p className="mt-1 text-center text-base font-black text-[#b45309]">✨ Layer {celebrate + 1} complete!</p>
        ) : (
          <div className="mt-1 flex items-center justify-center gap-3 text-sm font-black">
            <span className="rounded-full bg-[rgba(124,58,237,0.12)] px-3 py-1 text-[#7c3aed]">{cubes.length} cubes</span>
            <span className="rounded-full bg-[rgba(245,158,11,0.16)] px-3 py-1 text-[#b45309]">Layer {layer + 1} of {h}</span>
          </div>
        )}
      </div>
      {done ? (
        <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[58px] items-center justify-center rounded-[24px] border-2 border-[#16a34a] bg-[#16a34a] px-10 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Next →</button>
      ) : (
        <p className="text-center text-[13px] font-black text-[#a98b52]">Tap the glowing squares to place cubes.</p>
      )}
    </Shell>
  );
}

/* ── Count / Layers / Cubes-per-layer (MCQ) with a layer-reveal toggle ── */
function McqScene({ task, onCorrect, onWrong, kind }: { task: VolumeTask; onCorrect: () => void; onWrong: () => void; kind: "count" | "layers" | "perLayer" }) {
  const dims = task.dims ?? { l: 3, w: 2, h: 2 };
  const [lift, setLift] = useState(false);
  const correct = task.correctNumber ?? (kind === "layers" ? dims.h : kind === "perLayer" ? dims.l * dims.w : dims.l * dims.w * dims.h);
  const badge = task.badgeLabel ?? (kind === "layers" ? "How Many Layers?" : kind === "perLayer" ? "Cubes Per Layer" : "How Many Cubes?");
  return (
    <Shell badge={badge} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>
        {ctxLine(task)}
        <MeasurelandsVolumeBuilder dims={dims} cubes={prismCubes(dims)} lift={lift} litLayer={lift ? dims.h - 1 : null} />
        <div className="mt-1"><LayerToggle on={lift} set={setLift} /></div>
      </div>
      <OptionRow options={task.options ?? []} correct={correct} unit={kind === "count" || kind === "perLayer" ? unitLabel(task) : "layers"} spoken={kind === "count" || kind === "perLayer" ? unitSpoken(task) : "layers"} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

/* ── Total volume (keypad) with layer readout ── */
function TotalScene({ task, onCorrect, onWrong }: { task: VolumeTask; onCorrect: () => void; onWrong: () => void }) {
  const dims = task.dims ?? { l: 3, w: 2, h: 2 };
  const [lift, setLift] = useState(true);
  const perLayer = dims.l * dims.w, total = task.answerValue ?? dims.l * dims.w * dims.h;
  return (
    <Shell badge={task.badgeLabel ?? "Total Volume"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className={panel}>
          {ctxLine(task)}
          <MeasurelandsVolumeBuilder dims={dims} cubes={prismCubes(dims)} lift={lift} litLayer={lift ? dims.h - 1 : null} />
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2 rounded-[16px] border border-[rgba(214,184,108,0.5)] bg-white px-3 py-2 text-base font-black">
            <span className="rounded-[10px] px-2 py-0.5 text-[#7c3aed]" style={{ background: "rgba(124,58,237,0.12)" }}>{perLayer} per layer</span>
            <span className="text-[#a98b52]">×</span>
            <span className="rounded-[10px] px-2 py-0.5 text-[#b45309]" style={{ background: "rgba(245,158,11,0.16)" }}>{dims.h} layers</span>
          </div>
          <p className="mt-1 text-center text-[12px] font-black text-[#a98b52]">or use the formula: length × width × height = {dims.l} × {dims.w} × {dims.h}</p>
          <div className="mt-1"><LayerToggle on={lift} set={setLift} /></div>
        </div>
        <Keypad answer={total} unit={unitLabel(task)} hint="Cubes per layer × number of layers." onCorrect={onCorrect} onWrong={onWrong} />
      </div>
    </Shell>
  );
}

/* ── L2 formula reveal — expose Volume = length × width × height ── */
function FormulaScene({ task, onCorrect }: { task: VolumeTask; onCorrect: () => void }) {
  const dims = task.dims ?? { l: 4, w: 3, h: 2 };
  const { l, w, h } = dims;
  const per = l * w, total = l * w * h;
  const [step, setStep] = useState(0);
  const steps = [
    { cap: <>You&apos;ve been counting <span className="font-black text-[#7c3aed]">layers</span>. Here&apos;s the pattern…</>, lift: false, lit: null as number | null },
    { cap: <>One layer = <span className="font-black text-[#7c3aed]">length × width</span> = {l} × {w} = {per} cubes.</>, lift: false, lit: 0 },
    { cap: <>Stacked <span className="font-black text-[#b45309]">{h} layers</span> high — that&apos;s the <span className="font-black text-[#b45309]">height</span>.</>, lift: true, lit: h - 1 },
    { cap: <>So the shortcut is:</>, lift: false, lit: null, formula: true },
  ];
  const s = steps[step]!;
  return (
    <Shell badge={task.badgeLabel ?? "The Volume Formula"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <style>{"@keyframes mlSlideIn{0%{opacity:0;transform:translateY(14px) scale(.9)}100%{opacity:1;transform:none}}"}</style>
      <div className="flex flex-col items-center gap-3 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <div className="flex gap-1.5">{steps.map((_, i) => <span key={i} className={`h-2.5 w-7 rounded-full ${i <= step ? "bg-[#5b21b6]" : "bg-[rgba(124,58,237,0.2)]"}`} />)}</div>
        <MeasurelandsVolumeBuilder dims={dims} cubes={prismCubes(dims)} lift={s.lift} litLayer={s.lit} />
        {s.formula ? (
          <div style={{ animation: "mlSlideIn .5s ease-out both" }} className="rounded-[20px] border-2 border-[#5b21b6] bg-[rgba(91,33,182,0.06)] px-5 py-4 text-center">
            <div className="text-xl font-black text-[#5b21b6] sm:text-2xl">Volume = length × width × height</div>
            <div className="mt-1 text-sm font-black text-[#a98b52]">{l} × {w} × {h} = {total} cubic units</div>
          </div>
        ) : null}
        <div className="rounded-[18px] border-2 border-[rgba(91,33,182,0.22)] bg-[rgba(91,33,182,0.05)] px-4 py-3 text-center text-[16px] font-bold text-[#2c1c07]">{s.cap}</div>
        {s.formula ? <p className="text-center text-[13px] font-black text-[#a98b52]">Count the layers OR use the formula — both work!</p> : null}
      </div>
      {step < steps.length - 1 ? (
        <button type="button" onClick={() => setStep((v) => v + 1)} className="mx-auto flex min-h-[56px] items-center justify-center rounded-[24px] border-2 border-[#5b21b6] bg-[#5b21b6] px-8 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Next →</button>
      ) : (
        <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[56px] items-center justify-center rounded-[24px] border-2 border-[#16a34a] bg-[#16a34a] px-8 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Got it — my way or the formula! →</button>
      )}
    </Shell>
  );
}

/* ── L3 Compare — which prism holds more ── */
function CompareScene({ task, onCorrect, onWrong }: { task: VolumeTask; onCorrect: () => void; onWrong: () => void }) {
  const a = task.dims ?? { l: 3, w: 2, h: 2 };
  const b = task.dimsB ?? { l: 2, w: 2, h: 2 };
  const volA = a.l * a.w * a.h, volB = b.l * b.w * b.h;
  const bigger = volA >= volB ? "a" : "b";
  const [wrong, setWrong] = useState<string | null>(null);
  const Card = ({ id, d, label }: { id: string; d: Dims; label: string }) => (
    <button type="button" onClick={() => (id === bigger ? onCorrect() : (setWrong(id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`flex flex-col items-center gap-1 rounded-[24px] border-2 p-3 transition hover:-translate-y-0.5 ${wrong === id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
      <span className="text-base font-black text-[#2c1c07]">{label}</span>
      <MeasurelandsVolumeBuilder dims={d} cubes={prismCubes(d)} size={200} />
      <span className="text-[12px] font-black text-[#a98b52]">{d.l} × {d.w} × {d.h}</span>
    </button>
  );
  return (
    <Shell badge={task.badgeLabel ?? "Which Holds More?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3"><Card id="a" d={a} label={task.context ?? "Box A"} /><Card id="b" d={b} label="Box B" /></div>
    </Shell>
  );
}

/* ── L3 Capacity — cm³ = mL ── */
function CapacityScene({ task, onCorrect, onWrong }: { task: VolumeTask; onCorrect: () => void; onWrong: () => void }) {
  const dims = task.dims ?? { l: 3, w: 2, h: 2 };
  const vol = dims.l * dims.w * dims.h;
  return (
    <Shell badge={task.badgeLabel ?? "Volume & Capacity"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>
        {ctxLine(task)}
        <MeasurelandsVolumeBuilder dims={dims} cubes={prismCubes(dims)} />
        <div className="mx-auto mt-2 max-w-[420px] rounded-[16px] border border-[rgba(214,184,108,0.5)] bg-white px-3 py-2 text-center text-[15px] font-black text-[#2c1c07]">Volume = <span className="text-[#7c3aed]">{vol} cm³</span> · and <span className="font-black">1 cm³ holds 1 mL</span> of water.</div>
      </div>
      <OptionRow options={task.options ?? []} correct={task.correctNumber ?? vol} unit="mL" spoken="millilitres" onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function IntroScene({ task, onCorrect }: { task: VolumeTask; onCorrect: () => void }) {
  const dims = task.dims ?? { l: 3, w: 2, h: 2 };
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className={panel}><MeasurelandsVolumeBuilder dims={dims} cubes={prismCubes(dims)} /></div>
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Area → Volume</div>
          <p className="text-[17px] font-bold leading-snug text-[#2c1c07]">Area covers a <span className="font-black text-[#7c3aed]">surface</span>. Volume fills a <span className="font-black text-[#5b21b6]">space</span>.</p>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-[#5a4423]">We measure volume with <span className="font-black">cubic units</span> — little cubes that fill the shape, including the ones you can&apos;t see.</p>
          <div className="mt-3 rounded-[16px] border-2 border-[#5b21b6] bg-[rgba(91,33,182,0.06)] px-4 py-3 text-center">
            <div className="text-lg font-black text-[#5b21b6] sm:text-xl">Volume = length × width × height</div>
            <div className="mt-0.5 text-[12px] font-black text-[#a98b52]">count the cubes, or use the formula</div>
          </div>
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s build! →</button>
    </Shell>
  );
}

export function MeasurelandsVolumeCard({ task, onCorrect, onWrong }: { task: VolumeTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "build": return <BuildScene task={task} onCorrect={onCorrect} />;
    case "count": return <McqScene task={task} onCorrect={onCorrect} onWrong={onWrong} kind="count" />;
    case "layers": return <McqScene task={task} onCorrect={onCorrect} onWrong={onWrong} kind="layers" />;
    case "perLayer": return <McqScene task={task} onCorrect={onCorrect} onWrong={onWrong} kind="perLayer" />;
    case "total": return <TotalScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "formula": return <FormulaScene task={task} onCorrect={onCorrect} />;
    case "compare": return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <CapacityScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
