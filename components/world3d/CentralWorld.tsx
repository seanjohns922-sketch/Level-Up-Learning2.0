"use client";

import "./world-editor-mobile.css";

import { isRealmBuilding } from "@/lib/world3d/realm-building-collections";
import { isTrainAsset } from "@/lib/world3d/train-catalogue";
import { isVillageBuilding, VILLAGE_STYLES, villageStyle } from "@/lib/world3d/village-buildings";
import { newWorldPlacementId, gridStroke, CONNECTED_BOUNDARY_KEYS } from "@/lib/world3d/world-connections";
import { waterBrushCells } from "@/lib/world3d/world-water";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as THREE from "three";
import { Environment, Html, Lightformer } from "@react-three/drei";
import { Anchor, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bird, BrickWall, Castle, Check, Cherry, ChevronDown, ChevronUp, Minus, MoreHorizontal, Move, Plus, RotateCcw, DoorOpen, Droplets, Eraser, Feather, Fence, Flag, Flame, Flower2, Gem, Grid2x2, Hand, Hexagon, Home, Lamp, Landmark, LayoutGrid, Leaf, Logs, Mailbox, Map as MapIcon, MapPin, Mountain, PackageOpen, PartyPopper, PawPrint, Rabbit, Route, RotateCw, Shell, Shield, ShoppingBag, Shrub, Signpost, Sofa, Sprout, TreeDeciduous, TreePalm, TreePine, Trash2, Umbrella, Undo2, Waves, X, type LucideIcon } from "lucide-react";
import { useBuildGestures, type BuildGestureState } from "@/components/world3d/useBuildGestures";
import { freeBuildRender } from "@/lib/world3d/free-build-renders";
import { CentralWorldEnvironment } from "@/components/world3d/CentralWorldEnvironment";
import { fetchServerWorldLayout, hasPendingWorldLayoutSave, isSyncedWorldScope } from "@/lib/world3d/central-world-sync";
import { WorldHUD } from "@/components/world3d/WorldHUD";
import {
  EMPTY_WORLD_MOVE_INPUT,
  EMPTY_WORLD_LOOK_INPUT,
  KeyboardWorldAction,
  SharedThirdPersonPlayer,
  WorldJoystick,
  WorldLookJoystick,
  type WorldLookInput,
  type WorldMoveInput,
} from "@/components/world3d/SharedWorldPlayer";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { economyErrorMessage, fetchDemoEconomy, fetchStudentEconomy, type EconomyItem } from "@/lib/economy";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import {
  CENTRAL_WORLD_ANCHORS,
  CENTRAL_WORLD_CONFIG,
  type CentralWorldQuality,
} from "@/lib/world3d/central-world-config";
import {
  CENTRAL_WORLD_CUSTOMISATION_CATALOG,
  mergeCentralWorldCatalogue,
} from "@/lib/world3d/central-world-customisation-catalog";
import { rememberCentralWorldHomeEntry } from "@/lib/world3d/world-navigation-context";
import { joinSpeechParts, WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";
import { speak } from "@/lib/speak";
import { CENTRAL_WORLD_STARTER_SCENERY, type WorldSceneryGroup } from "@/lib/world3d/central-world-editor-catalog";
import {
  selectCentralWorldInventoryPlacement,
  CENTRAL_WORLD_GRID,
  CENTRAL_WORLD_HOME_KEY,
  CENTRAL_WORLD_HOME_ITEM,
  getCentralWorldHome,
  freshCentralWorldLayout,
  getCentralWorldHomeAnchors,
  gridToWorld,
  parseGridSize,
  placementOccupiesCell,
  readCentralWorldGroundTiles,
  readCentralWorldPlacements,
  validateCentralWorldGroundCell,
  validateCentralWorldPlacement,
  writeCentralWorldGroundTiles,
  writeCentralWorldPlacements,
  applyAccountCentralWorld,
  hasLocalCentralWorld,
  uploadLocalCentralWorld,
  type CentralWorldGroundTile,
  type CentralWorldGroundType,
  type CentralWorldPlacement,
} from "@/lib/world3d/central-world-layout";

const ARROW_CONTROLS_KEY = "lul:world-edit:arrow-controls:v1";
type WorldEditTool = CentralWorldGroundType | "move" | "scenery" | "erase";
const EDIT_TOOL_NAMES: Record<WorldEditTool, string> = { move: "Move", path: "Path", road: "Road", stone: "Stone", water: "Water", scenery: "Scenery", erase: "Eraser" };
// The free scenery palette is driven entirely off CENTRAL_WORLD_STARTER_SCENERY,
// grouped into these sections. Add an item to the catalogue (and a mesh in
// StarterScenery) and it appears here automatically.
// Category tabs for the build palette, so kids pick a category and see just its
// items instead of scrolling one long list.
type PaletteTab = "ground" | WorldSceneryGroup;
const PALETTE_TABS: Array<{ key: PaletteTab; label: string; Icon: LucideIcon }> = [
  { key: "ground", label: "Ground", Icon: Route },
  { key: "trees_plants", label: "Plants", Icon: TreeDeciduous },
  { key: "rocks_water", label: "Rocks", Icon: Mountain },
  { key: "furniture_fun", label: "Décor", Icon: Lamp },
  { key: "animals", label: "Animals", Icon: PawPrint },
  { key: "fortress", label: "Fortress", Icon: Castle },
];
type TrayTab = "owned" | PaletteTab;
const TRAY_TABS: Array<{ key: TrayTab; label: string }> = [
  { key: "owned", label: "My items" },
  ...PALETTE_TABS.map(({ key, label }) => ({ key, label })),
];
// Little pictures of each ground type for the tray.
function GroundSwatch({ tool }: { tool: WorldEditTool }) {
  if (tool === "water") return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="14" fill="#5cc8e8" /><path d="M22 36q10-8 20 0t20 0 20 0 20 0M22 56q10-8 20 0t20 0 20 0 20 0" stroke="#d9f6ff" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>;
  if (tool === "road") return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="10" fill="#4a4f57" /><path d="M18 45h18M50 45h18M82 45h18" stroke="#f5d76e" strokeWidth="6" strokeLinecap="round" /></svg>;
  if (tool === "stone") return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="10" fill="#8e8a82" />{[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={14 + c * 25 + (r % 2) * 6} y={16 + r * 21} width="20" height="16" rx="3" fill="#c9c4b8" />))}</svg>;
  return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="10" fill="#7fb84f" /><path d="M8 52c30-18 60 14 104-8v22H8z" fill="#d6b77a" /><circle cx="40" cy="58" r="3" fill="#b8975e" /><circle cx="78" cy="56" r="2.5" fill="#b8975e" /></svg>;
}
const GROUND_TOOLS: Array<[WorldEditTool, string, LucideIcon]> = [
  ["path", "Path", Route],
  ["road", "Road", Route],
  ["stone", "Stone", Route],
  ["water", "Water tiles", Waves],
];
// A little symbol per scenery item, keyed by its worldAssetKey. Bridge,
// toadstool and sign have no exact lucide glyph, so Landmark/Cherry/Signpost
// stand in as the closest read.
// Kid-friendly recolour palette shown when a scenery item is held.
const SCENERY_TINTS = ["#ef4444", "#f97316", "#f5c451", "#22c55e", "#16a34a", "#38bdf8", "#2563eb", "#a855f7", "#ec4899", "#8a5a34", "#f8fafc", "#1f2937"] as const;
const SCENERY_ICON: Record<string, LucideIcon> = {
  tree: TreeDeciduous, pine_tree: TreePine, palm_tree: TreePalm, gum_tree: TreeDeciduous, shrub: Shrub, hedge: Leaf, toadstool: Cherry, log: Logs, flower_bed: Flower2,
  boulder: Mountain, rock_pile: Hexagon, pond: Waves, fountain: Droplets, bridge: Landmark,
  lamp_post: Lamp, bench: Sofa, fence: Fence, mailbox: Mailbox, flag: Flag, umbrella: Umbrella, signpost: Signpost, balloons: PartyPopper,
  kangaroo: Rabbit, koala: PawPrint, wombat: PawPrint, emu: Bird, kookaburra: Feather, echidna: Shell, cockatoo: Bird,
  fruit_tree: Cherry, flower_pots: Flower2, mushroom_cluster: Sprout, hedge_arch: Shrub,
  hopscotch: Grid2x2, sandpit: Shell, seesaw: Logs, small_slide: Route,
  shield_decoration: Shield, supply_wagon: PackageOpen, training_dummy: Hand, stone_steps: BrickWall,
  small_jetty: Anchor, rowboat: Waves, fishing_rod_stand: Anchor, lifebuoy: Waves,
  castle_wall: BrickWall, castle_corner: Grid2x2, castle_gate: DoorOpen, castle_turret: Castle, castle_keep: Shield, castle_banner: Flag,
  drawbridge: Anchor, torch: Flame, chest: Gem, well: Droplets,
};

type CentralWorldMetrics = {
  active: boolean;
  quality: CentralWorldQuality;
  fps: number;
  dpr: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  sampledAt: number;
};

declare global {
  interface Window { __LEVEL_UP_CENTRAL_WORLD_3D_METRICS__?: CentralWorldMetrics }
}

function CentralWorldMetricsReporter({ quality }: { quality: CentralWorldQuality }) {
  const { gl } = useThree();
  const sample = useRef({ frames: 0, startedAt: 0 });
  useFrame(() => {
    const now = performance.now();
    if (sample.current.startedAt === 0) sample.current.startedAt = now;
    sample.current.frames += 1;
    if (now - sample.current.startedAt < 1000) return;
    window.__LEVEL_UP_CENTRAL_WORLD_3D_METRICS__ = {
      active: true,
      quality,
      fps: Math.round((sample.current.frames * 1000) / (now - sample.current.startedAt)),
      dpr: gl.getPixelRatio(),
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      sampledAt: Date.now(),
    };
    sample.current = { frames: 0, startedAt: now };
  });
  useEffect(() => () => { delete window.__LEVEL_UP_CENTRAL_WORLD_3D_METRICS__; }, []);
  return null;
}

