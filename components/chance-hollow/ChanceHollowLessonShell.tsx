"use client";

import NarratedLessonGuide from "@/components/lesson/NarratedLessonGuide";
import { chanceHollowSuccessCriteria } from "@/lib/chance-hollow-success-criteria";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PracticeRunner } from "@/components/PracticeRunner";
import { RealmActiveLessonShell } from "@/components/lesson/RealmActiveLessonShell";
import { QUIZ_BUTTON } from "@/components/quiz/QuizUi";
import { LessonConceptIntro, RealmLessonHome, type LessonConceptIntroData } from "@/components/lesson/RealmLessonHome";
import { createRandomRealmLessonGenerator, type RealmLessonTaskGenerator } from "@/data/activities/realm-lesson-blueprint";
import { getChanceHollowLevel3TaskSet } from "@/data/activities/chanceHollow/level3";
import { getChanceHollowLevel4TaskSet } from "@/data/activities/chanceHollow/level4";
import { getChanceHollowLevel5TaskSet } from "@/data/activities/chanceHollow/level5";
import { getChanceHollowLevel6TaskSet } from "@/data/activities/chanceHollow/level6";
import type { Lesson } from "@/data/programs/year1";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, saveRealmLessonAttempt } from "@/lib/student-progress-sync";
import { getWorld3DReturnPathForLesson, preserveWorld3DReturnContextForLesson } from "@/lib/world3d/return-context";
import type { LessonPerformanceSummary } from "@/components/lesson/Year2LessonEngine";

type Phase = "home" | "concept" | "active";

