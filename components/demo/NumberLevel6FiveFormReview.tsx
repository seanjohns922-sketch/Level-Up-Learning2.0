"use client";

import FiveFormAssessmentReview from "@/components/demo/FiveFormAssessmentReview";
import {
  NUMBER_LEVEL6_FIVE_FORMS,
  NUMBER_LEVEL6_FORM_LABELS,
  NUMBER_LEVEL6_FORMS,
} from "@/data/assessments/revisions/year6NumberFiveForms";

/** Protected owner review of the matched Level 6 Number forms. Student banks are unchanged. */
export default function NumberLevel6FiveFormReview() {
  return (
    <FiveFormAssessmentReview
      title="Number Nexus · Level 6 · Five-form review"
      subtitle="Matched Level 6 forms · Manual review"
      year="Year 6"
      realmId="number"
      basePath="/demo-review/number-level-6"
      exitHref="/demo-review?realm=number&year=Year%206"
      formOrder={NUMBER_LEVEL6_FORMS}
      labels={NUMBER_LEVEL6_FORM_LABELS}
      forms={NUMBER_LEVEL6_FIVE_FORMS}
      defaultForm="posttest"
    />
  );
}
