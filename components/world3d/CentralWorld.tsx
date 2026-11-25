"use client";

import "./world-editor-mobile.css";

import { isRealmBuilding } from "@/lib/world3d/realm-building-collections";
import { isTrainAsset } from "@/lib/world3d/train-catalogue";
import { isVillageBuilding, VILLAGE_STYLES, villageStyle } from "@/lib/world3d/village-buildings";
import { nextPremiumHomeUpgrade, premiumHomeItemKey, premiumHomeLevels, premiumHomeStyle, PREMIUM_HOME_SPECS, trampolineBounceAt, type PremiumHomeStyle } from "@/lib/world3d/premium-homes";
import { PremiumHomeWorldContext } from "@/components/world3d/premium-homes/PremiumHomeContext";
import { PremiumHomeUpgradeRows } from "@/components/world3d/premium-homes/PremiumHomeUpgradeRows";
import { SkateKitWorldContext } from "@/components/world3d/premium-items/SkatePieces";
import { SKATE_KIT, skateHeightAt, skatePiece, type PlacedSkatePiece } from "@/lib/world3d/skate-kit";
import { buildKitLevel, nextBuildKitUpgrade, type BuildKit } from "@/lib/world3d/build-kits";
import { RACE_KIT, RACE_PIECE_KEYS } from "@/lib/world3d/race-kit";
import { buildRaceCourse, raceExitPosition, raceStartLine, type KartWorld, type PlacedRaceItem } from "@/lib/world3d/race-driving";
import { newRaceHud, RaceKartDriver, type RaceHud as RaceHudState } from "@/components/world3d/premium-items/RaceKartDriver";
import { RaceHud } from "@/components/world3d/premium-items/RaceHud";
import { ExplorerPositionContext } from "@/components/world3d/premium-items/TowerDefenceModels";
import { laserFenceBeams, laserFenceHit } from "@/lib/world3d/tower-defence";
import { defenceSounds } from "@/lib/audio/defence-sfx";
import { buildSounds } from "@/lib/audio/build-sfx";
import { carSounds } from "@/lib/audio/car-sfx";
import { CarDriver, CarHudPanel, type CarHud, type CarPose } from "@/components/world3d/premium-items/CarDriver";
import { CarWorldContext } from "@/components/world3d/premium-items/RoadsAndCars";
import { buildDriveCourse, CAR_COLOURS, CAR_SPECS, CARPORT_ASSET_KEY, carBlockedCells, carToDrive, cellAt, nextOf, ownedCars, readCarChoice, writeCarChoice, type CarStyle } from "@/lib/world3d/cars";
import { BasketballScoreContext } from "@/components/world3d/premium-items/BasketballCourt";
import { ballAt, COURT_SCALE, courtInWorld, nearestHoop, planShot, RIM_HEIGHT, type Shot } from "@/lib/world3d/basketball";
import { chooseTarget, planSportShot, SPORT_ACTION, SPORT_KINDS, sportBallAt, sportInWorld, type SportKind, type SportShot } from "@/lib/world3d/sports";
import { KartGarage, type KartGarageActions } from "@/components/world3d/premium-items/KartGarage";
import { kartSetup, type KartParts, type KartStyle } from "@/lib/world3d/kart-garage";
import { fetchFinishedRealms } from "@/lib/world3d/kart-garage-client";
import { RaceKitWorldContext } from "@/components/world3d/premium-items/RacePieces";
import { KitTrayHeader } from "@/components/world3d/premium-items/KitTrayHeader";
import { newWorldPlacementId, gridStroke, CONNECTED_BOUNDARY_KEYS } from "@/lib/world3d/world-connections";
import { waterBrushCells } from "@/lib/world3d/world-water";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as THREE from "three";
import { Environment, Html, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Anchor, Swords, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bike, Wrench, Bird, BrickWall, Castle, Check, Cherry, ChevronDown, ChevronUp, Minus, Moon, MoreHorizontal, Move, PersonStanding, Plus, ScanEye, RotateCcw, DoorOpen, Droplets, Feather, Fence, Flag, Flame, Flower2, Gem, Grid2x2, Hand, Hexagon, Home, Lamp, Landmark, Leaf, Logs, Mailbox, Mountain, PackageOpen, PartyPopper, PawPrint, Rabbit, Route, RotateCw, Shell, Shield, ShoppingBag, Shrub, Signpost, Sofa, Sprout, Star, Sun, TreeDeciduous, TreePalm, TreePine, TrafficCone, Trash2, Umbrella, Users, Waves, X, type LucideIcon } from "lucide-react";
import { TAP_TRAVEL_PX, useBuildGestures, type BuildGestureState } from "@/components/world3d/useBuildGestures";
import { freeBuildRender } from "@/lib/world3d/free-build-renders";
import { BuildFootprint, CentralWorldEnvironment } from "@/components/world3d/CentralWorldEnvironment";
import { HubWadingRipples } from "@/components/world3d/CentralWorldV2Scenery";
import { HubNightGlow, HubSkyLights, readHubNight, writeHubNight } from "@/components/world3d/HubNight";
import { buildWaterAreas, placedLakes, swimSurfaceAt, SWIM_SPEED, waterReach, withSwimming, type WaterAreas } from "@/lib/world3d/swimming";
import { BOAT_SPECS, boatToRide, boatWaterAt, nearestBank, openWaterHeading, ownedBoats, type BoatStyle } from "@/lib/world3d/boats";
import { BoatRider } from "@/components/world3d/premium-items/BoatRider";
import { hubCanStand, hubGroundHeight, hubSpeedFactor, hubSwimSurfaceAt, hubV2Spot, hubWaterDepth, HUB_V2_WATER_Y, HUB_V2_BUILD_RULES, HUB_V2_HOME_CARPORT, HUB_V2_PLAY_RADIUS, HUB_V2_TREEHOUSE_ANCHORS, isCentralWorldV2Enabled } from "@/lib/world3d/central-world-v2";
import { fetchServerWorldLayout, hasPendingWorldLayoutSave, isSyncedWorldScope, onWorldSaved } from "@/lib/world3d/central-world-sync";
import { WorldHUD } from "@/components/world3d/WorldHUD";
import { FriendRequestToast, FriendsPanel } from "@/components/world3d/friends/FriendsPanel";
import { KnockDoor, KnockToast, VisitOverCard, VisitorsCard } from "@/components/world3d/friends/VisitDoor";
import { WorldMates } from "@/components/world3d/friends/WorldMates";
import { VISIT_HEARTBEAT_MS, answerKnock, endVisit, setVisitBuild, useHostVisits, visitStatus, type KnockAnswer, type VisitGuest } from "@/lib/friend-visits";
import { NO_POSE, useDemoMate, useWorldTogether, type ExplorerPose, type WorldMate, type WorldNudge } from "@/lib/world-together";
import { useCanonicalAvatarAppearance } from "@/lib/avatar-appearance";
import { BattleInviteToast, BattlesPanel, type BattlesPanelStart } from "@/components/world3d/battle/BattlePanels";
import { battleRoomHref, fetchBattles, readBattleRealm, useOnlineFriends, type Battle, type BattleToPlay } from "@/lib/battles";
import { VisitBanner, VisitorChangesCard } from "@/components/world3d/friends/FriendVisit";
import { fetchFriends, fetchFriendWorld, fetchVisitorChanges, friendLook, friendPageHref, resolveVisitorChange, respondToFriend, visitHref, visitScope, type Friend, type FriendOutfit, type VisitorChange } from "@/lib/friends";
import { undoFriendChanges } from "@/lib/world3d/friend-changes";
import { RexDinosaur } from "@/components/world3d/rex/RexDinosaur";
import { RexHud } from "@/components/world3d/rex/RexHud";
import { useRexVisit, type RexPhase } from "@/lib/rex-client";
import { rexLevelFrom } from "@/lib/rex";
import { resolveWorldJourney } from "@/lib/world3d/world-journey";
import { resolveTowerRealmEntry } from "@/lib/world3d/tower-realm-entry";
import type { CanonicalRealmId } from "@/lib/realms/realm-registry";
import { WalkBuildBar, type WalkBuildHint, type WalkBuildMode, type WalkBuildSlot } from "@/components/world3d/WalkBuildBar";
import { footCell, frontCell, HOTBAR_STARTERS, hotbarSlots, hotbarTool, hotbarToolOf, itemSize, nearestFit, readHotbar, rememberHotbarEntry, standBehind, togglePin, writeHotbar, type HotbarEntry } from "@/lib/world3d/walk-build";
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
import { economyErrorMessage, equipEconomyItem, fetchDemoEconomy, fetchStudentEconomy, purchaseEconomyItem, unequipEconomySlot, type EconomyItem, type EconomyState } from "@/lib/economy";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import {
  CENTRAL_WORLD_ANCHORS,
  CENTRAL_WORLD_CONFIG,
  type CentralWorldQuality,
} from "@/lib/world3d/central-world-config";
import {
  CENTRAL_WORLD_CUSTOMISATION_CATALOG,
  CENTRAL_WORLD_SHOP_ROWS,
  mergeCentralWorldCatalogue,
} from "@/lib/world3d/central-world-customisation-catalog";
import { rememberCentralWorldHomeEntry } from "@/lib/world3d/world-navigation-context";
import { treehouseHref } from "@/lib/world3d/treehouse-navigation";
import { joinSpeechParts, WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";
import { speak } from "@/lib/speak";
import { CENTRAL_WORLD_STARTER_SCENERY, type WorldSceneryGroup } from "@/lib/world3d/central-world-editor-catalog";
import {
  selectCentralWorldInventoryPlacement,
  centralWorldPlacementProblem,
  CENTRAL_WORLD_BUILD_RULES,
  CENTRAL_WORLD_HOME_KEY,
  CENTRAL_WORLD_HOME_ITEM,
  getCentralWorldHome,
  freshCentralWorldLayout,
  getCentralWorldHomeAnchors,
  gridToWorld,
  itemGroundSize,
  placementCentre,
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
  type CentralWorldBuildRules,
  type CentralWorldGrid,
  type CentralWorldGroundTile,
  type CentralWorldGroundType,
  type CentralWorldPlacement,
  type CentralWorldPlacementProblem,
} from "@/lib/world3d/central-world-layout";

const ARROW_CONTROLS_KEY = "lul:world-edit:arrow-controls:v1";
type WorldEditTool = CentralWorldGroundType | "move" | "scenery" | "erase";
const GROUND_BRUSHES: ReadonlySet<WorldEditTool> = new Set(["path", "road", "stone", "water", "track"]);
const isGroundBrush = (tool: WorldEditTool): tool is CentralWorldGroundType => GROUND_BRUSHES.has(tool);
const EDIT_TOOL_NAMES: Record<WorldEditTool, string> = { move: "Move", path: "Path", road: "Road", stone: "Stone", water: "Water", track: "Tarmac", scenery: "Scenery", erase: "Eraser" };
// Three set camera angles, so nobody has to fiddle with tilting to see their build.
type BuildView = "close" | "normal" | "above";
const BUILD_VIEWS: Record<BuildView, { label: string; pitch: number; zoom: number; Icon: LucideIcon }> = {
  close: { label: "Close", pitch: 0.4, zoom: 18, Icon: PersonStanding },
  normal: { label: "Normal", pitch: 0.82, zoom: 28, Icon: ScanEye },
  above: { label: "Bird's-eye", pitch: 1.45, zoom: 38, Icon: Grid2x2 },
};
const BUILD_VIEW_ORDER: BuildView[] = ["close", "normal", "above"];
const BUILD_PITCH = { min: 0.32, max: 1.45 } as const;
const BUILD_ZOOM = { min: 14, max: 44 } as const;
function activeBuildView(pitch: number): BuildView | null {
  return BUILD_VIEW_ORDER.find((view) => Math.abs(BUILD_VIEWS[view].pitch - pitch) < 0.06) ?? null;
}
// What the builder says when a held item can't go where it is.
const PLACEMENT_PROBLEM_TEXT: Record<CentralWorldPlacementProblem, string> = {
  outside: "That's the edge of your world. Move it back in.",
  reserved: "Paths, the river and the Tower stay clear. Move it onto open grass.",
  occupied: "Something is already here. Move it to a clear spot.",
  "needs-track": "Trains go on an empty railway track.",
  "home-doorway": "Your house and its doorway need clear ground.",
};
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
  { key: "street", label: "Street", Icon: TrafficCone },
  { key: "fortress", label: "Defence", Icon: Shield },
  { key: "skate", label: "Skate", Icon: Bike },
  { key: "race", label: "Race", Icon: Flag },
];
type TrayTab = "owned" | PaletteTab;
/** How steeply the camera looks down while building on foot. */
const WALK_BUILD_CAMERA_PITCH = -0.6;
/** How many squares from the explorer a tap can build. */
const WALK_TAP_REACH = 5;
/** How far (in squares) a held item looks for a spot that fits: on foot (by its size), planning, and on Place. */
const walkFitReach = (size: [number, number]) => 3 + Math.ceil(Math.max(size[0], size[1]) / 2);
const PLAN_FIT_REACH = 12;
const SLIDE_REACH = 3;
/** Where the camera aims while building on foot (lower than usual, so the explorer sits higher on screen). */
const WALK_BUILD_CAMERA_TARGET = 0.6;
/** How much faster the avatar rolls on skate pieces. */
const SKATE_SPEED_BOOST = 1.35;
const TRAY_TABS: Array<{ key: TrayTab; label: string }> = [
  { key: "owned", label: "My items" },
  ...PALETTE_TABS.map(({ key, label }) => ({ key, label })),
];
// Little pictures of each ground type for the tray.
function GroundSwatch({ tool }: { tool: WorldEditTool }) {
  if (tool === "water") return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="14" fill="#5cc8e8" /><path d="M22 36q10-8 20 0t20 0 20 0 20 0M22 56q10-8 20 0t20 0 20 0 20 0" stroke="#d9f6ff" strokeWidth="5" fill="none" strokeLinecap="round" /></svg>;
  if (tool === "track") return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="10" fill="#3a3f4a" /><path d="M8 14h104M8 76h104" stroke="#ff5e57" strokeWidth="6" strokeDasharray="12 12" /><path d="M8 14h104M8 76h104" stroke="#fff" strokeWidth="6" strokeDasharray="12 12" strokeDashoffset="12" /><path d="M20 45h16M52 45h16M84 45h16" stroke="#e9e9e9" strokeWidth="5" strokeLinecap="round" /></svg>;
  if (tool === "road") return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="10" fill="#4a4f57" /><path d="M18 45h18M50 45h18M82 45h18" stroke="#f5d76e" strokeWidth="6" strokeLinecap="round" /></svg>;
  if (tool === "stone") return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="10" fill="#8e8a82" />{[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={14 + c * 25 + (r % 2) * 6} y={16 + r * 21} width="20" height="16" rx="3" fill="#c9c4b8" />))}</svg>;
  return <svg viewBox="0 0 120 90" aria-hidden="true"><rect x="8" y="10" width="104" height="70" rx="10" fill="#7fb84f" /><path d="M8 52c30-18 60 14 104-8v22H8z" fill="#d6b77a" /><circle cx="40" cy="58" r="3" fill="#b8975e" /><circle cx="78" cy="56" r="2.5" fill="#b8975e" /></svg>;
}
const GROUND_TOOLS: Array<[CentralWorldGroundType, string, LucideIcon]> = [
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
  lamp_post: Lamp, bench: Sofa, fence: Fence, mailbox: Mailbox, campfire: Flame, flag: Flag, umbrella: Umbrella, signpost: Signpost, balloons: PartyPopper,
  kangaroo: Rabbit, koala: PawPrint, wombat: PawPrint, emu: Bird, kookaburra: Feather, echidna: Shell, cockatoo: Bird,
  fruit_tree: Cherry, flower_pots: Flower2, mushroom_cluster: Sprout, hedge_arch: Shrub,
  hopscotch: Grid2x2, sandpit: Shell, seesaw: Logs, small_slide: Route,
  shield_decoration: Shield, supply_wagon: PackageOpen, training_dummy: Hand, stone_steps: BrickWall,
  small_jetty: Anchor, rowboat: Waves, fishing_rod_stand: Anchor, lifebuoy: Waves,
  defence_laser_fence: Fence, defence_laser_gate: DoorOpen, defence_scanner: ScanEye,
  torch: Flame, chest: Gem, well: Droplets,
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
  const target = useRef<THREE.Vector3 | null>(null);
  useFrame((_, delta) => {
    if (!active) { target.current = null; return; }
    const [x, , z] = gridToWorld(cursor.gridX, cursor.gridZ);
    // The look point glides too, so a tap on the ground eases the view across
    // instead of snapping it there.
    const ease = 1 - Math.pow(0.00001, delta);
    if (!target.current) target.current = new THREE.Vector3(x, 0, z);
    else target.current.lerp(new THREE.Vector3(x, 0, z), ease);
    const look = target.current;
    // Orbit the look point: yaw spins 360° around it, pitch tilts from low
    // (see behind walls) to nearly top-down.
    const dist = zoom * 1.2;
    const horiz = Math.cos(pitch) * dist;
    const desired = new THREE.Vector3(look.x + Math.sin(yaw) * horiz, Math.max(2, Math.sin(pitch) * dist), look.z + Math.cos(yaw) * horiz);
    camera.position.lerp(desired, ease);
    camera.lookAt(look);
  });
  return null;
}

// What a press on the build surface turned into: painting (handled as it
// happens), or a drag that moves around the world, which becomes a tap if the
// finger lifts without travelling.
type BuildCellResult = "pan" | void;
type BuildSurfaceHandlers = {
  onCell: (gridX: number, gridZ: number, paint: boolean) => BuildCellResult;
  onTap: (gridX: number, gridZ: number) => void;
  onHover: (gridX: number, gridZ: number) => void;
};

