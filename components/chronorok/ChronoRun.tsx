"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { ArrowLeft, ArrowRight, ArrowUp, RotateCcw } from "lucide-react";

/** Chrono Run: a tunnel runner. You run along an eight-sided tunnel floating in
 *  the time stream. Move left or right onto the walls and the tunnel turns with
 *  you, so any side can be the floor. Jump the gaps; it keeps getting faster.
 *  The game state lives in refs and is stepped each frame (no React re-renders
 *  while running); React only updates the score readout a few times a second. */

const SIDES = 8;
const RADIUS = 6.2;
const ROW = 2.4; // metres per tile row
const VISIBLE_ROWS = 96;
const FACE = (Math.PI * 2) / SIDES;
const START_SPEED = 15;
const MAX_SPEED = 36;
const GRAVITY = -40;
const JUMP = 13.5;
const TURN = 2.7; // radians per second

const ERAS = [
  { name: "Clockwork City", tile: "#3a2a1a", edge: "#ffb02e", fog: "#140a04" },
  { name: "Crystal Caverns", tile: "#16263a", edge: "#7ff0ff", fog: "#04101a" },
  { name: "Ember Depths", tile: "#3a1a14", edge: "#ff6a3d", fog: "#160604" },
  { name: "The Void Rift", tile: "#24163a", edge: "#c79bff", fog: "#0a0418" },
] as const;
const ERA_LENGTH = 600; // metres per era

type Phase = "ready" | "playing" | "over";
type Hud = { metres: number; era: number };

// Rows are generated in order so there is always a way through: a "safe lane"
// wanders around the tunnel, and every so often a whole row drops away (jump it).
function makeLevel() {
  const rows: boolean[][] = [];
  let safe = 0;
  let seed = Math.floor(Math.random() * 2147483646) + 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return function row(index: number) {
    while (rows.length <= index) {
      const n = rows.length;
      const tiles = new Array<boolean>(SIDES).fill(true);
      if (n > 24) {
        const level = Math.min(1, n / 900);
        const gapChance = 0.12 + level * 0.38;
        for (let k = 0; k < SIDES; k += 1) if (rand() < gapChance) tiles[k] = false;
        if (rand() < 0.18) safe = (safe + (rand() < 0.5 ? 1 : -1) + SIDES) % SIDES;
        tiles[safe] = true;
        // A full gap to jump: one row early on, up to two later, never twice in a row.
        const previousWasGap = rows[n - 1]?.every((t) => !t) ?? false;
        if (n > 40 && !previousWasGap && rand() < 0.035 + level * 0.05) {
          tiles.fill(false);
          rows.push(tiles);
          if (level > 0.4 && rand() < 0.5) rows.push(new Array<boolean>(SIDES).fill(false));
          continue;
        }
      }
      rows.push(tiles);
    }
    return rows[index];
  };
}

function tileTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  // Multiplied by the era colour: a dim solid face with a bright rim, so the
  // floor reads as solid and the gaps read as holes into space.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 128, 128);
  const face = ctx.createLinearGradient(0, 0, 0, 128);
  face.addColorStop(0, "#5a5a5a");
  face.addColorStop(1, "#3a3a3a");
  ctx.fillStyle = face;
  ctx.fillRect(5, 5, 118, 118);
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, 72, 72);
  return new THREE.CanvasTexture(canvas);
}

type Game = {
  phase: Phase;
  z: number; // distance travelled (metres, positive)
  angle: number; // where around the tunnel the runner is (0 = bottom)
  height: number; // above the floor, toward the centre
  vy: number;
  speed: number;
  left: boolean;
  right: boolean;
  jumpQueued: boolean;
  cameraAngle: number;
};

