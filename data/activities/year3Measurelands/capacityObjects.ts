// Shared Year 3 capacity object pool — familiar containers with the unit a good
// measurer would choose and a realistic capacity in that unit. Emoji MATCHES the
// label. Used across Week 4 (Capacity Lab) L1–L3.

export type CapObject = { label: string; emoji: string; unit: "mL" | "L"; capacity: number };

export const ML_OBJECTS: CapObject[] = [
  { label: "teaspoon", emoji: "🥄", unit: "mL", capacity: 5 },
  { label: "medicine cup", emoji: "💧", unit: "mL", capacity: 20 },
  { label: "baby bottle", emoji: "🍼", unit: "mL", capacity: 150 },
  { label: "glass of milk", emoji: "🥛", unit: "mL", capacity: 200 },
  { label: "mug", emoji: "☕", unit: "mL", capacity: 250 },
  { label: "juice box", emoji: "🧃", unit: "mL", capacity: 250 },
  { label: "cup", emoji: "🥤", unit: "mL", capacity: 300 },
  { label: "drink can", emoji: "🥫", unit: "mL", capacity: 375 },
];

export const L_OBJECTS: CapObject[] = [
  { label: "kettle", emoji: "🫖", unit: "L", capacity: 2 },
  { label: "water bottle", emoji: "🍶", unit: "L", capacity: 2 },
  { label: "cooking pot", emoji: "🍲", unit: "L", capacity: 5 },
  { label: "watering can", emoji: "🚿", unit: "L", capacity: 8 },
  { label: "bucket", emoji: "🪣", unit: "L", capacity: 10 },
  { label: "fish tank", emoji: "🐟", unit: "L", capacity: 60 },
  { label: "bathtub", emoji: "🛁", unit: "L", capacity: 150 },
  { label: "barrel", emoji: "🛢️", unit: "L", capacity: 200 },
];

export const ALL_CAP_OBJECTS: CapObject[] = [...ML_OBJECTS, ...L_OBJECTS];
