"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* Textures, particles and animated parts are Three objects owned by R3F; they
   are updated imperatively each frame, which the React immutability rule flags. */
/* eslint-disable react-hooks/immutability */

/** Walkable Chronorok: a golden-hour mesa above a sea of mist. A compass plaza
 *  in the middle, stone roads with glowing time-streams to four portals, and
 *  the Awakening Spire to the north. Built from Sean's stone, rock and grass
 *  textures and his sunset sky panorama. Everything here is procedural, so no
 *  model files are loaded. */

export type ChronorokPortalId = "arena" | "rift" | "cave" | "rune";

export const CHRONOROK_PORTALS: Record<ChronorokPortalId, { position: [number, number, number]; color: string; game: string; place: string }> = {
  arena: { position: [-40, 0, -4], color: "#ffc94a", game: "Relic Rider", place: "The Arena Gate" },
  rift: { position: [-25, 0, -32], color: "#7ff0ff", game: "Chrono Run", place: "The Rift Portal" },
  cave: { position: [25, 0, -32], color: "#ff9a5a", game: "Time Slope", place: "The Ember Cave" },
  rune: { position: [40, 0, -4], color: "#c79bff", game: "Rune Blocks", place: "The Rune Gate" },
};
export const CHRONOROK_SPIRE: [number, number, number] = [0, 0, -50];
export const CHRONOROK_SPAWN: [number, number, number] = [0, 0.75, 14];
export const CHRONOROK_ROAM = { centerZ: -14, radiusX: 52, radiusZ: 50 };
export const CHRONOROK_BOUNDS = { minX: -55, maxX: 55, minZ: -62, maxZ: 40 };

// Textures load through R3F's loader (Suspense), so materials are built with
// their maps in place; each use gets its own copy with its own tiling.
function useTexture(src: string, repeat: [number, number] = [1, 1]) {
  const base = useLoader(THREE.TextureLoader, src);
  return useMemo(() => {
    const texture = base.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [base, repeat[0], repeat[1]]); // eslint-disable-line react-hooks/exhaustive-deps
}

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d")!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const GOLD = new THREE.MeshStandardMaterial({ color: "#f0c060", metalness: 0.7, roughness: 0.3, emissive: "#6a4200", emissiveIntensity: 0.45 });

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

// ── Sky, distant mesas and the sea of mist ─────────────────────────────────
function Sky() {
  const { scene } = useThree();
  useEffect(() => {
    let cancelled = false;
    new THREE.TextureLoader().load("/images/chronorok/sky-pano.webp", (texture) => {
      if (cancelled) return;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
      // Also light the scene from the sky, so shiny avatar outfits and gold
      // trims reflect something instead of rendering black.
      scene.environment = texture;
      scene.environmentIntensity = 0.8;
    });
    return () => { cancelled = true; scene.background = null; scene.environment = null; };
  }, [scene]);
  return null;
}

function DistantMesas() {
  const rock = useTexture("/images/chronorok/tex-rock.webp", [6, 2]);
  const grass = useTexture("/images/chronorok/tex-grass.webp", [3, 3]);
  const mesas = useMemo(() => {
    const rand = seeded(17);
    return Array.from({ length: 22 }, () => {
      const angle = rand() * Math.PI * 2;
      const distance = 110 + rand() * 120;
      return { x: Math.cos(angle) * distance, z: Math.sin(angle) * distance - 20, r: 10 + rand() * 22, h: 30 + rand() * 40, top: -8 + rand() * 18 };
    });
  }, []);
  return (
    <group>
      {mesas.map((m, i) => (
        <group key={i} position={[m.x, m.top, m.z]}>
          <mesh position={[0, -m.h / 2, 0]}><cylinderGeometry args={[m.r, m.r * 0.82, m.h, 9]} /><meshStandardMaterial map={rock} color="#d7a77a" roughness={0.95} flatShading /></mesh>
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[m.r, 9]} /><meshStandardMaterial map={grass} color="#c9b46a" roughness={1} /></mesh>
        </group>
      ))}
    </group>
  );
}

