"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  User, BookOpen, LayoutGrid, BarChart3, Zap,
} from "lucide-react";
import { readProgress } from "@/data/progress";
import {
  readProgramStore,
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
} from "@/lib/program-progress";

// ─── Scene constants ──────────────────────────────────────────────────────────

const ROAD_WIDTH = 8;
const ROAD_LENGTH = 115;

/** Camera Z position for each week. Week 1 = -95 (far), Week 12 = -14 (tower base). */
function weekToZ(week: number): number {
  return -95 + ((week - 1) / 11) * 81;
}

// ─── District zones ───────────────────────────────────────────────────────────

const DISTRICT_ZONES = [
  { id: "counting", name: "COUNTING DISTRICT", sub: "Weeks 1–3",  weekStart: 1,  weekEnd: 3,  z: -82, x: -15, y: 13, color: "#14b8a6" },
  { id: "bridge",   name: "NUMBER BRIDGE",     sub: "Weeks 4–6",  weekStart: 4,  weekEnd: 6,  z: -61, x:  15, y: 16, color: "#818cf8" },
  { id: "core",     name: "CALCULATION CORE",  sub: "Weeks 7–9",  weekStart: 7,  weekEnd: 9,  z: -41, x: -13, y: 19, color: "#f472b6" },
  { id: "mastery",  name: "MASTERY SECTOR",    sub: "Weeks 10–11",weekStart: 10, weekEnd: 11, z: -22, x:  13, y: 21, color: "#a78bfa" },
  { id: "tower",    name: "LEGEND TOWER",      sub: "Week 12",    weekStart: 12, weekEnd: 12, z:  -6, x:   0, y: 38, color: "#fbbf24" },
] as const;

// ─── Building generation ──────────────────────────────────────────────────────

function sr(n: number) { const x = Math.sin(n + 1) * 10000; return x - Math.floor(x); }

interface BldgData {
  pos: [number, number, number];
  size: [number, number, number];
  emissive: string;
  ei: number; // emissiveIntensity
}

const ZONE_EMISSIVES = ["#083040", "#1a0838", "#380818", "#0a1848"];

function genBuildings(): BldgData[] {
  const out: BldgData[] = [];
  for (let i = 0; i < 52; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const z = -8 - (i / 52) * (ROAD_LENGTH - 8);
    const xBase = ROAD_WIDTH / 2 + 1.8;
    const x = side * (xBase + sr(i * 11) * 9);
    const w = 2.2 + sr(i * 11 + 1) * 5;
    const h = 5 + sr(i * 11 + 2) * 38;
    const d = 3 + sr(i * 11 + 3) * 7;
    const zone = Math.min(3, Math.floor((-z - 8) / 26));
    out.push({ pos: [x, h / 2, z], size: [w, h, d], emissive: ZONE_EMISSIVES[zone], ei: 0.3 + sr(i * 11 + 4) * 0.7 });
  }
  return out;
}
const BUILDINGS = genBuildings();

// ─── 3D Components ────────────────────────────────────────────────────────────

function CameraRig({ targetZ, viewWeek }: { targetZ: number; viewWeek: number }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (0 - camera.position.x) * 0.06;
    camera.position.y += (2.6 - camera.position.y) * 0.06;
    camera.position.z += (targetZ - camera.position.z) * 0.07;
    const t = (viewWeek - 1) / 11;
    camera.lookAt(0, 4 + t * 24, 0);
  });
  return null;
}

function Road() {
  return (
    <group>
      {/* Road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROAD_LENGTH / 2 - 4]}>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH + 8]} />
        <meshStandardMaterial color="#040810" roughness={0.2} metalness={0.78} />
      </mesh>
      {/* Ground beyond road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, -ROAD_LENGTH / 2]}>
        <planeGeometry args={[350, ROAD_LENGTH + 30]} />
        <meshStandardMaterial color="#020406" roughness={1} />
      </mesh>
      {/* Centre dashes */}
      {Array.from({ length: 26 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -7 - i * 4.4]}>
          <planeGeometry args={[0.1, 2.2]} />
          <meshStandardMaterial color="#5eead4" emissive="#5eead4" emissiveIntensity={0.9} transparent opacity={0.45} />
        </mesh>
      ))}
      {/* Road edge glow lines */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ROAD_WIDTH / 2), 0.02, -ROAD_LENGTH / 2]}>
          <planeGeometry args={[0.14, ROAD_LENGTH]} />
          <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={2.5} />
        </mesh>
      ))}
      {/* Sidewalks */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ROAD_WIDTH / 2 + 3.5), -0.03, -ROAD_LENGTH / 2]}>
          <planeGeometry args={[5.5, ROAD_LENGTH]} />
          <meshStandardMaterial color="#05080f" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Building({ pos, size, emissive, ei }: BldgData) {
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#030508" emissive={emissive} emissiveIntensity={ei * 0.45} roughness={0.35} metalness={0.7} />
      </mesh>
      {/* Roof glow cap */}
      <mesh position={[0, size[1] / 2 + 0.07, 0]}>
        <boxGeometry args={[size[0] + 0.18, 0.1, size[2] + 0.18]} />
        <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={ei * 5.5} />
      </mesh>
      {/* Front vertical edge strips */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * (size[0] / 2 + 0.01), 0, size[2] / 2 + 0.04]}>
          <boxGeometry args={[0.07, size[1], 0.07]} />
          <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={ei * 3} />
        </mesh>
      ))}
    </group>
  );
}

