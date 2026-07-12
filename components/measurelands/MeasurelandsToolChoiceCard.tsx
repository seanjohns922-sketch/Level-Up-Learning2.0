"use client";

import {
  Compass, Boxes, Ruler, Scaling, LifeBuoy, Footprints, Paperclip, Dices,
  Eraser, Pencil, BookOpen, Box, Armchair, DoorClosed, Bed, School, Car, Map, MoveHorizontal, TreePine,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type ToolTask = Extract<PracticeTask, { kind: "toolChoice" }>;

// Lucide stand-ins until premium Measuring-Detective art lands (see the Codex
// art brief). Cards render `imageSrc` when present, else this icon.
const ICONS: Record<string, LucideIcon> = {
  // tools
  cubes: Boxes, blocks: Boxes, ruler: Ruler, tape: Scaling, wheel: LifeBuoy, feet: Footprints, compass: Compass,
  paperclips: Paperclip, crayons: Pencil, pencils: Pencil, dominoes: Dices,
  // objects
  eraser: Eraser, pencil: Pencil, book: BookOpen, crayon: Pencil, pencilcase: Box,
  bottle: Box, chair: Armchair, desk: Box, door: DoorClosed, bed: Bed,
  classroom: School, car: Car, playground: Map, oval: Map, hallway: MoveHorizontal,
  court: Map, bridge: Map, tree: TreePine,
};
function iconFor(key: string): LucideIcon {
  return ICONS[key] ?? Box;
}

// Relative width of each informal unit (paper clip = 1). A strip of any unit
// tiles to the SAME total length for a given object — a block is drawn 2× a
// paper clip, a crayon 3×, a pencil 4× — so "same object, different units" lines
// up. Keep in sync with the unitSize values in week4Lesson3.ts.
const UNIT_SIZE: Record<string, number> = { paperclips: 1, blocks: 2, cubes: 2, crayons: 3, dominoes: 3, pencils: 4 };

function PaperclipGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 52 20" aria-hidden="true" className={className}>
      <path
        d="M15 5.5h24.5c4.1 0 7.5 3.3 7.5 7.4s-3.4 7.4-7.5 7.4H10.8C5.5 20.3 1.2 16 1.2 10.7S5.5 1.1 10.8 1.1h30.6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.2"
      />
      <path
        d="M15.3 14.6h22.8c1.4 0 2.6-1.1 2.6-2.5s-1.2-2.5-2.6-2.5H11.3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function DominoGlyph({ className = "" }: { className?: string }) {
  const pip = (cx: number, cy: number, key: string) => <circle key={key} cx={cx} cy={cy} r="2.1" fill="rgba(255,255,255,0.92)" />;
  return (
    <svg viewBox="0 0 72 32" aria-hidden="true" className={className}>
      <rect x="1.5" y="1.5" width="69" height="29" rx="4.5" fill="#141414" stroke="#3a3a3a" strokeWidth="3" />
      <line x1="36" y1="4" x2="36" y2="28" stroke="#595959" strokeWidth="1.5" />
      {[pip(11, 9, "a"), pip(20, 16, "b"), pip(29, 23, "c"), pip(49, 9, "d"), pip(60, 23, "e")]}
    </svg>
  );
}

function CubeGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 34" aria-hidden="true" className={className}>
      <path d="M6 10h24v18H6z" fill="#e53935" stroke="#a31312" strokeWidth="2" />
      <path d="M6 10 12 4h24l-6 6z" fill="#ff6b5f" stroke="#a31312" strokeWidth="2" />
      <path d="M30 10 36 4v18l-6 6z" fill="#b91c1c" stroke="#a31312" strokeWidth="2" />
      <path d="M10 14h16" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UnitGlyph({ iconKey, imageSrc, label }: { iconKey: string; imageSrc?: string; label: string }) {
  const Icon = iconFor(iconKey);
  if (iconKey === "paperclips") return <PaperclipGlyph className="h-full w-full text-[#dc2626]" />;
  if (iconKey === "dominoes") return <DominoGlyph className="h-full w-full" />;
  if (iconKey === "cubes" || iconKey === "blocks") return <CubeGlyph className="h-full w-full" />;
  if (imageSrc) return <img src={imageSrc} alt={label} className="h-full w-full object-contain" />;
  return <Icon className="h-5 w-5 text-[#7c3aed]" strokeWidth={1.8} />;
}

