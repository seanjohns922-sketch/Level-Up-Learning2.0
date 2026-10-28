"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
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
  { name: "Clockwork City", tile: "#e8c48a", edge: "#ffb02e", fog: "#140a04" },
  { name: "Crystal Caverns", tile: "#9fc8e8", edge: "#7ff0ff", fog: "#04101a" },
  { name: "Ember Depths", tile: "#e89a7a", edge: "#ff6a3d", fog: "#160604" },
  { name: "The Void Rift", tile: "#b8a0e0", edge: "#c79bff", fog: "#0a0418" },
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

// Loaded through R3F's loader (Suspense) so the material is built with its map.
function useTexture(src: string) {
  const base = useLoader(THREE.TextureLoader, src);
  return useMemo(() => {
    const texture = base.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [base]);
}

// Lit stone tiles (they shade differently on every face of the tunnel, which is
// what gives it depth) plus a glowing rim on each tile's leading edge. Every
// edge that borders a gap gets a hot warning lip, so holes read from far away.
function Tunnel({ game, row, era }: { game: React.RefObject<Game>; row: (i: number) => boolean[]; era: number }) {
  const tiles = useRef<THREE.InstancedMesh>(null);
  const rims = useRef<THREE.InstancedMesh>(null);
  const lips = useRef<THREE.InstancedMesh>(null);
  const sideLips = useRef<THREE.InstancedMesh>(null);
  const stone = useTexture("/images/chronorok/tex-paving.webp");
  const matrix = useMemo(() => new THREE.Object3D(), []);
  const width = 2 * RADIUS * Math.tan(Math.PI / SIDES) - 0.1;
  const colours = ERAS[era % ERAS.length];

  useFrame(() => {
    const mesh = tiles.current;
    const rim = rims.current;
    const lip = lips.current;
    const side = sideLips.current;
    if (!mesh || !rim || !lip || !side || !game.current) return;
    const base = Math.floor(game.current.z / ROW) - 3;
    let i = 0, l = 0, sl = 0;
    for (let r = 0; r < VISIBLE_ROWS; r += 1) {
      const index = Math.max(0, base + r);
      const present = row(index);
      for (let k = 0; k < SIDES; k += 1) {
        const a = k * FACE;
        matrix.position.set(Math.sin(a) * (RADIUS + 0.25), -Math.cos(a) * (RADIUS + 0.25), -index * ROW);
        matrix.rotation.set(0, 0, a);
        matrix.scale.setScalar(present[k] ? 1 : 0);
        matrix.updateMatrix();
        mesh.setMatrixAt(i, matrix.matrix);
        matrix.position.set(Math.sin(a) * (RADIUS - 0.02), -Math.cos(a) * (RADIUS - 0.02), -index * ROW + ROW / 2 - 0.08);
        matrix.updateMatrix();
        rim.setMatrixAt(i, matrix.matrix);
        i += 1;
        if (!present[k]) continue;
        const deeper = row(index + 1)[k];
        const nearer = index > 0 ? row(index - 1)[k] : true;
        for (const [missing, zEdge] of [[!deeper, -ROW / 2 + 0.1], [!nearer, ROW / 2 - 0.1]] as Array<[boolean, number]>) {
          if (!missing) continue;
          matrix.position.set(Math.sin(a) * (RADIUS - 0.05), -Math.cos(a) * (RADIUS - 0.05), -index * ROW + zEdge);
          matrix.rotation.set(0, 0, a);
          matrix.scale.setScalar(1);
          matrix.updateMatrix();
          lip.setMatrixAt(l, matrix.matrix);
          l += 1;
        }
        for (const dir of [-1, 1]) {
          if (present[(k + dir + SIDES) % SIDES]) continue;
          const along = { x: Math.cos(a), y: Math.sin(a) };
          const half = width / 2 - 0.08;
          matrix.position.set(Math.sin(a) * (RADIUS - 0.05) + along.x * half * dir, -Math.cos(a) * (RADIUS - 0.05) + along.y * half * dir, -index * ROW);
          matrix.rotation.set(0, 0, a);
          matrix.scale.setScalar(1);
          matrix.updateMatrix();
          side.setMatrixAt(sl, matrix.matrix);
          sl += 1;
        }
      }
    }
    // hide unused warning lips
    matrix.scale.setScalar(0);
    matrix.updateMatrix();
    for (; l < lip.count; l += 1) lip.setMatrixAt(l, matrix.matrix);
    for (; sl < side.count; sl += 1) side.setMatrixAt(sl, matrix.matrix);
    lip.instanceMatrix.needsUpdate = true;
    side.instanceMatrix.needsUpdate = true;
    mesh.instanceMatrix.needsUpdate = true;
    rim.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={tiles} args={[undefined, undefined, VISIBLE_ROWS * SIDES]} frustumCulled={false}>
        <boxGeometry args={[width, 0.5, ROW - 0.1]} />
        <meshStandardMaterial map={stone} color={colours.tile} roughness={0.75} metalness={0.15} />
      </instancedMesh>
      <instancedMesh ref={rims} args={[undefined, undefined, VISIBLE_ROWS * SIDES]} frustumCulled={false}>
        <boxGeometry args={[width, 0.06, 0.1]} />
        <meshBasicMaterial color={colours.edge} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={lips} args={[undefined, undefined, VISIBLE_ROWS * SIDES * 2]} frustumCulled={false}>
        <boxGeometry args={[width, 0.14, 0.22]} />
        <meshBasicMaterial color="#ff3b2a" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={sideLips} args={[undefined, undefined, VISIBLE_ROWS * SIDES * 2]} frustumCulled={false}>
        <boxGeometry args={[0.18, 0.14, ROW - 0.1]} />
        <meshBasicMaterial color="#ff3b2a" toneMapped={false} />
      </instancedMesh>
      {/* a glowing void outside the tunnel, seen through every hole */}
      <VoidGlow game={game} colour="#0b0620" />
    </>
  );
}

function Runner({ game }: { game: React.RefObject<Game> }) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = game.current;
    if (!group.current || !body.current || !g) return;
    const r = RADIUS - 0.95 - g.height;
    group.current.position.set(Math.sin(g.angle) * r, -Math.cos(g.angle) * r, -g.z);
    group.current.rotation.set(0, 0, g.angle);
    const running = g.height === 0 && g.phase === "playing";
    body.current.position.y = running ? Math.abs(Math.sin(clock.elapsedTime * 14)) * 0.18 : 0;
    body.current.rotation.x = g.phase === "playing" ? -0.25 : 0;
    body.current.rotation.z = (g.left ? 0.25 : 0) + (g.right ? -0.25 : 0);
  });
  return (
    <group ref={group}>
      <group ref={body}>
        <mesh><sphereGeometry args={[0.62, 32, 32]} /><meshStandardMaterial color="#ffa830" roughness={0.35} emissive="#7a3a00" emissiveIntensity={0.35} /></mesh>
        <mesh position={[0, 0.06, -0.6]}><circleGeometry args={[0.42, 32]} /><meshStandardMaterial color="#fff6e0" side={THREE.DoubleSide} /></mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 0.38, 0.62, 0]} rotation={[0, 0, -side * 0.4]}><coneGeometry args={[0.17, 0.45, 12]} /><meshStandardMaterial color="#ffa830" roughness={0.4} /></mesh>
            <mesh position={[side * 0.16, 0.14, -0.62]}><sphereGeometry args={[0.07, 12, 12]} /><meshStandardMaterial color="#2a1606" /></mesh>
            <mesh position={[side * 0.28, -0.55, -0.1]} scale={[1, 0.6, 1.3]}><sphereGeometry args={[0.2, 16, 16]} /><meshStandardMaterial color="#d96a14" /></mesh>
          </group>
        ))}
      </group>
      {/* The runner carries its own light: nearby tiles glow, far ones fall into shadow. */}
      <pointLight position={[0, 1.2, -1.5]} intensity={40} distance={26} decay={1.6} color="#ffd9a0" />
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

