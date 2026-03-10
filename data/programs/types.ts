export type ActivityType =
  | "place_value_builder"
  | "number_order"
  | "partition_expand"
  | "number_line"
  | "odd_even_sort"
  | "addition_strategy"
  | "subtraction_strategy"
  | "fact_family"
  | "equal_groups"
  | "arrays"
  | "skip_count"
  | "division_groups"
  | "mixed_word_problem"
  | "review_quiz"
  | "multiple_choice"
  | "typed_response";

export type LessonActivity = {
  activityType: ActivityType;
  weight: number;
  config: Record<string, unknown>;
};
