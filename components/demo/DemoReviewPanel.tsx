"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Gamepad2,
  Gem,
  GraduationCap,
  RotateCcw,
  Route,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import BrainBreak from "@/components/lesson/BrainBreak";
import {
  GAMES,
  bandForLevel,
  pickBreak,
  type BrainBreakGame,
  type Villain,
} from "@/lib/brain-break";
import { ACTIVE_STUDENT_KEY, clearScopedProgress, writeProgress } from "@/data/progress";
import type { AssessmentResultProfile } from "@/data/assessments/analysis";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { resetLegendUnlockVideosForCurrentScope } from "@/lib/legend-video-state";
import { enqueueReveal } from "@/lib/gem-reveal";
import { fetchDemoGemVault } from "@/lib/gems";
import { buildLessonRoute } from "@/lib/lesson-routing";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { getStarpathLevelForYear } from "@/lib/starpath-levels";
import {
  buildStarpathPostTestPageHref,
  buildStarpathProgramHref,
  buildStarpathWeeklyQuizHref,
} from "@/lib/starpath-routes";

type ReviewRealm = "number" | "measurement" | "space";
type YearLabel = "Prep" | `Year ${1 | 2 | 3 | 4 | 5 | 6}`;

const REALMS: readonly { id: ReviewRealm; label: string; accent: string }[] = [
  { id: "number", label: "Number Nexus", accent: "#14b8a6" },
  { id: "measurement", label: "Measurelands", accent: "#d6a63a" },
  { id: "space", label: "Starpath", accent: "#a78bfa" },
];

const BRAIN_BREAK_GAME_LABELS: Record<BrainBreakGame, string> = {
  whack: "Whack",
  slash: "Slash (swipe)",
  keepuppy: "Keep-Uppy",
  duel: "Duel",
  dodge: "Dodge",
  copyme: "Copy Me",
  trace: "Trace",
  popwall: "Pop Wall",
  trickshot: "Trick Shot",
};

function assessmentHref(realm: ReviewRealm, year: YearLabel, kind: "pretest" | "posttest") {
  const params = new URLSearchParams({ year, realm_id: realm });
  if (realm === "number" && year === "Year 6") {
    params.set("review_bank", "year6-number-v1");
  }
  return `/${kind}?${params.toString()}`;
}

function resultsHref(realm: ReviewRealm, year: YearLabel, scenario: "pre-pass" | "pre-targeted" | "pre-full" | "post-pass" | "post-fail") {
  const params = new URLSearchParams({ year, realm_id: realm, total: "20", review_preview: "1" });
  if (scenario.startsWith("post")) params.set("posttest", "1");
  params.set("score", scenario === "pre-pass" || scenario === "post-pass" ? "17" : scenario === "pre-targeted" ? "13" : scenario === "pre-full" ? "8" : "12");
  return `/results?${params.toString()}`;
}

function actionClass(enabled = true) {
  return `flex min-h-11 w-full items-center justify-center gap-2 border px-4 py-3 text-sm font-bold transition ${
    enabled
      ? "border-white/15 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/[0.1]"
      : "cursor-not-allowed border-white/[0.06] bg-white/[0.025] text-white/30"
  }`;
}

