"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Gem, ShieldCheck } from "lucide-react";
import { StreakFlame } from "@/components/streak/StreakParts";
import { DEMO_STREAK, fetchLearningStreak, STREAK_SHIELD_LIMIT, type LearningStreak } from "@/lib/learning-streak";
import { DEMO_QUESTS, fetchDailyQuests, type DailyQuests } from "@/lib/xp-quests";
import { ParentQuestCard } from "@/components/quests/QuestParts";
import GemIcon, { cutForGem, GEM_RARITY } from "@/components/gems/GemIcon";
import ParentReportButton from "@/components/parent/ParentReportButton";
import SkipWeekDialog, { type SkipWeekRequest } from "@/components/parent/SkipWeekDialog";
import type { ParentChild, ParentRealm } from "@/components/parent/ParentPortal";
import { stoneForGem } from "@/lib/gem-stones";
import type { GemRarity } from "@/lib/gems";
import { parentCurriculumLessonCount, parentCurriculumWeek, parentLevelLabel } from "@/lib/parent-curriculum";
import {
  currentWeekDays,
  fetchParentChildActivity,
  fetchParentProgressReport,
  formatFeedTime,
  parentRealmPalette,
  type ParentActivity,
  type ParentProgressReport,
} from "@/lib/parent-insights";
import {
  GETTING_THERE_PERCENT,
  GOING_WELL_PERCENT,
  realmSkipState,
  realmTests,
  SCORE_BAND_LABEL,
  scoreBand,
  startOfWeek,
  summariseRealmScores,
  summariseWeek,
  type ParentWeekSkips,
  type RealmScoreSummary,
  type RealmSkipState,
  type RealmTests,
  type ScoreBand,
} from "@/lib/parent-realm-status";
import { fetchParentWeekSkips } from "@/lib/parent-week-skips";
import { realmFloorLevel } from "@/lib/realm-unlock";
import { getLiveRealmDefinitions } from "@/lib/realms/realm-registry";
import { supabase } from "@/lib/supabase";

/**
 * Parent Home for one child: where they are in each realm, what they've been
 * doing, and whether it's going well. Each realm has its own level, so there
 * is no overall "on track" verdict.
 */

export type ParentChildPreview = {
  activity?: ParentActivity;
  report?: ParentProgressReport;
  skips?: ParentWeekSkips;
};

/** Realm table columns on wide screens: realm, level & week, recent scores, tests, weeks. */
const REALM_GRID = "lg:grid-cols-[210px_150px_minmax(0,1fr)_250px_140px]";

const BAND_STYLE: Record<ScoreBand, string> = {
  "going-well": "bg-lime-100 text-lime-900",
  "getting-there": "bg-amber-100 text-amber-900",
  "needs-practice": "bg-orange-100 text-orange-900",
};

const SCORE_TEXT: Record<ScoreBand, string> = {
  "going-well": "text-[#3F7A00]",
  "getting-there": "text-amber-700",
  "needs-practice": "text-orange-700",
};

function isGemRarity(value: string): value is GemRarity {
  return value in GEM_RARITY;
}

function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

type RealmView = {
  realmId: string;
  name: string;
  image: string;
  progress: ParentRealm | null;
  placed: boolean;
  levelLabel: string | null;
  weekTitle: string | null;
  completedLessons: number;
  totalLessons: number;
  scores: RealmScoreSummary;
  tests: RealmTests;
  skip: RealmSkipState;
};

function buildRealmViews(child: ParentChild, activity: ParentActivity | null, report: ParentProgressReport | null, skips: ParentWeekSkips | null): RealmView[] {
  return [...getLiveRealmDefinitions()]
    .sort((left, right) => parentRealmPalette(left.realmId).order - parentRealmPalette(right.realmId).order)
    .map(({ realmId }): RealmView => {
      const palette = parentRealmPalette(realmId);
      const progress = child.realms.find((realm) => realm.realmId === realmId) ?? null;
      const workingLevel = progress?.workingLevel ?? "";
      const currentWeek = progress?.currentWeek ?? null;
      return {
        realmId,
        name: palette.name,
        image: palette.image,
        progress,
        placed: currentWeek !== null,
        levelLabel: progress ? parentLevelLabel(workingLevel) : null,
        weekTitle: progress && currentWeek ? parentCurriculumWeek(realmId, workingLevel, currentWeek)?.title ?? null : null,
        completedLessons: progress?.completedLessons ?? 0,
        totalLessons: progress ? parentCurriculumLessonCount(realmId, workingLevel) : 0,
        scores: summariseRealmScores(activity?.feed ?? [], realmId, workingLevel),
        tests: realmTests(report?.levels ?? [], realmId, workingLevel),
        skip: realmSkipState(skips, realmId, workingLevel, currentWeek),
      };
    });
}