function conceptFor(levelNumber: number, week: number): LessonConceptIntroData {
  if (levelNumber === 6) {
    if (week === 1) return {
      term: "probability scale",
      title: "Probability has a place from impossible to certain",
      meaning: "Every probability sits between 0 and 1, or 0% and 100%.",
      example: "One half, 0.5 and 50% mark the same point.",
      exampleExplanation: "Different forms can name the same chance.",
      chanceModel: { visual: { type: "spinner", wedges: ["#d946ef", "#d946ef", "#22d3ee", "#22d3ee"] }, numerator: 2, denominator: 4, winningLabel: "2 glowing sectors", totalLabel: "4 sectors" },
    };
    if (week === 2) return {
      term: "probability",
      title: "Winning outcomes are compared with all outcomes",
      meaning: "Probability equals favourable outcomes divided by all equally likely outcomes.",
      example: "Three winning sectors out of five gives a probability of 3/5.",
      exampleExplanation: "The numerator counts wins; the denominator counts every outcome.",
      chanceModel: { visual: { type: "spinner", wedges: ["#d946ef", "#d946ef", "#d946ef", "#22d3ee", "#22d3ee"] }, numerator: 3, denominator: 5, winningLabel: "3 winning sectors", totalLabel: "5 sectors" },
    };
    if (week === 3) return {
      term: "expected frequency",
      title: "Expected and observed results are compared",
      meaning: "Expected frequency predicts a count; observed frequency records what happened.",
      example: "A 25% event is expected about 10 times in 40 trials.",
      exampleExplanation: "Chance variation means the observed count may differ.",
      chanceVisual: { type: "expectedObserved", expected: 10, observed: 11, total: 40 },
    };
    if (week === 4) return {
      term: "long-run frequency",
      title: "More trials usually steady the relative frequency",
      meaning: "Larger samples tend to reduce relative variation around the expected probability.",
      example: "Ten trials may swing widely; five hundred usually settles closer.",
      exampleExplanation: "More trials improve evidence but never guarantee an exact match.",
      chanceVisual: {
        type: "convergence",
        expected: 0.5,
        samples: [
          { trials: 10, value: 0.8 },
          { trials: 50, value: 0.32 },
          { trials: 150, value: 0.59 },
          { trials: 500, value: 0.49 },
        ],
      },
    };
    if (week === 5) return {
      term: "simulation model",
      title: "A valid simulator preserves the event's probabilities",
      meaning: "Each simulated outcome must be mapped fairly and reset every trial.",
      example: "A 25% event can use one winning sector on a four-part spinner.",
      exampleExplanation: "The model's winning share matches the real event.",
      chanceVisual: { type: "spinner", wedges: ["#d946ef", "#22d3ee", "#22d3ee", "#22d3ee"] },
    };
    return {
      term: "probability investigation",
      title: "Strong conclusions connect model, trials and evidence",
      meaning: "Plan fairly, predict, simulate many trials and defend a careful conclusion.",
      example: "Compare expected probability with observed relative frequency across trial sizes.",
      exampleExplanation: "The verdict must fit the evidence without claiming certainty.",
      chanceVisual: { type: "dicePair", left: 4, right: 6 },
    };
  }
  if (levelNumber === 5) {
    if (week === 1) return {
      term: "outcome set",
      title: "The question decides which outcomes we list",
      meaning: "An outcome set is the full list of results that answer your question — every one, and each listed only once.",
      example: "Draw one counter from this bag. If you ask for the colour there are 3 outcomes (red, blue, green); if you ask for the exact counter there are 6.",
      exampleExplanation: "The same draw gives a different outcome set depending on what you choose to record.",
      chanceVisual: { type: "bag", counters: ["#ef5b62", "#ef5b62", "#3b82f6", "#22d3ee", "#22d3ee", "#22d3ee"] },
    };
    if (week === 2) return {
      term: "unequally likely",
      title: "Possible does not always mean equally likely",
      meaning: "Outcomes are unequally likely when they occupy different numbers of equal regions, faces, cards or counters.",
      example: "A spinner with 4 pink regions and 2 blue regions is more likely to land on pink.",
      exampleExplanation: "Pink has more winning regions, so it has more ways to occur.",
      chanceVisual: { type: "spinner", wedges: ["#d946ef", "#d946ef", "#d946ef", "#d946ef", "#22d3ee", "#22d3ee"] },
    };
    if (week === 3) return {
      term: "grouped outcomes",
      title: "Grouped results can hide different chances",
      meaning: "When two dice are rolled, each ordered pair is equally likely but grouped sums or differences may contain different numbers of pairs.",
      example: "A difference of 1 can occur in 10 ordered pairs, while a difference of 5 can occur in only 2.",
      exampleExplanation: "Counting the full 6 by 6 outcome grid reveals the hidden odds.",
      chanceVisual: { type: "diceGrid", mode: "difference", highlight: 1 },
    };
    if (week === 4) return {
      term: "relative frequency",
      title: "Frequency compares a result with all trials",
      meaning: "Relative frequency records how many times an outcome occurred out of the total number of repeated trials.",
      example: "If blue occurs 7 times in 20 spins, its relative frequency is 7 out of 20.",
      exampleExplanation: "The outcome count is the numerator and all completed trials form the denominator.",
      chanceModel: {
        visual: { type: "frequency", labels: ["Blue", "Other"], counts: [7, 13], total: 20 },
        numerator: 7,
        denominator: 20,
        winningLabel: "7 blue results",
        totalLabel: "20 completed trials",
      },
    };
    if (week === 5) return {
      term: "frequency evidence",
      title: "Results help us estimate likelihood",
      meaning: "Repeated results provide evidence about likelihood, but one experiment does not make a future outcome certain.",
      example: "If one die face appears far more often than the others, investigators test again and consider whether the die is biased.",
      exampleExplanation: "A careful verdict describes the evidence without claiming absolute proof.",
      chanceVisual: { type: "frequency", labels: ["1", "2", "3", "4", "5", "6"], counts: [3, 4, 3, 4, 3, 19], total: 36 },
    };
    return {
      term: "chance investigation",
      title: "A strong investigation connects design, trials and evidence",
      meaning: "Plan a repeatable method, record every outcome, compare relative frequencies and make a conclusion supported by the results.",
      example: "Predict from the tool, run the same procedure many times, then explain what the frequencies show.",
      exampleExplanation: "The conclusion must answer the original question and stay within the collected evidence.",
      chanceVisual: { type: "dicePair", left: 3, right: 5 },
    };
  }

  if (levelNumber === 4) {
    if (week <= 2) {
      return {
        term: "equally likely",
        title: "Equal outcomes have equal chance",
        meaning: "Outcomes are equally likely when each result has the same chance of happening. A fair chance tool gives matching outcomes equal opportunity.",
        example: "On a fair coin, heads and tails are equally likely.",
        exampleExplanation: "Each side has one outcome, so neither side has more chance before the toss.",
      };
    }
    if (week <= 3) {
      return {
        term: "independent and dependent events",
        title: "Some events change the chance of the next one",
        meaning: "An event is independent when it does not change the next chance, and dependent when it does. Putting a drawn counter back keeps the bag the same; keeping it out changes what is left.",
        example: "Draw a red counter from a bag. Put it back and the chances are unchanged; keep it out and red becomes less likely next time.",
        exampleExplanation: "Replacing the counter is independent; keeping it is dependent because the bag has changed.",
        chanceVisual: { type: "bag", counters: ["#e5484d", "#e5484d", "#e5484d", "#3b82f6", "#3b82f6"] },
      };
    }
    if (week <= 5) {
      return {
        term: "fair game",
        title: "Fair games give players equal chances",
        meaning: "A game is fair when each player has the same chance to win. We can check fairness by counting winning outcomes.",
        example: "A coin game is fair if one player wins on heads and the other wins on tails.",
        exampleExplanation: "Each player has one equally likely outcome, so both players have the same chance.",
      };
    }
    return {
      term: "expected result",
      title: "Expected and actual results can differ",
      meaning: "Expected results describe what should happen about often. Actual results are what really happened in the trial.",
      example: "In 20 fair coin tosses, we expect about 10 heads, but we might get 8, 11 or 12.",
      exampleExplanation: "Chance results vary, so actual results do not always match the expected result exactly.",
    };
  }

  if (week <= 2) {
    return {
      term: "chance event",
      title: "Chance words describe what could happen",
      meaning: "A chance event is something where we think about possible results. Some events are certain, some are impossible, and some may or may not happen.",
      example: "Rolling a 6 is possible but unlikely. Rolling a 9 on a normal die is impossible.",
      exampleExplanation: "A normal die has 1, 2, 3, 4, 5 and 6. That means 6 can happen, but 9 cannot.",
    };
  }
  if (week <= 4) {
    return {
      term: "possible outcomes",
      title: "Outcomes are the results that could happen",
      meaning: "Before we predict, we list the possible outcomes. A good prediction uses what outcomes are available.",
      example: "A coin has two possible outcomes: heads or tails.",
      exampleExplanation: "If heads and tails are both possible, neither one is certain before the toss.",
    };
  }
  return {
    term: "variation",
    title: "Repeated trials can give different results",
    meaning: "A chance experiment can be repeated many times. The results may vary from trial to trial, even when the experiment is the same.",
    example: "One group tosses 10 coins and gets 4 heads. Another group gets 7 heads.",
    exampleExplanation: "Both groups did the same experiment, but chance means the results do not always match exactly.",
  };
}


