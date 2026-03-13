"use client";

import AdditionStrategy from "@/components/activities/AdditionStrategy";
import EqualGroups from "@/components/activities/EqualGroups";
import Arrays from "@/components/activities/Arrays";
import DivisionGroups from "@/components/activities/DivisionGroups";
import FactFamily from "@/components/activities/FactFamily";
import MixedWordProblem from "@/components/activities/MixedWordProblem";
import MultipleChoiceActivity from "@/components/activities/MultipleChoiceActivity";
import NumberOrder from "@/components/activities/NumberOrder";
import NumberLineActivity from "@/components/activities/NumberLineActivity";
import OddEvenSort from "@/components/activities/OddEvenSort";
import PartitionExpand from "@/components/activities/PartitionExpand";
import PlaceValueBuilder from "@/components/activities/PlaceValueBuilder";
import SkipCount from "@/components/activities/SkipCount";
import SubtractionStrategy from "@/components/activities/SubtractionStrategy";
import TypedResponseActivity from "@/components/activities/TypedResponseActivity";
import type {
  AdditionStrategyQuestion,
  EqualGroupsQuestion,
  ArraysQuestion,
  DivisionGroupsQuestion,
  FactFamilyQuestion,
  MixedWordProblemQuestion,
  MultipleChoiceQuestion,
  NumberLineQuestion,
  NumberOrderQuestion,
  OddEvenSortQuestion,
  PartitionExpandQuestion,
  PlaceValueBuilderQuestion,
  ReviewQuizQuestion,
  SkipCountQuestion,
  SubtractionStrategyQuestion,
  TypedResponseQuestion,
  Year2QuestionData,
} from "@/data/activities/year2/lessonEngine";
import { generateQuestionForActivity } from "@/data/activities/year2/lessonEngine";
import type { LessonActivity } from "@/data/programs/types";

type LessonRendererProps = {
  activity: LessonActivity;
  prompt: string;
  questionData: Year2QuestionData;
  onCorrect?: () => void;
  onWrong?: () => void;
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
  if (matchesActivity(activity.activityType, questionData.kind)) {
    return questionData;
  }

  logFallback(activity, questionData);
  return generateQuestionForActivity(activity, prompt);
}

function renderNestedActivity({
  activityType,
  questionData,
  prompt,
  onCorrect,
  onWrong,
}: {
  activityType: LessonActivity["activityType"];
  questionData: Year2QuestionData;
  prompt: string;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  return (
    <LessonRenderer
      activity={{ activityType, weight: 1, config: {} }}
      prompt={prompt}
      questionData={questionData}
      onCorrect={onCorrect}
      onWrong={onWrong}
    />
  );
}

export function LessonRenderer({
  activity,
  prompt,
  questionData,
  onCorrect,
  onWrong,
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
      return (
        <FactFamily
          questionData={safeQuestion as FactFamilyQuestion}
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
      if (safeQuestion.kind !== "multiple_choice") {
        return <ErrorCard message="Multiple choice question failed to load." />;
      }
      return (
        <MultipleChoiceActivity
          questionData={safeQuestion as MultipleChoiceQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
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
        />
      );
    }
    default:
      return <ErrorCard message="This activity is not available yet." />;
  }
}
