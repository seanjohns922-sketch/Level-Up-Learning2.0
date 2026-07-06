"use client";

import { memo, useEffect, useRef, type ReactNode } from "react";
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
import GroundMatchTaskCard from "@/components/ground/GroundMatchTaskCard";
import { GroundOrdinalTaskCard } from "@/components/ground/GroundOrdinalTaskCard";
import { GroundSpatialTaskCard } from "@/components/ground/GroundSpatialTaskCard";
import {
  GroundBuildTaskCard,
  GroundCompareTaskCard,
  GroundCollectTaskCard,
  GroundFeedTaskCard,
  GroundFlashTaskCard,
  GroundGrowingCountTaskCard,
  GroundHuntTaskCard,
  GroundMoveCountTaskCard,
  GroundOrderTapTaskCard,
  GroundSequenceTaskCard,
  GroundSoundCountTaskCard,
  GroundTapCountTaskCard,
} from "@/components/ground/GroundMiniGameTask";
import { MeasurelandsCompareTaskCard } from "@/components/measurelands/MeasurelandsCompareTaskCard";
import { MeasurelandsPathTaskCard } from "@/components/measurelands/MeasurelandsPathTaskCard";
import { MeasurelandsValidityTaskCard } from "@/components/measurelands/MeasurelandsValidityTaskCard";
import { MeasurelandsMassMeasureCard } from "@/components/measurelands/MeasurelandsMassMeasureCard";
import { MeasurelandsMassUnitCard } from "@/components/measurelands/MeasurelandsMassUnitCard";
import { MeasurelandsMassScaleCard } from "@/components/measurelands/MeasurelandsMassScaleCard";
import { MeasurelandsCapacityMeasureCard } from "@/components/measurelands/MeasurelandsCapacityMeasureCard";
import { MeasurelandsDurationUnitCard } from "@/components/measurelands/MeasurelandsDurationUnitCard";
import { MeasurelandsWeekCycleCard } from "@/components/measurelands/MeasurelandsWeekCycleCard";
import { MeasurelandsCalendarFindCard } from "@/components/measurelands/MeasurelandsCalendarFindCard";
import { MeasurelandsCalendarNavigateCard } from "@/components/measurelands/MeasurelandsCalendarNavigateCard";
import { MeasurelandsCalendarEventCard } from "@/components/measurelands/MeasurelandsCalendarEventCard";
import { MeasurelandsTimeSequenceCard } from "@/components/measurelands/MeasurelandsTimeSequenceCard";
import { MeasurelandsRoutineSequenceCard } from "@/components/measurelands/MeasurelandsRoutineSequenceCard";
import { MeasurelandsToolChoiceCard } from "@/components/measurelands/MeasurelandsToolChoiceCard";
import { MeasurelandsBalanceScaleCard } from "@/components/measurelands/MeasurelandsBalanceScaleCard";
import { MeasurelandsAnalogClockCard } from "@/components/measurelands/MeasurelandsAnalogClockCard";
import { MeasurelandsRulerCard, MeasurelandsMetreCard, MeasurelandsEstimateCard } from "@/components/measurelands/MeasurelandsRulerCard";
import { MeasurelandsCapacityCard } from "@/components/measurelands/MeasurelandsCapacityCard";
import { MeasurelandsDurationCard } from "@/components/measurelands/MeasurelandsDurationCard";
import { MeasurelandsClockMinuteCard } from "@/components/measurelands/MeasurelandsClockMinuteCard";
import { MeasurelandsPerimeterCard } from "@/components/measurelands/MeasurelandsPerimeterCard";
import { MeasurelandsAreaCard } from "@/components/measurelands/MeasurelandsAreaCard";
import { MeasurelandsTemperatureCard } from "@/components/measurelands/MeasurelandsTemperatureCard";
import { MeasurelandsSurveyorCard } from "@/components/measurelands/MeasurelandsSurveyorCard";
import { MeasurelandsTimeQuestCard } from "@/components/measurelands/MeasurelandsTimeQuestCard";
import { MeasurelandsAngleCard } from "@/components/measurelands/MeasurelandsAngleCard";
import { isPracticeTaskSafe } from "@/lib/task-safety";

