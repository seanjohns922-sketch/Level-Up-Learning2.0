"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { GAME_STYLES, GameCard, GameHeader, useBest } from "@/components/chronorok/GameChrome";

/** Time Slope: steer a glowing time orb down an endless neon track that bends
 *  and drops away. Fall off an edge or hit a red block and the run ends. It
 *  only gets faster. Score = distance. Game state lives in a ref, stepped per frame. */

/* The game loop mutates refs, buffers and the R3F camera every frame by design. */
/* eslint-disable react-hooks/immutability */

const LANES = 7;
const LANE_W = 2;
const ROW = 4;
const SLOPE = 0.16; // drop per metre
const VISIBLE = 70;
const START_SPEED = 18;
const MAX_SPEED = 46;
const STEER = 13; // metres per second sideways
const ORB = 0.8;

type Row = { tiles: boolean[]; blocks: boolean[]; bend: number };
type Phase = "ready" | "playing" | "over";
type Game = { phase: Phase; z: number; x: number; vx: number; y: number; vy: number; speed: number; left: boolean; right: boolean; falling: boolean; nearMiss: number };

// Track is generated row by row: a wandering safe lane always exists; gaps and
// red blocks get more frequent with distance. `bend` shifts the whole track sideways.
function makeTrack() {
  const rows: Row[] = [];
  let safe = Math.floor(LANES / 2);
  let seed = Math.floor(Math.random() * 2147483646) + 1;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let bend = 0, drift = 0;
  return function row(i: number): Row {
    while (rows.length <= i) {
      const n = rows.length;
      const level = Math.min(1, n / 500);
      drift += (rand() - 0.5) * 0.08;
      drift = Math.max(-0.35, Math.min(0.35, drift * 0.97));
      bend += drift;
      const tiles = new Array<boolean>(LANES).fill(true);
      const blocks = new Array<boolean>(LANES).fill(false);
      if (n > 10) {
        if (rand() < 0.2) safe = Math.max(0, Math.min(LANES - 1, safe + (rand() < 0.5 ? -1 : 1)));
        for (let k = 0; k < LANES; k += 1) {
          if (k === safe) continue;
          if (rand() < 0.06 + level * 0.18) tiles[k] = false;
          else if (n % 2 === 0 && rand() < 0.05 + level * 0.12) blocks[k] = true;
        }
        // narrow the track at the edges as it gets harder
        if (rand() < level * 0.5) { tiles[0] = safe === 0; tiles[LANES - 1] = safe === LANES - 1; }
      }
      rows.push({ tiles, blocks, bend });
    }
    return rows[i];
  };
}

function laneCentre(row: Row, k: number) {
  return row.bend * LANE_W + (k - (LANES - 1) / 2) * LANE_W;
}

function Track({ game, row }: { game: React.RefObject<Game>; row: (i: number) => Row }) {
  const tiles = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.InstancedMesh>(null);
  const blocks = useRef<THREE.InstancedMesh>(null);
  const m = useMemo(() => new THREE.Object3D(), []);
  const tilt = -Math.atan(SLOPE); // far end lower
  useFrame(() => {
    if (!tiles.current || !lines.current || !blocks.current || !game.current) return;
    const base = Math.max(0, Math.floor(game.current.z / ROW) - 2);
    let t = 0, b = 0;
    for (let r = 0; r < VISIBLE; r += 1) {
      const i = base + r;
      const data = row(i);
      const z = -i * ROW;
      const y = -i * ROW * SLOPE;
      for (let k = 0; k < LANES; k += 1) {
        const x = laneCentre(data, k);
        m.position.set(x, y, z); m.rotation.set(tilt, 0, 0); m.scale.setScalar(data.tiles[k] ? 1 : 0); m.updateMatrix();
        tiles.current.setMatrixAt(t, m.matrix);
        m.position.set(x - LANE_W / 2 + 0.04, y + 0.17, z); m.updateMatrix();
        lines.current.setMatrixAt(t, m.matrix);
        t += 1;
        m.position.set(x, y + 1.0, z); m.scale.setScalar(data.blocks[k] && data.tiles[k] ? 1 : 0); m.rotation.set(tilt, 0, 0); m.updateMatrix();
        blocks.current.setMatrixAt(b, m.matrix);
        b += 1;
      }
    }
    tiles.current.instanceMatrix.needsUpdate = true;
    lines.current.instanceMatrix.needsUpdate = true;
    blocks.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={tiles} args={[undefined, undefined, VISIBLE * LANES]} frustumCulled={false}>
        <boxGeometry args={[LANE_W - 0.08, 0.3, ROW - 0.12]} />
        <meshStandardMaterial color="#241446" emissive="#3a1a80" emissiveIntensity={0.55} metalness={0.4} roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={lines} args={[undefined, undefined, VISIBLE * LANES]} frustumCulled={false}>
        <boxGeometry args={[0.07, 0.05, ROW - 0.12]} />
        <meshBasicMaterial color="#3ee6ff" toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={blocks} args={[undefined, undefined, VISIBLE * LANES]} frustumCulled={false}>
        <boxGeometry args={[1.7, 1.7, 1.7]} />
        <meshStandardMaterial color="#ff2a5a" emissive="#ff1a4a" emissiveIntensity={1.1} roughness={0.3} />
      </instancedMesh>
    </>
  );
}

function Orb({ game }: { game: React.RefObject<Game> }) {
  const group = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const g = game.current;
    if (!g || !group.current || !ball.current) return;
    group.current.position.set(g.x, g.y + ORB, -g.z);
    ball.current.rotation.x -= (g.speed * delta) / ORB;
    ball.current.rotation.z = -g.vx * 0.04;
  });
  return (
    <group ref={group}>
      <mesh ref={ball}>
        <sphereGeometry args={[ORB, 32, 32]} />
        <meshStandardMaterial color="#ffa830" emissive="#ff8a00" emissiveIntensity={0.6} roughness={0.25} metalness={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2.3, 0, 0]}><torusGeometry args={[ORB * 1.25, 0.06, 8, 48]} /><meshBasicMaterial color="#7ff0ff" toneMapped={false} /></mesh>
      <mesh scale={1.7}><sphereGeometry args={[ORB, 16, 16]} /><meshBasicMaterial color="#ffb347" transparent opacity={0.15} toneMapped={false} /></mesh>
      <pointLight position={[0, 2, 0]} intensity={60} distance={22} color="#ffcf7a" />
    </group>
  );
}