export default function ParentChildOverview({
  child,
  preview,
  onChanged,
}: {
  child: ParentChild;
  preview?: ParentChildPreview;
  onChanged: () => Promise<void>;
}) {
  const [activity, setActivity] = useState<ParentActivity | null>(preview?.activity ?? null);
  const [report, setReport] = useState<ParentProgressReport | null>(preview?.report ?? null);
  const [skips, setSkips] = useState<ParentWeekSkips | null>(preview?.skips ?? null);
  const [skipRequest, setSkipRequest] = useState<SkipWeekRequest | null>(null);

  const loadInsights = useCallback(async () => {
    if (preview) return;
    // Each part degrades on its own: a failed report still shows activity and skips.
    const [activityResult, reportResult, skipsResult] = await Promise.allSettled([
      fetchParentChildActivity(child.studentId, 28),
      fetchParentProgressReport(child.studentId),
      fetchParentWeekSkips(child.studentId),
    ]);
    setActivity(activityResult.status === "fulfilled" ? activityResult.value : null);
    setReport(reportResult.status === "fulfilled" ? reportResult.value : null);
    setSkips(skipsResult.status === "fulfilled" ? skipsResult.value : null);
  }, [child.studentId, preview]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadInsights(), 0);
    return () => window.clearTimeout(timer);
  }, [loadInsights]);

  const realms = useMemo(() => buildRealmViews(child, activity, report, skips), [activity, child, report, skips]);
  const isPreview = Boolean(preview);
  const [streak, setStreak] = useState<LearningStreak | null>(preview ? DEMO_STREAK : null);
  useEffect(() => {
    if (preview) return;
    let active = true;
    fetchLearningStreak(child.studentId)
      .then((value) => { if (active) setStreak(value); })
      .catch(() => { if (active) setStreak(null); });
    return () => { active = false; };
  }, [child.studentId, preview]);
  const [quests, setQuests] = useState<DailyQuests | null>(preview ? DEMO_QUESTS : null);
  useEffect(() => {
    if (preview) return;
    let active = true;
    fetchDailyQuests(child.studentId)
      .then((value) => { if (active) setQuests(value); })
      // Before the migration is applied the card stays hidden.
      .catch(() => { if (active) setQuests(null); });
    return () => { active = false; };
  }, [child.studentId, preview]);

  async function afterSkip() {
    setSkipRequest(null);
    await Promise.all([onChanged(), loadInsights()]);
  }

  function requestSkip(realm: RealmView) {
    if (!realm.progress?.currentWeek || !realm.levelLabel) return;
    setSkipRequest({
      studentId: child.studentId,
      childName: child.firstName,
      realmId: realm.realmId,
      levelLabel: realm.levelLabel,
      week: realm.progress.currentWeek,
      weekTitle: realm.weekTitle,
      skipsLeft: realm.skip.skipsLeft,
      limit: realm.skip.limit,
    });
  }

  return (
    <div className="space-y-6">
      {!child.homeAccess ? <HomeAccessBanner child={child} onActivated={onChanged} preview={isPreview} /> : null}
      <ChildHero child={child} activity={activity} streak={streak} />
      {streak ? <ParentStreakCard firstName={child.firstName} streak={streak} /> : null}
      {quests ? <ParentQuestCard firstName={child.firstName} quests={quests} /> : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 pb-4 pt-5 sm:px-7">
          <div>
            <h3 className="font-display text-xl font-black">Where {child.firstName} is</h3>
            <p className="mt-1 text-sm text-slate-600">Each realm has its own level, set by its pre-test.</p>
          </div>
          <ParentReportButton studentId={child.studentId} previewReport={preview?.report} previewActivity={preview?.activity} />
        </div>
        <div className={`hidden gap-5 ${REALM_GRID} border-y border-slate-100 bg-[#FAFAF8] px-7 py-2.5 text-xs font-bold uppercase tracking-[0.08em] text-slate-600 lg:grid`}>
          <span>Realm</span><span>Level &amp; week</span><span>Recent scores</span><span>Tests</span><span className="text-right">Weeks</span>
        </div>
        <ul className="divide-y divide-slate-100 border-t border-slate-100 lg:border-t-0">
          {realms.map((realm) => (
            <RealmRow key={realm.realmId} realm={realm} studentId={child.studentId} preview={isPreview} onSkip={() => requestSkip(realm)} />
          ))}
        </ul>
        <p className="border-t border-slate-100 bg-[#FAFAF8] px-5 py-3 text-xs text-slate-600 sm:px-7">
          Going well = {GOING_WELL_PERCENT}% or more · Getting there = {GETTING_THERE_PERCENT}–{GOING_WELL_PERCENT - 1}% · Needs practice = under {GETTING_THERE_PERCENT}%. Weekly quizzes need {GOING_WELL_PERCENT}% to open the next week.
        </p>
      </section>

      <div className="grid items-stretch gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px]">
        <WeekChart activity={activity} />
        <RecentWork child={child} activity={activity} />
        <RewardsEarned child={child} preview={isPreview} />
      </div>

      <SkipWeekDialog request={skipRequest} preview={isPreview} onClose={() => setSkipRequest(null)} onSkipped={() => void afterSkip()} />
    </div>
  );
}

