export type ActivityType =
  | "place_value_builder"
  | "number_order"
  | "partition_expand"
  | "number_line"
  | "area_model_select"
  | "set_model_select"
  | "build_the_whole"
  | "number_line_place"
  | "fraction_compare"
  | "equivalent_fraction_match"
  | "fraction_decimal_percent_match"
  | "benchmark_sort"
  | "equivalent_fraction_build"
  | "equivalent_fraction_yes_no"
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
  | "typed_response"
  | "speed_round";

export type LessonActivity = {
  activityType: ActivityType;
  weight: number;
  config: Record<string, unknown>;
};
