import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

// ── Measurelands · Week 8 · Timewielder Trial — mixed-review helper ──
// Week 8 is the Ground Level finale: no new concepts or art, just a mixed review
// of Weeks 1-7. Each lesson draws a shuffled POOL of tasks from the relevant
// weeks' existing builders and cycles through them, so consecutive challenges
// switch attribute (length → mass → capacity …) for a real "trial" feel.

type Mem = { introShown: boolean; cursor: number; pool: PracticeTask[] };

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }
  return next;
}

export type MixedLessonOptions = {
  /** Fresh task sources to mix (each returns its own task list). */
  sources: Array<() => PracticeTask[]>;
  intro: { prompt: string; speakText: string; badgeLabel: string; introBody: string[] };
  /** The 5 quiz-contribution tasks for this lesson. */
  quiz: () => PracticeTask[];
};

export function makeMixedLesson(opts: MixedLessonOptions) {
  const memory = new Map<string, Mem>();

  function getMem(lessonId: string): Mem {
    const existing = memory.get(lessonId);
    if (existing) return existing;
    const created: Mem = { introShown: false, cursor: 0, pool: [] };
    memory.set(lessonId, created);
    return created;
  }

  function buildIntro(): PracticeTask {
    return {
      kind: "measurementCompare",
      scene: "intro",
      prompt: opts.intro.prompt,
      speakText: opts.intro.speakText,
      badgeLabel: opts.intro.badgeLabel,
      introIcon: "",
      introBody: opts.intro.introBody,
      objects: [],
      correctOptionId: "continue",
      feedback: { correct: "Let's go!", wrong: "Let's get ready." },
    };
  }

  function generate(lessonId: string, _difficulty: Difficulty): PracticeTask {
    const mem = getMem(lessonId);
    if (!mem.introShown) {
      mem.introShown = true;
      return buildIntro();
    }
    if (mem.cursor >= mem.pool.length) {
      mem.pool = shuffle(opts.sources.flatMap((src) => src()));
      mem.cursor = 0;
    }
    const task = mem.pool[mem.cursor] ?? mem.pool[0]!;
    mem.cursor += 1;
    return task;
  }

  function reset() {
    memory.clear();
  }

  return { generate, reset, quiz: opts.quiz };
}