type Callbacks = {
  markCorrect: () => void;
  markCorrectSoft: () => void;
  markWrong: () => void;
  markAttempted?: () => void;
};

function TaskRecoveryCard({
  onRecover,
}: {
  onRecover: () => void;
}) {
  const hasRecoveredRef = useRef(false);

  useEffect(() => {
    if (hasRecoveredRef.current) return;
    hasRecoveredRef.current = true;
    const timeout = window.setTimeout(() => onRecover(), 450);
    return () => window.clearTimeout(timeout);
  }, [onRecover]);

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
      <div className="font-bold">Loading the next challenge…</div>
      <div className="mt-1">This task was not available, so we are moving you on automatically.</div>
    </div>
  );
}

function MeasurelandsTaskFrame({
  taskKey,
  taskKind,
  children,
}: {
  taskKey: string;
  taskKind: string;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    let animationFrame = 0;
    const checkOverflow = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        const frame = frameRef.current;
        if (!frame || !document.fullscreenElement) return;
        const rect = frame.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const overflows = rect.bottom > viewportHeight - 8 || frame.scrollHeight > frame.clientHeight + 8;
        if (overflows) {
          console.warn("[Measurelands fullscreen overflow]", {
            taskKind,
            taskKey,
            rectBottom: Math.round(rect.bottom),
            viewportHeight,
            scrollHeight: frame.scrollHeight,
            clientHeight: frame.clientHeight,
          });
        }
      });
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    document.addEventListener("fullscreenchange", checkOverflow);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", checkOverflow);
      document.removeEventListener("fullscreenchange", checkOverflow);
    };
  }, [taskKey, taskKind]);

  return (
    <div ref={frameRef} className="measurelands-task-frame" data-measurelands-task-kind={taskKind}>
      {children}
    </div>
  );
}

/**
 * Renders the active task component using a direct lookup instead of 60+ conditional branches.
 * Only the matched component is instantiated — zero wasted DOM nodes.
 */
