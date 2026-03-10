"use client";

import type { ActivityType } from "@/data/programs/buildProgram";
import AdditionStrategy from "@/components/activities/AdditionStrategy";
import NumberOrder from "@/components/activities/NumberOrder";
import NumberLineActivity from "@/components/activities/NumberLineActivity";
import PartitionExpand from "@/components/activities/PartitionExpand";
import PlaceValueBuilder from "@/components/activities/PlaceValueBuilder";

type LessonRendererProps = {
  activityType: ActivityType;
  config?: Record<string, unknown>;
  prompt: string;
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
  activityType,
  config,
  prompt,
}: LessonRendererProps) {
  switch (activityType) {
    case "place_value_builder":
      return <PlaceValueBuilder config={config} />;
    case "number_order":
      return (
        <NumberOrder
          config={{
            min: typeof config?.min === "number" ? config.min : 100,
            max: typeof config?.max === "number" ? config.max : 1000,
            count: typeof config?.count === "number" ? config.count : 4,
            ascending:
              typeof config?.ascending === "boolean" ? config.ascending : true,
          }}
        />
      );
    case "partition_expand":
      return <PartitionExpand config={config} />;
    case "number_line":
      return <NumberLineActivity config={config} />;
    case "odd_even_sort":
      return <PlaceholderActivity label="Odd / Even Sort" prompt={prompt} config={config} />;
    case "addition_strategy":
      return <AdditionStrategy config={config} />;
    case "subtraction_strategy":
      return <PlaceholderActivity label="Subtraction Strategy" prompt={prompt} config={config} />;
    case "fact_family":
      return <PlaceholderActivity label="Fact Family" prompt={prompt} config={config} />;
    case "equal_groups":
      return <PlaceholderActivity label="Equal Groups" prompt={prompt} config={config} />;
    case "arrays":
      return <PlaceholderActivity label="Arrays" prompt={prompt} config={config} />;
    case "skip_count":
      return <PlaceholderActivity label="Skip Count" prompt={prompt} config={config} />;
    case "division_groups":
      return <PlaceholderActivity label="Division Groups" prompt={prompt} config={config} />;
    case "mixed_word_problem":
      return <PlaceholderActivity label="Mixed Word Problem" prompt={prompt} config={config} />;
    case "review_quiz":
      return <PlaceholderActivity label="Review Quiz" prompt={prompt} config={config} />;
    default:
      return <PlaceholderActivity label="Activity" prompt={prompt} config={config} />;
  }
}
