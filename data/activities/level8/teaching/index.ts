import type {Level8Realm} from '@/lib/level8-config';
import {level8Question} from '../questions';
import {numberTeaching} from './number';
import {measurementTeaching} from './measurement';
import {spaceTeaching} from './space';
import {patternTeaching} from './pattern';
import {statisticsTeaching} from './statistics';
import {chanceTeaching} from './chance';
import type {Level8Question} from '../shared';
import type {TeachingGuide} from './shared';
export const LEVEL8_TEACHING = {
  number: numberTeaching, measurement: measurementTeaching, space: spaceTeaching,
  pattern: patternTeaching, statistics: statisticsTeaching, chance: chanceTeaching,
} satisfies Record<Level8Realm, TeachingGuide[][]>;

export function level8TeachingGuide(realm: Level8Realm, week: number, lesson: number) {
  const teaching = LEVEL8_TEACHING[realm][week - 1]?.[lesson - 1];
  if (!teaching) throw new Error(`Missing Level 8 teaching guide: ${realm}/${week}/${lesson}`);
  // Fixed, reviewed examples never rotate with a student's question seed.
  // Replacement examples have their own wording and answer; do not attach an
  // unrelated generated diagram or assessment answer spec to them.
  const example: Pick<Level8Question, 'prompt' | 'answer'> & Partial<Level8Question> = teaching.example ?? level8Question(realm, week, lesson, 7007);
  return { ...teaching, example };
}