function BuildModeSurface({ grid, active, paint, continuous, onStrokeState, gestureRef, handlers }: { grid: CentralWorldGrid; active: boolean; paint: boolean; continuous: boolean; onStrokeState:(active:boolean)=>void; gestureRef: React.RefObject<BuildGestureState>; handlers: BuildSurfaceHandlers }) {
  const painting = useRef(false);
  const pendingTap = useRef<{ gridX: number; gridZ: number } | null>(null);
  const lastCell = useRef("");
  const hoverCell = useRef("");
  const width = (grid.maxX - grid.minX + 1) * grid.cellSize;
  const depth = (grid.maxZ - grid.minZ + 1) * grid.cellSize;
  const centreX = ((grid.minX + grid.maxX) / 2) * grid.cellSize;
  const centreZ = ((grid.minZ + grid.maxZ) / 2) * grid.cellSize;

  function cellOf(event: ThreeEvent<PointerEvent>) {
    return {
      gridX: THREE.MathUtils.clamp(Math.round(event.point.x / grid.cellSize), grid.minX, grid.maxX),
      gridZ: THREE.MathUtils.clamp(Math.round(event.point.z / grid.cellSize), grid.minZ, grid.maxZ),
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
    const tap = pendingTap.current;
    pendingTap.current = null;
    const gesture = gestureRef.current;
    if (tap && gesture && gesture.travel < TAP_TRAVEL_PX && !gesture.multi) handlers.onTap(tap.gridX, tap.gridZ);
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
        pendingTap.current = result === "pan" ? cellOf(event) : null;
        if (result === "pan" && gestureRef.current) gestureRef.current.mode = "pan";
      }}
      onPointerMove={(event) => {
        if (gestureRef.current?.block) { painting.current = false; pendingTap.current = null; return; }
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
      onPointerCancel={() => { onStrokeState(false); painting.current = false; pendingTap.current = null; lastCell.current = ""; }}
    >
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/** A placed item the builder tapped: outlined, with its menu floating beside it. */
type BuildSelection = { placement: CentralWorldPlacement; item: EconomyItem; menu: React.ReactNode };

function CentralWorldScene({ night, selection, onStrokeState, homePlacement, quality, moveInput, lookInput, spawnTarget, spawnNonce, spawnYaw, placedCustomisations, groundTiles, itemsById, buildPreview, groundPreview, editing, buildZoom, paintMode, surfaceHandlers, gestureRef, onEnterTower, onEnterHome, onActiveTarget, onToggleDrawbridge, cameraFocus, cameraYaw, cameraPitch, avatarPosRef, hubV2 = false, homeAnchors, buildRules, raceItems, raceStarts, race, raceHud, onBestLap, kart, racePaused, courts, shot, onShotDone, walking, walkCursor, walkGridCells, walkFar, eraseTarget, aimRef, justPlacedId, onWalkTap, carports, drive, carHud, carPose, rexPhase, waterAreas, boat, boatWaterAt, poseRef, mates, matePoses }: { poseRef: React.MutableRefObject<ExplorerPose>; mates: readonly WorldMate[]; matePoses: React.RefObject<Map<string, ExplorerPose>>; waterAreas: WaterAreas; boat: BoatRide | null; boatWaterAt: (x: number, z: number) => number | null; rexPhase: RexPhase; carports: CarportTarget[]; drive: DriveSession | null; carHud: React.MutableRefObject<CarHud>; carPose: React.MutableRefObject<CarPose>; onWalkTap: (gridX: number, gridZ: number) => void; justPlacedId: string | null; walking: boolean; walkCursor: { gridX: number; gridZ: number } | null; walkGridCells: number; walkFar: boolean; eraseTarget: { placement: CentralWorldPlacement; item: EconomyItem } | null; aimRef: React.MutableRefObject<number>; courts: CourtTarget[]; shot: ShotInFlight | null; onShotDone: (shot: Shot | SportShot) => void; kart: { style: KartStyle; parts: KartParts }; racePaused: boolean; raceItems: PlacedRaceItem[]; raceStarts: RaceStartTarget[]; race: RaceSession | null; raceHud: React.MutableRefObject<RaceHudState>; onBestLap: (seconds: number) => void; night: boolean; selection: BuildSelection | null; hubV2?: boolean; buildRules: CentralWorldBuildRules; homeAnchors: ReturnType<typeof getCentralWorldHomeAnchors>; onStrokeState:(active:boolean)=>void; homePlacement: CentralWorldPlacement; quality: CentralWorldQuality; moveInput: WorldMoveInput; lookInput: WorldLookInput; spawnTarget: [number, number, number] | null; spawnNonce: number; spawnYaw: number; placedCustomisations: CentralWorldPlacement[]; groundTiles: CentralWorldGroundTile[]; itemsById: Map<string, EconomyItem>; buildPreview: { placement: CentralWorldPlacement; item: EconomyItem; valid: boolean } | null; groundPreview: { tile: CentralWorldGroundTile; valid: boolean; cells?: {gridX:number;gridZ:number;valid:boolean}[] } | null; editing: boolean; buildZoom: number; paintMode: boolean; surfaceHandlers: BuildSurfaceHandlers; gestureRef: React.RefObject<BuildGestureState>; onEnterTower: () => void; onEnterHome: () => void; onActiveTarget: (id: string | null) => void; onToggleDrawbridge: (placementId: string) => void; cameraFocus: { gridX: number; gridZ: number }; cameraYaw: number; cameraPitch: number; avatarPosRef: React.MutableRefObject<{ x: number; z: number }> }) {
  // Where placed items react to: the explorer on foot, or their car or boat while driving (the car wash, the servo).
  const reactorRef = useRef({ x: 0, z: 0 });
  useFrame(() => {
    const from = drive || boat ? carPose.current : avatarPosRef.current;
    reactorRef.current.x = from.x;
    reactorRef.current.z = from.z;
  });
  const [activeTargetId, setActiveTargetId] = useState<string | null>(null);
  // The camera can rest between cells while panning; the build grid snaps to one.
  const focusX = Math.round(cameraFocus.gridX), focusZ = Math.round(cameraFocus.gridZ);
  const focusCell = useMemo(() => ({ gridX: focusX, gridZ: focusZ }), [focusX, focusZ]);
  const handleNearestTarget = useCallback((id: string | null) => {
    setActiveTargetId(id);
    onActiveTarget(id);
  }, [onActiveTarget]);
  // Placed trampolines make the avatar bounce; higher trampoline levels bounce higher.
  const trampolineLevel = useContext(PremiumHomeWorldContext).levels.trampoline;
  const trampolines = useMemo(() => placedCustomisations.flatMap((placement) => {
    const item = itemsById.get(placement.itemId);
    if (!item || premiumHomeStyle(item.metadata.worldAssetKey) !== "trampoline") return [];
    const [x, , z] = placementCentre(placement, item);
    return [{ x, z }];
  }), [placedCustomisations, itemsById]);
  const bounceAt = useMemo(() => trampolines.length ? (x: number, z: number) => trampolineBounceAt(x, z, trampolines, trampolineLevel) : undefined, [trampolines, trampolineLevel]);
  // Placed skate pieces lift the avatar onto their ramps, on a board, a little faster.
  const skatePieces = useMemo(() => placedCustomisations.flatMap((placement): PlacedSkatePiece[] => {
    const item = itemsById.get(placement.itemId);
    const piece = skatePiece(item?.metadata.worldAssetKey);
    if (!item || !piece) return [];
    const [x, , z] = placementCentre(placement, item);
    return [{ x, z, rotation: placement.rotation, piece }];
  }), [placedCustomisations, itemsById]);
  const rideHeightAt = useMemo(() => skatePieces.length ? (x: number, z: number) => skateHeightAt(x, z, skatePieces) : undefined, [skatePieces]);
  // All water is swimmable: painted water and placed Swimming Lakes are dug out, and the river runs deep.
  const groundAt = useMemo(() => hubV2 ? withSwimming(waterAreas, hubGroundHeight) : undefined, [hubV2, waterAreas]);
  const swimmingAt = useMemo(() => hubV2 ? (x: number, z: number) => swimSurfaceAt(waterAreas, x, z) ?? hubSwimSurfaceAt(x, z) : undefined, [hubV2, waterAreas]);
  const speedAt = useMemo(() => {
    const terrain = hubV2 ? (x: number, z: number) => swimSurfaceAt(waterAreas, x, z) !== null ? SWIM_SPEED : hubSpeedFactor(x, z) : undefined;
    if (!rideHeightAt) return terrain;
    return (x: number, z: number) => (terrain ? terrain(x, z) : 1) * (rideHeightAt(x, z) === null ? 1 : SKATE_SPEED_BOOST);
  }, [hubV2, rideHeightAt, waterAreas]);
  // The laser fence stops the explorer (and karts) with a zap.
  const fenceBeams = useMemo(() => laserFenceBeams(placedCustomisations.filter((placement) => itemsById.get(placement.itemId)?.metadata.worldAssetKey === "defence_laser_fence")), [placedCustomisations, itemsById]);
  const zap = useRef<{ x: number; z: number; at: number } | null>(null);
  const canStandAt = useMemo(() => {
    const ground = hubV2 ? hubCanStand : undefined;
    if (!fenceBeams.length) return ground;
    return (x: number, z: number) => {
      if (ground && !ground(x, z)) return false;
      const beam = laserFenceHit(x, z, fenceBeams);
      if (!beam) return true;
      zap.current = { x, z, at: performance.now() };
      defenceSounds.zap();
      return false;
    };
  }, [hubV2, fenceBeams]);
  // Racing: the course is the painted tarmac plus the placed Race Kit pieces.
  const raceCourse = useMemo(() => race ? buildRaceCourse(raceItems, groundTiles) : null, [race, raceItems, groundTiles]);
  const raceStart = useMemo(() => race ? raceStartLine(race.start) : null, [race]);
  const kartWorld = useMemo<KartWorld>(() => {
    const bounds = hubV2 ? HUB_V2_BOUNDS : CENTRAL_WORLD_CONFIG.playableBounds, roam = hubV2 ? HUB_V2_ROAM : CENTRAL_WORLD_CONFIG.roamEllipse;
    return {
      groundHeightAt: hubV2 ? hubGroundHeight : undefined,
      // Karts and cars stay out of ponds and lakes (the river's banks already stop them).
      canDriveAt: (x, z) => x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ
        && (x / roam.radiusX) ** 2 + ((z - roam.centerZ) / roam.radiusZ) ** 2 <= 1
        && (canStandAt ? canStandAt(x, z) : true)
        && waterReach(waterAreas, x, z) === 0,
    };
  }, [hubV2, canStandAt, waterAreas]);
  // Driving your own car: roads are fast, grass is this car's off-road speed, and placed things block.
  const driveCourse = useMemo(() => drive ? buildDriveCourse(groundTiles) : null, [drive, groundTiles]);
  const carBlocked = useMemo(() => drive ? carBlockedCells(placedCustomisations, itemsById) : null, [drive, placedCustomisations, itemsById]);
  const carWorld = useMemo<KartWorld>(() => ({
    groundHeightAt: kartWorld.groundHeightAt,
    canDriveAt: (x, z) => kartWorld.canDriveAt(x, z) && !carBlocked?.has(cellAt(x, z)),
  }), [kartWorld, carBlocked]);
  const racing = Boolean(raceCourse && raceStart) || Boolean(drive) || Boolean(boat);
  // The build camera takes over in the planner; walking builders keep their own view.
  const frozen = editing || (Boolean(buildPreview) && !walking);
  const roaming = !frozen && !racing;
  return (
    <ExplorerPositionContext.Provider value={reactorRef}>
      {hubV2 ? <>
        <HubSkyLights night={night} quality={quality} avatarPosRef={avatarPosRef} />
        <HubNightGlow night={night} animate={quality !== "low"} avatarPosRef={avatarPosRef} />
      </> : <>
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
      </>}
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
        hubV2={hubV2}
        night={hubV2 && night}
        reservedCell={hubV2 ? buildRules.isReservedCell : undefined}
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
        editCursor={walkCursor ?? focusCell}
        buildGridCells={walkCursor ? walkGridCells : 16}
        justPlacedId={justPlacedId}
        onEnterTower={onEnterTower}
        onEnterHome={onEnterHome}
        onToggleDrawbridge={onToggleDrawbridge}
      />
      {/* A name tag floats over what the learner is near; the dock's main button acts on it. */}
      <SharedThirdPersonPlayer
        initialPosition={spawnTarget ?? CENTRAL_WORLD_CONFIG.spawnPoint}
        spawnTarget={spawnTarget}
        spawnNonce={spawnNonce}
        initialYaw={spawnYaw}
        moveInput={moveInput}
        lookInput={lookInput}
        bounds={hubV2 ? HUB_V2_BOUNDS : CENTRAL_WORLD_CONFIG.playableBounds}
        roamEllipse={hubV2 ? HUB_V2_ROAM : CENTRAL_WORLD_CONFIG.roamEllipse}
        groundHeightAt={groundAt}
        swimSurfaceAt={swimmingAt}
        canStandAt={canStandAt}
        speedFactorAt={speedAt}
        bounceAt={bounceAt}
        rideHeightAt={rideHeightAt}
        interactionTargets={[
          { id: CENTRAL_WORLD_ANCHORS.towerMainEntrance, position: CENTRAL_WORLD_CONFIG.towerMainEntrance, distance: 6.2 },
          { id: CENTRAL_WORLD_ANCHORS.myHomeEntrance, position: homeAnchors.entrance, distance: hubV2 ? 6 : 4.8 },
          ...raceStarts.map(({ id, item }) => ({ id, position: gridToWorld(item.gridX, item.gridZ), distance: 6 })),
          ...courts.map(({ id, court }) => ({ id, position: [court.x, 0, court.z] as [number, number, number], distance: court.reach })),
          ...carports.map(({ id, pose }) => ({ id, position: [pose.x, 0, pose.z] as [number, number, number], distance: 4.6 })),
        ]}
        onNearestTargetId={handleNearestTarget}
        initialPitch={-0.1}
        cameraDistance={walking && walkFar ? 20 : 13}
        // Building on foot: the camera looks down more and frames the explorer higher (clear of the
        // build buttons), and the explorer fades so the square in front of them always shows.
        cameraMaxPitch={walking ? WALK_BUILD_CAMERA_PITCH : undefined}
        cameraTargetHeight={walking ? WALK_BUILD_CAMERA_TARGET : 3.3}
        seeThrough={walking && Boolean(buildPreview)}
        cameraEnabled={roaming}
        movementEnabled={roaming}
        hidden={!roaming}
        speed={hubV2 ? 5.6 : 4.2}
        positionRef={avatarPosRef}
        poseRef={poseRef}
        aimRef={aimRef}
      />
      {boat ? <BoatRider key={boat.nonce} start={boat.start} style={boat.style} waterAt={boatWaterAt} moveInput={moveInput} hudRef={carHud} poseRef={carPose} night={night} /> : null}
      {drive && driveCourse ? <CarDriver key={drive.nonce} start={drive.start} style={drive.style} colour={drive.colour} course={driveCourse} world={carWorld} moveInput={moveInput} hudRef={carHud} poseRef={carPose} night={night} lights={drive.lights} /> : null}
      {race && raceCourse && raceStart ? <RaceKartDriver key={race.nonce} course={raceCourse} start={raceStart} world={kartWorld} moveInput={moveInput} hud={raceHud} kart={kart} paused={racePaused} night={night} onBestLap={onBestLap} /> : null}
      <BuildModeCamera active={frozen} cursor={cameraFocus} zoom={buildZoom} yaw={cameraYaw} pitch={cameraPitch} />
      <BuildModeSurface grid={buildRules.grid} active={frozen} paint={paintMode} onStrokeState={onStrokeState} continuous={!buildPreview || CONNECTED_BOUNDARY_KEYS.has(String(buildPreview.item.metadata.worldAssetKey))} gestureRef={gestureRef} handlers={surfaceHandlers} />
      {selection ? <>
        <BuildFootprint placement={selection.placement} item={selection.item} tone="selected" />
        <Html position={placementCentre(selection.placement, selection.item)} zIndexRange={[37, 37]}>{selection.menu}</Html>
      </> : null}
      {walking ? <WalkTapSurface cellSize={buildRules.grid.cellSize} onTap={onWalkTap} /> : null}
      {eraseTarget ? <BuildFootprint placement={eraseTarget.placement} item={eraseTarget.item} tone="blocked" /> : null}
      {hubV2 && !frozen ? <HubWadingRipples positionRef={avatarPosRef} /> : null}
      <WorldMates mates={mates} poses={matePoses} />
      {hubV2 && rexPhase !== "away" ? <Suspense fallback={null}><RexDinosaur phase={rexPhase} avatarPosRef={avatarPosRef} aimRef={aimRef} groundAt={groundAt} /></Suspense> : null}
      {hubV2 ? <HubAdaptiveResolution /> : null}
      <CentralWorldMetricsReporter quality={quality} />
      {fenceBeams.length ? <ZapSpark zap={zap} /> : null}
      {shot ? <ShotBall key={shot.id} shot={shot.plan} onDone={onShotDone} /> : null}
    </ExplorerPositionContext.Provider>
  );
}

/** A quick tap (or click) on the ground while walking: which square it hit. Drags still turn the camera. */
const WALK_TAP = { maxTravelPx: 10, maxMs: 450 } as const;
function WalkTapSurface({ cellSize, onTap }: { cellSize: number; onTap: (gridX: number, gridZ: number) => void }) {
  const { gl, camera } = useThree();
  const tapRef = useRef(onTap);
  useEffect(() => { tapRef.current = onTap; }, [onTap]);
  useEffect(() => {
    const element = gl.domElement;
    let down: { x: number; y: number; at: number; id: number } | null = null;
    const start = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY, at: performance.now(), id: event.pointerId }; };
    const end = (event: PointerEvent) => {
      const press = down;
      down = null;
      if (!press || press.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > WALK_TAP.maxTravelPx || performance.now() - press.at > WALK_TAP.maxMs) return;
      const rect = element.getBoundingClientRect();
      const ray = new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1), camera);
      const hit = ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3());
      if (hit) tapRef.current(Math.round(hit.x / cellSize), Math.round(hit.z / cellSize));
    };
    element.addEventListener("pointerdown", start);
    element.addEventListener("pointerup", end);
    return () => { element.removeEventListener("pointerdown", start); element.removeEventListener("pointerup", end); };
  }, [gl, camera, cellSize]);
  return null;
}

