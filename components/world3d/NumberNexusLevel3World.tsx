"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as THREE from "three";
import {
  CountingDistrictEnvironment,
  CityReturnBeam,
  ProductionWeekGate,
  type NumberNexusArtQuality,
} from "@/components/world3d/CountingDistrictEnvironment";
import {
  CityDistrictEntrance,
  CityTowerEntrance,
  NUMBER_NEXUS_CITY_LAYOUT,
  NumberNexusCityEnvironment,
} from "@/components/world3d/NumberNexusCityEnvironment";
import {
  clearWorld3DReturnContext,
  rememberWorld3DPosttestEntry,
  rememberWorld3DWeekEntry,
} from "@/lib/world3d/return-context";
import {
  getNumberNexusWorldState,
  type NumberNexusLevel3District,
  type NumberNexusLevel3WeekNode,
  type NumberNexusLevel3WorldState,
  type WorldDistrictState,
  type WorldGateState,
} from "@/lib/world3d/number-nexus-level3-state";
import {
  NumberNexusGuidedEnvironment,
  StartAdventurePortal,
} from "@/components/world3d/NumberNexusGuidedEnvironment";
import {
  getNumberNexusLevelTheme,
  type NumberNexusExperienceMode,
  type NumberNexusLevelTheme,
} from "@/lib/number-nexus-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import { TrialStudentAvatar, WorldMovePad } from "@/components/world3d/SharedWorldPlayer";
import { WorldHUD } from "@/components/world3d/WorldHUD";
import { WorldInteractionPrompt } from "@/components/world3d/WorldInteractionPrompt";
import { resolveWorldJourney } from "@/lib/world3d/world-journey";
import { WORLD3D_CANONICAL_RESTORED_EVENT } from "@/lib/world3d/canonical-bootstrap";

type GateKind = "district" | "week" | "tower" | "city-return" | "adventure";

type GateDefinition = {
  id: string;
  label: string;
  fullLabel: string;
  weekRangeLabel?: string;
  kind: GateKind;
  position: [number, number, number];
  color: string;
  state: WorldGateState;
  route?: string;
  week?: number;
  districtId?: string;
  nextActivityType?: NumberNexusLevel3WeekNode["nextActivityType"];
  lessonNumber?: number;
  lessonId?: string;
  interactionDistance?: number;
  spawnPointId: string;
};

type DistrictRenderDefinition = NumberNexusLevel3District & {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
};

type NumberNexus3DMetrics = {
  active: boolean;
  quality: NumberNexusArtQuality;
  fps: number;
  dpr: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  sampledAt: number;
};

declare global {
  interface Window {
    __NUMBER_NEXUS_3D_METRICS__?: NumberNexus3DMetrics;
  }
}

const PLAYER_START: [number, number, number] = [0, 0.75, 19];
const GUIDED_PLAYER_START: [number, number, number] = [0, 0.75, 13];
const DISTRICT_INTERIOR_START: [number, number, number] = [0, 0.75, 11.5];
const INTERACTION_DISTANCE = 2.25;
const CAMERA_FOLLOW_DISTANCE = 9.5;
const WORLD_BOUNDS = {
  minX: -34,
  maxX: 34,
  minZ: -34,
  maxZ: 44,
};
const NUMBER_NEXUS_CITY_BOUNDS = {
  minX: -18.5,
  maxX: 18.5,
  minZ: -29,
  maxZ: 39,
};
const NUMBER_NEXUS_CITY_ROAM = { centerZ: 5, radiusX: 18.5, radiusZ: 34 };
const COUNTING_DISTRICT_BOUNDS = {
  minX: -15,
  maxX: 15,
  minZ: -17,
  maxZ: 29,
};
const GUIDED_PLAZA_BOUNDS = {
  minX: -17,
  maxX: 17,
  minZ: -12,
  maxZ: 20,
};

const DISTRICT_LAYOUT: Record<string, { position: [number, number, number]; size: [number, number, number]; color: string }> = {
  "counting-district": { position: NUMBER_NEXUS_CITY_LAYOUT["counting-district"].position, size: [8.8, 0.18, 6.2], color: NUMBER_NEXUS_CITY_LAYOUT["counting-district"].color },
  "number-bridge": { position: NUMBER_NEXUS_CITY_LAYOUT["number-bridge"].position, size: [8.8, 0.18, 6.2], color: NUMBER_NEXUS_CITY_LAYOUT["number-bridge"].color },
  "calculation-core": { position: NUMBER_NEXUS_CITY_LAYOUT["calculation-core"].position, size: [8.8, 0.18, 6.2], color: NUMBER_NEXUS_CITY_LAYOUT["calculation-core"].color },
  "mastery-sector": { position: NUMBER_NEXUS_CITY_LAYOUT["mastery-sector"].position, size: [9.4, 0.18, 6.6], color: NUMBER_NEXUS_CITY_LAYOUT["mastery-sector"].color },
  "legend-tower": { position: NUMBER_NEXUS_CITY_LAYOUT["legend-tower"].position, size: [9.4, 0.18, 6.6], color: NUMBER_NEXUS_CITY_LAYOUT["legend-tower"].color },
};

