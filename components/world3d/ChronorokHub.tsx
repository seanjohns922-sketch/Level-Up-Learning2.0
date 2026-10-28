"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { ArrowLeft, Lock, Play, X } from "lucide-react";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { fetchStudentActivityDaily } from "@/lib/student-activity";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { CHRONOROK_OPEN_DAYS, SHARDS_TO_AWAKEN, chronorokForGrade, chronorokProgress, gradeName } from "@/lib/chronorok";

/** Chronorok hub: Sean's painted Chronorok art turned into a 3D depth surface
 *  (near plaza, far cliffs and spire) with mist, drifting time sparks and four
 *  glowing portals. Each portal opens its painted close-up scene. The games
 *  behind the portals are still being built. */

const PAINT_W = 34;
const PAINT_H = (PAINT_W * 937) / 1678;

type PortalKey = "arena" | "rift" | "cave" | "rune";
const PORTALS: Record<PortalKey, { u: number; v: number; color: string; game: string; place: string; blurb: string; art: string; href?: string }> = {
  arena: { u: 0.17, v: 0.55, color: "#ffc94a", game: "Relic Rider", place: "The Arena Gate", blurb: "Stunt bikes through the castle tracks. Flip in the air to save time.", art: "/images/chronorok/arena-gate.webp" },
  rift: { u: 0.33, v: 0.4, color: "#7ff0ff", game: "Chrono Run", place: "The Rift Portal", blurb: "Run the time tunnels. Turn onto the walls and leap the gaps.", art: "/images/chronorok/rift-portal.webp", href: "/world/chronorok/chrono-run" },
  cave: { u: 0.69, v: 0.5, color: "#ff9a5a", game: "Time Slope", place: "The Ember Cave", blurb: "Race the time orb down the stream. It only gets faster.", art: "/images/chronorok/ember-cave.webp" },
  rune: { u: 0.82, v: 0.56, color: "#c79bff", game: "Rune Blocks", place: "The Rune Gate", blurb: "Roll the rune stone into the portal. Forty puzzles to beat.", art: "/images/chronorok/rune-gate.webp" },
};

// Depth of the painting at a point (u, v from the top-left): the plaza comes
// toward the viewer, the horizon sits back, and the spire and gates stand out.
function depthAt(x: number, up: number) {
  let z = up < 0.42 ? (0.42 - up) * 7 : -(up - 0.42) * 6;
  z += Math.exp(-(x ** 2) / (2 * 2.2 ** 2) - (up - 0.62) ** 2 / (2 * 0.18 ** 2)) * 1.2;
  z += Math.exp(-((x + 11) ** 2) / 18 - (up - 0.42) ** 2 / 0.0288) * 0.8;
  z += Math.exp(-((x - 12) ** 2) / 18 - (up - 0.42) ** 2 / 0.0288) * 0.8;
  return z;
}
function surfacePoint(u: number, v: number) {
  const x = (u - 0.5) * PAINT_W;
  return new THREE.Vector3(x, (0.5 - v) * PAINT_H, depthAt(x, 1 - v));
}

function softDot(stops: Array<[number, string]>, size = 64) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, color] of stops) gradient.addColorStop(at, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function Painting() {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    let cancelled = false;
    new THREE.TextureLoader().load("/images/chronorok/hub.webp", (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      if (!cancelled) setTexture(loaded);
    });
    return () => { cancelled = true; };
  }, []);
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(PAINT_W, PAINT_H, 220, 130);
    const position = plane.attributes.position;
    for (let i = 0; i < position.count; i += 1) {
      position.setZ(i, depthAt(position.getX(i), position.getY(i) / PAINT_H + 0.5));
    }
    plane.computeVertexNormals();
    return plane;
  }, []);
  if (!texture) return null;
  return <mesh geometry={geometry}><meshBasicMaterial map={texture} toneMapped={false} /></mesh>;
}

function Sparks() {
  const points = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(() => {
    const positions: number[] = [];
    let seed = 5;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 420; i += 1) positions.push((rand() - 0.5) * 34, (rand() - 0.5) * 18, rand() * 8 - 2);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    const m = new THREE.PointsMaterial({ map: softDot([[0, "rgba(255,240,190,1)"], [0.3, "rgba(255,190,80,.7)"], [1, "rgba(255,160,40,0)"]]), size: 0.2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    return { geometry: g, material: m };
  }, []);
  useFrame((_, delta) => {
    // R3F owns these mutable Three objects; updating them each frame is an imperative scene update.
    const position = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i += 1) {
      let y = position.getY(i) + delta * 0.35;
      if (y > 9) y = -9;
      position.setY(i, y);
    }
    // eslint-disable-next-line react-hooks/immutability
    position.needsUpdate = true;
  });
  return <points ref={points} geometry={geometry} material={material} />;
}

