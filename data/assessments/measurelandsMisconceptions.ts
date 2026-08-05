export type MeasurelandsMisconception = {
  id: string;
  label: string;
  description: string;
  descriptorCodes: readonly string[];
};

export const MEASURELANDS_MISCONCEPTION_LIBRARY: readonly MeasurelandsMisconception[] = [
  {
    id: "routine-sequence",
    label: "Routine sequence",
    description: "Treats days, day parts or relative-day language as unrelated labels rather than an ordered cycle.",
    descriptorCodes: ["AC9MFM02", "AC9M1M03"],
  },
  {
    id: "attribute-confusion",
    label: "Measurement attribute confusion",
    description: "Uses visible size to infer a different attribute such as mass or capacity.",
    descriptorCodes: ["AC9MFM01", "AC9M1M01"],
  },
  {
    id: "duration-comparison-evidence",
    label: "Duration comparison evidence",
    description: "Uses event appearance or familiarity instead of consistent duration evidence when comparing how long events last.",
    descriptorCodes: ["AC9MFM01", "AC9M1M01"],
  },
  {
    id: "visual-position-length",
    label: "Visual position and length",
    description: "Judges length from where an object is placed instead of aligning both objects at the same starting point.",
    descriptorCodes: ["AC9MFM01"],
  },
  {
    id: "day-part-sequence",
    label: "Day-part sequence",
    description: "Confuses the order or meaning of morning, lunchtime, afternoon and night time.",
    descriptorCodes: ["AC9MFM02"],
  },
  {
    id: "non-uniform-units",
    label: "Non-uniform units",
    description: "Treats differently sized informal units as a fair measurement.",
    descriptorCodes: ["AC9M1M01", "AC9M1M02", "AC9M2M01"],
  },
  {
    id: "gaps-or-overlaps",
    label: "Gaps or overlaps",
    description: "Accepts gaps, overlaps or double-counting when iterating a measurement unit.",
    descriptorCodes: ["AC9M1M02", "AC9M2M01"],
  },
  {
    id: "informal-unit-size-count",
    label: "Informal unit size and count",
    description: "Assumes a smaller informal unit produces a smaller count when measuring the same attribute.",
    descriptorCodes: ["AC9M2M01"],
  },
  {
    id: "cross-unit-count-comparison",
    label: "Cross-unit count comparison",
    description: "Compares informal measurement counts without checking whether the same-sized unit was used.",
    descriptorCodes: ["AC9M2M01"],
  },
  {
    id: "ruler-starting-point",
    label: "Ruler starting point",
    description: "Starts at the ruler edge or another mark instead of accounting for the zero point.",
    descriptorCodes: ["AC9M3M02", "AC9M4M01"],
  },
  {
    id: "scale-interval-value",
    label: "Scale interval value",
    description: "Reads every unlabelled interval as one unit or uses the nearest label.",
    descriptorCodes: ["AC9M3M02", "AC9M4M01"],
  },
  {
    id: "capacity-vs-volume",
    label: "Capacity versus volume",
    description: "Confuses how much a container holds with the space occupied by an object.",
    descriptorCodes: ["AC9M3M01", "AC9M3M02", "AC9M4M01", "AC9M5M01"],
  },
  {
    id: "inappropriate-metric-unit",
    label: "Inappropriate metric unit",
    description: "Chooses a unit that does not suit the attribute, scale or required precision.",
    descriptorCodes: ["AC9M3M01", "AC9M5M01", "AC9M6M01"],
  },
  {
    id: "estimate-vs-exact-reading",
    label: "Estimate versus exact reading",
    description: "Treats a benchmark estimate as an exact instrument reading or rejects a reasonable estimate for not being exact.",
    descriptorCodes: ["AC9M3M01"],
  },
  {
    id: "perimeter-vs-area",
    label: "Perimeter versus area",
    description: "Uses a boundary measure when surface coverage is required, or the reverse.",
    descriptorCodes: ["AC9M4M02", "AC9M5M02", "AC9M6M02"],
  },
  {
    id: "linear-vs-square-units",
    label: "Linear versus square units",
    description: "Reports area in linear units or perimeter in square units.",
    descriptorCodes: ["AC9M4M02", "AC9M5M02", "AC9M6M02"],
  },
  {
    id: "conversion-direction",
    label: "Metric conversion direction",
    description: "Multiplies or divides without considering the relative size of the source and target units.",
    descriptorCodes: ["AC9M5M01", "AC9M6M01"],
  },
  {
    id: "mixed-unit-comparison",
    label: "Mixed-unit comparison",
    description: "Compares numerals without first expressing measurements in compatible units.",
    descriptorCodes: ["AC9M3M02", "AC9M4M01", "AC9M5M01", "AC9M6M01"],
  },
  {
    id: "duration-vs-clock-time",
    label: "Duration versus clock time",
    description: "Treats a displayed clock time as an elapsed duration.",
    descriptorCodes: ["AC9M1M03", "AC9M3M03", "AC9M4M03"],
  },
  {
    id: "duration-unit-choice",
    label: "Duration unit choice",
    description: "Chooses a duration unit that is implausibly short or long for a familiar event.",
    descriptorCodes: ["AC9M1M03"],
  },
  {
    id: "calendar-date-vs-duration",
    label: "Calendar date versus duration",
    description: "Treats a calendar date as an amount of elapsed time rather than a location in a calendar sequence.",
    descriptorCodes: ["AC9M1M03"],
  },
  {
    id: "duration-unit-scale",
    label: "Duration unit scale",
    description: "Compares duration numerals without accounting for relationships among days, hours, minutes and seconds.",
    descriptorCodes: ["AC9M3M03"],
  },
  {
    id: "elapsed-time-base-ten",
    label: "Elapsed time as base ten",
    description: "Subtracts clock numerals as base ten or treats 60 minutes as 100 minutes.",
    descriptorCodes: ["AC9M3M03", "AC9M4M03", "AC9M6M03"],
  },
  {
    id: "twelve-vs-twenty-four-hour-time",
    label: "12-hour versus 24-hour time",
    description: "Adds 12 in the wrong period, changes the minutes, or confuses midnight with midday.",
    descriptorCodes: ["AC9M5M03"],
  },
  {
    id: "calendar-inclusive-count",
    label: "Inclusive calendar counting",
    description: "Counts both endpoints automatically when determining elapsed days.",
    descriptorCodes: ["AC9M2M03"],
  },
  {
    id: "calendar-month-length",
    label: "Calendar month length",
    description: "Assumes every month has the same number of days when counting across a month boundary.",
    descriptorCodes: ["AC9M2M03"],
  },
  {
    id: "unequal-fractional-parts",
    label: "Unequal fractional parts",
    description: "Names halves, quarters or eighths without checking that the whole is divided into equal parts.",
    descriptorCodes: ["AC9M2M02"],
  },
  {
    id: "analog-hand-role",
    label: "Analog clock hand roles",
    description: "Interchanges the hour and minute hands or ignores hour-hand movement.",
    descriptorCodes: ["AC9M2M04", "AC9M3M04"],
  },
  {
    id: "quarter-to-hour-name",
    label: "Quarter-to hour name",
    description: "Names the hour just passed instead of the approaching hour when reading quarter-to time.",
    descriptorCodes: ["AC9M2M04"],
  },
  {
    id: "minute-mark-counting",
    label: "Minute-mark counting",
    description: "Counts minute marks from one instead of zero or skips a mark when reading to the nearest minute.",
    descriptorCodes: ["AC9M3M04"],
  },
  {
    id: "turn-size-vs-direction",
    label: "Turn size versus direction",
    description: "Changes turn size when clockwise direction or starting orientation changes.",
    descriptorCodes: ["AC9M2M05", "AC9M3M05"],
  },
  {
    id: "right-angle-orientation",
    label: "Right-angle orientation",
    description: "Assumes rotating a right-angle benchmark changes its size or classification.",
    descriptorCodes: ["AC9M3M05"],
  },
  {
    id: "angle-arm-length",
    label: "Angle arm length",
    description: "Assumes longer angle arms produce a larger angle.",
    descriptorCodes: ["AC9M3M05", "AC9M4M04", "AC9M5M04"],
  },
  {
    id: "angle-classification-range",
    label: "Named-angle range",
    description: "Confuses straight, reflex and revolution angles or treats every angle above 180 degrees as a full turn.",
    descriptorCodes: ["AC9M4M04"],
  },
  {
    id: "rotated-right-angle",
    label: "Rotated right angle",
    description: "Assumes changing an angle's orientation changes whether it is a right angle.",
    descriptorCodes: ["AC9M4M04"],
  },
  {
    id: "am-pm-boundary",
    label: "am and pm boundary",
    description: "Ignores or changes the am or pm period incorrectly when a duration crosses midday or midnight.",
    descriptorCodes: ["AC9M4M03"],
  },
  {
    id: "protractor-baseline",
    label: "Protractor baseline",
    description: "Misaligns the protractor centre or baseline with the angle vertex and arm.",
    descriptorCodes: ["AC9M5M04"],
  },
  {
    id: "protractor-wrong-scale",
    label: "Protractor scale selection",
    description: "Reads the scale that does not begin at zero on the aligned arm.",
    descriptorCodes: ["AC9M5M04"],
  },
  {
    id: "timetable-wait-time",
    label: "Timetable waiting time",
    description: "Omits waiting or transfer time from a journey or itinerary.",
    descriptorCodes: ["AC9M6M03"],
  },
  {
    id: "angle-relationship-confusion",
    label: "Angle relationship confusion",
    description: "Applies 180 or 360 degrees without identifying the actual angle relationship.",
    descriptorCodes: ["AC9M6M04"],
  },
  {
    id: "metric-decimal-place-value",
    label: "Metric decimal place value",
    description: "Moves decimal digits without preserving the measurement's magnitude across units.",
    descriptorCodes: ["AC9M6M01"],
  },
  {
    id: "rectangle-area-factor-pairs",
    label: "Rectangle area factor pairs",
    description: "Assumes a fixed area can be represented by only one rectangle or dimension pair.",
    descriptorCodes: ["AC9M6M02"],
  },
  {
    id: "timetable-earliest-departure",
    label: "Earliest departure assumption",
    description: "Assumes the earliest departing service must also arrive first.",
    descriptorCodes: ["AC9M6M03"],
  },
  {
    id: "timetable-deadline-inclusive",
    label: "Deadline equality",
    description: "Treats an arrival exactly at the stated deadline as late.",
    descriptorCodes: ["AC9M6M03"],
  },
  {
    id: "vertical-opposite-supplement",
    label: "Vertically opposite versus supplementary",
    description: "Adds vertically opposite angles to 180 degrees instead of recognising that they are equal.",
    descriptorCodes: ["AC9M6M04"],
  },
  {
    id: "angle-point-vs-line-total",
    label: "Angles at a point versus on a line",
    description: "Uses 180 degrees for angles around a point or 360 degrees for angles on a straight line.",
    descriptorCodes: ["AC9M6M04"],
  },
] as const;

const MISCONCEPTIONS_BY_ID = new Map(
  MEASURELANDS_MISCONCEPTION_LIBRARY.map((misconception) => [misconception.id, misconception]),
);

export function getMeasurelandsMisconception(id: string): MeasurelandsMisconception | undefined {
  return MISCONCEPTIONS_BY_ID.get(id);
}