function StreetLight({ x, z, color }: { x: number; z: number; color: string }) {
  const toRoad = x > 0 ? -1 : 1;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.065, 0.09, 7.6, 6]} />
        <meshStandardMaterial color="#0d1828" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[toRoad * 0.65, 7.1, 0]} rotation={[0, 0, toRoad * -0.28]}>
        <cylinderGeometry args={[0.04, 0.04, 1.3, 6]} />
        <meshStandardMaterial color="#0d1828" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[toRoad * 1.25, 7.2, 0]}>
        <boxGeometry args={[0.42, 0.18, 0.36]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4.5} />
      </mesh>
      <pointLight position={[toRoad * 1.25, 7, 0]} color={color} intensity={7} distance={14} />
    </group>
  );
}

function LegendTower({ unlocked }: { unlocked: boolean }) {
  const spireRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (spireRef.current) {
      (spireRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        unlocked ? 2.2 + Math.sin(t * 2.2) * 0.9 : 0.22 + Math.sin(t * 0.6) * 0.06;
    }
    if (ringsRef.current) ringsRef.current.rotation.y = t * 0.18;
  });

  const gold = unlocked;
  const prim  = gold ? "#fbbf24" : "#1c1100";
  const emit  = gold ? "#f59e0b" : "#2a1900";
  const rim   = gold ? "#fde68a" : "#3d2500";

  return (
    <group position={[0, 0, 4]}>
      {/* Tiered base */}
      {([
        [13, 1,  0.5],
        [10, 2,  1.5],
        [7.5, 3, 3.5],
        [5.5, 3, 6],
      ] as [number, number, number][]).map(([r, h, y], i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[r - 0.5, r, h, 8]} />
          <meshStandardMaterial color="#050408" emissive={emit} emissiveIntensity={0.12 + i * 0.06} metalness={0.92} roughness={0.12} />
        </mesh>
      ))}

      {/* Main shaft */}
      <mesh position={[0, 38, 0]}>
        <boxGeometry args={[5.5, 64, 5.5]} />
        <meshStandardMaterial color="#040308" emissive={emit} emissiveIntensity={0.38} roughness={0.12} metalness={0.92} />
      </mesh>

      {/* Corner buttresses */}
      {([[-3.8, -3.8], [3.8, -3.8], [-3.8, 3.8], [3.8, 3.8]] as [number, number][]).map(([ox, oz], i) => (
        <mesh key={i} position={[ox, 28, oz]}>
          <boxGeometry args={[1.1, 44, 1.1]} />
          <meshStandardMaterial color="#040308" emissive={emit} emissiveIntensity={0.3} metalness={0.9} roughness={0.18} />
        </mesh>
      ))}

      {/* Rotating rings */}
      <group ref={ringsRef}>
        {[14, 28, 42, 56].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[4.5, 0.13, 8, 32]} />
            <meshStandardMaterial color={rim} emissive={prim} emissiveIntensity={gold ? 6 : 0.4} />
          </mesh>
        ))}
      </group>

      {/* Spire */}
      <mesh ref={spireRef} position={[0, 72, 0]}>
        <coneGeometry args={[2.2, 14, 8]} />
        <meshStandardMaterial color={prim} emissive={prim} emissiveIntensity={gold ? 2.2 : 0.22} metalness={0.96} />
      </mesh>

      {/* Apex beacon */}
      <mesh position={[0, 79.5, 0]}>
        <sphereGeometry args={[0.7, 10, 10]} />
        <meshStandardMaterial color={rim} emissive={rim} emissiveIntensity={gold ? 9 : 0.35} />
      </mesh>

      <pointLight position={[0, 80, 0]}  color={prim} intensity={gold ? 100 : 6}  distance={220} />
      <pointLight position={[0, 38, 0]}  color={emit} intensity={gold ? 30 : 4}   distance={90}  />
      <pointLight position={[0, 6, 0]}   color={emit} intensity={gold ? 12 : 1.5} distance={45}  />
    </group>
  );
}

