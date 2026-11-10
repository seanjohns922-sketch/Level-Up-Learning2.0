"use client";

import { Html, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type {
  TowerRealmPortalConfig,
  TowerWorldQuality,
} from "@/lib/world3d/tower-realm-chamber-config";

// Chronorok is the games realm: it is live but never a lesson choice, so it opens on "live" alone.
const portalOpen = (config: { realmId: string; realm: { status: string; isSelectable: boolean } }) =>
  config.realm.status === "live" && (config.realm.isSelectable || config.realmId === "time");

type RealmPortal3DProps = {
  config: TowerRealmPortalConfig;
  nearby: boolean;
  videoActive: boolean;
  quality: TowerWorldQuality;
  reducedMotion: boolean;
  progressSummary: string;
  previewAvailable?: boolean;
};

declare global {
  interface Window {
    __LEVEL_UP_TOWER_ACTIVE_VIDEO__?: HTMLVideoElement;
  }
}

function ActiveVideoSurface({ src }: { src: string }) {
  const [media, setMedia] = useState<{ video: HTMLVideoElement; texture: THREE.VideoTexture } | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = src;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const markReady = () => setMedia({ video, texture });
    video.addEventListener("loadeddata", markReady);
    window.__LEVEL_UP_TOWER_ACTIVE_VIDEO__ = video;
    void video.play().catch(() => {});
    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.pause();
      video.removeAttribute("src");
      video.load();
      texture.dispose();
      setMedia((current) => current?.video === video ? null : current);
      if (window.__LEVEL_UP_TOWER_ACTIVE_VIDEO__ === video) {
        delete window.__LEVEL_UP_TOWER_ACTIVE_VIDEO__;
      }
    };
  }, [src]);

  if (!media) return null;
  return (
    <mesh position={[0, 0, 0.09]}>
      <planeGeometry args={[6.15, 7.75]} />
      <meshBasicMaterial map={media.texture} toneMapped={false} />
    </mesh>
  );
}

function PortalWindow({
  config,
  videoActive,
  quality,
  reducedMotion,
  previewAvailable = false,
}: Pick<RealmPortal3DProps, "config" | "videoActive" | "quality" | "reducedMotion" | "previewAvailable">) {
  const poster = useTexture(config.posterAsset);
  const available = portalOpen(config) || previewAvailable;
  const canPlay = videoActive
    && quality !== "low"
    && !reducedMotion
    && available
    && Boolean(config.previewVideo);

  const isComingSoon = !available;
  return (
    <group position={[0, 4.55, 0.08]}>
      <mesh>
        <planeGeometry args={[6.15, 7.75]} />
        <meshBasicMaterial map={poster} toneMapped={false} color={isComingSoon ? "#48524a" : "#ffffff"} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[6.15, 7.75]} />
        <meshBasicMaterial
          color={isComingSoon ? "#172019" : config.accentSoft}
          transparent
          opacity={isComingSoon ? 0.76 : videoActive ? 0.1 : 0.3}
          toneMapped={false}
        />
      </mesh>
      {isComingSoon ? (
        <group position={[0, 0, 0.09]}>
          <RoundedBox args={[4.65, 5.65, 0.24]} radius={0.2} smoothness={2}>
            <meshStandardMaterial color="#111812" metalness={0.36} roughness={0.76} />
          </RoundedBox>
          <mesh position={[0, 0.55, 0.2]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[1.65, 1.65, 0.12]} />
            <meshStandardMaterial
              color="#29382d"
              emissive={config.accentSoft}
              emissiveIntensity={0.08}
              metalness={0.55}
              roughness={0.48}
            />
          </mesh>
          <Html center position={[0, 0.55, 0.3]} distanceFactor={12} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ width: 110, textAlign: "center", color: "#c8d3c9", fontSize: 28, fontWeight: 950, textShadow: "0 2px 10px #000" }}>{config.symbol}</div>
          </Html>
          <Html center position={[0, -1.55, 0.3]} distanceFactor={12} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
            <div style={{ width: 190, borderTop: `1px solid ${config.accentSoft}`, paddingTop: 10, textAlign: "center", color: "#f3ead8", fontSize: 15, fontWeight: 950, letterSpacing: "0.12em", textShadow: "0 2px 10px #000" }}>COMING SOON</div>
          </Html>
        </group>
      ) : null}
      {canPlay && config.previewVideo ? <ActiveVideoSurface src={config.previewVideo} /> : null}
    </group>
  );
}

