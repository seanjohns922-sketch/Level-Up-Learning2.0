import { NUMBER_LEVEL6_FIVE_FORMS, NUMBER_LEVEL6_FORMS, type NumberLevel6Form } from "./year6NumberFiveForms";

/** Owner-approved Level 6 content, with production identities distinct from review responses. */
export const YEAR6_NUMBER_RELEASED_FORMS = Object.fromEntries(NUMBER_LEVEL6_FORMS.map((form) => [form,
  NUMBER_LEVEL6_FIVE_FORMS[form].map((item, index) => ({
    ...structuredClone(item),
    id: `y6-number-${form === "pretest" ? "pre" : form === "posttest" ? "post" : form}-${String(index + 1).padStart(2, "0")}-v3`,
    version: "3.0.0",
    form: form === "pretest" ? "pretest" as const : "posttest" as const,
    sourcePool: form === "pretest" ? "pretest" as const : "posttest" as const,
    bankId: `number-nexus-level-6-${form}-v3`,
  })),
])) as Record<NumberLevel6Form, Array<Omit<typeof NUMBER_LEVEL6_FIVE_FORMS.posttest[number], "sourcePool" | "form"> & { form: "pretest" | "posttest"; sourcePool: "pretest" | "posttest" }>>;
