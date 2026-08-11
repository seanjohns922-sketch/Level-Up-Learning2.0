"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Check, RotateCcw, Star } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { foldTree, foldNet, normalise, faceColour, type Cell, type FoldNode } from "@/data/activities/starpath/level5/nets";
import { buildSolid, SOLID_META, type SolidFace, type HingeDir } from "@/data/activities/starpath/level5/solids";

type Task = Extract<PracticeTask, { kind: "starpathNet" }>;
const CRATE = "#c8a273";
const key = (cell: Cell) => `${cell.r}:${cell.c}`;

// Hinge data per fold direction — the child sits one cell away, hinges on the
// shared edge, and swings up 90° to build the cube. Approved fold values.
const HINGE: Record<string, { dx: number; dy: number; origin: string; folded: string }> = {
  N: { dx: 0, dy: -1, origin: "50% 100%", folded: "rotateX(-90deg)" },
  S: { dx: 0, dy: 1, origin: "50% 0%", folded: "rotateX(90deg)" },
  E: { dx: 1, dy: 0, origin: "0% 50%", folded: "rotateY(-90deg)" },
  W: { dx: -1, dy: 0, origin: "100% 50%", folded: "rotateY(90deg)" },
};

function NetFaces({
  node, folded, size, coloured, focus, tappable, selected, onTap,
}: {
  node: FoldNode; folded: boolean; size: number; coloured: boolean;
  focus: Set<string>; tappable: boolean; selected: Set<string>; onTap?: (k: string) => void;
}) {
  const hinge = node.dir ? HINGE[node.dir]! : null;
  const isFocus = focus.has(node.key);
  const isSel = selected.has(node.key);
  const style: CSSProperties = {
    position: "absolute", width: size, height: size, boxSizing: "border-box",
    background: coloured ? faceColour(node.faceId) : CRATE,
    borderRadius: 3,
    // Edge drawn as an inset ring (no border box → tiles butt together exactly);
    // a soft inner shade adds depth without darkening the joins.
    boxShadow: isSel
      ? "0 0 0 3px #22d3ee, inset 0 0 0 1.5px rgba(255,255,255,0.7), inset 0 0 10px rgba(0,0,0,0.16)"
      : "inset 0 0 0 1.5px rgba(255,255,255,0.5), inset 0 0 10px rgba(0,0,0,0.16)",
    transformStyle: "preserve-3d", transition: "transform 0.85s cubic-bezier(0.62,0.03,0.3,1)",
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: tappable ? "pointer" : "default",
  };
  if (hinge) {
    style.left = hinge.dx * size;
    style.top = hinge.dy * size;
    style.transformOrigin = hinge.origin;
    style.transform = folded ? hinge.folded : "none";
  } else {
    style.left = "50%";
    style.top = "50%";
    style.margin = `${-size / 2}px 0 0 ${-size / 2}px`;
  }
  return (
    <div
      style={style}
      onClick={tappable && onTap ? (event) => { event.stopPropagation(); onTap(node.key); } : undefined}
    >
      {isFocus ? (
        <span
          className="pointer-events-none absolute inset-0 grid place-items-center rounded-[4px]"
          style={{
            background: "rgba(251,191,36,0.16)",
            boxShadow: "inset 0 0 0 3px #fbbf24, 0 0 14px 3px rgba(251,191,36,0.85)",
            animation: "netMark 1.2s ease-in-out infinite",
          }}
        >
          <Star className="h-1/2 w-1/2" style={{ color: "#fff", fill: "#fbbf24", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.55))" }} aria-label="marked face" />
        </span>
      ) : null}
      {node.children.map((child) => (
        <NetFaces key={child.key} node={child} folded={folded} size={size} coloured={coloured} focus={focus} tappable={tappable} selected={selected} onTap={onTap} />
      ))}
    </div>
  );
}