const DISTRICT_INTERIOR_LAYOUT = {
  position: [0, 0.05, 0] as [number, number, number],
  size: [19, 0.18, 13] as [number, number, number],
};

function statusText(state: WorldGateState | WorldDistrictState) {
  if (state === "completed") return "COMPLETED";
  if (state === "current") return "CURRENT";
  if (state === "available") return "AVAILABLE";
  return "LOCKED";
}

function stateColor(state: WorldGateState | WorldDistrictState, fallback: string) {
  if (state === "completed") return "#14b8a6";
  if (state === "current") return fallback;
  if (state === "available") return "#38bdf8";
  return "#4b5563";
}

function DistrictBlock({ district, active }: { district: DistrictRenderDefinition; active: boolean }) {
  const locked = district.state === "locked";
  const completed = district.state === "completed";
  const color = stateColor(district.state, district.color);
  return (
    <group position={district.position}>
      <mesh>
        <boxGeometry args={district.size} />
        <meshStandardMaterial
          color={locked ? "#374151" : color}
          emissive={active || completed ? color : "#111827"}
          emissiveIntensity={active ? 0.28 : completed ? 0.14 : 0.02}
          roughness={0.85}
        />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[district.size[0] - 0.5, 0.55, 0.22]} />
        <meshStandardMaterial color={locked ? "#1f2937" : "#111827"} roughness={0.9} />
      </mesh>
      <Html center position={[0, 0.95, district.size[2] / 2 + 0.85]} distanceFactor={11}>
        <div
          style={{
            minWidth: 176,
            border: `1px solid ${active ? "#ffffff" : "rgba(255,255,255,0.2)"}`,
            background: "rgba(15,23,42,0.9)",
            color: "#f8fafc",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 10,
            fontWeight: 900,
            padding: "7px 8px",
            textAlign: "center",
            textTransform: "uppercase",
            borderRadius: 6,
          }}
        >
          <div>{district.label}</div>
          <div style={{ color: locked ? "#cbd5e1" : color, marginTop: 2 }}>{district.weekRangeLabel} · {statusText(district.state)}</div>
        </div>
      </Html>
    </group>
  );
}

function Gate({ gate, active }: { gate: GateDefinition; active: boolean }) {
  const locked = gate.state === "locked";
  const completed = gate.state === "completed";
  const emissive = active || gate.state === "current" || gate.state === "available" ? gate.color : "#111827";
  const gateHeight = gate.kind === "tower" ? 3.4 : gate.kind === "district" ? 2.2 : 2.7;
  const gateWidth = gate.kind === "tower" ? 2.1 : gate.kind === "district" ? 2.6 : 1.7;
  return (
    <group position={gate.position}>
      <mesh position={[0, gateHeight / 2, 0]}>
        <boxGeometry args={[gateWidth, gateHeight, 0.34]} />
        <meshStandardMaterial
          color={locked ? "#4b5563" : completed ? "#0f766e" : gate.color}
          emissive={emissive}
          emissiveIntensity={active ? 0.75 : gate.state === "current" ? 0.45 : gate.state === "available" ? 0.25 : 0.03}
          roughness={0.75}
        />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.05, 1.05, 0.16, 28]} />
        <meshStandardMaterial color={active ? "#f8fafc" : locked ? "#374151" : gate.color} />
      </mesh>
      <Html center position={[0, gateHeight + 0.9, 0]} distanceFactor={11}>
        <div
          style={{
            minWidth: 96,
            border: `1px solid ${active ? "#ffffff" : "rgba(255,255,255,0.24)"}`,
            background: "rgba(15,23,42,0.9)",
            color: "#f8fafc",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 10,
            fontWeight: 900,
            padding: "6px 8px",
            textAlign: "center",
            textTransform: "uppercase",
            borderRadius: 6,
            boxShadow: active ? "0 0 22px rgba(255,255,255,0.42)" : "0 8px 18px rgba(0,0,0,0.28)",
          }}
        >
          <div>{gate.label}</div>
          <div style={{ color: locked ? "#cbd5e1" : gate.color, marginTop: 3 }}>{statusText(gate.state)}</div>
        </div>
      </Html>
    </group>
  );
}

function TemporaryPlayer({
  playerRef,
  movingRef,
  initialPosition,
}: {
  playerRef: React.MutableRefObject<THREE.Group | null>;
  movingRef: React.MutableRefObject<boolean>;
  initialPosition: [number, number, number];
}) {
  return (
    <group ref={playerRef} position={initialPosition} rotation={[0, Math.PI, 0]}>
      <TrialStudentAvatar movingRef={movingRef} />
    </group>
  );
}

