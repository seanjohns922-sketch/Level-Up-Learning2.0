import frozen from './year5Measurement-v4.json' with {type:'json'};
import type { AssessmentQuestion } from '../api';
export const YEAR5_MEASUREMENT_RELEASED_FORMS = frozen as unknown as Record<'pretest'|'posttest'|'start'|'mid'|'end', AssessmentQuestion[]>;
