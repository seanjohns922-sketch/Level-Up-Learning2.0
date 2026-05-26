"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegendForYear } from "@/data/legends";
import { readProgress, StudentProgress, writeProgress, ACTIVE_STUDENT_KEY } from "@/data/progress";
import { supabase } from "@/lib/supabase";
import LegendUnlockReveal from "@/components/LegendUnlockReveal";
import type { AssessmentResultProfile } from "@/data/assessments/analysis";
import { ALL_PROGRAM_WEEKS, getOptionalWeeks, normalizeWeekList } from "@/lib/program-progress";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
const POSTTEST_PASS_THRESHOLD = 85;
const PRETEST_PASS_THRESHOLD = 85;

const YEAR_SEQUENCE = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"] as const;

type SkillGrowthRow = {
  skillId: string;
  skillLabel: string;
  strand: string;
  difficultyBand: string | undefined;
  preAccuracy: number;
  postAccuracy: number;
  improvement: number;
  incorrectCount: number;
};

function getLowestRecommendedWeek(profile: AssessmentResultProfile | null) {
  if (!profile?.recommendedWeeks?.length) return undefined;
  return Math.min(...profile.recommendedWeeks);
}

function getAssignedReviewWeek(profile: AssessmentResultProfile | null) {
  return profile?.assignedWeek ?? getLowestRecommendedWeek(profile);
}

function getNextYearLabel(year: string) {
  const index = YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]);
  if (index === -1) return null;
  return YEAR_SEQUENCE[index + 1] ?? null;
}

function getLegendIdsUpToYear(year: string) {
  const yearIndex = YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]);
  if (yearIndex === -1) return [getLegendForYear(year).id];
  return YEAR_SEQUENCE.slice(0, yearIndex + 1).map((label) => getLegendForYear(label).id);
}

function getLegendIdsBeforeYear(year: string) {
  const yearIndex = YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]);
  if (yearIndex <= 0) return [];
  return YEAR_SEQUENCE.slice(0, yearIndex).map((label) => getLegendForYear(label).id);
}

function getStrandBadgeClass(strand?: string) {
  switch (strand) {
    case "fractions":
      return "bg-violet-500/15 text-violet-300 border-violet-400/30";
    case "patterns":
      return "bg-sky-500/15 text-sky-300 border-sky-400/30";
    case "multiplication_division":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "addition_subtraction":
      return "bg-amber-500/15 text-amber-300 border-amber-400/30";
    default:
      return "bg-teal-500/15 text-teal-300 border-teal-400/30";
  }
}

function getStrandLabel(strand?: string) {
  switch (strand) {
    case "fractions":
      return "Fractions";
    case "patterns":
      return "Patterns";
    case "multiplication_division":
      return "Multiplication & Division";
    case "addition_subtraction":
      return "Addition & Subtraction";
    default:
      return "Number";
  }
}

function accuracyForSkill(item: { correctCount: number; total: number }) {
  if (!item.total) return 0;
  return Math.round((item.correctCount / item.total) * 100);
}

function buildSkillGrowth(
  preProfile: AssessmentResultProfile | null,
  postProfile: AssessmentResultProfile | null
): SkillGrowthRow[] {
  if (!preProfile || !postProfile) return [];

  const preMap = new Map(
    [...preProfile.strengths, ...preProfile.weakAreas].map((item) => [item.skillId, item])
  );
  const postItems = [...postProfile.strengths, ...postProfile.weakAreas];
  const postMap = new Map(postItems.map((item) => [item.skillId, item]));
  const skillIds = new Set([...preMap.keys(), ...postMap.keys()]);

  const rows = [...skillIds]
    .map((skillId) => {
      const pre = preMap.get(skillId);
      const post = postMap.get(skillId);
      const base = post ?? pre;
      if (!base) return null;
      const preAccuracy = pre ? accuracyForSkill(pre) : 0;
      const postAccuracy = post ? accuracyForSkill(post) : 0;
      return {
        skillId,
        skillLabel: base.skillLabel,
        strand: base.strand,
        difficultyBand: base.difficultyBand,
        preAccuracy,
        postAccuracy,
        improvement: postAccuracy - preAccuracy,
        incorrectCount: post?.incorrectCount ?? 0,
      };
    })
    .filter((item): item is SkillGrowthRow => item !== null);

  return rows.sort((a, b) => b.improvement - a.improvement || a.incorrectCount - b.incorrectCount);
}