function WorldScene({
  gates,
  districts,
  selectedDistrictId,
  currentMissionGateId,
  quality,
  captureGateState,
  captureQuizReady,
  initialPosition,
  spawnTarget,
  spawnNonce,
  moveInput,
  onNearestGate,
  initialYaw,
  initialPitch,
  experienceMode,
  theme,
}: {
  gates: GateDefinition[];
  districts: DistrictRenderDefinition[];
  selectedDistrictId: string | null;
  currentMissionGateId: string;
  quality: NumberNexusArtQuality;
  captureGateState: WorldGateState | null;
  captureQuizReady: boolean;
  initialPosition: [number, number, number];
  spawnTarget: [number, number, number] | null;
  spawnNonce: number;
  moveInput: { up: boolean; down: boolean; left: boolean; right: boolean };
  onNearestGate: (gate: GateDefinition | null) => void;
  initialYaw: number;
  initialPitch: number;
  experienceMode: NumberNexusExperienceMode;
  theme: NumberNexusLevelTheme;
}) {
  const keys = useRef(new Set<string>());
  const playerRef = useRef<THREE.Group | null>(null);
  const movingRef = useRef(false);
  const { camera, gl } = useThree();
  const nearestRef = useRef<GateDefinition | null>(null);
  // Free-look 360 camera: yaw turns all the way around, pitch looks up/down.
  const yaw = useRef(initialYaw);
  const pitch = useRef(initialPitch);
  const [activeGateId, setActiveGateId] = useState<string | null>(null);
  const guidedAdventure = experienceMode === "guided-adventure";
  const productionCountingDistrict = !guidedAdventure && selectedDistrictId === "counting-district";
  const productionCity = !guidedAdventure && selectedDistrictId === null;
  const productionEnv = guidedAdventure || productionCountingDistrict || productionCity;
  const movementBounds = guidedAdventure
    ? GUIDED_PLAZA_BOUNDS
    : productionCity
    ? NUMBER_NEXUS_CITY_BOUNDS
    : productionCountingDistrict
      ? COUNTING_DISTRICT_BOUNDS
      : WORLD_BOUNDS;
  const currentMissionGate = gates.find((gate) => gate.id === currentMissionGateId);
  const firstWeekGateId = gates.find((gate) => gate.kind === "week")?.id;

  useEffect(() => {
    const down = (event: KeyboardEvent) => keys.current.add(event.key.toLowerCase());
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  // Drag (mouse or touch) on the 3D view to look around; the HUD stays clickable.
  useEffect(() => {
    const el = gl.domElement;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    const start = (event: PointerEvent) => { dragging = true; lx = event.clientX; ly = event.clientY; };
    const look = (event: PointerEvent) => {
      if (!dragging) return;
      yaw.current -= (event.clientX - lx) * 0.005;
      pitch.current = THREE.MathUtils.clamp(pitch.current - (event.clientY - ly) * 0.005, -1.05, 1.2);
      lx = event.clientX;
      ly = event.clientY;
    };
    const end = () => { dragging = false; };
    el.addEventListener("pointerdown", start);
    window.addEventListener("pointermove", look);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      el.removeEventListener("pointerdown", start);
      window.removeEventListener("pointermove", look);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [gl]);

  useEffect(() => {
    if (!spawnTarget || !playerRef.current) return;
    playerRef.current.position.set(spawnTarget[0], spawnTarget[1], spawnTarget[2]);
    yaw.current = initialYaw;
    pitch.current = initialPitch;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spawnNonce, spawnTarget]);

  useFrame((_, delta) => {
    const player = playerRef.current;
    if (!player) return;

    // Movement is relative to where the camera faces.
    const sy = Math.sin(yaw.current);
    const cy = Math.cos(yaw.current);
    const forward = new THREE.Vector3(-sy, 0, -cy);
    const right = new THREE.Vector3(cy, 0, -sy);
    const move = new THREE.Vector3();
    if (keys.current.has("w") || keys.current.has("arrowup") || moveInput.up) move.add(forward);
    if (keys.current.has("s") || keys.current.has("arrowdown") || moveInput.down) move.sub(forward);
    if (keys.current.has("d") || keys.current.has("arrowright") || moveInput.right) move.add(right);
    if (keys.current.has("a") || keys.current.has("arrowleft") || moveInput.left) move.sub(right);
    movingRef.current = move.lengthSq() > 0;
    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(4.6 * delta);
      player.position.add(move);
      player.rotation.y = Math.atan2(forward.x, forward.z);
    }
    player.position.x = THREE.MathUtils.clamp(player.position.x, movementBounds.minX, movementBounds.maxX);
    player.position.z = THREE.MathUtils.clamp(player.position.z, movementBounds.minZ, movementBounds.maxZ);
    if (productionCity || guidedAdventure) {
      const roam = guidedAdventure ? { centerZ: 4, radiusX: 17, radiusZ: 16 } : NUMBER_NEXUS_CITY_ROAM;
      const normalizedX = player.position.x / roam.radiusX;
      const normalizedZ = (player.position.z - roam.centerZ) / roam.radiusZ;
      const distanceFromCenter = Math.hypot(normalizedX, normalizedZ);
      if (distanceFromCenter > 1) {
        player.position.x = (normalizedX / distanceFromCenter) * roam.radiusX;
        player.position.z = roam.centerZ + (normalizedZ / distanceFromCenter) * roam.radiusZ;
      }
    }

    // Third-person orbit camera driven by yaw/pitch.
    const cp = Math.cos(pitch.current);
    const lookDir = new THREE.Vector3(-sy * cp, Math.sin(pitch.current), -cy * cp);
    const head = new THREE.Vector3(player.position.x, player.position.y + 1.55, player.position.z);
    const desiredCamera = head.clone().addScaledVector(lookDir, -CAMERA_FOLLOW_DISTANCE);
    desiredCamera.y = Math.max(desiredCamera.y, 0.85);
    camera.position.lerp(desiredCamera, 1 - Math.pow(0.0001, delta));
    camera.lookAt(head);

    let nearest: GateDefinition | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const gate of gates) {
      const distance = player.position.distanceTo(new THREE.Vector3(gate.position[0], 0.75, gate.position[2]));
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = gate;
      }
    }
    const active = nearest && nearestDistance <= (nearest.interactionDistance ?? INTERACTION_DISTANCE) ? nearest : null;
    if (active?.id !== nearestRef.current?.id) {
      nearestRef.current = active;
      setActiveGateId(active?.id ?? null);
      onNearestGate(active);
    }
  });

  return (
    <>
      <color attach="background" args={[productionEnv ? theme.sky : "#111827"]} />
      <ambientLight intensity={productionEnv ? 0.6 : 0.58} color={productionEnv ? theme.ambientLight : "#ffffff"} />
      {/* dusk key light (kept near-neutral so teal metal doesn't read tan) */}
      <directionalLight position={[10, 13, 8]} intensity={productionEnv ? 1.05 : 1.2} color={productionEnv ? "#e6ede4" : "#ffffff"} />
      {productionEnv ? (
        <>
          {/* teal sky / dark ground hemisphere for atmospheric dusk fill */}
          <hemisphereLight args={["#63c7b8", "#16262d", 0.7]} />
          {/* cool bounce from the opposite side */}
          <directionalLight position={[-9, 8, -4]} intensity={0.4} color="#7fd8ff" />
        </>
      ) : null}
      <fog attach="fog" args={[productionEnv ? theme.fog : "#111827", productionCity ? 22 : 24, productionEnv ? (productionCity ? 88 : 80) : 66]} />

      {guidedAdventure ? (
        <NumberNexusGuidedEnvironment quality={quality} theme={theme} />
      ) : productionCountingDistrict ? (
        <CountingDistrictEnvironment quality={quality} theme={theme} />
      ) : productionCity ? (
        <NumberNexusCityEnvironment quality={quality} theme={theme} currentEntranceX={currentMissionGate?.position[0] ?? 0} />
      ) : (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[62, 46]} />
            <meshStandardMaterial color="#6b7280" roughness={0.92} />
          </mesh>
          <gridHelper args={[62, 62, "#9ca3af", "#4b5563"]} position={[0, 0.025, 0]} />
          <mesh position={[0, 1, -22.4]}><boxGeometry args={[62, 2, 0.35]} /><meshStandardMaterial color="#374151" /></mesh>
          <mesh position={[-30.4, 1, 0]}><boxGeometry args={[0.35, 2, 46]} /><meshStandardMaterial color="#374151" /></mesh>
          <mesh position={[30.4, 1, 0]}><boxGeometry args={[0.35, 2, 46]} /><meshStandardMaterial color="#374151" /></mesh>
          {districts.map((district) => <DistrictBlock key={district.id} district={district} active={district.state === "current"} />)}
        </>
      )}

      {gates.map((gate, index) => {
        if (gate.kind === "adventure") {
          return (
            <group key={gate.id} position={gate.position}>
              <StartAdventurePortal active={activeGateId === gate.id} accent={theme.energyAccent} />
            </group>
          );
        }
        if (gate.kind === "city-return") {
          return (
            <group key={gate.id} position={gate.position}>
              <CityReturnBeam active={activeGateId === gate.id} />
            </group>
          );
        }
        if (productionCountingDistrict && gate.kind === "week") {
          return (
            <group key={gate.id} position={gate.position}>
              <ProductionWeekGate
                label={gate.label}
                state={gate.id === firstWeekGateId && captureGateState ? captureGateState : gate.state}
                active={activeGateId === gate.id}
                currentMission={gate.id === firstWeekGateId && captureGateState ? captureGateState === "current" : gate.id === currentMissionGateId}
                quizReady={gate.id === firstWeekGateId && captureQuizReady ? true : gate.nextActivityType === "quiz"}
                quality={quality}
              />
            </group>
          );
        }
        if (productionCity) {
          const state = index === 0 && captureGateState ? captureGateState : gate.state;
          if (gate.kind === "tower") {
            return (
              <group key={gate.id} position={gate.position}>
                <CityTowerEntrance active={activeGateId === gate.id} />
              </group>
            );
          }
          return (
            <group key={gate.id} position={gate.position} rotation={[0, Math.atan2(-gate.position[0], -gate.position[2]), 0]}>
              <CityDistrictEntrance
                label={gate.fullLabel}
                weekRangeLabel={gate.weekRangeLabel}
                state={state}
                active={activeGateId === gate.id}
                current={state === "current"}
              />
            </group>
          );
        }
        return <Gate key={gate.id} gate={gate} active={activeGateId === gate.id} />;
      })}
      <TemporaryPlayer playerRef={playerRef} movingRef={movingRef} initialPosition={initialPosition} />
    </>
  );
}

