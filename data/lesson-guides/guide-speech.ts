import { guideVisualSpeech } from "./guide-visual";
import type { LowerLessonGuide } from "./lower-level";

/** Read symbols in examples as words. */
export function spoken(text: string) {
  const words: [string, string][] = [['●', ' dot '], ['★', ' star '], ['▲', ' triangle '], ['■', ' square '], ['⊘', ' crossed out '], ['²', ' squared '], ['<', ' less than '], ['>', ' greater than '], ['→', ', gives '], ['−', ' minus ']];
  return words.reduce((t, [symbol, word]) => t.replaceAll(symbol, word), text).replace(/\s+/g, ' ').trim();
}

export const GUIDE_TIMER_TEXT = 'Read at your own pace. Your practice timer is paused.';
export const guideAction = (review: boolean) => (review ? 'Back to practice' : 'Let’s practise');

/**
 * Every sentence a Learn the Skill guide reads aloud. Shared by the guide and by
 * scripts/voice/generate-clips.mjs, so recorded clips match what the app speaks.
 */
export function lowerGuideSpeech(guide: LowerLessonGuide, review = false) {
  const example = `Worked example. ${guide.visual ? guideVisualSpeech(guide.visual) + ' ' : ''}${spoken(guide.example)}`;
  const steps = guide.steps.map((s, i) => `Step ${i + 1}. ${spoken(s)}`);
  const tip = `Tip. ${guide.tip}`;
  const instructions = `${GUIDE_TIMER_TEXT} Choose ${guideAction(review)} when ready.`;
  return { idea: guide.idea, example, steps, tip, instructions, whole: ['Learn the skill.', guide.idea, example, 'How to solve it.', ...steps, tip, instructions] };
}
