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

// ─── Scene constants ───────────────────────────────────────────────────────────

const ROAD_WIDTH   = 14;   // Wide boulevard
const ROAD_LENGTH  = 130;
const FOG_NEAR     = 35;   // Open — city feels vast
const FOG_FAR      = 185;

function weekToZ(week: number): number {
  return -100 + ((week - 1) / 11) * 85;
}
// Week 1 → -100 (far),  Week 12 → -15 (tower base)

// ─── District zones ────────────────────────────────────────────────────────────

const DISTRICT_ZONES = [
  { id: "counting", name: "COUNTING DISTRICT", sub: "Weeks 1–3",  weekStart: 1,  weekEnd: 3,  z: -88, x: -20, y: 20, color: "#14b8a6" },
  { id: "bridge",   name: "NUMBER BRIDGE",     sub: "Weeks 4–6",  weekStart: 4,  weekEnd: 6,  z: -66, x:  20, y: 22, color: "#818cf8" },
  { id: "core",     name: "CALCULATION CORE",  sub: "Weeks 7–9",  weekStart: 7,  weekEnd: 9,  z: -46, x: -18, y: 25, color: "#f472b6" },
  { id: "mastery",  name: "MASTERY SECTOR",    sub: "Weeks 10–11",weekStart: 10, weekEnd: 11, z: -26, x:  18, y: 28, color: "#a78bfa" },
  { id: "tower",    name: "LEGEND TOWER",      sub: "Week 12",    weekStart: 12, weekEnd: 12, z:  -8, x:   0, y: 55, color: "#fbbf24" },
] as const;

// ─── Building generation (two layers: foreground + skyline) ───────────────────

function sr(n: number) { const x = Math.sin(n + 1) * 10000; return x - Math.floor(x); }

interface BldgData {
  pos: [number, number, number];
  size: [number, number, number];
  emissive: string;
  ei: number;
  windows: boolean;
  antenna: boolean;
}

const ZONE_EMIT = [
  "#083840", // teal    — Counting District
  "#1a0848", // indigo  — Number Bridge
  "#380830", // magenta — Calculation Core
  "#101848", // blue    — Mastery Sector
];

function zoneEmit(z: number) {
  const idx = Math.min(3, Math.floor((-z - 8) / 24));
  return ZONE_EMIT[idx];
}

function genBuildings(): BldgData[] {
  const out: BldgData[] = [];

  // Foreground row — close to road, medium height so tower stays visible
  for (let i = 0; i < 30; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const z    = -12 - (i / 30) * (ROAD_LENGTH - 20);
    const x    = side * (ROAD_WIDTH / 2 + 4 + sr(i * 7) * 4);   // 11–15 from centre
    const w    = 3 + sr(i * 7 + 1) * 5;
    const h    = 12 + sr(i * 7 + 2) * 22;    // 12–34 — capped so tower shows
    const d    = 3.5 + sr(i * 7 + 3) * 5;
    out.push({ pos: [x, h / 2, z], size: [w, h, d], emissive: zoneEmit(z), ei: 0.45 + sr(i * 7 + 4) * 0.55, windows: true, antenna: h > 28 });
  }

  // Skyline layer — further back, can be very tall (appear above horizon)
  for (let i = 0; i < 30; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const z    = -18 - (i / 30) * (ROAD_LENGTH - 22);
    const x    = side * (ROAD_WIDTH / 2 + 12 + sr(i * 13) * 12);  // 19–31 from centre
    const w    = 5 + sr(i * 13 + 1) * 9;
    const h    = 28 + sr(i * 13 + 2) * 50;    // 28–78 — visible skyline
    const d    = 5 + sr(i * 13 + 3) * 9;
    out.push({ pos: [x, h / 2, z], size: [w, h, d], emissive: zoneEmit(z), ei: 0.25 + sr(i * 13 + 4) * 0.35, windows: true, antenna: h > 50 });
  }

  return out;
}

