"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as THREE from "three";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Eraser, Flower2, Lamp, PackageOpen, Route, RotateCw, ShoppingBag, Trees, Undo2, X, ZoomIn, ZoomOut } from "lucide-react";
import { CentralWorldEnvironment } from "@/components/world3d/CentralWorldEnvironment";
import { WorldHUD } from "@/components/world3d/WorldHUD";
import { WorldInteractionPrompt } from "@/components/world3d/WorldInteractionPrompt";
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
import { CENTRAL_WORLD_STARTER_SCENERY } from "@/lib/world3d/central-world-editor-catalog";
import {
  CENTRAL_WORLD_GRID,
  gridToWorld,
  readCentralWorldGroundTiles,
  readCentralWorldPlacements,
  validateCentralWorldGroundCell,
  validateCentralWorldPlacement,
  writeCentralWorldGroundTiles,
  writeCentralWorldPlacements,
  type CentralWorldGroundTile,
  type CentralWorldGroundType,
  type CentralWorldPlacement,
} from "@/lib/world3d/central-world-layout";

type WorldEditTool = CentralWorldGroundType | "tree" | "pine_tree" | "flower_bed" | "lamp_post" | "erase";
const SCENERY_ITEM_BY_TOOL: Partial<Record<WorldEditTool, string>> = {
  tree: "central_world_starter_tree",
  pine_tree: "central_world_starter_pine",
  flower_bed: "central_world_starter_flowers",
  lamp_post: "central_world_starter_lamp",
};
const EDIT_TOOL_NAMES: Record<WorldEditTool, string> = { path: "Path", road: "Road", stone: "Stone", tree: "Tree", pine_tree: "Pine tree", flower_bed: "Flower bed", lamp_post: "Lamp post", erase: "Eraser" };

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

function BuildModeCamera({ active, cursor, zoom }: { active: boolean; cursor: { gridX: number; gridZ: number }; zoom: number }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (!active) return;
    const [x, , z] = gridToWorld(cursor.gridX, cursor.gridZ);
    const desired = new THREE.Vector3(x + zoom * 0.54, zoom * 0.82, z + zoom * 0.68);
    camera.position.lerp(desired, 1 - Math.pow(0.00001, delta));
    camera.lookAt(x, 0, z);
  });
  return null;
}

