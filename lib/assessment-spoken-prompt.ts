/** Prefer the authored description of mathematical/context information when available. */
export function assessmentSpokenPrompt(question: {prompt: string; readAloudText?: unknown}): string {
  return typeof question.readAloudText === 'string' && question.readAloudText.trim() ? question.readAloudText : question.prompt;
}