function MistSea() {
  const texture = useMemo(() => canvasTexture(512, 512, (ctx) => {
    const rand = seeded(5);
    for (let i = 0; i < 160; i += 1) {
      const x = rand() * 512, y = rand() * 512, r = 30 + rand() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255,236,220,.5)");
      g.addColorStop(1, "rgba(255,236,220,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 512);
    }
  }), []);
  useEffect(() => { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 4); }, [texture]);
  useFrame((_, delta) => { texture.offset.x += delta * 0.004; texture.offset.y += delta * 0.002; });
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -14, -20]}><circleGeometry args={[420, 48]} /><meshBasicMaterial map={texture} color="#ffe2cc" transparent opacity={0.95} depthWrite={false} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, -20]}><ringGeometry args={[62, 300, 64]} /><meshBasicMaterial map={texture} color="#ffffff" transparent opacity={0.45} depthWrite={false} /></mesh>
    </group>
  );
}

// ── The mesa, plaza and roads ──────────────────────────────────────────────
function Mesa() {
  const grass = useTexture("/images/chronorok/tex-grass.webp", [22, 22]);
  const rock = useTexture("/images/chronorok/tex-rock.webp", [16, 3]);
  return (
    <group position={[0, 0, -14]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[60, 72]} /><meshStandardMaterial map={grass} color="#d8c88a" roughness={1} /></mesh>
      <mesh position={[0, -16, 0]}><cylinderGeometry args={[60, 46, 32, 72, 1, true]} /><meshStandardMaterial map={rock} color="#e2b58a" roughness={0.95} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, -46, 0]}><coneGeometry args={[46, 30, 48]} /><meshStandardMaterial map={rock} color="#b88a66" roughness={1} /></mesh>
    </group>
  );
}

function Plaza() {
  const paving = useTexture("/images/chronorok/tex-paving.webp", [7, 7]);
  const compass = useMemo(() => canvasTexture(1024, 1024, (ctx) => {
    const c = 512;
    ctx.translate(c, c);
    const ring = (r: number, w: number, colour: string) => { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.lineWidth = w; ctx.strokeStyle = colour; ctx.stroke(); };
    ring(500, 14, "#d9a640"); ring(470, 4, "#f3d27a"); ring(330, 10, "#d9a640"); ring(300, 3, "#f3d27a");
    ctx.fillStyle = "rgba(40,52,110,.55)";
    ctx.beginPath(); ctx.arc(0, 0, 326, 0, Math.PI * 2); ctx.arc(0, 0, 470, 0, Math.PI * 2, true); ctx.fill();
    for (let i = 0; i < 16; i += 1) {
      const long = i % 4 === 0, mid = i % 2 === 0;
      const len = long ? 470 : mid ? 330 : 230;
      ctx.save(); ctx.rotate((i / 16) * Math.PI * 2);
      ctx.beginPath(); ctx.moveTo(0, -len); ctx.lineTo(long ? 46 : 26, 0); ctx.lineTo(0, long ? 46 : 26); ctx.lineTo(long ? -46 : -26, 0); ctx.closePath();
      const g = ctx.createLinearGradient(-40, 0, 40, 0); g.addColorStop(0, "#9a6a1c"); g.addColorStop(0.5, "#ffe08a"); g.addColorStop(1, "#b07a22");
      ctx.fillStyle = g; ctx.fill(); ctx.restore();
    }
    ring(60, 10, "#ffe08a");
  }), []);
  return (
    <group>
      <mesh position={[0, 0.12, 0]} receiveShadow><cylinderGeometry args={[14, 14.4, 0.3, 64]} /><meshStandardMaterial map={paving} color="#e8d2ac" roughness={0.85} /></mesh>
      <mesh position={[0, 0.29, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[11, 64]} /><meshStandardMaterial map={compass} transparent roughness={0.4} metalness={0.5} /></mesh>
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[13.6, 14, 96]} /><meshBasicMaterial color="#ffc94a" toneMapped={false} /></mesh>
    </group>
  );
}

