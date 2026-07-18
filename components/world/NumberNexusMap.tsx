"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User, Zap, Lock,
} from "lucide-react";
import { readProgress } from "@/data/progress";
import { computeFogProgress } from "@/lib/fog-progress";
import FogOfForgetfulness from "@/components/world/FogOfForgetfulness";
import {
  readProgramStore,
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
} from "@/lib/program-progress";
import { readBestChain } from "@/lib/best-chain";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import LevelsDrawer from "@/components/realms/LevelsDrawer";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";
import StudentAvatar from "@/components/avatar/StudentAvatar";
import { fetchGlobalXp } from "@/lib/economy";

// ─── Era system — ONE evolving city, five real background images ─────────────────
// Prep=0  Y1-2=1  Y3-4=2  Y5=3  Y6=4
function getEra(year: string): 0 | 1 | 2 | 3 | 4 {
  if (year === "Prep") return 0;
  const n = parseInt(year.replace(/\D/g, ""), 10) || 1;
  if (n <= 2) return 1;
  if (n <= 4) return 2;
  if (n <= 5) return 3;
  return 4;
}

const ERA_CONFIGS = [
  // 0 — Prep: first arrival, friendly, simple
  { bgImage: "/images/number-nexus-bg-prep.png",
    particleCount: 50,  particleSpeedMult: 0.5,  vehicleCount: 3,  vehicleSpeedMult: 0.6,
    pulseRings: 2, pulseColor: "#2dd4bf", labelSize: 16,
    bgFilter: "brightness(1.04) contrast(1.06) saturate(1.04)",
    atmosphericGlow: "radial-gradient(ellipse 64% 58% at 50% 34%, rgba(94,234,212,0.05) 0%, transparent 72%)",
    skylineHaze: "linear-gradient(180deg, rgba(214,236,255,0.12) 0%, rgba(214,236,255,0.06) 12%, transparent 30%)",
    scanlineOpacity: 0.03,
    beamOpacity: 0.34 },
  // 1 — Year 1-2: city expanding, more life
  { bgImage: "/images/number-nexus-bg-y1.png",
    particleCount: 80,  particleSpeedMult: 0.75, vehicleCount: 5,  vehicleSpeedMult: 0.8,
    pulseRings: 3, pulseColor: "#14b8a6", labelSize: 18,
    bgFilter: "blur(0.35px) brightness(1.01) contrast(1.05) saturate(1.08)",
    atmosphericGlow: "radial-gradient(ellipse 68% 60% at 50% 38%, rgba(94,234,212,0.045) 0%, transparent 72%)",
    skylineHaze: "linear-gradient(180deg, rgba(220,234,252,0.16) 0%, rgba(220,234,252,0.08) 14%, transparent 32%)",
    scanlineOpacity: 0.025,
    beamOpacity: 0.28 },
  // 2 — Year 3-4: deep city, dense skyline (existing image)
  { bgImage: "/images/number-nexus-home-bg.jpg",
    particleCount: 130, particleSpeedMult: 1.0,  vehicleCount: 9,  vehicleSpeedMult: 1.0,
    pulseRings: 4, pulseColor: "#14b8a6", labelSize: 20,
    bgFilter: "brightness(1.04) contrast(1.12) saturate(1.14)",
    atmosphericGlow: "radial-gradient(ellipse 60% 55% at 50% 36%, rgba(14,184,166,0.07) 0%, transparent 70%)",
    skylineHaze: "linear-gradient(180deg, rgba(205,225,255,0.08) 0%, transparent 22%)",
    scanlineOpacity: 0.06,
    beamOpacity: 0.42 },
  // 3 — Year 5: epic, gold + teal, massive scale
  { bgImage: "/images/number-nexus-bg-y5.png",
    particleCount: 160, particleSpeedMult: 1.25, vehicleCount: 12, vehicleSpeedMult: 1.3,
    pulseRings: 5, pulseColor: "#fbbf24", labelSize: 21,
    bgFilter: "brightness(1.05) contrast(1.14) saturate(1.18)",
    atmosphericGlow: "radial-gradient(ellipse 60% 55% at 50% 36%, rgba(251,191,36,0.08) 0%, transparent 70%)",
    skylineHaze: "linear-gradient(180deg, rgba(255,237,213,0.08) 0%, transparent 24%)",
    scanlineOpacity: 0.06,
    beamOpacity: 0.46 },
  // 4 — Year 6: legendary, god-like tower, final destination
  { bgImage: "/images/number-nexus-bg-y6.png",
    particleCount: 200, particleSpeedMult: 1.5,  vehicleCount: 16, vehicleSpeedMult: 1.6,
    pulseRings: 6, pulseColor: "#fbbf24", labelSize: 22,
    bgFilter: "brightness(1.06) contrast(1.16) saturate(1.18)",
    atmosphericGlow: "radial-gradient(ellipse 60% 55% at 50% 36%, rgba(251,191,36,0.09) 0%, transparent 70%)",
    skylineHaze: "linear-gradient(180deg, rgba(255,237,213,0.09) 0%, transparent 24%)",
    scanlineOpacity: 0.06,
    beamOpacity: 0.5 },
] as const;
type EraConfig = typeof ERA_CONFIGS[number];

