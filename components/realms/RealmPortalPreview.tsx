"use client";

import { useEffect, useRef, useState } from "react";

export const REALM_PORTAL_VIDEOS: Record<string, string | undefined> = {
  "number-nexus": "/videos/realms/number-nexus.mp4",
  measurelands: "/videos/realms/measurelands.mp4",
  "pattern-peaks": "/videos/realms/pattern-peaks.mp4",
  "starpath-realm": "/videos/realms/starpath-realm.mp4",
  statistica: "/videos/realms/statistica.mp4",
  "chance-hollow": "/videos/realms/chance-hollow.mp4",
  "reading-ridge": "/videos/realms/reading-ridge.mp4",
  "inkwell-wilds": "/videos/realms/inkwell-wilds.mp4",
  "runehaven-peaks": "/videos/realms/runehaven-peaks.mp4",
  chronorok: "/videos/realms/chronorok.mp4",
};

type RealmPortalPreviewProps = {
  realmId: string;
  symbol: string;
  color: string;
  colorDim: string;
  isSelected: boolean;
  levelNumber?: number;
};

export default function RealmPortalPreview({
  realmId,
  symbol,
  color,
  colorDim,
  isSelected,
  levelNumber,
}: RealmPortalPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  const videoSrc = REALM_PORTAL_VIDEOS[realmId];
  const requiresLevel3Video = realmId === "pattern-peaks" || realmId === "statistica";
  const isRealmVideoUnlocked =
    !requiresLevel3Video || (typeof levelNumber === "number" && levelNumber >= 3);
  const shouldShowVideo = isSelected && isRealmVideoUnlocked && Boolean(videoSrc) && !hasVideoError;

  useEffect(() => {
    setHasVideoError(false);
  }, [realmId]);

  useEffect(() => {
    if (!shouldShowVideo || !videoRef.current) return;
    const video = videoRef.current;
    video.defaultMuted = true;
    video.muted = true;
    video.load();
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, [shouldShowVideo, videoSrc]);

  if (shouldShowVideo && videoSrc) {
    return (
      <div className="absolute inset-[12px] overflow-hidden rounded-t-full rounded-b-[28px] border border-white/10 shadow-[inset_0_0_24px_rgba(0,0,0,0.35)]">
        <video
          ref={videoRef}
          key={realmId}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          disableRemotePlayback
          onError={() => setHasVideoError(true)}
          className="h-full w-full object-cover scale-[1.02] brightness-110"
        />
        <div className="pointer-events-none absolute inset-0 bg-black/20" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,10,14,0.1) 0%, rgba(8,10,14,0.02) 35%, rgba(8,10,14,0.3) 100%)",
            boxShadow: `inset 0 0 24px ${colorDim}`,
          }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span
        className="text-5xl md:text-6xl"
        style={{
          color,
          filter: `drop-shadow(0 0 12px ${colorDim})`,
          transition: "all 0.4s ease",
        }}
      >
        {symbol}
      </span>
    </div>
  );
}
