"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ExplorerBodyAccessories } from "./ExplorerWearables";
import { adventureOutfit } from "@/lib/avatar/adventure-outfits";
import { AdventureOutfitDetails } from "./AdventureOutfitDetails";
import { realmOutfit } from "@/lib/avatar/realm-outfits";
import { RealmOutfitDetails } from "./RealmOutfitDetails";
import { ExplorerAvatarHead, ExplorerCharacterGear } from "./ExplorerAvatarDetails";
import { PremiumExplorerHead } from "./PremiumExplorerAvatar";
import type { AvatarOutfit } from "@/components/avatar/StudentAvatar";

/** The upgraded everyday avatar body: a shaped hoodie with hood, pocket and
 *  drawstrings, shoulders, cuffed sleeves, mitten hands, tapered trousers and
 *  soled shoes. Same frame as the old procedural body (ground at -0.73, hand
 *  anchor at -0.85 on each arm), so heads, outfits, capes, backpacks and held
 *  gear still fit. */

type Outfit = Required<AvatarOutfit>;
type MotionProps = { movingRef: React.MutableRefObject<boolean>; sprintingRef?: React.MutableRefObject<boolean> };

const TORSO_DEPTH = 0.58;
const tone = (hex: string, amount: number) => {
  const c = new THREE.Color(hex);
  return (amount < 0 ? c.multiplyScalar(1 + amount) : c.lerp(new THREE.Color("#ffffff"), amount)).getStyle();
};
const lathe = (profile: [number, number][], segments = 40) =>
  new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), segments);

// Profiles are [radius, height]. Built once and shared by every avatar.
const TORSO = lathe([[0.001, -0.04], [0.33, -0.03], [0.345, 0.02], [0.335, 0.14], [0.35, 0.3], [0.375, 0.48], [0.37, 0.6], [0.33, 0.7], [0.24, 0.79], [0.13, 0.84], [0.001, 0.845]]);
const HEM = new THREE.TorusGeometry(0.338, 0.035, 10, 40);
const SLEEVE_LONG = lathe([[0.001, 0.0], [0.09, 0.0], [0.118, -0.06], [0.118, -0.3], [0.108, -0.58], [0.001, -0.6]], 20);
const SLEEVE_SHORT = lathe([[0.001, 0.0], [0.09, 0.0], [0.125, -0.06], [0.13, -0.27], [0.001, -0.28]], 20);
const FOREARM = lathe([[0.001, -0.25], [0.085, -0.26], [0.08, -0.5], [0.072, -0.66], [0.001, -0.67]], 16);
const CUFF = new THREE.TorusGeometry(0.094, 0.026, 8, 20);
const LEG_JOGGER = lathe([[0.001, 0.06], [0.155, 0.06], [0.16, -0.08], [0.145, -0.3], [0.135, -0.42], [0.112, -0.53], [0.1, -0.565], [0.001, -0.57]], 22);
const LEG_JEANS = lathe([[0.001, 0.06], [0.155, 0.06], [0.155, -0.1], [0.14, -0.35], [0.135, -0.57], [0.001, -0.575]], 22);
const LEG_SLIM = lathe([[0.001, 0.06], [0.15, 0.06], [0.14, -0.1], [0.115, -0.35], [0.1, -0.57], [0.001, -0.575]], 22);
const LEG_SHORTS = lathe([[0.001, 0.06], [0.16, 0.06], [0.17, -0.1], [0.165, -0.22], [0.001, -0.23]], 22);
const SHIN = lathe([[0.001, -0.18], [0.095, -0.19], [0.09, -0.35], [0.075, -0.55], [0.001, -0.56]], 16);
const LEG_CUFF = new THREE.TorusGeometry(0.1, 0.017, 8, 20);

function Fabric({ colour, sheen = 0.6 }: { colour: string; sheen?: number }) {
  return <meshPhysicalMaterial color={colour} roughness={0.82} sheen={sheen} sheenRoughness={0.5} sheenColor={tone(colour, 0.45)} />;
}
function Skin({ colour }: { colour: string }) {
  return <meshPhysicalMaterial color={colour} roughness={0.55} sheen={0.25} sheenColor="#ffd9c7" />;
}

function Hand({ skin, side }: { skin: string; side: number }) {
  return (
    <group position={[0, -0.76, 0.01]}>
      <mesh scale={[0.092, 0.11, 0.078]} castShadow><sphereGeometry args={[1, 20, 14]} /><Skin colour={skin} /></mesh>
      <mesh position={[-side * 0.07, 0.03, 0.04]} rotation={[0.3, 0, side * 0.6]} scale={[0.032, 0.058, 0.032]} castShadow><sphereGeometry args={[1, 12, 10]} /><Skin colour={skin} /></mesh>
    </group>
  );
}

