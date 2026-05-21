"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  User, BookOpen, LayoutGrid, BarChart3, Zap,
} from "lucide-react";
import { readProgress } from "@/data/progress";
import {
  readProgramStore,
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
} from "@/lib/program-progress";

// ─── District zones — positions tuned to match concept-art layout ─────────────

const DISTRICT_ZONES = [
  {
    id: "counting", name: "COUNTING\nDISTRICT", sub: "WEEKS 1–3",
    weekStart: 1,  weekEnd: 3,
    left: "7%", top: "34%", color: "#14b8a6",
  },
  {
    id: "bridge", name: "NUMBER\nBRIDGE", sub: "WEEKS 4–6",
    weekStart: 4,  weekEnd: 6,
    left: "23%", top: "40%", color: "#818cf8",
  },
  {
    id: "tower", name: "LEGEND\nTOWER", sub: "WEEK 12",
    weekStart: 12, weekEnd: 12,
    left: "44%", top: "39%", color: "#fbbf24",
  },
  {
    id: "core", name: "CALCULATION\nCORE", sub: "WEEKS 7–9",
    weekStart: 7,  weekEnd: 9,
    left: "62%", top: "37%", color: "#f472b6",
  },
  {
    id: "mastery", name: "MASTERY\nSECTOR", sub: "WEEKS 10–12",
    weekStart: 10, weekEnd: 11,
    left: "72%", top: "24%", color: "#a78bfa",
  },
] as const;

// ─── District sign ─────────────────────────────────────────────────────────────

