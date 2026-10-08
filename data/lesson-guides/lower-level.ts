import topics from './lower-level-topics.json' with { type: 'json' };
import assignments from './lower-level-map.json' with { type: 'json' };
import number1 from './number/level1.json' with { type: 'json' };
import number2 from './number/level2.json' with { type: 'json' };
import number3 from './number/level3.json' with { type: 'json' };
import number4 from './number/level4.json' with { type: 'json' };
import number5 from './number/level5.json' with { type: 'json' };
import number6 from './number/level6.json' with { type: 'json' };

export type LowerLessonGuide = { idea: string; example: string; steps: string[]; tip: string };
type LessonGuideSet = Record<string, LowerLessonGuide>;
/** Guides written for one lesson each, keyed "week:lesson". They replace the shared topic cards. */
export const LESSON_GUIDES: Record<string, Partial<Record<number, LessonGuideSet>>> = {
  number: { 1: number1, 2: number2, 3: number3, 4: number4, 5: number5, 6: number6 },
};
export function getLowerLessonGuide(realm: string, level: number | undefined, week: number | undefined, lesson: number | undefined): LowerLessonGuide | null {
  if (!level || level < 1 || level > 6 || !week || !lesson) return null;
  const own = LESSON_GUIDES[realm]?.[level]?.[`${week}:${lesson}`];
  if (own) return own;
  const key = `${realm}:${level}:${week}:${lesson}` as keyof typeof assignments;
  const topic = assignments[key] as keyof typeof topics | undefined;
  return topic ? topics[topic] : null;
}

/** These are teaching scenes, including older Measurement scene names. */
export function isNativeLessonIntro(task: { kind: string; scene?: unknown }): boolean {
  return task.scene === 'intro' ||
    (task.kind === 'area' && (task.scene === 'formulaIntro' || task.scene === 'breakIntro')) ||
    (task.kind === 'protractor' && task.scene === 'learn');
}

export function lessonNumberFromId(id?: string): number | undefined {
  const match = id?.match(/(?:^|-)l(\d+)(?:$|-)/i);
  return match ? Number(match[1]) : undefined;
}
