"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {YEAR8_MEASUREMENT_FIVE_FORMS,YEAR8_MEASUREMENT_FORMS} from '@/data/assessments/revisions/year8MeasurementFiveForms';
const labels={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export default function Year8MeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Level 8" subtitle="Matched Level 8 forms · Manual review" year="Year 8" realmId="measurement" basePath="/demo-review/measurement-level8" exitHref="/demo-review?realm=measurement&year=Year%208" formOrder={YEAR8_MEASUREMENT_FORMS} labels={labels} forms={YEAR8_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
