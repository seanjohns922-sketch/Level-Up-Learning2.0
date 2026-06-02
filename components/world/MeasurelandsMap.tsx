"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  User, Zap,
} from "lucide-react";
import { readProgress } from "@/data/progress";
import {
  readProgramStore,
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
} from "@/lib/program-progress";
import { readBestChain } from "@/lib/best-chain";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";

// Measurelands reskin of the Number Nexus world map.
// Layout, flow, and interactions match NumberNexusMap.
// Only artwork, palette, labels, and districts change.

const BG_IMAGE = "/images/measurelands-home-bg.jpg";

// Warm magical palette — teal, gold, soft purple, warm twilight blue.
const PALETTE = {
  primary: "#f5b042",   // warm gold
  primaryDeep: "#c98018",
  teal: "#5eead4",
  tealDeep: "#0d9488",
  purple: "#a78bfa",
  blue: "#7dd3fc",
  ink: "#1a1330",
  inkDeep: "#0d0820",
} as const;

// ─── Measurelands districts (Ground Level, 8 weeks) ───────────────────────────
const DISTRICT_ZONES = [
  { id: "length",    name: "LENGTH LANDS",       sub: "WEEKS 1–2",  weekStart: 1, weekEnd: 2, left: "4%",  top: "16%", color: PALETTE.teal,   panX: 10  },
  { id: "balance",   name: "BALANCE BASIN",      sub: "WEEKS 3–4",  weekStart: 3, weekEnd: 4, left: "4%",  top: "58%", color: PALETTE.blue,   panX: 6   },
  { id: "tower",     name: "TIMEWIELDER TOWER",  sub: "FINAL TRIAL",weekStart: 8, weekEnd: 8, left: "50%", top: "30%", color: PALETTE.primary,panX: 0   },
  { id: "capacity",  name: "CAPACITY SPRINGS",   sub: "WEEKS 5–6",  weekStart: 5, weekEnd: 6, left: "72%", top: "16%", color: PALETTE.purple, panX: -8  },
  { id: "clockwork", name: "CLOCKWORK CROSSING", sub: "WEEKS 7–8",  weekStart: 7, weekEnd: 7, left: "72%", top: "58%", color: "#fcd34d",      panX: -12 },
] as const;

const PARTICLE_COLOURS = ["#f5b042", "#5eead4", "#a78bfa", "#7dd3fc", "#fcd34d"];

// ─── World canvas (particles + tower pulse) ─────────────────────────────────
function useWorldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 80 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.9 + Math.random() * 2.2,
      vy: -(0.16 + Math.random() * 0.5) / 1080,
      vx: ((Math.random() - 0.5) * 0.14) / 1920,
      color: PARTICLE_COLOURS[i % PARTICLE_COLOURS.length],
      opacity: 0.25 + Math.random() * 0.55,
    }));

    let pulse = 0;
    let fid: number;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

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

      // Tower pulse rings — warm gold around the central Timewielder Tower
      const tx = W * 0.5, ty = H * 0.32;
      pulse += 0.42;
      for (let i = 0; i < 4; i++) {
        const ph = (pulse + i * 28) % 112;
        const r  = ph * 1.4;
        const a  = Math.max(0, 0.30 - ph / 392);
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(tx, ty, r, 0, Math.PI * 2);
        ctx.strokeStyle = PALETTE.primary;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      fid = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(fid); window.removeEventListener("resize", resize); };
  }, []);

  return ref;
}

// ─── District label ─────────────────────────────────────────────────────────
function DistrictLabel({
  zone, state, active, onClick, fontSize = 18,
}: {
  zone: (typeof DISTRICT_ZONES)[number];
  state: "complete" | "current" | "locked";
  active: boolean;
  onClick: () => void;
  fontSize?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const locked = state === "locked";

  const nameGlow   = `0 0 22px ${zone.color}99, 0 0 8px ${zone.color}66, 0 2px 10px rgba(0,0,0,0.95)`;
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
      <div style={{
        color: "#fffaf0",
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
        {locked && <span style={{ fontSize: 16, lineHeight: 1 }}>🔒</span>}
      </div>

      <div style={{
        color: zone.color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.18em",
        fontFamily: "ui-monospace, monospace",
        textShadow: "0 1px 8px rgba(0,0,0,0.95)",
        opacity: 0.95,
      }}>
        {zone.sub}{!locked && `  ·  ${statusText}`}
      </div>

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
          boxShadow: `0 0 12px ${zone.color}44`,
        }}>
          TAP TO ENTER
        </div>
      )}
    </div>
  );
}

