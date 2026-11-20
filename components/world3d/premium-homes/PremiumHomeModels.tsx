"use client";
// The sixteen premium home models: four styles, four levels each.
import { Sparkles } from "@react-three/drei";
import type { ReactElement } from "react";
import { DEFENCE_STYLES, EVERYDAY_STYLES, PREMIUM_HOME_SPECS, type PremiumHomeLevel, type PremiumHomeStyle } from "@/lib/world3d/premium-homes";
import { FAIR_RIDE_MODELS } from "@/components/world3d/premium-items/FairRide";
import { TRAMPOLINE_MODELS } from "@/components/world3d/premium-items/TrampolineModels";
import { DEFENCE_MODELS, type TechLevel } from "@/components/world3d/premium-items/TowerDefenceModels";
import { BasketballCourt } from "@/components/world3d/premium-items/BasketballCourt";
import { EVERYDAY_MODELS } from "@/components/world3d/premium-items/EverydayItems";
import { C, M, Apartment, Ball, BigTrunk, Block, Bush, Chimney, Deck, Door, FairyLights, FlatRoof, GableRoof, GlassRail, GlassWall, GoldSparkle, Lantern, LeafCloud, LedStrip, Mat, Picket, Planter, Pod, Pool, RopeLadder, Slats, Slide, Solar, Stones, Walls, Window , type V3 } from "./HomeKit";

type Night = { night: boolean };