function lightningTexture(colour: string) {
  const texture = canvasTexture(64, 512, (ctx) => {
    const rand = seeded(colour.length * 7 + 3);
    for (let strand = 0; strand < 3; strand += 1) {
      ctx.beginPath();
      let x = 32;
      ctx.moveTo(x, 0);
      for (let y = 0; y <= 512; y += 16) { x = Math.max(8, Math.min(56, x + (rand() - 0.5) * 22)); ctx.lineTo(x, y); }
      ctx.strokeStyle = strand === 0 ? "#ffffff" : colour;
      ctx.lineWidth = strand === 0 ? 3 : 5;
      ctx.shadowColor = colour;
      ctx.shadowBlur = 14;
      ctx.stroke();
    }
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function Road({ to, colour, width = 5 }: { to: [number, number, number]; colour: string; width?: number }) {
  const start = new THREE.Vector2(0, 0);
  const end = new THREE.Vector2(to[0], to[2]);
  const dir = end.clone().sub(start).normalize();
  const from = start.clone().add(dir.clone().multiplyScalar(13.5));
  const stop = end.clone().sub(dir.clone().multiplyScalar(5));
  const length = from.distanceTo(stop);
  const mid = from.clone().add(stop).multiplyScalar(0.5);
  const angle = Math.atan2(dir.x, dir.y);
  const paving = useTexture("/images/chronorok/tex-paving.webp", [1.2, Math.max(1, length / 5)]);
  const rock = useTexture("/images/chronorok/tex-rock.webp", [Math.max(1, length / 4), 0.4]);
  const stream = useMemo(() => lightningTexture(colour), [colour]);
  useEffect(() => { stream.repeat.set(1, length / 10); }, [stream, length]);
  useFrame((_, delta) => { stream.offset.y -= delta * 0.9; });
  return (
    <group position={[mid.x, 0, mid.y]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.1, 0]} receiveShadow><boxGeometry args={[width, 0.22, length]} /><meshStandardMaterial map={paving} color="#e6cfa6" roughness={0.85} /></mesh>
      <mesh position={[0, 0.23, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.6, length]} /><meshBasicMaterial map={stream} color={colour} transparent blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 + 0.25), 0.45, 0]} castShadow><boxGeometry args={[0.5, 0.9, length]} /><meshStandardMaterial map={rock} color="#d8b48c" roughness={0.95} /></mesh>
      ))}
      {Array.from({ length: Math.max(1, Math.floor(length / 11)) }).map((_, i) => (
        <group key={i}>
          {[-1, 1].map((side) => <BannerPost key={side} position={[side * (width / 2 + 0.6), 0, -length / 2 + 5 + i * 11]} />)}
        </group>
      ))}
    </group>
  );
}

const BANNER_TEXTURE: { current: THREE.CanvasTexture | null } = { current: null };
function bannerTexture() {
  if (BANNER_TEXTURE.current) return BANNER_TEXTURE.current;
  BANNER_TEXTURE.current = canvasTexture(128, 320, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 320); g.addColorStop(0, "#26306e"); g.addColorStop(1, "#1a2050");
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(128, 0); ctx.lineTo(128, 280); ctx.lineTo(64, 320); ctx.lineTo(0, 280); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#e0b04a"; ctx.lineWidth = 6; ctx.stroke();
    ctx.translate(64, 140); ctx.fillStyle = "#e8b850";
    for (let i = 0; i < 8; i += 1) { ctx.save(); ctx.rotate((i / 8) * Math.PI * 2); ctx.beginPath(); ctx.moveTo(0, i % 2 ? -26 : -46); ctx.lineTo(7, 0); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.lineWidth = 4; ctx.strokeStyle = "#e8b850"; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.stroke();
  });
  return BANNER_TEXTURE.current;
}

function BannerPost({ position }: { position: [number, number, number] }) {
  const rock = useTexture("/images/chronorok/tex-paving.webp", [0.5, 2]);
  const banner = useMemo(() => bannerTexture(), []);
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[0.7, 4, 0.7]} /><meshStandardMaterial map={rock} color="#e6d2b0" roughness={0.85} /></mesh>
      <mesh position={[0, 4.15, 0]} material={GOLD}><coneGeometry args={[0.45, 0.6, 4]} /></mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.37, 2.6, 0]} rotation={[0, side * Math.PI / 2, 0]}><planeGeometry args={[0.6, 1.6]} /><meshStandardMaterial map={banner} transparent side={THREE.DoubleSide} roughness={0.9} /></mesh>
      ))}
    </group>
  );
}