const BUILDINGS = genBuildings();

// ─── 3D Components ────────────────────────────────────────────────────────────

// Camera sits 18 units behind character, 11 units up — over-the-shoulder cinematic
function CameraRig({ charZ }: { charZ: number }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.x += (0 - camera.position.x) * 0.06;
    camera.position.y += (11 - camera.position.y) * 0.06;
    camera.position.z += ((charZ - 18) - camera.position.z) * 0.06;
    camera.lookAt(0, 2.5, charZ);
  });
  return null;
}

function Road() {
  return (
    <group>
      {/* Main boulevard — reflective dark surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROAD_LENGTH / 2 - 5]}>
        <planeGeometry args={[ROAD_WIDTH, ROAD_LENGTH + 10]} />
        <meshStandardMaterial color="#030810" roughness={0.06} metalness={0.92} />
      </mesh>

      {/* Wide ground plane each side */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -ROAD_LENGTH / 2]}>
        <planeGeometry args={[400, ROAD_LENGTH + 40]} />
        <meshStandardMaterial color="#020408" roughness={0.95} />
      </mesh>

      {/* Sidewalks */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ROAD_WIDTH / 2 + 5), -0.04, -ROAD_LENGTH / 2]}>
          <planeGeometry args={[8, ROAD_LENGTH]} />
          <meshStandardMaterial color="#04070e" roughness={0.85} />
        </mesh>
      ))}

      {/* Teal edge glow lines */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ROAD_WIDTH / 2), 0.02, -ROAD_LENGTH / 2]}>
          <planeGeometry args={[0.18, ROAD_LENGTH]} />
          <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={3} />
        </mesh>
      ))}

      {/* Outer sidewalk edge trim */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * (ROAD_WIDTH / 2 + 9.2), 0.01, -ROAD_LENGTH / 2]}>
          <planeGeometry args={[0.12, ROAD_LENGTH]} />
          <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={1.2} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Centre dashes */}
      {Array.from({ length: 28 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -8 - i * 4.6]}>
          <planeGeometry args={[0.12, 2.5]} />
          <meshStandardMaterial color="#5eead4" emissive="#5eead4" emissiveIntensity={1.1} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Ground teal bloom puddles (coloured road reflections) */}
      {[[-80, "#14b8a6"], [-60, "#818cf8"], [-40, "#f472b6"], [-22, "#a78bfa"], [-10, "#fbbf24"]].map(([z, c]) => (
        <mesh key={z as number} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z as number]}>
          <planeGeometry args={[ROAD_WIDTH - 1, 18]} />
          <meshStandardMaterial color={c as string} emissive={c as string} emissiveIntensity={0.18} transparent opacity={0.12} />
        </mesh>
      ))}
    </group>
  );
}

function Building({ pos, size, emissive, ei, windows, antenna }: BldgData) {
  const floorCount = Math.floor(size[1] / 4.5);

  return (
    <group position={pos}>
      {/* Main body */}
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#030508" emissive={emissive} emissiveIntensity={ei * 0.4} roughness={0.3} metalness={0.72} />
      </mesh>

      {/* Glowing roof cap */}
      <mesh position={[0, size[1] / 2 + 0.08, 0]}>
        <boxGeometry args={[size[0] + 0.22, 0.12, size[2] + 0.22]} />
        <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={ei * 6} />
      </mesh>

      {/* Vertical corner strips (front face) */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * (size[0] / 2 + 0.02), 0, size[2] / 2 + 0.05]}>
          <boxGeometry args={[0.07, size[1], 0.07]} />
          <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={ei * 3.5} />
        </mesh>
      ))}

      {/* Horizontal window-floor strips */}
      {windows && Array.from({ length: Math.min(floorCount, 7) }).map((_, i) => (
        <mesh key={i} position={[0, -size[1] / 2 + 2.5 + i * (size[1] / Math.max(floorCount, 1)), size[2] / 2 + 0.04]}>
          <boxGeometry args={[size[0] - 0.4, 0.22, 0.06]} />
          <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={ei * 2.5} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* Antenna for tall buildings */}
      {antenna && (
        <>
          <mesh position={[0, size[1] / 2 + 1.8, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 3.6, 6]} />
            <meshStandardMaterial color="#0d1828" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, size[1] / 2 + 3.8, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color={emissive} emissive={emissive} emissiveIntensity={ei * 8} />
          </mesh>
          <pointLight position={[0, size[1] / 2 + 3.9, 0]} color={emissive} intensity={3} distance={12} />
        </>
      )}
    </group>
  );
}