// ─── District zones ─────────────────────────────────────────────────────────────
// Balanced symmetric composition:
//   LEFT  column: Counting (upper) → Bridge (lower)
//   CENTER:       Legend Tower (mid, beam-aligned)
//   RIGHT column: Core (upper) → Mastery (lower)
const DISTRICT_ZONES = [
  { id: "counting", name: "COUNTING DISTRICT", sub: "WEEKS 1–3",   weekStart: 1,  weekEnd: 3,  left: "3%",  top: "12%", color: "#14b8a6", panX: 10  },
  { id: "bridge",   name: "NUMBER BRIDGE",      sub: "WEEKS 4–6",   weekStart: 4,  weekEnd: 6,  left: "3%",  top: "56%", color: "#22d3ee", panX: 6   },
  { id: "tower",    name: "LEGEND TOWER",        sub: "WEEK 12",     weekStart: 12, weekEnd: 12, left: "50%", top: "36%", color: "#fbbf24", panX: 0   },
  { id: "core",     name: "CALCULATION CORE",   sub: "WEEKS 7–9",   weekStart: 7,  weekEnd: 9,  left: "72%", top: "12%", color: "#f472b6", panX: -8  },
  { id: "mastery",  name: "MASTERY SECTOR",      sub: "WEEKS 10–11", weekStart: 10, weekEnd: 11, left: "72%", top: "56%", color: "#a78bfa", panX: -12 },
] as const;

// ─── World canvas (particles + vehicles + tower pulse) ──────────────────────────
function useWorldCanvas(era: EraConfig) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Era 3 adds gold to the colour palette
    const COLS = era.pulseColor === "#fbbf24"
      ? ["#fbbf24", "#14b8a6", "#a78bfa", "#f472b6", "#22d3ee"]
      : ["#14b8a6", "#818cf8", "#f472b6", "#a78bfa", "#22d3ee"];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const sm = era.particleSpeedMult;
    const particles = Array.from({ length: era.particleCount }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 2.2,
      vy: -(0.18 + Math.random() * 0.55) * sm / 1080,
      vx: ((Math.random() - 0.5) * 0.15) * sm / 1920,
      color: COLS[i % COLS.length],
      opacity: 0.2 + Math.random() * 0.5,
    }));

    const vm = era.vehicleSpeedMult;
    // More altitude lanes for higher eras
    const laneCount = era.vehicleCount > 9 ? 4 : 2;
    const vehicles = Array.from({ length: era.vehicleCount }, (_, i) => ({
      x: Math.random(),
      yFrac: 0.30 + (i % laneCount) * 0.05 + Math.random() * 0.03,
      w: 5 + Math.random() * 8,
      speed: ((0.5 + Math.random() * 1.4) * vm * (i % 2 === 0 ? 1 : -1)) / 1920,
      color: COLS[i % COLS.length],
    }));

    let pulse = 0;
    let fid: number;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02)  p.x = -0.02;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vehicles + trails
      for (const v of vehicles) {
        v.x += v.speed;
        if (v.x > 1.12) v.x = -0.12;
        if (v.x < -0.12) v.x = 1.12;

        const vx = v.x * W, vy = v.yFrac * H;
        const trailLen = Math.abs(v.speed) * W * 14;
        const dir = v.speed > 0 ? -1 : 1;

        const g = ctx.createLinearGradient(vx + dir * trailLen, vy, vx, vy);
        g.addColorStop(0, v.color + "00");
        g.addColorStop(1, v.color + "88");
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = g;
        ctx.fillRect(vx + dir * trailLen, vy - 1, trailLen, 2);

        ctx.globalAlpha = 0.9;
        ctx.fillStyle = v.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = v.color;
        ctx.fillRect(vx, vy - 1.5, v.w, 3);
        ctx.shadowBlur = 0;
      }

      // Tower pulse rings — count + colour driven by era
      const tx = W * 0.5, ty = H * 0.36;
      pulse += 0.45;
      for (let i = 0; i < era.pulseRings; i++) {
        const ph = (pulse + i * 28) % 112;
        const r  = ph * 1.4;
        const a  = Math.max(0, 0.28 - ph / 392);
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.strokeStyle = era.pulseColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Vertical data-stream lines near tower
      const streamCount = era.pulseRings > 4 ? 9 : 5;
      for (let i = 0; i < streamCount; i++) {
        const lx = tx + (i - Math.floor(streamCount / 2)) * 18;
        const phase = (pulse * 1.2 + i * 22) % 200;
        const ly = ty - 60 + phase;
        const la = Math.max(0, 0.18 - Math.abs(phase - 100) / 1400);
        ctx.globalAlpha = la;
        ctx.strokeStyle = era.pulseColor;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly + 40);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      fid = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(fid); window.removeEventListener("resize", resize); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era.particleCount, era.vehicleCount, era.pulseRings, era.pulseColor]);

  return ref;
}

