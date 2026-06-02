"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Zap } from "lucide-react";
import { readProgress } from "@/data/progress";
import {
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
  readProgramStore,
} from "@/lib/program-progress";
import { readBestChain } from "@/lib/best-chain";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";

const YEAR = "Prep";
const REALM_ID = "measurement";
const BG_IMAGE = "/images/measurelands-home-bg.jpg";
const ACCENT = "#fbbf24";
const ACCENT_SOFT = "#fde68a";
const TEAL = "#5eead4";

function useWorldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["#67e8f9", "#fde68a", "#c4b5fd", "#86efac", "#f9a8d4"];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 70 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 2.4,
      vy: -(0.14 + Math.random() * 0.42) / 1080,
      vx: ((Math.random() - 0.5) * 0.1) / 1920,
      color: colors[i % colors.length],
      opacity: 0.18 + Math.random() * 0.46,
    }));

    let pulse = 0;
    let fid: number;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      const tx = W * 0.5;
      const ty = H * 0.31;
      pulse += 0.42;
      for (let i = 0; i < 4; i += 1) {
        const phase = (pulse + i * 24) % 108;
        const radius = phase * 1.55;
        const alpha = Math.max(0, 0.28 - phase / 380);
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(tx, ty, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      fid = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(fid);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return ref;
}

function PlayerCharacter() {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        animation: "ml-char-float 4.6s ease-in-out infinite",
        filter: "drop-shadow(0 0 14px rgba(253,230,138,0.24)) drop-shadow(0 8px 18px rgba(0,0,0,0.72))",
      }}
    >
      <svg width="96" height="188" viewBox="0 0 96 188" fill="none">
        <rect x="24" y="165" width="18" height="10" rx="3" fill="#09090b" />
        <rect x="54" y="165" width="18" height="10" rx="3" fill="#09090b" />
        <rect x="27" y="122" width="14" height="46" rx="4" fill="#28170c" />
        <rect x="55" y="122" width="14" height="46" rx="4" fill="#28170c" />
        <rect x="18" y="72" width="60" height="58" rx="9" fill="#4c1d95" />
        <rect x="16" y="72" width="64" height="8" rx="5" fill="#fde68a" opacity="0.75" />
        <rect x="5" y="78" width="14" height="46" rx="5" fill="#4c1d95" />
        <rect x="77" y="78" width="14" height="46" rx="5" fill="#4c1d95" />
        <rect x="5" y="78" width="14" height="5" rx="3" fill="#67e8f9" opacity="0.55" />
        <rect x="77" y="78" width="14" height="5" rx="3" fill="#67e8f9" opacity="0.55" />
        <rect x="35" y="58" width="22" height="15" rx="5" fill="#b87652" />
        <rect x="24" y="24" width="44" height="38" rx="10" fill="#b87652" />
        <path d="M19 28c7-11 20-17 33-14 8 2 14 7 19 14v8H19z" fill="#312e81" />
        <path d="M18 31l14-18h28l14 18-8 4H26z" fill="#1e1b4b" />
      </svg>

      <div
        style={{
          position: "absolute",
          bottom: -12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 104,
          height: 24,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(103,232,249,0.36) 0%, transparent 70%)",
          filter: "blur(6px)",
        }}
      />
    </div>
  );
}

function LegendsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M16 3L23 21H9L16 3Z" fill="#fde68a" stroke="#fffbeb" strokeWidth="1.3" />
      <rect x="7" y="20" width="18" height="4" rx="2" fill="#7c3aed" stroke="#fffbeb" strokeWidth="1" />
    </svg>
  );
}

function WorldsIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="10.5" fill="#1f2937" stroke="#67e8f9" strokeWidth="1.5" />
      <path d="M5.5 16h21M16 5.5c3.7 3.9 3.7 17.1 0 21M16 5.5c-3.7 3.9-3.7 17.1 0 21" stroke="#fffbeb" strokeWidth="1" opacity="0.75" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M9 4h14M9 28h14" stroke="#fffbeb" strokeWidth="1.4" />
      <path d="M10 5h12l-5 10 5 12H10l5-12-5-10Z" fill="#fde68a" stroke="#fffbeb" strokeWidth="1.1" />
    </svg>
  );
}

