"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Eraser, Flower2, Lamp, Route, RotateCw, Trees, X } from "lucide-react";
import { CentralWorldEnvironment } from "@/components/world3d/CentralWorldEnvironment";
import { WorldHUD } from "@/components/world3d/WorldHUD";
import { WorldInteractionPrompt } from "@/components/world3d/WorldInteractionPrompt";
import {
  EMPTY_WORLD_MOVE_INPUT,
  KeyboardWorldAction,
  SharedThirdPersonPlayer,
  WorldJoystick,
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

function CentralWorldScene({ quality, moveInput, spawnTarget, spawnNonce, placedCustomisations, groundTiles, itemsById, buildPreview, groundPreview, editing, onActiveTarget }: { quality: CentralWorldQuality; moveInput: WorldMoveInput; spawnTarget: [number, number, number] | null; spawnNonce: number; placedCustomisations: CentralWorldPlacement[]; groundTiles: CentralWorldGroundTile[]; itemsById: Map<string, EconomyItem>; buildPreview: { placement: CentralWorldPlacement; item: EconomyItem; valid: boolean } | null; groundPreview: { tile: CentralWorldGroundTile; valid: boolean } | null; editing: boolean; onActiveTarget: (id: string | null) => void }) {
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
      />
      <SharedThirdPersonPlayer
        initialPosition={CENTRAL_WORLD_CONFIG.spawnPoint}
        spawnTarget={spawnTarget}
        spawnNonce={spawnNonce}
        moveInput={moveInput}
        bounds={CENTRAL_WORLD_CONFIG.playableBounds}
        roamEllipse={CENTRAL_WORLD_CONFIG.roamEllipse}
        interactionTargets={[
          { id: CENTRAL_WORLD_ANCHORS.towerMainEntrance, position: CENTRAL_WORLD_CONFIG.towerMainEntrance, distance: 3.8 },
          { id: CENTRAL_WORLD_ANCHORS.myHomeEntrance, position: CENTRAL_WORLD_CONFIG.myHomeEntrance, distance: 3.4 },
        ]}
        onNearestTargetId={handleNearestTarget}
        cameraDistance={11.5}
        cameraTargetHeight={3.6}
        speed={4.2}
      />
      <CentralWorldMetricsReporter quality={quality} />
    </>
  );
}

