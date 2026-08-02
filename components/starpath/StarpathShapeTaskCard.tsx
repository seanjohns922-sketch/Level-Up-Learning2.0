"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask, StarpathShape } from "@/data/activities/year1/practice-task";
import { SHAPE_FACTS, type FoundationShape } from "@/data/activities/starpath/ground/week1Lesson1";
import { SHAPE_OBJECTS, type ShapeObjectId } from "@/data/activities/starpath/ground/shape-objects";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import type { PositionRelation } from "@/data/activities/starpath/ground/position-objects";

type ShapeIntroTask = Extract<PracticeTask, { kind: "starpathShapeIntro" }>;
type ShapeMatchTask = Extract<PracticeTask, { kind: "starpathShapeMatch" }>;
type ShapeSortTask = Extract<PracticeTask, { kind: "starpathShapeSort" }>;
type ShapeSceneTask = Extract<PracticeTask, { kind: "starpathShapeScene" }>;

const SHAPES: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];

export function ShapeVisual({
  shape,
  colour,
  scale = 1,
  className = "h-24 w-24",
}: {
  shape: StarpathShape;
  colour: string;
  scale?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`shape-${shape}-${colour.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.64" />
          <stop offset="0.3" stopColor={colour} />
          <stop offset="1" stopColor={colour} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g
        transform={`translate(60 60) scale(${scale}) translate(-60 -60)`}
        fill={`url(#shape-${shape}-${colour.replace("#", "")})`}
        stroke="#312e81"
        strokeWidth="5"
        strokeLinejoin="round"
      >
        {shape === "circle" ? <circle cx="60" cy="60" r="38" /> : null}
        {shape === "oval" ? <ellipse cx="60" cy="60" rx="45" ry="29" /> : null}
        {shape === "triangle" ? <path d="M60 17 105 98H15Z" /> : null}
        {shape === "square" ? <rect x="22" y="22" width="76" height="76" rx="4" /> : null}
        {shape === "rectangle" ? <rect x="13" y="31" width="94" height="58" rx="4" /> : null}
      </g>
    </svg>
  );
}

export function TaskHeading({ prompt, speech }: { prompt: string; speech: string }) {
  return (
    <div className="mb-5 flex items-center justify-center gap-3 text-center">
      <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">{prompt}</h2>
      <ReadAloudBtn text={speech} size="md" label="Read" className="shrink-0" />
    </div>
  );
}

const SHAPE_TEACH_COLOUR = ["#67e8f9", "#fde047", "#86efac", "#f9a8d4"] as const;

// L2 teaching — shapes live inside familiar space objects.
const TEACH_OBJECT_PAIRS: Array<{ objectId: ShapeObjectId; shape: FoundationShape }> = [
  { objectId: "planet", shape: "circle" },
  { objectId: "rocket", shape: "triangle" },
  { objectId: "window", shape: "square" },
  { objectId: "door", shape: "rectangle" },
];

// L3 teaching — the clues that tell shapes apart.
const TEACH_CLUES: Array<{ title: string; shape: FoundationShape; colour: string; tip: string }> = [
  { title: "Round", shape: "circle", colour: "#67e8f9", tip: "A circle is round with no corners." },
  { title: "3 straight sides", shape: "triangle", colour: "#fde047", tip: "A triangle has 3 straight sides." },
  { title: "4 straight sides", shape: "square", colour: "#86efac", tip: "Squares and rectangles have 4 straight sides." },
];

const LEVEL_ONE_SHAPE_PAIRS = [
  {
    title: "Circle and oval",
    tip: "Both are round. An oval is longer in one direction.",
    shapes: [
      { shape: "circle" as const, colour: "#67e8f9", rotation: 0 },
      { shape: "oval" as const, colour: "#c4b5fd", rotation: 24 },
    ],
  },
  {
    title: "Square and rectangle",
    tip: "Both have 4 straight sides, but their sides are not arranged the same way.",
    shapes: [
      { shape: "square" as const, colour: "#86efac", rotation: 12 },
      { shape: "rectangle" as const, colour: "#f9a8d4", rotation: -18 },
    ],
  },
  {
    title: "Turned shapes",
    tip: "Turning a familiar shape does not change its name.",
    shapes: [
      { shape: "triangle" as const, colour: "#fde047", rotation: 0 },
      { shape: "triangle" as const, colour: "#fb923c", rotation: 42 },
    ],
  },
] as const;

// Week 4 teaching — position words shown with a small example scene.
type PositionTeach = { word: string; tip: string; anchor: string; subject: string; relation: PositionRelation; side?: "left" | "right" };
const TEACH_POSITIONS: PositionTeach[] = [
  { word: "Above", tip: "Above means higher up.", anchor: "planet", subject: "star", relation: "above" },
  { word: "Below", tip: "Below means lower down.", anchor: "star", subject: "moon", relation: "below" },
  { word: "Beside", tip: "Beside means right next to.", anchor: "rocket", subject: "crystal", relation: "beside", side: "right" },
];
const TEACH_POSITIONS_DEPTH: PositionTeach[] = [
  { word: "Behind", tip: "Behind means at the back.", anchor: "rocket", subject: "alien", relation: "behind" },
  { word: "In front", tip: "In front means at the front.", anchor: "planet", subject: "satellite", relation: "in-front" },
  { word: "Inside", tip: "Inside means tucked within.", anchor: "cave", subject: "crystal", relation: "inside" },
];

function TeachRelation({ anchor, subject, relation, side }: { anchor: string; subject: string; relation: PositionRelation; side?: "left" | "right" }) {
  const pos =
    relation === "above"
      ? { left: "50%", top: "8%" }
      : relation === "below"
        ? { left: "50%", top: "92%" }
        : relation === "beside"
          ? { left: side === "left" ? "8%" : "92%", top: "50%" }
          : relation === "behind"
            ? { left: "50%", top: "30%" }
            : relation === "in-front"
              ? { left: "50%", top: "70%" }
              : { left: "50%", top: "60%" };
  const scale = relation === "behind" ? 0.7 : relation === "in-front" ? 1.05 : relation === "inside" ? 0.5 : 1;
  const z = relation === "behind" ? 1 : relation === "in-front" || relation === "inside" ? 30 : 10;
  return (
    <div className="relative h-24 w-24">
      <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 20 }}>
        <PositionObjectVisual objectId={anchor} className="h-12 w-12" />
      </div>
      <div className="absolute" style={{ ...pos, transform: `translate(-50%,-50%) scale(${scale})`, zIndex: z }}>
        <PositionObjectVisual objectId={subject} className="h-9 w-9" />
      </div>
    </div>
  );
}

