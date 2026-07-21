"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ChevronRight, Map, Orbit, User, Zap } from "lucide-react";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";
import { loadStarpathPlacement } from "@/lib/starpath-placement-adapter";
import type { StarpathPlacement } from "@/lib/starpath-placement";
import { computeFogProgress } from "@/lib/fog-progress";
import FogOfForgetfulness from "@/components/world/FogOfForgetfulness";
import RealmDashboardNav from "@/components/world/RealmDashboardNav";
import StarpathLevelsDrawer from "@/components/realms/StarpathLevelsDrawer";
import StudentAvatar from "@/components/avatar/StudentAvatar";
import { fetchGlobalXp } from "@/lib/economy";
import { setLastRealm, setLastStarpathRoute } from "@/lib/last-realm";
import {
  getStarpathLevel,
  tryNormalizeStarpathLevel,
  type StarpathLevelId,
} from "@/lib/starpath-levels";
import {
  buildStarpathTowerReturnHref,
  buildStarpathWorldHref,
  STARPATH_REALM_ID,
} from "@/lib/starpath-routes";

type StarpathHomeTheme = {
  background: string;
  accent: string;
  accentSoft: string;
  glow: string;
};

const STARPATH_HOME_THEME: Record<StarpathLevelId, StarpathHomeTheme> = {
  ground: { background: "/images/starpath-home-bg-ground.png", accent: "#9be7ff", accentSoft: "#dbeafe", glow: "rgba(125,211,252,0.42)" },
  "level-1": { background: "/images/starpath-home-bg-y1.png", accent: "#8fe7ff", accentSoft: "#e0f2fe", glow: "rgba(103,232,249,0.42)" },
  "level-2": { background: "/images/starpath-home-bg-y2.png", accent: "#c4b5fd", accentSoft: "#ede9fe", glow: "rgba(196,181,253,0.44)" },
  "level-3": { background: "/images/starpath-home-bg-y3.png", accent: "#a5b4fc", accentSoft: "#e0e7ff", glow: "rgba(165,180,252,0.46)" },
  "level-4": { background: "/images/starpath-home-bg-y4.png", accent: "#67e8f9", accentSoft: "#cffafe", glow: "rgba(103,232,249,0.46)" },
  "level-5": { background: "/images/starpath-home-bg-y5.png", accent: "#c4b5fd", accentSoft: "#f5f3ff", glow: "rgba(196,181,253,0.48)" },
  "level-6": { background: "/images/starpath-home-bg-y6.png", accent: "#e9d5ff", accentSoft: "#faf5ff", glow: "rgba(216,180,254,0.48)" },
};

const STARPATH_DISTRICT_NAMES: Record<Extract<StarpathLevelId, "level-3" | "level-4" | "level-5" | "level-6">, readonly string[]> = {
  "level-3": ["Object Observatory", "Mapmaker's Reach", "Transformation Crossing", "Spatial Mission"],
  "level-4": ["Composite Citadel", "Grid Gardens", "Symmetry Spire", "Design Frontier"],
  "level-5": ["Prism Port", "Coordinate Crossing", "Transformation Station", "Spatial Design Lab"],
  "level-6": ["Cross-section Observatory", "Cartesian Quadrants", "Tessellation Array", "Orbital Investigation"],
};

const DISTRICT_ACCENTS = ["#8fe7ff", "#c4b5fd", "#fbcfe8", "#fde68a"] as const;

function StarpathWorldShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedLevel = tryNormalizeStarpathLevel(searchParams.get("level"));
  const placementLevelParam = searchParams.get("placement_level");
  const placementLevel = placementLevelParam ? tryNormalizeStarpathLevel(placementLevelParam) : null;
  const invalidRoute = !selectedLevel || searchParams.get("realm_id") !== STARPATH_REALM_ID ||
    (placementLevelParam !== null && !placementLevel);
  const [placement, setPlacement] = useState<StarpathPlacement | null>(null);
  const [focusedDistrict, setFocusedDistrict] = useState(0);
  const [adventureReady, setAdventureReady] = useState(false);
  const [globalXp, setGlobalXp] = useState<number | null>(null);

  useEffect(() => {
    if (invalidRoute || !selectedLevel) return;
    const canonicalHref = buildStarpathWorldHref({ selectedLevel, placementLevel });
    if (`${window.location.pathname}${window.location.search}` !== canonicalHref) {
      router.replace(canonicalHref);
    }
  }, [invalidRoute, placementLevel, router, selectedLevel]);

  // Record Starpath as the active journey so "Continue Learning" returns here,
  // not a stale different realm.
  useEffect(() => {
    if (invalidRoute || !selectedLevel) return;
    setLastRealm("starpath-realm");
    setLastStarpathRoute(buildStarpathWorldHref({ selectedLevel, placementLevel }));
  }, [invalidRoute, placementLevel, selectedLevel]);

  useEffect(() => {
    if (invalidRoute) return;
    let cancelled = false;
    const identity = getActiveStudentIdentity();
    const profile = getActiveStudentProfile();
    if (!identity.studentId) return;

    void loadStarpathPlacement({
      studentId: identity.studentId,
      classId: profile?.classId ?? identity.classId,
      schoolYear: profile?.yearLevel ?? null,
    }).then((result) => {
      if (cancelled || getActiveStudentIdentity().studentId !== identity.studentId) return;
      setPlacement(result.placement);
    });
    void fetchGlobalXp(identity.studentId).then((xp) => {
      if (!cancelled) setGlobalXp(typeof xp === "number" ? xp : null);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [invalidRoute]);

  const selectedDefinition = selectedLevel ? getStarpathLevel(selectedLevel) : null;
  const program = selectedLevel ? getStarpathProgram(selectedLevel) : null;
  const theme = selectedLevel ? STARPATH_HOME_THEME[selectedLevel] : STARPATH_HOME_THEME.ground;
  const currentWeek = Math.min(8, Math.max(1, placement?.currentWeek ?? 1));
  const guidedMode = (selectedDefinition?.levelNumber ?? 0) <= 2;
  const districts = useMemo(() => {
    if (!selectedLevel || !program || guidedMode) return [];
    const names = STARPATH_DISTRICT_NAMES[selectedLevel as keyof typeof STARPATH_DISTRICT_NAMES];
    return Array.from({ length: 4 }, (_, index) => {
      const weeks = program.weeks.slice(index * 2, index * 2 + 2);
      return {
        name: names[index],
        weekStart: index * 2 + 1,
        weekEnd: index * 2 + 2,
        concepts: weeks.map((week) => week.title).join(" · "),
        accent: DISTRICT_ACCENTS[index],
      };
    });
  }, [guidedMode, program, selectedLevel]);

  if (invalidRoute || !selectedLevel || !selectedDefinition || !program) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070a1b] px-5 text-white">
        <section className="max-w-xl text-center">
          <Orbit className="mx-auto mb-5 h-12 w-12 text-violet-200" />
          <h1 className="text-4xl font-black tracking-normal">Invalid Starpath route</h1>
          <p className="mt-4 text-lg leading-8 text-white/70">Starpath requires a valid level from Ground Level through Level 6.</p>
          <button type="button" onClick={() => router.push("/realms")} className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 font-bold hover:bg-white/15">
            <ArrowLeft className="h-4 w-4" /> Tower of Knowledge
          </button>
        </section>
      </main>
    );
  }

  const currentDistrict = Math.floor((currentWeek - 1) / 2);
  const activeDistrict = districts[focusedDistrict];
  const openingWeekIndex = guidedMode ? currentWeek - 1 : (activeDistrict?.weekStart ?? 1) - 1;
  const openingWeek = program.weeks[openingWeekIndex];
  const zoneName = guidedMode ? openingWeek.title : (districts[currentDistrict]?.name ?? openingWeek.title);
  const fog = computeFogProgress(null, []);

  const chip = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: "5px 12px",
    borderRadius: 999,
    background: "rgba(8,11,32,0.6)",
    border: "1px solid rgba(255,255,255,0.14)",
    ...extra,
  });
  const hudBtn: React.CSSProperties = {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "12px 10px 10px", borderRadius: 18, cursor: "pointer",
    background: "linear-gradient(180deg, rgba(16,22,52,0.92) 0%, rgba(8,11,32,0.95) 100%)",
    border: `1.5px solid ${theme.accent}44`, backdropFilter: "blur(14px)", width: 72,
    boxShadow: `0 0 18px ${theme.glow}, 0 6px 22px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
    transition: "transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease",
  };
  const mono = "ui-monospace,monospace";

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#070a1b" }}>
      <FogOfForgetfulness progress={fog} accent={theme.accent} glow={theme.glow} badgeClassName="bottom-6 left-4" />

      <Image aria-hidden="true" src={theme.background} alt="" fill priority sizes="100vw" className="object-cover object-center" />

      {/* Atmospheric overlays (Starpath violet/indigo) */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,8,28,0.6) 0%, rgba(5,8,28,0.1) 40%, rgba(5,8,28,0.86) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 68% 58% at 50% 38%, ${theme.glow} 0%, transparent 70%)`, opacity: 0.4, pointerEvents: "none" }} />
      <div style={{ position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)", width: 128, height: "56%", background: `linear-gradient(180deg, ${theme.accent}00 0%, ${theme.accent}22 55%, ${theme.accent}3a 100%)`, filter: "blur(18px)", pointerEvents: "none" }} />

      {/* Avatar layer */}
      <div style={{ position: "absolute", inset: 0, zIndex: 10, opacity: adventureReady ? 0.6 : 1, transition: "opacity 0.4s ease", pointerEvents: "none" }}>
        <div style={{ position: "absolute", bottom: "2%", left: "50%", transform: "translateX(-50%)", zIndex: 12, pointerEvents: "auto" }}>
          <StudentAvatar height={188} glowColor={theme.glow} floatAnimation="sp-char-float 4.6s ease-in-out infinite" />
        </div>
      </div>

      {/* Top nav bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(5,8,28,0.72)", borderBottom: `1px solid ${theme.accent}22`, backdropFilter: "blur(16px)" }}>
        <button onClick={() => router.push(buildStarpathTowerReturnHref(selectedLevel))} style={{ display: "flex", alignItems: "center", gap: 6, ...chip(), cursor: "pointer", color: "rgba(226,232,255,0.92)", fontSize: 12, fontWeight: 700 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={chip({ background: `${theme.accent}1f`, border: `1px solid ${theme.accent}44` })}>
          <span style={{ color: theme.accent, fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", fontFamily: mono }}>✦ STARPATH</span>
        </div>
        <StarpathLevelsDrawer selectedLevel={selectedLevel} accent={theme.accent} openDirection="right" />
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 5, ...chip() }}>
          <Zap size={11} color={theme.accent} />
          <span title="Global XP available in every realm" style={{ color: theme.accentSoft, fontSize: 10, fontWeight: 700, fontFamily: mono }}>{globalXp == null ? "—" : globalXp} XP</span>
        </div>
        <div style={chip()}>
          <span style={{ color: theme.accent, fontSize: 10, fontWeight: 700, fontFamily: mono }}>{currentWeek}/8 weeks</span>
        </div>
        <button onClick={() => router.push("/profile")} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", cursor: "pointer", background: "rgba(16,22,52,0.6)", border: `1px solid ${theme.accent}44` }}>
          <User size={16} color={theme.accent} />
        </button>
      </div>

      {/* Right HUD buttons */}
      <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <RealmDashboardNav
          buttonStyle={hudBtn}
          palette={{
            text: theme.accent,
            iconBackground: `radial-gradient(circle at 50% 35%, ${theme.accent}33 0%, rgba(30,27,75,0.2) 55%, rgba(5,8,28,0) 100%)`,
            iconBorder: `1px solid ${theme.accent}44`,
            iconShadow: `inset 0 0 14px ${theme.accent}22, 0 0 18px ${theme.glow}`,
            textShadow: `0 0 10px ${theme.glow}`,
          }}
        />
        <div style={{ ...hudBtn, cursor: "default", gap: 4 }}>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: `${theme.accent}99`, fontFamily: mono, textAlign: "center", lineHeight: 1.15 }}>MY BEST</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: theme.accent, lineHeight: 1 }}>{Math.max(0, currentWeek - 1)}</span>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(167,139,250,0.65)", fontFamily: mono, textAlign: "center", lineHeight: 1.15, marginTop: 2 }}>CLASS BEST</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: theme.accentSoft, lineHeight: 1 }}>—</span>
        </div>
      </div>

      {/* Centre content */}
      <div style={{ position: "absolute", inset: 0, zIndex: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(5,8,24,0.72) 0%, rgba(5,8,24,0.42) 50%, rgba(5,8,24,0) 100%)", pointerEvents: "none" }} />

        {guidedMode ? (
          <>
            <button
              onClick={() => setAdventureReady(true)}
              style={{
                position: "relative", pointerEvents: "auto", cursor: "pointer",
                padding: "22px 60px", borderRadius: 999,
                border: `2px solid ${theme.accent}a6`,
                background: `linear-gradient(135deg, #0b1030 0%, #1e1b4b 40%, ${theme.accent}55 78%, ${theme.accent} 100%)`,
                color: "#f8fbff", fontSize: 20, fontWeight: 900, letterSpacing: "0.2em", fontFamily: mono,
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                boxShadow: `0 0 0 4px ${theme.accent}2e, 0 0 40px ${theme.glow}, 0 14px 32px rgba(0,0,0,0.55), inset 0 2px 0 ${theme.accent}4d, inset 0 -4px 0 rgba(0,0,0,0.3)`,
                animation: "sp-guided-pulse 2.4s ease-in-out infinite", whiteSpace: "nowrap",
              }}
            >
              ✦ {currentWeek <= 1 ? "START ADVENTURE" : "CONTINUE ADVENTURE"}
            </button>
            <div style={{ position: "relative", color: `${theme.accentSoft}d9`, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", fontFamily: mono, marginTop: 14 }}>
              TAP TO CHART YOUR NEXT MISSION
            </div>
            <div style={{ position: "relative", color: "rgba(226,232,255,0.9)", fontSize: 12, fontWeight: 800, letterSpacing: "0.28em", fontFamily: mono, textShadow: `0 0 14px ${theme.glow}, 0 2px 8px rgba(0,0,0,0.9)`, marginTop: 12 }}>
              WEEK {currentWeek} · {zoneName.toUpperCase()}
            </div>
            {adventureReady ? (
              <div style={{ position: "relative", pointerEvents: "auto", marginTop: 16, borderRadius: 12, border: `1px solid ${theme.accent}44`, background: "rgba(8,11,32,0.82)", padding: "8px 16px", color: "#eef2ff", fontSize: 13, fontWeight: 700, backdropFilter: "blur(12px)" }}>
                Week {currentWeek} preview ready · {openingWeek.lessons[0].title}
              </div>
            ) : null}
          </>
        ) : (
          <div style={{ position: "relative", pointerEvents: "auto", width: "100%", maxWidth: 900 }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ color: "#fff7ed", fontSize: 24, fontWeight: 900, letterSpacing: "0.24em", fontFamily: mono, textShadow: `0 0 24px ${theme.glow}, 0 3px 14px rgba(0,0,0,0.85)` }}>STARPATH</div>
              <div style={{ color: theme.accent, fontSize: 11, fontWeight: 900, letterSpacing: "0.24em", fontFamily: mono, marginTop: 8 }}>{selectedDefinition.displayLabel.toUpperCase()} · DISTRICT MAP</div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {districts.map((district, index) => {
                const isCurrent = index === currentDistrict;
                const isFocused = index === focusedDistrict;
                return (
                  <button key={district.name} type="button" onClick={() => setFocusedDistrict(index)} aria-pressed={isFocused}
                    className="min-h-[100px] w-full rounded-lg px-4 py-3 text-left transition hover:-translate-y-0.5"
                    style={{ background: "rgba(8,11,32,0.78)", backdropFilter: "blur(12px)", border: `1px solid ${isFocused ? district.accent : "rgba(255,255,255,0.2)"}`, boxShadow: isFocused ? `0 0 30px ${district.accent}42, inset 0 0 22px ${district.accent}12` : "0 12px 28px rgba(2,6,23,0.28)" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: district.accent }}>Weeks {district.weekStart}–{district.weekEnd}{isCurrent ? " · Current" : ""}</span>
                        <h2 className="mt-1 text-lg font-black uppercase tracking-[0.12em] text-white">{district.name}</h2>
                      </div>
                      <Map className="mt-1 h-5 w-5 shrink-0" style={{ color: district.accent }} />
                    </div>
                    <p className="mt-2 text-xs font-bold leading-5 text-white/60">{district.concepts}</p>
                  </button>
                );
              })}
            </div>
            {activeDistrict ? (
              <button type="button" onClick={() => setAdventureReady(true)}
                className="mx-auto mt-4 flex min-h-14 items-center gap-3 rounded-full px-8 text-base font-black uppercase tracking-[0.16em] text-[#0b1030] transition hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})`, border: "2px solid rgba(255,255,255,0.72)", boxShadow: `0 10px 38px ${theme.glow}` }}>
                Start {activeDistrict.name} <ChevronRight className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        )}
      </div>

      <style>{`
        @keyframes sp-char-float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-7px); } }
        @keyframes sp-guided-pulse {
          0%, 100% { box-shadow: 0 0 0 4px ${theme.accent}2e, 0 0 38px ${theme.glow}, 0 14px 32px rgba(0,0,0,0.55), inset 0 2px 0 ${theme.accent}4d, inset 0 -4px 0 rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 0 6px ${theme.accent}47, 0 0 58px ${theme.glow}, 0 14px 32px rgba(0,0,0,0.55), inset 0 2px 0 ${theme.accent}61, inset 0 -4px 0 rgba(0,0,0,0.3); }
        }
      `}</style>
    </div>
  );
}

export default function StarpathClient() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#070a1b]" />}>
      <StarpathWorldShell />
    </Suspense>
  );
}
