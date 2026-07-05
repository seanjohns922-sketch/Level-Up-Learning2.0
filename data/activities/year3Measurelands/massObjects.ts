export type Y3MassUnit = "g" | "kg";
export type Y3MassBenchmark = "lighter" | "about" | "heavier";

export type Y3MassObject = {
  label: string;
  emoji: string;
  unit: Y3MassUnit;
  sensibleMass: string;
  distractorMass: string;
  benchmark: Y3MassBenchmark;
};

export const Y3_GRAM_MASS_OBJECTS: Y3MassObject[] = [
  { label: "paper clip", emoji: "📎", unit: "g", sensibleMass: "1 g", distractorMass: "1 kg", benchmark: "lighter" },
  { label: "feather", emoji: "🪶", unit: "g", sensibleMass: "3 g", distractorMass: "3 kg", benchmark: "lighter" },
  { label: "coin", emoji: "🪙", unit: "g", sensibleMass: "6 g", distractorMass: "6 kg", benchmark: "lighter" },
  { label: "pencil", emoji: "✏️", unit: "g", sensibleMass: "8 g", distractorMass: "8 kg", benchmark: "lighter" },
  { label: "eraser", emoji: "⬛", unit: "g", sensibleMass: "25 g", distractorMass: "25 kg", benchmark: "lighter" },
  { label: "spoon", emoji: "🥄", unit: "g", sensibleMass: "40 g", distractorMass: "40 kg", benchmark: "lighter" },
  { label: "toy car", emoji: "🚗", unit: "g", sensibleMass: "300 g", distractorMass: "300 kg", benchmark: "lighter" },
  { label: "apple", emoji: "🍎", unit: "g", sensibleMass: "180 g", distractorMass: "180 kg", benchmark: "lighter" },
  { label: "orange", emoji: "🍊", unit: "g", sensibleMass: "160 g", distractorMass: "160 kg", benchmark: "lighter" },
  { label: "banana", emoji: "🍌", unit: "g", sensibleMass: "120 g", distractorMass: "120 kg", benchmark: "lighter" },
  { label: "glue stick", emoji: "🧴", unit: "g", sensibleMass: "35 g", distractorMass: "35 kg", benchmark: "lighter" },
  { label: "tennis ball", emoji: "🎾", unit: "g", sensibleMass: "60 g", distractorMass: "60 kg", benchmark: "lighter" },
  { label: "marker", emoji: "🖊️", unit: "g", sensibleMass: "20 g", distractorMass: "20 kg", benchmark: "lighter" },
  { label: "paintbrush", emoji: "🖌️", unit: "g", sensibleMass: "15 g", distractorMass: "15 kg", benchmark: "lighter" },
  { label: "key", emoji: "🔑", unit: "g", sensibleMass: "10 g", distractorMass: "10 kg", benchmark: "lighter" },
  { label: "egg", emoji: "🥚", unit: "g", sensibleMass: "60 g", distractorMass: "60 kg", benchmark: "lighter" },
  { label: "slice of bread", emoji: "🍞", unit: "g", sensibleMass: "40 g", distractorMass: "40 kg", benchmark: "lighter" },
  { label: "small book", emoji: "📕", unit: "g", sensibleMass: "450 g", distractorMass: "450 kg", benchmark: "lighter" },
];

export const Y3_KILOGRAM_MASS_OBJECTS: Y3MassObject[] = [
  { label: "bag of sugar", emoji: "🛍️", unit: "kg", sensibleMass: "1 kg", distractorMass: "1 g", benchmark: "about" },
  { label: "lunchbox", emoji: "🍱", unit: "kg", sensibleMass: "1 kg", distractorMass: "1 g", benchmark: "about" },
  { label: "rock", emoji: "🪨", unit: "kg", sensibleMass: "2 kg", distractorMass: "2 g", benchmark: "heavier" },
  { label: "brick", emoji: "🧱", unit: "kg", sensibleMass: "3 kg", distractorMass: "3 g", benchmark: "heavier" },
  { label: "watermelon", emoji: "🍉", unit: "kg", sensibleMass: "4 kg", distractorMass: "4 g", benchmark: "heavier" },
  { label: "pumpkin", emoji: "🎃", unit: "kg", sensibleMass: "5 kg", distractorMass: "5 g", benchmark: "heavier" },
  { label: "backpack", emoji: "🎒", unit: "kg", sensibleMass: "5 kg", distractorMass: "5 g", benchmark: "heavier" },
  { label: "chair", emoji: "🪑", unit: "kg", sensibleMass: "6 kg", distractorMass: "6 g", benchmark: "heavier" },
  { label: "desk", emoji: "🛋️", unit: "kg", sensibleMass: "20 kg", distractorMass: "20 g", benchmark: "heavier" },
  { label: "suitcase", emoji: "🧳", unit: "kg", sensibleMass: "12 kg", distractorMass: "12 g", benchmark: "heavier" },
  { label: "dog", emoji: "🐕", unit: "kg", sensibleMass: "18 kg", distractorMass: "18 g", benchmark: "heavier" },
  { label: "child", emoji: "🧒", unit: "kg", sensibleMass: "28 kg", distractorMass: "28 g", benchmark: "heavier" },
  { label: "television", emoji: "📺", unit: "kg", sensibleMass: "10 kg", distractorMass: "10 g", benchmark: "heavier" },
  { label: "bicycle", emoji: "🚲", unit: "kg", sensibleMass: "14 kg", distractorMass: "14 g", benchmark: "heavier" },
  { label: "basketball", emoji: "🏀", unit: "kg", sensibleMass: "1 kg", distractorMass: "1 g", benchmark: "about" },
  { label: "cat", emoji: "🐈", unit: "kg", sensibleMass: "4 kg", distractorMass: "4 g", benchmark: "heavier" },
  { label: "school table", emoji: "🪵", unit: "kg", sensibleMass: "18 kg", distractorMass: "18 g", benchmark: "heavier" },
  { label: "full bucket", emoji: "🪣", unit: "kg", sensibleMass: "8 kg", distractorMass: "8 g", benchmark: "heavier" },
];

export const Y3_MASS_OBJECTS: Y3MassObject[] = [
  ...Y3_GRAM_MASS_OBJECTS,
  ...Y3_KILOGRAM_MASS_OBJECTS,
];

export function benchmarkLabel(benchmark: Y3MassBenchmark) {
  if (benchmark === "about") return "About 1 kg";
  if (benchmark === "heavier") return "Heavier than 1 kg";
  return "Lighter than 1 kg";
}

export function unitOption(unit: Y3MassUnit) {
  return unit === "kg" ? "Kilograms (kg)" : "Grams (g)";
}
