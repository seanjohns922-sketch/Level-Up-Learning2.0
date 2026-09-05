"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Library, Star } from "lucide-react";
import LegendCardArtwork from "@/components/legends/LegendCardArtwork";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { Legend } from "@/data/legends";
import { markLegendUnlockVideoSeen } from "@/lib/legend-video-state";

/* ── animation stages ── */
type Stage =
  | "dark"        // black screen
  | "levelUp"     // "LEVEL COMPLETE!" flash
  | "silhouette"  // card silhouette tease
  | "burst"       // radial glow + particles
  | "reveal"      // card flips & reveals
  | "info"        // name + score + message
  | "ready";      // buttons visible

const TIMINGS: Record<Stage, number> = {
  dark: 500,
  levelUp: 1400,
  silhouette: 1000,
  burst: 800,
  reveal: 1200,
  info: 800,
  ready: 0,
};

/* ── particles ── */
function makeParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    i,
    x: 50 + (Math.random() - 0.5) * 80,
    y: 50 + (Math.random() - 0.5) * 80,
    size: 3 + Math.random() * 5,
    delay: Math.random() * 0.6,
    dur: 1.4 + Math.random() * 1,
    hue: Math.floor(Math.random() * 360),
  }));
}

function makeConfetti(count: number) {
  const colors = [
    "hsl(145 65% 42%)",
    "hsl(42 95% 55%)",
    "hsl(215 65% 52%)",
    "hsl(270 60% 60%)",
    "hsl(0 72% 60%)",
    "hsl(180 60% 50%)",
  ];
  return Array.from({ length: count }, (_, i) => ({
    i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    dur: 2 + Math.random() * 1.2,
    rot: Math.random() * 360,
    w: 6 + Math.random() * 8,
    h: 10 + Math.random() * 14,
    color: colors[Math.floor(Math.random() * colors.length)],
    drift: (Math.random() - 0.5) * 120,
  }));
}