export default function MeasurelandsMap() {
  const router = useRouter();
  const [progress] = useState(() => readProgress());
  const [store] = useState(() => readProgramStore());
  const [launching, setLaunching] = useState(false);
  const [bestChain] = useState(() => readBestChain("measurement", YEAR));
  const [classBestChain, setClassBestChain] = useState<number | null>(null);
  const canvasRef = useWorldCanvas();

  const currentWeek = getRecommendedAssignedWeek(store, YEAR, progress?.assignedWeek, progress?.requiredWeeks);
  const completedByWeek = useMemo(() => {
    const result: Record<number, boolean> = {};
    for (let week = 1; week <= 8; week += 1) {
      result[week] = isWeekComplete(getWeekProgress(store, YEAR, week));
    }
    return result;
  }, [store]);

  const highestDone = useMemo(
    () => Math.max(0, ...Object.entries(completedByWeek).filter(([, done]) => done).map(([week]) => Number(week))),
    [completedByWeek]
  );

  const totalXP = useMemo(() => {
    let xp = 0;
    for (let week = 1; week <= 8; week += 1) {
      const wp = getWeekProgress(store, YEAR, week);
      xp += wp.lessonsCompleted.filter(Boolean).length * 40;
      if (wp.quizScore !== undefined) xp += Math.round((wp.quizScore / 100) * 60);
    }
    return xp;
  }, [store]);

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
        const readMaxBestChain = async (filterWorkingLevel: boolean) => {
          let query = supabase
            .from("student_lesson_attempts")
            .select("summary")
            .eq("class_id", classId)
            .eq("realm_id", "measurement");

          if (filterWorkingLevel) {
            query = query.eq("working_level", YEAR);
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
        if (!cancelled) setClassBestChain(fallbackBest);
      } catch (error) {
        if (!cancelled) {
          console.warn("[MeasurelandsMap] Failed to load class best chain:", error);
          setClassBestChain(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function launchGuidedAdventure() {
    if (launching) return;
    setLaunching(true);
    window.setTimeout(() => {
      for (let week = 1; week <= 8; week += 1) {
        if (!completedByWeek[week]) {
          router.push(`/program?year=${encodeURIComponent(YEAR)}&week=${week}&legacy=1&realm_id=${REALM_ID}`);
          return;
        }
      }
      router.push(`/program?year=${encodeURIComponent(YEAR)}&week=${Math.max(1, currentWeek)}&legacy=1&realm_id=${REALM_ID}`);
    }, 900);
  }

  const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px",
    borderRadius: 999,
    background: "rgba(17,24,39,0.55)",
    border: "1px solid rgba(186,230,253,0.16)",
    ...extra,
  });

  const hudBtn: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "12px 10px 10px",
    borderRadius: 18,
    cursor: "pointer",
    background: "linear-gradient(180deg, rgba(10,18,30,0.92) 0%, rgba(5,10,18,0.95) 100%)",
    border: "1.5px solid rgba(186,230,253,0.24)",
    backdropFilter: "blur(14px)",
    width: 72,
    boxShadow: "0 0 18px rgba(103,232,249,0.14), 0 6px 22px rgba(0,0,0,0.64), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease",
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#050818" }}>
      <img
        src={BG_IMAGE}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 42%",
          transform: launching ? "scale(1.35)" : "scale(1)",
          transition: "transform 0.9s cubic-bezier(0.5, 0, 0.75, 0)",
        }}
      />

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,236,200,0.10) 0%, rgba(255,236,200,0) 35%, rgba(20,30,60,0.45) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 55% at 50% 40%, rgba(251,191,36,0.18) 0%, transparent 70%)" }} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          width: 140,
          height: "60%",
          background: "linear-gradient(180deg, rgba(253,230,138,0) 0%, rgba(253,230,138,0.22) 55%, rgba(251,191,36,0.45) 100%)",
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          opacity: launching ? 0 : 1,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      >
        {/* Meazurex mentor card */}
        <div
          style={{
            position: "absolute",
            left: "4%",
            bottom: "10%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px 10px 12px",
            borderRadius: 18,
            background: "linear-gradient(180deg, rgba(76,29,149,0.78) 0%, rgba(30,27,75,0.85) 100%)",
            border: "1.5px solid rgba(253,230,138,0.45)",
            boxShadow: "0 0 24px rgba(251,191,36,0.28), 0 10px 28px rgba(0,0,0,0.55)",
            backdropFilter: "blur(10px)",
            maxWidth: 260,
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              background: "radial-gradient(circle at 50% 35%, #fde68a 0%, #b45309 75%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.3)",
            }}
          >
            🧙
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ color: "#fde68a", fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>
              MEAZUREX
            </span>
            <span style={{ color: "#f5f3ff", fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>
              Welcome, young measurer! Your adventure begins.
            </span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "2%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 12,
            pointerEvents: "auto",
          }}
        >
          <PlayerCharacter />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "rgba(5,8,24,0.72)",
          borderBottom: "1px solid rgba(186,230,253,0.1)",
          backdropFilter: "blur(16px)",
        }}
      >
        <button
          onClick={() => router.push(`/realms?level=${encodeURIComponent(YEAR)}`)}
          style={{ display: "flex", alignItems: "center", gap: 6, ...chip(), cursor: "pointer", color: "rgba(226,232,240,0.92)", fontSize: 12, fontWeight: 700 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={chip()}>
          <span style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", fontFamily: "ui-monospace,monospace" }}>◈ MEASURELANDS</span>
        </div>
        <div style={chip({ background: "rgba(103,232,249,0.07)", border: "1px solid rgba(103,232,249,0.14)" })}>
          <span style={{ color: "#67e8f9", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>PREP</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...chip() }}>
          <Zap size={11} color="#fde68a" />
          <span style={{ color: "#fef3c7", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{totalXP} XP</span>
        </div>
        <div style={chip()}>
          <span style={{ color: "#e0f2fe", fontSize: 10, fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{highestDone}/8</span>
        </div>
        <button
          onClick={() => router.push("/profile")}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", background: "rgba(30,41,59,0.48)", border: "1px solid rgba(186,230,253,0.24)" }}
        >
          <User size={16} color="#e0f2fe" />
        </button>
      </div>

      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { key: "legends", label: "LEGENDS", route: "/legends", icon: <LegendsIcon /> },
          { key: "worlds", label: "WORLDS", route: "/levels", icon: <WorldsIcon /> },
          { key: "progress", label: "PROGRESS", route: "/realm-stats", icon: <ProgressIcon /> },
        ].map(({ key, label, route, icon }) => (
          <button key={key} onClick={() => router.push(route)} style={hudBtn}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 14,
                background: "radial-gradient(circle at 50% 35%, rgba(103,232,249,0.28) 0%, rgba(30,41,59,0.18) 55%, rgba(5,10,18,0) 100%)",
                border: "1px solid rgba(186,230,253,0.24)",
                boxShadow: "inset 0 0 14px rgba(103,232,249,0.18), 0 0 18px rgba(103,232,249,0.14)",
              }}
            >
              {icon}
            </div>
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#bae6fd", fontFamily: "ui-monospace,monospace", textShadow: "0 0 10px rgba(103,232,249,0.38)" }}>
              {label}
            </span>
          </button>
        ))}
        <div style={{ ...hudBtn, cursor: "default", gap: 4 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(186,230,253,0.52)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15 }}>
            MY BEST
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: "#67e8f9", lineHeight: 1 }}>{bestChain}</span>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(253,230,138,0.65)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15, marginTop: 2 }}>
            CLASS BEST
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: "#fde68a", lineHeight: 1 }}>{classBestChain ?? "—"}</span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(5,8,24,0.78) 0%, rgba(5,8,24,0.45) 50%, rgba(5,8,24,0) 100%)",
            pointerEvents: "none",
          }}
        />
        <button
          onClick={launchGuidedAdventure}
          disabled={launching}
          style={{
            position: "relative",
            pointerEvents: "auto",
            cursor: launching ? "default" : "pointer",
            padding: "22px 56px",
            borderRadius: 999,
            border: "2px solid rgba(251,191,36,0.82)",
            background: "linear-gradient(180deg, #fbbf24 0%, #d97706 55%, #b45309 100%)",
            color: "#ffffff",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "0.22em",
            fontFamily: "ui-monospace, monospace",
            textShadow: "0 2px 8px rgba(0,0,0,0.55)",
            boxShadow: [
              "0 0 0 4px rgba(251,191,36,0.16)",
              "0 0 38px rgba(251,191,36,0.54)",
              "0 0 90px rgba(217,119,6,0.34)",
              "0 14px 32px rgba(0,0,0,0.55)",
              "inset 0 2px 0 rgba(255,255,255,0.35)",
              "inset 0 -4px 0 rgba(0,0,0,0.25)",
            ].join(", "),
            transform: launching ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.25s ease",
            animation: "ml-guided-pulse 2.4s ease-in-out infinite",
            whiteSpace: "nowrap",
          }}
        >
          ▶ {highestDone === 0 ? "START ADVENTURE" : "CONTINUE ADVENTURE"}
        </button>

        <div
          style={{
            position: "relative",
            color: "rgba(253,230,138,0.85)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            fontFamily: "ui-monospace, monospace",
            marginTop: 14,
            opacity: launching ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          TAP TO STEP INTO MEASURELANDS
        </div>

        <div
          style={{
            position: "relative",
            color: ACCENT_SOFT,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.28em",
            fontFamily: "ui-monospace, monospace",
            textShadow: `0 0 14px ${ACCENT}, 0 2px 8px rgba(0,0,0,0.9)`,
            marginTop: 14,
            opacity: launching ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        >
          WEEK {Math.max(1, currentWeek)} · LENGTH LANDS
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 60%, rgba(253,230,138,0.7) 0%, rgba(253,230,138,0.28) 25%, rgba(5,8,24,0.95) 70%)",
          opacity: launching ? 1 : 0,
          transition: "opacity 0.6s ease-in 0.25s",
        }}
      />

      <style>{`
        @keyframes ml-char-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes ml-guided-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 4px rgba(251,191,36,0.16),
              0 0 38px rgba(251,191,36,0.54),
              0 0 90px rgba(217,119,6,0.34),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(255,255,255,0.35),
              inset 0 -4px 0 rgba(0,0,0,0.25);
          }
          50% {
            box-shadow:
              0 0 0 6px rgba(253,230,138,0.24),
              0 0 58px rgba(253,230,138,0.74),
              0 0 120px rgba(217,119,6,0.46),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(255,255,255,0.42),
              inset 0 -4px 0 rgba(0,0,0,0.25);
          }
        }
      `}</style>
    </div>
  );
}
