"use client";
// The Battle Arena: an indoor spinning-top stadium where friends battle at maths (our own design). A glossy
// bowl with a glowing rim, two launch podiums facing each other across it (you violet, your friend lime),
// tiered stands all the way round with a cheering crowd, a big screen hung over the bowl and a roof ring of
// spotlights. The battle plays out in light: the two tops' beams meet at a crackling clash point that right
// answers push, and at the end the loser's beam snaps and their top is blasted out of the bowl.
// Units are metres (an explorer is about 2 m tall); the podiums sit on the x axis, yours at -x.
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Ball, Block, Mat } from "@/components/world3d/premium-homes/HomeKit";
import { Spin } from "@/components/world3d/premium-items/ItemKit";

const BOWL_R = 9, RIM_H = 1.75, DEPTH = 1.5;
const VIOLET = "#a855f7", LIME = "#83e300", CYAN = "#38e1ff", GOLD = "#ffd27a";
/** Where the tops hold during a battle, and where they wait on the launchers before it. */
const DUEL_X = BOWL_R * 0.62, LAUNCHER_X = BOWL_R + 3.6 - 3.95, LAUNCHER_Y = 2.75;
const STAND_IN = 15, STEP_RUN = 1.6, STEP_RISE = 0.9, STEPS = 8;
/** The tops are drawn big so the battle reads from the stands, and the beams run at their rings' height. */
const TOP_SCALE = 1.7;

export type ArenaStage = "intro" | "countdown" | "battle" | "finish";
/** Who won, once it's over: "turns" while a take-turns friend still has to play. */
export type ArenaOutcome = "me" | "friend" | "draw" | "turns";

const bowlY = (x: number) => RIM_H - DEPTH + DEPTH * (Math.min(Math.abs(x), BOWL_R) / BOWL_R) ** 2;
/** A value that eases towards a target, frame-rate independent. */
const ease = (from: number, to: number, rate: number, dt: number) => THREE.MathUtils.damp(from, to, rate, dt);

/** The bowl: a dish below the rim, swept round from a profile, painted with rings and spokes. */
function Bowl() {
  const { dish, outer, floor } = useMemo(() => {
    const inner: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) { const t = i / 24; inner.push(new THREE.Vector2(t * BOWL_R, RIM_H - DEPTH + DEPTH * t * t)); }
    const rim = [new THREE.Vector2(BOWL_R + 0.9, RIM_H), new THREE.Vector2(BOWL_R + 1.1, RIM_H - 0.2), new THREE.Vector2(BOWL_R + 1.4, 0)];
    let texture: THREE.CanvasTexture | null = null;
    if (typeof document !== "undefined") {
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
      texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
    }
    return { dish: new THREE.LatheGeometry(inner, 96), outer: new THREE.LatheGeometry([new THREE.Vector2(BOWL_R, RIM_H), ...rim], 96), floor: texture };
  }, []);
  return (
    <group>
      <mesh geometry={dish} receiveShadow><meshStandardMaterial map={floor ?? undefined} color="#ffffff" roughness={0.18} metalness={0.25} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={outer} castShadow receiveShadow><meshStandardMaterial color="#d6dbe4" roughness={0.35} metalness={0.3} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, RIM_H + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[BOWL_R + 0.45, 0.14, 10, 96]} /><meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={3} toneMapped={false} /></mesh>
    </group>
  );
}

function TopBody({ colour, power = false }: { colour: string; power?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI, 0, 0]} castShadow><coneGeometry args={[0.35, 0.36, 20]} /><Mat color="#d9dde3" metal={0.7} rough={0.25} /></mesh>
      <mesh position={[0, 0.42, 0]} castShadow><cylinderGeometry args={[0.62, 0.55, 0.16, 8]} /><Mat color={colour} metal={0.4} rough={0.3} /></mesh>
      <mesh position={[0, 0.42, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.66, 0.05, 8, 24]} /><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={power ? 6 : 3} toneMapped={false} /></mesh>
      <mesh position={[0, 0.58, 0]} castShadow><cylinderGeometry args={[0.16, 0.22, 0.2, 12]} /><Mat color="#f4f4f4" metal={0.5} rough={0.3} /></mesh>
      {power ? <mesh position={[0, 0.4, 0]}><sphereGeometry args={[1.1, 20, 14]} /><meshBasicMaterial color={colour} transparent opacity={0.28} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh> : null}
    </group>
  );
}

