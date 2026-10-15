"use client";

import { useEffect, useRef, type ComponentType, type CSSProperties } from "react";
import styles from "./StreakBurst.module.css";

export type StreakGlyph = ComponentType<{ className?: string; style?: CSSProperties }>;

/**
 * The shared streak celebration used by ComboActivation (3/5/8 in a row) and
 * NexusActivation (10 in a row). Realm components supply the title, colours and
 * glyphs; this owns the feel:
 *   hit-stop vignette → a quick screen shake → the count slams in over spinning
 *   rays and a magic circle of realm glyphs → spark physics → the title banner
 *   slides through → the number flies into the on-screen streak counter.
 * `power` scales everything (1 = small, 4 = the 10-streak finale with confetti).
 * Never blocks input (pointer-events: none) and respects reduced motion.
 */

export type StreakBurstProps = {
  count: number;
  power: 1 | 2 | 3 | 4;
  title: string;
  engaged: string;
  subtitle?: string;
  /** The realm's two hues (HSL degrees). */
  hues: [number, number];
  /** Fill for the big number, usually the tier's title gradient. */
  face: string;
  glyphs?: StreakGlyph[];
  heroImage?: string;
  /** Total length in seconds. */
  duration: number;
};

const SHAKE_PX = [0, 3, 5, 8, 12];
const SPARKS = [0, 40, 70, 100, 150];
const RING_COUNT = [0, 1, 2, 3, 4];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

/** Spark burst with gravity and motion trails, plus a confetti rain for the finale. Stops itself. */
function useSparks(canvasRef: React.RefObject<HTMLCanvasElement | null>, power: number, hues: [number, number], duration: number) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    const cx = W / 2;
    const cy = H * 0.42;
    const colour = (i: number) => (i % 4 === 0 ? "hsl(48 100% 92%)" : `hsl(${hues[i % 2]} 95% ${58 + (i % 3) * 8}%)`);

    type Spark = { x: number; y: number; px: number; py: number; vx: number; vy: number; life: number; decay: number; w: number; c: string };
    const sparks: Spark[] = Array.from({ length: SPARKS[power] }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const speed = (6 + Math.random() * 10) * (0.8 + power * 0.15);
      return { x: cx, y: cy, px: cx, py: cy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 3, life: 1, decay: 0.012 + Math.random() * 0.018, w: 1.5 + Math.random() * 2.5, c: colour(i) };
    });

    type Bit = { x: number; y: number; vy: number; vx: number; rot: number; vr: number; w: number; h: number; c: string; delay: number };
    const confetti: Bit[] = power >= 4
      ? Array.from({ length: 120 }, (_, i) => ({
        x: Math.random() * W, y: -20 - Math.random() * H * 0.4, vy: 2.2 + Math.random() * 2.8, vx: (Math.random() - 0.5) * 1.6,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.25, w: 6 + Math.random() * 6, h: 10 + Math.random() * 10,
        c: i % 5 === 0 ? "#ffffff" : `hsl(${hues[i % 2] + (i % 3) * 20} 92% 60%)`, delay: Math.random() * 30,
      }))
      : [];

    let raf = 0;
    let frame = 0;
    const end = performance.now() + duration * 1000;
    const tick = (now: number) => {
      frame += 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const s of sparks) {
        if (s.life <= 0) continue;
        s.px = s.x;
        s.py = s.y;
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.965;
        s.vy = s.vy * 0.965 + 0.32;
        s.life -= s.decay;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.strokeStyle = s.c;
        ctx.lineWidth = s.w;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(s.px - s.vx * 1.5, s.py - s.vy * 1.5);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";
      for (const b of confetti) {
        if (frame < b.delay) continue;
        b.x += b.vx + Math.sin((frame + b.delay) / 14) * 0.8;
        b.y += b.vy;
        b.rot += b.vr;
        ctx.globalAlpha = Math.max(0, Math.min(1, (end - now) / 500));
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.rot);
        ctx.scale(1, Math.cos(frame / 6 + b.delay));
        ctx.fillStyle = b.c;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      if (now < end) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, power, hues, duration]);
}

