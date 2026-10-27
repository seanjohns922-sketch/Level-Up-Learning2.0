"use client";

import Image from "next/image";
import { Check, Lock, Play, X } from "lucide-react";
import GemIcon, { cutForGem, emblemForGem } from "@/components/gems/GemIcon";
import { getLegendForYear, type LegendRealmId } from "@/data/legends";
import { RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";
import { curriculumWeekTitle } from "@/lib/curriculum-week-title";
import { stoneForGem } from "@/lib/gem-stones";
import type { GemDefinition } from "@/lib/gems";
import type { ProfileRealmWeek } from "@/lib/profile-realm-summary";
import type { LiveRealmId } from "@/lib/realms/realm-registry";
import { STRONGHOLD_REALMS } from "@/lib/world3d/number-stronghold";

/** A learner's own view of one realm: every week of their level, the level's
 *  tests, and the reward at the end (a RELIQ card up to Level 6, the realm's
 *  Core at Levels 7 and 8). Quiz results show as stars, never a percentage. */

export type RealmPanelData = {
  id: LiveRealmId;
  name: string;
  color: string;
  route: string;
  year: string;
  levelLabel: string;
  weeksCompleted: number;
  totalWeeks: number;
  weeks: ProfileRealmWeek[];
  pretest: { completedAt: string | null } | null;
  posttest: { completedAt: string; passed: boolean } | null;
  levelPassed: boolean;
};

const LEGEND_REALM: Record<LiveRealmId, LegendRealmId> = {
  number: "number-nexus",
  measurement: "measurelands",
  space: "starpath",
  pattern: "pattern-peaks",
  statistics: "statistica",
  chance: "chance-hollow",
};

const CARD_LEVELS = new Set(["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"]);

/** Three stars is a pass (80%+). Fewer stars mean "almost, try again". */
export function quizStars(best: number | null) {
  if (best == null || best <= 0) return 0;
  if (best >= 80) return 3;
  if (best >= 60) return 2;
  return 1;
}

function shortDate(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Melbourne" });
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5 text-base leading-none" aria-label={`${count} of 3 stars`}>
      {[0, 1, 2].map((index) => <span key={index} className={index < count ? "text-[#ffd76a]" : "text-white/20"}>★</span>)}
    </span>
  );
}