const TEACH_DIRECTIONS = [
  { word: "Up", icon: ArrowUp, tip: "Up moves toward the top." },
  { word: "Down", icon: ArrowDown, tip: "Down moves toward the bottom." },
  { word: "Left", icon: ArrowLeft, tip: "Left moves to your left." },
  { word: "Right", icon: ArrowRight, tip: "Right moves to your right." },
] as const;

function DirectionTeachGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TEACH_DIRECTIONS.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.word} className="relative flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
            <OptionReadAloudButton text={`${item.word}. ${item.tip}`} className="absolute right-2 top-2" />
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-950 to-violet-900 text-cyan-200">
              <Icon className="h-8 w-8" strokeWidth={2.75} />
            </span>
            <div className="mt-2 text-lg font-black text-indigo-950">{item.word}</div>
            <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{item.tip}</div>
          </div>
        );
      })}
    </div>
  );
}

function PositionTeachGrid({ items }: { items: PositionTeach[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.word} className="relative flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
          <OptionReadAloudButton text={`${item.word}. ${item.tip}`} className="absolute right-2 top-2" />
          <div className="rounded-xl bg-gradient-to-b from-indigo-950 to-violet-900 p-1">
            <TeachRelation anchor={item.anchor} subject={item.subject} relation={item.relation} side={item.side} />
          </div>
          <div className="mt-2 text-base font-black text-indigo-950">{item.word}</div>
          <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{item.tip}</div>
        </div>
      ))}
    </div>
  );
}

