"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, CheckCircle, Zap, ChevronRight } from "lucide-react";
import { readProgress, type StudentProgress } from "@/data/progress";
import {
  readProgramStore,
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
  type ProgramProgressStore,
} from "@/lib/program-progress";

// ─── District definitions ────────────────────────────────────────────────────
// Week 1 at the bottom (start), Week 12 at the top (boss destination).
// x is in SVG units (0–384), y is px from top of the 2500px tall map.

const SVG_W = 384;
const SVG_H = 2500;

const DISTRICTS = [
  { week: 12, name: "Legend Tower",     sub: "The Final Challenge",  x: 192, y: 90,   isBoss: true  },
  { week: 11, name: "Mastery Sector",   sub: "Prove your mastery",   x: 192, y: 310,  isBoss: false },
  { week: 10, name: "Arcade District",  sub: "Speed run challenge",   x: 286, y: 515,  isBoss: false },
  { week: 9,  name: "Position Arena",   sub: "Place with precision",  x: 192, y: 715,  isBoss: false },
  { week: 8,  name: "Pathway Network",  sub: "Map the connections",   x: 100, y: 915,  isBoss: false },
  { week: 7,  name: "Collection Zone",  sub: "Gather your knowledge", x: 192, y: 1115, isBoss: false },
  { week: 6,  name: "Split Core",       sub: "Divide and conquer",    x: 286, y: 1315, isBoss: false },
  { week: 5,  name: "Reactor District", sub: "Power up your skills",  x: 192, y: 1510, isBoss: false },
  { week: 4,  name: "Build Labs",       sub: "Construct quantities",  x: 100, y: 1710, isBoss: false },
  { week: 3,  name: "Number Bridge",    sub: "Connect the numbers",   x: 192, y: 1910, isBoss: false },
  { week: 2,  name: "Counting Station", sub: "Build counting power",  x: 286, y: 2110, isBoss: false },
  { week: 1,  name: "Training Yard",    sub: "Begin your journey",    x: 192, y: 2310, isBoss: false },
] as const;

// Ordered Week 1 → 12 (bottom to top) for path drawing
const DISTRICTS_ASCENDING = [...DISTRICTS].reverse();

type NodeState = "complete" | "current" | "accessible" | "locked" | "boss_locked" | "boss_unlocked";

function getNodeState(
  week: number,
  currentWeek: number,
  completedByWeek: Record<number, boolean>,
  isBoss: boolean
): NodeState {
  if (isBoss) {
    return completedByWeek[week] ? "boss_unlocked" : "boss_locked";
  }
  if (completedByWeek[week]) return "complete";
  if (week === currentWeek) return "current";
  if (week < currentWeek) return "accessible";
  return "locked";
}

// ─── Path helpers ────────────────────────────────────────────────────────────

function buildPath(nodes: typeof DISTRICTS_ASCENDING) {
  return nodes.map((n, i) => (i === 0 ? `M ${n.x} ${n.y}` : `L ${n.x} ${n.y}`)).join(" ");
}