function SceneMetricsReporter({ quality }: { quality: NumberNexusArtQuality }) {
  const { gl } = useThree();
  const sampleRef = useRef({ frames: 0, startedAt: 0 });

  useEffect(() => () => {
    if (!window.__NUMBER_NEXUS_3D_METRICS__) return;
    window.__NUMBER_NEXUS_3D_METRICS__ = { ...window.__NUMBER_NEXUS_3D_METRICS__, active: false, sampledAt: Date.now() };
  }, []);

  useFrame(() => {
    const now = performance.now();
    if (sampleRef.current.startedAt === 0) {
      sampleRef.current.startedAt = now;
      return;
    }
    sampleRef.current.frames += 1;
    const elapsed = now - sampleRef.current.startedAt;
    if (elapsed < 1000) return;
    window.__NUMBER_NEXUS_3D_METRICS__ = {
      active: true,
      quality,
      fps: Math.round((sampleRef.current.frames * 1000) / elapsed),
      dpr: gl.getPixelRatio(),
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      sampledAt: Date.now(),
    };
    sampleRef.current = { frames: 0, startedAt: now };
  });

  return null;
}

function buildDistricts(worldState: NumberNexusLevel3WorldState, selectedDistrictId: string | null): DistrictRenderDefinition[] {
  if (selectedDistrictId) {
    const selected = worldState.districts.find((district) => district.id === selectedDistrictId);
    if (!selected) return [];
    const overworldLayout = DISTRICT_LAYOUT[selected.id] ?? DISTRICT_LAYOUT["counting-district"];
    return [
      {
        ...selected,
        ...DISTRICT_INTERIOR_LAYOUT,
        color: overworldLayout.color,
      },
    ];
  }

  return worldState.districts.map((district) => ({
    ...district,
    ...DISTRICT_LAYOUT[district.id],
  }));
}

