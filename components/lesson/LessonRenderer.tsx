"use client";

import AdditionStrategy from "@/components/activities/AdditionStrategy";
import EqualGroups from "@/components/activities/EqualGroups";
import Arrays from "@/components/activities/Arrays";
import DivisionGroups from "@/components/activities/DivisionGroups";
import FactFamily from "@/components/activities/FactFamily";
import FactFamilyWrite from "@/components/activities/FactFamilyWrite";
import MixedWordProblem from "@/components/activities/MixedWordProblem";
import MultipleChoiceActivity from "@/components/activities/MultipleChoiceActivity";
import NumberOrder from "@/components/activities/NumberOrder";
import NumberLineActivity from "@/components/activities/NumberLineActivity";
import AreaModelSelect from "@/components/activities/AreaModelSelect";
import SetModelSelect from "@/components/activities/SetModelSelect";
import BuildTheWhole from "@/components/activities/BuildTheWhole";
import NumberLinePlace from "@/components/activities/NumberLinePlace";
import FractionCompare from "@/components/activities/FractionCompare";
import EquivalentFractionBar from "@/components/activities/EquivalentFractionBar";
import FractionDecimalPercentMatch from "@/components/activities/FractionDecimalPercentMatch";
import BenchmarkSort from "@/components/activities/BenchmarkSort";
import OddEvenSort from "@/components/activities/OddEvenSort";
import PartitionExpand from "@/components/activities/PartitionExpand";
import PlaceValueBuilder from "@/components/activities/PlaceValueBuilder";
import SkipCount from "@/components/activities/SkipCount";
import SubtractionStrategy from "@/components/activities/SubtractionStrategy";
import TypedResponseActivity from "@/components/activities/TypedResponseActivity";
import SpeedRound from "@/components/activities/SpeedRound";
import type { SpeedRoundQuestion } from "@/data/activities/year2/lessonEngine";
import type {
  AdditionStrategyQuestion,
  EqualGroupsQuestion,
  ArraysQuestion,
  AreaModelSelectQuestion,
  SetModelSelectQuestion,
  BuildTheWholeQuestion,
  NumberLinePlaceQuestion,
  FractionCompareQuestion,
  EquivalentFractionMatchQuestion,
  FractionDecimalPercentMatchQuestion,
  BenchmarkSortQuestion,
  EquivalentFractionBuildQuestion,
  EquivalentFractionYesNoQuestion,
  DivisionGroupsQuestion,
  FactFamilyQuestion,
  MixedWordProblemQuestion,
  MultipleChoiceQuestion,
  NumberLineQuestion,
  NumberOrderQuestion,
  OddEvenSortQuestion,
  PartitionExpandQuestion,
  PlaceValueBuilderQuestion,
  SkipCountQuestion,
  SubtractionStrategyQuestion,
  TypedResponseQuestion,
  Year2QuestionData,
} from "@/data/activities/year2/lessonEngine";
import type { LessonActivity } from "@/data/programs/types";

type LessonRendererProps = {
  activity: LessonActivity;
  prompt: string;
  questionData: Year2QuestionData;
  onCorrect?: () => void;
  onWrong?: () => void;
  renderMode?: "lesson" | "quiz";
};

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 shadow-sm">
      {message}
    </div>
  );
}

function logFallback(activity: LessonActivity, questionData: Year2QuestionData) {
  console.warn("LessonRenderer fallback", {
    activityType: activity.activityType,
    questionKind: questionData?.kind,
    questionData,
  });
}

function toSafeMultipleChoiceQuestion(
  activity: LessonActivity,
  questionData: Year2QuestionData,
  prompt: string
): MultipleChoiceQuestion {
  const fallbackPrompt =
    typeof questionData?.prompt === "string" && questionData.prompt.trim().length > 0
      ? questionData.prompt
      : prompt || "Choose the best answer.";
  const fallbackAnswer =
    "answer" in questionData && questionData.answer !== undefined && questionData.answer !== null
      ? String(questionData.answer)
      : "Yes";

  if (questionData.kind === "multiple_choice") {
    const safeOptions = Array.isArray(questionData.options)
      ? questionData.options.filter(
          (option): option is string => typeof option === "string" && option.trim().length > 0
        )
      : [];
    const answerInOptions = safeOptions.includes(questionData.answer);
    if (safeOptions.length >= 2 && answerInOptions) {
      return questionData;
    }

    console.warn("Invalid MC Question:", {
      activityType: activity.activityType,
      questionData,
    });

    const repairedOptions = answerInOptions
      ? safeOptions
      : Array.from(new Set([questionData.answer, ...safeOptions].filter(Boolean)));

    return {
      ...questionData,
      prompt: fallbackPrompt,
      options:
        repairedOptions.length >= 2
          ? repairedOptions
          : [fallbackAnswer, "No", "Maybe"].slice(0, 3),
      answer:
        repairedOptions.length >= 2 && repairedOptions.includes(questionData.answer)
          ? questionData.answer
          : fallbackAnswer,
    };
  }

  console.warn("Invalid MC Question:", {
    activityType: activity.activityType,
    questionData,
  });

  return {
    kind: "multiple_choice",
    prompt: fallbackPrompt,
    options: [fallbackAnswer, "No", "Maybe"].slice(0, 3),
    answer: fallbackAnswer,
    helper: "Choose the best answer.",
  };
}