// ─── District label — just crisp text, no card chrome ─────────────────────────
function DistrictLabel({
  zone, state, active, onClick, fontSize = 20,
}: {
  zone: (typeof DISTRICT_ZONES)[number];
  state: "complete" | "current" | "locked";
  active: boolean;
  onClick: () => void;
  fontSize?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";

  const nameGlow   = `0 0 22px ${zone.color}99, 0 0 8px ${zone.color}55, 0 2px 10px rgba(0,0,0,0.95)`;
  const statusText = state === "complete" ? "✓ COMPLETE" : "▶ ENTER";

  return (
    <div
      onClick={!locked ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: !locked ? "pointer" : "default",
        userSelect: "none",
        display: "flex",
        flexDirection: "column",
        gap: 5,
        transform: active ? "scale(1.06)" : hovered && !locked ? "scale(1.03)" : "scale(1)",
        transformOrigin: "left top",
        transition: "transform 0.3s ease",
        pointerEvents: "auto",
        whiteSpace: "nowrap",
      }}
    >
      {/* District name */}
      <div style={{
        color: "#ffffff",
        fontSize,
        fontWeight: 900,
        letterSpacing: "0.2em",
        fontFamily: "ui-monospace, monospace",
        textShadow: nameGlow,
        lineHeight: 1.1,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}>
        {zone.name}
        {locked && <Lock style={{ width: 16, height: 16 }} />}
      </div>

      {/* Weeks · Status */}
      <div style={{
        color: zone.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.18em",
        fontFamily: "ui-monospace, monospace",
        textShadow: "0 1px 8px rgba(0,0,0,0.95)",
        opacity: 0.9,
      }}>
        {zone.sub}{!locked && `  ·  ${statusText}`}
      </div>

      {/* TAP TO ENTER badge — active district only */}
      {active && !locked && (
        <div style={{
          display: "inline-block",
          padding: "3px 11px",
          border: `1px solid ${zone.color}`,
          borderRadius: 3,
          color: zone.color,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.24em",
          fontFamily: "ui-monospace, monospace",
          textShadow: `0 0 10px ${zone.color}`,
          boxShadow: `0 0 12px ${zone.color}33`,
        }}>
          TAP TO ENTER
        </div>
      )}
    </div>
  );
}

// ─── Player character (SVG silhouette with breathing animation) ─────────────────
function PlayerCharacter({ gender }: { gender: "boy" | "girl" }) {
  const teal = "#14b8a6";
  const jacket = "#0d2644";
  const pants = "#090f1c";
  const pack = "#082540";
  const skin = "#b87652";
  const hair = gender === "girl" ? "#3a1e06" : "#110b03";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        animation: "char-float 4.5s ease-in-out infinite",
        filter: "drop-shadow(0 0 14px rgba(20,184,166,0.28)) drop-shadow(0 8px 18px rgba(0,0,0,0.7))",
      }}
    >
      <svg width="96" height="196" viewBox="0 0 96 196" fill="none">
        {/* Shoes */}
        <rect x="23" y="172" width="20" height="10" rx="3" fill="#060912" />
        <rect x="53" y="172" width="20" height="10" rx="3" fill="#060912" />
        {/* Legs */}
        <rect x="25" y="130" width="16" height="46" rx="4" fill={pants} />
        <rect x="55" y="130" width="16" height="46" rx="4" fill={pants} />
        {/* Body */}
        <rect x="16" y="74" width="64" height="60" rx="8" fill={jacket} />
        {/* Body neon trim */}
        <rect x="14" y="74" width="68" height="7" rx="5" fill={teal} opacity="0.7" />
        {/* Arms */}
        <rect x="2"  y="80" width="16" height="48" rx="5" fill={jacket} />
        <rect x="78" y="80" width="16" height="48" rx="5" fill={jacket} />
        {/* Arm trim */}
        <rect x="2"  y="80" width="16" height="5" rx="3" fill={teal} opacity="0.5" />
        <rect x="78" y="80" width="16" height="5" rx="3" fill={teal} opacity="0.5" />
        {/* Backpack */}
        <rect x="18" y="82" width="30" height="42" rx="5" fill={pack} />
        {/* Backpack strap top */}
        <rect x="22" y="88" width="22" height="3" rx="1.5" fill={teal} opacity="0.8" />
        {/* Backpack emblem */}
        <rect x="27" y="98" width="12" height="12" rx="2.5" fill={teal} opacity="0.55" />
        <rect x="30" y="101" width="6" height="6" rx="1" fill={teal} opacity="0.9" />
        {/* Neck */}
        <rect x="36" y="62" width="24" height="15" rx="5" fill={skin} />
        {/* Head */}
        <rect x="25" y="27" width="46" height="40" rx="10" fill={skin} />
        {/* Hair top */}
        <rect x="23" y="22" width="50" height="19" rx="9" fill={hair} />
        <rect x="23" y="30" width="50" height="9" fill={hair} />
        {/* Girl side hair */}
        {gender === "girl" && (
          <>
            <rect x="20" y="40" width="7" height="22" rx="4" fill={hair} />
            <rect x="69" y="40" width="7" height="22" rx="4" fill={hair} />
          </>
        )}
      </svg>

      {/* Backpack pack glow orb */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "22%",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${teal}66 0%, transparent 70%)`,
        filter: "blur(7px)",
        animation: "pack-pulse 2.8s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Ground glow */}
      <div style={{
        position: "absolute",
        bottom: -12,
        left: "50%",
        transform: "translateX(-50%)",
        width: 100,
        height: 24,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${teal}40 0%, transparent 70%)`,
        filter: "blur(6px)",
      }} />
    </div>
  );
}