// ── The Awakening Spire ────────────────────────────────────────────────────
function Spire() {
  const rings = useRef<THREE.Group>(null);
  const paving = useTexture("/images/chronorok/tex-paving.webp", [4, 3]);
  const profile = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const steps: Array<[number, number]> = [[3.8, 0], [3.6, 2], [2.4, 4], [2.0, 10], [1.4, 18], [1.8, 20], [1.1, 26], [0.6, 31], [0.05, 34]];
    for (const [r, y] of steps) points.push(new THREE.Vector2(r, y));
    return points;
  }, []);
  useFrame((_, delta) => { if (rings.current) { rings.current.children[0].rotation.z += delta * 0.3; rings.current.children[1].rotation.x += delta * 0.22; } });
  return (
    <group position={CHRONOROK_SPIRE}>
      {[[10, 0.8], [8, 1.6], [6, 2.4]].map(([r, h], i) => (
        <mesh key={i} position={[0, h / 2, 0]} receiveShadow castShadow><cylinderGeometry args={[r, r + 0.4, h, 48]} /><meshStandardMaterial map={paving} color="#ead6b2" roughness={0.85} /></mesh>
      ))}
      <mesh position={[0, 2.4, 0]} castShadow><latheGeometry args={[profile, 8]} /><meshStandardMaterial map={paving} color="#f2dcae" roughness={0.6} metalness={0.2} /></mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
        return <mesh key={`rib-${i}`} position={[Math.cos(a) * 2.25, 14, Math.sin(a) * 2.25]} rotation={[0, -a, 0]} material={GOLD} castShadow><boxGeometry args={[0.35, 24, 0.5]} /></mesh>;
      })}
      {Array.from({ length: 4 }).map((_, i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <group key={`fin-${i}`} rotation={[0, a, 0]}>
            <mesh position={[0, 7, 3.1]} material={GOLD} castShadow><boxGeometry args={[0.5, 12, 1.6]} /></mesh>
            <mesh position={[0, 13.8, 3.1]} material={GOLD}><coneGeometry args={[0.6, 2.4, 4]} /></mesh>
            <mesh position={[0, 10, 2.06]}><planeGeometry args={[0.5, 14]} /><meshBasicMaterial color="#ffe6a0" toneMapped={false} /></mesh>
          </group>
        );
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <mesh key={i} position={[Math.cos(a) * 1.5, 31, Math.sin(a) * 1.5]} rotation={[Math.cos(a) * 0.25, 0, -Math.sin(a) * 0.25]} material={GOLD}><coneGeometry args={[0.3, 5, 6]} /></mesh>;
      })}
      <mesh position={[0, 30, 0]}><cylinderGeometry args={[0.35, 0.35, 70, 12, 1, true]} /><meshBasicMaterial color="#ffe6a0" transparent opacity={0.55} toneMapped={false} /></mesh>
      <mesh position={[0, 5, 2.1]}><planeGeometry args={[1.6, 3.2]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>
      <pointLight position={[0, 22, 0]} intensity={260} distance={60} color="#ffc94a" />
      <group ref={rings} position={[0, 22, 0]}>
        <mesh material={GOLD}><torusGeometry args={[5, 0.22, 10, 72]} /></mesh>
        <mesh material={GOLD} rotation={[Math.PI / 2.4, 0, 0]}><torusGeometry args={[6.2, 0.18, 10, 72]} /></mesh>
        <mesh><sphereGeometry args={[1.4, 24, 24]} /><meshBasicMaterial color="#fff2c0" toneMapped={false} /></mesh>
      </group>
    </group>
  );
}

