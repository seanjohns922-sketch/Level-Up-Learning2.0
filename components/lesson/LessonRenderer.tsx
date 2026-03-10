"use client";

import AdditionStrategy from "@/components/activities/AdditionStrategy";
import MultipleChoiceActivity from "@/components/activities/MultipleChoiceActivity";
import NumberOrder from "@/components/activities/NumberOrder";
import NumberLineActivity from "@/components/activities/NumberLineActivity";
import PartitionExpand from "@/components/activities/PartitionExpand";
import PlaceValueBuilder from "@/components/activities/PlaceValueBuilder";
import TypedResponseActivity from "@/components/activities/TypedResponseActivity";
import type {
  AdditionStrategyQuestion,
  MultipleChoiceQuestion,
  NumberLineQuestion,
  NumberOrderQuestion,
  PartitionExpandQuestion,
  PlaceValueBuilderQuestion,
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
      return (
        <PlaceValueBuilder
          questionData={questionData as PlaceValueBuilderQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "number_order":
      return (
        <NumberOrder
          questionData={questionData as NumberOrderQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "partition_expand":
      return (
        <PartitionExpand
          questionData={questionData as PartitionExpandQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "number_line":
      return (
        <NumberLineActivity
          questionData={questionData as NumberLineQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "addition_strategy":
      return (
        <AdditionStrategy
          questionData={questionData as AdditionStrategyQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "multiple_choice":
      return (
        <MultipleChoiceActivity
          questionData={questionData as MultipleChoiceQuestion}
          onCorrect={onCorrect}
          onWrong={onWrong}
        />
      );
    case "typed_response":
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
