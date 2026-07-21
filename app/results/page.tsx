"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getLegendForYear, normalizeLegendRealmId } from "@/data/legends";
import { readProgress, StudentProgress, writeProgress, ACTIVE_STUDENT_KEY } from "@/data/progress";
import { saveStudentProgressState } from "@/lib/student-progress-sync";
import LegendUnlockReveal from "@/components/LegendUnlockReveal";
import FogClearCinematic from "@/components/lesson/FogClearCinematic";
import { getFogProgress } from "@/lib/fog-progress";
import type { AssessmentResultProfile } from "@/data/assessments/analysis";
import { hasSeenLegendUnlockVideo } from "@/lib/legend-video-state";
import { getOptionalWeeks, getProgramWeeks, normalizeWeekList } from "@/lib/program-progress";
import { formatStudentLevelLabel } from "@/lib/studentLevelLabel";
import { getRealmTheme, type RealmTheme } from "@/lib/useRealmTheme";
import MistakeReviewPanel, { type MistakeReviewItem } from "@/components/review/MistakeReviewPanel";
import { loadAssessmentReviewItems } from "@/lib/assessment-review-state";
import { buildLessonRoute } from "@/lib/lesson-routing";
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

function getLegendIdsUpToYear(year: string, realmId: "number-nexus" | "measurelands") {
  const yearIndex = YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]);
  if (yearIndex === -1) return [getLegendForYear(year, realmId).id];
  return YEAR_SEQUENCE.slice(0, yearIndex + 1).map((label) => getLegendForYear(label, realmId).id);
}

function getLegendIdsBeforeYear(year: string, realmId: "number-nexus" | "measurelands") {
  const yearIndex = YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]);
  if (yearIndex <= 0) return [];
  return YEAR_SEQUENCE.slice(0, yearIndex).map((label) => getLegendForYear(label, realmId).id);
}

function getStrandBadgeClass(strand?: string) {
  switch (strand) {
    case "Measurement":
    case "measurement":
      return "bg-amber-500/15 text-amber-300 border-amber-400/30";
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
    case "Measurement":
    case "measurement":
      return "Measurement";
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
function ScoreRing({ percent, passed, theme }: { percent: number; passed: boolean; theme: RealmTheme }) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const radius = 80;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(percent), 200);
    return () => clearTimeout(timer);
  }, [percent]);

  const ringColor = passed ? theme.passRing : "rgb(251 191 36)";
  const ringGlow = passed ? theme.passRingGlow : "rgb(245 158 11)";

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

