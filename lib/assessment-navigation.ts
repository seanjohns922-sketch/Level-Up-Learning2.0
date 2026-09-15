/** Answering (including an explicit 'I don't know') unlocks the next item.
 * Derive access from restored answers, never correctness or browser-only state. */
export function canVisitAssessmentQuestion(index: number, answered: readonly boolean[], currentIndex: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index >= answered.length) return false;
  const firstUnanswered = answered.findIndex(value => !value);
  const frontier = firstUnanswered < 0 ? answered.length - 1 : firstUnanswered;
  return index <= frontier || answered[index] || index === currentIndex;
}