function Mist() {
  const group = useRef<THREE.Group>(null);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    let seed = 9;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 40; i += 1) {
      const x = rand() * 512, y = 64 + rand() * 30 - 15, r = 30 + rand() * 60;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,240,230,.35)");
      g.addColorStop(1, "rgba(255,240,230,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 128);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.RepeatWrapping;
    return t;
  }, []);
  useFrame((_, delta) => {
    // R3F owns these mutable Three objects; updating them each frame is an imperative scene update.
    // eslint-disable-next-line react-hooks/immutability
    texture.offset.x += delta * 0.006;
  });
  return (
    <group ref={group}>
      <mesh position={[0, -1.2, 1.6]}><planeGeometry args={[44, 7]} /><meshBasicMaterial map={texture} transparent opacity={0.22} depthWrite={false} /></mesh>
      <mesh position={[0, 1.2, 0.4]}><planeGeometry args={[44, 7]} /><meshBasicMaterial map={texture} transparent opacity={0.16} depthWrite={false} /></mesh>
    </group>
  );
}

// Keep portal labels on screen when the painting is wider than the view.
function clampToScreen(object: THREE.Object3D, camera: THREE.Camera, size: { width: number; height: number }) {
  const point = new THREE.Vector3().setFromMatrixPosition(object.matrixWorld).project(camera);
  const margin = 95;
  const x = Math.min(size.width - margin, Math.max(margin, ((point.x + 1) / 2) * size.width));
  const y = ((1 - point.y) / 2) * size.height;
  return [x, y];
}

function PortalGlow({ portal, active, onOpen }: { portal: (typeof PORTALS)[PortalKey]; active: boolean; onOpen: () => void }) {
  const sprite = useRef<THREE.Sprite>(null);
  const texture = useMemo(() => softDot([[0, "rgba(255,255,255,.9)"], [0.25, "rgba(255,255,255,.4)"], [1, "rgba(255,255,255,0)"]], 128), []);
  const point = useMemo(() => surfacePoint(portal.u, portal.v), [portal.u, portal.v]);
  useFrame(({ clock }) => {
    if (!sprite.current) return;
    const pulse = 1 + Math.sin(clock.elapsedTime * 2 + portal.u * 10) * 0.08;
    sprite.current.scale.setScalar((active ? 4.2 : 2.8) * pulse);
  });
  return (
    <group position={point}>
      <sprite ref={sprite} position={[0, 0, 0.6]}>
        <spriteMaterial map={texture} color={portal.color} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={active ? 1 : 0.6} />
      </sprite>
      <Html position={[0, 1.7, 0.6]} center zIndexRange={[20, 0]} calculatePosition={clampToScreen}>
        <button type="button" onClick={onOpen} className="chronoTag" style={{ borderColor: portal.color }} aria-label={`${portal.game}, ${portal.place}`}>
          <b>{portal.game}</b><small>{portal.place}</small>
        </button>
      </Html>
    </group>
  );
}

// Camera drifts gently and leans toward the pointer, so the painting's depth shows.
function CameraRig({ pointer }: { pointer: React.RefObject<{ x: number; y: number }> }) {
  const { camera, size } = useThree();
  // Sit close enough that the painting always covers the whole screen, with a
  // margin for the camera's sway, so its edges never show (like CSS "cover").
  const halfFov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2);
  const coverHeight = (PAINT_H * 0.82) / (2 * Math.tan(halfFov));
  const coverWidth = (PAINT_W * 0.82) / (2 * Math.tan(halfFov) * (size.width / size.height));
  const distance = Math.min(coverHeight, coverWidth);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const target = new THREE.Vector3(Math.sin(t * 0.18) * 0.5 + (pointer.current?.x ?? 0) * 0.9, -0.6 + (pointer.current?.y ?? 0) * 0.35, distance);
    camera.position.lerp(target, 0.04);
    camera.lookAt(camera.position.x * 0.35, -0.3 + camera.position.y * 0.3, 0);
  });
  return null;
}

