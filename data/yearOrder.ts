export const YEAR_ORDER = [
  "Prep",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];

export function compareByYear(a: { yearText: string }, b: { yearText: string }) {
  return YEAR_ORDER.indexOf(a.yearText) - YEAR_ORDER.indexOf(b.yearText);
}
