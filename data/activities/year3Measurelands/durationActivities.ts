// Shared Year 3 duration activity pool — familiar activities with the sensible
// unit and a realistic duration in that unit. Emoji MATCHES the label.
// Used across Week 5 (Time Trails) L1–L3.

export type DurUnit = "s" | "min" | "hr";
export type DurActivity = { label: string; emoji: string; unit: DurUnit; value: number };

export const UNIT_WORD: Record<DurUnit, string> = { s: "seconds", min: "minutes", hr: "hours" };

export function toSeconds(v: number, u: DurUnit) {
  return u === "s" ? v : u === "min" ? v * 60 : v * 3600;
}

export const SEC_ACTIVITIES: DurActivity[] = [
  { label: "blink", emoji: "👁️", unit: "s", value: 1 },
  { label: "clap", emoji: "👏", unit: "s", value: 1 },
  { label: "click your fingers", emoji: "🫰", unit: "s", value: 1 },
  { label: "sneeze", emoji: "🤧", unit: "s", value: 2 },
  { label: "tie your shoes", emoji: "👟", unit: "s", value: 20 },
  { label: "wash your hands", emoji: "🧼", unit: "s", value: 30 },
];

export const MIN_ACTIVITIES: DurActivity[] = [
  { label: "brush your teeth", emoji: "🪥", unit: "min", value: 2 },
  { label: "read a page", emoji: "📖", unit: "min", value: 3 },
  { label: "eat lunch", emoji: "🍽️", unit: "min", value: 20 },
  { label: "do homework", emoji: "📝", unit: "min", value: 30 },
  { label: "ride a bike", emoji: "🚲", unit: "min", value: 30 },
  { label: "swimming lesson", emoji: "🏊", unit: "min", value: 45 },
  { label: "football game", emoji: "⚽", unit: "min", value: 90 },
];

export const HR_ACTIVITIES: DurActivity[] = [
  { label: "watch a movie", emoji: "🍿", unit: "hr", value: 2 },
  { label: "car trip", emoji: "🚗", unit: "hr", value: 3 },
  { label: "flight", emoji: "✈️", unit: "hr", value: 5 },
  { label: "school day", emoji: "🏫", unit: "hr", value: 6 },
  { label: "sleep overnight", emoji: "😴", unit: "hr", value: 8 },
];

export const ALL_ACTIVITIES: DurActivity[] = [...SEC_ACTIVITIES, ...MIN_ACTIVITIES, ...HR_ACTIVITIES];
