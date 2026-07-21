"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { readProgress, type StudentProgress } from "@/data/progress";
import { computeFogProgress } from "@/lib/fog-progress";
import FogOfForgetfulness from "@/components/world/FogOfForgetfulness";
import {
  getRecommendedAssignedWeek,
  getWeekProgress,
  isWeekComplete,
  readProgramStore,
} from "@/lib/program-progress";
import { readBestChain } from "@/lib/best-chain";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import StudentAvatar from "@/components/avatar/StudentAvatar";
import { supabase } from "@/lib/supabase";
import { fetchGlobalXp } from "@/lib/economy";
import { setLastRealm } from "@/lib/last-realm";
import { buildRealmLevelHref, isLevelUnlocked, LEVEL_CATALOG } from "@/lib/level-catalog";
import { enterReviewMode, exitReviewMode } from "@/lib/review-mode";
import RealmLevelSelector from "./RealmLevelSelector";
import RealmTopNavigation from "./RealmTopNavigation";
import RealmSideNavigation from "./RealmSideNavigation";
import type {
  CanonicalRealmDashboardConfig,
  RealmDashboardDistrict,
  RealmDashboardLevelOption,
  RealmDashboardShellProps,
  RealmDistrictState,
} from "./types";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";

function useWorldCanvas(colors: readonly string[], ringColor: string) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
        ctx.strokeStyle = ringColor;
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
  }, [colors, ringColor]);

  return ref;
}

function PlayerCharacter({ config }: { config: CanonicalRealmDashboardConfig }) {
  return (
    <StudentAvatar
      height={config.avatar.height}
      glowColor={config.avatar.glowColor}
      floatAnimation={config.avatar.floatAnimation}
    />
  );
}

