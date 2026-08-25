"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MeasurelandsAdventurePortal,
  MeasurelandsDistrictGate,
  MeasurelandsEnvironment,
  MEASURELANDS_DISTRICT_LAYOUT,
  MeasurelandsReturnBeam,
  MeasurelandsWeekGate,
  type MeasurelandsQuality,
} from "@/components/world3d/MeasurelandsEnvironment";
import {
  EMPTY_WORLD_MOVE_INPUT,
  KeyboardWorldAction,
  SharedThirdPersonPlayer,
  WorldMovePad,
  type WorldInteractionTarget,
  type WorldMoveInput,
} from "@/components/world3d/SharedWorldPlayer";
import { WorldHUD } from "@/components/world3d/WorldHUD";
import { WorldInteractionPrompt } from "@/components/world3d/WorldInteractionPrompt";
import { getMeasurelandsLevelTheme } from "@/lib/measurelands-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { clearWorld3DReturnContext, rememberWorld3DPosttestEntry, rememberWorld3DWeekEntry } from "@/lib/world3d/return-context";
import { getMeasurelandsWorldState } from "@/lib/world3d/measurelands-level3-state";
import type { RealmWorldGateState, RealmWorldState, RealmWorldWeekNode } from "@/lib/world3d/realm-world-state";
import { resolveWorldJourney } from "@/lib/world3d/world-journey";
import { WORLD3D_CANONICAL_RESTORED_EVENT } from "@/lib/world3d/canonical-bootstrap";

type Interaction =
  | { id: string; kind: "adventure"; label: string; state: "current"; node: RealmWorldWeekNode }
  | { id: string; kind: "district"; label: string; state: RealmWorldGateState; districtId: string }
  | { id: string; kind: "week"; label: string; state: RealmWorldGateState; node: RealmWorldWeekNode }
  | { id: "measurelands-city-return"; kind: "return"; label: string; state: "available" }
  | { id: "measurelands-tower-return"; kind: "tower"; label: string; state: "available" };

const CITY_START: [number, number, number] = [0, 0.75, 19];
const DISTRICT_START: [number, number, number] = [0, 0.75, 11];
const CITY_BOUNDS = { minX: -22, maxX: 22, minZ: -28, maxZ: 33 };
const DISTRICT_BOUNDS = { minX: -13, maxX: 13, minZ: -17, maxZ: 25 };
const WEEK_POSITIONS: [number, number, number][] = [[-4.4, 0, -4], [4.4, 0, -4]];
const ADVENTURE_PORTAL_POSITION: [number, number, number] = [0, 0, -6];
const GUIDED_START: [number, number, number] = [0, 0.75, 13];

function interactionStatus(state: RealmWorldGateState) {
  if (state === "completed") return "MASTERED";
  if (state === "current") return "CURRENT";
  if (state === "available") return "OPEN";
  return "LOCKED";
}

function SceneMetrics({ quality }: { quality: MeasurelandsQuality }) {
  const { gl } = useThree();
  useEffect(() => {
    const interval = window.setInterval(() => {
      const info = gl.info.render;
      window.__MEASURELANDS_3D_METRICS__ = {
        quality,
        drawCalls: info.calls,
        triangles: info.triangles,
        textures: gl.info.memory.textures,
        geometries: gl.info.memory.geometries,
      };
    }, 1000);
    return () => {
      window.clearInterval(interval);
      delete window.__MEASURELANDS_3D_METRICS__;
    };
  }, [gl, quality]);
  return null;
}

declare global {
  interface Window {
    __MEASURELANDS_3D_METRICS__?: {
      quality: MeasurelandsQuality;
      drawCalls: number;
      triangles: number;
      textures: number;
      geometries: number;
    };
  }
}