// ─── Player character — same silhouette, warm-realm trim ────────────────────
function PlayerCharacter({ gender }: { gender: "boy" | "girl" }) {
  const accent = PALETTE.primary;
  const jacket = "#3a2a18";
  const pants = "#1c130a";
  const pack = "#4a2f12";
  const skin = "#b87652";
  const hair = gender === "girl" ? "#3a1e06" : "#110b03";

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        animation: "char-float 4.5s ease-in-out infinite",
        filter: `drop-shadow(0 0 14px ${accent}55) drop-shadow(0 8px 18px rgba(0,0,0,0.7))`,
      }}
    >
      <svg width="96" height="196" viewBox="0 0 96 196" fill="none">
        <rect x="23" y="172" width="20" height="10" rx="3" fill="#060912" />
        <rect x="53" y="172" width="20" height="10" rx="3" fill="#060912" />
        <rect x="25" y="130" width="16" height="46" rx="4" fill={pants} />
        <rect x="55" y="130" width="16" height="46" rx="4" fill={pants} />
        <rect x="16" y="74" width="64" height="60" rx="8" fill={jacket} />
        <rect x="14" y="74" width="68" height="7" rx="5" fill={accent} opacity="0.75" />
        <rect x="2"  y="80" width="16" height="48" rx="5" fill={jacket} />
        <rect x="78" y="80" width="16" height="48" rx="5" fill={jacket} />
        <rect x="2"  y="80" width="16" height="5" rx="3" fill={accent} opacity="0.55" />
        <rect x="78" y="80" width="16" height="5" rx="3" fill={accent} opacity="0.55" />
        <rect x="18" y="82" width="30" height="42" rx="5" fill={pack} />
        <rect x="22" y="88" width="22" height="3" rx="1.5" fill={accent} opacity="0.85" />
        <rect x="27" y="98" width="12" height="12" rx="2.5" fill={accent} opacity="0.6" />
        <rect x="30" y="101" width="6" height="6" rx="1" fill={accent} opacity="0.95" />
        <rect x="36" y="62" width="24" height="15" rx="5" fill={skin} />
        <rect x="25" y="27" width="46" height="40" rx="10" fill={skin} />
        <rect x="23" y="22" width="50" height="19" rx="9" fill={hair} />
        <rect x="23" y="30" width="50" height="9" fill={hair} />
        {gender === "girl" && (
          <>
            <rect x="20" y="40" width="7" height="22" rx="4" fill={hair} />
            <rect x="69" y="40" width="7" height="22" rx="4" fill={hair} />
          </>
        )}
      </svg>

      <div style={{
        position: "absolute",
        top: "50%",
        left: "22%",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accent}66 0%, transparent 70%)`,
        filter: "blur(7px)",
        animation: "pack-pulse 2.8s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "absolute",
        bottom: -12,
        left: "50%",
        transform: "translateX(-50%)",
        width: 100,
        height: 24,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${accent}44 0%, transparent 70%)`,
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

// ─── HUD icons — measurement themed ─────────────────────────────────────────
function LegendsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="mlLeg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#c98018" />
        </linearGradient>
      </defs>
      {/* wizard hat (Meazurex) */}
      <path d="M16 3 L24 23 L8 23 Z" fill="url(#mlLeg)" stroke="#fffbeb" strokeWidth="1.3" />
      <rect x="6" y="22" width="20" height="4" rx="2" fill="#7c3aed" stroke="#fffbeb" strokeWidth="1.1" />
      <circle cx="16" cy="10" r="1.4" fill="#fffbeb" />
      <path d="M14 14l2-1 2 1-2 1z" fill="#fffbeb" opacity="0.85" />
    </svg>
  );
}
function WorldsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="mlGlobe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="11" fill="url(#mlGlobe)" stroke="#ccfbf1" strokeWidth="1.3" />
      <path d="M5 16h22M16 5c4 4 4 18 0 22M16 5c-4 4-4 18 0 22" stroke="#fffbeb" strokeWidth="1" fill="none" opacity="0.7" />
    </svg>
  );
}
function ProgressIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="mlHg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      {/* hourglass */}
      <rect x="8" y="4" width="16" height="2" fill="#fffbeb" />
      <rect x="8" y="26" width="16" height="2" fill="#fffbeb" />
      <path d="M9 6 L23 6 L17 16 L23 26 L9 26 L15 16 Z" fill="url(#mlHg)" stroke="#fffbeb" strokeWidth="1.1" />
      <circle cx="16" cy="20" r="1.4" fill="#7c3aed" />
    </svg>
  );
}