function HomeL1({ night }: Night) {
  return (
    <group>
      <Walls w={1.7} h={1.05} d={1.5} color={C.timber} planks={C.timberDark} />
      <GableRoof front w={1.7} d={1.5} h={0.95} y={1.3} color={C.red} shade={C.redDark} />
      <Door pos={[-0.25, 0.2, 0.75]} night={night} />
      <Window pos={[0.45, 0.8, 0.76]} w={0.3} h={0.36} night={night} shutters={C.red} />
      <Window pos={[0, 1.7, 0.76]} w={0.26} night={night} round />
      <group position={[0.95, 0, 0.55]}>{[0, 1, 2].map((i) => <mesh key={i} castShadow position={[0, 0.1 + (i === 2 ? 0.17 : 0), (i === 2 ? 0 : (i - 0.5) * 0.2)]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.09, 0.09, 0.55, 12]} /><Mat color={C.timberDark} /></mesh>)}</group>
      <Bush pos={[-0.95, 0, 0.6]} s={0.8} />
      <Stones from={1.1} to={1.9} />
    </group>
  );
}
function HomeL2({ night }: Night) {
  return (
    <group>
      <Walls w={2.3} h={1.35} d={1.8} color={C.cream} />
      <GableRoof front w={2.3} d={1.8} h={1.2} y={1.6} color={C.blue} shade={C.blueDark} />
      <Chimney pos={[0.7, 1.95, -0.45]} h={0.95} />
      <Door pos={[0, 0.2, 0.9]} night={night} color={C.blueDark} />
      <Window pos={[-0.72, 0.95, 0.91]} night={night} shutters={C.blue} box />
      <Window pos={[0.72, 0.95, 0.91]} night={night} shutters={C.blue} box />
      <Window pos={[0, 2.08, 0.91]} w={0.34} night={night} round />
      <Bush pos={[-1.25, 0, 0.9]} flowers={C.pink} /><Bush pos={[1.25, 0, 0.9]} s={0.85} flowers={C.yellow} />
      <Stones from={1.25} to={2.2} />
      {night ? <pointLight position={[0, 1, 0]} color={C.glow} intensity={2} distance={3} /> : null}
    </group>
  );
}
function HomeL3({ night }: Night) {
  return (
    <group>
      <Walls w={2.7} h={1.3} d={2} color={C.mint} />
      <Walls w={2.7} h={1.15} d={2} color={C.cream} y={1.5} plinth={false} />
      <GableRoof w={2.7} d={2} h={1.15} y={2.75} color={C.purple} shade={C.purpleDark} />
      <Chimney pos={[-0.8, 3.1, -0.4]} h={0.8} />
      {/* porch */}
      <Block size={[2.1, 0.12, 0.7]} pos={[0, 0.26, 1.35]} color={C.timber} r={0.04} />
      {[-0.95, 0.95].map((x) => <Block key={x} size={[0.12, 1.1, 0.12]} pos={[x, 0.85, 1.6]} color={C.trim} r={0.04} />)}
      <Block size={[2.3, 0.1, 0.85]} pos={[0, 1.45, 1.38]} rot={[0.12, 0, 0]} color={C.purple} r={0.04} />
      <Door pos={[0, 0.32, 1.0]} night={night} color={C.purpleDark} step={false} lantern={false} />
      <Lantern pos={[0, 1.32, 1.55]} night={night} s={1.1} />
      {[-0.88, 0.88].map((x) => <Window key={x} pos={[x, 0.95, 1.01]} night={night} shutters={C.purple} />)}
      {[-0.8, 0, 0.8].map((x) => <Window key={x} pos={[x, 2.2, 1.01]} w={0.42} h={0.5} night={night} shutters={x ? C.purple : undefined} box={!x} />)}
      {/* weathervane */}
      <Block size={[0.04, 0.5, 0.04]} pos={[0.6, 4.1, 0]} color={C.gold} r={0.015} metal={0.6} rough={0.3} />
      <Block size={[0.4, 0.08, 0.03]} pos={[0.6, 4.3, 0]} color={C.gold} r={0.02} metal={0.6} rough={0.3} />
      <Picket pos={[-1.35, 0, 1.95]} n={5} /><Picket pos={[1.35, 0, 1.95]} n={5} />
      <Bush pos={[-1.6, 0, 1.2]} flowers={C.pink} /><Bush pos={[1.6, 0, 1.2]} flowers={C.yellow} />
      <Stones from={1.75} to={2.4} />
      {night ? <pointLight position={[0, 1.2, 0.4]} color={C.glow} intensity={2.4} distance={3.5} /> : null}
      <GoldSparkle scale={[3, 3, 3]} pos={[0, 2.5, 0]} />
    </group>
  );
}
function HomeL4({ night }: Night) {
  return (
    <group>
      <HomeL3 night={night} />
      {/* side wing with a glass conservatory and a glowing roof lantern */}
      <group position={[2.35, 0, -0.1]}>
        <Walls w={1.6} h={1.3} d={1.8} color={C.mint} />
        <GableRoof front w={1.6} d={1.8} h={0.8} y={1.55} color={C.purple} shade={C.purpleDark} ridge={C.gold} />
        <Window pos={[0, 0.95, 0.91]} night={night} shutters={C.purple} box />
        <group position={[0, 0, 1.45]}>
          <Block size={[1.5, 0.22, 1.1]} pos={[0, 0.11, 0]} color={C.stone} r={0.04} />
          {[-0.7, 0, 0.7].map((x) => <Block key={x} size={[0.06, 1.0, 0.06]} pos={[x, 0.72, 0.52]} color={C.trim} r={0.02} />)}
          <mesh position={[0, 0.72, 0]}><boxGeometry args={[1.42, 1.0, 1.02]} /><meshStandardMaterial color={night ? C.glow : "#cdf1ff"} emissive={night ? C.glow : "#000"} emissiveIntensity={night ? 0.8 : 0} transparent opacity={0.5} roughness={0.1} /></mesh>
          <Block size={[1.55, 0.08, 1.15]} pos={[0, 1.24, 0]} color={C.trim} r={0.03} />
          <mesh position={[0, 1.42, 0]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[0.95, 0.35, 4]} /><meshStandardMaterial color="#cdf1ff" transparent opacity={0.55} roughness={0.1} /></mesh>
          <Bush pos={[-0.4, 0.22, 0]} s={0.6} flowers={C.pink} /><Bush pos={[0.4, 0.22, -0.1]} s={0.55} flowers={C.yellow} />
        </group>
      </group>
      <group position={[0, 3.95, 0]}>
        <Block size={[0.7, 0.12, 0.7]} pos={[0, 0, 0]} color={C.gold} r={0.04} metal={0.5} rough={0.3} />
        <mesh position={[0, 0.32, 0]}><cylinderGeometry args={[0.26, 0.3, 0.5, 8]} /><meshStandardMaterial color={C.glow} emissive={C.glow} emissiveIntensity={night ? 2.4 : 0.6} transparent opacity={0.85} /></mesh>
        <mesh position={[0, 0.68, 0]}><coneGeometry args={[0.36, 0.3, 8]} /><Mat color={C.gold} metal={0.5} rough={0.3} /></mesh>
      </group>
      {[[-2.2, 1.4], [3.4, 2.3]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><Block size={[0.3, 0.9, 0.3]} pos={[0, 0.45, 0]} color={C.stone} r={0.05} /><Block size={[0.4, 0.1, 0.4]} pos={[0, 0.94, 0]} color={C.gold} r={0.04} metal={0.5} rough={0.3} /><Ball pos={[0, 1.15, 0]} r={0.15} color={C.glow} glow={night ? 3 : 0.6} /></group>)}
      <Sparkles count={70} scale={[7, 5, 5]} position={[1, 2.4, 0]} size={7} speed={0.45} color={C.gold} />
    </group>
  );
}
function ModernL1({ night }: Night) {
  return (
    <group>
      <Block size={[1.9, 0.18, 1.5]} pos={[0, 0.09, 0]} color={M.concrete} r={0.04} />
      <Block size={[1.8, 1.15, 1.4]} pos={[0, 0.75, 0]} color={M.charcoal} r={0.05} />
      <Slats w={0.7} h={1.1} pos={[0.52, 0.75, 0.72]} />
      <GlassWall w={0.8} h={0.85} pos={[-0.35, 0.72, 0.71]} night={night} cols={2} />
      <FlatRoof w={1.8} d={1.4} y={1.32} />
      <Deck w={1.9} d={0.7} pos={[0, 0, 1.12]} />
      <Planter pos={[0.55, 0.15, 1.2]} w={0.6} />
      <Lantern pos={[-0.85, 1.1, 0.75]} night={night} />
      <Stones from={1.5} to={2.1} />
    </group>
  );
}
function ModernL2({ night }: Night) {
  return (
    <group>
      <Block size={[3.0, 0.2, 2.0]} pos={[0, 0.1, 0]} color={M.concrete} r={0.04} />
      <Block size={[1.9, 1.3, 1.8]} pos={[-0.5, 0.85, 0]} color={M.white} r={0.05} />
      <Block size={[1.1, 1.3, 1.5]} pos={[0.95, 0.85, -0.15]} color={M.charcoal} r={0.05} />
      <Slats w={1.0} h={1.25} pos={[0.95, 0.85, 0.62]} />
      <GlassWall w={1.5} h={1.0} pos={[-0.55, 0.82, 0.91]} night={night} cols={3} />
      <FlatRoof w={1.9} d={1.8} y={1.5} color={M.slate} />
      <FlatRoof w={1.1} d={1.5} y={1.5} />
      <Solar pos={[-0.5, 1.62, 0]} n={3} />
      <Deck w={2.0} d={0.8} pos={[-0.5, 0, 1.35]} />
      <Planter pos={[0.95, 0.2, 1.1]} w={0.9} />
      <LedStrip w={1.9} pos={[-0.5, 1.47, 0.98]} night={night} />
      <Door pos={[0.95, 0.2, 0.66]} night={night} color={M.woodDark} w={0.42} step={false} />
      {night ? <pointLight position={[-0.5, 0.9, 1.3]} color={M.led} intensity={2.4} distance={3.5} /> : null}
    </group>
  );
}
function ModernL3({ night }: Night) {
  return (
    <group>
      <Block size={[3.6, 0.2, 2.6]} pos={[0, 0.1, 0]} color={M.concrete} r={0.04} />
      <Block size={[2.6, 1.3, 1.9]} pos={[-0.35, 0.85, -0.2]} color={M.white} r={0.05} />
      <GlassWall w={1.5} h={1.0} pos={[-0.85, 0.82, 0.76]} night={night} cols={3} />
      <Block size={[0.9, 0.85, 0.06]} pos={[0.6, 0.63, 0.77]} color={M.slate} r={0.02} />
      {Array.from({ length: 5 }, (_, i) => <Block key={i} size={[0.9, 0.025, 0.02]} pos={[0.6, 0.3 + i * 0.16, 0.81]} color={M.charcoal} r={0.005} />)}
      {/* cantilevered timber upper storey */}
      <group position={[0.15, 1.5, -0.1]}>
        <Block size={[2.6, 1.15, 1.9]} pos={[0, 0.58, 0]} color={M.charcoal} r={0.05} />
        <Slats w={1.1} h={1.1} pos={[0.7, 0.58, 0.97]} />
        <GlassWall w={1.2} h={0.85} pos={[-0.55, 0.58, 0.96]} night={night} cols={2} />
        <Block size={[1.3, 0.1, 0.7]} pos={[-0.55, 0.05, 1.3]} color={M.white} r={0.03} />
        <GlassRail w={1.3} pos={[-0.55, 0.1, 1.63]} />
        <FlatRoof w={2.6} d={1.9} y={1.16} />
        <Solar pos={[0.2, 1.28, -0.1]} n={4} />
        <LedStrip w={2.6} pos={[0, -0.04, 0.98]} night={night} />
      </group>
      <Pool w={1.3} d={0.7} pos={[1.15, 0, 1.25]} night={night} />
      <Deck w={1.5} d={0.6} pos={[-0.7, 0, 1.15]} />
      <Planter pos={[-1.6, 0.2, 1.15]} w={0.5} />
      {night ? <pointLight position={[-0.6, 0.9, 1.4]} color={M.led} intensity={2.6} distance={4} /> : null}
      <GoldSparkle scale={[4, 3.5, 3]} pos={[0, 2, 0]} />
    </group>
  );
}
function ModernL4({ night }: Night) {
  return (
    <group>
      <ModernL3 night={night} />
      <group position={[-0.4, 2.8, -0.35]}>
        <Block size={[1.8, 0.95, 1.3]} pos={[0, 0.48, 0]} color={M.charcoal} r={0.05} />
        <GlassWall w={1.7} h={0.85} pos={[0, 0.48, 0.66]} night={night} cols={4} frame={C.gold} />
        <FlatRoof w={1.8} d={1.3} y={0.97} color={M.charcoal} />
        <Block size={[1.82, 0.05, 1.32]} pos={[0, 1.06, 0]} color={C.gold} r={0.02} metal={0.5} rough={0.3} />
      </group>
      <Pool w={1.0} d={0.8} pos={[0.95, 2.82, -0.1]} night={night} glow />
      <GlassRail w={1.1} pos={[0.95, 2.95, 0.42]} />
      {[[-1.65, 1.6], [1.95, 1.75]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><Block size={[0.12, 1.3, 0.12]} pos={[0, 0.65, 0]} color={M.charcoal} r={0.04} /><Block size={[0.3, 0.06, 0.3]} pos={[0, 1.32, 0]} color={C.gold} r={0.02} /><Ball pos={[0, 1.45, 0]} r={0.12} color={M.led} glow={night ? 3 : 0.5} /></group>)}
      <LedStrip w={3.6} pos={[0, 0.22, 1.31]} night={night} />
      <Sparkles count={70} scale={[6, 6, 5]} position={[0, 2.6, 0]} size={7} speed={0.45} color={C.gold} />
    </group>
  );
}
function TreeL1({ night }: Night) {
  return (
    <group>
      <BigTrunk h={2.6} />
      <LeafCloud y={3.2} r={1.2} />
      <Pod pos={[0, 1.6, 0.15]} w={0.9} h={0.7} d={0.8} night={night} />
      <RopeLadder from={0} to={1.6} x={0.2} z={0.8} />
    </group>
  );
}
function TreeL2({ night }: Night) {
  return (
    <group>
      <BigTrunk h={3.0} r={0.5} />
      <LeafCloud y={3.8} r={1.5} />
      <Pod pos={[0, 1.8, 0.2]} w={1.3} h={0.85} d={1.1} roof={C.red} roofShade={C.redDark} night={night} />
      <RopeLadder from={0} to={1.8} x={-0.5} z={1.0} />
      <Slide top={1.75} pos={[0.65, 0, 0.75]} rot={0.2} />
      <Lantern pos={[0.55, 2.4, 0.85]} night={night} />
    </group>
  );
}
function TreeL3({ night }: Night) {
  return (
    <group>
      <BigTrunk h={3.8} r={0.6} />
      <LeafCloud y={4.6} r={1.8} />
      <Pod pos={[0, 1.6, 0.25]} w={1.4} h={0.85} d={1.1} roof={C.blue} roofShade={C.blueDark} night={night} />
      <Pod pos={[0.25, 3.2, -0.2]} w={0.9} h={0.7} d={0.8} roof={C.purple} roofShade={C.purpleDark} night={night} />
      {/* small companion tree with a rope bridge */}
      <group position={[2.3, 0, 0.3]}><BigTrunk h={2.0} r={0.32} /><LeafCloud y={2.6} r={0.95} /><Block size={[1, 0.1, 1]} pos={[0, 1.6, 0]} color={C.timber} r={0.03} /></group>
      {Array.from({ length: 7 }, (_, i) => { const t = i / 6; return <Block key={i} size={[0.18, 0.05, 0.42]} pos={[0.95 + t * 0.9, 1.62 - Math.sin(t * Math.PI) * 0.15, 0.3]} color={C.timber} r={0.015} />; })}
      <Slide top={1.55} pos={[-0.75, 0, 0.85]} rot={-0.3} color={C.red} />
      <FairyLights from={[-0.9, 2.7, 0.9]} to={[0.9, 2.7, 0.9]} night={night} />
      <Lantern pos={[0.7, 2.25, 0.95]} night={night} />
      <GoldSparkle scale={[4, 4, 3]} pos={[0.6, 3, 0]} />
    </group>
  );
}
function TreeL4({ night }: Night) {
  return (
    <group>
      <BigTrunk h={4.6} r={0.75} glow />
      <LeafCloud y={5.5} r={2.2} color="#9a7bff" color2="#c39bff" glow={night ? 0.6 : 0.15} />
      <Pod pos={[0, 1.7, 0.3]} w={1.6} h={0.9} d={1.2} roof={C.gold} roofShade="#e0a91f" night={night} wall="#f3e2ff" />
      <Pod pos={[0.45, 3.4, -0.25]} w={1.1} h={0.75} d={0.9} roof={C.gold} roofShade="#e0a91f" night={night} wall="#f3e2ff" />
      <Pod pos={[-0.9, 4.4, 0.2]} w={0.8} h={0.6} d={0.7} roof={C.gold} roofShade="#e0a91f" night={night} wall="#f3e2ff" />
      {[[1.3, 4.6, 1.1], [-1.5, 5.2, 0.9], [0.6, 6.2, 1.0], [1.8, 5.6, -0.3], [-1.0, 6.0, -0.6]].map((p, i) => <mesh key={i} position={p as V3}><octahedronGeometry args={[0.18, 0]} /><Mat color="#7df9ff" glow={night ? 3 : 1.4} rough={0.2} /></mesh>)}
      <FairyLights from={[-1.1, 2.9, 1.0]} to={[1.1, 2.9, 1.0]} night={night} n={11} />
      <FairyLights from={[-0.4, 4.6, 0.7]} to={[1.2, 4.3, 0.5]} night={night} n={7} />
      <Slide top={1.65} pos={[-0.9, 0, 0.95]} rot={-0.3} color={C.gold} />
      {night ? <pointLight position={[0, 5.2, 1.5]} color="#c58bff" intensity={4} distance={7} /> : null}
      <Sparkles count={80} scale={[5, 6, 5]} position={[0, 4, 0]} size={7} speed={0.4} color="#c6ff6b" />
    </group>
  );
}
function AptL1({ night }: Night) {
  return (
    <group>
      <Apartment w={2.2} d={1.6} floors={3} color="#d0745a" night={night} seed={1} roof={<><Block size={[0.4, 0.3, 0.3]} pos={[0.6, 0.15, -0.3]} color="#c9ccd4" r={0.04} /><Block size={[0.4, 0.3, 0.3]} pos={[-0.6, 0.15, -0.3]} color="#c9ccd4" r={0.04} /></>} />
      <Planter pos={[-0.85, 0.3, 1.0]} w={0.5} /><Planter pos={[0.85, 0.3, 1.0]} w={0.5} />
    </group>
  );
}
function AptL2({ night }: Night) {
  return (
    <group>
      <Apartment w={2.6} d={1.8} floors={5} color={M.white} night={night} balcony={M.white} seed={2} roof={<><mesh position={[0.7, 0.35, -0.3]}><cylinderGeometry args={[0.3, 0.3, 0.7, 16]} /><Mat color="#b7c7d6" /></mesh><Solar pos={[-0.4, 0, 0]} n={3} rotX={-0.25} /></>} />
      <Slats w={0.5} h={3.1} pos={[1.32, 1.85, 0.6]} color={C.teal} />
      <Planter pos={[-1.0, 0.3, 1.15]} w={0.6} />
    </group>
  );
}
function AptL3({ night }: Night) {
  return (
    <group>
      <Apartment w={2.8} d={2} floors={8} color="#7fa8c9" night={night} balcony={M.white} seed={3} roof={<>
        <Block size={[2.6, 0.12, 1.8]} pos={[0, 0.06, 0]} color="#7a5a3f" r={0.03} />
        {[-0.9, -0.3, 0.3, 0.9].map((x, i) => <Ball key={x} pos={[x, 0.3, -0.5 + (i % 2) * 0.3]} r={0.22} color={i % 2 ? C.leaf : C.leaf2} />)}
        <Block size={[0.9, 0.06, 0.5]} pos={[0.3, 0.32, 0.5]} color={M.wood} r={0.02} />
        {[-1.3, 1.3].map((x) => <Block key={x} size={[0.05, 0.8, 0.05]} pos={[x, 0.4, 0.8]} color={M.charcoal} r={0.02} />)}
        <FairyLights from={[-1.3, 0.8, 0.8]} to={[1.3, 0.8, 0.8]} night={night} n={11} />
      </>} />
      {Array.from({ length: 8 }, (_, f) => f % 2 ? <Ball key={f} pos={[-1.15, 0.45 + f * 0.62, 1.2]} r={0.12} color={C.leaf} /> : null)}
      <Planter pos={[-1.1, 0.3, 1.25]} w={0.6} /><Planter pos={[1.1, 0.3, 1.25]} w={0.6} />
      <GoldSparkle scale={[3.5, 6, 3]} pos={[0, 3, 0]} />
    </group>
  );
}
function AptL4({ night }: Night) {
  return (
    <group>
      <Apartment w={2.8} d={2.2} floors={12} color="#2f3a52" night={true} balcony={M.charcoal} seed={4} roof={<>
        <Pool w={1.4} d={0.9} pos={[-0.4, 0, -0.2]} night={night} glow />
        <mesh position={[0.85, 0.05, 0.3]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.45, 28]} /><Mat color={M.charcoal} /></mesh>
        <mesh position={[0.85, 0.06, 0.3]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.32, 0.38, 28]} /><Mat color={M.led} glow={night ? 2.4 : 0.6} /></mesh>
        <GlassRail w={2.8} pos={[0, 0.05, 1.1]} />
        <mesh position={[0, 0.9, -0.6]}><octahedronGeometry args={[0.35, 0]} /><Mat color="#7df9ff" glow={night ? 3 : 1.4} rough={0.2} /></mesh>
      </>} />
      {[0, 1, 2, 3].map((i) => <LedStrip key={i} w={0.04} pos={[(i < 2 ? -1 : 1) * 1.42, 4.0, (i % 2 ? -1 : 1) * 1.12]} night={night} />)}
      {[-1.42, 1.42].flatMap((x) => [-1.12, 1.12].map((z) => <Block key={`${x}${z}`} size={[0.05, 7.6, 0.05]} pos={[x, 4.1, z]} color={C.gold} r={0.015} glow={night ? 1.5 : 0.2} metal={0.4} rough={0.3} />))}
      {[[-1.7, 1.6], [1.7, 1.6]].map(([x, z], i) => <group key={i} position={[x, 0, z]}><Block size={[0.12, 1.3, 0.12]} pos={[0, 0.65, 0]} color={M.charcoal} r={0.04} /><Ball pos={[0, 1.4, 0]} r={0.12} color={M.led} glow={night ? 3 : 0.5} /></group>)}
      {night ? <pointLight position={[0, 8.4, 0]} color="#7df9ff" intensity={4} distance={6} /> : null}
      <Sparkles count={80} scale={[4, 9, 4]} position={[0, 4.5, 0]} size={7} speed={0.4} color={C.gold} />
    </group>
  );
}