function buildPathUpTo(nodes: typeof DISTRICTS_ASCENDING, upToWeek: number) {
  const slice = nodes.filter((n) => n.week <= upToWeek);
  if (slice.length < 2) return "";
  return buildPath(slice as typeof DISTRICTS_ASCENDING);
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function NumberNexusMapPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [store, setStore] = useState<ProgramProgressStore>({});
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrolledRef = useRef(false);

  useEffect(() => {
    setProgress(readProgress());
    setStore(readProgramStore());
  }, []);

  const year = progress?.year ?? "Year 1";
  const currentWeek = getRecommendedAssignedWeek(
    store,
    year,
    progress?.assignedWeek,
    progress?.requiredWeeks
  );

  const completedByWeek: Record<number, boolean> = {};
  for (let w = 1; w <= 12; w++) {
    completedByWeek[w] = isWeekComplete(getWeekProgress(store, year, w));
  }

  const highestCompletedWeek = Math.max(
    0,
    ...Object.entries(completedByWeek)
      .filter(([, v]) => v)
      .map(([k]) => Number(k))
  );

  // Auto-scroll to current week on first load
  useEffect(() => {
    if (scrolledRef.current || !progress) return;
    const ref = nodeRefs.current[currentWeek];
    if (ref) {
      scrolledRef.current = true;
      setTimeout(() => ref.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, [progress, currentWeek]);

  function enterDistrict(week: number, state: NodeState) {
    if (state === "locked" || state === "boss_locked") return;
    router.push(`/program?year=${encodeURIComponent(year)}&week=${week}`);
  }

  const completedPath = highestCompletedWeek >= 2
    ? buildPathUpTo(DISTRICTS_ASCENDING, highestCompletedWeek)
    : "";
  const fullPath = buildPath(DISTRICTS_ASCENDING);

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* ── Sticky header ───────────────────────────────────────── */}
      <div
        className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3"
        style={{
          background: "rgba(2,20,18,0.85)",
          borderBottom: "1px solid rgba(94,234,212,0.12)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => router.push(`/realms?level=${encodeURIComponent(year)}`)}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-teal-100/80 transition-all active:scale-95 hover:text-white"
          style={{
            background: "rgba(15,118,110,0.25)",
            border: "1px solid rgba(94,234,212,0.2)",
          }}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>

        <div
          className="px-4 py-1.5 rounded-full"
          style={{
            background: "rgba(15,118,110,0.2)",
            border: "1px solid rgba(94,234,212,0.2)",
          }}
        >
          <span className="text-teal-300 text-[10px] font-extrabold tracking-[0.18em]">
            NUMBER NEXUS
          </span>
        </div>

        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(15,118,110,0.2)",
            border: "1px solid rgba(94,234,212,0.15)",
          }}
        >
          <Zap className="h-3 w-3 text-teal-400" />
          <span className="text-teal-200 text-[10px] font-bold tabular-nums">
            {highestCompletedWeek}/12
          </span>
        </div>
      </div>

      {/* ── Scrollable map ──────────────────────────────────────── */}
      <div className="relative pt-14 overflow-x-hidden">
        {/* Full-screen background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <img
            src="/images/number-nexus-bg.jpg"
            alt=""
            className="w-full h-full object-cover object-top"
            style={{ opacity: 0.35 }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/55 to-slate-950/80" />
        </div>

        {/* Map container — centred, fixed width, tall */}
        <div
          className="relative mx-auto"
          style={{
            width: `${SVG_W}px`,
            height: `${SVG_H}px`,
            maxWidth: "100vw",
            zIndex: 10,
          }}
        >
          {/* ── SVG path layer ──── */}
          <svg
            className="absolute inset-0 pointer-events-none"
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          >
            {/* Full dim route (shows the whole path ahead) */}
            <path
              d={fullPath}
              fill="none"
              stroke="rgba(94,234,212,0.1)"
              strokeWidth="3"
              strokeDasharray="8 7"
              strokeLinecap="round"
            />

            {/* Completed bright route */}
            {completedPath && (
              <path
                d={completedPath}
                fill="none"
                stroke="rgba(94,234,212,0.65)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            )}

            {/* Glow layer on completed route */}
            {completedPath && (
              <path
                d={completedPath}
                fill="none"
                stroke="rgba(94,234,212,0.25)"
                strokeWidth="10"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* ── District nodes ──── */}
          {DISTRICTS.map((district) => {
            const state = getNodeState(
              district.week,
              currentWeek,
              completedByWeek,
              district.isBoss
            );
            const canEnter = state !== "locked" && state !== "boss_locked";

            return (
              <div
                key={district.week}
                ref={(el) => { nodeRefs.current[district.week] = el; }}
                className="absolute"
                style={{
                  left: district.x,
                  top: district.y,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {district.isBoss ? (
                  <BossNode
                    name={district.name}
                    sub={district.sub}
                    state={state}
                    onTap={() => enterDistrict(district.week, state)}
                  />
                ) : (
                  <DistrictNode
                    week={district.week}
                    name={district.name}
                    sub={district.sub}
                    state={state as "complete" | "current" | "accessible" | "locked"}
                    onTap={() => enterDistrict(district.week, state)}
                  />
                )}
              </div>
            );
          })}

          {/* Start marker below Week 1 */}
          <div
            className="absolute"
            style={{ left: 192, top: SVG_H - 60, transform: "translate(-50%, -50%)" }}
          >
            <div
              className="px-4 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-[0.2em]"
              style={{
                color: "rgba(94,234,212,0.5)",
                border: "1px solid rgba(94,234,212,0.15)",
                background: "rgba(2,26,24,0.7)",
              }}
            >
              ← ENTRY POINT
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes nexusPulse {
          0%, 100% { box-shadow: 0 0 18px rgba(94,234,212,0.5), 0 0 36px rgba(94,234,212,0.2); }
          50%       { box-shadow: 0 0 30px rgba(94,234,212,0.85), 0 0 60px rgba(94,234,212,0.35); }
        }
        @keyframes bossPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.4), 0 0 50px rgba(251,191,36,0.15); }
          50%       { box-shadow: 0 0 36px rgba(251,191,36,0.75), 0 0 80px rgba(251,191,36,0.3); }
        }
        @keyframes bossLockedPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(251,191,36,0.12); }
          50%       { box-shadow: 0 0 22px rgba(251,191,36,0.22); }
        }
        @keyframes nodeIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </main>
  );
}

// ─── District node ───────────────────────────────────────────────────────────

function DistrictNode({
  week,
  name,
  sub,
  state,
  onTap,
}: {
  week: number;
  name: string;
  sub: string;
  state: "complete" | "current" | "accessible" | "locked";
  onTap: () => void;
}) {
  const configs = {
    complete: {
      ring: "rgba(94,234,212,0.8)",
      bg: "rgba(6,46,39,0.92)",
      textPrimary: "rgba(167,243,208,1)",
      textSub: "rgba(94,234,212,0.7)",
      shadow: "0 0 16px rgba(94,234,212,0.4), 0 4px 16px rgba(0,0,0,0.5)",
      badge: "COMPLETE",
      badgeBg: "rgba(20,184,166,0.25)",
      badgeColor: "rgba(94,234,212,1)",
      animation: "",
    },
    current: {
      ring: "rgba(94,234,212,1)",
      bg: "rgba(6,78,59,0.95)",
      textPrimary: "white",
      textSub: "rgba(167,243,208,0.9)",
      shadow: "0 0 0 rgba(94,234,212,0)",
      badge: "ENTER",
      badgeBg: "rgba(20,184,166,0.4)",
      badgeColor: "white",
      animation: "nexusPulse 2s ease-in-out infinite",
    },
    accessible: {
      ring: "rgba(94,234,212,0.25)",
      bg: "rgba(6,30,26,0.8)",
      textPrimary: "rgba(94,234,212,0.65)",
      textSub: "rgba(94,234,212,0.4)",
      shadow: "0 4px 12px rgba(0,0,0,0.4)",
      badge: "REVIEW",
      badgeBg: "rgba(15,118,110,0.15)",
      badgeColor: "rgba(94,234,212,0.5)",
      animation: "",
    },
    locked: {
      ring: "rgba(80,90,110,0.3)",
      bg: "rgba(10,12,20,0.75)",
      textPrimary: "rgba(120,130,150,0.5)",
      textSub: "rgba(100,110,130,0.4)",
      shadow: "0 4px 8px rgba(0,0,0,0.3)",
      badge: "LOCKED",
      badgeBg: "rgba(40,45,60,0.4)",
      badgeColor: "rgba(100,110,130,0.5)",
      animation: "",
    },
  };

  const c = configs[state];
  const isLocked = state === "locked";

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={isLocked}
      className="group flex flex-col items-center gap-1.5 transition-transform duration-200 active:scale-95"
      style={{ cursor: isLocked ? "default" : "pointer" }}
    >
      {/* Week number chip */}
      <div
        className="text-[8px] font-mono font-bold tracking-[0.2em] px-2 py-0.5 rounded-full"
        style={{
          color: c.textSub,
          background: c.badgeBg,
          border: `1px solid ${c.ring}`,
        }}
      >
        W{week}
      </div>

      {/* Main node circle */}
      <div
        className="relative flex h-[68px] w-[68px] items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105"
        style={{
          background: c.bg,
          border: `2.5px solid ${c.ring}`,
          boxShadow: c.shadow,
          animation: c.animation,
        }}
      >
        {/* Scanlines overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(94,234,212,1) 0px, rgba(94,234,212,1) 1px, transparent 1px, transparent 4px)",
          }}
        />

        {isLocked ? (
          <Lock className="h-6 w-6" style={{ color: c.textPrimary }} />
        ) : state === "complete" ? (
          <CheckCircle className="h-7 w-7" style={{ color: c.textPrimary }} />
        ) : (
          <ChevronRight className="h-8 w-8" style={{ color: c.textPrimary }} />
        )}
      </div>

      {/* Label */}
      <div className="text-center max-w-[110px]">
        <div
          className="text-[11px] font-extrabold leading-tight"
          style={{ color: c.textPrimary }}
        >
          {name}
        </div>
        <div
          className="text-[9px] font-medium leading-snug mt-0.5"
          style={{ color: c.textSub }}
        >
          {sub}
        </div>
      </div>

      {/* State badge */}
      <div
        className="text-[8px] font-mono font-bold tracking-[0.18em] px-2.5 py-0.5 rounded-full"
        style={{
          color: c.badgeColor,
          background: c.badgeBg,
          border: `1px solid ${c.ring}`,
        }}
      >
        {c.badge}
      </div>
    </button>
  );
}

