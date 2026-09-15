"use client";

import FiveFormAssessmentReview from "@/components/demo/FiveFormAssessmentReview";
import {
  NUMBER_LEVEL7_FIVE_FORMS,
  NUMBER_LEVEL7_FORM_LABELS,
  NUMBER_LEVEL7_FORMS,
} from "@/data/assessments/revisions/year7NumberFiveForms";

/** Protected owner review of the matched Level 7 Number forms. Student banks are unchanged. */
export default function NumberLevel7FiveFormReview() {
  return (
    <FiveFormAssessmentReview
      title="Number Nexus · Level 7 · Five-form review"
      subtitle="Matched Level 7 forms · Manual review"
      year="Year 7"
      realmId="number"
      basePath="/demo-review/number-level-7"
      exitHref="/demo-review?realm=number&year=Year%206"
      formOrder={NUMBER_LEVEL7_FORMS}
      labels={NUMBER_LEVEL7_FORM_LABELS}
      forms={NUMBER_LEVEL7_FIVE_FORMS}
      defaultForm="posttest"
    />
  );
}