// ── Portals ────────────────────────────────────────────────────────────────
function swirlTexture(colour: string) {
  return canvasTexture(512, 512, (ctx) => {
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.3, colour); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    ctx.lineWidth = 7;
    for (let arm = 0; arm < 6; arm += 1) {
      ctx.beginPath();
      for (let t = 0; t < 6.5; t += 0.04) { const r = 6 + t * 36; ctx.lineTo(256 + Math.cos(t + arm * 1.05) * r, 256 + Math.sin(t + arm * 1.05) * r); }
      ctx.strokeStyle = arm % 2 ? "rgba(255,255,255,.65)" : "rgba(255,240,200,.45)";
      ctx.stroke();
    }
  });
}

function Vortex({ colour, radius, spin = 0.8 }: { colour: string; radius: number; spin?: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => swirlTexture(colour), [colour]);
  useFrame((_, delta) => { if (mesh.current) mesh.current.rotation.z -= delta * spin; });
  return (
    <mesh ref={mesh}>
      <circleGeometry args={[radius, 64]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
}

function facePlaza(position: [number, number, number]) {
  return Math.atan2(-position[0], -position[2]);
}

function RiftPortal() {
  const { position, color } = CHRONOROK_PORTALS.rift;
  const rock = useTexture("/images/chronorok/tex-rock.webp", [1, 1]);
  const paving = useTexture("/images/chronorok/tex-paving.webp", [3, 3]);
  const orbit = useRef<THREE.Group>(null);
  const float = useRef<THREE.Group>(null);
  const rand = useMemo(() => seeded(31), []);
  const debris = useMemo(() => Array.from({ length: 16 }, () => ({ a: rand() * Math.PI * 2, r: 7 + rand() * 2.5, y: rand() * 2 - 1, s: 0.35 + rand() * 0.6 })), [rand]);
  useFrame(({ clock }, delta) => {
    if (orbit.current) orbit.current.rotation.z += delta * 0.12;
    if (float.current) float.current.position.y = 7.4 + Math.sin(clock.elapsedTime * 0.8) * 0.35;
  });
  return (
    <group position={position} rotation={[0, facePlaza(position), 0]}>
      <mesh position={[0, 0.6, 0]} receiveShadow castShadow><cylinderGeometry args={[6.5, 7, 1.2, 40]} /><meshStandardMaterial map={paving} color="#e2cca2" roughness={0.85} /></mesh>
      <mesh position={[0, 1.22, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[3, 3.4, 64]} /><meshBasicMaterial color={color} toneMapped={false} /></mesh>
      <group ref={float} position={[0, 7.4, 0]}>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return <mesh key={i} position={[Math.cos(a) * 5.4, Math.sin(a) * 5.4, 0]} rotation={[0, 0, a + Math.PI / 2]} castShadow><boxGeometry args={[2.2, 1.3, 1.4]} /><meshStandardMaterial map={rock} color="#d8cbb8" roughness={0.9} /></mesh>;
        })}
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[Math.cos((i / 4) * Math.PI * 2 + Math.PI / 2) * 5.4, Math.sin((i / 4) * Math.PI * 2 + Math.PI / 2) * 5.4, 0.8]}>
            <mesh material={GOLD}><cylinderGeometry args={[0.95, 0.95, 0.35, 24]} /></mesh>
            <mesh material={GOLD} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.35, 1.8, 4]} /></mesh>
          </group>
        ))}
        <Vortex colour={color} radius={4.7} spin={1.1} />
        <group ref={orbit}>
          {debris.map((d, i) => <mesh key={i} position={[Math.cos(d.a) * d.r, Math.sin(d.a) * d.r, d.y]} scale={d.s}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial map={rock} color="#cdbfa8" roughness={0.9} flatShading /></mesh>)}
        </group>
        <pointLight position={[0, 0, 3]} intensity={90} distance={26} color={color} />
      </group>
    </group>
  );
}

