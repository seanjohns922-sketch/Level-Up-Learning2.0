"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { readProgress } from "@/data/progress";
import {
  EMPTY_WORLD_MOVE_INPUT,
  KeyboardWorldAction,
  SharedThirdPersonPlayer,
  WorldMovePad,
  type WorldMoveInput,
} from "@/components/world3d/SharedWorldPlayer";
import { TowerRealmChamberEnvironment } from "@/components/world3d/TowerRealmChamberEnvironment";
import { WorldHUD } from "@/components/world3d/WorldHUD";
import { WorldInteractionPrompt } from "@/components/world3d/WorldInteractionPrompt";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import type { CanonicalRealmId } from "@/lib/realms/realm-registry";
import {
  getTowerPortalByInteractionId,
  TOWER_CHAMBER_CONFIG,
  TOWER_REALM_PORTALS,
  type TowerWorldQuality,
} from "@/lib/world3d/tower-realm-chamber-config";
import { resolveTowerRealmEntry } from "@/lib/world3d/tower-realm-entry";
import { WORLD3D_CANONICAL_RESTORED_EVENT } from "@/lib/world3d/canonical-bootstrap";
import { WorldVoiceButton } from "@/components/world3d/WorldVoiceButton";

type TowerWorldMetrics = {
  active: boolean;
  quality: TowerWorldQuality;
  fps: number;
  dpr: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  activeVideoRealmId: CanonicalRealmId | null;
  sampledAt: number;
};

declare global {
  interface Window {
    __LEVEL_UP_TOWER_3D_METRICS__?: TowerWorldMetrics;
  }
}

function TowerMetricsReporter({ quality, activeVideoRealmId }: { quality: TowerWorldQuality; activeVideoRealmId: CanonicalRealmId | null }) {
  const { gl } = useThree();
  const sample = useRef({ frames: 0, startedAt: 0 });
  useFrame(() => {
    const now = performance.now();
    if (!sample.current.startedAt) sample.current.startedAt = now;
    sample.current.frames += 1;
    if (now - sample.current.startedAt < 1000) return;
    window.__LEVEL_UP_TOWER_3D_METRICS__ = {
      active: true,
      quality,
      fps: Math.round((sample.current.frames * 1000) / (now - sample.current.startedAt)),
      dpr: gl.getPixelRatio(),
      drawCalls: gl.info.render.calls,
      triangles: gl.info.render.triangles,
      geometries: gl.info.memory.geometries,
      textures: gl.info.memory.textures,
      activeVideoRealmId,
      sampledAt: Date.now(),
    };
    sample.current = { frames: 0, startedAt: now };
  });
  useEffect(() => () => { delete window.__LEVEL_UP_TOWER_3D_METRICS__; }, []);
  return null;
}

function TowerScene({
  quality,
  reducedMotion,
  moveInput,
  activeInteractionId,
  onNearestTarget,
  progressByRealm,
  initialPosition,
}: {
  quality: TowerWorldQuality;
  reducedMotion: boolean;
  moveInput: WorldMoveInput;
  activeInteractionId: string | null;
  onNearestTarget: (id: string | null) => void;
  progressByRealm: Record<string, string>;
  initialPosition: [number, number, number];
}) {
  const activePortal = getTowerPortalByInteractionId(activeInteractionId);
  const targets = useMemo(() => [
    ...TOWER_REALM_PORTALS.map((portal) => ({
      id: portal.interactionId,
      position: portal.position,
      distance: 3.45,
    })),
    {
      id: TOWER_CHAMBER_CONFIG.exitInteractionId,
      position: TOWER_CHAMBER_CONFIG.exitPoint,
      distance: 4.6,
    },
  ], []);

  return (
    <>
      <color attach="background" args={["#211815"]} />
      <fog attach="fog" args={["#30211d", 30, 58]} />
      <hemisphereLight args={["#ffe8bd", "#211714", 1.15]} />
      <ambientLight color="#b98b62" intensity={0.42} />
      <directionalLight position={[-14, 24, 12]} color="#ffd69c" intensity={2.4} />
      <directionalLight position={[18, 12, -18]} color="#9eb6d4" intensity={0.38} />
      <TowerRealmChamberEnvironment
        quality={quality}
        reducedMotion={reducedMotion}
        activeInteractionId={activeInteractionId}
        progressByRealm={progressByRealm}
      />
      <SharedThirdPersonPlayer
        initialPosition={initialPosition}
        moveInput={moveInput}
        bounds={TOWER_CHAMBER_CONFIG.playableBounds}
        roamEllipse={TOWER_CHAMBER_CONFIG.roamEllipse}
        interactionTargets={targets}
        onNearestTargetId={onNearestTarget}
        initialYaw={0}
        initialPitch={-0.1}
        cameraDistance={9.5}
        cameraTargetHeight={2.4}
        speed={4.4}
      />
      <TowerMetricsReporter quality={quality} activeVideoRealmId={activePortal?.realmId ?? null} />
    </>
  );
}

