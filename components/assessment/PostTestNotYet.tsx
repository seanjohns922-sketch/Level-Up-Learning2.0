"use client";

import { Check, Map as MapIcon, Play } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { getRealmLessonArtwork, type RealmLessonThemeId } from "@/components/lesson/RealmLessonHome";
import { ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { weekPageTheme, WEEK_FILL } from "@/lib/week-page-theme";

const POSTTEST_PASS_THRESHOLD = ASSESSMENT_THRESHOLDS.posttestPassPercent;

export type PostTestPlanWeek = { week: number; skill?: string };
export type PostTestGrowth = { from: number; to: number; strongest?: string; keepPractising?: string };

/** Correct answers needed to reach the post-test pass mark. */
export function postTestCorrectNeeded(total: number) {
  return Math.ceil((total * POSTTEST_PASS_THRESHOLD) / 100);
}

/** The headline and encouragement for a post-test under the pass mark. */
export function postTestNotYetMessage(score: number, total: number, percent: number) {
  const needed = postTestCorrectNeeded(total);
  const more = Math.max(1, needed - score);
  return {
    title: percent >= 70 ? "So close!" : "Not quite yet",
    needed,
    more,
    sub: `You need ${needed} out of ${total} to pass. That's just ${more} more correct answer${more === 1 ? "" : "s"}.`,
  };
}

const RING = 250;

/**
 * The post-test result when a learner is under the pass mark, in every realm:
 * how close they are, a numbered plan of the weeks to revisit, then the retry,
 * and a clear note that after the plan they can replay any week and retry any time.
 */
export function PostTestNotYet({
  realmId,
  realmName,
  levelLabel,
  levelNumber,
  year,
  score,
  total,
  percent,
  planWeeks,
  strengths,
  growth,
  speech,
  speechKey,
  onStartWeek,
  onPractise,
  onReview,
  onRetry,
  onBack,
  backLabel = "Back to realm",
}: {
  realmId: RealmLessonThemeId;
  realmName: string;
  levelLabel: string;
  levelNumber: number;
  year: string;
  score: number;
  total: number;
  percent: number;
  planWeeks: readonly PostTestPlanWeek[];
  strengths: readonly string[];
  growth?: PostTestGrowth | null;
  speech: string;
  speechKey: string;
  onStartWeek: (week: number) => void;
  onPractise: () => void;
  onReview?: () => void;
  onRetry: () => void;
  onBack: () => void;
  /** Where the quiet back link goes, e.g. "Back to my world" for Levels 7 and 8. */
  backLabel?: string;
}) {
  const message = postTestNotYetMessage(score, total, percent);
  const firstWeek = planWeeks[0]?.week;
  const artwork = getRealmLessonArtwork(realmId, levelNumber, year);
  const tickAngle = (POSTTEST_PASS_THRESHOLD / 100) * 360;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05090d] text-white" style={weekPageTheme(realmId)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={artwork} alt="" className="fixed inset-0 h-full w-full object-cover" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(5,9,13,0.55),rgba(5,9,13,0.88)_75%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1200px] items-center px-4 py-6 sm:px-8">
        <div className={`${WEEK_FILL} w-full rounded-[32px] p-[3px] shadow-[0_30px_80px_rgba(0,0,0,0.55)]`}>
          <div className="flex flex-col gap-6 rounded-[29px] bg-[linear-gradient(180deg,rgba(8,13,18,0.95),rgba(8,13,18,0.9))] px-5 py-6 backdrop-blur-md sm:px-10 sm:py-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex h-9 items-center gap-2 rounded-full border-[1.5px] border-white/20 bg-white/[0.06] px-4 text-sm font-extrabold">
                <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--wk-accent)] shadow-[0_0_8px_var(--wk-accent)]" />
                {realmName} · {levelLabel} · Post-test
              </span>
              <ReadAloudBtn
                text={speech}
                speechKey={speechKey}
                label="Read results"
                className="!border-white/25 !bg-white/10 !text-white hover:!bg-white/15"
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
              {/* How close they are */}
              <section className="flex flex-col items-center gap-3 text-center">
                <div className="relative" style={{ width: RING, height: RING }}>
                  <div
                    role="img"
                    aria-label={`${percent} percent. ${POSTTEST_PASS_THRESHOLD} percent passes.`}
                    className="grid h-full w-full place-items-center rounded-full"
                    style={{ background: `conic-gradient(var(--wk-accent) 0 ${percent}%, rgba(255,255,255,0.12) ${percent}% 100%)` }}
                  >
                    <div className="flex h-[206px] w-[206px] flex-col items-center justify-center rounded-full bg-[#0a1016] shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
                      <span className="text-[66px] font-black leading-none tracking-tight">{percent}%</span>
                      <span className="mt-1.5 text-[15px] font-bold text-white/75">{score} of {total} correct</span>
                    </div>
                  </div>
                  <span
                    aria-hidden
                    className="absolute left-1/2 top-1/2 -ml-0.5 h-[30px] w-1 rounded bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    style={{ marginTop: -RING / 2, transformOrigin: `2px ${RING / 2}px`, transform: `rotate(${tickAngle}deg)` }}
                  />
                  <span className="absolute -left-14 top-3 whitespace-nowrap rounded-full border-[1.5px] border-white/30 bg-white/10 px-2.5 py-1 text-[13px] font-black">
                    {POSTTEST_PASS_THRESHOLD}% to pass
                  </span>
                </div>
                <h1 className="mt-1 text-4xl font-black leading-tight sm:text-[46px]">{message.title}</h1>
                <p className="max-w-[380px] text-[19px] font-semibold leading-snug text-white/90">
                  You need {message.needed} out of {total} to pass. That&apos;s just{" "}
                  <b className="text-[var(--wk-accent)]">{message.more} more correct answer{message.more === 1 ? "" : "s"}</b>.
                </p>
                {strengths.length > 0 ? (
                  <div className="mt-1 flex flex-wrap justify-center gap-2">
                    {strengths.map((skill) => (
                      <span key={skill} className="inline-flex h-[34px] items-center gap-1.5 rounded-full border-[1.5px] border-[color-mix(in_srgb,var(--wk-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--wk-accent)_16%,transparent)] px-3.5 text-sm font-extrabold text-[var(--wk-accent)]">
                        <Check aria-hidden className="h-4 w-4" strokeWidth={3.5} /> {skill}
                      </span>
                    ))}
                  </div>
                ) : null}
              </section>

              <section className="flex min-w-0 flex-col gap-4">
                {/* Where to go next */}
                <div className="rounded-[22px] border-[1.5px] border-white/12 bg-white/[0.05] p-5">
                  <h2 className="mb-3.5 flex items-center gap-2.5 text-xl font-black">
                    <MapIcon aria-hidden className="h-[22px] w-[22px] text-[var(--wk-accent)]" /> Your plan to pass
                  </h2>
                  <ol className="flex flex-col gap-3">
                    {planWeeks.map((item, index) => (
                      <li
                        key={item.week}
                        className={`grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[18px] p-3.5 ${index === 0 ? "border-2 border-[var(--wk-accent)] bg-[color-mix(in_srgb,var(--wk-from)_20%,rgba(8,13,18,0.6))] shadow-[0_0_0_4px_color-mix(in_srgb,var(--wk-accent)_18%,transparent)]" : "border-[1.5px] border-white/10 bg-white/[0.04]"}`}
                      >
                        <span className={`grid h-12 w-12 place-items-center rounded-full text-xl font-black ${index === 0 ? `${WEEK_FILL} border-2 border-white text-white` : "border-2 border-white/35"}`}>{index + 1}</span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-extrabold uppercase tracking-[0.06em] text-[var(--wk-accent)]">{index === 0 ? "Start here" : "Then"}</span>
                          <span className="block text-[19px] font-extrabold leading-tight">Week {item.week}{item.skill ? ` · ${item.skill}` : ""}</span>
                          <span className="block text-[15px] font-semibold text-white/75">{index === 0 ? "Replay the lessons you found tricky" : "Practise the same skills again"}</span>
                        </span>
                        {index === 0 ? (
                          <button type="button" onClick={() => onStartWeek(item.week)} className="inline-flex h-9 items-center rounded-full bg-[var(--wk-accent)] px-3.5 text-[13px] font-black text-slate-950">Up next</button>
                        ) : (
                          <button type="button" onClick={() => onStartWeek(item.week)} className="inline-flex h-9 items-center rounded-full bg-white/10 px-3.5 text-[13px] font-black text-white/85 hover:bg-white/15">Open</button>
                        )}
                      </li>
                    ))}
                    <li className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-[18px] border-[1.5px] border-white/10 bg-white/[0.04] p-3.5">
                      <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-white/35 text-xl font-black">{planWeeks.length + 1}</span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-extrabold uppercase tracking-[0.06em] text-[var(--wk-accent)]">{planWeeks.length ? "Finally" : "Next"}</span>
                        <span className="block text-[19px] font-extrabold leading-tight">Retry the post-test</span>
                        <span className="block text-[15px] font-semibold text-white/75">Score {POSTTEST_PASS_THRESHOLD}% or more to unlock your RELIQ card</span>
                      </span>
                      <span aria-hidden className="h-[52px] w-10 rounded-[7px] border-2 border-[#fff3c4] bg-[linear-gradient(160deg,#fde68a,#f59e0b_55%,#92400e)] shadow-[0_0_14px_rgba(251,191,36,0.55)]" />
                    </li>
                  </ol>
                  <p className="mt-3.5 text-[15px] font-semibold leading-snug text-white/80">
                    Finished your plan? You can replay any week and retry the post-test whenever you&apos;re ready.
                  </p>
                </div>

                {growth ? (
                  <div className="flex items-center gap-4 rounded-[22px] border-[1.5px] border-white/12 bg-white/[0.05] p-5">
                    <div aria-hidden className="flex h-16 items-end gap-2.5">
                      <span className="flex w-[38px] justify-center rounded-t-lg rounded-b bg-white/20 pt-1 text-xs font-black" style={{ height: `${Math.max(24, growth.from)}%` }}>{growth.from}%</span>
                      <span className={`${WEEK_FILL} flex w-[38px] justify-center rounded-t-lg rounded-b pt-1 text-xs font-black text-white`} style={{ height: `${Math.max(24, growth.to)}%` }}>{growth.to}%</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[19px] font-extrabold leading-tight">
                        {growth.to > growth.from ? `You grew from ${growth.from}% to ${growth.to}%` : `Your starting score was ${growth.from}%`}
                      </div>
                      <div className="text-[15px] font-semibold text-white/75">
                        {[growth.strongest ? `Your biggest jump was in ${growth.strongest.toLowerCase()}.` : "", growth.keepPractising ? `Keep practising ${growth.keepPractising.toLowerCase()}.` : ""].filter(Boolean).join(" ")}
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>
            </div>

            <div className={`grid gap-3 sm:grid-cols-2 ${onReview ? "lg:grid-cols-[1.4fr_1fr_1fr_1fr]" : "lg:grid-cols-[1.4fr_1fr_1fr]"}`}>
              <button
                type="button"
                onClick={() => (firstWeek ? onStartWeek(firstWeek) : onBack())}
                className={`${WEEK_FILL} inline-flex h-[62px] items-center justify-center gap-2.5 rounded-[18px] text-lg font-black text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] shadow-[inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-4px_0_rgba(0,0,0,0.25)] transition hover:brightness-110`}
              >
                {firstWeek ? <><Play aria-hidden className="h-5 w-5 fill-current" /> Start Week {firstWeek}</> : backLabel}
              </button>
              <button type="button" onClick={onPractise} className="h-[62px] rounded-[18px] border-2 border-amber-400/55 bg-amber-400/[0.14] text-lg font-black text-amber-200 transition hover:bg-amber-400/20">
                Practise weak areas
              </button>
              {onReview ? (
                <button type="button" onClick={onReview} className="h-[62px] rounded-[18px] border-[1.5px] border-white/25 bg-white/[0.07] text-lg font-black transition hover:bg-white/[0.12]">
                  Review my answers
                </button>
              ) : null}
              <button type="button" onClick={onRetry} className="h-[62px] rounded-[18px] border-[1.5px] border-white/25 bg-white/[0.07] text-lg font-black transition hover:bg-white/[0.12]">
                Retry post-test
              </button>
            </div>
            {firstWeek ? (
              <button type="button" onClick={onBack} className="self-center text-[15px] font-bold text-white/70 underline-offset-4 hover:text-white hover:underline">
                {backLabel}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