function ArenaGate() {
  const { position, color } = CHRONOROK_PORTALS.arena;
  const paving = useTexture("/images/chronorok/tex-paving.webp", [1.5, 4]);
  const wallTex = useTexture("/images/chronorok/tex-paving.webp", [10, 2]);
  const banner = useMemo(() => bannerTexture(), []);
  const arches = useMemo(() => canvasTexture(1024, 256, (ctx) => {
    ctx.fillStyle = "rgba(0,0,0,0)"; ctx.clearRect(0, 0, 1024, 256);
    for (let i = 0; i < 12; i += 1) {
      const x = 20 + i * 84;
      ctx.fillStyle = "rgba(255,170,60,.9)";
      ctx.beginPath(); ctx.moveTo(x, 230); ctx.lineTo(x, 120); ctx.arc(x + 26, 120, 26, Math.PI, 0); ctx.lineTo(x + 52, 230); ctx.closePath(); ctx.fill();
    }
  }), []);
  return (
    <group position={position} rotation={[0, facePlaza(position), 0]}>
      <mesh position={[0, 6, -9]} castShadow receiveShadow><cylinderGeometry args={[14, 14, 12, 48, 1, true, Math.PI * 0.62, Math.PI * 0.76]} /><meshStandardMaterial map={wallTex} color="#e2cca8" roughness={0.85} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 6.4, -9]}><cylinderGeometry args={[13.9, 13.9, 6, 48, 1, true, Math.PI * 0.62, Math.PI * 0.76]} /><meshBasicMaterial map={arches} transparent side={THREE.DoubleSide} toneMapped={false} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 4.2, 0, 0]}>
          <mesh position={[0, 7, 0]} castShadow><boxGeometry args={[2.6, 14, 2.6]} /><meshStandardMaterial map={paving} color="#ead6b4" roughness={0.85} /></mesh>
          <mesh position={[0, 14.6, 0]} material={GOLD}><sphereGeometry args={[0.9, 20, 20]} /></mesh>
          <mesh position={[0, 15.8, 0]} material={GOLD}><coneGeometry args={[0.35, 1.4, 8]} /></mesh>
          <mesh position={[0, 7.5, 1.32]}><planeGeometry args={[1.8, 6]} /><meshStandardMaterial map={banner} transparent roughness={0.9} /></mesh>
        </group>
      ))}
      <mesh position={[0, 12.5, 0]} castShadow><boxGeometry args={[11, 2.4, 2.8]} /><meshStandardMaterial map={paving} color="#ead6b4" roughness={0.85} /></mesh>
      <mesh position={[0, 8.2, 0]} rotation={[0, 0, 0]} castShadow><torusGeometry args={[2.9, 0.55, 12, 32, Math.PI]} /><meshStandardMaterial map={paving} color="#ead6b4" roughness={0.85} /></mesh>
      <mesh position={[0, 12.5, 1.45]} material={GOLD}><cylinderGeometry args={[1.5, 1.5, 0.3, 32]} /></mesh>
      <mesh position={[0, 4.6, 0.1]}><planeGeometry args={[5.6, 7.4]} /><meshBasicMaterial color="#ffcf6a" toneMapped={false} /></mesh>
      <mesh position={[0, 8.2, 0.1]}><circleGeometry args={[2.8, 32, 0, Math.PI]} /><meshBasicMaterial color="#ffe0a0" toneMapped={false} /></mesh>
      <pointLight position={[0, 5, 3]} intensity={70} distance={22} color={color} />
    </group>
  );
}

