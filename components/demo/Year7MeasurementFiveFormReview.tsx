"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {YEAR7_MEASUREMENT_FIVE_FORMS,YEAR7_MEASUREMENT_FORMS} from '@/data/assessments/revisions/year7MeasurementFiveForms';
const labels={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export default function Year7MeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Level 7" subtitle="Matched Level 7 forms · Manual review" year="Year 7" realmId="measurement" basePath="/demo-review/measurement-level7" exitHref="/demo-review?realm=measurement&year=Year%207" formOrder={YEAR7_MEASUREMENT_FORMS} labels={labels} forms={YEAR7_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
