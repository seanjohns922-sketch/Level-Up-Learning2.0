"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { ArrowRight, Library } from "lucide-react";
import LegendCardArtwork from "@/components/legends/LegendCardArtwork";
import ReliqsWordmark from "@/components/brand/ReliqsWordmark";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { Legend } from "@/data/legends";
import { RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";
import { markLegendUnlockVideoSeen } from "@/lib/legend-video-state";
import { getReliqsColor } from "@/lib/reliqs-brand";
import styles from "./LegendUnlockReveal.module.css";

/* ── animation stages ── */
type Stage =
  | "intro"   // realm RELIQS wordmark + header title
  | "seal"    // sealed card rises in, castle Q draws on
  | "charge"  // card charges up, particles converge
  | "flip"    // flash, shockwave, card flips to its front
  | "info"    // name + score + message
  | "ready";  // buttons visible

const ORDER: Stage[] = ["intro", "seal", "charge", "flip", "info", "ready"];

const TIMINGS: Record<Stage, number> = {
  intro: 2100,
  seal: 1500,
  charge: 1000,
  flip: 1000,
  info: 600,
  ready: 0,
};

/* ── particles ── */
type Particle = { i: number; x: number; y: number; size: number; delay: number; dur: number; color: string };

function makeParticles(count: number, minRadius: number, maxRadius: number, maxDelay: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const radius = minRadius + Math.random() * (maxRadius - minRadius);
    return {
      i,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      size: 2 + Math.random() * 5,
      delay: Math.random() * maxDelay,
      dur: 0.7 + Math.random() * 0.8,
      color: colors[i % colors.length],
    };
  });
}