function BuildModeCamera({ active, cursor, zoom, yaw, pitch }: { active: boolean; cursor: { gridX: number; gridZ: number }; zoom: number; yaw: number; pitch: number }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (!active) return;
    const [x, , z] = gridToWorld(cursor.gridX, cursor.gridZ);
    // Orbit the focus point: yaw spins 360° around it, pitch tilts from low
    // (see behind walls) to nearly top-down.
    const dist = zoom * 1.2;
    const horiz = Math.cos(pitch) * dist;
    const desired = new THREE.Vector3(x + Math.sin(yaw) * horiz, Math.max(2, Math.sin(pitch) * dist), z + Math.cos(yaw) * horiz);
    camera.position.lerp(desired, 1 - Math.pow(0.00001, delta));
    camera.lookAt(x, 0, z);
  });
  return null;
}

// What a press on the build surface turned into: picking up an item to drag, or
// (on empty ground with nothing chosen) a drag that pans the view.
type BuildCellResult = "carry" | "pan" | void;
type BuildSurfaceHandlers = {
  onCell: (gridX: number, gridZ: number, paint: boolean) => BuildCellResult;
  onCarry: (gridX: number, gridZ: number) => void;
  onCarryEnd: () => void;
  onHover: (gridX: number, gridZ: number) => void;
};