function EmberCave() {
  const { position, color } = CHRONOROK_PORTALS.cave;
  const rock = useTexture("/images/chronorok/tex-rock.webp", [4, 3]);
  const paving = useTexture("/images/chronorok/tex-paving.webp", [0.6, 3]);
  const banner = useMemo(() => bannerTexture(), []);
  const mound = useMemo(() => {
    const geometry = new THREE.IcosahedronGeometry(11, 4);
    const p = geometry.attributes.position;
    for (let i = 0; i < p.count; i += 1) {
      const v = new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i));
      // Same bumps for the same point, so shared corners never split apart.
      v.multiplyScalar(1 + 0.12 * Math.sin(v.x * 0.55) * Math.cos(v.z * 0.5) + 0.06 * Math.sin(v.y * 1.3 + v.x * 0.4));
      if (v.y < 0) v.y *= 0.2;
      p.setXYZ(i, v.x, v.y, v.z);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  const flicker = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => { if (flicker.current) flicker.current.intensity = 110 + Math.sin(clock.elapsedTime * 9) * 18 + Math.sin(clock.elapsedTime * 23) * 10; });
  return (
    <group position={position} rotation={[0, facePlaza(position), 0]}>
      <mesh geometry={mound} position={[0, 0, -7]} scale={[1.3, 1, 1]} castShadow receiveShadow><meshStandardMaterial map={rock} color="#e8b48a" roughness={0.95} /></mesh>
      <mesh position={[0, 3.2, 2.6]}><circleGeometry args={[4, 40, 0, Math.PI]} /><meshBasicMaterial color="#ff8a2a" toneMapped={false} /></mesh>
      <mesh position={[0, 1.6, 2.6]}><planeGeometry args={[8, 3.2]} /><meshBasicMaterial color="#ff9a3a" toneMapped={false} /></mesh>
      <mesh position={[0, 3.2, 2.7]}><torusGeometry args={[4.3, 0.6, 10, 32, Math.PI]} /><meshStandardMaterial map={rock} color="#c98f62" roughness={0.95} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 6, 0, 3.2]}>
          <mesh position={[0, 5, 0]} castShadow><boxGeometry args={[1.6, 10, 1.6]} /><meshStandardMaterial map={paving} color="#ead6b4" roughness={0.85} /></mesh>
          <mesh position={[0, 10.3, 0]} material={GOLD}><coneGeometry args={[0.6, 1.2, 8]} /></mesh>
          <mesh position={[0, 6, 0.82]}><planeGeometry args={[1.4, 4.4]} /><meshStandardMaterial map={banner} transparent roughness={0.9} /></mesh>
          <mesh position={[side * -1.6, 1, 2]}><boxGeometry args={[0.6, 1.2, 0.6]} /><meshBasicMaterial color="#ffb050" toneMapped={false} /></mesh>
        </group>
      ))}
      <pointLight ref={flicker} position={[0, 2.5, 4]} intensity={110} distance={24} color={color} />
    </group>
  );
}

function RuneGate() {
  const { position, color } = CHRONOROK_PORTALS.rune;
  const paving = useTexture("/images/chronorok/tex-paving.webp", [1, 4]);
  const rock = useTexture("/images/chronorok/tex-rock.webp", [2, 3]);
  const banner = useMemo(() => bannerTexture(), []);
  const robe = useMemo(() => [new THREE.Vector2(2.2, 0), new THREE.Vector2(2.0, 2), new THREE.Vector2(1.5, 6), new THREE.Vector2(1.6, 8), new THREE.Vector2(1.0, 9.6), new THREE.Vector2(0.01, 10.4)], []);
  return (
    <group position={position} rotation={[0, facePlaza(position), 0]}>
      <mesh position={[0, 0.4, 0]} receiveShadow><boxGeometry args={[16, 0.8, 8]} /><meshStandardMaterial map={paving} color="#e2cca2" roughness={0.85} /></mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 3.4, 6.4, 0]} castShadow><boxGeometry args={[1.8, 12, 1.8]} /><meshStandardMaterial map={paving} color="#ead6b4" roughness={0.85} /></mesh>
          <mesh position={[side * 3.4, 12.8, 0]} material={GOLD}><coneGeometry args={[0.7, 1.6, 8]} /></mesh>
          <mesh position={[side * 3.4, 7, 0.92]}><planeGeometry args={[1.4, 5]} /><meshStandardMaterial map={banner} transparent roughness={0.9} /></mesh>
          {/* hooded guardian */}
          <group position={[side * 6.8, 0.8, -0.5]}>
            <mesh castShadow><latheGeometry args={[robe, 24]} /><meshStandardMaterial map={rock} color="#d6c8b2" roughness={0.9} /></mesh>
            <mesh position={[0, 9.2, 0.25]}><sphereGeometry args={[1.05, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshStandardMaterial map={rock} color="#c9baa2" roughness={0.9} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, 8.95, 0.7]}><sphereGeometry args={[0.7, 16, 16]} /><meshStandardMaterial color="#2a2030" roughness={1} /></mesh>
            {[-1, 1].map((eye) => <mesh key={eye} position={[eye * 0.24, 9.0, 1.33]}><sphereGeometry args={[0.1, 10, 10]} /><meshBasicMaterial color="#e2b0ff" toneMapped={false} /></mesh>)}
            <mesh position={[0, 5.4, 1.5]} material={GOLD}><cylinderGeometry args={[0.12, 0.12, 6, 8]} /></mesh>
            <mesh position={[0, 8.6, 1.5]} material={GOLD} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.55, 0.1, 8, 24]} /></mesh>
          </group>
        </group>
      ))}
      <mesh position={[0, 12.4, 0]} castShadow><boxGeometry args={[8.6, 1.4, 2]} /><meshStandardMaterial map={paving} color="#ead6b4" roughness={0.85} /></mesh>
      <mesh position={[0, 8.4, 0]} castShadow><torusGeometry args={[2.6, 0.45, 12, 32, Math.PI]} /><meshStandardMaterial map={paving} color="#ead6b4" roughness={0.85} /></mesh>
      <mesh position={[0, 13.6, 0.6]} material={GOLD}><cylinderGeometry args={[1.1, 1.1, 0.25, 32]} /></mesh>
      <group position={[0, 5.2, 0.05]} scale={[1, 1.55, 1]}><Vortex colour={color} radius={2.55} spin={0.6} /></group>
      <pointLight position={[0, 5, 3]} intensity={70} distance={22} color={color} />
    </group>
  );
}

