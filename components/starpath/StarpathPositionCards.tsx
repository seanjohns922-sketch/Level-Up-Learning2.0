"use client";

import { useId, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Check } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  RELATION_WORD,
  positionObjectLabel,
  type PositionRelation,
} from "@/data/activities/starpath/ground/position-objects";

type PositionFindTask = Extract<PracticeTask, { kind: "starpathPositionFind" }>;
type PositionWordTask = Extract<PracticeTask, { kind: "starpathPositionWord" }>;
type PositionPlaceTask = Extract<PracticeTask, { kind: "starpathPositionPlace" }>;
type PositionPictureTask = Extract<PracticeTask, { kind: "starpathPositionPicture" }>;
type PositionSequenceTask = Extract<PracticeTask, { kind: "starpathPositionSequence" }>;
type Placement = {
  id: string;
  object: string;
  relation: PositionRelation;
  side?: "left" | "right";
};

const POS_SHAKE = (
  <style>{`
    @keyframes sp-pos-shake { 0%,100%{transform:translate(-50%,-50%)} 25%{transform:translate(-58%,-50%)} 75%{transform:translate(-42%,-50%)} }
    .sp-pos-shake { animation: sp-pos-shake 0.42s ease-in-out; }
    @media (prefers-reduced-motion: reduce) { .sp-pos-shake { animation: none; } }
  `}</style>
);

const STARFIELD: CSSProperties = {
  backgroundImage: [
    "radial-gradient(circle at 9% 18%, rgba(255,255,255,0.9) 0 1px, transparent 2px)",
    "radial-gradient(circle at 24% 72%, rgba(165,243,252,0.82) 0 1.5px, transparent 2.5px)",
    "radial-gradient(circle at 42% 13%, rgba(255,255,255,0.78) 0 1px, transparent 2px)",
    "radial-gradient(circle at 68% 27%, rgba(221,214,254,0.9) 0 1.5px, transparent 2.5px)",
    "radial-gradient(circle at 86% 67%, rgba(255,255,255,0.82) 0 1px, transparent 2px)",
    "radial-gradient(circle at 55% 88%, rgba(103,232,249,0.72) 0 1px, transparent 2px)",
  ].join(","),
};

const SCENE_BACKGROUND: CSSProperties = {
  background:
    "radial-gradient(ellipse 58% 46% at 50% 48%, rgba(76,29,149,0.48), transparent 72%), radial-gradient(circle at 18% 24%, rgba(34,211,238,0.16), transparent 28%), radial-gradient(circle at 82% 74%, rgba(196,181,253,0.15), transparent 30%), linear-gradient(180deg, #101843 0%, #17134a 48%, #071629 100%)",
};

