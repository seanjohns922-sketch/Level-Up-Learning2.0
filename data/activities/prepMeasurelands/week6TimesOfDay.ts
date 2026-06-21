// ── Measurelands · Week 6 · Clockwork Crossing — time-of-day registry ──
// Foundation time (AC9MFM02): morning / afternoon / evening / night, connected
// to familiar routines. The scenes carry the meaning (sky + sun position / moon;
// activities show a time-window cue), so a non-reader answers from the picture.
// Routines are framed as "usually", not fixed clock times.

const base = "/images/measurelands/timeofday";

export type TimeOfDay = {
  id: string;
  label: string;
  imageSrc: string;
  /** 0 = morning … 3 = night (the order of the day). */
  partIndex: number;
};

export const WEEK6_TIMES: TimeOfDay[] = [
  { id: "morning", label: "Morning", imageSrc: `${base}/morning.svg`, partIndex: 0 },
  { id: "afternoon", label: "Afternoon", imageSrc: `${base}/afternoon.svg`, partIndex: 1 },
  { id: "evening", label: "Evening", imageSrc: `${base}/evening.svg`, partIndex: 2 },
  { id: "night", label: "Night", imageSrc: `${base}/night.svg`, partIndex: 3 },
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
  { id: "wakeup", label: "Waking Up", imageSrc: `${base}/wakeup.svg`, timeId: "morning" },
  { id: "breakfast", label: "Eating Breakfast", imageSrc: `${base}/breakfast.svg`, timeId: "morning" },
  { id: "lunch", label: "Eating Lunch", imageSrc: `${base}/lunch.svg`, timeId: "afternoon" },
  { id: "dinner", label: "Eating Dinner", imageSrc: `${base}/dinner.svg`, timeId: "evening" },
  { id: "reading-bed", label: "Reading in Bed", imageSrc: `${base}/reading-bed.svg`, timeId: "night" },
  { id: "sleeping", label: "Sleeping", imageSrc: `${base}/sleeping.svg`, timeId: "night" },
];

export const ACTIVITY_BY_ID: Record<string, DayActivity> = Object.fromEntries(
  WEEK6_ACTIVITIES.map((a) => [a.id, a]),
);