/** A launch podium: steps up to a round pad with a glowing ring and a launcher rail reaching over the bowl. */
function Podium({ side, colour }: { side: 1 | -1; colour: string }) {
  return (
    <group position={[side * (BOWL_R + 3.6), 0, 0]} rotation={[0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
      {[0, 1, 2].map((i) => <Block key={i} size={[3.4 - i * 0.2, 0.42, 1.0]} pos={[0, 0.21 + i * 0.42, 1.6 - i * 0.9]} color="#2a2f3a" r={0.04} />)}
      <mesh position={[0, 1.15, -1.1]} castShadow receiveShadow><cylinderGeometry args={[1.7, 1.9, 2.3, 32]} /><Mat color="#1f2430" metal={0.3} rough={0.5} /></mesh>
      <mesh position={[0, 2.32, -1.1]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[1.25, 1.55, 48]} /><meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={3.2} toneMapped={false} /></mesh>
      <mesh position={[0, 2.31, -1.1]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.25, 48]} /><Mat color="#11141b" metal={0.4} rough={0.3} /></mesh>
      <Block size={[0.3, 0.3, 2.6]} pos={[0, 2.9, -2.6]} color={colour} r={0.08} glow={1.2} />
      <Ball pos={[0, 2.9, -3.95]} r={0.26} color="#f4f4f4" />
      {[-1, 1].map((s) => <Block key={s} size={[0.12, 1.1, 0.12]} pos={[s * 1.6, 2.85, -1.1]} color="#c9ced6" r={0.03} metal={0.5} />)}
      <Block size={[3.3, 0.1, 0.12]} pos={[0, 3.4, -1.1]} color="#c9ced6" r={0.03} metal={0.5} />
      {/* The tunnel the player walked out of, glowing behind the podium. */}
      <group position={[0, 0, 5.2]}>
        <Block size={[4.6, 4.2, 0.6]} pos={[0, 2.1, 0]} color="#151824" r={0.1} />
        <mesh position={[0, 1.8, -0.31]} rotation={[0, Math.PI, 0]}><planeGeometry args={[3, 3.4]} /><meshBasicMaterial color={colour} transparent opacity={0.5} toneMapped={false} /></mesh>
      </group>
    </group>
  );
}

/** The stands: steps rising all the way round. */
function Stands() {
  const geometry = useMemo(() => {
    const profile: THREE.Vector2[] = [new THREE.Vector2(STAND_IN, 0)];
    for (let i = 0; i < STEPS; i++) {
      const r = STAND_IN + i * STEP_RUN, y = 0.5 + i * STEP_RISE;
      profile.push(new THREE.Vector2(r, y), new THREE.Vector2(r + STEP_RUN, y));
    }
    profile.push(new THREE.Vector2(STAND_IN + STEPS * STEP_RUN, 0));
    return new THREE.LatheGeometry(profile, 120);
  }, []);
  return (
    <group>
      <mesh geometry={geometry} receiveShadow><meshStandardMaterial color="#232838" roughness={0.8} side={THREE.DoubleSide} /></mesh>
      {/* Glowing edges on every other step. */}
      {Array.from({ length: STEPS / 2 }, (_, i) => (
        <mesh key={i} position={[0, 0.5 + i * 2 * STEP_RISE + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[STAND_IN + i * 2 * STEP_RUN + 0.05, 0.04, 6, 120]} /><meshBasicMaterial color={i % 2 ? LIME : VIOLET} toneMapped={false} /></mesh>
      ))}
    </group>
  );
}

type Fan = { x: number; z: number; y: number; phase: number; shirt: THREE.Color; skin: THREE.Color };
const SHIRTS = ["#f4f4f4", "#38e1ff", "#ffd27a", "#ff7ab6", "#8892a6"], SKINS = ["#f2c9a0", "#c98e62", "#8d5a3b", "#ffdcb8"];
/** Fans in every row of the stands (made once, the same every time), most in your colour on your side. */
function makeFans(): Fan[] {
  const out: Fan[] = [];
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let row = 0; row < STEPS; row++) {
    const r = STAND_IN + row * STEP_RUN + STEP_RUN * 0.55, y = 0.5 + row * STEP_RISE;
    const n = Math.floor((Math.PI * 2 * r) / 0.95);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + row * 0.13;
      if (rand() < 0.12) continue;
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(z) < 2.6 && row < 5) continue; // the tunnels behind the podiums
      const team = x < -4 ? VIOLET : x > 4 ? LIME : null;
      out.push({ x, z, y, phase: rand() * Math.PI * 2, shirt: new THREE.Color(team && rand() < 0.7 ? team : SHIRTS[Math.floor(rand() * SHIRTS.length)]), skin: new THREE.Color(SKINS[Math.floor(rand() * SKINS.length)]) });
    }
  }
  return out;
}