function hexToRgbTriple(hex: string) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return "161 161 170";
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function ParticleField({ particles, className }: { particles: Particle[]; className: string }) {
  return (
    <div className={styles.particles} aria-hidden>
      {particles.map((p) => (
        <span
          key={p.i}
          className={`${styles.particle} ${className}`}
          style={{
            width: p.size,
            height: p.size,
            ["--p-x" as string]: `${p.x}px`,
            ["--p-y" as string]: `${p.y}px`,
            ["--p-delay" as string]: `${p.delay}s`,
            ["--p-dur" as string]: `${p.dur}s`,
            ["--p-color" as string]: p.color,
          }}
        />
      ))}
    </div>
  );
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
  const [stage, setStage] = useState<Stage>("intro");
  const [videoComplete, setVideoComplete] = useState(!legend.unlockVideoUrl);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const unlockVideoUrl = legend.unlockVideoUrl;

  const realmColor = getReliqsColor(legend.realmId);
  const realmRgb = hexToRgbTriple(realmColor);
  const themeVars = { ["--realm" as string]: realmColor, ["--realm-rgb" as string]: realmRgb } as CSSProperties;

  const converge = useMemo(
    () => makeParticles(46, 150, 320, 0.5, ["rgb(var(--realm-rgb))", "#ffffff", "rgb(var(--realm-rgb))"]),
    [],
  );
  const burst = useMemo(
    () => makeParticles(70, 180, 420, 0.12, ["rgb(var(--realm-rgb))", "#ffffff", "#ffe7a3", "rgb(var(--realm-rgb))"]),
    [],
  );
  const ambient = useMemo(
    () => makeParticles(18, 150, 260, 3, ["rgb(var(--realm-rgb))", "#ffffff"]).map((p) => ({ ...p, dur: 3 + p.dur * 2 })),
    [],
  );

  useEffect(() => {
    if (stage === "ready") return;
    // Reduced motion goes straight to the revealed card.
    const reduced = prefersReducedMotion();
    const timeout = setTimeout(
      () => setStage(reduced ? "ready" : ORDER[ORDER.indexOf(stage) + 1]),
      reduced ? 0 : TIMINGS[stage],
    );
    return () => clearTimeout(timeout);
  }, [stage]);

  const past = (target: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(target);

  const showIntro = stage === "intro" || stage === "seal";
  const showCard = past("seal");
  const flipped = past("flip");
  const showInfo = past("info");
  const showButtons = past("ready");
  const hasUnlockVideo = Boolean(unlockVideoUrl);
  const revealSpeech = [
    `${headerTitle}. RELIQ card unlocked.`,
    `You unlocked ${legend.name}.`,
    `${legend.strand}, ${legend.yearLabel}.`,
    scorePercent !== undefined ? `Your score was ${scorePercent} percent. ${scoreLabel}.` : "",
    legend.description,
    hasUnlockVideo ? "A RELIQ cinematic is available." : "",
    "You can choose View My RELIQS or Continue.",
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

  function skipIntro() {
    if (!showInfo) setStage("info");
  }

  /* Holographic tilt once the card is revealed: the card follows the pointer and the foil catches the light. */
  function handleTilt(event: PointerEvent<HTMLDivElement>) {
    const el = tiltRef.current;
    if (!el || !showInfo || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    el.style.transform = `rotateY(${(px - 0.5) * 22}deg) rotateX(${(0.5 - py) * 22}deg) scale(1.03)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--fx", `${px * 100}%`);
    el.style.setProperty("--fy", `${py * 100}%`);
    el.style.setProperty("--foil-opacity", "0.7");
  }

  function resetTilt() {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = "";
    el.style.removeProperty("--foil-opacity");
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto overflow-x-hidden" style={themeVars} onClick={skipIntro}>
      <div className={`${styles.backdrop} ${stage === "intro" ? styles.backdropDim : ""}`} />
      <div className={styles.vignette} />

      {/* ── Intro: RELIQS wordmark in the realm's colour ── */}
      {showIntro && (
        <div className={`${styles.intro} ${stage === "seal" ? styles.introOut : ""}`}>
          <div className={styles.wordmark}>
            <ReliqsWordmark color={realmColor} />
          </div>
          <p className={styles.introTitle}>{headerTitle}</p>
        </div>
      )}

      {flipped && stage === "flip" && <div className={styles.flash} aria-hidden />}

      <div className="relative flex min-h-full w-full items-center justify-center overflow-hidden px-4 py-8">
        <div className="relative z-10 flex w-full max-w-[400px] flex-col items-center lg:max-w-[920px]">
          <div className={`flex w-full flex-col items-center ${showInfo ? "lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-center lg:gap-10" : ""}`}>
            {/* ── Card: sealed, then flipped to the front ── */}
            {showCard && (
              <div
                className={`${styles.cardStage} flex items-center justify-center lg:flex-shrink-0`}
                onPointerMove={handleTilt}
                onPointerLeave={resetTilt}
              >
                <div className={styles.rays} aria-hidden />
                {stage === "charge" && <ParticleField particles={converge} className={styles.converge} />}
                {flipped && stage !== "ready" && <ParticleField particles={burst} className={styles.burst} />}
                {showInfo && <ParticleField particles={ambient} className={styles.drift} />}
                {flipped && stage === "flip" && <div className={styles.shockwave} aria-hidden />}

                <div className={`${styles.cardWrap} ${stage === "seal" ? styles.cardEnter : stage === "charge" ? styles.cardCharging : ""}`}>
                  <div className={styles.cardHalo} aria-hidden />
                  <div ref={tiltRef} className={styles.tilt}>
                    <div className={`${styles.flipper} aspect-[2/3] ${flipped ? styles.flipped : ""}`}>
                      <div className={`${styles.face} ${styles.faceSealed}`} aria-hidden>
                        <div className={styles.sealedPattern} />
                        <svg viewBox="209 0 72 80" className={styles.emblem}>
                          <path d={RELIQ_Q_PATH} className={styles.emblemFill} />
                          <path d={RELIQ_Q_PATH} className={styles.emblemStroke} pathLength={1} />
                        </svg>
                        <span className={styles.sealedLabel}>RELIQ</span>
                        <div className={styles.foil} />
                      </div>
                      <div className={`${styles.face} ${styles.faceFront}`}>
                        <LegendCardArtwork src={legend.images.cardFront} alt={legend.name} className="h-full w-full" />
                        <div className={styles.foil} aria-hidden />
                        {flipped && <div className={styles.sweep} aria-hidden />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Details + cinematic + actions ── */}
            {showInfo && (
              <div className="relative z-10 mt-8 flex w-full flex-col items-center lg:mt-0 lg:items-stretch">
                <div className={`text-center lg:text-left ${styles.rise}`}>
                  <p className={styles.unlockedTag}>RELIQ UNLOCKED</p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{legend.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-white/55">
                    {legend.strand} · {legend.yearLabel}
                  </p>

                  {scorePercent !== undefined && (
                    <div
                      className="mt-4 inline-flex items-center gap-3 rounded-xl px-4 py-2"
                      style={{ background: `rgb(${realmRgb} / 0.12)`, border: `1px solid rgb(${realmRgb} / 0.35)` }}
                    >
                      <span className="text-3xl font-black" style={{ color: realmColor }}>
                        {scorePercent}%
                      </span>
                      <span className="text-sm font-bold text-white/75">{scoreLabel}</span>
                    </div>
                  )}

                  <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-white/65 lg:mx-0">{legend.description}</p>

                  <ReadAloudBtn
                    text={revealSpeech}
                    speechKey={`legend-unlock-results-${legend.id}`}
                    label="Read results"
                    className="mt-3 border-white/20 bg-white/10 text-white hover:bg-white/15"
                  />

                  {hasUnlockVideo ? (
                    <div className="mt-4 w-full rounded-xl border border-white/12 bg-black/30 p-2 backdrop-blur-sm">
                      <div className="mb-2 text-[11px] font-bold tracking-[0.22em]" style={{ color: realmColor }}>
                        RELIQ CINEMATIC
                      </div>
                      <div className="overflow-hidden rounded-lg bg-black shadow-2xl">
                        <div className="aspect-video w-full">
                          {videoFailed ? (
                            <div className="flex h-full items-center justify-center px-5 text-center text-sm text-white/75">
                              Video unavailable right now. You can still continue and view your RELIQ.
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

                <div
                  className="mt-5 grid w-full gap-3 transition-all duration-500 sm:grid-cols-2"
                  style={{ opacity: showButtons ? 1 : 0, transform: showButtons ? "translateY(0)" : "translateY(16px)" }}
                >
                  <button
                    onClick={() => {
                      if (hasUnlockVideo) finishUnlockVideo();
                      onViewLegends();
                    }}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold text-[#0b0d14] transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
                    style={{
                      background: `linear-gradient(135deg, rgb(${realmRgb}), rgb(${realmRgb} / 0.8))`,
                      boxShadow: `0 6px 28px rgb(${realmRgb} / 0.45)`,
                    }}
                  >
                    <Library className="h-5 w-5" aria-hidden />
                    View My RELIQS
                  </button>
                  <button
                    onClick={() => {
                      if (hasUnlockVideo) finishUnlockVideo();
                      onContinue();
                    }}
                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-bold text-white/90 transition-all duration-200 hover:bg-white/15 active:scale-[0.98]"
                    style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
                  >
                    Continue
                    <ArrowRight className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {!showInfo && (
        <button type="button" className={styles.skipHint} onClick={skipIntro}>
          Tap to skip
        </button>
      )}
    </div>
  );
}