function StreetLight({ x, z, color }: { x: number; z: number; color: string }) {
  const toRoad = x > 0 ? -1 : 1;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 9, 6]} />
        <meshStandardMaterial color="#0a1428" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[toRoad * 0.8, 8.6, 0]} rotation={[0, 0, toRoad * -0.22]}>
        <cylinderGeometry args={[0.045, 0.045, 1.6, 6]} />
        <meshStandardMaterial color="#0a1428" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[toRoad * 1.6, 8.8, 0]}>
        <boxGeometry args={[0.5, 0.2, 0.4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
      </mesh>
      <pointLight position={[toRoad * 1.6, 8.5, 0]} color={color} intensity={9} distance={18} />
    </group>
  );
}

function LegendTower({ unlocked }: { unlocked: boolean }) {
  const spireRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const beamsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (spireRef.current) {
      (spireRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        unlocked ? 2.8 + Math.sin(t * 2) * 1.0 : 0.28 + Math.sin(t * 0.7) * 0.08;
    }
    if (ringsRef.current) ringsRef.current.rotation.y = t * 0.15;
    if (beamsRef.current) beamsRef.current.rotation.y = t * 0.06;
  });

  const g = unlocked;
  const p = g ? "#fbbf24" : "#1a1000";
  const e = g ? "#f59e0b" : "#261600";
  const r = g ? "#fde68a" : "#3a2200";

  return (
    <group position={[0, 0, 6]}>
      {/* Massive plaza base */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[18, 20, 1, 8]} />
        <meshStandardMaterial color="#060408" emissive={e} emissiveIntensity={0.18} metalness={0.94} roughness={0.1} />
      </mesh>
      {/* Plaza teal glow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.05, 0]}>
        <ringGeometry args={[15, 18, 32]} />
        <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={g ? 2 : 0.5} transparent opacity={0.6} />
      </mesh>

      {/* Tiered podium */}
      {([[13, 2, 1.8], [9.5, 3, 3.5], [7, 3.5, 6.2]] as [number, number, number][]).map(([rad, h, y], i) => (
        <mesh key={i} position={[0, y, 0]}>
          <cylinderGeometry args={[rad - 0.8, rad, h, 8]} />
          <meshStandardMaterial color="#050408" emissive={e} emissiveIntensity={0.14 + i * 0.07} metalness={0.94} roughness={0.12} />
        </mesh>
      ))}

      {/* Main shaft */}
      <mesh position={[0, 45, 0]}>
        <boxGeometry args={[6, 78, 6]} />
        <meshStandardMaterial color="#040308" emissive={e} emissiveIntensity={0.4} roughness={0.1} metalness={0.94} />
      </mesh>

      {/* Facade window strips on tower */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 12 + i * 10, 3.06]}>
          <boxGeometry args={[5, 0.35, 0.1]} />
          <meshStandardMaterial color={r} emissive={p} emissiveIntensity={g ? 3 : 0.3} transparent opacity={0.8} />
        </mesh>
      ))}

      {/* Four corner buttresses */}
      {([[-4.2, -4.2], [4.2, -4.2], [-4.2, 4.2], [4.2, 4.2]] as [number, number][]).map(([ox, oz], i) => (
        <mesh key={i} position={[ox, 32, oz]}>
          <boxGeometry args={[1.3, 52, 1.3]} />
          <meshStandardMaterial color="#040308" emissive={e} emissiveIntensity={0.32} metalness={0.92} roughness={0.18} />
        </mesh>
      ))}

      {/* Rotating rings */}
      <group ref={ringsRef}>
        {[18, 32, 48, 64].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[5.5, 0.15, 8, 36]} />
            <meshStandardMaterial color={r} emissive={p} emissiveIntensity={g ? 7 : 0.45} />
          </mesh>
        ))}
      </group>

      {/* Light beam shafts (very tall thin cylinders) */}
      {g && (
        <group ref={beamsRef} position={[0, 0, 0]}>
          {([[-2.5, 0], [2.5, 0], [0, -2.5], [0, 2.5]] as [number, number][]).map(([ox, oz], i) => (
            <mesh key={i} position={[ox, 100, oz]}>
              <cylinderGeometry args={[0.08, 0.3, 160, 6]} />
              <meshStandardMaterial color={p} emissive={p} emissiveIntensity={2.5} transparent opacity={0.18} />
            </mesh>
          ))}
        </group>
      )}

      {/* Spire */}
      <mesh ref={spireRef} position={[0, 86, 0]}>
        <coneGeometry args={[2.5, 18, 8]} />
        <meshStandardMaterial color={p} emissive={p} emissiveIntensity={g ? 2.8 : 0.28} metalness={0.96} />
      </mesh>

      {/* Apex beacon */}
      <mesh position={[0, 95.5, 0]}>
        <sphereGeometry args={[0.85, 12, 12]} />
        <meshStandardMaterial color={r} emissive={r} emissiveIntensity={g ? 11 : 0.35} />
      </mesh>

      {/* Lights */}
      <pointLight position={[0, 96, 0]}  color={p} intensity={g ? 140 : 8}  distance={260} />
      <pointLight position={[0, 45, 0]}  color={e} intensity={g ? 35  : 5}  distance={100} />
      <pointLight position={[0, 10, 0]}  color={e} intensity={g ? 14  : 2}  distance={50}  />
      <pointLight position={[0,  1, 0]}  color="#14b8a6" intensity={g ? 10 : 3} distance={35} />
    </group>
  );
}