// ── Object art ──────────────────────────────────────────────────────────────
export function PositionObjectVisual({
  objectId,
  className = "h-16 w-16",
}: {
  objectId: string;
  className?: string;
}) {
  const svgId = useId().replace(/:/g, "");
  const gradient = (name: string) => `url(#${svgId}-${name})`;

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      style={{ filter: "drop-shadow(0 7px 7px rgba(2,6,23,0.38)) drop-shadow(0 0 7px rgba(103,232,249,0.12))" }}
    >
      <defs>
        <linearGradient id={`${svgId}-cyan`} x1="22" y1="18" x2="92" y2="102" gradientUnits="userSpaceOnUse">
          <stop stopColor="#cffafe" />
          <stop offset="0.42" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#0891b2" />
        </linearGradient>
        <linearGradient id={`${svgId}-violet`} x1="28" y1="18" x2="88" y2="106" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f5f3ff" />
          <stop offset="0.35" stopColor="#c4b5fd" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id={`${svgId}-gold`} x1="30" y1="14" x2="88" y2="103" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fef9c3" />
          <stop offset="0.42" stopColor="#fde047" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={`${svgId}-pink`} x1="30" y1="18" x2="88" y2="102" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fce7f3" />
          <stop offset="0.45" stopColor="#f9a8d4" />
          <stop offset="1" stopColor="#db2777" />
        </linearGradient>
        <linearGradient id={`${svgId}-green`} x1="28" y1="20" x2="88" y2="104" gradientUnits="userSpaceOnUse">
          <stop stopColor="#dcfce7" />
          <stop offset="0.45" stopColor="#86efac" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id={`${svgId}-stone`} x1="26" y1="22" x2="92" y2="106" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d8e1ee" />
          <stop offset="0.46" stopColor="#7c8aa0" />
          <stop offset="1" stopColor="#374151" />
        </linearGradient>
      </defs>
      {objectId === "planet" ? (
        <>
          <ellipse cx="60" cy="65" rx="53" ry="15" fill="none" stroke="#fef3c7" strokeWidth="10" opacity="0.36" transform="rotate(-12 60 65)" />
          <ellipse cx="60" cy="65" rx="53" ry="15" fill="none" stroke={gradient("gold")} strokeWidth="6" transform="rotate(-12 60 65)" />
          <circle cx="60" cy="58" r="31" fill={gradient("cyan")} stroke="#312e81" strokeWidth="5" />
          <path d="M38 53c8 4 13 3 20-2 9-6 19-2 25 4M43 72c8-5 17-4 24 0" fill="none" stroke="#0e7490" strokeWidth="5" strokeLinecap="round" opacity="0.78" />
          <ellipse cx="50" cy="40" rx="10" ry="6" fill="#fff" opacity="0.38" transform="rotate(-20 50 40)" />
        </>
      ) : null}
      {objectId === "moon" ? (
        <>
          <circle cx="60" cy="60" r="36" fill={gradient("violet")} stroke="#312e81" strokeWidth="5" />
          <circle cx="47" cy="50" r="7" fill="#8b5cf6" opacity="0.7" />
          <circle cx="73" cy="69" r="9" fill="#8b5cf6" opacity="0.62" />
          <circle cx="68" cy="42" r="5" fill="#7c3aed" opacity="0.55" />
          <path d="M38 76c13 7 28 8 42 1" fill="none" stroke="#ddd6fe" strokeWidth="4" opacity="0.46" strokeLinecap="round" />
          <ellipse cx="49" cy="37" rx="9" ry="5" fill="#fff" opacity="0.34" transform="rotate(-20 49 37)" />
        </>
      ) : null}
      {objectId === "rocket" ? (
        <>
          <path d="M60 10C72 20 80 35 80 51H40C40 35 48 20 60 10Z" fill={gradient("gold")} stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <path d="M42 47h36v43c0 6-5 10-10 10H52c-6 0-10-4-10-10Z" fill={gradient("cyan")} stroke="#312e81" strokeWidth="5" />
          <circle cx="60" cy="65" r="9" fill="#e0f2fe" stroke="#312e81" strokeWidth="4" />
          <circle cx="57" cy="62" r="3" fill="#fff" opacity="0.9" />
          <path d="M42 74 27 94l16-4M78 74l15 20-16-4" fill={gradient("pink")} stroke="#312e81" strokeWidth="4" strokeLinejoin="round" />
          <path d="M52 98h16l-8 13Z" fill="#fb923c" stroke="#9a3412" strokeWidth="3" />
          <path d="M56 98h8l-4 8Z" fill="#fef08a" />
        </>
      ) : null}
      {objectId === "flag" ? (
        <>
          <path d="M29 103V17" stroke="#ddd6fe" strokeWidth="9" strokeLinecap="round" />
          <path d="M29 103V17" stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" />
          <path d="M33 22Q66 28 98 48 66 68 33 76Z" fill={gradient("gold")} stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <path d="m57 39 5 9 10 1-8 7 2 10-9-5-9 5 2-10-8-7 10-1Z" fill="#fff" opacity="0.76" />
          <path d="M16 104h32" stroke="#67e8f9" strokeWidth="8" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "star" ? (
        <>
          <path d="M60 9 73 43 109 45 80 67 89 103 60 82 31 103 40 67 11 45 47 43Z" fill="#fde68a" opacity="0.22" />
          <path
            d="M60 14 71 45 104 46 77 66 87 97 60 78 33 97 43 66 16 46 49 45Z"
            fill={gradient("gold")}
            stroke="#b45309"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="m48 39 7 3-6 7" fill="none" stroke="#fff" strokeWidth="4" opacity="0.72" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "crystal" ? (
        <>
          <path d="M60 10 94 43 75 106H45L26 43Z" fill={gradient("violet")} stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <path d="M26 43H94M60 10 45 106M60 10 75 106" fill="none" stroke="#6d28d9" strokeWidth="4" opacity="0.82" />
          <path d="M60 10 52 43l8 51 8-51Z" fill="#e9d5ff" opacity="0.52" />
          <path d="m45 31 5-8" stroke="#fff" strokeWidth="4" opacity="0.78" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "alien" ? (
        <>
          <path d="M44 22v11M76 22v11" stroke="#4d7c0f" strokeWidth="5" strokeLinecap="round" />
          <circle cx="44" cy="19" r="6" fill="#bef264" stroke="#3f6212" strokeWidth="2" />
          <circle cx="76" cy="19" r="6" fill="#bef264" stroke="#3f6212" strokeWidth="2" />
          <ellipse cx="60" cy="66" rx="31" ry="35" fill={gradient("green")} stroke="#312e81" strokeWidth="5" />
          <ellipse cx="50" cy="62" rx="7" ry="10" fill="#1e1b4b" />
          <ellipse cx="70" cy="62" rx="7" ry="10" fill="#1e1b4b" />
          <circle cx="48" cy="59" r="2" fill="#fff" />
          <circle cx="68" cy="59" r="2" fill="#fff" />
          <path d="M52 84c5 4 11 4 16 0" fill="none" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="47" cy="42" rx="8" ry="4" fill="#fff" opacity="0.24" transform="rotate(-22 47 42)" />
        </>
      ) : null}
      {objectId === "explorer" || objectId === "geospin" ? (
        <>
          <circle cx="60" cy="34" r="21" fill={objectId === "geospin" ? gradient("violet") : gradient("gold")} stroke="#312e81" strokeWidth="5" />
          <path d="M37 31c8-11 38-11 46 0" fill="none" stroke="#e0f2fe" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
          <rect x="31" y="53" width="58" height="48" rx="18" fill={objectId === "geospin" ? gradient("cyan") : gradient("green")} stroke="#312e81" strokeWidth="5" />
          <path d="M31 66 16 84M89 66l15 18M44 100l-7 13M76 100l7 13" fill="none" stroke="#312e81" strokeWidth="7" strokeLinecap="round" />
          <circle cx="53" cy="33" r="3" fill="#1e1b4b" />
          <circle cx="67" cy="33" r="3" fill="#1e1b4b" />
          <path d="M53 42c5 4 9 4 14 0" fill="none" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" />
          {objectId === "geospin" ? <path d="m60 63 5 10 11 1-8 7 2 11-10-5-10 5 2-11-8-7 11-1Z" fill="#fde047" /> : null}
        </>
      ) : null}
      {objectId === "satellite" ? (
        <>
          <rect x="7" y="49" width="34" height="23" rx="3" fill={gradient("cyan")} stroke="#312e81" strokeWidth="4" />
          <rect x="79" y="49" width="34" height="23" rx="3" fill={gradient("cyan")} stroke="#312e81" strokeWidth="4" />
          <path d="M16 49v23M28 49v23M88 49v23M100 49v23M7 60h34M79 60h34" stroke="#0e7490" strokeWidth="2.5" />
          <rect x="45" y="44" width="30" height="32" rx="6" fill="#e2e8f0" stroke="#312e81" strokeWidth="5" />
          <rect x="51" y="50" width="18" height="20" rx="3" fill={gradient("violet")} />
          <path d="M60 44V31" stroke="#312e81" strokeWidth="4" />
          <path d="M48 24q12-11 24 0-12 13-24 0Z" fill={gradient("gold")} stroke="#312e81" strokeWidth="4" />
        </>
      ) : null}
      {objectId === "rover" ? (
        <>
          <circle cx="38" cy="92" r="14" fill="#1e293b" stroke="#312e81" strokeWidth="5" />
          <circle cx="82" cy="92" r="14" fill="#1e293b" stroke="#312e81" strokeWidth="5" />
          <circle cx="38" cy="92" r="5" fill="#94a3b8" />
          <circle cx="82" cy="92" r="5" fill="#94a3b8" />
          <rect x="26" y="52" width="68" height="30" rx="8" fill="#67e8f9" stroke="#312e81" strokeWidth="5" />
          <rect x="40" y="58" width="40" height="16" rx="3" fill="#0e7490" />
          <path d="M60 52 V36" stroke="#312e81" strokeWidth="5" strokeLinecap="round" />
          <circle cx="60" cy="32" r="7" fill="#fde047" stroke="#312e81" strokeWidth="4" />
        </>
      ) : null}
      {objectId === "cave" ? (
        <>
          <path d="M11 105Q12 39 60 32Q108 39 109 105Z" fill={gradient("stone")} stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <path d="M36 105Q36 65 60 61Q84 65 84 105Z" fill="#11142f" stroke="#4c1d95" strokeWidth="4" />
          <path d="M45 104Q45 76 60 72Q75 76 75 104Z" fill="#020617" />
          <path d="M27 66 39 48l10 13M77 48l13 18" fill="none" stroke="#cbd5e1" strokeWidth="5" opacity="0.42" strokeLinecap="round" />
          <circle cx="34" cy="78" r="4" fill="#a78bfa" />
          <circle cx="91" cy="73" r="5" fill="#67e8f9" />
          <path d="m27 85 4-9 4 9Z" fill="#c4b5fd" />
        </>
      ) : null}
    </svg>
  );
}

// ── Placement geometry ───────────────────────────────────────────────────────
function placementStyle(relation: PositionRelation, side?: "left" | "right"): {
  left: string;
  top: string;
  scale: number;
  z: number;
} {
  switch (relation) {
    case "above":
      return { left: "50%", top: "15%", scale: 1, z: 10 };
    case "below":
      return { left: "50%", top: "85%", scale: 1, z: 10 };
    case "beside":
      return { left: side === "left" ? "16%" : "84%", top: "50%", scale: 1, z: 10 };
    case "behind":
      return { left: "50%", top: "42%", scale: 0.76, z: 1 };
    case "in-front":
      return { left: "50%", top: "59%", scale: 1.12, z: 30 };
    case "inside":
      return { left: "50%", top: "61%", scale: 0.42, z: 30 };
    default:
      return { left: "50%", top: "50%", scale: 1, z: 10 };
  }
}

// ── Shared scene renderer ────────────────────────────────────────────────────
function PositionScene({
  anchorObject,
  placements,
  onTap,
  highlightId,
  foundIds,
  wrongId,
  heightClass = "h-64 sm:h-72",
  objectClass = "h-16 w-16 sm:h-20 sm:w-20",
  anchorClass = "h-20 w-20 sm:h-24 sm:w-24",
}: {
  anchorObject: string;
  placements: Placement[];
  onTap?: (placement: Placement) => void;
  highlightId?: string;
  foundIds?: Set<string>;
  wrongId?: string | null;
  heightClass?: string;
  objectClass?: string;
  anchorClass?: string;
}) {
  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border-2 border-violet-200 shadow-inner`}
      style={SCENE_BACKGROUND}
    >
      <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden="true" style={STARFIELD} />
      <div
        className="pointer-events-none absolute -left-[8%] top-[20%] h-[44%] w-[36%] rounded-full opacity-55 blur-3xl"
        aria-hidden="true"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.28), transparent 68%)" }}
      />
      <div
        className="pointer-events-none absolute -right-[8%] bottom-[4%] h-[48%] w-[38%] rounded-full opacity-55 blur-3xl"
        aria-hidden="true"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.3), transparent 68%)" }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[42%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-cyan-200/15"
        aria-hidden="true"
        style={{ boxShadow: "0 0 34px rgba(103,232,249,0.08), inset 0 0 30px rgba(139,92,246,0.08)" }}
      />
      <div className="pointer-events-none absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 20 }}>
        <span className="absolute left-1/2 top-[84%] h-4 w-[76%] -translate-x-1/2 rounded-[50%] bg-black/35 blur-sm" aria-hidden="true" />
        <span className="relative block">
          <PositionObjectVisual objectId={anchorObject} className={anchorClass} />
        </span>
      </div>
      {placements.map((placement) => {
        const geo = placementStyle(placement.relation, placement.side);
        const isFound = foundIds?.has(placement.id) ?? false;
        const isWrong = wrongId === placement.id;
        const isHighlight = highlightId === placement.id;
        const boxStyle: CSSProperties = {
          left: geo.left,
          top: geo.top,
          transform: `translate(-50%,-50%) scale(${geo.scale})`,
          zIndex: geo.z,
        };
        const inner = (
          <>
            <span className="absolute left-1/2 top-[84%] h-3 w-[70%] -translate-x-1/2 rounded-[50%] bg-black/30 blur-sm" aria-hidden="true" />
            <span className="relative block">
              <PositionObjectVisual objectId={placement.object} className={objectClass} />
            </span>
          </>
        );

        if (onTap) {
          return (
            <button
              key={placement.id}
              type="button"
              aria-label={positionObjectLabel(placement.object)}
              onClick={() => onTap(placement)}
              className={[
                "absolute flex items-center justify-center rounded-2xl border-2 border-transparent p-1 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200/70 active:scale-95",
                isFound
                  ? "border-emerald-300 bg-emerald-400/25"
                  : isWrong
                    ? "sp-pos-shake border-rose-400 bg-rose-500/25"
                    : "bg-transparent hover:border-cyan-300/70 hover:bg-cyan-100/10",
              ].join(" ")}
              style={boxStyle}
            >
              {inner}
              {isFound ? (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-indigo-950 shadow">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        }

        return (
          <div
            key={placement.id}
            className={[
              "absolute flex items-center justify-center rounded-2xl p-1",
              isHighlight ? "rounded-full bg-cyan-200/10 ring-4 ring-cyan-300/65 shadow-[0_0_24px_rgba(103,232,249,0.3)]" : "",
            ].join(" ")}
            style={boxStyle}
          >
            {inner}
          </div>
        );
      })}
      {POS_SHAKE}
    </div>
  );
}

// ── Find It ──────────────────────────────────────────────────────────────────
export function StarpathPositionFindCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: PositionFindTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <PositionScene
        anchorObject={task.anchorObject}
        placements={task.placements}
        onTap={(placement) => (placement.id === task.correctId ? onCorrect() : onWrong())}
      />
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">Tap the object the clue describes.</p>
    </div>
  );
}

// ── Say Where ────────────────────────────────────────────────────────────────
export function StarpathPositionWordCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: PositionWordTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const placements: Placement[] = [
    { id: "subject", object: task.subjectObject, relation: task.relation, side: task.side },
  ];
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <PositionScene anchorObject={task.anchorObject} placements={placements} highlightId="subject" />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-16 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white px-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <span className="text-xl font-black text-indigo-950">{RELATION_WORD[option.relation]}</span>
            <OptionReadAloudButton text={RELATION_WORD[option.relation]} className="absolute right-2 top-1/2 -translate-y-1/2" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Place It ─────────────────────────────────────────────────────────────────
export function StarpathPositionPlaceCard({
  task,
  onComplete,
}: {
  task: PositionPlaceTask;
  onComplete: () => void;
}) {
  const [placed, setPlaced] = useState(false);
  const [wrongSlot, setWrongSlot] = useState<PositionRelation | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const doneRef = useRef(false);

  function tryPlace(slot: PositionRelation) {
    if (doneRef.current) return;
    const ok = slot === task.relation;
    if (ok) {
      doneRef.current = true;
      setPlaced(true);
      setTimeout(onComplete, 480);
    } else {
      setWrongSlot(slot);
      setTimeout(() => setWrongSlot((value) => (value === slot ? null : value)), 480);
    }
  }

  function finishDrop(clientX: number, clientY: number) {
    const dropTarget = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-slot]");
    setOffset({ x: 0, y: 0 });
    dragStart.current = null;
    if (dropTarget?.dataset.slot) tryPlace(dropTarget.dataset.slot as PositionRelation);
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="relative h-64 w-full overflow-hidden rounded-2xl border-2 border-violet-200 shadow-inner sm:h-72" style={SCENE_BACKGROUND}>
        <div className="pointer-events-none absolute inset-0 opacity-90" aria-hidden="true" style={STARFIELD} />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[42%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-cyan-200/15" aria-hidden="true" />
        <div className="pointer-events-none absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 20 }}>
          <span className="absolute left-1/2 top-[84%] h-4 w-[76%] -translate-x-1/2 rounded-[50%] bg-black/35 blur-sm" aria-hidden="true" />
          <span className="relative block">
            <PositionObjectVisual objectId={task.anchorObject} className="h-20 w-20 sm:h-24 sm:w-24" />
          </span>
        </div>
        {task.slots.map((slot) => {
          const geo = placementStyle(slot);
          const filled = placed && slot === task.relation;
          return (
            <button
              key={slot}
              type="button"
              data-slot={slot}
              onClick={() => tryPlace(slot)}
              className={[
                "absolute flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed transition sm:h-20 sm:w-20",
                filled
                  ? "border-emerald-300 bg-emerald-400/25"
                  : wrongSlot === slot
                    ? "sp-pos-shake border-rose-400 bg-rose-500/20"
                    : "border-cyan-200/45 bg-cyan-100/[0.03] hover:border-cyan-300 hover:bg-cyan-100/10",
              ].join(" ")}
              style={{ left: geo.left, top: geo.top, transform: "translate(-50%,-50%)", zIndex: 10 }}
            >
              {filled ? <PositionObjectVisual objectId={task.moverObject} className="h-14 w-14 sm:h-16 sm:w-16" /> : null}
            </button>
          );
        })}
        {POS_SHAKE}
      </div>
      {!placed ? (
        <div className="mt-4 flex flex-col items-center">
          <button
            type="button"
            aria-label={`Drag the ${positionObjectLabel(task.moverObject)}`}
            onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
              dragStart.current = { x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!dragStart.current) return;
              setOffset({ x: event.clientX - dragStart.current.x, y: event.clientY - dragStart.current.y });
            }}
            onPointerUp={(event) => finishDrop(event.clientX, event.clientY)}
            onPointerCancel={() => {
              dragStart.current = null;
              setOffset({ x: 0, y: 0 });
            }}
            className="touch-none cursor-grab rounded-2xl border-2 border-violet-300 bg-white p-2 shadow-lg active:cursor-grabbing"
            style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`, zIndex: offset.x || offset.y ? 40 : 1 }}
          >
            <PositionObjectVisual objectId={task.moverObject} className="h-16 w-16" />
          </button>
          <p className="mt-2 text-center text-sm font-semibold text-slate-600">Drag the {positionObjectLabel(task.moverObject)} into place, or tap the spot.</p>
        </div>
      ) : (
        <p className="mt-4 text-center text-base font-black text-emerald-700">Perfect placing!</p>
      )}
    </div>
  );
}

