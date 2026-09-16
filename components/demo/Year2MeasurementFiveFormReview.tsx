"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {YEAR2_MEASUREMENT_FIVE_FORMS,YEAR2_MEASUREMENT_FORMS} from '@/data/assessments/revisions/year2MeasurementFiveForms';
const labels={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export default function Year2MeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Level 2" subtitle="Matched Level 2 forms · Manual review" year="Year 2" realmId="measurement" basePath="/demo-review/measurement-level2" exitHref="/demo-review?realm=measurement&year=Year%202" formOrder={YEAR2_MEASUREMENT_FORMS} labels={labels} forms={YEAR2_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