function DistrictSign({
  zone,
  state,
  active,
  onClick,
}: {
  zone: (typeof DISTRICT_ZONES)[number];
  state: "complete" | "current" | "locked";
  active: boolean;
  onClick: () => void;
}) {
  const cfg = {
    complete: {
      border: "1.5px solid #14b8a6",
      bg: "rgba(4,30,26,0.90)",
      nameColor: "#5eead4",
      badge: "✓  COMPLETE",
      badgeBg: "rgba(20,184,166,0.22)",
      badgeColor: "#14b8a6",
      glow: "0 0 26px rgba(20,184,166,0.45), 0 4px 24px rgba(0,0,0,0.65)",
    },
    current: {
      border: `2px solid ${zone.color}`,
      bg: "rgba(3,8,20,0.94)",
      nameColor: "#ffffff",
      badge: "▶  ENTER",
      badgeBg: `${zone.color}2a`,
      badgeColor: zone.color,
      glow: `0 0 32px ${zone.color}60, 0 4px 28px rgba(0,0,0,0.7)`,
    },
    locked: {
      border: "1px solid rgba(50,62,95,0.38)",
      bg: "rgba(4,6,14,0.75)",
      nameColor: "rgba(80,95,130,0.55)",
      badge: "🔒  LOCKED",
      badgeBg: "rgba(20,25,40,0.42)",
      badgeColor: "rgba(80,95,130,0.48)",
      glow: "0 4px 18px rgba(0,0,0,0.55)",
    },
  }[state];

  return (
    <div
      onClick={state !== "locked" ? onClick : undefined}
      style={{
        padding: "11px 16px",
        borderRadius: 14,
        border: cfg.border,
        background: cfg.bg,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        textAlign: "center",
        minWidth: 130,
        cursor: state !== "locked" ? "pointer" : "default",
        boxShadow: cfg.glow,
        userSelect: "none",
        transition: "transform 0.2s, box-shadow 0.2s",
        transform: active ? "scale(1.07)" : "scale(1)",
        pointerEvents: "auto",
      }}
    >
      {/* Gradient top bar */}
      <div style={{ width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${zone.color}, transparent)`, marginBottom: 9, borderRadius: 1 }} />

      {/* Name */}
      <div style={{
        color: cfg.nameColor,
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: "0.22em",
        fontFamily: "ui-monospace, monospace",
        whiteSpace: "pre-line",
        lineHeight: 1.35,
        marginBottom: 6,
        textShadow: state === "current" ? `0 0 16px ${zone.color}` : "none",
      }}>
        {zone.name}
      </div>

      {/* Sub */}
      <div style={{ color: zone.color, fontSize: 8, opacity: 0.8, letterSpacing: "0.16em", fontFamily: "ui-monospace, monospace", marginBottom: 9 }}>
        {zone.sub}
      </div>

      {/* Badge */}
      <div style={{
        display: "inline-block",
        padding: "3px 11px",
        borderRadius: 6,
        background: cfg.badgeBg,
        border: `1px solid ${zone.color}40`,
        color: cfg.badgeColor,
        fontSize: 8,
        fontWeight: 800,
        letterSpacing: "0.15em",
        fontFamily: "ui-monospace, monospace",
      }}>
        {cfg.badge}
      </div>

      {/* Gradient bottom bar */}
      <div style={{ width: "100%", height: 2, background: `linear-gradient(90deg, transparent, ${zone.color}, transparent)`, marginTop: 9, borderRadius: 1 }} />
    </div>
  );
}

// ─── Character silhouette (blocky boy/girl facing tower) ─────────────────────

function CharacterSilhouette({ gender }: { gender: "boy" | "girl" }) {
  const teal = "#14b8a6";
  const jacket = "#0e2848";
  const pants = "#0a1220";
  const pack = "#09283d";
  const skin = "#b87652";
  const hair = gender === "girl" ? "#3a1e06" : "#110b03";

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width="82"
        height="170"
        viewBox="0 0 82 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Legs */}
        <rect x="22" y="118" width="15" height="44" rx="4" fill={pants} />
        <rect x="45" y="118" width="15" height="44" rx="4" fill={pants} />
        {/* Shoes */}
        <rect x="20" y="153" width="18" height="9" rx="3" fill="#080c14" />
        <rect x="43" y="153" width="18" height="9" rx="3" fill="#080c14" />

        {/* Body */}
        <rect x="14" y="66" width="54" height="56" rx="7" fill={jacket} />

        {/* Shoulder glow trim */}
        <rect x="12" y="66" width="58" height="6" rx="4" fill={teal} opacity="0.75" />

        {/* Arms */}
        <rect x="2"  y="70" width="14" height="44" rx="5" fill={jacket} />
        <rect x="66" y="70" width="14" height="44" rx="5" fill={jacket} />

        {/* Backpack */}
        <rect x="16" y="73" width="26" height="38" rx="5" fill={pack} />
        <rect x="20" y="78" width="18" height="2.5" rx="1" fill={teal} opacity="0.85" />
        <rect x="24" y="87" width="10" height="10"  rx="2" fill={teal} opacity="0.55" />
        {/* Backpack emblem glow */}
        <rect x="26" y="89" width="6" height="6" rx="1" fill={teal} opacity="0.9" />

        {/* Neck */}
        <rect x="31" y="55" width="20" height="13" rx="4" fill={skin} />

        {/* Head */}
        <rect x="21" y="24" width="40" height="36" rx="9" fill={skin} />

        {/* Hair */}
        <rect x="19" y="20" width="44" height="16" rx="8" fill={hair} />
        <rect x="19" y="26" width="44" height="8"  fill={hair} />

        {/* Girl side hair panels */}
        {gender === "girl" && (
          <>
            <rect x="17" y="35" width="6" height="20" rx="3" fill={hair} />
            <rect x="59" y="35" width="6" height="20" rx="3" fill={hair} />
          </>
        )}
      </svg>

      {/* Ground glow beneath character */}
      <div style={{
        position: "absolute",
        bottom: -8,
        left: "50%",
        transform: "translateX(-50%)",
        width: 90,
        height: 22,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${teal}44 0%, transparent 70%)`,
        filter: "blur(5px)",
      }} />

      {/* Backpack glow */}
      <div style={{
        position: "absolute",
        top: "44%",
        left: "20%",
        width: 28,
        height: 28,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${teal}55 0%, transparent 70%)`,
        filter: "blur(6px)",
        animation: "nb-pulse 3s ease-in-out infinite",
      }} />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function NumberNexusMap() {
  const router   = useRouter();
  const [progress] = useState(() => readProgress());
  const [store]    = useState(() => readProgramStore());
  const [bestChain, setBestChain] = useState(0);
  const [gender, setGender]       = useState<"boy" | "girl">("boy");

  useEffect(() => {
    try { setBestChain(Number(localStorage.getItem("lul_best_nexus_chain_v1") ?? 0)); } catch { /* ignore */ }
    try {
      const raw = localStorage.getItem("lul_active_student_v1");
      if (raw) {
        const p = JSON.parse(raw);
        if (p?.gender === "girl" || p?.gender === "female") setGender("girl");
      }
    } catch { /* ignore */ }
  }, []);

  const year       = progress?.year ?? "Year 1";
  const isPrep     = year === "Prep";
  const levelNum   = isPrep ? 0 : parseInt(year.replace(/\D/g, ""), 10) || 1;
  const levelLabel = isPrep ? "PREP" : `LV ${levelNum}`;

  const currentWeek = getRecommendedAssignedWeek(store, year, progress?.assignedWeek, progress?.requiredWeeks);
  const [viewWeek, setViewWeek] = useState(currentWeek);

  const completedByWeek = useMemo(() => {
    const m: Record<number, boolean> = {};
    for (let w = 1; w <= 12; w++) m[w] = isWeekComplete(getWeekProgress(store, year, w));
    return m;
  }, [store, year]);

  const highestDone = useMemo(() =>
    Math.max(0, ...Object.entries(completedByWeek).filter(([, v]) => v).map(([k]) => Number(k))),
    [completedByWeek]);

  const totalXP = useMemo(() => {
    let xp = 0;
    for (let w = 1; w <= 12; w++) {
      const wp = getWeekProgress(store, year, w);
      xp += wp.lessonsCompleted.filter(Boolean).length * 40;
      if (wp.quizScore !== undefined) xp += Math.round((wp.quizScore / 100) * 60);
    }
    return xp;
  }, [store, year]);

  function zoneState(zone: (typeof DISTRICT_ZONES)[number]): "complete" | "current" | "locked" {
    const weeks = Array.from({ length: zone.weekEnd - zone.weekStart + 1 }, (_, i) => zone.weekStart + i);
    if (weeks.every((w) => completedByWeek[w])) return "complete";
    if (currentWeek >= zone.weekStart) return "current";
    return "locked";
  }

  function onDistrictTap(weekStart: number, weekEnd: number) {
    for (let w = weekStart; w <= weekEnd; w++) {
      if (!completedByWeek[w]) { router.push(`/program?year=${encodeURIComponent(year)}&week=${w}`); return; }
    }
    router.push(`/program?year=${encodeURIComponent(year)}&week=${weekEnd}`);
  }

  const canBack    = viewWeek > 1;
  const canForward = viewWeek < 12 && viewWeek <= currentWeek + 1;
  const currentZone = DISTRICT_ZONES.find((z) => viewWeek >= z.weekStart && viewWeek <= z.weekEnd);

  // Which zone is active in the current viewWeek
  const activeZoneId = currentZone?.id ?? null;

  // ── Shared style helpers ──
  const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px", borderRadius: 999,
    background: "rgba(14,118,110,0.18)", border: "1px solid rgba(94,234,212,0.18)",
    ...extra,
  });
  const hudBtn: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
    padding: "10px 10px", borderRadius: 12, cursor: "pointer",
    background: "rgba(2,10,22,0.88)", border: "1px solid rgba(94,234,212,0.18)",
    backdropFilter: "blur(12px)", minWidth: 52,
    boxShadow: "0 0 10px rgba(94,234,212,0.05), 0 4px 16px rgba(0,0,0,0.55)",
  };
  const navBtn = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "9px 20px", borderRadius: 999, cursor: active ? "pointer" : "default",
    background: active ? "rgba(14,118,110,0.26)" : "rgba(12,20,32,0.2)",
    border: `1px solid ${active ? "rgba(94,234,212,0.28)" : "rgba(94,234,212,0.07)"}`,
    color: active ? "#5eead4" : "rgba(94,234,212,0.22)",
    fontSize: 12, fontWeight: 700, transition: "all 0.2s",
  });

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#020810" }}>

      {/* ── Background image ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/number-nexus-home-bg.jpg"
        alt=""
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 30%",
          zIndex: 0,
        }}
      />

      {/* Depth gradient overlays */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "linear-gradient(180deg, rgba(2,8,20,0.55) 0%, rgba(2,8,20,0.0) 35%, rgba(2,8,20,0.0) 55%, rgba(2,8,20,0.82) 100%)",
      }} />
      {/* Side darkening */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse at 50% 42%, transparent 38%, rgba(2,8,20,0.38) 100%)",
      }} />

      {/* ── District signs ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 10, pointerEvents: "none" }}>
        {DISTRICT_ZONES.map((zone) => (
          <div
            key={zone.id}
            style={{
              position: "absolute",
              left: zone.left,
              top: zone.top,
              transform: "translate(-50%, -50%)",
              pointerEvents: "auto",
            }}
          >
            <DistrictSign
              zone={zone}
              state={zoneState(zone)}
              active={activeZoneId === zone.id}
              onClick={() => onDistrictTap(zone.weekStart, zone.weekEnd)}
            />
          </div>
        ))}
      </div>

      {/* ── Character at bottom center ── */}
      <div style={{
        position: "absolute", bottom: "11%", left: "50%", transform: "translateX(-50%)",
        zIndex: 8,
      }}>
        <CharacterSilhouette gender={gender} />
      </div>

      {/* ── Top bar ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        background: "rgba(2,6,16,0.72)", borderBottom: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(14px)",
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
        <div style={chip({ background: "rgba(94,234,212,0.07)", border: "1px solid rgba(94,234,212,0.14)" })}>
          <span style={{ color: "#2dd4bf", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>{levelLabel}</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...chip() }}>
          <Zap size={11} color="#14b8a6" />
          <span style={{ color: "#99f6e4", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{totalXP} XP</span>
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
          { Icon: BookOpen,  label: "LEGENDS", route: "/legends"     },
          { Icon: LayoutGrid, label: "LEVELS",  route: "/levels"      },
          { Icon: BarChart3,  label: "STATS",   route: "/realm-stats" },
        ].map(({ Icon, label, route }) => (
          <button key={label} onClick={() => router.push(route)} style={hudBtn}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "rgba(14,118,110,0.22)" }}>
              <Icon size={16} color="#14b8a6" />
            </div>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(94,234,212,0.7)", fontFamily: "ui-monospace,monospace" }}>{label}</span>
          </button>
        ))}
        {bestChain > 0 && (
          <div style={{ ...hudBtn, cursor: "default" }}>
            <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(94,234,212,0.5)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.4 }}>{"BEST\nCHAIN"}</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#5eead4", lineHeight: 1 }}>{bestChain}</span>
            <span style={{ fontSize: 9, color: "#fbbf24" }}>⚡</span>
          </div>
        )}
      </div>

      {/* ── Bottom nav ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px",
        background: "rgba(2,6,16,0.82)", borderTop: "1px solid rgba(94,234,212,0.1)",
        backdropFilter: "blur(14px)",
      }}>
        <button onClick={() => canBack && setViewWeek((v) => v - 1)} disabled={!canBack} style={navBtn(canBack)}>
          <ChevronLeft size={15} /> Prev
        </button>
        <div style={{ textAlign: "center" }}>
          {currentZone && (
            <>
              <div style={{ color: currentZone.color, fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace", textShadow: `0 0 12px ${currentZone.color}` }}>
                {currentZone.name.replace("\n", " ")}
              </div>
              <div style={{ color: "rgba(148,163,184,0.55)", fontSize: 9, letterSpacing: "0.14em", fontFamily: "ui-monospace,monospace", marginTop: 2 }}>
                WEEK {viewWeek} · {currentZone.sub}
              </div>
            </>
          )}
        </div>
        <button onClick={() => canForward && setViewWeek((v) => v + 1)} disabled={!canForward} style={navBtn(canForward)}>
          Next <ChevronRight size={15} />
        </button>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes nb-pulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
      `}</style>
    </div>
  );
}