function TaskRendererInner({
  task,
  taskNonce,
  callbacks,
}: {
  task: PracticeTask;
  taskNonce: number;
  callbacks: Callbacks;
}) {
  const { markCorrect, markCorrectSoft, markWrong, markAttempted } = callbacks;
  const onC = () => setTimeout(() => markCorrect(), 0);
  const onCS = () => setTimeout(() => markCorrectSoft(), 0);
  const onW = () => markWrong();
  // This renderer fans out across many legacy task variants with different payload shapes.
  // Keep the cast local so the switch stays compact without changing runtime behavior.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = task as any;
  const k = `${task.kind}-${taskNonce}`;

  if (!isPracticeTaskSafe(task)) {
    return <TaskRecoveryCard onRecover={onW} />;
  }

  const wrapMeasurelands = (children: ReactNode) => (
    <MeasurelandsTaskFrame taskKey={k} taskKind={task.kind}>
      {children}
    </MeasurelandsTaskFrame>
  );

  switch (task.kind) {
    case "matchPairs":
      return <MatchThePair key={k} config={t.config} onComplete={onC} />;
    case "countObjects":
      return <CountObjects key={k} config={t.config} onComplete={onC} />;
    case "fillTheJar":
      return <FillTheJar key={k} config={t.config} onComplete={onC} />;
    case "countCircle":
      return <CountAndCircle key={k} config={t.config} onComplete={onC} />;
    case "typeNumber":
      return <TypeTheNumber key={k} min={t.min} max={t.max} rounds={1} answer={t.answer} mode="word" onComplete={onC} />;
    case "numberLadder":
      return <NumberLadder key={k} start={t.start} target={t.target} onComplete={onC} />;
    case "numberLineTap":
      return <NumberLineTap key={k} min={t.min} max={t.max} target={t.target} onComplete={onC} />;
    case "numberLineJump":
      return <NumberLineJump key={k} min={t.min} max={t.max} start={t.start} target={t.target} steps={t.steps ?? [1, -1]} onComplete={onC} />;
    case "chartFill":
      return <NumberChartFill key={k} min={t.min} max={t.max} missing={t.missing} onComplete={onC} />;
    case "tensOnesMcq":
      return <TensOnesMCQ key={k} min={t.min} max={t.max} onCorrect={onC} />;
    case "partitionTwoWays":
      return <PartitionTwoWays key={k} min={t.min} max={t.max} onCorrect={onC} />;
    case "splitStepper":
      return <SplitStepper key={k} target={t.target} max={t.max ?? t.target} onCorrect={onC} />;
    case "mabBuild":
      return <MabBuild key={k} target={t.target} maxTens={Math.min(t.maxTens ?? 9, 9)} maxOnes={Math.min(t.maxOnes ?? 9, 9)} onCorrect={onC} />;
    case "placeValueDice":
      return <PlaceValueDiceMat key={k} onCorrect={onC} />;
    case "equalGroups":
      return <EqualGroupsMaker key={k} onCorrect={onC} />;
    case "equalGroupsMcq":
      return <EqualGroupsMCQ key={k} prompt={t.prompt} options={t.options} correctIndex={t.correctIndex} onCorrect={onC} />;
    case "groupBoxes":
      return <GroupBoxesBuilder key={k} groups={t.groups} perGroup={t.perGroup} onCorrect={onC} />;
    case "groupingEstimate":
      return <GroupingEstimate key={k} tensGroups={t.tensGroups} ones={t.ones} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "addDots":
      return <AddDotsMatch key={k} a={t.a} b={t.b} maxDots={t.maxDots} onCorrect={onC} onWrong={onW} />;
    case "ppw":
      return <PartPartWhole key={k} mode={t.mode} a={t.a} b={t.b} whole={t.whole} missing={t.missing} onCorrect={onC} onWrong={onW} />;
    case "mentalAdd":
      return <MentalAdd key={k} prompt={t.prompt} equation={t.equation} strategy={t.strategy} a={t.a} b={t.b} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "subtractTakeAway":
      return <SubtractTakeAway key={k} total={t.total} remove={t.remove} mode={t.mode} onCorrect={onC} onWrong={onW} />;
    case "subtractMoveToTaken":
      return <SubtractMoveToTaken key={k} total={t.total} remove={t.remove} onCorrect={onC} onWrong={onW} />;
    case "subtractMissingPart":
      return <SubtractMissingPart key={k} total={t.total} part={t.part} options={t.options} onCorrect={onC} onWrong={onW} />;
    case "subtractBar":
      return <SubtractBar key={k} total={t.total} remove={t.remove} options={t.options} onCorrect={onC} onWrong={onW} />;
    case "mentalSubtract":
      return <MentalSubtract key={k} strategy={t.strategy} total={t.total} remove={t.remove} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "storyOpChoice":
      return <StoryOpChoice key={k} story={t.story} answer={t.answer} variant={t.variant} onCorrect={onC} onWrong={onW} />;
    case "missingOperation":
      return <MissingOperation key={k} story={t.story} a={t.a} b={t.b} result={t.result} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "storySolve":
      return <StorySolve key={k} story={t.story} a={t.a} b={t.b} op={t.op} answer={t.answer} options={t.options} requireOpChoice={t.requireOpChoice} hideEquation={t.hideEquation} allowEquationInput={t.allowEquationInput} onCorrect={onC} onWrong={onW} />;
    case "moneyMakeAmount":
      return <MoneyMakeAmount key={k} target={t.target} allowTen={t.allowTen} onCorrect={onC} onWrong={onW} />;
    case "moneyChange":
      return <MoneyChange key={k} paid={t.paid} cost={t.cost} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "moneyEnough":
      return <MoneyEnough key={k} have={t.have} cost={t.cost} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "joinStories":
      return <JoinStories key={k} story={t.story} a={t.a} b={t.b} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "combineGroups":
      return <CombineGroups key={k} a={t.a} b={t.b} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "compareGroups":
      return <CompareGroups key={k} a={t.a} b={t.b} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "make20Visual":
      return <Make20Visual key={k} a={t.a} b={t.b} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "moneyAddPrices":
      return <MoneyAddPrices key={k} itemA={t.itemA} itemB={t.itemB} priceA={t.priceA} priceB={t.priceB} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "moneyHowMuchMore":
      return <MoneyCountUp key={k} have={t.have} cost={t.cost} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "moneyChangeUp":
      return <MoneyChangeUp key={k} paid={t.paid} cost={t.cost} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "buildStory":
      return <BuildStory key={k} story={t.story} mode={t.mode} start={t.start} change={t.change} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "twoMats":
      return <TwoMats key={k} story={t.story} mode={t.mode} a={t.a} b={t.b} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "whatHappened":
      return <WhatHappened key={k} before={t.before} after={t.after} answerOp={t.answerOp} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "barModel":
      return <BarModelBuilder key={k} total={t.total} part={t.part} missing={t.missing} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "compareBars":
      return <CompareBars key={k} story={t.story} a={t.a} b={t.b} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "strategySelect":
      return <StrategySelect key={k} total={t.total} remove={t.remove} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "shareDrag":
      return <ShareDrag key={k} total={t.total} groups={t.groups} onCorrect={onC} onWrong={onW} />;
    case "shareDeal":
      return <ShareDeal key={k} total={t.total} groups={t.groups} onCorrect={onC} onWrong={onW} />;
    case "shareFair":
      return <ShareFair key={k} total={t.total} groups={t.groups} distribution={t.distribution} isFair={t.isFair} onCorrect={onC} onWrong={onW} />;
    case "groupBoxesInput":
      return <GroupBoxesInput key={k} total={t.total} groups={t.groups} onCorrect={onC} onWrong={onW} />;
    case "groupBoxesTap":
      return <GroupBoxesTap key={k} total={t.total} groups={t.groups} onCorrect={onC} onWrong={onW} />;
    case "missingGroupSize":
      return <MissingGroupSize key={k} total={t.total} groups={t.groups} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "packBoxes":
      return <PackBoxes key={k} total={t.total} perBox={t.perBox} onCorrect={onC} onWrong={onW} />;
    case "groupGrabBags":
      return <GroupGrabBags key={k} total={t.total} size={t.size} onCorrect={onC} onWrong={onW} />;
    case "howManyGroups":
      return <HowManyGroups key={k} total={t.total} size={t.size} onCorrect={onC} onWrong={onW} />;
    case "tapGroupsSkipCount":
      return <TapGroupsSkipCount key={k} groups={t.groups} perGroup={t.perGroup} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "buildGroupsSkipCount":
      return <BuildGroupsSkipCount key={k} total={t.total} perGroup={t.perGroup} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "chooseSkipCount":
      return <ChooseSkipCount key={k} groups={t.groups} perGroup={t.perGroup} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "arrayBuilder":
      return <ArrayBuilder key={k} rows={t.rows} cols={t.cols} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "barGroupModel":
      return <BarGroupModel key={k} groups={t.groups} perGroup={t.perGroup} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "missingGroupCount":
      return <MissingGroupCount key={k} perGroup={t.perGroup} total={t.total} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "groupStory":
      return <GroupStory key={k} groups={t.groups} perGroup={t.perGroup} itemLabel={t.itemLabel} containerLabel={t.containerLabel} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "howManyGroupsStory":
      return <HowManyGroupsStory key={k} total={t.total} perGroup={t.perGroup} itemLabel={t.itemLabel} containerLabel={t.containerLabel} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "twoStepGrouping":
      return <TwoStepGrouping key={k} groups={t.groups} perGroup={t.perGroup} broken={t.broken} itemLabel={t.itemLabel} containerLabel={t.containerLabel} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "flashFacts":
      return <FlashFacts key={k} durationSeconds={t.durationSeconds} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "make10Builder":
      return <Make10Builder key={k} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "missingNumberFacts":
      return <MissingNumberFacts key={k} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "doubleIt":
      return <DoubleIt key={k} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "nearDouble":
      return <NearDouble key={k} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "doubleDetective":
      return <DoubleDetective key={k} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "gridRace":
      return <GridRace key={k} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "factMatch":
      return <FactMatch key={k} onCorrect={onC} onStepCorrect={onCS} />;
    case "climbLadder":
      return <ClimbLadder key={k} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "mixedReviewSprint":
      return <MixedReviewSprint key={k} durationSeconds={t.durationSeconds} onCorrect={onC} onStepCorrect={onCS} onWrong={onW} />;
    case "strategyChoice":
      return <StrategyChoice key={k} total={t.total} remove={t.remove} options={t.options} answer={t.answer} onCorrect={onC} onWrong={onW} />;
    case "targetedRevision":
      return <TargetedRevision key={k} onCorrect={onC} onWrong={onW} />;
    case "funGames":
      return <FunGames key={k} onCorrect={onC} onWrong={onW} />;
    case "groundMatch":
      return <GroundMatchTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundOrdinal":
      return <GroundOrdinalTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundSpatial":
      return <GroundSpatialTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "measurementCompare":
      return wrapMeasurelands(<MeasurelandsCompareTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "measurePath":
      return wrapMeasurelands(<MeasurelandsPathTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "measureValidity":
      return wrapMeasurelands(<MeasurelandsValidityTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "rulerMeasure":
      return wrapMeasurelands(<MeasurelandsRulerCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "unitChoice":
      return wrapMeasurelands(<MeasurelandsMetreCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "estimateMeasure":
      return wrapMeasurelands(<MeasurelandsEstimateCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "capacity":
      return wrapMeasurelands(<MeasurelandsCapacityCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "duration":
      return wrapMeasurelands(<MeasurelandsDurationCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "clockMinute":
      return wrapMeasurelands(<MeasurelandsClockMinuteCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "perimeter":
      return wrapMeasurelands(<MeasurelandsPerimeterCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "area":
      return wrapMeasurelands(<MeasurelandsAreaCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "temperature":
      return wrapMeasurelands(<MeasurelandsTemperatureCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "perimeterCalc":
      return wrapMeasurelands(<MeasurelandsSurveyorCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "timeQuest":
      return wrapMeasurelands(<MeasurelandsTimeQuestCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "angleQuest":
      return wrapMeasurelands(<MeasurelandsAngleCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "massMeasure":
      return wrapMeasurelands(<MeasurelandsMassMeasureCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "massUnit":
      return wrapMeasurelands(<MeasurelandsMassUnitCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "massScale":
      return wrapMeasurelands(<MeasurelandsMassScaleCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "capacityMeasure":
      return wrapMeasurelands(<MeasurelandsCapacityMeasureCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "durationUnit":
      return wrapMeasurelands(<MeasurelandsDurationUnitCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "weekCycle":
      return wrapMeasurelands(<MeasurelandsWeekCycleCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "calendarFind":
      return wrapMeasurelands(<MeasurelandsCalendarFindCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "calendarNavigate":
      return wrapMeasurelands(<MeasurelandsCalendarNavigateCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "calendarEvent":
      return wrapMeasurelands(<MeasurelandsCalendarEventCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "toolChoice":
      return wrapMeasurelands(<MeasurelandsToolChoiceCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "timeSequence":
      return wrapMeasurelands(<MeasurelandsTimeSequenceCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "routineSequence":
      return wrapMeasurelands(<MeasurelandsRoutineSequenceCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "balanceScale":
      return wrapMeasurelands(<MeasurelandsBalanceScaleCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "analogClock":
      return wrapMeasurelands(<MeasurelandsAnalogClockCard key={k} task={t} onCorrect={onC} onWrong={onW} />);
    case "groundCollect":
      return <GroundCollectTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundBuild":
      return <GroundBuildTaskCard key={`${k}-${t.prompt}-${t.targetNumber}-${t.referenceGroup?.quantity ?? "none"}-${t.startingBuilt ?? 0}-${t.objectType}`} task={t} onCorrect={onC} onWrong={onW} onInteract={markAttempted} />;
    case "groundCompare":
      return <GroundCompareTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundFlash":
      return <GroundFlashTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundGrowingCount":
      return <GroundGrowingCountTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundHunt":
      return <GroundHuntTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundOrderTap":
      return <GroundOrderTapTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundSequence":
      return <GroundSequenceTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundTapCount":
      return <GroundTapCountTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundMoveCount":
      return <GroundMoveCountTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundFeed":
      return <GroundFeedTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    case "groundSoundCount":
      return <GroundSoundCountTaskCard key={k} task={t} onCorrect={onC} onWrong={onW} />;
    default:
      return <TaskRecoveryCard onRecover={onW} />;
  }
}

export const TaskRenderer = memo(TaskRendererInner);