export default function MeasurelandsMap() {
  const router   = useRouter();
  const [progress] = useState(() => readProgress());
  const [store]    = useState(() => readProgramStore());
  const [gender] = useState<"boy" | "girl">(readGenderFromStorage);
  const [launching, setLaunching] = useState(false);

  // Ground Level / Prep cohort for Measurement realm
  const year       = "Prep" as const;
  const isGuided   = true; // Ground Level uses single-button guided flow
  const levelLabel = "GROUND";
  const canvasRef  = useWorldCanvas();

  const currentWeek = getRecommendedAssignedWeek(store, year, progress?.assignedWeek, progress?.requiredWeeks);
  const [viewWeek, setViewWeek] = useState(currentWeek);

  const completedByWeek = useMemo(() => {
    const m: Record<number, boolean> = {};
    for (let w = 1; w <= 8; w++) m[w] = isWeekComplete(getWeekProgress(store, year, w));
    return m;
  }, [store]);

  const highestDone = useMemo(() =>
    Math.max(0, ...Object.entries(completedByWeek).filter(([, v]) => v).map(([k]) => Number(k))),
    [completedByWeek]);

  const totalXP = useMemo(() => {
    let xp = 0;
    for (let w = 1; w <= 8; w++) {
      const wp = getWeekProgress(store, year, w);
      xp += wp.lessonsCompleted.filter(Boolean).length * 40;
      if (wp.quizScore !== undefined) xp += Math.round((wp.quizScore / 100) * 60);
    }
    return xp;
  }, [store]);

  const [bestChain] = useState(() => readBestChain("measurement", year));
  const [classBestChain, setClassBestChain] = useState<number | null>(null);

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
        const readMax = async (filterLevel: boolean) => {
          let query = supabase
            .from("student_lesson_attempts")
            .select("summary")
            .eq("class_id", classId)
            .eq("realm_id", "measurement");

          if (filterLevel) query = query.eq("working_level", year);

          const { data, error } = await query;
          if (error) throw error;

          let max = 0;
          for (const row of data ?? []) {
            const summary =
              row.summary && typeof row.summary === "object" && !Array.isArray(row.summary)
                ? (row.summary as Record<string, unknown>)
                : null;
            const candidate = Number(summary?.bestChain ?? summary?.best_chain ?? 0);
            if (Number.isFinite(candidate) && candidate > max) max = candidate;
          }
          return max > 0 ? max : null;
        };

        const scoped = await readMax(true);
        const fallback = scoped ?? (await readMax(false));
        if (!cancelled) setClassBestChain(fallback);
      } catch (error) {
        if (!cancelled) {
          console.warn("[MeasurelandsMap] Failed to load class best chain:", error);
          setClassBestChain(null);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

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
    window.setTimeout(() => {
      onDistrictTap(currentZone.weekStart, currentZone.weekEnd);
    }, 900);
  }

  const canBack    = viewWeek > 1;
  const canForward = viewWeek < 8 && viewWeek <= currentWeek + 1;
  const currentZone = DISTRICT_ZONES.find((z) => viewWeek >= z.weekStart && viewWeek <= z.weekEnd) ?? DISTRICT_ZONES[0];
  const activeZoneId = currentZone?.id ?? null;

  const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 999,
    background: "rgba(124,58,237,0.18)", border: "1px solid rgba(245,176,66,0.28)",
    ...extra,
  });
  const hudBtn: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "12px 10px 10px", borderRadius: 18, cursor: "pointer",
    background: "linear-gradient(180deg, rgba(28,18,48,0.92) 0%, rgba(12,8,28,0.95) 100%)",
    border: "1.5px solid rgba(245,176,66,0.45)",
    backdropFilter: "blur(14px)", width: 72,
    boxShadow: "0 0 18px rgba(245,176,66,0.22), 0 6px 22px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
    transition: "transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease",
  };
  const navBtn = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 20px", borderRadius: 999, cursor: active ? "pointer" : "default",
    background: active ? "rgba(124,58,237,0.28)" : "rgba(28,18,48,0.2)",
    border: `1px solid ${active ? "rgba(245,176,66,0.38)" : "rgba(245,176,66,0.1)"}`,
    color: active ? "#fde68a" : "rgba(253,230,138,0.25)",
    fontSize: 12, fontWeight: 700, transition: "all 0.2s",
  });

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#0d0820" }}>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BG_IMAGE}
        alt=""
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 42%",
          zIndex: 0,
          transform: launching ? "scale(1.35)" : "scale(1)",
          transition: "transform 0.9s cubic-bezier(0.5, 0, 0.75, 0)",
        }}
      />

      {/* Atmospheric depth — soft warm wash */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(180deg, rgba(20,12,40,0.42) 0%, rgba(40,24,60,0.06) 38%, rgba(20,12,40,0.05) 55%, rgba(10,6,24,0.86) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse 82% 72% at 50% 44%, transparent 38%, rgba(10,6,24,0.42) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse 60% 55% at 50% 32%, rgba(245,176,66,0.10) 0%, transparent 70%)",
      }} />

      {/* Volumetric tower beam — warm gold */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "0%",
        transform: "translateX(-50%)",
        width: 110,
        height: "50%",
        background: `linear-gradient(180deg, ${PALETTE.primary}00 0%, ${PALETTE.primary}28 60%, ${PALETTE.primary}55 100%)`,
        filter: "blur(16px)",
        zIndex: 3,
        pointerEvents: "none",
        animation: "beam-pulse 3.5s ease-in-out infinite",
      }} />

      <div style={{
        position: "absolute",
        bottom: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "38%",
        height: 120,
        background: `radial-gradient(ellipse at 50% 0%, ${PALETTE.primary}3a 0%, transparent 75%)`,
        filter: "blur(10px)",
        zIndex: 3,
        pointerEvents: "none",
      }} />

      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}
      />

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
        {!isGuided && DISTRICT_ZONES.map((zone) => (
          <div
            key={zone.id}
            style={{
              position: "absolute",
              left: zone.left,
              top: zone.top,
              transform: zone.id === "tower" ? "translateX(-50%)" : undefined,
              pointerEvents: "auto",
            }}
          >
            <DistrictLabel
              zone={zone}
              state={zoneState(zone)}
              active={activeZoneId === zone.id}
              onClick={() => onDistrictTap(zone.weekStart, zone.weekEnd)}
              fontSize={18}
            />
          </div>
        ))}

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
                color: "#fffaf0",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.22em",
                fontFamily: "ui-monospace, monospace",
                opacity: activeZoneId === zone.id ? 0.9 : 0.4,
                textShadow: `0 0 14px ${zone.color}aa, 0 2px 8px rgba(0,0,0,0.9)`,
                whiteSpace: "nowrap",
              }}
            >
              {zone.name}
            </div>
          );
        })}

        <div style={{
          position: "absolute",
          bottom: "2%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 12,
          pointerEvents: "auto",
        }}>
          <PlayerCharacter gender={gender} />
        </div>
      </div>

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        background: "rgba(10,6,24,0.72)", borderBottom: "1px solid rgba(245,176,66,0.16)",
        backdropFilter: "blur(16px)",
      }}>
        <button
          onClick={() => router.push(`/realms?level=${encodeURIComponent(year)}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, ...chip(), cursor: "pointer", color: "rgba(253,230,138,0.95)", fontSize: 12, fontWeight: 700 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={chip()}>
          <span style={{ color: PALETTE.primary, fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>⏳ MEASURELANDS</span>
        </div>
        <div style={chip({ background: "rgba(245,176,66,0.10)", border: "1px solid rgba(245,176,66,0.22)" })}>
          <span style={{ color: "#fde68a", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>{levelLabel}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...chip() }}>
          <Zap size={11} color={PALETTE.primary} />
          <span style={{ color: "#fde68a", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{totalXP} XP</span>
        </div>
        <div style={chip()}>
          <span style={{ color: "#fde68a", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{highestDone}/8</span>
        </div>
        <button
          onClick={() => router.push("/profile")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", background: "rgba(124,58,237,0.28)", border: "1px solid rgba(245,176,66,0.35)" }}
        >
          <User size={16} color="#fde68a" />
        </button>
      </div>

      {/* ── Right HUD ── */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { key: "legends",  label: "LEGENDS",  route: "/legends",     icon: <LegendsIcon /> },
          { key: "worlds",   label: "WORLDS",   route: "/levels",      icon: <WorldsIcon /> },
          { key: "progress", label: "PROGRESS", route: "/realm-stats", icon: <ProgressIcon /> },
        ].map(({ key, label, route, icon }) => (
          <button key={key} onClick={() => router.push(route)} style={hudBtn} className="ml-hud-btn">
            <div className="ml-hud-icon" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 48, height: 48, borderRadius: 14,
              background: "radial-gradient(circle at 50% 35%, rgba(245,176,66,0.32) 0%, rgba(124,58,237,0.22) 55%, rgba(12,8,28,0.0) 100%)",
              border: "1px solid rgba(245,176,66,0.38)",
              boxShadow: "inset 0 0 14px rgba(245,176,66,0.28), 0 0 18px rgba(245,176,66,0.20)",
              transition: "transform 200ms ease, box-shadow 220ms ease",
            }}>
              {icon}
            </div>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#fde68a", fontFamily: "ui-monospace,monospace", textShadow: "0 0 10px rgba(245,176,66,0.6)" }}>{label}</span>
          </button>
        ))}
        <div style={{ ...hudBtn, cursor: "default", gap: 4 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(253,230,138,0.55)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15 }}>
            MY BEST
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#fde68a", lineHeight: 1 }}>{bestChain}</span>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(167,139,250,0.7)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15, marginTop: 2 }}>
            CLASS BEST
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: PALETTE.purple, lineHeight: 1 }}>
            {classBestChain ?? "—"}
          </span>
        </div>
      </div>

      {/* ── Meazurex mentor whisper card (subtle, bottom left) ── */}
      <div style={{
        position: "absolute", bottom: 18, left: 14, zIndex: 20,
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px 8px 8px", borderRadius: 14,
        background: "linear-gradient(180deg, rgba(28,18,48,0.85) 0%, rgba(12,8,28,0.9) 100%)",
        border: "1px solid rgba(245,176,66,0.35)",
        boxShadow: "0 0 18px rgba(245,176,66,0.18), 0 6px 18px rgba(0,0,0,0.5)",
        backdropFilter: "blur(12px)",
        maxWidth: 280,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: "radial-gradient(circle at 50% 30%, #a78bfa 0%, #5b21b6 70%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "inset 0 0 10px rgba(0,0,0,0.5), 0 0 12px rgba(167,139,250,0.5)",
          flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M16 4 L23 21 L9 21 Z" fill="#fde68a" stroke="#fffbeb" strokeWidth="1.2" />
            <rect x="7" y="20" width="18" height="4" rx="2" fill="#7c3aed" stroke="#fffbeb" strokeWidth="0.9" />
            <circle cx="16" cy="11" r="1.2" fill="#fffbeb" />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#fde68a", fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>
            MEAZUREX · GUIDE
          </div>
          <div style={{ color: "rgba(253,230,138,0.85)", fontSize: 11, fontWeight: 600, lineHeight: 1.25, marginTop: 2 }}>
            Master measurement. Balance the world.
          </div>
        </div>
      </div>

      {/* ── Bottom nav (hidden in guided mode) ── */}
      {!isGuided && (<div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px",
        background: "rgba(10,6,24,0.84)", borderTop: "1px solid rgba(245,176,66,0.16)",
        backdropFilter: "blur(16px)",
      }}>
        <button onClick={() => canBack && setViewWeek((v) => v - 1)} disabled={!canBack} style={navBtn(canBack)}>
          <ChevronLeft size={15} /> Prev
        </button>
        <div style={{ textAlign: "center" }}>
          {currentZone && (
            <>
              <div style={{ color: currentZone.color, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace", textShadow: `0 0 14px ${currentZone.color}` }}>
                {currentZone.name}
              </div>
              <div style={{ color: "rgba(253,230,138,0.55)", fontSize: 9, letterSpacing: "0.14em", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
                WEEK {viewWeek} · {currentZone.sub}
              </div>
            </>
          )}
        </div>
        <button onClick={() => canForward && setViewWeek((v) => v + 1)} disabled={!canForward} style={navBtn(canForward)}>
          Next <ChevronRight size={15} />
        </button>
      </div>)}

      {/* ── Guided mode: big launch button ── */}
      {isGuided && currentZone && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 22,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "20px",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(10,6,24,0.72) 0%, rgba(10,6,24,0.4) 50%, rgba(10,6,24,0.0) 100%)",
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
              border: "2px solid rgba(253,230,138,0.85)",
              background: "linear-gradient(180deg, #f5b042 0%, #d18a1a 55%, #8a5612 100%)",
              color: "#fffbeb",
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: "0.22em",
              fontFamily: "ui-monospace, monospace",
              textShadow: "0 2px 8px rgba(0,0,0,0.55)",
              boxShadow: [
                "0 0 0 4px rgba(245,176,66,0.22)",
                "0 0 38px rgba(245,176,66,0.7)",
                "0 0 90px rgba(245,176,66,0.5)",
                "0 14px 32px rgba(0,0,0,0.55)",
                "inset 0 2px 0 rgba(255,255,255,0.35)",
                "inset 0 -4px 0 rgba(0,0,0,0.25)",
              ].join(", "),
              transform: launching ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.25s ease",
              animation: "guided-pulse-ml 2.4s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}
          >
            ▶  {highestDone === 0 ? "START ADVENTURE" : "CONTINUE ADVENTURE"}
          </button>

          <div style={{
            position: "relative",
            color: "rgba(253,230,138,0.85)",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.2em",
            fontFamily: "ui-monospace, monospace",
            marginTop: 14,
            opacity: launching ? 0 : 1,
            transition: "opacity 0.3s",
          }}>
            TAP TO STEP INTO MEASURELANDS
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

      {isGuided && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 50, pointerEvents: "none",
          background: `radial-gradient(circle at 50% 60%, ${PALETTE.primary}cc 0%, ${PALETTE.primary}66 25%, rgba(10,6,24,0.95) 70%)`,
          opacity: launching ? 1 : 0,
          transition: "opacity 0.6s ease-in 0.25s",
        }} />
      )}

      <style>{`
        .ml-hud-btn:hover {
          transform: translateX(-3px) scale(1.04);
          border-color: rgba(253,230,138,0.85) !important;
          box-shadow: 0 0 28px rgba(245,176,66,0.6), 0 8px 26px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12) !important;
        }
        .ml-hud-btn:hover .ml-hud-icon {
          transform: scale(1.08);
          box-shadow: inset 0 0 18px rgba(245,176,66,0.5), 0 0 28px rgba(245,176,66,0.6) !important;
        }
        .ml-hud-btn:active { transform: translateX(-2px) scale(0.98); }
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
        @keyframes guided-pulse-ml {
          0%, 100% {
            box-shadow:
              0 0 0 4px rgba(245,176,66,0.22),
              0 0 38px rgba(245,176,66,0.55),
              0 0 90px rgba(245,176,66,0.40),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(255,255,255,0.35),
              inset 0 -4px 0 rgba(0,0,0,0.25);
          }
          50% {
            box-shadow:
              0 0 0 6px rgba(253,230,138,0.34),
              0 0 60px rgba(253,230,138,0.85),
              0 0 130px rgba(245,176,66,0.65),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(255,255,255,0.45),
              inset 0 -4px 0 rgba(0,0,0,0.25);
          }
        }
      `}</style>
    </div>
  );
}