function PortalLabel({ id }: { id: ChronorokPortalId }) {
  const portal = CHRONOROK_PORTALS[id];
  const height = id === "rift" ? 15.5 : id === "cave" ? 12 : 17;
  return (
    <Html position={[portal.position[0], height, portal.position[2]]} center zIndexRange={[20, 0]}>
      <div className="chronoTag" style={{ borderColor: portal.color }}><b>{portal.game}</b><small>{portal.place}</small></div>
    </Html>
  );
}

function Sparks() {
  const geometry = useMemo(() => {
    const rand = seeded(77);
    const positions: number[] = [];
    for (let i = 0; i < 500; i += 1) positions.push((rand() - 0.5) * 120, rand() * 26, -14 + (rand() - 0.5) * 110);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    return g;
  }, []);
  const texture = useMemo(() => canvasTexture(64, 64, (ctx) => {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,240,190,1)"); g.addColorStop(0.3, "rgba(255,190,80,.6)"); g.addColorStop(1, "rgba(255,160,40,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
  }), []);
  useFrame((_, delta) => {
    const p = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i += 1) { let y = p.getY(i) + delta * 0.6; if (y > 26) y = 0; p.setY(i, y); }
    p.needsUpdate = true;
  });
  return <points geometry={geometry}><pointsMaterial map={texture} size={0.5} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

export function ChronorokWorldScene() {
  return (
    <>
      <Sky />
      <fog attach="fog" args={["#f2c6a0", 90, 330]} />
      <hemisphereLight args={["#ffe2c0", "#5a4060", 0.75]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-60, 70, 40]} intensity={2.4} color="#ffcf98" castShadow shadow-mapSize={[2048, 2048]} shadow-camera-left={-70} shadow-camera-right={70} shadow-camera-top={70} shadow-camera-bottom={-70} shadow-camera-far={220} shadow-bias={-0.0004} />
      <Suspense fallback={null}>
      <DistantMesas />
      <MistSea />
      <Mesa />
      <Plaza />
      <Road to={CHRONOROK_SPIRE} colour="#ffd76a" width={6} />
      {(Object.keys(CHRONOROK_PORTALS) as ChronorokPortalId[]).map((id) => <Road key={id} to={CHRONOROK_PORTALS[id].position} colour={CHRONOROK_PORTALS[id].color} />)}
      <Spire />
      <RiftPortal />
      <ArenaGate />
      <EmberCave />
      <RuneGate />
      </Suspense>
      {(Object.keys(CHRONOROK_PORTALS) as ChronorokPortalId[]).map((id) => <PortalLabel key={id} id={id} />)}
      <Sparks />
    </>
  );
}
