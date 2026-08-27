"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CentralWorldEnvironment } from "@/components/world3d/CentralWorldEnvironment";
import { WorldHUD } from "@/components/world3d/WorldHUD";
import { WorldInteractionPrompt } from "@/components/world3d/WorldInteractionPrompt";
import {
  EMPTY_WORLD_MOVE_INPUT,
  KeyboardWorldAction,
  SharedThirdPersonPlayer,
  WorldMovePad,
  type WorldMoveInput,
} from "@/components/world3d/SharedWorldPlayer";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { economyErrorMessage, fetchDemoEconomy, fetchStudentEconomy, type EconomyItem } from "@/lib/economy";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import {
  CENTRAL_WORLD_ANCHORS,
  CENTRAL_WORLD_CONFIG,
  CENTRAL_WORLD_CUSTOMISATION_PLOTS,
  type CentralWorldQuality,
} from "@/lib/world3d/central-world-config";
import {
  CENTRAL_WORLD_CUSTOMISATION_CATALOG,
  getEquippedCentralWorldItems,
  mergeCentralWorldCatalogue,
} from "@/lib/world3d/central-world-customisation-catalog";
import { rememberCentralWorldHomeEntry } from "@/lib/world3d/world-navigation-context";
import { joinSpeechParts, WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";

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

function CentralWorldScene({ quality, moveInput, spawnTarget, spawnNonce, equippedCustomisationPlots, onActiveTarget }: { quality: CentralWorldQuality; moveInput: WorldMoveInput; spawnTarget: [number, number, number] | null; spawnNonce: number; equippedCustomisationPlots: Record<string, EconomyItem>; onActiveTarget: (id: string | null) => void }) {
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
        activeCustomisationPlotId={activeTargetId}
        equippedCustomisationPlots={equippedCustomisationPlots}
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
          ...CENTRAL_WORLD_CUSTOMISATION_PLOTS.map((plot) => ({ id: plot.id, position: plot.position, distance: 3.8 })),
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
  const requestedQuality = searchParams.get("quality");
  const quality: CentralWorldQuality = requestedQuality === "low" || requestedQuality === "high" ? requestedQuality : "medium";
  const debug = preview && searchParams.get("debug") === "1";
  const [moveInput, setMoveInput] = useState<WorldMoveInput>(EMPTY_WORLD_MOVE_INPUT);
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
  const [equippedCustomisationPlots, setEquippedCustomisationPlots] = useState<Record<string, EconomyItem>>({});
  const [economyMessage, setEconomyMessage] = useState<string | null>(null);
  const activeCustomisationPlot = CENTRAL_WORLD_CUSTOMISATION_PLOTS.find((plot) => plot.id === activeTargetId);
  const activePlotEquipped = activeCustomisationPlot ? Boolean(equippedCustomisationPlots[activeCustomisationPlot.id]) : false;
  const hasAvailableAction = activeTargetId === CENTRAL_WORLD_ANCHORS.towerMainEntrance || activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance || Boolean(activeCustomisationPlot && !activePlotEquipped);
  const student = useMemo(() => getActiveStudentProfile(), []);

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
        setEquippedCustomisationPlots(getEquippedCentralWorldItems(merged));
      })
      .catch((error) => {
        if (!cancelled) setEconomyMessage(economyErrorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, [preview, student?.studentId]);

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

  const runActiveAction = useCallback(() => {
    if (!activeTargetId || transitioning) return;
    if (activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance) {
      rememberCentralWorldHomeEntry(preview);
      router.push("/home-base");
      return;
    }
    if (activeCustomisationPlot && !activePlotEquipped) {
      router.push(preview ? "/marketplace?teacher_preview=1" : "/marketplace");
      return;
    }
    if (activeTargetId !== CENTRAL_WORLD_ANCHORS.towerMainEntrance) return;
    setTransitioning(true);
    window.setTimeout(() => router.push(preview ? "/world/tower?teacher_preview=1" : "/world/tower"), 500);
  }, [activeCustomisationPlot, activePlotEquipped, activeTargetId, preview, router, transitioning]);

  function teleport(position: [number, number, number]) {
    setSpawnTarget(position);
    setSpawnNonce((value) => value + 1);
  }

  return (
    <main data-world3d-root style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", background: "#69afe4" }}>
      <Canvas camera={{ position: [0, 7, 29], fov: 60 }} dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.25] : [1, 1.5]} gl={{ antialias: quality !== "low", powerPreference: "high-performance" }} shadows={false}>
        <CentralWorldScene quality={quality} moveInput={moveInput} spawnTarget={spawnTarget} spawnNonce={spawnNonce} equippedCustomisationPlots={equippedCustomisationPlots} onActiveTarget={setActiveTargetId} />
      </Canvas>

      <WorldHUD context="central" preview={preview} accent="#efbd61" fallbackHref={preview ? "/home-base?teacher_preview=1" : "/home-base"} />

      <WorldMovePad input={moveInput} onChange={setMoveInput} />
      {activeTargetId ? (
        <WorldInteractionPrompt
          location={activeCustomisationPlot ? "CUSTOMISATION AREA" : activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance ? "MY HOME" : "TOWER OF KNOWLEDGE"}
          status={activeCustomisationPlot ? activePlotEquipped ? equippedCustomisationPlots[activeCustomisationPlot.id].name : "Unlock a world feature in the Marketplace." : activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance ? "Your personal Level Up space" : "Realm Chamber"}
          actionLabel={activeCustomisationPlot ? activePlotEquipped ? "INSTALLED" : "OPEN MARKETPLACE" : activeTargetId === CENTRAL_WORLD_ANCHORS.myHomeEntrance ? "ENTER MY HOME" : "ENTER TOWER"}
          disabled={Boolean(activeCustomisationPlot && activePlotEquipped)}
          onAction={runActiveAction}
        />
      ) : null}
      <KeyboardWorldAction enabled={hasAvailableAction} onAction={runActiveAction} />

      {debug ? <div style={{ position: "absolute", right: 16, bottom: 130, display: "flex", gap: 6, zIndex: 30 }}><button type="button" onClick={() => teleport(CENTRAL_WORLD_CONFIG.spawnPoint)} style={debugButton}>SPAWN</button><button type="button" onClick={() => teleport(CENTRAL_WORLD_CONFIG.myHomeExitSpawn)} style={debugButton}>HOME</button><button type="button" onClick={() => teleport(CENTRAL_WORLD_CONFIG.towerPlaza)} style={debugButton}>PLAZA</button><button type="button" onClick={() => teleport(CENTRAL_WORLD_CUSTOMISATION_PLOTS[0].position)} style={debugButton}>PLOTS</button></div> : null}
      {economyMessage ? <div style={{ position: "absolute", left: 16, bottom: 126, maxWidth: 360, zIndex: 30, border: "1px solid rgba(146,64,14,.28)", borderRadius: 6, background: "rgba(255,251,235,.94)", color: "#78350f", padding: "10px 12px", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}><span>{economyMessage}</span><WorldVoiceButton text={economyMessage} compact label="Read message" /></div> : null}
      {showIntro ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "rgba(24,31,25,.22)", color: "#fff8e8", pointerEvents: "none", animation: "centralWorldReveal 2.3s ease both" }}><div style={{ textAlign: "center", textShadow: "0 3px 18px rgba(0,0,0,.4)", pointerEvents: "auto" }}><div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.24em" }}>THE LEVEL UP WORLD</div><div style={{ marginTop: 8, fontSize: 30, fontWeight: 900 }}>Tower of Knowledge</div><div style={{ marginTop: 12 }}><WorldVoiceButton text="The Level Up World. Tower of Knowledge." label="Read world title" /></div></div><style>{`@keyframes centralWorldReveal{0%{opacity:1;background:rgba(10,15,11,1)}25%,70%{opacity:1}100%{opacity:0}}`}</style></div> : null}
      {transitioning ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "#211914", color: "#fff0c9", fontWeight: 900, letterSpacing: "0.16em", zIndex: 20 }}><div style={{ display: "flex", alignItems: "center", gap: 12 }}><span>ENTERING THE TOWER...</span><WorldVoiceButton text={joinSpeechParts(["Entering the tower"])} label="Read entering tower" /></div></div> : null}
    </main>
  );
}
