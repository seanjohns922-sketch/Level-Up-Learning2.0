"use client";
// The Battle Arena: a spinning-top stadium in the hub where friends battle at maths. A glossy bowl with a
// glowing rim, two launch podiums facing each other across it (violet and lime), spinning battle tops in
// the bowl, curved stands, a giant scoreboard and floodlights. Units are world metres (the explorer is
// about 2 m tall); the podiums sit on the x axis, the scoreboard at the back (-z).
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Ball, Block, Mat } from "@/components/world3d/premium-homes/HomeKit";
import { Glow, LightPool, Spin, StringLights } from "@/components/world3d/premium-items/ItemKit";

const BOWL_R = 9, RIM_H = 1.75, DEPTH = 1.5;
const VIOLET = "#a855f7", LIME = "#83e300", CYAN = "#38e1ff";

/** The bowl: a dish below the rim, swept round from a profile. */
function useBowl() {
  return useMemo(() => {
    const inner: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24, r = t * BOWL_R; inner.push(new THREE.Vector2(r, RIM_H - DEPTH + DEPTH * t * t)); }
    const rim = [new THREE.Vector2(BOWL_R + 0.9, RIM_H), new THREE.Vector2(BOWL_R + 1.1, RIM_H - 0.2), new THREE.Vector2(BOWL_R + 1.4, 0)];
    return { dish: new THREE.LatheGeometry(inner, 96), outer: new THREE.LatheGeometry([new THREE.Vector2(BOWL_R, RIM_H), ...rim], 96) };
  }, []);
}
/** Painted rings and spokes on the bowl, like a stadium floor. */
function useBowlTexture() {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const g = canvas.getContext("2d")!;
    const grad = g.createRadialGradient(256, 256, 20, 256, 256, 256);
    grad.addColorStop(0, "#2b1d63"); grad.addColorStop(0.6, "#1b3f8f"); grad.addColorStop(1, "#0e6aa8");
    g.fillStyle = grad; g.fillRect(0, 0, 512, 512);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 4;
    for (const r of [70, 140, 210]) { g.beginPath(); g.arc(256, 256, r, 0, Math.PI * 2); g.stroke(); }
    g.lineWidth = 2;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.moveTo(256 + Math.cos(a) * 30, 256 + Math.sin(a) * 30); g.lineTo(256 + Math.cos(a) * 250, 256 + Math.sin(a) * 250); g.stroke(); }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

/** A battle top spinning round the bowl, with a glowing ring. */
function BattleTop({ colour, radius, speed, phase, night }: { colour: string; radius: number; speed: number; phase: number; night: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const top = ref.current;
    if (!top) return;
    const a = clock.elapsedTime * speed + phase, r = radius + Math.sin(clock.elapsedTime * 1.3 + phase) * 0.8;
    const y = RIM_H - DEPTH + DEPTH * (r / BOWL_R) ** 2;
    top.position.set(Math.cos(a) * r, y + 0.05, Math.sin(a) * r);
    top.rotation.y += 0.6;
    top.rotation.z = Math.sin(clock.elapsedTime * 2 + phase) * 0.08;
  });
  return <group ref={ref}><BattleTopBody colour={colour} night={night} /></group>;
}
function BattleTopBody({ colour, night }: { colour: string; night: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI, 0, 0]} castShadow><coneGeometry args={[0.35, 0.36, 20]} /><Mat color="#d9dde3" metal={0.7} rough={0.25} /></mesh>
      <mesh position={[0, 0.42, 0]} castShadow><cylinderGeometry args={[0.62, 0.55, 0.16, 8]} /><Mat color={colour} metal={0.4} rough={0.3} /></mesh>
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.66, 0.05, 8, 24]} /><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={night ? 3 : 1.2} /></mesh>
      <mesh position={[0, 0.58, 0]} castShadow><cylinderGeometry args={[0.16, 0.22, 0.2, 12]} /><Mat color="#f4f4f4" metal={0.5} rough={0.3} /></mesh>
    </group>
  );
}

