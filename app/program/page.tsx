"use client";

import { getLegendForYear } from "@/data/legends";
import { LESSON_XP, QUIZ_PASS_XP } from "@/lib/xp-rules";
import ReliqRealmLogo from "@/components/brand/ReliqRealmLogo";
import Level7JourneyLinks from "@/components/lesson/Level7JourneyLinks";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Lock, LockOpen } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getCurriculumPlan, genreIdForRealm } from "@/data/programs/genres";
import { getStarpathProgram } from "@/data/starpath/program-registry";
import { DEMO_MODE } from "@/data/config";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { ACTIVE_STUDENT_KEY, isPlacementComplete, readProgress, updateProgress } from "@/data/progress";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import {
  getOptionalWeeks,
  getProgramWeeks,
  getPlayableWeeks,
  getRecommendedAssignedWeek,
  readProgramStore,
  getWeekProgress,
  hasCompletedRequiredWeeks,
  isWeekCompleteForRealm,
  isWeekPlayable,
  isFullRequiredPath,
  normalizeWeekList,
  type ProgramProgressStore,
} from "@/lib/program-progress";
import { getHomeBg, getHomeBgFilter, getVignetteStyle } from "@/lib/levelBand";
import { buildLessonId, buildLessonRoute, normalizeStudentYearLabel } from "@/lib/lesson-routing";
import { readStarpathDemoJourney, writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import { getStarpathLevelForYear, type StarpathLevelDefinition } from "@/lib/starpath-levels";
import {
  buildStarpathPostTestPageHref,
  buildStarpathProgramHref,
  buildStarpathWeeklyQuizHref,
  buildStarpathWorldHref,
} from "@/lib/starpath-routes";
import { getStarpathBackground } from "@/lib/starpath-visuals";
import { getStatisticaBackground } from "@/lib/statistica-visuals";
import { getPatternPeaksBackground } from "@/lib/pattern-peaks-visuals";
import { getChanceHollowBackground } from "@/lib/chance-hollow-visuals";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import {
  buildRealmProgramHref,
  requireSharedWeeklyProgramRealm,
} from "@/lib/realms/realm-journey";
import type { LiveRealmId } from "@/lib/realms/realm-registry";
import CanonicalStudentAvatar from "@/components/avatar/CanonicalStudentAvatar";
import {cave7Realm,cave7WeekCount} from "@/lib/cave7-config";
import {NEW_CAVE7_PROGRAMS} from "@/data/activities/cave7/curriculum";
import {SPACE7_PROGRAM} from "@/data/activities/year7Space/curriculum";
import { MEASUREMENT7_PROGRAM } from "@/data/activities/year7Measurement/curriculum";
import { NUMBER7_PROGRAM } from "@/data/activities/year7Number/curriculum";
import { number7ActivityHref, number7WeekUnlocked } from "@/lib/number7-demo";
import { LEVEL8_PROGRAMS } from "@/data/activities/level8/program";
import { isLevel8Realm, type Level8Realm } from "@/lib/level8-config";
import { level8DemoHref } from "@/lib/level8-routes";
import { LEVEL8_LIVE, level8LessonId, level8LiveHref, level8StrongholdHref } from "@/lib/level8-release";
import { LEVEL7_LIVE, level7LiveHref, level7LessonId } from "@/lib/level7-release";
import CavernWeekBackground from "@/components/world3d/CavernWeekBackground";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { WeekCard, type WeekCardState } from "@/components/program/WeekCard";
import { WeekPageNav } from "@/components/program/WeekPageNav";
import { weekPageTheme, WEEK_FILL, WEEK_GLASS, WEEK_PILL } from "@/lib/week-page-theme";
import { getRealmDefinition } from "@/lib/realms/realm-registry";
import { weeklyQuizMinimumCorrect, weeklyQuizPassed } from "@/lib/assessment-rules";
import {
  getWorld3DReturnPathForWeek,
  preserveWorld3DReturnContextForLesson,
  preserveWorld3DReturnContextForQuiz,
} from "@/lib/world3d/return-context";

import { CAVERN_WEEK_COUNT, cavernRealm, cavernWeek, cavernHref, studentCavernHref, cavernWeekHref } from "@/lib/world3d/shattered-realms";
import type { WeekPlan } from "@/data/programs/year1";

const CAVERN_PREVIEW_WEEKS: WeekPlan[] = Array.from({length:CAVERN_WEEK_COUNT}, (_,i)=>({
  id:`cavern-preview-w${i+1}`, week:i+1, topic:`Level 7 · Week ${i+1}`, curriculum:[],
  lessons:Array.from({length:3},(_,j)=>({id:`cavern-preview-w${i+1}-l${j+1}`,week:i+1,lesson:j+1,title:`Lesson ${j+1}`,focus:"Level 7 lessons are coming soon.",activityIdeas:[],curriculum:[]})),
}));

const PATHWAY_JOURNAL_KEY_PREFIX = "lul:pathway-journal";

function getStarpathWeekProgram(year: string) {
  const definition = getStarpathLevelForYear(year as StarpathLevelDefinition["yearLabel"]);
  const starpath = getStarpathProgram(definition.id);
  return {
    definition,
    weeks: starpath.weeks.map((week) => ({
      week: week.week,
      topic: week.centralConcept,
      title: week.title,
      lessons: week.lessons.map((lesson) => ({
        title: lesson.title,
        displayTitle: lesson.title,
        focus: lesson.focus,
      })),
      quiz: week.quiz,
    })),
  };
}

export default function ProgramPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f2ec] flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}>
      <ProgramPage />
    </Suspense>
  );
}

function ProgramPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  const year = normalizeStudentYearLabel(sp.get("year") ?? "Year 1");
  const realmId = requireSharedWeeklyProgramRealm(sp.get("realm_id") ?? "number");
  // Live Level 7 students always get the Level 7 week view; demo review keeps the expedition flag.
  const isLevel8 = year === "Year 8" && isLevel8Realm(realmId);
  const isExpeditionWeek = isLevel8 || year === "Year 7" && (sp.get("expedition") === "1" || (LEVEL7_LIVE && cave7WeekCount(realmId) > 0));
  const isNumber7 = isExpeditionWeek && cave7Realm(realmId);
  const isStarpathRealm = realmId === "space";
  const isStatisticsRealm = realmId === "statistics";
  const isPatternRealm = realmId === "pattern";
  const isChanceRealm = realmId === "chance";
  const starpathProgramYear = isStarpathRealm && !isExpeditionWeek ? year : null;
  const starpathProgram = useMemo(
    () => starpathProgramYear ? getStarpathWeekProgram(starpathProgramYear) : null,
    [starpathProgramYear],
  );
  const weekNum = isLevel8 ? Number(sp.get("week") ?? "1") : isExpeditionWeek ? cavernWeek(sp.get("week"),cave7Realm(realmId)?realmId:"number") : Number(sp.get("week") ?? "1");
  const week = String(weekNum);
  const program = useMemo(
    () => isLevel8 ? LEVEL8_PROGRAMS[realmId as Level8Realm] : isNumber7 ? (realmId === "pattern" || realmId === "statistics" || realmId === "chance" ? NEW_CAVE7_PROGRAMS[realmId] : realmId === "space" ? SPACE7_PROGRAM : realmId === "measurement" ? MEASUREMENT7_PROGRAM : NUMBER7_PROGRAM) : isExpeditionWeek ? CAVERN_PREVIEW_WEEKS : isStarpathRealm
      ? starpathProgram?.weeks ?? []
      : getCurriculumPlan(year, genreIdForRealm(realmId)),
    [isLevel8, isNumber7, isExpeditionWeek, isStarpathRealm, realmId, starpathProgram, year]
  );
  const curriculumYear = useMemo(() => {
    const selected = program;
    return selected.length > 0 ? year : "Year 1";
  }, [program, year]);
  const programYearIndex =
    curriculumYear === "Prep" ? 0 : parseInt(curriculumYear.replace(/\D/g, ""), 10) || 1;
  const levelNum = year === "Prep" ? 1 : parseInt(year.replace(/\D/g, ""), 10) || 1;
  const levelLabel = curriculumYear === "Prep" ? "Ground Level" : `Level ${programYearIndex}`;
  const isPrep = curriculumYear === "Prep";
  const lastWeek = Math.max(program.length, 1);
  const isMeasurementRealm = realmId === "measurement";
  /** Realm-coloured glow behind the student avatar on the week page. */
  const avatarGlow = isStarpathRealm
    ? "rgba(34,211,238,0.34)"
    : isStatisticsRealm
    ? "rgba(240,107,100,0.3)"
    : isChanceRealm
    ? "rgba(251,113,133,0.32)"
    : isMeasurementRealm
    ? "rgba(251,191,36,0.28)"
    : "rgba(94,234,212,0.30)";

  const legacyProgramMode = sp.get("legacy") === "1";
  const demoPreviewMode = useDemoPreviewMode();
  const teacherPreview = sp.get("teacher_preview") === "1" && demoPreviewMode;
  // Every live realm uses canonical student progression. Only an authorised
  // Demo Review session may bypass it.
  const previewMode = teacherPreview || demoPreviewMode;
  // A real student on a live Level 7 week page (not demo or teacher review).
  const liveLevel7 = LEVEL7_LIVE && !previewMode && isNumber7 && !isLevel8 && pathname === "/program";
  const liveLevel8 = LEVEL8_LIVE && !previewMode && isLevel8 && pathname === "/program";
  const canonicalRealmId = realmId as LiveRealmId;

  const [store, setStore] = useState<ProgramProgressStore>(() =>
    typeof window !== "undefined" ? readProgramStore() : {}
  );
  const [studentProgress, setStudentProgress] = useState(() =>
    typeof window !== "undefined" ? readProgress(canonicalRealmId) : null
  );
  const [canonicalStatus, setCanonicalStatus] = useState<"loading" | "ready" | "error">(
    DEMO_MODE || previewMode ? "ready" : "loading",
  );
  const [weekMenuOpen, setWeekMenuOpen] = useState(false);
  const weekMenuRef = useRef<HTMLDivElement | null>(null);
  const pathwayJournalStorageKey = `${PATHWAY_JOURNAL_KEY_PREFIX}:${realmId}:${curriculumYear}`;
  const [pathwayJournalOpen, setPathwayJournalOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(pathwayJournalStorageKey) === "true";
  });

  const unrestrictedMode = DEMO_MODE || previewMode;

  useEffect(() => {
    if (DEMO_MODE || previewMode) return;
    const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
    if (!studentId) {
      Promise.resolve().then(() => setCanonicalStatus("error"));
      return;
    }
    let cancelled = false;
    void restoreStudentStateFromServer(studentId, canonicalRealmId)
      .then(({ progress }) => {
        if (cancelled) return;
        setStore(readProgramStore());
        setStudentProgress(progress);
        setCanonicalStatus("ready");
      })
      .catch((error) => {
        console.error("[Program] Canonical progression bootstrap failed", error);
        if (!cancelled) setCanonicalStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [canonicalRealmId, previewMode]);

  useEffect(() => {
    if (canonicalStatus !== "ready") return;
    if (!previewMode && !isPlacementComplete(studentProgress)) {
      router.replace(isStarpathRealm ? `/pretest?year=${encodeURIComponent(year)}&realm_id=space` : "/home");
    }
  }, [canonicalStatus, isStarpathRealm, previewMode, router, studentProgress, year]);

  useEffect(() => {
    if (canonicalStatus !== "ready") return;
    if (!DEMO_MODE && !previewMode && studentProgress?.year && studentProgress.year !== year) {
      const targetWeek = Math.max(1, Math.min(lastWeek, studentProgress.assignedWeek ?? 1));
      const realmParam = canonicalRealmId === "number" ? "" : `&realm_id=${canonicalRealmId}`;
      router.replace(`/program?year=${encodeURIComponent(studentProgress.year)}&week=${targetWeek}&legacy=1${realmParam}`);
      return;
    }
  }, [canonicalRealmId, canonicalStatus, lastWeek, previewMode, router, studentProgress, year]);

  useEffect(() => {
    if (!isStarpathRealm || !starpathProgram || !previewMode) return;
    const current = readStarpathDemoJourney(starpathProgram.definition.yearLabel as RealmLevelId);
    writeStarpathDemoJourney(starpathProgram.definition.yearLabel as RealmLevelId, {
      ...current,
      currentWeek: weekNum,
    });
  }, [isStarpathRealm, previewMode, starpathProgram, weekNum]);

  useEffect(() => {
    if (!weekMenuOpen) return;
    function onDown(e: MouseEvent) {
      if (weekMenuRef.current && !weekMenuRef.current.contains(e.target as Node)) {
        setWeekMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setWeekMenuOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [weekMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(pathwayJournalStorageKey, pathwayJournalOpen ? "true" : "false");
  }, [pathwayJournalOpen, pathwayJournalStorageKey]);

  // Rebuild the browser cache from canonical rows when returning from a lesson.
  useEffect(() => {
    async function onFocus() {
      if (DEMO_MODE || previewMode) {
        setStore(readProgramStore());
        setStudentProgress(readProgress(canonicalRealmId));
        return;
      }
      const studentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY);
      if (!studentId) return;
      try {
        const restored = await restoreStudentStateFromServer(studentId, canonicalRealmId);
        setStore(readProgramStore());
        setStudentProgress(restored.progress);
      } catch (error) {
        console.error("[Program] Canonical progression refresh failed", error);
        setCanonicalStatus("error");
      }
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [canonicalRealmId, previewMode]);

  const assignedProgram =
    studentProgress?.status === "ASSIGNED_PROGRAM" && studentProgress.year === curriculumYear
      ? studentProgress
      : null;
  const requiredWeeks = useMemo(
    () => normalizeWeekList(assignedProgram?.requiredWeeks, realmId, year),
    [assignedProgram?.requiredWeeks, realmId, year]
  );
  const explicitOptionalWeeks = useMemo(
    () => normalizeWeekList(assignedProgram?.optionalWeeks, realmId, year),
    [assignedProgram?.optionalWeeks, realmId, year]
  );
  const optionalWeeks = useMemo(() => {
    return explicitOptionalWeeks.length > 0 ? explicitOptionalWeeks : getOptionalWeeks(requiredWeeks, realmId, year);
  }, [explicitOptionalWeeks, realmId, requiredWeeks, year]);
  const hasPersonalizedPlan = requiredWeeks.length > 0;
  const allRealmWeeks = useMemo(() => getProgramWeeks(realmId, year), [realmId, year]);
  const hasOpenPracticePlan =
    assignedProgram !== null &&
    requiredWeeks.length === 0 &&
    explicitOptionalWeeks.length === allRealmWeeks.length &&
    allRealmWeeks.every((week) => explicitOptionalWeeks.includes(week));
  const hasAssignedWeekAccess = hasPersonalizedPlan || hasOpenPracticePlan;
  const fullRequiredPath = useMemo(
    () => isFullRequiredPath(requiredWeeks, optionalWeeks, realmId, year),
    [optionalWeeks, realmId, requiredWeeks, year]
  );
  const requiredWeeksComplete = useMemo(
    () => hasCompletedRequiredWeeks(store, curriculumYear, requiredWeeks, realmId, studentProgress?.teacherAdvancedWeeks),
    [store, curriculumYear, requiredWeeks, realmId, studentProgress?.teacherAdvancedWeeks]
  );
  const canTakePostTestEarly = hasPersonalizedPlan && requiredWeeksComplete;
  const currentWeekIsRequired = requiredWeeks.includes(weekNum);
  const playableWeeks = useMemo(
    () => getPlayableWeeks(
      store,
      curriculumYear,
      requiredWeeks,
      optionalWeeks,
      realmId,
      studentProgress?.teacherAdvancedWeeks,
      studentProgress?.assignedWeek,
    ),
    [store, curriculumYear, requiredWeeks, optionalWeeks, realmId, studentProgress?.teacherAdvancedWeeks, studentProgress?.assignedWeek]
  );
  const weekIsPlayable = useMemo(
    () => isWeekPlayable(
      store,
      curriculumYear,
      weekNum,
      requiredWeeks,
      optionalWeeks,
      realmId,
      studentProgress?.teacherAdvancedWeeks,
      studentProgress?.assignedWeek,
    ),
    [store, curriculumYear, weekNum, requiredWeeks, optionalWeeks, realmId, studentProgress?.teacherAdvancedWeeks, studentProgress?.assignedWeek]
  );

  const prevProgress = getWeekProgress(store, year, Math.max(1, weekNum - 1), realmId);
  const weekUnlocked =
    unrestrictedMode ? true : isLevel8 && !liveLevel8 ? true : isNumber7 && !isLevel8 && !liveLevel7 ? number7WeekUnlocked(store,weekNum,realmId) : hasAssignedWeekAccess ? weekIsPlayable : weekNum === 1 ? true : isWeekCompleteForRealm(prevProgress, realmId, weekNum - 1, year);

  const lastAllowedWeek = useMemo(() => {
    if (unrestrictedMode || hasAssignedWeekAccess) return lastWeek;
    let allowed = 1;
    for (let w = 2; w <= lastWeek; w++) {
      if (isWeekCompleteForRealm(getWeekProgress(store, year, w - 1, realmId), realmId, w - 1, year)) allowed = w;
      else break;
    }
    return allowed;
  }, [hasAssignedWeekAccess, lastWeek, realmId, store, unrestrictedMode, year]);

  const progress = getWeekProgress(store, year, week, realmId);
  const previousQuizBestPercent = prevProgress.quizBestScore ?? prevProgress.quizScore ?? 0;
  const previousQuizTotal = prevProgress.quizTotal ?? 15;
  const previousQuizBestCorrect = prevProgress.quizBestCorrect
    ?? Math.round((previousQuizBestPercent / 100) * previousQuizTotal);
  const previousQuizNeedsRetry = weekNum > 1
    && prevProgress.quizCompleted
    && !weeklyQuizPassed(previousQuizBestPercent);
  const pathwayChipBase = isMeasurementRealm
    ? "border border-yellow-900/30 bg-[#2a1a06]/85 text-yellow-100"
    : isChanceRealm
    ? "border border-rose-300/25 bg-[#301b27]/85 text-rose-50"
    : "border border-teal-300/25 bg-black/35 text-teal-50";
  const optionalChipBase = isMeasurementRealm
    ? "border border-white/10 bg-[#1f1407]/75 text-amber-50/90"
    : isChanceRealm
    ? "border border-white/10 bg-[#211421]/75 text-rose-50/90"
    : "border border-white/10 bg-white/5 text-white/85";

  type ProgramItem = { type: "lesson" | "quiz" | "posttest"; n: number; title: string; focus: string; comingSoon?: boolean };
  const items: ProgramItem[] = useMemo(() => {
    if(isExpeditionWeek && !isNumber7) return [
      ...[1,2,3].map(n=>({type:"lesson" as const,n,title:`Lesson ${n}`,focus:"Level 7 lesson content is being prepared.",comingSoon:true})),
      {type:weekNum===CAVERN_WEEK_COUNT?"posttest" as const:"quiz" as const,n:1,title:weekNum===CAVERN_WEEK_COUNT?"Level 7 Post-Test":"Weekly Quiz",focus:weekNum===CAVERN_WEEK_COUNT?"Score 85% or above to unlock this realm’s Level 8 stronghold.":"The weekly quiz will open when these lessons are ready.",comingSoon:true},
    ];
    const weekPlan = program.find((w) => w.week === weekNum);
    const starpathWeek = starpathProgram?.weeks.find((candidate) => candidate.week === weekNum);
    const lessons = weekPlan?.lessons ?? [];
    const base: ProgramItem[] = [
      { type: "lesson" as const, n: 1, title: lessons[0]?.displayTitle ?? lessons[0]?.title ?? "Lesson 1", focus: lessons[0]?.focus ?? "" },
      { type: "lesson" as const, n: 2, title: lessons[1]?.displayTitle ?? lessons[1]?.title ?? "Lesson 2", focus: lessons[1]?.focus ?? "" },
      { type: "lesson" as const, n: 3, title: lessons[2]?.displayTitle ?? lessons[2]?.title ?? "Lesson 3", focus: lessons[2]?.focus ?? "" },
    ];
    if(isLevel8){base.push(weekNum===lastWeek?{type:"posttest",n:1,title:"Level 8 Post-Test",focus:"Show your mastery. Score 85% or above to recover the Core."}:{type:"quiz",n:1,title:"Weekly Quiz",focus:"15 questions: five from each lesson. Score at least 12/15 (80%) to continue."});return base;}
    if(isNumber7){base.push(weekNum===lastWeek?{type:"posttest",n:1,title:"Level 7 Post-Test",focus:"Show your Level 7 mastery in the existing post-test. Score 85% or above to unlock Level 8."}:{type:"quiz",n:1,title:"Weekly Quiz",focus:"15 questions: five from each lesson. Score at least 12/15 (80%) to continue."});return base;}
    if (isChanceRealm) {
      if (weekNum === lastWeek) {
        base.push({ type: "posttest" as const, n: 1, title: "Post-Test", focus: "Show your Level mastery and unlock your Legend" });
      } else {
        base.push({
          type: "quiz" as const,
          n: 1,
          title: "Weekly Quiz",
          focus: "15 independent questions: five from each Chance Hollow lesson.",
        });
      }
      return base;
    }
    if (weekNum !== lastWeek) {
      base.push({
        type: "quiz" as const,
        n: 1,
        title: isStarpathRealm ? `${starpathWeek?.title ?? `Week ${weekNum}`} Voyage Quiz` : "Weekly Quiz",
        focus: isStarpathRealm ? starpathWeek?.quiz?.coverage ?? "15 questions from all 3 missions" : "15 questions from all 3 lessons",
      });
    } else {
      base.push({ type: "posttest" as const, n: 1, title: "Post-Test", focus: "Score 85%+ to unlock your Legend" });
    }
    return base;
  }, [isLevel8, isNumber7, isExpeditionWeek, isChanceRealm, isStarpathRealm, lastWeek, program, starpathProgram, weekNum]);

  const currentWeekPlan = useMemo(() => {
    return program.find((w) => w.week === weekNum);
  }, [program, weekNum]);

  function openItem(item: (typeof items)[number]) {
    if((isExpeditionWeek && !isNumber7) || item.comingSoon) return;
    if (!weekUnlocked && !unrestrictedMode) return;

    if (!unrestrictedMode) {
      if (item.type === "lesson") {
        const lessonIdx = item.n - 1;
        if (lessonIdx > 0 && !progress.lessonsCompleted[lessonIdx - 1]) return;
      }
      if (item.type === "quiz") {
        if (progress.lessonsCompleted.filter(Boolean).length < 3) return;
      }
      if (item.type === "posttest") {
        if (hasPersonalizedPlan) {
          if (!requiredWeeksComplete) return;
        } else if (progress.lessonsCompleted.filter(Boolean).length < 3) {
          return;
        }
      }
    }

    if(isLevel8){
      const realm=realmId as Level8Realm,activity=item.type==='lesson'?item.n:item.type==='posttest'?'posttest':'quiz';
      if(liveLevel8){
        if(typeof activity==='number')preserveWorld3DReturnContextForLesson({realmId,level:year,week:weekNum,lessonNumber:activity,lessonId:level8LessonId(realm,weekNum,activity)});
        else if(activity==='quiz')preserveWorld3DReturnContextForQuiz({realmId,level:year,week:weekNum});
      }
      router.push(liveLevel8?level8LiveHref(realm,weekNum,activity):level8DemoHref(realm,weekNum,activity));return;
    }
    if(isNumber7){
      const activity=item.type==='lesson'?item.n:item.type==='posttest'?'posttest':'quiz';
      if(liveLevel7){
        if(typeof activity==='number')preserveWorld3DReturnContextForLesson({realmId,level:year,week:weekNum,lessonNumber:activity,lessonId:level7LessonId(realmId,weekNum,activity)});
        else if(activity==='quiz')preserveWorld3DReturnContextForQuiz({realmId,level:year,week:weekNum});
      }
      router.push(liveLevel7?level7LiveHref(realmId,weekNum,activity):number7ActivityHref(weekNum,activity,realmId));return;
    }
    const realmParam = realmId === "number" ? "" : `&realm_id=${encodeURIComponent(realmId)}`;

    if (item.type === "lesson") {
      if (isStatisticsRealm) {
        const lessonId = buildLessonId({
          yearLabel: curriculumYear,
          week: weekNum,
          lessonNumber: item.n,
          realmId,
        });
        preserveWorld3DReturnContextForLesson({
          realmId,
          level: curriculumYear,
          week: weekNum,
          lessonNumber: item.n,
          lessonId,
        });
        router.push(`/statistica/lesson/${encodeURIComponent(curriculumYear)}/${weekNum}/${item.n}${teacherPreview ? "?teacher_preview=1" : ""}`);
        return;
      }
      const lessonId = buildLessonId({
        yearLabel: curriculumYear,
        week: weekNum,
        lessonNumber: item.n,
        realmId,
      });
      preserveWorld3DReturnContextForLesson({
        realmId,
        level: curriculumYear,
        week: weekNum,
        lessonNumber: item.n,
        lessonId,
      });
      const lessonRoute = buildLessonRoute({
          yearLabel: curriculumYear,
          week: weekNum,
          lessonNumber: item.n,
          realmId,
        });
      // Path-style realm routes (Statistica, Pattern Peaks) have no query string,
      // so pick the right separator instead of always using "&".
      const previewSep = lessonRoute.includes("?") ? "&" : "?";
      router.push(`${lessonRoute}${teacherPreview ? `${previewSep}teacher_preview=1` : ""}`);
      return;
    }
    if (isStarpathRealm && starpathProgram && item.type === "quiz") {
      router.push(buildStarpathWeeklyQuizHref({ selectedLevel: starpathProgram.definition.id }, weekNum));
      return;
    }
    if (isStatisticsRealm && item.type === "quiz") {
      preserveWorld3DReturnContextForQuiz({
        realmId,
        level: curriculumYear,
        week: weekNum,
      });
      router.push(`/statistica/quiz/${encodeURIComponent(curriculumYear)}/${weekNum}${teacherPreview ? "?teacher_preview=1" : ""}`);
      return;
    }
    if (isPatternRealm && item.type === "quiz") {
      preserveWorld3DReturnContextForQuiz({ realmId, level: curriculumYear, week: weekNum });
      router.push(`/pattern-peaks/quiz/${encodeURIComponent(curriculumYear)}/${weekNum}${teacherPreview ? "?teacher_preview=1" : ""}`);
      return;
    }
    if (isChanceRealm && item.type === "quiz") {
      preserveWorld3DReturnContextForQuiz({ realmId, level: curriculumYear, week: weekNum });
      router.push(`/chance-hollow/quiz/${encodeURIComponent(curriculumYear)}/${weekNum}${teacherPreview ? "?teacher_preview=1" : ""}`);
      return;
    }
    if (isStarpathRealm && starpathProgram && item.type === "posttest") {
      router.push(buildStarpathPostTestPageHref({ selectedLevel: starpathProgram.definition.id }));
      return;
    }
    if (item.type === "posttest") {
      router.push(`/posttest?year=${encodeURIComponent(curriculumYear)}${realmParam}${teacherPreview ? "&teacher_preview=1" : ""}`);
      return;
    }
    preserveWorld3DReturnContextForQuiz({
      realmId,
      level: curriculumYear,
      week: weekNum,
    });
    router.push(`/session?year=${encodeURIComponent(curriculumYear)}&week=${week}&type=${item.type}&n=${item.n}${realmParam}${teacherPreview ? "&teacher_preview=1" : ""}`);
  }

  function goToWeek(targetWeek: number) {
    const clamped = Math.max(1, Math.min(lastWeek, targetWeek));
    if (isLevel8) {
      if (liveLevel8 && !playableWeeks.includes(clamped)) return;
      router.push(liveLevel8 ? level8LiveHref(realmId as Level8Realm, clamped, "week") : level8DemoHref(realmId as Level8Realm, clamped, "week"));
      return;
    }
    if (isExpeditionWeek) {
      const realm = cavernRealm(realmId);
      if (!realm) return;
      if (liveLevel7) {
        if (!playableWeeks.includes(clamped)) return;
        router.push(level7LiveHref(realm, clamped, "week"));
      } else {
        try { sessionStorage.setItem(`lul:shattered-realms:demo-week:${realm}`, String(clamped)); } catch { /* optional demo resume */ }
        router.push(cavernWeekHref(realm, clamped));
      }
      return;
    }
    if (!unrestrictedMode && hasAssignedWeekAccess && !playableWeeks.includes(clamped)) return;
    if (isStarpathRealm && starpathProgram) {
      const level = starpathProgram.definition.yearLabel as RealmLevelId;
      if (previewMode) {
        const current = readStarpathDemoJourney(level);
        writeStarpathDemoJourney(level, { ...current, currentWeek: clamped });
      }
      router.push(buildStarpathProgramHref({ selectedLevel: starpathProgram.definition.id }, clamped));
      return;
    }
    router.push(buildRealmProgramHref({ realmId, year, week: clamped, preview: teacherPreview }));
  }

  const lessonsDoneCount = progress.lessonsCompleted.filter(Boolean).length;
  const hasWeeklyQuizThisWeek = !((isChanceRealm || isNumber7) && weekNum === lastWeek);
  const weekComplete = isWeekCompleteForRealm(progress, realmId, weekNum, year);

  useEffect(() => {
    if (isExpeditionWeek || isStarpathRealm || !previewMode) return;
    const student = readProgress(canonicalRealmId);
    if (!student || student.status !== "ASSIGNED_PROGRAM" || student.year !== curriculumYear) return;
    const savedWeek = student.assignedWeek ?? 1;
    let nextWeek = savedWeek;
    if (hasPersonalizedPlan) {
      nextWeek = getRecommendedAssignedWeek(store, curriculumYear, savedWeek, student.requiredWeeks, realmId, student.teacherAdvancedWeeks);
    } else {
      if (weekNum > savedWeek) nextWeek = weekNum;
      if (weekComplete) nextWeek = Math.max(nextWeek, Math.min(lastWeek, weekNum + 1));
    }
    if (nextWeek !== savedWeek) updateProgress({ assignedWeek: nextWeek }, canonicalRealmId);
  }, [isExpeditionWeek, canonicalRealmId, curriculumYear, hasPersonalizedPlan, isStarpathRealm, lastWeek, previewMode, realmId, store, weekComplete, weekNum]);

  // Same rules the server pays: LESSON_XP per lesson finished, QUIZ_PASS_XP once the quiz is passed.
  const weekQuizPassed = hasWeeklyQuizThisWeek && weeklyQuizPassed(progress.quizBestScore ?? progress.quizScore ?? 0);
  const xp = lessonsDoneCount * LESSON_XP + (weekQuizPassed ? QUIZ_PASS_XP : 0);
  const totalXp = 3 * LESSON_XP + (hasWeeklyQuizThisWeek ? QUIZ_PASS_XP : 0);
  const percent = Math.round((xp / totalXp) * 100);
  const realmHomeRoute = isStarpathRealm && starpathProgram
    ? buildStarpathWorldHref({ selectedLevel: starpathProgram.definition.id })
    : isStatisticsRealm
      ? `/statistica?level=${encodeURIComponent(curriculumYear)}&week=${weekNum}${teacherPreview ? "&teacher_preview=1" : ""}`
    : isMeasurementRealm
      ? `/measurelands?level=${encodeURIComponent(curriculumYear)}`
    : isPatternRealm
      ? `/pattern-peaks?level=${encodeURIComponent(curriculumYear)}`
    : isChanceRealm
      ? `/chance-hollow?level=${encodeURIComponent(curriculumYear)}`
      : "/number-nexus";

  function goBackToMap() {
    if(isLevel8){router.push(liveLevel8?level8StrongholdHref(realmId as Level8Realm,{week:weekNum}):`/demo-review/volcano/${realmId}?week=${weekNum}`);return;}
    if(isExpeditionWeek){const realm=cavernRealm(realmId);if(realm)router.push(liveLevel7?studentCavernHref(realm,weekNum):cavernHref(realm,weekNum));return;}
    const world3DReturnPath = getWorld3DReturnPathForWeek({
      realmId,
      level: curriculumYear,
      week: weekNum,
    });
    router.push(world3DReturnPath ?? realmHomeRoute);
  }

  if (isLevel8 && !liveLevel8 && !pathname.startsWith("/demo-review/volcano/")) return <main className="p-20">Level 8 is being reviewed.</main>;
  if (!isLevel8 && !liveLevel7 && (isExpeditionWeek || (year === "Year 7" && cave7Realm(realmId))) && (!previewMode || !isExpeditionWeek || !pathname.startsWith("/demo-review/shattered-realms/"))) return <main className="min-h-screen grid place-items-center bg-slate-950 text-white"><a href="/login">Sign in to demo mode to review the Level 7 journey.</a></main>;

  if (canonicalStatus !== "ready") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f2ec] px-6 text-center">
        {canonicalStatus === "loading" ? (
          <p className="font-semibold text-gray-500">Loading saved progress...</p>
        ) : (
          <div>
            <h1 className="text-2xl font-black text-slate-900">Saved progress could not be loaded</h1>
            <p className="mt-2 text-slate-600">Return to the Tower and try entering the realm again.</p>
            <button type="button" onClick={() => router.push("/home")} className="mt-5 rounded-md bg-teal-700 px-5 py-3 font-bold text-white">
              Return to Tower
            </button>
          </div>
        )}
      </main>
    );
  }

  if (!legacyProgramMode && !isExpeditionWeek) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f6f2ec]">
        <p className="text-gray-400">Opening your adventure…</p>
      </main>
    );
  }

  const weekIsOpen = (targetWeek: number) =>
    unrestrictedMode || (hasAssignedWeekAccess ? playableWeeks.includes(targetWeek) : targetWeek <= lastAllowedWeek);

  // Where each lesson and quiz is up to; the first one ready to do is "Up next".
  const quizBestPercent = progress.quizBestScore ?? progress.quizScore ?? 0;
  const quizTotal = progress.quizTotal ?? 15;
  const quizBestCorrect = progress.quizBestCorrect ?? Math.round((quizBestPercent / 100) * quizTotal);
  const weekCards = items.map((item) => {
    const isLesson = item.type === "lesson";
    const isPostTest = item.type === "posttest";
    const comingSoon = item.comingSoon === true;
    const quizPassed = item.type === "quiz" && weeklyQuizPassed(quizBestPercent);
    const needsRetry = item.type === "quiz" && progress.quizCompleted && !quizPassed;
    const completed = isLesson ? progress.lessonsCompleted[item.n - 1] : !isPostTest && quizPassed;
    let locked = comingSoon;
    if (!unrestrictedMode) {
      if (!weekUnlocked) locked = true;
      if (isLesson && item.n > 1 && !progress.lessonsCompleted[item.n - 2]) locked = true;
      if (item.type === "quiz" && lessonsDoneCount < 3) locked = true;
      if (isPostTest) locked = hasPersonalizedPlan ? !requiredWeeksComplete : locked || lessonsDoneCount < 3;
    }
    return { item, isLesson, isPostTest, comingSoon, needsRetry, completed, locked };
  });
  const upNextIndex = weekCards.findIndex((card) => !card.locked && !card.completed && !card.needsRetry);

  const activityNoun = isStarpathRealm ? "missions" : "lessons";
  const quizName = isStarpathRealm ? "voyage quiz" : "quiz";
  const weekStatusLine = isExpeditionWeek && !isNumber7
    ? "Lessons coming soon"
    : !weekUnlocked
    ? "Week locked"
    : weekComplete
    ? "Week complete"
    : isNumber7 && weekNum === lastWeek
    ? `${lessonsDoneCount} of 3 lessons · post-test to go`
    : isChanceRealm && !hasWeeklyQuizThisWeek
    ? `${lessonsDoneCount} of 3 lessons`
    : `${lessonsDoneCount} of 3 ${activityNoun} · ${progress.quizCompleted ? `${quizName} to try again` : `${quizName} to go`}`;

  return (
    <main className="min-h-screen relative" style={weekPageTheme(realmId)}>
      {isExpeditionWeek && (
        <div className={`relative z-20 flex flex-wrap items-center justify-center gap-3 bg-slate-950 px-3 pb-3 text-center text-sm text-white ${previewMode ? "pt-16" : "pt-3"}`}>
          {previewMode && <>
            <span>{isNumber7 ? `Level ${isLevel8?8:7} demo · All ${lastWeek} weeks, lessons and quizzes are unlocked for review. Student progression still requires 80%.` : "Level 7 preview · Lessons are coming soon. Exploring does not change student progress."}</span>
            <ReadAloudBtn text={isNumber7 ? `Level ${isLevel8?8:7} demo. All ${lastWeek} weeks, lessons and quizzes are unlocked for review. Student progression still requires eighty percent.` : "Level 7 preview. Lessons are coming soon. Exploring does not change student progress."}/>
          </>}
          {isLevel8 && previewMode && <a href={`/demo-review/level8-curriculum?realm=${realmId}`} className="shrink-0 underline">Scope and sequence · download CSV</a>}
          {isNumber7 && !(isLevel8 && previewMode) && <a href={`/curriculum/${realmId}-level${isLevel8 ? 8 : 7}-scope-and-sequence.csv`} download={`reliq-${realmId}-level-${isLevel8 ? 8 : 7}-scope-and-sequence.csv`} className="shrink-0 underline">Download scope and sequence</a>}
        </div>
      )}
      {/* Demo Level 7 changes scenery only; all weekly UI below is shared. */}
      {isExpeditionWeek ? <CavernWeekBackground realmId={realmId} week={weekNum} level={isLevel8?8:7} /> : <div className="fixed inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={
            isStarpathRealm
              ? getStarpathBackground(curriculumYear as RealmLevelId)
              : isStatisticsRealm
              ? getStatisticaBackground(curriculumYear as RealmLevelId)
              : isPatternRealm
              ? getPatternPeaksBackground(curriculumYear as RealmLevelId)
              : isChanceRealm
              ? getChanceHollowBackground(curriculumYear as RealmLevelId)
              : isMeasurementRealm
              ? isPrep
                ? "/images/measurelands-home-bg.png"
                : levelNum === 1
                ? "/images/measurelands-home-bg.png"
                : levelNum === 2
                ? "/images/measurelands-home-bg-y2.png"
                : levelNum === 3
                ? "/images/measurelands-home-bg-y3.jpg"
                : levelNum === 4
                ? "/images/measurelands-home-bg-y4.jpg"
                : levelNum === 5
                ? "/images/measurelands-home-bg-y5.png"
                : levelNum === 6
                ? "/images/measurelands-home-bg-y6.png"
                : "/images/measurelands-home-bg.png"
              : getHomeBg(levelNum, isPrep)
          }
          alt=""
          className="w-full h-full object-cover"
          style={{
            filter: isStarpathRealm
              ? "brightness(0.88) contrast(1.1) saturate(1.1)"
              : isStatisticsRealm
              ? "brightness(0.82) contrast(1.08) saturate(1.12)"
              : isPatternRealm
              ? "brightness(0.82) contrast(1.1) saturate(1.1)"
              : isChanceRealm
              ? "brightness(0.82) contrast(1.12) saturate(1.14)"
              : isMeasurementRealm
              ? levelNum === 4
                ? "brightness(0.90) contrast(1.16) saturate(1.05)"
                : "brightness(0.97) contrast(1.16) saturate(1.08)"
              : isPrep
              ? "brightness(1.22) contrast(1.05) saturate(1.18)"
              : getHomeBgFilter(levelNum),
            imageRendering: isMeasurementRealm || isStarpathRealm || isStatisticsRealm || isPatternRealm || isChanceRealm ? "auto" : undefined,
            WebkitBackfaceVisibility: isMeasurementRealm || isStarpathRealm || isStatisticsRealm || isChanceRealm ? "hidden" : undefined,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: getVignetteStyle(levelNum) }}
        />
        <div className={`absolute inset-0 ${isPrep ? "bg-black/10" : "bg-black/30"}`} />
        {isPrep && !isMeasurementRealm && !isStarpathRealm && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 70%, rgba(94,234,212,0.22), transparent 65%), linear-gradient(180deg, rgba(186,230,253,0.10) 0%, transparent 40%)",
            }}
          />
        )}
        {isMeasurementRealm && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                levelNum === 4
                  ? "radial-gradient(ellipse at 50% 70%, rgba(251,191,36,0.06), transparent 62%), linear-gradient(180deg, rgba(5,8,24,0.38) 0%, transparent 45%)"
                  : "radial-gradient(ellipse at 50% 70%, rgba(251,191,36,0.14), transparent 60%), linear-gradient(180deg, rgba(5,8,24,0.30) 0%, transparent 45%)",
            }}
          />
        )}
        {isStarpathRealm && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 42%, rgba(34,211,238,0.12), transparent 34%), linear-gradient(180deg, rgba(7,10,27,0.42), rgba(30,27,75,0.14) 45%, rgba(7,10,27,0.52))",
            }}
          />
        )}
        {isStatisticsRealm && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 38%, rgba(242,188,69,0.16), transparent 36%), linear-gradient(180deg, rgba(18,49,42,0.36), rgba(35,67,55,0.12) 45%, rgba(20,35,29,0.58))",
            }}
          />
        )}
        {/* Soft top glow for premium polish (dialled back on Level 4's brighter art) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              isStarpathRealm
                ? "radial-gradient(circle at top, rgba(165,243,252,0.12), transparent 58%)"
                : isStatisticsRealm
                ? "radial-gradient(circle at top, rgba(255,244,223,0.14), transparent 58%)"
                : isChanceRealm
                ? "radial-gradient(circle at top, rgba(255,241,242,0.12), transparent 58%)"
                : isMeasurementRealm && levelNum === 4
                ? "radial-gradient(circle at top, rgba(255,255,255,0.04), transparent 60%)"
                : "radial-gradient(circle at top, rgba(255,255,255,0.10), transparent 60%)",
          }}
        />
        {isPrep && !isMeasurementRealm && !isStarpathRealm && (
          <div className="absolute right-3 sm:right-6 md:right-10 top-[32%] pointer-events-none select-none hidden md:block">
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-[18vh] h-[4vh] rounded-[50%]"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(94,234,212,0.55) 0%, rgba(45,212,191,0.25) 40%, transparent 75%)",
                filter: "blur(8px)",
                animation: "nb-pulse 3.4s ease-in-out infinite",
              }}
            />
            <div
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[34vh] h-[34vh] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(45,212,191,0.18) 0%, transparent 60%)",
                filter: "blur(20px)",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getLegendForYear("Prep", "number-nexus").images.avatar}
              alt=""
              className="relative h-[28vh] lg:h-[32vh] w-auto"
              style={{
                filter:
                  "drop-shadow(0 18px 22px rgba(0,0,0,0.55)) drop-shadow(0 0 28px rgba(94,234,212,0.35))",
                animation: "nb-float 5.2s ease-in-out infinite",
                transform: "scaleX(-1)",
              }}
            />
          </div>
        )}
      </div>}

      {/* ── Student avatar (shared component — appears on every Week page). Cave and stronghold weeks
           place it beside the progress bar instead, because their lesson cards fill the bottom edge. ── */}
      {!isExpeditionWeek && <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 z-[5] hidden md:block"
        style={{ bottom: "1.5rem" }}
      >
        <CanonicalStudentAvatar
          height={160}
          glowColor={avatarGlow}
        />
      </div>}

      {/* ── Hero header ── */}
      <div className="relative z-10">
        {/* Demo Review shows its badge across the top centre, so the bar sits below it. */}
        <div className={`relative max-w-6xl mx-auto px-6 pb-10 ${previewMode ? "pt-20" : "pt-5"}`}>
          <WeekPageNav
            realmLabel={isLevel8 ? "Stronghold" : isExpeditionWeek ? "Cavern" : getRealmDefinition(realmId).name}
            onHub={() => router.push("/world")}
            onRealm={goBackToMap}
            onProfile={() => router.push("/profile")}
            logo={<ReliqRealmLogo realmId={realmId} levelLabel={levelLabel} className="shrink-0" />}
            extraLinks={isExpeditionWeek ? <Level7JourneyLinks level={isLevel8?8:7} realm={realmId} week={weekNum} demo={previewMode} showCave={false} showHub={false} linkClassName={WEEK_PILL} /> : null}
            weekMenu={
              <div ref={weekMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setWeekMenuOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={weekMenuOpen}
                  className={`${WEEK_PILL} min-w-[150px] justify-between`}
                >
                  Week {weekNum}
                  <ChevronDown aria-hidden className={`h-[18px] w-[18px] transition-transform ${weekMenuOpen ? "rotate-180" : ""}`} />
                </button>
                {weekMenuOpen && (
                  <div
                    role="listbox"
                    aria-label="Choose a week"
                    className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-[320px] w-[250px] overflow-y-auto rounded-2xl border-[1.5px] border-white/15 bg-[rgba(6,10,14,0.92)] p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                  >
                    {Array.from({ length: lastWeek }).map((_, index) => {
                      const targetWeek = index + 1;
                      const isUnlocked = weekIsOpen(targetWeek);
                      const isCurrent = targetWeek === weekNum;
                      const isRequiredWeek = requiredWeeks.includes(targetWeek);
                      const isDoneWeek = isWeekCompleteForRealm(getWeekProgress(store, year, targetWeek, realmId), realmId, targetWeek, year);
                      const status = hasPersonalizedPlan
                        ? isCurrent ? "Current" : isRequiredWeek ? isDoneWeek ? "Required Done" : "Required" : isDoneWeek ? "Optional Done" : requiredWeeksComplete ? "Optional" : "Locked"
                        : isCurrent ? "Current" : isUnlocked ? "Open" : "Locked";
                      return (
                        <button
                          key={targetWeek}
                          type="button"
                          role="option"
                          aria-selected={isCurrent}
                          onClick={() => { setWeekMenuOpen(false); goToWeek(targetWeek); }}
                          className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-[15px] font-extrabold transition ${
                            isCurrent ? "bg-[color-mix(in_srgb,var(--wk-accent)_22%,transparent)] text-white" : isUnlocked ? "text-white/90 hover:bg-white/10" : "text-white/45 hover:bg-white/5"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isCurrent ? <Check aria-hidden className="h-4 w-4 text-[var(--wk-accent)]" strokeWidth={3} /> : isUnlocked ? <span aria-hidden className="mx-1 h-2 w-2 rounded-full bg-[var(--wk-accent)]" /> : <Lock aria-hidden className="h-4 w-4" />}
                            Week {targetWeek}
                          </span>
                          <span className={`text-[13px] font-bold ${isCurrent || isUnlocked ? "text-[var(--wk-accent)]" : "text-white/40"}`}>{status}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            }
          />

          <div className="text-center">
            <div className={`${WEEK_GLASS} inline-flex h-8 items-center gap-2 rounded-full px-3.5 text-sm font-extrabold text-white`}>
              <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--wk-accent)] shadow-[0_0_8px_var(--wk-accent)]" />
              {levelLabel} · {isStarpathRealm ? "Starpath Voyage" : isStatisticsRealm ? "Data Program" : isPatternRealm ? "Algebra Program" : isChanceRealm ? "Probability Program" : "Program"}
            </div>
            <h1 className="mt-2 text-5xl font-black leading-none tracking-tight text-white [text-shadow:0_4px_22px_rgba(0,0,0,0.6)] md:text-[64px]">Week {weekNum}</h1>
            <p className="mt-2 text-lg font-bold text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.75)] md:text-xl">
              <span className="mr-2 font-extrabold text-[var(--wk-accent)]">Focus</span>
              {currentWeekPlan?.topic ?? "Your current focus"}
            </p>
            {hasPersonalizedPlan ? (
              <p className="mt-1 text-[15px] font-bold text-white/85 [text-shadow:0_1px_6px_rgba(0,0,0,0.7)]">
                {currentWeekIsRequired ? "Required week" : canTakePostTestEarly ? "Optional practice week" : "Locked bonus week"}
              </p>
            ) : null}

            {/* Week progress */}
            <div className="relative mx-auto mt-3 max-w-[480px]">
            {isExpeditionWeek && (
              <div aria-hidden className="pointer-events-none absolute bottom-[-10px] right-full mr-4 hidden md:block">
                <CanonicalStudentAvatar height={132} glowColor={avatarGlow} />
              </div>
            )}
            <div className={`${WEEK_GLASS} flex items-center gap-4 rounded-[18px] px-[18px] py-3 text-left`}>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-3 text-[15px] font-extrabold text-white">
                  <span>{weekStatusLine}</span>
                  <span className="shrink-0 tabular-nums text-white/80">{xp} / {totalXp} XP</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--wk-from),var(--wk-accent))] transition-all duration-500" style={{ width: `${percent}%` }} />
                </div>
              </div>
              {weekComplete && weekNum < lastWeek && weekIsOpen(weekNum + 1) ? (
                <button
                  type="button"
                  onClick={() => goToWeek(weekNum + 1)}
                  className={`${WEEK_FILL} inline-flex h-[46px] shrink-0 items-center gap-1.5 rounded-[14px] px-4 text-base font-black text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] transition hover:brightness-110`}
                >
                  Week {weekNum + 1}
                  <ChevronRight aria-hidden className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            </div>


            {hasPersonalizedPlan ? (
              <div className="mt-4 mx-auto max-w-3xl">
                <div className={`${WEEK_GLASS} overflow-hidden rounded-[22px] text-left shadow-[0_14px_34px_rgba(0,0,0,0.24)]`}>
                  <button
                    type="button"
                    onClick={() => setPathwayJournalOpen((open) => !open)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                  >
                    <div className="min-w-0">
                      <div className={`text-[11px] font-mono font-black uppercase tracking-[0.22em] ${isChanceRealm ? "text-rose-100/90" : isMeasurementRealm ? "text-amber-100/90" : "text-teal-300/85"}`}>
                        Pathway Journal
                      </div>
                      <div className={`mt-1 text-xs ${isChanceRealm ? "text-rose-50/75" : isMeasurementRealm ? "text-amber-50/75" : "text-white/70"}`}>
                        {requiredWeeks.length} required week{requiredWeeks.length === 1 ? "" : "s"}
                        {optionalWeeks.length > 0 ? ` · ${optionalWeeks.length} optional` : ""}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-2 whitespace-nowrap text-[11px] font-mono font-black uppercase tracking-[0.18em] ${isChanceRealm ? "text-rose-100/85" : isMeasurementRealm ? "text-yellow-100/85" : "text-teal-100/85"}`}>
                      {pathwayJournalOpen ? "Hide" : "Show"}
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-3.5 w-3.5 transition-transform ${pathwayJournalOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>

                  {pathwayJournalOpen ? (
                    <div className={`border-t px-4 pb-4 pt-3 ${isChanceRealm ? "border-rose-400/15" : isMeasurementRealm ? "border-yellow-900/20" : "border-teal-400/15"}`}>
                      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                        <div>
                          <div className={`text-[11px] font-mono font-black uppercase tracking-[0.22em] ${isChanceRealm ? "text-rose-100/90" : isMeasurementRealm ? "text-yellow-100/90" : "text-teal-300/85"}`}>
                            Required Pathway
                          </div>
                          <div className={`mt-2 text-sm ${isChanceRealm ? "text-rose-50/85" : isMeasurementRealm ? "text-amber-50/80" : "text-teal-50/90"}`}>
                            {fullRequiredPath
                              ? "These weeks are needed to pass this level. Complete them in order."
                              : "These weeks are needed to pass this level."}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {requiredWeeks.map((requiredWeek) => {
                              const done = isWeekCompleteForRealm(getWeekProgress(store, year, requiredWeek, realmId), realmId, requiredWeek, year);
                              const unlocked = playableWeeks.includes(requiredWeek) || done || requiredWeek === weekNum;
                              return (
                                <button
                                  key={requiredWeek}
                                  type="button"
                                  onClick={() => goToWeek(requiredWeek)}
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] transition hover:-translate-y-0.5 ${pathwayChipBase}`}
                                  style={done
                                    ? {
                                        background: isMeasurementRealm
                                          ? "linear-gradient(135deg, #1d3b22 0%, #0f6b4c 100%)"
                                          : isChanceRealm
                                          ? "linear-gradient(135deg, #9f1239 0%, #fb7185 100%)"
                                          : "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
                                        boxShadow: isMeasurementRealm
                                          ? "inset 0 1px 0 rgba(167,243,208,0.18)"
                                          : isChanceRealm
                                          ? "inset 0 1px 0 rgba(255,241,242,0.35), 0 0 16px rgba(251,113,133,0.22)"
                                          : "inset 0 1px 0 rgba(110,231,183,0.45), 0 0 16px rgba(16,185,129,0.28)",
                                      }
                                    : unlocked
                                      ? undefined
                                      : {
                                          opacity: 0.72,
                                          background: isChanceRealm ? "rgba(49,18,34,0.62)" : isMeasurementRealm ? "rgba(42,26,6,0.55)" : "rgba(15,23,42,0.72)",
                                        }}
                                >
                                  <span>{done ? <Check className="h-4 w-4" /> : unlocked ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span>
                                  <span>Week {requiredWeek}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <div className={`text-[11px] font-mono font-black uppercase tracking-[0.22em] ${isMeasurementRealm ? "text-amber-200/90" : "text-amber-200/90"}`}>
                            Optional Practice
                          </div>
                          <div className={`mt-2 text-sm ${isChanceRealm ? "text-rose-50/80" : isMeasurementRealm ? "text-amber-50/80" : "text-white/80"}`}>
                            {canTakePostTestEarly
                              ? "You’ve completed your required pathway. You can take the post-test now or keep practising for extra XP."
                              : "Complete your required pathway to unlock these extra weeks for more XP, rewards, and practice."}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {optionalWeeks.length === 0 ? (
                              <div className={`rounded-full px-3 py-2 text-xs ${optionalChipBase}`}>
                                No optional weeks in this pathway.
                              </div>
                            ) : optionalWeeks.map((optionalWeek) => {
                              const done = isWeekCompleteForRealm(getWeekProgress(store, year, optionalWeek, realmId), realmId, optionalWeek, year);
                              const optionalPlayable = requiredWeeksComplete || done;
                              return (
                                <button
                                  key={optionalWeek}
                                  type="button"
                                  onClick={() => goToWeek(optionalWeek)}
                                  className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] transition hover:-translate-y-0.5 ${optionalChipBase}`}
                                  style={done
                                    ? {
                                        background: isMeasurementRealm
                                          ? "linear-gradient(135deg, #1d3b22 0%, #0f6b4c 100%)"
                                          : isChanceRealm
                                          ? "linear-gradient(135deg, rgba(251,113,133,0.34), rgba(159,18,57,0.9))"
                                          : "linear-gradient(135deg, rgba(16,185,129,0.28), rgba(6,78,59,0.9))",
                                      }
                                    : optionalPlayable
                                      ? undefined
                                      : {
                                          opacity: 0.72,
                                          background: isChanceRealm ? "linear-gradient(135deg, rgba(49,18,34,0.84), rgba(31,18,32,0.9))" : isMeasurementRealm ? "rgba(31,20,7,0.55)" : "linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.92))",
                                        }}
                                >
                                  <span>{done ? <Check className="h-4 w-4" /> : optionalPlayable ? <LockOpen className="h-4 w-4" /> : <Lock className="h-4 w-4" />}</span>
                                  <span>Week {optionalWeek}</span>
                                </button>
                              );
                            })}
                          </div>

                          {requiredWeeksComplete ? (
                            <div className={`mt-4 rounded-2xl p-4 ${isChanceRealm ? "border border-rose-300/25 bg-rose-400/10" : isMeasurementRealm ? "border border-yellow-900/30 bg-[#2a1a06]/70" : "border border-emerald-300/25 bg-emerald-400/10"}`}>
                              <div className={`text-[11px] font-mono font-black uppercase tracking-[0.18em] ${isChanceRealm ? "text-rose-100/90" : isMeasurementRealm ? "text-yellow-100/90" : "text-emerald-200"}`}>
                                Ready For Post-Test
                              </div>
                              <p className="mt-2 text-sm text-white/85">
                                All required weeks are complete. You can take the post-test now, or keep working through optional weeks first.
                              </p>
                              <button
                                type="button"
                                onClick={() => router.push(`/posttest?year=${encodeURIComponent(curriculumYear)}${realmId !== "number" ? `&realm_id=${encodeURIComponent(realmId)}` : ""}`)}
                                className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.16em] text-white"
                                style={{
                                  background: isMeasurementRealm
                                    ? "linear-gradient(135deg, #7c5a20 0%, #b8893a 55%, #d6b86c 100%)"
                                    : isChanceRealm
                                    ? "linear-gradient(135deg, #be3455, #fb7185 55%, #fbbf24)"
                                    : "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
                                  boxShadow: isMeasurementRealm
                                    ? "inset 0 1px 0 rgba(245,220,160,0.35), 0 0 16px rgba(184,137,58,0.22)"
                                    : isChanceRealm
                                    ? "inset 0 1px 0 rgba(255,241,242,0.35), 0 0 16px rgba(251,113,133,0.22)"
                                    : "inset 0 1px 0 rgba(110,231,183,0.45), 0 0 16px rgba(16,185,129,0.22)",
                                }}
                              >
                                Take Post-Test
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── The week's lessons and quiz ── */}
      <div className="relative z-10 px-4 pb-16 pt-10 md:px-6 md:pt-14">
        <div className="max-w-6xl mx-auto">
          <div className="relative grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4 lg:gap-[22px]">
            {weekCards.map((card, idx) => {
              const { item, isLesson, isPostTest, comingSoon, needsRetry, completed, locked } = card;
              const isQuiz = item.type === "quiz";
              const state: WeekCardState = comingSoon ? "soon" : locked ? "locked" : needsRetry ? "retry" : completed ? "done" : idx === upNextIndex ? "next" : "open";
              const itemXp = isLesson ? LESSON_XP : QUIZ_PASS_XP;
              const startLabel = isStarpathRealm && !isPostTest ? isQuiz ? "Start quiz" : "Start mission" : "Start";
              return (
                <WeekCard
                  key={`${item.type}-${item.n}`}
                  kicker={isPostTest ? "Post test" : isQuiz ? isStarpathRealm ? "Voyage quiz" : "Weekly quiz" : `${isStarpathRealm ? "Mission" : "Lesson"} ${item.n}`}
                  title={item.title}
                  readAloudText={comingSoon ? `${item.title}. Coming soon. ${item.focus}` : item.title}
                  description={
                    needsRetry
                      ? `Best score: ${quizBestCorrect}/${quizTotal}. You need ${weeklyQuizMinimumCorrect(quizTotal)}/${quizTotal} to unlock Week ${Math.min(lastWeek, weekNum + 1)}.`
                      : comingSoon
                      ? item.focus
                      : !weekUnlocked
                      ? hasPersonalizedPlan
                        ? "Complete your current lesson to unlock this"
                        : "Complete previous weeks to unlock"
                      : locked && isPostTest
                        ? hasPersonalizedPlan
                          ? "Complete your required pathway to unlock"
                          : "Complete all lessons to unlock"
                        : item.focus
                  }
                  state={state}
                  badgeLabel={{ soon: "Coming soon", locked: "Locked", retry: "Try again", done: isLesson ? "Done" : "Passed", next: "Up next", open: undefined }[state]}
                  xpLabel={isPostTest ? "Mastery" : completed ? `+${itemXp} XP earned` : needsRetry ? `${itemXp} XP waiting` : `${itemXp} XP`}
                  actionLabel={{ soon: "Coming soon", locked: "Locked", retry: "Try again", done: "Replay", next: startLabel, open: startLabel }[state]}
                  onOpen={() => openItem(item)}
                  connector={idx < weekCards.length - 1 ? completed ? "lit" : "dim" : undefined}
                />
              );
            })}
          </div>

          {!weekUnlocked ? (
            <div className={`${WEEK_GLASS} mt-6 rounded-[28px] p-6 text-center shadow-[0_16px_48px_rgba(0,0,0,0.24)]`}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[var(--wk-accent)]">
                <Lock aria-hidden className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-white">Week {weekNum} is locked</h2>
              <p className="mt-2 text-[15px] font-semibold text-white/85">
                {previousQuizNeedsRetry
                  ? `Pass the Week ${weekNum - 1} quiz with ${weeklyQuizMinimumCorrect(previousQuizTotal)}/${previousQuizTotal}. Your best is ${previousQuizBestCorrect}/${previousQuizTotal}.`
                  : "Complete previous weeks to unlock"}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => goToWeek(previousQuizNeedsRetry ? weekNum - 1 : lastAllowedWeek)}
                  className={`${WEEK_FILL} rounded-2xl px-5 py-3 text-base font-black text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] shadow-lg transition hover:-translate-y-0.5`}
                >
                  {previousQuizNeedsRetry ? `Return to Week ${weekNum - 1}` : `Go to Week ${lastAllowedWeek}`}
                </button>
                <button
                  type="button"
                  onClick={goBackToMap}
                  className="rounded-2xl bg-white/10 px-5 py-3 text-base font-black text-white transition hover:bg-white/15"
                >
                  Back to {isLevel8 ? "the stronghold" : isExpeditionWeek ? "the cavern" : getRealmDefinition(realmId).name}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
