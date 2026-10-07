import topics from './lower-level-topics.json' with { type: 'json' };
import assignments from './lower-level-map.json' with { type: 'json' };

export type LowerLessonGuide = { idea: string; example: string; steps: string[]; tip: string };
export function getLowerLessonGuide(realm: string, level: number | undefined, week: number | undefined, lesson: number | undefined): LowerLessonGuide | null {
  if (!level || level < 1 || level > 6 || !week || !lesson) return null;
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
