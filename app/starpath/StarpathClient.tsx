"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ChevronRight, Map, Orbit, Rocket, Sparkles } from "lucide-react";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { getActiveStudentIdentity, getActiveStudentProfile } from "@/lib/studentIdentity";
import { loadStarpathPlacement } from "@/lib/starpath-placement-adapter";
import type { StarpathPlacement } from "@/lib/starpath-placement";
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
  ground: {
    background: "/images/starpath-home-bg-ground.png",
    accent: "#9be7ff",
    accentSoft: "#dbeafe",
    glow: "rgba(125,211,252,0.42)",
  },
  "level-1": {
    background: "/images/starpath-home-bg-y1.png",
    accent: "#8fe7ff",
    accentSoft: "#e0f2fe",
    glow: "rgba(103,232,249,0.42)",
  },
  "level-2": {
    background: "/images/starpath-home-bg-y2.png",
    accent: "#c4b5fd",
    accentSoft: "#ede9fe",
    glow: "rgba(196,181,253,0.44)",
  },
  "level-3": {
    background: "/images/starpath-home-bg-y3.png",
    accent: "#a5b4fc",
    accentSoft: "#e0e7ff",
    glow: "rgba(165,180,252,0.46)",
  },
  "level-4": {
    background: "/images/starpath-home-bg-y4.png",
    accent: "#67e8f9",
    accentSoft: "#cffafe",
    glow: "rgba(103,232,249,0.46)",
  },
  "level-5": {
    background: "/images/starpath-home-bg-y5.png",
    accent: "#c4b5fd",
    accentSoft: "#f5f3ff",
    glow: "rgba(196,181,253,0.48)",
  },
  "level-6": {
    background: "/images/starpath-home-bg-y6.png",
    accent: "#e9d5ff",
    accentSoft: "#faf5ff",
    glow: "rgba(216,180,254,0.48)",
  },
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

  useEffect(() => {
    if (invalidRoute || !selectedLevel) return;
    const canonicalHref = buildStarpathWorldHref({ selectedLevel, placementLevel });
    if (`${window.location.pathname}${window.location.search}` !== canonicalHref) {
      router.replace(canonicalHref);
    }
  }, [invalidRoute, placementLevel, router, selectedLevel]);

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
          <p className="mt-4 text-lg leading-8 text-white/70">
            Starpath requires `realm_id=space` and a valid level from Ground Level through Level 6.
          </p>
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

  return (
    <main className="relative min-h-[100svh] overflow-hidden bg-[#070a1b] text-white">
      <Image aria-hidden="true" src={theme.background} alt="" fill priority sizes="100vw" className="object-cover object-center" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,28,0.7)_0%,rgba(5,8,28,0.12)_24%,rgba(5,8,28,0.08)_62%,rgba(5,8,28,0.78)_100%)]" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_140px_28px_rgba(3,6,22,0.38)]" />

      <div className="relative z-10 flex min-h-[100svh] flex-col">
        <header className="flex min-h-20 items-center justify-between gap-3 border-b border-white/15 bg-[#080b20]/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(buildStarpathTowerReturnHref(selectedLevel))}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-white/20 bg-white/[0.07] px-3 text-sm font-bold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2"
              style={{ "--tw-ring-color": theme.accent } as React.CSSProperties}
            >
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
            </button>
            <div className="inline-flex h-11 min-w-0 items-center gap-2 rounded-lg border border-white/20 bg-white/[0.07] px-3">
              <Sparkles className="h-4 w-4 shrink-0" style={{ color: theme.accent }} />
              <span className="truncate text-xs font-black uppercase tracking-[0.16em] sm:text-sm">Starpath</span>
            </div>
            <div className="inline-flex h-11 shrink-0 items-center rounded-lg border border-white/20 bg-white/[0.07] px-3 text-xs font-black uppercase tracking-[0.12em]" style={{ color: theme.accentSoft }}>
              {selectedDefinition.levelNumber === 0 ? "Ground" : `LV ${selectedDefinition.levelNumber}`}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/[0.07] px-3 text-xs font-black uppercase tracking-[0.12em] text-white/80 sm:inline-flex">
              <Orbit className="h-4 w-4" style={{ color: theme.accent }} /> Demo · Preview
            </div>
            <div className="inline-flex h-11 items-center rounded-lg border border-white/20 bg-white/[0.07] px-3 text-xs font-black" style={{ color: theme.accentSoft }}>
              {currentWeek}/8 weeks
            </div>
          </div>
        </header>

        <section className="relative flex flex-1 flex-col px-4 pb-5 pt-5 sm:px-6">
          <div className="mx-auto text-center [text-shadow:0_2px_18px_rgba(2,6,23,0.9)]">
            <p className="text-[11px] font-black uppercase tracking-[0.28em]" style={{ color: theme.accent }}>
              {guidedMode ? "Guided Starpath" : "Starpath District Map"}
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-normal sm:text-5xl">{selectedDefinition.displayLabel}</h1>
            <p className="mx-auto mt-1 max-w-2xl text-sm font-semibold text-white/75 sm:text-base">{program.summary}</p>
          </div>

          {guidedMode ? (
            <div className="mx-auto mt-auto flex w-full max-w-2xl flex-col items-center pb-[clamp(1rem,5vh,4rem)] pt-10 text-center">
              <div className="rounded-lg border border-white/20 bg-[#080b20]/72 px-5 py-3 backdrop-blur-xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>Current path · Week {currentWeek}</p>
                <p className="mt-1 text-lg font-black text-white">{openingWeek.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdventureReady(true)}
                className="mt-4 inline-flex min-h-14 items-center gap-3 rounded-lg border px-7 text-base font-black uppercase tracking-[0.12em] text-[#091126] transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080b20]"
                style={{
                  background: `linear-gradient(135deg, ${theme.accentSoft}, ${theme.accent})`,
                  borderColor: "rgba(255,255,255,0.72)",
                  boxShadow: `0 10px 38px ${theme.glow}`,
                  "--tw-ring-color": theme.accent,
                } as React.CSSProperties}
              >
                <Rocket className="h-5 w-5" /> Start Adventure <ChevronRight className="h-5 w-5" />
              </button>
              {adventureReady ? (
                <p role="status" className="mt-3 rounded-lg border border-white/20 bg-[#080b20]/78 px-4 py-2 text-sm font-bold text-white/85 backdrop-blur-xl">
                  Week {currentWeek} preview ready · {openingWeek.lessons[0].title}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 content-center gap-3 py-5 sm:grid-cols-2 sm:gap-x-[clamp(5rem,24vw,25rem)] sm:gap-y-7">
              {districts.map((district, index) => {
                const isCurrent = index === currentDistrict;
                const isFocused = index === focusedDistrict;
                return (
                  <button
                    key={district.name}
                    type="button"
                    onClick={() => setFocusedDistrict(index)}
                    aria-pressed={isFocused}
                    className="group min-h-[112px] w-full rounded-lg border bg-[#080b20]/76 px-4 py-3 text-left backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-[#101634]/88 focus-visible:outline-none focus-visible:ring-2"
                    style={{
                      borderColor: isFocused ? district.accent : "rgba(255,255,255,0.22)",
                      boxShadow: isFocused ? `0 0 30px ${district.accent}42, inset 0 0 22px ${district.accent}12` : "0 12px 28px rgba(2,6,23,0.28)",
                      "--tw-ring-color": district.accent,
                    } as React.CSSProperties}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: district.accent }}>
                          Weeks {district.weekStart}–{district.weekEnd} {isCurrent ? "· Current" : ""}
                        </span>
                        <h2 className="mt-1 text-lg font-black uppercase tracking-[0.12em] text-white">{district.name}</h2>
                      </div>
                      <Map className="mt-1 h-5 w-5 shrink-0" style={{ color: district.accent }} />
                    </div>
                    <p className="mt-2 text-xs font-bold leading-5 text-white/62">{district.concepts}</p>
                  </button>
                );
              })}
            </div>
          )}

          {!guidedMode && activeDistrict ? (
            <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-4 rounded-lg border border-white/20 bg-[#080b20]/82 px-4 py-3 backdrop-blur-xl">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: activeDistrict.accent }}>Selected district</p>
                <p className="truncate text-sm font-black text-white">{activeDistrict.name} · Week {activeDistrict.weekStart}</p>
              </div>
              <button
                type="button"
                onClick={() => setAdventureReady(true)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border px-4 text-xs font-black uppercase tracking-[0.1em] text-[#091126] transition hover:brightness-105"
                style={{ background: activeDistrict.accent, borderColor: "rgba(255,255,255,0.65)" }}
              >
                Preview <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
            {adventureReady && !guidedMode ? `${activeDistrict?.name} curriculum preview selected · ` : ""}Demo progress is not saved.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function StarpathClient() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#070a1b]" />}>
      <StarpathWorldShell />
    </Suspense>
  );
}