// ── Which Picture ────────────────────────────────────────────────────────────
export function StarpathPositionPictureCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: PositionPictureTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="group rounded-2xl border-2 border-transparent p-1 transition hover:border-cyan-400 focus:border-cyan-400"
          >
            <PositionScene
              anchorObject={option.anchorObject}
              placements={[{ id: "s", object: option.subjectObject, relation: option.relation, side: option.side }]}
              heightClass="h-44 sm:h-48"
              objectClass="h-14 w-14 sm:h-16 sm:w-16"
              anchorClass="h-16 w-16 sm:h-20 sm:w-20"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Follow the Clues ─────────────────────────────────────────────────────────
export function StarpathPositionSequenceCard({
  task,
  onComplete,
}: {
  task: PositionSequenceTask;
  onComplete: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const doneRef = useRef(false);
  const step = task.steps[stepIndex];

  function tap(placement: Placement) {
    if (doneRef.current || !step) return;
    if (placement.id === step.targetId) {
      const next = new Set(found);
      next.add(placement.id);
      setFound(next);
      if (stepIndex + 1 >= task.steps.length) {
        doneRef.current = true;
        setTimeout(onComplete, 520);
      } else {
        setStepIndex(stepIndex + 1);
      }
    } else {
      setWrongId(placement.id);
      setTimeout(() => setWrongId((value) => (value === placement.id ? null : value)), 460);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-black text-white">
            {stepIndex + 1}
          </span>
          <span className="text-base font-black text-indigo-950 sm:text-lg">{step?.instruction ?? "Mission complete!"}</span>
        </div>
        {step ? <ReadAloudBtn text={step.speakText} size="md" label="Read" className="shrink-0" /> : null}
      </div>
      <PositionScene
        anchorObject={task.anchorObject}
        placements={task.placements}
        onTap={tap}
        foundIds={found}
        wrongId={wrongId}
      />
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">
        Step {Math.min(stepIndex + 1, task.steps.length)} of {task.steps.length}
      </p>
    </div>
  );
}