function Backdrop() {
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const stars = useMemo(() => {
    const p: number[] = [];
    let s = 3;
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 1200; i += 1) p.push((rand() - 0.5) * 900, rand() * 420 - 40, -300 - rand() * 300);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return g;
  }, []);
  useFrame(() => { if (group.current) group.current.position.set(camera.position.x, camera.position.y, camera.position.z); });
  return (
    <group ref={group}>
      <points geometry={stars}><pointsMaterial color="#ffffff" size={1.5} sizeAttenuation={false} fog={false} /></points>
      <mesh position={[0, 30, -520]}><circleGeometry args={[110, 64]} /><meshBasicMaterial color="#ff5fa8" toneMapped={false} fog={false} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => <mesh key={i} position={[0, -6 + i * 12, -519]}><planeGeometry args={[240, 3 + i]} /><meshBasicMaterial color="#14082e" fog={false} /></mesh>)}
      <mesh position={[0, 30, -521]}><circleGeometry args={[140, 64]} /><meshBasicMaterial color="#7a2a8a" transparent opacity={0.45} fog={false} /></mesh>
    </group>
  );
}

function Step({ game, row, onScore, onOver, onNear }: { game: React.RefObject<Game>; row: (i: number) => Row; onScore: (m: number) => void; onOver: (m: number) => void; onNear: () => void }) {
  const { camera } = useThree();
  const last = useRef(0);
  useFrame((_, raw) => {
    const g = game.current;
    if (!g) return;
    const d = Math.min(raw, 1 / 30);
    if (g.phase === "playing") {
      g.speed = Math.min(MAX_SPEED, g.speed + d * 0.55);
      g.z += g.speed * d;
      const target = (g.left ? -1 : 0) + (g.right ? 1 : 0);
      g.vx += (target * STEER - g.vx) * Math.min(1, d * 9);
      g.x += g.vx * d;
      const index = Math.floor((g.z + ROW / 2) / ROW);
      const data = row(index);
      const ground = -g.z * SLOPE;
      if (!g.falling) {
        const lane = Math.round((g.x - data.bend * LANE_W) / LANE_W + (LANES - 1) / 2);
        const onTrack = lane >= 0 && lane < LANES && data.tiles[lane];
        if (!onTrack) { g.falling = true; g.vy = 0; }
        else {
          g.y = ground;
          if (data.blocks[lane]) {
            const blockZ = index * ROW;
            if (Math.abs(g.z - blockZ) < 1.4) { g.phase = "over"; onOver(Math.floor(g.z)); }
          }
          // near miss: a block in the next lane
          for (const side of [-1, 1]) if (data.blocks[lane + side] && Math.abs(g.z - index * ROW) < 0.6 && performance.now() - g.nearMiss > 900) { g.nearMiss = performance.now(); onNear(); }
        }
      }
      if (g.falling) {
        g.vy -= 40 * d;
        g.y += g.vy * d;
        if (g.y < ground - 14) { g.phase = "over"; onOver(Math.floor(g.z)); }
      }
      const now = performance.now();
      if (now - last.current > 100) { last.current = now; onScore(Math.floor(g.z)); }
    }
    camera.position.set(g.x * 0.85, g.y + 6.2, -g.z + 10);
    camera.lookAt(g.x, g.y - 2, -g.z - 26);
  });
  return null;
}