function matchesActivity(activityType: LessonActivity["activityType"], questionKind: Year2QuestionData["kind"]) {
  if (activityType === "multiple_choice" || activityType === "typed_response") {
    return activityType === questionKind;
  }

  return activityType === questionKind;
}

function getSafeQuestion(
  activity: LessonActivity,
  questionData: Year2QuestionData,
  prompt: string
) {
  void prompt;
  if (matchesActivity(activity.activityType, questionData.kind)) {
    return questionData;
  }

  logFallback(activity, questionData);
  return questionData;
}

function renderNestedActivity({
  activityType,
  questionData,
  prompt,
  onCorrect,
  onWrong,
  renderMode,
}: {
  activityType: LessonActivity["activityType"];
  questionData: Year2QuestionData;
  prompt: string;
  onCorrect?: () => void;
  onWrong?: () => void;
  renderMode?: "lesson" | "quiz";
}) {
  return (
    <LessonRenderer
      activity={{ activityType, weight: 1, config: {} }}
      prompt={prompt}
      questionData={questionData}
      onCorrect={onCorrect}
      onWrong={onWrong}
      renderMode={renderMode}
    />
  );
}

export function LessonRenderer({
  activity,
  prompt,
  questionData,
  onCorrect,
  onWrong,
  renderMode = "lesson",
}: LessonRendererProps) {
  switch (activity.activityType) {
    case "place_value_builder": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "place_value_builder") {
        return <ErrorCard message="Place value question failed to load." />;
      }
      return (
        <PlaceValueBuilder
          questionData={safeQuestion as PlaceValueBuilderQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "number_order": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "number_order") {
        return <ErrorCard message="Number order question failed to load." />;
      }
      return (
        <NumberOrder
          questionData={safeQuestion as NumberOrderQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "partition_expand": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "partition_expand") {
        return <ErrorCard message="Partition question failed to load." />;
      }
      return (
        <PartitionExpand
          questionData={safeQuestion as PartitionExpandQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "number_line": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "number_line") {
        return <ErrorCard message="Number line question failed to load." />;
      }
      return (
        <NumberLineActivity
          questionData={safeQuestion as NumberLineQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "area_model_select": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "area_model_select") {
        return <ErrorCard message="Area model question failed to load." />;
      }
      return (
        <AreaModelSelect
          questionData={safeQuestion as AreaModelSelectQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "set_model_select": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "set_model_select") {
        return <ErrorCard message="Set model question failed to load." />;
      }
      return (
        <SetModelSelect
          questionData={safeQuestion as SetModelSelectQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "build_the_whole": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "build_the_whole") {
        return <ErrorCard message="Build the whole question failed to load." />;
      }
      return (
        <BuildTheWhole
          questionData={safeQuestion as BuildTheWholeQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "number_line_place": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "number_line_place") {
        return <ErrorCard message="Fraction number line question failed to load." />;
      }
      return (
        <NumberLinePlace
          questionData={safeQuestion as NumberLinePlaceQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
          renderMode={renderMode}
        />
      );
    }
    case "fraction_compare": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "fraction_compare") {
        return <ErrorCard message="Fraction comparison question failed to load." />;
      }
      return (
        <FractionCompare
          questionData={safeQuestion as FractionCompareQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "equivalent_fraction_match": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "equivalent_fraction_match") {
        return <ErrorCard message="Equivalent fraction match failed to load." />;
      }
      return (
        <EquivalentFractionBar
          questionData={safeQuestion as EquivalentFractionMatchQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "fraction_decimal_percent_match": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "fraction_decimal_percent_match") {
        return <ErrorCard message="Fraction, decimal and percentage match failed to load." />;
      }
      return (
        <FractionDecimalPercentMatch
          questionData={safeQuestion as FractionDecimalPercentMatchQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "benchmark_sort": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "benchmark_sort") {
        return <ErrorCard message="Benchmark sort question failed to load." />;
      }
      return (
        <BenchmarkSort
          questionData={safeQuestion as BenchmarkSortQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "equivalent_fraction_build": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "equivalent_fraction_build") {
        return <ErrorCard message="Equivalent fraction build failed to load." />;
      }
      return (
        <EquivalentFractionBar
          questionData={safeQuestion as EquivalentFractionBuildQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "equivalent_fraction_yes_no": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "equivalent_fraction_yes_no") {
        return <ErrorCard message="Equivalent fraction yes/no failed to load." />;
      }
      return (
        <EquivalentFractionBar
          questionData={safeQuestion as EquivalentFractionYesNoQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "addition_strategy": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "addition_strategy") {
        return <ErrorCard message="Addition strategy question failed to load." />;
      }
      return (
        <AdditionStrategy
          questionData={safeQuestion as AdditionStrategyQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "equal_groups": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "equal_groups") {
        return <ErrorCard message="Equal groups question failed to load." />;
      }
      return (
        <EqualGroups
          questionData={safeQuestion as EqualGroupsQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "arrays": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "arrays") {
        return <ErrorCard message="Array question failed to load." />;
      }
      return (
        <Arrays
          questionData={safeQuestion as ArraysQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "division_groups": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "division_groups") {
        return <ErrorCard message="Division groups question failed to load." />;
      }
      return (
        <DivisionGroups
          questionData={safeQuestion as DivisionGroupsQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "mixed_word_problem": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "mixed_word_problem") {
        return <ErrorCard message="Mixed word problem failed to load." />;
      }
      return (
        <MixedWordProblem
          questionData={safeQuestion as MixedWordProblemQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "review_quiz": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "review_quiz") {
        return <ErrorCard message="Review quiz failed to load." />;
      }
        return renderNestedActivity({
          activityType: safeQuestion.activityType,
          questionData: safeQuestion.question,
          prompt,
          onCorrect,
          onWrong,
          renderMode,
        });
    }
    case "subtraction_strategy": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "subtraction_strategy") {
        return <ErrorCard message="Subtraction strategy question failed to load." />;
      }
      return (
        <SubtractionStrategy
          questionData={safeQuestion as SubtractionStrategyQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "fact_family": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "fact_family") {
        return <ErrorCard message="Fact family question failed to load." />;
      }
      const ffQuestion = safeQuestion as FactFamilyQuestion;
      if (ffQuestion.mode === "write_sentences") {
        return (
          <FactFamilyWrite
            questionData={ffQuestion}
            onCorrect={onCorrect}
            onWrong={onWrong}
          />
        );
      }
      return (
        <FactFamily
          questionData={ffQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "odd_even_sort": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "odd_even_sort") {
        return <ErrorCard message="Odd and even question failed to load." />;
      }
      return (
        <OddEvenSort
          questionData={safeQuestion as OddEvenSortQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "skip_count": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "skip_count") {
        return <ErrorCard message="Skip count question failed to load." />;
      }
      return (
        <SkipCount
          questionData={safeQuestion as SkipCountQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    case "multiple_choice": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      return (
        <MultipleChoiceActivity
          questionData={toSafeMultipleChoiceQuestion(activity, safeQuestion, prompt)}
          onCorrect={onCorrect}
          onWrong={onWrong}
          renderMode={renderMode}
        />
      );
    }
    case "typed_response": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "typed_response") {
        return <ErrorCard message="Typed response question failed to load." />;
      }
      return (
        <TypedResponseActivity
          questionData={safeQuestion as TypedResponseQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
          renderMode={renderMode}
        />
      );
    }
    case "speed_round": {
      const safeQuestion = getSafeQuestion(activity, questionData, prompt);
      if (safeQuestion.kind !== "speed_round") {
        return <ErrorCard message="Speed round failed to load." />;
      }
      return (
        <SpeedRound
          questionData={safeQuestion as SpeedRoundQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    }
    default:
      return <ErrorCard message="This activity is not available yet." />;
  }
}