function Shell({ badge, prompt, speakText, children }: { badge: string; prompt: string; speakText?: string; children: React.ReactNode }) {
  return (
    <div className="measurelands-shell space-y-4">
      <div
        className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
        style={{ borderColor: "rgba(214,184,108,0.38)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>
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

/* Premium concept glyphs for the Week 8 "measuring tools" strip and the
 * perimeter / area / mass / capacity answer options. Each SVG actually depicts
 * the quantity being measured, rather than a generic stand-in icon. */
function MeasureGlyph({ kind, className = "" }: { kind: string; className?: string }) {
  const S = "#6d28d9";
  const F = "#ede9fe";
  const common = { className, viewBox: "0 0 48 48", fill: "none" as const };
  if (kind === "m-length") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M9 13h30" stroke={S} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M9 13l4-3.2M9 13l4 3.2M39 13l-4-3.2M39 13l-4 3.2" stroke={S} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="8" y="21" width="32" height="14" rx="3" fill={F} stroke={S} strokeWidth="2.4" />
        {[14, 20, 26, 32].map((x) => <line key={x} x1={x} y1="21" x2={x} y2="27" stroke={S} strokeWidth="2" strokeLinecap="round" />)}
      </svg>
    );
  }
  if (kind === "m-perimeter") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="10" y="12" width="28" height="24" rx="4" stroke={S} strokeWidth="3.2" strokeDasharray="5 3.4" strokeLinecap="round" />
        {([[10, 12], [38, 12], [10, 36], [38, 36]] as const).map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.8" fill="#d6a84a" stroke={S} strokeWidth="1.4" />)}
      </svg>
    );
  }
  if (kind === "m-area") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="10" y="13" width="28" height="22" rx="3" fill={F} stroke={S} strokeWidth="2.6" />
        <line x1="19.3" y1="13" x2="19.3" y2="35" stroke={S} strokeWidth="1.8" />
        <line x1="28.6" y1="13" x2="28.6" y2="35" stroke={S} strokeWidth="1.8" />
        <line x1="10" y1="24" x2="38" y2="24" stroke={S} strokeWidth="1.8" />
        <rect x="10" y="13" width="9.3" height="11" fill="rgba(109,40,217,0.28)" />
        <rect x="28.7" y="24" width="9.3" height="11" fill="rgba(109,40,217,0.28)" />
      </svg>
    );
  }
  if (kind === "m-both") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="8" y="12" width="32" height="24" rx="4" stroke="#d6a84a" strokeWidth="3" strokeDasharray="5 3.2" />
        <rect x="15" y="18" width="18" height="12" rx="2" fill={F} stroke={S} strokeWidth="2" />
        <line x1="24" y1="18" x2="24" y2="30" stroke={S} strokeWidth="1.6" />
        <line x1="15" y1="24" x2="33" y2="24" stroke={S} strokeWidth="1.6" />
      </svg>
    );
  }
  if (kind === "m-mass") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M18.5 17c0-4.5 11-4.5 11 0" stroke={S} strokeWidth="3" strokeLinecap="round" />
        <path d="M15 18.5h18l3.2 19.5H11.8z" fill={F} stroke={S} strokeWidth="2.6" strokeLinejoin="round" />
        <text x="24" y="32.5" textAnchor="middle" fontSize="9" fontWeight="800" fill={S}>kg</text>
      </svg>
    );
  }
  if (kind === "m-capacity") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M15 13h18l-2.2 22.5a3 3 0 0 1-3 2.7H20.2a3 3 0 0 1-3-2.7z" fill="#fff" stroke={S} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M16.7 25.5h14.6l-1 10.9a3 3 0 0 1-3 2.7H20.7a3 3 0 0 1-3-2.7z" fill="#5ec5e8" opacity="0.55" />
        <path d="M33 15.5l4-1.6" stroke={S} strokeWidth="2.4" strokeLinecap="round" />
        {[20, 26, 32].map((y) => <line key={y} x1="15.8" y1={y} x2="19.8" y2={y} stroke={S} strokeWidth="1.6" strokeLinecap="round" />)}
      </svg>
    );
  }
  if (kind === "m-time") {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="24" cy="26" r="14" fill={F} stroke={S} strokeWidth="2.6" />
        <line x1="24" y1="8.5" x2="24" y2="12" stroke={S} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="24" y1="26" x2="24" y2="17.5" stroke={S} strokeWidth="2.6" strokeLinecap="round" />
        <line x1="24" y1="26" x2="30.5" y2="29" stroke={S} strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="24" cy="26" r="1.9" fill={S} />
      </svg>
    );
  }
  if (kind === "m-volume") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M12 18h18v16H12z" fill={F} stroke={S} strokeWidth="2.4" />
        <path d="M12 18 18 12h18l-6 6z" fill="rgba(109,40,217,0.28)" stroke={S} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M30 18 36 12v16l-6 6z" fill="rgba(109,40,217,0.18)" stroke={S} strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M21 18v16M12 26h18" stroke={S} strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
  }
  if (kind === "m-angle") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M11 34h26" stroke={S} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M11 34 33 16" stroke={S} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M23 34a12 12 0 0 0-3.6-8.6" fill="none" stroke="#d6a84a" strokeWidth="2.4" />
      </svg>
    );
  }
  if (kind === "m-convert") {
    return (
      <svg {...common} aria-hidden="true">
        <text x="15" y="21" textAnchor="middle" fontSize="9" fontWeight="900" fill={S}>cm</text>
        <text x="33" y="35" textAnchor="middle" fontSize="9" fontWeight="900" fill={S}>m</text>
        <path d="M20 17h9l-3-3M28 31h-9l3 3" stroke={S} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return null;
}

/* A glyph tile (object or tool) — image when available, else lucide icon. */
function Glyph({ label, iconKey, imageSrc, big = false }: { label: string; iconKey: string; imageSrc?: string; big?: boolean }) {
  const Icon = iconFor(iconKey);
  const size = big ? "h-24 w-24" : "h-12 w-12";
  if (iconKey.startsWith("m-")) return <MeasureGlyph kind={iconKey} className={size} />;
  if (iconKey === "paperclips") return <PaperclipGlyph className={`${size} text-[#dc2626]`} />;
  if (iconKey === "dominoes") return <DominoGlyph className={`${big ? "h-16 w-24" : "h-10 w-16"}`} />;
  if (iconKey === "cubes" || iconKey === "blocks") return <CubeGlyph className={size} />;
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

function UnitStrip({
  count,
  label,
  iconKey,
  imageSrc,
  blanks = 0,
  totalBaseUnits,
}: {
  count: number;
  label: string;
  iconKey: string;
  imageSrc?: string;
  blanks?: number;
  totalBaseUnits?: number;
}) {
  const size = UNIT_SIZE[iconKey] ?? 1;
  const BASE = 20; // px per paper-clip-width
  const totalTiles = count + blanks;
  const gapPx = iconKey === "cubes" || iconKey === "blocks" ? 0 : 4;
  const targetW = Math.max(0, (totalBaseUnits ?? totalTiles * size) * BASE);
  // Keep every measurement row the same total visual length. Without this,
  // rows with more small units become longer because they have more gaps.
  const cellW = totalTiles > 0 ? Math.max(iconKey === "paperclips" ? 12 : 18, (targetW - gapPx * Math.max(0, totalTiles - 1)) / totalTiles) : size * BASE;
  const H = 36;
  const tile = (key: string, blank: boolean) => (
    <div
      key={key}
      className="flex shrink-0 items-center justify-center"
      style={{
        width: cellW,
        height: H,
        padding: iconKey === "paperclips" ? 0 : 3,
        borderRadius: iconKey === "cubes" || iconKey === "blocks" ? 0 : 8,
        border: blank
          ? "2px dashed rgba(167,139,250,0.6)"
          : iconKey === "paperclips"
            ? "none"
            : iconKey === "cubes" || iconKey === "blocks"
              ? "1px solid rgba(120,53,15,0.3)"
              : "1px solid rgba(214,184,108,0.45)",
        background: blank
          ? "rgba(167,139,250,0.08)"
          : iconKey === "paperclips"
            ? "transparent"
            : iconKey === "cubes" || iconKey === "blocks"
              ? "#ef4444"
              : "#fff",
      }}
    >
      {blank ? (
        <span className="text-sm font-black text-[#7c3aed]">?</span>
      ) : (
        <UnitGlyph iconKey={iconKey} imageSrc={imageSrc} label={label} />
      )}
    </div>
  );
  return (
    <div className="overflow-x-auto rounded-[20px] border border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.95)] px-3 py-3">
      <div className="mx-auto flex items-center" style={{ gap: gapPx, width: targetW, minWidth: targetW }}>
      {Array.from({ length: count }).map((_, index) => tile(`unit-${index}`, false))}
      {Array.from({ length: blanks }).map((_, index) => tile(`blank-${index}`, true))}
      </div>
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
            {task.introLines?.length ? (
              <>
                {task.introLines.map((line, i) => (
                  <p key={i} className={`text-base font-semibold leading-relaxed ${i === 0 ? "text-[#2c1c07]" : "text-[#5f4725]"}`}>{line}</p>
                ))}
              </>
            ) : hasCustomIntroTools ? (
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
      <div className={`grid gap-3 ${(task.tools ?? []).length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {(task.tools ?? []).map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => (tool.id === task.correctToolId ? onCorrect() : onWrong())}
            className="relative flex min-h-[110px] flex-col items-center justify-center gap-1.5 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 py-3 text-center text-sm font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={tool.focus ? `${tool.label}. ${tool.focus}` : tool.label} /></span>
            <Glyph label={tool.label} iconKey={tool.iconKey} imageSrc={tool.imageSrc} />
            <span className="text-base">{tool.label}</span>
            {tool.focus ? <span className="text-[12px] font-semibold leading-tight text-[#5a4423]">{tool.focus}</span> : null}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function MeasureUnitScene({ task, onCorrect, onWrong }: { task: ToolTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Measure the Object"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? <ObjectCard object={task.object} /> : null}
      <div className="grid grid-cols-3 gap-3">
        {(task.tools ?? []).map((tool) => {
          const row = task.measurementRows?.find((item) => item.id === tool.id);
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => (tool.id === task.correctToolId ? onCorrect() : onWrong())}
              className="relative flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-2 text-center text-sm font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${tool.label}${row ? `, ${row.count}` : ""}`} /></span>
              <Glyph label={tool.label} iconKey={tool.iconKey} imageSrc={tool.imageSrc} />
              <span>{tool.label}</span>
              {row ? <span className="rounded-full bg-[#f7e7ba] px-3 py-1 text-xs text-[#7c4a12]">{row.count} {row.unitLabel.toLowerCase()}</span> : null}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function SameObjectScene({ task, onCorrect, onWrong }: { task: ToolTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Same Object"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? <ObjectCard object={task.object} big={false} /> : null}
      <div className="grid gap-3">
        {(task.measurementRows ?? []).map((row) => (
          <div key={row.id} className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-white p-3">
            <div className="mb-2 text-center text-sm font-black uppercase tracking-[0.12em] text-[#7c4a12]">
              {row.count} {row.unitLabel}
            </div>
            <UnitStrip
              count={row.count}
              label={row.unitLabel}
              iconKey={row.unitIconKey}
              imageSrc={row.unitImageSrc}
              totalBaseUnits={task.objectLengthUnits}
            />
          </div>
        ))}
      </div>
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

function CompleteMeasureScene({ task, onCorrect, onWrong }: { task: ToolTask; onCorrect: () => void; onWrong: () => void }) {
  const measure = task.completeMeasurement;
  const shown = measure?.shownCount ?? 0;
  const target = measure?.targetCount ?? task.correctCount ?? shown;
  const [added, setAdded] = useState(0);
  const total = shown + added;
  const missing = Math.max(0, target - total);
  return (
    <Shell badge={task.badgeLabel ?? "Complete the Measure"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? <ObjectCard object={task.object} big={false} /> : null}
      {measure ? (
        <div className="rounded-[26px] border border-[rgba(214,184,108,0.45)] bg-white p-4">
          <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.12em] text-[#7c4a12]">
            {total} / {target} {measure.unitLabel}
          </div>
          <UnitStrip count={total} blanks={missing} label={measure.unitLabel} iconKey={measure.unitIconKey} imageSrc={measure.unitImageSrc} />
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-3">
        <button type="button" onClick={() => setAdded((value) => Math.max(0, value - 1))} className="rounded-[22px] border-2 border-[rgba(214,184,108,0.45)] bg-white px-4 py-4 font-black text-[#7c4a12]">
          Remove
        </button>
        <button type="button" onClick={() => setAdded((value) => Math.min(target - shown + 2, value + 1))} className="rounded-[22px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 py-4 font-black text-[#2c1c07]">
          Add {measure?.unitLabel ?? "Unit"}
        </button>
        <button type="button" onClick={() => (total === target ? onCorrect() : onWrong())} className="rounded-[22px] bg-[#7c3aed] px-4 py-4 font-black text-white shadow-[0_12px_24px_rgba(124,58,237,0.22)]">
          Check
        </button>
      </div>
    </Shell>
  );
}

/* ── Text-reason questions (whyBad: object + a wrong tool) ── */
function ReasonScene({ task, onCorrect, onWrong }: { task: ToolTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Why Is This Tool Bad?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? (
        <div className="mx-auto flex max-w-[420px] items-center justify-center gap-3">
          <ObjectCard object={task.object} big={false} />
          {task.wrongTool ? (
            <div className="flex w-[150px] flex-col items-center gap-2 rounded-[26px] border-2 border-dashed border-[rgba(220,80,80,0.6)] bg-[rgba(220,80,80,0.06)] px-3 py-4 text-center">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#b91c1c]">This tool</span>
              <Glyph label={task.wrongTool.label} iconKey={task.wrongTool.iconKey} imageSrc={task.wrongTool.imageSrc} />
              <span className="text-sm font-black leading-tight text-[#2c1c07]">{task.wrongTool.label}</span>
            </div>
          ) : null}
        </div>
      ) : task.wrongTool ? (
        <div className="mx-auto flex max-w-[460px] items-center gap-4 rounded-[26px] border-2 border-[rgba(220,80,80,0.35)] px-5 py-4 shadow-[0_10px_30px_rgba(190,50,50,0.12)]" style={{ background: "linear-gradient(135deg, rgba(255,241,238,0.98), rgba(252,224,224,0.9))" }}>
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[22px] border border-[rgba(220,80,80,0.28)] bg-white shadow-inner">
            <Glyph label={task.wrongTool.label} iconKey={task.wrongTool.iconKey} imageSrc={task.wrongTool.imageSrc} big />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b91c1c]">Professor Gauge picked</div>
            <div className="text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{task.wrongTool.label}</div>
            <div className="mt-1 text-[13px] font-bold text-[#a16207]">Is that the right strategy?</div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-2xl font-black text-white shadow-md">✗</div>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(task.reasonOptions ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctReason ? onCorrect() : onWrong())}
            className="flex min-h-[84px] flex-col items-center justify-center gap-1.5 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 py-3 text-center text-base font-black leading-tight text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span>{value}</span>
            <OptionReadAloudButton text={value} />
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Shared: a straight horizontal object + one continuous measurement line
 * with end ticks (the "length to be measured"). ── */
function ObjectWithLine({ object, widthPx }: { object?: ToolTask["object"]; widthPx: number }) {
  const Icon = object ? iconFor(object.iconKey) : Box;
  return (
    <div className="mx-auto flex flex-col items-center" style={{ maxWidth: "100%" }}>
      <div style={{ width: widthPx, maxWidth: "100%" }} className="flex justify-center">
        {object?.imageSrc ? (
          <img src={object.imageSrc} alt={object.label} className="h-auto w-full object-contain drop-shadow-[0_8px_14px_rgba(76,40,10,0.16)]" style={{ maxHeight: 110 }} />
        ) : (
          <Icon className="h-16 w-16 text-[#7c3aed]" strokeWidth={1.6} />
        )}
      </div>
      {/* one continuous line with end ticks */}
      <div style={{ position: "relative", width: widthPx, maxWidth: "100%", height: 18, marginTop: 8 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 3, transform: "translateY(-50%)", background: "#5b4636", borderRadius: 2 }} />
        <div style={{ position: "absolute", left: 0, top: 2, bottom: 2, width: 3, background: "#5b4636", borderRadius: 2 }} />
        <div style={{ position: "absolute", right: 0, top: 2, bottom: 2, width: 3, background: "#5b4636", borderRadius: 2 }} />
      </div>
      {object?.label ? <div className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-[#7c4a12]">{object.label}</div> : null}
    </div>
  );
}

/* ── W4 L3 Activity 1: Estimate then Reveal (3 units, input boxes → actuals). ── */
function EstimateRevealScene({ task, onCorrect }: { task: ToolTask; onCorrect: () => void }) {
  const rows = task.measurementRows ?? [];
  const lineW = Math.min(520, Math.max(220, (task.objectLengthUnits ?? 12) * 26));
  const [estimates, setEstimates] = useState<number[]>(rows.map(() => 5));
  const [revealed, setRevealed] = useState(false);
  const setEst = (i: number, v: number) =>
    setEstimates((prev) => prev.map((x, idx) => (idx === i ? Math.max(1, Math.min(40, v)) : x)));
  return (
    <Shell badge={task.badgeLabel ?? "Estimate Then Reveal"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        <ObjectWithLine object={task.object} widthPx={lineW} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {rows.map((row, i) => (
          <div key={row.id} className="flex flex-col items-center gap-2 rounded-[22px] border-2 border-[rgba(214,184,108,0.5)] bg-[#fffaf0] p-3 text-center">
            <Glyph label={row.unitLabel} iconKey={row.unitIconKey} imageSrc={row.unitImageSrc} />
            <div className="text-sm font-black text-[#2c1c07]">{row.unitLabel}</div>
            <div className="text-[11px] font-semibold leading-tight text-[#5f4725]">Estimate how many {row.unitLabel.toLowerCase()} long?</div>
            <div className="flex items-center gap-2">
              <button type="button" disabled={revealed} onClick={() => setEst(i, estimates[i]! - 1)} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[rgba(214,184,108,0.6)] bg-white text-xl font-black text-[#7c4a12] disabled:opacity-40">−</button>
              <div className="flex h-11 w-12 items-center justify-center rounded-xl border-2 border-[rgba(214,184,108,0.6)] bg-white text-2xl font-black text-[#2c1c07]">{estimates[i]}</div>
              <button type="button" disabled={revealed} onClick={() => setEst(i, estimates[i]! + 1)} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[rgba(214,184,108,0.6)] bg-white text-xl font-black text-[#7c4a12] disabled:opacity-40">+</button>
            </div>
            {revealed ? (
              <div className="mt-1 w-full rounded-xl bg-[rgba(124,58,237,0.08)] py-1">
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#5b21b6]">Actual</div>
                <div className="text-2xl font-black text-[#2c1c07]">{row.count}</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {revealed ? (
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
          <div className="mb-3 text-center text-sm font-bold text-[#5f4725]">
            Same {task.object?.label?.toLowerCase() ?? "object"} — different-sized units, so the count changes but the length stays the same:
          </div>
          <div className="flex flex-col items-center gap-3">
            {rows.map((row) => (
              <div key={row.id} className="w-full">
                <div className="mb-1 text-center text-xs font-black uppercase tracking-[0.12em] text-[#7c4a12]">{row.count} {row.unitLabel}</div>
                <div className="flex justify-center">
                  <UnitStrip
                    count={row.count}
                    label={row.unitLabel}
                    iconKey={row.unitIconKey}
                    imageSrc={row.unitImageSrc}
                    totalBaseUnits={task.objectLengthUnits}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {!revealed ? (
        <button type="button" onClick={() => setRevealed(true)} className="w-full rounded-[22px] bg-[#7c3aed] px-4 py-4 font-black uppercase tracking-[0.12em] text-white shadow-[0_12px_24px_rgba(124,58,237,0.22)]">Reveal the actual counts →</button>
      ) : (
        <button type="button" onClick={onCorrect} className="w-full rounded-[22px] px-4 py-4 font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-sm" style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}>Smaller units, bigger count — continue →</button>
      )}
    </Shell>
  );
}

/* ── W4 L3 Activity 2: Measure It (tap a unit to place it in the next slot,
 * left to right, until the line is filled). ── */
function MeasureItScene({ task, onCorrect }: { task: ToolTask; onCorrect: () => void }) {
  const m = task.completeMeasurement;
  const target = m?.targetCount ?? task.correctCount ?? task.objectLengthUnits ?? 10;
  const SLOT = 30;
  const lineW = target * SLOT;
  const [placed, setPlaced] = useState(0);
  const wonRef = useRef(false);
  const done = placed >= target;
  const Icon = iconFor(m?.unitIconKey ?? "paperclips");
  const unitLabel = m?.unitLabel ?? "units";
  function place() {
    if (done) return;
    const n = placed + 1;
    setPlaced(n);
    if (n >= target && !wonRef.current) {
      wonRef.current = true;
      window.setTimeout(onCorrect, 1300);
    }
  }
  const unitInner = (dashed: boolean) =>
    dashed ? null : m?.unitImageSrc ? <img src={m.unitImageSrc} alt={unitLabel} className="h-full w-full object-contain" /> : <Icon className="h-5 w-5 text-[#7c3aed]" strokeWidth={1.8} />;
  return (
    <Shell badge={task.badgeLabel ?? "Measure It"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        <ObjectWithLine object={task.object} widthPx={lineW} />
        <div className="mt-3 text-center text-sm font-bold text-[#5f4725]">
          Use {unitLabel.toLowerCase()} to show how long the {task.object?.label?.toLowerCase() ?? "object"} is.
        </div>
        {/* drop targets */}
        <div className="mt-3 flex justify-center">
          <div className="flex items-center gap-1 overflow-x-auto">
            {Array.from({ length: target }).map((_, i) => (
              <div key={i} className="flex shrink-0 items-center justify-center rounded-lg" style={{ width: SLOT, height: 34, padding: 3, border: i < placed ? "1px solid rgba(214,184,108,0.5)" : "2px dashed rgba(167,139,250,0.55)", background: i < placed ? "#fff" : "rgba(167,139,250,0.06)" }}>
                {unitInner(i >= placed)}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 text-center text-sm font-black uppercase tracking-[0.12em] text-[#7c4a12]">
          {placed} / {target} {unitLabel}
        </div>
      </div>
      {!done ? (
        <button type="button" onClick={place} className="flex w-full items-center justify-center gap-3 rounded-[22px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fffaf0] px-4 py-4 font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[rgba(214,184,108,0.5)] bg-white">{unitInner(false)}</span>
          Place a {unitLabel.replace(/s$/, "").toLowerCase()}
        </button>
      ) : (
        <div className="rounded-[22px] bg-[rgba(15,118,110,0.1)] px-4 py-4 text-center text-lg font-black text-[#0f766e]">
          The {task.object?.label?.toLowerCase() ?? "object"} is {target} {unitLabel.toLowerCase()} long!
        </div>
      )}
    </Shell>
  );
}

export function MeasurelandsToolChoiceCard({ task, onCorrect, onWrong }: { task: ToolTask; onCorrect: () => void; onWrong: () => void }) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "estimateReveal") return <EstimateRevealScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "measureIt") return <MeasureItScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "measureUnit") return <MeasureUnitScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "sameObject") return <SameObjectScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "completeMeasure") return <CompleteMeasureScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "whyBad" || task.scene === "whyBest" || task.scene === "reflection") {
    return <ReasonScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
  return <ToolGrid task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
