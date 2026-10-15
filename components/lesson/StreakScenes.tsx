"use client";

import type { StreakStyle } from "@/lib/audio/streak-sfx";
import styles from "./StreakBurst.module.css";

/**
 * Each realm's own backdrop behind the streak number. All artwork is fixed,
 * code-drawn SVG/CSS; colours come from the burst's --a/--b variables.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;

function hexPoints(r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${r2(r * Math.cos(a))},${r2(r * Math.sin(a))}`;
  }).join(" ");
}

function gearPath(r: number, teeth: number) {
  const inner = r * 0.84;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 4; i += 1) {
    const a = (i / (teeth * 4)) * Math.PI * 2;
    const rad = i % 4 === 1 || i % 4 === 2 ? r : inner;
    pts.push(`${r2(rad * Math.cos(a))},${r2(rad * Math.sin(a))}`);
  }
  return `M${pts.join("L")}Z M${r * 0.32},0 A${r * 0.32},${r * 0.32} 0 1 0 ${-r * 0.32},0 A${r * 0.32},${r * 0.32} 0 1 0 ${r * 0.32},0Z`;
}

function NexusScene({ power }: { power: number }) {
  return (
    <>
      <svg className={styles.hexGrid} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <pattern id="streak-hex" width="24" height="41.57" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
            <path d="M12 0 L24 6.93 L24 20.78 L12 27.71 L0 20.78 L0 6.93 Z M12 27.71 L12 41.57 M0 20.78 L-12 27.71 M24 20.78 L36 27.71" fill="none" stroke="var(--a)" strokeWidth="0.8" opacity="0.7" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#streak-hex)" />
      </svg>
      <svg className={styles.hexFrame} style={{ left: -200, top: -200, width: 400, height: 400 }} viewBox="-200 -200 400 400" aria-hidden>
        <g className={styles.spinSlow}><polygon points={hexPoints(185)} strokeWidth="3" /></g>
        <g className={styles.spinReverse}><polygon points={hexPoints(150)} strokeWidth="1.5" strokeDasharray="14 10" /></g>
        {power >= 3 ? <g className={styles.spinFast}><polygon points={hexPoints(120)} strokeWidth="1" strokeDasharray="4 8" /></g> : null}
      </svg>
      <div className={styles.scanBeam} />
    </>
  );
}

function BrassGear({ id, r, teeth, size, left, top, spin }: { id: string; r: number; teeth: number; size: number; left: number; top: number; spin: string }) {
  return (
    <svg className={styles.gear} style={{ left, top, width: size, height: size }} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff1b8" />
          <stop offset="45%" stopColor="#d4a243" />
          <stop offset="100%" stopColor="#6b4712" />
        </linearGradient>
      </defs>
      <g className={spin}><path d={gearPath(r, teeth)} fillRule="evenodd" fill={`url(#${id})`} /></g>
    </svg>
  );
}

function MeasureScene({ power }: { power: number }) {
  return (
    <>
      <BrassGear id="streak-gear-a" r={140} teeth={14} size={300} left={-340} top={-200} spin={styles.spinSlow} />
      <BrassGear id="streak-gear-b" r={100} teeth={10} size={220} left={60} top={-10} spin={styles.spinReverse} />
      {power >= 3 ? <BrassGear id="streak-gear-c" r={62} teeth={8} size={140} left={110} top={-220} spin={styles.spinFast} /> : null}
      <svg className={styles.clockFace} viewBox="0 0 350 350" aria-hidden>
        <circle cx="175" cy="175" r="168" fill="#1c1208b3" stroke="#f6dd96" strokeWidth="4" />
        <circle cx="175" cy="175" r="150" fill="none" stroke="#c99a3c" strokeWidth="1.5" />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const long = i % 5 === 0;
          const r1 = long ? 132 : 142;
          return <line key={i} x1={r2(175 + r1 * Math.sin(a))} y1={r2(175 - r1 * Math.cos(a))} x2={r2(175 + 150 * Math.sin(a))} y2={r2(175 - 150 * Math.cos(a))} stroke="#f6dd96" strokeWidth={long ? 3 : 1} />;
        })}
        <g className={styles.clockHand}>
          <line x1="175" y1="175" x2="175" y2="45" stroke="#fff3c4" strokeWidth="4" strokeLinecap="round" />
          <circle cx="175" cy="175" r="8" fill="#f6dd96" />
        </g>
      </svg>
    </>
  );
}

function StarScene({ power }: { power: number }) {
  const orbits = power >= 3 ? [150, 210, 270] : [160, 230];
  return (
    <>
      <div className={styles.nebula} />
      {orbits.map((size, i) => (
        <div key={size} style={{ position: "absolute", left: 0, top: 0, transform: `rotate(${-18 + i * 14}deg) scaleY(0.38)` }}>
          <div className={`${styles.orbit} ${i % 2 ? styles.spinReverse : styles.spinSlow}`} style={{ left: -size, top: -size, width: size * 2, height: size * 2, animationDuration: `${3 + i * 1.6}s` }}>
            <div className={styles.planet} style={{ transform: `scale(${1 + i * 0.3}, ${(1 + i * 0.3) / 0.38})` }} />
          </div>
        </div>
      ))}
    </>
  );
}

function PatternScene() {
  // A tessellation of triangles; each lights up after a delay set by its distance from the centre.
  const size = 46;
  const h = r2(size * 0.866);
  const tiles: Array<{ d: string; delay: number; up: boolean }> = [];
  for (let row = -6; row <= 6; row += 1) {
    for (let col = -10; col <= 10; col += 1) {
      const x = col * (size / 2);
      const y = row * h;
      const up = (row + col) % 2 === 0;
      const d = up
        ? `M${x},${r2(y - h / 2)} L${x + size / 2},${r2(y + h / 2)} L${x - size / 2},${r2(y + h / 2)} Z`
        : `M${x - size / 2},${r2(y - h / 2)} L${x + size / 2},${r2(y - h / 2)} L${x},${r2(y + h / 2)} Z`;
      tiles.push({ d, delay: r2(Math.hypot(x, y) / 900), up });
    }
  }
  return (
    <svg style={{ position: "absolute", left: -480, top: -300, width: 960, height: 600 }} viewBox="-480 -300 960 600" aria-hidden>
      <defs>
        <radialGradient id="streak-tile-fade">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="70%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id="streak-tile-mask"><rect x="-480" y="-300" width="960" height="600" fill="url(#streak-tile-fade)" /></mask>
      </defs>
      <g mask="url(#streak-tile-mask)">
        {tiles.map((tile, i) => (
          <path key={i} d={tile.d} className={styles.tile} style={{ animationDelay: `${tile.delay}s` }} fill={tile.up ? "var(--a)" : "var(--b)"} fillOpacity={tile.up ? 0.32 : 0.22} stroke="var(--a)" strokeWidth="1.2" />
        ))}
      </g>
    </svg>
  );
}

const BAR_HEIGHTS = [70, 110, 90, 150, 130, 190, 230];

function DataScene() {
  return (
    <>
      <div style={{ position: "absolute", left: -250, top: -120, width: 500, height: 240 }}>
        {BAR_HEIGHTS.map((height, i) => (
          <div key={i} className={styles.bar} style={{ left: i * 72, height, animationDelay: `${0.05 + i * 0.07}s` }} />
        ))}
        <div style={{ position: "absolute", left: -20, right: -20, bottom: 0, height: 3, background: "#fff", boxShadow: "0 0 10px var(--a)" }} />
      </div>
      <svg style={{ position: "absolute", left: -250, top: -150, width: 520, height: 270 }} viewBox="0 0 520 270" aria-hidden>
        <path d="M10 230 L82 190 L154 205 L226 140 L298 160 L370 90 L452 30" className={styles.trend} pathLength={1} />
        <path d="M430 22 L462 24 L452 54" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={styles.trend} pathLength={1} style={{ animationDelay: "1.15s", animationDuration: "0.25s" }} />
      </svg>
    </>
  );
}

const WHEEL_COLOURS = ["#e11d48", "#f59e0b", "#7c3aed", "#0d9488"];

function ChanceScene() {
  const segments = 12;
  return (
    <>
      <div className={`${styles.rays} ${styles.raysSoft}`} />
      <svg className={styles.wheel} viewBox="-190 -190 380 380" aria-hidden>
        {Array.from({ length: segments }, (_, i) => {
          const a0 = (i / segments) * Math.PI * 2;
          const a1 = ((i + 1) / segments) * Math.PI * 2;
          const r = 172;
          return <path key={i} d={`M0,0 L${r2(r * Math.cos(a0))},${r2(r * Math.sin(a0))} A${r},${r} 0 0 1 ${r2(r * Math.cos(a1))},${r2(r * Math.sin(a1))} Z`} fill={WHEEL_COLOURS[i % WHEEL_COLOURS.length]} stroke="#fde68a" strokeWidth="2" />;
        })}
        <circle r="176" fill="none" stroke="#fbbf24" strokeWidth="10" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return <circle key={i} cx={r2(176 * Math.cos(a))} cy={r2(176 * Math.sin(a))} r="3.5" fill="#fff7c2" />;
        })}
        <circle r="34" fill="#fbbf24" stroke="#7c2d12" strokeWidth="4" />
      </svg>
      <svg style={{ position: "absolute", left: -18, top: -214, width: 36, height: 40, filter: "drop-shadow(0 2px 4px #000)" }} viewBox="0 0 36 40" aria-hidden>
        <path d="M2 2 H34 L18 38 Z" fill="#fde68a" stroke="#7c2d12" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </>
  );
}

export default function RealmScene({ style, power }: { style: StreakStyle; power: number }) {
  return (
    <div className={styles.scene}>
      {style === "nexus" ? <NexusScene power={power} /> : null}
      {style === "measure" ? <MeasureScene power={power} /> : null}
      {style === "star" ? <StarScene power={power} /> : null}
      {style === "pattern" ? <PatternScene /> : null}
      {style === "data" ? <DataScene /> : null}
      {style === "chance" ? <ChanceScene /> : null}
    </div>
  );
}
