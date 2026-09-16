"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {YEAR6_MEASUREMENT_FIVE_FORMS,YEAR6_MEASUREMENT_FORMS} from '@/data/assessments/revisions/year6MeasurementFiveForms';
const labels={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export default function Year6MeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Level 6" subtitle="Matched Level 6 forms · Manual review" year="Year 6" realmId="measurement" basePath="/demo-review/measurement-level6" exitHref="/demo-review?realm=measurement&year=Year%206" formOrder={YEAR6_MEASUREMENT_FORMS} labels={labels} forms={YEAR6_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