/** Model units to world metres: a 0.86 door becomes about 2.6 m, comfortably above the 1.98 m explorer. */
export const PREMIUM_HOME_SCALE = 3.0;
/** Taller storeys for the apartments (their floors are modelled short), stretching the whole block evenly. */
const STYLE_STRETCH: Partial<Record<PremiumHomeStyle, number>> = { apartment: 1.3 };

type LevelModels = readonly [(p: Night) => ReactElement, (p: Night) => ReactElement, (p: Night) => ReactElement, (p: Night) => ReactElement];
/** The defence models take their level directly; give each level its own component like the homes. */
function byLevel(Model: (p: { level: TechLevel }) => ReactElement): LevelModels {
  return ([1, 2, 3, 4] as const).map((level) => {
    const AtLevel = () => <Model level={level} />;
    AtLevel.displayName = `${Model.name}Level${level}`;
    return AtLevel;
  }) as unknown as LevelModels;
}
const DEFENCE_LEVEL_MODELS = Object.fromEntries(DEFENCE_STYLES.map((style) => [style, byLevel(DEFENCE_MODELS[style])])) as Record<(typeof DEFENCE_STYLES)[number], LevelModels>;
/** Models that take their level and the time of day. */
function byLevelAndNight(Model: (p: { level: PremiumHomeLevel; night: boolean }) => ReactElement): LevelModels {
  return ([1, 2, 3, 4] as const).map((level) => {
    const AtLevel = ({ night }: Night) => <Model level={level} night={night} />;
    AtLevel.displayName = `${Model.name}Level${level}`;
    return AtLevel;
  }) as unknown as LevelModels;
}
const EVERYDAY_LEVEL_MODELS = Object.fromEntries(EVERYDAY_STYLES.map((style) => [style, byLevelAndNight(EVERYDAY_MODELS[style])])) as Record<(typeof EVERYDAY_STYLES)[number], LevelModels>;

