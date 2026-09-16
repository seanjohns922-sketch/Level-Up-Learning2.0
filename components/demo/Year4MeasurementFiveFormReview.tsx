"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {YEAR4_MEASUREMENT_FIVE_FORMS,YEAR4_MEASUREMENT_FORMS} from '@/data/assessments/revisions/year4MeasurementFiveForms';
const labels={pretest:'Pre-Test',posttest:'Post-Test',start:'Start',mid:'Mid',end:'End'};
export default function Year4MeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Level 4" subtitle="Matched Level 4 forms · Manual review" year="Year 4" realmId="measurement" basePath="/demo-review/measurement-level4" exitHref="/demo-review?realm=measurement&year=Year%204" formOrder={YEAR4_MEASUREMENT_FORMS} labels={labels} forms={YEAR4_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
