// ── Measurelands · Week 5 · Daylight Grove — days of the week registry ──
// Foundation time (AC9MFM02): name and sequence the 7 days, know the fixed
// cyclical order, and the weekday/weekend split. Days are SYMBOLIC, not
// pictorial, so each card carries non-reader cues baked into the art: a 7-dot
// week-trail (position), a consistent day colour, and a routine scene (school
// for weekdays, sport/park for the weekend). Label + speaker are support layers.

export type DayOfWeek = {
  id: string;
  label: string;
  imageSrc: string;
  /** 0 = Monday … 6 = Sunday (the fixed weekly order). */
  dayIndex: number;
  isWeekend: boolean;
};

const base = "/images/measurelands/days-3d";

export const WEEK5_DAYS: DayOfWeek[] = [
  { id: "monday", label: "Monday", imageSrc: `${base}/monday.png`, dayIndex: 0, isWeekend: false },
  { id: "tuesday", label: "Tuesday", imageSrc: `${base}/tuesday.png`, dayIndex: 1, isWeekend: false },
  { id: "wednesday", label: "Wednesday", imageSrc: `${base}/wednesday.png`, dayIndex: 2, isWeekend: false },
  { id: "thursday", label: "Thursday", imageSrc: `${base}/thursday.png`, dayIndex: 3, isWeekend: false },
  { id: "friday", label: "Friday", imageSrc: `${base}/friday.png`, dayIndex: 4, isWeekend: false },
  { id: "saturday", label: "Saturday", imageSrc: `${base}/saturday.png`, dayIndex: 5, isWeekend: true },
  { id: "sunday", label: "Sunday", imageSrc: `${base}/sunday.png`, dayIndex: 6, isWeekend: true },
];

/** The day after a given index, wrapping Sunday → Monday (the cycle). */
export function nextDay(dayIndex: number): DayOfWeek {
  return WEEK5_DAYS[(dayIndex + 1) % 7]!;
}