// Week 8 (Master Mapper) teaching — a small map that mirrors the real practice
// grid, so the explanation looks like what the child is about to do.
type MiniMarker = { r: number; c: number; object: string };
type MiniArrow = { r: number; c: number; dir: "up" | "down" | "left" | "right" };
const MINI_ARROW_ICON = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight } as const;

function MiniMap({ markers, arrows = [] }: { markers: MiniMarker[]; arrows?: MiniArrow[] }) {
  const cols = 3;
  const rows = 3;
  const place = (r: number, c: number) => ({
    left: `${((c + 0.5) / cols) * 100}%`,
    top: `${((r + 0.5) / rows) * 100}%`,
    transform: "translate(-50%,-50%)",
  });
  return (
    <div
      className="relative mx-auto w-full max-w-[9.5rem] overflow-hidden rounded-xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 to-violet-900 shadow-inner"
      style={{ aspectRatio: "1 / 1" }}
    >
      <div className="grid h-full w-full" style={{ gridTemplateColumns: "repeat(3,1fr)", gridTemplateRows: "repeat(3,1fr)" }}>
        {Array.from({ length: cols * rows }).map((_, index) => (
          <div key={index} className="border border-cyan-200/15" />
        ))}
      </div>
      {arrows.map((arrow, index) => {
        const Icon = MINI_ARROW_ICON[arrow.dir];
        return (
          <span key={`arrow-${index}`} className="absolute flex h-5 w-5 items-center justify-center text-cyan-300" style={place(arrow.r, arrow.c)}>
            <Icon className="h-4 w-4" strokeWidth={3} />
          </span>
        );
      })}
      {markers.map((marker) => (
        <span key={`${marker.object}-${marker.r}-${marker.c}`} className="absolute" style={place(marker.r, marker.c)}>
          <PositionObjectVisual objectId={marker.object} className="h-7 w-7 sm:h-8 sm:w-8" />
        </span>
      ))}
    </div>
  );
}

function TeachCard({ readAloud, title, tip, children }: { readAloud: string; title: string; tip: string; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
      <OptionReadAloudButton text={readAloud} className="absolute right-2 top-2" />
      <div className="flex flex-1 items-center justify-center">{children}</div>
      <div className="mt-2 text-base font-black text-indigo-950">{title}</div>
      <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{tip}</div>
    </div>
  );
}

// A shape with each of its straight sides drawn as a bright segment and
// numbered, so "a side" is concrete for the child: one straight edge, counted.
const SIDE_BADGES: Record<"square" | "triangle", Array<{ n: number; x: number; y: number }>> = {
  square: [
    { n: 1, x: 60, y: 22 },
    { n: 2, x: 98, y: 60 },
    { n: 3, x: 60, y: 98 },
    { n: 4, x: 22, y: 60 },
  ],
  triangle: [
    { n: 1, x: 37, y: 57 },
    { n: 2, x: 83, y: 57 },
    { n: 3, x: 60, y: 100 },
  ],
};
function NumberedSidesShape({ shape = "square" }: { shape?: "square" | "triangle" }) {
  const outline = shape === "square" ? "M22 22H98M98 22V98M22 98H98M22 22V98" : "M60 16 102 100 18 100Z";
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
      {shape === "square" ? (
        <rect x="22" y="22" width="76" height="76" rx="3" fill="#ecfeff" />
      ) : (
        <path d="M60 16 102 100 18 100Z" fill="#ecfeff" />
      )}
      <path d={outline} fill="none" stroke="#0891b2" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {SIDE_BADGES[shape].map((badge) => (
        <g key={badge.n}>
          <circle cx={badge.x} cy={badge.y} r="11" fill="#7c3aed" stroke="#fff" strokeWidth="2.5" />
          <text x={badge.x} y={badge.y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="900" fill="#fff">
            {badge.n}
          </text>
        </g>
      ))}
    </svg>
  );
}

// A triangle with its three straight sides traced bright — "straight" made visible.
function StraightEdgeShape() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
      <path d="M60 16 102 100 18 100Z" fill="#ecfeff" stroke="#0891b2" strokeWidth="7" strokeLinejoin="round" />
    </svg>
  );
}