function MeasurelandsScene({
  worldState,
  selectedDistrictId,
  activeId,
  moveInput,
  quality,
  guidedAdventure,
  initialYaw,
  onNearest,
}: {
  worldState: RealmWorldState;
  selectedDistrictId: string | null;
  activeId: string | null;
  moveInput: WorldMoveInput;
  quality: MeasurelandsQuality;
  guidedAdventure: boolean;
  initialYaw: number;
  onNearest: (id: string | null) => void;
}) {
  const theme = getMeasurelandsLevelTheme(worldState.level);
  const selectedDistrict = worldState.districts.find((district) => district.id === selectedDistrictId);
  const nodes = useMemo(
    () => selectedDistrict ? worldState.weekNodes.filter((node) => node.districtId === selectedDistrict.id) : [],
    [selectedDistrict, worldState.weekNodes],
  );
  const targets = useMemo<WorldInteractionTarget[]>(() => {
    if (guidedAdventure) {
      return [{ id: worldState.nextActivity.gateId, position: ADVENTURE_PORTAL_POSITION, distance: 3.5 }];
    }
    if (selectedDistrict) {
      return [
        ...nodes.map((node, index) => ({ id: node.id, position: WEEK_POSITIONS[index], distance: 2.5 })),
        { id: "measurelands-city-return", position: [0, 0, 23] as [number, number, number], distance: 3.15 },
      ];
    }
    return [
      ...worldState.districts.map((district) => ({ id: district.id, position: MEASURELANDS_DISTRICT_LAYOUT[district.id], distance: 3.2 })),
      { id: "measurelands-tower-return", position: [0, 0, 31] as [number, number, number], distance: 3.2 },
    ];
  }, [guidedAdventure, nodes, selectedDistrict, worldState.districts, worldState.nextActivity.gateId]);

  return (
    <>
      <MeasurelandsEnvironment theme={theme} quality={quality} districtInterior={Boolean(selectedDistrict)} />
      {guidedAdventure ? (
        <group position={ADVENTURE_PORTAL_POSITION}>
          <MeasurelandsAdventurePortal accent={theme.accent} active={activeId === worldState.nextActivity.gateId} />
        </group>
      ) : selectedDistrict ? (
        <>
          {nodes.map((node, index) => (
            <group key={node.id} position={WEEK_POSITIONS[index]}>
              <MeasurelandsWeekGate week={node.week} state={node.state} accent={selectedDistrict.accent} active={activeId === node.id} />
            </group>
          ))}
          <group position={[0, 0, 23]}><MeasurelandsReturnBeam accent={theme.accent} active={activeId === "measurelands-city-return"} /></group>
        </>
      ) : (
        <>
          {worldState.districts.map((district) => (
            <group key={district.id} position={MEASURELANDS_DISTRICT_LAYOUT[district.id]}>
              <MeasurelandsDistrictGate label={district.label} weeks={district.weekRangeLabel} motif={district.motif} state={district.state} accent={district.accent} active={activeId === district.id} />
            </group>
          ))}
          <group position={[0, 0, 31]}><MeasurelandsReturnBeam accent="#f4d78e" active={activeId === "measurelands-tower-return"} label="RETURN TO TOWER" /></group>
        </>
      )}
      <SharedThirdPersonPlayer
        key={guidedAdventure ? "guided" : selectedDistrictId ?? "city"}
        initialPosition={guidedAdventure ? GUIDED_START : selectedDistrict ? DISTRICT_START : CITY_START}
        moveInput={moveInput}
        bounds={guidedAdventure ? DISTRICT_BOUNDS : selectedDistrict ? DISTRICT_BOUNDS : CITY_BOUNDS}
        roamEllipse={guidedAdventure ? { centerZ: 3, radiusX: 14, radiusZ: 22 } : selectedDistrict ? { centerZ: 3, radiusX: 13, radiusZ: 22 } : { centerZ: 2, radiusX: 22, radiusZ: 31 }}
        interactionTargets={targets}
        onNearestTargetId={onNearest}
        initialYaw={initialYaw}
        initialPitch={guidedAdventure ? 0.04 : -0.08}
        cameraDistance={9.5}
        cameraTargetHeight={1.55}
        cameraLookAhead={0}
      />
      <SceneMetrics quality={quality} />
    </>
  );
}

