// ── Measurelands · Week 4 · Duration Dunes — shared activity registry ──
// Familiar Foundation events with a relative duration rank (lower = quicker).
// Ranks are spaced so "obviously different" pairs are easy to enforce: a compare
// pair must differ by >= 4, and Quick/Slow only uses ranks <=3 or >=7 (the
// ambiguous middle is never sorted). Foundation duration is experienced, not
// measured — no minutes, clocks or timers.

export type DurationActivity = {
  id: string;
  label: string;
  imageSrc: string;
  /** Relative duration rank (1 = quickest … 10 = longest). Ordering only. */
  durationValue: number;
};

const base = "/images/measurelands/duration-3d";

export const WEEK4_ACTIVITIES: Record<string, DurationActivity> = {
  washHands: { id: "wash-hands", label: "Washing Hands", imageSrc: `${base}/wash-hands.png`, durationValue: 1 },
  shoes: { id: "shoes", label: "Putting on Shoes", imageSrc: `${base}/shoes.png`, durationValue: 2 },
  brushTeeth: { id: "brush-teeth", label: "Brushing Teeth", imageSrc: `${base}/brush-teeth.png`, durationValue: 3 },
  drawing: { id: "drawing", label: "Drawing a Picture", imageSrc: `${base}/drawing.png`, durationValue: 5 },
  reading: { id: "reading", label: "Reading a Story", imageSrc: `${base}/reading.png`, durationValue: 5 },
  lunch: { id: "lunch", label: "Eating Lunch", imageSrc: `${base}/lunch.png`, durationValue: 6 },
  sandcastle: { id: "sandcastle", label: "Building a Sandcastle", imageSrc: `${base}/sandcastle.png`, durationValue: 7 },
  travel: { id: "travel", label: "Travelling to School", imageSrc: `${base}/travel.png`, durationValue: 7 },
  movie: { id: "movie", label: "Watching a Movie", imageSrc: `${base}/movie.png`, durationValue: 9 },
  sleeping: { id: "sleeping", label: "Sleeping", imageSrc: `${base}/sleeping.png`, durationValue: 10 },
};

export const WEEK4_ACTIVITY_LIST: DurationActivity[] = Object.values(WEEK4_ACTIVITIES);