export default function RealmProgressPanel({ realm, gems, onContinue, onClose }: {
  realm: RealmPanelData;
  gems: GemDefinition[];
  onContinue: () => void;
  onClose: () => void;
}) {
  const allDone = realm.totalWeeks > 0 && realm.weeksCompleted >= realm.totalWeeks;
  const currentWeek = realm.weeks.find((week) => !week.done)?.week ?? null;
  const currentTitle = currentWeek ? curriculumWeekTitle(realm.id, realm.year, currentWeek) : null;
  const core = STRONGHOLD_REALMS[realm.id]?.core ?? "Core";
  const legend = CARD_LEVELS.has(realm.year) ? getLegendForYear(realm.year, LEGEND_REALM[realm.id]) : null;
  const posttestLabel = realm.posttest?.passed || realm.levelPassed
    ? { icon: "done" as const, text: `Passed${realm.posttest ? ` · ${shortDate(realm.posttest.completedAt)}` : ""}` }
    : realm.posttest
      ? { icon: "try" as const, text: "Almost — practise and try again (85%+)" }
      : allDone
        ? { icon: "try" as const, text: "Ready when you are · aim for 85%+" }
        : { icon: "lock" as const, text: `Opens after Week ${realm.totalWeeks}` };

  return (
    <section
      className="col-span-full rounded-3xl border-2 bg-[#1d1830] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-6"
      style={{ borderColor: realm.color }}
      aria-label={`${realm.name} progress`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid h-[52px] w-[52px] flex-shrink-0 place-items-center rounded-2xl bg-white/[0.07]" aria-hidden="true">
            <svg viewBox="236 0 44 79" className="h-8 w-auto"><path fill={realm.color} d={RELIQ_Q_PATH} /></svg>
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-black sm:text-[22px]">{realm.name} · {realm.levelLabel}</h2>
            <p className="font-bold text-[#d8d2e4]">
              {realm.weeksCompleted} of {realm.totalWeeks} weeks done
              {currentWeek ? ` · Week ${currentWeek}${currentTitle ? `: ${currentTitle}` : ""}` : " · every week finished!"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onContinue} className="h-12 rounded-full px-6 font-display text-sm font-black tracking-[0.04em] text-[#1a1206] hover:brightness-110" style={{ background: realm.color }}>
            {currentWeek ? `CONTINUE WEEK ${currentWeek} →` : `OPEN ${realm.name.toUpperCase()} →`}
          </button>
          <button type="button" onClick={onClose} aria-label={`Close ${realm.name} progress`} className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.08] hover:bg-white/15">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_330px]">
        <div>
          <p className="mb-3 font-display text-[11px] font-black uppercase tracking-[0.14em] text-[#cbb6e6]">My weeks</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
            {realm.weeks.map((week) => {
              const state = week.done ? "done" : week.week === currentWeek ? "now" : "later";
              const title = curriculumWeekTitle(realm.id, realm.year, week.week);
              const stars = quizStars(week.quizBest);
              return (
                <div
                  key={week.week}
                  className={`flex min-h-[132px] flex-col gap-1.5 rounded-2xl border p-3 ${state === "later" ? "border-white/[0.08] bg-white/[0.04] opacity-50" : "bg-white/[0.06]"}`}
                  style={state === "done" ? { borderColor: `${realm.color}59`, background: `${realm.color}1f` } : state === "now" ? { borderColor: realm.color, borderWidth: 2 } : undefined}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-display text-[13px] font-black">Week {week.week}</span>
                    <span className="flex items-center gap-1 font-display text-[11px] font-black tracking-[0.04em]" style={{ color: state === "later" ? "#a99fba" : realm.color }}>
                      {state === "done" ? <><Check className="h-3 w-3" aria-hidden="true" />Done</> : state === "now" ? <><Play className="h-3 w-3" aria-hidden="true" />Up to here</> : "Coming up"}
                    </span>
                  </div>
                  <p className="flex-1 text-[15px] font-bold leading-tight">{title ?? `Week ${week.week}`}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex gap-1" aria-label={`${week.lessonsDone} of 3 lessons done`}>
                      {[0, 1, 2].map((index) => <span key={index} className="h-2.5 w-2.5 rounded-full" style={{ background: index < week.lessonsDone ? realm.color : "rgba(255,255,255,0.15)" }} />)}
                    </span>
                    {stars > 0 ? <Stars count={stars} /> : state === "now" ? <span className="text-xs font-extrabold text-[#cfc7dc]">{week.lessonsDone >= 3 ? "Quiz next" : "Lessons next"}</span> : state === "later" ? <Lock className="h-3.5 w-3.5 text-[#a99fba]" aria-hidden="true" /> : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] font-bold text-[#bdb3cc]">
            <span><span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-[-1px]" style={{ background: realm.color }} />Lesson done</span>
            <span><span className="text-[#ffd76a]">★★★</span> Quiz passed (80%+)</span>
            <span><span className="text-[#ffd76a]">★★</span><span className="text-white/25">★</span> Almost — try again</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0812]/45 p-4">
            <p className="mb-2 font-display text-[11px] font-black uppercase tracking-[0.14em] text-[#cbb6e6]">Level tests</p>
            <div className="flex items-center gap-3 py-1.5">
              <span className={`grid h-8 w-8 place-items-center rounded-[10px] ${realm.pretest ? "bg-[#22c55e]" : "bg-white/[0.08]"}`} aria-hidden="true">{realm.pretest ? <Check className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />}</span>
              <div>
                <p className="font-display text-sm font-black">Pre-test</p>
                <p className="text-[13px] font-semibold text-[#cfc7dc]">{realm.pretest ? `Done${realm.pretest.completedAt ? ` · ${shortDate(realm.pretest.completedAt)}` : ""}` : "Not taken"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-1.5">
              <span className={`grid h-8 w-8 place-items-center rounded-[10px] ${posttestLabel.icon === "done" ? "bg-[#22c55e]" : "bg-white/[0.08]"}`} aria-hidden="true">{posttestLabel.icon === "done" ? <Check className="h-4 w-4" /> : posttestLabel.icon === "lock" ? <Lock className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}</span>
              <div>
                <p className="font-display text-sm font-black">End-of-level test</p>
                <p className="text-[13px] font-semibold text-[#cfc7dc]">{posttestLabel.text}</p>
              </div>
            </div>
          </div>

          {legend ? (
            <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-[#0a0812]/45 p-4">
              <Image src={legend.images.cardFront} alt="" width={72} height={100} className={`h-auto w-[72px] rounded-lg shadow-[0_6px_16px_rgba(0,0,0,0.4)] ${realm.levelPassed ? "" : "brightness-[0.7] grayscale-[0.85]"}`} />
              <div className="min-w-0">
                <p className="mb-1 font-display text-[11px] font-black uppercase tracking-[0.14em] text-[#cbb6e6]">{realm.levelPassed ? "RELIQ earned" : "Your next RELIQ"}</p>
                <p className="font-display text-[15px] font-black">{legend.name}</p>
                <p className="text-[13px] font-semibold text-[#cfc7dc]">{realm.levelPassed ? "It's in your Hall of Legends." : `Finish ${realm.levelLabel} to add this card to your Hall of Legends.`}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-[#0a0812]/45 p-4">
              <span className="grid h-[72px] w-[72px] flex-shrink-0 place-items-center rounded-2xl" style={{ background: `radial-gradient(circle, ${realm.color}${realm.year === "Year 8" && realm.levelPassed ? "cc" : "40"}, transparent 70%)` }} aria-hidden="true">
                <svg viewBox="236 0 44 79" className="h-10 w-auto"><path fill={realm.year === "Year 8" && realm.levelPassed ? realm.color : "#6b5a86"} d={RELIQ_Q_PATH} /></svg>
              </span>
              <div className="min-w-0">
                <p className="mb-1 font-display text-[11px] font-black uppercase tracking-[0.14em] text-[#cbb6e6]">{realm.year === "Year 8" && realm.levelPassed ? "Core restored" : `The ${core}`}</p>
                <p className="text-[13px] font-semibold text-[#cfc7dc]">
                  {realm.year === "Year 8"
                    ? realm.levelPassed
                      ? `You freed the ${core}. The Fog is clearing!`
                      : `Finish your Level 8 weeks, then score 85%+ on the final test to free the ${core}.`
                    : `The ${core} is still captive. Finish Level 7 to reach the stronghold and free it at Level 8.`}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0812]/45 p-4">
            <p className="mb-2 font-display text-[11px] font-black uppercase tracking-[0.14em] text-[#cbb6e6]">{realm.name} gems · {gems.length}</p>
            {gems.length ? (
              <div className="flex flex-wrap gap-2">
                {gems.map((gem) => (
                  <span key={gem.id} title={gem.name}>
                    <GemIcon rarity={gem.rarity} cut={cutForGem(gem.id, gem.rarity)} emblem={emblemForGem(gem.realm_id, gem.milestone_type)} stone={stoneForGem(gem)} size={44} />
                  </span>
                ))}
              </div>
            ) : <p className="text-[13px] font-semibold text-[#cfc7dc]">Finish weeks and levels here to earn {realm.name} gems.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