function Tunnel({ game, row, era }: { game: React.RefObject<Game>; row: (i: number) => boolean[]; era: number }) {
  const tiles = useRef<THREE.InstancedMesh>(null);
  const texture = useMemo(() => tileTexture(), []);
  const matrix = useMemo(() => new THREE.Object3D(), []);
  const width = 2 * RADIUS * Math.tan(Math.PI / SIDES) - 0.12;
  const colours = ERAS[era % ERAS.length];

  useFrame(() => {
    const mesh = tiles.current;
    if (!mesh || !game.current) return;
    const base = Math.floor(game.current.z / ROW) - 3;
    let i = 0;
    for (let r = 0; r < VISIBLE_ROWS; r += 1) {
      const index = Math.max(0, base + r);
      const present = row(index);
      for (let k = 0; k < SIDES; k += 1) {
        const a = k * FACE;
        matrix.position.set(Math.sin(a) * RADIUS, -Math.cos(a) * RADIUS, -index * ROW);
        matrix.rotation.set(0, 0, a);
        matrix.scale.setScalar(present[k] ? 1 : 0);
        matrix.updateMatrix();
        mesh.setMatrixAt(i, matrix.matrix);
        i += 1;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={tiles} args={[undefined, undefined, VISIBLE_ROWS * SIDES]} frustumCulled={false}>
      <boxGeometry args={[width, 0.3, ROW - 0.12]} />
      <meshBasicMaterial color={colours.edge} map={texture} toneMapped={false} />
    </instancedMesh>
  );
}

function Runner({ game }: { game: React.RefObject<Game> }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = game.current;
    if (!group.current || !g) return;
    const r = RADIUS - 0.75 - g.height;
    group.current.position.set(Math.sin(g.angle) * r, -Math.cos(g.angle) * r, -g.z);
    group.current.rotation.set(0, 0, g.angle);
    const bounce = g.height === 0 && g.phase === "playing" ? Math.abs(Math.sin(clock.elapsedTime * 14)) * 0.12 : 0;
    group.current.children[0].position.y = bounce;
  });
  return (
    <group ref={group}>
      <group>
        <mesh><sphereGeometry args={[0.55, 24, 24]} /><meshBasicMaterial color="#ffb02e" toneMapped={false} /></mesh>
        <mesh scale={1.6}><sphereGeometry args={[0.55, 16, 16]} /><meshBasicMaterial color="#ffd76a" transparent opacity={0.18} toneMapped={false} /></mesh>
        <mesh position={[0, 0.05, -0.5]} rotation={[0, 0, 0]}><circleGeometry args={[0.38, 24]} /><meshBasicMaterial color="#fff6e0" side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  );
}

function Stars() {
  const geometry = useMemo(() => {
    const p: number[] = [];
    let seed = 11;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 1400; i += 1) {
      const a = rand() * Math.PI * 2;
      const d = 40 + rand() * 160;
      p.push(Math.cos(a) * d, Math.sin(a) * d, -rand() * 400);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  const points = useRef<THREE.Points>(null);
  const { camera } = useThree();
  useFrame(() => { if (points.current) points.current.position.z = camera.position.z; });
  return <points ref={points} geometry={geometry}><pointsMaterial color="#ffffff" size={1.6} sizeAttenuation={false} /></points>;
}

// The game loop: steps the run state held in a ref and moves the R3F camera each
// frame. Both are mutable by design (imperative per-frame updates).
/* eslint-disable react-hooks/immutability */
function Step({ game, row, onHud, onOver }: { game: React.RefObject<Game>; row: (i: number) => boolean[]; onHud: (hud: Hud) => void; onOver: (metres: number) => void }) {
  const { camera } = useThree();
  const lastHud = useRef(0);
  useFrame((_, rawDelta) => {
    const g = game.current;
    if (!g) return;
    const delta = Math.min(rawDelta, 1 / 30);
    if (g.phase === "playing") {
      g.speed = Math.min(MAX_SPEED, g.speed + delta * 0.32);
      g.z += g.speed * delta;
      if (g.left) g.angle -= TURN * delta;
      if (g.right) g.angle += TURN * delta;
      const grounded = g.height <= 0 && g.vy <= 0;
      if (g.jumpQueued && grounded) { g.vy = JUMP; }
      g.jumpQueued = false;
      g.vy += GRAVITY * delta;
      g.height += g.vy * delta;
      if (g.height <= 0) {
        const face = ((Math.round(g.angle / FACE) % SIDES) + SIDES) % SIDES;
        const under = row(Math.floor((g.z + ROW / 2) / ROW))[face];
        if (under && g.height > -0.6) { g.height = 0; g.vy = 0; }
        else if (g.height < -7) { g.phase = "over"; onOver(Math.floor(g.z)); }
      }
      const now = performance.now();
      if (now - lastHud.current > 120) {
        lastHud.current = now;
        onHud({ metres: Math.floor(g.z), era: Math.floor(g.z / ERA_LENGTH) });
      }
    }
    // The camera turns with the runner, so the side they stand on is always "down".
    g.cameraAngle += (g.angle - g.cameraAngle) * Math.min(1, delta * 8);
    const a = g.cameraAngle;
    const r = RADIUS - 3.4;
    camera.position.set(Math.sin(a) * r, -Math.cos(a) * r, -g.z + 6.5);
    camera.up.set(-Math.sin(a), Math.cos(a), 0);
    const lr = RADIUS - 2.2;
    camera.lookAt(Math.sin(a) * lr, -Math.cos(a) * lr, -g.z - 22);
  });
  return null;
}
/* eslint-enable react-hooks/immutability */

export default function ChronoRun({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [hud, setHud] = useState<Hud>({ metres: 0, era: 0 });
  const [best, setBest] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [row, setRow] = useState(() => makeLevel());
  const game = useRef<Game>({ phase: "ready", z: 0, angle: 0, height: 0, vy: 0, speed: START_SPEED, left: false, right: false, jumpQueued: false, cameraAngle: 0 });

  useEffect(() => {
    try { queueMicrotask(() => setBest(Number(localStorage.getItem("lul:chronorok:chrono-run:best") ?? 0) || 0)); } catch { /* per device only */ }
  }, []);

  function start() {
    game.current = { phase: "playing", z: 0, angle: 0, height: 0, vy: 0, speed: START_SPEED, left: false, right: false, jumpQueued: false, cameraAngle: 0 };
    setRow(() => makeLevel()); // a new tunnel every run
    setHud({ metres: 0, era: 0 });
    setNewBest(false);
    setPhase("playing");
  }

  function over(metres: number) {
    setPhase("over");
    setHud((current) => ({ ...current, metres }));
    setBest((previous) => {
      if (metres > previous) {
        setNewBest(true);
        try { localStorage.setItem("lul:chronorok:chrono-run:best", String(metres)); } catch { /* per device only */ }
        return metres;
      }
      return previous;
    });
  }

  useEffect(() => {
    const keys = (down: boolean) => (event: KeyboardEvent) => {
      const g = game.current;
      const key = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(key)) { g.left = down; event.preventDefault(); }
      if (["arrowright", "d"].includes(key)) { g.right = down; event.preventDefault(); }
      if ([" ", "arrowup", "w"].includes(key)) {
        event.preventDefault();
        if (down) {
          if (g.phase === "playing") g.jumpQueued = true;
          else if (!event.repeat) start();
        }
      }
      if (down && key === "escape") router.push(backHref);
    };
    const onDown = keys(true), onUp = keys(false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, [backHref, router]);

  // Touch: hold the left or right third to move, tap the middle to jump.
  function touch(down: boolean, event: React.PointerEvent) {
    if (event.pointerType === "mouse") return;
    const g = game.current;
    if (!down) { g.left = false; g.right = false; return; }
    if (g.phase !== "playing") return;
    const x = event.clientX / window.innerWidth;
    if (x < 0.33) g.left = true;
    else if (x > 0.67) g.right = true;
    else g.jumpQueued = true;
  }

  const era = ERAS[hud.era % ERAS.length];

  return (
    <main
      className="chronoRun fixed inset-0 select-none overflow-hidden bg-black font-sans text-white"
      style={{ touchAction: "none" }}
      onPointerDown={(event) => touch(true, event)}
      onPointerUp={(event) => touch(false, event)}
      onPointerCancel={(event) => touch(false, event)}
    >
      <Canvas camera={{ fov: 72, near: 0.1, far: 260, position: [0, -RADIUS + 3.4, 6.5] }} dpr={[1, 1.5]}>
        <color attach="background" args={[era.fog]} />
        <fog attach="fog" args={[era.fog, 40, 190]} />
        <Stars />
        <Tunnel game={game} row={row} era={hud.era} />
        <Runner game={game} />
        <Step game={game} row={row} onHud={setHud} onOver={over} />
      </Canvas>

      <header className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-3">
        <button type="button" onClick={() => router.push(backHref)} className="chronoGlass pointer-events-auto flex h-12 items-center gap-2 rounded-full px-5 font-display text-[13px] font-black tracking-[0.05em]"><ArrowLeft className="h-4 w-4" />CHRONOROK</button>
        <div className="chronoGlass rounded-2xl px-6 pb-2 pt-1.5 text-center">
          <p className="font-display text-[11px] font-black tracking-[0.16em]" style={{ color: era.edge }}>CHRONO RUN · {era.name.toUpperCase()}</p>
          <p className="font-display text-4xl font-black leading-tight">{hud.metres.toLocaleString("en-AU")} m</p>
          <p className="text-[13px] font-bold text-[#e8dcc8]">Best {best.toLocaleString("en-AU")} m</p>
        </div>
        <span className="w-[120px]" />
      </header>

      {phase !== "playing" ? (
        <div className="absolute inset-0 grid place-items-center bg-black/45 p-6">
          <div className="chronoGlass w-[min(460px,92vw)] rounded-3xl p-7 text-center">
            {phase === "ready" ? (
              <>
                <p className="font-display text-xs font-black tracking-[0.2em] text-[#7ff0ff]">THE RIFT PORTAL</p>
                <h1 className="chronoTitle mt-1 text-4xl">Chrono Run</h1>
                <p className="mt-2 font-bold text-[#f3ead9]">Run onto the walls and the tunnel turns with you. Jump the gaps. It keeps getting faster.</p>
                <ul className="mt-4 space-y-1 text-sm font-bold text-[#e8dcc8]">
                  <li><kbd>←</kbd> <kbd>→</kbd> move · <kbd>Space</kbd> jump</li>
                  <li>Tablet: hold left or right side to move, tap the middle to jump</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-display text-xs font-black tracking-[0.2em] text-[#ffd76a]">{newBest ? "NEW BEST!" : "LOST IN TIME"}</p>
                <h1 className="chronoTitle mt-1 text-5xl">{hud.metres.toLocaleString("en-AU")} m</h1>
                <p className="mt-1 font-bold text-[#f3ead9]">Reached {era.name} · Best {best.toLocaleString("en-AU")} m</p>
              </>
            )}
            <button type="button" onClick={start} className="mt-5 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 font-display text-[15px] font-black text-[#16121f]">
              {phase === "ready" ? "RUN" : <><RotateCcw className="h-4 w-4" />RUN AGAIN</>}<kbd className="ml-1">Space</kbd>
            </button>
          </div>
        </div>
      ) : null}

      {phase === "playing" ? (
        <div className="chronoTouch pointer-events-none absolute inset-x-0 bottom-5 flex justify-between px-6 opacity-70">
          <span className="chronoGlass grid h-14 w-14 place-items-center rounded-full"><ArrowLeft /></span>
          <span className="chronoGlass grid h-14 w-14 place-items-center rounded-full"><ArrowUp /></span>
          <span className="chronoGlass grid h-14 w-14 place-items-center rounded-full"><ArrowRight /></span>
        </div>
      ) : null}

      <style>{`
        .chronoRun .chronoGlass{background:rgba(22,14,8,.55);border:1px solid rgba(255,230,180,.28);box-shadow:0 10px 30px rgba(0,0,0,.35);backdrop-filter:blur(12px)}
        .chronoRun .chronoTitle{font-family:var(--font-display);font-weight:900;letter-spacing:.08em;color:#ffe2a0;text-shadow:0 2px 14px rgba(245,180,50,.6)}
        .chronoRun kbd{padding:1px 7px;border-radius:6px;background:rgba(255,255,255,.18);font:800 12px var(--font-sans)}
        @media (hover:hover) and (pointer:fine){.chronoRun .chronoTouch{display:none}}
      `}</style>
    </main>
  );
}
