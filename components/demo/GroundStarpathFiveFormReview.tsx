"use client";

import FiveFormAssessmentReview from "@/components/demo/FiveFormAssessmentReview";
import {
  GROUND_STARPATH_FIVE_FORMS,
  GROUND_STARPATH_FORMS,
  GROUND_STARPATH_LABELS,
} from "@/data/assessments/revisions/groundStarpathFiveForms";

export default function GroundStarpathFiveFormReview() {
  return (
    <FiveFormAssessmentReview
      title="Starpath · Ground Level"
      subtitle="Matched Foundation Space forms · Manual review"
      year="Prep"
      realmId="space"
      basePath="/demo-review/starpath-ground"
      exitHref="/demo-review?realm=space&year=Prep"
      formOrder={GROUND_STARPATH_FORMS}
      labels={GROUND_STARPATH_LABELS}
      forms={GROUND_STARPATH_FIVE_FORMS}
      defaultForm="posttest"
    />
  );
}
