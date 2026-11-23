"use client";
// The four boats: kayak, Aussie tinny, swan pedal boat and speedboat. Units are world metres (the explorer
// stands about 2 m tall); each faces +z and floats with the waterline at y = 0 of its own space.
import { useEffect, useMemo, type ReactNode } from "react";
import { ExtrudeGeometry, Path, Shape } from "three";
import { Ball, Block, Mat } from "@/components/world3d/premium-homes/HomeKit";
import type { BoatStyle } from "@/lib/world3d/boats";
import { Glow, WARM } from "./ItemKit";

const TIMBER = "#a8743f";

/** A boat's top-view outline (round stern, pointed bow) traced into a shape or a hole. */
function traceHull<T extends Shape | Path>(path: T, len: number, w: number, back = 0): T {
  const hw = w / 2, bow = len * 0.36, stern = -len / 2 + back, tip = len / 2 + back;
  path.moveTo(-hw * 0.9, stern);
  path.lineTo(hw * 0.9, stern);
  path.quadraticCurveTo(hw, stern, hw, stern + 0.2);
  path.lineTo(hw, tip - bow);
  path.quadraticCurveTo(hw, tip - bow * 0.25, 0, tip);
  path.quadraticCurveTo(-hw, tip - bow * 0.25, -hw, tip - bow);
  path.lineTo(-hw, stern + 0.2);
  path.quadraticCurveTo(-hw, stern, -hw * 0.9, stern);
  return path;
}
/** Extrudes a top-view shape upward from y = 0 to `h`, with soft edges. */
function extrudeUp(shape: Shape, h: number, bevel = 0.06) {
  const g = new ExtrudeGeometry(shape, { depth: h, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 16 });
  g.rotateX(Math.PI / 2); g.translate(0, h, 0);
  return g;
}
/** An open hull: the sides as a rim round a hollow, and a floor inside, so you see into the boat. */
function Hull({ len, w, h, color, deck = "#f4f4f4", stripe }: { len: number; w: number; h: number; color: string; deck?: string; stripe?: string }) {
  const [rim, floor] = useMemo(() => {
    const outline = traceHull(new Shape(), len, w);
    outline.holes.push(traceHull(new Path(), len * 0.84, w * 0.78, -len * 0.02));
    return [extrudeUp(outline, h), extrudeUp(traceHull(new Shape(), len * 0.86, w * 0.8, -len * 0.02), 0.05, 0)];
  }, [len, w, h]);
  useEffect(() => () => { rim.dispose(); floor.dispose(); }, [rim, floor]);
  return <group position={[0, -h * 0.45, 0]}>
    <mesh geometry={rim} castShadow receiveShadow><Mat color={color} rough={0.35} /></mesh>
    <mesh geometry={floor} position={[0, h * 0.25, 0]} receiveShadow><Mat color={deck} rough={0.6} /></mesh>
    {stripe ? <mesh geometry={rim} scale={[1.012, 0.16, 1.006]} position={[0, h * 0.62, 0]}><Mat color={stripe} rough={0.35} /></mesh> : null}
  </group>;
}
export function KayakModel({ colour = "#ffcf1a" }: { colour?: string; night?: boolean }) {
  return <group>
    <mesh position={[0, 0.08, 0]} scale={[0.34, 0.18, 1.7]} castShadow><sphereGeometry args={[1, 24, 14]} /><Mat color={colour} rough={0.35} /></mesh>
    <mesh position={[0, 0.2, -0.1]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.26, 0.42, 1]}><circleGeometry args={[1, 24]} /><Mat color="#1f2328" /></mesh>
    <mesh position={[0, 0.22, -0.1]} rotation={[Math.PI / 2, 0, 0]} scale={[0.26, 0.42, 1]}><torusGeometry args={[1, 0.08, 6, 24]} /><Mat color="#2c2f36" /></mesh>
    {/* The paddle across the cockpit. */}
    <group position={[0, 0.5, 0.3]} rotation={[0, 0.3, 0.35]}><Block size={[2.2, 0.04, 0.04]} pos={[0, 0, 0]} color="#2c2f36" r={0.015} />{[-1, 1].map((s) => <Block key={s} size={[0.42, 0.02, 0.16]} pos={[s * 1.15, 0, 0]} color="#e5302a" r={0.01} />)}</group>
  </group>;
}
export function TinnyModel({ colour = "#b8c2cc" }: { colour?: string; night?: boolean }) {
  return <group>
    <Hull len={3.8} w={1.5} h={0.62} color={colour} deck="#8d98a3" stripe="#2f6fd6" />
    {[0.6, -0.5].map((z) => <Block key={z} size={[1.36, 0.06, 0.32]} pos={[0, 0.22, z]} color={TIMBER} r={0.02} />)}
    {/* The outboard motor on the back. */}
    <group position={[0, 0.1, -1.95]}>
      <Block size={[0.42, 0.5, 0.46]} pos={[0, 0.42, -0.08]} color="#1f2328" r={0.08} />
      <Block size={[0.12, 0.9, 0.14]} pos={[0, -0.1, -0.16]} color="#2c2f36" r={0.03} />
      <Block size={[0.06, 0.06, 0.6]} pos={[0.12, 0.55, 0.32]} rot={[0.2, 0, 0]} color="#2c2f36" r={0.02} />
    </group>
  </group>;
}
export function SpeedboatModel({ colour = "#e5302a", night = false }: { colour?: string; night?: boolean }) {
  return <group>
    <Hull len={5.2} w={2.0} h={0.8} color="#f6f6f2" deck="#e8dcc8" stripe={colour} />
    {/* A swept windscreen, two seats, a back bench and the motor. */}
    <Block size={[1.7, 0.45, 0.05]} pos={[0, 0.6, 0.55]} rot={[-0.7, 0, 0]} color="#9fd8ff" r={0.03} />
    <Block size={[1.8, 0.1, 0.9]} pos={[0, 0.38, 1.1]} color="#f6f6f2" r={0.05} />
    {[-0.45, 0.45].map((x) => <group key={x} position={[x, 0.35, -0.2]}><Block size={[0.6, 0.18, 0.6]} pos={[0, 0, 0]} color={colour} r={0.08} /><Block size={[0.6, 0.6, 0.16]} pos={[0, 0.32, -0.28]} color={colour} r={0.08} /></group>)}
    <Block size={[1.7, 0.2, 0.6]} pos={[0, 0.35, -1.4]} color={colour} r={0.08} />
    <Block size={[0.5, 0.55, 0.5]} pos={[0, 0.55, -2.75]} color="#1f2328" r={0.1} />
    <Block size={[0.14, 0.8, 0.16]} pos={[0, 0.0, -2.85]} color="#2c2f36" r={0.03} />
    <Glow size={[0.07, 0, 0]} pos={[0.9, 0.5, 1.2]} round color="#3fe68a" night={night} />
    <Glow size={[0.07, 0, 0]} pos={[-0.9, 0.5, 1.2]} round color="#ff4a4a" night={night} />
  </group>;
}
export function SwanBoatModel({ night = false }: { night?: boolean }) {
  return <group>
    <mesh position={[0, 0.35, 0]} scale={[1.0, 0.55, 1.4]} castShadow><sphereGeometry args={[1, 28, 18]} /><Mat color="#f6f6f2" rough={0.4} /></mesh>
    <Block size={[1.3, 0.12, 1.2]} pos={[0, 0.72, -0.3]} color="#7fd0f0" r={0.05} />
    {/* The swan's neck and head. */}
    <mesh position={[0, 1.2, 1.05]} rotation={[-0.25, 0, 0]} castShadow><cylinderGeometry args={[0.14, 0.24, 1.3, 14]} /><Mat color="#f6f6f2" rough={0.4} /></mesh>
    <Ball pos={[0, 1.88, 1.2]} r={0.24} color="#f6f6f2" />
    <mesh position={[0, 1.84, 1.48]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.08, 0.26, 10]} /><Mat color="#ff8a2a" /></mesh>
    {[-1, 1].map((s) => <Ball key={s} pos={[s * 0.15, 1.95, 1.33]} r={0.04} color="#1f2328" />)}
    {[-1, 1].map((s) => <mesh key={s} position={[s * 0.92, 0.85, -0.3]} rotation={[0.3, s * 0.2, s * 0.5]} scale={[0.15, 0.5, 0.9]} castShadow><sphereGeometry args={[1, 16, 12]} /><Mat color="#ffffff" /></mesh>)}
    <Glow size={[0.06, 0, 0]} pos={[0, 1.5, -1.2]} round color={WARM} night={night} />
  </group>;
}
export const BOAT_MODELS = { kayak: KayakModel, tinny: TinnyModel, swan: SwanBoatModel, speedboat: SpeedboatModel } as const satisfies Record<BoatStyle, (props: { night?: boolean }) => ReactNode>;
