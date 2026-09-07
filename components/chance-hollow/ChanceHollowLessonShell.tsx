"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PracticeRunner } from "@/components/PracticeRunner";
import { RealmActiveLessonShell } from "@/components/lesson/RealmActiveLessonShell";
import { LessonConceptIntro, RealmLessonHome, type LessonConceptIntroData } from "@/components/lesson/RealmLessonHome";
import { createRandomRealmLessonGenerator, type RealmLessonTaskGenerator } from "@/data/activities/realm-lesson-blueprint";
import { getChanceHollowLevel3TaskSet } from "@/data/activities/chanceHollow/level3";
import { getChanceHollowLevel4TaskSet } from "@/data/activities/chanceHollow/level4";
import { getChanceHollowLevel5TaskSet } from "@/data/activities/chanceHollow/level5";
import type { Lesson } from "@/data/programs/year1";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, saveRealmLessonAttempt } from "@/lib/student-progress-sync";
import { getWorld3DReturnPathForLesson, preserveWorld3DReturnContextForLesson } from "@/lib/world3d/return-context";
import type { LessonPerformanceSummary } from "@/components/lesson/Year2LessonEngine";

type Phase = "home" | "concept" | "active";

function conceptFor(levelNumber: number, week: number): LessonConceptIntroData {
  if (levelNumber === 5) {
    if (week === 1) return {
      term: "outcome set",
      title: "The question decides which outcomes we list",
      meaning: "An outcome set lists every distinct result that answers the investigation question, with no omissions or repeats.",
      example: "For a card draw, colour has 2 outcomes, suit has 4 outcomes, and exact card has 52 outcomes.",
      exampleExplanation: "The same experiment can have different outcome sets because the recorded feature changes.",
      chanceVisual: { type: "bag", counters: ["#ef5b62", "#ef5b62", "#3b82f6", "#22d3ee", "#22d3ee", "#22d3ee"] },
    };
    if (week === 2) return {
      term: "unequally likely",
      title: "Possible does not always mean equally likely",
      meaning: "Outcomes are unequally likely when they occupy different numbers of equal regions, faces, cards or counters.",
      example: "A spinner with 4 pink regions and 2 cyan regions is more likely to land on pink.",
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
      example: "If cyan occurs 7 times in 20 spins, its relative frequency is 7 out of 20.",
      exampleExplanation: "The outcome count is the numerator and all completed trials form the denominator.",
      chanceModel: {
        visual: { type: "frequency", labels: ["Cyan", "Other"], counts: [7, 13], total: 20 },
        numerator: 7,
        denominator: 20,
        winningLabel: "7 cyan results",
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
        term: "fraction chance",
        title: "Chance can be described as a fraction",
        meaning: "A probability fraction compares the number of winning outcomes with the total number of equally likely outcomes.",
        example: "If 2 of 6 spinner parts are red, the chance of red is 2 out of 6.",
        exampleExplanation: "The winning outcomes are the red parts, and the total outcomes are all spinner parts.",
        chanceModel: {
          visual: { type: "spinner", wedges: ["#fb7185", "#fb7185", "#6d3f9c", "#6d3f9c", "#6d3f9c", "#6d3f9c"] },
          numerator: 2,
          denominator: 6,
          winningLabel: "2 red winning parts",
          totalLabel: "6 equal parts altogether",
        },
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

function successCriteriaFor(levelNumber: number, week: number, lessonNumber: number): string[] {
  if (levelNumber === 5) {
    const criteria: Record<string, string[]> = {
      "1-1": ["match outcomes to the question", "separate outcomes from details", "explain why the outcome set changes"],
      "1-2": ["list every possible outcome", "include each outcome once", "check that the list is complete"],
      "1-3": ["identify equally likely outcomes", "identify unequally likely outcomes", "use counts as evidence"],
      "2-1": ["connect equal regions to equal chance", "compare equal outcome counts", "explain why the tool is fair"],
      "2-2": ["find the outcome with more chance", "compare unequal counts or regions", "explain the likelihood difference"],
      "2-3": ["spot a hidden advantage", "use outcome counts as evidence", "describe how the design is biased"],
      "3-1": ["organise all 36 dice pairs", "count pairs for a grouped result", "check that no pair is missing"],
      "3-2": ["compare two-dice differences", "count how many pairs make each difference", "explain why the chances differ"],
      "3-3": ["find unfair race rules", "group 18 pairs for each racer", "test the repaired game"],
      "4-1": ["run the same experiment repeatedly", "record every outcome", "check the total frequency"],
      "4-2": ["write frequency as a fraction", "use outcome count as the numerator", "use total trials as the denominator"],
      "4-3": ["compare repeated trial results", "describe frequency variation", "explain why fair trials can differ"],
      "5-1": ["predict from the tool design", "compare target shares", "explain which outcome should occur more"],
      "5-2": ["estimate likelihood from frequency", "compare frequencies with different totals", "support my estimate with evidence"],
      "5-3": ["identify suspicious frequency patterns", "compare fair and loaded results", "make a cautious evidence-based verdict"],
      "6-1": ["write a testable chance question", "choose a consistent procedure", "plan how every result will be recorded"],
      "6-2": ["predict before testing", "run and record repeated trials", "calculate each relative frequency"],
      "6-3": ["answer the investigation question", "defend my conclusion with frequency evidence", "complete the fair race against Roller"],
    };
    return criteria[`${week}-${lessonNumber}`] ?? ["list the possible outcomes", "record repeated results", "explain my conclusion with evidence"];
  }

  if (levelNumber === 4) {
    const criteria: Record<string, string[]> = {
      "1-1": [
        "tell if a chance situation is fair",
        "count each possible outcome",
        "explain who has more chance",
      ],
      "1-2": [
        "recognise equal chance outcomes",
        "use equal counts as evidence",
        "choose matching chance words",
      ],
      "1-3": [
        "explain why chances are equal",
        "use outcome counts in my reason",
        "check that each outcome can happen",
      ],
      "2-1": [
        "read outcomes from a chance tool",
        "name the possible results",
        "use the tool as evidence",
      ],
      "2-2": [
        "count possible outcomes",
        "count different outcomes carefully",
        "tell the total number of outcomes",
      ],
      "2-3": [
        "match a tool to a chance",
        "choose a tool with the right number of outcomes",
        "explain the match",
      ],
      "3-1": [
        "describe one outcome out of all outcomes",
        "count winning outcomes",
        "count total outcomes",
      ],
      "3-2": [
        "write chance as a simple fraction",
        "use winning outcomes as the numerator",
        "use total outcomes as the denominator",
      ],
      "3-3": [
        "compare chance fractions",
        "decide which chance is greater",
        "explain my comparison",
      ],
      "4-1": [
        "decide if a game is fair",
        "count each player's winning outcomes",
        "explain my fairness decision",
      ],
      "4-2": [
        "spot what makes a game unfair",
        "change outcomes to make the game fair",
        "check both players have equal chance",
      ],
      "4-3": [
        "design a fair game",
        "give each player equal winning outcomes",
        "explain why my game is fair",
      ],
      "5-1": [
        "compare which event has more chance",
        "use outcome counts to compare",
        "choose the event with better chance",
      ],
      "5-2": [
        "recognise the same chance in different tools",
        "compare equivalent chances",
        "explain why chances match",
      ],
      "5-3": [
        "choose the best prediction",
        "use the most likely outcome",
        "explain why my prediction is sensible",
      ],
      "6-1": [
        "predict from the chance tool",
        "use probability before testing",
        "explain my expected result",
      ],
      "6-2": [
        "run and record a chance trial",
        "read the recorded results",
        "compare results with my prediction",
      ],
      "6-3": [
        "compare expected and actual results",
        "notice when results vary",
        "explain variation using chance language",
      ],
    };

    return criteria[`${week}-${lessonNumber}`] ?? [
      "compare chance outcomes",
      "explain my probability thinking",
      "use the chance tool as evidence",
    ];
  }

  const criteria: Record<string, string[]> = {
    "1-1": [
      "use certain for something that will happen",
      "use impossible for something that cannot happen",
      "choose the best chance word for an event",
    ],
    "1-2": [
      "use likely for something that has a good chance",
      "use unlikely for something that has a small chance",
      "compare two chance events",
    ],
    "1-3": [
      "choose a chance word",
      "give a reason for my choice",
      "use chance words in a sentence",
    ],
    "2-1": [
      "spot chance events around me",
      "tell what could happen",
      "use chance words for real events",
    ],
    "2-2": [
      "sort event cards by chance",
      "check if a chance word makes sense",
      "explain one sorted choice",
    ],
    "2-3": [
      "give a reason for a chance word",
      "use evidence from the event",
      "change my answer when the evidence changes",
    ],
    "3-1": [
      "name possible outcomes",
      "tell if an outcome can happen",
      "choose a matching outcome",
    ],
    "3-2": [
      "list every possible outcome",
      "check that no outcomes are missing",
      "use the tool to support my list",
    ],
    "3-3": [
      "match an event to its outcomes",
      "reject outcomes that cannot happen",
      "explain why an outcome matches",
    ],
    "4-1": [
      "make a prediction before testing",
      "use outcomes to support my prediction",
      "say why my prediction is sensible",
    ],
    "4-2": [
      "run a simple chance experiment",
      "record what happens",
      "compare the result with my prediction",
    ],
    "4-3": [
      "say if my prediction matched",
      "explain the result with chance language",
      "remember that possible outcomes can surprise us",
    ],
    "5-1": [
      "run repeated chance trials",
      "record each result carefully",
      "count how often each outcome happens",
    ],
    "5-2": [
      "record results with tally marks",
      "read a tally table",
      "find the outcome that happened most often",
    ],
    "5-3": [
      "compare repeated trial results",
      "find what stayed the same or changed",
      "use results to describe chance",
    ],
    "6-1": [
      "repeat the same experiment",
      "notice that results can change",
      "describe variation between trials",
    ],
    "6-2": [
      "compare class chance results",
      "find similarities and differences",
      "talk about variation using evidence",
    ],
    "6-3": [
      "explain why repeated results can vary",
      "use tally evidence in my explanation",
      "connect variation to chance",
    ],
  };

  return criteria[`${week}-${lessonNumber}`] ?? [
    "use chance language",
    "explain my thinking",
    "record results carefully",
  ];
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

  const successCriteria = successCriteriaFor(levelNumber, week, lesson.lesson);
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
        <div className="mx-auto w-full max-w-[1100px] space-y-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPhase("home")}
              className="rounded-lg border border-rose-300/25 px-4 py-2 text-xs font-mono font-black uppercase tracking-[0.14em] text-rose-50 transition hover:brightness-110"
            >
              Back
            </button>
            <span className="text-xs font-mono font-bold uppercase tracking-[0.16em] text-rose-200/70">
              Level {levelNumber} · Week {week} · Lesson {lesson.lesson}
            </span>
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-rose-300">Chance Challenge</div>
            <h1 className="mt-1 text-3xl font-black text-white sm:text-4xl">{lesson.title}</h1>
            <p className="mt-2 max-w-3xl text-base font-semibold text-white/70">{lesson.focus}</p>
          </div>
          <LessonConceptIntro realm="chance" conceptIntro={conceptIntro} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPhase("active")}
              className="rounded-xl bg-gradient-to-r from-rose-600 via-pink-500 to-amber-400 px-8 py-3 text-base font-black text-white shadow-[0_16px_40px_rgba(244,63,94,0.24)] transition hover:brightness-110"
            >
              Start the Trial
            </button>
          </div>
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