function buildGates(worldState: NumberNexusLevel3WorldState, selectedDistrictId: string | null, guidedAdventure = false): GateDefinition[] {
  if (guidedAdventure) {
    return [{
      id: worldState.nextActivity.gateId,
      label: "START",
      fullLabel: "Start Your Adventure",
      kind: "adventure",
      position: [0, 0, -4],
      color: "#22d3c5",
      state: "current",
      route: worldState.nextActivity.route,
      week: worldState.currentWeek,
      interactionDistance: 3.4,
      spawnPointId: `number-${worldState.level.toLowerCase().replace(/\s+/g, "-")}-adventure`,
    }];
  }
  const districtGates = worldState.districts.map((district) => {
    const layout = DISTRICT_LAYOUT[district.id] ?? DISTRICT_LAYOUT["counting-district"];
    return {
      id: `${district.id}-entrance`,
      label: "ENTER",
      fullLabel: district.label,
      weekRangeLabel: district.weekRangeLabel,
      kind: "district" as const,
      position: [layout.position[0], 0, layout.position[2]] as [number, number, number],
      color: layout.color,
      state: district.state,
      districtId: district.id,
      spawnPointId: district.spawnPointId,
    };
  });
  const selectedDistrict = selectedDistrictId
    ? worldState.districts.find((district) => district.id === selectedDistrictId)
    : null;
  const selectedLayout = selectedDistrict ? DISTRICT_INTERIOR_LAYOUT : null;
  const selectedWeekNodes = selectedDistrict
    ? worldState.weekNodes.filter((node) => node.districtId === selectedDistrict.id)
    : [];
  const countingGatePositions: [number, number, number][] = [[-9.2, 0, -1.3], [0, 0, -8.3], [9.2, 0, -1.3]];
  const weekGatePositions = selectedLayout
    ? selectedWeekNodes.map((_, index) => {
        if (selectedDistrict?.id === "counting-district") return countingGatePositions[index] ?? [0, 0, 0];
        const spacing = selectedWeekNodes.length === 1 ? 0 : 6.4;
        const offset = (index - (selectedWeekNodes.length - 1) / 2) * spacing;
        return [selectedLayout.position[0] + offset, 0, selectedLayout.position[2] - 2.2] as [number, number, number];
      })
    : [];

  const gates = [
    ...(selectedDistrict ? [] : districtGates),
    ...(selectedDistrict ? [{
      id: `${selectedDistrict.id}-city-return`,
      label: "RETURN",
      fullLabel: "Number Nexus City",
      kind: "city-return" as const,
      position: [0, 0, 25.5] as [number, number, number],
      color: "#22d3c5",
      state: "available" as const,
      interactionDistance: 4.2,
      spawnPointId: `${selectedDistrict.id}-city-return`,
    }] : []),
    ...selectedWeekNodes.map((node, index) => ({
      id: node.id,
      label: node.label,
      fullLabel: `${node.label} · Week Overview`,
      kind: "week" as const,
      position: weekGatePositions[index] ?? [0, 0, 0],
      color: node.nextActivityType === "quiz" ? "#f59e0b" : "#14b8a6",
      state: node.state,
      route: node.route,
      week: node.week,
      districtId: node.districtId,
      nextActivityType: node.nextActivityType,
      lessonNumber: node.lessonNumber,
      lessonId: node.lessonId,
      spawnPointId: node.spawnPointId,
    })),
  ];

  if (selectedDistrict) return gates;

  return [
    ...gates,
    {
      id: `number-${worldState.level.toLowerCase().replace(/\s+/g, "-")}-tower-door`,
      label: "TOWER",
      fullLabel: "The Tower · Number Nexus Gateway",
      kind: "tower" as const,
      position: [0, 0, 38],
      color: "#f8fafc",
      state: "available" as const,
      route: "/world/tower?spawn=number-return",
      spawnPointId: `number-${worldState.level.toLowerCase().replace(/\s+/g, "-")}-tower-door`,
    },
  ];
}