const MODELS: Record<PremiumHomeStyle, LevelModels> = {
  cottage: [HomeL1, HomeL2, HomeL3, HomeL4],
  modern: [ModernL1, ModernL2, ModernL3, ModernL4],
  treehouse: [TreeL1, TreeL2, TreeL3, TreeL4],
  apartment: [AptL1, AptL2, AptL3, AptL4],
  fair: FAIR_RIDE_MODELS,
  trampoline: TRAMPOLINE_MODELS,
  basketball: ([1, 2, 3, 4] as const).map((level) => {
    const Court = ({ night }: Night) => <BasketballCourt level={level} night={night} />;
    Court.displayName = `BasketballLevel${level}`;
    return Court;
  }) as unknown as LevelModels,
  ...DEFENCE_LEVEL_MODELS,
  ...EVERYDAY_LEVEL_MODELS,
};
/** World metres: decks, paths and slides sit in front, so each style shifts back to centre on its plot. */
const STYLE_DEPTH_OFFSET: Partial<Record<PremiumHomeStyle, number>> = { cottage: -1.63, modern: -0.94, treehouse: -1.44, apartment: -0.75 };
/** Wider levels add a wing or a second tree to one side; this keeps each level centred on its plot. */
const CENTRE_OFFSET: Partial<Record<`${PremiumHomeStyle}-${PremiumHomeLevel}`, number>> = {
  "cottage-4": -0.6,
  "modern-4": -0.12,
  "treehouse-3": -0.8,
};

export function PremiumHome({ style, level, night }: { style: PremiumHomeStyle; level: PremiumHomeLevel; night: boolean }) {
  const Model = MODELS[style][level - 1];
  return (
    <group position={[0, 0, STYLE_DEPTH_OFFSET[style] ?? 0]} scale={PREMIUM_HOME_SPECS[style].metres ? PREMIUM_HOME_SPECS[style].scale ?? 1 : [PREMIUM_HOME_SCALE, PREMIUM_HOME_SCALE * (STYLE_STRETCH[style] ?? 1), PREMIUM_HOME_SCALE]}>
      <group position={[CENTRE_OFFSET[`${style}-${level}`] ?? 0, 0, 0]}>
        <Model night={night} />
      </group>
    </group>
  );
}
