"use client";

import FiveFormAssessmentReview from "@/components/demo/FiveFormAssessmentReview";
import {
  NUMBER_LEVEL4_FIVE_FORMS,
  NUMBER_LEVEL4_FORM_LABELS,
  NUMBER_LEVEL4_FORMS,
} from "@/data/assessments/revisions/year4NumberFiveForms";

/** Protected owner review of the matched Level 4 Number forms. Student banks are unchanged. */
export default function NumberLevel4FiveFormReview() {
  return (
    <FiveFormAssessmentReview
      title="Number Nexus · Level 4 · Five-form review"
      subtitle="Matched Level 4 forms · Manual review"
      year="Year 4"
      realmId="number"
      basePath="/demo-review/number-level-4"
      exitHref="/demo-review?realm=number&year=Year%204"
      formOrder={NUMBER_LEVEL4_FORMS}
      labels={NUMBER_LEVEL4_FORM_LABELS}
      forms={NUMBER_LEVEL4_FIVE_FORMS}
      defaultForm="posttest"
    />
  );
}