/** The crowd: a body and a head each, bobbing, jumping up when they cheer (each time `cheer` changes). */
function Crowd({ cheer }: { cheer: number }) {
  const bodies = useRef<THREE.InstancedMesh>(null), heads = useRef<THREE.InstancedMesh>(null);
  const fans = useMemo(() => makeFans(), []);
  const cheered = useRef({ cheer, at: -10 });
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useLayoutEffect(() => {
    fans.forEach((fan, i) => { bodies.current?.setColorAt(i, fan.shirt); heads.current?.setColorAt(i, fan.skin); });
    if (bodies.current?.instanceColor) bodies.current.instanceColor.needsUpdate = true;
    if (heads.current?.instanceColor) heads.current.instanceColor.needsUpdate = true;
  }, [fans]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (cheer !== cheered.current.cheer) cheered.current = { cheer, at: t };
    const excite = Math.max(0, 1 - (t - cheered.current.at) / 1.8);
    fans.forEach((fan, i) => {
      const hop = Math.max(0, Math.sin(t * (3 + excite * 6) + fan.phase)) * (0.08 + excite * 0.45);
      dummy.position.set(fan.x, fan.y + 0.55 + hop, fan.z);
      dummy.lookAt(0, fan.y + 0.55 + hop, 0);
      dummy.updateMatrix();
      bodies.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.y += 0.62;
      dummy.updateMatrix();
      heads.current?.setMatrixAt(i, dummy.matrix);
    });
    if (bodies.current) bodies.current.instanceMatrix.needsUpdate = true;
    if (heads.current) heads.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <instancedMesh ref={bodies} args={[undefined, undefined, fans.length]} frustumCulled={false}><capsuleGeometry args={[0.26, 0.5, 4, 8]} /><meshStandardMaterial roughness={0.7} /></instancedMesh>
      <instancedMesh ref={heads} args={[undefined, undefined, fans.length]} frustumCulled={false}><sphereGeometry args={[0.2, 10, 8]} /><meshStandardMaterial roughness={0.6} /></instancedMesh>
    </group>
  );
}

