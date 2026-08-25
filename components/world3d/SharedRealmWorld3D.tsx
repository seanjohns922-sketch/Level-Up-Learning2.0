"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useRouter, useSearchParams } from "next/navigation";
import { type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
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
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import type { CanonicalRealmId } from "@/lib/realms/realm-registry";
import { clearWorld3DReturnContext, rememberWorld3DPosttestEntry, rememberWorld3DWeekEntry } from "@/lib/world3d/return-context";
import type { RealmWorldGateState, RealmWorldState, RealmWorldWeekNode } from "@/lib/world3d/realm-world-state";
import { resolveWorldJourney } from "@/lib/world3d/world-journey";
import { WORLD3D_CANONICAL_RESTORED_EVENT } from "@/lib/world3d/canonical-bootstrap";

export type SharedRealmQuality = "low" | "medium" | "high";

type Interaction =
  | { id: string; kind: "adventure"; label: string; state: "current"; node: RealmWorldWeekNode }
  | { id: string; kind: "district"; label: string; state: RealmWorldGateState; districtId: string }
  | { id: string; kind: "week"; label: string; state: RealmWorldGateState; node: RealmWorldWeekNode }
  | { id: string; kind: "return" | "tower"; label: string; state: "available" };

type EnvironmentProps = { quality: SharedRealmQuality; districtInterior: boolean };
type DistrictGateProps = { label: string; weeks: string; motif: string; state: RealmWorldGateState; accent: string; active: boolean };
type WeekGateProps = { week: number; state: RealmWorldGateState; accent: string; active: boolean };
type AdventurePortalProps = { accent: string; active: boolean };
type ReturnBeamProps = { accent: string; active: boolean; label?: string };

const DEFAULT_WEEK_POSITIONS: [number, number, number][] = [[-4.5, 0, -4], [4.5, 0, -4]];
const DEFAULT_ADVENTURE_POSITION: [number, number, number] = [0, 0, -6];
const DEFAULT_CITY_RETURN_POSITION: [number, number, number] = [0, 0, 23];
const DEFAULT_TOWER_RETURN_POSITION: [number, number, number] = [0, 0, 31];

export type SharedRealmWorld3DConfig = {
  realmId: CanonicalRealmId;
  realmName: string;
  level: RealmLevelId;
  preview: boolean;
  accent: string;
  sky: string;
  worldState: RealmWorldState;
  refreshWorldState: () => RealmWorldState;
  worldHref: string;
  fallbackHref: string;
  towerHref: string;
  guidedAdventure: boolean;
  initialYaw?: number;
  initialPitch?: number;
  cameraMinY?: number;
  districtLayout: Record<string, [number, number, number]>;
  districtStart?: [number, number, number];
  cityStart?: [number, number, number];
  guidedStart?: [number, number, number];
  weekPositions?: [number, number, number][];
  adventurePortalPosition?: [number, number, number];
  cityReturnPosition?: [number, number, number];
  towerReturnPosition?: [number, number, number];
  Environment: ComponentType<EnvironmentProps>;
  DistrictGate: ComponentType<DistrictGateProps>;
  WeekGate: ComponentType<WeekGateProps>;
  AdventurePortal: ComponentType<AdventurePortalProps>;
  ReturnBeam: ComponentType<ReturnBeamProps>;
  renderSceneDressing?: (context: { selectedDistrictId: string | null; quality: SharedRealmQuality }) => ReactNode;
};

function interactionStatus(state: RealmWorldGateState) {
  if (state === "completed") return "MASTERED";
  if (state === "current") return "CURRENT";
  if (state === "available") return "OPEN";
  return "LOCKED";
}

function SharedSceneMetrics({ quality, realmId }: { quality: SharedRealmQuality; realmId: CanonicalRealmId }) {
  const { gl } = useThree();
  useEffect(() => {
    const interval = window.setInterval(() => {
      const render = gl.info.render;
      window.__SHARED_REALM_3D_METRICS__ = { realmId, quality, drawCalls: render.calls, triangles: render.triangles, textures: gl.info.memory.textures, geometries: gl.info.memory.geometries };
    }, 1000);
    return () => { window.clearInterval(interval); delete window.__SHARED_REALM_3D_METRICS__; };
  }, [gl, quality, realmId]);
  return null;
}

declare global {
  interface Window {
    __SHARED_REALM_3D_METRICS__?: { realmId: CanonicalRealmId; quality: SharedRealmQuality; drawCalls: number; triangles: number; textures: number; geometries: number };
  }
}

function SharedRealmScene({ config, activeId, selectedDistrictId, moveInput, quality, onNearest }: { config: SharedRealmWorld3DConfig; activeId: string | null; selectedDistrictId: string | null; moveInput: WorldMoveInput; quality: SharedRealmQuality; onNearest: (id: string | null) => void }) {
  const {
    Environment, DistrictGate, WeekGate, AdventurePortal, ReturnBeam, worldState,
    guidedAdventure, districtLayout,
  } = config;
  const weekPositions = config.weekPositions ?? DEFAULT_WEEK_POSITIONS;
  const adventurePosition = config.adventurePortalPosition ?? DEFAULT_ADVENTURE_POSITION;
  const cityReturnPosition = config.cityReturnPosition ?? DEFAULT_CITY_RETURN_POSITION;
  const towerReturnPosition = config.towerReturnPosition ?? DEFAULT_TOWER_RETURN_POSITION;
  const selectedDistrict = worldState.districts.find((district) => district.id === selectedDistrictId);
  const nodes = useMemo(() => selectedDistrict ? worldState.weekNodes.filter((node) => node.districtId === selectedDistrict.id) : [], [selectedDistrict, worldState.weekNodes]);
  const targets = useMemo<WorldInteractionTarget[]>(() => {
    if (guidedAdventure) return [{ id: worldState.nextActivity.gateId, position: adventurePosition, distance: 3.6 }];
    if (selectedDistrict) return [...nodes.map((node, index) => ({ id: node.id, position: weekPositions[index], distance: 2.7 })), { id: `${config.realmId}-realm-return`, position: cityReturnPosition, distance: 3.2 }];
    return [...worldState.districts.map((district) => ({ id: district.id, position: districtLayout[district.id], distance: 3.3 })), { id: `${config.realmId}-tower-return`, position: towerReturnPosition, distance: 3.3 }];
  }, [adventurePosition, cityReturnPosition, config.realmId, districtLayout, guidedAdventure, nodes, selectedDistrict, towerReturnPosition, weekPositions, worldState.districts, worldState.nextActivity.gateId]);

  return (
    <>
      <Environment quality={quality} districtInterior={Boolean(selectedDistrict)} />
      {config.renderSceneDressing?.({ selectedDistrictId, quality })}
      {guidedAdventure ? (
        <group position={adventurePosition}><AdventurePortal accent={config.accent} active={activeId === worldState.nextActivity.gateId} /></group>
      ) : selectedDistrict ? (
        <>
          {nodes.map((node, index) => <group key={node.id} position={weekPositions[index]}><WeekGate week={node.week} state={node.state} accent={selectedDistrict.accent} active={activeId === node.id} /></group>)}
          <group position={cityReturnPosition}><ReturnBeam accent={config.accent} active={activeId === `${config.realmId}-realm-return`} /></group>
        </>
      ) : (
        <>
          {worldState.districts.map((district) => <group key={district.id} position={districtLayout[district.id]}><DistrictGate label={district.label} weeks={district.weekRangeLabel} motif={district.motif} state={district.state} accent={district.accent} active={activeId === district.id} /></group>)}
          <group position={towerReturnPosition}><ReturnBeam accent={config.accent} active={activeId === `${config.realmId}-tower-return`} label="RETURN TO TOWER" /></group>
        </>
      )}
      <SharedThirdPersonPlayer
        key={guidedAdventure ? "guided" : selectedDistrictId ?? "realm"}
        initialPosition={guidedAdventure ? config.guidedStart ?? [0, 0.75, 13] : selectedDistrict ? config.districtStart ?? [0, 0.75, 11] : config.cityStart ?? [0, 0.75, 19]}
        moveInput={moveInput}
        bounds={selectedDistrict || guidedAdventure ? { minX: -13, maxX: 13, minZ: -17, maxZ: 25 } : { minX: -22, maxX: 22, minZ: -28, maxZ: 33 }}
        roamEllipse={selectedDistrict || guidedAdventure ? { centerZ: 3, radiusX: 13, radiusZ: 22 } : { centerZ: 2, radiusX: 22, radiusZ: 31 }}
        interactionTargets={targets}
        onNearestTargetId={onNearest}
        initialYaw={config.initialYaw ?? 0}
        initialPitch={config.initialPitch ?? (guidedAdventure ? 0.04 : -0.08)}
        cameraDistance={9.5}
        cameraTargetHeight={1.55}
        cameraLookAhead={0}
        cameraMinY={config.cameraMinY}
      />
      <SharedSceneMetrics quality={quality} realmId={config.realmId} />
    </>
  );
}

export default function SharedRealmWorld3D({ config }: { config: SharedRealmWorld3DConfig }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [worldState, setWorldState] = useState(config.worldState);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(() =>
    config.guidedAdventure ? null : searchParams.get("district"),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [moveInput, setMoveInput] = useState<WorldMoveInput>(EMPTY_WORLD_MOVE_INPUT);
  const requestedQuality = searchParams.get("quality");
  const quality: SharedRealmQuality = requestedQuality === "low" || requestedQuality === "high" ? requestedQuality : "medium";
  const liveConfig = useMemo(() => ({ ...config, worldState }), [config, worldState]);
  const selectedDistrict = worldState.districts.find((district) => district.id === selectedDistrictId);
  const interactions = useMemo<Interaction[]>(() => {
    if (config.guidedAdventure) {
      const node = worldState.weekNodes.find((candidate) => candidate.id === worldState.nextActivity.gateId) ?? worldState.weekNodes[0];
      return node ? [{ id: node.id, kind: "adventure", label: "Start Your Adventure", state: "current", node }] : [];
    }
    if (selectedDistrict) return [...worldState.weekNodes.filter((node) => node.districtId === selectedDistrict.id).map((node) => ({ id: node.id, kind: "week" as const, label: node.label, state: node.state, node })), { id: `${config.realmId}-realm-return`, kind: "return", label: config.realmName, state: "available" }];
    return [...worldState.districts.map((district) => ({ id: district.id, kind: "district" as const, label: district.label, state: district.state, districtId: district.id })), { id: `${config.realmId}-tower-return`, kind: "tower", label: "Tower of Knowledge", state: "available" }];
  }, [config.guidedAdventure, config.realmId, config.realmName, selectedDistrict, worldState]);
  const activeInteraction = interactions.find((interaction) => interaction.id === activeId) ?? null;

  const refresh = useCallback(() => setWorldState(config.refreshWorldState()), [config]);
  useEffect(() => {
    clearWorld3DReturnContext();
    window.addEventListener("focus", refresh);
    window.addEventListener(WORLD3D_CANONICAL_RESTORED_EVENT, refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { window.removeEventListener("focus", refresh); window.removeEventListener(WORLD3D_CANONICAL_RESTORED_EVENT, refresh); document.removeEventListener("visibilitychange", refresh); };
  }, [refresh]);

  const enterWeek = useCallback((node: RealmWorldWeekNode) => {
    if (node.state === "locked") return;
    const districtQuery = config.guidedAdventure ? "" : `&district=${encodeURIComponent(node.districtId)}`;
    const returnHref = `${config.worldHref}&spawn=${encodeURIComponent(node.spawnPointId)}${districtQuery}`;
    rememberWorld3DWeekEntry({ realmId: config.realmId, level: config.level, districtId: config.guidedAdventure ? "guided-adventure" : node.districtId, week: node.week, spawnPointId: node.spawnPointId, returnHref });
    router.push(node.route);
  }, [config.guidedAdventure, config.level, config.realmId, config.worldHref, router]);

  const runInteraction = useCallback((interaction: Interaction | null) => {
    if (!interaction || interaction.state === "locked") return;
    if (interaction.kind === "adventure" || interaction.kind === "week") enterWeek(interaction.node);
    else if (interaction.kind === "district") { setSelectedDistrictId(interaction.districtId); setActiveId(null); }
    else if (interaction.kind === "return") { setSelectedDistrictId(null); setActiveId(null); }
    else router.push(config.towerHref);
  }, [config.towerHref, enterWeek, router]);

  const quickStart = useCallback(async () => {
    const journey = await resolveWorldJourney();
    const url = new URL(journey.route, "https://level-up-learning.local");
    const week = Number(url.searchParams.get("week"));
    const node = Number.isInteger(week) ? worldState.weekNodes.find((candidate) => candidate.week === week) : null;
    if (node) {
      const districtQuery = config.guidedAdventure ? "" : `&district=${encodeURIComponent(node.districtId)}`;
      rememberWorld3DWeekEntry({ realmId: config.realmId, level: config.level, districtId: config.guidedAdventure ? "guided-adventure" : node.districtId, week: node.week, spawnPointId: node.spawnPointId, returnHref: `${config.worldHref}&spawn=${encodeURIComponent(node.spawnPointId)}${districtQuery}` });
    } else if (url.pathname === "/posttest") {
      const returnNode = [...worldState.weekNodes].reverse().find((candidate) => candidate.state !== "locked") ?? worldState.weekNodes[0];
      if (returnNode) {
        const districtQuery = config.guidedAdventure ? "" : `&district=${encodeURIComponent(returnNode.districtId)}`;
        rememberWorld3DPosttestEntry({ realmId: config.realmId, level: config.level, districtId: config.guidedAdventure ? "guided-adventure" : returnNode.districtId, week: returnNode.week, spawnPointId: returnNode.spawnPointId, returnHref: `${config.worldHref}&spawn=${encodeURIComponent(returnNode.spawnPointId)}${districtQuery}` });
      }
    }
    router.push(journey.route);
  }, [config.guidedAdventure, config.level, config.realmId, config.worldHref, router, worldState.weekNodes]);

  return (
    <main data-world3d-root data-shared-realm-world3d={config.realmId} style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", backgroundColor: config.sky }}>
      <Canvas camera={{ position: [0, 6, 12], fov: 52 }} dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.25] : [1, 1.5]} gl={{ alpha: true, antialias: quality !== "low", powerPreference: "high-performance" }} onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}>
        <SharedRealmScene config={liveConfig} activeId={activeId} selectedDistrictId={selectedDistrictId} moveInput={moveInput} quality={quality} onNearest={setActiveId} />
      </Canvas>
      <WorldHUD context="realm" preview={config.preview} accent={config.accent} fallbackHref={config.fallbackHref} mission={{ eyebrow: "CURRENT MISSION", title: `${config.realmName} · ${config.level === "Prep" ? "Ground" : config.level.replace("Year", "Level")}`, detail: worldState.nextActivity.label }} primaryAction={selectedDistrict ? { label: "DISTRICTS", icon: "map", onClick: () => { setSelectedDistrictId(null); setActiveId(null); } } : { label: "RETURN TO TOWER", icon: "door", onClick: () => router.push(config.towerHref) }} onQuickStart={quickStart} />
      <WorldMovePad input={moveInput} onChange={setMoveInput} />
      {activeInteraction ? <WorldInteractionPrompt location={activeInteraction.label} status={interactionStatus(activeInteraction.state)} actionLabel={activeInteraction.kind === "adventure" ? "START ADVENTURE" : activeInteraction.kind === "district" ? "ENTER DISTRICT" : activeInteraction.kind === "week" ? "ENTER WEEK" : activeInteraction.kind === "return" ? "RETURN TO REALM" : "ENTER TOWER"} disabled={activeInteraction.state === "locked"} onAction={() => runInteraction(activeInteraction)} /> : null}
      <KeyboardWorldAction enabled={Boolean(activeInteraction)} onAction={() => runInteraction(activeInteraction)} />
    </main>
  );
}