function Shoe({ o }: { o: Outfit }) {
  const sole = o.shoeStyle === "boots" ? "#3a2c21" : "#f5f1e8";
  const upper = o.shoes;
  if (o.shoeStyle === "sandals") {
    return (
      <group position={[0, -0.66, 0.06]}>
        <mesh position={[0, 0.005, 0.02]} scale={[0.1, 0.06, 0.17]} castShadow><sphereGeometry args={[1, 16, 12]} /><Skin colour={o.skin} /></mesh>
        <RoundedBox args={[0.22, 0.04, 0.38]} radius={0.018} position={[0, -0.05, 0.02]} castShadow><Fabric colour="#8a6a4a" sheen={0} /></RoundedBox>
        {[-0.05, 0.08].map((z) => <mesh key={z} position={[0, 0.01, z]} scale={[1, 0.6, 0.3]}><torusGeometry args={[0.1, 0.018, 6, 20, Math.PI]} /><Fabric colour={upper} /></mesh>)}
      </group>
    );
  }
  const tall = o.shoeStyle === "boots" ? 0.2 : o.shoeStyle === "hightops" ? 0.12 : 0;
  return (
    <group position={[0, -0.64, 0.06]}>
      <RoundedBox args={[0.22, 0.055, 0.37]} radius={0.026} smoothness={4} position={[0, -0.055, 0.03]} castShadow><Fabric colour={sole} sheen={0} /></RoundedBox>
      <mesh position={[0, 0.0, 0.035]} scale={[0.118, 0.085, 0.185]} castShadow><sphereGeometry args={[1, 22, 16]} /><Fabric colour={upper} /></mesh>
      <mesh position={[0, -0.005, 0.15]} scale={[0.1, 0.06, 0.075]}><sphereGeometry args={[1, 16, 12]} /><Fabric colour={o.shoeStyle === "boots" ? tone(upper, -0.25) : sole} sheen={0} /></mesh>
      {tall > 0 && <><mesh position={[0, 0.04 + tall / 2, -0.02]} castShadow><cylinderGeometry args={[0.1, 0.122, tall, 18]} /><Fabric colour={upper} /></mesh><mesh position={[0, 0.04 + tall, -0.02]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.1, 0.014, 6, 18]} /><Fabric colour={tone(upper, 0.35)} /></mesh></>}
      {o.shoeStyle !== "boots" && [0.05, 0.1].map((z) => <mesh key={z} position={[0, 0.095 - (z - 0.05) * 0.5, z]} rotation={[0.5, 0, 0]}><boxGeometry args={[0.1, 0.012, 0.012]} /><meshStandardMaterial color={o.shirtTrim} /></mesh>)}
      {o.shoeStyle === "boots" && [0.06, 0.13].map((y) => <mesh key={y} position={[0, y, 0.09]}><boxGeometry args={[0.16, 0.014, 0.02]} /><meshStandardMaterial color={tone(upper, 0.3)} /></mesh>)}
    </group>
  );
}

function Leg({ o, side }: { o: Outfit; side: number }) {
  const shorts = o.bottom === "shorts" || o.bottom === "skirt" || o.top === "dress";
  const geometry = o.bottom === "jeans" ? LEG_JEANS : o.bottom === "leggings" ? LEG_SLIM : shorts ? LEG_SHORTS : LEG_JOGGER;
  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow><Fabric colour={o.pants} sheen={o.bottom === "jeans" ? 0.2 : 0.7} /></mesh>
      {shorts && <mesh geometry={SHIN} castShadow><Skin colour={o.skin} /></mesh>}
      {!shorts && (o.bottom === "joggers" || o.bottom === "trackpants") && <mesh geometry={LEG_CUFF} position={[0, -0.545, 0]} rotation={[Math.PI / 2, 0, 0]}><Fabric colour={tone(o.pants, -0.1)} /></mesh>}
      {o.bottom === "trackpants" && <mesh position={[side * 0.15, -0.2, 0]} rotation={[0, 0, side * 0.04]}><boxGeometry args={[0.02, 0.6, 0.05]} /><meshStandardMaterial color={o.shirtTrim} /></mesh>}
      {o.bottom === "jeans" && <mesh position={[0, -0.56, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.135, 0.018, 6, 20]} /><Fabric colour={tone(o.pants, 0.15)} sheen={0} /></mesh>}
      <Shoe o={o} />
    </group>
  );
}