export default function TimeSlope({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [score, setScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const [near, setNear] = useState(0);
  const [row, setRow] = useState(() => makeTrack());
  const { best, record } = useBest("time-slope");
  const game = useRef<Game>({ phase: "ready", z: 0, x: 0, vx: 0, y: 0, vy: 0, speed: START_SPEED, left: false, right: false, falling: false, nearMiss: 0 });

  function start() {
    game.current = { phase: "playing", z: 0, x: 0, vx: 0, y: 0, vy: 0, speed: START_SPEED, left: false, right: false, falling: false, nearMiss: 0 };
    setRow(() => makeTrack());
    setScore(0); setNewBest(false); setPhase("playing");
  }
  function over(metres: number) {
    setScore(metres); setPhase("over");
    setNewBest(record(metres));
  }

  useEffect(() => {
    const handler = (down: boolean) => (event: KeyboardEvent) => {
      const g = game.current, k = event.key.toLowerCase();
      if (["arrowleft", "a"].includes(k)) { g.left = down; event.preventDefault(); }
      if (["arrowright", "d"].includes(k)) { g.right = down; event.preventDefault(); }
      if (down && k === " " && g.phase !== "playing" && !event.repeat) { event.preventDefault(); start(); }
      if (down && k === "escape") router.push(backHref);
    };
    const a = handler(true), b = handler(false);
    window.addEventListener("keydown", a); window.addEventListener("keyup", b);
    return () => { window.removeEventListener("keydown", a); window.removeEventListener("keyup", b); };
  });

  function touch(down: boolean, event: React.PointerEvent) {
    if (event.pointerType === "mouse") return;
    const g = game.current;
    if (!down) { g.left = false; g.right = false; return; }
    if (event.clientX < window.innerWidth / 2) g.left = true; else g.right = true;
  }

  return (
    <main className="chronoGame fixed inset-0 select-none overflow-hidden bg-[#090418] font-sans text-white" style={{ touchAction: "none" }}
      onPointerDown={(e) => touch(true, e)} onPointerUp={(e) => touch(false, e)} onPointerCancel={(e) => touch(false, e)}>
      <Canvas camera={{ fov: 66, near: 0.1, far: 900, position: [0, 6, 10] }} dpr={[1, 1.5]}>
        <color attach="background" args={["#0d0622"]} />
        <fog attach="fog" args={["#1a0a36", 60, 240]} />
        <ambientLight intensity={0.4} />
        <hemisphereLight args={["#bfefff", "#3a1a6a", 0.6]} />
        <Backdrop />
        <Track game={game} row={row} />
        <Orb game={game} />
        <Step game={game} row={row} onScore={setScore} onOver={over} onNear={() => setNear((n) => n + 1)} />
      </Canvas>
      <GameHeader backHref={backHref} title="TIME SLOPE · THE EMBER CAVE" accent="#7ff0ff" value={score.toLocaleString("en-AU")} sub={`Best ${best.toLocaleString("en-AU")}`} />
      {phase === "playing" && near > 0 ? <p key={near} className="chronoPop pointer-events-none absolute left-1/2 top-[28%] z-10 -translate-x-1/2 font-display text-4xl font-black text-[#7ff0ff]">CLOSE CALL!</p> : null}
      {phase === "ready" ? (
        <GameCard backHref={backHref} kicker="THE EMBER CAVE" kickerColour="#ff9a5a" title="Time Slope" action="ROLL" onAction={start}
          body={<><p>Steer the time orb down the stream. Don&apos;t fall off and dodge the red blocks. It only gets faster.</p><p className="mt-3 text-sm text-[#e8dcc8]"><kbd>←</kbd> <kbd>→</kbd> steer · Tablet: hold the left or right side</p></>} />
      ) : null}
      {phase === "over" ? (
        <GameCard backHref={backHref} kicker={newBest ? "NEW BEST!" : "LOST IN TIME"} kickerColour="#ffd76a" title={score.toLocaleString("en-AU")} action="↻ ROLL AGAIN" onAction={start} body={<p>Best {best.toLocaleString("en-AU")}</p>} />
      ) : null}
      {phase === "playing" ? (
        <div className="chronoTouch pointer-events-none absolute inset-x-0 bottom-5 flex justify-between px-6 opacity-70">
          <span className="chronoGlass grid h-14 w-14 place-items-center rounded-full"><ArrowLeft /></span>
          <span className="chronoGlass grid h-14 w-14 place-items-center rounded-full"><ArrowRight /></span>
        </div>
      ) : null}
      <style>{GAME_STYLES + `.chronoPop{animation:chronoPop .9s ease-out forwards}@keyframes chronoPop{0%{opacity:0;transform:translate(-50%,10px) scale(.8)}20%{opacity:1;transform:translate(-50%,0) scale(1.05)}100%{opacity:0;transform:translate(-50%,-20px)}}`}</style>
    </main>
  );
}
