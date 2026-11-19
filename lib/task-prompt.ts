/**
 * The simple question types that don't show their own prompt, so the lesson or
 * quiz page shows it above them. Every other question card shows its prompt
 * itself; showing the page prompt too would print the question twice.
 */
const PAGE_PROMPT_KINDS = new Set(["mcq", "count", "order3", "audioPick", "numberHunt", "groupCountVisual"]);

export function taskNeedsPagePrompt(kind: string) {
  return PAGE_PROMPT_KINDS.has(kind);
}
