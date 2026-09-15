"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {YEAR1_MEASUREMENT_FIVE_FORMS,YEAR1_MEASUREMENT_FORMS} from '@/data/assessments/revisions/year1MeasurementFiveForms';
const labels={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export default function Year1MeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Level 1" subtitle="Matched Level 1 forms · Manual review" year="Year 1" realmId="measurement" basePath="/demo-review/measurement-level1" exitHref="/demo-review?realm=measurement&year=Year%201" formOrder={YEAR1_MEASUREMENT_FORMS} labels={labels} forms={YEAR1_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