// A dim glowing shell outside the tunnel so holes show colour, not black.
function VoidGlow({ game, colour }: { game: React.RefObject<Game>; colour: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => { if (mesh.current && game.current) mesh.current.position.z = -game.current.z - 80; });
  return (
    <mesh ref={mesh} rotation={[Math.PI / 2, 0, 0]}>
      <cylinderGeometry args={[16, 16, 260, 24, 1, true]} />
      <meshBasicMaterial color={colour} transparent opacity={0.92} side={THREE.BackSide} toneMapped={false} fog={false} />
    </mesh>
  );
}

// A glowing nebula far outside the tunnel, seen through the gaps.
function Nebula({ colour }: { colour: string }) {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,.55)");
    g.addColorStop(0.4, "rgba(255,255,255,.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(canvas);
  }, []);
  useFrame(() => { if (group.current) group.current.position.z = camera.position.z; });
  return (
    <group ref={group}>
      {[[-60, 30, -180, 160], [70, -40, -220, 200], [0, 80, -260, 180], [-40, -70, -150, 140]].map(([x, y, z, size], index) => (
        <sprite key={index} position={[x, y, z]} scale={[size, size, 1]}>
          <spriteMaterial map={texture} color={colour} transparent depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </sprite>
      ))}
    </group>
  );
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
    const r = RADIUS - 3.9;
    camera.position.set(Math.sin(a) * r, -Math.cos(a) * r, -g.z + 7.5);
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
      <Canvas camera={{ fov: 74, near: 0.1, far: 400, position: [0, -RADIUS + 3.9, 7.5] }} dpr={[1, 1.5]} gl={{ antialias: true }}>
        <color attach="background" args={[era.fog]} />
        <fog attach="fog" args={[era.fog, 70, 210]} />
        <ambientLight intensity={0.8} />
        <hemisphereLight args={["#ffe6c8", "#3a2a4e", 1.1]} />
        <Stars />
        <Nebula colour={era.edge} />
        <Suspense fallback={null}><Tunnel game={game} row={row} era={hud.era} /></Suspense>
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