function RealmDistrictLabel({
  district,
  state,
  active,
  onClick,
  config,
}: {
  district: RealmDashboardDistrict;
  state: RealmDistrictState;
  active: boolean;
  onClick: () => void;
  config: CanonicalRealmDashboardConfig;
}) {
  const locked = state === "locked";
  const complete = state === "complete" || state === "completed";
  const accent = locked ? config.theme.mutedAccent : district.color;

  return (
    <button
      type="button"
      onClick={locked ? undefined : onClick}
      disabled={locked}
      style={{
        width: 380,
        maxWidth: "29vw",
        textAlign: "left",
        cursor: locked ? "default" : "pointer",
        opacity: locked ? 0.56 : 1,
        padding: "14px 16px 12px",
        borderRadius: 18,
        border: `1.5px solid ${active ? accent : config.theme.realmChipBorder}`,
        background: active
          ? config.theme.districtActiveBackground
          : config.theme.districtBackground,
        boxShadow: active
          ? `0 0 0 3px ${district.color}24, 0 0 28px ${district.color}44, 0 12px 28px rgba(0,0,0,0.46)`
          : "0 10px 22px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        transition: "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: locked ? config.theme.mutedAccent : district.color,
            boxShadow: locked ? "none" : `0 0 14px ${district.color}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: config.theme.text,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.22em",
            fontFamily: "ui-monospace, monospace",
            textShadow: locked ? "none" : `0 0 16px ${district.color}66, 0 2px 10px rgba(0,0,0,0.9)`,
            lineHeight: 1.05,
          }}
        >
          {district.name}
        </span>
        {locked ? <Lock size={18} color={config.theme.mutedAccent} style={{ marginLeft: "auto" }} /> : null}
      </div>

      <div
        style={{
          color: accent,
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.22em",
          fontFamily: "ui-monospace, monospace",
          marginTop: 8,
          textShadow: locked ? "none" : `0 0 12px ${district.color}55`,
        }}
      >
        {district.sub} {complete ? config.labels.districtComplete : locked ? config.labels.districtLocked : config.labels.districtOpen}
      </div>

      <div
        style={{
          color: config.theme.mutedAccent,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          fontFamily: "ui-monospace, monospace",
          marginTop: 8,
          textTransform: "uppercase",
        }}
      >
        {district.tagline}
      </div>
    </button>
  );
}

export default function RealmDashboardShell({
  config,
  level,
  progress: restoredProgress,
  avatar,
}: RealmDashboardShellProps) {
  const router = useRouter();
  const previewMode = isDemoPreviewMode();
  useEffect(() => {
    setLastRealm(config.slug);
  }, [config.slug]);
  const resolvedYear = level;
  const world = useMemo(() => config.worldForLevel(resolvedYear), [config, resolvedYear]);
  const [progress] = useState<StudentProgress | null>(() => {
    if (restoredProgress !== undefined) return restoredProgress;
    return config.storageRealmId === "number" || config.storageRealmId === "measurement"
      ? readProgress(config.storageRealmId)
      : null;
  });
  const [store] = useState(() => readProgramStore());
  const [launching, setLaunching] = useState(false);
  const [bestChain] = useState(() => readBestChain(config.storageRealmId, resolvedYear));
  const [classBestChain, setClassBestChain] = useState<number | null>(null);
  const [globalXpBalance, setGlobalXpBalance] = useState<number | null>(null);
  const canvasRef = useWorldCanvas(config.theme.particleColors, config.theme.accent);
  const fogProgress = useMemo(() => computeFogProgress(progress?.year, progress?.unlockedLegends), [progress?.year, progress?.unlockedLegends]);

  const totalWeeks = config.totalWeeks;
  const demoJourney = previewMode && config.demo ? config.demo.readJourney(resolvedYear) : null;
  const currentWeek = demoJourney?.currentWeek ?? getRecommendedAssignedWeek(
    store,
    resolvedYear,
    progress?.assignedWeek,
    progress?.requiredWeeks,
    config.storageRealmId,
  );
  const currentLesson = demoJourney?.currentLesson ?? 1;
  const currentZone =
    world.zones.find((zone) => currentWeek >= zone.weekStart && currentWeek <= zone.weekEnd) ?? world.zones[0];
  const completedByWeek = useMemo(() => {
    const result: Record<number, boolean> = {};
    for (let week = 1; week <= totalWeeks; week += 1) {
      result[week] = isWeekComplete(getWeekProgress(store, resolvedYear, week, config.storageRealmId));
    }
    return result;
  }, [config.storageRealmId, resolvedYear, store, totalWeeks]);

  const highestDone = useMemo(
    () => Math.max(0, ...Object.entries(completedByWeek).filter(([, done]) => done).map(([week]) => Number(week))),
    [completedByWeek]
  );

  const demoRealmXP = useMemo(() => {
    let xp = 0;
    for (let week = 1; week <= totalWeeks; week += 1) {
      const wp = getWeekProgress(store, resolvedYear, week, config.storageRealmId);
      xp += wp.lessonsCompleted.filter(Boolean).length * 40;
      if (wp.quizScore !== undefined) xp += Math.round((wp.quizScore / 100) * 60);
    }
    return xp;
  }, [config.storageRealmId, resolvedYear, store, totalWeeks]);

  useEffect(() => {
    const studentId = getActiveStudentProfile()?.studentId;
    if (!studentId || isDemoPreviewMode()) return;
    let cancelled = false;
    void fetchGlobalXp(studentId).then(({ balance }) => {
      if (!cancelled) setGlobalXpBalance(balance);
    }).catch((error) => console.warn(`[${config.displayName}] Could not load global XP`, error));
    return () => { cancelled = true; };
  }, [config.displayName]);

  const districts = config.districtsForLevel(resolvedYear);
  const isDistrictMode = config.districtModeLevels.includes(resolvedYear);
  // The guide companion card overlaps the Tower of Knowledge fog badge on the
  // early levels, so hide it for Ground -> Level 2 (Prep / Year 1 / Year 2).
  const hideGuideCompanion =
    resolvedYear === "Prep" || resolvedYear === "Year 1" || resolvedYear === "Year 2";
  const currentDistrict =
    districts.find((district) => currentWeek >= district.weekStart && currentWeek <= district.weekEnd) ??
    districts[0];
  const activeDistrictId = isDistrictMode ? currentDistrict.id : null;
  const getDistrictState = (district: RealmDashboardDistrict): RealmDistrictState => {
    const allWeeksDone = Array.from({ length: district.weekEnd - district.weekStart + 1 }, (_, index) => district.weekStart + index).every(
      (week) => completedByWeek[week]
    );
    if (allWeeksDone) return "complete";
    if (currentWeek >= district.weekStart && currentWeek <= district.weekEnd) return "current";
    if (previewMode && config.demo?.unlockAllDistricts) return "open";
    if (currentWeek > district.weekEnd) return "open";
    return "locked";
  };

  const visibleLevelCatalog = typeof config.maxLevelIndex === "number"
    ? LEVEL_CATALOG.slice(0, config.maxLevelIndex + 1)
    : LEVEL_CATALOG;
  const currentYear = progress?.year;
  const levelOptions: RealmDashboardLevelOption[] = visibleLevelCatalog.map((catalogLevel) => {
    const id = catalogLevel.id as RealmLevelId;
    const unlocked = isLevelUnlocked(id, progress, {
      forceOpen: previewMode,
      realmId: config.realmId,
    });
    const isCurrent = Boolean(currentYear && id === currentYear);
    const isReviewing = !previewMode && Boolean(currentYear) && id === resolvedYear && id !== currentYear;
    return {
      id,
      label: catalogLevel.label,
      state: !unlocked ? "locked" : isReviewing ? "reviewing" : isCurrent ? "current" : "available",
    };
  });

  function selectLevel(targetYear: RealmLevelId) {
    if (targetYear === resolvedYear) return;
    if (config.internalPreview) {
      const { review } = buildRealmLevelHref(config.realmId, targetYear, currentYear, previewMode);
      if (review) enterReviewMode(config.realmId, targetYear);
      else exitReviewMode();
      window.location.assign(config.internalPreview.buildLevelHref(targetYear));
      return;
    }
    if (previewMode && config.demo) {
      window.location.assign(config.demo.buildLevelHref(targetYear));
      return;
    }
    const { href, review } = buildRealmLevelHref(config.realmId, targetYear, currentYear, previewMode);
    if (review) enterReviewMode(config.realmId, targetYear);
    else exitReviewMode();
    window.location.assign(href);
  }

  useEffect(() => {
    if (isDemoPreviewMode()) {
      return;
    }

    const profile = getActiveStudentProfile();
    const classId = profile?.classId?.trim();
    if (!classId) {
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
            .eq("realm_id", config.storageRealmId);

          if (filterWorkingLevel) {
            query = query.eq("working_level", resolvedYear);
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
          console.warn(`[${config.displayName}] Failed to load class best chain:`, error);
          setClassBestChain(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config.displayName, config.storageRealmId, resolvedYear]);

  function goToFirstIncompleteWeek(weekStart = 1, weekEnd = totalWeeks) {
    if (previewMode && config.demo) {
      const continuingCurrentJourney = currentWeek >= weekStart && currentWeek <= weekEnd;
      const targetWeek = continuingCurrentJourney ? currentWeek : weekStart;
      const targetLesson = continuingCurrentJourney ? currentLesson : 1;
      router.push(config.demo.buildLessonHref(resolvedYear, targetWeek, targetLesson));
      return;
    }
    for (let week = weekStart; week <= weekEnd; week += 1) {
      if (!completedByWeek[week]) {
        router.push(`/program?year=${encodeURIComponent(resolvedYear)}&week=${week}&legacy=1&realm_id=${config.storageRealmId}`);
        return;
      }
    }
    router.push(`/program?year=${encodeURIComponent(resolvedYear)}&week=${Math.max(weekStart, Math.min(currentWeek, weekEnd))}&legacy=1&realm_id=${config.storageRealmId}`);
  }

  function openDistrict(district: RealmDashboardDistrict) {
    if (getDistrictState(district) === "locked") return;
    goToFirstIncompleteWeek(district.weekStart, district.weekEnd);
  }

  function launchGuidedAdventure() {
    if (launching) return;
    setLaunching(true);
    window.setTimeout(() => {
      if (isDistrictMode) {
        openDistrict(currentDistrict);
        return;
      }
      goToFirstIncompleteWeek();
    }, 900);
  }

  const hudBtn: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    padding: "12px 10px 10px",
    borderRadius: 18,
    cursor: "pointer",
    background: config.theme.hudBackground,
    border: config.theme.hudBorder,
    backdropFilter: "blur(14px)",
    width: 72,
    boxShadow: config.theme.hudShadow,
    transition: "transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: config.theme.pageBackground,
        "--realm-pulse-rgb": config.theme.pulseRgb,
        "--realm-accent-rgb": config.theme.accentRgb,
        "--realm-secondary-rgb": config.theme.secondaryRgb,
      } as React.CSSProperties}
    >
      <FogOfForgetfulness
        progress={fogProgress}
        accent={config.theme.accent}
        glow={config.theme.focusGlow}
        badgeClassName={isDistrictMode ? "bottom-6 left-4" : undefined}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={world.bgImage}
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
          filter: "brightness(1.05) saturate(1.1)",
        }}
      />

      <div style={{ position: "absolute", inset: 0, background: config.theme.atmosphericOverlay }} />
      <div style={{ position: "absolute", inset: 0, background: config.theme.atmosphericGlow }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: config.theme.sceneFocusOverlay,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          width: 128,
          height: "56%",
          background: config.theme.transitionGlow,
          filter: "blur(18px)",
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
        {!isDistrictMode && !hideGuideCompanion ? (
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
              background: config.theme.guidePanelBackground,
              border: "1.5px solid rgba(var(--realm-accent-rgb),0.45)",
              boxShadow: "0 0 24px rgba(var(--realm-accent-rgb),0.28), 0 10px 28px rgba(0,0,0,0.55)",
              backdropFilter: "blur(10px)",
              maxWidth: 260,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: config.theme.guideIconBackground,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.3)",
              }}
            >
              {config.labels.guideIcon}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ color: config.theme.accent, fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", fontFamily: "ui-monospace,monospace" }}>
                {config.labels.guideName}
              </span>
              <span style={{ color: config.theme.text, fontSize: 12, fontWeight: 600, lineHeight: 1.25 }}>
                {config.labels.guideWelcome}
              </span>
            </div>
          </div>
        ) : null}

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
          {avatar ?? <PlayerCharacter config={config} />}
        </div>
      </div>

      <RealmTopNavigation
        realmName={config.displayName}
        realmMark={config.realmMark}
        accent={config.theme.accent}
        text={config.theme.text}
        navBackground={config.theme.navBackground}
        navBorder={config.theme.navBorder}
        realmChipBackground={config.theme.realmChipBackground}
        realmChipBorder={config.theme.realmChipBorder}
        globalXp={previewMode ? demoRealmXP : globalXpBalance}
        progressLabel={`${highestDone}/${totalWeeks} weeks`}
        onBack={() => router.push(`/realms?level=${encodeURIComponent(resolvedYear)}`)}
        onProfile={() => router.push("/profile")}
        levelSelector={
          <RealmLevelSelector
            levels={levelOptions}
            selectedLevel={resolvedYear}
            accent={config.theme.secondaryAccent}
            onSelect={selectLevel}
          />
        }
      />

      {/* ── Right HUD buttons ── */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <RealmSideNavigation
          buttonStyle={hudBtn}
          palette={{
            text: config.theme.accent,
            iconBackground: config.theme.hudIconBackground,
            iconBorder: config.theme.hudIconBorder,
            iconShadow: config.theme.hudIconShadow,
            textShadow: config.theme.hudTextShadow,
          }}
        />
        <div style={{ ...hudBtn, cursor: "default", gap: 4 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(var(--realm-accent-rgb),0.5)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15 }}>
            MY BEST
          </span>
          <span style={{ fontSize: 18, fontWeight: 900, color: config.theme.accent, lineHeight: 1 }}>{bestChain}</span>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(var(--realm-secondary-rgb),0.65)", fontFamily: "ui-monospace,monospace", textAlign: "center", lineHeight: 1.15, marginTop: 2 }}>
            CLASS BEST
          </span>
          <span style={{ fontSize: 14, fontWeight: 900, color: config.theme.secondaryAccent, lineHeight: 1 }}>{classBestChain ?? "—"}</span>
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
        {isDistrictMode ? (
          <>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "14%",
                transform: "translateX(-50%)",
                textAlign: "center",
                opacity: launching ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            >
              <div
                style={{
                  color: "#fff7ed",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: "0.28em",
                  fontFamily: "ui-monospace, monospace",
                  textShadow: "0 0 24px rgba(var(--realm-accent-rgb),0.58), 0 3px 14px rgba(0,0,0,0.85)",
                }}
              >
                {config.displayName.toUpperCase()}
              </div>
              <div
                style={{
                  color: config.theme.accent,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.28em",
                  fontFamily: "ui-monospace, monospace",
                  marginTop: 8,
                  textShadow: "0 0 14px rgba(var(--realm-accent-rgb),0.46)",
                }}
              >
                {world.levelLabel} · {config.districtTagline}
              </div>
            </div>

            {districts.map((district) => (
              <div
                key={district.id}
                style={{
                  position: "absolute",
                  left: district.left,
                  top: district.top,
                  zIndex: 2,
                  pointerEvents: "auto",
                  opacity: launching ? 0 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                <RealmDistrictLabel
                  district={district}
                  state={getDistrictState(district)}
                  active={activeDistrictId === district.id}
                  onClick={() => openDistrict(district)}
                  config={config}
                />
              </div>
            ))}

            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "7.5%",
                transform: "translateX(-50%)",
                color: config.theme.pathText,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.24em",
                fontFamily: "ui-monospace, monospace",
                textShadow: `0 0 14px ${currentZone.color}, 0 2px 8px rgba(0,0,0,0.9)`,
                opacity: launching ? 0 : 1,
                transition: "opacity 0.3s",
                textAlign: "center",
              }}
            >
              {config.labels.currentPath} · WEEK {Math.max(1, currentWeek)} · {currentZone.name}
            </div>
          </>
        ) : (
          <>
            {/* Main adventure button — warm gold, round, magical */}
            <button
              onClick={launchGuidedAdventure}
              disabled={launching}
              style={{
                position: "relative",
                pointerEvents: "auto",
                cursor: launching ? "default" : "pointer",
                padding: "22px 60px",
                borderRadius: 999,
                border: "2px solid rgba(var(--realm-pulse-rgb),0.65)",
                background: config.theme.actionBackground,
                color: config.theme.actionText,
                fontSize: 20,
                fontWeight: 900,
                letterSpacing: "0.2em",
                fontFamily: "ui-monospace, monospace",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                boxShadow: [
                  "0 0 0 4px rgba(var(--realm-pulse-rgb),0.18)",
                  "0 0 40px rgba(var(--realm-pulse-rgb),0.42)",
                  "0 0 90px rgba(var(--realm-secondary-rgb),0.18)",
                  "0 14px 32px rgba(0,0,0,0.55)",
                  "inset 0 2px 0 rgba(var(--realm-pulse-rgb),0.3)",
                  "inset 0 -4px 0 rgba(0,0,0,0.3)",
                ].join(", "),
                transform: launching ? "scale(1.08)" : "scale(1)",
                transition: "transform 0.25s ease",
                animation: "realm-guided-pulse 2.4s ease-in-out infinite",
                whiteSpace: "nowrap",
              }}
            >
              ✦ {highestDone === 0 ? config.labels.start : config.labels.continue}
            </button>

            <div
              style={{
                position: "relative",
                color: "rgba(var(--realm-accent-rgb),0.85)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                fontFamily: "ui-monospace, monospace",
                marginTop: 14,
                opacity: launching ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            >
              {config.guidedTagline}
            </div>

            <div
              style={{
                position: "relative",
                color: config.theme.pathText,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.28em",
                fontFamily: "ui-monospace, monospace",
                textShadow: `0 0 14px ${currentZone.color}, 0 2px 8px rgba(0,0,0,0.9)`,
                marginTop: 12,
                opacity: launching ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            >
              WEEK {Math.max(1, currentWeek)} · {currentZone.name}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          pointerEvents: "none",
          background: config.theme.launchOverlay,
          opacity: launching ? 1 : 0,
          transition: "opacity 0.6s ease-in 0.25s",
        }}
      />

      <style>{`
        @keyframes realm-character-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes realm-guided-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 4px rgba(var(--realm-pulse-rgb),0.18),
              0 0 38px rgba(var(--realm-pulse-rgb),0.42),
              0 0 90px rgba(var(--realm-secondary-rgb),0.18),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(var(--realm-pulse-rgb),0.3),
              inset 0 -4px 0 rgba(0,0,0,0.3);
          }
          50% {
            box-shadow:
              0 0 0 6px rgba(var(--realm-pulse-rgb),0.28),
              0 0 58px rgba(var(--realm-pulse-rgb),0.6),
              0 0 120px rgba(var(--realm-secondary-rgb),0.28),
              0 14px 32px rgba(0,0,0,0.55),
              inset 0 2px 0 rgba(var(--realm-pulse-rgb),0.38),
              inset 0 -4px 0 rgba(0,0,0,0.3);
          }
        }
      `}</style>
    </div>
  );
}
