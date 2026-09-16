/** Keep mathematical evidence that must be read across the page on a full-width canvas. */
export function needsFullWidthAssessment(type: string, visual?: Record<string, unknown>, realmId?: string): boolean {
  if (['number_order', 'fraction_order', 'fraction_number_line', 'pattern_build', 'build_whole'].includes(type)) return true;
  if (Array.isArray(visual?.rows)) return true;
  const description = [visual?.type, visual?.kind, visual?.task].filter(Boolean).join(' ');
  if (/number_?line|numberLine|placement|timetable|journey|construct|pair|coordinate|grid|table|calendar/i.test(description)) return true;
  if (realmId === 'number') {
    // Multi-panel comparisons, strips, charts and algorithms need their original horizontal context.
    return /fraction|sequence|pattern|place_?value|chart|algorithm|compare|comparison|partition|fact_family|story|ordering|packs|tax|context|mixture|estimate/i.test(description);
  }
  return false;
}
