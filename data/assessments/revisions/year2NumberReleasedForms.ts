import { NUMBER_LEVEL2_FIVE_FORMS, NUMBER_LEVEL2_FORMS, type NumberLevel2Form } from "./year2NumberFiveForms";

/** Owner-approved Level 2 content, with production identities distinct from review responses. */
export const YEAR2_NUMBER_RELEASED_FORMS = Object.fromEntries(NUMBER_LEVEL2_FORMS.map((form) => [form,
  NUMBER_LEVEL2_FIVE_FORMS[form].map((item, index) => ({
    ...structuredClone(item),
    id: `y2-number-${form === "pretest" ? "pre" : form === "posttest" ? "post" : form}-${String(index + 1).padStart(2, "0")}-v3`,
    version: "3.0.0",
    form: form === "pretest" ? "pretest" as const : "posttest" as const,
    sourcePool: form === "pretest" ? "pretest" as const : "posttest" as const,
    bankId: `number-nexus-level-2-${form}-v3`,
  })),
])) as Record<NumberLevel2Form, Array<Omit<typeof NUMBER_LEVEL2_FIVE_FORMS.posttest[number], "sourcePool" | "form"> & { form: "pretest" | "posttest"; sourcePool: "pretest" | "posttest" }>>;
