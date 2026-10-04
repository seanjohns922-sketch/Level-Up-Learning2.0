/** Shared question picking for Level 7 weekly quizzes (five questions per lesson). */
export const LEVEL7_QUIZ_ROLES = ['fast_thinking', 'reasoning', 'apply_create', 'fast_thinking', 'apply_create'] as const;
export type Level7QuizRole = typeof LEVEL7_QUIZ_ROLES[number];

/** A prompt with its numbers and single-letter variables blanked, so two questions of the same form match. */
export function promptTemplate(prompt: string) {
  return prompt.replace(/−/g, '-').replace(/\$?-?\d+(?:[.,/]\d+)*/g, '#').replace(/\b[a-z]\b/g, 'v').replace(/\s+/g, ' ').trim();
}

/** Seeds the skill guides use for their worked examples; quizzes never reuse those questions. */
export const LEVEL7_GUIDE_SEEDS = [7007, 11027];

/** A fresh random attempt number. Attempt 0 is the fixed quiz used by tests and teacher review. */
export function newLevel7QuizAttempt() {
  return 1 + Math.floor(Math.random() * 2_000_000_000);
}

/**
 * Picks one lesson's five quiz questions. Questions never repeat, and each slot prefers a
 * question form and an answer not already used in the lesson, so the second fluency and
 * application questions ask something different where the lesson has more than one form.
 */
export function pickLevel7LessonQuiz<Q extends { prompt: string; answer: string }>(
  make: (role: Level7QuizRole, seed: number) => Q,
  baseSeed: number,
  fingerprint: (q: Q) => string,
  label: string,
  /** Fingerprints already used elsewhere in the same quiz, so lessons sharing a skill never repeat a question. */
  taken = new Set<string>(),
): Q[] {
  const picked: Q[] = [], seen = taken, forms = new Set<string>(), answers = new Set<string>();
  LEVEL7_QUIZ_ROLES.forEach((role, slot) => {
    const shown = new Set(LEVEL7_GUIDE_SEEDS.map((seed) => { const g = make(role, seed); return g.prompt + '|' + g.answer; }));
    let fallback: Q | undefined, lastResort: Q | undefined;
    for (let attempt = 0; attempt < 300; attempt++) {
      const q = make(role, baseSeed + slot * 7919 + attempt * 104729), key = fingerprint(q);
      if (seen.has(key)) continue;
      // A worked example is used only if the lesson has nothing else left for this slot.
      if (shown.has(q.prompt + '|' + q.answer)) { lastResort ??= q; continue; }
      fallback ??= q;
      // After 120 tries the lesson has no unused form for this role, so accept a repeat form;
      // a repeated answer is tolerated after 200 tries (some lessons have only a few answers).
      if (forms.has(promptTemplate(q.prompt)) && attempt < 120) continue;
      if (answers.has(q.answer) && attempt < 200) continue;
      fallback = q;
      break;
    }
    fallback ??= lastResort;
    if (!fallback) throw Error(`Insufficient ${label} quiz variations for slot ${slot + 1} (${role})`);
    picked.push(fallback);
    seen.add(fingerprint(fallback));
    forms.add(promptTemplate(fallback.prompt));
    answers.add(fallback.answer);
  });
  return picked;
}