function buildSpawnPoints(gates: GateDefinition[], districts: DistrictRenderDefinition[]) {
  const points = new Map<string, [number, number, number]>();
  points.set("start", PLAYER_START);
  for (const gate of gates) {
    points.set(gate.spawnPointId, [gate.position[0], 0.75, gate.position[2] + 1.7]);
  }
  for (const district of districts) {
    points.set(district.spawnPointId, [district.position[0], 0.75, district.position[2] + district.size[2] / 2 + 1.2]);
  }
  return points;
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  background: "rgba(15,23,42,0.38)",
  pointerEvents: "auto",
};

const modalStyle: React.CSSProperties = {
  width: "min(420px, calc(100vw - 28px))",
  border: "1px solid rgba(255,255,255,0.22)",
  borderRadius: 8,
  background: "rgba(15,23,42,0.96)",
  color: "#f8fafc",
  padding: 16,
  boxShadow: "0 22px 60px rgba(0,0,0,0.45)",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
};

const modalTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
};

const secondaryButtonStyle: React.CSSProperties = {
  marginTop: 12,
  border: "1px solid rgba(255,255,255,0.22)",
  borderRadius: 7,
  padding: "10px 12px",
  background: "rgba(15,23,42,0.9)",
  color: "#f8fafc",
  fontWeight: 900,
  cursor: "pointer",
};