export default function ChronorokHub({ teacherPreview = false }: { teacherPreview?: boolean }) {
  const router = useRouter();
  const demo = useDemoPreviewMode();
  const preview = teacherPreview || demo;
  const [progress, setProgress] = useState<{ learningDays: number; open: boolean; shards: number } | null>(null);
  const [yearLevel, setYearLevel] = useState<string | null>(null);
  const [portal, setPortal] = useState<PortalKey | null>(null);
  const [intro, setIntro] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const profile = getActiveStudentProfile();
    queueMicrotask(() => setYearLevel(preview ? "Year 3" : profile?.yearLevel ?? null));
    if (preview) {
      queueMicrotask(() => setProgress({ learningDays: 63, open: true, shards: 63 }));
      return;
    }
    if (!profile?.studentId) { router.replace("/login"); return; }
    let cancelled = false;
    void fetchStudentActivityDaily(profile.studentId)
      .then((rows) => { if (!cancelled) setProgress(chronorokProgress(rows)); })
      .catch(() => { if (!cancelled) setProgress({ learningDays: 0, open: false, shards: 0 }); });
    return () => { cancelled = true; };
  }, [preview, router]);

  // The arrival video plays once per visit session.
  useEffect(() => {
    try {
      if (sessionStorage.getItem("lul:chronorok:intro") !== "1") {
        sessionStorage.setItem("lul:chronorok:intro", "1");
        queueMicrotask(() => setIntro(true));
      }
    } catch { /* intro is optional */ }
  }, []);

  const back = () => router.push(preview ? "/world/tower?teacher_preview=1" : "/world/tower");
  const next = chronorokForGrade(yearLevel);
  const open = progress?.open ?? false;
  const active = portal ? PORTALS[portal] : null;

  return (
    <main
      className="chronorok fixed inset-0 overflow-hidden bg-[#2a1c30] font-sans text-white"
      onPointerMove={(event) => {
        pointer.current = { x: (event.clientX / window.innerWidth - 0.5) * 2, y: -(event.clientY / window.innerHeight - 0.5) * 2 };
      }}
    >
      <Canvas camera={{ position: [0, -0.6, 21.2], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true }} style={{ filter: open ? undefined : "blur(6px) brightness(.7)" }}>
        <Painting />
        <Mist />
        <Sparks />
        {open ? (Object.keys(PORTALS) as PortalKey[]).map((key) => <PortalGlow key={key} portal={PORTALS[key]} active={portal === key} onOpen={() => setPortal(key)} />) : null}
        <CameraRig pointer={pointer} />
      </Canvas>

      <header className="pointer-events-none absolute inset-x-5 top-4 z-10 flex items-start justify-between gap-3">
        <div className="pointer-events-auto flex items-start gap-3">
          <button type="button" onClick={back} className="chronoGlass flex h-12 items-center gap-2 rounded-full px-5 font-display text-[13px] font-black tracking-[0.05em]"><ArrowLeft className="h-4 w-4" />THE TOWER</button>
          <div className="chronoGlass hidden rounded-2xl px-5 py-2.5 sm:block">
            <p className="chronoTitle">CHRONOROK</p>
            <p className="font-display text-[11px] font-black tracking-[0.32em] text-[#f6d79a]">PAST · PRESENT · FUTURE</p>
          </div>
        </div>
        {progress ? (
          <div className="chronoGlass pointer-events-auto w-[min(340px,60vw)] rounded-2xl px-4 py-3">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[11px] font-black tracking-[0.14em] text-[#ffd9a0]">TIME SHARDS{yearLevel ? ` · ${gradeName(yearLevel).toUpperCase()}` : ""}</span>
              <span className="font-display text-2xl font-black text-[#ffd76a]">{progress.shards}<span className="text-sm text-[#f6e7c8]"> / {SHARDS_TO_AWAKEN}</span></span>
            </div>
            <div className="my-2 h-2.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-[#ffb347] to-[#ffe08a]" style={{ width: `${(progress.shards / SHARDS_TO_AWAKEN) * 100}%` }} /></div>
            <p className="text-[13px] font-bold">One shard for every day you learn. At {SHARDS_TO_AWAKEN}, <b className="text-[#ffd76a]">{next.name}</b> awakens.</p>
          </div>
        ) : null}
      </header>

      {progress && !open ? (
        <div className="absolute inset-0 z-20 grid place-items-center p-6">
          <div className="chronoGlass max-w-md rounded-3xl p-7 text-center">
            <Lock className="mx-auto h-9 w-9 text-[#ffd76a]" aria-hidden="true" />
            <h1 className="chronoTitle mt-3 text-3xl">Chronorok is sealed</h1>
            <p className="mt-2 font-bold text-[#f3ead9]">Learn on {CHRONOROK_OPEN_DAYS} different days to open it. A learning day is any day you finish a lesson or quiz.</p>
            <div className="mt-4 flex justify-center gap-2" aria-label={`${progress.learningDays} of ${CHRONOROK_OPEN_DAYS} learning days`}>
              {Array.from({ length: CHRONOROK_OPEN_DAYS }).map((_, index) => (
                <span key={index} className={`h-4 w-10 rounded-full ${index < progress.learningDays ? "bg-gradient-to-r from-[#ffb347] to-[#ffe08a]" : "bg-white/20"}`} />
              ))}
            </div>
            <p className="mt-2 text-sm font-bold text-[#ffd9a0]">{progress.learningDays} of {CHRONOROK_OPEN_DAYS} learning days</p>
            <button type="button" onClick={back} className="mt-5 h-12 rounded-full bg-white px-6 font-display text-sm font-black text-[#16121f]">BACK TO THE TOWER</button>
          </div>
        </div>
      ) : null}

      {open && !active ? <p className="chronoGlass absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-full px-5 py-3 text-center text-sm font-bold">Tap a glowing portal to visit its game</p> : null}

      {active ? (
        <div className="chronoScene absolute inset-0 z-30" style={{ backgroundImage: `url(${active.art})` }} role="dialog" aria-label={`${active.game}, ${active.place}`}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70" />
          <button type="button" onClick={() => setPortal(null)} className="chronoGlass absolute left-5 top-4 flex h-12 items-center gap-2 rounded-full px-5 font-display text-[13px] font-black tracking-[0.05em]"><ArrowLeft className="h-4 w-4" />BACK TO THE PLAZA</button>
          <div className="chronoGlass absolute bottom-8 left-1/2 w-[min(640px,92vw)] -translate-x-1/2 rounded-3xl px-6 py-5 text-center">
            <p className="font-display text-xs font-black tracking-[0.2em]" style={{ color: active.color }}>{active.place.toUpperCase()}</p>
            <h2 className="chronoTitle mt-1 text-4xl">{active.game}</h2>
            <p className="mt-1 font-bold text-[#f3ead9]">{active.blurb}</p>
            {active.href ? (
              <button type="button" onClick={() => router.push(preview ? `${active.href}?teacher_preview=1` : active.href!)} className="mt-4 inline-flex h-14 items-center gap-2 rounded-full bg-white px-8 font-display text-[15px] font-black text-[#16121f]">
                <Play className="h-4 w-4" />ENTER
              </button>
            ) : (
              <button type="button" disabled className="mt-4 inline-flex h-14 items-center gap-2 rounded-full bg-white/90 px-8 font-display text-[15px] font-black text-[#16121f] opacity-80">
                <Play className="h-4 w-4" />COMING SOON
              </button>
            )}
          </div>
        </div>
      ) : null}

      {intro ? (
        <div className="absolute inset-0 z-40 bg-black">
          <video src="/videos/realms/chronorok.mp4" autoPlay muted playsInline onEnded={() => setIntro(false)} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-16 text-center">
            <p className="chronoTitle text-5xl sm:text-6xl">CHRONOROK</p>
            <p className="mt-1 font-display text-sm font-black tracking-[0.4em] text-[#fff4dc]">THE REALM OF TIME</p>
          </div>
          <button type="button" onClick={() => setIntro(false)} className="chronoGlass absolute right-5 top-4 flex h-11 items-center gap-1.5 rounded-full px-4 font-display text-xs font-black"><X className="h-4 w-4" />SKIP</button>
        </div>
      ) : null}

      <style>{`
        .chronorok .chronoGlass{background:rgba(22,14,8,.52);border:1px solid rgba(255,230,180,.28);box-shadow:0 10px 30px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.12);backdrop-filter:blur(12px)}
        .chronorok .chronoTitle{font-family:var(--font-display);font-weight:900;letter-spacing:.12em;color:#ffe2a0;text-shadow:0 2px 14px rgba(245,180,50,.6)}
        .chronoTag{display:block;white-space:nowrap;text-align:center;padding:7px 13px;border-radius:14px;border:1px solid;background:rgba(22,14,8,.55);backdrop-filter:blur(10px);color:#fff;cursor:pointer;font-family:var(--font-sans)}
        .chronoTag b{display:block;font:900 15px var(--font-display)}.chronoTag small{display:block;font-weight:700;font-size:12px;color:#f3ead9}
        .chronoTag:hover{transform:scale(1.06)}
        .chronoScene{background-size:cover;background-position:center;animation:chronoZoom .6s ease-out}
        @keyframes chronoZoom{from{transform:scale(1.15);opacity:0}to{transform:scale(1);opacity:1}}
        @media (prefers-reduced-motion:reduce){.chronoScene{animation:none}}
      `}</style>
    </main>
  );
}