function ChildHero({ child, activity, streak }: { child: ParentChild; activity: ParentActivity | null; streak: LearningStreak | null }) {
  const week = summariseWeek(activity?.feed ?? []);
  const days = currentWeekDays(activity?.days ?? []);
  const minutes = days.reduce((total, day) => total + day.minutes, 0);
  const since = startOfWeek().getTime();
  const gemsThisWeek = (child.gems ?? child.recentAchievements).filter((gem) => Date.parse(gem.earnedAt) >= since).length;
  const heroRealm = activity?.feed[0]?.realmId ?? child.realms[0]?.realmId ?? "number";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-[#121314] text-white">
      <div className="absolute inset-y-0 right-0 w-full bg-cover bg-center opacity-25 sm:w-3/5 sm:opacity-35" style={{ backgroundImage: `url('${parentRealmPalette(heroRealm).image}')` }} aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,#121314_0%,#121314_45%,rgba(18,19,20,0.35)_100%)]" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 p-6 sm:p-8 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-xl">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-white/75">{child.yearLevel ?? "Year level not set"} · {child.schoolName ?? "Home learner"}</p>
            {child.homeAccess ? <span className="rounded-md bg-[var(--reliq-lime)] px-2.5 py-1 text-xs font-black text-[#121314]">Active — Free Access</span> : null}
          </div>
          <h2 className="mt-2 font-display text-3xl font-black sm:text-4xl">{child.firstName} this week</h2>
          <p className="mt-2 text-base leading-relaxed text-white/85 sm:text-[17px]">{weekSentence(child, activity, week)}</p>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:w-[560px]">
          <HeroStat label="Minutes" value={String(minutes)} />
          <HeroStat label="Avg score" value={week.average === null ? "—" : `${week.average}%`} />
          <HeroStat label="Streak" value={streak ? plural(streak.streak, "day") : "—"} />
          <HeroStat label="Gems" value={String(gemsThisWeek)} />
        </dl>
      </div>
    </section>
  );
}

/** "Yesterday" → "yesterday" mid-sentence; dates such as "16 Nov" stay as they are. */
function lastLearned(value: string) {
  const when = formatFeedTime(value);
  return /^[A-Z][a-z]/.test(when) ? `${when.charAt(0).toLowerCase()}${when.slice(1)}` : when;
}