export default function ChanceHollowLessonShell({
  level,
  levelNumber,
  week,
  lesson,
}: {
  level: string;
  levelNumber: number;
  week: number;
  lesson: Lesson;
}) {
  const router = useRouter();
  const previewMode = useDemoPreviewMode();
  const [phase, setPhase] = useState<Phase>("home");
  const summaryRef = useRef<LessonPerformanceSummary | null>(null);
  const savingRef = useRef(false);
  const completionSavedRef = useRef(false);
  const exitRequestedRef = useRef(false);
  const completionKeyRef = useRef<string | null>(null);
  const [getTask] = useState<RealmLessonTaskGenerator | null>(() => {
    const taskSet =
      levelNumber === 3
        ? getChanceHollowLevel3TaskSet(lesson.id)
        : levelNumber === 4
          ? getChanceHollowLevel4TaskSet(lesson.id)
          : levelNumber === 5
            ? getChanceHollowLevel5TaskSet(lesson.id)
            : levelNumber === 6
              ? getChanceHollowLevel6TaskSet(lesson.id)
              : null;
    return taskSet ? createRandomRealmLessonGenerator(taskSet) : null;
  });
  const weekHref = getWorld3DReturnPathForLesson({
    realmId: "chance",
    level,
    week,
    lessonNumber: lesson.lesson,
    lessonId: lesson.id,
  }) ?? buildRealmProgramHref({ realmId: "chance", year: level, week });
  const back = () => router.push(weekHref);

  const completeLesson = useCallback(() => {
    if (completionSavedRef.current) {
      router.push(weekHref);
      return;
    }
    if (savingRef.current) {
      exitRequestedRef.current = true;
      return;
    }
    if (previewMode) {
      completionSavedRef.current = true;
      return;
    }
    const studentId = getActiveStudentIdentity().studentId;
    if (!studentId) {
      window.alert("We couldn't verify this student, so the lesson was not saved. Please return home and sign in again.");
      return;
    }
    savingRef.current = true;
    const summary = summaryRef.current;
    const completionKey = completionKeyRef.current ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
    completionKeyRef.current = completionKey;
    void saveRealmLessonAttempt(studentId, level, week, lesson.lesson, lesson.id, {
      at: new Date().toISOString(),
      completed: true,
      lessonId: lesson.id,
      lessonNumber: lesson.lesson,
      title: lesson.title,
      questionsAnswered: summary?.questionsAnswered ?? 0,
      totalQuestions: summary?.questionsAnswered ?? 0,
      correctAnswers: summary?.correctAnswers ?? 0,
      correctCount: summary?.correctAnswers ?? 0,
      accuracy: summary?.accuracy ?? 0,
      accuracyPercent: summary?.accuracy ?? 0,
      bestChain: summary?.bestChain ?? 0,
      timeSpentSeconds: summary?.timeSpentSeconds ?? 0,
      topicSummaries: summary?.topicSummaries ?? [],
      strengths: summary?.strengths ?? [],
      areasToImprove: summary?.areasToImprove ?? [],
      struggledQuestionTypes: summary?.struggledQuestionTypes ?? [],
    }, completionKey, "chance")
      .then(() => {
        completionSavedRef.current = true;
        return restoreStudentStateFromServer(studentId, "chance").catch((error) => {
          console.warn("[Chance Hollow] Lesson saved but progress refresh failed", error);
        }).then(() => { if (exitRequestedRef.current) router.push(weekHref); });
      })
      .catch((error) => {
        console.error("[Chance Hollow] Lesson completion save failed", error);
        window.alert("We couldn't save this lesson yet. Please check the connection and press Finish again.");
      })
      .finally(() => { savingRef.current = false; });
  }, [lesson.id, lesson.lesson, lesson.title, level, previewMode, router, week, weekHref]);

  useEffect(() => {
    preserveWorld3DReturnContextForLesson({
      realmId: "chance",
      level,
      week,
      lessonNumber: lesson.lesson,
      lessonId: lesson.id,
    });
  }, [lesson.id, lesson.lesson, level, week]);

  const successCriteria = chanceHollowSuccessCriteria(levelNumber, week, lesson.lesson);
  const conceptIntro = conceptFor(levelNumber, week);

  useEffect(() => {
    if (!previewMode) router.replace("/realms");
  }, [previewMode, router]);

  if (!previewMode) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#17111b] p-6 text-center text-white">
        <p className="font-semibold">Chance Hollow is currently in preview.</p>
      </main>
    );
  }

  if (phase === "active" && getTask) {
    return (
      <main className="min-h-screen bg-[#17111b] p-3 sm:p-5">
        <div className="mx-auto w-full max-w-[1500px]">
          <RealmActiveLessonShell
            realm="chance"
            levelNumber={levelNumber}
            levelLabel={`Level ${levelNumber}`}
            year={level}
            week={week}
            lessonNumber={lesson.lesson}
            lessonTitle={lesson.title}
            focus={lesson.focus}
            demoMode={previewMode}
            onBack={back}
          >
            <PracticeRunner
              minutes={9}
              completionMode="time_only"
              scoreCap={10}
              getTask={getTask}
              onComplete={completeLesson}
              onPerformanceSummary={(summary) => { summaryRef.current = summary; }}
              lessonTitle={lesson.title}
              liveContext={{ level, strand: "Probability", week, lessonId: lesson.id, lessonTitle: lesson.title }}
              lessonHelp={<LessonConceptIntro realm="chance" conceptIntro={conceptIntro} />}
              realmId="chance"
              levelNumber={levelNumber}
              practisedSkills={successCriteria}
              nextUpLabel={lesson.lesson < 3 ? `Week ${week} lesson ${lesson.lesson + 1}` : `Week ${week + 1} lesson 1`}
              activityNoun="Chance Trial"
              showResultsAfterReflection
              showMistakeReview={false}
            />
          </RealmActiveLessonShell>
        </div>
      </main>
    );
  }

  if (phase === "concept") {
    return (
      <main className="min-h-screen bg-[#17111b] p-3 sm:p-5">
        <div className="mx-auto w-full max-w-[1500px]">
          <RealmActiveLessonShell
            realm="chance"
            levelNumber={levelNumber}
            levelLabel={`Level ${levelNumber}`}
            year={level}
            week={week}
            lessonNumber={lesson.lesson}
            lessonTitle={lesson.title}
            focus={lesson.focus}
            demoMode={previewMode}
            onBack={() => setPhase("home")}
          >
            <NarratedLessonGuide title={`${lesson.title}. ${lesson.focus}`}><LessonConceptIntro realm="chance" conceptIntro={conceptIntro} /></NarratedLessonGuide>
            <div className="mt-5 flex justify-end">
              <button type="button" onClick={() => setPhase("active")} className={QUIZ_BUTTON.primary}>
                Start the Trial
              </button>
            </div>
          </RealmActiveLessonShell>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#17111b] p-3 sm:p-5">
      <RealmLessonHome
        realm="chance"
        levelNumber={levelNumber}
        levelLabel={`Level ${levelNumber}`}
        year={level}
        week={week}
        lessonNumber={lesson.lesson}
        lessonTitle={lesson.title}
        focus={lesson.focus}
        successCriteria={successCriteria}
        startDisabled={!getTask}
        startDisabledLabel="Activity Preview Coming Soon"
        onBack={back}
        onStart={() => { if (getTask) setPhase("concept"); }}
      />
    </main>
  );
}
