"use client";
import FiveFormAssessmentReview from './FiveFormAssessmentReview';
import {GROUND_MEASUREMENT_FIVE_FORMS,GROUND_MEASUREMENT_FORMS,GROUND_MEASUREMENT_LABELS} from '@/data/assessments/revisions/groundMeasurementFiveForms';
export default function GroundMeasurementFiveFormReview(){return <FiveFormAssessmentReview title="Measurelands · Ground Level" subtitle="Matched Prep Measurement forms · Manual review" year="Prep" realmId="measurement" basePath="/demo-review/measurement-ground" exitHref="/demo-review?realm=measurement&year=Prep" formOrder={GROUND_MEASUREMENT_FORMS} labels={GROUND_MEASUREMENT_LABELS} forms={GROUND_MEASUREMENT_FIVE_FORMS} defaultForm="posttest"/>;}