/** The tug of war in light: violet and lime beams from the two tops meet at a crackling clash point.
 * `clash` runs from -1 (the violet side has pushed all the way) to 1 (lime has). */
function BattleBeams({ clash, night }: { clash: number; night: boolean }) {
  const spark = useRef<THREE.Group>(null);
  const y = RIM_H - DEPTH + 0.75, reach = BOWL_R * 0.62;
  const x = THREE.MathUtils.clamp(clash, -1, 1) * reach * 0.85;
  useFrame(({ clock }) => {
    if (!spark.current) return;
    const t = clock.elapsedTime;
    spark.current.scale.setScalar(1 + Math.sin(t * 18) * 0.12 + Math.sin(t * 7) * 0.08);
    spark.current.rotation.z = t * 3;
  });
  const beam = (from: number, to: number, colour: string) => (
    <group position={[(from + to) / 2, y, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.16, 0.16, Math.abs(to - from), 12]} /><meshBasicMaterial color={colour} toneMapped={false} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.42, 0.42, Math.abs(to - from), 16]} /><meshBasicMaterial color={colour} transparent opacity={night ? 0.32 : 0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
    </group>
  );
  return (
    <group>
      {beam(-reach, x, VIOLET)}
      {beam(x, reach, LIME)}
      <group ref={spark} position={[x, y, 0]}>
        <mesh><sphereGeometry args={[0.55, 20, 16]} /><meshBasicMaterial color="#ffffff" toneMapped={false} /></mesh>
        <mesh><sphereGeometry args={[1.15, 20, 16]} /><meshBasicMaterial color="#fff4c2" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
        {Array.from({ length: 8 }, (_, i) => <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]} position={[0, 0, 0]}><boxGeometry args={[2.2, 0.06, 0.06]} /><meshBasicMaterial color={i % 2 ? VIOLET : LIME} toneMapped={false} /></mesh>)}
      </group>
      <pointLight position={[x, y + 0.5, 0]} intensity={night ? 14 : 6} distance={9} color="#fff1c8" />
    </group>
  );
}

/** A top held in place at one end of the beam during a battle, spinning hard. */
function DuelTop({ x, colour, night }: { x: number; colour: string; night: boolean }) {
  return <group position={[x, RIM_H - DEPTH + DEPTH * (Math.abs(x) / BOWL_R) ** 2 + 0.02, 0]}><Spin speed={22}><BattleTopBody colour={colour} night={night} /></Spin></group>;
}

/** A launch podium: steps up to a round pad with a glowing ring, facing the bowl. */
function Podium({ side, colour, night }: { side: 1 | -1; colour: string; night: boolean }) {
  return (
    <group position={[side * (BOWL_R + 3.6), 0, 0]} rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      {[0, 1, 2].map((i) => <Block key={i} size={[3.4 - i * 0.2, 0.42, 1.0]} pos={[0, 0.21 + i * 0.42, 1.6 - i * 0.9]} color="#2a2f3a" r={0.04} />)}
      <mesh position={[0, 1.15, -1.1]} castShadow receiveShadow><cylinderGeometry args={[1.7, 1.9, 2.3, 32]} /><Mat color="#1f2430" metal={0.3} rough={0.5} /></mesh>
      <mesh position={[0, 2.32, -1.1]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.25, 1.55, 48]} /><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={night ? 3.2 : 1.4} /></mesh>
      <mesh position={[0, 2.31, -1.1]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.25, 48]} /><Mat color="#11141b" metal={0.4} rough={0.3} /></mesh>
      {/* The launcher rail reaching out over the bowl. */}
      <Block size={[0.3, 0.3, 2.6]} pos={[0, 2.9, -2.6]} color={colour} r={0.08} glow={night ? 1.2 : 0.3} />
      <Ball pos={[0, 2.9, -3.95]} r={0.26} color="#f4f4f4" />
      {[-1, 1].map((s) => <Block key={s} size={[0.12, 1.1, 0.12]} pos={[s * 1.6, 2.85, -1.1]} color="#c9ced6" r={0.03} metal={0.5} />)}
      <Block size={[3.3, 0.1, 0.12]} pos={[0, 3.4, -1.1]} color="#c9ced6" r={0.03} metal={0.5} />
    </group>
  );
}

