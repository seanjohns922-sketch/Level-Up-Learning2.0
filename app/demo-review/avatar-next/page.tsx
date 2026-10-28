"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { ProceduralStudentAvatar } from "@/components/world3d/SharedWorldPlayer";
import { StylisedStudentAvatar } from "@/components/world3d/StylisedStudentAvatar";
import { DEFAULT_OUTFIT, type AvatarOutfit } from "@/components/avatar/StudentAvatar";

/** Side-by-side review of the current everyday avatar body and the upgraded one. */
type Outfit = Required<AvatarOutfit>;
const LOOKS: { name: string; o: Outfit }[] = [
  { name: "Sean's look", o: { ...DEFAULT_OUTFIT, shirt: "#15171c", shirtTrim: "#8b8f98", pants: "#f1f2f4", shoes: "#f8fafc" } },
  { name: "Default hoodie", o: DEFAULT_OUTFIT },
  { name: "T-shirt + shorts", o: { ...DEFAULT_OUTFIT, top: "tshirt", bottom: "shorts", shirt: "#f97316", shirtTrim: "#fff7ed", pants: "#1e3a5f", shoes: "#ef4444", skin: "#c68b5e", skinShade: "#a86f47", hair: "#1b1410", hairStyle: "buzz", face: "bigSmile" } },
  { name: "Jacket + jeans", o: { ...DEFAULT_OUTFIT, top: "jacket", bottom: "jeans", shirt: "#0f766e", shirtTrim: "#e5e7eb", pants: "#2c4a7a", shoes: "#44403c", shoeStyle: "hightops", hat: "cap", hatColor: "#f59e0b", backpack: "explorer", backpackColor: "#f59e0b" } },
  { name: "Dress", o: { ...DEFAULT_OUTFIT, top: "dress", body: "dress", shirt: "#a855f7", shirtTrim: "#fde68a", pants: "#a855f7", shoes: "#f9a8d4", shoeStyle: "sandals", skin: "#8d5a3b", skinShade: "#6f4229", hair: "#2a1a10", face: "happy" } },
];

function Spin({ children, on }: { children: React.ReactNode; on: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (g.current && on) g.current.rotation.y += d * 0.5; });
  return <group ref={g}>{children}</group>;
}

function Stage({ next, walking, spin, focus }: { next: boolean; walking: boolean; spin: boolean; focus?: number }) {
  const moving = useRef(walking);
  useEffect(() => { moving.current = walking; }, [walking]);
  const Avatar = next ? StylisedStudentAvatar : ProceduralStudentAvatar;
  const looks = focus === undefined ? LOOKS : [LOOKS[focus], LOOKS[focus]];
  return (
    <Canvas shadows camera={{ position: focus === undefined ? [0, 1.6, 8.6] : [0, 0.9, 4.4], fov: 34 }} dpr={[1, 2]}>
      <color attach="background" args={["#bfe3f5"]} />
      <hemisphereLight args={["#e9f6ff", "#6b8f4e", 1.1]} />
      <directionalLight position={[4, 7, 5]} intensity={2.3} castShadow shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-mapSize={[2048, 2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={4} shadow-camera-bottom={-3} />
      <directionalLight position={[-4, 3, -4]} intensity={0.9} color="#ffe7c2" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.73, 0]} receiveShadow><circleGeometry args={[12, 48]} /><meshStandardMaterial color="#7db85c" roughness={1} /></mesh>
      <Suspense fallback={null}>
        {focus === undefined ? LOOKS.map((look, i) => (
          <group key={look.name} position={[(i - 2) * 1.75, 0, 0]}>
            <Spin on={spin}><Avatar avatar={look.o} movingRef={moving} /></Spin>
          </group>
        )) : looks.map((look, i) => {
          const Side = i === 0 ? ProceduralStudentAvatar : StylisedStudentAvatar;
          return <group key={i} position={[(i - 0.5) * 1.9, 0, 0]} rotation={[0, i === 0 ? 0.25 : -0.25, 0]}><Spin on={spin}><Side avatar={look.o} movingRef={moving} /></Spin></group>;
        })}
      </Suspense>
      <OrbitControls target={[0, 0.4, 0]} minDistance={3} maxDistance={14} maxPolarAngle={Math.PI / 2 - 0.05} />
    </Canvas>
  );
}

export default function Page() {
  const [walking, setWalking] = useState(false);
  const [spin, setSpin] = useState(false);
  const [focus, setFocus] = useState<number | undefined>(undefined);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("look"); if (f !== null) queueMicrotask(() => setFocus(Number(f))); }, []);
  if (focus !== undefined) return (
    <main className="min-h-screen bg-[#0f1220] p-5 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-2xl font-black tracking-wide">{LOOKS[focus].name.toUpperCase()}: CURRENT (LEFT) vs NEXT (RIGHT)</h1>
        <div className="my-3 flex gap-2">
          {LOOKS.map((l, i) => <button key={l.name} className={`rounded-full px-4 py-2 text-sm font-bold ${i === focus ? "bg-white text-slate-900" : "bg-white/15"}`} onClick={() => setFocus(i)}>{l.name}</button>)}
          <button className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold" onClick={() => setWalking(!walking)}>{walking ? "Stop walking" : "Walk"}</button>
          <button className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold" onClick={() => setSpin(!spin)}>{spin ? "Stop turning" : "Turn around"}</button>
          <button className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold" onClick={() => setFocus(undefined)}>All five</button>
        </div>
        <div className="h-[80vh] min-h-[420px] overflow-hidden rounded-2xl"><Stage next walking={walking} spin={spin} focus={focus} /></div>
      </div>
    </main>
  );
  return (
    <main className="min-h-screen bg-[#0f1220] p-5 text-white">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-2xl font-black tracking-wide">AVATAR UPGRADE: CURRENT vs NEXT</h1>
        <p className="mt-1 text-sm text-slate-300">The same five outfits on the current body (top) and the upgraded body (bottom). Drag to rotate, scroll to zoom.</p>
        <div className="my-3 flex gap-2">
          <button className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-900" onClick={() => setWalking(!walking)}>{walking ? "Stop walking" : "Walk"}</button>
          <button className="rounded-full bg-white/15 px-5 py-2 text-sm font-bold" onClick={() => setSpin(!spin)}>{spin ? "Stop turning" : "Turn around"}</button>
        </div>
        <div className="flex justify-between px-6 text-xs font-bold text-slate-400">{LOOKS.map((l) => <span key={l.name}>{l.name}</span>)}</div>
        <p className="mt-2 text-xs font-black tracking-[0.2em] text-slate-400">CURRENT</p>
        <div className="h-[42vh] min-h-[300px] overflow-hidden rounded-2xl"><Stage next={false} walking={walking} spin={spin} /></div>
        <p className="mt-4 text-xs font-black tracking-[0.2em] text-[#83E300]">NEXT</p>
        <div className="h-[42vh] min-h-[300px] overflow-hidden rounded-2xl"><Stage next walking={walking} spin={spin} /></div>
      </div>
    </main>
  );
}
