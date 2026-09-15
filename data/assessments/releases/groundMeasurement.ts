import frozen from './groundMeasurement-v4.json' with {type:'json'};
import type { AssessmentQuestion } from '../api';
export const GROUND_MEASUREMENT_RELEASED_FORMS = frozen as unknown as Record<'pretest'|'posttest'|'start'|'mid'|'end', AssessmentQuestion[]>;