function weekSentence(child: ParentChild, activity: ParentActivity | null, week: ReturnType<typeof summariseWeek>) {
  if (!activity) return child.lastActiveAt ? `Last learned ${lastLearned(child.lastActiveAt)}.` : "Learning hasn’t started yet.";
  if (week.finished === 0) {
    return child.lastActiveAt
      ? `${child.firstName} hasn't finished anything this week yet. Last learned ${lastLearned(child.lastActiveAt)}.`
      : "Learning hasn’t started yet.";
  }
  const since = startOfWeek().getTime();
  const done = activity.feed.filter((item) => Date.parse(item.completedAt) >= since);
  const parts = [
    ["lesson", "lesson"],
    ["quiz", "quiz"],
    ["assessment", "test"],
  ] as const;
  const counts = parts
    .map(([kind, word]) => ({ word, count: done.filter((item) => item.kind === kind).length }))
    .filter((entry) => entry.count > 0)
    .map((entry) => plural(entry.count, entry.word, entry.word === "quiz" ? "quizzes" : `${entry.word}s`));
  const finished = counts.length > 1 ? `${counts.slice(0, -1).join(", ")} and ${counts.at(-1)}` : counts[0];
  const sentences = [`${finished} finished${week.average === null ? "" : `, scoring ${week.average}% on average`}.`];
  if (week.strongestRealmId) sentences.push(`Strongest in ${parentRealmPalette(week.strongestRealmId).name}.`);
  if (week.needsPracticeRealmId) sentences.push(`${parentRealmPalette(week.needsPracticeRealmId).name} needs some practice.`);
  return sentences.join(" ");
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-l-2 border-[var(--reliq-lime)] pl-3">
      <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/60">{label}</dt>
      <dd className="mt-1 truncate font-display text-xl font-black sm:text-2xl">{value}</dd>
    </div>
  );
}

/** The child's learning streak, from the same server rules that pay their rewards. */
function ParentStreakCard({ firstName, streak }: { firstName: string; streak: LearningStreak }) {
  const nextIsToday = streak.nextDay !== null && streak.nextDay - streak.streak === 1 && !streak.todayDone;
  const line = streak.streak === 0
    ? `A lesson or quiz today starts ${firstName}'s streak. Day 3 earns +100 XP and day 5 earns +500 XP.`
    : nextIsToday
      ? `One more lesson today unlocks ${firstName}'s ${streak.nextDay}-day reward (+${streak.nextXp.toLocaleString()} XP).`
      : streak.todayDone
        ? `${firstName} has learned today.${streak.nextDay ? ` Next reward on day ${streak.nextDay} (+${streak.nextXp.toLocaleString()} XP).` : ""}`
        : `A lesson or quiz today keeps ${firstName}'s streak going.`;
  return (
    <section aria-label="Learning streak" className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#121314] text-[var(--reliq-lime)]">
        <StreakFlame className="h-8 w-8" />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl font-black">{plural(streak.streak, "day")} learning streak</h3>
        <p className="mt-1 text-slate-700">{line}</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
          Weekends never break a streak. {firstName} has {streak.shields} of {STREAK_SHIELD_LIMIT} streak shields saved for a missed day.
        </p>
      </div>
    </section>
  );
}

function RealmRow({ realm, studentId, preview, onSkip }: { realm: RealmView; studentId: string; preview: boolean; onSkip: () => void }) {
  const percent = realm.totalLessons > 0 ? Math.min(100, Math.round((realm.completedLessons / realm.totalLessons) * 100)) : 0;
  const href = `/parent/children/${studentId}/realm/${realm.realmId}`;
  const title = (
    <span className="flex min-w-0 items-center gap-3">
      <span className={`h-12 w-16 shrink-0 rounded-lg bg-cover bg-center ${realm.progress ? "" : "opacity-60"}`} style={{ backgroundImage: `url('${realm.image}')` }} aria-hidden="true" />
      <span className="min-w-0">
        <span className="block truncate font-black">{realm.name}</span>
        <span className="block truncate text-sm text-slate-600 lg:hidden">{levelLine(realm)}</span>
      </span>
    </span>
  );

  return (
    <li className={`grid gap-3 px-5 py-4 sm:px-7 ${REALM_GRID} lg:items-center lg:gap-5`}>
      <div className="flex items-center justify-between gap-3">
        {preview || !realm.progress ? title : <Link href={href} className="min-w-0 rounded-md hover:underline">{title}</Link>}
        {realm.scores.band ? <BandChip band={realm.scores.band} className="inline-flex lg:hidden" /> : null}
      </div>

      <div className="hidden lg:block">
        <p className="font-bold">{levelLine(realm)}</p>
        {realm.placed ? <ProgressBar percent={percent} label={`${realm.completedLessons} of ${realm.totalLessons} lessons`} /> : null}
      </div>
      {realm.placed ? <div className="lg:hidden"><ProgressBar percent={percent} label={`${realm.completedLessons} of ${realm.totalLessons} lessons`} /></div> : null}

      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
        {realm.scores.band ? <BandChip band={realm.scores.band} className="hidden lg:inline-flex" /> : null}
        <span>{scoresLine(realm)}</span>
      </div>

      <TestsCell tests={realm.tests} realm={realm} />

      <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end lg:gap-1">
        <SkipCell realm={realm} onSkip={onSkip} />
      </div>
    </li>
  );
}

