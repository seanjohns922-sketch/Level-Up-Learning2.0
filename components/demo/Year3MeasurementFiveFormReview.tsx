"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {YEAR3_MEASUREMENT_FIVE_FORMS,YEAR3_MEASUREMENT_FORMS} from '@/data/assessments/revisions/year3MeasurementFiveForms';
const labels={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export default function Year3MeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Level 3" subtitle="Matched Level 3 forms · Manual review" year="Year 3" realmId="measurement" basePath="/demo-review/measurement-level3" exitHref="/demo-review?realm=measurement&year=Year%203" formOrder={YEAR3_MEASUREMENT_FORMS} labels={labels} forms={YEAR3_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
