export type TeachingGuide = {
  idea: string;
  steps: string[];
  check: string;
  example?: { prompt: string; answer: string; measurement8Visual?: import("@/data/assessments/revisions/year8MeasurementFiveForms").Measurement8Visual };
};
// These are authored teaching examples, not assessment questions. A replacement
// example deliberately has no generated diagram: its quantities must not be
// paired with a diagram belonging to the old seeded assessment question.
export function g(idea: string, working: string, check: string, prompt?: string, answer?: string): TeachingGuide {
  if ((prompt === undefined) !== (answer === undefined)) throw new Error('Incomplete teaching example');
  return { idea, steps: working.split('|'), check, ...(prompt === undefined ? {} : { example: { prompt, answer: answer! } }) };
}
/** An L-shaped plan drawn for a teaching example's own numbers (width w, height h, missing corner cw × ch). */
export function withLPlan(guide: TeachingGuide, w: number, h: number, cw: number, ch: number, edgeLabels?: string[]): TeachingGuide {
  if (!guide.example) throw new Error('withLPlan needs a fixed example');
  return { ...guide, example: { ...guide.example, measurement8Visual: { type: 'measurement_year8_panel', task: 'composite', values: [w, h, cw, ch], unit: 'm', description: 'All corners are right angles. Diagram not to scale.', ...(edgeLabels ? { edgeLabels } : {}) } } };
}
