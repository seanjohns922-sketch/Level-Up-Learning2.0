export type TeachingGuide = {
  idea: string;
  steps: string[];
  check: string;
  example?: { prompt: string; answer: string };
};
// These are authored teaching examples, not assessment questions. A replacement
// example deliberately has no generated diagram: its quantities must not be
// paired with a diagram belonging to the old seeded assessment question.
export function g(idea: string, working: string, check: string, prompt?: string, answer?: string): TeachingGuide {
  if ((prompt === undefined) !== (answer === undefined)) throw new Error('Incomplete teaching example');
  return { idea, steps: working.split('|'), check, ...(prompt === undefined ? {} : { example: { prompt, answer: answer! } }) };
}
