"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Flag, Lock, RotateCcw, Star } from "lucide-react";
import { GAME_STYLES, GameHeader } from "@/components/chronorok/GameChrome";
import { RIDER_TRACKS, WHEEL_R, bikeAngle, newBike, stepBike, trackSegments, type Bike, type Controls, type Track } from "@/lib/chronorok/relic-rider";

/** Relic Rider: a side-on stunt bike over castle tracks. Gas, brake, lean.
 *  Flip in the air to take a second off your time; land on your wheels.
 *  Eight tracks, each proven finishable by a simulated ride. */

/* The game loop mutates refs, Three objects and the R3F camera each frame. */
 

const PROGRESS_KEY = "lul:chronorok:relic-rider:progress";
type Progress = { unlocked: number; best: Record<number, number> };
function readProgress(): Progress {
  try { return { unlocked: 1, best: {}, ...JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}") }; } catch { return { unlocked: 1, best: {} }; }
}
export function riderStars(time: number, par: number) {
  return time <= par ? 3 : time <= par * 1.35 ? 2 : 1;
}

function useTex(src: string, repeat: [number, number]) {
  const base = useLoader(THREE.TextureLoader, src);
  return useMemo(() => {
    const t = base.clone(); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); t.needsUpdate = true; return t;
  }, [base, repeat[0], repeat[1]]); // eslint-disable-line react-hooks/exhaustive-deps
}

function Terrain({ track }: { track: Track }) {
  const rock = useTex("/images/chronorok/tex-rock.webp", [0.08, 0.08]);
  const paving = useTex("/images/chronorok/tex-paving.webp", [1, 1]);
  const shapes = useMemo(() => track.polylines.map((line) => {
    const shape = new THREE.Shape();
    shape.moveTo(line[0].x, -40);
    for (const p of line) shape.lineTo(p.x, p.y);
    shape.lineTo(line[line.length - 1].x, -40);
    shape.closePath();
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 7, bevelEnabled: false });
    geometry.translate(0, 0, -3.5);
    return geometry;
  }), [track]);
  const tops = useMemo(() => {
    const out: Array<{ x: number; y: number; length: number; angle: number }> = [];
    for (const line of track.polylines) for (let i = 0; i + 1 < line.length; i += 1) {
      const a = line[i], b = line[i + 1];
      out.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, length: Math.hypot(b.x - a.x, b.y - a.y), angle: Math.atan2(b.y - a.y, b.x - a.x) });
    }
    return out;
  }, [track]);
  return (
    <group>
      {shapes.map((geometry, i) => <mesh key={i} geometry={geometry} receiveShadow><meshStandardMaterial map={rock} color="#e2b48a" roughness={0.95} /></mesh>)}
      {tops.map((t, i) => (
        <group key={i} position={[t.x, t.y, 0]} rotation={[0, 0, t.angle]}>
          <mesh position={[0, -0.08, 0]} receiveShadow><boxGeometry args={[t.length + 0.05, 0.22, 7.1]} /><meshStandardMaterial map={paving} color="#efd9b0" roughness={0.85} /></mesh>
          <mesh position={[0, 0.04, 3.56]}><boxGeometry args={[t.length + 0.05, 0.06, 0.06]} /><meshBasicMaterial color="#ffc94a" toneMapped={false} /></mesh>
        </group>
      ))}
      {track.pits.map((pit, i) => (
        <group key={`pit-${i}`} position={[(pit.x0 + pit.x1) / 2, -9, 0]}>
          <mesh><boxGeometry args={[pit.x1 - pit.x0, 0.5, 7]} /><meshBasicMaterial color="#ff6a1a" toneMapped={false} /></mesh>
          {Array.from({ length: Math.ceil((pit.x1 - pit.x0) / 1.6) }).map((_, k) => <mesh key={k} position={[-(pit.x1 - pit.x0) / 2 + 0.8 + k * 1.6, 1, 2]}><coneGeometry args={[0.6, 2.4, 6]} /><meshBasicMaterial color={k % 2 ? "#ffb02e" : "#ff7a1a"} toneMapped={false} /></mesh>)}
          <pointLight position={[0, 4, 3]} intensity={120} distance={20} color="#ff8a2a" />
        </group>
      ))}
      <FinishGate x={track.finishX} y={track.polylines[track.polylines.length - 1].at(-1)!.y} />
    </group>
  );
}