/** A canvas texture, redrawn whenever `deps` change: the big screen and the wall banner. */
function useCanvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D) => void, deps: readonly unknown[], repeatX = 1) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const made = new THREE.CanvasTexture(canvas);
    made.colorSpace = THREE.SRGBColorSpace;
    made.wrapS = THREE.RepeatWrapping;
    made.repeat.set(repeatX, 1);
    return made;
  }, [width, height, repeatX]);
  useEffect(() => {
    if (!texture) return;
    draw((texture.image as HTMLCanvasElement).getContext("2d")!);
    texture.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps` are what the drawing shows
  }, [texture, ...deps]);
  return texture;
}

/** The big screen hung over the bowl: both names and scores on all four sides. */
function BigScreen({ myName, friendName, myScore, friendScore }: { myName: string; friendName: string; myScore: number; friendScore: number | null }) {
  const texture = useCanvasTexture(1024, 512, (g) => {
    g.fillStyle = "#0b0f1a"; g.fillRect(0, 0, 1024, 512);
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillStyle = GOLD; g.font = "900 64px Montserrat, Arial"; g.fillText("BATTLE ARENA", 512, 70);
    g.fillStyle = VIOLET; g.fillRect(40, 140, 420, 320); g.fillStyle = LIME; g.fillRect(564, 140, 420, 320);
    g.font = "900 46px Montserrat, Arial";
    g.fillStyle = "#fff"; g.fillText(myName.toUpperCase().slice(0, 14), 250, 195);
    g.fillStyle = "#103a17"; g.fillText(friendName.toUpperCase().slice(0, 14), 774, 195);
    g.font = "900 170px Montserrat, Arial";
    g.fillStyle = "#fff"; g.fillText(String(myScore), 250, 340);
    g.fillStyle = "#103a17"; g.fillText(friendScore === null ? "?" : String(friendScore), 774, 340);
    g.fillStyle = "#fff"; g.font = "900 60px Montserrat, Arial"; g.fillText("VS", 512, 300);
  }, [myName, friendName, myScore, friendScore]);
  return (
    <group position={[0, 12.5, 0]}>
      <mesh><boxGeometry args={[7.2, 3.8, 7.2]} /><meshStandardMaterial color="#141821" metalness={0.5} roughness={0.4} /></mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[Math.sin((i * Math.PI) / 2) * 3.61, 0, Math.cos((i * Math.PI) / 2) * 3.61]}>
          <planeGeometry args={[6.8, 3.4]} /><meshBasicMaterial map={texture ?? undefined} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, -2.05, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.9, 0.08, 6, 48]} /><meshBasicMaterial color={CYAN} toneMapped={false} /></mesh>
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <mesh key={`${sx}${sz}`} position={[sx * 3, 5, sz * 3]}><cylinderGeometry args={[0.04, 0.04, 6.5, 6]} /><Mat color="#3a404c" metal={0.6} /></mesh>))}
    </group>
  );
}

/** The floor, the wall round the top of the stands with its banner, and the roof with its ring of lights. */
function Building() {
  const wallR = STAND_IN + STEPS * STEP_RUN + 0.6;
  const banner = useCanvasTexture(2048, 128, (g) => {
    g.fillStyle = "#0e0a22"; g.fillRect(0, 0, 2048, 128);
    g.font = "900 84px Montserrat, Arial"; g.textBaseline = "middle";
    ["BATTLE ARENA", "★", "RELIQ", "★"].forEach((word, i) => { g.fillStyle = [GOLD, VIOLET, "#fff", LIME][i]; g.fillText(word, 40 + i * 520, 66); });
  }, [], -4); // negative: the banner is seen from inside the wall, so it's flipped back to read the right way
  return (
    <group>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[STAND_IN + 0.5, 64]} /><Mat color="#1a1d29" rough={0.4} metal={0.2} /></mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[BOWL_R + 4.6, BOWL_R + 4.85, 96]} /><meshBasicMaterial color={CYAN} toneMapped={false} /></mesh>
      <mesh position={[0, 10, 0]}><cylinderGeometry args={[wallR, wallR, 20, 64, 1, true]} /><meshStandardMaterial color="#0f1120" side={THREE.BackSide} roughness={0.9} /></mesh>
      <mesh position={[0, 9.4, 0]}><cylinderGeometry args={[wallR - 0.1, wallR - 0.1, 1.4, 64, 1, true]} /><meshBasicMaterial map={banner ?? undefined} side={THREE.BackSide} toneMapped={false} /></mesh>
      <mesh position={[0, 19.5, 0]} rotation={[Math.PI / 2, 0, 0]}><circleGeometry args={[wallR, 64]} /><meshStandardMaterial color="#090a14" side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 17, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[17, 0.35, 8, 96]} /><Mat color="#2a2f3a" metal={0.6} /></mesh>
      <mesh position={[0, 16.6, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[17, 0.08, 6, 96]} /><meshBasicMaterial color={CYAN} toneMapped={false} /></mesh>
      {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <Ball key={i} pos={[Math.cos(a) * 17, 16.5, Math.sin(a) * 17]} r={0.32} color={i % 2 ? "#fff6dc" : "#e9f7ff"} glow={3} />; })}
    </group>
  );
}

/** A spotlight aimed at a point, with a soft cone of light you can see in the dark. */
function SpotOn({ from, at, colour, intensity }: { from: readonly [number, number, number]; at: readonly [number, number, number]; colour: string; intensity: number }) {
  const { target, middle, turn, length } = useMemo(() => {
    const start = new THREE.Vector3(...from), end = new THREE.Vector3(...at);
    const aim = new THREE.Object3D();
    aim.position.copy(end);
    return { target: aim, middle: start.clone().lerp(end, 0.5), turn: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), start.clone().sub(end).normalize()), length: start.distanceTo(end) };
  }, [from, at]);
  return (
    <group>
      <primitive object={target} />
      <spotLight position={[...from]} target={target} color={colour} intensity={intensity} angle={0.32} penumbra={0.7} distance={50} decay={1.2} />
      <mesh position={middle} quaternion={turn}><cylinderGeometry args={[0.25, 2.6, length, 24, 1, true]} /><meshBasicMaterial color={colour} transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>
    </group>
  );
}
const SPOTS = [
  { from: [0, 17, 0], at: [0, 0.5, 0], colour: "#e8f4ff", intensity: 420 },
  { from: [-8, 16, 6], at: [-(BOWL_R + 3.6), 2, 0], colour: VIOLET, intensity: 360 },
  { from: [8, 16, -6], at: [BOWL_R + 3.6, 2, 0], colour: LIME, intensity: 360 },
] as const;

/** Light beams sweeping round the stands, for show. */
function SweepingBeams() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (group.current) group.current.rotation.y += dt * 0.25; });
  return (
    <group ref={group}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2, colour = [VIOLET, CYAN, LIME][i % 3];
        return <mesh key={i} position={[Math.cos(a) * 12, 9, Math.sin(a) * 12]} rotation={[0, -a, -0.55]}><cylinderGeometry args={[0.2, 1.8, 17, 16, 1, true]} /><meshBasicMaterial color={colour} transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} /></mesh>;
      })}
    </group>
  );
}

function BeamMaterial({ colour, glow = false }: { colour: string; glow?: boolean }) {
  return glow
    ? <meshBasicMaterial color={colour} transparent opacity={0.32} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    : <meshBasicMaterial color={colour} toneMapped={false} />;
}
/** A beam of light one metre long along x, with a soft glow round it (stretched to length each frame). */
function Beam({ colour }: { colour: string }) {
  return (
    <>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.22, 0.22, 1, 12]} /><BeamMaterial colour={colour} /></mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.6, 0.6, 1, 16]} /><BeamMaterial colour={colour} glow /></mesh>
    </>
  );
}

/** How hard a right answer kicks its beam forward (a share of the way across), and a POWER UP's kick. */
const KICK = 0.28, POWER_KICK = 0.5;
/** Seconds after the finish starts that the loser's beam snaps. */
const SNAP_AT = 0.7;

/**
 * The two tops and the battle in light. Before the battle they wait on the launchers; at LAUNCH they fly
 * into the bowl and the beams light up. Each right answer kicks that side's beam forward (a POWER UP
 * kicks harder). At the finish the clash point is pushed all the way, the loser's beam snaps and their
 * top is blasted out over the rim.
 */
function Duel({ stage, clash, mySurges, friendSurges, power, outcome }: { stage: ArenaStage; clash: number; mySurges: number; friendSurges: number; power: boolean; outcome: ArenaOutcome | null }) {
  const myTop = useRef<THREE.Group>(null), friendTop = useRef<THREE.Group>(null);
  const violet = useRef<THREE.Group>(null), lime = useRef<THREE.Group>(null), spark = useRef<THREE.Group>(null), blast = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const state = useRef({ stage, stageAt: 0, kick: 0, at: 0, mine: mySurges, theirs: friendSurges });
  const beamY = bowlY(DUEL_X) + 0.42 * TOP_SCALE;
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime, s = state.current;
    if (s.stage !== stage) { s.stage = stage; s.stageAt = t; }
    if (mySurges !== s.mine) { s.kick += (mySurges - s.mine) * (power ? POWER_KICK : KICK); s.mine = mySurges; }
    if (friendSurges !== s.theirs) { s.kick -= (friendSurges - s.theirs) * KICK; s.theirs = friendSurges; }
    s.kick = ease(s.kick, 0, 3, dt);
    const since = t - s.stageAt;
    // The side that loses: 1 = the friend's (lime, +x), -1 = mine (violet, -x), 0 = nobody.
    const loser = outcome === "me" ? 1 : outcome === "friend" ? -1 : 0;
    const finishing = stage === "finish" && loser !== 0;
    s.at = ease(s.at, finishing ? loser * 1.2 : THREE.MathUtils.clamp(clash * 0.85 + s.kick, -1, 1), finishing ? 4 : 6, dt);
    const x = s.at * DUEL_X;
    const snapped = finishing && since > SNAP_AT;
    const lit = stage === "battle" ? since > 0.75 : stage === "finish";

    for (const [top, side] of [[myTop.current, -1], [friendTop.current, 1]] as const) {
      if (!top) continue;
      top.rotation.y += dt * (lit ? 40 : 8);
      top.visible = true;
      if (stage === "intro" || stage === "countdown") {
        top.position.set(side * LAUNCHER_X, LAUNCHER_Y + Math.sin(t * 3 + side) * 0.04, 0);
        top.rotation.set(0, top.rotation.y, 0);
      } else if (!lit) {
        // LAUNCH: an arc from the launcher down into the bowl.
        const p = Math.min(1, since / 0.75), ex = side * DUEL_X;
        top.position.set(THREE.MathUtils.lerp(side * LAUNCHER_X, ex, p), THREE.MathUtils.lerp(LAUNCHER_Y, bowlY(ex), p) + Math.sin(p * Math.PI) * 1.6, 0);
      } else if (snapped && side === loser) {
        // Blasted out: up, over the rim and away, tumbling.
        const f = since - SNAP_AT;
        top.position.set(side * (DUEL_X + f * 11), bowlY(DUEL_X) + f * 9 - f * f * 6, f * 2.5);
        top.rotation.set(f * 5, top.rotation.y, f * 9 * side);
        top.visible = f < 3;
      } else {
        top.position.set(side * DUEL_X + (stage === "battle" ? Math.sin(t * 9 + side) * 0.05 : 0), bowlY(DUEL_X) + 0.02, 0);
        top.rotation.set(0, top.rotation.y, Math.sin(t * 2 + side) * 0.06);
      }
    }

    const thick = 1 + Math.sin(t * 22) * 0.08 + Math.abs(s.kick) * 1.4;
    const stretch = (group: THREE.Group | null, from: number, to: number, show: boolean) => {
      if (!group) return;
      group.visible = show && lit && Math.abs(to - from) > 0.01;
      group.position.set((from + to) / 2, beamY, 0);
      group.scale.set(Math.max(0.01, Math.abs(to - from)), thick, thick);
    };
    // After the snap the winner's beam reaches right across; the loser's is gone.
    stretch(violet.current, -DUEL_X, snapped && loser === 1 ? DUEL_X : x, !(snapped && loser === -1));
    stretch(lime.current, snapped && loser === -1 ? -DUEL_X : x, DUEL_X, !(snapped && loser === 1));
    if (spark.current) {
      spark.current.visible = lit && !snapped;
      spark.current.position.set(x, beamY, 0);
      spark.current.scale.setScalar((1 + Math.sin(t * 18) * 0.12 + Math.sin(t * 7) * 0.08) * (1 + Math.abs(s.kick) * 1.5));
      spark.current.rotation.z = t * 3;
    }
    if (blast.current) {
      const f = snapped ? since - SNAP_AT : -1;
      blast.current.visible = f >= 0 && f < 0.8;
      blast.current.position.set(loser * DUEL_X, beamY, 0);
      blast.current.scale.setScalar(1 + Math.max(0, f) * 9);
      (blast.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.9 - f * 1.2);
    }
    if (light.current) { light.current.position.set(x, beamY + 0.6, 0); light.current.intensity = lit ? 16 + Math.abs(s.kick) * 40 : 0; }
  });
  return (
    <group>
      <group ref={myTop} scale={TOP_SCALE}><TopBody colour={VIOLET} power={power} /></group>
      <group ref={friendTop} scale={TOP_SCALE}><TopBody colour={LIME} /></group>
      <group ref={violet} visible={false}><Beam colour={VIOLET} /></group>
      <group ref={lime} visible={false}><Beam colour={LIME} /></group>
      <group ref={spark} visible={false}>
        <mesh><sphereGeometry args={[0.55, 20, 16]} /><BeamMaterial colour="#ffffff" /></mesh>
        <mesh><sphereGeometry args={[1.15, 20, 16]} /><BeamMaterial colour="#fff4c2" glow /></mesh>
        {Array.from({ length: 8 }, (_, i) => <mesh key={i} rotation={[0, 0, (i / 8) * Math.PI * 2]}><boxGeometry args={[2.2, 0.06, 0.06]} /><BeamMaterial colour={i % 2 ? VIOLET : LIME} /></mesh>)}
      </group>
      <mesh ref={blast} visible={false}><sphereGeometry args={[0.6, 20, 16]} /><meshBasicMaterial color="#fff4c2" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      <pointLight ref={light} intensity={0} distance={14} color="#fff1c8" />
    </group>
  );
}

/**
 * The camera: a slow sweep round the arena for the intro, down behind your podium for the battle
 * (shaking each time `shake` changes, when a beam surges), and out to the side to watch the finish.
 */
function ArenaCamera({ stage, shake }: { stage: ArenaStage; shake: number }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 2, 0));
  const kick = useRef({ shake, amount: 0 });
  const goal = useMemo(() => ({ pos: new THREE.Vector3(), at: new THREE.Vector3() }), []);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    if (shake !== kick.current.shake) kick.current = { shake, amount: 0.35 };
    kick.current.amount = ease(kick.current.amount, 0, 5, dt);
    let rate = 2.2;
    if (stage === "intro") {
      const a = -Math.PI * 0.85 + t * 0.12;
      goal.pos.set(Math.cos(a) * 27, 12, Math.sin(a) * 27); goal.at.set(0, 2, 0); rate = 1.2;
    } else if (stage === "finish") {
      goal.pos.set(-3, 8.5, 19); goal.at.set(1.5, 2.4, 0); rate = 1.6;
    } else {
      // Behind your podium and off to one side, so the beams run across the screen and you see them push.
      goal.pos.set(-17, 8.5, 12.5); goal.at.set(1.5, 1.2, -0.5);
    }
    camera.position.set(ease(camera.position.x, goal.pos.x, rate, dt), ease(camera.position.y, goal.pos.y, rate, dt), ease(camera.position.z, goal.pos.z, rate, dt));
    look.current.lerp(goal.at, 1 - Math.exp(-rate * dt));
    const k = kick.current.amount;
    camera.lookAt(look.current.x + Math.sin(t * 61) * k, look.current.y + Math.cos(t * 53) * k, look.current.z + Math.sin(t * 47) * k * 0.6);
  });
  return null;
}

export type BattleArenaProps = {
  stage: ArenaStage; clash: number; mySurges: number; friendSurges: number; power: boolean; outcome: ArenaOutcome | null;
  /** Changes each time the crowd should cheer. */
  cheer: number; myName: string; friendName: string; myScore: number; friendScore: number | null;
};

/** The whole arena room, lit for a night match. Mount inside a <Canvas>. */
export function BattleArenaScene({ stage, clash, mySurges, friendSurges, power, outcome, cheer, myName, friendName, myScore, friendScore }: BattleArenaProps) {
  return (
    <>
      <color attach="background" args={["#07050f"]} />
      <fog attach="fog" args={["#0a0618", 34, 70]} />
      <ambientLight intensity={0.35} color="#9aa4ff" />
      <hemisphereLight args={["#6a5cff", "#120a1f", 0.45]} />
      {SPOTS.map((spot) => <SpotOn key={spot.colour} {...spot} />)}
      <pointLight position={[0, 6, 0]} intensity={30} distance={26} color="#bfe9ff" />
      <Building />
      <Stands />
      <Crowd cheer={cheer} />
      <SweepingBeams />
      <Bowl />
      <Spin speed={0.3}>{[0, 1, 2, 3, 4, 5].map((i) => <Ball key={i} pos={[Math.cos(i) * 6.5, bowlY(6.5) + 0.3, Math.sin(i) * 6.5]} r={0.12} color={i % 2 ? VIOLET : LIME} glow={3} />)}</Spin>
      <Podium side={-1} colour={VIOLET} />
      <Podium side={1} colour={LIME} />
      <Duel stage={stage} clash={clash} mySurges={mySurges} friendSurges={friendSurges} power={power} outcome={outcome} />
      <BigScreen myName={myName} friendName={friendName} myScore={myScore} friendScore={friendScore} />
      <ArenaCamera stage={stage} shake={mySurges + friendSurges} />
    </>
  );
}
