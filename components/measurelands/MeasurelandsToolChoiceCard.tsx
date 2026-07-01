"use client";

import {
  Compass, Boxes, Ruler, Scaling, LifeBuoy, Footprints, Paperclip,
  Eraser, Pencil, BookOpen, Box, Armchair, DoorClosed, Bed, School, Car, Map, MoveHorizontal, TreePine,
  type LucideIcon,
} from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

// Lucide stand-ins until premium Measuring-Detective art lands (see the Codex
// art brief). Cards render `imageSrc` when present, else this icon.
const ICONS: Record<string, LucideIcon> = {
  // tools
  cubes: Boxes, blocks: Boxes, ruler: Ruler, tape: Scaling, wheel: LifeBuoy, feet: Footprints,
  paperclips: Paperclip, crayons: Pencil, pencils: Pencil,
  // objects
  eraser: Eraser, pencil: Pencil, book: BookOpen, crayon: Pencil, pencilcase: Box,
  bottle: Box, chair: Armchair, desk: Box, door: DoorClosed, bed: Bed,
  classroom: School, car: Car, playground: Map, oval: Map, hallway: MoveHorizontal,
  court: Map, bridge: Map, tree: TreePine,
};
function iconFor(key: string): LucideIcon {
  return ICONS[key] ?? Box;
}

function Shell({ badge, prompt, speakText, children }: { badge: string; prompt: string; speakText?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
        style={{ borderColor: "rgba(214,184,108,0.38)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>
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

/* A glyph tile (object or tool) — image when available, else lucide icon. */
function Glyph({ label, iconKey, imageSrc, big = false }: { label: string; iconKey: string; imageSrc?: string; big?: boolean }) {
  const Icon = iconFor(iconKey);
  const size = big ? "h-24 w-24" : "h-12 w-12";
  return imageSrc ? (
    <img src={imageSrc} alt={label} className={`${size} object-contain drop-shadow-[0_10px_16px_rgba(120,53,15,0.18)]`} />
  ) : (
    <Icon className={`${big ? "h-16 w-16" : "h-9 w-9"} text-[#7c3aed]`} strokeWidth={1.8} />
  );
}

function ObjectCard({ object, big = true }: { object: NonNullable<ToolTask["object"]>; big?: boolean }) {
  return (
    <div className="mx-auto flex w-[200px] flex-col items-center gap-2 rounded-[26px] border-2 border-[rgba(91,33,182,0.45)] bg-[rgba(124,58,237,0.06)] px-4 py-5 text-center">
      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#5b21b6]">Measure the</span>
      <Glyph label={object.label} iconKey={object.iconKey} imageSrc={object.imageSrc} big={big} />
      <span className="text-lg font-black leading-tight text-[#2c1c07]">{object.label}</span>
    </div>
  );
}

/* ── Intro / teaching ── */
function IntroScene({ task, onCorrect }: { task: ToolTask; onCorrect: () => void }) {
  const hasCustomIntroTools = Boolean(task.introTools?.length);
  const toolLegend = task.introTools ?? [
    { id: "cubes", label: "Cubes", focus: "tiny things", iconKey: "cubes", imageSrc: "/images/measurelands/tools-3d/tool-cubes.png" },
    { id: "ruler", label: "Ruler", focus: "small things", iconKey: "ruler", imageSrc: "/images/measurelands/tools-3d/tool-ruler.png" },
    { id: "tape", label: "Tape Measure", focus: "rooms", iconKey: "tape", imageSrc: "/images/measurelands/tools-3d/tool-tape.png" },
    { id: "feet", label: "Footsteps", focus: "floors", iconKey: "feet", imageSrc: "/images/measurelands/tools-3d/tool-feet.png" },
    { id: "wheel", label: "Trundle Wheel", focus: "big spaces", iconKey: "wheel", imageSrc: "/images/measurelands/tools-3d/tool-wheel.png" },
  ];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            {hasCustomIntroTools ? (
              <>
                <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">You don't always need measuring blocks.</p>
                <p className="text-base font-semibold leading-relaxed text-[#5f4725]">Lots of everyday objects can be measuring units.</p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">A pencil and a playground are both lengths — but we measure them differently.</p>
                <p className="text-base font-semibold leading-relaxed text-[#5f4725]">Good measurers choose the best tool for the job!</p>
              </>
            )}
          </div>
        </div>
        <div className="mb-2 text-center text-xs font-black uppercase tracking-[0.18em] text-[#5b21b6]">Meet your measuring tools</div>
        <div className="grid grid-cols-5 gap-2">
          {toolLegend.map((t) => (
            <div key={t.id} className="flex flex-col items-center gap-1 rounded-[18px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.95)] px-1 py-3 text-center">
              <Glyph label={t.label} iconKey={t.iconKey} imageSrc={t.imageSrc} />
              <span className="text-[11px] font-black leading-tight text-[#2c1c07]">{t.label}</span>
              <span className="text-[10px] font-bold leading-tight text-[#a98b52]">for {t.focus}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <button type="button" onClick={onCorrect} className="rounded-full px-6 py-3 text-lg font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)] transition hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}>
            Start
          </button>
        </div>
      </div>
    </Shell>
  );
}

/* ── Choose the best tool (best / whyBest both pick a tool) ── */
function ToolGrid({ task, onCorrect, onWrong }: { task: ToolTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Choose the Best Tool"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? <ObjectCard object={task.object} /> : null}
      <div className="grid grid-cols-3 gap-3">
        {(task.tools ?? []).map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => (tool.id === task.correctToolId ? onCorrect() : onWrong())}
            className="relative flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-2 text-center text-sm font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={tool.label} /></span>
            <Glyph label={tool.label} iconKey={tool.iconKey} imageSrc={tool.imageSrc} />
            {tool.label}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Text-reason questions (whyBad: object + a wrong tool) ── */
function ReasonScene({ task, onCorrect, onWrong }: { task: ToolTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Why Is This Tool Bad?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object || task.wrongTool ? (
        <div className="mx-auto flex max-w-[420px] items-center justify-center gap-3">
          {task.object ? <ObjectCard object={task.object} big={false} /> : null}
          {task.wrongTool ? (
            <div className="flex w-[150px] flex-col items-center gap-2 rounded-[26px] border-2 border-dashed border-[rgba(220,80,80,0.6)] bg-[rgba(220,80,80,0.06)] px-3 py-4 text-center">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#b91c1c]">This tool</span>
              <Glyph label={task.wrongTool.label} iconKey={task.wrongTool.iconKey} imageSrc={task.wrongTool.imageSrc} />
              <span className="text-sm font-black leading-tight text-[#2c1c07]">{task.wrongTool.label}</span>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(task.reasonOptions ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctReason ? onCorrect() : onWrong())}
            className="relative flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 text-center text-base font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={value} /></span>
            {value}
          </button>
        ))}
      </div>
    </Shell>
  );
}

export function MeasurelandsToolChoiceCard({ task, onCorrect, onWrong }: { task: ToolTask; onCorrect: () => void; onWrong: () => void }) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "whyBad" || task.scene === "whyBest" || task.scene === "reflection") {
    return <ReasonScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
  return <ToolGrid task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
