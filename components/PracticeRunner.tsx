"use client";

import { useEffect, useMemo, useState } from "react";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import MatchThePair from "@/components/MatchThePair";
import CountObjects from "@/components/CountObjects";
import FillTheJar from "@/components/FillTheJar";
import CountAndCircle from "@/components/CountAndCircle";
import TypeTheNumber from "@/components/TypeTheNumber";
import NumberLadder from "@/components/NumberLadder";
import NumberLineTap from "@/components/NumberLineTap";
import NumberLineJump from "@/components/NumberLineJump";
import NumberChartFill from "@/components/NumberChartFill";
import TensOnesMCQ from "@/components/placevalue/TensOnesMCQ";
import PartitionTwoWays from "@/components/placevalue/PartitionTwoWays";
import SplitStepper from "@/components/placevalue/SplitStepper";
import MabBuild from "@/components/placevalue/MabBuild";
import PlaceValueDiceMat from "@/components/placevalue/PlaceValueDiceMat";
import EqualGroupsMaker from "@/components/week4/EqualGroupsMaker";
import EqualGroupsMCQ from "@/components/week4/EqualGroupsMCQ";
import GroupBoxesBuilder from "@/components/week4/GroupBoxesBuilder";
import GroupingEstimate from "@/components/week4/GroupingEstimate";
import AddDotsMatch from "@/components/week5/AddDotsMatch";
import PartPartWhole from "@/components/week5/PartPartWhole";
import MentalAdd from "@/components/week5/MentalAdd";
import SubtractTakeAway from "@/components/week6/SubtractTakeAway";
import SubtractMoveToTaken from "@/components/week6/SubtractMoveToTaken";
import SubtractMissingPart from "@/components/week6/SubtractMissingPart";
import SubtractBar from "@/components/week6/SubtractBar";
import MentalSubtract from "@/components/week6/MentalSubtract";
import StoryOpChoice from "@/components/week7/StoryOpChoice";
import MissingOperation from "@/components/week7/MissingOperation";
import StorySolve from "@/components/week7/StorySolve";
import MoneyMakeAmount from "@/components/week7/MoneyMakeAmount";
import MoneyChange from "@/components/week7/MoneyChange";
import MoneyEnough from "@/components/week7/MoneyEnough";
import JoinStories from "@/components/week8/JoinStories";
import CombineGroups from "@/components/week8/CombineGroups";
import CompareGroups from "@/components/week8/CompareGroups";
import Make20Visual from "@/components/week8/Make20Visual";
import MoneyAddPrices from "@/components/week8/MoneyAddPrices";
import MoneyCountUp from "@/components/week8/MoneyCountUp";
import MoneyChangeUp from "@/components/week8/MoneyChangeUp";
import BuildStory from "@/components/week8/BuildStory";
import TwoMats from "@/components/week8/TwoMats";
import WhatHappened from "@/components/week8/WhatHappened";
import BarModelBuilder from "@/components/week8/BarModelBuilder";
import CompareBars from "@/components/week8/CompareBars";
import StrategySelect from "@/components/week8/StrategySelect";
import ShareDrag from "@/components/week9/ShareDrag";
import ShareDeal from "@/components/week9/ShareDeal";
import ShareFair from "@/components/week9/ShareFair";
import GroupBoxesInput from "@/components/week9/GroupBoxesInput";
import GroupBoxesTap from "@/components/week9/GroupBoxesTap";
import MissingGroupSize from "@/components/week9/MissingGroupSize";
import PackBoxes from "@/components/week9/PackBoxes";
import GroupGrabBags from "@/components/week9/GroupGrabBags";
import HowManyGroups from "@/components/week9/HowManyGroups";
import TapGroupsSkipCount from "@/components/week10/TapGroupsSkipCount";
import BuildGroupsSkipCount from "@/components/week10/BuildGroupsSkipCount";
import ChooseSkipCount from "@/components/week10/ChooseSkipCount";
import ArrayBuilder from "@/components/week10/ArrayBuilder";
import BarGroupModel from "@/components/week10/BarGroupModel";
import MissingGroupCount from "@/components/week10/MissingGroupCount";
import GroupStory from "@/components/week10/GroupStory";
import HowManyGroupsStory from "@/components/week10/HowManyGroupsStory";
import TwoStepGrouping from "@/components/week10/TwoStepGrouping";
import FlashFacts from "@/components/week11/FlashFacts";
import Make10Builder from "@/components/week11/Make10Builder";
import MissingNumberFacts from "@/components/week11/MissingNumberFacts";
import DoubleIt from "@/components/week11/DoubleIt";
import NearDouble from "@/components/week11/NearDouble";
import DoubleDetective from "@/components/week11/DoubleDetective";
import GridRace from "@/components/week11/GridRace";
import FactMatch from "@/components/week11/FactMatch";
import ClimbLadder from "@/components/week11/ClimbLadder";
import MixedReviewSprint from "@/components/week12/MixedReviewSprint";
import StrategyChoice from "@/components/week12/StrategyChoice";
import TargetedRevision from "@/components/week12/TargetedRevision";
import FunGames from "@/components/week12/FunGames";

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1.0;
  u.volume = 1.0;
  synth.speak(u);
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function Countdown({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return (
    <div className="text-sm font-bold text-gray-600">
      Time left: {m}:{pad2(s)}
    </div>
  );
}

function Dots({ count }: { count: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-6 w-6 rounded-full border border-gray-300 bg-gray-50"
          />
        ))}
      </div>
    </div>
  );
}

