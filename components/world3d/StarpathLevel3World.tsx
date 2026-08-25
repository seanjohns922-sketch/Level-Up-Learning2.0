"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import SharedRealmWorld3D, { type SharedRealmWorld3DConfig } from "@/components/world3d/SharedRealmWorld3D";
import {
  StarpathAdventurePortal,
  StarpathDistrictGate,
  StarpathEnvironment,
  STARPATH_DISTRICT_LAYOUT,
  STARPATH_SURFACE_Y,
  StarpathReturnBeam,
  StarpathWeekGate,
} from "@/components/world3d/StarpathEnvironment";
import { getStarpathLevelTheme } from "@/lib/starpath-visuals";
import { getStarpathWorldState } from "@/lib/world3d/starpath-world-state";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

export default function StarpathLevel3World({ level = "Year 3" }: { level?: RealmLevelId }) {
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1";
  const initialYaw = Number(searchParams.get("camYaw")) || 0;
  const theme = getStarpathLevelTheme(level);
  const guidedAdventure = level === "Prep" || level === "Year 1" || level === "Year 2";
  const fallbackLevel = level === "Prep" ? "ground" : `level-${level.replace(/\D/g, "")}`;
  const config = useMemo<SharedRealmWorld3DConfig>(() => ({
    realmId: "space",
    realmName: "Starpath",
    level,
    preview,
    accent: theme.accent,
    sky: theme.sky,
    worldState: getStarpathWorldState({ preview, level }),
    refreshWorldState: () => getStarpathWorldState({ preview, level }),
    worldHref: `/world/starpath?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`,
    fallbackHref: `/starpath?realm_id=space&level=${fallbackLevel}${preview ? "&teacher_preview=1" : ""}`,
    towerHref: `/world/tower?spawn=space-return${preview ? "&teacher_preview=1" : ""}`,
    guidedAdventure,
    initialYaw,
    initialPitch: 0.03,
    cameraMinY: STARPATH_SURFACE_Y + 0.15,
    districtLayout: STARPATH_DISTRICT_LAYOUT,
    guidedStart: [0, STARPATH_SURFACE_Y + 0.75, 13],
    adventurePortalPosition: [0, STARPATH_SURFACE_Y, -6],
    districtStart: [0, STARPATH_SURFACE_Y + 0.75, 11],
    cityStart: [0, STARPATH_SURFACE_Y + 0.75, 19],
    weekPositions: [[-4.5, STARPATH_SURFACE_Y, -4], [4.5, STARPATH_SURFACE_Y, -4]],
    cityReturnPosition: [0, STARPATH_SURFACE_Y, 23],
    towerReturnPosition: [0, STARPATH_SURFACE_Y, 31],
    Environment: ({ quality, districtInterior }) => <StarpathEnvironment theme={theme} quality={quality} districtInterior={districtInterior} />,
    DistrictGate: StarpathDistrictGate,
    WeekGate: StarpathWeekGate,
    AdventurePortal: StarpathAdventurePortal,
    ReturnBeam: StarpathReturnBeam,
  }), [fallbackLevel, guidedAdventure, initialYaw, level, preview, theme]);

  return <SharedRealmWorld3D config={config} />;
}
