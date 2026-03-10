"use client";

import type { ActivityType } from "@/data/programs/buildProgram";
import NumberOrder from "@/components/activities/NumberOrder";

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
      return <PlaceholderActivity label="Place Value Builder" prompt={prompt} config={config} />;
    case "number_order":
      return (
        <NumberOrder
          config={{
            min: typeof config?.min === "number" ? config.min : 100,
            max: typeof config?.max === "number" ? config.max : 1000,
            count: typeof config?.count === "number" ? config.count : 4,
          }}
        />
      );
    case "partition_expand":
      return <PlaceholderActivity label="Partition & Expand" prompt={prompt} config={config} />;
    case "number_line":
      return <PlaceholderActivity label="Number Line" prompt={prompt} config={config} />;
    case "odd_even_sort":
      return <PlaceholderActivity label="Odd / Even Sort" prompt={prompt} config={config} />;
    case "addition_strategy":
      return <PlaceholderActivity label="Addition Strategy" prompt={prompt} config={config} />;
    case "subtraction_strategy":
      return <PlaceholderActivity label="Subtraction Strategy" prompt={prompt} config={config} />;
    case "fact_family":
      return <PlaceholderActivity label="Fact Family" prompt={prompt} config={config} />;
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