function FloatingShapes({ theme }: { theme: RealmTheme }) {
  const shapeColors = theme.isMeasurement
    ? ["#d6b86c", "#a78bfa"]
    : ["rgb(45 212 191)", "rgb(16 185 129)"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* ambient radial glows */}
      <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full blur-[120px]" style={{ background: theme.haloA }} />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full blur-[120px]" style={{ background: theme.haloB }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[22rem] h-[22rem] rounded-full blur-[100px]" style={{ background: theme.haloC }} />
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
            background: shapeColors[i % shapeColors.length],
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
  const realmId = sp.get("realm_id") ?? undefined;
  const progressRealmId = realmId === "measurement" ? "measurement" : "number";
  const legendRealmId = normalizeLegendRealmId(realmId);
  const theme = getRealmTheme(realmId);
  const realmParam = realmId ? `&realm_id=${encodeURIComponent(realmId)}` : "";
  const studentLevelLabel = formatStudentLevelLabel(year);
  const score = Number(sp.get("score") ?? "0");
  const total = Number(sp.get("total") ?? "0");
  const source = sp.get("source") ?? "pretest";
  const isPostTest = sp.get("posttest") === "1";
  const [assessmentReviewItems, setAssessmentReviewItems] = useState<MistakeReviewItem[]>([]);
  const [showAssessmentReview, setShowAssessmentReview] = useState(false);

  useEffect(() => {
    if (source === "program_complete") {
      setAssessmentReviewItems([]);
      return;
    }
    setAssessmentReviewItems(loadAssessmentReviewItems({
      year,
      realmId: progressRealmId,
      mode: isPostTest ? "posttest" : "pretest",
    }));
  }, [isPostTest, progressRealmId, source, year]);

  const scorePercent = useMemo(() => {
    if (!total || total <= 0) return 0;
    return Math.round((score / total) * 100);
  }, [score, total]);

  const passedByPretest = !isPostTest && scorePercent >= PRETEST_PASS_THRESHOLD;
  const passedByPosttest = isPostTest && scorePercent >= POSTTEST_PASS_THRESHOLD;
  const [showFogCinematic, setShowFogCinematic] = useState(false);
  useEffect(() => {
    if (passedByPosttest) setShowFogCinematic(true);
  }, [passedByPosttest]);
  const passedByProgram = source === "program_complete";
  const passed = passedByPretest || passedByPosttest || passedByProgram;
  const displayPercent = passedByProgram ? 100 : scorePercent;
  const nextYear = getNextYearLabel(year);
  const nextStudentLevelLabel = nextYear ? formatStudentLevelLabel(nextYear) : null;

  const legend = useMemo(() => getLegendForYear(year, legendRealmId), [legendRealmId, year]);
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
    if (passedByPretest) return getLegendIdsUpToYear(year, legendRealmId);
    if (!isPostTest) return getLegendIdsBeforeYear(year, legendRealmId); // failed pretest → unlock all prior years
    return passedByPosttest ? [legend.id] : [];
  }, [passedByPretest, passedByPosttest, isPostTest, year, legend.id, legendRealmId]);

  // For a failed pretest we unlock prior-year legends — show the highest one in the overlay
  const unlockDisplayLegend = useMemo(() => {
    if (!isPostTest && !passedByPretest && unlockTargets.length > 0) {
      const yearIndex = YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]);
      if (yearIndex > 0) return getLegendForYear(YEAR_SEQUENCE[yearIndex - 1], legendRealmId);
    }
    return legend;
  }, [isPostTest, passedByPretest, unlockTargets, year, legend, legendRealmId]);

  const shouldShowUnlock =
    unlockTargets.length > 0 &&
    unlockTargets.some((id) => !(initialProgress?.unlockedLegends ?? []).includes(id)) &&
    !hasSeenLegendUnlockVideo(unlockDisplayLegend.id) &&
    !unlockDismissed;
  const isFailedPretest = !isPostTest && !passedByPretest;
  const requiresFullPathway = isFailedPretest && scorePercent < 50;
  const diagnosticRequiredWeeks = useMemo(
    () => (!isPostTest ? normalizeWeekList(storedPretestProfile?.recommendedWeeks, progressRealmId) : []),
    [isPostTest, progressRealmId, storedPretestProfile]
  );
  // Full-pathway weeks are realm-specific (Measurelands = 8, Number = 12).
  const allProgramWeeks = useMemo(() => getProgramWeeks(progressRealmId), [progressRealmId]);
  const requiredWeeks = useMemo(() => {
    if (isPostTest) return [];
    if (!isFailedPretest) return [];
    if (requiresFullPathway || diagnosticRequiredWeeks.length === 0) return allProgramWeeks;
    return diagnosticRequiredWeeks;
  }, [allProgramWeeks, diagnosticRequiredWeeks, isFailedPretest, isPostTest, requiresFullPathway]);
  const optionalWeeks = useMemo(() => {
    if (isPostTest) return allProgramWeeks;
    if (!isFailedPretest) return allProgramWeeks;
    return requiresFullPathway ? [] : getOptionalWeeks(requiredWeeks, progressRealmId);
  }, [allProgramWeeks, isFailedPretest, isPostTest, progressRealmId, requiredWeeks, requiresFullPathway]);

  useEffect(() => {
    // Assessment pages persist their result transactionally before navigating
    // here. Query-string scores are display-only and must never mutate progress.
    if (!passedByProgram) return;
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
        optionalWeeks: allProgramWeeks,
        unlockedLegends: unlocked,
      };
    } else {
      const assignedWeek = isPostTest
        ? getLowestRecommendedWeek(storedPosttestProfile) ?? 1
        : requiredWeeks[0] ?? getLowestRecommendedWeek(storedPretestProfile) ?? 1;
      const lowerLegendUnlocks = isFailedPretest ? getLegendIdsBeforeYear(year, legendRealmId) : [];
      const unlocked = Array.from(new Set([...prevUnlocked, ...lowerLegendUnlocks]));
      next = {
        ...prev,
        year,
        scorePercent,
        status: "ASSIGNED_PROGRAM",
        placementComplete: true,
        assignedWeek,
        // A failed post-test opens the complete level for unrestricted practice.
        requiredWeeks: isPostTest ? [] : requiredWeeks,
        optionalWeeks: isPostTest ? allProgramWeeks : optionalWeeks,
        unlockedLegends: unlocked,
      };
    }

    writeProgress(next);

    (async () => {
      try {
        if (isPostTest || passedByProgram) return;
        const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
        if (!studentId) return;
        await saveStudentProgressState(studentId, year, {
          pretest_score: scorePercent,
          status: next.status === "PASSED" ? "PASSED" : "ASSIGNED_PROGRAM",
          week: next.assignedWeek ?? null,
          placement_complete: next.placementComplete ?? false,
          assigned_week: next.assignedWeek ?? null,
          required_weeks: next.requiredWeeks ?? [],
          optional_weeks: next.optionalWeeks ?? [],
          unlocked_legends: next.unlockedLegends ?? [],
        }, progressRealmId);
      } catch (e) {
        console.warn("[Results] DB pretest save failed:", e);
      }
    })();
  }, [passed, year, scorePercent, isPostTest, isFailedPretest, passedByProgram, storedPosttestProfile, storedPretestProfile, unlockTargets, requiredWeeks, optionalWeeks, allProgramWeeks, nextYear, legendRealmId, progressRealmId]);

  function goHome() { router.push(realmId === "measurement" ? "/measurelands" : "/levels"); }
  const assignedStartWeek = isPostTest
    ? getAssignedReviewWeek(storedPosttestProfile) ?? 1
    : getAssignedReviewWeek(storedPretestProfile) ?? 1;

  function goProgram() {
    router.push(realmId === "measurement" ? "/measurelands" : "/levels");
  }
  function goNextPretest() {
    if (!nextYear) {
      router.push("/legends");
      return;
    }
    router.push(`/pretest?year=${encodeURIComponent(nextYear)}${realmParam}`);
  }
  function goRetryPostTest() {
    router.push(`/posttest?year=${encodeURIComponent(year)}${realmParam}`);
  }
  function goLegends() { router.push("/legends"); }

  // Icon + message based on score (no emojis)
  const getMessage = () => {
    if (passed) return { icon: "star", title: isPostTest ? "Level Mastered" : "Pre-Test Passed", sub: isPostTest ? "You've proven your skills — collect your Legend." : "Strong result — moving to the next level." };
    if (isPostTest) return { icon: "arrow", title: "Not Quite Yet", sub: `You need ${POSTTEST_PASS_THRESHOLD}% to pass. Review the suggested weeks and try again.` };
    if (scorePercent >= 70) return { icon: "arrow", title: "Nearly There", sub: "Strong attempt. Your personalised program will close the gap." };
    return { icon: "play", title: "Program Assigned", sub: "Your learning path is ready — work through it week by week." };
  };
  const msg = getMessage();
  const topStrengths = storedPosttestProfile?.strengths?.slice(0, 3) ?? [];
  const topWeakAreas = storedPosttestProfile?.weakAreas?.slice(0, 3) ?? [];
  const assignedReviewWeek = getAssignedReviewWeek(storedPosttestProfile);

  function goAssignedWeek() {
    const week = assignedReviewWeek ?? 1;
    const qs = new URLSearchParams({ year, week: String(week) }).toString();
    router.push(`/program?${qs}&legacy=1${realmParam}`);
  }
  function goContinue() {
    router.push(realmId === "measurement" ? "/measurelands" : "/levels");
  }

  if (showAssessmentReview) {
    return (
      <MistakeReviewPanel
        mode={isPostTest ? "posttest" : "pretest"}
        realmId={realmId}
        items={assessmentReviewItems}
        onFinish={() => setShowAssessmentReview(false)}
        onPractice={isPostTest ? (item) => {
          router.push(buildLessonRoute({
            yearLabel: year,
            week: item.week ?? 1,
            lessonNumber: item.lesson ?? 1,
            realmId,
          }));
        } : undefined}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-start justify-center p-4 pt-8 relative overflow-y-auto">
      {showFogCinematic && (
        <FogClearCinematic progress={getFogProgress()} onDone={() => setShowFogCinematic(false)} />
      )}
      <FloatingShapes theme={theme} />

        <div
        className="relative z-10 w-full max-w-lg lg:max-w-4xl"
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
            {/* Icon badge — SVG, no emoji */}
            <div
              className="mx-auto mb-4 flex items-center justify-center rounded-full"
              style={{
                width: 56,
                height: 56,
                background: passed
                  ? "radial-gradient(circle, rgba(20,184,166,0.2) 0%, rgba(20,184,166,0.05) 100%)"
                  : "radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(251,191,36,0.05) 100%)",
                border: passed ? "1px solid rgba(45,212,191,0.3)" : "1px solid rgba(251,191,36,0.3)",
                animation: "bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both",
              }}
            >
              {msg.icon === "star" ? (
                <svg viewBox="0 0 24 24" width="26" height="26" fill="rgb(45 212 191)" stroke="none">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              ) : msg.icon === "arrow" ? (
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="rgb(251 191 36)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="rgb(251 191 36)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </div>

            <h1 className="text-3xl font-extrabold font-display text-white mb-1 tracking-tight">
              {msg.title}
            </h1>
            <p className="text-sm text-slate-400 mb-3">{msg.sub}</p>
            <div
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full border"
              style={{
                color: theme.accentTextSoft,
                borderColor: theme.borderRing,
                background: theme.surfaceTint,
              }}
            >
              {studentLevelLabel} • {isPostTest ? "Post-Test" : source === "program_complete" ? "Program" : "Pre-Test"}
            </div>

            <ScoreRing percent={displayPercent} passed={passed} theme={theme} />

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

          {/* Info section — tiles into 2 columns on iPad landscape to cut height */}
          <div className="px-8 pb-6 pt-4 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 lg:items-start [&>*]:lg:min-w-0">
            {passed ? (
              <div
                className="rounded-2xl p-4 border"
                style={{
                  borderColor: theme.borderRing,
                  background: theme.isMeasurement
                    ? "linear-gradient(135deg, rgba(214,184,108,0.12), rgba(167,139,250,0.06))"
                    : "linear-gradient(135deg, rgba(20,184,166,0.10), rgba(16,185,129,0.05))",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill={theme.accentText} stroke="none">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                  </svg>
                  <span className="font-bold text-sm" style={{ color: theme.accentText }}>Legend Unlocked</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {isPostTest
                    ? year === "Prep"
                      ? "You passed the Ground Level mastery test — your Legend is ready to collect and Level 1 is now open."
                      : "Post-test passed — your Legend is ready to collect."
                    : passedByProgram
                    ? "You completed the 12-week program — your Legend is waiting."
                    : nextYear
                    ? `Pre-test passed. Up next: ${nextStudentLevelLabel}.`
                    : "Final pre-test passed — all Legends are ready to collect."}
                </p>
              </div>
            ) : isPostTest ? (
              <div className="rounded-2xl p-4 border border-amber-400/20 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-1.5">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgb(252 211 77)" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  <span className="font-bold text-sm text-amber-200">Keep Going</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {POSTTEST_PASS_THRESHOLD}% required to pass. Revisit the recommended weeks below and retry when ready.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl p-4 border border-amber-400/20 bg-gradient-to-br from-amber-500/10 to-orange-500/5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="rgb(252 211 77)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                    </svg>
                    <span className="font-bold text-sm text-amber-200">Learning Path Ready</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    You scored {scorePercent}% — your personalised program for {studentLevelLabel} is set up and ready to begin.
                  </p>
                  {requiredWeeks.length > 0 ? (
                    <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                      {requiresFullPathway
                        ? "Complete the full 12-week pathway to be ready to pass this level."
                        : `Focus on Weeks ${requiredWeeks.join(", ")} to reach mastery.`}
                    </p>
                  ) : null}
                </div>
                {unlockTargets.length > 0 && (
                  <div
                    className="rounded-2xl p-4 border"
                    style={{
                      borderColor: theme.borderRing,
                      background: theme.isMeasurement
                        ? "linear-gradient(135deg, rgba(214,184,108,0.12), rgba(167,139,250,0.06))"
                        : "linear-gradient(135deg, rgba(20,184,166,0.10), rgba(16,185,129,0.05))",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <svg viewBox="0 0 24 24" width="14" height="14" fill={theme.accentText} stroke="none">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                      <span className="font-bold text-sm" style={{ color: theme.accentText }}>Legends Unlocked</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      All Numbots from{" "}
                      {formatStudentLevelLabel(YEAR_SEQUENCE[0])}{" "}
                      to{" "}
                      {formatStudentLevelLabel(
                        YEAR_SEQUENCE[Math.max(0, YEAR_SEQUENCE.indexOf(year as (typeof YEAR_SEQUENCE)[number]) - 1)]
                      )}{" "}
                      are now unlocked and ready to collect.
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
                <span
                  className="inline-block w-1 h-4 rounded-full"
                  style={{
                    background: theme.isMeasurement
                      ? "linear-gradient(180deg, #e8c97e, #b8893a)"
                      : "linear-gradient(180deg, #2dd4bf, #10b981)",
                  }}
                />
                What&apos;s next?
              </div>
              <div className="space-y-2.5">
                {(isPostTest && !passed
                  ? [
                      "Review any week's lessons",
                      "Retry the post-test when ready",
                      `Score ${POSTTEST_PASS_THRESHOLD}%+ to unlock your Legend`,
                    ]
                  : [
                      "3 lessons every week",
                      "1 quiz to test your skills",
                      "Legends unlock with mastery",
                    ]
                ).map((text) => (
                  <div key={text} className="flex items-center gap-3 text-xs text-slate-300">
                    <span
                      className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                      style={{ background: theme.isMeasurement ? "rgba(214,184,108,0.65)" : "rgba(20,184,166,0.6)" }}
                    />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-8 pb-8 space-y-3 lg:mx-auto lg:w-full lg:max-w-md">
            {assessmentReviewItems.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowAssessmentReview(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Incorrect Questions
              </button>
            ) : null}
            {passed ? (
              <>
                {isPostTest || passedByProgram ? (
                  <button
                    onClick={goLegends}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98]"
                    style={{ background: theme.ctaGradientCss, boxShadow: theme.ctaShadow }}
                  >
                    View My Legends
                  </button>
                ) : (
                  <button
                    onClick={nextYear ? goNextPretest : goHome}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98]"
                    style={{ background: theme.ctaGradientCss, boxShadow: theme.ctaShadow }}
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
                  className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.98]"
                  style={{ background: theme.ctaGradientCss, boxShadow: theme.ctaShadow }}
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
                  className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.98]"
                  style={{ background: theme.ctaGradientCss, boxShadow: theme.ctaShadow }}
                >
                  {requiresFullPathway ? "Start Full Pathway" : `Start Required Pathway — Week ${assignedStartWeek}`}
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
          scoreLabel={isFailedPretest ? undefined : "Well done"}
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