function levelLine(realm: RealmView) {
  if (!realm.progress) return "Not started";
  if (!realm.placed) return `${realm.levelLabel} · Pre-test next`;
  return `${realm.levelLabel} · Week ${realm.progress.currentWeek}`;
}

function scoresLine(realm: RealmView) {
  if (!realm.progress) {
    const floor = realmFloorLevel(realm.realmId);
    return floor ? `Starts at ${parentLevelLabel(floor)} with a pre-test, which sets the level.` : "Starts with a pre-test, which sets the level.";
  }
  if (!realm.placed) return "The pre-test sets the starting week.";
  if (realm.scores.detail) return realm.scores.detail;
  return realm.completedLessons > 0 ? "No scores in the last 4 weeks" : "No lessons finished yet";
}

function BandChip({ band, className = "" }: { band: ScoreBand; className?: string }) {
  return <span className={`shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-black ${BAND_STYLE[band]} ${className}`}>{SCORE_BAND_LABEL[band]}</span>;
}

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="mt-1.5">
      <div className="h-1.5 rounded-full bg-slate-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <div className="h-1.5 rounded-full bg-[#121314]" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-1 text-xs text-slate-600">{label}</p>
    </div>
  );
}

function TestsCell({ tests, realm }: { tests: RealmTests; realm: RealmView }) {
  if (!realm.progress) return <p className="hidden text-sm text-slate-600 lg:block">Pre-test not done yet</p>;
  return (
    <div className="text-sm text-slate-700">
      <p>
        {tests.pretestScore !== null ? <>Pre-test <strong>{tests.pretestScore}%</strong></> : realm.placed ? "No pre-test" : "Pre-test not done yet"}
        <span className="lg:hidden"> · </span>
        <span className="text-slate-600 lg:block">
          {tests.posttestScore !== null ? <>Post-test <strong>{tests.posttestScore}%</strong></> : `Post-test when ${realm.levelLabel} is finished`}
        </span>
      </p>
      {tests.finishedLevel ? (
        <p className="mt-0.5 text-xs font-bold text-[#3F7A00]">
          {parentLevelLabel(tests.finishedLevel.workingLevel)}: pre {tests.finishedLevel.pretestScore}% → post {tests.finishedLevel.posttestScore}%
        </p>
      ) : null}
    </div>
  );
}

function SkipCell({ realm, onSkip }: { realm: RealmView; onSkip: () => void }) {
  if (!realm.placed) return null;
  if (!realm.skip.offered) return realm.skip.known ? <span className="text-xs text-slate-600">Weeks set by teacher</span> : null;
  const lastWeek = realm.skip.weekCount !== null && realm.progress?.currentWeek === realm.skip.weekCount;
  return (
    <>
      <button
        type="button"
        onClick={onSkip}
        disabled={!realm.skip.canSkipNow}
        className="min-h-10 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-bold hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
      >
        Skip a week
      </button>
      <span className="text-xs text-slate-600">{lastWeek ? "Last week: post-test next" : `${realm.skip.skipsLeft} of ${realm.skip.limit} skips left`}</span>
    </>
  );
}

function WeekChart({ activity }: { activity: ParentActivity | null }) {
  const days = currentWeekDays(activity?.days ?? []);
  const peak = Math.max(10, ...days.map((day) => day.minutes));
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-black">This week</h3>
        <span className="text-sm text-slate-600">Minutes learned each day</span>
      </div>
      <div className="mt-auto grid h-36 grid-cols-7 items-end gap-2">
        {days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1.5">
            {day.minutes > 0 ? <span className="text-xs font-bold">{day.minutes}</span> : null}
            <div
              className={`w-full rounded-md ${day.minutes > 0 ? (day.isToday ? "bg-[var(--reliq-lime)]" : "bg-[#121314]") : "bg-slate-200"}`}
              style={{ height: day.minutes > 0 ? Math.max(10, Math.round((day.minutes / peak) * 110)) : 4 }}
              title={`${day.minutes} minutes`}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-600">
        {days.map((day) => <span key={day.date} className={day.isToday ? "font-black text-[#121314]" : day.isUpcoming ? "text-slate-400" : ""}>{day.isToday ? "Today" : day.weekdayLabel}</span>)}
      </div>
    </section>
  );
}

