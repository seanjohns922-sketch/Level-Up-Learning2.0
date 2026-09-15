import { NUMBER_LEVEL8_FIVE_FORMS, NUMBER_LEVEL8_FORMS, type NumberLevel8Form } from "./year8NumberFiveForms";

/** Owner-approved Level 8 content, with production identities distinct from review responses. */
export const YEAR8_NUMBER_RELEASED_FORMS = Object.fromEntries(NUMBER_LEVEL8_FORMS.map((form) => [form,
  NUMBER_LEVEL8_FIVE_FORMS[form].map((item, index) => ({
    ...structuredClone(item),
    id: `y8-number-${form === "pretest" ? "pre" : form === "posttest" ? "post" : form}-${String(index + 1).padStart(2, "0")}-v1`,
    version: "1.0.0",
    form: form === "pretest" ? "pretest" as const : "posttest" as const,
    sourcePool: form === "pretest" ? "pretest" as const : "posttest" as const,
    bankId: `number-nexus-level-8-${form}-v1`,
  })),
])) as Record<NumberLevel8Form, Array<Omit<typeof NUMBER_LEVEL8_FIVE_FORMS.posttest[number], "sourcePool" | "form"> & { form: "pretest" | "posttest"; sourcePool: "pretest" | "posttest" }>>;
