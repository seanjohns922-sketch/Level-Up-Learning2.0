"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import RealmScene from "@/components/lesson/StreakScenes";
import { playStreakSound, type StreakStyle } from "@/lib/audio/streak-sfx";
import styles from "./StreakBurst.module.css";

export type { StreakStyle };

/**
 * The shared streak celebration used by ComboActivation (3/5/8 in a row) and
 * NexusActivation (10 in a row). Every realm has its own scene, particles,
 * banner and sound:
 *   Number Nexus  hex grid, scan beam, glitching number, data bits
 *   Measurelands  brass gears, clock face, rising gold dust, ribbon banner
 *   Starpath      nebula, orbiting planets, warp streaks and twinkling stars
 *   Pattern Peaks triangle tessellation lighting up in a wave, tumbling shapes
 *   Statistica    bars shooting up, a rising trend line, data points
 *   Chance Hollow a wheel of fortune spinning to rest, coins and card suits
 * Shared beats: hit-stop vignette, a short screen shake, the number slam, and
 * the number flying into the streak counter. `power` scales everything
 * (4 = the 10-streak finale with confetti). Never blocks input and respects
 * reduced motion.
 */

export type StreakBurstProps = {
  count: number;
  power: 1 | 2 | 3 | 4;
  realm: StreakStyle;
  title: string;
  engaged: string;
  subtitle?: string;
  /** The realm's two hues (HSL degrees). */
  hues: [number, number];
  /** Fill for the big number, usually the tier's title gradient. */
  face: string;
  /** Total length in seconds. */
  duration: number;
};

const SHAKE_PX = [0, 3, 5, 8, 12];
const BURST = [0, 40, 70, 100, 150];
const RING_COUNT = [0, 1, 2, 3, 4];
const SUITS = ["♠", "♥", "♦", "♣"];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

type P = {
  x: number; y: number; vx: number; vy: number; life: number; decay: number;
  size: number; rot: number; vr: number; c: string; kind: number; delay: number;
};

/** Per-realm particle physics: how each particle starts, moves and is drawn. */
const PHYSICS: Record<StreakStyle, { gravity: number; drag: number; spawn: (p: P, i: number) => void; draw: (ctx: CanvasRenderingContext2D, p: P) => void }> = {
  nexus: {
    gravity: 0.05,
    drag: 0.94,
    spawn: (p, i) => { p.kind = i % 3; p.size = p.kind === 2 ? 14 + Math.random() * 6 : 3 + Math.random() * 4; },
    draw: (ctx, p) => {
      if (p.kind === 2) {
        ctx.font = `800 ${p.size}px ui-monospace, monospace`;
        ctx.fillText(Math.random() < 0.5 ? "1" : "0", p.x, p.y);
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
    },
  },
  measure: {
    gravity: -0.05,
    drag: 0.95,
    spawn: (p) => { p.size = 1.5 + Math.random() * 3; p.decay *= 0.7; },
    draw: (ctx, p) => {
      const twinkle = 0.6 + 0.4 * Math.sin(p.life * 30);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * twinkle, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  star: {
    gravity: 0,
    drag: 1.06,
    spawn: (p, i) => { p.kind = i % 2; p.size = p.kind ? 2 + Math.random() * 4 : 1.5; p.vx *= 0.35; p.vy *= 0.35; },
    draw: (ctx, p) => {
      if (p.kind === 0) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 4, p.y - p.vy * 4);
        ctx.stroke();
        return;
      }
      const r = p.size * (0.7 + 0.3 * Math.sin(p.life * 40));
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - r * 2.4);
      ctx.quadraticCurveTo(p.x, p.y, p.x + r * 2.4, p.y);
      ctx.quadraticCurveTo(p.x, p.y, p.x, p.y + r * 2.4);
      ctx.quadraticCurveTo(p.x, p.y, p.x - r * 2.4, p.y);
      ctx.quadraticCurveTo(p.x, p.y, p.x, p.y - r * 2.4);
      ctx.fill();
    },
  },
  pattern: {
    gravity: 0.22,
    drag: 0.97,
    spawn: (p, i) => { p.kind = i % 3; p.size = 8 + Math.random() * 10; p.vr = (Math.random() - 0.5) * 0.3; },
    draw: (ctx, p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      if (p.kind === 0) { ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.87, p.size / 2); ctx.lineTo(-p.size * 0.87, p.size / 2); ctx.closePath(); }
      else if (p.kind === 1) ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
      else for (let k = 0; k < 6; k += 1) { const a = (k / 6) * Math.PI * 2; ctx[k ? "lineTo" : "moveTo"](Math.cos(a) * p.size * 0.6, Math.sin(a) * p.size * 0.6); }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },
  },
  data: {
    gravity: 0.25,
    drag: 0.97,
    spawn: (p, i) => { p.kind = i % 2; p.size = 3 + Math.random() * 4; },
    draw: (ctx, p) => {
      ctx.beginPath();
      if (p.kind) ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      else ctx.rect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    },
  },
  chance: {
    gravity: 0.3,
    drag: 0.98,
    spawn: (p, i) => { p.kind = i % 3; p.size = p.kind === 2 ? 18 + Math.random() * 8 : 7 + Math.random() * 4; p.vr = 0.2 + Math.random() * 0.2; },
    draw: (ctx, p) => {
      if (p.kind === 2) {
        ctx.font = `900 ${p.size}px Arial, sans-serif`;
        ctx.fillStyle = (Math.floor(p.delay) % 2) ? "#f43f5e" : "#ffffff";
        ctx.fillText(SUITS[Math.floor(p.delay) % 4]!, p.x, p.y);
        return;
      }
      // A coin flipping: an ellipse whose width follows the spin.
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, Math.max(1, Math.abs(Math.cos(p.rot)) * p.size), p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#b45309";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },
  },
};

