import frozen from './year6Measurement-v4.json' with {type:'json'};
import type { AssessmentQuestion } from '../api';
export const YEAR6_MEASUREMENT_RELEASED_FORMS = frozen as unknown as Record<'pretest'|'posttest'|'start'|'mid'|'end', AssessmentQuestion[]>;
