"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import SharedRealmWorld3D, { type SharedRealmWorld3DConfig } from "@/components/world3d/SharedRealmWorld3D";
import {
  PatternPeaksAdventurePortal,
  PatternPeaksDistrictGate,
  PatternPeaksEnvironment,
  PATTERN_PEAKS_DISTRICT_LAYOUT,
  PatternPeaksReturnBeam,
  PatternPeaksWeekGate,
} from "@/components/world3d/PatternPeaksEnvironment";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getPatternPeaksWorldState } from "@/lib/world3d/pattern-peaks-world-state";

export default function PatternPeaksLevel3World({ level = "Year 3" }: { level?: RealmLevelId }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1";
  const initialYaw = Number(searchParams.get("camYaw")) || 0;
  const config = useMemo<SharedRealmWorld3DConfig>(() => ({
    realmId: "pattern",
    realmName: "Pattern Peaks",
    level,
    preview,
    accent: "#39d9a0",
    sky: "#a9c9df",
    worldState: getPatternPeaksWorldState({ preview, level }),
    refreshWorldState: () => getPatternPeaksWorldState({ preview, level }),
    worldHref: `/world/pattern-peaks?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`,
    fallbackHref: `/pattern-peaks?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`,
    towerHref: `/world/tower?spawn=pattern-return${preview ? "&teacher_preview=1" : ""}`,
    guidedAdventure: false,
    initialYaw,
    initialPitch: -0.06,
    districtLayout: PATTERN_PEAKS_DISTRICT_LAYOUT,
    districtStart: [0, 0.75, 10.5],
    cityStart: [0, 0.75, 20],
    weekPositions: [[-4.35, 0, -4], [4.35, 0, -4]],
    cityReturnPosition: [0, 0, 22.5],
    towerReturnPosition: [0, 0, 31],
    Environment: PatternPeaksEnvironment,
    DistrictGate: PatternPeaksDistrictGate,
    WeekGate: PatternPeaksWeekGate,
    AdventurePortal: PatternPeaksAdventurePortal,
    ReturnBeam: PatternPeaksReturnBeam,
  }), [initialYaw, level, preview]);

  return <SharedRealmWorld3D config={config} />;
}