/** A curved strip of stand: an arc of ring between two radii, `height` tall (built along -y then stood up). */
function useArcStep(inner: number, outer: number, span: number, height: number) {
  return useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outer, -span / 2, span / 2, false);
    shape.absarc(0, 0, inner, span / 2, -span / 2, true);
    const g = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 24 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [inner, outer, span, height]);
}
function StandRow({ row, span }: { row: number; span: number }) {
  const inner = BOWL_R + 5.6 + row * 1.1;
  const geometry = useArcStep(inner, inner + 1.1, span, 0.55 + row * 0.55);
  return <mesh geometry={geometry} castShadow receiveShadow><Mat color={row % 2 ? "#3b4252" : "#2e3442"} /></mesh>;
}

/** A curved block of stands outside the plaza, rising in rows, with seats in the team colours. */
function Stand({ angle, night }: { angle: number; night: boolean }) {
  const rows = 4, span = 0.9;
  return (
    <group rotation={[0, angle, 0]}>
      {Array.from({ length: rows }, (_, row) => <StandRow key={row} row={row} span={span} />)}
      {Array.from({ length: rows * 6 }, (_, i) => {
        const row = i % rows, t = (Math.floor(i / rows) + 0.5) / 6 - 0.5, r = BOWL_R + 6.1 + row * 1.1, a = t * span;
        return <Block key={i} size={[0.7, 0.4, 0.5]} pos={[Math.cos(a) * r, 0.75 + row * 0.55, -Math.sin(a) * r]} rot={[0, a + Math.PI / 2, 0]} color={i % 2 ? VIOLET : LIME} r={0.08} glow={night ? 0.5 : 0} />;
      })}
    </group>
  );
}

function Floodlight({ x, z, night }: { x: number; z: number; night: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 6, 0]} castShadow><cylinderGeometry args={[0.16, 0.24, 12, 10]} /><Mat color="#3a404c" metal={0.4} /></mesh>
      <group position={[0, 12, 0]} rotation={[0, Math.atan2(-x, -z), 0]}>
        <Block size={[2.2, 1.2, 0.3]} pos={[0, 0, 0]} rot={[0.5, 0, 0]} color="#1f2328" r={0.05} />
        <Glow size={[2, 1, 0.05]} pos={[0, -0.05, 0.17]} rot={[0.5, 0, 0]} color="#f4fbff" night={night} />
      </group>
    </group>
  );
}

/** The giant scoreboard: the two players' colours and scores, high over the back of the arena. */
function Scoreboard({ night }: { night: boolean }) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 384;
    const g = canvas.getContext("2d")!;
    g.fillStyle = "#0b0f1a"; g.fillRect(0, 0, 1024, 384);
    g.font = "900 64px Montserrat, Arial"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = "#ffd27a"; g.fillText("BATTLE ARENA", 512, 70);
    g.fillStyle = VIOLET; g.fillRect(60, 140, 380, 190); g.fillStyle = LIME; g.fillRect(584, 140, 380, 190);
    g.fillStyle = "#fff"; g.font = "900 120px Montserrat, Arial"; g.fillText("6", 250, 240); g.fillStyle = "#103a17"; g.fillText("5", 774, 240);
    g.fillStyle = "#fff"; g.font = "900 56px Montserrat, Arial"; g.fillText("VS", 512, 240);
    const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group position={[0, 0, -(BOWL_R + 9.5)]}>
      {[-5, 5].map((x) => <mesh key={x} position={[x, 4.5, 0]} castShadow><boxGeometry args={[0.6, 9, 0.6]} /><Mat color="#3a404c" metal={0.4} /></mesh>)}
      <Block size={[12, 4.6, 0.6]} pos={[0, 9.5, 0]} color="#1f2328" r={0.1} />
      <mesh position={[0, 9.5, 0.31]}><planeGeometry args={[11.4, 4.2]} /><meshStandardMaterial map={texture ?? undefined} emissive="#ffffff" emissiveMap={texture ?? undefined} emissiveIntensity={night ? 1.1 : 0.55} toneMapped={false} /></mesh>
    </group>
  );
}