function FinishGate({ x, y }: { x: number; y: number }) {
  return (
    <group position={[x, y, 0]}>
      {[-3, 3].map((z) => <mesh key={z} position={[0, 3, z]}><boxGeometry args={[0.6, 6, 0.6]} /><meshStandardMaterial color="#f0dcb6" /></mesh>)}
      <mesh position={[0, 6.2, 0]}><boxGeometry args={[0.6, 0.8, 6.6]} /><meshStandardMaterial color="#d9a640" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 3, 0]}><planeGeometry args={[0.05, 5]} /><meshBasicMaterial color="#ffffff" /></mesh>
      {Array.from({ length: 6 }).map((_, i) => <mesh key={i} position={[0.05, 5.6 - (i % 2) * 0.5, -2.5 + i]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[0.9, 0.5]} /><meshBasicMaterial color={i % 2 ? "#26306e" : "#ffd76a"} side={THREE.DoubleSide} /></mesh>)}
    </group>
  );
}

function Backdrop() {
  const sky = useTex("/images/chronorok/sky-pano.webp", [1, 1]);
  const arena = useTex("/images/chronorok/arena-gate.webp", [1, 1]);
  const { camera } = useThree();
  const far = useRef<THREE.Group>(null);
  const mid = useRef<THREE.Group>(null);
  useFrame(() => {
    if (far.current) far.current.position.set(camera.position.x * 0.92, camera.position.y * 0.6, 0);
    if (mid.current) mid.current.position.set(camera.position.x * 0.9, camera.position.y * 0.5, 0);
  });
  return (
    <>
      <group ref={far}><mesh position={[0, 8, -120]}><planeGeometry args={[900, 300]} /><meshBasicMaterial map={sky} toneMapped={false} fog={false} /></mesh></group>
      <group ref={mid}><mesh position={[0, 6, -60]}><planeGeometry args={[170, 96]} /><meshBasicMaterial map={arena} transparent opacity={0.4} toneMapped={false} fog={false} /></mesh></group>
    </>
  );
}