export function RealmPortal3D({
  config,
  nearby,
  videoActive,
  quality,
  reducedMotion,
  progressSummary,
  previewAvailable = false,
}: RealmPortal3DProps) {
  const energyRef = useRef<THREE.Mesh>(null);
  const frameColor = nearby ? "#d6b06b" : "#866a45";
  const available = portalOpen(config) || previewAvailable;

  useFrame(({ clock }) => {
    if (!energyRef.current) return;
    const pulse = reducedMotion ? 1 : 0.94 + Math.sin(clock.elapsedTime * 2.2) * 0.06;
    energyRef.current.scale.setScalar(nearby ? pulse : 0.88);
  });

  return (
    <group position={config.position} rotation={[0, config.rotationY, 0]}>
      <RoundedBox args={[1.15, 9.2, 1.1]} radius={0.12} smoothness={2} position={[-3.65, 4.6, 0]}>
        <meshStandardMaterial color="#46362c" roughness={0.72} metalness={0.12} />
      </RoundedBox>
      <RoundedBox args={[1.15, 9.2, 1.1]} radius={0.12} smoothness={2} position={[3.65, 4.6, 0]}>
        <meshStandardMaterial color="#46362c" roughness={0.72} metalness={0.12} />
      </RoundedBox>
      <mesh position={[0, 9.15, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[5.35, 5.35, 1.05]} />
        <meshStandardMaterial color="#46362c" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh position={[0, 9.15, 0.6]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[3.95, 3.95, 0.16]} />
        <meshStandardMaterial color={frameColor} emissive={config.accentSoft} emissiveIntensity={nearby ? 0.75 : 0.18} metalness={0.7} roughness={0.3} />
      </mesh>
      <PortalWindow config={config} videoActive={videoActive} quality={quality} reducedMotion={reducedMotion} previewAvailable={previewAvailable} />
      <mesh ref={energyRef} position={[0, 0.14, 0.28]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3.15, 0.11, 10, 48]} />
        <meshBasicMaterial color={config.accent} toneMapped={false} transparent opacity={available ? (nearby ? 0.95 : 0.42) : 0.12} />
      </mesh>
      {/* A real nameplate on the portal's crest: it sits in the world, so pillars hide it and it scales with distance. */}
      <RealmNameplate name={config.realm.name} subject={available ? config.subject : "COMING SOON"} accent={config.accent} lit={nearby} />
    </group>
  );
}

function RealmNameplate({ name, subject, accent, lit }: { name: string; subject: string; accent: string; lit: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; canvas.height = 320;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, 0, 320);
    grad.addColorStop(0, "#2b1f19"); grad.addColorStop(1, "#140e0b");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 320);
    ctx.strokeStyle = "#d9b56f"; ctx.lineWidth = 6; ctx.strokeRect(10, 10, 1004, 300);
    ctx.strokeStyle = "rgba(217,181,111,.35)"; ctx.lineWidth = 2; ctx.strokeRect(24, 24, 976, 272);
    ctx.textAlign = "center"; ctx.fillStyle = "#fff6e2";
    ctx.font = "800 104px system-ui, sans-serif"; ctx.fillText(name, 512, 140, 940);
    ctx.fillStyle = accent; ctx.fillRect(452, 172, 120, 7);
    ctx.font = "800 56px system-ui, sans-serif"; ctx.fillText(subject.toUpperCase(), 512, 262, 940);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
    return map;
  }, [name, subject, accent]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <group position={[0, 9.15, 0.74]}>
      <mesh>
        <planeGeometry args={[5.6, 1.75]} />
        <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[5.82, 1.97]} />
        <meshBasicMaterial color={lit ? accent : "#5a4630"} toneMapped={false} fog={false} />
      </mesh>
    </group>
  );
}