function Torso({ o }: { o: Outfit }) {
  const plain = !realmOutfit(o.top) && !adventureOutfit(o.top);
  const hooded = plain && (o.top === "hoodie" || o.top === "jacket");
  const shirt = o.shirt, trim = o.shirtTrim, dark = tone(shirt, -0.22);
  return (
    <group>
      <mesh geometry={TORSO} scale={[1, 1, TORSO_DEPTH]} castShadow receiveShadow><Fabric colour={shirt} /></mesh>
      <mesh geometry={HEM} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, TORSO_DEPTH, 1]}><Fabric colour={plain ? dark : tone(shirt, -0.12)} /></mesh>
      <mesh position={[0, 0.86, 0]} castShadow><cylinderGeometry args={[0.095, 0.11, 0.14, 18]} /><Skin colour={o.skin} /></mesh>
      {hooded && <>
        <mesh position={[0, 0.78, -0.07]} rotation={[1.25, 0, 0]} scale={[1, 1, 0.75]} castShadow><torusGeometry args={[0.175, 0.075, 12, 30]} /><Fabric colour={shirt} /></mesh>
        <mesh position={[0, 0.82, -0.2]} rotation={[0.35, 0, 0]} scale={[0.2, 0.13, 0.08]}><sphereGeometry args={[1, 16, 12]} /><Fabric colour={dark} /></mesh>
        {[-1, 1].map((side) => <group key={side}>
          <mesh position={[side * 0.065, 0.62, 0.218]} rotation={[0.1, 0, side * 0.05]}><cylinderGeometry args={[0.009, 0.009, 0.2, 6]} /><meshStandardMaterial color={trim} /></mesh>
          <mesh position={[side * 0.068, 0.51, 0.226]}><cylinderGeometry args={[0.014, 0.014, 0.04, 8]} /><meshStandardMaterial color={tone(trim, -0.3)} metalness={0.4} /></mesh>
        </group>)}
      </>}
      {plain && o.top === "hoodie" && <RoundedBox args={[0.38, 0.16, 0.03]} radius={0.04} smoothness={3} position={[0, 0.17, 0.198]} rotation={[-0.08, 0, 0]}><Fabric colour={dark} /></RoundedBox>}
      {plain && o.top === "jacket" && <>
        <mesh position={[0, 0.38, 0.21]}><boxGeometry args={[0.025, 0.74, 0.02]} /><meshStandardMaterial color={trim} metalness={0.5} roughness={0.35} /></mesh>
        {[-1, 1].map((side) => <RoundedBox key={side} args={[0.13, 0.09, 0.025]} radius={0.02} position={[side * 0.17, 0.2, 0.2]}><Fabric colour={dark} /></RoundedBox>)}
      </>}
      {plain && (o.top === "tshirt" || o.top === "jumper" || o.top === "dress") && <mesh position={[0, 0.8, 0.005]} rotation={[Math.PI / 2 + 0.2, 0, 0]} scale={[1, 0.85, 1]}><torusGeometry args={[0.135, 0.026, 8, 28]} /><Fabric colour={trim} /></mesh>}
      {plain && o.top === "polo" && <>
        {[-1, 1].map((side) => <mesh key={side} position={[side * 0.08, 0.79, 0.12]} rotation={[0.9, 0, side * 0.5]}><boxGeometry args={[0.14, 0.1, 0.018]} /><Fabric colour={trim} /></mesh>)}
        {[0.66, 0.58].map((y) => <mesh key={y} position={[0, y, 0.215]}><sphereGeometry args={[0.014, 8, 6]} /><meshStandardMaterial color={tone(trim, -0.3)} /></mesh>)}
      </>}
      {plain && o.top === "jumper" && <mesh position={[0, 0.42, 0.214]} scale={[1, 1, 0.3]}><torusGeometry args={[0.1, 0.018, 6, 4]} /><Fabric colour={trim} /></mesh>}
      {o.bottom === "skirt" || o.top === "dress" ? (
        <mesh position={[0, -0.12, 0]} castShadow><cylinderGeometry args={[0.34, 0.5, 0.34, 32, 1, true]} /><meshPhysicalMaterial color={o.top === "dress" ? shirt : o.pants} roughness={0.8} sheen={0.6} side={THREE.DoubleSide} /></mesh>
      ) : null}
    </group>
  );
}