const debugButton: React.CSSProperties = { border: "1px solid rgba(64,42,25,.2)", borderRadius: 5, padding: "9px 11px", background: "rgba(255,250,237,.94)", color: "#3f2b1e", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 24px rgba(45,31,19,.16)" };

export default function CentralWorld() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1" || isDemoPreviewMode();
  const requestedBuildItemKey = searchParams.get("build");
  const requestedQuality = searchParams.get("quality");
  const quality: CentralWorldQuality = requestedQuality === "low" || requestedQuality === "high" ? requestedQuality : "medium";
  const debug = preview && searchParams.get("debug") === "1";
  const [moveInput, setMoveInput] = useState<WorldMoveInput>(EMPTY_WORLD_MOVE_INPUT);
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
  const [placedCustomisations, setPlacedCustomisations] = useState<CentralWorldPlacement[]>([]);
  const [groundTiles, setGroundTiles] = useState<CentralWorldGroundTile[]>([]);
  const [buildPlacement, setBuildPlacement] = useState<CentralWorldPlacement | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTool, setEditTool] = useState<WorldEditTool>("path");
  const [editCursor, setEditCursor] = useState({ gridX: -5, gridZ: 5 });
  const [economyMessage, setEconomyMessage] = useState<string | null>(null);
  const hasAvailableAction = activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance || activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance;
  const student = useMemo(() => getActiveStudentProfile(), []);
  const placementScope = student?.studentId ?? (preview ? "demo-preview" : "guest");
  const editorItemKey = editorOpen ? SCENERY_ITEM_BY_TOOL[editTool] ?? null : null;
  const activeBuildItemKey = requestedBuildItemKey ?? editorItemKey;
  const buildItem = activeBuildItemKey ? itemsById.get(activeBuildItemKey) ?? null : null;
  const placementsWithoutBuildItem = requestedBuildItemKey && buildItem ? placedCustomisations.filter((placement) => placement.itemId !== buildItem.item_key) : placedCustomisations;
  const buildValid = Boolean(buildItem && buildPlacement && validateCentralWorldPlacement(buildPlacement, buildItem, placementsWithoutBuildItem, itemsById));
  const buildPreview = buildItem && buildPlacement ? { placement: buildPlacement, item: buildItem, valid: buildValid } : null;
  const isGroundTool = editTool === "path" || editTool === "road" || editTool === "stone";
  const groundPreview: { tile: CentralWorldGroundTile; valid: boolean } | null = editorOpen && (isGroundTool || editTool === "erase") ? {
    tile: { ...editCursor, tileType: isGroundTool ? editTool : groundTiles.find((tile) => tile.gridX === editCursor.gridX && tile.gridZ === editCursor.gridZ)?.tileType ?? "stone" },
    valid: editTool !== "erase" && validateCentralWorldGroundCell(editCursor.gridX, editCursor.gridZ),
  } : null;

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
    setBuildPlacement(null);
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
    setEditTool(tool);
    void speak(`${EDIT_TOOL_NAMES[tool]} selected. Use the arrow buttons to choose a space, then press ${tool === "erase" ? "remove" : "add"}.`, undefined, "manual", { rate: 0.9 });
    const itemId = SCENERY_ITEM_BY_TOOL[tool];
    placementSequence.current += 1;
    setBuildPlacement(itemId ? { placementId: `${itemId}-${placementSequence.current}`, itemId, ...editCursor, rotation: 0 } : null);
  }

  function closeBuildMode() {
    setBuildPlacement(null);
    router.replace(preview ? "/world?teacher_preview=1" : "/world");
  }

  function confirmBuildPlacement() {
    if (!buildPlacement || !buildItem || !buildValid) return;
    const next = [...placementsWithoutBuildItem, buildPlacement];
    writeCentralWorldPlacements(placementScope, next);
    setPlacedCustomisations(next);
    void speak(`${buildItem.name} added.`, undefined, "manual", { rate: 0.9 });
    if (editorOpen) {
      placementSequence.current += 1;
      setBuildPlacement({ ...buildPlacement, placementId: `${buildPlacement.itemId}-${placementSequence.current}` });
    } else closeBuildMode();
  }

  function applyGroundTool() {
    if (!editorOpen) return;
    if (editTool === "erase") {
      const nextTiles = groundTiles.filter((tile) => tile.gridX !== editCursor.gridX || tile.gridZ !== editCursor.gridZ);
      const nextPlacements = placedCustomisations.filter((placement) => placement.gridX !== editCursor.gridX || placement.gridZ !== editCursor.gridZ);
      writeCentralWorldGroundTiles(placementScope, nextTiles);
      writeCentralWorldPlacements(placementScope, nextPlacements);
      setGroundTiles(nextTiles);
      setPlacedCustomisations(nextPlacements);
      void speak("Removed.", undefined, "manual", { rate: 0.9 });
      return;
    }
    if (!groundPreview?.valid) return;
    const next = [...groundTiles.filter((tile) => tile.gridX !== editCursor.gridX || tile.gridZ !== editCursor.gridZ), groundPreview.tile];
    writeCentralWorldGroundTiles(placementScope, next);
    setGroundTiles(next);
    void speak(`${EDIT_TOOL_NAMES[editTool]} added.`, undefined, "manual", { rate: 0.9 });
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
        <CentralWorldScene quality={quality} moveInput={buildPreview || editorOpen ? EMPTY_WORLD_MOVE_INPUT : moveInput} spawnTarget={spawnTarget} spawnNonce={spawnNonce} placedCustomisations={placedCustomisations} groundTiles={groundTiles} itemsById={itemsById} buildPreview={buildPreview} groundPreview={groundPreview} editing={editorOpen} onActiveTarget={setActiveTargetId} />
      </Canvas>

      <WorldHUD context="central" preview={preview} accent="#efbd61" primaryAction={{ label: editorOpen ? "EXIT EDIT" : "EDIT WORLD", icon: "edit", onClick: editorOpen ? closeWorldEditor : openWorldEditor }} fallbackHref={preview ? "/home-base?teacher_preview=1" : "/home-base"} />

      {!buildPreview && !editorOpen ? <WorldJoystick onChange={setMoveInput} /> : null}
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
        <section aria-label="Edit world controls" style={{ position: "absolute", left: "50%", bottom: 18, transform: "translateX(-50%)", zIndex: 35, width: "min(96vw, 760px)", border: "2px solid #5eead4", borderRadius: 8, background: "rgba(18,28,24,.95)", color: "#fff", padding: 12, boxShadow: "0 14px 40px rgba(0,0,0,.38)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}><div><div style={{ color: "#5eead4", fontSize: 11, fontWeight: 950, letterSpacing: ".16em" }}>EDIT WORLD</div><div style={{ marginTop: 2, fontSize: 17, fontWeight: 950 }}>Choose, move, then add</div></div><div style={{ display: "flex", gap: 6 }}><WorldVoiceButton compact label="Read edit world instructions" text="Edit World. Choose a path, road, stone, tree, flower bed, lamp post, or eraser. Use the arrow buttons to move around the grid, then press add." /><button type="button" onClick={closeWorldEditor} aria-label="Close Edit World" title="Close" style={{ ...debugButton, padding: 8 }}><X size={18} /></button></div></div>
          <div aria-label="World editing tools" style={{ marginTop: 9, display: "flex", gap: 6, overflowX: "auto", paddingBottom: 3 }}>
            {([
              ["path", "Path", <Route key="path-icon" size={17} />], ["road", "Road", <Route key="road-icon" size={17} />], ["stone", "Stone", <Route key="stone-icon" size={17} />],
              ["tree", "Tree", <Trees key="tree-icon" size={17} />], ["pine_tree", "Pine", <Trees key="pine-icon" size={17} />], ["flower_bed", "Flowers", <Flower2 key="flower-icon" size={17} />],
              ["lamp_post", "Lamp", <Lamp key="lamp-icon" size={17} />], ["erase", "Erase", <Eraser key="erase-icon" size={17} />],
            ] as Array<[WorldEditTool, string, React.ReactNode]>).map(([tool, label, icon]) => <button key={tool} type="button" onClick={() => chooseEditTool(tool)} aria-pressed={editTool === tool} style={{ ...debugButton, flex: "0 0 auto", minWidth: 70, padding: "8px 9px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, background: editTool === tool ? "#14b8a6" : debugButton.background, color: editTool === tool ? "#fff" : debugButton.color }}>{icon}{label}</button>)}
          </div>
          <div style={{ marginTop: 9, display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 40px)", gridTemplateRows: "repeat(2, 40px)", gap: 4 }}><button type="button" aria-label="Move cursor forward" onClick={() => moveBuildPlacement(0, -1)} style={{ ...debugButton, gridColumn: 2, gridRow: 1, padding: 0 }}><ArrowUp size={19} /></button><button type="button" aria-label="Move cursor left" onClick={() => moveBuildPlacement(-1, 0)} style={{ ...debugButton, gridColumn: 1, gridRow: 2, padding: 0 }}><ArrowLeft size={19} /></button><button type="button" aria-label="Move cursor backward" onClick={() => moveBuildPlacement(0, 1)} style={{ ...debugButton, gridColumn: 2, gridRow: 2, padding: 0 }}><ArrowDown size={19} /></button><button type="button" aria-label="Move cursor right" onClick={() => moveBuildPlacement(1, 0)} style={{ ...debugButton, gridColumn: 3, gridRow: 2, padding: 0 }}><ArrowRight size={19} /></button></div>
            <button type="button" disabled={!buildPreview} onClick={() => setBuildPlacement((current) => current ? { ...current, rotation: ((current.rotation + 90) % 360) as CentralWorldPlacement["rotation"] } : current)} style={{ ...debugButton, minHeight: 44, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, visibility: buildPreview ? "visible" : "hidden" }}><RotateCw size={18} /> Rotate</button>
            <button type="button" disabled={editTool !== "erase" && (buildPreview ? !buildValid : !groundPreview?.valid)} onClick={buildPreview ? confirmBuildPlacement : applyGroundTool} style={{ ...debugButton, minHeight: 48, minWidth: 92, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, background: editTool === "erase" ? "#ef4444" : "#22c55e", color: "white" }}>{editTool === "erase" ? <Eraser size={18} /> : <Check size={18} />}{editTool === "erase" ? "Remove" : "Add"}</button>
          </div>
          <div role="status" style={{ marginTop: 7, textAlign: "center", color: editTool === "erase" || buildValid || groundPreview?.valid ? "#86efac" : "#fda4af", fontSize: 12, fontWeight: 850 }}>{editTool === "erase" ? "Remove the item or ground tile under the cursor." : buildValid || groundPreview?.valid ? "This space is ready." : "This space is protected or occupied."}</div>
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
      {transitioning ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#211914", color: "#fff0c9", fontWeight: 900, letterSpacing: "0.16em", zIndex: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span>ENTERING THE TOWER...</span><WorldVoiceButton text={joinSpeechParts(["Entering the tower"])} label="Read entering tower" /></div></div> : null}
    </main>
  );
}