/** `clash` set (-1..1) means a battle is on: the tops hold either end of the light beams. */
export function BattleArena({ night, clash }: { night: boolean; clash?: number }) {
  const { dish, outer } = useBowl();
  const floor = useBowlTexture();
  return (
    <group>
      {/* The plaza and the bowl. */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><ringGeometry args={[BOWL_R + 1.2, BOWL_R + 7.5, 72]} /><Mat color="#d9d6cf" /></mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[BOWL_R + 5, BOWL_R + 5.3, 72]} /><meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={night ? 2 : 0.3} /></mesh>
      <mesh geometry={dish} receiveShadow><meshStandardMaterial map={floor ?? undefined} color="#ffffff" roughness={0.18} metalness={0.25} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={outer} castShadow receiveShadow><meshStandardMaterial color="#e8ebf0" roughness={0.35} metalness={0.2} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, RIM_H + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[BOWL_R + 0.45, 0.14, 10, 96]} /><meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={night ? 3 : 1} /></mesh>
      {/* The battle tops. */}
      {clash === undefined ? <>
        <BattleTop colour={VIOLET} radius={3.2} speed={1.6} phase={0} night={night} />
        <BattleTop colour={LIME} radius={4.2} speed={1.25} phase={Math.PI} night={night} />
      </> : <>
        <DuelTop x={-BOWL_R * 0.62} colour={VIOLET} night={night} />
        <DuelTop x={BOWL_R * 0.62} colour={LIME} night={night} />
        <BattleBeams clash={clash} night={night} />
      </>}
      <Spin speed={0.3}>{[0, 1, 2, 3, 4, 5].map((i) => <Glow key={i} size={[0.12, 0, 0]} round pos={[Math.cos(i) * 6.5, RIM_H - DEPTH + DEPTH * 0.52 + 0.3, Math.sin(i) * 6.5]} color={i % 2 ? VIOLET : LIME} night={night} />)}</Spin>
      <Podium side={-1} colour={VIOLET} night={night} />
      <Podium side={1} colour={LIME} night={night} />
      {[Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4].map((a) => <Stand key={a} angle={a} night={night} />)}
      <Scoreboard night={night} />
      {[[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sz]) => <Floodlight key={`${sx}${sz}`} x={sx * (BOWL_R + 8)} z={sz * (BOWL_R + 8)} night={night} />)}
      {/* Bunting round the scoreboard side and soft light pools after dark. */}
      <StringLights from={[-(BOWL_R + 8), 7, -(BOWL_R + 8)]} to={[BOWL_R + 8, 7, -(BOWL_R + 8)]} night={night} n={20} sag={1.2} colors={[VIOLET, LIME, CYAN, "#ffd27a"]} r={0.09} />
      <LightPool r={BOWL_R + 4} color={CYAN} night={night} />
      {night ? <><pointLight position={[0, 6, 0]} intensity={18} distance={30} color="#bfe9ff" /><pointLight position={[-(BOWL_R + 3), 4, 0]} intensity={6} distance={10} color={VIOLET} /><pointLight position={[BOWL_R + 3, 4, 0]} intensity={6} distance={10} color={LIME} /></> : null}
    </group>
  );
}