function readGenderFromStorage(): "boy" | "girl" {
  if (typeof window === "undefined") return "boy";
  try {
    const raw = localStorage.getItem("lul_active_student_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.gender === "girl" || parsed?.gender === "female") return "girl";
    }
  } catch {
    // ignore
  }
  return "boy";
}

// ─── Chunky in-world HUD icons (Clash Royale readability / hologram styling) ───
function LegendsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nnLegA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5eead4" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* back card */}
      <rect x="5" y="9" width="14" height="18" rx="2.4" transform="rotate(-12 12 18)" fill="#0f766e" stroke="#5eead4" strokeWidth="1.2" opacity="0.85" />
      {/* front card */}
      <rect x="11" y="6" width="15" height="20" rx="2.6" fill="url(#nnLegA)" stroke="#ccfbf1" strokeWidth="1.4" />
      {/* character silhouette */}
      <circle cx="18.5" cy="13" r="2.6" fill="#022c22" />
      <path d="M13.5 23c1.2-3.4 3.2-5 5-5s3.8 1.6 5 5z" fill="#022c22" />
      {/* star */}
      <path d="M18.5 19.6l0.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" fill="#fde68a" />
    </svg>
  );
}
function WorldsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nnTwr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#99f6e4" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      {/* portal ring base */}
      <ellipse cx="16" cy="27" rx="11" ry="2.4" fill="#022c22" opacity="0.7" />
      <ellipse cx="16" cy="27" rx="11" ry="2.4" fill="none" stroke="#5eead4" strokeWidth="1.2" />
      {/* stacked tower districts */}
      <rect x="6"  y="20" width="6" height="6" rx="1" fill="url(#nnTwr)" stroke="#ccfbf1" strokeWidth="1" />
      <rect x="20" y="20" width="6" height="6" rx="1" fill="url(#nnTwr)" stroke="#ccfbf1" strokeWidth="1" />
      <rect x="11" y="14" width="10" height="7" rx="1.2" fill="url(#nnTwr)" stroke="#ccfbf1" strokeWidth="1.2" />
      <rect x="13" y="6"  width="6"  height="9" rx="1.2" fill="url(#nnTwr)" stroke="#ccfbf1" strokeWidth="1.2" />
      {/* tower peak beacon */}
      <circle cx="16" cy="5.5" r="1.6" fill="#fde68a" />
      <circle cx="16" cy="5.5" r="3.2" fill="#fde68a" opacity="0.25" />
    </svg>
  );
}
function ProgressIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="nnBdg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* medal shield */}
      <path d="M16 3l10 3v8c0 7-5 11-10 13C11 25 6 21 6 14V6z" fill="url(#nnBdg)" stroke="#fffbeb" strokeWidth="1.3" />
      {/* lightning bolt */}
      <path d="M17 9l-5 8h3.5l-1.5 6 5.5-8H16z" fill="#0f172a" stroke="#fffbeb" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}

