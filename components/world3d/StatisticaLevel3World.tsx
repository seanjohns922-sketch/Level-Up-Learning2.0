"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import SharedRealmWorld3D, { type SharedRealmWorld3DConfig } from "@/components/world3d/SharedRealmWorld3D";
import {
  StatisticaAdventurePortal,
  StatisticaDistrictGate,
  StatisticaEnvironment,
  STATISTICA_DISTRICT_LAYOUT,
  StatisticaReturnBeam,
  StatisticaWeekGate,
} from "@/components/world3d/StatisticaEnvironment";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { getStatisticaLevelTheme } from "@/lib/statistica-visuals";
import { getStatisticaWorldState } from "@/lib/world3d/statistica-world-state";

export default function StatisticaLevel3World({ level = "Year 1" }: { level?: RealmLevelId }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1";
  const initialYaw = Number(searchParams.get("camYaw")) || 0;
  const theme = getStatisticaLevelTheme(level);
  const guidedAdventure = level === "Year 1" || level === "Year 2";
  const config = useMemo<SharedRealmWorld3DConfig>(() => ({
    realmId: "statistics",
    realmName: "Statistica",
    level,
    preview,
    accent: theme.accent,
    sky: theme.sky,
    worldState: getStatisticaWorldState({ preview, level }),
    refreshWorldState: () => getStatisticaWorldState({ preview, level }),
    worldHref: `/world/statistica?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`,
    fallbackHref: `/statistica?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`,
    towerHref: `/world/tower?spawn=statistics-return${preview ? "&teacher_preview=1" : ""}`,
    guidedAdventure,
    initialYaw,
    initialPitch: 0.04,
    districtLayout: STATISTICA_DISTRICT_LAYOUT,
    guidedStart: [0, 0.75, 13],
    adventurePortalPosition: [0, 0, -6],
    districtStart: [0, 0.75, 11],
    cityStart: [0, 0.75, 19],
    weekPositions: [[-4.4, 0, -4], [4.4, 0, -4]],
    cityReturnPosition: [0, 0, 23],
    towerReturnPosition: [0, 0, 31],
    Environment: ({ quality, districtInterior }) => <StatisticaEnvironment theme={theme} quality={quality} districtInterior={districtInterior} />,
    DistrictGate: StatisticaDistrictGate,
    WeekGate: StatisticaWeekGate,
    AdventurePortal: StatisticaAdventurePortal,
    ReturnBeam: StatisticaReturnBeam,
  }), [guidedAdventure, initialYaw, level, preview, theme]);

  return <SharedRealmWorld3D config={config} />;
}