// ─── Boss node (Week 12 — Legend Tower) ──────────────────────────────────────

function BossNode({
  name,
  sub,
  state,
  onTap,
}: {
  name: string;
  sub: string;
  state: NodeState;
  onTap: () => void;
}) {
  const isUnlocked = state === "boss_unlocked";
  const isComplete = state === "complete";

  const colors = isUnlocked || isComplete
    ? {
        ring: "rgba(251,191,36,1)",
        bg: "rgba(69,26,3,0.95)",
        textPrimary: "rgba(254,240,138,1)",
        textSub: "rgba(253,224,71,0.8)",
        animation: "bossPulse 2s ease-in-out infinite",
      }
    : {
        ring: "rgba(251,191,36,0.3)",
        bg: "rgba(20,12,2,0.85)",
        textPrimary: "rgba(254,240,138,0.4)",
        textSub: "rgba(253,224,71,0.3)",
        animation: "bossLockedPulse 3s ease-in-out infinite",
      };

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={!isUnlocked && !isComplete}
      className="group flex flex-col items-center gap-2 transition-transform duration-200 active:scale-95"
      style={{ cursor: isUnlocked || isComplete ? "pointer" : "default" }}
    >
      {/* BOSS label above */}
      <div
        className="text-[9px] font-mono font-black tracking-[0.25em] px-3 py-1 rounded-full"
        style={{
          color: colors.textPrimary,
          background: "rgba(120,53,15,0.4)",
          border: `1.5px solid ${colors.ring}`,
        }}
      >
        {isUnlocked || isComplete ? "⚡ BOSS" : "🔒 BOSS"}
      </div>

      {/* Main boss node — larger than regular nodes */}
      <div
        className="relative flex h-[88px] w-[88px] items-center justify-center rounded-3xl transition-transform duration-200 group-hover:scale-105"
        style={{
          background: colors.bg,
          border: `3px solid ${colors.ring}`,
          animation: colors.animation,
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: isUnlocked || isComplete
              ? "radial-gradient(circle at 35% 30%, rgba(251,191,36,0.15) 0%, transparent 65%)"
              : "none",
          }}
        />
        <span
          className="text-3xl"
          style={{
            filter:
              isUnlocked || isComplete
                ? "drop-shadow(0 0 10px rgba(251,191,36,0.8))"
                : "grayscale(0.8) opacity(0.4)",
          }}
        >
          ♛
        </span>
      </div>

      {/* Label */}
      <div className="text-center max-w-[130px]">
        <div
          className="text-[13px] font-black leading-tight tracking-wide"
          style={{ color: colors.textPrimary }}
        >
          {name}
        </div>
        <div
          className="text-[10px] font-medium leading-snug mt-0.5"
          style={{ color: colors.textSub }}
        >
          {sub}
        </div>
      </div>
    </button>
  );
}

type NodeState = "complete" | "current" | "accessible" | "locked" | "boss_locked" | "boss_unlocked";
