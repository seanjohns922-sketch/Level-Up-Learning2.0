"use client";

import AdditionStrategy from "@/components/activities/AdditionStrategy";
import FactFamily from "@/components/activities/FactFamily";
import MultipleChoiceActivity from "@/components/activities/MultipleChoiceActivity";
import NumberOrder from "@/components/activities/NumberOrder";
import NumberLineActivity from "@/components/activities/NumberLineActivity";
import PartitionExpand from "@/components/activities/PartitionExpand";
import PlaceValueBuilder from "@/components/activities/PlaceValueBuilder";
import SkipCount from "@/components/activities/SkipCount";
import SubtractionStrategy from "@/components/activities/SubtractionStrategy";
import TypedResponseActivity from "@/components/activities/TypedResponseActivity";
import type {
  AdditionStrategyQuestion,
  FactFamilyQuestion,
  MultipleChoiceQuestion,
  NumberLineQuestion,
  NumberOrderQuestion,
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
};

function PlaceholderActivity({
  label,
  prompt,
  config,
}: {
  label: string;
  prompt: string;
  config?: Record<string, unknown>;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
        {label}
      </div>
      <p className="mt-2 text-base text-gray-900">{prompt}</p>
      {config ? (
        <pre className="mt-4 overflow-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
          {JSON.stringify(config, null, 2)}
        </pre>
      ) : null}
    </div>
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
    case "place_value_builder":
      if (questionData.kind !== "place_value_builder") {
        return <PlaceholderActivity label="Place Value Builder" prompt={prompt} config={activity.config} />;
      }
      return (
        <PlaceValueBuilder
          questionData={questionData as PlaceValueBuilderQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "number_order":
      if (questionData.kind !== "number_order") {
        return <PlaceholderActivity label="Number Order" prompt={prompt} config={activity.config} />;
      }
      return (
        <NumberOrder
          questionData={questionData as NumberOrderQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "partition_expand":
      if (questionData.kind !== "partition_expand") {
        return <PlaceholderActivity label="Partition Expand" prompt={prompt} config={activity.config} />;
      }
      return (
        <PartitionExpand
          questionData={questionData as PartitionExpandQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "number_line":
      if (questionData.kind !== "number_line") {
        return <PlaceholderActivity label="Number Line" prompt={prompt} config={activity.config} />;
      }
      return (
        <NumberLineActivity
          questionData={questionData as NumberLineQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "addition_strategy":
      if (questionData.kind !== "addition_strategy") {
        return <PlaceholderActivity label="Addition Strategy" prompt={prompt} config={activity.config} />;
      }
      return (
        <AdditionStrategy
          questionData={questionData as AdditionStrategyQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "subtraction_strategy":
      if (questionData.kind !== "subtraction_strategy") {
        return <PlaceholderActivity label="Subtraction Strategy" prompt={prompt} config={activity.config} />;
      }
      return (
        <SubtractionStrategy
          questionData={questionData as SubtractionStrategyQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "fact_family":
      if (questionData.kind !== "fact_family") {
        return <PlaceholderActivity label="Fact Family" prompt={prompt} config={activity.config} />;
      }
      return (
        <FactFamily
          questionData={questionData as FactFamilyQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "skip_count":
      if (questionData.kind !== "skip_count") {
        return <PlaceholderActivity label="Skip Count" prompt={prompt} config={activity.config} />;
      }
      return (
        <SkipCount
          questionData={questionData as SkipCountQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "multiple_choice":
      if (questionData.kind !== "multiple_choice") {
        return <PlaceholderActivity label="Multiple Choice" prompt={prompt} config={activity.config} />;
      }
      return (
        <MultipleChoiceActivity
          questionData={questionData as MultipleChoiceQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "typed_response":
      if (questionData.kind !== "typed_response") {
        return <PlaceholderActivity label="Typed Response" prompt={prompt} config={activity.config} />;
      }
      return (
        <TypedResponseActivity
          questionData={questionData as TypedResponseQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    default:
      return (
        <PlaceholderActivity
          label={activity.activityType.replace(/_/g, " ")}
          prompt={prompt}
          config={activity.config}
        />
      );
  }
}