function BuildModeSurface({ active, paint, onCell }: { active: boolean; paint: boolean; onCell: (gridX: number, gridZ: number, paint: boolean) => void }) {
  const painting = useRef(false);
  const lastCell = useRef("");
  const width = (CENTRAL_WORLD_GRID.maxX - CENTRAL_WORLD_GRID.minX + 1) * CENTRAL_WORLD_GRID.cellSize;
  const depth = (CENTRAL_WORLD_GRID.maxZ - CENTRAL_WORLD_GRID.minZ + 1) * CENTRAL_WORLD_GRID.cellSize;
  const centreZ = ((CENTRAL_WORLD_GRID.minZ + CENTRAL_WORLD_GRID.maxZ) / 2) * CENTRAL_WORLD_GRID.cellSize;

  function selectCell(event: ThreeEvent<PointerEvent>, shouldPaint: boolean) {
    const gridX = THREE.MathUtils.clamp(Math.round(event.point.x / CENTRAL_WORLD_GRID.cellSize), CENTRAL_WORLD_GRID.minX, CENTRAL_WORLD_GRID.maxX);
    const gridZ = THREE.MathUtils.clamp(Math.round(event.point.z / CENTRAL_WORLD_GRID.cellSize), CENTRAL_WORLD_GRID.minZ, CENTRAL_WORLD_GRID.maxZ);
    const key = `${gridX}:${gridZ}`;
    if (key === lastCell.current && shouldPaint) return;
    lastCell.current = key;
    onCell(gridX, gridZ, shouldPaint);
  }

  if (!active) return null;
  return (
    <mesh
      position={[0, 0.34, centreZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={(event) => {
        event.stopPropagation();
        painting.current = paint;
        (event.nativeEvent.target as HTMLElement | null)?.setPointerCapture?.(event.pointerId);
        selectCell(event, paint);
      }}
      onPointerMove={(event) => {
        if (!painting.current) return;
        event.stopPropagation();
        selectCell(event, true);
      }}
      onPointerUp={(event) => {
        painting.current = false;
        lastCell.current = "";
        const target = event.nativeEvent.target as HTMLElement | null;
        if (target?.hasPointerCapture?.(event.pointerId)) target.releasePointerCapture(event.pointerId);
      }}
      onPointerCancel={() => { painting.current = false; lastCell.current = ""; }}
    >
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

function CentralWorldScene({ quality, moveInput, lookInput, spawnTarget, spawnNonce, placedCustomisations, groundTiles, itemsById, buildPreview, groundPreview, editing, editCursor, buildZoom, paintMode, onBuildCell, onActiveTarget }: { quality: CentralWorldQuality; moveInput: WorldMoveInput; lookInput: WorldLookInput; spawnTarget: [number, number, number] | null; spawnNonce: number; placedCustomisations: CentralWorldPlacement[]; groundTiles: CentralWorldGroundTile[]; itemsById: Map<string, EconomyItem>; buildPreview: { placement: CentralWorldPlacement; item: EconomyItem; valid: boolean } | null; groundPreview: { tile: CentralWorldGroundTile; valid: boolean } | null; editing: boolean; editCursor: { gridX: number; gridZ: number }; buildZoom: number; paintMode: boolean; onBuildCell: (gridX: number, gridZ: number, paint: boolean) => void; onActiveTarget: (id: string | null) => void }) {
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const handleNearestTarget = useCallback((id: string | null) => {
    setActiveTargetId(id);
    onActiveTarget(id);
  }, [onActiveTarget]);
  return (
    <>
      <color attach="background" args={["#69afe4"]} />
      <fog attach="fog" args={["#a7b9ac", 58, 112]} />
      <hemisphereLight args={["#d9efff", "#38522f", 1.15]} />
      <ambientLight intensity={0.45} color="#fff3da" />
      <directionalLight position={[-24, 35, 18]} intensity={2.1} color="#ffd18a" />
      <directionalLight position={[18, 16, -16]} intensity={0.4} color="#b9dcff" />
      <CentralWorldEnvironment
        quality={quality}
        entranceActive={activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance}
        homeActive={activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance}
        placedCustomisations={placedCustomisations}
        groundTiles={groundTiles}
        itemsById={itemsById}
        buildPreview={buildPreview}
        groundPreview={groundPreview}
        editing={editing}
        editCursor={editCursor}
      />
      <SharedThirdPersonPlayer
        initialPosition={CENTRAL_WORLD_CONFIG.spawnPoint}
        spawnTarget={spawnTarget}
        spawnNonce={spawnNonce}
        moveInput={moveInput}
        lookInput={lookInput}
        bounds={CENTRAL_WORLD_CONFIG.playableBounds}
        roamEllipse={CENTRAL_WORLD_CONFIG.roamEllipse}
        interactionTargets={[
          { id: CENTRAL_WORLD_ANCHORS.towerMainEntrance, position: CENTRAL_WORLD_CONFIG.towerMainEntrance, distance: 3.8 },
          { id: CENTRAL_WORLD_ANCHORS.myHomeEntrance, position: CENTRAL_WORLD_CONFIG.myHomeEntrance, distance: 3.4 },
        ]}
        onNearestTargetId={handleNearestTarget}
        cameraDistance={11.5}
        cameraTargetHeight={3.6}
        cameraEnabled={!editing && !buildPreview}
        speed={4.2}
      />
      <BuildModeCamera active={editing || Boolean(buildPreview)} cursor={editCursor} zoom={buildZoom} />
      <BuildModeSurface active={editing || Boolean(buildPreview)} paint={paintMode} onCell={onBuildCell} />
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
  const requestedBuildItemKey = searchParams.get("build");
  const requestedQuality = searchParams.get("quality");
  const quality: CentralWorldQuality = requestedQuality === "low" || requestedQuality === "high" ? requestedQuality : "medium";
  const debug = preview && searchParams.get("debug") === "1";
  const [moveInput, setMoveInput] = useState<WorldMoveInput>(EMPTY_WORLD_MOVE_INPUT);
  const [lookInput, setLookInput] = useState<WorldLookInput>(EMPTY_WORLD_LOOK_INPUT);
  const placementSequence = useRef(0);
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [spawnTarget, setSpawnTarget] = useState<[number, number, number] | null>(() =>
    searchParams.get("spawn") === CENTRAL_WORLD_ANCHORS.towerExitSpawn
      ? CENTRAL_WORLD_CONFIG.towerExitSpawn
      : searchParams.get("spawn") === CENTRAL_WORLD_ANCHORS.myHomeExitSpawn
        ? CENTRAL_WORLD_CONFIG.myHomeExitSpawn
      : null,
  );
  const [spawnNonce, setSpawnNonce] = useState(0);
  const [showIntro, setShowIntro] = useState(false);
  const [itemsById, setItemsById] = useState<Map<string, EconomyItem>>(() => new Map(CENTRAL_WORLD_STARTER_SCENERY.map((item) => [item.item_key, item])));
  const [ownedItemKeys, setOwnedItemKeys] = useState<Set<string>>(() => new Set());
  const [placedCustomisations, setPlacedCustomisations] = useState<CentralWorldPlacement[]>([]);
  const [groundTiles, setGroundTiles] = useState<CentralWorldGroundTile[]>([]);
  const [buildPlacement, setBuildPlacement] = useState<CentralWorldPlacement | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTool, setEditTool] = useState<WorldEditTool>("path");
  const [selectedInventoryItemKey, setSelectedInventoryItemKey] = useState<string | null>(null);
  const [editCursor, setEditCursor] = useState({ gridX: -5, gridZ: 5 });
  const [buildZoom, setBuildZoom] = useState(28);
  const [editHistory, setEditHistory] = useState<Array<{ placements: CentralWorldPlacement[]; tiles: CentralWorldGroundTile[] }>>([]);
  const [economyMessage, setEconomyMessage] = useState<string | null>(null);
  const hasAvailableAction = activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance || activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance;
  const student = useMemo(() => getActiveStudentProfile(), []);
  const placementScope = student?.studentId ?? (preview ? "demo-preview" : "guest");
  const editorItemKey = editorOpen ? selectedInventoryItemKey ?? SCENERY_ITEM_BY_TOOL[editTool] ?? null : null;
  const activeBuildItemKey = requestedBuildItemKey ?? editorItemKey;
  const buildItem = activeBuildItemKey ? itemsById.get(activeBuildItemKey) ?? null : null;
  const uniqueOwnedItemKey = requestedBuildItemKey ?? selectedInventoryItemKey;
  const placementsWithoutBuildItem = uniqueOwnedItemKey && buildItem ? placedCustomisations.filter((placement) => placement.itemId !== buildItem.item_key) : placedCustomisations;
  const buildValid = Boolean(buildItem && buildPlacement && validateCentralWorldPlacement(buildPlacement, buildItem, placementsWithoutBuildItem, itemsById));
  const buildPreview = buildItem && buildPlacement ? { placement: buildPlacement, item: buildItem, valid: buildValid } : null;
  const isGroundTool = !selectedInventoryItemKey && (editTool === "path" || editTool === "road" || editTool === "stone");
  const isEraseTool = !selectedInventoryItemKey && editTool === "erase";
  const groundPreview: { tile: CentralWorldGroundTile; valid: boolean } | null = editorOpen && (isGroundTool || isEraseTool) ? {
    tile: { ...editCursor, tileType: isGroundTool ? editTool : groundTiles.find((tile) => tile.gridX === editCursor.gridX && tile.gridZ === editCursor.gridZ)?.tileType ?? "stone" },
    valid: editTool !== "erase" && validateCentralWorldGroundCell(editCursor.gridX, editCursor.gridZ),
  } : null;
  const ownedWorldItems = useMemo(() => Array.from(ownedItemKeys)
    .map((itemKey) => itemsById.get(itemKey))
    .filter((item): item is EconomyItem => Boolean(item && ["buildings", "animals", "pools_play", "special"].includes(String(item.metadata.marketplaceCategory))))
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
        const nextItemsById = new Map([...merged.items, ...CENTRAL_WORLD_STARTER_SCENERY].map((item) => [item.item_key, item]));
        const nextPlacements = readCentralWorldPlacements(placementScope);
        const nextGroundTiles = readCentralWorldGroundTiles(placementScope);
        const ownedKeys = new Set(merged.inventory.map((entry) => entry.item_key));
        setItemsById(nextItemsById);
        setOwnedItemKeys(ownedKeys);
        setPlacedCustomisations(nextPlacements);
        setGroundTiles(nextGroundTiles);
        if (requestedBuildItemKey && nextItemsById.has(requestedBuildItemKey) && ownedKeys.has(requestedBuildItemKey)) {
          const existing = nextPlacements.find((placement) => placement.itemId === requestedBuildItemKey);
          const nextBuildPlacement = existing ?? { itemId: requestedBuildItemKey, gridX: -5, gridZ: 5, rotation: 0 };
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

  function moveBuildPlacement(gridX: number, gridZ: number) {
    const nextCursor = { gridX: editCursor.gridX + gridX, gridZ: editCursor.gridZ + gridZ };
    const next = buildPlacement ? { ...buildPlacement, ...nextCursor } : null;
    if (!next && !editorOpen) return;
    setEditCursor(nextCursor);
    if (next) setBuildPlacement(next);
    const [worldX, , worldZ] = gridToWorld(nextCursor.gridX, nextCursor.gridZ);
    setSpawnTarget([worldX, 0.75, worldZ + 8]);
    setSpawnNonce((value) => value + 1);
  }

  function openWorldEditor() {
    const cursor = { gridX: -5, gridZ: 5 };
    const [worldX, , worldZ] = gridToWorld(cursor.gridX, cursor.gridZ);
    setEditCursor(cursor);
    setEditTool("path");
    setSelectedInventoryItemKey(null);
    setBuildPlacement(null);
    setBuildZoom(28);
    setEditHistory([]);
    setEditorOpen(true);
    setSpawnTarget([worldX, 0.75, worldZ + 8]);
    setSpawnNonce((value) => value + 1);
    void speak("Edit World. Choose a path, road, stone, tree, flower bed, lamp post, or eraser. Use the arrow buttons to move, then press add.", undefined, "manual", { rate: 0.9 });
  }

  function closeWorldEditor() {
    setEditorOpen(false);
    setBuildPlacement(null);
  }

  function chooseEditTool(tool: WorldEditTool) {
    setSelectedInventoryItemKey(null);
    setEditTool(tool);
    void speak(`${EDIT_TOOL_NAMES[tool]} selected. Use the arrow buttons to choose a space, then press ${tool === "erase" ? "remove" : "add"}.`, undefined, "manual", { rate: 0.9 });
    const itemId = SCENERY_ITEM_BY_TOOL[tool];
    placementSequence.current += 1;
    setBuildPlacement(itemId ? { placementId: `${itemId}-${placementSequence.current}`, itemId, ...editCursor, rotation: 0 } : null);
  }

  function chooseInventoryItem(item: EconomyItem) {
    setSelectedInventoryItemKey(item.item_key);
    const existing = placedCustomisations.find((placement) => placement.itemId === item.item_key);
    placementSequence.current += 1;
    setBuildPlacement(existing ?? { placementId: `${item.item_key}-${placementSequence.current}`, itemId: item.item_key, ...editCursor, rotation: 0 });
    if (existing) setEditCursor({ gridX: existing.gridX, gridZ: existing.gridZ });
    void speak(`${item.name} selected. Tap a space to move it, rotate if needed, then press place.`, undefined, "manual", { rate: 0.9 });
  }

  function closeBuildMode() {
    setBuildPlacement(null);
    router.replace(preview ? "/world?teacher_preview=1" : "/world");
  }

  function confirmBuildPlacement() {
    if (!buildPlacement || !buildItem || !buildValid) return;
    setEditHistory((current) => [...current, { placements: placedCustomisations, tiles: groundTiles }].slice(-30));
    const next = [...placementsWithoutBuildItem, buildPlacement];
    writeCentralWorldPlacements(placementScope, next);
    setPlacedCustomisations(next);
    void speak(`${buildItem.name} added.`, undefined, "manual", { rate: 0.9 });
    if (editorOpen) {
      placementSequence.current += 1;
      setBuildPlacement({ ...buildPlacement, placementId: `${buildPlacement.itemId}-${placementSequence.current}` });
    } else closeBuildMode();
  }

  function applyGroundAt(gridX: number, gridZ: number, announce = false) {
    if (!editorOpen || selectedInventoryItemKey) return;
    if (editTool === "erase") {
      setEditHistory((current) => [...current, { placements: placedCustomisations, tiles: groundTiles }].slice(-30));
      setGroundTiles((current) => {
        const next = current.filter((tile) => tile.gridX !== gridX || tile.gridZ !== gridZ);
        writeCentralWorldGroundTiles(placementScope, next);
        return next;
      });
      setPlacedCustomisations((current) => {
        const next = current.filter((placement) => placement.gridX !== gridX || placement.gridZ !== gridZ);
        writeCentralWorldPlacements(placementScope, next);
        return next;
      });
      if (announce) void speak("Removed.", undefined, "manual", { rate: 0.9 });
      return;
    }
    if (!isGroundTool || !validateCentralWorldGroundCell(gridX, gridZ)) return;
    setEditHistory((current) => [...current, { placements: placedCustomisations, tiles: groundTiles }].slice(-30));
    setGroundTiles((current) => {
      const tile: CentralWorldGroundTile = { gridX, gridZ, tileType: editTool };
      const next = [...current.filter((entry) => entry.gridX !== gridX || entry.gridZ !== gridZ), tile];
      writeCentralWorldGroundTiles(placementScope, next);
      return next;
    });
    if (announce) void speak(`${EDIT_TOOL_NAMES[editTool]} added.`, undefined, "manual", { rate: 0.9 });
  }

  function applyGroundTool() {
    applyGroundAt(editCursor.gridX, editCursor.gridZ, true);
  }

  function selectBuildCell(gridX: number, gridZ: number, paint: boolean) {
    const nextCursor = { gridX, gridZ };
    setEditCursor(nextCursor);
    setBuildPlacement((current) => current ? { ...current, ...nextCursor } : current);
    if (paint) applyGroundAt(gridX, gridZ);
  }

  function undoWorldEdit() {
    const previous = editHistory.at(-1);
    if (!previous) return;
    setEditHistory((current) => current.slice(0, -1));
    setPlacedCustomisations(previous.placements);
    setGroundTiles(previous.tiles);
    writeCentralWorldPlacements(placementScope, previous.placements);
    writeCentralWorldGroundTiles(placementScope, previous.tiles);
    void speak("Last world edit undone.", undefined, "manual", { rate: 0.9 });
  }

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

  function runActiveAction() {
    if (!activeTargetId || transitioning) return;
    if (activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance) {
      rememberCentralWorldHomeEntry(preview);
      router.push("/home-base");
      return;
    }
    if (activeTargetId !== CENTRAL_WORLD_ANCHORS.towerMainEntrance) return;
    setTransitioning(true);
    window.setTimeout(() => router.push(preview ? "/world/tower?teacher_preview=1" : "/world/tower"), 500);
  }

  function teleport(position: [number, number, number]) {
    setSpawnTarget(position);
    setSpawnNonce((value) => value + 1);
  }

  return (
    <main data-world3d-root style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", overscrollBehavior: "none", touchAction: "none", WebkitUserSelect: "none", background: "#69afe4" }}>
      <Canvas style={{ touchAction: "none" }} camera={{ position: [0, 7, 29], fov: 60 }} dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.25] : [1, 1.5]} gl={{ antialias: quality !== "low", powerPreference: "high-performance" }} shadows={false}>
        <CentralWorldScene quality={quality} moveInput={buildPreview || editorOpen ? EMPTY_WORLD_MOVE_INPUT : moveInput} lookInput={buildPreview || editorOpen ? EMPTY_WORLD_LOOK_INPUT : lookInput} spawnTarget={spawnTarget} spawnNonce={spawnNonce} placedCustomisations={placementsWithoutBuildItem} groundTiles={groundTiles} itemsById={itemsById} buildPreview={buildPreview} groundPreview={groundPreview} editing={editorOpen} editCursor={editCursor} buildZoom={buildZoom} paintMode={editorOpen && (isGroundTool || isEraseTool)} onBuildCell={selectBuildCell} onActiveTarget={setActiveTargetId} />
      </Canvas>

      {!editorOpen && !buildPreview ? <WorldHUD context="central" preview={preview} accent="#efbd61" primaryAction={{ label: "EDIT WORLD", icon: "edit", onClick: openWorldEditor }} fallbackHref={preview ? "/home-base?teacher_preview=1" : "/home-base"} /> : null}

      {!buildPreview && !editorOpen ? <><WorldJoystick onChange={setMoveInput} /><WorldLookJoystick onChange={setLookInput} /></> : null}
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
          <div role="status" style={{ marginTop: 8, textAlign: "center", color: buildValid ? "#86efac" : "#fda4af", fontSize: 12, fontWeight: 850 }}>{buildValid ? "This space is ready." : "This space is protected or already occupied."}</div>
        </section>
      ) : null}
      {editorOpen ? (
        <section className="centralWorldEditor" aria-label="Edit world controls" style={{ position: "absolute", left: "50%", bottom: 10, transform: "translateX(-50%)", zIndex: 35, width: "min(97vw, 1040px)", maxHeight: "min(46dvh, 380px)", overflowY: "auto", border: "2px solid #5eead4", borderRadius: 7, background: "rgba(13,24,22,.96)", color: "#fff", padding: 11, boxShadow: "0 14px 40px rgba(0,0,0,.4)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div><div style={{ color: "#5eead4", fontSize: 10, fontWeight: 950, letterSpacing: ".16em" }}>EDIT WORLD</div><div style={{ marginTop: 1, fontSize: 16, fontWeight: 950 }}>{selectedInventoryItemKey ? `Placing ${buildItem?.name ?? "item"}` : isGroundTool || isEraseTool ? "Tap or drag on the grass" : "Tap a space, then place"}</div></div>
            <div style={{ display: "flex", gap: 5 }}>
              <button type="button" onClick={() => setBuildZoom((value) => Math.min(38, value + 4))} aria-label="Zoom camera out" title="Zoom out" style={{ ...debugButton, width: 40, height: 40, padding: 0 }}><ZoomOut size={18} /></button>
              <button type="button" onClick={() => setBuildZoom((value) => Math.max(18, value - 4))} aria-label="Zoom camera in" title="Zoom in" style={{ ...debugButton, width: 40, height: 40, padding: 0 }}><ZoomIn size={18} /></button>
              <button type="button" onClick={undoWorldEdit} disabled={!editHistory.length} aria-label="Undo last world edit" title="Undo" style={{ ...debugButton, width: 40, height: 40, padding: 0, opacity: editHistory.length ? 1 : 0.5 }}><Undo2 size={18} /></button>
              <WorldVoiceButton compact label="Read edit world instructions" text="Edit World. Choose a basic tool or something from your owned inventory. Tap the grass to move an item. For paths, roads and stone, touch and drag to paint. Green means the space is ready. Red means choose another space." />
              <button type="button" onClick={closeWorldEditor} aria-label="Close Edit World" title="Close" style={{ ...debugButton, width: 40, height: 40, padding: 0 }}><X size={18} /></button>
            </div>
          </div>

          <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 6, color: "#f8d477", fontSize: 10, fontWeight: 950, letterSpacing: ".12em" }}><PackageOpen size={15} />OWNED INVENTORY <span style={{ color: "#fff", letterSpacing: 0 }}>({ownedWorldItems.length})</span></div><button type="button" onClick={() => router.push(preview ? "/marketplace?teacher_preview=1" : "/marketplace")} style={{ border: 0, background: "transparent", color: "#99f6e4", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 900, cursor: "pointer" }}><ShoppingBag size={14} />Marketplace</button></div>
          <div aria-label="Owned world inventory" style={{ marginTop: 5, display: "flex", gap: 6, overflowX: "auto", paddingBottom: 3, minHeight: 62 }}>
            {ownedWorldItems.length ? ownedWorldItems.map((item) => {
              const image = inventoryImage(item);
              const selected = selectedInventoryItemKey === item.item_key;
              return <button key={item.item_key} type="button" onClick={() => chooseInventoryItem(item)} aria-pressed={selected} aria-label={`Place ${item.name}`} style={{ position: "relative", flex: "0 0 126px", height: 58, overflow: "hidden", border: `2px solid ${selected ? "#5eead4" : "rgba(255,255,255,.22)"}`, borderRadius: 5, padding: image ? "0 7px 5px" : "7px", background: selected ? "#0f766e" : "#26332e", color: "#fff", display: "flex", alignItems: "flex-end", justifyContent: "center", fontSize: 10, fontWeight: 950, cursor: "pointer", boxShadow: selected ? "0 0 0 2px rgba(94,234,212,.24)" : "none" }}>{image ? <Image src={image} alt="" fill sizes="126px" style={{ objectFit: "cover", opacity: selected ? 0.64 : 0.48 }} /> : null}<span style={{ position: "relative", zIndex: 1, width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textShadow: "0 1px 4px #000" }}>{item.name}</span></button>;
            }) : <div style={{ minHeight: 54, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(255,255,255,.2)", borderRadius: 5, color: "#bfd0c8", fontSize: 11, fontWeight: 800 }}>Your purchased buildings and places will appear here.</div>}
          </div>

          <div style={{ marginTop: 5, color: "#a7f3d0", fontSize: 10, fontWeight: 950, letterSpacing: ".12em" }}>BASIC TOOLS</div>
          <div aria-label="World editing tools" style={{ marginTop: 5, display: "flex", gap: 5, overflowX: "auto", paddingBottom: 3 }}>
            {([
              ["path", "Path", <Route key="path-icon" size={17} />], ["road", "Road", <Route key="road-icon" size={17} />], ["stone", "Stone", <Route key="stone-icon" size={17} />],
              ["tree", "Tree", <Trees key="tree-icon" size={17} />], ["pine_tree", "Pine", <Trees key="pine-icon" size={17} />], ["flower_bed", "Flowers", <Flower2 key="flower-icon" size={17} />],
              ["lamp_post", "Lamp", <Lamp key="lamp-icon" size={17} />], ["erase", "Erase", <Eraser key="erase-icon" size={17} />],
            ] as Array<[WorldEditTool, string, React.ReactNode]>).map(([tool, label, icon]) => { const selected = !selectedInventoryItemKey && editTool === tool; return <button key={tool} type="button" onClick={() => chooseEditTool(tool)} aria-pressed={selected} style={{ ...debugButton, flex: "0 0 auto", minWidth: 70, padding: "7px 8px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, background: selected ? "#14b8a6" : debugButton.background, color: selected ? "#fff" : debugButton.color }}>{icon}{label}</button>; })}
          </div>
          <div className="centralWorldEditorControls" style={{ marginTop: 6, display: "grid", gridTemplateColumns: "auto minmax(120px,1fr) auto", alignItems: "center", gap: 9 }}>
            <div className="centralWorldEditorDpad" style={{ display: "grid", gridTemplateColumns: "repeat(3, 40px)", gridTemplateRows: "repeat(2, 40px)", gap: 4 }}><button type="button" aria-label="Move cursor forward" onClick={() => moveBuildPlacement(0, -1)} style={{ ...debugButton, gridColumn: 2, gridRow: 1, padding: 0 }}><ArrowUp size={19} /></button><button type="button" aria-label="Move cursor left" onClick={() => moveBuildPlacement(-1, 0)} style={{ ...debugButton, gridColumn: 1, gridRow: 2, padding: 0 }}><ArrowLeft size={19} /></button><button type="button" aria-label="Move cursor backward" onClick={() => moveBuildPlacement(0, 1)} style={{ ...debugButton, gridColumn: 2, gridRow: 2, padding: 0 }}><ArrowDown size={19} /></button><button type="button" aria-label="Move cursor right" onClick={() => moveBuildPlacement(1, 0)} style={{ ...debugButton, gridColumn: 3, gridRow: 2, padding: 0 }}><ArrowRight size={19} /></button></div>
            <div className="centralWorldEditorStatus" role="status" style={{ textAlign: "center", color: isEraseTool || buildValid || groundPreview?.valid ? "#86efac" : "#fda4af", fontSize: 12, fontWeight: 850 }}>{isGroundTool ? "Drag across the grass to paint." : isEraseTool ? "Drag across items to remove them." : buildValid ? `${buildItem?.name ?? "Item"} fits here.` : "Choose a clear green space."}</div>
            <div className="centralWorldEditorActions" style={{ display: "flex", alignItems: "center", gap: 6 }}><button type="button" disabled={!buildPreview} onClick={() => setBuildPlacement((current) => current ? { ...current, rotation: ((current.rotation + 90) % 360) as CentralWorldPlacement["rotation"] } : current)} aria-label="Rotate selected item" title="Rotate" style={{ ...debugButton, width: 46, height: 46, padding: 0, display: "grid", placeItems: "center", visibility: buildPreview ? "visible" : "hidden" }}><RotateCw size={19} /></button><button type="button" disabled={!isEraseTool && (buildPreview ? !buildValid : !groundPreview?.valid)} onClick={buildPreview ? confirmBuildPlacement : applyGroundTool} style={{ ...debugButton, minHeight: 48, minWidth: 92, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: isEraseTool ? "#ef4444" : "#22c55e", color: "white" }}>{isEraseTool ? <Eraser size={18} /> : <Check size={18} />}{isEraseTool ? "Remove" : buildPreview ? "Place" : "Paint"}</button></div>
          </div>
        </section>
      ) : null}
      {activeTargetId && !editorOpen && !buildPreview ? (
        <WorldInteractionPrompt
          location={activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance ? "MY HOME" : "TOWER OF KNOWLEDGE"}
          status={activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance ? "Your personal Level Up space" : "Realm Chamber"}
          actionLabel={activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance ? "ENTER MY HOME" : "ENTER TOWER"}
          onAction={runActiveAction}
        />
      ) : null}
      <KeyboardWorldAction enabled={hasAvailableAction && !editorOpen && !buildPreview} onAction={runActiveAction} />

      {debug ? <div style={{ position: "absolute", right: 16, bottom: 130, display: "flex", gap: 6, zIndex: 30 }}><button type="button" onClick={() => teleport(CENTRAL_WORLD_CONFIG.spawnPoint)} style={debugButton}>SPAWN</button><button type="button" onClick={() => teleport(CENTRAL_WORLD_CONFIG.myHomeExitSpawn)} style={debugButton}>HOME</button><button type="button" onClick={() => teleport(CENTRAL_WORLD_CONFIG.towerPlaza)} style={debugButton}>PLAZA</button></div> : null}
      {economyMessage ? <div style={{ position: "absolute", left: 16, bottom: 126, maxWidth: 360, zIndex: 30, border: "1px solid rgba(146,64,14,.28)", borderRadius: 6, background: "rgba(255,251,235,.94)", color: "#78350f", padding: "10px 12px", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><span>{economyMessage}</span><WorldVoiceButton text={economyMessage} compact label="Read message" /></div> : null}
      {showIntro ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(24,31,25,.22)", color: "#fff8e8", pointerEvents: "none", animation: "centralWorldReveal 2.3s ease both" }}><div style={{ textAlign: "center", textShadow: "0 3px 18px rgba(0,0,0,.4)", pointerEvents: "auto" }}><div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.24em" }}>THE LEVEL UP WORLD</div><div style={{ marginTop: 8, fontSize: 30, fontWeight: 900 }}>Tower of Knowledge</div><div style={{ marginTop: 12 }}><WorldVoiceButton text="The Level Up World. Tower of Knowledge." label="Read world title" /></div></div><style>{`@keyframes centralWorldReveal{0%{opacity:1;background:rgba(10,15,11,1)}25%,70%{opacity:1}100%{opacity:0}}`}</style></div> : null}
      <style>{`@media (pointer:coarse){body:has([data-world3d-root]) .fullscreen-toggle{display:none}}@media(max-width:560px){.centralWorldEditorControls{grid-template-columns:124px minmax(0,1fr)!important}.centralWorldEditorDpad{grid-column:1;grid-row:1 / span 2}.centralWorldEditorStatus{grid-column:2;grid-row:1}.centralWorldEditorActions{grid-column:2;grid-row:2;justify-content:center}}`}</style>
      {transitioning ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#211914", color: "#fff0c9", fontWeight: 900, letterSpacing: "0.16em", zIndex: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span>ENTERING THE TOWER...</span><WorldVoiceButton text={joinSpeechParts(["Entering the tower"])} label="Read entering tower" /></div></div> : null}
    </main>
  );
}