// ─── Player character ─────────────────────────────────────────────────────────
// Simple stylised blocky character facing the tower (away from camera)
function PlayerCharacter({ z, gender }: { z: number; gender: "boy" | "girl" }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.4) * 0.06;
    }
  });

  const skin     = "#c8825a";
  const hair     = gender === "girl" ? "#3d1f06" : "#110a04";
  const jacket   = "#0f2d5e";
  const jacketE  = "#061828";
  const pants    = "#0d1520";
  const shoe     = "#090c12";
  const pack     = "#0a3055";
  const packE    = "#051a30";
  const teal     = "#14b8a6";

  // rotation={[0, Math.PI, 0]} faces character toward +z (toward tower)
  return (
    <group ref={groupRef} position={[0, 0, z]} rotation={[0, Math.PI, 0]}>
      {/* Legs */}
      {([-0.16, 0.16] as const).map((ox, i) => (
        <group key={i}>
          <mesh position={[ox, 0.47, 0]}>
            <boxGeometry args={[0.22, 0.6, 0.22]} />
            <meshStandardMaterial color={pants} roughness={0.75} />
          </mesh>
          <mesh position={[ox, 0.1, 0.04]}>
            <boxGeometry args={[0.23, 0.28, 0.3]} />
            <meshStandardMaterial color={shoe} roughness={0.8} metalness={0.12} />
          </mesh>
        </group>
      ))}

      {/* Body / jacket */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.6, 0.72, 0.32]} />
        <meshStandardMaterial color={jacket} emissive={jacketE} emissiveIntensity={0.5} roughness={0.55} metalness={0.15} />
      </mesh>

      {/* Glowing shoulder trim */}
      <mesh position={[0, 1.48, 0]}>
        <boxGeometry args={[0.64, 0.07, 0.36]} />
        <meshStandardMaterial color={teal} emissive={teal} emissiveIntensity={2.2} />
      </mesh>

      {/* Arms */}
      {([-0.4, 0.4] as const).map((ox, i) => (
        <mesh key={i} position={[ox, 1.08, 0]}>
          <boxGeometry args={[0.17, 0.6, 0.2]} />
          <meshStandardMaterial color={jacket} emissive={jacketE} emissiveIntensity={0.35} roughness={0.6} metalness={0.1} />
        </mesh>
      ))}

      {/* Backpack — on the back (+z local = -z world after π rotation = facing camera) */}
      <mesh position={[0, 1.08, 0.26]}>
        <boxGeometry args={[0.38, 0.52, 0.2]} />
        <meshStandardMaterial color={pack} emissive={packE} emissiveIntensity={0.35} roughness={0.6} />
      </mesh>
      {/* Backpack teal accent stripe */}
      <mesh position={[0, 1.22, 0.37]}>
        <boxGeometry args={[0.36, 0.06, 0.02]} />
        <meshStandardMaterial color={teal} emissive={teal} emissiveIntensity={3.8} />
      </mesh>
      {/* Backpack emblem glow */}
      <mesh position={[0, 1.08, 0.37]}>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshStandardMaterial color={teal} emissive={teal} emissiveIntensity={2.8} transparent opacity={0.9} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.58, 0]}>
        <boxGeometry args={[0.17, 0.14, 0.17]} />
        <meshStandardMaterial color={skin} roughness={0.8} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.86, 0]}>
        <boxGeometry args={[0.44, 0.46, 0.42]} />
        <meshStandardMaterial color={skin} roughness={0.78} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 2.1, 0]}>
        <boxGeometry args={[0.48, 0.14, 0.46]} />
        <meshStandardMaterial color={hair} roughness={0.88} />
      </mesh>
      {gender === "girl" && (
        <>
          <mesh position={[-0.25, 1.78, 0]}>
            <boxGeometry args={[0.06, 0.44, 0.4]} />
            <meshStandardMaterial color={hair} roughness={0.88} />
          </mesh>
          <mesh position={[0.25, 1.78, 0]}>
            <boxGeometry args={[0.06, 0.44, 0.4]} />
            <meshStandardMaterial color={hair} roughness={0.88} />
          </mesh>
        </>
      )}

      {/* Backpack ambient glow — visible from behind */}
      <pointLight position={[0, 1.2, 0.5]} color={teal} intensity={4} distance={4.5} />
    </group>
  );
}