type ZoneState = "complete" | "current" | "locked";

function ZoneLabel({
  zone, state, cameraZ, onTap,
}: {
  zone: (typeof DISTRICT_ZONES)[number];
  state: ZoneState;
  cameraZ: number;
  onTap: () => void;
}) {
  const dist = Math.abs(cameraZ - zone.z);
  if (dist > 42) return null;
  const opacity = Math.max(0, Math.min(1, 1 - dist / 42));

  const cfg = {
    complete: { border: "1.5px solid #14b8a6", bg: "rgba(5,34,30,0.92)", title: "#5eead4", badge: "COMPLETE", badgeBg: "rgba(20,184,166,0.18)", badgeClr: "#14b8a6", glow: "0 0 22px rgba(20,184,166,0.3)", cursor: "pointer" },
    current:  { border: `2px solid ${zone.color}`, bg: "rgba(4,10,22,0.95)", title: "#fff", badge: "ENTER →", badgeBg: `${zone.color}28`, badgeClr: zone.color, glow: `0 0 32px ${zone.color}44`, cursor: "pointer" },
    locked:   { border: "1px solid rgba(70,80,110,0.3)", bg: "rgba(5,7,14,0.75)", title: "rgba(90,100,130,0.55)", badge: "LOCKED", badgeBg: "rgba(25,30,45,0.4)", badgeClr: "rgba(90,100,130,0.45)", glow: "none", cursor: "default" },
  }[state];

  return (
    <Html position={[zone.x, zone.y, zone.z]} center>
      <div
        onClick={state !== "locked" ? onTap : undefined}
        style={{
          opacity, transition: "opacity 0.35s ease",
          padding: "11px 17px", borderRadius: "13px",
          border: cfg.border, background: cfg.bg,
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          textAlign: "center", minWidth: "148px",
          cursor: cfg.cursor, boxShadow: cfg.glow,
          userSelect: "none", WebkitUserSelect: "none",
          transform: "translateZ(0)",
        }}
      >
        <div style={{ color: cfg.title, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace", marginBottom: 3, textShadow: state === "current" ? `0 0 14px ${zone.color}` : "none" }}>
          {zone.name}
        </div>
        <div style={{ color: cfg.title, fontSize: 9, opacity: 0.62, letterSpacing: "0.12em", fontFamily: "ui-monospace,monospace", marginBottom: 8 }}>
          {zone.sub}
        </div>
        <div style={{ display: "inline-block", padding: "3px 11px", borderRadius: 7, background: cfg.badgeBg, border: cfg.border, color: cfg.badgeClr, fontSize: 8, fontWeight: 700, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>
          {cfg.badge}
        </div>
      </div>
    </Html>
  );
}

function Scene({
  currentWeek, viewWeek, completedByWeek, onDistrictTap,
}: {
  currentWeek: number; viewWeek: number;
  completedByWeek: Record<number, boolean>;
  onDistrictTap: (weekStart: number, weekEnd: number) => void;
}) {
  const cameraZ = weekToZ(viewWeek);

  function zoneState(zone: (typeof DISTRICT_ZONES)[number]): ZoneState {
    const weeks = Array.from({ length: zone.weekEnd - zone.weekStart + 1 }, (_, i) => zone.weekStart + i);
    if (weeks.every((w) => completedByWeek[w])) return "complete";
    if (currentWeek >= zone.weekStart) return "current";
    return "locked";
  }

  const streetColors = ["#14b8a6", "#818cf8", "#f472b6", "#a78bfa"];

  return (
    <>
      <fog attach="fog" args={["#020810", 10, 88]} />
      <ambientLight color="#060f28" intensity={0.65} />
      <directionalLight color="#1a3a9c" position={[18, 45, 10]} intensity={0.65} />
      <Stars radius={95} depth={55} count={5500} factor={3.8} saturation={0} fade speed={0.35} />

      <Road />

      {BUILDINGS.map((b, i) => <Building key={i} {...b} />)}

      {/* Street lights along both sides */}
      {Array.from({ length: 13 }).map((_, i) => {
        const z = -10 - i * 8;
        const c = streetColors[Math.min(3, Math.floor((-z - 10) / 26))];
        return (
          <group key={i}>
            <StreetLight x={-(ROAD_WIDTH / 2 + 1.2)} z={z}      color={c} />
            <StreetLight x={ ROAD_WIDTH / 2 + 1.2}  z={z - 4}   color={c} />
          </group>
        );
      })}

      {/* Atmospheric zone lights along road */}
      <pointLight position={[0,  0.4, -85]} color="#14b8a6" intensity={7}  distance={22} />
      <pointLight position={[-9, 3,   -64]} color="#818cf8" intensity={6}  distance={20} />
      <pointLight position={[9,  3,   -43]} color="#f472b6" intensity={6}  distance={20} />
      <pointLight position={[-8, 3,   -24]} color="#a78bfa" intensity={5}  distance={18} />
      <pointLight position={[0,  0.4, -12]} color="#fbbf24" intensity={10} distance={28} />

      <LegendTower unlocked={completedByWeek[12] ?? false} />

      {DISTRICT_ZONES.map((zone) => (
        <ZoneLabel
          key={zone.id}
          zone={zone}
          state={zoneState(zone)}
          cameraZ={cameraZ}
          onTap={() => onDistrictTap(zone.weekStart, zone.weekEnd)}
        />
      ))}

      <CameraRig targetZ={cameraZ} viewWeek={viewWeek} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.22} luminanceSmoothing={0.88} intensity={1.55} levels={6} />
      </EffectComposer>
    </>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────

export default function NumberNexusMap() {
  const router = useRouter();
  const [progress] = useState(() => readProgress());
  const [store]    = useState(() => readProgramStore());
  const [bestChain, setBestChain] = useState(0);

  useEffect(() => {
    try { setBestChain(Number(localStorage.getItem("lul_best_nexus_chain_v1") ?? 0)); } catch { /* ignore */ }
  }, []);

  const year     = progress?.year ?? "Year 1";
  const isPrep   = year === "Prep";
  const levelNum = isPrep ? 0 : parseInt(year.replace(/\D/g, ""), 10) || 1;
  const levelLabel = isPrep ? "PREP" : `LV ${levelNum}`;

  const currentWeek = getRecommendedAssignedWeek(store, year, progress?.assignedWeek, progress?.requiredWeeks);
  const [viewWeek, setViewWeek] = useState(currentWeek);

  const completedByWeek = useMemo(() => {
    const m: Record<number, boolean> = {};
    for (let w = 1; w <= 12; w++) m[w] = isWeekComplete(getWeekProgress(store, year, w));
    return m;
  }, [store, year]);

  const highestDone = useMemo(() =>
    Math.max(0, ...Object.entries(completedByWeek).filter(([, v]) => v).map(([k]) => Number(k))),
    [completedByWeek]);

  const totalXP = useMemo(() => {
    let xp = 0;
    for (let w = 1; w <= 12; w++) {
      const wp = getWeekProgress(store, year, w);
      xp += wp.lessonsCompleted.filter(Boolean).length * 40;
      if (wp.quizScore !== undefined) xp += Math.round((wp.quizScore / 100) * 60);
    }
    return xp;
  }, [store, year]);

  function onDistrictTap(weekStart: number, weekEnd: number) {
    for (let w = weekStart; w <= weekEnd; w++) {
      if (!completedByWeek[w]) { router.push(`/program?year=${encodeURIComponent(year)}&week=${w}`); return; }
    }
    router.push(`/program?year=${encodeURIComponent(year)}&week=${weekEnd}`);
  }

  const canBack    = viewWeek > 1;
  const canForward = viewWeek < 12 && viewWeek <= currentWeek + 1;

  // Current district label for bottom strip
  const currentZone = DISTRICT_ZONES.find((z) => viewWeek >= z.weekStart && viewWeek <= z.weekEnd);

  // HUD button styles helper
  const hudBtn: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "10px 10px", borderRadius: 12, cursor: "pointer",
    background: "rgba(3,12,24,0.88)", border: "1px solid rgba(94,234,212,0.18)",
    backdropFilter: "blur(10px)", minWidth: 52,
    boxShadow: "0 0 12px rgba(94,234,212,0.05), 0 4px 16px rgba(0,0,0,0.5)",
    transition: "transform 0.15s ease",
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#020810", overflow: "hidden" }}>

      {/* ── 3D Canvas ──────────────────────────────────────────────── */}
      <Canvas
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 2.6, weekToZ(currentWeek)], fov: 72, near: 0.1, far: 220 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene
          currentWeek={currentWeek}
          viewWeek={viewWeek}
          completedByWeek={completedByWeek}
          onDistrictTap={onDistrictTap}
        />
      </Canvas>

      {/* ── HUD overlay ────────────────────────────────────────────── */}

      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        background: "rgba(2,8,18,0.78)", borderBottom: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(14px)",
      }}>
        <button
          onClick={() => router.push(`/realms?level=${encodeURIComponent(year)}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 999, cursor: "pointer", background: "rgba(15,118,110,0.22)", border: "1px solid rgba(94,234,212,0.22)", color: "rgba(167,243,208,0.9)", fontSize: 12, fontWeight: 700 }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ padding: "5px 13px", borderRadius: 999, background: "rgba(15,118,110,0.18)", border: "1px solid rgba(94,234,212,0.18)" }}>
          <span style={{ color: "#5eead4", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>⚡ NUMBER NEXUS</span>
        </div>

        <div style={{ padding: "5px 10px", borderRadius: 999, background: "rgba(94,234,212,0.07)", border: "1px solid rgba(94,234,212,0.14)" }}>
          <span style={{ color: "#2dd4bf", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>{levelLabel}</span>
        </div>

        <div style={{ flex: 1 }} />

        {/* XP */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, background: "rgba(15,118,110,0.14)", border: "1px solid rgba(94,234,212,0.12)" }}>
          <Zap size={11} color="#14b8a6" />
          <span style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{totalXP} XP</span>
        </div>

        {/* Weeks */}
        <div style={{ padding: "5px 11px", borderRadius: 999, background: "rgba(15,118,110,0.14)", border: "1px solid rgba(94,234,212,0.12)" }}>
          <span style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{highestDone}/12</span>
        </div>

        {/* Profile */}
        <button
          onClick={() => router.push("/profile")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", background: "rgba(15,118,110,0.28)", border: "1px solid rgba(94,234,212,0.28)" }}
          aria-label="Profile"
        >
          <User size={16} color="#5eead4" />
        </button>
      </div>

      {/* Right-side HUD */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { Icon: BookOpen, label: "LEGENDS", route: "/legends" },
          { Icon: LayoutGrid, label: "LEVELS",  route: "/levels"  },
          { Icon: BarChart3, label: "STATS",   route: "/realm-stats" },
        ].map(({ Icon, label, route }) => (
          <button key={label} onClick={() => router.push(route)} style={hudBtn}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "rgba(15,118,110,0.22)" }}>
              <Icon size={16} color="#14b8a6" />
            </div>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(94,234,212,0.7)", fontFamily: "ui-monospace,monospace" }}>{label}</span>
          </button>
        ))}
        {bestChain > 0 && (
          <div style={{ ...hudBtn, cursor: "default" }}>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(94,234,212,0.5)", fontFamily: "ui-monospace,monospace", lineHeight: 1.2, textAlign: "center" }}>BEST{"\n"}CHAIN</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#5eead4", lineHeight: 1 }}>{bestChain}</span>
            <span style={{ fontSize: 9, color: "#fbbf24" }}>⚡</span>
          </div>
        )}
      </div>

      {/* Bottom navigation — week step arrows + current zone label */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        background: "rgba(2,8,18,0.8)", borderTop: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(14px)",
      }}>
        {/* Prev step */}
        <button
          onClick={() => canBack && setViewWeek((v) => v - 1)}
          disabled={!canBack}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 999, cursor: canBack ? "pointer" : "default", background: canBack ? "rgba(15,118,110,0.25)" : "rgba(15,30,40,0.2)", border: `1px solid ${canBack ? "rgba(94,234,212,0.25)" : "rgba(94,234,212,0.08)"}`, color: canBack ? "#5eead4" : "rgba(94,234,212,0.25)", fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}
        >
          <ChevronLeft size={15} /> Prev
        </button>

        {/* Current zone info */}
        <div style={{ textAlign: "center" }}>
          {currentZone && (
            <>
              <div style={{ color: currentZone.color, fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace", textShadow: `0 0 10px ${currentZone.color}` }}>
                {currentZone.name}
              </div>
              <div style={{ color: "rgba(148,163,184,0.6)", fontSize: 9, letterSpacing: "0.12em", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
                WEEK {viewWeek} · {currentZone.sub}
              </div>
            </>
          )}
        </div>

        {/* Next step */}
        <button
          onClick={() => canForward && setViewWeek((v) => v + 1)}
          disabled={!canForward}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 999, cursor: canForward ? "pointer" : "default", background: canForward ? "rgba(15,118,110,0.25)" : "rgba(15,30,40,0.2)", border: `1px solid ${canForward ? "rgba(94,234,212,0.25)" : "rgba(94,234,212,0.08)"}`, color: canForward ? "#5eead4" : "rgba(94,234,212,0.25)", fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