function BikeModel({ bike }: { bike: React.RefObject<Bike> }) {
  const group = useRef<THREE.Group>(null);
  const rearWheel = useRef<THREE.Group>(null);
  const frontWheel = useRef<THREE.Group>(null);
  const spin = useRef(0);
  useFrame(() => {
    const b = bike.current;
    if (!b || !group.current) return;
    group.current.position.set(b.rear.p.x, b.rear.p.y, 0);
    group.current.rotation.z = bikeAngle(b);
    spin.current = b.rear.p.x / WHEEL_R;
    if (rearWheel.current) rearWheel.current.rotation.z = -spin.current;
    if (frontWheel.current) frontWheel.current.rotation.z = -spin.current;
  });
  const wheel = (ref: React.RefObject<THREE.Group | null>, x: number) => (
    <group ref={ref} position={[x, 0, 0]}>
      <mesh><torusGeometry args={[WHEEL_R - 0.06, 0.1, 10, 32]} /><meshStandardMaterial color="#1f1612" roughness={0.9} /></mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.12, 0.12, 0.3, 16]} /><meshStandardMaterial color="#ffd76a" metalness={0.7} roughness={0.3} /></mesh>
      {[0, 1, 2].map((i) => <mesh key={i} rotation={[0, 0, (i / 3) * Math.PI]}><boxGeometry args={[(WHEEL_R - 0.1) * 2, 0.04, 0.04]} /><meshStandardMaterial color="#d8c8a8" /></mesh>)}
    </group>
  );
  return (
    <group ref={group}>
      {wheel(rearWheel, 0)}
      {wheel(frontWheel, 1.7)}
      <mesh position={[0.6, 0.35, 0]} rotation={[0, 0, 0.5]}><boxGeometry args={[1.0, 0.14, 0.14]} /><meshStandardMaterial color="#c94df2" metalness={0.4} roughness={0.35} /></mesh>
      <mesh position={[1.15, 0.38, 0]} rotation={[0, 0, -0.55]}><boxGeometry args={[1.05, 0.14, 0.14]} /><meshStandardMaterial color="#c94df2" metalness={0.4} roughness={0.35} /></mesh>
      <mesh position={[0.85, 0.66, 0]}><boxGeometry args={[1.0, 0.18, 0.34]} /><meshStandardMaterial color="#8c2eac" /></mesh>
      <mesh position={[1.55, 0.95, 0]} rotation={[0, 0, 1.2]}><boxGeometry args={[0.7, 0.08, 0.08]} /><meshStandardMaterial color="#ffd76a" metalness={0.7} /></mesh>
      <mesh position={[1.62, 1.25, 0]}><boxGeometry args={[0.08, 0.08, 0.6]} /><meshStandardMaterial color="#1f1612" /></mesh>
      {/* rider: the time sprite */}
      <group position={[0.85, 1.35, 0]}>
        <mesh castShadow><sphereGeometry args={[0.42, 24, 24]} /><meshStandardMaterial color="#ffa830" roughness={0.35} emissive="#7a3a00" emissiveIntensity={0.3} /></mesh>
        <mesh position={[0.36, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}><circleGeometry args={[0.28, 24]} /><meshStandardMaterial color="#fff6e0" /></mesh>
        <mesh position={[0.43, 0.1, 0.1]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#2a1606" /></mesh>
        <mesh position={[0.43, 0.1, -0.1]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#2a1606" /></mesh>
        {[-1, 1].map((s) => <mesh key={s} position={[-0.05, 0.42, s * 0.2]} rotation={[s * 0.3, 0, 0]}><coneGeometry args={[0.12, 0.32, 10]} /><meshStandardMaterial color="#ffa830" /></mesh>)}
        <mesh position={[-0.32, -0.25, 0]} rotation={[0, 0, 0.6]}><planeGeometry args={[0.7, 0.5]} /><meshStandardMaterial color="#c94df2" side={THREE.DoubleSide} /></mesh>
      </group>
    </group>
  );
}

function Loop({ bike, track, controls, onTick, onEnd, onFlip }: { bike: React.RefObject<Bike>; track: Track; controls: React.RefObject<Controls>; onTick: (t: number) => void; onEnd: (result: "crash" | "finish", time: number) => void; onFlip: () => void }) {
  const { camera } = useThree();
  const segments = useMemo(() => trackSegments(track), [track]);
  const elapsed = useRef(0);
  const ended = useRef(false);
  const flips = useRef(0);
  const lastTick = useRef(0);
  const cam = useRef(new THREE.Vector3(0, 3, 15));
  useFrame((_, raw) => {
    const b = bike.current;
    if (!b) return;
    const dt = Math.min(raw, 1 / 30);
    if (!ended.current) {
      stepBike(b, track, segments, controls.current, dt);
      elapsed.current += dt;
      if (b.flips > flips.current) { flips.current = b.flips; onFlip(); }
      const time = Math.max(0, elapsed.current - b.flips);
      if (performance.now() - lastTick.current > 90) { lastTick.current = performance.now(); onTick(time); }
      if (b.crashed || b.finished) { ended.current = true; onEnd(b.finished ? "finish" : "crash", Math.round(time * 10) / 10); }
    }
    const v = b.rear.p.x - b.rear.prev.x;
    const target = new THREE.Vector3(b.body.p.x + 4 + v * 6, Math.max(b.body.p.y + 1.6, -4), 15.5);
    cam.current.lerp(target, Math.min(1, dt * 4));
    camera.position.copy(cam.current);
    camera.lookAt(cam.current.x, cam.current.y - 1.2, 0);
  });
  return null;
}

export default function RelicRider({ backHref }: { backHref: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState<Progress>({ unlocked: 1, best: {} });
  const [index, setIndex] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);
  const [time, setTime] = useState(0);
  const [result, setResult] = useState<null | { kind: "crash" | "finish"; time: number; newBest: boolean }>(null);
  const [flipPop, setFlipPop] = useState(0);
  const bike = useRef<Bike>(newBike());
  const controls = useRef<Controls>({ throttle: false, brake: false, leanBack: false, leanForward: false });

  useEffect(() => { queueMicrotask(() => setProgress(readProgress())); }, []);
  const track = index === null ? null : RIDER_TRACKS[index];

  function start(i: number) {
    bike.current = newBike();
    controls.current = { throttle: false, brake: false, leanBack: false, leanForward: false };
    setIndex(i); setResult(null); setTime(0); setRunId((n) => n + 1);
  }
  function end(kind: "crash" | "finish", t: number) {
    if (kind === "finish" && index !== null) {
      const previous = progress.best[index];
      const better = previous === undefined || t < previous;
      const next: Progress = { unlocked: Math.max(progress.unlocked, index + 2), best: better ? { ...progress.best, [index]: t } : progress.best };
      setProgress(next);
      try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch { /* per device only */ }
      setResult({ kind, time: t, newBest: better });
    } else setResult({ kind, time: t, newBest: false });
  }

  useEffect(() => {
    const handler = (down: boolean) => (event: KeyboardEvent) => {
      const k = event.key.toLowerCase(), c = controls.current;
      const map: Record<string, keyof Controls> = { arrowup: "throttle", w: "throttle", arrowdown: "brake", s: "brake", arrowleft: "leanBack", a: "leanBack", arrowright: "leanForward", d: "leanForward" };
      if (map[k] && index !== null) { c[map[k]] = down; event.preventDefault(); }
      if (down && (k === "r" || (k === " " && result)) && index !== null) { event.preventDefault(); start(result?.kind === "finish" && k === " " && index + 1 < RIDER_TRACKS.length ? index + 1 : index); }
      if (down && k === "escape") { if (index !== null) setIndex(null); else router.push(backHref); }
    };
    const a = handler(true), b = handler(false);
    window.addEventListener("keydown", a); window.addEventListener("keyup", b);
    return () => { window.removeEventListener("keydown", a); window.removeEventListener("keyup", b); };
  });

  const hold = (key: keyof Controls) => ({
    onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); controls.current[key] = true; },
    onPointerUp: () => { controls.current[key] = false; },
    onPointerLeave: () => { controls.current[key] = false; },
    onPointerCancel: () => { controls.current[key] = false; },
  });

  return (
    <main className="chronoGame fixed inset-0 select-none overflow-hidden bg-[#2a1c30] font-sans text-white" style={{ touchAction: "none" }}>
      {track && index !== null ? (
        <>
          <Canvas key={runId} shadows camera={{ fov: 50, near: 0.1, far: 600, position: [4, 3, 15.5] }} dpr={[1, 1.5]} gl={{ toneMapping: THREE.ACESFilmicToneMapping }}>
            <color attach="background" args={["#f2b47a"]} />
            <fog attach="fog" args={["#f2c6a0", 40, 150]} />
            <hemisphereLight args={["#ffe2c0", "#5a4060", 0.8]} />
            <directionalLight position={[-20, 30, 20]} intensity={2.2} color="#ffd29a" castShadow />
            <Suspense fallback={null}>
              <Backdrop />
              <Terrain track={track} />
            </Suspense>
            <BikeModel bike={bike} />
            <Loop bike={bike} track={track} controls={controls} onTick={setTime} onEnd={end} onFlip={() => setFlipPop((n) => n + 1)} />
          </Canvas>
          <GameHeader backHref={backHref} title={`RELIC RIDER · ${index + 1}. ${track.name.toUpperCase()}`} accent="#ffc94a" value={`${time.toFixed(1)} s`} sub={`3 stars under ${track.par.toFixed(1)} s${progress.best[index] !== undefined ? ` · best ${progress.best[index].toFixed(1)} s` : ""}`} />
          {flipPop ? <p key={flipPop} className="chronoPop pointer-events-none absolute left-1/2 top-[24%] z-10 -translate-x-1/2 font-display text-5xl font-black text-white">FLIP! −1.0 s</p> : null}
          <div className="chronoTouch absolute inset-x-4 bottom-4 z-10 flex justify-between">
            <div className="flex gap-2">
              <button type="button" aria-label="Lean back" {...hold("leanBack")} className="chronoGlass grid h-16 w-16 place-items-center rounded-2xl"><ArrowLeft /></button>
              <button type="button" aria-label="Lean forward" {...hold("leanForward")} className="chronoGlass grid h-16 w-16 place-items-center rounded-2xl"><ArrowRight /></button>
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Brake" {...hold("brake")} className="chronoGlass grid h-16 w-16 place-items-center rounded-2xl"><ArrowDown /></button>
              <button type="button" aria-label="Go" {...hold("throttle")} className="grid h-16 w-20 place-items-center rounded-2xl bg-[#ffc94a] font-display font-black text-[#1a1206]"><ArrowUp /></button>
            </div>
          </div>
          {!result && time === 0 ? <p className="chronoGlass pointer-events-none absolute bottom-24 left-1/2 z-10 -translate-x-1/2 rounded-full px-5 py-3 text-center text-sm font-bold">Hold <kbd>↑</kbd> to go · <kbd>←</kbd> <kbd>→</kbd> lean and flip · <kbd>↓</kbd> brake · <kbd>R</kbd> restart</p> : null}
          {result ? (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/40 p-6">
              <div className="chronoGlass w-[min(440px,92vw)] rounded-3xl p-7 text-center">
                <p className="font-display text-xs font-black tracking-[0.2em]" style={{ color: result.kind === "finish" ? "#ffd76a" : "#ffb0b0" }}>{result.kind === "finish" ? (result.newBest ? "NEW BEST!" : "FINISHED") : "WIPEOUT!"}</p>
                <h1 className="chronoTitle mt-1 text-4xl">{result.kind === "finish" ? `${result.time.toFixed(1)} s` : "Land on your wheels!"}</h1>
                {result.kind === "finish" ? <div className="mt-3 flex justify-center gap-1.5">{[1, 2, 3].map((n) => <Star key={n} className="h-9 w-9" fill={n <= riderStars(result.time, track.par) ? "#ffd76a" : "transparent"} color="#ffd76a" />)}</div> : <p className="mt-2 font-bold text-[#f3ead9]">Lean to keep the bike level as you land.</p>}
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <button type="button" onClick={() => start(index)} className="chronoGlass flex h-12 items-center gap-2 rounded-full px-5 font-display text-sm font-black"><RotateCcw className="h-4 w-4" />RETRY <kbd>R</kbd></button>
                  {result.kind === "finish" && index + 1 < RIDER_TRACKS.length ? <button type="button" onClick={() => start(index + 1)} className="h-12 rounded-full bg-white px-6 font-display text-sm font-black text-[#16121f]">NEXT TRACK <kbd>Space</kbd></button> : null}
                  <button type="button" onClick={() => setIndex(null)} className="chronoGlass h-12 rounded-full px-5 font-display text-sm font-black">TRACKS</button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 overflow-y-auto p-5" style={{ background: "linear-gradient(180deg,#3a2450,#c0567a 60%,#f59a5a)" }}>
          <GameHeader backHref={backHref} title="RELIC RIDER · THE ARENA GATE" accent="#ffc94a" value={`${Object.values(progress.best).reduce((s, t, i) => s + riderStars(t, RIDER_TRACKS[Number(Object.keys(progress.best)[i])]?.par ?? 99), 0)} ★`} sub={`of ${RIDER_TRACKS.length * 3} stars`} />
          <div className="mx-auto mt-36 max-w-[760px]">
            <div className="chronoGlass mb-4 rounded-3xl p-5 text-center">
              <h1 className="chronoTitle text-3xl">Relic Rider</h1>
              <p className="mt-1 font-bold text-[#f3ead9]">Ride the castle tracks to the finish flag. Flip in the air for a second off your time, but land on your wheels or it&apos;s a wipeout.</p>
              <p className="mt-2 text-sm font-bold text-[#e8dcc8]"><kbd>↑</kbd> go · <kbd>↓</kbd> brake · <kbd>←</kbd> <kbd>→</kbd> lean · <kbd>R</kbd> restart</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {RIDER_TRACKS.map((t, i) => {
                const locked = i + 1 > progress.unlocked;
                const best = progress.best[i];
                return (
                  <button key={t.name} type="button" disabled={locked} onClick={() => start(i)} className={`chronoGlass rounded-2xl p-4 text-left ${locked ? "opacity-50" : "hover:-translate-y-0.5"}`}>
                    <p className="flex items-center gap-2 font-display text-2xl font-black">{i + 1}<Flag className="h-4 w-4 text-[#ffc94a]" /></p>
                    <p className="text-sm font-bold text-[#f3ead9]">{t.name}</p>
                    <p className="mt-1 flex items-center gap-0.5">{locked ? <Lock className="h-4 w-4" /> : [1, 2, 3].map((n) => <Star key={n} className="h-4 w-4" fill={best !== undefined && n <= riderStars(best, t.par) ? "#ffd76a" : "transparent"} color="#ffd76a" />)}</p>
                    {best !== undefined ? <p className="text-xs font-bold text-[#e8dcc8]">Best {best.toFixed(1)} s</p> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <style>{GAME_STYLES + `.chronoPop{animation:chronoPop 1s ease-out forwards}@keyframes chronoPop{0%{opacity:0;transform:translate(-50%,10px) scale(.8)}20%{opacity:1;transform:translate(-50%,0) scale(1.05)}100%{opacity:0;transform:translate(-50%,-24px)}}`}</style>
    </main>
  );
}