const KIND_LABEL = { lesson: "lesson", quiz: "quiz", assessment: "test" } as const;

function RecentWork({ child, activity }: { child: ParentChild; activity: ParentActivity | null }) {
  const [showAll, setShowAll] = useState(false);
  const feed = activity?.feed ?? [];
  const items = feed.slice(0, showAll ? 12 : 4);
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 pb-2">
        <h3 className="font-display text-lg font-black">What {child.firstName}&apos;s been doing</h3>
        {feed.length > 4 ? <button type="button" onClick={() => setShowAll((value) => !value)} className="shrink-0 text-sm font-bold text-[#3F7A00] hover:underline">{showAll ? "Show less" : "See all"}</button> : null}
      </div>
      {items.length ? (
        <ul className="divide-y divide-slate-100">
          {items.map((item, index) => {
            const band = item.accuracy === null ? null : scoreBand(item.accuracy);
            return (
              <li key={`${item.kind}-${item.completedAt}-${index}`} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block truncate font-bold">{item.label}</span>
                  <span className="block truncate text-sm text-slate-600">{parentRealmPalette(item.realmId).name} {KIND_LABEL[item.kind]} · {formatFeedTime(item.completedAt)}</span>
                </span>
                {item.accuracy !== null ? <span className={`shrink-0 font-black ${band ? SCORE_TEXT[band] : ""}`}>{item.accuracy}%</span> : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-600">Nothing finished yet. Completed lessons, quizzes and tests appear here.</p>
      )}
    </section>
  );
}

function RewardsEarned({ child, preview }: { child: ParentChild; preview: boolean }) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-2 xl:col-span-1">
      <div className="flex items-baseline justify-between gap-3 pb-2">
        <h3 className="font-display text-lg font-black">Rewards earned</h3>
        {preview ? null : <Link href="/parent/rewards" className="shrink-0 text-sm font-bold text-[#3F7A00] hover:underline">View all</Link>}
      </div>
      {child.recentAchievements.length ? (
        <ul className="divide-y divide-slate-100">
          {child.recentAchievements.map((item) => (
            <li key={`${item.gemId ?? item.name}-${item.earnedAt}`} className="flex items-center gap-3 py-2.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-slate-50">
                {item.gemId && isGemRarity(item.rarity) ? <GemIcon rarity={item.rarity} cut={cutForGem(item.gemId, item.rarity)} stone={stoneForGem({ name: item.name })} size={38} /> : <Gem className="h-5 w-5 text-violet-600" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{item.name}</span>
                <span className="text-sm capitalize text-slate-600">{item.rarity} Gem</span>
              </span>
              <span className="text-sm text-slate-600">{new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(new Date(item.earnedAt))}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-600">No Gems earned yet.</p>
      )}
    </section>
  );
}

function HomeAccessBanner({ child, onActivated, preview }: { child: ParentChild; onActivated: () => Promise<void>; preview: boolean }) {
  const [activating, setActivating] = useState(false);
  const [failed, setFailed] = useState(false);

  async function activate() {
    setActivating(true);
    setFailed(false);
    const { error } = await supabase.rpc("activate_free_home_access", { p_student_id: child.studentId });
    if (error) setFailed(true);
    else await onActivated();
    setActivating(false);
  }

  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
      <div>
        <p className="font-black text-amber-950">Home access isn&apos;t switched on for {child.firstName}</p>
        <p className="text-sm text-amber-900">Free Home access is part of the 2026 rollout.</p>
        {failed ? <p role="alert" className="mt-1 text-sm font-bold text-red-700">Home access could not be switched on. Please try again.</p> : null}
      </div>
      <button type="button" disabled={activating || preview} onClick={activate} className="min-h-11 rounded-lg bg-[#121314] px-4 font-bold text-white disabled:opacity-50">
        {activating ? "Switching on…" : "Switch on Home access"}
      </button>
    </section>
  );
}
