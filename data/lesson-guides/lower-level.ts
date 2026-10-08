import topics from './lower-level-topics.json' with { type: 'json' };
import assignments from './lower-level-map.json' with { type: 'json' };
import number1 from './number/level1.json' with { type: 'json' };
import number2 from './number/level2.json' with { type: 'json' };
import number3 from './number/level3.json' with { type: 'json' };
import number4 from './number/level4.json' with { type: 'json' };
import number5 from './number/level5.json' with { type: 'json' };
import number6 from './number/level6.json' with { type: 'json' };
import space1 from './space/level1.json' with { type: 'json' };
import space2 from './space/level2.json' with { type: 'json' };
import space3 from './space/level3.json' with { type: 'json' };
import space4 from './space/level4.json' with { type: 'json' };
import space5 from './space/level5.json' with { type: 'json' };
import space6 from './space/level6.json' with { type: 'json' };
import statistics1 from './statistics/level1.json' with { type: 'json' };
import statistics2 from './statistics/level2.json' with { type: 'json' };
import statistics3 from './statistics/level3.json' with { type: 'json' };
import statistics4 from './statistics/level4.json' with { type: 'json' };
import statistics5 from './statistics/level5.json' with { type: 'json' };
import statistics6 from './statistics/level6.json' with { type: 'json' };
import chance3 from './chance/level3.json' with { type: 'json' };
import chance4 from './chance/level4.json' with { type: 'json' };
import chance5 from './chance/level5.json' with { type: 'json' };
import chance6 from './chance/level6.json' with { type: 'json' };
import measurement1 from './measurement/level1.json' with { type: 'json' };
import measurement2 from './measurement/level2.json' with { type: 'json' };
import measurement3 from './measurement/level3.json' with { type: 'json' };
import measurement4 from './measurement/level4.json' with { type: 'json' };
import measurement5 from './measurement/level5.json' with { type: 'json' };
import measurement6 from './measurement/level6.json' with { type: 'json' };
import pattern3 from './pattern/level3.json' with { type: 'json' };
import pattern4 from './pattern/level4.json' with { type: 'json' };
import pattern5 from './pattern/level5.json' with { type: 'json' };
import pattern6 from './pattern/level6.json' with { type: 'json' };

import type { GuideVisual } from './guide-visual';

export type LowerLessonGuide = { idea: string; example: string; steps: string[]; tip: string; visual?: GuideVisual };
type LessonGuideSet = Record<string, LowerLessonGuide>;
/** Guides written for one lesson each, keyed "week:lesson". They replace the shared topic cards. */
// JSON imports widen the diagram kind to string, so each set is checked by the guide test instead.
const set = (guides: unknown) => guides as LessonGuideSet;
export const LESSON_GUIDES: Record<string, Partial<Record<number, LessonGuideSet>>> = {
  number: { 1: set(number1), 2: set(number2), 3: set(number3), 4: set(number4), 5: set(number5), 6: set(number6) },
  chance: { 3: set(chance3), 4: set(chance4), 5: set(chance5), 6: set(chance6) },
  measurement: { 1: set(measurement1), 2: set(measurement2), 3: set(measurement3), 4: set(measurement4), 5: set(measurement5), 6: set(measurement6) },
  pattern: { 3: set(pattern3), 4: set(pattern4), 5: set(pattern5), 6: set(pattern6) },
  space: { 1: set(space1), 2: set(space2), 3: set(space3), 4: set(space4), 5: set(space5), 6: set(space6) },
  statistics: { 1: set(statistics1), 2: set(statistics2), 3: set(statistics3), 4: set(statistics4), 5: set(statistics5), 6: set(statistics6) },
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
