"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {YEAR5_MEASUREMENT_FIVE_FORMS,YEAR5_MEASUREMENT_FORMS} from '@/data/assessments/revisions/year5MeasurementFiveForms';
const labels={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export default function Year5MeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Level 5" subtitle="Matched Level 5 forms · Manual review" year="Year 5" realmId="measurement" basePath="/demo-review/measurement-level5" exitHref="/demo-review?realm=measurement&year=Year%205" formOrder={YEAR5_MEASUREMENT_FORMS} labels={labels} forms={YEAR5_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
