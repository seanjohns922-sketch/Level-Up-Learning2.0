"use client";

import FiveFormAssessmentReview from "@/components/demo/FiveFormAssessmentReview";
import {
  NUMBER_LEVEL8_FIVE_FORMS,
  NUMBER_LEVEL8_FORM_LABELS,
  NUMBER_LEVEL8_FORMS,
} from "@/data/assessments/revisions/year8NumberFiveForms";

/** Protected owner review of the matched Level 8 Number forms. Student banks are unchanged. */
export default function NumberLevel8FiveFormReview() {
  return (
    <FiveFormAssessmentReview
      title="Number Nexus · Level 8 · Five-form review"
      subtitle="Matched Level 8 forms · Manual review"
      year="Year 8"
      realmId="number"
      basePath="/demo-review/number-level-8"
      exitHref="/demo-review?realm=number&year=Year%206"
      formOrder={NUMBER_LEVEL8_FORMS}
      labels={NUMBER_LEVEL8_FORM_LABELS}
      forms={NUMBER_LEVEL8_FIVE_FORMS}
      defaultForm="posttest"
    />
  );
}