export default function MeasurelandsLevel3World({ level = "Year 3" }: { level?: RealmLevelId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1";
  const requestedQuality = searchParams.get("quality");
  const quality: MeasurelandsQuality = requestedQuality === "low" || requestedQuality === "high" ? requestedQuality : "medium";
  const initialYaw = Number(searchParams.get("camYaw")) || 0;
  const guidedAdventure = level === "Prep" || level === "Year 1" || level === "Year 2";
  const [worldState, setWorldState] = useState(() => getMeasurelandsWorldState({ preview, level }));
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(() => guidedAdventure ? null : searchParams.get("district"));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [moveInput, setMoveInput] = useState<WorldMoveInput>(EMPTY_WORLD_MOVE_INPUT);
  const theme = getMeasurelandsLevelTheme(level);
  const returnPath = `/world/measurelands?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`;
  const twoDPath = `/measurelands?level=${encodeURIComponent(level)}${preview ? "&teacher_preview=1" : ""}`;
  const towerPath = `/world/tower?spawn=measurement-return${preview ? "&teacher_preview=1" : ""}`;
  const selectedDistrict = worldState.districts.find((district) => district.id === selectedDistrictId);

  const interactions = useMemo<Interaction[]>(() => {
    if (guidedAdventure) {
      const node = worldState.weekNodes.find((candidate) => candidate.id === worldState.nextActivity.gateId) ?? worldState.weekNodes[0];
      return node ? [{ id: worldState.nextActivity.gateId, kind: "adventure", label: "Start Your Adventure", state: "current", node }] : [];
    }
    if (selectedDistrict) {
      return [
        ...worldState.weekNodes.filter((node) => node.districtId === selectedDistrict.id).map((node) => ({ id: node.id, kind: "week" as const, label: node.label, state: node.state, node })),
        { id: "measurelands-city-return", kind: "return" as const, label: "Measurelands", state: "available" as const },
      ];
    }
    return [
      ...worldState.districts.map((district) => ({ id: district.id, kind: "district" as const, label: district.label, state: district.state, districtId: district.id })),
      { id: "measurelands-tower-return", kind: "tower" as const, label: "Tower of Knowledge", state: "available" as const },
    ];
  }, [guidedAdventure, selectedDistrict, worldState.districts, worldState.nextActivity.gateId, worldState.weekNodes]);
  const activeInteraction = interactions.find((interaction) => interaction.id === activeId) ?? null;

  const refresh = useCallback(() => setWorldState(getMeasurelandsWorldState({ preview, level })), [level, preview]);
  useEffect(() => {
    clearWorld3DReturnContext();
    window.addEventListener("focus", refresh);
    window.addEventListener(WORLD3D_CANONICAL_RESTORED_EVENT, refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener(WORLD3D_CANONICAL_RESTORED_EVENT, refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refresh]);

  const enterWeek = useCallback((node: RealmWorldWeekNode) => {
    if (node.state === "locked") return;
    const districtQuery = guidedAdventure ? "" : `&district=${encodeURIComponent(node.districtId)}`;
    const returnHref = `${returnPath}&spawn=${encodeURIComponent(node.spawnPointId)}${districtQuery}`;
    rememberWorld3DWeekEntry({
      realmId: "measurement",
      level,
      districtId: guidedAdventure ? "guided-adventure" : node.districtId,
      week: node.week,
      spawnPointId: node.spawnPointId,
      returnHref,
    });
    router.push(node.route);
  }, [guidedAdventure, level, returnPath, router]);

  const runInteraction = useCallback((interaction: Interaction | null) => {
    if (!interaction || interaction.state === "locked") return;
    if (interaction.kind === "adventure") {
      enterWeek(interaction.node);
    } else if (interaction.kind === "district") {
      setSelectedDistrictId(interaction.districtId);
      setActiveId(null);
    } else if (interaction.kind === "week") {
      enterWeek(interaction.node);
    } else if (interaction.kind === "return") {
      setSelectedDistrictId(null);
      setActiveId(null);
    } else {
      router.push(towerPath);
    }
  }, [enterWeek, router, towerPath]);

  const quickStart = useCallback(async () => {
    const journey = await resolveWorldJourney();
    const url = new URL(journey.route, "https://level-up-learning.local");
    const week = Number(url.searchParams.get("week"));
    const node = Number.isInteger(week) ? worldState.weekNodes.find((candidate) => candidate.week === week) : null;
    if (node) {
      const districtQuery = guidedAdventure ? "" : `&district=${encodeURIComponent(node.districtId)}`;
      rememberWorld3DWeekEntry({ realmId: "measurement", level, districtId: guidedAdventure ? "guided-adventure" : node.districtId, week: node.week, spawnPointId: node.spawnPointId, returnHref: `${returnPath}&spawn=${encodeURIComponent(node.spawnPointId)}${districtQuery}` });
    } else if (url.pathname === "/posttest") {
      const returnNode = [...worldState.weekNodes].reverse().find((candidate) => candidate.state !== "locked") ?? worldState.weekNodes[0];
      if (returnNode) {
        const districtQuery = guidedAdventure ? "" : `&district=${encodeURIComponent(returnNode.districtId)}`;
        rememberWorld3DPosttestEntry({ realmId: "measurement", level, districtId: guidedAdventure ? "guided-adventure" : returnNode.districtId, week: returnNode.week, spawnPointId: returnNode.spawnPointId, returnHref: `${returnPath}&spawn=${encodeURIComponent(returnNode.spawnPointId)}${districtQuery}` });
      }
    }
    router.push(journey.route);
  }, [guidedAdventure, level, returnPath, router, worldState.weekNodes]);

  return (
    <main
      data-world3d-root
      data-measurelands-world3d
      style={{
        position: "relative",
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
        backgroundColor: theme.sky,
      }}
    >
      <Canvas
        camera={{ position: [0, 6, 12], fov: 52 }}
        dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.25] : [1, 1.5]}
        gl={{ alpha: true, antialias: quality !== "low", powerPreference: "high-performance" }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <MeasurelandsScene worldState={worldState} selectedDistrictId={selectedDistrictId} activeId={activeId} moveInput={moveInput} quality={quality} guidedAdventure={guidedAdventure} initialYaw={initialYaw} onNearest={setActiveId} />
      </Canvas>
      <WorldHUD
        context="realm"
        preview={preview}
        accent={theme.accent}
        fallbackHref={twoDPath}
        mission={{ eyebrow: "CURRENT MISSION", title: `Measurelands · ${level === "Prep" ? "Ground" : level.replace("Year", "Level")}`, detail: worldState.nextActivity.label }}
        primaryAction={selectedDistrict ? { label: "DISTRICTS", icon: "map", onClick: () => { setSelectedDistrictId(null); setActiveId(null); } } : { label: "RETURN TO TOWER", icon: "door", onClick: () => router.push(towerPath) }}
        onQuickStart={quickStart}
      />
      <WorldMovePad input={moveInput} onChange={setMoveInput} />
      {activeInteraction ? (
        <WorldInteractionPrompt
          location={activeInteraction.label}
          status={interactionStatus(activeInteraction.state)}
          actionLabel={activeInteraction.kind === "adventure" ? "START ADVENTURE" : activeInteraction.kind === "district" ? "ENTER DISTRICT" : activeInteraction.kind === "week" ? "ENTER WEEK" : activeInteraction.kind === "return" ? "RETURN TO REALM" : "ENTER TOWER"}
          disabled={activeInteraction.state === "locked"}
          onAction={() => runInteraction(activeInteraction)}
        />
      ) : null}
      <KeyboardWorldAction enabled={Boolean(activeInteraction)} onAction={() => runInteraction(activeInteraction)} />
    </main>
  );
}