export default function LegendUnlockReveal({
  legend,
  scorePercent,
  headerTitle = "LEVEL COMPLETE!",
  scoreLabel = "Well done",
  onContinue,
  onViewLegends,
}: {
  legend: Legend;
  scorePercent?: number;
  headerTitle?: string;
  scoreLabel?: string;
  onContinue: () => void;
  onViewLegends: () => void;
}) {
  const [stage, setStage] = useState<Stage>("dark");
  const [videoComplete, setVideoComplete] = useState(!legend.unlockVideoUrl);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const unlockVideoUrl = legend.unlockVideoUrl;

  const particles = useMemo(() => makeParticles(50), []);
  const confetti = useMemo(() => makeConfetti(100), []);

  useEffect(() => {
    const stages: Stage[] = ["dark", "levelUp", "silhouette", "burst", "reveal", "info", "ready"];
    let idx = 0;
    let timeout: NodeJS.Timeout;
    function next() {
      if (idx >= stages.length - 1) return;
      const current = stages[idx];
      timeout = setTimeout(() => {
        idx++;
        setStage(stages[idx]);
        next();
      }, TIMINGS[current]);
    }
    next();
    return () => clearTimeout(timeout);
  }, []);

  const past = (target: Stage) => {
    const order: Stage[] = ["dark", "levelUp", "silhouette", "burst", "reveal", "info", "ready"];
    return order.indexOf(stage) >= order.indexOf(target);
  };

  const showLevelUp = past("levelUp");
  const showSilhouette = past("silhouette");
  const showBurst = past("burst");
  const showReveal = past("reveal");
  const showInfo = past("info");
  const showButtons = past("ready");
  const hasUnlockVideo = Boolean(unlockVideoUrl);
  const revealSpeech = [
    `${headerTitle}. Legend unlocked.`,
    `You unlocked ${legend.name}.`,
    `${legend.strand}, ${legend.yearLabel}.`,
    scorePercent !== undefined ? `Your score was ${scorePercent} percent. ${scoreLabel}.` : "",
    legend.description,
    hasUnlockVideo ? "A Legend cinematic is available." : "",
    "You can choose View My Legends or Continue.",
  ].filter(Boolean).join(" ");

  useEffect(() => {
    if (!hasUnlockVideo || !showInfo || videoComplete || videoFailed || !videoRef.current) return;
    const playback = videoRef.current.play();
    if (playback && typeof playback.catch === "function") {
      playback.catch(() => {
        // Browser autoplay restrictions should not break the reward flow.
      });
    }
  }, [hasUnlockVideo, showInfo, videoComplete, videoFailed]);

  function finishUnlockVideo() {
    markLegendUnlockVideoSeen(legend.id);
    setVideoComplete(true);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-4 py-5 sm:py-7 lg:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background:
            stage === "dark"
              ? "radial-gradient(circle at 50% 50%, hsl(260 30% 4%), hsl(240 20% 2%))"
              : showBurst
              ? "radial-gradient(circle at 50% 50%, hsl(260 30% 12%), hsl(240 20% 6%))"
              : "radial-gradient(circle at 50% 50%, hsl(260 30% 8%), hsl(240 20% 4%))",
        }}
      />

      {/* ── STAGE: "LEVEL COMPLETE!" flash ── */}
      {showLevelUp && !showSilhouette && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div
            className="text-center"
            style={{ animation: "levelUpPulse 1.2s ease-out forwards" }}
          >
            {/* Diamond star icon — no emoji */}
            <svg
              viewBox="0 0 48 48"
              className="mx-auto mb-5"
              style={{
                width: 64,
                height: 64,
                animation: "bounceInEmoji 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
                filter: "drop-shadow(0 0 20px hsla(42, 95%, 55%, 0.7))",
              }}
            >
              <polygon
                points="24,2 29,18 46,18 33,28 38,44 24,35 10,44 15,28 2,18 19,18"
                fill="hsl(42, 95%, 55%)"
                stroke="hsla(42, 95%, 80%, 0.6)"
                strokeWidth="1"
              />
            </svg>
            <h1
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{
                color: "hsl(42 95% 55%)",
                textShadow: "0 0 40px hsla(42, 95%, 55%, 0.6), 0 0 80px hsla(42, 95%, 55%, 0.3)",
              }}
            >
              {headerTitle}
            </h1>
          </div>
        </div>
      )}

      {/* Radial glow burst */}
      {showBurst && (
        <div
          className="absolute"
          style={{
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, hsla(42, 95%, 55%, 0.5) 0%, hsla(145, 65%, 42%, 0.2) 35%, transparent 65%)",
            animation: "legendGlow 2s ease-out forwards",
          }}
        />
      )}

      {/* Sparkle particles */}
      {showBurst && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p) => (
            <span
              key={p.i}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                background: `hsla(${p.hue}, 80%, 70%, 0.9)`,
                boxShadow: `0 0 ${p.size * 2}px hsla(${p.hue}, 80%, 70%, 0.6)`,
                animation: `sparkleFloat ${p.dur}s ease-out ${p.delay}s both`,
              }}
            />
          ))}
        </div>
      )}

      {/* Confetti rain */}
      {showReveal && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {confetti.map((c) => (
            <span
              key={c.i}
              className="absolute rounded-sm"
              style={{
                left: `${c.left}%`,
                top: "-20px",
                width: `${c.w}px`,
                height: `${c.h}px`,
                background: c.color,
                transform: `rotate(${c.rot}deg)`,
                animation: `confettiFall ${c.dur}s ease-in ${c.delay}s forwards`,
                ["--drift" as string]: `${c.drift}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center lg:max-w-[900px]">
        {/* "LEGEND UNLOCKED" header text */}
        {showBurst && (
          <div
            className="transition-all duration-500"
            style={{
              opacity: showBurst ? 1 : 0,
              transform: showBurst ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
            }}
          >
            <div
                className="mb-4 text-xs font-black tracking-[0.26em] sm:text-sm"
              style={{
                color: "hsl(42, 95%, 55%)",
                textShadow: "0 0 30px hsla(42, 95%, 55%, 0.5)",
                animation: "shimmerText 2s ease-in-out infinite",
              }}
            >
              <span className="inline-flex items-center gap-2">
                <Star className="h-5 w-5" fill="currentColor" /> LEGEND UNLOCKED{" "}
                <Star className="h-5 w-5" fill="currentColor" />
              </span>
            </div>
          </div>
        )}

        {/* Card + details — two columns on iPad landscape */}
        <div className="flex w-full flex-col items-center lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:items-center lg:gap-7">
        {/* Card — silhouette then reveal */}
        {showSilhouette && (
          <div
            className="relative transition-all lg:flex-shrink-0"
            style={{
              opacity: 1,
              transform: showReveal
                ? "scale(1) rotateY(0deg)"
                : "scale(0.9) rotateY(0deg)",
              transition: "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              perspective: "1000px",
            }}
          >
            {/* Glow ring behind card */}
            <div
              className="absolute -inset-4 rounded-lg"
              style={{
                background: showReveal
                  ? "linear-gradient(135deg, hsla(42, 95%, 55%, 0.4), hsla(145, 65%, 42%, 0.3), hsla(270, 60%, 60%, 0.3))"
                  : "transparent",
                filter: "blur(24px)",
                animation: showReveal ? "pulseGlow 2s ease-in-out infinite" : "none",
                transition: "all 0.6s ease",
              }}
            />

            {/* Card image */}
            <div
              className="relative aspect-[2/3] w-[190px] overflow-hidden rounded-lg shadow-2xl sm:w-[220px]"
              style={{
                animation: showSilhouette && !showReveal
                  ? "silhouetteFloat 2s ease-in-out infinite alternate"
                  : showReveal
                  ? "cardRevealPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                  : "none",
              }}
            >
              <LegendCardArtwork
                src={legend.images.cardFront}
                alt={legend.name}
                className="h-full w-full"
                style={{
                  filter: showReveal ? "brightness(1) saturate(1)" : "brightness(0) saturate(0)",
                  transition: "filter 0.8s ease-out",
                }}
              />
              {/* Silhouette overlay */}
              {!showReveal && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, hsla(260, 30%, 15%, 0.9), hsla(240, 20%, 8%, 0.95))",
                    transition: "opacity 0.6s ease",
                    opacity: showReveal ? 0 : 1,
                  }}
                />
              )}
              {/* Question mark on silhouette */}
              {!showReveal && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-6xl font-black"
                    style={{
                      color: "hsla(42, 95%, 55%, 0.4)",
                      textShadow: "0 0 20px hsla(42, 95%, 55%, 0.2)",
                      animation: "silhouettePulse 1.5s ease-in-out infinite",
                    }}
                  >
                    ?
                  </span>
                </div>
              )}
              {/* Shine sweep on reveal */}
              {showReveal && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(105deg, transparent 40%, hsla(0,0%,100%,0.5) 45%, hsla(0,0%,100%,0.15) 50%, transparent 55%)",
                    animation: "shineSweep 1.2s ease-out 0.2s both",
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* RIGHT column: details + cinematic + actions */}
        <div className="flex w-full flex-col items-center lg:items-stretch">
        {/* Legend name + score + message */}
        <div
          className="mt-5 text-center transition-all duration-600 lg:mt-0 lg:text-left"
          style={{
            opacity: showInfo ? 1 : 0,
            transform: showInfo ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease-out",
          }}
        >
          <p
            className="mb-1 text-[11px] font-bold tracking-[0.2em]"
            style={{ color: "hsla(42, 95%, 55%, 0.8)" }}
          >
            YOU UNLOCKED
          </p>
          <h2
            className="mb-1 text-2xl font-black sm:text-3xl"
            style={{ color: "hsl(0 0% 100%)" }}
          >
            {legend.name}
          </h2>
          <p
            className="mb-3 text-sm font-semibold"
            style={{ color: "hsla(0, 0%, 100%, 0.5)" }}
          >
            {legend.strand} · {legend.yearLabel}
          </p>

          {/* Score badge */}
          {scorePercent !== undefined && (
            <div
              className="mb-3 inline-flex items-center gap-3 rounded-lg px-4 py-2"
              style={{
                background: "hsla(42, 95%, 55%, 0.12)",
                border: "1px solid hsla(42, 95%, 55%, 0.25)",
              }}
            >
              <span
                className="text-3xl font-black"
                style={{ color: "hsl(42, 95%, 55%)" }}
              >
                {scorePercent}%
              </span>
              <span
                className="text-sm font-bold"
                style={{ color: "hsla(0, 0%, 100%, 0.7)" }}
              >
                {scoreLabel}
              </span>
            </div>
          )}

          <p
            className="mx-auto max-w-md text-sm leading-relaxed lg:mx-0"
            style={{ color: "hsla(0, 0%, 100%, 0.6)" }}
          >
            {legend.description}
          </p>

          <ReadAloudBtn
            text={revealSpeech}
            speechKey={`legend-unlock-results-${legend.id}`}
            label="Read results"
            className="mt-3 border-white/20 bg-white/10 text-white hover:bg-white/15"
          />

          {showInfo && hasUnlockVideo ? (
            <div className="mt-4 w-full rounded-lg border border-white/12 bg-black/30 p-2 backdrop-blur-sm">
              <div className="mb-2 text-[11px] font-bold tracking-[0.22em]" style={{ color: "hsla(42, 95%, 55%, 0.86)" }}>
                LEGEND CINEMATIC
              </div>
              <div className="overflow-hidden rounded-lg bg-black shadow-2xl">
                <div className="aspect-video w-full">
                  {videoFailed ? (
                    <div className="flex h-full items-center justify-center px-5 text-center text-sm text-white/75">
                      Video unavailable right now. You can still continue and view the legend.
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      src={unlockVideoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="h-full w-full"
                      onEnded={finishUnlockVideo}
                      onError={() => {
                        setVideoFailed(true);
                        finishUnlockVideo();
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Action buttons */}
        <div
          className="mt-4 grid w-full gap-3 transition-all duration-500 sm:grid-cols-2"
          style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <button
            onClick={() => {
              if (hasUnlockVideo) finishUnlockVideo();
              onViewLegends();
            }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-bold transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, hsl(42, 95%, 55%), hsl(35, 95%, 50%))",
              color: "hsl(30, 50%, 12%)",
              boxShadow: "0 4px 24px hsla(42, 95%, 55%, 0.5)",
            }}
          >
            <Library className="h-5 w-5" aria-hidden />
            View My Legends
          </button>
          <button
            onClick={() => {
              if (hasUnlockVideo) finishUnlockVideo();
              onContinue();
            }}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-3 font-bold text-white/90 transition-all duration-200 hover:bg-white/15 active:scale-[0.98]"
            style={{
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            Continue
            <ArrowRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
        </div>{/* right column */}
        </div>{/* two-column row */}
      </div>

      <style jsx>{`
        @keyframes legendGlow {
          0% { transform: scale(0.2); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: scale(1.5); opacity: 0.3; }
        }
        @keyframes sparkleFloat {
          0% { transform: scale(0) translateY(0); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: scale(1) translateY(-60px); opacity: 0; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) translateX(var(--drift)) rotate(720deg); opacity: 0; }
        }
        @keyframes shimmerText {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes shineSweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes levelUpPulse {
          0% { transform: scale(0.5); opacity: 0; }
          40% { transform: scale(1.1); opacity: 1; }
          60% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bounceInEmoji {
          0% { transform: scale(0) rotate(-20deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes silhouetteFloat {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
        @keyframes silhouettePulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes cardRevealPop {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