/** The ball in flight: up in an arc to the rim, then through the net or off the rim to the ground. */
/** What each game's ball looks like: radius, colour, and a squash for the oval footy. */
const BALLS: Record<"basketball" | SportKind, { r: number; color: string; stretch?: number }> = {
  basketball: { r: 0.13, color: "#ff7a1a" }, netball: { r: 0.12, color: "#ffcc33" }, soccer: { r: 0.22, color: "#f4f4f4" }, footy: { r: 0.18, color: "#c0392b", stretch: 1.6 }, tennis: { r: 0.11, color: "#d7f04a" },
};
function ShotBall({ shot, onDone }: { shot: Shot | SportShot; onDone: (shot: Shot | SportShot) => void }) {
  const kind = "sport" in shot ? shot.sport : "basketball";
  const look = BALLS[kind];
  const ref = useRef<THREE.Group>(null);
  const started = useRef<number | null>(null), done = useRef(false);
  useFrame(({ clock }) => {
    const ball = ref.current;
    if (!ball) return;
    started.current ??= clock.elapsedTime;
    const t = (clock.elapsedTime - started.current) / shot.duration;
    if (t <= 1) ball.position.set(...("sport" in shot ? sportBallAt(shot, t) : ballAt(shot, t)));
    else {
      // After the rim: drop through the net, or bounce off to one side.
      const k = Math.min(1, (t - 1) * shot.duration / 0.5);
      const [x, y, z] = shot.to;
      ball.position.set(shot.makes ? x : x + k * 1.4, Math.max(0.12, y - k * k * (y - 0.12)), shot.makes ? z : z + k * 0.9);
      if (k >= 1 && !done.current) { done.current = true; onDone(shot); }
    }
    ball.rotation.x += 0.25;
  });
  return (
    <group ref={ref} position={[...shot.from]}>
      <mesh castShadow scale={[1, 1, look.stretch ?? 1]}><sphereGeometry args={[look.r, 20, 14]} /><meshStandardMaterial color={look.color} roughness={0.6} /></mesh>
      {kind === "basketball" ? [0, Math.PI / 2].map((r) => <mesh key={r} rotation={[0, r, 0]}><torusGeometry args={[0.131, 0.007, 6, 24]} /><meshStandardMaterial color="#2a1a10" /></mesh>) : null}
    </group>
  );
}

/** A quick crackle of light where the explorer bumped the laser fence. */
function ZapSpark({ zap }: { zap: React.MutableRefObject<{ x: number; z: number; at: number } | null> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const spark = ref.current, hit = zap.current;
    if (!spark) return;
    const age = hit ? (performance.now() - hit.at) / 1000 : Infinity;
    spark.visible = age < 0.3;
    if (!hit || !spark.visible) return;
    spark.position.set(hit.x, 1, hit.z);
    spark.scale.setScalar(0.6 + age * 3);
    spark.rotation.y += 0.7;
  });
  return (
    <group ref={ref} visible={false}>
      <mesh><icosahedronGeometry args={[0.35, 0]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>
      {[0, 1, 2].map((i) => <mesh key={i} rotation={[i, i * 1.3, i * 0.7]}><boxGeometry args={[1.4, 0.04, 0.04]} /><meshBasicMaterial color="#ff4fd8" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} /></mesh>)}
      <pointLight color="#ff4fd8" intensity={8} distance={5} />
    </group>
  );
}

const HUB_V2_BOUNDS = { minX: -HUB_V2_PLAY_RADIUS, maxX: HUB_V2_PLAY_RADIUS, minZ: -HUB_V2_PLAY_RADIUS, maxZ: HUB_V2_PLAY_RADIUS };
const HUB_V2_ROAM = { centerZ: 0, radiusX: HUB_V2_PLAY_RADIUS, radiusZ: HUB_V2_PLAY_RADIUS };

/** A start line the explorer can walk up to and race from. */
type RaceStartTarget = { id: string; item: PlacedRaceItem };
/** A court or pitch the explorer can play on: basketball or one of the Sports set, its targets in world space. */
type CourtTarget = { id: string; kind: "basketball" | SportKind; court: { x: number; z: number; reach: number; targets: Array<readonly [number, number, number]> } };
const CARPORT_TARGET_PREFIX = "carport:";
type CarportTarget = { id: string; pose: CarPose };
type DriveSession = { start: CarPose; style: CarStyle; colour: string; lights: boolean; nonce: number };
type BoatRide = { start: CarPose; style: BoatStyle; nonce: number };
type ShotInFlight = { id: number; plan: Shot | SportShot };
const COURT_TARGET_PREFIX = "court:";
/** A race in progress; the nonce restarts it. */
type RaceSession = { start: PlacedRaceItem; nonce: number };
const RACE_TARGET_PREFIX = "race-start:";
const raceBestKey = (scope: string) => `lul:central-world:race-best:v1:${scope}`;
function readRaceBest(scope: string): number | null {
  try {
    const value = Number(window.localStorage.getItem(raceBestKey(scope)));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch { return null; }
}

/** The bigger hub drops to 1x resolution if a device can't keep a smooth frame rate, and restores it when it recovers. */
function HubAdaptiveResolution() {
  const setDpr = useThree((state) => state.setDpr);
  const initialDpr = useThree((state) => state.viewport.initialDpr);
  return <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(initialDpr)} />;
}