export function PracticeRunner({
  minutes = 8,
  getTask,
  onComplete,
}: {
  minutes?: number;
  getTask: (ctx?: {
    secondsLeft: number;
    totalSeconds: number;
    elapsedSeconds: number;
  }) => PracticeTask;
  onComplete: () => void;
}) {
  const totalSeconds = minutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  const [task, setTask] = useState<PracticeTask>(() =>
    getTask({ secondsLeft: totalSeconds, totalSeconds, elapsedSeconds: 0 })
  );
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [typed, setTyped] = useState("");
  const [order, setOrder] = useState<number[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [taskNonce, setTaskNonce] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) onComplete();
  }, [secondsLeft, onComplete]);

  useEffect(() => {
    setStatus("idle");
    setTyped("");
    setOrder([]);
    setHasPlayed(false);
  }, [task]);

  useEffect(() => {
    if (task.kind !== "numberHunt") return;
    speak(String(task.targetNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  const correctOrder = useMemo(() => {
    if (task.kind !== "order3") return [];
    const sorted = [...task.numbers].sort((a, b) => a - b);
    return task.direction === "ASC" ? sorted : sorted.reverse();
  }, [task]);

  function nextTask() {
    setTask(
      getTask({
        secondsLeft,
        totalSeconds,
        elapsedSeconds: totalSeconds - secondsLeft,
      })
    );
    setTaskNonce((n) => n + 1);
  }

  function markWrong() {
    setStatus("wrong");
  }

  function markCorrect() {
    setStatus("correct");
    setTimeout(() => nextTask(), 600);
  }

  function markCorrectSoft() {
    setStatus("correct");
    setTimeout(() => setStatus("idle"), 500);
  }

  function check() {
    if (task.kind === "mcq") return;

    if (task.kind === "count") {
      const n = Number(typed);
      if (!Number.isFinite(n)) return markWrong();
      return n === task.count ? markCorrect() : markWrong();
    }

    if (task.kind === "order3") {
      if (order.length !== task.numbers.length) return markWrong();
      const ok = order.every((v, i) => v === correctOrder[i]);
      return ok ? markCorrect() : markWrong();
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <Countdown seconds={Math.max(0, secondsLeft)} />
        <div
          className={[
            "px-3 py-2 rounded-xl text-sm font-bold border",
            status === "correct"
              ? "bg-green-50 border-green-200 text-green-800"
              : status === "wrong"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-gray-50 border-gray-200 text-gray-700",
          ].join(" ")}
        >
          {status === "correct"
            ? "✅ Correct"
            : status === "wrong"
            ? "❌ Try again"
            : "Practice"}
        </div>
      </div>

      <div className="text-2xl font-extrabold text-gray-900 mb-5">
        {task.prompt}
      </div>

      {task.kind === "mcq" && (
        <div className="grid gap-3">
          {task.options.map((opt, idx) => (
            <button
              key={`${opt}-${idx}`}
              onClick={() => {
                if (opt === task.answer) markCorrect();
                else markWrong();
              }}
              className="w-full text-left px-5 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition text-xl font-bold"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {task.kind === "groupCountVisual" && (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="grid gap-3">
              {Array.from({ length: task.groups }).map((_, gi) => (
                <div key={gi} className="flex items-center gap-2">
                  {Array.from({ length: task.perGroup }).map((__, di) => (
                    <span
                      key={di}
                      className="inline-block h-5 w-5 rounded-full bg-indigo-600"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {task.options.map((opt, idx) => (
              <button
                key={`${opt}-${idx}`}
                onClick={() => {
                  if (opt === task.answer) markCorrect();
                  else markWrong();
                }}
                className="w-full text-left px-5 py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition text-xl font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {task.kind === "count" && (
        <div className="grid gap-4">
          <Dots count={task.count} />

          <div className="flex items-center gap-3">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="Type your answer"
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-xl font-bold"
            />
            <button
              onClick={check}
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl hover:bg-indigo-700 transition"
            >
              Check
            </button>
          </div>
        </div>
      )}

      {task.kind === "order3" && (
        <div className="grid gap-4">
          <div className="flex gap-3 flex-wrap">
            {task.numbers.map((n) => {
              const used = order.includes(n);
              return (
                <button
                  key={n}
                  onClick={() => {
                    if (used) return;
                    setOrder((prev) => [...prev, n]);
                  }}
                  className={[
                    "px-6 py-4 rounded-2xl border text-xl font-extrabold transition",
                    used
                      ? "border-gray-200 bg-gray-100 text-gray-400"
                      : "border-gray-200 bg-white hover:bg-gray-50",
                  ].join(" ")}
                >
                  {n}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-sm font-bold text-gray-600 mb-2">Your order</div>
            <div className="text-2xl font-extrabold text-gray-900">
              {order.length ? order.join(" , ") : "—"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setOrder([])}
              className="px-5 py-3 rounded-2xl bg-gray-100 text-gray-800 font-extrabold text-xl hover:bg-gray-200 transition"
            >
              Reset
            </button>
            <button
              onClick={check}
              className="flex-1 px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl hover:bg-indigo-700 transition"
            >
              Check
            </button>
          </div>
        </div>
      )}

      {task.kind === "audioPick" && (
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                speak(task.speechText ?? String(task.targetNumber));
                setHasPlayed(true);
              }}
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl hover:bg-indigo-700 transition"
            >
              🔊 Listen
            </button>

            <div className="text-sm font-bold text-gray-600">
              {hasPlayed ? "Now tap the number." : "Tap Listen first."}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {task.cards.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  if (!hasPlayed) return;
                  if (n === task.targetNumber) markCorrect();
                  else markWrong();
                }}
                className="px-4 py-6 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition text-3xl font-extrabold"
              >
                {n}
              </button>
            ))}
          </div>

          {!hasPlayed && (
            <div className="text-sm text-gray-500">
              Tip: On iPads, audio will only play after a button tap (that’s normal).
            </div>
          )}
        </div>
      )}

      {task.kind === "numberHunt" && (
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Tap the correct number tile.
            </div>
            <button
              type="button"
              onClick={() => speak(String(task.targetNumber))}
              className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            >
              🔊 Hear number
            </button>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {task.tiles.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  if (n === task.targetNumber) markCorrect();
                  else markWrong();
                }}
                className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition text-lg sm:text-xl font-extrabold py-4 sm:py-5"
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {task.kind === "matchPairs" && (
        <MatchThePair
          key={`matchPairs-${taskNonce}`}
          config={task.config}
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "countObjects" && (
        <CountObjects
          key={`countObjects-${taskNonce}`}
          config={task.config}
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "fillTheJar" && (
        <FillTheJar
          key={`fillTheJar-${taskNonce}`}
          config={task.config}
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "countCircle" && (
        <CountAndCircle
          key={`countCircle-${taskNonce}`}
          config={task.config}
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "typeNumber" && (
        <TypeTheNumber
          key={`typeNumber-${taskNonce}`}
          min={task.min}
          max={task.max}
          rounds={1}
          answer={task.answer}
          mode="word"
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "numberLadder" && (
        <NumberLadder
          key={`numberLadder-${taskNonce}`}
          start={task.start}
          target={task.target}
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "numberLineTap" && (
        <NumberLineTap
          key={`numberLineTap-${taskNonce}`}
          min={task.min}
          max={task.max}
          target={task.target}
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "numberLineJump" && (
        <NumberLineJump
          key={`numberLineJump-${taskNonce}`}
          min={task.min}
          max={task.max}
          start={task.start}
          target={task.target}
          steps={task.steps}
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "chartFill" && (
        <NumberChartFill
          key={`chartFill-${taskNonce}`}
          min={task.min}
          max={task.max}
          missing={task.missing}
          onComplete={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "tensOnesMcq" && (
        <TensOnesMCQ
          key={`tensOnesMcq-${taskNonce}`}
          min={task.min}
          max={task.max}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "partitionTwoWays" && (
        <PartitionTwoWays
          key={`partitionTwoWays-${taskNonce}`}
          min={task.min}
          max={task.max}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "splitStepper" && (
        <SplitStepper
          key={`splitStepper-${taskNonce}`}
          target={task.target}
          max={task.max}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "mabBuild" && (
        <MabBuild
          key={`mabBuild-${taskNonce}`}
          target={task.target}
          maxTens={task.maxTens ?? 10}
          maxOnes={task.maxOnes ?? 10}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "placeValueDice" && (
        <PlaceValueDiceMat
          key={`placeValueDice-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "equalGroups" && (
        <EqualGroupsMaker
          key={`equalGroups-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "equalGroupsMcq" && (
        <EqualGroupsMCQ
          key={`equalGroupsMcq-${taskNonce}`}
          prompt={task.prompt}
          options={task.options}
          correctIndex={task.correctIndex}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "groupBoxes" && (
        <GroupBoxesBuilder
          key={`groupBoxes-${taskNonce}`}
          groups={task.groups}
          perGroup={task.perGroup}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
        />
      )}

      {task.kind === "groupingEstimate" && (
        <GroupingEstimate
          key={`groupingEstimate-${taskNonce}`}
          tensGroups={task.tensGroups}
          ones={task.ones}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "addDots" && (
        <AddDotsMatch
          key={`addDots-${taskNonce}`}
          a={task.a}
          b={task.b}
          maxDots={task.maxDots}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "ppw" && (
        <PartPartWhole
          key={`ppw-${taskNonce}`}
          mode={task.mode}
          a={task.a}
          b={task.b}
          whole={task.whole}
          missing={task.missing}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "mentalAdd" && (
        <MentalAdd
          key={`mentalAdd-${taskNonce}`}
          prompt={task.prompt}
          equation={task.equation}
          strategy={task.strategy}
          a={task.a}
          b={task.b}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "subtractTakeAway" && (
        <SubtractTakeAway
          key={`subtractTakeAway-${taskNonce}`}
          total={task.total}
          remove={task.remove}
          mode={task.mode}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "subtractMoveToTaken" && (
        <SubtractMoveToTaken
          key={`subtractMoveToTaken-${taskNonce}`}
          total={task.total}
          remove={task.remove}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "subtractMissingPart" && (
        <SubtractMissingPart
          key={`subtractMissingPart-${taskNonce}`}
          total={task.total}
          part={task.part}
          options={task.options}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "subtractBar" && (
        <SubtractBar
          key={`subtractBar-${taskNonce}`}
          total={task.total}
          remove={task.remove}
          options={task.options}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "mentalSubtract" && (
        <MentalSubtract
          key={`mentalSubtract-${taskNonce}`}
          strategy={task.strategy}
          total={task.total}
          remove={task.remove}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "storyOpChoice" && (
        <StoryOpChoice
          key={`storyOpChoice-${taskNonce}`}
          story={task.story}
          answer={task.answer}
          variant={task.variant}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "missingOperation" && (
        <MissingOperation
          key={`missingOperation-${taskNonce}`}
          story={task.story}
          a={task.a}
          b={task.b}
          result={task.result}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "storySolve" && (
        <StorySolve
          key={`storySolve-${taskNonce}`}
          story={task.story}
          a={task.a}
          b={task.b}
          op={task.op}
          answer={task.answer}
          options={task.options}
          requireOpChoice={task.requireOpChoice}
          hideEquation={task.hideEquation}
          allowEquationInput={task.allowEquationInput}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "moneyMakeAmount" && (
        <MoneyMakeAmount
          key={`moneyMakeAmount-${taskNonce}`}
          target={task.target}
          allowTen={task.allowTen}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "moneyChange" && (
        <MoneyChange
          key={`moneyChange-${taskNonce}`}
          paid={task.paid}
          cost={task.cost}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "moneyEnough" && (
        <MoneyEnough
          key={`moneyEnough-${taskNonce}`}
          have={task.have}
          cost={task.cost}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "joinStories" && (
        <JoinStories
          key={`joinStories-${taskNonce}`}
          story={task.story}
          a={task.a}
          b={task.b}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "combineGroups" && (
        <CombineGroups
          key={`combineGroups-${taskNonce}`}
          a={task.a}
          b={task.b}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "compareGroups" && (
        <CompareGroups
          key={`compareGroups-${taskNonce}`}
          a={task.a}
          b={task.b}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "make20Visual" && (
        <Make20Visual
          key={`make20Visual-${taskNonce}`}
          a={task.a}
          b={task.b}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "moneyAddPrices" && (
        <MoneyAddPrices
          key={`moneyAddPrices-${taskNonce}`}
          itemA={task.itemA}
          itemB={task.itemB}
          priceA={task.priceA}
          priceB={task.priceB}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "moneyHowMuchMore" && (
        <MoneyCountUp
          key={`moneyHowMuchMore-${taskNonce}`}
          have={task.have}
          cost={task.cost}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "moneyChangeUp" && (
        <MoneyChangeUp
          key={`moneyChangeUp-${taskNonce}`}
          paid={task.paid}
          cost={task.cost}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "buildStory" && (
        <BuildStory
          key={`buildStory-${taskNonce}`}
          story={task.story}
          mode={task.mode}
          start={task.start}
          change={task.change}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "twoMats" && (
        <TwoMats
          key={`twoMats-${taskNonce}`}
          story={task.story}
          mode={task.mode}
          a={task.a}
          b={task.b}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "whatHappened" && (
        <WhatHappened
          key={`whatHappened-${taskNonce}`}
          before={task.before}
          after={task.after}
          answerOp={task.answerOp}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "barModel" && (
        <BarModelBuilder
          key={`barModel-${taskNonce}`}
          total={task.total}
          part={task.part}
          missing={task.missing}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "compareBars" && (
        <CompareBars
          key={`compareBars-${taskNonce}`}
          story={task.story}
          a={task.a}
          b={task.b}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "strategySelect" && (
        <StrategySelect
          key={`strategySelect-${taskNonce}`}
          total={task.total}
          remove={task.remove}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "shareDrag" && (
        <ShareDrag
          key={`shareDrag-${taskNonce}`}
          total={task.total}
          groups={task.groups}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "shareDeal" && (
        <ShareDeal
          key={`shareDeal-${taskNonce}`}
          total={task.total}
          groups={task.groups}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "shareFair" && (
        <ShareFair
          key={`shareFair-${taskNonce}`}
          total={task.total}
          groups={task.groups}
          distribution={task.distribution}
          isFair={task.isFair}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "groupBoxesInput" && (
        <GroupBoxesInput
          key={`groupBoxesInput-${taskNonce}`}
          total={task.total}
          groups={task.groups}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "groupBoxesTap" && (
        <GroupBoxesTap
          key={`groupBoxesTap-${taskNonce}`}
          total={task.total}
          groups={task.groups}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "missingGroupSize" && (
        <MissingGroupSize
          key={`missingGroupSize-${taskNonce}`}
          total={task.total}
          groups={task.groups}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "packBoxes" && (
        <PackBoxes
          key={`packBoxes-${taskNonce}`}
          total={task.total}
          perBox={task.perBox}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "groupGrabBags" && (
        <GroupGrabBags
          key={`groupGrabBags-${taskNonce}`}
          total={task.total}
          size={task.size}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "howManyGroups" && (
        <HowManyGroups
          key={`howManyGroups-${taskNonce}`}
          total={task.total}
          size={task.size}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "tapGroupsSkipCount" && (
        <TapGroupsSkipCount
          key={`tapGroupsSkipCount-${taskNonce}`}
          groups={task.groups}
          perGroup={task.perGroup}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "buildGroupsSkipCount" && (
        <BuildGroupsSkipCount
          key={`buildGroupsSkipCount-${taskNonce}`}
          total={task.total}
          perGroup={task.perGroup}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "chooseSkipCount" && (
        <ChooseSkipCount
          key={`chooseSkipCount-${taskNonce}`}
          groups={task.groups}
          perGroup={task.perGroup}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "arrayBuilder" && (
        <ArrayBuilder
          key={`arrayBuilder-${taskNonce}`}
          rows={task.rows}
          cols={task.cols}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "barGroupModel" && (
        <BarGroupModel
          key={`barGroupModel-${taskNonce}`}
          groups={task.groups}
          perGroup={task.perGroup}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "missingGroupCount" && (
        <MissingGroupCount
          key={`missingGroupCount-${taskNonce}`}
          perGroup={task.perGroup}
          total={task.total}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "groupStory" && (
        <GroupStory
          key={`groupStory-${taskNonce}`}
          groups={task.groups}
          perGroup={task.perGroup}
          itemLabel={task.itemLabel}
          containerLabel={task.containerLabel}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "howManyGroupsStory" && (
        <HowManyGroupsStory
          key={`howManyGroupsStory-${taskNonce}`}
          total={task.total}
          perGroup={task.perGroup}
          itemLabel={task.itemLabel}
          containerLabel={task.containerLabel}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "twoStepGrouping" && (
        <TwoStepGrouping
          key={`twoStepGrouping-${taskNonce}`}
          groups={task.groups}
          perGroup={task.perGroup}
          broken={task.broken}
          itemLabel={task.itemLabel}
          containerLabel={task.containerLabel}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "flashFacts" && (
        <FlashFacts
          key={`flashFacts-${taskNonce}`}
          durationSeconds={task.durationSeconds}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "make10Builder" && (
        <Make10Builder
          key={`make10Builder-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "missingNumberFacts" && (
        <MissingNumberFacts
          key={`missingNumberFacts-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "doubleIt" && (
        <DoubleIt
          key={`doubleIt-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "nearDouble" && (
        <NearDouble
          key={`nearDouble-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "doubleDetective" && (
        <DoubleDetective
          key={`doubleDetective-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "gridRace" && (
        <GridRace
          key={`gridRace-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "factMatch" && (
        <FactMatch
          key={`factMatch-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
        />
      )}

      {task.kind === "climbLadder" && (
        <ClimbLadder
          key={`climbLadder-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "mixedReviewSprint" && (
        <MixedReviewSprint
          key={`mixedReviewSprint-${taskNonce}`}
          durationSeconds={task.durationSeconds}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onStepCorrect={() => setTimeout(() => markCorrectSoft(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "strategyChoice" && (
        <StrategyChoice
          key={`strategyChoice-${taskNonce}`}
          total={task.total}
          remove={task.remove}
          options={task.options}
          answer={task.answer}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "targetedRevision" && (
        <TargetedRevision
          key={`targetedRevision-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      {task.kind === "funGames" && (
        <FunGames
          key={`funGames-${taskNonce}`}
          onCorrect={() => setTimeout(() => markCorrect(), 0)}
          onWrong={() => markWrong()}
        />
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={nextTask}
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
          type="button"
        >
          New task
        </button>

        <button
          onClick={onComplete}
          className="px-4 py-2 rounded-xl bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 transition"
          type="button"
        >
          Finish (dev)
        </button>
      </div>
    </div>
  );
}