export default function StreakBurst({ count, power, title, engaged, subtitle, hues, face, glyphs, heroImage, duration }: StreakBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const numberRef = useRef<HTMLDivElement | null>(null);
  useSparks(canvasRef, power, hues, duration);

  // Impact shake, then the number flies into the streak counter and the counter pulses.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const amp = SHAKE_PX[power];
    const shake = document.body.animate(
      [0, -1, 0.8, -0.6, 0.4, -0.2, 0].map((k, i) => ({ transform: `translate(${k * amp}px, ${(i % 2 ? 1 : -1) * k * amp * 0.6}px)` })),
      { duration: 320, delay: 70, easing: "ease-out" },
    );
    const flyAt = duration * 1000 - 520;
    const timer = window.setTimeout(() => {
      const el = numberRef.current;
      if (!el) return;
      const from = el.getBoundingClientRect();
      const counter = document.querySelector("[data-combo-counter]");
      const to = counter?.getBoundingClientRect();
      const visible = to && to.width > 0 && to.bottom > 0 && to.top < window.innerHeight;
      const dx = visible ? to.left + to.width / 2 - (from.left + from.width / 2) : 0;
      const dy = visible ? to.top + to.height / 2 - (from.top + from.height / 2) : -window.innerHeight * 0.5;
      el.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.12)`, opacity: 0.3 },
        ],
        { duration: 480, easing: "cubic-bezier(0.55, 0, 0.8, 0.4)", fill: "forwards" },
      );
      if (visible && counter instanceof HTMLElement) {
        counter.animate(
          [{ transform: "scale(1)", filter: "brightness(1)" }, { transform: "scale(1.22)", filter: "brightness(1.9)" }, { transform: "scale(1)", filter: "brightness(1)" }],
          { duration: 420, delay: 440, easing: "ease-out" },
        );
      }
    }, flyAt);
    return () => {
      shake.cancel();
      window.clearTimeout(timer);
    };
  }, [power, duration]);

  const a = `hsl(${hues[0]} 95% 60%)`;
  const b = `hsl(${hues[1]} 90% 52%)`;
  const deep = `hsl(${hues[1]} 80% 18%)`;
  const vars = {
    ["--a" as string]: a,
    ["--b" as string]: b,
    ["--deep" as string]: deep,
    ["--face" as string]: face,
    ["--dur" as string]: `${duration}s`,
    ["--num-size" as string]: power >= 4 ? "clamp(7rem, 26vw, 15rem)" : power === 3 ? "clamp(6rem, 22vw, 12.5rem)" : "clamp(5rem, 18vw, 10rem)",
  } as CSSProperties;
  const glyphCount = power >= 3 ? 10 : 8;

  return (
    <div className={styles.root} style={vars} aria-hidden>
      <div className={styles.vignette} />
      {power >= 3 ? <div className={styles.edgeGlow} /> : null}

      <div className={styles.center}>
        <div className={styles.rays} />
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" className={styles.heroImage} />
        ) : null}
        {power >= 2 && glyphs?.length ? (
          <div className={styles.circle}>
            <svg viewBox="0 0 380 380" className="absolute inset-0 h-full w-full" aria-hidden>
              <circle cx="190" cy="190" r="186" className={styles.circleStroke} pathLength={1} />
              <circle cx="190" cy="190" r="150" className={styles.circleStroke} pathLength={1} style={{ strokeDasharray: "0.02 0.015", strokeDashoffset: 0, opacity: 0.7 }} />
            </svg>
            <div className={styles.circleSpin}>
              {Array.from({ length: glyphCount }, (_, i) => {
                const Glyph = glyphs[i % glyphs.length]!;
                const angle = (i / glyphCount) * 360;
                return (
                  <span key={i} className={styles.glyph} style={{ transform: `rotate(${angle}deg) translateY(-168px) rotate(${-angle}deg) translate(-50%, -50%)` }}>
                    <Glyph style={{ width: 26, height: 26 }} />
                  </span>
                );
              })}
            </div>
            {power >= 3 ? (
              <div className={styles.circleSpinReverse}>
                {Array.from({ length: 6 }, (_, i) => {
                  const Glyph = glyphs[(i + 1) % glyphs.length]!;
                  const angle = (i / 6) * 360 + 30;
                  return (
                    <span key={i} className={styles.glyph} style={{ transform: `rotate(${angle}deg) translateY(-122px) rotate(${-angle}deg) translate(-50%, -50%)`, opacity: 0.75 }}>
                      <Glyph style={{ width: 18, height: 18 }} />
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
        {Array.from({ length: RING_COUNT[power] }, (_, i) => (
          <div key={i} className={styles.ring} style={{ animationDelay: `${0.08 + i * 0.12}s` }} />
        ))}

        <div ref={numberRef} className={styles.number}>
          <span className={styles.numberInner}>
            <span className={styles.numberPulse}>
              <span className={styles.numberShadow}>{count}</span>
              <span className={styles.numberFace}>{count}</span>
            </span>
          </span>
        </div>
        <div className={styles.label}>IN A ROW!</div>
        <div className={styles.plate}>
          <div className={styles.plateInner}>
            <span className={styles.plateTitle}>{title}</span>
            <span className={styles.plateWord}>{engaged}</span>
          </div>
        </div>
        {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      </div>

      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
