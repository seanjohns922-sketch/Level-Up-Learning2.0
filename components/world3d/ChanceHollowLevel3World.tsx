"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  ChanceHollowAdventurePortal,
  CHANCE_HOLLOW_DISTRICT_LAYOUT,
  ChanceHollowDistrictGate,
  ChanceHollowEnvironment,
  getChanceHollow3DVisuals,
  ChanceHollowReturnBeam,
  ChanceHollowWeekGate,
} from "@/components/world3d/ChanceHollowEnvironment";
import SharedRealmWorld3D, { type SharedRealmWorld3DConfig } from "@/components/world3d/SharedRealmWorld3D";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getChanceHollowWorldState } from "@/lib/world3d/chance-hollow-world-state";

export default function ChanceHollowLevel3World({ level = "Year 3" }: { level?: RealmLevelId }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1";
  const initialYaw = Number(searchParams.get("camYaw")) || 0;
  const visuals = getChanceHollow3DVisuals(level);
  const config = useMemo<SharedRealmWorld3DConfig>(() => ({
    realmId: "chance",
    realmName: "Chance Hollow",
    level,
    preview,
    accent: visuals.accent,
    sky: visuals.sky,
    backgroundImage: visuals.front,
    worldState: getChanceHollowWorldState({ preview, level }),
    refreshWorldState: () => getChanceHollowWorldState({ preview, level }),
    worldHref: `/world/chance-hollow?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`,
    fallbackHref: `/chance-hollow?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`,
    towerHref: `/world/tower?spawn=chance-return${preview ? "&teacher_preview=1" : ""}`,
    guidedAdventure: false,
    initialYaw,
    initialPitch: -0.06,
    districtLayout: CHANCE_HOLLOW_DISTRICT_LAYOUT,
    districtStart: [0, 0.75, 10.5],
    cityStart: [0, 0.75, 20],
    weekPositions: [[-4.35, 0, -4], [4.35, 0, -4]],
    cityReturnPosition: [0, 0, 22.5],
    towerReturnPosition: [0, 0, 31],
    Environment: ({ quality, districtInterior }) => <ChanceHollowEnvironment quality={quality} districtInterior={districtInterior} level={level} />,
    DistrictGate: ChanceHollowDistrictGate,
    WeekGate: ChanceHollowWeekGate,
    AdventurePortal: ChanceHollowAdventurePortal,
    ReturnBeam: ChanceHollowReturnBeam,
  }), [initialYaw, level, preview, visuals.accent, visuals.front, visuals.sky]);

  return <SharedRealmWorld3D config={config} />;
}
