"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLegendForYear } from "@/data/legends";
import { readProgress, StudentProgress, writeProgress, ACTIVE_STUDENT_KEY } from "@/data/progress";
import { supabase } from "@/lib/supabase";
import LegendUnlockReveal from "@/components/LegendUnlockReveal";
import type { AssessmentResultProfile } from "@/data/assessments/analysis";
import { ALL_PROGRAM_WEEKS, getOptionalWeeks, normalizeWeekList } from "@/lib/program-progress";
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

function getStrandBadgeClass(strand?: string) {
  switch (strand) {
    case "fractions":
      return "bg-violet-100 text-violet-700 border-violet-200";
    case "patterns":
      return "bg-sky-100 text-sky-700 border-sky-200";
    case "multiplication_division":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "addition_subtraction":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-teal-100 text-teal-700 border-teal-200";
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

  const ringColor = passed ? "hsl(var(--primary))" : "hsl(var(--accent))";

  return (
    <div className="relative flex items-center justify-center my-6">
      {/* glow behind */}
      <div
        className="absolute w-48 h-48 rounded-full blur-2xl opacity-30"
        style={{ background: ringColor }}
      />
      <svg width="200" height="200" className="relative z-10 -rotate-90">
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={stroke}
        />
        <circle
          cx="100" cy="100" r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div className="absolute z-20 text-center">
        <div className="text-5xl font-extrabold font-display" style={{ color: ringColor }}>
          {percent}%
        </div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
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
      {SHAPES.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-10"
          style={{
            width: `${s.w}px`,
            height: `${s.h}px`,
            background: i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))",
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
  const unlockTargets = useMemo(
    () => (passedByPretest ? getLegendIdsUpToYear(year) : [legend.id]),
    [passedByPretest, year, legend.id]
  );
  const shouldShowUnlock =
    passed && unlockTargets.some((id) => !(initialProgress?.unlockedLegends ?? []).includes(id)) && !unlockDismissed;
  const isFailedPretest = !isPostTest && !passedByPretest;
  const requiresFullPathway = isFailedPretest && scorePercent < 50;
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
        year,
        scorePercent: passedByProgram ? Math.max(prev?.scorePercent ?? 0, POSTTEST_PASS_THRESHOLD) : scorePercent,
        status: "PASSED",
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
      next = {
        ...prev,
        year,
        scorePercent,
        status: "ASSIGNED_PROGRAM",
        assignedWeek,
        requiredWeeks: isPostTest ? prev?.requiredWeeks ?? [] : requiredWeeks,
        optionalWeeks: isPostTest ? prev?.optionalWeeks ?? ALL_PROGRAM_WEEKS : optionalWeeks,
        unlockedLegends: prevUnlocked,
      };
    }

    writeProgress(next);

    (async () => {
      try {
        if (isPostTest || passedByProgram) return;
        const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
        if (!studentId) return;
        const { error } = await supabase
          .from("progress")
          .upsert(
            {
              student_id: studentId,
              year,
              pretest_score: scorePercent,
              status: next.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
              week: next.assignedWeek ?? null,
            },
            { onConflict: "student_id,year" }
          );
        if (error) console.warn("[Results] DB pretest save error:", error);
      } catch (e) {
        console.warn("[Results] DB pretest save failed:", e);
        }
    })();
  }, [passed, year, scorePercent, isPostTest, passedByProgram, storedPosttestProfile, storedPretestProfile, unlockTargets, requiredWeeks, optionalWeeks]);

  function goHome() { router.push("/home"); }
  const assignedStartWeek = isPostTest
    ? getAssignedReviewWeek(storedPosttestProfile) ?? 1
    : getAssignedReviewWeek(storedPretestProfile) ?? 1;

  function goProgram() {
    const qs = new URLSearchParams({ year, week: String(assignedStartWeek) }).toString();
    router.push(`/program?${qs}`);
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
    if (scorePercent >= 50) return { emoji: "🌱", title: "Good Start!", sub: "Let's build your skills with a personalised program." };
    return { emoji: "🚀", title: "Let's Level Up!", sub: "Your adventure is just beginning." };
  };
  const msg = getMessage();
  const topStrengths = storedPosttestProfile?.strengths?.slice(0, 3) ?? [];
  const topWeakAreas = storedPosttestProfile?.weakAreas?.slice(0, 3) ?? [];
  const assignedReviewWeek = getAssignedReviewWeek(storedPosttestProfile);

  function goAssignedWeek() {
    const week = assignedReviewWeek ?? 1;
    const qs = new URLSearchParams({ year, week: String(week) }).toString();
    router.push(`/program?${qs}`);
  }
  function goContinue() {
    router.push("/home");
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4 relative">
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
        <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border/50">
          {/* Top gradient band */}
          <div
            className="h-2"
            style={{
              background: passed
                ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))"
                : "linear-gradient(90deg, hsl(var(--accent)), hsl(42 95% 65%))",
            }}
          />

          <div className="p-8 pb-6 text-center">
            {/* Emoji badge */}
            <div
              className="text-5xl mb-2"
              style={{
                animation: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both",
              }}
            >
              {msg.emoji}
            </div>

            <h1 className="text-2xl font-extrabold font-display text-foreground mb-1">
              {msg.title}
            </h1>
            <p className="text-sm text-muted-foreground mb-2">{msg.sub}</p>
            <div className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
              {year} • {isPostTest ? "Post-Test" : source === "program_complete" ? "Program" : "Pre-Test"}
            </div>

            <ScoreRing percent={displayPercent} passed={passed} />

            {/* Score breakdown */}
            <div className="flex items-center justify-center gap-6 text-sm mb-6">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-foreground">{score}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-foreground">{total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: passed ? "hsl(var(--primary))" : "hsl(var(--accent))" }}>
                  {passed ? "PASS" : "GROW"}
                </div>
                <div className="text-xs text-muted-foreground">Status</div>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="px-8 pb-6 space-y-3">
            {passed ? (
              <div className="rounded-2xl bg-primary-light p-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">✨</span>
                  <span className="font-bold text-sm text-foreground">Legend Unlocked!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isPostTest
                    ? "You passed the post-test — your Legend is ready to collect!"
                    : passedByProgram
                    ? "You completed the 12-week program — your Legend awaits!"
                    : nextYear
                    ? `You passed this pre-test. Next stop: ${nextYear}.`
                    : "You passed the final pre-test — your Legends are ready to collect!"}
                </p>
              </div>
            ) : isPostTest ? (
              <div className="rounded-2xl p-4 border border-accent/30" style={{ background: "hsl(42 95% 97%)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💪</span>
                  <span className="font-bold text-sm text-foreground">Almost there!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  You need {POSTTEST_PASS_THRESHOLD}% to pass. Review the suggested weeks and try again when you&apos;re ready.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl p-4 border border-accent/30" style={{ background: "hsl(42 95% 97%)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📚</span>
                  <span className="font-bold text-sm text-foreground">Learning Path Ready</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {requiresFullPathway
                    ? "You need the full 12-week pathway for this level."
                    : "We&apos;ve crafted a personalised required pathway for this level."}
                </p>
                {requiredWeeks.length > 0 ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {requiresFullPathway
                      ? "Complete the full 12-week pathway in order to be ready to pass this level."
                      : `You need to complete Weeks ${requiredWeeks.join(", ")} to be ready to pass this level. Other weeks can be completed later for extra practice and XP.`}
                  </p>
                ) : null}
              </div>
            )}

            {isPostTest && storedPosttestProfile ? (
              <>
                <div className="rounded-2xl bg-secondary p-4">
                  <div className="font-bold text-sm text-foreground mb-2">Your Growth</div>
                  {storedPretestProfile ? (
                    <div className="space-y-3">
                      <p className="text-sm text-secondary-foreground">
                        You improved from {storedPretestProfile.percentage}% to {storedPosttestProfile.percentage}%.
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-xl bg-background/80 border border-border/60 p-3">
                          <div className="text-xs text-muted-foreground">Pre-Test</div>
                          <div className="text-xl font-extrabold text-foreground">{storedPretestProfile.percentage}%</div>
                        </div>
                        <div className="rounded-xl bg-background/80 border border-border/60 p-3">
                          <div className="text-xs text-muted-foreground">Post-Test</div>
                          <div className="text-xl font-extrabold text-foreground">{storedPosttestProfile.percentage}%</div>
                        </div>
                        <div className="rounded-xl bg-background/80 border border-border/60 p-3">
                          <div className="text-xs text-muted-foreground">Growth</div>
                          <div className={`text-xl font-extrabold ${growthPercentagePoints && growthPercentagePoints >= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                            {growthPercentagePoints && growthPercentagePoints > 0 ? "+" : ""}
                            {growthPercentagePoints ?? 0}%
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-secondary-foreground">
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
                        <div className="text-xs text-secondary-foreground">
                          Strongest growth: <span className="font-bold text-foreground">{strongestGrowth.skillLabel}</span>
                        </div>
                      ) : null}
                      {keepPractising ? (
                        <div className="text-xs text-secondary-foreground">
                          Keep practising: <span className="font-bold text-foreground">{keepPractising.skillLabel}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-secondary-foreground">
                      Pre-test result not found. Complete the pre-test to compare growth.
                    </p>
                  )}
                </div>

                {storedPretestProfile && skillGrowth.length > 0 ? (
                  <div className="rounded-2xl p-4 border border-border/60 bg-card/80">
                    <div className="font-bold text-sm text-foreground mb-3">Skill Growth</div>
                    <div className="space-y-2">
                      {skillGrowth.slice(0, 5).map((item) => (
                        <div key={item.skillId} className="rounded-xl border border-border/60 bg-background/70 p-3">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="text-xs font-bold text-foreground">{item.skillLabel}</div>
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${getStrandBadgeClass(item.strand)}`}>
                              {getStrandLabel(item.strand)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                            <span>Pre: {item.preAccuracy}%</span>
                            <span>Post: {item.postAccuracy}%</span>
                            <span className={item.improvement >= 0 ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
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
                  <div className="rounded-2xl bg-secondary p-4">
                    <div className="font-bold text-sm text-foreground mb-2">You did well with</div>
                    <div className="space-y-2">
                      {topStrengths.map((item) => (
                        <div key={item.skillId} className="text-xs text-secondary-foreground">
                          {item.skillLabel}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {topWeakAreas.length > 0 ? (
                  <div className="rounded-2xl p-4 border border-accent/30" style={{ background: "hsl(42 95% 97%)" }}>
                    <div className="font-bold text-sm text-foreground mb-2">Focus on these next</div>
                    <div className="space-y-2">
                      {topWeakAreas.map((item) => (
                        <div key={item.skillId} className="rounded-xl bg-background/70 border border-border/60 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${getStrandBadgeClass(item.strand)}`}>
                              {getStrandLabel(item.strand)}
                            </span>
                            <span className="text-[11px] font-semibold text-muted-foreground">
                              Week{item.linkedWeeks.length > 1 ? "s" : ""} {item.linkedWeeks.join(", ")}
                            </span>
                          </div>
                          <div className="text-xs text-foreground">
                            {item.skillLabel}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {!passed && storedPosttestProfile.recommendedWeeks.length > 0 ? (
                  <div className="rounded-2xl bg-secondary p-4">
                    <div className="font-bold text-sm text-foreground mb-2">Start here</div>
                    <div className="space-y-2">
                      {storedPosttestProfile.recommendedWeeks.slice(0, 3).map((week, index) => (
                        <div key={week} className="text-xs text-secondary-foreground">
                          {index === 0 ? `Start with Week ${week}` : `Then revisit Week ${week}`}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {/* What's next */}
            <div className="rounded-2xl bg-secondary p-4">
              <div className="font-bold text-sm text-foreground mb-2">What&apos;s next?</div>
              <div className="space-y-2">
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
                  <div key={item.text} className="flex items-center gap-2 text-xs text-secondary-foreground">
                    <span>{item.icon}</span>
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
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                    style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
                  >
                    🏅 View My Legends
                  </button>
                ) : (
                  <button
                    onClick={nextYear ? goNextPretest : goLegends}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                    style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
                  >
                    {nextYear ? `Start ${nextYear} Pre-Test` : "🏅 View My Legends"}
                  </button>
                )}
                <button
                  onClick={goHome}
                  className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-muted transition-all active:scale-[0.98]"
                >
                  Back to Home
                </button>
              </>
            ) : isPostTest ? (
              <>
                <button
                  onClick={goContinue}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                  style={{ boxShadow: "0 8px 24px -8px hsl(var(--primary) / 0.4)" }}
                >
                  Continue
                </button>
                <button
                  onClick={goAssignedWeek}
                  className="w-full py-4 rounded-2xl font-bold text-base hover:opacity-90 transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--accent)), hsl(42 95% 60%))",
                    boxShadow: "0 8px 24px -8px hsl(var(--accent) / 0.4)",
                  }}
                >
                  Practise weak areas
                </button>
                <button
                  onClick={goRetryPostTest}
                  className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-muted transition-all active:scale-[0.98]"
                >
                  Retry Post-Test
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={goProgram}
                  className="w-full py-4 rounded-2xl font-bold text-base text-foreground hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--accent)), hsl(42 95% 60%))",
                    boxShadow: "0 8px 24px -8px hsl(var(--accent) / 0.4)",
                  }}
                >
                  {requiresFullPathway ? "🚀 Start Full Pathway" : `🚀 Start Required Pathway (Week ${assignedStartWeek})`}
                </button>
                <button
                  onClick={goHome}
                  className="w-full py-3 rounded-2xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-muted transition-all active:scale-[0.98]"
                >
                  Back to Home
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend Unlock overlay */}
      {shouldShowUnlock && (
        <LegendUnlockReveal
          legend={legend}
          scorePercent={displayPercent}
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
