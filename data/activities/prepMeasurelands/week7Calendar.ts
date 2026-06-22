// ── Measurelands · Week 7 · Calendar Keep — today / yesterday / tomorrow ──
// Foundation calendar concepts (AC9MFM02). "Today" is the secure anchor; it is
// shown as the bright, starred calendar card (yesterday is faded/past, tomorrow
// is the next day). The star + glow carry the meaning so a non-reader finds
// today without reading. No real date — "today" = the marked day.

const base = "/images/measurelands/calendar";

export type CalendarCard = {
  id: string;
  label: string;
  imageSrc: string;
  isToday: boolean;
};

export const WEEK7_CALENDAR: CalendarCard[] = [
  { id: "yesterday", label: "Yesterday", imageSrc: `${base}/yesterday.svg`, isToday: false },
  { id: "today", label: "Today", imageSrc: `${base}/today.svg`, isToday: true },
  { id: "tomorrow", label: "Tomorrow", imageSrc: `${base}/tomorrow.svg`, isToday: false },
];

export const CALENDAR_BY_ID: Record<string, CalendarCard> = Object.fromEntries(
  WEEK7_CALENDAR.map((c) => [c.id, c]),
);