export default function ResultsPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading…</p></div>}><ResultsPage /></Suspense>;
}

/* ── animated circular progress ring ── */
function ScoreRing({ percent, passed }: { percent: number; passed: boolean }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const radius = 80;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percent), 200);
    return () => clearTimeout(timer);
  }, [percent]);

  const ringColor = passed ? "rgb(45 212 191)" : "rgb(251 191 36)";
  const ringGlow = passed ? "rgb(20 184 166)" : "rgb(245 158 11)";

  return (
    <div className="relative flex items-center justify-center my-8">
      <div
        className="absolute w-56 h-56 rounded-full blur-3xl opacity-40"
        style={{ background: ringGlow }}
      />
      <svg width="220" height="220" className="relative z-10 -rotate-90">
        <circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)",
            filter: `drop-shadow(0 0 12px ${ringColor})`,
          }}
        />
      </svg>
      <div className="absolute z-20 text-center">
        <div className="text-6xl font-extrabold font-display tracking-tight" style={{ color: ringColor }}>
          {percent}%
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-2">
          Score
        </div>
      </div>
    </div>
  );
}

/* ── decorative floating shapes (deterministic to avoid hydration mismatch) ── */
const SHAPES = [
  { w: 32, h: 28, l: 12, t: 15, dur: 4.2, del: 0.3 },
  { w: 48, h: 44, l: 78, t: 8, dur: 5.1, del: 1.2 },
  { w: 24, h: 36, l: 45, t: 62, dur: 3.8, del: 0.7 },
  { w: 40, h: 30, l: 88, t: 35, dur: 6.0, del: 1.6 },
  { w: 28, h: 42, l: 22, t: 80, dur: 4.5, del: 0.5 },
  { w: 52, h: 38, l: 60, t: 50, dur: 5.5, del: 1.0 },
  { w: 36, h: 46, l: 35, t: 25, dur: 3.5, del: 1.4 },
  { w: 44, h: 34, l: 70, t: 72, dur: 6.5, del: 0.9 },
];

function FloatingShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ambient radial glows */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[22rem] h-[22rem] rounded-full bg-cyan-500/5 blur-[100px]" />
      {/* grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: `${s.w}px`,
            height: `${s.h}px`,
            background: i % 2 === 0 ? "rgb(45 212 191)" : "rgb(16 185 129)",
            filter: "blur(8px)",
            left: `${s.l}%`,
            top: `${s.t}%`,
            animation: `floatShape ${s.dur}s ease-in-out infinite alternate`,
            animationDelay: `${s.del}s`,
          }}
        />
      ))}
    </div>
  );
}

function ResultsPage() {
  const router = useRouter();
  const sp = useSearchParams();

  const year = sp.get("year") ?? "Year 3";
  const studentLevelLabel = formatStudentLevelLabel(year);
  const score = Number(sp.get("score") ?? "0");
  const total = Number(sp.get("total") ?? "0");
  const source = sp.get("source") ?? "pretest";
  const isPostTest = sp.get("posttest") === "1";

  const scorePercent = useMemo(() => {
    if (!total || total <= 0) return 0;
    return Math.round((score / total) * 100);
  }, [score, total]);

  const passedByPretest = !isPostTest && scorePercent >= PRETEST_PASS_THRESHOLD;
  const passedByPosttest = isPostTest && scorePercent >= POSTTEST_PASS_THRESHOLD;
  const passedByProgram = source === "program_complete";
  const passed = passedByPretest || passedByPosttest || passedByProgram;
  const displayPercent = passedByProgram ? 100 : scorePercent;
  const nextYear = getNextYearLabel(year);

  const legend = useMemo(() => getLegendForYear(year), [year]);
  const storedPosttestProfile: AssessmentResultProfile | null = useMemo(() => {
    const progress = readProgress();
    return isPostTest ? progress?.lastPostTestProfile ?? null : null;
  }, [isPostTest]);
  const storedPretestProfile: AssessmentResultProfile | null = useMemo(() => {
    const progress = readProgress();
    return progress?.lastPreTestProfile ?? null;
  }, []);
  const skillGrowth = useMemo(
    () => buildSkillGrowth(storedPretestProfile, storedPosttestProfile),
    [storedPretestProfile, storedPosttestProfile]
  );
  const strongestGrowth = skillGrowth.find((item) => item.improvement > 0) ?? null;
  const keepPractising =
    [...skillGrowth]
      .sort((a, b) => a.postAccuracy - b.postAccuracy || a.improvement - b.improvement)
      .find((item) => item.postAccuracy < 100) ?? null;
  const growthPercentagePoints =
    storedPretestProfile && storedPosttestProfile
      ? storedPosttestProfile.percentage - storedPretestProfile.percentage
      : null;
  const growthCorrectCount =
    storedPretestProfile && storedPosttestProfile
      ? storedPosttestProfile.score - storedPretestProfile.score
      : null;

  const initialProgress = useMemo(() => readProgress(), []);
  const [unlockDismissed, setUnlockDismissed] = useState(false);
  const unlockTargets = useMemo(() => {
    if (passedByPretest) return getLegendIdsUpToYear(year);
    if (!isPostTest) return getLegendIdsBeforeYear(year); // failed pretest → unlock all prior years
    return [legend.id];
  }, [passedByPretest, isPostTest, year, legend.id]);

  // For a failed pretest we unlock prior-year legends — show the highest one in the overlay
  const unlockDisplayLegend = useMemo(() => {
    if (!isPostTest && !passedByPretest && unlockTargets.length > 0) {
      const yearIndex = YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]);
      if (yearIndex > 0) return getLegendForYear(YEAR_SEQUENCE[yearIndex - 1]);
    }
    return legend;
  }, [isPostTest, passedByPretest, unlockTargets, year, legend]);

  const shouldShowUnlock =
    unlockTargets.length > 0 &&
    unlockTargets.some((id) => !(initialProgress?.unlockedLegends ?? []).includes(id)) &&
    !unlockDismissed;
  const isFailedPretest = !isPostTest && !passedByPretest;
  const requiresFullPathway = isFailedPretest && scorePercent < PRETEST_PASS_THRESHOLD;
  const diagnosticRequiredWeeks = useMemo(
    () => (!isPostTest ? normalizeWeekList(storedPretestProfile?.recommendedWeeks) : []),
    [isPostTest, storedPretestProfile]
  );
  const requiredWeeks = useMemo(() => {
    if (isPostTest) return [];
    if (!isFailedPretest) return [];
    if (requiresFullPathway || diagnosticRequiredWeeks.length === 0) return ALL_PROGRAM_WEEKS;
    return diagnosticRequiredWeeks;
  }, [diagnosticRequiredWeeks, isFailedPretest, isPostTest, requiresFullPathway]);
  const optionalWeeks = useMemo(() => {
    if (isPostTest) return ALL_PROGRAM_WEEKS;
    if (!isFailedPretest) return ALL_PROGRAM_WEEKS;
    return requiresFullPathway ? [] : getOptionalWeeks(requiredWeeks);
  }, [isFailedPretest, isPostTest, requiredWeeks, requiresFullPathway]);

  useEffect(() => {
    const prev = readProgress();
    const prevUnlocked = prev?.unlockedLegends ?? [];
    const alreadyUnlocked = unlockTargets.every((id) => prevUnlocked.includes(id));

    let next: StudentProgress;

    if (passed) {
      const unlocked = alreadyUnlocked
        ? prevUnlocked
        : Array.from(new Set([...prevUnlocked, ...unlockTargets]));
      next = {
        ...prev,
        year: !isPostTest && !passedByProgram && nextYear ? nextYear : year,
        scorePercent: passedByProgram ? Math.max(prev?.scorePercent ?? 0, POSTTEST_PASS_THRESHOLD) : scorePercent,
        status: "PASSED",
        placementComplete: isPostTest || passedByProgram || !nextYear,
        assignedWeek: prev?.assignedWeek,
        assignedWeeksHistory: prev?.assignedWeeksHistory,
        requiredWeeks: [],
        optionalWeeks: ALL_PROGRAM_WEEKS,
        unlockedLegends: unlocked,
      };
    } else {
      const assignedWeek = isPostTest
        ? getLowestRecommendedWeek(storedPosttestProfile) ?? 1
        : requiredWeeks[0] ?? getLowestRecommendedWeek(storedPretestProfile) ?? 1;
      const lowerLegendUnlocks = isFailedPretest ? getLegendIdsBeforeYear(year) : [];
      const unlocked = Array.from(new Set([...prevUnlocked, ...lowerLegendUnlocks]));
      next = {
        ...prev,
        year,
        scorePercent,
        status: "ASSIGNED_PROGRAM",
        placementComplete: true,
        assignedWeek,
        requiredWeeks: isPostTest ? prev?.requiredWeeks ?? [] : requiredWeeks,
        optionalWeeks: isPostTest ? prev?.optionalWeeks ?? ALL_PROGRAM_WEEKS : optionalWeeks,
        unlockedLegends: unlocked,
      };
    }

    writeProgress(next);

    (async () => {
      try {
        if (isPostTest || passedByProgram) return;
        const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
        if (!studentId) return;
        const { error } = await supabase.rpc("save_pretest_progress", {
          p_student_id: studentId,
          p_year: year,
          p_score: scorePercent,
          p_status: next.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
          p_week: next.assignedWeek ?? null,
        });
        if (error) console.warn("[Results] DB pretest save error:", error);
      } catch (e) {
        console.warn("[Results] DB pretest save failed:", e);
      }
    })();
  }, [passed, year, scorePercent, isPostTest, isFailedPretest, passedByProgram, storedPosttestProfile, storedPretestProfile, unlockTargets, requiredWeeks, optionalWeeks, nextYear]);

  function goHome() { router.push("/levels"); }
  const assignedStartWeek = isPostTest
    ? getAssignedReviewWeek(storedPosttestProfile) ?? 1
    : getAssignedReviewWeek(storedPretestProfile) ?? 1;

  function goProgram() {
    router.push("/levels");
  }
  function goNextPretest() {
    if (!nextYear) {
      router.push("/legends");
      return;
    }
    router.push(`/pretest?year=${encodeURIComponent(nextYear)}`);
  }
  function goRetryPostTest() {
    router.push(`/posttest?year=${encodeURIComponent(year)}`);
  }
  function goLegends() { router.push("/legends"); }

  // Emoji + message based on score
  const getMessage = () => {
    if (passed) return { emoji: "🏆", title: "Amazing Work!", sub: "You crushed it!" };
    if (scorePercent >= 70) return { emoji: "💪", title: "So Close!", sub: "A little more practice and you'll nail it." };
    if (scorePercent >= PRETEST_PASS_THRESHOLD) return { emoji: "🌱", title: "Good Start!", sub: "Let's build your skills with a personalised program." };
    return { emoji: "🚀", title: "Let's Level Up!", sub: "Your adventure is just beginning." };
  };
  const msg = getMessage();
  const topStrengths = storedPosttestProfile?.strengths?.slice(0, 3) ?? [];
  const topWeakAreas = storedPosttestProfile?.weakAreas?.slice(0, 3) ?? [];
  const assignedReviewWeek = getAssignedReviewWeek(storedPosttestProfile);

  function goAssignedWeek() {
    const week = assignedReviewWeek ?? 1;
    const qs = new URLSearchParams({ year, week: String(week) }).toString();
    router.push(`/program?${qs}&legacy=1`);
  }
  function goContinue() {
    router.push("/levels");
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-start justify-center p-4 pt-8 relative overflow-y-auto">
      <FloatingShapes />

        <div
        className="relative z-10 w-full max-w-lg"
        style={{
          opacity: 1,
          transform: "translateY(0)",
          transition: "all 0.6s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Hero card */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_70px_-20px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 ring-1 ring-white/5">
          {/* Top gradient band */}
          <div
            className="h-1"
            style={{
              background: passed
                ? "linear-gradient(90deg, rgb(20 184 166), rgb(16 185 129), rgb(45 212 191))"
                : "linear-gradient(90deg, rgb(251 191 36), rgb(245 158 11), rgb(251 146 60))",
            }}
          />

          <div className="p-8 pb-6 text-center relative">
            {/* Emoji badge */}
            <div
              className="text-5xl mb-3 inline-block"
              style={{
                animation: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both",
                filter: "drop-shadow(0 0 24px rgba(45, 212, 191, 0.4))",
              }}
            >
              {msg.emoji}
            </div>

            <h1 className="text-3xl font-extrabold font-display text-white mb-1 tracking-tight">
              {msg.title}
            </h1>
            <p className="text-sm text-slate-400 mb-3">{msg.sub}</p>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold text-teal-300/80 uppercase tracking-[0.25em] px-3 py-1 rounded-full border border-teal-400/20 bg-teal-500/5">
              {studentLevelLabel} • {isPostTest ? "Post-Test" : source === "program_complete" ? "Program" : "Pre-Test"}
            </div>

            <ScoreRing percent={displayPercent} passed={passed} />

            {/* Score breakdown */}
            <div className="flex items-center justify-center gap-6 text-sm mb-2">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-white">{score}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">Correct</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-white">{total}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">Total</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: passed ? "rgb(45 212 191)" : "rgb(251 191 36)" }}>
                  {passed ? "PASS" : "GROW"}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">Status</div>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="px-8 pb-6 pt-4 space-y-3">
            {passed ? (
              <div className="rounded-2xl p-4 border border-teal-400/20 bg-gradient-to-br from-teal-500/10 to-emerald-500/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">✨</span>
                  <span className="font-bold text-sm text-teal-200">Legend Unlocked!</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isPostTest
                    ? year === "Prep"
                      ? "You passed the Ground Level mastery test — your Legend is unlocked and Year 1 is ready next!"
                      : "You passed the post-test — your Legend is ready to collect!"
                    : passedByProgram
                    ? "You completed the 12-week program — your Legend awaits!"
                    : nextYear
                    ? `You passed this pre-test. Next stop: ${nextYear}.`
                    : "You passed the final pre-test — your Legends are ready to collect!"}
                </p>
              </div>
            ) : isPostTest ? (
              <div className="rounded-2xl p-4 border border-amber-400/20 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💪</span>
                  <span className="font-bold text-sm text-amber-200">Almost there!</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You need {POSTTEST_PASS_THRESHOLD}% to pass. Review the suggested weeks and try again when you&apos;re ready.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-4 border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">📚</span>
                    <span className="font-bold text-sm text-amber-200">Learning Path Ready</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Good effort! You scored {scorePercent}% — you&apos;ll be working through {studentLevelLabel} to build your skills.
                  </p>
                  {requiredWeeks.length > 0 ? (
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      {requiresFullPathway
                        ? "Complete the full 12-week pathway to be ready to pass this level."
                        : `You need to complete Weeks ${requiredWeeks.join(", ")} to be ready to pass this level.`}
                    </p>
                  ) : null}
                </div>
                {unlockTargets.length > 0 && (
                  <div className="rounded-2xl p-4 border border-teal-400/20 bg-gradient-to-br from-teal-500/10 to-emerald-500/5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🏅</span>
                      <span className="font-bold text-sm text-teal-200">Legends Unlocked!</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Well done — all Numbots from{" "}
                      {formatStudentLevelLabel(YEAR_SEQUENCE[0])}{" "}
                      to{" "}
                      {formatStudentLevelLabel(
                        YEAR_SEQUENCE[Math.max(0, YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]) - 1)]
                      )}{" "}
                      are now unlocked and ready to collect!
                    </p>
                  </div>
                )}
              </>
            )}

            {isPostTest && storedPosttestProfile ? (
              <>
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                  <div className="font-bold text-sm text-white mb-2">Your Growth</div>
                  {storedPretestProfile ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-300">
                        You improved from {storedPretestProfile.percentage}% to {storedPosttestProfile.percentage}%.
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl bg-slate-950/60 border border-white/10 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Pre-Test</div>
                          <div className="text-xl font-extrabold text-white mt-1">{storedPretestProfile.percentage}%</div>
                        </div>
                        <div className="rounded-xl bg-slate-950/60 border border-white/10 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Post-Test</div>
                          <div className="text-xl font-extrabold text-white mt-1">{storedPosttestProfile.percentage}%</div>
                        </div>
                        <div className="rounded-xl bg-slate-950/60 border border-white/10 p-3">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500">Growth</div>
                          <div className={`text-xl font-extrabold mt-1 ${growthPercentagePoints && growthPercentagePoints >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                            {growthPercentagePoints && growthPercentagePoints > 0 ? "+" : ""}
                            {growthPercentagePoints ?? 0}%
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                        <span>
                          Pre correct: {storedPretestProfile.score}/{storedPretestProfile.total}
                        </span>
                        <span>
                          Post correct: {storedPosttestProfile.score}/{storedPosttestProfile.total}
                        </span>
                        <span>
                          Improvement: {growthCorrectCount && growthCorrectCount > 0 ? "+" : ""}
                          {growthCorrectCount ?? 0} questions
                        </span>
                      </div>
                      {strongestGrowth ? (
                        <div className="text-xs text-slate-400">
                          Strongest growth: <span className="font-bold text-white">{strongestGrowth.skillLabel}</span>
                        </div>
                      ) : null}
                      {keepPractising ? (
                        <div className="text-xs text-slate-400">
                          Keep practising: <span className="font-bold text-white">{keepPractising.skillLabel}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      Pre-test result not found. Complete the pre-test to compare growth.
                    </p>
                  )}
                </div>

                {storedPretestProfile && skillGrowth.length > 0 ? (
                  <div className="rounded-2xl p-4 border border-white/10 bg-white/5">
                    <div className="font-bold text-sm text-white mb-3">Skill Growth</div>
                    <div className="space-y-2">
                      {skillGrowth.slice(0, 5).map((item) => (
                        <div key={item.skillId} className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="text-xs font-bold text-white">{item.skillLabel}</div>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${getStrandBadgeClass(item.strand)}`}>
                              {getStrandLabel(item.strand)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                            <span>Pre: {item.preAccuracy}%</span>
                            <span>Post: {item.postAccuracy}%</span>
                            <span className={item.improvement >= 0 ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                              {item.improvement > 0 ? "+" : ""}
                              {item.improvement}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {topStrengths.length > 0 ? (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="font-bold text-sm text-white mb-2">You did well with</div>
                    <div className="space-y-2">
                      {topStrengths.map((item) => (
                        <div key={item.skillId} className="text-xs text-slate-300">
                          {item.skillLabel}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {topWeakAreas.length > 0 ? (
                  <div className="rounded-2xl p-4 border border-amber-400/20 bg-amber-500/5">
                    <div className="font-bold text-sm text-amber-200 mb-2">Focus on these next</div>
                    <div className="space-y-2">
                      {topWeakAreas.map((item) => (
                        <div key={item.skillId} className="rounded-xl bg-slate-950/50 border border-white/10 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${getStrandBadgeClass(item.strand)}`}>
                              {getStrandLabel(item.strand)}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              Week{item.linkedWeeks.length > 1 ? "s" : ""} {item.linkedWeeks.join(", ")}
                            </span>
                          </div>
                          <div className="text-xs text-slate-200">
                            {item.skillLabel}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!passed && storedPosttestProfile.recommendedWeeks.length > 0 ? (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="font-bold text-sm text-white mb-2">Start here</div>
                    <div className="space-y-2">
                      {storedPosttestProfile.recommendedWeeks.slice(0, 3).map((week, index) => (
                        <div key={week} className="text-xs text-slate-300">
                          {index === 0 ? `Start with Week ${week}` : `Then revisit Week ${week}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {/* What's next */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-teal-400 to-emerald-500" />
                What&apos;s next?
              </div>
              <div className="space-y-2.5">
                {(isPostTest && !passed
                  ? [
                      { icon: "🔁", text: "Review any week's lessons" },
                      { icon: "📝", text: "Retry the post-test when ready" },
                      { icon: "🏅", text: `Score ${POSTTEST_PASS_THRESHOLD}%+ to unlock your Legend` },
                    ]
                  : [
                      { icon: "📖", text: "3 lessons every week" },
                      { icon: "🧪", text: "1 quiz to test your skills" },
                      { icon: "🏅", text: "Legends unlock with mastery" },
                    ]
                ).map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="text-base">{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-8 pb-8 space-y-3">
            {passed ? (
              <>
                {isPostTest || passedByProgram ? (
                  <button
                    onClick={goLegends}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-base hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-[0.98]"
                    style={{ boxShadow: "0 10px 30px -8px rgba(16, 185, 129, 0.5)" }}
                  >
                    🏅 View My Legends
                  </button>
                ) : (
                  <button
                    onClick={nextYear ? goNextPretest : goHome}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-base hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-[0.98]"
                    style={{ boxShadow: "0 10px 30px -8px rgba(16, 185, 129, 0.5)" }}
                  >
                    {nextYear ? `Start ${formatStudentLevelLabel(nextYear)} Pre-Test` : "Enter the Tower"}
                  </button>
                )}
                <button
                  onClick={goHome}
                  className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Go to Levels
                </button>
              </>
            ) : isPostTest ? (
              <>
                <button
                  onClick={goContinue}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-base hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-[0.98]"
                  style={{ boxShadow: "0 10px 30px -8px rgba(16, 185, 129, 0.5)" }}
                >
                  Continue
                </button>
                <button
                  onClick={goAssignedWeek}
                  className="w-full py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all active:scale-[0.98]"
                  style={{ boxShadow: "0 10px 30px -8px rgba(245, 158, 11, 0.5)" }}
                >
                  Practise weak areas
                </button>
                <button
                  onClick={goRetryPostTest}
                  className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Retry Post-Test
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={goProgram}
                  className="w-full py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 transition-all active:scale-[0.98]"
                  style={{ boxShadow: "0 10px 30px -8px rgba(16, 185, 129, 0.5)" }}
                >
                  {requiresFullPathway ? "🚀 Start Full Pathway" : `🚀 Start Required Pathway (Week ${assignedStartWeek})`}
                </button>
                <button
                  onClick={goHome}
                  className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Go to Levels
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend Unlock overlay */}
      {shouldShowUnlock && (
        <LegendUnlockReveal
          legend={unlockDisplayLegend}
          scorePercent={isFailedPretest ? undefined : displayPercent}
          headerTitle={isFailedPretest ? "GREAT EFFORT!" : "LEVEL COMPLETE!"}
          scoreLabel={isFailedPretest ? undefined : "You crushed it! 🔥"}
          onContinue={() => setUnlockDismissed(true)}
          onViewLegends={goLegends}
        />
      )}

      <style jsx>{`
        @keyframes floatShape {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-20px) scale(1.1); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
