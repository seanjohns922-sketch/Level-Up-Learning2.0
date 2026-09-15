"use client";

import FiveFormAssessmentReview from "@/components/demo/FiveFormAssessmentReview";
import {
  NUMBER_LEVEL5_FIVE_FORMS,
  NUMBER_LEVEL5_FORM_LABELS,
  NUMBER_LEVEL5_FORMS,
} from "@/data/assessments/revisions/year5NumberFiveForms";

/** Protected owner review of the matched Level 5 Number forms. Student banks are unchanged. */
export default function NumberLevel5FiveFormReview() {
  return (
    <FiveFormAssessmentReview
      title="Number Nexus · Level 5 · Five-form review"
      subtitle="Matched Level 5 forms · Manual review"
      year="Year 5"
      realmId="number"
      basePath="/demo-review/number-level-5"
      exitHref="/demo-review?realm=number&year=Year%205"
      formOrder={NUMBER_LEVEL5_FORMS}
      labels={NUMBER_LEVEL5_FORM_LABELS}
      forms={NUMBER_LEVEL5_FIVE_FORMS}
      defaultForm="posttest"
    />
  );
}
