import type { PracticeTask } from "@/data/activities/year1/practice-task";

type CompareTask = Extract<PracticeTask, { kind: "measurementCompare" }>;
type CompareObject = CompareTask["objects"][number];
type BalanceTask = Extract<PracticeTask, { kind: "balanceScale" }>;
type BalanceItem = BalanceTask["leftItems"][number];

const BASE = "/images/measurelands/week2-3d";

export type Week2MassThing = {
  id: string;
  label: string;
  icon: string;
  imageSrc: string;
  weight: number;
};

export type Week2MassSet = {
  setId: string;
  items: Week2MassThing[];
};

export const WEEK2_MASS_OBJECTS = {
  feather: { id: "feather", label: "Feather", icon: "🪶", imageSrc: `${BASE}/feather.png`, weight: 1 },
  leaf: { id: "leaf", label: "Leaf", icon: "🍃", imageSrc: `${BASE}/leaf.png`, weight: 1 },
  coin: { id: "coin", label: "Coin", icon: "🪙", imageSrc: `${BASE}/coin.png`, weight: 1 },
  pencil: { id: "pencil", label: "Pencil", icon: "✏️", imageSrc: `${BASE}/pencil.png`, weight: 2 },
  spoon: { id: "spoon", label: "Spoon", icon: "🥄", imageSrc: `${BASE}/spoon.png`, weight: 2 },
  apple: { id: "apple", label: "Apple", icon: "🍎", imageSrc: `${BASE}/apple.png`, weight: 3 },
  backpack: { id: "backpack", label: "Backpack", icon: "🎒", imageSrc: `${BASE}/backpack.png`, weight: 7 },
  boot: { id: "boot", label: "Boot", icon: "🥾", imageSrc: `${BASE}/boot.png`, weight: 7 },
  bucket: { id: "bucket", label: "Bucket", icon: "🪣", imageSrc: `${BASE}/bucket.png`, weight: 7 },
  chair: { id: "chair", label: "Chair", icon: "🪑", imageSrc: `${BASE}/chair.png`, weight: 8 },
  rock: { id: "rock", label: "Rock", icon: "🪨", imageSrc: `${BASE}/rock.png`, weight: 8 },
  watermelon: { id: "watermelon", label: "Watermelon", icon: "🍉", imageSrc: `${BASE}/watermelon.png`, weight: 9 },
  elephant: { id: "elephant", label: "Elephant", icon: "🐘", imageSrc: `${BASE}/elephant.png`, weight: 10 },
} as const satisfies Record<string, Week2MassThing>;

export const WEEK2_LIGHT_OBJECTS: Week2MassThing[] = [
  WEEK2_MASS_OBJECTS.feather,
  WEEK2_MASS_OBJECTS.leaf,
  WEEK2_MASS_OBJECTS.coin,
  WEEK2_MASS_OBJECTS.pencil,
  WEEK2_MASS_OBJECTS.spoon,
  WEEK2_MASS_OBJECTS.apple,
];

export const WEEK2_HEAVY_OBJECTS: Week2MassThing[] = [
  WEEK2_MASS_OBJECTS.backpack,
  WEEK2_MASS_OBJECTS.boot,
  WEEK2_MASS_OBJECTS.bucket,
  WEEK2_MASS_OBJECTS.chair,
  WEEK2_MASS_OBJECTS.rock,
  WEEK2_MASS_OBJECTS.watermelon,
  WEEK2_MASS_OBJECTS.elephant,
];

export const WEEK2_TRIO_SETS: Week2MassSet[] = [
  {
    setId: "feather-apple-backpack",
    items: [WEEK2_MASS_OBJECTS.feather, WEEK2_MASS_OBJECTS.apple, WEEK2_MASS_OBJECTS.backpack],
  },
  {
    setId: "leaf-boot-rock",
    items: [WEEK2_MASS_OBJECTS.leaf, WEEK2_MASS_OBJECTS.boot, WEEK2_MASS_OBJECTS.rock],
  },
  {
    setId: "coin-spoon-bucket",
    items: [WEEK2_MASS_OBJECTS.coin, WEEK2_MASS_OBJECTS.spoon, WEEK2_MASS_OBJECTS.bucket],
  },
  {
    setId: "pencil-chair-elephant",
    items: [WEEK2_MASS_OBJECTS.pencil, WEEK2_MASS_OBJECTS.chair, WEEK2_MASS_OBJECTS.elephant],
  },
  {
    setId: "feather-apple-watermelon",
    items: [WEEK2_MASS_OBJECTS.feather, WEEK2_MASS_OBJECTS.apple, WEEK2_MASS_OBJECTS.watermelon],
  },
];

export const WEEK2_QUAD_SETS: Week2MassSet[] = [
  {
    setId: "feather-apple-backpack-elephant",
    items: [WEEK2_MASS_OBJECTS.feather, WEEK2_MASS_OBJECTS.apple, WEEK2_MASS_OBJECTS.backpack, WEEK2_MASS_OBJECTS.elephant],
  },
  {
    setId: "leaf-spoon-boot-rock",
    items: [WEEK2_MASS_OBJECTS.leaf, WEEK2_MASS_OBJECTS.spoon, WEEK2_MASS_OBJECTS.boot, WEEK2_MASS_OBJECTS.rock],
  },
  {
    setId: "coin-pencil-bucket-chair",
    items: [WEEK2_MASS_OBJECTS.coin, WEEK2_MASS_OBJECTS.pencil, WEEK2_MASS_OBJECTS.bucket, WEEK2_MASS_OBJECTS.chair],
  },
  {
    setId: "feather-coin-apple-watermelon",
    items: [WEEK2_MASS_OBJECTS.feather, WEEK2_MASS_OBJECTS.coin, WEEK2_MASS_OBJECTS.apple, WEEK2_MASS_OBJECTS.watermelon],
  },
];

export const WEEK2_BALANCE_OBJECTS: Week2MassThing[] = [
  WEEK2_MASS_OBJECTS.apple,
  WEEK2_MASS_OBJECTS.backpack,
  WEEK2_MASS_OBJECTS.boot,
  WEEK2_MASS_OBJECTS.bucket,
  WEEK2_MASS_OBJECTS.chair,
  WEEK2_MASS_OBJECTS.coin,
  WEEK2_MASS_OBJECTS.elephant,
  WEEK2_MASS_OBJECTS.feather,
  WEEK2_MASS_OBJECTS.leaf,
  WEEK2_MASS_OBJECTS.pencil,
  WEEK2_MASS_OBJECTS.rock,
  WEEK2_MASS_OBJECTS.spoon,
  WEEK2_MASS_OBJECTS.watermelon,
];

export function toWeek2MassCompareObject(
  thing: Week2MassThing,
  accent: CompareObject["accent"],
  suffix = "",
): CompareObject {
  return {
    id: `${thing.id}${suffix}`,
    label: thing.label,
    icon: thing.icon,
    imageSrc: thing.imageSrc,
    compareValue: thing.weight,
    axis: "mass",
    accent,
  };
}

export function toWeek2BalanceItem(thing: Week2MassThing, suffix = ""): BalanceItem {
  return {
    id: `${thing.id}${suffix}`,
    label: thing.label,
    icon: thing.icon,
    imageSrc: thing.imageSrc,
    weight: thing.weight,
  };
}