function FoldStage({
  cells, coloured, folded, size = 46, focus = [], tappable = false, selected = [], onTap, height,
}: {
  cells: Cell[]; coloured: boolean; folded: boolean; size?: number;
  focus?: string[]; tappable?: boolean; selected?: string[]; onTap?: (k: string) => void; height?: number;
}) {
  const tree = useMemo(() => foldTree(cells), [cells]);
  const norm = useMemo(() => normalise(cells), [cells]);
  const cols = norm.length ? Math.max(...norm.map((c) => c.c)) + 1 : 1;
  const rows = norm.length ? Math.max(...norm.map((c) => c.r)) + 1 : 1;
  const box = height ?? Math.max(rows, cols) * size + size;
  if (!tree) return null;
  return (
    <div className="relative mx-auto" style={{ perspective: 1000, perspectiveOrigin: "50% 42%", width: cols * size + size, height: box }}>
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transformStyle: "preserve-3d", transform: `translate(-50%,-50%) ${folded ? "rotateX(-24deg) rotateY(-30deg)" : "rotateX(0deg) rotateY(0deg)"}`, transition: "transform 0.85s ease" }}
      >
        <NetFaces node={tree} folded={folded} size={size} coloured={coloured} focus={new Set(focus)} tappable={tappable} selected={new Set(selected)} onTap={onTap} />
      </div>
    </div>
  );
}

// ── Authored 3D solids (cuboid / triangular prism / square pyramid) ──────────
// Same nested-hinge fold as the cube stage, generalised to non-square faces and
// non-90° fold angles. Each face nests inside its parent so a parent's fold
// carries its children (preserve-3d), matching the cube card's mechanic.
function foldTransform(dir: HingeDir, mag: number) {
  switch (dir) {
    case "N": return `rotateX(${-mag}deg)`;
    case "S": return `rotateX(${mag}deg)`;
    case "E": return `rotateY(${-mag}deg)`;
    case "W": return `rotateY(${mag}deg)`;
  }
}

function SolidFaceNode({ node, folded, parent }: { node: SolidFace; folded: boolean; parent: SolidFace | null }) {
  const style: CSSProperties = {
    position: "absolute", width: node.w, height: node.h, boxSizing: "border-box",
    background: node.color, borderRadius: node.clip ? 0 : 3,
    boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.5), inset 0 0 12px rgba(0,0,0,0.18)",
    transformStyle: "preserve-3d", transition: "transform 0.85s cubic-bezier(0.62,0.03,0.3,1)",
    backfaceVisibility: "visible",
  };
  if (node.clip) style.clipPath = node.clip;
  if (!parent || !node.hinge) {
    style.left = "50%"; style.top = "50%"; style.margin = `${-node.h / 2}px 0 0 ${-node.w / 2}px`;
  } else {
    const { dir, mag } = node.hinge;
    if (dir === "N") { style.left = 0; style.top = -node.h; style.transformOrigin = "50% 100%"; }
    if (dir === "S") { style.left = 0; style.top = parent.h; style.transformOrigin = "50% 0%"; }
    if (dir === "E") { style.left = parent.w; style.top = 0; style.transformOrigin = "0% 50%"; }
    if (dir === "W") { style.left = -node.w; style.top = 0; style.transformOrigin = "100% 50%"; }
    style.transform = folded ? foldTransform(dir, mag) : "none";
  }
  return (
    <div style={style}>
      {node.children.map((child) => (
        <SolidFaceNode key={child.id} node={child} folded={folded} parent={node} />
      ))}
    </div>
  );
}

function SolidFoldStage({ kind, folded }: { kind: NonNullable<Task["solid"]>; folded: boolean }) {
  const solid = useMemo(() => buildSolid(kind), [kind]);
  const tilt = SOLID_META[kind].tilt;
  return (
    <div className="relative mx-auto" style={{ perspective: 1000, perspectiveOrigin: "50% 44%", width: "100%", height: 220 }}>
      <div
        className="absolute left-1/2 top-1/2"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.85s ease", transform: `translate(-50%,-50%) ${folded ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : "rotateX(0deg) rotateY(0deg)"}` }}
      >
        <SolidFaceNode node={solid} folded={folded} parent={null} />
      </div>
    </div>
  );
}

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={["rounded-2xl border-2 p-3 text-center text-sm font-bold transition", selected ? "border-cyan-500 bg-cyan-50 text-indigo-950 ring-2 ring-cyan-300" : "border-violet-200 bg-white text-indigo-900 hover:border-cyan-400"].join(" ")}>
      {children}
    </button>
  );
}