export default function NumberNexusLevel3World({ level }: { level: RealmLevelId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1";
  const theme = getNumberNexusLevelTheme(level);
  const guidedAdventure = theme.experienceMode === "guided-adventure";
  const requestedQuality = searchParams.get("quality");
  const artQuality: NumberNexusArtQuality = requestedQuality === "low" || requestedQuality === "high" ? requestedQuality : "medium";
  const metricsEnabled = searchParams.get("metrics") === "1";
  const requestedCaptureState = searchParams.get("captureGateState");
  const captureGateState: WorldGateState | null = preview && (
    requestedCaptureState === "locked"
    || requestedCaptureState === "available"
    || requestedCaptureState === "current"
    || requestedCaptureState === "completed"
  ) ? requestedCaptureState : null;
  const captureQuizReady = preview && searchParams.get("captureQuiz") === "1";
  const initialYaw = Number(searchParams.get("camYaw")) || 0;
  const initialPitch = searchParams.get("camPitch") !== null ? Number(searchParams.get("camPitch")) : -0.08;
  const levelParam = encodeURIComponent(level);
  const returnPath = `/world/number-nexus?level=${levelParam}${preview ? "&teacher_preview=1" : ""}`;
  const twoDWorldPath = `/number-nexus?level=${levelParam}${preview ? "&teacher_preview=1" : ""}`;
  const towerHubPath = `/world/tower?spawn=number-return${preview ? "&teacher_preview=1" : ""}`;
  const [worldState, setWorldState] = useState(() => getNumberNexusWorldState({ preview, level }));
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(() => guidedAdventure ? null : searchParams.get("district"));
  const [nearestGate, setNearestGate] = useState<GateDefinition | null>(null);
  const [towerOpen, setTowerOpen] = useState(false);
  const [spawnTarget, setSpawnTarget] = useState<[number, number, number] | null>(null);
  const [spawnNonce, setSpawnNonce] = useState(0);
  const [moveInput, setMoveInput] = useState({ up: false, down: false, left: false, right: false });
  const districts = useMemo(() => guidedAdventure ? [] : buildDistricts(worldState, selectedDistrictId), [guidedAdventure, selectedDistrictId, worldState]);
  const gates = useMemo(() => buildGates(worldState, selectedDistrictId, guidedAdventure), [guidedAdventure, selectedDistrictId, worldState]);
  const spawnPoints = useMemo(() => buildSpawnPoints(gates, districts), [gates, districts]);
  const spawnParam = searchParams.get("spawn");
  const initialPosition = spawnParam
    ? spawnPoints.get(spawnParam) ?? (guidedAdventure ? GUIDED_PLAYER_START : selectedDistrictId ? DISTRICT_INTERIOR_START : PLAYER_START)
    : selectedDistrictId
      ? DISTRICT_INTERIOR_START
      : guidedAdventure ? GUIDED_PLAYER_START : PLAYER_START;
  const currentDistrict = worldState.districts.find((district) => district.id === (selectedDistrictId ?? worldState.currentDistrictId));

  const refreshWorldState = useCallback(() => {
    setWorldState(getNumberNexusWorldState({ preview, level }));
  }, [level, preview]);

  useEffect(() => {
    clearWorld3DReturnContext();
    window.addEventListener("focus", refreshWorldState);
    window.addEventListener(WORLD3D_CANONICAL_RESTORED_EVENT, refreshWorldState);
    document.addEventListener("visibilitychange", refreshWorldState);
    return () => {
      window.removeEventListener("focus", refreshWorldState);
      window.removeEventListener(WORLD3D_CANONICAL_RESTORED_EVENT, refreshWorldState);
      document.removeEventListener("visibilitychange", refreshWorldState);
    };
  }, [refreshWorldState]);

  function teleportTo(spawnPointId: string, districtId?: string) {
    const target = districtId ? DISTRICT_INTERIOR_START : spawnPoints.get(spawnPointId);
    if (!target) return;
    if (districtId) setSelectedDistrictId(districtId);
    setSpawnTarget(target);
    setSpawnNonce((value) => value + 1);
    setTowerOpen(false);
  }

  function enterGate(gate: GateDefinition) {
    if (gate.state === "locked") return;
    if (gate.kind === "city-return") {
      returnToCity();
      return;
    }
    if (gate.kind === "district") {
      if (gate.districtId) setSelectedDistrictId(gate.districtId);
      teleportTo(gate.spawnPointId, gate.districtId);
      return;
    }
    if (gate.kind === "tower") {
      setTowerOpen(true);
      return;
    }
    if (!gate.route || !gate.week) return;
    const queryGlue = returnPath.includes("?") ? "&" : "?";
    const districtQuery = gate.districtId ? `&district=${encodeURIComponent(gate.districtId)}` : "";
    const gateReturnPath = `${returnPath}${queryGlue}spawn=${encodeURIComponent(gate.spawnPointId)}${districtQuery}`;
    rememberWorld3DWeekEntry({
      realmId: "number",
      level: worldState.level,
      districtId: gate.kind === "adventure" ? "guided-adventure" : gate.districtId ?? currentDistrict?.id ?? "counting-district",
      week: gate.week,
      spawnPointId: gate.spawnPointId,
      returnHref: gateReturnPath,
    });
    router.push(gate.route);
  }

  async function quickStart() {
    const journey = await resolveWorldJourney();
    const url = new URL(journey.route, "https://level-up-learning.local");
    const week = Number(url.searchParams.get("week"));
    const targetNode = Number.isInteger(week) ? worldState.weekNodes.find((node) => node.week === week) : null;
    if (targetNode) {
      const queryGlue = returnPath.includes("?") ? "&" : "?";
      const districtQuery = guidedAdventure ? "" : `&district=${encodeURIComponent(targetNode.districtId)}`;
      rememberWorld3DWeekEntry({ realmId: "number", level: worldState.level, districtId: guidedAdventure ? "guided-adventure" : targetNode.districtId, week: targetNode.week, spawnPointId: targetNode.spawnPointId, returnHref: `${returnPath}${queryGlue}spawn=${encodeURIComponent(targetNode.spawnPointId)}${districtQuery}` });
    } else if (url.pathname === "/posttest") {
      const returnNode = [...worldState.weekNodes].reverse().find((node) => node.state !== "locked") ?? worldState.weekNodes[0];
      if (returnNode) {
        const queryGlue = returnPath.includes("?") ? "&" : "?";
        const districtQuery = guidedAdventure ? "" : `&district=${encodeURIComponent(returnNode.districtId)}`;
        rememberWorld3DPosttestEntry({ realmId: "number", level: worldState.level, districtId: guidedAdventure ? "guided-adventure" : returnNode.districtId, week: returnNode.week, spawnPointId: returnNode.spawnPointId, returnHref: `${returnPath}${queryGlue}spawn=${encodeURIComponent(returnNode.spawnPointId)}${districtQuery}` });
      }
    }
    router.push(journey.route);
  }

  function returnToCity() {
    setSelectedDistrictId(null);
    setSpawnTarget(PLAYER_START);
    setSpawnNonce((value) => value + 1);
    setNearestGate(null);
  }

  return (
    <main data-world3d-root style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", background: "#111827" }}>
      <Canvas style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} camera={{ position: [0, 6.5, 10], fov: 52 }} dpr={artQuality === "low" ? 1 : artQuality === "medium" ? [1, 1.25] : [1, 1.5]} gl={{ antialias: artQuality !== "low", powerPreference: "high-performance" }}>
        <WorldScene
          gates={gates}
          districts={districts}
          selectedDistrictId={selectedDistrictId}
          currentMissionGateId={worldState.nextActivity.gateId}
          quality={artQuality}
          captureGateState={captureGateState}
          captureQuizReady={captureQuizReady}
          initialPosition={initialPosition}
          spawnTarget={spawnTarget}
          spawnNonce={spawnNonce}
          moveInput={moveInput}
          onNearestGate={setNearestGate}
          initialYaw={initialYaw}
          initialPitch={initialPitch}
          experienceMode={theme.experienceMode}
          theme={theme}
        />
        {metricsEnabled ? <SceneMetricsReporter quality={artQuality} /> : null}
        {/* Effects are off during the composition-blockout pass (add ?fx=1 to preview). */}
        {selectedDistrictId === "counting-district" && artQuality !== "low" && searchParams.get("fx") === "1" ? (
          <EffectComposer>
            <Bloom intensity={0.85} luminanceThreshold={0.45} luminanceSmoothing={0.32} mipmapBlur radius={0.72} />
            <Vignette offset={0.24} darkness={0.72} eskil={false} />
          </EffectComposer>
        ) : null}
      </Canvas>

      <WorldHUD
        context="realm"
        preview={preview}
        accent={theme.energyAccent}
        fallbackHref={twoDWorldPath}
        mission={{
          eyebrow: "CURRENT MISSION",
          title: `Number Nexus · ${level === "Prep" ? "Ground" : level.replace("Year", "Level")}`,
          detail: worldState.nextActivity.label,
        }}
        primaryAction={selectedDistrictId ? {
          label: "DISTRICTS",
          icon: "map",
          onClick: returnToCity,
        } : {
          label: "RETURN TO TOWER",
          icon: "door",
          onClick: () => router.push(towerHubPath),
        }}
        onQuickStart={quickStart}
      />

      <WorldMovePad input={moveInput} onChange={setMoveInput} />

      {nearestGate ? <WorldInteractionPrompt location={nearestGate.fullLabel} status={statusText(nearestGate.state)} actionLabel={nearestGate.kind === "city-return" ? "RETURN TO CITY" : nearestGate.kind === "tower" ? "ENTER TOWER" : nearestGate.kind === "district" ? "ENTER DISTRICT" : nearestGate.kind === "adventure" ? "START ADVENTURE" : "ENTER WEEK"} disabled={nearestGate.state === "locked"} onAction={() => enterGate(nearestGate)} /> : null}

      {towerOpen ? (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalTitleStyle}>Tower Door</div>
            <div style={{ marginTop: 8, color: "#cbd5e1", fontWeight: 700 }}>Jump out to the wider realm hub or stay in this Number Nexus slice.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
              <button type="button" onClick={() => router.push(towerHubPath)} style={{ border: 0, borderRadius: 7, padding: "10px 12px", background: "#f8fafc", color: "#0f172a", fontWeight: 900, cursor: "pointer" }}>
                Tower Hub
              </button>
              <button type="button" onClick={() => router.push(twoDWorldPath)} style={secondaryButtonStyle}>
                2D World
              </button>
              <button type="button" onClick={() => setTowerOpen(false)} style={secondaryButtonStyle}>
                Stay Here
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <KeyboardEnterHandler gate={nearestGate} onEnter={enterGate} />
    </main>
  );
}

function KeyboardEnterHandler({ gate, onEnter }: { gate: GateDefinition | null; onEnter: (gate: GateDefinition) => void }) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || !gate) return;
      onEnter(gate);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [gate, onEnter]);
  return null;
}
