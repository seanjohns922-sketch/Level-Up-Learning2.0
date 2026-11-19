"use client";
import { createContext, useContext } from "react";
import { PREMIUM_HOME_STYLES, type PremiumHomeLevel, type PremiumHomeStyle } from "@/lib/world3d/premium-homes";
import { PremiumHome } from "./PremiumHomeModels";

type PremiumHomeWorld = { levels: Record<PremiumHomeStyle, PremiumHomeLevel>; night: boolean };

const ALL_LEVEL_ONE = Object.fromEntries(PREMIUM_HOME_STYLES.map((style) => [style, 1])) as Record<PremiumHomeStyle, PremiumHomeLevel>;

/** The learner's home levels and the time of day, read by every placed premium home. */
export const PremiumHomeWorldContext = createContext<PremiumHomeWorld>({ levels: ALL_LEVEL_ONE, night: false });

export function PlacedPremiumHome({ style }: { style: PremiumHomeStyle }) {
  const { levels, night } = useContext(PremiumHomeWorldContext);
  return <PremiumHome style={style} level={levels[style]} night={night} />;
}
