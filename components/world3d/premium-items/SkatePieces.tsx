"use client";
// Skate Kit pieces. Each is drawn from the same shape numbers the avatar rides (lib/world3d/skate-kit),
// centred on its plot with the front at +z. At Skate Kit Level 4 every piece goes neon.
import { createContext, useContext } from "react";
import { Block, M } from "@/components/world3d/premium-homes/HomeKit";
import { quarterDepth, SKATE_SCALE, skatePiece, type KitLevel, type SkatePiece } from "@/lib/world3d/skate-kit";

const NEON_PINK = "#ff4fd8";
const NEON_BLUE = "#3fd0ff";
const STEEL = "#c9ccd4";

/** Skate Kit level and time of day, read by every placed skate piece. */
export const SkateKitWorldContext = createContext<{ level: KitLevel; night: boolean }>({ level: 1, night: false });

function Trim({ size, pos, neon, night, color = NEON_PINK }: { size: [number, number, number]; pos: [number, number, number]; neon: boolean; night: boolean; color?: string }) {
  return neon
    ? <mesh position={pos}><boxGeometry args={size} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={night ? 2.6 : 0.8} /></mesh>
    : <Block size={size} pos={pos} color={STEEL} r={0.02} metal={0.6} rough={0.3} />;
}

function Quarter({ w, h, neon, night }: { w: number; h: number; neon: boolean; night: boolean }) {
  const segs = 12, surface = neon ? "#d7d2e8" : M.concrete;
  return (
    <group position={[0, 0, quarterDepth(h) / 2]}>
      {Array.from({ length: segs }, (_, i) => {
        const a0 = (i / segs) * (Math.PI / 2), a1 = ((i + 1) / segs) * (Math.PI / 2), a = (a0 + a1) / 2;
        return <Block key={i} size={[w, 0.07, h * (a1 - a0) + 0.02]} pos={[0, h - Math.cos(a) * h, -Math.sin(a) * h]} rot={[a, 0, 0]} color={surface} r={0.02} />;
      })}
      <Block size={[w, 0.07, 0.5]} pos={[0, h + 0.03, -h - 0.25]} color={M.slate} r={0.02} />
      {[-1, 1].flatMap((s) => [0.4, 0.9].map((f) => <Block key={`${s}${f}`} size={[0.06, h * f, 0.06]} pos={[s * (w / 2 - 0.05), (h * f) / 2, -h * (1 - Math.cos(Math.asin(Math.min(f, 0.999)))) - 0.1]} color={M.slate} r={0.015} />))}
      <Trim size={[w + 0.02, 0.05, 0.05]} pos={[0, h + 0.02, -h + 0.02]} neon={neon} night={night} />
    </group>
  );
}

function PieceModel({ piece, neon, night }: { piece: SkatePiece; neon: boolean; night: boolean }) {
  const s = piece.shape;
  switch (s.kind) {
    case "pad": return <Block size={[s.size, 0.06, s.size]} pos={[0, 0.03, 0]} color={neon ? "#2b2f3d" : M.concrete} r={0.03} />;
    case "quarter": return <Quarter w={s.w} h={s.h} neon={neon} night={night} />;
    case "spine": return <group>{[0, Math.PI].map((r) => <group key={r} rotation={[0, r, 0]}><group position={[0, 0, s.h / 2 - 0.25]}><Quarter w={s.w} h={s.h} neon={neon} night={night} /></group></group>)}</group>;
    case "kicker": return (
      <group>
        <Block size={[s.w, 0.05, Math.hypot(s.len, s.h)]} pos={[0, s.h / 2, 0]} rot={[Math.atan2(s.h, s.len), 0, 0]} color={neon ? NEON_BLUE : M.wood} r={0.02} />
        {[-1, 1].map((x) => <Block key={x} size={[0.05, s.h, s.len]} pos={[x * s.w / 2, s.h / 2 - 0.02, 0]} color={M.woodDark} r={0.02} />)}
      </group>
    );
    case "rail": return (
      <group>
        <Trim size={[s.len, 0.05, 0.05]} pos={[0, s.h, 0]} neon={neon} night={night} />
        {[-1, 1].map((x) => <Block key={x} size={[0.05, s.h, 0.05]} pos={[x * (s.len / 2 - 0.1), s.h / 2, 0]} color="#9aa0aa" r={0.015} />)}
      </group>
    );
    case "box": return (
      <group>
        <Block size={[s.w, s.h, s.d]} pos={[0, s.h / 2, 0]} color={M.slate} r={0.04} />
        <Trim size={[s.w + 0.04, 0.04, 0.05]} pos={[0, s.h, s.d / 2]} neon={neon} night={night} />
        {[-1, 1].map((x) => <Block key={x} size={[Math.hypot(s.ramp, s.h), 0.05, s.d]} pos={[x * (s.w / 2 + s.ramp / 2), s.h / 2, 0]} rot={[0, 0, -x * Math.atan2(s.h, s.ramp)]} color={neon ? NEON_BLUE : M.wood} r={0.02} />)}
      </group>
    );
    case "stairs": {
      const depth = s.steps * s.run;
      return (
        <group>
          {Array.from({ length: s.steps }, (_, i) => <Block key={i} size={[s.w, s.rise * (s.steps - i), s.run]} pos={[0, (s.rise * (s.steps - i)) / 2, depth / 2 - (i + 0.5) * s.run]} color={M.concrete} r={0.02} />)}
          <Trim size={[0.05, 0.05, depth + 0.05]} pos={[s.w / 2 - 0.08, s.rise * 2 + 0.34, 0]} neon={neon} night={night} />
          {[-1, 1].map((z) => <Block key={z} size={[0.04, 0.4, 0.04]} pos={[s.w / 2 - 0.08, s.rise * 2 + 0.14, z * (depth / 2 - 0.05)]} color="#9aa0aa" r={0.01} />)}
        </group>
      );
    }
    case "bowl": {
      const surface = neon ? "#d7d2e8" : M.concrete;
      return (
        <group>
          <mesh position={[0, s.depth / 2, 0]} receiveShadow><cylinderGeometry args={[s.r, s.r * 0.45, s.depth, 40, 1, true]} /><meshStandardMaterial color={surface} roughness={0.7} side={2} /></mesh>
          <mesh position={[0, s.depth / 2, 0]}><cylinderGeometry args={[s.r + 0.16, s.r + 0.16, s.depth, 40, 1, true]} /><meshStandardMaterial color={M.slate} roughness={0.7} /></mesh>
          <mesh position={[0, s.depth, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[s.r, s.r + 0.16, 40]} /><meshStandardMaterial color={M.slate} side={2} /></mesh>
          <mesh position={[0, s.depth + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[s.r, 0.04, 8, 48]} />{neon ? <meshStandardMaterial color={NEON_BLUE} emissive={NEON_BLUE} emissiveIntensity={night ? 2.6 : 0.8} /> : <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.3} />}</mesh>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[s.r * 0.45, 32]} /><meshStandardMaterial color={surface} /></mesh>
        </group>
      );
    }
  }
}

/** A placed skate piece at world scale; neon once the Skate Kit reaches Level 4. */
export function PlacedSkatePiece({ assetKey }: { assetKey: string }) {
  const { level, night } = useContext(SkateKitWorldContext);
  const piece = skatePiece(assetKey);
  if (!piece) return null;
  return <group scale={SKATE_SCALE}><PieceModel piece={piece} neon={level >= 4} night={night} /></group>;
}