export default function NumberNexusMap() {
  const router   = useRouter();
  const [progress] = useState(() => readProgress());
  const [store]    = useState(() => readProgramStore());
  const [gender] = useState<"boy" | "girl">(readGenderFromStorage);
  const [launching, setLaunching] = useState(false);

  // Review Mode: a read-only visit to an earlier level. The reviewed level comes
  // from the URL (?review=1&level=…) so it renders regardless of stored progress,
  // while progress itself is untouched (writes are gated globally).
  const [reviewYear] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search);
    return p.get("review") === "1" ? p.get("level") : null;
  });
  const year       = reviewYear ?? progress?.year ?? "Year 1";
  const fogProgress = useMemo(() => computeFogProgress(year, progress?.unlockedLegends), [year, progress?.unlockedLegends]);
  const [bestChain] = useState(() => readBestChain("number", year));
  const [classBestChain, setClassBestChain] = useState<number | null>(null);
  const [globalXpBalance, setGlobalXpBalance] = useState<number | null>(null);
  const isPrep     = year === "Prep";
  const eraIdx     = getEra(year);
  const era        = ERA_CONFIGS[eraIdx];
  const isGuided   = eraIdx <= 1; // Prep, Year 1, Year 2 — single big button, no menu decisions
  const canvasRef  = useWorldCanvas(era);

  const currentWeek = getRecommendedAssignedWeek(store, year, progress?.assignedWeek, progress?.requiredWeeks);
  const [viewWeek] = useState(currentWeek);

  const completedByWeek = useMemo(() => {
    const m: Record<number, boolean> = {};
    for (let w = 1; w <= 12; w++) m[w] = isWeekComplete(getWeekProgress(store, year, w));
    return m;
  }, [store, year]);

  const highestDone = useMemo(() =>
    Math.max(0, ...Object.entries(completedByWeek).filter(([, v]) => v).map(([k]) => Number(k))),
    [completedByWeek]);

  const demoRealmXP = useMemo(() => {
    let xp = 0;
    for (let w = 1; w <= 12; w++) {
      const wp = getWeekProgress(store, year, w);
      xp += wp.lessonsCompleted.filter(Boolean).length * 40;
      if (wp.quizScore !== undefined) xp += Math.round((wp.quizScore / 100) * 60);
    }
    return xp;
  }, [store, year]);

  useEffect(() => {
    const studentId = getActiveStudentProfile()?.studentId;
    if (!studentId || isDemoPreviewMode()) return;
    let cancelled = false;
    void fetchGlobalXp(studentId).then(({ balance }) => {
      if (!cancelled) setGlobalXpBalance(balance);
    }).catch((error) => console.warn("[NumberNexus] Could not load global XP", error));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isDemoPreviewMode()) {
      setClassBestChain(null);
      return;
    }

    const profile = getActiveStudentProfile();
    const classId = profile?.classId?.trim();
    if (!classId) {
      setClassBestChain(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const workingLevel = year;
        const readMaxBestChain = async (filterWorkingLevel: boolean) => {
          let query = supabase
            .from("student_lesson_attempts")
            .select("summary")
            .eq("class_id", classId)
            .eq("realm_id", "number");

          if (filterWorkingLevel) {
            query = query.eq("working_level", workingLevel);
          }

          const { data, error } = await query;
          if (error) throw error;

          let max = 0;
          for (const row of data ?? []) {
            const summary =
              row.summary && typeof row.summary === "object" && !Array.isArray(row.summary)
                ? (row.summary as Record<string, unknown>)
                : null;
            const candidate = Number(summary?.bestChain ?? summary?.best_chain ?? 0);
            if (Number.isFinite(candidate) && candidate > max) {
              max = candidate;
            }
          }

          return max > 0 ? max : null;
        };

        const scopedBest = await readMaxBestChain(true);
        const fallbackBest = scopedBest ?? (await readMaxBestChain(false));

        if (!cancelled) {
          setClassBestChain(fallbackBest);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("[NumberNexusMap] Failed to load class best chain:", error);
          setClassBestChain(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [year]);

  function zoneState(zone: (typeof DISTRICT_ZONES)[number]): "complete" | "current" | "locked" {
    const weeks = Array.from({ length: zone.weekEnd - zone.weekStart + 1 }, (_, i) => zone.weekStart + i);
    if (weeks.every((w) => completedByWeek[w])) return "complete";
    if (currentWeek >= zone.weekStart) return "current";
    return "locked";
  }

  function onDistrictTap(weekStart: number, weekEnd: number) {
    for (let w = weekStart; w <= weekEnd; w++) {
      if (!completedByWeek[w]) { router.push(`/program?year=${encodeURIComponent(year)}&week=${w}&legacy=1`); return; }
    }
    router.push(`/program?year=${encodeURIComponent(year)}&week=${weekEnd}&legacy=1`);
  }

  function launchGuidedAdventure() {
    if (launching || !currentZone) return;
    setLaunching(true);
    // Cinematic zoom transition, then navigate into the current district.
    window.setTimeout(() => {
      onDistrictTap(currentZone.weekStart, currentZone.weekEnd);
    }, 900);
  }

  const currentZone = DISTRICT_ZONES.find((z) => viewWeek >= z.weekStart && viewWeek <= z.weekEnd);
  const activeZoneId = currentZone?.id ?? null;

  const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 999,
    background: "rgba(14,118,110,0.18)", border: "1px solid rgba(94,234,212,0.18)",
    ...extra,
  });
  const hudBtn: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "12px 10px 10px", borderRadius: 18, cursor: "pointer",
    background: "linear-gradient(180deg, rgba(8,20,32,0.92) 0%, rgba(2,8,16,0.95) 100%)",
    border: "1.5px solid rgba(94,234,212,0.32)",
    backdropFilter: "blur(14px)", width: 72,
    boxShadow: "0 0 18px rgba(20,184,166,0.18), 0 6px 22px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
    transition: "transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease",
  };
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#020810" }}>

      <FogOfForgetfulness progress={fogProgress} accent="#5eead4" glow="rgba(45,212,191,0.6)" />

      {/* ── Background image — real image per era, no CSS filters ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={era.bgImage}
        src={era.bgImage}
        alt=""
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 40%",
          zIndex: 0,
          filter: era.bgFilter,
          transform: launching ? "scale(1.35)" : "scale(1)",
          transition: "transform 0.9s cubic-bezier(0.5, 0, 0.75, 0)",
        }}
      />

      {/* Atmospheric depth — top & bottom darken, mid stays open */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: eraIdx <= 1
          ? "linear-gradient(180deg, rgba(6,18,34,0.42) 0%, rgba(7,20,30,0.08) 40%, rgba(4,10,18,0.12) 58%, rgba(3,8,16,0.72) 100%)"
          : "linear-gradient(180deg, rgba(2,10,22,0.58) 0%, rgba(1,20,28,0.12) 38%, rgba(1,10,18,0.08) 55%, rgba(2,8,18,0.88) 100%)",
      }} />
      {/* Radial vignette */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: eraIdx <= 1
          ? "radial-gradient(ellipse 84% 74% at 50% 44%, transparent 34%, rgba(7,16,28,0.34) 100%)"
          : "radial-gradient(ellipse 82% 72% at 50% 44%, transparent 38%, rgba(2,6,18,0.42) 100%)",
      }} />
      {/* Center glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: era.atmosphericGlow,
      }} />
      {/* Distance haze softens skyline and reduces concept-art harshness in early city eras */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: era.skylineHaze,
      }} />

      {/* Scanline texture */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)",
        opacity: era.scanlineOpacity,
      }} />

      {/* Volumetric tower light beam — colour + width driven by era */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "0%",
        transform: "translateX(-50%)",
        width: era.pulseRings > 4 ? 130 : 90,
        height: "52%",
        background: `linear-gradient(180deg, ${era.pulseColor}00 0%, ${era.pulseColor}${Math.round(era.beamOpacity * 255).toString(16).padStart(2, "0")} 60%, ${era.pulseColor}${Math.round((era.beamOpacity + 0.08) * 255).toString(16).padStart(2, "0")} 100%)`,
        filter: eraIdx <= 1 ? "blur(20px)" : "blur(16px)",
        zIndex: 3,
        pointerEvents: "none",
        animation: "beam-pulse 3.5s ease-in-out infinite",
      }} />

      {/* Ground road reflection glow */}
      <div style={{
        position: "absolute",
        bottom: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "38%",
        height: 120,
        background: eraIdx <= 1
          ? `radial-gradient(ellipse at 50% 0%, ${era.pulseColor}22 0%, transparent 78%)`
          : `radial-gradient(ellipse at 50% 0%, ${era.pulseColor}38 0%, transparent 75%)`,
        filter: eraIdx <= 1 ? "blur(14px)" : "blur(10px)",
        zIndex: 3,
        pointerEvents: "none",
      }} />

      {/* ── Canvas overlay — particles, vehicles, pulse ── */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}
      />

      {/* ── World layer (districts + character) — pans subtly on district change ── */}
      <div
        style={{
          position: "absolute", inset: 0, zIndex: 10,
          transform: launching
            ? `translate3d(${(currentZone?.panX ?? 0)}px, 0, 0) scale(1.35)`
            : `translate3d(${(currentZone?.panX ?? 0)}px, 0, 0) scale(1)`,
          transition: "transform 0.9s cubic-bezier(0.5, 0, 0.75, 0)",
          opacity: launching ? 0 : 1,
          pointerEvents: "none",
        }}
      >
        {/* District text labels — hidden in guided mode (Prep–Y2): less decision friction */}
        {!isGuided && DISTRICT_ZONES.map((zone) => (
          <div
            key={zone.id}
            style={{
              position: "absolute",
              left: zone.left,
              top: zone.top,
              // Center the tower label on the beam axis
              transform: zone.id === "tower" ? "translateX(-50%)" : undefined,
              pointerEvents: "auto",
            }}
          >
            <DistrictLabel
              zone={zone}
              state={zoneState(zone)}
              active={activeZoneId === zone.id}
              onClick={() => onDistrictTap(zone.weekStart, zone.weekEnd)}
              fontSize={era.labelSize}
            />
          </div>
        ))}

        {/* Guided mode: ambient district names only — no decisions, just atmosphere */}
        {isGuided && DISTRICT_ZONES.map((zone) => {
          const state = zoneState(zone);
          if (state === "locked") return null;
          return (
            <div
              key={zone.id}
              style={{
                position: "absolute",
                left: zone.left,
                top: zone.top,
                transform: zone.id === "tower" ? "translateX(-50%)" : undefined,
                pointerEvents: "none",
                color: "#ffffff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.22em",
                fontFamily: "ui-monospace, monospace",
                opacity: activeZoneId === zone.id ? 0.85 : 0.35,
                textShadow: `0 0 14px ${zone.color}88, 0 2px 8px rgba(0,0,0,0.9)`,
                whiteSpace: "nowrap",
              }}
            >
              {zone.name}
            </div>
          );
        })}

        {/* Character — dead center, grounded on the foreground platform */}
        <div style={{
          position: "absolute",
          bottom: "2%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 12,
          pointerEvents: "auto",
        }}>
          <StudentAvatar
            height={196}
            glowColor="rgba(20,184,166,0.32)"
            floatAnimation="char-float 4.5s ease-in-out infinite"
          />
        </div>
      </div>

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        background: "rgba(2,6,16,0.72)", borderBottom: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(16px)",
      }}>
        <button
          onClick={() => router.push(`/realms?level=${encodeURIComponent(year)}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, ...chip(), cursor: "pointer", color: "rgba(167,243,208,0.9)", fontSize: 12, fontWeight: 700 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={chip()}>
          <span style={{ color: "#5eead4", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>⚡ NUMBER NEXUS</span>
        </div>
        <LevelsDrawer realmId="number-nexus" progress={progress} viewingYear={year} isPreview={isDemoPreviewMode()} accent="#5eead4" />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...chip() }}>
          <Zap size={11} color="#14b8a6" />
          <span title="Global XP available in every realm" style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{isDemoPreviewMode() ? demoRealmXP : globalXpBalance == null ? "—" : globalXpBalance} XP</span>
        </div>
        <div style={chip()}>
          <span style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{highestDone}/12</span>
        </div>
        <button
          onClick={() => router.push("/profile")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", background: "rgba(14,118,110,0.28)", border: "1px solid rgba(94,234,212,0.28)" }}
        >
          <User size={16} color="#5eead4" />
        </button>
      </div>

      {/* ── Right HUD ── */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { key: "legends",  label: "LEGENDS",  route: "/legends",     icon: <LegendsIcon /> },
          { key: "worlds",   label: "WORLDS",   route: "/realms",      icon: <WorldsIcon /> },
          { key: "progress", label: "PROGRESS", route: "/realm-stats", icon: <ProgressIcon /> },
        ].map(({ key, label, route, icon }) => (
          <button key={key} onClick={() => router.push(route)} style={hudBtn} className="nn-hud-btn">
            <div className="nn-hud-icon" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 48, height: 48, borderRadius: 14,
              background: "radial-gradient(circle at 50% 35%, rgba(45,212,191,0.32) 0%, rgba(13,148,136,0.18) 55%, rgba(2,8,16,0.0) 100%)",
              border: "1px solid rgba(94,234,212,0.28)",
              boxShadow: "inset 0 0 14px rgba(20,184,166,0.25), 0 0 18px rgba(20,184,166,0.18)",
              transition: "transform 200ms ease, box-shadow 220ms ease",
            }}>
              {icon}
            </div>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#5eead4", fontFamily: "ui-monospace,monospace", textShadow: "0 0 10px rgba(20,184,166,0.55)" }}>{label}</span>
          </button>
        ))}
        <div style={{ ...hudBtn, cursor: "default", gap: 4 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(94,234,212,0.5)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15 }}>
            {"MY BEST"}
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#5eead4", lineHeight: 1 }}>{bestChain}</span>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(251,191,36,0.6)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15, marginTop: 2 }}>
            {"CLASS BEST"}
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#fbbf24", lineHeight: 1 }}>
            {classBestChain ?? "—"}
          </span>
        </div>
      </div>

      {/* ── Bottom label (week navigation arrows removed — entry is via districts) ── */}
      {!isGuided && currentZone && (<div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "12px 20px",
        background: "rgba(2,6,16,0.84)", borderTop: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(16px)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: currentZone.color, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace", textShadow: `0 0 14px ${currentZone.color}` }}>
            {currentZone.name.replace("\n", " ")}
          </div>
          <div style={{ color: "rgba(148,163,184,0.55)", fontSize: 9, letterSpacing: "0.14em", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
            WEEK {viewWeek} · {currentZone.sub}
          </div>
        </div>
      </div>)}

      {/* ── Guided mode (Prep–Year 2): ONE giant button — "press play and go" ── */}
      {isGuided && currentZone && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 22,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "20px",
          pointerEvents: "none",
        }}>
          {/* Soft radial wash so the button reads on any background */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(2,6,16,0.78) 0%, rgba(2,6,16,0.45) 50%, rgba(2,6,16,0.0) 100%)",
            pointerEvents: "none",
          }} />

          <button
            onClick={launchGuidedAdventure}
            disabled={launching}
            style={{
              position: "relative",
              pointerEvents: "auto",
              cursor: launching ? "default" : "pointer",
              padding: "22px 56px",
              borderRadius: 999,
              border: "2px solid rgba(94,234,212,0.85)",
              background: "linear-gradient(180deg, #14b8a6 0%, #0d9488 55%, #0f766e 100%)",
              color: "#ffffff",
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "0.22em",
              fontFamily: "ui-monospace, monospace",
              textShadow: "0 2px 8px rgba(0,0,0,0.55)",
              boxShadow: [
                "0 0 0 4px rgba(20,184,166,0.18)",
                "0 0 38px rgba(20,184,166,0.65)",
                "0 0 90px rgba(20,184,166,0.45)",
                "0 14px 32px rgba(0,0,0,0.55)",
                "inset 0 2px 0 rgba(255,255,255,0.35)",
                "inset 0 -4px 0 rgba(0,0,0,0.25)",
              ].join(", "),
              transform: launching ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.25s ease",
              animation: "guided-pulse 2.4s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}
          >
            ▶  {highestDone === 0 ? "START ADVENTURE" : "CONTINUE ADVENTURE"}
          </button>

          <div style={{
            position: "relative",
            color: "rgba(167,243,208,0.7)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            fontFamily: "ui-monospace, monospace",
            marginTop: 14,
            opacity: launching ? 0 : 1,
            transition: "opacity 0.3s",
          }}>
            TAP TO FLY INTO YOUR NEXT MISSION
          </div>

          <div style={{
            position: "relative",
            color: currentZone.color,
            fontSize: 11, fontWeight: 800, letterSpacing: "0.28em",
            fontFamily: "ui-monospace, monospace",
            textShadow: `0 0 14px ${currentZone.color}, 0 2px 8px rgba(0,0,0,0.9)`,
            marginTop: 14,
            opacity: launching ? 0 : 1,
            transition: "opacity 0.3s",
          }}>
            WEEK {currentWeek}  ·  {currentZone.name}
          </div>
        </div>
      )}

      {/* ── Guided launch flash overlay ── */}
      {isGuided && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50, pointerEvents: "none",
          background: `radial-gradient(circle at 50% 60%, ${era.pulseColor}cc 0%, ${era.pulseColor}66 25%, rgba(2,8,20,0.95) 70%)`,
          opacity: launching ? 1 : 0,
          transition: "opacity 0.6s ease-in 0.25s",
        }} />
      )}

      {/* ── Global keyframes ── */}
      <style>{`
        .nn-hud-btn:hover {
          transform: translateX(-3px) scale(1.04);
          border-color: rgba(94,234,212,0.75) !important;
          box-shadow: 0 0 28px rgba(45,212,191,0.55), 0 8px 26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12) !important;
        }
        .nn-hud-btn:hover .nn-hud-icon {
          transform: scale(1.08);
          box-shadow: inset 0 0 18px rgba(94,234,212,0.45), 0 0 28px rgba(45,212,191,0.55) !important;
        }
        .nn-hud-btn:active { transform: translateX(-2px) scale(0.98); }
        @keyframes holo-scan {
          0%   { background-position: 0 -100px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { background-position: 0 300px; opacity: 0; }
        }
        @keyframes char-float {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-7px); }
        }
        @keyframes pack-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1);    }
          50%       { opacity: 0.9;  transform: scale(1.15); }
        }
        @keyframes beam-pulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1.0; }
        }
        @keyframes core-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes holo-dot {
          0%, 100% { transform: scale(1);   opacity: 0.85; }
          50%       { transform: scale(1.6); opacity: 1;   }
        }
        @keyframes guided-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 4px rgba(20,184,166,0.18),
              0 0 38px rgba(20,184,166,0.55),
              0 0 90px rgba(20,184,166,0.40),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(255,255,255,0.35),
              inset 0 -4px 0 rgba(0,0,0,0.25);
          }
          50% {
            box-shadow:
              0 0 0 6px rgba(94,234,212,0.30),
              0 0 60px rgba(94,234,212,0.85),
              0 0 130px rgba(20,184,166,0.65),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(255,255,255,0.45),
              inset 0 -4px 0 rgba(0,0,0,0.25);
          }
        }
      `}</style>
    </div>
  );
}