// Floating data particles — teal motes drifting upward
function DataParticles() {
  const COUNT = 280;
  const positions = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     = (sr(i * 3) - 0.5) * 70;
      arr[i * 3 + 1] = sr(i * 3 + 1) * 50;
      arr[i * 3 + 2] = -12 - sr(i * 3 + 2) * 100;
    }
    return arr;
  }, []);
  const speeds = useMemo(() => Array.from({ length: COUNT }, (_, i) => 0.015 + sr(i * 17) * 0.04), []);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame(() => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      const y = attr.getY(i) + speeds[i];
      attr.setY(i, y > 55 ? 0 : y);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#14b8a6" size={0.14} transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

// Holographic district billboard sign on a building face
function Billboard({
  zone, state, cameraZ, onTap,
}: {
  zone: (typeof DISTRICT_ZONES)[number];
  state: "complete" | "current" | "locked";
  cameraZ: number;
  onTap: () => void;
}) {
  const dist = Math.abs(cameraZ - zone.z);
  if (dist > 55) return null;
  const opacity = Math.max(0, Math.min(1, 1 - dist / 55));
  // Scale label up when student is close but not right on top
  const scale = dist < 10 ? Math.max(0.6, dist / 10) : 1;

  const cfg = {
    complete: { border: `2px solid #14b8a6`, bg: "rgba(4,30,26,0.92)", title: "#5eead4",  badge: "✓ COMPLETE", bBg: "rgba(20,184,166,0.2)", bClr: "#14b8a6", glow: "0 0 28px rgba(20,184,166,0.45)", cur: "pointer" },
    current:  { border: `2.5px solid ${zone.color}`, bg: "rgba(3,8,20,0.96)", title: "#ffffff", badge: "▶ ENTER",   bBg: `${zone.color}28`, bClr: zone.color, glow: `0 0 36px ${zone.color}55`, cur: "pointer" },
    locked:   { border: "1px solid rgba(60,70,100,0.35)", bg: "rgba(4,6,14,0.78)", title: "rgba(80,90,120,0.55)", badge: "🔒 LOCKED", bBg: "rgba(20,25,40,0.4)", bClr: "rgba(80,90,120,0.45)", glow: "none", cur: "default" },
  }[state];

  return (
    <Html position={[zone.x, zone.y, zone.z]} center>
      <div
        onClick={state !== "locked" ? onTap : undefined}
        style={{
          opacity, transform: `scale(${scale})`, transition: "opacity 0.3s ease",
          padding: "14px 22px", borderRadius: 16,
          border: cfg.border, background: cfg.bg,
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          textAlign: "center", minWidth: 170, cursor: cfg.cur,
          boxShadow: cfg.glow, userSelect: "none", WebkitUserSelect: "none",
          transformOrigin: "center center",
        }}
      >
        {/* Header bar */}
        <div style={{ width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${zone.color}, transparent)`, marginBottom: 10, borderRadius: 1 }} />
        <div style={{ color: cfg.title, fontSize: 13, fontWeight: 900, letterSpacing: "0.22em", fontFamily: "ui-monospace,monospace", marginBottom: 4, textShadow: state === "current" ? `0 0 16px ${zone.color}` : "none" }}>
          {zone.name}
        </div>
        <div style={{ color: zone.color, fontSize: 9, opacity: 0.75, letterSpacing: "0.15em", fontFamily: "ui-monospace,monospace", marginBottom: 10 }}>
          {zone.sub}
        </div>
        <div style={{ display: "inline-block", padding: "4px 14px", borderRadius: 8, background: cfg.bBg, border: `1px solid ${zone.color}55`, color: cfg.bClr, fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>
          {cfg.badge}
        </div>
        {/* Footer bar */}
        <div style={{ width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${zone.color}, transparent)`, marginTop: 10, borderRadius: 1 }} />
      </div>
    </Html>
  );
}

