"use client";

import FiveFormAssessmentReview from "@/components/demo/FiveFormAssessmentReview";
import {
  NUMBER_LEVEL2_FIVE_FORMS,
  NUMBER_LEVEL2_FORM_LABELS,
  NUMBER_LEVEL2_FORMS,
} from "@/data/assessments/revisions/year2NumberFiveForms";

/** Protected owner review of the matched Level 2 Number forms. Student banks are unchanged. */
export default function NumberLevel2FiveFormReview() {
  return (
    <FiveFormAssessmentReview
      title="Number Nexus · Level 2 · Five-form review"
      subtitle="Matched Level 2 forms · Manual review"
      year="Year 2"
      realmId="number"
      basePath="/demo-review/number-level-2"
      exitHref="/demo-review?realm=number&year=Year%202"
      formOrder={NUMBER_LEVEL2_FORMS}
      labels={NUMBER_LEVEL2_FORM_LABELS}
      forms={NUMBER_LEVEL2_FIVE_FORMS}
      defaultForm="posttest"
    />
  );
}