/** Realm particle burst, plus realm-shaped confetti rain for the finale. Stops itself. */
function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>, realm: StreakStyle, power: number, hues: [number, number], duration: number) {
  const [h0, h1] = hues;
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
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cx = W / 2;
    const cy = H * 0.42;
    const physics = PHYSICS[realm];
    const colour = (i: number) => (i % 4 === 0 ? "hsl(48 100% 92%)" : `hsl(${i % 2 ? h1 : h0} 95% ${58 + (i % 3) * 8}%)`);

    const make = (i: number, confetti: boolean): P => {
      const a = Math.random() * Math.PI * 2;
      const speed = (5 + Math.random() * 10) * (0.8 + power * 0.15);
      const p: P = confetti
        ? { x: Math.random() * W, y: -30 - Math.random() * H * 0.3, vx: (Math.random() - 0.5) * 1.5, vy: 2 + Math.random() * 2.5, life: 1, decay: 0, size: 8, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2, c: colour(i), kind: 0, delay: Math.random() * 40 }
        : { x: cx, y: cy, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 2, life: 1, decay: 0.012 + Math.random() * 0.016, size: 3, rot: Math.random() * 6, vr: 0, c: colour(i), kind: 0, delay: i };
      physics.spawn(p, i);
      if (confetti) p.vy = 2 + Math.random() * 2.5;
      return p;
    };
    const burst = Array.from({ length: BURST[power] }, (_, i) => make(i, false));
    const rain = power >= 4 ? Array.from({ length: 110 }, (_, i) => make(i + 1000, true)) : [];

    let raf = 0;
    let frame = 0;
    const end = performance.now() + duration * 1000;
    const tick = (now: number) => {
      frame += 1;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = realm === "chance" || realm === "data" ? "source-over" : "lighter";
      for (const p of burst) {
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= physics.drag;
        p.vy = p.vy * physics.drag + physics.gravity;
        p.rot += p.vr;
        p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
        ctx.fillStyle = p.c;
        ctx.strokeStyle = p.c;
        physics.draw(ctx, p);
      }
      ctx.globalCompositeOperation = "source-over";
      const fade = Math.max(0, Math.min(1, (end - now) / 500));
      for (const p of rain) {
        if (frame < p.delay) continue;
        p.x += p.vx + Math.sin((frame + p.delay) / 14) * 0.7;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.c;
        ctx.strokeStyle = p.c;
        physics.draw(ctx, p);
      }
      if (now < end) raf = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W, H);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef, realm, power, h0, h1, duration]);
}

export default function StreakBurst({ count, power, realm, title, engaged, subtitle, hues, face, duration }: StreakBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const numberRef = useRef<HTMLDivElement | null>(null);
  useParticles(canvasRef, realm, power, hues, duration);

  // Sound, the impact shake, then the number flies into the streak counter and the counter pulses.
  useEffect(() => {
    playStreakSound(realm, power);
    if (prefersReducedMotion()) return;
    const amp = SHAKE_PX[power];
    const shake = document.body.animate(
      [0, -1, 0.8, -0.6, 0.4, -0.2, 0].map((k, i) => ({ transform: `translate(${k * amp}px, ${(i % 2 ? 1 : -1) * k * amp * 0.6}px)` })),
      { duration: 320, delay: 70, easing: "ease-out" },
    );
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
    }, duration * 1000 - 520);
    return () => {
      shake.cancel();
      window.clearTimeout(timer);
    };
  }, [realm, power, duration]);

  const vars = {
    ["--a" as string]: `hsl(${hues[0]} 95% 60%)`,
    ["--b" as string]: `hsl(${hues[1]} 90% 52%)`,
    ["--deep" as string]: `hsl(${hues[1]} 80% 18%)`,
    ["--face" as string]: face,
    ["--dur" as string]: `${duration}s`,
    ["--num-size" as string]: power >= 4 ? "clamp(7rem, 26vw, 15rem)" : power === 3 ? "clamp(6rem, 22vw, 12.5rem)" : "clamp(5rem, 18vw, 10rem)",
  } as CSSProperties;

  return (
    <div className={styles.root} style={vars} aria-hidden>
      <div className={styles.vignette} />
      {power >= 3 ? <div className={styles.edgeGlow} /> : null}

      <div className={styles.center}>
        <RealmScene style={realm} power={power} />
        {Array.from({ length: RING_COUNT[power] }, (_, i) => (
          <div key={i} className={styles.ring} style={{ animationDelay: `${0.08 + i * 0.12}s`, borderRadius: realm === "nexus" ? 0 : undefined, clipPath: realm === "nexus" ? "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)" : undefined }} />
        ))}

        <div ref={numberRef} className={styles.number}>
          <span className={styles.numberInner}>
            <span className={styles.numberPulse}>
              <span className={styles.numberShadow}>{count}</span>
              <span className={styles.numberFace}>{count}</span>
              {realm === "nexus" ? (
                <>
                  <span className={`${styles.glitch} ${styles.glitchCyan}`}>{count}</span>
                  <span className={`${styles.glitch} ${styles.glitchRed}`}>{count}</span>
                </>
              ) : null}
            </span>
          </span>
        </div>
        <div className={styles.label}>IN A ROW!</div>
        <div className={styles.plate}>
          <div className={`${styles.plateInner} ${styles[`plate_${realm}`] ?? ""}`}>
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
