"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Lock, RotateCcw, Star } from "lucide-react";
import { GAME_STYLES, GameHeader } from "@/components/chronorok/GameChrome";
import { RUNE_LEVELS, parseLevel, solve, step, solid, type BlockState, type Dir } from "@/lib/chronorok/rune-blocks";

/** Rune Blocks: roll the rune stone onto the portal, standing up. Twelve
 *  puzzles, each checked solvable; stars for finishing in few rolls. */

/* Animated meshes are R3F-owned Three objects updated each frame. */
 

const PROGRESS_KEY = "lul:chronorok:rune-blocks:progress";
type Progress = { unlocked: number; stars: Record<number, number> };

function readProgress(): Progress {
  try { return { unlocked: 1, stars: {}, ...JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}") }; } catch { return { unlocked: 1, stars: {} }; }
}

function poseOf(s: BlockState) {
  if (s.o === "up") return { pos: new THREE.Vector3(s.x, 1, s.z), rot: new THREE.Euler(0, 0, 0) };
  if (s.o === "x") return { pos: new THREE.Vector3(s.x + 0.5, 0.5, s.z), rot: new THREE.Euler(0, 0, Math.PI / 2) };
  return { pos: new THREE.Vector3(s.x, 0.5, s.z + 0.5), rot: new THREE.Euler(Math.PI / 2, 0, 0) };
}

function useTex(src: string) {
  const base = useLoader(THREE.TextureLoader, src);
  return useMemo(() => { const t = base.clone(); t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t; }, [base]);
}

function Board({ rows, bridgesOpen }: { rows: string[]; bridgesOpen: boolean }) {
  const paving = useTex("/images/chronorok/tex-paving.webp");
  const rock = useTex("/images/chronorok/tex-rock.webp");
  const cellsList = useMemo(() => {
    const out: Array<{ x: number; z: number; ch: string }> = [];
    rows.forEach((row, z) => [...row].forEach((ch, x) => { if (ch !== ".") out.push({ x, z, ch }); }));
    return out;
  }, [rows]);
  return (
    <group>
      {cellsList.map(({ x, z, ch }) => {
        const isBridge = ch === "b" || ch === "B";
        const present = solid(ch, bridgesOpen);
        if (isBridge && !present) return <mesh key={`${x},${z}`} position={[x, -0.12, z]}><boxGeometry args={[0.94, 0.06, 0.94]} /><meshBasicMaterial color="#3ee6ff" transparent opacity={0.18} /></mesh>;
        const colour = ch === "c" ? "#ff9a3a" : isBridge ? "#9fe8ff" : ch === "G" ? "#2a1640" : "#f0dcb6";
        return (
          <group key={`${x},${z}`} position={[x, -0.15, z]}>
            <mesh receiveShadow castShadow><boxGeometry args={[0.96, 0.3, 0.96]} /><meshStandardMaterial map={ch === "c" ? rock : paving} color={colour} roughness={0.8} /></mesh>
            <mesh position={[0, -0.6, 0]}><boxGeometry args={[0.9, 0.9, 0.9]} /><meshStandardMaterial map={rock} color="#9a7458" roughness={1} /></mesh>
            {ch === "s" || ch === "h" ? <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[ch === "h" ? 0.32 : 0.24, ch === "h" ? 0.32 : 0.24, 0.06, 24]} /><meshBasicMaterial color={ch === "h" ? "#ffd76a" : "#7ff0ff"} toneMapped={false} /></mesh> : null}
            {ch === "G" ? (
              <>
                <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.26, 0.42, 32]} /><meshBasicMaterial color="#c98aff" toneMapped={false} /></mesh>
                <mesh position={[0, 1.6, 0]}><cylinderGeometry args={[0.38, 0.38, 3, 24, 1, true]} /><meshBasicMaterial color="#b26cff" transparent opacity={0.28} side={THREE.DoubleSide} toneMapped={false} /></mesh>
                <pointLight position={[0, 1, 0]} intensity={6} distance={5} color="#c79bff" />
              </>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

function Stone({ state, falling, won }: { state: BlockState; falling: boolean; won: boolean }) {
  const group = useRef<THREE.Group>(null);
  const runeMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128; canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, "#f4c870"); g.addColorStop(1, "#c4893a");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 256);
    ctx.strokeStyle = "#fff0c0"; ctx.lineWidth = 6; ctx.strokeRect(8, 8, 112, 240);
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(64, 40); ctx.lineTo(64, 216); ctx.moveTo(30, 90); ctx.lineTo(98, 160); ctx.moveTo(98, 90); ctx.lineTo(30, 160); ctx.stroke();
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const target = useRef(poseOf(state));
  const drop = useRef(0);
  useEffect(() => { target.current = poseOf(state); drop.current = 0; }, [state]);
  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const k = Math.min(1, delta * 14);
    g.position.lerp(target.current.pos, k);
    g.quaternion.slerp(new THREE.Quaternion().setFromEuler(target.current.rot), k);
    if (falling || won) { drop.current += delta * (won ? 3 : 9); g.position.y = target.current.pos.y - drop.current * drop.current; }
  });
  return (
    <group ref={group}>
      <mesh castShadow><boxGeometry args={[0.92, 1.92, 0.92]} /><meshStandardMaterial map={runeMap} roughness={0.35} metalness={0.3} emissive="#5a3200" emissiveIntensity={0.35} /></mesh>
    </group>
  );
}

export default function RuneBlocks({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress>({ unlocked: 1, stars: {} });
  const [levelIndex, setLevelIndex] = useState<number | null>(null);
  const [state, setState] = useState<BlockState>({ x: 0, z: 0, o: "up" });
  const [bridgesOpen, setBridgesOpen] = useState(false);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState<"playing" | "fall" | "crumble" | "win">("playing");
  const pars = useMemo(() => RUNE_LEVELS.map((level) => solve(level) ?? 99), []);

  useEffect(() => { queueMicrotask(() => setProgress(readProgress())); }, []);

  const level = levelIndex === null ? null : RUNE_LEVELS[levelIndex];
  const parsed = useMemo(() => (level ? parseLevel(level) : null), [level]);
  const par = levelIndex === null ? 0 : pars[levelIndex];
  const starsFor = (count: number, levelPar: number) => (count <= levelPar ? 3 : count <= Math.ceil(levelPar * 1.5) ? 2 : 1);

  const restart = useCallback(() => {
    if (!parsed) return;
    setState(parsed.start); setBridgesOpen(false); setMoves(0); setStatus("playing");
  }, [parsed]);

  function startLevel(index: number) {
    const p = parseLevel(RUNE_LEVELS[index]);
    setLevelIndex(index); setState(p.start); setBridgesOpen(false); setMoves(0); setStatus("playing");
  }

  const move = useCallback((dir: Dir) => {
    if (!parsed || status !== "playing") return;
    const result = step(parsed.rows, state, dir, bridgesOpen);
    setState(result.state); setBridgesOpen(result.bridgesOpen); setMoves((m) => m + 1);
    if (result.outcome === "fall" || result.outcome === "crumble") { setStatus(result.outcome); window.setTimeout(() => restart(), 900); }
    if (result.outcome === "win" && levelIndex !== null) {
      setStatus("win");
      const earned = starsFor(moves + 1, par);
      const next: Progress = { unlocked: Math.max(progress.unlocked, levelIndex + 2), stars: { ...progress.stars, [levelIndex]: Math.max(progress.stars[levelIndex] ?? 0, earned) } };
      setProgress(next);
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch { /* per device only */ }
    }
  }, [bridgesOpen, levelIndex, moves, par, parsed, progress, restart, state, status]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, Dir> = { arrowleft: "left", a: "left", arrowright: "right", d: "right", arrowup: "up", w: "up", arrowdown: "down", s: "down" };
      const k = event.key.toLowerCase();
      if (map[k] && levelIndex !== null) { event.preventDefault(); if (!event.repeat) move(map[k]); }
      if (k === "r" && levelIndex !== null) restart();
      if (k === "escape") { if (levelIndex !== null) setLevelIndex(null); else router.push(backHref); }
      if (k === " " && status === "win" && levelIndex !== null && levelIndex + 1 < RUNE_LEVELS.length) { event.preventDefault(); startLevel(levelIndex + 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Swipe to roll on a tablet.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  function onPointerUp(event: React.PointerEvent) {
    const s = swipe.current; swipe.current = null;
    if (!s || event.pointerType === "mouse") return;
    const dx = event.clientX - s.x, dy = event.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;
    move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
  }

  const centre = parsed ? new THREE.Vector3((parsed.width - 1) / 2, 0, (parsed.depth - 1) / 2) : new THREE.Vector3();
  const size = parsed ? Math.max(parsed.width, parsed.depth) : 10;
  const totalStars = Object.values(progress.stars).reduce((sum, n) => sum + n, 0);

  return (
    <main className="chronoGame fixed inset-0 select-none overflow-hidden font-sans text-white" style={{ touchAction: "none", background: "linear-gradient(180deg,#3b2a7a 0%,#8a5ac8 55%,#f0a6d8 100%)" }}
      onPointerDown={(e) => { swipe.current = { x: e.clientX, y: e.clientY }; }} onPointerUp={onPointerUp}>
      {parsed ? (
        <Canvas shadows camera={{ fov: 40, position: [centre.x + size * 0.9, size * 1.25, centre.z + size * 1.35] }} onCreated={({ camera }) => camera.lookAt(centre)} dpr={[1, 1.5]} key={levelIndex}>
          <ambientLight intensity={0.55} />
          <hemisphereLight args={["#ffffff", "#5a3a8a", 0.6]} />
          <directionalLight position={[centre.x + 8, 16, centre.z + 6]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} />
          <Suspense fallback={null}>
            <Board rows={parsed.rows} bridgesOpen={bridgesOpen} />
            <Stone state={state} falling={status === "fall" || status === "crumble"} won={status === "win"} />
          </Suspense>
        </Canvas>
      ) : null}

      {level && levelIndex !== null ? (
        <>
          <GameHeader backHref={backHref} title={`RUNE BLOCKS · LEVEL ${levelIndex + 1} · ${level.name.toUpperCase()}`} accent="#e2c6ff" value={`${moves} roll${moves === 1 ? "" : "s"}`} sub={`3 stars in ${par} or fewer`} />
          <div className="absolute bottom-5 left-5 z-10 flex gap-2">
            <button type="button" onClick={() => setLevelIndex(null)} className="chronoGlass h-12 rounded-full px-5 font-display text-[13px] font-black">LEVELS</button>
            <button type="button" onClick={restart} className="chronoGlass flex h-12 items-center gap-2 rounded-full px-5 font-display text-[13px] font-black"><RotateCcw className="h-4 w-4" />RESTART <kbd>R</kbd></button>
          </div>
          <div className="chronoTouch absolute bottom-5 right-5 z-10 grid grid-cols-3 gap-1.5">
            <span />
            <button type="button" onClick={() => move("up")} className="chronoGlass grid h-14 w-14 place-items-center rounded-2xl" aria-label="Roll up"><ArrowUp /></button>
            <span />
            <button type="button" onClick={() => move("left")} className="chronoGlass grid h-14 w-14 place-items-center rounded-2xl" aria-label="Roll left"><ArrowLeft /></button>
            <button type="button" onClick={() => move("down")} className="chronoGlass grid h-14 w-14 place-items-center rounded-2xl" aria-label="Roll down"><ArrowDown /></button>
            <button type="button" onClick={() => move("right")} className="chronoGlass grid h-14 w-14 place-items-center rounded-2xl" aria-label="Roll right"><ArrowRight /></button>
          </div>
          {status === "fall" || status === "crumble" ? <p className="pointer-events-none absolute left-1/2 top-[26%] z-10 -translate-x-1/2 font-display text-4xl font-black text-[#ffd0e0]">{status === "crumble" ? "THE STONE CRUMBLED!" : "FELL INTO THE MIST!"}</p> : null}
          {status === "win" ? (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/35 p-6">
              <div className="chronoGlass w-[min(440px,92vw)] rounded-3xl p-7 text-center">
                <p className="font-display text-xs font-black tracking-[0.2em] text-[#c79bff]">PORTAL OPENED</p>
                <h1 className="chronoTitle mt-1 text-4xl">Level {levelIndex + 1} cleared!</h1>
                <div className="mt-3 flex justify-center gap-1.5">{[1, 2, 3].map((n) => <Star key={n} className="h-9 w-9" fill={n <= starsFor(moves, par) ? "#ffd76a" : "transparent"} color="#ffd76a" />)}</div>
                <p className="mt-2 font-bold text-[#f3ead9]">{moves} rolls · best possible {par}</p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={restart} className="chronoGlass h-12 rounded-full px-5 font-display text-sm font-black">TRY AGAIN</button>
                  <button type="button" onClick={() => router.push(backHref)} className="chronoGlass h-12 rounded-full px-5 font-display text-sm font-black">BACK TO CHRONOROK</button>
                  {levelIndex + 1 < RUNE_LEVELS.length ? <button type="button" onClick={() => startLevel(levelIndex + 1)} className="h-12 rounded-full bg-white px-6 font-display text-sm font-black text-[#16121f]">NEXT LEVEL <kbd>Space</kbd></button> : <button type="button" onClick={() => setLevelIndex(null)} className="h-12 rounded-full bg-white px-6 font-display text-sm font-black text-[#16121f]">ALL LEVELS DONE!</button>}
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 overflow-y-auto p-5">
          <GameHeader backHref={backHref} title="RUNE BLOCKS · THE RUNE GATE" accent="#e2c6ff" value={`${totalStars} ★`} sub={`of ${RUNE_LEVELS.length * 3} stars`} />
          <div className="mx-auto mt-36 max-w-[760px]">
            <div className="chronoGlass mb-4 rounded-3xl p-5 text-center">
              <h1 className="chronoTitle text-3xl">Rune Blocks</h1>
              <p className="mt-1 font-bold text-[#f3ead9]">Roll the rune stone into the portal, standing up. Don&apos;t let it fall off the edge. Orange stone crumbles if you stand on it; switches open the glass bridges.</p>
              <p className="mt-2 text-sm font-bold text-[#e8dcc8]"><kbd>←</kbd> <kbd>↑</kbd> <kbd>→</kbd> <kbd>↓</kbd> roll · <kbd>R</kbd> restart · Tablet: swipe</p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {RUNE_LEVELS.map((lv, i) => {
                const locked = i + 1 > progress.unlocked;
                const stars = progress.stars[i] ?? 0;
                return (
                  <button key={lv.name} type="button" disabled={locked} onClick={() => startLevel(i)} className={`chronoGlass rounded-2xl p-4 text-left ${locked ? "opacity-50" : "hover:-translate-y-0.5"}`}>
                    <p className="font-display text-2xl font-black">{i + 1}</p>
                    <p className="text-sm font-bold text-[#f3ead9]">{lv.name}</p>
                    <p className="mt-1 flex items-center gap-0.5">{locked ? <Lock className="h-4 w-4" /> : [1, 2, 3].map((n) => <Star key={n} className="h-4 w-4" fill={n <= stars ? "#ffd76a" : "transparent"} color="#ffd76a" />)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <style>{GAME_STYLES}</style>
    </main>
  );
}