/** The little picture of the held item in the placing bar. */
function HeldItemArt({ item }: { item: EconomyItem }) {
  const picture = inventoryImage(item) ?? freeBuildRender(String(item.metadata.worldAssetKey));
  if (picture) return <Image src={picture} alt="" fill sizes="56px" style={{ objectFit: "contain" }} />;
  const Icon = SCENERY_ICON[String(item.metadata.worldAssetKey)] ?? Sprout;
  return <Icon size={30} color={item.accent} />;
}

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
  // Visiting a friend (?visit=<their id>) shows their world in a separate copy that never saves over yours.
  const visitId = searchParams.get("visit");
  const placementScope = visitId ? visitScope(visitId) : preview ? "demo-preview" : student?.studentId ?? "guest";
  const [placedCustomisations, setPlacedCustomisations] = useState<CentralWorldPlacement[]>(() => readCentralWorldPlacements(placementScope));
  const homePlacement = getCentralWorldHome(placedCustomisations);
  const requestedBuildItemKey = searchParams.get("build");
  const hubV2 = isCentralWorldV2Enabled(searchParams);
  // The bigger hub's home is the fixed treehouse; today's hub keeps the movable lodge.
  const homeAnchors = hubV2 ? HUB_V2_TREEHOUSE_ANCHORS : getCentralWorldHomeAnchors(homePlacement);
  const buildRules = hubV2 ? HUB_V2_BUILD_RULES : CENTRAL_WORLD_BUILD_RULES;
  const buildGrid = buildRules.grid;
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
      : hubV2 && hubV2Spot(searchParams.get("spawn"))
        ? hubV2Spot(searchParams.get("spawn"))!.position
      : null,
  );
  const [spawnNonce, setSpawnNonce] = useState(0);
  const [spawnYaw, setSpawnYaw] = useState(() => searchParams.get("spawn") === CENTRAL_WORLD_ANCHORS.myHomeExitSpawn ? homeAnchors.rotationY : hubV2 ? hubV2Spot(searchParams.get("spawn"))?.yaw ?? 0 : 0);
  const [showIntro, setShowIntro] = useState(false);
  const [night, setNight] = useState(readHubNight);
  const toggleNight = () => {
    const next = !night;
    setNight(next);
    writeHubNight(next);
    void speak(next ? "Night time." : "Day time.", undefined, "manual", { rate: 0.9 });
  };
  const [waterBrushWidth, setWaterBrushWidth] = useState(1);
  const [scenerySearch, setScenerySearch] = useState("");
  const [itemsById, setItemsById] = useState<Map<string, EconomyItem>>(() => new Map([...CENTRAL_WORLD_CUSTOMISATION_CATALOG, CENTRAL_WORLD_HOME_ITEM, ...CENTRAL_WORLD_STARTER_SCENERY].map((item) => [item.item_key, item])));
  const [ownedItemKeys, setOwnedItemKeys] = useState<Set<string>>(() => new Set());
  const [groundTiles, setGroundTiles] = useState<CentralWorldGroundTile[]>(() => readCentralWorldGroundTiles(placementScope));
  const [buildPlacement, setBuildPlacement] = useState<CentralWorldPlacement | null>(null);

  // The learner's world lives on their account: load it here (so it follows them
  // to any device), or move a world built before that up to the account.
  useEffect(() => {
    if (preview || visitId || !isSyncedWorldScope(placementScope)) return;
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
  }, [placementScope, preview, visitId]);
  // A friend's world, once they've let you in (knock first): their layout, the items they own (so their homes
  // show their levels and, if they've said BUILD, your build bar holds their items) and whether you may build.
  const [friendWorld, setFriendWorld] = useState<{ visitId: string; name: string; outfit?: FriendOutfit; canBuild: boolean; owned: string[] } | null>(null);
  // The visit is over (they left, sent you home, or never let you in): the card that takes you home.
  const [visitOver, setVisitOver] = useState<string | null>(null);
  const showLayout = useCallback((layout: { placements: unknown[]; groundTiles: unknown[] }) => {
    applyAccountCentralWorld(placementScope, layout);
    setPlacedCustomisations(readCentralWorldPlacements(placementScope));
    setGroundTiles(readCentralWorldGroundTiles(placementScope));
  }, [placementScope]);
  const loadFriendWorld = useCallback(() => {
    if (!visitId) return () => undefined;
    let cancelled = false;
    void fetchFriendWorld(student?.studentId ?? null, preview, visitId)
      .then((world) => {
        if (cancelled || !world) return;
        // The demo has no real friends: it shows its own world as the friend's.
        // An edit of yours still waiting to save wins; it's about to be sent anyway.
        if (!hasPendingWorldLayoutSave(placementScope)) showLayout(preview ? { placements: readCentralWorldPlacements("demo-preview"), groundTiles: readCentralWorldGroundTiles("demo-preview") } : world);
        setFriendWorld({ visitId: world.visitId, name: world.name, outfit: world.outfit, canBuild: world.canBuild, owned: world.owned });
        if (!preview) setOwnedItemKeys(new Set(world.owned));
      })
      .catch(() => { if (!cancelled) setVisitOver("You need to knock and be let in to visit this world."); });
    return () => { cancelled = true; };
  }, [visitId, placementScope, preview, student?.studentId, showLayout]);
  useEffect(() => loadFriendWorld(), [loadFriendWorld]);
  const visiting = Boolean(visitId);
  const canBuildHere = !visiting || Boolean(friendWorld?.canBuild);
  // ?friends=1 or ?battles=1 (from the profile page, or REMATCH in the arena) opens that panel straight away;
  // for a rematch, ?friend= and ?realm= say who and what.
  const [friendsOpen, setFriendsOpen] = useState(() => searchParams.get("friends") === "1" && !visitId);
  // Friend battles: the Battles panel (from the hub bar or a friend's BATTLE button) and friends' invites.
  // The battle itself is played in its own room, the Battle Arena (/world/battle).
  const [friendsList, setFriendsList] = useState<Friend[]>([]);
  const [battlesOpen, setBattlesOpen] = useState<BattlesPanelStart | null>(() => (searchParams.get("battles") === "1" && !visitId ? { friendId: searchParams.get("friend"), realm: readBattleRealm(searchParams.get("realm")) } : null));
  const [battleInvite, setBattleInvite] = useState<Battle | null>(null);
  // A friend request pops up until you answer it or tap ✕ (then it waits in the Friends panel).
  const [friendsReload, setFriendsReload] = useState(0);
  const [dismissedRequests, setDismissedRequests] = useState<readonly string[]>([]);
  const [answeringRequest, setAnsweringRequest] = useState(false);
  const friendRequest = friendsList.find((f) => f.status === "incoming" && !dismissedRequests.includes(f.friendshipId)) ?? null;
  const answerRequest = (friend: Friend, accept: boolean) => {
    setAnsweringRequest(true);
    void respondToFriend(student?.studentId ?? null, preview, friend.friendshipId, accept)
      .catch(() => setDismissedRequests((list) => [...list, friend.friendshipId]))
      .finally(() => { setAnsweringRequest(false); setFriendsReload((n) => n + 1); });
  };
  useEffect(() => {
    if (!hubV2 || visitId) return;
    let cancelled = false;
    const load = () => void fetchFriends(student?.studentId ?? null, preview).then((state) => { if (!cancelled) setFriendsList(state.friends); }).catch(() => undefined);
    const timer = window.setTimeout(load, 0);
    // Checked every 20 seconds too, so a friend request pops up while you're playing.
    const poll = preview ? 0 : window.setInterval(load, 20_000);
    return () => { cancelled = true; window.clearTimeout(timer); window.clearInterval(poll); };
  }, [hubV2, visitId, student?.studentId, preview, friendsOpen, battlesOpen, friendsReload]);
  const friendIds = useMemo(() => friendsList.filter((f) => f.status === "friend").map((f) => f.studentId), [friendsList]);
  const onlineFriends = useOnlineFriends(student?.studentId ?? null, friendIds, hubV2 && !preview && !visitId);
  // A friend's battle invite pops up while you're in the hub (checked every 10 seconds).
  useEffect(() => {
    if (!hubV2 || preview || visitId || !student?.studentId) return;
    const studentId = student.studentId;
    const check = () => void fetchBattles(studentId, false).then((list) => setBattleInvite(list.find((b) => !b.iChallenged && (b.status === "invited" || (b.status === "active" && b.myScore === null))) ?? null)).catch(() => undefined);
    check();
    const poll = window.setInterval(check, 10_000);
    return () => window.clearInterval(poll);
  }, [hubV2, preview, visitId, student?.studentId]);
  const startBattle = useCallback((play: BattleToPlay) => router.push(battleRoomHref(play, preview)), [router, preview]);
  const goHome = () => {
    if (visiting && friendWorld && !visitOver) void endVisit(student?.studentId ?? null, preview, friendWorld.visitId).catch(() => undefined);
    router.push(preview ? "/world?teacher_preview=1" : "/world");
  };

  // Knock to come in. Visitor: knock on a friend's door from the Friends panel and wait to be let in.
  const [knockingFriend, setKnockingFriend] = useState<Friend | null>(null);
  // Owner, in their own hub: say "I'm here" so friends can knock, answer knocks, and look after visitors.
  const studentId = student?.studentId ?? null;
  const host = useHostVisits(studentId, preview, hubV2 && !visiting && (preview || Boolean(studentId)));
  const [hostBusy, setHostBusy] = useState(false);
  // Everyone in this world sees each other's explorers: the owner's world while visiting, else my own.
  const poseRef = useRef<ExplorerPose>({ ...NO_POSE });
  const myAppearance = useCanonicalAvatarAppearance(studentId);
  const me = useMemo(() => (studentId && myAppearance ? { id: studentId, name: student?.displayName?.split(" ")[0] || "Explorer", outfit: myAppearance } : null), [studentId, myAppearance, student?.displayName]);
  const onWorldNudge = useRef<(nudge: WorldNudge) => void>(() => undefined);
  const together = useWorldTogether({
    worldId: visiting ? visitId : studentId, me, poseRef, onNudge: (nudge) => onWorldNudge.current(nudge),
    enabled: hubV2 && !preview && (visiting ? Boolean(friendWorld) : true),
  });
  // Demo and teacher preview: the pretend friend you let in (or are visiting) walks around near you.
  const demoMate = useMemo<WorldMate | null>(() => {
    if (!preview) return null;
    if (visiting) return friendWorld ? { id: `demo-${friendWorld.name}`, name: friendWorld.name, outfit: friendLook(friendWorld.outfit) } : null;
    const guest = host.visitors[0];
    return guest ? { id: guest.studentId, name: guest.name, outfit: friendLook(guest.outfit ?? friendsList.find((f) => f.studentId === guest.studentId)?.outfit) } : null;
  }, [preview, visiting, friendWorld, host.visitors, friendsList]);
  useDemoMate(demoMate, poseRef, together.poses);
  const worldMates = preview ? (demoMate ? [demoMate] : []) : together.mates;
  const hostAct = (job: () => Promise<unknown>) => {
    setHostBusy(true);
    void job().catch(() => setEconomyMessage("That didn't work just now. Try again in a moment.")).finally(() => {
      setHostBusy(false);
      // Tell the visitor straight away (they also check every few seconds).
      together.nudge("answer");
      host.refresh();
    });
  };
  const answerDoor = (guest: VisitGuest, answer: KnockAnswer) => hostAct(() => answerKnock(studentId, preview, guest.visitId, answer));
  // Visitor: still let in? (every 15 seconds, and at once when the owner answers or switches LOOK/BUILD)
  const stopBuilding = useRef<() => void>(() => undefined);
  const checkVisit = useCallback(() => {
    if (!friendWorld || visitOver) return;
    void visitStatus(studentId, preview, friendWorld.visitId).then((status) => {
      if (status.status !== "inside") { stopBuilding.current(); setVisitOver(`${friendWorld.name} had to go, so you're heading home.`); return; }
      if (status.canBuild !== friendWorld.canBuild) {
        if (!status.canBuild) stopBuilding.current();
        setFriendWorld((world) => (world ? { ...world, canBuild: status.canBuild } : world));
      }
    }).catch(() => undefined);
  }, [friendWorld, visitOver, studentId, preview]);
  useEffect(() => {
    if (!visiting || !friendWorld || visitOver) return;
    const beat = window.setInterval(checkVisit, VISIT_HEARTBEAT_MS);
    return () => window.clearInterval(beat);
  }, [visiting, friendWorld, visitOver, checkVisit]);
  useEffect(() => {
    if (!visitOver) return;
    const leave = window.setTimeout(() => router.push(preview ? "/world?teacher_preview=1" : "/world"), 4_000);
    return () => window.clearTimeout(leave);
  }, [visitOver, router, preview]);
  // Builds show up for everyone in the world: after a save, nudge; on a nudge, load the latest.
  const nudgeWorld = together.nudge;
  useEffect(() => onWorldSaved((scope) => { if (scope === placementScope) nudgeWorld("layout"); }), [placementScope, nudgeWorld]);
  useEffect(() => {
    onWorldNudge.current = (nudge) => {
      if (nudge === "knock" && !visiting) host.refresh();
      else if (nudge === "answer" && visiting) checkVisit();
      else if (nudge === "layout") {
        if (visiting) loadFriendWorld();
        else if (studentId && !hasPendingWorldLayoutSave(placementScope)) void fetchServerWorldLayout(studentId).then((layout) => { if (layout && !hasPendingWorldLayoutSave(placementScope)) showLayout(layout); }).catch(() => undefined);
      }
    };
  });
  // Back home: what friends changed while you were away, to keep or undo.
  const [visitorChanges, setVisitorChanges] = useState<VisitorChange[]>([]);
  const [resolvingChange, setResolvingChange] = useState(false);
  // Checked again whenever a visitor leaves, so KEEP IT / UNDO shows once they've gone.
  const visitorCount = host.visitors.length;
  useEffect(() => {
    if (visitId || preview || !student?.studentId || visitorCount > 0) return;
    let cancelled = false;
    void fetchVisitorChanges(student.studentId, false).then((changes) => { if (!cancelled) setVisitorChanges(changes); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [visitId, preview, student?.studentId, visitorCount]);
  async function resolveChange(undo: boolean) {
    const change = visitorChanges[0];
    if (!change || !student?.studentId) return;
    setResolvingChange(true);
    try {
      if (undo) {
        const reverted = undoFriendChanges({ placements: placedCustomisations, groundTiles },
          { placements: change.beforePlacements, groundTiles: change.beforeGroundTiles },
          { placements: change.afterPlacements, groundTiles: change.afterGroundTiles });
        setPlacedCustomisations(reverted.placements);
        setGroundTiles(reverted.groundTiles);
        writeCentralWorldPlacements(placementScope, reverted.placements);
        writeCentralWorldGroundTiles(placementScope, reverted.groundTiles);
      }
      await resolveVisitorChange(student.studentId, change.id);
      setVisitorChanges((current) => current.slice(1));
    } catch {
      setEconomyMessage("That didn't work just now. Try again in a moment.");
    }
    setResolvingChange(false);
  }
  const [editorOpen, setEditorOpen] = useState(false);
  // Building: carry an item and it goes in front of the explorer, or plan from above (the same
  // bar and buttons). Planning opens from the builder and Walk comes back.
  const [walkBuild, setWalkBuild] = useState(false);
  const walking = walkBuild && !editorOpen;
  const [brushOn, setBrushOn] = useState(false);
  const [hotbar, setHotbar] = useState(() => readHotbar(placementScope));
  // Where the camera looks: held items sit ahead of the explorer that way, so they
  // stay put when the explorer turns to walk sideways.
  const aimRef = useRef(Math.PI);
  // "More" opens the picker: every category, over whichever view is building.
  const [pickerOpen, setPickerOpen] = useState(false);
  // The item just put down lands with a bounce.
  const [justPlacedId, setJustPlacedId] = useState<string | null>(null);
  // Where it went: while walking, the next one in hand stays hidden until the explorer moves on.
  const [lastPlacedCell, setLastPlacedCell] = useState<{ gridX: number; gridZ: number } | null>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const resetCancel = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  // Arrow buttons are an option for learners who prefer them to gestures.
  const [arrowControls, setArrowControls] = useState(() => { try { return localStorage.getItem(ARROW_CONTROLS_KEY) === "1"; } catch { return false; } });
  const touchFirst = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);
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
  const [buildOrbit, setBuildOrbit] = useState({ yaw: 0.67, pitch: BUILD_VIEWS.normal.pitch });
  const orbitCamera = useCallback((dYaw: number, dPitch: number) => {
    setBuildOrbit((o) => ({ yaw: o.yaw + dYaw, pitch: THREE.MathUtils.clamp(o.pitch + dPitch, BUILD_PITCH.min, BUILD_PITCH.max) }));
  }, [setBuildOrbit]);
  const [buildZoom, setBuildZoom] = useState(BUILD_VIEWS.normal.zoom);
  const viewRef = useRef({ zoom: buildZoom, yaw: buildOrbit.yaw, pitch: buildOrbit.pitch });
  useEffect(() => { viewRef.current = { zoom: buildZoom, yaw: buildOrbit.yaw, pitch: buildOrbit.pitch }; }, [buildZoom, buildOrbit]);
  const zoomView = useCallback((factor: number) => setBuildZoom((z) => THREE.MathUtils.clamp(z * factor, BUILD_ZOOM.min, BUILD_ZOOM.max)), []);
  const setBuildView = useCallback((view: BuildView) => {
    setBuildOrbit((o) => ({ ...o, pitch: BUILD_VIEWS[view].pitch }));
    setBuildZoom(BUILD_VIEWS[view].zoom);
  }, []);
  // Picking something up from low down lifts the view so its squares show.
  const liftViewForPlacing = useCallback(() => {
    if (viewRef.current.pitch < BUILD_VIEWS.normal.pitch - 0.06) setBuildView("normal");
  }, [setBuildView]);
  // Whether an item is in hand, mirrored to a ref so stable handlers can branch
  // without re-binding every render.
  const heldRef = useRef(false);
  // The held item sits in the middle of the view, so moving the view moves it.
  const focusRef = useRef(cameraFocus);
  useEffect(() => { focusRef.current = cameraFocus; }, [cameraFocus]);
  const moveFocus = useCallback((next: { gridX: number; gridZ: number }) => {
    focusRef.current = next;
    setCameraFocus(next);
    if (!heldRef.current) return;
    const cell = { gridX: Math.round(next.gridX), gridZ: Math.round(next.gridZ) };
    setEditCursor(cell);
    setBuildPlacement((held) => (held && (held.gridX !== cell.gridX || held.gridZ !== cell.gridZ) ? { ...held, ...cell } : held));
  }, []);
  // Drag the ground and it follows your finger: turn screen pixels into grid
  // cells along the camera's current heading.
  const panView = useCallback((dxPx: number, dyPx: number) => {
    const height = canvasWrapRef.current?.clientHeight || window.innerHeight;
    const { zoom, yaw, pitch } = viewRef.current;
    const k = (2 * zoom * 1.2 * Math.tan(Math.PI / 6)) / height / buildGrid.cellSize;
    const depth = k / Math.max(0.35, Math.sin(pitch));
    const right = { x: Math.cos(yaw), z: -Math.sin(yaw) };
    const forward = { x: -Math.sin(yaw), z: -Math.cos(yaw) };
    const f = focusRef.current;
    moveFocus({
      gridX: THREE.MathUtils.clamp(f.gridX - right.x * dxPx * k + forward.x * dyPx * depth, buildGrid.minX, buildGrid.maxX),
      gridZ: THREE.MathUtils.clamp(f.gridZ - right.z * dxPx * k + forward.z * dyPx * depth, buildGrid.minZ, buildGrid.maxZ),
    });
  }, [buildGrid, moveFocus]);
  const strokeState = useRef({active:false,recorded:false});
  const [editHistory, setEditHistory] = useState<Array<{ placements: CentralWorldPlacement[]; tiles: CentralWorldGroundTile[] }>>([]);
  const [economyMessage, setEconomyMessage] = useState<string | null>(null);
  const [upgradingHome, setUpgradingHome] = useState(false);
  const homeWorld = useMemo(() => ({ levels: premiumHomeLevels(ownedItemKeys), night, towerShield: ownedItemKeys.has(premiumHomeItemKey("tower_shield")) }), [ownedItemKeys, night]);
  // Upgrades are XP purchases checked by the server; every copy of the style shows the new level.
  // In-world upgrades are XP purchases checked by the server.
  async function buyWorldUpgrade(itemKey: string, success: string) {
    if (upgradingHome || (!preview && !student?.studentId)) return;
    setUpgradingHome(true);
    try {
      const state = await purchaseEconomyItem(student?.studentId ?? "demo-preview", itemKey, CENTRAL_WORLD_SHOP_ROWS, preview);
      setOwnedItemKeys(new Set(state.inventory.map((entry) => entry.item_key)));
      setEconomyMessage(success);
    } catch (error) {
      setEconomyMessage(economyErrorMessage(error));
    } finally {
      setUpgradingHome(false);
    }
  }
  // Every copy of a premium style shows its new level.
  function upgradeHome(style: PremiumHomeStyle) {
    const next = nextPremiumHomeUpgrade(style, ownedItemKeys);
    if (next) void buyWorldUpgrade(next.itemKey, `${PREMIUM_HOME_SPECS[style].name} upgraded to Level ${next.level}: ${next.name}!`);
  }
  const skateLevel = buildKitLevel(SKATE_KIT, ownedItemKeys);
  const raceLevel = buildKitLevel(RACE_KIT, ownedItemKeys);
  const skateKitWorld = useMemo(() => ({ level: skateLevel, night }), [skateLevel, night]);
  const raceKitWorld = useMemo(() => ({ level: raceLevel, night }), [raceLevel, night]);
  function upgradeKit(kit: BuildKit) {
    const next = nextBuildKitUpgrade(kit, ownedItemKeys);
    if (next) void buyWorldUpgrade(next.itemKey, `${kit.name} upgraded to Level ${next.level}: ${next.name}! New pieces are in the ${kit.tab} tab.`);
  }
  const historyRef = useRef(editHistory);
  useEffect(() => { historyRef.current = editHistory; }, [editHistory]);
  // Every placed start line is somewhere to race from.
  const raceItems = useMemo(() => placedCustomisations.flatMap((placement): PlacedRaceItem[] => {
    const item = itemsById.get(placement.itemId);
    const assetKey = item?.metadata.worldAssetKey;
    if (!item || typeof assetKey !== "string" || !RACE_PIECE_KEYS.has(assetKey)) return [];
    // Race logic works from where the piece is drawn: the middle of its squares.
    const [x, , z] = placementCentre(placement, item);
    return [{ assetKey, gridX: x / buildGrid.cellSize, gridZ: z / buildGrid.cellSize, rotation: placement.rotation }];
  }), [placedCustomisations, itemsById, buildGrid.cellSize]);
  const raceStarts = useMemo(() => raceItems.filter((item) => item.assetKey === "race_start").map((item) => ({ id: `${RACE_TARGET_PREFIX}${item.gridX}:${item.gridZ}`, item })), [raceItems]);
  const [race, setRace] = useState<RaceSession | null>(null);
  const raceHud = useRef<RaceHudState>(newRaceHud(null));
  const nearRaceStart = raceStarts.find((start) => start.id === activeTargetId) ?? null;
  function startRace(start: PlacedRaceItem) {
    raceHud.current = newRaceHud(readRaceBest(placementScope));
    setRace((current) => ({ start, nonce: (current?.nonce ?? 0) + 1 }));
    void speak("Get ready. Three, two, one, go!", undefined, "manual", { rate: 1 });
  }
  function exitRace() {
    if (!race) return;
    const { x, z } = raceExitPosition(raceStartLine(race.start));
    setRace(null);
    teleport([x, CENTRAL_WORLD_CONFIG.spawnPoint[1], z]);
  }
  const saveRaceBest = useCallback((seconds: number) => {
    const best = readRaceBest(placementScope);
    if (best !== null && best <= seconds) return;
    try { window.localStorage.setItem(raceBestKey(placementScope), String(seconds)); } catch { /* the best lap just isn't kept */ }
  }, [placementScope]);
  // The kart garage: the kart and parts in use are equipped slots; realm karts need a finished level there.
  const [equipped, setEquipped] = useState<Record<string, string>>({});
  const [xpBalance, setXpBalance] = useState<number | null>(null);
  const [garageOpen, setGarageOpen] = useState(false);
  const [garageBusy, setGarageBusy] = useState(false);
  const [garageMessage, setGarageMessage] = useState<string | null>(null);
  const [finishedRealms, setFinishedRealms] = useState<Set<string> | null>(null);
  const kart = useMemo(() => kartSetup(equipped, ownedItemKeys), [equipped, ownedItemKeys]);
  function openGarage() {
    setGarageMessage(null);
    setGarageOpen(true);
    void fetchFinishedRealms(student?.studentId ?? null, preview).then(setFinishedRealms).catch(() => setFinishedRealms(new Set()));
  }
  function closeGarage() {
    setGarageOpen(false);
    if (race) startRace(race.start);
  }
  async function garageStep(run: (studentId: string) => Promise<EconomyState>, success: string) {
    if (garageBusy || (!preview && !student?.studentId)) return;
    setGarageBusy(true);
    try {
      const state = await run(student?.studentId ?? "demo-preview");
      setOwnedItemKeys(new Set(state.inventory.map((entry) => entry.item_key)));
      setEquipped(state.equipped);
      setXpBalance(state.wallet.xp_balance);
      setGarageMessage(success);
    } catch (error) {
      setGarageMessage(economyErrorMessage(error));
    } finally {
      setGarageBusy(false);
    }
  }
  const itemName = (itemKey: string) => itemsById.get(itemKey)?.name ?? CENTRAL_WORLD_SHOP_ROWS.find((item) => item.item_key === itemKey)?.name ?? "it";
  const garageActions: KartGarageActions = {
    // Buying fits it straight away.
    buy: (itemKey) => garageStep(async (id) => {
      await purchaseEconomyItem(id, itemKey, CENTRAL_WORLD_SHOP_ROWS, preview);
      return equipEconomyItem(id, itemKey, CENTRAL_WORLD_SHOP_ROWS, preview);
    }, `${itemName(itemKey)} is yours!`),
    equip: (itemKey) => garageStep((id) => equipEconomyItem(id, itemKey, CENTRAL_WORLD_SHOP_ROWS, preview), `${itemName(itemKey)} fitted.`),
    unequip: (slot) => garageStep(async (id) => {
      const state = await unequipEconomySlot(id, slot);
      // Demo's unequip reloads without the hub catalogue, so keep what the learner owns.
      return preview ? { ...state, inventory: Array.from(ownedItemKeys, (item_key) => ({ item_key, acquired_at: "", acquisition_type: "demo" })) } : state;
    }, "Done."),
  };
  // Basketball and the Sports set: stand on a court and tap Shoot, Kick or Serve; points add up for this visit.
  const courts = useMemo(() => placedCustomisations.flatMap((placement): CourtTarget[] => {
    const item = itemsById.get(placement.itemId);
    const style = premiumHomeStyle(item?.metadata.worldAssetKey);
    if (!item || !style) return [];
    const id = `${COURT_TARGET_PREFIX}${placement.placementId ?? `${placement.gridX}:${placement.gridZ}`}`;
    if (style === "basketball") {
      const court = courtInWorld(placement, homeWorld.levels.basketball, buildGrid.cellSize);
      return [{ id, kind: "basketball", court: { x: court.x, z: court.z, reach: court.reach, targets: court.hoops.map(([hx, hz]) => [hx, RIM_HEIGHT * COURT_SCALE, hz] as const) } }];
    }
    if (!(SPORT_KINDS as readonly string[]).includes(style)) return [];
    const kind = style as SportKind;
    const [x, , z] = placementCentre(placement, item);
    const plot = PREMIUM_HOME_SPECS[style].gridSize.split("x").map((n) => Number(n) * buildGrid.cellSize) as [number, number];
    return [{ id, kind, court: sportInWorld(kind, homeWorld.levels[style], [x, z], placement.rotation, plot) }];
  }), [placedCustomisations, itemsById, homeWorld.levels, buildGrid.cellSize]);
  const nearCourt = courts.find((court) => court.id === activeTargetId) ?? null;
  // Roads & Cars: every carport is somewhere to get in; the car parked there is the one you drive.
  const carports = useMemo(() => placedCustomisations.flatMap((placement): CarportTarget[] => {
    const item = itemsById.get(placement.itemId);
    if (item?.metadata.worldAssetKey !== CARPORT_ASSET_KEY) return [];
    const [x, , z] = placementCentre(placement, item);
    // The car parks facing the carport's +x; driving headings face +z.
    return [{ id: `${CARPORT_TARGET_PREFIX}${placement.placementId ?? `${placement.gridX}:${placement.gridZ}`}`, pose: { x, z, heading: Math.PI / 2 - (placement.rotation * Math.PI) / 180 } }];
  }).concat(hubV2 ? [{ id: `${CARPORT_TARGET_PREFIX}home`, pose: { x: HUB_V2_HOME_CARPORT.x, z: HUB_V2_HOME_CARPORT.z, heading: Math.PI / 2 } }] : []), [placedCustomisations, itemsById, hubV2]);
  const nearCarport = carports.find((carport) => carport.id === activeTargetId) ?? null;
  const [carChoice, setCarChoice] = useState(() => readCarChoice(placementScope));
  const carStyle = carToDrive(carChoice, ownedItemKeys);
  const [drive, setDrive] = useState<DriveSession | null>(null);
  const [boat, setBoat] = useState<BoatRide | null>(null);
  // Rex the maths T-rex: sent by a teacher or parent, or awake after 15 minutes in the hub.
  const rex = useRexVisit({ studentId: visitId ? null : student?.studentId ?? null, demo: preview && !visitId, active: hubV2 && !race && !drive && !boat && !visitId, wakeNow: preview && searchParams.get("rex") === "now" });
  const [lessonRoute, setLessonRoute] = useState<string | null>(null);
  useEffect(() => {
    if (rex.phase === "away" || lessonRoute) return;
    let cancelled = false;
    void resolveWorldJourney().then((journey) => { if (!cancelled) setLessonRoute(journey.route); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [rex.phase, lessonRoute]);
  // Tamed Rex goes home after a lesson: the explorer picks a realm and enters it like the Realms button.
  async function enterRealmForRex(realmId: CanonicalRealmId) {
    try {
      const result = await resolveTowerRealmEntry({ realmId, teacherPreview: preview });
      if (result.status === "unavailable") { setEconomyMessage(result.message); return; }
      rex.leaveForLesson();
      router.push(result.route);
    } catch {
      setEconomyMessage("That realm could not be opened. Please try again.");
    }
  }
  const carHud = useRef<CarHud>({ speed: 0, offRoad: false });
  const carPose = useRef<CarPose>({ x: 0, z: 0, heading: 0 });
  const carWorld = useMemo(() => ({ style: carStyle, colour: carChoice.colour, night, driving: Boolean(drive) }), [carStyle, carChoice.colour, night, drive]);
  function chooseCar(next: { style?: CarStyle; colour?: string }) {
    const choice = { style: next.style ?? carStyle, colour: next.colour ?? carChoice.colour };
    setCarChoice(choice);
    writeCarChoice(placementScope, choice);
    setDrive((current) => current ? { ...current, style: choice.style ?? current.style, colour: choice.colour } : current);
  }
  function startDrive(carport: CarportTarget) {
    if (!carStyle) {
      const text = "Unlock a car in the Marketplace's Cars tab, then come back to drive it.";
      setEconomyMessage(text);
      void speak(text, undefined, "manual", { rate: 0.9 });
      return;
    }
    carHud.current = { speed: 0, offRoad: false };
    carPose.current = carport.pose;
    setDrive((current) => ({ start: carport.pose, style: carStyle, colour: carChoice.colour, lights: night, nonce: (current?.nonce ?? 0) + 1 }));
    void speak(`${CAR_SPECS[carStyle].name}. Push the joystick to drive. Roads are fastest.`, undefined, "manual", { rate: 0.95 });
  }
  // Step out on the driver's side, wherever the car stopped.
  function exitDrive() {
    const { x, z, heading } = carPose.current;
    setDrive(null);
    teleport([x - Math.cos(heading) * 2.4, CENTRAL_WORLD_CONFIG.spawnPoint[1], z + Math.sin(heading) * 2.4], heading + Math.PI);
  }
  // Boats: wade into any water deep enough to float in and tap BOAT; EXIT BOAT lands on the nearest bank.
  const waterAreas = useMemo(() => buildWaterAreas(groundTiles, placedLakes(placedCustomisations, itemsById)), [groundTiles, placedCustomisations, itemsById]);
  const findBoatWater = useMemo(() => {
    const river = hubV2 ? { surfaceY: HUB_V2_WATER_Y, depthAt: hubWaterDepth } : null;
    return (x: number, z: number) => boatWaterAt(waterAreas, river, x, z);
  }, [waterAreas, hubV2]);
  const [boatChoice, setBoatChoice] = useState<BoatStyle | null>(null);
  const boatStyle = boatToRide(boatChoice, ownedItemKeys);
  const [onBoatWater, setOnBoatWater] = useState(false);
  useEffect(() => {
    if (!hubV2 || boat || drive || race) return;
    const check = window.setInterval(() => setOnBoatWater(findBoatWater(avatarPosRef.current.x, avatarPosRef.current.z) !== null), 300);
    return () => { window.clearInterval(check); setOnBoatWater(false); };
  }, [hubV2, boat, drive, race, findBoatWater]);
  function startBoat() {
    if (!boatStyle) {
      const text = "Unlock a boat in the Marketplace's Swimming & boats tab, then wade in and ride it.";
      setEconomyMessage(text);
      void speak(text, undefined, "manual", { rate: 0.9 });
      return;
    }
    const { x, z } = avatarPosRef.current;
    const pose = { x, z, heading: openWaterHeading((px, pz) => findBoatWater(px, pz) !== null, x, z, aimRef.current) };
    carHud.current = { speed: 0, offRoad: false };
    carPose.current = pose;
    setBoat((current) => ({ start: pose, style: boatStyle, nonce: (current?.nonce ?? 0) + 1 }));
    void speak(`${BOAT_SPECS[boatStyle].name}. Push the joystick to go. Boats stay on the water.`, undefined, "manual", { rate: 0.95 });
  }
  function exitBoat() {
    const { x, z, heading } = carPose.current;
    const dry = (px: number, pz: number) => waterReach(waterAreas, px, pz) === 0 && (!hubV2 || (hubWaterDepth(px, pz) === 0 && hubCanStand(px, pz)));
    const bank = nearestBank(dry, x, z) ?? { x, z };
    setBoat(null);
    teleport([bank.x, CENTRAL_WORLD_CONFIG.spawnPoint[1], bank.z], heading + Math.PI);
  }
  const [shot, setShot] = useState<ShotInFlight | null>(null);
  const [hoopScore, setHoopScore] = useState(0);
  const [shotMessage, setShotMessage] = useState<{ text: string; good: boolean } | null>(null);
  function shoot(court: CourtTarget) {
    if (shot) return;
    const { x, z } = avatarPosRef.current;
    const from = [x, court.kind === "soccer" || court.kind === "footy" ? 0.3 : 1.9, z] as const;
    if (court.kind === "basketball") {
      const hoop = nearestHoop(x, z, court.court.targets.map(([hx, , hz]) => [hx, hz] as const));
      if (hoop) setShot((current) => ({ id: (current?.id ?? 0) + 1, plan: planShot(from, hoop, Math.random()) }));
      return;
    }
    const target = chooseTarget(court.kind, x, z, court.court.targets);
    if (target) setShot((current) => ({ id: (current?.id ?? 0) + 1, plan: planSportShot(court.kind as SportKind, from, target, Math.random(), Math.random()) }));
  }
  const finishShot = useCallback((done: Shot | SportShot) => {
    setShot(null);
    if (done.makes) setHoopScore((score) => score + done.points);
    if ("sport" in done) { setShotMessage({ text: done.label, good: done.points > 0 }); return; }
    setShotMessage(done.makes ? { text: done.points === 3 ? "THREE! +3" : "SWISH! +2", good: true } : { text: "So close!", good: false });
  }, []);
  useEffect(() => {
    if (!shotMessage) return;
    const timer = window.setTimeout(() => setShotMessage(null), 1400);
    return () => window.clearTimeout(timer);
  }, [shotMessage]);
  const hasAvailableAction = !race && !drive && !boat && (onBoatWater || activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance || activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance || nearRaceStart !== null || nearCourt !== null || nearCarport !== null);
  const activeBuildItemKey = editorOpen || walkBuild ? selectedInventoryItemKey ?? selectedSceneryItemKey ?? null : null;
  const buildItem = activeBuildItemKey ? itemsById.get(activeBuildItemKey) ?? null : null;
  // Exclude the item currently in hand by its unique placementId (not itemId),
  // so moving one of several identical scenery items leaves the others intact.
  const heldPlacementId = buildPlacement?.placementId ?? null;
  const placementsWithoutBuildItem = heldPlacementId ? placedCustomisations.filter((placement) => placement.placementId !== heldPlacementId) : placedCustomisations;
  const buildProblem = buildItem && buildPlacement ? centralWorldPlacementProblem(buildPlacement, buildItem, placementsWithoutBuildItem, itemsById, groundTiles, buildRules) : null;
  const buildValid = Boolean(buildItem && buildPlacement) && buildProblem === null;
  const buildPreview = buildItem && buildPlacement ? { placement: buildPlacement, item: buildItem, valid: buildValid } : null;
  // Fences and walls are laid square by square (on foot: Place at each step; planning: drag a line).
  const heldLaysLine = Boolean(buildItem && CONNECTED_BOUNDARY_KEYS.has(String(buildItem.metadata.worldAssetKey)));
  // Just laid a piece of line: the next one waits until the explorer steps on (other items move to the next spot that fits).
  const restingOnPlaced = walking && heldLaysLine && Boolean(buildPlacement && lastPlacedCell && buildPlacement.gridX === lastPlacedCell.gridX && buildPlacement.gridZ === lastPlacedCell.gridZ);
  const heldItemKey = selectedInventoryItemKey ?? selectedSceneryItemKey;
  const isGroundTool = !heldItemKey && (editTool === "path" || editTool === "road" || editTool === "stone" || editTool === "water" || (editTool === "track" && raceLevel > 0));
  const isEraseTool = !heldItemKey && editTool === "erase";
  const isMoveTool = !heldItemKey && editTool === "move";
  // Fences and walls are laid in a line under the finger; everything else is
  // moved into place and then placed with the Place button.
  const laysLine = editorOpen && heldLaysLine;
  const paintMode = editorOpen && (isGroundTool || isEraseTool || laysLine);
  // A placed item the builder tapped with Move, waiting for Move, Turn or Put away.
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const selectedPlacement = editorOpen && !buildPlacement && selectedPlacementId ? placedCustomisations.find((placement) => placement.placementId === selectedPlacementId) ?? null : null;
  const selectedItem = selectedPlacement ? itemsById.get(selectedPlacement.itemId) ?? null : null;
  const [buildNotice, setBuildNotice] = useState<string | null>(null);
  const groundPreview: { tile: CentralWorldGroundTile; valid: boolean; cells?: {gridX:number;gridZ:number;valid:boolean}[] } | null = (editorOpen || walking) && (isGroundTool || isEraseTool) ? {
    cells: isGroundTool && editTool === "water" ? waterBrushCells(editCursor.gridX, editCursor.gridZ, waterBrushWidth).map(cell => ({...cell, valid: validateCentralWorldGroundCell(cell.gridX, cell.gridZ, placedCustomisations, "water", buildRules)})) : undefined,
    tile: { ...editCursor, tileType: isGroundTool ? editTool : groundTiles.find((tile) => tile.gridX === editCursor.gridX && tile.gridZ === editCursor.gridZ)?.tileType ?? "stone" },
    valid: editTool !== "erase" && validateCentralWorldGroundCell(editCursor.gridX, editCursor.gridZ, placedCustomisations, isGroundTool ? editTool : undefined, buildRules),
  } : null;
  const ownedWorldItems = useMemo(() => Array.from(ownedItemKeys)
    .map((itemKey) => itemsById.get(itemKey))
    // The Tower Shield is never placed (it stands round the Tower), and boats are ridden, not placed.
    .filter((item): item is EconomyItem => Boolean(item && ["buildings", "animals", "pools_play", "special", "trains", "defence", "city_life", "main_street", "sports", "water"].includes(String(item.metadata.marketplaceCategory)) && item.metadata.premiumFixed !== true && !item.metadata.boatStyle))
    .sort((a, b) => a.sort_order - b.sort_order), [itemsById, ownedItemKeys]);

  // The walk-build hotbar: free scenery the learner's kits allow, their owned items, and ground brushes.
  const sceneryByKey = useMemo(() => new Map(CENTRAL_WORLD_STARTER_SCENERY.map((item) => [item.item_key, item])), []);
  const ownedWorldKeys = useMemo(() => new Set(ownedWorldItems.map((item) => item.item_key)), [ownedWorldItems]);
  function hotbarItem(entry: HotbarEntry): EconomyItem | null {
    const scenery = sceneryByKey.get(entry);
    if (scenery) {
      const group = scenery.metadata.worldSceneryGroup;
      const kitLevel = group === "skate" ? skateLevel : group === "race" ? raceLevel : null;
      return scenery.metadata.worldAssetKey === "rail_train" || (kitLevel !== null && Number(scenery.metadata.kitPieceLevel) > kitLevel) ? null : scenery;
    }
    return ownedWorldKeys.has(entry) ? itemsById.get(entry) ?? null : null;
  }
  const walkSlots: WalkBuildSlot[] = walkBuild
    ? hotbarSlots(hotbar, HOTBAR_STARTERS, (entry) => {
      const tool = hotbarToolOf(entry);
      return tool ? tool !== "track" || raceLevel > 0 : hotbarItem(entry) !== null;
    }).map((entry) => {
      const tool = hotbarToolOf(entry);
      if (tool) return { entry, name: EDIT_TOOL_NAMES[tool], art: <GroundSwatch tool={tool} /> };
      const item = hotbarItem(entry)!;
      return { entry, name: item.name, art: <HeldItemArt item={item} /> };
    })
    : [];
  // Walking with the eraser: whatever stands on the square in front, else the ground tile there.
  const facedPlacement = walking && isEraseTool ? placementAt(editCursor.gridX, editCursor.gridZ) : null;
  const eraseTarget = facedPlacement && !(hubV2 && facedPlacement.itemId === CENTRAL_WORLD_HOME_KEY) ? facedPlacement : null;
  const eraseItem = eraseTarget ? itemsById.get(eraseTarget.itemId) ?? null : null;
  const eraseTile = walking && isEraseTool && !eraseTarget ? groundTiles.find((tile) => tile.gridX === editCursor.gridX && tile.gridZ === editCursor.gridZ) ?? null : null;

  useEffect(() => {
    let cancelled = false;
    const request = preview
      ? fetchDemoEconomy(CENTRAL_WORLD_SHOP_ROWS)
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
        // Visiting a friend, their items count (set when their world loads), not yours.
        if (!visitId || preview) setOwnedItemKeys(ownedKeys);
        setEquipped(merged.equipped);
        setXpBalance(merged.wallet.xp_balance);

        if (requestedBuildItemKey && nextItemsById.has(requestedBuildItemKey) && ownedKeys.has(requestedBuildItemKey)) {
          const requestedItem = nextItemsById.get(requestedBuildItemKey)!;
          const nextBuildPlacement = selectCentralWorldInventoryPlacement(requestedItem, nextPlacements, { gridX: -5, gridZ: 5 });
          const size = itemGroundSize(requestedItem);
          const cell = { gridX: nextBuildPlacement.gridX, gridZ: nextBuildPlacement.gridZ };
          setSelectedInventoryItemKey(requestedBuildItemKey);
          setBuildPlacement(nextBuildPlacement);
          setEditCursor(cell);
          setWalkBuild(true);
          const [standX, standZ] = standBehind(cell.gridX, cell.gridZ, size, buildGrid.cellSize);
          setSpawnTarget([standX, 0.75, standZ]);
          setSpawnYaw(0);
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
  }, [placementScope, preview, requestedBuildItemKey, student?.studentId, buildGrid.cellSize, visitId]);

  // Pan the build camera/cursor by whole cells. The avatar stays put — panning no
  // longer teleports it to follow the cursor — and the cursor is clamped to the
  // grid. Stable identity so the keyboard listener can depend on it.
  useEffect(() => { heldRef.current = Boolean(buildPlacement); }, [buildPlacement]);

  // The arrows / WASD / on-screen arrows do double duty (and the avatar never
  // moves — its own movement is disabled and it's hidden while editing):
  //   • holding an item  → move that item around the grid, one cell at a time
  //   • nothing in hand  → pan the camera to look around the world
  const moveBuildPlacement = useCallback((dx: number, dz: number) => {
    const cx = (v: number) => THREE.MathUtils.clamp(v, buildGrid.minX, buildGrid.maxX);
    const cz = (v: number) => THREE.MathUtils.clamp(v, buildGrid.minZ, buildGrid.maxZ);
    if (heldRef.current) {
      // Move the item AND carry the camera with it, so you can walk it to a new
      // spot anywhere on the map and drop it there.
      setEditCursor((cur) => ({ gridX: cx(cur.gridX + dx), gridZ: cz(cur.gridZ + dz) }));
      setBuildPlacement((bp) => (bp ? { ...bp, gridX: cx(bp.gridX + dx), gridZ: cz(bp.gridZ + dz) } : bp));
      setCameraFocus((f) => ({ gridX: cx(Math.round(f.gridX) + dx), gridZ: cz(Math.round(f.gridZ) + dz) }));
    } else {
      setCameraFocus((f) => ({ gridX: cx(f.gridX + dx * 2), gridZ: cz(f.gridZ + dz * 2) }));
    }
  }, [setEditCursor, setBuildPlacement, setCameraFocus, buildGrid]);


  const rotateHeld = useCallback(() => {
    setBuildPlacement((current) => (current ? { ...current, rotation: ((current.rotation + 90) % 360) as CentralWorldPlacement["rotation"] } : current));
  }, [setBuildPlacement]);

  // Laptop keys while building. Arrows / WASD move the held item, or the view
  // when nothing is held. Swallowed so they neither scroll the page nor walk the avatar.
  //   R turn item · Q/E turn view · +/- zoom · Delete remove item · Esc put it down
  //   M move tool · X erase · Ctrl/Cmd+Z undo
  const inBuildMode = editorOpen;
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

  function setStrokeActive(active:boolean) {
    strokeState.current={active,recorded:false};
  }
  function recordWorldEdit() {
    if(strokeState.current.active&&strokeState.current.recorded)return;
    strokeState.current.recorded=true;
    setEditHistory(current=>[...current,{placements:placedCustomisations,tiles:groundTiles}].slice(-30));
  }

  function closeWorldEditor() {
    setStrokeActive(false);
    setMenuOpen(false);
    setEditorOpen(false);
    setPickerOpen(false);
    setBuildPlacement(null);
    setSelectedPlacementId(null);
  }
  // Visiting: when the owner switches you back to LOOK (or the visit ends), building stops.
  useEffect(() => { stopBuilding.current = () => { stopWalkBuild(); closeWorldEditor(); }; });

  // ---- Building: on foot, or planning from above, with the same bar ----
  function rememberPick(entry: HotbarEntry) {
    const next = rememberHotbarEntry(hotbar, entry);
    setHotbar(next);
    writeHotbar(placementScope, next);
  }
  function pinEntry(entry: HotbarEntry) {
    const next = togglePin(hotbar, entry);
    if (next === hotbar) { buildSounds.blocked(); void speak(`Your favourites are full. Take one away first: tap its star.`, undefined, "manual", { rate: 0.9 }); return; }
    setHotbar(next);
    writeHotbar(placementScope, next);
    void speak(next.pins.includes(entry) ? "Added to your favourites." : "Taken out of your favourites.", undefined, "manual", { rate: 0.9 });
  }
  function speakPick(item: EconomyItem) {
    const line = CONNECTED_BOUNDARY_KEYS.has(String(item.metadata.worldAssetKey));
    void speak(editorOpen
      ? line ? `${item.name}. Drag along the ground to build a line.` : `${item.name}. Drag the ground to move it, then press Place.`
      : line ? `${item.name}. Press Place at each step and it joins up as you walk.` : `${item.name}. Walk to where it should go, then press Place.`, undefined, "manual", { rate: 0.9 });
  }
  function stopBrush() {
    if (!brushOn) return;
    setBrushOn(false);
    setStrokeActive(false);
  }
  const avatarCell = () => footCell(avatarPosRef.current.x, avatarPosRef.current.z, buildGrid.cellSize);
  const facingCell = (size: [number, number]) => frontCell(avatarPosRef.current.x, avatarPosRef.current.z, aimRef.current, size, buildGrid.cellSize);

  // Where a held item can go: the nearest spot that fits, so it shows green instead of making kids hunt.
  const fitsAt = (placement: CentralWorldPlacement, item: EconomyItem, others: CentralWorldPlacement[]) =>
    centralWorldPlacementProblem(placement, item, others, itemsById, groundTiles, buildRules) === null;
  function fitNear(placement: CentralWorldPlacement, item: EconomyItem, reach: number, others = placementsWithoutBuildItem): CentralWorldPlacement | null {
    const cell = nearestFit(placement, (at) => fitsAt({ ...placement, ...at }, item, others), reach);
    return cell ? { ...placement, ...cell } : null;
  }

  function startWalkBuild() {
    setSelectedPlacementId(null);
    setBuildNotice(null);
    setWalkBuild(true);
    void speak("Build. Pick something from the bar, walk to where it should go, then press Place.", undefined, "manual", { rate: 0.9 });
  }
  function stopWalkBuild() {
    stopBrush();
    setPickerOpen(false);
    setWalkBuild(false);
    setBuildPlacement(null);
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(null);
    setEditTool("move");
    if (requestedBuildItemKey) router.replace(preview ? "/world?teacher_preview=1" : "/world");
  }
  function finishBuilding() {
    stopWalkBuild();
    closeWorldEditor();
  }
  // Plan from above: the view opens on the held item (or the explorer); Walk comes back.
  function planFromWalk() {
    stopBrush();
    const at = buildPlacement ? { gridX: buildPlacement.gridX, gridZ: buildPlacement.gridZ } : avatarCell();
    setCameraFocus(at);
    setEditCursor(at);
    setSelectedPlacementId(null);
    setBuildView("normal");
    setMenuOpen(false);
    setEditorOpen(true);
    void speak("Plan view. Drag the ground to look around. Tap something you've built to move or turn it. Press Walk to build on foot again.", undefined, "manual", { rate: 0.9 });
  }
  // Back to walking with whatever is in hand, standing just behind it.
  function walkFromPlanner() {
    setStrokeActive(false);
    setMenuOpen(false);
    setSelectedPlacementId(null);
    setEditorOpen(false);
    setWalkBuild(true);
    if (!buildPlacement || !buildItem) return;
    const [x, z] = standBehind(buildPlacement.gridX, buildPlacement.gridZ, itemGroundSize(buildItem, buildPlacement.rotation), buildGrid.cellSize);
    if (!hubV2 || hubCanStand(x, z)) teleport([x, CENTRAL_WORLD_CONFIG.spawnPoint[1], z], 0);
    speakPick(buildItem);
  }
  function openPicker() {
    stopBrush();
    setPickerOpen(true);
    void speak("Choose something to build.", undefined, "manual", { rate: 0.9 });
  }
  /** Something chosen in the picker goes in hand and the picker closes. */
  function pickFromPicker(choose: () => void) {
    setPickerOpen(false);
    choose();
  }
  function holdItem(item: EconomyItem) {
    buildSounds.pick();
    const size = itemGroundSize(item);
    const start = editorOpen ? focusCell() : facingCell(size);
    // Start where it fits (lines start right there, since they're laid square by square).
    const draft: CentralWorldPlacement = { placementId: newWorldPlacementId(item.item_key), itemId: item.item_key, ...start, rotation: 0 };
    const fitted = CONNECTED_BOUNDARY_KEYS.has(String(item.metadata.worldAssetKey)) ? null : fitNear(draft, item, editorOpen ? PLAN_FIT_REACH : walkFitReach(size), placedCustomisations);
    const at = fitted ? { gridX: fitted.gridX, gridZ: fitted.gridZ } : start;
    if (sceneryByKey.has(item.item_key)) chooseSceneryItem(item, at);
    else chooseInventoryItem(item, at);
  }
  function holdBrush(tool: WorldEditTool) {
    chooseEditTool(tool, true);
    setEditCursor(editorOpen ? focusCell() : avatarCell());
    void speak(editorOpen ? `${EDIT_TOOL_NAMES[tool]}. Tap or drag the ground to paint it.` : `${EDIT_TOOL_NAMES[tool]} brush. Press Paint, then walk to lay it.`, undefined, "manual", { rate: 0.9 });
  }
  function pickHotbar(entry: HotbarEntry) {
    const tool = hotbarToolOf(entry);
    if (tool) {
      if (!heldItemKey && editTool === tool) { chooseEditTool("move", true); return; }
      holdBrush(tool);
      return;
    }
    // Tapping what you hold puts it down.
    if (heldItemKey === entry) { chooseEditTool("move", true); return; }
    const item = hotbarItem(entry);
    if (item) holdItem(item);
  }
  function toggleBrush() {
    if (brushOn) { stopBrush(); void speak("Stopped painting.", undefined, "manual", { rate: 0.9 }); return; }
    const cell = avatarCell();
    setBrushOn(true);
    setStrokeActive(true);
    setEditCursor(cell);
    applyGroundAt(cell.gridX, cell.gridZ);
    void speak(`Painting ${EDIT_TOOL_NAMES[editTool].toLowerCase()}. Walk to lay it.`, undefined, "manual", { rate: 0.9 });
  }
  function toggleErase() {
    if (isEraseTool) { chooseEditTool("move", true); return; }
    chooseEditTool("erase", true);
    if (editorOpen) { void speak("Eraser. Tap something to remove it.", undefined, "manual", { rate: 0.9 }); return; }
    setEditCursor(facingCell([1, 1]));
    void speak("Eraser. Face something and press Remove.", undefined, "manual", { rate: 0.9 });
  }
  /** Place: right where it is if it fits, else on the nearest spot close by that does. */
  function placeOrSlide(placement: CentralWorldPlacement | null = buildPlacement) {
    if (!placement || !buildItem) return;
    const problem = centralWorldPlacementProblem(placement, buildItem, placementsWithoutBuildItem, itemsById, groundTiles, buildRules);
    if (!problem) { commitPlacement(placement); return; }
    const near = heldLaysLine ? null : fitNear(placement, buildItem, SLIDE_REACH);
    if (near) { commitPlacement(near); return; }
    buildSounds.blocked();
    void speak(PLACEMENT_PROBLEM_TEXT[problem], undefined, "manual", { rate: 0.9 });
  }
  // Tapping the ground near the explorer builds right there: places what's held, paints, or erases.
  function walkTap(gridX: number, gridZ: number) {
    const foot = avatarCell();
    if (Math.max(Math.abs(gridX - foot.gridX), Math.abs(gridZ - foot.gridZ)) > WALK_TAP_REACH) {
      if (buildPlacement || isGroundTool || isEraseTool) { buildSounds.blocked(); void speak("Walk closer to build there.", undefined, "manual", { rate: 0.9 }); }
      return;
    }
    if (buildPlacement && buildItem) { placeOrSlide({ ...buildPlacement, gridX, gridZ }); return; }
    if (isGroundTool) { applyGroundAt(gridX, gridZ); buildSounds.place(); return; }
    if (isEraseTool) applyGroundAt(gridX, gridZ, true);
  }
  function walkMain() {
    if (buildPlacement && buildItem) {
      if (!restingOnPlaced) placeOrSlide();
      return;
    }
    if (editorOpen) return;
    if (isGroundTool) { toggleBrush(); return; }
    if (isEraseTool && (eraseTarget || eraseTile)) applyGroundAt(editCursor.gridX, editCursor.gridZ, true);
  }

  function chooseEditTool(tool: WorldEditTool, quiet = false) {
    stopBrush();
    setSelectedPlacementId(null);
    setBuildNotice(null);
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(null);
    setEditTool(tool);
    if (tool === "water") setWaterBrushWidth(1);
    if (isGroundBrush(tool)) {
      rememberPick(hotbarTool(tool));
      // "More" was choosing a brush to carry: back to walking with it.
    }
    setBuildPlacement(null);
    if (quiet) return;
    void speak(
      tool === "move"
        ? "Move selected. Tap anything you have placed to move it, turn it or put it away."
        : tool === "erase"
          ? "Eraser selected. Tap an item to remove it, or tap the ground to remove one square of water, path or road."
          : tool === "water"
            ? "Water tiles selected. Tap to place one square of water. Drag to join squares into a river or lake."
            : `${EDIT_TOOL_NAMES[tool]} selected. Tap or drag across the grass to paint it.`,
      undefined,
      "manual",
      { rate: 0.9 },
    );
  }

  function chooseSceneryItem(item: EconomyItem, at: { gridX: number; gridZ: number }) {
    stopBrush();
    rememberPick(item.item_key);
    setSelectedInventoryItemKey(null);
    setSelectedSceneryItemKey(item.item_key);
    setEditTool("scenery");

    setSelectedPlacementId(null);
    setBuildNotice(null);
    setBuildPlacement({ placementId: newWorldPlacementId(item.item_key), itemId: item.item_key, ...at, rotation: 0 });
    liftViewForPlacing();
    speakPick(item);
  }

  function setHeldTint(tint: string | undefined) {
    setBuildPlacement((current) => (current ? { ...current, tint } : current));
  }

  function chooseInventoryItem(item: EconomyItem, at: { gridX: number; gridZ: number }) {
    stopBrush();
    rememberPick(item.item_key);
    setSelectedSceneryItemKey(null);
    setSelectedInventoryItemKey(item.item_key);
    setSelectedPlacementId(null);
    setBuildNotice(null);
    const held = selectCentralWorldInventoryPlacement(item, placedCustomisations, at);
    setBuildPlacement(held);
    // An item already in the world is picked up where it stands; bring the view to it.
    moveFocus({ gridX: held.gridX, gridZ: held.gridZ });
    liftViewForPlacing();
    if (isTrainAsset(item.metadata.worldAssetKey)) void speak(`${item.name}. Move it onto an empty railway track, then press Place. The train follows the track direction.`, undefined, "manual", { rate: 0.9 });
    else speakPick(item);
  }

  // The placed item under a tap. Big trees overlap their neighbours, so the one
  // standing closest to the tapped square wins (the newest on a tie).
  function placementAt(gridX: number, gridZ: number): CentralWorldPlacement | null {
    let best: CentralWorldPlacement | null = null;
    let bestDistance = Infinity;
    for (const placement of placedCustomisations) {
      const item = itemsById.get(placement.itemId);
      if (!item || !placementOccupiesCell(placement, item, gridX, gridZ)) continue;
      const distance = Math.hypot(placement.gridX - gridX, placement.gridZ - gridZ);
      if (distance <= bestDistance) { best = placement; bestDistance = distance; }
    }
    return best;
  }

  // Move tool: a tapped item shows Move / Turn / Put away. Move puts it in hand
  // (selecting its item hides it from the placed set while it's held).
  function selectPlacedAt(gridX: number, gridZ: number) {
    const hit = placementAt(gridX, gridZ);
    setBuildNotice(null);
    if (!hit || (hubV2 && hit.itemId === CENTRAL_WORLD_HOME_KEY)) { setSelectedPlacementId(null); return; }
    setSelectedPlacementId(hit.placementId ?? null);
    void speak(`${itemsById.get(hit.itemId)?.name ?? "Item"}. Move it, turn it or put it away.`, undefined, "manual", { rate: 0.9 });
  }

  function pickUpPlacement(hit: CentralWorldPlacement) {
    setSelectedPlacementId(null);
    if (hit.itemId === CENTRAL_WORLD_HOME_KEY) { moveMyHome(); return; }
    setSelectedSceneryItemKey(null);
    setSelectedInventoryItemKey(hit.itemId);
    setBuildPlacement({ ...hit, placementId: hit.placementId ?? newWorldPlacementId(hit.itemId) });
    setEditCursor({ gridX: hit.gridX, gridZ: hit.gridZ });
    moveFocus({ gridX: hit.gridX, gridZ: hit.gridZ });
    liftViewForPlacing();
    void speak(`${itemsById.get(hit.itemId)?.name ?? "Item"} picked up. Drag the ground to move it, then press Place.`, undefined, "manual", { rate: 0.9 });
  }

  function savePlacements(next: CentralWorldPlacement[]) {
    recordWorldEdit();
    writeCentralWorldPlacements(placementScope, next);
    setPlacedCustomisations(next);
  }

  function turnPlaced(placement: CentralWorldPlacement, item: EconomyItem) {
    const others = placedCustomisations.filter((other) => other !== placement);
    const turned = { ...placement, rotation: ((placement.rotation + 90) % 360) as CentralWorldPlacement["rotation"] };
    const problem = centralWorldPlacementProblem(turned, item, others, itemsById, groundTiles, buildRules);
    if (problem) {
      const text = `There isn't room to turn it here. ${PLACEMENT_PROBLEM_TEXT[problem]}`;
      setBuildNotice(text);
      void speak(text, undefined, "manual", { rate: 0.9 });
      return;
    }
    setBuildNotice(null);
    savePlacements(placedCustomisations.map((other) => (other === placement ? turned : other)));
  }

  function putAwayPlaced(placement: CentralWorldPlacement, item: EconomyItem) {
    savePlacements(placedCustomisations.filter((other) => other !== placement));
    setSelectedPlacementId(null);
    void speak(`${item.name} put away.`, undefined, "manual", { rate: 0.9 });
  }

  function moveMyHome() {
    setSelectedSceneryItemKey(null);
    setSelectedInventoryItemKey(CENTRAL_WORLD_HOME_KEY);
    setEditTool("move");
    setBuildPlacement({ ...homePlacement });
    setEditCursor({ gridX: homePlacement.gridX, gridZ: homePlacement.gridZ });
    setCameraFocus({ gridX: homePlacement.gridX, gridZ: homePlacement.gridZ });
    setMenuOpen(false);
    void speak("Move My Home. Drag the ground to move your house, or tap a clear space. Turn rotates the house. Green means the house and doorway fit. Place saves it. Cancel keeps your home where it was. Existing paths stay where they are; use Ground and Erase to redesign them.", undefined, "manual", { rate: 0.9 });
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
    void speak(`${buildItem.name} put away.`, undefined, "manual", { rate: 0.9 });
  }

  /** Puts the held item down at `placement` (already checked to fit). */
  function commitPlacement(placement: CentralWorldPlacement) {
    if (!buildItem) return;
    if (placement.itemId === CENTRAL_WORLD_HOME_KEY) { commitHomePlacement(placement); return; }
    recordWorldEdit();
    const next = [...placementsWithoutBuildItem, placement];
    writeCentralWorldPlacements(placementScope, next);
    setPlacedCustomisations(next);
    setJustPlacedId(placement.placementId ?? null);
    setLastPlacedCell({ gridX: placement.gridX, gridZ: placement.gridZ });
    buildSounds.place();
    void speak(`${buildItem.name} added.`, undefined, "manual", { rate: 0.9 });
    // A Marketplace "place it" link is used up once its item is down.
    if (placement.itemId === requestedBuildItemKey) router.replace(preview ? "/world?teacher_preview=1" : "/world");
    // Free scenery stays in hand for the next one (on the next spot that fits; on foot the walk tick
    // finds it, planning moves the view there); an owned item is placed once.
    if (selectedSceneryItemKey) {
      const following = { ...placement, placementId: newWorldPlacementId(placement.itemId) };
      const nextSpot = editorOpen ? fitNear(following, buildItem, SLIDE_REACH, next) : null;
      setBuildPlacement(nextSpot ?? following);
      if (nextSpot) moveFocus({ gridX: nextSpot.gridX, gridZ: nextSpot.gridZ });
    } else {
      setBuildPlacement(null); setSelectedInventoryItemKey(null); setSelectedSceneryItemKey(null); setEditTool("move");
    }
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
    if ((!editorOpen && !walking) || heldItemKey) return;
    if (editTool === "erase") {
      if (!validateCentralWorldGroundCell(gridX, gridZ, placedCustomisations, undefined, buildRules)) return;
      // Remove the item the tapped cell belongs to (anywhere inside its footprint,
      // the closest one when trees overlap); only when no item is hit do we rub
      // out the ground tile underneath.
      const covering = placementAt(gridX, gridZ);
      recordWorldEdit();
      if (covering) {
        setPlacedCustomisations((current) => {
          const next = current.filter((placement) => placement !== covering);
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
    if (!isGroundTool || !validateCentralWorldGroundCell(gridX, gridZ, placedCustomisations, isGroundTool ? editTool : undefined, buildRules)) return;
    recordWorldEdit();
    setGroundTiles((current) => {
      const cells = (editTool === "water" ? waterBrushCells(gridX, gridZ, waterBrushWidth) : [{gridX,gridZ}]).filter(cell => validateCentralWorldGroundCell(cell.gridX, cell.gridZ, placedCustomisations, editTool, buildRules));
      const keys = new Set(cells.map(cell => cell.gridX+":"+cell.gridZ));
      const next = [...current.filter(entry => !keys.has(entry.gridX+":"+entry.gridZ)), ...cells.map(cell => ({...cell,tileType:editTool}))];
      writeCentralWorldGroundTiles(placementScope, next);
      return next;
    });
    if (announce) void speak(`${EDIT_TOOL_NAMES[editTool]} added.`, undefined, "manual", { rate: 0.9 });
  }

  // Fences and walls: a tap or drag lays them under the finger and keeps one
  // in hand for the next. Invalid cells just show the red ghost.
  function placeHeldAt(gridX: number, gridZ: number) {
    if (!buildItem || !buildPlacement || buildPlacement.itemId === CENTRAL_WORLD_HOME_KEY) return;
    const repeat = Boolean(selectedSceneryItemKey);

    const candidate = { ...buildPlacement, gridX, gridZ, placementId: repeat ? newWorldPlacementId(buildPlacement.itemId) : buildPlacement.placementId };
    setEditCursor({ gridX, gridZ });
    if (!validateCentralWorldPlacement(candidate, buildItem, placementsWithoutBuildItem, itemsById, groundTiles, buildRules)) {
      setBuildPlacement({...buildPlacement,gridX,gridZ});
      return;
    }
    recordWorldEdit();
    setJustPlacedId(candidate.placementId ?? null);
    buildSounds.place();
    setPlacedCustomisations(current => {
      const remaining=current.filter(p=>p.placementId!==candidate.placementId);
      if(!validateCentralWorldPlacement(candidate,buildItem,remaining,itemsById,groundTiles,buildRules)) return current;
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
      if (paint && laysLine) { placeHeldAt(gridX, gridZ); return; }
      return "pan";
    }
    setEditCursor({ gridX, gridZ });
    if (paint) { applyGroundAt(gridX, gridZ); return; }
    return "pan";
  }

  // A tap (a press that didn't travel). Holding something: tap the item to place
  // it, or tap somewhere else and the view glides there, carrying the item.
  // Nothing held: tap a placed item to pick it.
  function tapBuildCell(gridX: number, gridZ: number) {
    if (buildPlacement && buildItem) {
      if (!placementOccupiesCell(buildPlacement, buildItem, gridX, gridZ)) { moveFocus({ gridX, gridZ }); return; }
      placeOrSlide();
      return;
    }
    if (editorOpen && isMoveTool) selectPlacedAt(gridX, gridZ);
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
  const surfaceHandlers: BuildSurfaceHandlers = { onCell: selectBuildCell, onTap: tapBuildCell, onHover: hoverAt };
  const gestureRef = useBuildGestures(canvasWrapRef, editorOpen, {
    // One finger is busy painting, so two fingers move around; otherwise they tilt.
    twoFingerSlide: paintMode ? "pan" : "tilt",
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
      remove: () => {
        if (buildPlacement && selectedInventoryItemKey) deleteHeldPlacement();
        else if (selectedPlacement && selectedItem && selectedPlacement.itemId !== CENTRAL_WORLD_HOME_KEY) putAwayPlaced(selectedPlacement, selectedItem);
      },
      cancel: () => { if (menuOpen) setMenuOpen(false); else if (buildPlacement || heldItemKey || isGroundTool || isEraseTool || selectedPlacementId) chooseEditTool("move"); },
      undo: undoWorldEdit,
      tool: chooseEditTool,
    };
  });

  // While walking, the held item rides on the square in front of the explorer and
  // the brush paints the square under their feet.
  const walkTick = useRef(() => {});
  const walkFit = useRef<{ key: string; placements: CentralWorldPlacement[] | null; tiles: CentralWorldGroundTile[] | null }>({ key: "", placements: null, tiles: null });
  const walkKeys = useRef<(event: KeyboardEvent) => void>(() => {});
  useEffect(() => {
    walkTick.current = () => {
      const { x, z } = avatarPosRef.current;
      if (buildItem && buildPlacement) {
        const size = itemGroundSize(buildItem, buildPlacement.rotation);
        const front = frontCell(x, z, aimRef.current, size, buildGrid.cellSize);
        // Moving on from the square just built on brings the next one back into view.
        if (lastPlacedCell && (front.gridX !== lastPlacedCell.gridX || front.gridZ !== lastPlacedCell.gridZ)) setLastPlacedCell(null);
        // Look for a spot only when something changed: the square ahead, the item, its turn, or the world.
        const key = `${buildItem.item_key}:${buildPlacement.rotation}:${front.gridX}:${front.gridZ}`;
        const seen = walkFit.current;
        if (seen.key === key && seen.placements === placedCustomisations && seen.tiles === groundTiles) return;
        walkFit.current = { key, placements: placedCustomisations, tiles: groundTiles };
        // Lines are laid square by square, so they stay on the square ahead; everything else sits where it fits.
        const next = heldLaysLine ? front : fitNear({ ...buildPlacement, ...front }, buildItem, walkFitReach(size)) ?? front;
        setBuildPlacement((held) => (held && (next.gridX !== held.gridX || next.gridZ !== held.gridZ) ? { ...held, gridX: next.gridX, gridZ: next.gridZ } : held));
        return;
      }
      if (!isGroundTool && !isEraseTool) return;
      const target = isEraseTool ? frontCell(x, z, aimRef.current, [1, 1], buildGrid.cellSize) : footCell(x, z, buildGrid.cellSize);
      if (target.gridX === editCursor.gridX && target.gridZ === editCursor.gridZ) return;
      setEditCursor(target);
      if (isGroundTool && brushOn) applyGroundAt(target.gridX, target.gridZ);
    };
    walkKeys.current = (event) => {
      if (event.repeat || event.altKey || resetDialog.current?.open) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable=true]")) return;
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "z") { event.preventDefault(); undoWorldEdit(); return; }
      if (event.metaKey || event.ctrlKey) return;
      // 1 to 9 pick the first nine slots; 0 picks the tenth.
      const slot = /^[0-9]$/.test(key) ? walkSlots[(Number(key) + 9) % 10] : undefined;
      const run: Record<string, () => void> = {
        e: walkMain, enter: walkMain,
        r: () => { if (buildPlacement) rotateHeld(); },
        x: toggleErase,
        p: planFromWalk,
        escape: () => (heldItemKey || isGroundTool || isEraseTool ? chooseEditTool("move", true) : stopWalkBuild()),
      };
      const action = slot ? () => pickHotbar(slot.entry) : run[key];
      if (!action) return;
      event.preventDefault();
      action();
    };
  });
  useEffect(() => {
    if (!walking) return;
    const timer = window.setInterval(() => walkTick.current(), 60);
    const onKey = (event: KeyboardEvent) => walkKeys.current(event);
    window.addEventListener("keydown", onKey);
    return () => { window.clearInterval(timer); window.removeEventListener("keydown", onKey); };
  }, [walking]);
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
    window.location.assign(treehouseHref("main", preview));
  }

  function enterTower() {
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => window.location.assign(preview ? "/world/tower?teacher_preview=1" : "/world/tower"), 350);
  }

  function runActiveAction() {
    if (transitioning) return;
    if (!activeTargetId) { if (onBoatWater) startBoat(); return; }
    if (activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance) enterMyHome();
    if (activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance) enterTower();
    if (nearRaceStart) startRace(nearRaceStart.item);
    if (nearCourt) shoot(nearCourt);
    if (nearCarport) startDrive(nearCarport);
  }

  function teleport(position: [number, number, number], yaw = 0) {
    setSpawnTarget(position);
    setSpawnYaw(yaw);
    setSpawnNonce((value) => value + 1);
  }

  return (
    <main data-world3d-root data-world-library-open={pickerOpen ? "true" : "false"} style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", overscrollBehavior: "none", touchAction: "none", WebkitUserSelect: "none", background: "#69afe4" }}>
      <div ref={canvasWrapRef} style={{ position: "absolute", inset: 0 }}>
      <Canvas style={{ touchAction: "none" }} camera={{ position: [0, 7, 29], fov: 60 }} dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.25] : [1, 1.5]} gl={{ antialias: quality !== "low", powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.06 }} shadows={quality !== "low" ? "soft" : false}>
        <PremiumHomeWorldContext.Provider value={homeWorld}>
        <SkateKitWorldContext.Provider value={skateKitWorld}>
        <RaceKitWorldContext.Provider value={raceKitWorld}>
        <BasketballScoreContext.Provider value={hoopScore}>
        <CarWorldContext.Provider value={carWorld}>
        <CentralWorldScene night={night} selection={selectedPlacement && selectedItem ? { placement: selectedPlacement, item: selectedItem, menu: (
          <div className="worldEditPicked" onPointerDown={(event) => event.stopPropagation()} onPointerUp={(event) => event.stopPropagation()}>
            <b>{selectedItem.name}</b>
            {visiting ? null : <PremiumHomeUpgradeRows assetKey={selectedItem.metadata.worldAssetKey} ownedItemKeys={ownedItemKeys} upgrading={upgradingHome} onUpgrade={upgradeHome} />}
            <button type="button" className="worldEditPickedMove" onClick={() => pickUpPlacement(selectedPlacement)}><Move size={20} aria-hidden="true" />Move</button>
            {selectedPlacement.itemId !== CENTRAL_WORLD_HOME_KEY ? <>
              <button type="button" onClick={() => turnPlaced(selectedPlacement, selectedItem)}><RotateCw size={20} aria-hidden="true" />Turn</button>
              <button type="button" className="worldEditPickedRemove" onClick={() => putAwayPlaced(selectedPlacement, selectedItem)}><Trash2 size={20} aria-hidden="true" />Put away</button>
            </> : null}
          </div>
        ) } : null} onStrokeState={setStrokeActive} homePlacement={homePlacement} quality={quality} moveInput={editorOpen ? EMPTY_WORLD_MOVE_INPUT : moveInput} lookInput={editorOpen ? EMPTY_WORLD_LOOK_INPUT : lookInput} spawnTarget={spawnTarget} spawnNonce={spawnNonce} spawnYaw={spawnYaw} placedCustomisations={placementsWithoutBuildItem} groundTiles={groundTiles} itemsById={itemsById} buildPreview={restingOnPlaced ? null : buildPreview} groundPreview={groundPreview} editing={editorOpen} buildZoom={buildZoom} paintMode={paintMode} surfaceHandlers={surfaceHandlers} gestureRef={gestureRef} onEnterTower={enterTower} onEnterHome={enterMyHome} onActiveTarget={setActiveTargetId} onToggleDrawbridge={toggleDrawbridge} cameraFocus={cameraFocus} cameraYaw={buildOrbit.yaw} cameraPitch={buildOrbit.pitch} avatarPosRef={avatarPosRef} hubV2={hubV2} homeAnchors={homeAnchors} buildRules={buildRules} raceItems={raceItems} raceStarts={raceStarts} race={race} raceHud={raceHud} onBestLap={saveRaceBest} kart={kart} racePaused={garageOpen} courts={courts} shot={shot} onShotDone={finishShot} walking={walking} walkCursor={walking && buildPlacement ? { gridX: buildPlacement.gridX, gridZ: buildPlacement.gridZ } : null} walkGridCells={buildItem && buildPlacement ? Math.max(6, ...itemGroundSize(buildItem, buildPlacement.rotation).map((side) => side + 4)) : 6} walkFar={Boolean(buildItem && buildPlacement && itemSize(buildItem, itemGroundSize(buildItem)) === "big")} eraseTarget={eraseTarget && eraseItem ? { placement: eraseTarget, item: eraseItem } : null} aimRef={aimRef} justPlacedId={justPlacedId} onWalkTap={walkTap} carports={carports} drive={drive} carHud={carHud} carPose={carPose} rexPhase={race || drive || boat ? "away" : rex.phase} waterAreas={waterAreas} boat={boat} boatWaterAt={findBoatWater} poseRef={poseRef} mates={worldMates} matePoses={together.poses} />
        </CarWorldContext.Provider>
        </BasketballScoreContext.Provider>
        </RaceKitWorldContext.Provider>
        </SkateKitWorldContext.Provider>
        </PremiumHomeWorldContext.Provider>
      </Canvas>
      </div>

      {visiting && friendWorld && !editorOpen && !race && !drive && !boat ? <VisitBanner name={friendWorld.name} canBuild={friendWorld.canBuild} onGoHome={goHome} /> : null}
      {friendsOpen && !visiting ? <FriendsPanel studentId={student?.studentId ?? null} demo={preview} online={onlineFriends} onKnock={(friend) => { setFriendsOpen(false); setKnockingFriend(friend); }} onChallenge={(friend) => { setFriendsOpen(false); setBattlesOpen({ friendId: friend.studentId }); }} onOpenFriend={(friend) => router.push(friendPageHref(friend.studentId, preview))} onClose={() => setFriendsOpen(false)} /> : null}
      {knockingFriend ? <KnockDoor friend={knockingFriend} studentId={studentId} demo={preview} onIn={() => { setKnockingFriend(null); router.push(visitHref(knockingFriend.studentId, preview)); }} onClose={() => setKnockingFriend(null)} /> : null}
      {!visiting && host.knocks[0] ? <KnockToast guest={host.knocks[0]} buildingEnabled={host.buildingEnabled} busy={hostBusy} onAnswer={(answer) => answerDoor(host.knocks[0], answer)} /> : null}
      {!visiting && host.visitors.length && !editorOpen ? <VisitorsCard visitors={host.visitors} buildingEnabled={host.buildingEnabled} busy={hostBusy} onSetBuild={(guest, canBuild) => hostAct(() => setVisitBuild(studentId, preview, guest.visitId, canBuild))} onSendHome={(guest) => hostAct(() => endVisit(studentId, preview, guest.visitId))} /> : null}
      {visitOver ? <VisitOverCard message={visitOver} onGoHome={goHome} /> : null}
      {friendRequest && !friendsOpen && !battlesOpen && !battleInvite && !visiting && !host.knocks.length && !walkBuild ? <FriendRequestToast friend={friendRequest} busy={answeringRequest} onYes={() => answerRequest(friendRequest, true)} onLater={() => setDismissedRequests((list) => [...list, friendRequest.friendshipId])} /> : null}
      {battlesOpen && !visiting ? <BattlesPanel studentId={student?.studentId ?? null} demo={preview} friends={friendsList} online={onlineFriends} start={battlesOpen} onPlay={startBattle} onClose={() => setBattlesOpen(null)} /> : null}
      {battleInvite && !battlesOpen && !visiting && !host.knocks.length && !walkBuild ? <BattleInviteToast invite={battleInvite} onOpen={() => { setBattleInvite(null); setBattlesOpen({}); }} onDismiss={() => setBattleInvite(null)} /> : null}
      {!visiting && visitorChanges[0] && !host.visitors.length && !host.knocks.length && !editorOpen && !race && !drive && !boat ? <VisitorChangesCard change={visitorChanges[0]} busy={resolvingChange} onKeep={() => void resolveChange(false)} onUndo={() => void resolveChange(true)} /> : null}
      {!editorOpen && !race && !drive && !boat && hubV2 && !visiting ? <RexHud rex={rex} level={rexLevelFrom(lessonRoute, student?.yearLevel)} onChooseRealm={enterRealmForRex} /> : null}
      {!editorOpen && !race && !drive && !boat ? <WorldHUD context="central" preview={preview} accent="#efbd61" hideStreakReminder={visiting || walkBuild} primaryAction={walkBuild || !canBuildHere ? undefined : { label: "BUILD", icon: "edit", onClick: startWalkBuild }} contextAction={hasAvailableAction && !walkBuild ? (activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance ? { label: "ENTER MY HOME", icon: "home", onClick: runActiveAction } : nearRaceStart ? { label: "RACE", icon: "flag", onClick: runActiveAction } : nearCourt ? { label: nearCourt.kind === "basketball" ? "SHOOT" : SPORT_ACTION[nearCourt.kind], icon: "ball", onClick: runActiveAction } : nearCarport ? { label: "DRIVE", icon: "car", onClick: runActiveAction } : activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance ? { label: "ENTER TOWER", icon: "door", onClick: runActiveAction } : { label: "BOAT", icon: "car", onClick: runActiveAction }) : undefined} navActions={[
        { key: "home", label: "Home", icon: <Home size={15} />, onClick: () => teleport(homeAnchors.exit, homeAnchors.rotationY) },
        { key: "tower", label: "Tower", icon: <Castle size={15} />, onClick: () => teleport(CENTRAL_WORLD_CONFIG.towerPlaza) },
        ...(hubV2 ? [{ key: "night", label: night ? "Day" : "Night", icon: night ? <Sun size={15} /> : <Moon size={15} />, onClick: toggleNight }] : []),
        // Friends: visit their worlds and choose who can help build yours (not while visiting).
        ...(visiting || !hubV2 ? [] : [{ key: "friends", label: "Friends", icon: <Users size={15} />, onClick: () => setFriendsOpen(true) }]),
        // Battles: challenge a friend, then into the Battle Arena.
        ...(visiting || !hubV2 ? [] : [{ key: "battles", label: "Battles", icon: <Swords size={15} />, onClick: () => { setFriendsOpen(false); setBattlesOpen({}); } }]),
      ]} /> : null}

      {!editorOpen && !pickerOpen ? <><WorldJoystick input={moveInput} onChange={setMoveInput} driving={Boolean(race || drive || boat)} />{race || drive || boat ? null : <WorldLookJoystick onChange={setLookInput} />}</> : null}
      {drive ? <CarHudPanel hud={carHud} name={CAR_SPECS[drive.style].name} lights={drive.lights} canSwap={ownedCars(ownedItemKeys).length > 1}
        onHorn={carSounds.horn}
        onLights={() => setDrive((current) => current ? { ...current, lights: !current.lights } : current)}
        onColour={() => chooseCar({ colour: nextOf(CAR_COLOURS, carChoice.colour as (typeof CAR_COLOURS)[number]) })}
        onSwap={() => { if (carStyle) chooseCar({ style: nextOf(ownedCars(ownedItemKeys), carStyle) }); }}
        onExit={exitDrive} /> : null}
      {boat ? <CarHudPanel hud={carHud} name={BOAT_SPECS[boat.style].name} status="on the water" swapLabel="Boat" exitLabel="EXIT BOAT" canSwap={ownedBoats(ownedItemKeys).length > 1}
        onHorn={carSounds.horn}
        onSwap={() => { const next = nextOf(ownedBoats(ownedItemKeys), boat.style); setBoatChoice(next); setBoat((current) => current ? { ...current, style: next } : current); }}
        onExit={exitBoat} /> : null}
      {race && !garageOpen ? <RaceHud hud={raceHud} onRestart={() => startRace(race.start)} onGarage={openGarage} onExit={exitRace} /> : null}
      {garageOpen ? <KartGarage style={kart.style} parts={kart.parts} owned={ownedItemKeys} finishedRealms={finishedRealms} xp={xpBalance} busy={garageBusy} message={garageMessage} actions={garageActions} onClose={closeGarage} /> : null}
      {walkBuild && !race && !garageOpen && !pickerOpen ? (() => {
        const isHome = buildPlacement?.itemId === CENTRAL_WORLD_HOME_KEY;
        const tintable = buildPreview && (buildItem?.metadata.marketplaceCategory === "world_basic" || isVillageBuilding(buildItem?.metadata.worldAssetKey) || isRealmBuilding(buildItem?.metadata.worldAssetKey));
        const styled = buildPreview && isVillageBuilding(buildItem?.metadata.worldAssetKey) && buildItem?.metadata.worldAssetKey !== "village_apartments";
        const canPutAway = Boolean(buildPreview && selectedInventoryItemKey && !isHome);
        const waterBrush = isGroundTool && editTool === "water";
        // Colour, style, put away, or the water brush size: a row over the build buttons.
        const extras = tintable || styled || canPutAway || waterBrush ? (
          <>
            {waterBrush ? ([[1, "1 square"], [3, "River"], [5, "Lake"]] as const).map(([width, label]) => <button key={width} type="button" className="walkBuildChip" aria-pressed={waterBrushWidth === width} onClick={() => { setWaterBrushWidth(width); void speak(width === 1 ? "One square of water." : `${label} brush.`, undefined, "manual", { rate: .9 }); }}>{label}</button>) : null}
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
            {canPutAway ? <button type="button" className="walkBuildChip walkBuildChipDanger" onClick={deleteHeldPlacement} aria-label="Put it away" title="Put it away (Delete)"><Trash2 size={16} />Put away</button> : null}
          </>
        ) : null;
        const tap = touchFirst ? "tap" : "click";
        const hint: WalkBuildHint = buildNotice
          ? { text: buildNotice, tone: "bad" }
          : buildPreview && buildItem
            ? restingOnPlaced
              ? { text: `${buildItem.name} placed · walk on to place another`, tone: "ok" }
              : buildProblem
                ? { text: PLACEMENT_PROBLEM_TEXT[buildProblem], tone: "bad" }
                : heldLaysLine
                  ? { text: editorOpen ? `${buildItem.name} · drag along the ground to build a line` : `${buildItem.name} · Place at each step and it joins up`, tone: "ok" }
                  : { text: editorOpen ? `${buildItem.name} fits · press Place, or drag the ground to move it` : `${buildItem.name} fits · press Place or ${tap} a nearby square`, tone: "ok" }
            : isGroundTool
              ? editorOpen ? { text: `${EDIT_TOOL_NAMES[editTool]} · ${tap} or drag the ground to paint`, tone: "info" }
                : { text: brushOn ? `Painting ${EDIT_TOOL_NAMES[editTool].toLowerCase()} as you walk` : `${EDIT_TOOL_NAMES[editTool]} brush · press Paint, then walk`, tone: brushOn ? "ok" : "info" }
              : isEraseTool
                ? editorOpen ? { text: `Eraser · ${tap} something to remove it`, tone: "bad" }
                  : eraseItem ? { text: `Facing ${eraseItem.name} · press Remove`, tone: "bad" } : eraseTile ? { text: `Facing ${EDIT_TOOL_NAMES[eraseTile.tileType].toLowerCase()} · press Remove`, tone: "bad" } : { text: "Face something to remove it", tone: "info" }
                : selectedPlacement
                  ? { text: `${selectedItem?.name ?? "Item"} · move it, turn it or put it away`, tone: "info" }
                  : editorOpen
                    ? { text: `Pick something from the bar · ${tap} something you've built to move it`, tone: "info" }
                    : { text: "Pick something from the bar, then walk to where it goes", tone: "info" };
        return (
          <WalkBuildBar
            planning={editorOpen}
            slots={walkSlots}
            active={heldItemKey ?? (isGroundTool && isGroundBrush(editTool) ? hotbarTool(editTool) : null)}
            pinned={new Set(hotbar.pins)}
            mode={buildPreview ? "item" : isGroundTool ? "brush" : isEraseTool ? "erase" : "none" satisfies WalkBuildMode}
            heldName={buildItem?.name ?? null}
            valid={buildPreview ? !restingOnPlaced : Boolean(eraseItem || eraseTile)}
            brushOn={brushOn}
            hint={hint}
            extras={extras}
            canUndo={editHistory.length > 0}
            onPick={pickHotbar}
            onPin={pinEntry}
            onMore={openPicker}
            onPlace={walkMain}
            onTurn={rotateHeld}
            onErase={toggleErase}
            onPlan={editorOpen ? walkFromPlanner : planFromWalk}
            onUndo={undoWorldEdit}
            onDone={finishBuilding}
          />
        );
      })() : null}
      {pickerOpen ? (() => {
        const trayTab: TrayTab = librarySection === "owned" ? "owned" : paletteTab;
        const query = scenerySearch.trim().toLowerCase();
        // Build kit tabs list only the pieces the learner's kit level has unlocked.
        const tabKit = paletteTab === "skate" ? { kit: SKATE_KIT, level: skateLevel } : paletteTab === "race" ? { kit: RACE_KIT, level: raceLevel } : null;
        const sceneryInTab = paletteTab === "ground" ? [] : CENTRAL_WORLD_STARTER_SCENERY.filter((item) => item.metadata.worldAssetKey !== "rail_train" && item.metadata.worldSceneryGroup === paletteTab && item.name.toLowerCase().includes(query) && (tabKit === null || Number(item.metadata.kitPieceLevel) <= tabKit.level));
        // Every card has a star: one tap adds it to (or takes it off) the favourites on the bar.
        const withStar = (entry: HotbarEntry, name: string, card: React.ReactNode) => {
          const favourite = hotbar.pins.includes(entry);
          return (
            <div key={entry} className="worldPickCard">
              {card}
              <button type="button" className="worldPickStar" aria-pressed={favourite} aria-label={favourite ? `Take ${name} out of favourites` : `Add ${name} to favourites`} onClick={() => pinEntry(entry)}><Star size={18} fill={favourite ? "currentColor" : "none"} /></button>
            </div>
          );
        };
        const chooseTab = (tab: TrayTab) => {
          setScenerySearch("");
          if (tab === "owned") { setLibrarySection("owned"); return; }
          setLibrarySection("build");
          setPaletteTab(tab);
        };
        return (
          <section className="worldEditTray worldPicker" data-open="true" aria-label="Choose something to build">
            <div className="worldEditTrayTop">
              <div className="worldEditTabs" role="tablist" aria-label="Build categories">
                {TRAY_TABS.map(({ key, label }) => (
                  <button key={key} type="button" role="tab" aria-selected={trayTab === key} onClick={() => chooseTab(key)}>
                    {label}{key === "owned" ? <em>{ownedWorldItems.length}</em> : null}
                  </button>
                ))}
              </div>
              {trayTab !== "owned" && trayTab !== "ground" ? (
                <input className="worldEditSearch" aria-label="Search scenery" placeholder="Search…" value={scenerySearch} onChange={(event) => setScenerySearch(event.target.value)} />
              ) : null}
              <button type="button" className="worldEditTrayToggle" aria-label="Close the picker" onClick={() => setPickerOpen(false)}><X size={20} /></button>
            </div>
            <div className="worldEditCards" key={trayTab} aria-label={trayTab === "owned" ? "Owned world inventory" : "Available building items"}>
              {trayTab === "owned" ? <>
                {ownedWorldItems.map((item) => {
                  const image = inventoryImage(item);
                  return withStar(item.item_key, item.name, (
                    <button type="button" className="worldEditCard" onClick={() => pickFromPicker(() => holdItem(item))} aria-pressed={selectedInventoryItemKey === item.item_key} aria-label={`Place ${item.name}`}>
                      <span className="worldEditArt">{image ? <Image src={image} alt="" fill sizes="140px" style={{ objectFit: "cover" }} /> : <PackageOpen size={36} />}</span>
                      <b>{item.name}</b>
                    </button>
                  ));
                })}
                {!ownedWorldItems.length ? <p className="worldEditEmpty">Buildings and places you unlock in the Marketplace appear here.</p> : null}
                <button type="button" className="worldEditCard worldEditShop" onClick={() => router.push(preview ? "/marketplace?teacher_preview=1" : "/marketplace")}>
                  <span className="worldEditArt"><ShoppingBag size={34} /></span><b>Get more</b>
                </button>
              </> : trayTab === "ground" ? GROUND_TOOLS.map(([tool, label]) => withStar(hotbarTool(tool), label, (
                <button type="button" className="worldEditCard" onClick={() => pickFromPicker(() => holdBrush(tool))} aria-pressed={!heldItemKey && editTool === tool}>
                  <span className="worldEditArt"><GroundSwatch tool={tool} /></span><b>{label}</b>
                </button>
              ))) : <>
                {tabKit ? <KitTrayHeader kit={tabKit.kit} level={tabKit.level} next={nextBuildKitUpgrade(tabKit.kit, ownedItemKeys)} upgrading={upgradingHome} onUpgrade={() => upgradeKit(tabKit.kit)} /> : null}
                {paletteTab === "fortress" ? (
                  // The Tower Shield has no placement: it goes round the Tower once unlocked, and upgrades here.
                  <div className="worldEditKit" role="status">
                    <b>{PREMIUM_HOME_SPECS.tower_shield.name}</b>
                    {homeWorld.towerShield
                      ? <PremiumHomeUpgradeRows assetKey={PREMIUM_HOME_SPECS.tower_shield.assetKey} ownedItemKeys={ownedItemKeys} upgrading={upgradingHome} onUpgrade={upgradeHome} />
                      : <span>Unlock it in the Marketplace (Protect the Tower) for a giant energy shield over the Tower. Trip wires, drones, guard dogs and sentry bots are there too.</span>}
                  </div>
                ) : null}
                {paletteTab === "race" && raceLevel ? withStar(hotbarTool("track"), "Tarmac", (
                  <button type="button" className="worldEditCard" onClick={() => pickFromPicker(() => holdBrush("track"))} aria-pressed={!heldItemKey && editTool === "track"}>
                    <span className="worldEditArt"><GroundSwatch tool="track" /></span><b>Paint tarmac</b>
                  </button>
                )) : null}
                {paletteTab === "race" && raceLevel ? (
                  // The kart garage also opens from the race screen; this makes it easy to find.
                  <button type="button" className="worldEditCard" onClick={() => { finishBuilding(); openGarage(); }}>
                    <span className="worldEditArt"><Wrench size={36} color="#3fd0ff" aria-hidden="true" /></span><b>Kart garage</b>
                  </button>
                ) : null}
                {sceneryInTab.map((item) => {
                  const art = freeBuildRender(String(item.metadata.worldAssetKey));
                  const Icon = SCENERY_ICON[String(item.metadata.worldAssetKey)] ?? Sprout;
                  return withStar(item.item_key, item.name, (
                    <button type="button" className="worldEditCard" onClick={() => pickFromPicker(() => holdItem(item))} aria-pressed={selectedSceneryItemKey === item.item_key} aria-label={`Place ${item.name}`}>
                      <span className="worldEditArt worldEditArtFree">{art ? <Image src={art} alt="" fill sizes="140px" style={{ objectFit: "contain" }} /> : <Icon size={36} color={item.accent} />}</span>
                      <b>{item.name}</b>
                    </button>
                  ));
                })}
                {paletteTab === "rocks_water" ? withStar(hotbarTool("water"), "Water", (
                  <button type="button" className="worldEditCard" onClick={() => pickFromPicker(() => holdBrush("water"))}>
                    <span className="worldEditArt"><GroundSwatch tool="water" /></span><b>Paint water</b>
                  </button>
                )) : null}
                {!sceneryInTab.length && !(tabKit && !tabKit.level) ? <p className="worldEditEmpty" role="status">No matching items.</p> : null}
              </>}
            </div>
          </section>
        );
      })() : null}
      {editorOpen ? (() => {
        const currentView = activeBuildView(buildOrbit.pitch);
        return (
        <>
        <header className="worldEditBar" aria-label="Plan view">
          <div className="worldEditTitle">
            <b>PLAN</b>
            <span className="worldEditSaved"><Check size={15} aria-hidden="true" />{preview ? "Preview · this browser only" : "Saved to your account"}</span>
            <WorldVoiceButton compact label="Read plan view instructions" text="Plan view shows your world from above. Pick something from the bar and it goes on the nearest spot where it fits. Drag the ground to move it, then press Place. Tap something you have built to move it, turn it or put it away. Pinch to zoom, twist two fingers to turn, and slide two fingers to look up or down. Walk takes you back to building on foot. Your world saves by itself." />
          </div>
          <div className="worldEditActions">
            <div className="worldEditMenuWrap">
              <button type="button" className="worldEditRound" aria-label="More options" aria-haspopup="menu" aria-expanded={menuOpen} aria-pressed={menuOpen} onClick={() => setMenuOpen((open) => !open)}><MoreHorizontal size={22} /></button>
              {menuOpen ? (
                <div className="worldEditMenu" role="menu" aria-label="More options">
                  {hubV2 ? null : <button type="button" role="menuitem" onClick={moveMyHome}><Home size={18} />Move my home</button>}
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
          </div>
        </header>

        <div className="worldEditView" role="group" aria-label="View">
          <span className="worldEditViewLabel">VIEW</span>
          {BUILD_VIEW_ORDER.map((view) => {
            const { label, Icon } = BUILD_VIEWS[view];
            return <button key={view} type="button" className="worldEditViewPreset" aria-pressed={currentView === view} aria-label={`${label} view`} onClick={() => setBuildView(view)}><Icon size={20} aria-hidden="true" /><span>{label}</span></button>;
          })}
          {(() => {
            // Phones have room for one button that steps through the three views.
            const next = BUILD_VIEW_ORDER[(BUILD_VIEW_ORDER.indexOf(currentView ?? "above") + 1) % BUILD_VIEW_ORDER.length];
            const shown = BUILD_VIEWS[currentView ?? "normal"];
            return <button type="button" className="worldEditViewCycle" aria-label={`View: ${shown.label}. Change to ${BUILD_VIEWS[next].label}`} onClick={() => setBuildView(next)}><shown.Icon size={20} aria-hidden="true" /><span>{shown.label}</span></button>;
          })()}
          <div className="worldEditViewGrid">
            <button type="button" onClick={() => orbitCamera(0.5, 0)} aria-label="Turn the view left" title="Turn left (Q)"><RotateCcw size={20} /></button>
            <button type="button" onClick={() => orbitCamera(-0.5, 0)} aria-label="Turn the view right" title="Turn right (E)"><RotateCw size={20} /></button>
            <button type="button" onClick={() => zoomView(0.85)} aria-label="Zoom camera in" title="Zoom in (+)"><Plus size={22} /></button>
            <button type="button" onClick={() => zoomView(1 / 0.85)} aria-label="Zoom camera out" title="Zoom out (−)"><Minus size={22} /></button>
          </div>
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
      <KeyboardWorldAction enabled={hasAvailableAction && !editorOpen && !walkBuild} onAction={runActiveAction} />

      {shotMessage ? <div role="status" style={{ position: "absolute", top: "26%", left: 0, right: 0, zIndex: 32, textAlign: "center", pointerEvents: "none", fontSize: 44, fontWeight: 950, color: shotMessage.good ? "#ffcf3a" : "#ffffff", textShadow: shotMessage.good ? "0 0 24px #ff7a1a, 0 4px 0 rgba(0,0,0,.35)" : "0 4px 0 rgba(0,0,0,.35)" }}>{shotMessage.text}{hoopScore ? <div style={{ fontSize: 18, marginTop: 4 }}>{hoopScore} points</div> : null}</div> : null}
      {economyMessage ? <div style={{ position: "absolute", left: 16, bottom: 126, maxWidth: 360, zIndex: 30, border: "1px solid rgba(146,64,14,.28)", borderRadius: 6, background: "rgba(255,251,235,.94)", color: "#78350f", padding: "10px 12px", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><span>{economyMessage}</span><WorldVoiceButton text={economyMessage} compact label="Read message" /></div> : null}
      {showIntro ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(24,31,25,.22)", color: "#fff8e8", pointerEvents: "none", animation: "centralWorldReveal 2.3s ease both" }}><div style={{ textAlign: "center", textShadow: "0 3px 18px rgba(0,0,0,.4)", pointerEvents: "auto" }}><div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.24em" }}>THE RELIQ WORLD</div><div style={{ marginTop: 8, fontSize: 30, fontWeight: 900 }}>Tower of Knowledge</div><div style={{ marginTop: 12 }}><WorldVoiceButton text="The RELIQ World. Tower of Knowledge." label="Read world title" /></div></div><style>{`@keyframes centralWorldReveal{0%{opacity:1;background:rgba(10,15,11,1)}25%,70%{opacity:1}100%{opacity:0}}`}</style></div> : null}
      <style>{`
        .worldBuilderReset{inset:0;margin:auto;max-width:440px;width:calc(100vw - 48px);box-sizing:border-box;padding:24px;border:1px solid rgba(255,255,255,.16);border-radius:22px;background:#17131f;color:#fff;font-family:var(--font-sans);box-shadow:0 20px 90px #0008}.worldBuilderReset::backdrop{background:rgba(10,8,16,.7)}.worldBuilderReset h2{margin:0 0 12px;font:900 22px var(--font-display)}.worldBuilderReset p{line-height:1.6;color:#d8d2e4}
        .worldBuilderResetActions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.worldBuilderResetActions button{min-height:48px;padding:0 18px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.08);color:#fff;font:900 14px var(--font-display);cursor:pointer}.worldBuilderResetActions button:last-child{background:#e5484d;border-color:#e5484d}
      `}</style>
      <style>{`@media (pointer:coarse){body:has([data-world3d-root]) .fullscreen-toggle{display:none}}body:has(.worldEditTray) .fullscreen-toggle{display:none}`}</style>
      {transitioning ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#211914", color: "#fff0c9", fontWeight: 900, letterSpacing: "0.16em", zIndex: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span>ENTERING THE TOWER...</span><WorldVoiceButton text={joinSpeechParts(["Entering the tower"])} label="Read entering tower" /></div></div> : null}
    </main>
  );
}