function Scene({
  currentWeek, viewWeek, completedByWeek, onDistrictTap, gender,
}: {
  currentWeek: number; viewWeek: number;
  completedByWeek: Record<number, boolean>;
  onDistrictTap: (s: number, e: number) => void;
  gender: "boy" | "girl";
}) {
  const charZ   = weekToZ(viewWeek);   // character world z position
  const cameraZ = charZ - 18;          // Billboard fade distance uses camera z

  function zoneState(zone: (typeof DISTRICT_ZONES)[number]): "complete" | "current" | "locked" {
    const ws = Array.from({ length: zone.weekEnd - zone.weekStart + 1 }, (_, i) => zone.weekStart + i);
    if (ws.every((w) => completedByWeek[w])) return "complete";
    if (currentWeek >= zone.weekStart) return "current";
    return "locked";
  }

  // Street light colours shift per zone
  const slColors = ["#14b8a6", "#818cf8", "#f472b6", "#a78bfa"];

  return (
    <>
      <color attach="background" args={["#020810"]} />
      <fog attach="fog" args={["#030c1e", FOG_NEAR, FOG_FAR]} />

      {/* Lighting */}
      <ambientLight color="#0a1840" intensity={0.9} />
      <directionalLight color="#1a3c9c" position={[20, 60, 10]} intensity={0.8} />

      {/* Teal city skylight from above */}
      <pointLight position={[0, 60, -50]} color="#14b8a6" intensity={15} distance={120} />

      {/* Zone atmosphere lights above road */}
      <pointLight position={[0, 5, -88]} color="#14b8a6" intensity={12} distance={28} />
      <pointLight position={[0, 5, -66]} color="#818cf8" intensity={10} distance={25} />
      <pointLight position={[0, 5, -46]} color="#f472b6" intensity={10} distance={25} />
      <pointLight position={[0, 5, -26]} color="#a78bfa" intensity={9}  distance={22} />
      <pointLight position={[0, 5, -10]} color="#fbbf24" intensity={14} distance={30} />

      <Stars radius={110} depth={60} count={5000} factor={4} saturation={0} fade speed={0.3} />

      <Road />
      {BUILDINGS.map((b, i) => <Building key={i} {...b} />)}

      {/* Street lights — wider setback than before */}
      {Array.from({ length: 14 }).map((_, i) => {
        const z = -12 - i * 8.5;
        const c = slColors[Math.min(3, Math.floor((-z - 12) / 25))];
        return (
          <group key={i}>
            <StreetLight x={-(ROAD_WIDTH / 2 + 2.5)} z={z}      color={c} />
            <StreetLight x={ ROAD_WIDTH / 2 + 2.5}  z={z - 4.2} color={c} />
          </group>
        );
      })}

      <DataParticles />
      <LegendTower unlocked={completedByWeek[12] ?? false} />
      <PlayerCharacter z={charZ} gender={gender} />

      {DISTRICT_ZONES.map((zone) => (
        <Billboard
          key={zone.id}
          zone={zone}
          state={zoneState(zone)}
          cameraZ={cameraZ}
          onTap={() => onDistrictTap(zone.weekStart, zone.weekEnd)}
        />
      ))}

      <CameraRig charZ={charZ} />

      <EffectComposer>
        <Bloom luminanceThreshold={0.18} luminanceSmoothing={0.88} intensity={1.8} levels={7} />
      </EffectComposer>
    </>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function NumberNexusMap() {
  const router = useRouter();
  const [progress] = useState(() => readProgress());
  const [store]    = useState(() => readProgramStore());
  const [bestChain, setBestChain] = useState(0);
  const [gender, setGender] = useState<"boy" | "girl">("boy");

  useEffect(() => {
    try { setBestChain(Number(localStorage.getItem("lul_best_nexus_chain_v1") ?? 0)); } catch { /* ignore */ }
    try {
      const active = localStorage.getItem("lul_active_student_v1");
      if (active) {
        const parsed = JSON.parse(active);
        if (parsed?.gender === "girl" || parsed?.gender === "female") setGender("girl");
      }
    } catch { /* ignore */ }
  }, []);

  const year       = progress?.year ?? "Year 1";
  const isPrep     = year === "Prep";
  const levelNum   = isPrep ? 0 : parseInt(year.replace(/\D/g, ""), 10) || 1;
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
  const currentZone = DISTRICT_ZONES.find((z) => viewWeek >= z.weekStart && viewWeek <= z.weekEnd);

  const topBar: React.CSSProperties = {
    position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
    display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
    background: "rgba(2,6,16,0.75)", borderBottom: "1px solid rgba(94,234,212,0.1)",
    backdropFilter: "blur(14px)",
  };
  const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 999,
    background: "rgba(14,118,110,0.18)", border: "1px solid rgba(94,234,212,0.18)",
    ...extra,
  });
  const hudBtn: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "10px 10px", borderRadius: 12, cursor: "pointer",
    background: "rgba(2,10,22,0.9)", border: "1px solid rgba(94,234,212,0.18)",
    backdropFilter: "blur(10px)", minWidth: 52,
    boxShadow: "0 0 10px rgba(94,234,212,0.05), 0 4px 16px rgba(0,0,0,0.55)",
  };
  const navBtn = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 20px", borderRadius: 999, cursor: active ? "pointer" : "default",
    background: active ? "rgba(14,118,110,0.26)" : "rgba(12,20,32,0.2)",
    border: `1px solid ${active ? "rgba(94,234,212,0.28)" : "rgba(94,234,212,0.07)"}`,
    color: active ? "#5eead4" : "rgba(94,234,212,0.22)",
    fontSize: 12, fontWeight: 700, transition: "all 0.2s",
  });

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#020810", overflow: "hidden" }}>

      <Canvas
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        camera={{ position: [0, 11, weekToZ(currentWeek) - 18], fov: 65, near: 0.1, far: 250 }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Scene
          currentWeek={currentWeek}
          viewWeek={viewWeek}
          completedByWeek={completedByWeek}
          onDistrictTap={onDistrictTap}
          gender={gender}
        />
      </Canvas>

      {/* ── Top bar ── */}
      <div style={topBar}>
        <button onClick={() => router.push(`/realms?level=${encodeURIComponent(year)}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, ...chip(), cursor: "pointer", color: "rgba(167,243,208,0.9)", fontSize: 12, fontWeight: 700 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={chip()}>
          <span style={{ color: "#5eead4", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>⚡ NUMBER NEXUS</span>
        </div>
        <div style={chip({ background: "rgba(94,234,212,0.07)", border: "1px solid rgba(94,234,212,0.14)" })}>
          <span style={{ color: "#2dd4bf", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>{levelLabel}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...chip() }}>
          <Zap size={11} color="#14b8a6" />
          <span style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{totalXP} XP</span>
        </div>
        <div style={chip()}>
          <span style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{highestDone}/12</span>
        </div>
        <button onClick={() => router.push("/profile")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", background: "rgba(14,118,110,0.28)", border: "1px solid rgba(94,234,212,0.28)" }}>
          <User size={16} color="#5eead4" />
        </button>
      </div>

      {/* ── Right HUD ── */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { Icon: BookOpen, label: "LEGENDS", route: "/legends" },
          { Icon: LayoutGrid, label: "LEVELS",  route: "/levels" },
          { Icon: BarChart3, label: "STATS",   route: "/realm-stats" },
        ].map(({ Icon, label, route }) => (
          <button key={label} onClick={() => router.push(route)} style={hudBtn}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "rgba(14,118,110,0.22)" }}>
              <Icon size={16} color="#14b8a6" />
            </div>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(94,234,212,0.7)", fontFamily: "ui-monospace,monospace" }}>{label}</span>
          </button>
        ))}
        {bestChain > 0 && (
          <div style={{ ...hudBtn, cursor: "default" }}>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(94,234,212,0.5)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.4 }}>BEST{"\n"}CHAIN</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#5eead4", lineHeight: 1 }}>{bestChain}</span>
            <span style={{ fontSize: 9, color: "#fbbf24" }}>⚡</span>
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px",
        background: "rgba(2,6,16,0.82)", borderTop: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(14px)",
      }}>
        <button onClick={() => canBack && setViewWeek((v) => v - 1)} disabled={!canBack} style={navBtn(canBack)}>
          <ChevronLeft size={15} /> Prev
        </button>
        <div style={{ textAlign: "center" }}>
          {currentZone && (
            <>
              <div style={{ color: currentZone.color, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace", textShadow: `0 0 12px ${currentZone.color}` }}>
                {currentZone.name}
              </div>
              <div style={{ color: "rgba(148,163,184,0.55)", fontSize: 9, letterSpacing: "0.14em", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
                WEEK {viewWeek} · {currentZone.sub}
              </div>
            </>
          )}
        </div>
        <button onClick={() => canForward && setViewWeek((v) => v + 1)} disabled={!canForward} style={navBtn(canForward)}>
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
