// ── Measurelands · Week 6 · Clockwork Crossing — time-of-day registry ──
// Foundation time (AC9MFM02): morning / afternoon / evening / night, connected
// to familiar routines. The scenes carry the meaning (sky + sun position / moon;
// activities show a time-window cue), so a non-reader answers from the picture.
// Routines are framed as "usually", not fixed clock times.

const base = "/images/measurelands/timeofday-3d";

export type TimeOfDay = {
  id: string;
  label: string;
  imageSrc: string;
  /** 0 = morning … 3 = night (the order of the day). */
  partIndex: number;
};

export const WEEK6_TIMES: TimeOfDay[] = [
  { id: "morning", label: "Morning", imageSrc: `${base}/morning.png`, partIndex: 0 },
  { id: "afternoon", label: "Afternoon", imageSrc: `${base}/afternoon.png`, partIndex: 1 },
  { id: "evening", label: "Evening", imageSrc: `${base}/evening.png`, partIndex: 2 },
  { id: "night", label: "Night", imageSrc: `${base}/night.png`, partIndex: 3 },
];

export const TIME_BY_ID: Record<string, TimeOfDay> = Object.fromEntries(
  WEEK6_TIMES.map((t) => [t.id, t]),
);

export type DayActivity = {
  id: string;
  label: string;
  imageSrc: string;
  /** The time of day this activity USUALLY happens. */
  timeId: string;
};

export const WEEK6_ACTIVITIES: DayActivity[] = [
  { id: "wakeup", label: "Waking Up", imageSrc: `${base}/wakeup.png`, timeId: "morning" },
  { id: "breakfast", label: "Eating Breakfast", imageSrc: `${base}/breakfast.png`, timeId: "morning" },
  { id: "lunch", label: "Eating Lunch", imageSrc: `${base}/lunch.png`, timeId: "afternoon" },
  { id: "dinner", label: "Eating Dinner", imageSrc: `${base}/dinner.png`, timeId: "evening" },
  { id: "reading-bed", label: "Reading in Bed", imageSrc: `${base}/reading-bed.png`, timeId: "night" },
  { id: "sleeping", label: "Sleeping", imageSrc: `${base}/sleeping.png`, timeId: "night" },
];

export const ACTIVITY_BY_ID: Record<string, DayActivity> = Object.fromEntries(
  WEEK6_ACTIVITIES.map((a) => [a.id, a]),
);