function buildProgressSummary(realmId: CanonicalRealmId) {
  if (realmId !== "number" && realmId !== "measurement" && realmId !== "space" && realmId !== "statistics") return "COMING SOON";
  const progress = readProgress(realmId);
  if (!progress) return "BEGIN JOURNEY";
  const week = progress.assignedWeek ? ` · WEEK ${progress.assignedWeek}` : "";
  return `${progress.year.toUpperCase()}${week}`;
}

function buildProgressMap(version: number) {
  void version;
  return Object.fromEntries(
    TOWER_REALM_PORTALS.map((portal) => [portal.realmId, buildProgressSummary(portal.realmId)]),
  );
}

export default function TowerRealmChamber() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preview = searchParams.get("teacher_preview") === "1" || isDemoPreviewMode();
  const requestedQuality = searchParams.get("quality");
  const quality: TowerWorldQuality = requestedQuality === "low" || requestedQuality === "high" ? requestedQuality : "medium";
  const [moveInput, setMoveInput] = useState<WorldMoveInput>(EMPTY_WORLD_MOVE_INPUT);
  const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);
  const [busyRealmId, setBusyRealmId] = useState<CanonicalRealmId | null>(null);
  const [entryMessage, setEntryMessage] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [progressVersion, setProgressVersion] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const initialPosition = useMemo<[number, number, number]>(() => {
    const requestedSpawn = searchParams.get("spawn");
    const returnPortal = TOWER_REALM_PORTALS.find((portal) => `${portal.realmId}-return` === requestedSpawn);
    return returnPortal?.returnSpawn ?? TOWER_CHAMBER_CONFIG.spawnPoint;
  }, [searchParams]);

  const progressByRealm = useMemo(() => buildProgressMap(progressVersion), [progressVersion]);
  const activePortal = getTowerPortalByInteractionId(activeInteractionId);
  const atExit = activeInteractionId === TOWER_CHAMBER_CONFIG.exitInteractionId;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    const refresh = () => setProgressVersion((value) => value + 1);
    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
    window.addEventListener("focus", refresh);
    window.addEventListener(WORLD3D_CANONICAL_RESTORED_EVENT, refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener(WORLD3D_CANONICAL_RESTORED_EVENT, refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const key = "lul:tower-chamber:intro-seen:v1";
    try {
      if (sessionStorage.getItem(key) === "1") return;
      sessionStorage.setItem(key, "1");
      const reveal = window.setTimeout(() => setShowIntro(true), 0);
      const hide = window.setTimeout(() => setShowIntro(false), 2400);
      return () => { window.clearTimeout(reveal); window.clearTimeout(hide); };
    } catch { /* Introduction state is decorative. */ }
  }, []);

  const enterRealm = useCallback(async (realmId: CanonicalRealmId) => {
    if (busyRealmId) return;
    setEntryMessage(null);
    setBusyRealmId(realmId);
    try {
      const result = await resolveTowerRealmEntry({ realmId, teacherPreview: preview });
      if (result.status === "unavailable") {
        setEntryMessage(result.message);
        setBusyRealmId(null);
        return;
      }
      router.push(result.route);
    } catch (error) {
      console.warn("[TowerRealmChamber] Realm entry failed", error);
      setEntryMessage("We could not open that realm. Please try again.");
      setBusyRealmId(null);
    }
  }, [busyRealmId, preview, router]);

  const runActiveAction = useCallback(() => {
    if (activePortal) {
      void enterRealm(activePortal.realmId);
      return;
    }
    if (atExit) router.push(`/world?spawn=tower-exit-spawn${preview ? "&teacher_preview=1" : ""}`);
  }, [activePortal, atExit, enterRealm, preview, router]);

  return (
    <main data-world3d-root data-tower-realm-chamber style={{ position: "relative", width: "100vw", height: "100dvh", overflow: "hidden", background: "#211815" }}>
      <Canvas camera={{ position: [0, 6, 22], fov: 56 }} dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.25] : [1, 1.5]} gl={{ antialias: quality !== "low", powerPreference: "high-performance" }} shadows={false}>
        <TowerScene
          quality={quality}
          reducedMotion={reducedMotion}
          moveInput={moveInput}
          activeInteractionId={activeInteractionId}
          onNearestTarget={setActiveInteractionId}
          progressByRealm={progressByRealm}
          initialPosition={initialPosition}
        />
      </Canvas>

      <WorldHUD
        context="tower"
        preview={preview}
        accent="#e0ad55"
        fallbackHref={preview ? "/realms?teacher_preview=1" : "/realms"}
        primaryAction={{
          label: "EXIT TOWER",
          icon: "door",
          onClick: () => router.push(`/world?spawn=tower-exit-spawn${preview ? "&teacher_preview=1" : ""}`),
        }}
      />

      <WorldMovePad input={moveInput} onChange={setMoveInput} />
      {(activePortal || atExit) ? <WorldInteractionPrompt location={activePortal?.realm.name ?? "CENTRAL WORLD"} status={activePortal ? activePortal.subject : "Return to Tower Valley"} actionLabel={activePortal && activePortal.realm.status !== "live" ? "COMING SOON" : atExit ? "EXIT TOWER" : "ENTER REALM"} disabled={Boolean(activePortal && activePortal.realm.status !== "live")} busy={Boolean(busyRealmId)} onAction={runActiveAction} /> : null}
      <KeyboardWorldAction enabled={Boolean(activePortal || atExit)} onAction={runActiveAction} />

      {entryMessage ? <div role="status" style={{ position: "absolute", left: "50%", top: 105, transform: "translateX(-50%)", zIndex: 35, border: "1px solid rgba(255,214,147,.55)", borderRadius: 6, padding: "10px 14px", background: "rgba(44,28,22,.96)", color: "#fff1d1", fontWeight: 850, display: "flex", alignItems: "center", gap: 8 }}>{entryMessage}<WorldVoiceButton text={entryMessage} compact label="Read message" /></div> : null}
      {showIntro ? <div style={{ position: "absolute", inset: 0, zIndex: 25, display: "grid", placeItems: "center", background: "rgba(20,13,11,.28)", color: "#fff0cf", pointerEvents: "none", animation: "towerReveal 2.4s ease both" }}><div style={{ textAlign: "center", textShadow: "0 4px 20px #000", pointerEvents: "auto" }}><div style={{ fontSize: 12, fontWeight: 950, letterSpacing: "0.2em" }}>TOWER OF KNOWLEDGE</div><div style={{ marginTop: 7, fontSize: 31, fontWeight: 950 }}>Where all learning worlds meet</div><div style={{ marginTop: 12 }}><WorldVoiceButton text="Tower of Knowledge. Where all learning worlds meet." label="Read tower title" /></div></div><style>{`@keyframes towerReveal{0%{opacity:1;background:rgba(14,9,8,1)}28%,72%{opacity:1}100%{opacity:0}}`}</style></div> : null}
    </main>
  );
}