const SubmitButton = ({ disabled, onClick }: { disabled: boolean; onClick: () => void }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
);

const FoldButton = ({ folded, onClick, disabled = false }: { folded: boolean; onClick: () => void; disabled?: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="mx-auto flex items-center gap-2 rounded-full border border-cyan-300/60 bg-white px-4 py-2 text-sm font-black text-cyan-700 shadow-sm transition hover:bg-cyan-50 active:scale-95 disabled:opacity-40">
    <RotateCcw className="h-4 w-4" aria-hidden /> {folded ? "Unfold" : "Fold it up"}
  </button>
);

export default function StarpathNetCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [folded, setFolded] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  const [tapped, setTapped] = useState<string | null>(null);
  const [built, setBuilt] = useState<Cell[]>([]);
  const [settled, setSettled] = useState(false);
  const multi = Boolean(task.multi);

  function toggleChoice(id: string) {
    if (settled) return;
    setChosen((current) => (multi ? (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]) : [id]));
  }

  function submitOptions() {
    if (settled) return;
    setSettled(true);
    const correct = task.correctOptionIds ?? [];
    const ok = chosen.length === correct.length && correct.every((id) => chosen.includes(id));
    if (ok) onCorrect(); else onWrong(chosen.join(","));
  }
  function submitText() {
    if (settled || !chosen.length) return;
    setSettled(true);
    if ((task.correctOptionIds ?? []).includes(chosen[0]!)) onCorrect(); else onWrong(chosen[0]);
  }
  function submitCell() {
    if (settled || !tapped) return;
    setSettled(true);
    if ((task.answerCells ?? []).includes(tapped)) onCorrect(); else onWrong(tapped);
  }
  function submitBuild() {
    if (settled || built.length !== (task.buildFaces ?? 6)) return;
    setSettled(true);
    if (foldNet(built).valid) onCorrect(); else onWrong(built.map(key).join(","));
  }

  // ── Choose-a-net / select-all (thumbnails) ──
  if (task.render === "options") {
    return (
      <div className="space-y-4">
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        {task.showCube ? (
          <div className="flex flex-col items-center gap-1">
            <FoldStage cells={normalise((task.netOptions ?? [])[0]?.cells ?? [])} coloured={false} folded size={30} height={130} />
            <span className="text-xs font-bold text-slate-500">The cube to make</span>
          </div>
        ) : null}
        <div className="mx-auto grid max-w-lg gap-3 sm:grid-cols-3">
          {task.netOptions?.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => toggleChoice(option.id)}
              className={["flex min-h-28 items-center justify-center rounded-2xl border-2 bg-[#0b0a24] p-2 transition", chosen.includes(option.id) ? "border-cyan-400 ring-2 ring-cyan-300" : "border-slate-700 hover:border-cyan-500"].join(" ")}
            >
              <FoldStage cells={normalise(option.cells)} coloured={false} folded={false} size={22} />
            </button>
          ))}
        </div>
        <div className="flex justify-center"><SubmitButton disabled={settled || !chosen.length} onClick={submitOptions} /></div>
      </div>
    );
  }

  // ── Build a net ──
  if (task.render === "build") {
    const GRID = 5;
    const has = (r: number, c: number) => built.some((cell) => cell.r === r && cell.c === c);
    const place = (r: number, c: number) => {
      if (settled) return;
      setFolded(false);
      setBuilt((current) => (current.some((cell) => cell.r === r && cell.c === c) ? current.filter((cell) => !(cell.r === r && cell.c === c)) : current.length >= (task.buildFaces ?? 6) ? current : [...current, { r, c }]));
    };
    const ready = built.length === (task.buildFaces ?? 6);
    return (
      <div className="space-y-4">
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <p className="text-center text-sm font-bold text-slate-500">Tap squares to place faces ({built.length}/{task.buildFaces ?? 6}). Fold it to test.</p>
        <div className="l4sym-stage mx-auto max-w-xs rounded-3xl p-4">
          {folded && ready ? (
            <FoldStage cells={built} coloured folded size={44} height={210} />
          ) : (
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${GRID}, minmax(0,1fr))` }}>
              {Array.from({ length: GRID * GRID }, (_, index) => {
                const r = Math.floor(index / GRID);
                const c = index % GRID;
                const on = has(r, c);
                return (
                  <button key={index} type="button" onClick={() => place(r, c)} aria-label={`Row ${r + 1}, column ${c + 1}`} className={["aspect-square rounded-md border transition", on ? "border-white/70" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.09]"].join(" ")} style={on ? { background: CRATE } : undefined} />
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button type="button" onClick={() => { setBuilt([]); setFolded(false); }} disabled={settled} title="Clear" aria-label="Clear" className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 disabled:opacity-40"><RotateCcw className="h-5 w-5" /></button>
          <FoldButton folded={folded} onClick={() => setFolded((v) => !v)} disabled={!ready} />
          <SubmitButton disabled={settled || !ready} onClick={submitBuild} />
        </div>
      </div>
    );
  }

  // ── Authored 3D solid + Fold it + text options ──
  if (task.render === "solid") {
    return (
      <div className="space-y-4">
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <div className="l4sym-stage mx-auto max-w-sm rounded-3xl p-4">
          <SolidFoldStage kind={task.solid ?? "cube"} folded={folded} />
        </div>
        {task.fold ? <div className="flex justify-center"><FoldButton folded={folded} onClick={() => setFolded((v) => !v)} /></div> : null}
        <div className="mx-auto grid max-w-md gap-2 sm:grid-cols-2">
          {task.textOptions?.map((option) => (
            <OptionButton key={option.id} selected={chosen.includes(option.id)} onClick={() => toggleChoice(option.id)}>{option.label}</OptionButton>
          ))}
        </div>
        <div className="flex justify-center"><SubmitButton disabled={settled || !chosen.length} onClick={submitText} /></div>
        <style>{`.l4sym-stage{background:radial-gradient(120% 90% at 50% 2%, #2a2a6e 0%, #16123f 45%, #0b0a24 100%);box-shadow:0 14px 34px -16px rgba(10,8,40,.6), inset 0 0 0 1px rgba(148,163,255,.14);}`}</style>
      </div>
    );
  }

  // ── Single net + Fold it + (text options | tap a cell) ──
  const cells = normalise(task.cells ?? []);
  const isTap = task.mode === "trackCell";
  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="l4sym-stage mx-auto max-w-sm rounded-3xl p-4">
        <FoldStage
          cells={cells}
          coloured={Boolean(task.coloured)}
          folded={folded}
          size={46}
          focus={task.focusKeys ?? []}
          tappable={isTap && !settled}
          selected={tapped ? [tapped] : []}
          onTap={(k) => { if (!settled) setTapped(k); }}
        />
      </div>
      {task.fold ? <div className="flex justify-center"><FoldButton folded={folded} onClick={() => setFolded((v) => !v)} /></div> : null}

      {isTap ? (
        <div className="flex justify-center"><SubmitButton disabled={settled || !tapped} onClick={submitCell} /></div>
      ) : (
        <>
          <div className="mx-auto grid max-w-md gap-2 sm:grid-cols-2">
            {task.textOptions?.map((option) => (
              <OptionButton key={option.id} selected={chosen.includes(option.id)} onClick={() => toggleChoice(option.id)}>{option.label}</OptionButton>
            ))}
          </div>
          <div className="flex justify-center"><SubmitButton disabled={settled || !chosen.length} onClick={submitText} /></div>
        </>
      )}
      <style>{`.l4sym-stage{background:radial-gradient(120% 90% at 50% 2%, #2a2a6e 0%, #16123f 45%, #0b0a24 100%);box-shadow:0 14px 34px -16px rgba(10,8,40,.6), inset 0 0 0 1px rgba(148,163,255,.14);}@keyframes netMark{0%,100%{box-shadow:inset 0 0 0 3px #fbbf24, 0 0 10px 2px rgba(251,191,36,.7);}50%{box-shadow:inset 0 0 0 3px #fde68a, 0 0 20px 6px rgba(251,191,36,.95);}}`}</style>
    </div>
  );
}
