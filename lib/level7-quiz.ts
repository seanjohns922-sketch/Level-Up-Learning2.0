/** Shared question picking for Level 7 weekly quizzes (five questions per lesson). */
export const LEVEL7_QUIZ_ROLES = ['fast_thinking', 'reasoning', 'apply_create', 'fast_thinking', 'apply_create'] as const;
export type Level7QuizRole = typeof LEVEL7_QUIZ_ROLES[number];

/** A prompt with its numbers and single-letter variables blanked, so two questions of the same form match. */
export function promptTemplate(prompt: string) {
  // Mixed numbers and number lists collapse to one slot, so "slept 6 1/4, 8, 5 hours" matches "slept 7, 8 1/2, 5 hours".
  return prompt.replace(/−/g, '-').replace(/\$?-?\d+(?:[.,/]\d+)*/g, '#').replace(/#(?:(?:,\s*|\s+|\s*(?:and|or)\s+)#)+/g, '#').replace(/\b[a-z]\b/g, 'v').replace(/\s+/g, ' ').trim();
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
      // Identical wording reads as the same question whatever the numbers in its picture, so a prompt is reused
      // only when the lesson has no other wording left for this slot.
      if (seen.has(key)) continue;
      if (seen.has('prompt:' + q.prompt) && attempt < 280) continue;
      // A worked example is used only if the lesson has nothing else left for this slot.
      if (shown.has(q.prompt + '|' + q.answer)) { lastResort ??= q; continue; }
      fallback ??= q;
      // After 120 tries the lesson has no unused form for this role, so accept a repeat form;
      // a repeated answer is tolerated after 200 tries (some lessons have only a few answers).
      // Also avoid a question type another lesson in this quiz already used.
      if ((forms.has(promptTemplate(q.prompt)) || seen.has('form:' + promptTemplate(q.prompt))) && attempt < 120) continue;
      if (answers.has(q.answer) && attempt < 200) continue;
      fallback = q;
      break;
    }
    fallback ??= lastResort;
    if (!fallback) throw Error(`Insufficient ${label} quiz variations for slot ${slot + 1} (${role})`);
    picked.push(fallback);
    seen.add(fingerprint(fallback));
    seen.add('prompt:' + fallback.prompt);
    forms.add(promptTemplate(fallback.prompt));
    seen.add('form:' + promptTemplate(fallback.prompt));
    answers.add(fallback.answer);
  });
  return picked;
}

/**
 * Some lessons word every question the same way ("What is the median?") with new data in the picture.
 * Within one quiz, a repeated prompt is numbered so no two questions read the same:
 * "Data set 2: What is the median?". `noun` names what changed, e.g. "spinner".
 */
export function distinctQuizPrompts<Q extends { prompt: string }>(questions: Q[], noun: (q: Q) => string): Q[] {
  const seen = new Map<string, number>();
  return questions.map((q) => {
    const count = (seen.get(q.prompt) ?? 0) + 1;
    seen.set(q.prompt, count);
    if (count === 1) return q;
    const name = noun(q);
    return { ...q, prompt: `${name[0].toUpperCase()}${name.slice(1)} ${count}: ${q.prompt}` };
  });
}

/** A short noun from a picture title: "Given formula" → "formula", "Spreadsheet: d = v × t" → "spreadsheet". */
export function quizNoun(title: string | undefined, fallback: string): string {
  if (!title || /^(Read|Find|Use|Exactly)\b/.test(title)) return fallback;
  const noun = title.replace(/^Given\s+/i, '').split(/[:(]/)[0].trim();
  return noun ? noun[0].toLowerCase() + noun.slice(1) : fallback;
}