function BuildModeSurface({ active, paint, continuous, onStrokeState, gestureRef, handlers }: { active: boolean; paint: boolean; continuous: boolean; onStrokeState:(active:boolean)=>void; gestureRef: React.RefObject<BuildGestureState>; handlers: BuildSurfaceHandlers }) {
  const painting = useRef(false);
  const carrying = useRef(false);
  const lastCell = useRef("");
  const hoverCell = useRef("");
  const width = (CENTRAL_WORLD_GRID.maxX - CENTRAL_WORLD_GRID.minX + 1) * CENTRAL_WORLD_GRID.cellSize;
  const depth = (CENTRAL_WORLD_GRID.maxZ - CENTRAL_WORLD_GRID.minZ + 1) * CENTRAL_WORLD_GRID.cellSize;
  const centreX = ((CENTRAL_WORLD_GRID.minX + CENTRAL_WORLD_GRID.maxX) / 2) * CENTRAL_WORLD_GRID.cellSize;
  const centreZ = ((CENTRAL_WORLD_GRID.minZ + CENTRAL_WORLD_GRID.maxZ) / 2) * CENTRAL_WORLD_GRID.cellSize;

  function cellOf(event: ThreeEvent<PointerEvent>) {
    return {
      gridX: THREE.MathUtils.clamp(Math.round(event.point.x / CENTRAL_WORLD_GRID.cellSize), CENTRAL_WORLD_GRID.minX, CENTRAL_WORLD_GRID.maxX),
      gridZ: THREE.MathUtils.clamp(Math.round(event.point.z / CENTRAL_WORLD_GRID.cellSize), CENTRAL_WORLD_GRID.minZ, CENTRAL_WORLD_GRID.maxZ),
    };
  }

  function selectCell(event: ThreeEvent<PointerEvent>, shouldPaint: boolean): BuildCellResult {
    const { gridX, gridZ } = cellOf(event);
    const key = `${gridX}:${gridZ}`;
    if (key === lastCell.current && shouldPaint) return;
    const previous = lastCell.current;
    lastCell.current = key;
    if (shouldPaint && continuous && previous) {
      const [x,z]=previous.split(":").map(Number);
      for(const cell of gridStroke({gridX:x,gridZ:z},{gridX,gridZ})) handlers.onCell(cell.gridX,cell.gridZ,true);
      return;
    }
    return handlers.onCell(gridX, gridZ, shouldPaint);
  }

  function endPress(event: ThreeEvent<PointerEvent>) {
    onStrokeState(false);
    painting.current = false;
    lastCell.current = "";
    if (carrying.current) { carrying.current = false; handlers.onCarryEnd(); }
    const target = event.nativeEvent.target as HTMLElement | null;
    if (target?.hasPointerCapture?.(event.pointerId)) target.releasePointerCapture(event.pointerId);
  }

  if (!active) return null;
  return (
    <mesh
      position={[centreX, 0.34, centreZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={(event) => {
        if (gestureRef.current?.block || event.nativeEvent.button === 2) return;
        event.stopPropagation();
        onStrokeState(true);
        painting.current = paint;
        (event.nativeEvent.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
        const result = selectCell(event, paint);
        if (result === "carry") carrying.current = true;
        if (result === "pan" && gestureRef.current) gestureRef.current.mode = "pan";
      }}
      onPointerMove={(event) => {
        if (gestureRef.current?.block) { painting.current = false; carrying.current = false; return; }
        if (carrying.current) {
          event.stopPropagation();
          const { gridX, gridZ } = cellOf(event);
          handlers.onCarry(gridX, gridZ);
          return;
        }
        if (painting.current && paint) {
          event.stopPropagation();
          selectCell(event, true);
          return;
        }
        // A mouse hovering with nothing pressed: show where the item would land.
        if (event.nativeEvent.pointerType === "mouse" && event.nativeEvent.buttons === 0) {
          const { gridX, gridZ } = cellOf(event);
          const key = `${gridX}:${gridZ}`;
          if (key === hoverCell.current) return;
          hoverCell.current = key;
          handlers.onHover(gridX, gridZ);
        }
      }}
      onPointerUp={endPress}
      onPointerCancel={() => { onStrokeState(false); painting.current = false; carrying.current = false; lastCell.current = ""; }}
    >
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function CentralWorldScene({ onStrokeState, homePlacement, quality, moveInput, lookInput, spawnTarget, spawnNonce, spawnYaw, placedCustomisations, groundTiles, itemsById, buildPreview, groundPreview, editing, buildZoom, paintMode, surfaceHandlers, gestureRef, onEnterTower, onEnterHome, onActiveTarget, onToggleDrawbridge, cameraFocus, cameraYaw, cameraPitch, avatarPosRef }: { onStrokeState:(active:boolean)=>void; homePlacement: CentralWorldPlacement; quality: CentralWorldQuality; moveInput: WorldMoveInput; lookInput: WorldLookInput; spawnTarget: [number, number, number] | null; spawnNonce: number; spawnYaw: number; placedCustomisations: CentralWorldPlacement[]; groundTiles: CentralWorldGroundTile[]; itemsById: Map<string, EconomyItem>; buildPreview: { placement: CentralWorldPlacement; item: EconomyItem; valid: boolean } | null; groundPreview: { tile: CentralWorldGroundTile; valid: boolean; cells?: {gridX:number;gridZ:number;valid:boolean}[] } | null; editing: boolean; buildZoom: number; paintMode: boolean; surfaceHandlers: BuildSurfaceHandlers; gestureRef: React.RefObject<BuildGestureState>; onEnterTower: () => void; onEnterHome: () => void; onActiveTarget: (id: string | null) => void; onToggleDrawbridge: (placementId: string) => void; cameraFocus: { gridX: number; gridZ: number }; cameraYaw: number; cameraPitch: number; avatarPosRef: React.MutableRefObject<{ x: number; z: number }> }) {
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  // The camera can rest between cells while panning; the build grid snaps to one.
  const focusX = Math.round(cameraFocus.gridX), focusZ = Math.round(cameraFocus.gridZ);
  const focusCell = useMemo(() => ({ gridX: focusX, gridZ: focusZ }), [focusX, focusZ]);
  const handleNearestTarget = useCallback((id: string | null) => {
    setActiveTargetId(id);
    onActiveTarget(id);
  }, [onActiveTarget]);
  return (
    <>
      <color attach="background" args={["#69afe4"]} />
      <fog attach="fog" args={["#a8af8d", 90, 300]} />
      {/* Base rig, dialled back to leave room for the image-based lighting below
         so the scene reads lit rather than flat-shaded. */}
      <hemisphereLight args={["#d9efff", "#38522f", 0.7]} />
      <ambientLight intensity={0.18} color="#fff3da" />
      {/* Warm key light. On high quality it casts real soft shadows over the
         whole roam area, which is what grounds the buildings and animals. */}
      <directionalLight
        position={[-24, 35, 18]}
        intensity={1.85}
        color="#ffe1ad"
        castShadow={quality !== "low"}
        shadow-mapSize={quality === "high" ? [2048, 2048] : [1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={150}
        shadow-camera-left={-82}
        shadow-camera-right={82}
        shadow-camera-top={82}
        shadow-camera-bottom={-82}
        shadow-bias={-0.0004}
        shadow-normalBias={0.05}
      />
      <directionalLight position={[18, 16, -16]} intensity={0.45} color="#b9dcff" />
      {/* Static image-based lighting (rendered once) so metal roofs, gold trim
         and water pick up soft sky/ground reflections instead of reading as flat
         paint. Built from Lightformers — no external HDR, so CSP-safe. Skipped on
         the low tier to protect weaker devices. */}
      {quality !== "low" ? (
        <Environment resolution={quality === "high" ? 256 : 128} frames={1} background={false} environmentIntensity={0.45}>
          <color attach="background" args={["#8fb7d6"]} />
          <Lightformer intensity={1.5} color="#fff2d6" position={[-10, 14, 8]} scale={[16, 16, 1]} />
          <Lightformer intensity={0.7} color="#cfe6ff" position={[12, 8, -10]} scale={[12, 12, 1]} />
          <Lightformer intensity={0.5} color="#a7c8ec" position={[0, 12, -14]} scale={[20, 8, 1]} />
          <Lightformer intensity={0.4} form="ring" color="#6f9a58" position={[0, -8, 0]} scale={[24, 24, 1]} rotation={[Math.PI / 2, 0, 0]} />
        </Environment>
      ) : null}
      <CentralWorldEnvironment
        quality={quality}
        entranceActive={activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance}
        homeActive={activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance}
        homePlacement={homePlacement}
        placedCustomisations={placedCustomisations}
        groundTiles={groundTiles}
        itemsById={itemsById}
        buildPreview={buildPreview}
        groundPreview={groundPreview}
        editing={editing}
        editCursor={focusCell}
        onEnterTower={onEnterTower}
        onEnterHome={onEnterHome}
        onToggleDrawbridge={onToggleDrawbridge}
      />
      {/* A name tag floats over what the learner is near; the dock's main button acts on it. */}
      {activeTargetId && !editing && !buildPreview ? (() => {
        const home = activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance;
        const at = home ? getCentralWorldHomeAnchors(homePlacement).entrance : CENTRAL_WORLD_CONFIG.towerMainEntrance;
        const name = home ? "My Home" : "Tower of Knowledge";
        return (
          <Html position={[at[0], at[1] + (home ? 6.2 : 9), at[2]]} center zIndexRange={[20, 0]} style={{ pointerEvents: "auto" }}>
            <div className="centralWorldTag">
              {home ? <Home size={15} aria-hidden="true" /> : <Castle size={15} aria-hidden="true" />}
              <span>{name}</span>
              <WorldVoiceButton text={home ? "My Home. Your personal RELIQ space." : "Tower of Knowledge. The realm chamber."} compact label={`Read ${name}`} />
            </div>
          </Html>
        );
      })() : null}
      <SharedThirdPersonPlayer
        initialPosition={spawnTarget ?? CENTRAL_WORLD_CONFIG.spawnPoint}
        spawnTarget={spawnTarget}
        spawnNonce={spawnNonce}
        initialYaw={spawnYaw}
        moveInput={moveInput}
        lookInput={lookInput}
        bounds={CENTRAL_WORLD_CONFIG.playableBounds}
        roamEllipse={CENTRAL_WORLD_CONFIG.roamEllipse}
        interactionTargets={[
          { id: CENTRAL_WORLD_ANCHORS.towerMainEntrance, position: CENTRAL_WORLD_CONFIG.towerMainEntrance, distance: 6.2 },
          { id: CENTRAL_WORLD_ANCHORS.myHomeEntrance, position: getCentralWorldHomeAnchors(homePlacement).entrance, distance: 4.8 },
        ]}
        onNearestTargetId={handleNearestTarget}
        cameraDistance={11.5}
        cameraTargetHeight={3.6}
        cameraEnabled={!editing && !buildPreview}
        movementEnabled={!editing && !buildPreview}
        hidden={editing || Boolean(buildPreview)}
        speed={4.2}
        positionRef={avatarPosRef}
      />
      <BuildModeCamera active={editing || Boolean(buildPreview)} cursor={cameraFocus} zoom={buildZoom} yaw={cameraYaw} pitch={cameraPitch} />
      <BuildModeSurface active={editing || Boolean(buildPreview)} paint={paintMode} onStrokeState={onStrokeState} continuous={!buildPreview || CONNECTED_BOUNDARY_KEYS.has(String(buildPreview.item.metadata.worldAssetKey))} gestureRef={gestureRef} handlers={surfaceHandlers} />
      <CentralWorldMetricsReporter quality={quality} />
    </>
  );
}

const debugButton: React.CSSProperties = { border: "1px solid rgba(64,42,25,.2)", borderRadius: 5, padding: "9px 11px", background: "rgba(255,250,237,.94)", color: "#3f2b1e", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 24px rgba(45,31,19,.16)" };

function inventoryImage(item: EconomyItem) {
  const visual = item.metadata.marketplace_visual;
  if (!visual || typeof visual !== "object") return null;
  const source = (visual as { src?: unknown }).src;
  return typeof source === "string" ? source : null;
}

export default function CentralWorld() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1" || isDemoPreviewMode();
  const student = useMemo(() => getActiveStudentProfile(), []);
  const placementScope = preview ? "demo-preview" : student?.studentId ?? "guest";
  const [placedCustomisations, setPlacedCustomisations] = useState<CentralWorldPlacement[]>(() => readCentralWorldPlacements(placementScope));
  const homePlacement = getCentralWorldHome(placedCustomisations);
  const homeAnchors = getCentralWorldHomeAnchors(homePlacement);
  const requestedBuildItemKey = searchParams.get("build");
  const requestedQuality = searchParams.get("quality");
  const quality: CentralWorldQuality = requestedQuality === "low" || requestedQuality === "high" ? requestedQuality : "medium";
  const [moveInput, setMoveInput] = useState<WorldMoveInput>(EMPTY_WORLD_MOVE_INPUT);
  const [lookInput, setLookInput] = useState<WorldLookInput>(EMPTY_WORLD_LOOK_INPUT);
  // The player writes its live ground position here each frame, so opening Edit
  // World can centre the fixed build camera on wherever the avatar is standing.
  const avatarPosRef = useRef({ x: 0, z: 18 });
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [spawnTarget, setSpawnTarget] = useState<[number, number, number] | null>(() =>
    searchParams.get("spawn") === CENTRAL_WORLD_ANCHORS.towerExitSpawn
      ? CENTRAL_WORLD_CONFIG.towerExitSpawn
      : searchParams.get("spawn") === CENTRAL_WORLD_ANCHORS.myHomeExitSpawn
        ? homeAnchors.exit
      : null,
  );
  const [spawnNonce, setSpawnNonce] = useState(0);
  const [spawnYaw, setSpawnYaw] = useState(() => searchParams.get("spawn") === CENTRAL_WORLD_ANCHORS.myHomeExitSpawn ? homeAnchors.rotationY : 0);
  const [showIntro, setShowIntro] = useState(false);
  const [waterBrushWidth, setWaterBrushWidth] = useState(1);
  const [scenerySearch, setScenerySearch] = useState("");
  const [itemsById, setItemsById] = useState<Map<string, EconomyItem>>(() => new Map([...CENTRAL_WORLD_CUSTOMISATION_CATALOG, CENTRAL_WORLD_HOME_ITEM, ...CENTRAL_WORLD_STARTER_SCENERY].map((item) => [item.item_key, item])));
  const [ownedItemKeys, setOwnedItemKeys] = useState<Set<string>>(() => new Set());
  const [groundTiles, setGroundTiles] = useState<CentralWorldGroundTile[]>(() => readCentralWorldGroundTiles(placementScope));
  const [buildPlacement, setBuildPlacement] = useState<CentralWorldPlacement | null>(null);

  // The learner's world lives on their account: load it here (so it follows them
  // to any device), or move a world built before that up to the account.
  useEffect(() => {
    if (preview || !isSyncedWorldScope(placementScope)) return;
    let cancelled = false;
    void fetchServerWorldLayout(placementScope)
      .then((layout) => {
        if (cancelled) return;
        if (!layout) {
          if (hasLocalCentralWorld(placementScope)) uploadLocalCentralWorld(placementScope);
          return;
        }
        // An edit made while this loaded wins; it is about to be saved anyway.
        if (hasPendingWorldLayoutSave(placementScope)) return;
        applyAccountCentralWorld(placementScope, layout);
        setPlacedCustomisations(readCentralWorldPlacements(placementScope));
        setGroundTiles(readCentralWorldGroundTiles(placementScope));
      })
      .catch((error) => console.warn("[central-world] account world could not be loaded; using this browser's copy", error));
    return () => { cancelled = true; };
  }, [placementScope, preview]);
  const [editorOpen, setEditorOpen] = useState(false);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const resetCancel = useRef<HTMLButtonElement>(null);
  const [trayOpen, setTrayOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  // Arrow buttons are an option for learners who prefer them to gestures.
  const [arrowControls, setArrowControls] = useState(() => { try { return localStorage.getItem(ARROW_CONTROLS_KEY) === "1"; } catch { return false; } });
  const touchFirst = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
  const undoKeyLabel = useMemo(() => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘Z" : "Ctrl Z"), []);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [librarySection, setLibrarySection] = useState<"build" | "owned">("build");
  const [editTool, setEditTool] = useState<WorldEditTool>("move");
  const [selectedInventoryItemKey, setSelectedInventoryItemKey] = useState<string | null>(null);
  const [selectedSceneryItemKey, setSelectedSceneryItemKey] = useState<string | null>(null);
  const [paletteTab, setPaletteTab] = useState<PaletteTab>("ground");
  const [editCursor, setEditCursor] = useState({ gridX: -5, gridZ: 5 });
  // The build camera orbits this focus point; the right-hand pad spins (yaw) and
  // tilts (pitch) it a full turn so you can see your build from any angle.
  const [cameraFocus, setCameraFocus] = useState({ gridX: 0, gridZ: 9 });
  const [buildOrbit, setBuildOrbit] = useState({ yaw: 0.67, pitch: 0.78 });
  const orbitCamera = useCallback((dYaw: number, dPitch: number) => {
    setBuildOrbit((o) => ({ yaw: o.yaw + dYaw, pitch: THREE.MathUtils.clamp(o.pitch + dPitch, 0.32, 1.45) }));
  }, [setBuildOrbit]);
  const [buildZoom, setBuildZoom] = useState(28);
  const viewRef = useRef({ zoom: 28, yaw: 0.67, pitch: 0.78 });
  useEffect(() => { viewRef.current = { zoom: buildZoom, yaw: buildOrbit.yaw, pitch: buildOrbit.pitch }; }, [buildZoom, buildOrbit]);
  const zoomView = useCallback((factor: number) => setBuildZoom((z) => THREE.MathUtils.clamp(z * factor, 14, 44)), []);
  // Drag the ground and it follows your finger: turn screen pixels into grid
  // cells along the camera's current heading.
  const panView = useCallback((dxPx: number, dyPx: number) => {
    const height = canvasWrapRef.current?.clientHeight || window.innerHeight;
    const { zoom, yaw, pitch } = viewRef.current;
    const k = (2 * zoom * 1.2 * Math.tan(Math.PI / 6)) / height / CENTRAL_WORLD_GRID.cellSize;
    const depth = k / Math.max(0.35, Math.sin(pitch));
    const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
    const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
    setCameraFocus((f) => ({
      gridX: THREE.MathUtils.clamp(f.gridX - right.x * dxPx * k + forward.x * dyPx * depth, CENTRAL_WORLD_GRID.minX, CENTRAL_WORLD_GRID.maxX),
      gridZ: THREE.MathUtils.clamp(f.gridZ - right.z * dxPx * k + forward.z * dyPx * depth, CENTRAL_WORLD_GRID.minZ, CENTRAL_WORLD_GRID.maxZ),
    }));
  }, []);
  const strokeState = useRef({active:false,recorded:false});
  const [editHistory, setEditHistory] = useState<Array<{ placements: CentralWorldPlacement[]; tiles: CentralWorldGroundTile[] }>>([]);
  const [economyMessage, setEconomyMessage] = useState<string | null>(null);
  const historyRef = useRef(editHistory);
  useEffect(() => { historyRef.current = editHistory; }, [editHistory]);
  const hasAvailableAction = activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance || activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance;
  const editorItemKey = editorOpen ? selectedInventoryItemKey ?? selectedSceneryItemKey ?? null : null;
  const activeBuildItemKey = editorItemKey ?? requestedBuildItemKey;
  const buildItem = activeBuildItemKey ? itemsById.get(activeBuildItemKey) ?? null : null;
  // Exclude the item currently in hand by its unique placementId (not itemId),
  // so moving one of several identical scenery items leaves the others intact.
  const heldPlacementId = buildPlacement?.placementId ?? null;
  const placementsWithoutBuildItem = heldPlacementId ? placedCustomisations.filter((placement) => placement.placementId !== heldPlacementId) : placedCustomisations;
  const buildingTrain = isTrainAsset(buildItem?.metadata.worldAssetKey);
  const buildValid = Boolean(buildItem && buildPlacement && validateCentralWorldPlacement(buildPlacement, buildItem, placementsWithoutBuildItem, itemsById, groundTiles));
  const buildPreview = buildItem && buildPlacement ? { placement: buildPlacement, item: buildItem, valid: buildValid } : null;
  const heldItemKey = selectedInventoryItemKey ?? selectedSceneryItemKey;
  const isGroundTool = !heldItemKey && (editTool === "path" || editTool === "road" || editTool === "stone" || editTool === "water");
  const isEraseTool = !heldItemKey && editTool === "erase";
  const isMoveTool = !heldItemKey && editTool === "move";
  const groundPreview: { tile: CentralWorldGroundTile; valid: boolean; cells?: {gridX:number;gridZ:number;valid:boolean}[] } | null = editorOpen && (isGroundTool || isEraseTool) ? {
    cells: isGroundTool && editTool === "water" ? waterBrushCells(editCursor.gridX, editCursor.gridZ, waterBrushWidth).map(cell => ({...cell, valid: validateCentralWorldGroundCell(cell.gridX, cell.gridZ, placedCustomisations, "water")})) : undefined,
    tile: { ...editCursor, tileType: isGroundTool ? editTool : groundTiles.find((tile) => tile.gridX === editCursor.gridX && tile.gridZ === editCursor.gridZ)?.tileType ?? "stone" },
    valid: editTool !== "erase" && validateCentralWorldGroundCell(editCursor.gridX, editCursor.gridZ, placedCustomisations, isGroundTool ? editTool : undefined),
  } : null;
  const ownedWorldItems = useMemo(() => Array.from(ownedItemKeys)
    .map((itemKey) => itemsById.get(itemKey))
    .filter((item): item is EconomyItem => Boolean(item && ["buildings", "animals", "pools_play", "special", "trains"].includes(String(item.metadata.marketplaceCategory))))
    .sort((a, b) => a.sort_order - b.sort_order), [itemsById, ownedItemKeys]);

  useEffect(() => {
    let cancelled = false;
    const request = preview
      ? fetchDemoEconomy(CENTRAL_WORLD_CUSTOMISATION_CATALOG)
      : student?.studentId
        ? fetchStudentEconomy(student.studentId)
        : null;
    if (!request) return;
    void request
      .then((next) => {
        if (cancelled) return;
        const merged = mergeCentralWorldCatalogue(next);
        const nextItemsById = new Map([...merged.items, CENTRAL_WORLD_HOME_ITEM, ...CENTRAL_WORLD_STARTER_SCENERY].map((item) => [item.item_key, item]));
        const nextPlacements = readCentralWorldPlacements(placementScope);
        const ownedKeys = new Set(merged.inventory.map((entry) => entry.item_key));
        setItemsById(nextItemsById);
        setOwnedItemKeys(ownedKeys);

        if (requestedBuildItemKey && nextItemsById.has(requestedBuildItemKey) && ownedKeys.has(requestedBuildItemKey)) {
          const requestedItem = nextItemsById.get(requestedBuildItemKey)!;
          const nextBuildPlacement = selectCentralWorldInventoryPlacement(requestedItem, nextPlacements, { gridX: -5, gridZ: 5 });
          if (isVillageBuilding(requestedItem.metadata.worldAssetKey) || isRealmBuilding(requestedItem.metadata.worldAssetKey) || isTrainAsset(requestedItem.metadata.worldAssetKey)) {
            setEditorOpen(true);
            setLibrarySection("owned");
            setSelectedInventoryItemKey(requestedBuildItemKey);
          }
          const [worldX, , worldZ] = gridToWorld(nextBuildPlacement.gridX, nextBuildPlacement.gridZ);
          setBuildPlacement(nextBuildPlacement);
          setEditCursor({ gridX: nextBuildPlacement.gridX, gridZ: nextBuildPlacement.gridZ });
          setSpawnTarget([worldX, 0.75, worldZ + 8]);
          setSpawnNonce((value) => value + 1);
        } else if (requestedBuildItemKey) {
          setEconomyMessage("Unlock this item in the Marketplace before placing it.");
        }
      })
      .catch((error) => {
        if (!cancelled) setEconomyMessage(economyErrorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, [placementScope, preview, requestedBuildItemKey, student?.studentId]);

  // Pan the build camera/cursor by whole cells. The avatar stays put — panning no
  // longer teleports it to follow the cursor — and the cursor is clamped to the
  // grid. Stable identity so the keyboard listener can depend on it.
  // Whether an item is currently in hand, mirrored to a ref so the stable
  // move handler can branch without re-binding every render.
  const heldRef = useRef(false);
  useEffect(() => { heldRef.current = Boolean(buildPlacement); }, [buildPlacement]);

  // The arrows / WASD / on-screen arrows do double duty (and the avatar never
  // moves — its own movement is disabled and it's hidden while editing):
  //   • holding an item  → move that item around the grid, one cell at a time
  //   • nothing in hand  → pan the camera to look around the world
  const moveBuildPlacement = useCallback((dx: number, dz: number) => {
    const cx = (v: number) => THREE.MathUtils.clamp(v, CENTRAL_WORLD_GRID.minX, CENTRAL_WORLD_GRID.maxX);
    const cz = (v: number) => THREE.MathUtils.clamp(v, CENTRAL_WORLD_GRID.minZ, CENTRAL_WORLD_GRID.maxZ);
    if (heldRef.current) {
      // Move the item AND carry the camera with it, so you can walk it to a new
      // spot anywhere on the map and drop it there.
      setEditCursor((cur) => ({ gridX: cx(cur.gridX + dx), gridZ: cz(cur.gridZ + dz) }));
      setBuildPlacement((bp) => (bp ? { ...bp, gridX: cx(bp.gridX + dx), gridZ: cz(bp.gridZ + dz) } : bp));
      setCameraFocus((f) => ({ gridX: cx(Math.round(f.gridX) + dx), gridZ: cz(Math.round(f.gridZ) + dz) }));
    } else {
      setCameraFocus((f) => ({ gridX: cx(f.gridX + dx * 2), gridZ: cz(f.gridZ + dz * 2) }));
    }
  }, [setEditCursor, setBuildPlacement, setCameraFocus]);


  const rotateHeld = useCallback(() => {
    setBuildPlacement((current) => (current ? { ...current, rotation: ((current.rotation + 90) % 360) as CentralWorldPlacement["rotation"] } : current));
  }, [setBuildPlacement]);

  // Laptop keys while building. Arrows / WASD move the held item, or the view
  // when nothing is held. Swallowed so they neither scroll the page nor walk the avatar.
  //   R turn item · Q/E turn view · +/- zoom · Delete remove item · Esc put it down
  //   M move tool · X erase · Ctrl/Cmd+Z undo
  const inBuildMode = editorOpen || Boolean(buildPreview);
  const keyActions = useRef({ rotate: rotateHeld, remove: () => {}, cancel: () => {}, undo: () => {}, tool: (() => {}) as (tool: WorldEditTool) => void });
  useEffect(() => {
    if (!inBuildMode) return;
    const move: Record<string, [number, number]> = {
      arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1],
      arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0],
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable=true]")) return;
      if (resetDialog.current?.open || event.altKey) return;
      const key = event.key.toLowerCase();
      const actions = keyActions.current;
      if ((event.metaKey || event.ctrlKey) && key === "z") { event.preventDefault(); actions.undo(); return; }
      if (event.metaKey || event.ctrlKey) return;
      const delta = move[key];
      if (delta) { event.preventDefault(); moveBuildPlacement(delta[0], delta[1]); return; }
      const run: Record<string, () => void> = {
        r: actions.rotate,
        q: () => orbitCamera(0.4, 0),
        e: () => orbitCamera(-0.4, 0),
        "+": () => zoomView(0.85), "=": () => zoomView(0.85), "-": () => zoomView(1 / 0.85), _: () => zoomView(1 / 0.85),
        delete: actions.remove, backspace: actions.remove,
        escape: actions.cancel,
        m: () => actions.tool("move"),
        x: () => actions.tool("erase"),
      };
      const action = run[key];
      if (!action) return;
      event.preventDefault();
      action();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inBuildMode, moveBuildPlacement, orbitCamera, zoomView]);

  function focusCell() {
    return { gridX: Math.round(cameraFocus.gridX), gridZ: Math.round(cameraFocus.gridZ) };
  }

  // Last item planted in this drag, so a row of trees gets a gap between each.
  const strokeLastPlaced = useRef<{ gridX: number; gridZ: number } | null>(null);
  function setStrokeActive(active:boolean) {
    strokeState.current={active,recorded:false};
    strokeLastPlaced.current=null;
  }
  function recordWorldEdit() {
    if(strokeState.current.active&&strokeState.current.recorded)return;
    strokeState.current.recorded=true;
    setEditHistory(current=>[...current,{placements:placedCustomisations,tiles:groundTiles}].slice(-30));
  }

  function openWorldEditor() {
    // Centre the fixed build camera and the first item on wherever the avatar
    // is standing, so you build right where you are.
    const cell = CENTRAL_WORLD_GRID.cellSize;
    const cursor = {
      gridX: THREE.MathUtils.clamp(Math.round(avatarPosRef.current.x / cell), CENTRAL_WORLD_GRID.minX, CENTRAL_WORLD_GRID.maxX),
      gridZ: THREE.MathUtils.clamp(Math.round(avatarPosRef.current.z / cell), CENTRAL_WORLD_GRID.minZ, CENTRAL_WORLD_GRID.maxZ),
    };
    setCameraFocus(cursor);
    setEditCursor(cursor);
    setEditTool("move");
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(null);
    setBuildPlacement(null);
    setBuildZoom(28);
    setMenuOpen(false);
    setTrayOpen(true);
    if (ownedWorldItems.length) setLibrarySection("owned");
    setEditorOpen(true);
    // Leave the avatar where it was standing — only the build camera moves.
    void speak("Edit World. Choose something from the tray, then tap the ground to place it. Drag an item to move it. Drag the ground to look around, and pinch to zoom.", undefined, "manual", { rate: 0.9 });
  }

  function closeWorldEditor() {
    setStrokeActive(false);
    setMenuOpen(false);
    setEditorOpen(false);
    setBuildPlacement(null);
  }

  function chooseEditTool(tool: WorldEditTool) {
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(null);
    setEditTool(tool);
    if (tool === "water") setWaterBrushWidth(1);
    void speak(
      tool === "move"
        ? "Move selected. Tap anything you have placed to pick it up."
        : tool === "erase"
          ? "Eraser selected. Tap an item to remove it, or tap the ground to remove one square of water, path or road."
          : tool === "water"
            ? "Water tiles selected. Tap to place one square of water. Drag to join squares into a river or lake."
            : `${EDIT_TOOL_NAMES[tool]} selected. Tap or drag across the grass to paint it.`,
      undefined,
      "manual",
      { rate: 0.9 },
    );
    setBuildPlacement(null);
  }

  function chooseSceneryItem(item: EconomyItem) {
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(item.item_key);
    setEditTool("scenery");

    setBuildPlacement({ placementId: newWorldPlacementId(item.item_key), itemId: item.item_key, ...focusCell(), rotation: 0 });
    void speak(`${item.name} selected. Tap the grass to place it, and drag to lay a whole row. Place as many as you like.`, undefined, "manual", { rate: 0.9 });
  }

  function setHeldTint(tint: string | undefined) {
    setBuildPlacement((current) => (current ? { ...current, tint } : current));
  }

  function chooseInventoryItem(item: EconomyItem) {
    setSelectedSceneryItemKey(null);
    setSelectedInventoryItemKey(item.item_key);
    setBuildPlacement(selectCentralWorldInventoryPlacement(item, placedCustomisations, focusCell()));
    void speak(isTrainAsset(item.metadata.worldAssetKey) ? `${item.name} selected. Tap an empty railway track to place it. The train follows the track direction.` : `${item.name} selected. Tap the grass to place it. Rotate first if you need to.`, undefined, "manual", { rate: 0.9 });
  }

  function closeBuildMode() {
    setBuildPlacement(null);
    router.replace(preview ? "/world?teacher_preview=1" : "/world");
  }

  // Move tool: tap anywhere on a placed object to pick it up, then nudge / rotate
  // / delete / place it. Reuses the held-item flow (selecting its item hides it
  // from the placed set while it's in hand).
  function pickUpPlacementAt(gridX: number, gridZ: number): boolean {
    const hit = [...placedCustomisations].reverse().find((placement) => {
      const item = itemsById.get(placement.itemId);
      return item ? placementOccupiesCell(placement, item, gridX, gridZ) : false;
    });
    if (!hit) return false;
    if (hit.itemId === CENTRAL_WORLD_HOME_KEY) { moveMyHome(); return true; }
    const item = itemsById.get(hit.itemId);

    setSelectedSceneryItemKey(null);
    setSelectedInventoryItemKey(hit.itemId);
    setBuildPlacement({ ...hit, placementId: hit.placementId ?? newWorldPlacementId(hit.itemId) });
    setEditCursor({ gridX: hit.gridX, gridZ: hit.gridZ });
    void speak(`${item?.name ?? "Item"} picked up. Drag it to a new spot, or tap where it should go.`, undefined, "manual", { rate: 0.9 });
    return true;
  }

  function moveMyHome() {
    setSelectedSceneryItemKey(null);
    setSelectedInventoryItemKey(CENTRAL_WORLD_HOME_KEY);
    setEditTool("move");
    setBuildPlacement({ ...homePlacement });
    setEditCursor({ gridX: homePlacement.gridX, gridZ: homePlacement.gridZ });
    setCameraFocus({ gridX: homePlacement.gridX, gridZ: homePlacement.gridZ });
    setMenuOpen(false);
    void speak("Move My Home. Drag your house or tap a clear space. Turn rotates the house. Green means the house and doorway fit. Place saves it. Cancel keeps your home where it was. Existing paths stay where they are; use Ground and Erase to redesign them.", undefined, "manual", { rate: 0.9 });
  }

  function commitHomePlacement(candidate: CentralWorldPlacement) {
    const next = [...placedCustomisations.filter(p => p.itemId !== CENTRAL_WORLD_HOME_KEY), { ...candidate, placementId: CENTRAL_WORLD_HOME_KEY }];
    try { writeCentralWorldPlacements(placementScope, next); }
    catch { setEconomyMessage("Your home could not be saved. Please try again."); return; }
    recordWorldEdit();
    setPlacedCustomisations(next);
    setBuildPlacement(null);
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(null);
    setEditTool("move");
    setSpawnTarget(getCentralWorldHomeAnchors(candidate).exit);
    setSpawnYaw(getCentralWorldHomeAnchors(candidate).rotationY);
    setSpawnNonce(value => value + 1);
    void speak("Home moved. Your Home shortcut and doorway moved too. Existing paths stay in place. Use Path and Erase to make your new route.", undefined, "manual", { rate: 0.9 });
  }

  function deleteHeldPlacement() {
    if (!buildItem || buildItem.item_key === CENTRAL_WORLD_HOME_KEY) return;
    recordWorldEdit();
    // placementsWithoutBuildItem already excludes the held item, so committing it
    // removes the object entirely.
    writeCentralWorldPlacements(placementScope, placementsWithoutBuildItem);
    setPlacedCustomisations(placementsWithoutBuildItem);
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(null);
    setBuildPlacement(null);
    setEditTool("move");
    void speak(`${buildItem.name} deleted.`, undefined, "manual", { rate: 0.9 });
  }

  function confirmBuildPlacement() {
    if (!buildPlacement || !buildItem || !buildValid) return;
    if (buildPlacement.itemId === CENTRAL_WORLD_HOME_KEY) { commitHomePlacement(buildPlacement); return; }
    recordWorldEdit();
    const next = [...placementsWithoutBuildItem, buildPlacement];
    writeCentralWorldPlacements(placementScope, next);
    setPlacedCustomisations(next);
    void speak(`${buildItem.name} added.`, undefined, "manual", { rate: 0.9 });
    if (editorOpen && selectedSceneryItemKey) {

      setBuildPlacement({ ...buildPlacement, placementId: newWorldPlacementId(buildPlacement.itemId) });
    } else if (editorOpen) {
      setBuildPlacement(null); setSelectedInventoryItemKey(null); setSelectedSceneryItemKey(null); setEditTool("move");
    } else closeBuildMode();
  }

  function toggleDrawbridge(placementId: string) {
    setPlacedCustomisations((current) => {
      const next = current.map((p) => (p.placementId === placementId ? { ...p, state: p.state === "up" ? ("down" as const) : ("up" as const) } : p));
      writeCentralWorldPlacements(placementScope, next);
      return next;
    });
    void speak("Drawbridge.", undefined, "manual", { rate: 0.9 });
  }

  function applyGroundAt(gridX: number, gridZ: number, announce = false) {
    if (!editorOpen || heldItemKey) return;
    if (editTool === "erase") {
      if (!validateCentralWorldGroundCell(gridX, gridZ, placedCustomisations)) return;
      // Remove whatever the tapped cell belongs to. A placed object counts if the
      // cell is anywhere inside its footprint (not just its centre); only when no
      // object is hit do we rub out the ground tile underneath.
      const covering = placedCustomisations.filter((placement) => {
        const item = itemsById.get(placement.itemId);
        return item ? placementOccupiesCell(placement, item, gridX, gridZ) : false;
      });
      recordWorldEdit();
      if (covering.length > 0) {
        setPlacedCustomisations((current) => {
          const next = current.filter((placement) => !covering.includes(placement));
          writeCentralWorldPlacements(placementScope, next);
          return next;
        });
      } else {
        setGroundTiles((current) => {
          const next = current.filter((tile) => tile.gridX !== gridX || tile.gridZ !== gridZ);
          writeCentralWorldGroundTiles(placementScope, next);
          return next;
        });
      }
      if (announce) void speak("Removed.", undefined, "manual", { rate: 0.9 });
      return;
    }
    if (!isGroundTool || !validateCentralWorldGroundCell(gridX, gridZ, placedCustomisations, isGroundTool ? editTool : undefined)) return;
    recordWorldEdit();
    setGroundTiles((current) => {
      const cells = (editTool === "water" ? waterBrushCells(gridX, gridZ, waterBrushWidth) : [{gridX,gridZ}]).filter(cell => validateCentralWorldGroundCell(cell.gridX, cell.gridZ, placedCustomisations, editTool));
      const keys = new Set(cells.map(cell => cell.gridX+":"+cell.gridZ));
      const next = [...current.filter(entry => !keys.has(entry.gridX+":"+entry.gridZ)), ...cells.map(cell => ({...cell,tileType:editTool}))];
      writeCentralWorldGroundTiles(placementScope, next);
      return next;
    });
    if (announce) void speak(`${EDIT_TOOL_NAMES[editTool]} added.`, undefined, "manual", { rate: 0.9 });
  }

  // Minecraft-style: tap a cell to drop the held item right there (and keep it in
  // hand for the next), drag to lay a whole run. Invalid cells just show the red
  // ghost without placing.
  function placeHeldAt(gridX: number, gridZ: number) {
    if (!buildItem || !buildPlacement || buildPlacement.itemId === CENTRAL_WORLD_HOME_KEY) return;
    const repeat = Boolean(selectedSceneryItemKey);

    const candidate = { ...buildPlacement, gridX, gridZ, placementId: repeat ? newWorldPlacementId(buildPlacement.itemId) : buildPlacement.placementId };
    setEditCursor({ gridX, gridZ });
    const last = strokeLastPlaced.current;
    if (repeat && last && Math.max(...parseGridSize(buildItem)) >= 2 && Math.max(Math.abs(gridX - last.gridX), Math.abs(gridZ - last.gridZ)) < 2) {
      setBuildPlacement({ ...buildPlacement, gridX, gridZ });
      return;
    }
    if (!validateCentralWorldPlacement(candidate, buildItem, placementsWithoutBuildItem, itemsById, groundTiles)) {
      setBuildPlacement({...buildPlacement,gridX,gridZ});
      return;
    }
    recordWorldEdit();
    if (strokeState.current.active) strokeLastPlaced.current = { gridX, gridZ };
    setPlacedCustomisations(current => {
      const remaining=current.filter(p=>p.placementId!==candidate.placementId);
      if(!validateCentralWorldPlacement(candidate,buildItem,remaining,itemsById,groundTiles)) return current;
      const next=[...remaining,candidate];
      writeCentralWorldPlacements(placementScope,next);
      return next;
    });
    if(repeat){

      setBuildPlacement({ ...candidate, placementId: newWorldPlacementId(candidate.itemId) });
    } else {
      setBuildPlacement(null);setSelectedInventoryItemKey(null);setSelectedSceneryItemKey(null);setEditTool("move");
    }
  }

  function selectBuildCell(gridX: number, gridZ: number, paint: boolean): BuildCellResult {
    setMenuOpen(false);
    if (buildPlacement) {
      if (buildPlacement.itemId === CENTRAL_WORLD_HOME_KEY) {
        setBuildPlacement({ ...buildPlacement, gridX, gridZ });
        setEditCursor({ gridX, gridZ });
        return "carry";
      }
      // Editor: tap/drag drops the item. Marketplace deep-link (no editor): keep
      // the old move-the-cursor-then-Place flow so a single item isn't duplicated.
      if (editorOpen) placeHeldAt(gridX, gridZ);
      else setBuildPlacement({ ...buildPlacement, gridX, gridZ });
      return;
    }
    setEditCursor({ gridX, gridZ });
    if (isMoveTool) {
      // Press on an item to pick it up and drag it; press on open ground to look around.
      if (!editorOpen) return;
      carryMoved.current = false;
      return pickUpPlacementAt(gridX, gridZ) ? "carry" : "pan";
    }
    if (paint) applyGroundAt(gridX, gridZ);
    else return "pan";
  }

  // Dragging a picked-up item: it follows the finger, and lands where it is let go.
  const carryMoved = useRef(false);
  function carryHeldTo(gridX: number, gridZ: number) {
    if (!buildPlacement || (buildPlacement.gridX === gridX && buildPlacement.gridZ === gridZ)) return;
    carryMoved.current = true;
    setBuildPlacement({ ...buildPlacement, gridX, gridZ });
    setEditCursor({ gridX, gridZ });
  }
  function dropCarried() {
    if (carryMoved.current && buildValid) confirmBuildPlacement();
    carryMoved.current = false;
  }
  // Mouse hover: the held item (or the paint brush) previews where a click lands.
  function hoverAt(gridX: number, gridZ: number) {
    if (!editorOpen) return;
    if (buildPlacement) setBuildPlacement({ ...buildPlacement, gridX, gridZ });
    else if (isGroundTool || isEraseTool) setEditCursor({ gridX, gridZ });
  }
  // A second finger arriving means a pinch, not a tap: take back whatever the
  // first finger just placed or painted.
  function cancelStroke() {
    if (strokeState.current.active && strokeState.current.recorded) {
      const previous = historyRef.current.at(-1);
      if (previous) {
        setEditHistory((current) => current.slice(0, -1));
        setPlacedCustomisations(previous.placements);
        setGroundTiles(previous.tiles);
        writeCentralWorldPlacements(placementScope, previous.placements);
        writeCentralWorldGroundTiles(placementScope, previous.tiles);
      }
    }
    setStrokeActive(false);
  }
  const surfaceHandlers: BuildSurfaceHandlers = { onCell: selectBuildCell, onCarry: carryHeldTo, onCarryEnd: dropCarried, onHover: hoverAt };
  const gestureRef = useBuildGestures(canvasWrapRef, editorOpen || Boolean(buildPreview), {
    onPan: panView,
    onOrbit: orbitCamera,
    onZoom: zoomView,
    onCancelStroke: cancelStroke,
  });

  function startFreshWorld() {
    // Keep the current home, ownership and economy; only clear the editable layout.
    setStrokeActive(false);
    recordWorldEdit();
    const fresh = freshCentralWorldLayout(placedCustomisations);
    writeCentralWorldPlacements(placementScope, fresh.placements);
    writeCentralWorldGroundTiles(placementScope, fresh.tiles);
    setPlacedCustomisations(fresh.placements);
    setGroundTiles(fresh.tiles);
    setBuildPlacement(null);
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(null);
    setEditTool("move");
    resetDialog.current?.close();
    void speak("Your building space is clear. Your home and purchases are safe. Choose Undo to restore your previous world.", undefined, "manual", { rate: 0.9 });
  }

  function undoWorldEdit() {
    const previous = editHistory.at(-1);
    if (!previous) return;
    setEditHistory((current) => current.slice(0, -1));
    setBuildPlacement(null);
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(null);
    setEditTool("move");
    if (JSON.stringify(getCentralWorldHome(previous.placements)) !== JSON.stringify(homePlacement)) {
      setSpawnTarget(getCentralWorldHomeAnchors(getCentralWorldHome(previous.placements)).exit);
      setSpawnYaw(getCentralWorldHomeAnchors(getCentralWorldHome(previous.placements)).rotationY);
      setSpawnNonce(value => value + 1);
    }
    setPlacedCustomisations(previous.placements);
    setGroundTiles(previous.tiles);
    writeCentralWorldPlacements(placementScope, previous.placements);
    writeCentralWorldGroundTiles(placementScope, previous.tiles);
    void speak("Last world edit undone.", undefined, "manual", { rate: 0.9 });
  }

  useEffect(() => {
    keyActions.current = {
      rotate: rotateHeld,
      remove: () => { if (buildPlacement && selectedInventoryItemKey) deleteHeldPlacement(); },
      cancel: () => { if (menuOpen) setMenuOpen(false); else if (buildPlacement || heldItemKey || isGroundTool || isEraseTool) chooseEditTool("move"); },
      undo: undoWorldEdit,
      tool: chooseEditTool,
    };
  });
  useEffect(() => {
    const key = "lul:central-world:intro-seen:v1";
    try {
      if (sessionStorage.getItem(key) !== "1") {
        sessionStorage.setItem(key, "1");
        const revealTimer = window.setTimeout(() => setShowIntro(true), 0);
        const hideTimer = window.setTimeout(() => setShowIntro(false), 2300);
        return () => { window.clearTimeout(revealTimer); window.clearTimeout(hideTimer); };
      }
    } catch { /* Transient introduction state must never block the world. */ }
  }, []);

  useEffect(() => {
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousBodyTouchAction = document.body.style.touchAction;
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "none";
    return () => {
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.body.style.touchAction = previousBodyTouchAction;
    };
  }, []);

  function enterMyHome() {
    if (transitioning) return;
    rememberCentralWorldHomeEntry(preview);
    window.location.assign("/home-base");
  }

  function enterTower() {
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => window.location.assign(preview ? "/world/tower?teacher_preview=1" : "/world/tower"), 350);
  }

  function runActiveAction() {
    if (!activeTargetId || transitioning) return;
    if (activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance) enterMyHome();
    if (activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance) enterTower();
  }

  function teleport(position: [number, number, number], yaw = 0) {
    setSpawnTarget(position);
    setSpawnYaw(yaw);
    setSpawnNonce((value) => value + 1);
  }

  return (
    <main data-world3d-root data-world-library-open={editorOpen && trayOpen ? "true" : "false"} style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", overscrollBehavior: "none", touchAction: "none", WebkitUserSelect: "none", background: "#69afe4" }}>
      <div ref={canvasWrapRef} style={{ position: "absolute", inset: 0 }}>
      <Canvas style={{ touchAction: "none" }} camera={{ position: [0, 7, 29], fov: 60 }} dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.25] : [1, 1.5]} gl={{ antialias: quality !== "low", powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.06 }} shadows={quality !== "low" ? "soft" : false}>
        <CentralWorldScene onStrokeState={setStrokeActive} homePlacement={homePlacement} quality={quality} moveInput={buildPreview || editorOpen ? EMPTY_WORLD_MOVE_INPUT : moveInput} lookInput={buildPreview || editorOpen ? EMPTY_WORLD_LOOK_INPUT : lookInput} spawnTarget={spawnTarget} spawnNonce={spawnNonce} spawnYaw={spawnYaw} placedCustomisations={placementsWithoutBuildItem} groundTiles={groundTiles} itemsById={itemsById} buildPreview={buildPreview} groundPreview={groundPreview} editing={editorOpen} buildZoom={buildZoom} paintMode={editorOpen && (isGroundTool || isEraseTool || Boolean(heldItemKey))} surfaceHandlers={surfaceHandlers} gestureRef={gestureRef} onEnterTower={enterTower} onEnterHome={enterMyHome} onActiveTarget={setActiveTargetId} onToggleDrawbridge={toggleDrawbridge} cameraFocus={cameraFocus} cameraYaw={buildOrbit.yaw} cameraPitch={buildOrbit.pitch} avatarPosRef={avatarPosRef} />
      </Canvas>
      </div>

      {!editorOpen && !buildPreview ? <WorldHUD context="central" preview={preview} accent="#efbd61" primaryAction={{ label: "EDIT WORLD", icon: "edit", onClick: openWorldEditor }} contextAction={hasAvailableAction ? (activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance ? { label: "ENTER MY HOME", icon: "home", onClick: runActiveAction } : { label: "ENTER TOWER", icon: "door", onClick: runActiveAction }) : undefined} navActions={[
        { key: "centre", label: "Centre", icon: <MapPin size={15} />, onClick: () => teleport(CENTRAL_WORLD_CONFIG.spawnPoint) },
        { key: "home", label: "Home", icon: <Home size={15} />, onClick: () => teleport(homeAnchors.exit, homeAnchors.rotationY) },
        { key: "plaza", label: "Plaza", icon: <LayoutGrid size={15} />, onClick: () => teleport(CENTRAL_WORLD_CONFIG.towerPlaza) },
        { key: "map", label: "Map", icon: <MapIcon size={15} />, onClick: () => router.push(preview ? "/home-base?teacher_preview=1" : "/home-base") },
      ]} fallbackHref={preview ? "/home-base?teacher_preview=1" : "/home-base"} /> : null}

      {!buildPreview && !editorOpen ? <><WorldJoystick input={moveInput} onChange={setMoveInput} /><WorldLookJoystick onChange={setLookInput} /></> : null}
      {buildPreview && !editorOpen ? (
        <section aria-label="Build mode controls" style={{ position: "absolute", left: "50%", bottom: 22, transform: "translateX(-50%)", zIndex: 35, width: "min(94vw, 560px)", border: `2px solid ${buildValid ? "#4ade80" : "#fb7185"}`, borderRadius: 8, background: "rgba(18,28,24,.94)", color: "#fff", padding: 12, boxShadow: "0 14px 40px rgba(0,0,0,.35)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}><div><div style={{ color: "#f6c862", fontSize: 11, fontWeight: 950, letterSpacing: ".16em" }}>BUILD MODE</div><div style={{ marginTop: 2, fontSize: 18, fontWeight: 950 }}>{buildPreview.item.name}</div></div><WorldVoiceButton compact label="Read build instructions" text={`${buildPreview.item.name}. Use the arrow buttons to choose a place. Rotate it if you want. Green means it can be placed. Red means choose another space.`} /></div>
          <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 42px)", gridTemplateRows: "repeat(2, 42px)", gap: 4 }}>
              <button type="button" aria-label="Move building forward" title="Move forward" onClick={() => moveBuildPlacement(0, -1)} style={{ ...debugButton, gridColumn: 2, gridRow: 1, padding: 0 }}><ArrowUp size={20} /></button>
              <button type="button" aria-label="Move building left" title="Move left" onClick={() => moveBuildPlacement(-1, 0)} style={{ ...debugButton, gridColumn: 1, gridRow: 2, padding: 0 }}><ArrowLeft size={20} /></button>
              <button type="button" aria-label="Move building backward" title="Move backward" onClick={() => moveBuildPlacement(0, 1)} style={{ ...debugButton, gridColumn: 2, gridRow: 2, padding: 0 }}><ArrowDown size={20} /></button>
              <button type="button" aria-label="Move building right" title="Move right" onClick={() => moveBuildPlacement(1, 0)} style={{ ...debugButton, gridColumn: 3, gridRow: 2, padding: 0 }}><ArrowRight size={20} /></button>
            </div>
            <button type="button" onClick={() => setBuildPlacement((current) => current ? { ...current, rotation: ((current.rotation + 90) % 360) as CentralWorldPlacement["rotation"] } : current)} style={{ ...debugButton, minHeight: 46, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}><RotateCw size={18} /> Rotate</button>
            <div style={{ display: "grid", gap: 6 }}><button type="button" disabled={!buildValid} onClick={confirmBuildPlacement} style={{ ...debugButton, minHeight: 46, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: buildValid ? "#22c55e" : "#64748b", color: "white", opacity: buildValid ? 1 : .65 }}><Check size={19} /> Place</button><button type="button" onClick={closeBuildMode} style={{ ...debugButton, minHeight: 36, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}><X size={17} /> Cancel</button></div>
          </div>
          <div role="status" style={{ marginTop: 8, textAlign: "center", color: buildValid ? "#86efac" : "#fda4af", fontSize: 12, fontWeight: 850 }}>{buildValid ? "This space is ready." : buildingTrain ? "Choose an empty railway track or the station’s rails." : "This space is protected or already occupied."}</div>
        </section>
      ) : null}
      {editorOpen ? (() => {
        const trayTab: TrayTab = librarySection === "owned" ? "owned" : paletteTab;
        const query = scenerySearch.trim().toLowerCase();
        const sceneryInTab = paletteTab === "ground" ? [] : CENTRAL_WORLD_STARTER_SCENERY.filter((item) => item.metadata.worldAssetKey !== "rail_train" && item.metadata.worldSceneryGroup === paletteTab && item.name.toLowerCase().includes(query));
        const holding = Boolean(heldItemKey);
        const placing = holding || isGroundTool;
        const isHome = buildPlacement?.itemId === CENTRAL_WORLD_HOME_KEY;
        const tintable = buildPreview && (buildItem?.metadata.marketplaceCategory === "world_basic" || isVillageBuilding(buildItem?.metadata.worldAssetKey) || isRealmBuilding(buildItem?.metadata.worldAssetKey));
        const styled = buildPreview && isVillageBuilding(buildItem?.metadata.worldAssetKey) && buildItem?.metadata.worldAssetKey !== "village_apartments";
        const chooseTab = (tab: TrayTab) => {
          setTrayOpen(true);
          setScenerySearch("");
          if (tab === "owned") { setLibrarySection("owned"); return; }
          setLibrarySection("build");
          setPaletteTab(tab);
        };
        const startPlacing = () => {
          if (placing) return;
          if (trayTab === "owned") { if (ownedWorldItems[0]) chooseInventoryItem(ownedWorldItems[0]); }
          else if (trayTab === "ground") chooseEditTool("path");
          else if (sceneryInTab[0]) chooseSceneryItem(sceneryInTab[0]);
        };
        const hint = buildPreview
          ? buildValid
            ? isHome ? "House and doorway fit · choose Place to save" : buildingTrain ? "Track ready · tap to place your train" : touchFirst ? "Tap the ground to place · Two fingers to look around" : "Click to place · R to turn · Esc to put it down"
            : buildingTrain ? "Choose an empty railway track or the station’s rails" : "Red means no room here · choose clear ground"
          : isGroundTool
            ? touchFirst ? "Tap or drag the ground to paint · Two fingers to look around" : "Click or drag to paint · Right-drag to turn the view"
            : isEraseTool
              ? touchFirst ? "Tap an item or tile to remove it" : "Click an item or tile to remove it"
              : touchFirst ? "Tap the tray to choose · Drag an item to move it · Drag the ground to look around · Pinch to zoom" : "Pick from the tray · Drag an item to move it · Drag to look around · Scroll to zoom · Q / E to turn";
        return (
        <>
        <header className="worldEditBar" aria-label="World builder toolbar">
          <div className="worldEditTitle">
            <b>EDIT WORLD</b>
            <span className="worldEditSaved"><Check size={15} aria-hidden="true" />{preview ? "Preview · this browser only" : "Saved to your account"}</span>
            <WorldVoiceButton compact label="Read edit world instructions" text="Choose something from the tray at the bottom, then tap the ground to place it. Drag an item to move it. Drag the ground to look around, pinch to zoom, and use two fingers to turn. Erase removes things. Undo brings back your last change. Your world saves by itself." />
          </div>
          <div className="worldEditActions">
            <button type="button" className="worldEditRound" onClick={undoWorldEdit} disabled={!editHistory.length} aria-label="Undo last world edit" title={`Undo (${undoKeyLabel})`}><Undo2 size={22} /></button>
            <div className="worldEditMenuWrap">
              <button type="button" className="worldEditRound" aria-label="More options" aria-haspopup="menu" aria-expanded={menuOpen} aria-pressed={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={22} /></button>
              {menuOpen ? (
                <div className="worldEditMenu" role="menu" aria-label="More options">
                  <button type="button" role="menuitem" onClick={moveMyHome}><Home size={18} />Move my home</button>
                  <button type="button" role="menuitemcheckbox" aria-checked={arrowControls} onClick={() => {
                    const next = !arrowControls;
                    setArrowControls(next);
                    try { localStorage.setItem(ARROW_CONTROLS_KEY, next ? "1" : "0"); } catch { /* A per-device preference; fine to lose. */ }
                  }}><Move size={18} />Arrow controls<span className="worldEditMenuState">{arrowControls ? "On" : "Off"}</span></button>
                  <hr />
                  <button type="button" role="menuitem" className="worldEditMenuWarn" onClick={() => { setMenuOpen(false); setStrokeActive(false); resetDialog.current?.showModal(); resetCancel.current?.focus(); }}><RotateCw size={18} />Start fresh…</button>
                </div>
              ) : null}
            </div>
            <button type="button" className="worldEditDone" onClick={closeWorldEditor}><Check size={18} />DONE</button>
          </div>
        </header>
        <div className="worldEditHint" role="status" data-tone={buildPreview ? (buildValid ? "ok" : "bad") : "info"}>{hint}</div>

        <div className="worldEditZoom" aria-label="Zoom">
          <button type="button" className="worldEditRound" onClick={() => zoomView(0.85)} aria-label="Zoom camera in" title="Zoom in (+)"><Plus size={22} /></button>
          <button type="button" className="worldEditRound" onClick={() => zoomView(1 / 0.85)} aria-label="Zoom camera out" title="Zoom out (−)"><Minus size={22} /></button>
        </div>

        {arrowControls ? (
          <div className="worldEditArrows" aria-label="Arrow controls">
            <div className="worldEditPad">
              <button type="button" aria-label={buildPreview ? "Move item forward" : "Pan view forward"} onClick={() => moveBuildPlacement(0, -1)} style={{ gridColumn: 2, gridRow: 1 }}><ArrowUp size={20} /></button>
              <button type="button" aria-label={buildPreview ? "Move item left" : "Pan view left"} onClick={() => moveBuildPlacement(-1, 0)} style={{ gridColumn: 1, gridRow: 2 }}><ArrowLeft size={20} /></button>
              <button type="button" aria-label={buildPreview ? "Move item backward" : "Pan view backward"} onClick={() => moveBuildPlacement(0, 1)} style={{ gridColumn: 2, gridRow: 2 }}><ArrowDown size={20} /></button>
              <button type="button" aria-label={buildPreview ? "Move item right" : "Pan view right"} onClick={() => moveBuildPlacement(1, 0)} style={{ gridColumn: 3, gridRow: 2 }}><ArrowRight size={20} /></button>
            </div>
            <div className="worldEditTurnView">
              <button type="button" aria-label="Spin camera left" onClick={() => orbitCamera(0.5, 0)}><RotateCcw size={18} /></button>
              <button type="button" aria-label="Tilt camera up" onClick={() => orbitCamera(0, 0.18)}><ChevronUp size={18} /></button>
              <button type="button" aria-label="Tilt camera down" onClick={() => orbitCamera(0, -0.18)}><ChevronDown size={18} /></button>
              <button type="button" aria-label="Spin camera right" onClick={() => orbitCamera(-0.5, 0)}><RotateCw size={18} /></button>
            </div>
          </div>
        ) : null}

        <section className="worldEditTray" data-open={trayOpen ? "true" : "false"} aria-label="Edit world controls">
          {buildPreview || (isGroundTool && editTool === "water") ? (
            <div className="worldEditItemBar" aria-label={buildPreview ? "Build mode controls" : "Water brush"}>
              {buildPreview ? <>
                <b className="worldEditItemName">{buildPreview.item.name}</b>
                <button type="button" onClick={rotateHeld} aria-label="Turn item 90 degrees" title="Turn (R)"><RotateCw size={18} />Turn<kbd>R</kbd></button>
                {tintable ? (
                  <div className="worldEditTints" aria-label="Recolour item">
                    <button type="button" onClick={() => setHeldTint(undefined)} aria-pressed={!buildPlacement?.tint} aria-label="Default colour" title="Default colour" className="worldEditTintDefault" />
                    {SCENERY_TINTS.map((c) => <button key={c} type="button" onClick={() => setHeldTint(c)} aria-pressed={buildPlacement?.tint === c} aria-label={`Paint colour ${c}`} style={{ background: c }} />)}
                  </div>
                ) : null}
                {styled ? (
                  <select aria-label="Building style" value={villageStyle(buildPlacement?.buildingStyle)} onChange={(event) => {
                    const style = villageStyle(event.target.value);
                    setBuildPlacement((current) => current ? { ...current, buildingStyle: style } : current);
                    void speak(VILLAGE_STYLES[style], undefined, "manual", { rate: 0.9 });
                  }}>
                    {Object.entries(VILLAGE_STYLES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                ) : null}
                <span className="worldEditItemSpacer" />
                {selectedInventoryItemKey && !isHome ? <button type="button" className="worldEditDanger" onClick={deleteHeldPlacement} aria-label="Delete item" title="Delete"><Trash2 size={18} /></button> : null}
                <button type="button" onClick={() => chooseEditTool("move")} title="Put it down (Esc)"><X size={18} />{isHome ? "Cancel" : "Put away"}<kbd>Esc</kbd></button>
                {!selectedSceneryItemKey ? <button type="button" className="worldEditPlace" disabled={!buildValid} onClick={confirmBuildPlacement}><Check size={18} />Place</button> : null}
              </> : <>
                <b className="worldEditItemName">Water brush</b>
                {([[1, "1 square"], [3, "River"], [5, "Lake"]] as const).map(([width, label]) => <button key={width} type="button" aria-pressed={waterBrushWidth === width} onClick={() => { setWaterBrushWidth(width); void speak(width === 1 ? "One square. Tap to place water, or drag to join squares." : `${label} brush selected. Drag to paint a wider area.`, undefined, "manual", { rate: .9 }); }}>{label}</button>)}
              </>}
            </div>
          ) : null}
          <div className="worldEditTrayTop">
            <div className="worldEditTabs" role="tablist" aria-label="Build categories">
              {TRAY_TABS.map(({ key, label }) => (
                <button key={key} type="button" role="tab" aria-selected={trayTab === key} onClick={() => chooseTab(key)}>
                  {label}{key === "owned" ? <em>{ownedWorldItems.length}</em> : null}
                </button>
              ))}
            </div>
            {trayOpen && trayTab !== "owned" && trayTab !== "ground" ? (
              <input className="worldEditSearch" aria-label="Search scenery" placeholder="Search…" value={scenerySearch} onChange={(event) => setScenerySearch(event.target.value)} />
            ) : null}
            <div className="worldEditModes" role="group" aria-label="Build tool">
              <button type="button" aria-pressed={placing} onClick={startPlacing}><Plus size={16} />Place</button>
              <button type="button" aria-pressed={isMoveTool} onClick={() => chooseEditTool("move")} title="Move (M)"><Hand size={16} />Move<kbd>M</kbd></button>
              <button type="button" aria-pressed={isEraseTool} data-tone="erase" onClick={() => chooseEditTool("erase")} title="Erase (X)"><Eraser size={16} />Erase<kbd>X</kbd></button>
            </div>
            <button type="button" className="worldEditTrayToggle" aria-expanded={trayOpen} aria-label={trayOpen ? "Hide the item tray" : "Show the item tray"} onClick={() => setTrayOpen((open) => !open)}>{trayOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}</button>
          </div>
          {trayOpen ? (
            <div className="worldEditCards" key={trayTab} aria-label={trayTab === "owned" ? "Owned world inventory" : "Available building items"}>
              {trayTab === "owned" ? <>
                {ownedWorldItems.map((item) => {
                  const image = inventoryImage(item);
                  return (
                    <button key={item.item_key} type="button" className="worldEditCard" onClick={() => chooseInventoryItem(item)} aria-pressed={selectedInventoryItemKey === item.item_key} aria-label={`Place ${item.name}`}>
                      <span className="worldEditArt">{image ? <Image src={image} alt="" fill sizes="140px" style={{ objectFit: "cover" }} /> : <PackageOpen size={36} />}</span>
                      <b>{item.name}</b>
                    </button>
                  );
                })}
                {!ownedWorldItems.length ? <p className="worldEditEmpty">Buildings and places you unlock in the Marketplace appear here.</p> : null}
                <button type="button" className="worldEditCard worldEditShop" onClick={() => router.push(preview ? "/marketplace?teacher_preview=1" : "/marketplace")}>
                  <span className="worldEditArt"><ShoppingBag size={34} /></span><b>Get more</b>
                </button>
              </> : trayTab === "ground" ? GROUND_TOOLS.map(([tool, label]) => (
                <button key={tool} type="button" className="worldEditCard" onClick={() => chooseEditTool(tool)} aria-pressed={!heldItemKey && editTool === tool}>
                  <span className="worldEditArt"><GroundSwatch tool={tool} /></span><b>{label}</b>
                </button>
              )) : <>
                {sceneryInTab.map((item) => {
                  const art = freeBuildRender(String(item.metadata.worldAssetKey));
                  const Icon = SCENERY_ICON[String(item.metadata.worldAssetKey)] ?? Sprout;
                  return (
                    <button key={item.item_key} type="button" className="worldEditCard" onClick={() => chooseSceneryItem(item)} aria-pressed={selectedSceneryItemKey === item.item_key} aria-label={`Place ${item.name}`}>
                      <span className="worldEditArt worldEditArtFree">{art ? <Image src={art} alt="" fill sizes="140px" style={{ objectFit: "contain" }} /> : <Icon size={36} color={item.accent} />}</span>
                      <b>{item.name}</b>
                    </button>
                  );
                })}
                {paletteTab === "rocks_water" ? (
                  <button type="button" className="worldEditCard" onClick={() => { setPaletteTab("ground"); chooseEditTool("water"); }}>
                    <span className="worldEditArt"><GroundSwatch tool="water" /></span><b>Paint water</b>
                  </button>
                ) : null}
                {!sceneryInTab.length ? <p className="worldEditEmpty" role="status">No matching items.</p> : null}
              </>}
            </div>
          ) : null}
        </section>

        <dialog ref={resetDialog} className="worldBuilderReset" aria-labelledby="world-reset-title" aria-describedby="world-reset-description">
          <h2 id="world-reset-title">A fresh space to build?</h2>
          <p id="world-reset-description">Clear all placed items, paths, roads, stone and water. Your home and the tower stay. Your purchased items, rewards and XP are kept.</p>
          <p>You can use Undo to bring your layout back before leaving or reloading this page.</p>
          <WorldVoiceButton compact label="Read start fresh explanation" text="A fresh space to build? Clear all placed items, paths, roads, stone and water. Your home and the tower stay. Your purchased items, rewards and XP are kept. You can use Undo to bring your layout back before leaving or reloading this page."/>
          <div className="worldBuilderResetActions"><button type="button" ref={resetCancel} onClick={() => resetDialog.current?.close()}>Keep building</button><button type="button" onClick={startFreshWorld}>Clear my layout</button></div>
        </dialog>
        </>
        );
      })() : null}
      <KeyboardWorldAction enabled={hasAvailableAction && !editorOpen && !buildPreview} onAction={runActiveAction} />

      {economyMessage ? <div style={{ position: "absolute", left: 16, bottom: 126, maxWidth: 360, zIndex: 30, border: "1px solid rgba(146,64,14,.28)", borderRadius: 6, background: "rgba(255,251,235,.94)", color: "#78350f", padding: "10px 12px", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><span>{economyMessage}</span><WorldVoiceButton text={economyMessage} compact label="Read message" /></div> : null}
      {showIntro ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(24,31,25,.22)", color: "#fff8e8", pointerEvents: "none", animation: "centralWorldReveal 2.3s ease both" }}><div style={{ textAlign: "center", textShadow: "0 3px 18px rgba(0,0,0,.4)", pointerEvents: "auto" }}><div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.24em" }}>THE RELIQ WORLD</div><div style={{ marginTop: 8, fontSize: 30, fontWeight: 900 }}>Tower of Knowledge</div><div style={{ marginTop: 12 }}><WorldVoiceButton text="The RELIQ World. Tower of Knowledge." label="Read world title" /></div></div><style>{`@keyframes centralWorldReveal{0%{opacity:1;background:rgba(10,15,11,1)}25%,70%{opacity:1}100%{opacity:0}}`}</style></div> : null}
      <style>{`
        .centralWorldTag{position:relative;display:flex;align-items:center;gap:8px;white-space:nowrap;padding:7px 8px 7px 14px;border-radius:999px;background:rgba(16,14,24,.66);border:1px solid rgba(255,255,255,.18);color:#fff;font:900 14px var(--font-display);letter-spacing:.02em;box-shadow:0 8px 22px rgba(0,0,0,.3);backdrop-filter:blur(10px);animation:centralWorldTagBob 2.4s ease-in-out infinite}
        .centralWorldTag:after{content:"";position:absolute;left:50%;bottom:-6px;width:11px;height:11px;transform:translateX(-50%) rotate(45deg);background:rgba(16,14,24,.66);border-right:1px solid rgba(255,255,255,.18);border-bottom:1px solid rgba(255,255,255,.18)}
        @keyframes centralWorldTagBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @media (prefers-reduced-motion:reduce){.centralWorldTag{animation:none}}
        .worldBuilderReset{inset:0;margin:auto;max-width:440px;width:calc(100vw - 48px);box-sizing:border-box;padding:24px;border:1px solid rgba(255,255,255,.16);border-radius:22px;background:#17131f;color:#fff;font-family:var(--font-sans);box-shadow:0 20px 90px #0008}.worldBuilderReset::backdrop{background:rgba(10,8,16,.7)}.worldBuilderReset h2{margin:0 0 12px;font:900 22px var(--font-display)}.worldBuilderReset p{line-height:1.6;color:#d8d2e4}
        .worldBuilderResetActions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.worldBuilderResetActions button{min-height:48px;padding:0 18px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 14px var(--font-display);cursor:pointer}.worldBuilderResetActions button:last-child{background:#e5484d;border-color:#e5484d}
      `}</style>
      <style>{`@media (pointer:coarse){body:has([data-world3d-root]) .fullscreen-toggle{display:none}}body:has(.worldEditTray) .fullscreen-toggle{display:none}`}</style>
      {transitioning ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#211914", color: "#fff0c9", fontWeight: 900, letterSpacing: "0.16em", zIndex: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span>ENTERING THE TOWER...</span><WorldVoiceButton text={joinSpeechParts(["Entering the tower"])} label="Read entering tower" /></div></div> : null}
    </main>
  );
}