export default function DemoReviewPanel() {
  const router = useRouter();
  const [realm, setRealm] = useState<ReviewRealm>("measurement");
  const [year, setYear] = useState<YearLabel>("Year 3");
  const [week, setWeek] = useState(1);
  const [lesson, setLesson] = useState(1);
  const [resetDone, setResetDone] = useState(false);
  const [gemLoading, setGemLoading] = useState(false);
  const [breakGame, setBreakGame] = useState<BrainBreakGame | "random">("random");
  const [activeBreak, setActiveBreak] = useState<Villain | null>(null);
  const realmDefinition = REALMS.find((item) => item.id === realm) ?? REALMS[0];
  const maxWeek = realm === "number" ? 12 : 8;
  const levelNumber = year === "Prep" ? 0 : Number(year.replace("Year ", ""));
  const pretestAvailable = realm !== "space" && year !== "Prep";
  const posttestAvailable = realm !== "space" || levelNumber <= 3;
  const weeklyContentAvailable = realm !== "space" || levelNumber <= 3;

  useEffect(() => {
    if (!isDemoPreviewMode() || localStorage.getItem(ACTIVE_STUDENT_KEY) !== "demo-preview") {
      router.replace("/login?returnTo=%2Fdemo-review");
    }
  }, [router]);

  useEffect(() => {
    setWeek((current) => Math.min(current, maxWeek));
  }, [maxWeek]);

  const realmHome = useMemo(() => {
    if (realm === "space") {
      return `/starpath?realm_id=space&level=${encodeURIComponent(getStarpathLevelForYear(year).id)}&destination=world`;
    }
    return `${realm === "measurement" ? "/measurelands" : "/number-nexus"}?level=${encodeURIComponent(year)}`;
  }, [realm, year]);

  function preparePreview(profile?: AssessmentResultProfile) {
    writeProgress({
      year,
      scorePercent: 0,
      status: "ASSIGNED_PROGRAM",
      placementComplete: true,
      assignedWeek: week,
      requiredWeeks: [],
      optionalWeeks: [],
      unlockedLegends: [],
      teacherAdvancedWeeks: [],
      lastPreTestPercent: profile?.testType === "pre" ? profile.percentage : undefined,
      lastPreTestProfile: profile?.testType === "pre" ? profile : undefined,
      lastPostTestPercent: profile?.testType === "post" ? profile.percentage : undefined,
      lastPostTestProfile: profile?.testType === "post" ? profile : undefined,
    }, realm);
  }

  function open(href: string, resetReveal = false) {
    preparePreview();
    if (resetReveal) resetLegendUnlockVideosForCurrentScope();
    router.push(href);
  }

  function openResult(scenario: "pre-pass" | "pre-targeted" | "pre-full" | "post-pass" | "post-fail") {
    const isPost = scenario.startsWith("post");
    const score = scenario === "pre-pass" || scenario === "post-pass" ? 17 : scenario === "pre-targeted" ? 13 : scenario === "pre-full" ? 8 : 12;
    const percentage = score * 5;
    const recommendedWeeks = scenario === "pre-targeted" ? [3, 6] : scenario === "pre-full" ? Array.from({ length: maxWeek }, (_, index) => index + 1) : isPost && score < 17 ? [2, 5] : [];
    const profile: AssessmentResultProfile = {
      yearLevel: levelNumber,
      testType: isPost ? "post" : "pre",
      score,
      total: 20,
      percentage,
      passed: percentage >= 85,
      strengths: [{ skillId: "review-strength", skillLabel: "Measurement reasoning", linkedWeeks: [1], strand: realm, incorrectCount: 0, correctCount: 4, total: 4 }],
      weakAreas: recommendedWeeks.length > 0
        ? [{ skillId: "review-focus", skillLabel: "Applied problem solving", linkedWeeks: recommendedWeeks, linkedLessons: [2], strand: realm, incorrectCount: 3, correctCount: 1, total: 4 }]
        : [],
      recommendedWeeks,
      recommendedLessonTargets: recommendedWeeks.map((recommendedWeek) => ({ week: recommendedWeek, lessons: [2] })),
      assignedWeek: recommendedWeeks[0],
      generatedAt: new Date().toISOString(),
    };
    preparePreview(profile);
    resetLegendUnlockVideosForCurrentScope();
    router.push(resultsHref(realm, year, scenario));
  }

  function resetDemoState() {
    clearScopedProgress("demo-preview");
    clearScopedProgramStore("demo-preview");
    resetLegendUnlockVideosForCurrentScope();
    for (const storage of [localStorage, sessionStorage]) {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (key?.includes("demo-preview") && key !== ACTIVE_STUDENT_KEY) storage.removeItem(key);
      }
    }
    preparePreview();
    setResetDone(true);
    window.setTimeout(() => setResetDone(false), 1800);
  }

  async function previewGemReveal() {
    if (gemLoading) return;
    setGemLoading(true);
    try {
      const vault = await fetchDemoGemVault();
      const gem = [...vault.definitions].sort((left, right) => right.display_order - left.display_order)[0];
      if (gem) enqueueReveal([gem]);
    } finally {
      setGemLoading(false);
    }
  }

  function programHref() {
    if (realm === "space") return buildStarpathProgramHref({ selectedLevel: getStarpathLevelForYear(year).id }, week);
    const params = new URLSearchParams({ year, week: String(week), legacy: "1", realm_id: realm });
    return `/program?${params.toString()}`;
  }

  function lessonHref() {
    return buildLessonRoute({ yearLabel: year, week, lessonNumber: lesson, realmId: realm });
  }

  function quizHref() {
    if (realm === "space") return buildStarpathWeeklyQuizHref({ selectedLevel: getStarpathLevelForYear(year).id }, week);
    const params = new URLSearchParams({ year, week: String(week), type: "quiz", n: "1", realm_id: realm });
    return `/session?${params.toString()}`;
  }

  function posttestHref() {
    if (realm === "space") return buildStarpathPostTestPageHref({ selectedLevel: getStarpathLevelForYear(year).id });
    return assessmentHref(realm, year, "posttest");
  }

  // Brain breaks: build a (game, villain) pair matching the picker's real
  // behaviour, but let the reviewer force a specific game to test each one.
  // No sourceKey → the visual "+N XP" still shows but nothing writes to a wallet.
  function playBrainBreak() {
    const base = pickBreak(levelNumber);
    if (breakGame === "random") {
      setActiveBreak(base);
      return;
    }
    const def = GAMES.find((game) => game.id === breakGame);
    if (!def) {
      setActiveBreak(base);
      return;
    }
    const band = bandForLevel(levelNumber);
    setActiveBreak({
      ...base,
      game: def.id,
      durationSec: def.durationSec,
      winCount: band === "senior" ? def.win.senior : def.win.junior,
    });
  }

  return (
    <main className="min-h-screen bg-[#0b0d12] text-white">
      <header className="border-b border-white/10 bg-[#11141b] px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <button type="button" onClick={() => router.push("/realms")} className="grid h-10 w-10 shrink-0 place-items-center border border-white/15 bg-white/[0.04] hover:bg-white/[0.09]" title="Back to realms" aria-label="Back to realms">
            <ArrowLeft size={18} />
          </button>
          <ClipboardCheck className="text-teal-300" size={22} aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="text-lg font-black sm:text-xl">Demo Review</h1>
            <p className="text-xs text-white/50">Isolated preview workspace</p>
          </div>
          <div className="ml-auto hidden border border-emerald-400/25 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-200 sm:block">No canonical writes</div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <section className="border-b border-white/10 pb-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-xs font-bold text-white/60">Realm
              <select value={realm} onChange={(event) => setRealm(event.target.value as ReviewRealm)} className="mt-2 h-11 w-full border border-white/15 bg-[#171a22] px-3 text-sm font-bold text-white">
                {REALMS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-white/60">Level
              <select value={year} onChange={(event) => setYear(event.target.value as YearLabel)} className="mt-2 h-11 w-full border border-white/15 bg-[#171a22] px-3 text-sm font-bold text-white">
                {LEVEL_CATALOG.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => open(realmHome)} className={actionClass()} style={{ borderColor: `${realmDefinition.accent}66` }}>
                <Eye size={17} /> Open Realm
              </button>
              <button type="button" onClick={resetDemoState} className="grid h-11 w-11 shrink-0 place-items-center border border-white/15 bg-white/[0.06] text-white hover:bg-white/[0.1]" title="Reset demo preview state" aria-label="Reset demo preview state">
                <RotateCcw size={17} />
              </button>
            </div>
          </div>
          {resetDone ? <p className="mt-3 text-xs font-bold text-emerald-300">Demo state reset.</p> : null}
        </section>

        <section className="py-6">
          <div className="mb-4 flex items-center gap-2"><ClipboardCheck size={18} className="text-teal-300" /><h2 className="text-base font-black">Live Assessments</h2></div>
          {realm === "number" && year === "Year 6" ? (
            <p className="mb-3 text-xs font-bold text-amber-200">Level 6 opens the independent V1 candidate banks for review. Production remains unchanged.</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" disabled={!pretestAvailable} onClick={() => pretestAvailable && open(assessmentHref(realm, year, "pretest"))} className={actionClass(pretestAvailable)}>
              <Route size={17} /> {pretestAvailable ? "Open Pre-Test" : "Pre-Test not available"}
            </button>
            <button type="button" disabled={!posttestAvailable} onClick={() => posttestAvailable && open(posttestHref())} className={actionClass(posttestAvailable)}>
              <GraduationCap size={17} /> {posttestAvailable ? "Open Post-Test" : "Post-Test not implemented"}
            </button>
          </div>
        </section>

        <section className="border-t border-white/10 py-6">
          <div className="mb-4 flex items-center gap-2"><BookOpen size={18} className="text-amber-300" /><h2 className="text-base font-black">Weekly Content</h2></div>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_2fr]">
            <label className="text-xs font-bold text-white/60">Week
              <select value={week} onChange={(event) => setWeek(Number(event.target.value))} className="mt-2 h-11 w-full border border-white/15 bg-[#171a22] px-3 text-sm font-bold text-white">
                {Array.from({ length: maxWeek }, (_, index) => index + 1).map((value) => <option key={value} value={value}>Week {value}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-white/60">Lesson
              <select value={lesson} onChange={(event) => setLesson(Number(event.target.value))} className="mt-2 h-11 w-full border border-white/15 bg-[#171a22] px-3 text-sm font-bold text-white">
                {[1, 2, 3].map((value) => <option key={value} value={value}>Lesson {value}</option>)}
              </select>
            </label>
            <div className="grid gap-2 sm:grid-cols-3 md:self-end">
              <button type="button" disabled={!weeklyContentAvailable} onClick={() => weeklyContentAvailable && open(programHref())} className={actionClass(weeklyContentAvailable)}><Route size={16} /> Week</button>
              <button type="button" disabled={!weeklyContentAvailable} onClick={() => weeklyContentAvailable && open(lessonHref())} className={actionClass(weeklyContentAvailable)}><BookOpen size={16} /> Lesson</button>
              <button type="button" disabled={!weeklyContentAvailable} onClick={() => weeklyContentAvailable && open(quizHref())} className={actionClass(weeklyContentAvailable)}><ClipboardCheck size={16} /> Quiz</button>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-6">
          <div className="mb-4 flex items-center gap-2"><Gamepad2 size={18} className="text-emerald-300" /><h2 className="text-base font-black">Brain Breaks</h2></div>
          <p className="mb-3 text-xs text-white/50">Plays the real mid-lesson mini-game overlay. Villain matches the selected Level&apos;s age band; pick a game or leave it random. No XP is written in demo.</p>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
            <label className="text-xs font-bold text-white/60">Game
              <select value={breakGame} onChange={(event) => setBreakGame(event.target.value as BrainBreakGame | "random")} className="mt-2 h-11 w-full border border-white/15 bg-[#171a22] px-3 text-sm font-bold text-white">
                <option value="random">Random (matches level band)</option>
                {GAMES.map((game) => <option key={game.id} value={game.id}>{BRAIN_BREAK_GAME_LABELS[game.id]}</option>)}
              </select>
            </label>
            <button type="button" onClick={playBrainBreak} className={`${actionClass()} md:self-end`}><Gamepad2 size={16} /> Play Brain Break</button>
          </div>
        </section>

        <section className="border-t border-white/10 py-6">
          <div className="mb-4 flex items-center gap-2"><Sparkles size={18} className="text-violet-300" /><h2 className="text-base font-black">Results and Reveals</h2></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <button type="button" disabled={!pretestAvailable} onClick={() => pretestAvailable && openResult("pre-pass")} className={actionClass(pretestAvailable)}><CheckCircle2 size={16} /> Pre 85%</button>
            <button type="button" disabled={!pretestAvailable} onClick={() => pretestAvailable && openResult("pre-targeted")} className={actionClass(pretestAvailable)}><Route size={16} /> Targeted</button>
            <button type="button" disabled={!pretestAvailable} onClick={() => pretestAvailable && openResult("pre-full")} className={actionClass(pretestAvailable)}><BookOpen size={16} /> Full Path</button>
            <button type="button" onClick={() => openResult("post-pass")} className={actionClass()}><Sparkles size={16} /> Unlock</button>
            <button type="button" onClick={() => openResult("post-fail")} className={actionClass()}><XCircle size={16} /> Post Fail</button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={previewGemReveal} disabled={gemLoading} className={actionClass(!gemLoading)}><Gem size={16} /> {gemLoading ? "Loading..." : "Gem Reveal"}</button>
            <button type="button" onClick={() => open("/my-realmies?review_reveal=1")} className={actionClass()}><Sparkles size={16} /> Realmie Reveal</button>
            <button type="button" onClick={() => open("/legends")} className={actionClass()}><Eye size={16} /> Legend Collection</button>
          </div>
        </section>

        <footer className="border-t border-white/10 py-5 text-xs leading-5 text-white/45">
          Preview actions use the real student components with demo-scoped local state. Use a mock student to validate database saving, teacher reporting, replay, progression and awarded rewards.
        </footer>
      </div>

      {activeBreak ? (
        <>
          <BrainBreak key={activeBreak.id + Date.now()} villain={activeBreak} onComplete={() => setActiveBreak(null)} />
          <button
            type="button"
            onClick={() => setActiveBreak(null)}
            className="fixed right-4 top-4 z-[80] grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur hover:bg-black/70"
            title="Exit brain break"
            aria-label="Exit brain break"
          >
            <X size={20} />
          </button>
        </>
      ) : null}
    </main>
  );
}
