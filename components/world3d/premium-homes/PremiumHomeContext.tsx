"use client";
import { createContext, useContext } from "react";
import { PREMIUM_HOME_STYLES, type PremiumHomeLevel, type PremiumHomeStyle } from "@/lib/world3d/premium-homes";
import { PremiumHome } from "./PremiumHomeModels";

/** Levels by style, the time of day, and whether the Tower Shield is unlocked (it has no placement). */
type PremiumHomeWorld = { levels: Record<PremiumHomeStyle, PremiumHomeLevel>; night: boolean; towerShield?: boolean };

const ALL_LEVEL_ONE = Object.fromEntries(PREMIUM_HOME_STYLES.map((style) => [style, 1])) as Record<PremiumHomeStyle, PremiumHomeLevel>;

/** The learner's home levels and the time of day, read by every placed premium home. */
export const PremiumHomeWorldContext = createContext<PremiumHomeWorld>({ levels: ALL_LEVEL_ONE, night: false });

export function PlacedPremiumHome({ style }: { style: PremiumHomeStyle }) {
  const { levels, night } = useContext(PremiumHomeWorldContext);
  return <PremiumHome style={style} level={levels[style]} night={night} />;
}

/** The Tower Shield round the Tower, once unlocked, at the learner's shield level. */
export function TowerShieldAtTower({ position }: { position: readonly [number, number, number] }) {
  const { levels, night, towerShield } = useContext(PremiumHomeWorldContext);
  if (!towerShield) return null;
  return <group position={[position[0], 0, position[2]]}><PremiumHome style="tower_shield" level={levels.tower_shield} night={night} /></group>;
}