// A circle with its one curved edge traced bright — "curved" made visible.
function CurvedEdgeShape() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
      <circle cx="60" cy="60" r="40" fill="#ecfeff" stroke="#d946ef" strokeWidth="7" />
      <path d="M60 20a40 40 0 0 1 34 20" fill="none" stroke="#a21caf" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

// A rectangle with its top and bottom sides highlighted as a matching pair with
// arrows the same way — parallel sides "run alongside and never meet".
function ParallelSidesShape() {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
      <rect x="16" y="34" width="88" height="52" rx="3" fill="#ecfeff" stroke="#c7d2fe" strokeWidth="4" />
      <path d="M22 40H98M22 80H98" fill="none" stroke="#0891b2" strokeWidth="7" strokeLinecap="round" />
      <path d="M84 40l8 0M84 80l8 0" fill="none" stroke="#0891b2" strokeWidth="7" strokeLinecap="round" />
      <path d="M60 46v28" fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="4 5" strokeLinecap="round" />
    </svg>
  );
}

function MasterTeachGrid({ variant }: { variant: "masterShapeMap" | "masterPathway" | "masterMission" }) {
  if (variant === "masterShapeMap") {
    return (
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <TeachCard readAloud="Shape skills. A side is one straight edge. This square has 4 sides. Count them: 1, 2, 3, 4." title="Shape skills" tip="A side is one straight edge. This square has 4 sides.">
          <NumberedSidesShape shape="square" />
        </TeachCard>
        <TeachCard readAloud="Map skills. The star is a place on the map. Find it." title="Map skills" tip="The star is a place. Find it on the map.">
          <MiniMap markers={[{ r: 0, c: 2, object: "star" }]} />
        </TeachCard>
      </div>
    );
  }
  if (variant === "masterPathway") {
    return (
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        <TeachCard readAloud="Read the map. The rocket is you. The star is where to go." title="Read" tip="The rocket is you. The star is where to go.">
          <MiniMap markers={[{ r: 2, c: 0, object: "rocket" }, { r: 0, c: 2, object: "star" }]} />
        </TeachCard>
        <TeachCard readAloud="Follow the path. Each arrow is one move. Follow the moves to the star." title="Follow" tip="Each arrow is one move. Follow them to the star.">
          <MiniMap markers={[{ r: 2, c: 0, object: "rocket" }, { r: 0, c: 2, object: "star" }]} arrows={[{ r: 2, c: 1, dir: "right" }, { r: 1, c: 2, dir: "up" }]} />
        </TeachCard>
        <TeachCard readAloud="Give your own route. A route is moves in order. Build it, then run it." title="Give" tip="A route is moves in order. Build it, then run it.">
          <div className="flex items-center gap-1.5">
            {(["right", "right", "up"] as const).map((dir, index) => {
              const Icon = MINI_ARROW_ICON[dir];
              return (
                <span key={index} className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-950 to-violet-900 text-cyan-200">
                  <Icon className="h-5 w-5" strokeWidth={3} />
                </span>
              );
            })}
          </div>
        </TeachCard>
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
      <TeachCard readAloud="Compare shapes. Look at the sides and corners. What is the same? What is different?" title="Compare shapes" tip="Look at the sides and corners. Same or different?">
        <div className="flex items-center gap-1.5">
          <ShapeVisual shape="square" colour="#86efac" className="h-16 w-16" />
          <ShapeVisual shape="rectangle" colour="#f9a8d4" className="h-14 w-20" />
        </div>
      </TeachCard>
      <TeachCard readAloud="Read the map. The star is the place. Find it on the map." title="Read the map" tip="The star is the place. Find it.">
        <MiniMap markers={[{ r: 0, c: 2, object: "star" }]} />
      </TeachCard>
      <TeachCard readAloud="Navigate. A route is moves in order to reach the star." title="Navigate" tip="A route is moves in order to reach the star.">
        <MiniMap markers={[{ r: 2, c: 0, object: "rocket" }, { r: 0, c: 2, object: "star" }]} arrows={[{ r: 2, c: 1, dir: "right" }, { r: 1, c: 2, dir: "up" }]} />
      </TeachCard>
    </div>
  );
}

// Weeks 1-7 concept explainers — each defines its skill with a visual before
// practice, matching the Week 8 treatment.
function ConceptTeachGrid({
  variant,
}: {
  variant: "featureEdges" | "featureSides" | "featureParallel" | "featureCompare" | "mapLocate" | "mapRoute";
}) {
  if (variant === "featureEdges") {
    return (
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <TeachCard readAloud="Straight sides. A straight side is a flat line. It does not bend. A triangle has straight sides." title="Straight sides" tip="A straight side is a flat line. It does not bend.">
          <StraightEdgeShape />
        </TeachCard>
        <TeachCard readAloud="Curved edges. A curved edge bends round and round. A circle has one curved edge." title="Curved edges" tip="A curved edge bends round and round.">
          <CurvedEdgeShape />
        </TeachCard>
      </div>
    );
  }
  if (variant === "featureSides") {
    return (
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <TeachCard readAloud="A side is one straight edge. Count each side once. A triangle has 3 sides." title="3 sides" tip="A side is one straight edge. A triangle has 3 sides.">
          <NumberedSidesShape shape="triangle" />
        </TeachCard>
        <TeachCard readAloud="Count each side once. A square has 4 sides." title="4 sides" tip="Count each side once. A square has 4 sides.">
          <NumberedSidesShape shape="square" />
        </TeachCard>
      </div>
    );
  }
  if (variant === "featureParallel") {
    return (
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <TeachCard readAloud="Parallel sides run alongside each other like train tracks and never meet." title="Parallel sides" tip="They run alongside like train tracks and never meet.">
          <ParallelSidesShape />
        </TeachCard>
        <TeachCard readAloud="A triangle has no parallel sides. Its sides all lean toward each other." title="No parallel sides" tip="A triangle has none — its sides lean together.">
          <StraightEdgeShape />
        </TeachCard>
      </div>
    );
  }
  if (variant === "featureCompare") {
    return (
      <div className="mx-auto grid max-w-xl grid-cols-1 gap-3">
        <TeachCard readAloud="Compare two shapes. Look at the sides and corners. What is the same? What is different?" title="Compare two shapes" tip="Look at the sides and corners: what is the same, what is different?">
          <div className="flex items-center gap-3">
            <ShapeVisual shape="square" colour="#86efac" className="h-16 w-16" />
            <ShapeVisual shape="triangle" colour="#fde047" className="h-16 w-16" />
          </div>
        </TeachCard>
      </div>
    );
  }
  if (variant === "mapLocate") {
    return (
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        <TeachCard readAloud="A map shows places from above. Each picture is a place." title="A map shows places" tip="Each picture on the map is a place.">
          <MiniMap markers={[{ r: 0, c: 2, object: "star" }, { r: 2, c: 1, object: "planet" }]} />
        </TeachCard>
        <TeachCard readAloud="Find the place you are looking for on the map." title="Find the place" tip="Look for the place you need, then tap it.">
          <MiniMap markers={[{ r: 0, c: 2, object: "star" }]} />
        </TeachCard>
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      <TeachCard readAloud="A route is moves in order. Follow each arrow to move the rocket to the star." title="Follow a route" tip="Each arrow is one move. Follow them to the star.">
        <MiniMap markers={[{ r: 2, c: 0, object: "rocket" }, { r: 0, c: 2, object: "star" }]} arrows={[{ r: 2, c: 1, dir: "right" }, { r: 1, c: 2, dir: "up" }]} />
      </TeachCard>
      <TeachCard readAloud="Give your own route. Put the moves in order, then run it." title="Give a route" tip="Put the moves in order, then run it.">
        <div className="flex items-center gap-1.5">
          {(["right", "right", "up"] as const).map((dir, index) => {
            const Icon = MINI_ARROW_ICON[dir];
            return (
              <span key={index} className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-b from-indigo-950 to-violet-900 text-cyan-200">
                <Icon className="h-5 w-5" strokeWidth={3} />
              </span>
            );
          })}
        </div>
      </TeachCard>
    </div>
  );
}

export function StarpathShapeIntroCard({
  task,
  onContinue,
}: {
  task: ShapeIntroTask;
  onContinue: () => void;
}) {
  const variant = task.variant ?? "shapes";
  const heading =
    task.heading ??
    (variant === "objects"
      ? "Shapes are everywhere"
      : variant === "clues"
        ? "Look for the clues"
        : variant === "builders"
          ? "Little shapes make big pictures"
          : variant === "positions" || variant === "positionsDepth"
            ? "Where is it?"
            : variant === "directions"
              ? "Which way?"
              : variant === "masterShapeMap"
                ? "Shape skills and map skills"
                : variant === "masterPathway"
                  ? "Read, follow, give a route"
                  : variant === "masterMission"
                    ? "Put every skill together"
                    : variant === "featureEdges"
                      ? "Straight or curved?"
                      : variant === "featureSides"
                        ? "What is a side?"
                        : variant === "featureParallel"
                          ? "What are parallel sides?"
                          : variant === "featureCompare"
                            ? "Comparing shapes"
                            : variant === "mapLocate"
                              ? "Reading a map"
                              : variant === "mapRoute"
                                ? "Following a route"
                                : "Meet the cosmic shapes");

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-cyan-50 p-5 sm:p-7">
      <TaskHeading prompt={heading} speech={task.speakText} />

      {variant === "masterShapeMap" || variant === "masterPathway" || variant === "masterMission" ? (
        <MasterTeachGrid variant={variant} />
      ) : variant === "featureEdges" || variant === "featureSides" || variant === "featureParallel" || variant === "featureCompare" || variant === "mapLocate" || variant === "mapRoute" ? (
        <ConceptTeachGrid variant={variant} />
      ) : variant === "builders" ? (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { shape: "rectangle" as const, colour: "#67e8f9", label: "Rocket body" },
            { shape: "triangle" as const, colour: "#fde047", label: "Rocket top" },
            { shape: "circle" as const, colour: "#86efac", label: "Rocket window" },
          ].map((part) => (
            <div key={part.label} className="relative flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
              <OptionReadAloudButton text={`${part.label}.`} className="absolute right-2 top-2" />
              <ShapeVisual shape={part.shape} colour={part.colour} className="h-20 w-20" />
              <div className="mt-2 text-base font-black text-indigo-950">{part.label}</div>
            </div>
          ))}
        </div>
      ) : variant === "objects" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEACH_OBJECT_PAIRS.map(({ objectId, shape }) => (
            <div key={objectId} className="relative flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
              <OptionReadAloudButton text={SHAPE_OBJECTS[objectId].part} className="absolute right-2 top-2" />
              <SceneObjectVisual objectId={objectId} />
              <div className="mt-1 flex items-center gap-1.5 text-sm font-black text-indigo-950">
                <span>{SHAPE_OBJECTS[objectId].label}</span>
                <span className="text-cyan-600">=</span>
                <ShapeVisual shape={shape} colour={SHAPE_TEACH_COLOUR[["circle", "triangle", "square", "rectangle"].indexOf(shape)]!} className="h-6 w-6" />
                <span className="capitalize">{shape}</span>
              </div>
            </div>
          ))}
        </div>
      ) : variant === "positions" ? (
        <PositionTeachGrid items={TEACH_POSITIONS} />
      ) : variant === "positionsDepth" ? (
        <PositionTeachGrid items={TEACH_POSITIONS_DEPTH} />
      ) : variant === "directions" ? (
        <DirectionTeachGrid />
      ) : variant === "levelOneShapes" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {LEVEL_ONE_SHAPE_PAIRS.map((item) => (
            <div
              key={item.title}
              className="relative flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm"
            >
              <OptionReadAloudButton text={`${item.title}. ${item.tip}`} className="absolute right-2 top-2" />
              <div className="flex items-center gap-2">
                {item.shapes.map((shape, index) => (
                  <div
                    key={`${shape.shape}-${index}`}
                    style={{ transform: `rotate(${shape.rotation}deg)` }}
                  >
                    <ShapeVisual shape={shape.shape} colour={shape.colour} className="h-16 w-20 sm:h-20 sm:w-24" />
                  </div>
                ))}
              </div>
              <div className="mt-1 text-base font-black text-indigo-950">{item.title}</div>
              <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{item.tip}</div>
            </div>
          ))}
        </div>
      ) : variant === "clues" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TEACH_CLUES.map((clue) => (
            <div key={clue.title} className="relative flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
              <OptionReadAloudButton text={`${clue.title}. ${clue.tip}`} className="absolute right-2 top-2" />
              <div className="flex items-end gap-1">
                <ShapeVisual shape={clue.shape} colour={clue.colour} className="h-16 w-16 sm:h-20 sm:w-20" />
                {clue.shape === "square" ? <ShapeVisual shape="rectangle" colour="#f9a8d4" className="h-12 w-16" /> : null}
              </div>
              <div className="mt-1 text-base font-black text-indigo-950">{clue.title}</div>
              <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{clue.tip}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHAPES.map((shape, index) => (
            <div key={shape} className="relative flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
              <OptionReadAloudButton text={`${shape}. ${SHAPE_FACTS[shape]}`} className="absolute right-2 top-2" />
              <ShapeVisual shape={shape} colour={SHAPE_TEACH_COLOUR[index]!} className="h-20 w-20 sm:h-24 sm:w-24" />
              <div className="mt-1 text-lg font-black capitalize text-indigo-950">{shape}</div>
              <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{SHAPE_FACTS[shape]}</div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="mx-auto mt-6 block min-h-12 rounded-2xl bg-violet-700 px-7 py-3 text-lg font-black text-white shadow-lg transition hover:bg-violet-600 active:scale-[0.98]"
      >
        Start practising
      </button>
    </div>
  );
}

export function StarpathShapeMatchCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeMatchTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex w-full max-w-xs flex-col items-center rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-3 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Target shape</div>
        <ShapeVisual shape={task.targetShape} colour="#a5f3fc" className="mt-1 h-24 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => option.id === task.correctOptionId ? onCorrect() : onWrong()}
            aria-label={option.shape}
            className="relative flex min-h-44 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <OptionReadAloudButton text={option.shape} className="absolute right-3 top-3" />
            <div style={{ transform: `rotate(${option.rotation ?? 0}deg)` }}>
              <ShapeVisual shape={option.shape} colour={option.colour} scale={option.scale} className="h-28 w-28" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function StarpathShapeSortCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeSortTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  function finishDrop(clientX: number, clientY: number) {
    const dropTarget = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-shape-drop]");
    setOffset({ x: 0, y: 0 });
    dragStart.current = null;
    if (!dropTarget) return;
    if (dropTarget.dataset.shapeDrop === task.shape) onCorrect();
    else onWrong();
  }

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    dragStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mb-5 flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/70 p-3">
        <button
          type="button"
          aria-label={`Drag the ${task.shape}`}
          onPointerDown={startDrag}
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
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`, zIndex: offset.x || offset.y ? 20 : 1 }}
        >
          <ShapeVisual shape={task.shape} colour={task.colour} scale={task.scale} className="h-24 w-28" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SHAPES.map((shape) => (
          <button
            key={shape}
            type="button"
            data-shape-drop={shape}
            onClick={() => shape === task.shape ? onCorrect() : onWrong()}
            className="flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50 to-violet-100 p-3 shadow-sm transition hover:border-cyan-400 hover:shadow-md"
          >
            <span className="h-12 w-12 rounded-full border-4 border-violet-300 bg-indigo-950 shadow-[inset_0_0_18px_rgba(103,232,249,0.45)]" />
            <span className="mt-2 text-sm font-black capitalize text-indigo-950">{shape} planet</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">Drag the shape, or tap its planet.</p>
    </div>
  );
}

const DEFAULT_SCENE_OBJECTS: ShapeObjectId[] = ["planet", "flag", "window", "door"];

export function SceneObjectVisual({ objectId }: { objectId: ShapeObjectId }) {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
      {objectId === "planet" ? (
        <>
          <ellipse cx="60" cy="65" rx="54" ry="15" fill="none" stroke="#fde68a" strokeWidth="8" transform="rotate(-12 60 65)" />
          <circle cx="60" cy="58" r="31" fill="#67e8f9" stroke="#312e81" strokeWidth="5" />
          <path d="M42 42c8 8 13 6 20 2 7-4 15 1 19 8" fill="none" stroke="#0891b2" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "moon" ? (
        <>
          <circle cx="60" cy="60" r="36" fill="#c4b5fd" stroke="#312e81" strokeWidth="5" />
          <circle cx="48" cy="50" r="7" fill="#a78bfa" />
          <circle cx="72" cy="68" r="9" fill="#a78bfa" />
          <circle cx="66" cy="44" r="5" fill="#a78bfa" />
          <path d="M96 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fde047" />
        </>
      ) : null}
      {objectId === "rocket" ? (
        <>
          <path d="M60 12 80 48H40Z" fill="#fde047" stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <rect x="44" y="46" width="32" height="46" rx="7" fill="#67e8f9" stroke="#312e81" strokeWidth="5" />
          <circle cx="60" cy="64" r="8" fill="#fff" stroke="#312e81" strokeWidth="4" />
          <path d="M44 74 30 92h14zM76 74 90 92H76z" fill="#f9a8d4" stroke="#312e81" strokeWidth="4" strokeLinejoin="round" />
          <path d="M54 92h12l-6 14z" fill="#fb923c" />
        </>
      ) : null}
      {objectId === "flag" ? (
        <>
          <path d="M29 103V18" stroke="#c4b5fd" strokeWidth="8" strokeLinecap="round" />
          <path d="M33 22 98 48 33 76Z" fill="#fde047" stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <path d="M17 104h31" stroke="#67e8f9" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "window" ? (
        <>
          <rect x="18" y="18" width="84" height="84" rx="8" fill="#86efac" stroke="#312e81" strokeWidth="6" />
          <path d="M60 22v76M22 60h76" stroke="#0e7490" strokeWidth="6" />
          <circle cx="39" cy="39" r="4" fill="#fff" opacity="0.8" />
        </>
      ) : null}
      {objectId === "crate" ? (
        <>
          <rect x="22" y="22" width="76" height="76" rx="5" fill="#86efac" stroke="#312e81" strokeWidth="6" />
          <path d="M22 22 98 98M98 22 22 98" stroke="#0e7490" strokeWidth="5" />
          <rect x="22" y="22" width="76" height="76" rx="5" fill="none" stroke="#0e7490" strokeWidth="4" />
        </>
      ) : null}
      {objectId === "door" ? (
        <>
          <path d="M25 105V17h70v88" fill="#f9a8d4" stroke="#312e81" strokeWidth="6" strokeLinejoin="round" />
          <path d="M38 105V31h44v74" fill="#7c3aed" stroke="#312e81" strokeWidth="5" />
          <circle cx="72" cy="69" r="5" fill="#fde047" />
          <path d="M15 105h90" stroke="#67e8f9" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "bridge" ? (
        <>
          <path d="M14 44q46 -24 92 0" fill="none" stroke="#c4b5fd" strokeWidth="5" strokeLinecap="round" />
          <path d="M32 50V72M60 40V72M88 50V72" stroke="#c4b5fd" strokeWidth="4" />
          <rect x="12" y="62" width="96" height="20" rx="3" fill="#f9a8d4" stroke="#312e81" strokeWidth="5" />
          <path d="M22 82v18M98 82v18" stroke="#312e81" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}

export function StarpathShapeSceneCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeSceneTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const objectIds = (task.objects && task.objects.length ? task.objects : DEFAULT_SCENE_OBJECTS) as ShapeObjectId[];
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 p-5 shadow-inner">
        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {objectIds.map((objectId) => {
            const label = SHAPE_OBJECTS[objectId].label;
            return (
              <button
                key={objectId}
                type="button"
                onClick={() => (objectId === task.correctObjectId ? onCorrect() : onWrong())}
                className="relative flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:bg-white/20 active:scale-[0.98]"
              >
                <OptionReadAloudButton text={label} className="absolute right-2 top-2 bg-white" />
                <SceneObjectVisual objectId={objectId} />
                <span className="mt-2 text-sm font-black">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