export function StylisedStudentAvatar({ avatar, movingRef, sprintingRef }: MotionProps & { avatar: Outfit }) {
  const body = useRef<THREE.Group>(null);
  const chest = useRef<THREE.Group>(null);
  const legs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const arms = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const head = useRef<THREE.Group>(null);
  const phase = useRef(0);
  const short = avatar.top === "tshirt" || avatar.top === "polo";
  const sleeve = short ? SLEEVE_SHORT : SLEEVE_LONG;
  const cuffColour = useMemo(() => tone(avatar.shirt, -0.2), [avatar.shirt]);

  useFrame(({ clock }, delta) => {
    const moving = movingRef.current, sprinting = Boolean(sprintingRef?.current);
    phase.current += Math.min(delta, 0.05) * (sprinting ? 13.5 : 8.5);
    const t = clock.elapsedTime, ease = 1 - Math.exp(-delta * 14);
    const stride = moving ? Math.sin(phase.current) * (sprinting ? 0.78 : 0.62) : 0;
    const breathe = moving ? 0 : Math.sin(t * 2.1) * 0.012;
    const sway = moving ? 0 : Math.sin(t * 1.3) * 0.035;
    const lerp = (from: number, to: number) => THREE.MathUtils.lerp(from, to, ease);
    legs.forEach((leg, i) => { if (leg.current) leg.current.rotation.x = lerp(leg.current.rotation.x, i === 0 ? stride : -stride); });
    arms.forEach((arm, i) => {
      if (!arm.current) return;
      const swing = i === 0 ? -stride * 0.72 : stride * (avatar.held !== "none" ? 0.3 : 0.72);
      arm.current.rotation.x = lerp(arm.current.rotation.x, swing);
      arm.current.rotation.z = lerp(arm.current.rotation.z, (i === 0 ? -1 : 1) * (0.07 + (moving ? 0 : sway * 0.4)));
    });
    if (chest.current) chest.current.scale.set(1 + breathe * 0.6, 1 + breathe, 1 + breathe * 0.8);
    if (head.current) {
      head.current.rotation.z = lerp(head.current.rotation.z, moving ? 0 : sway * 0.5);
      head.current.position.y = lerp(head.current.position.y, -0.078 + breathe * 1.4);
    }
    if (body.current) {
      body.current.position.y = lerp(body.current.position.y, moving ? Math.abs(Math.sin(phase.current * 2)) * (sprinting ? 0.05 : 0.035) : 0);
      body.current.rotation.x = lerp(body.current.rotation.x, moving ? (sprinting ? 0.12 : 0.05) : 0);
    }
  });

  return (
    <group>
      <mesh position={[0, -0.725, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 32]} />
        <meshBasicMaterial color="#02090c" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <group ref={body}>
        {[-1, 1].map((side, i) => (
          <group key={side} ref={legs[i]} position={[side * 0.165, 0.02, 0]}><Leg o={avatar} side={side} /></group>
        ))}
        <group ref={chest}><Torso o={avatar} /></group>
        {[-1, 1].map((side, i) => (
          <group key={side} ref={arms[i]} position={[side * 0.43, 0.66, 0]}>
            <mesh position={[-side * 0.035, -0.03, 0]} scale={[0.112, 0.108, 0.115]} castShadow><sphereGeometry args={[1, 20, 14]} /><Fabric colour={avatar.shirt} /></mesh>
            <mesh geometry={sleeve} castShadow><Fabric colour={avatar.shirt} /></mesh>
            {short ? <mesh geometry={FOREARM} castShadow><Skin colour={avatar.skin} /></mesh> : <mesh geometry={CUFF} position={[0, -0.6, 0]} rotation={[Math.PI / 2, 0, 0]}><Fabric colour={cuffColour} /></mesh>}
            {short && <mesh position={[0, -0.27, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.127, 0.014, 6, 20]} /><Fabric colour={tone(avatar.shirt, -0.15)} /></mesh>}
            <Hand skin={avatar.skin} side={side} />
            {side === 1 && <group position={[0, -0.85, avatar.held === "patternox_codemaster_gauntlet" ? 0 : 0.08]} rotation={avatar.held === "patternox_codemaster_gauntlet" ? [0, 0, 0] : [0.25, 0, -0.17]}><ExplorerCharacterGear held={avatar.held} colour={avatar.heldColor || undefined} /></group>}
          </group>
        ))}
        <RealmOutfitDetails top={avatar.top} />
        <AdventureOutfitDetails top={avatar.top} />
        <ExplorerBodyAccessories o={avatar} movingRef={movingRef} />
        <group ref={head} scale={[1.1, 1.1, 1.1]} position={[0, -0.078, 0]}>
          {avatar.hairStyle === "swept" && avatar.face === "smile"
            ? <Suspense fallback={<ExplorerAvatarHead o={avatar} />}><PremiumExplorerHead avatar={avatar} /></Suspense>
            : <ExplorerAvatarHead o={avatar} />}
        </group>
      </group>
    </group>
  );
}
