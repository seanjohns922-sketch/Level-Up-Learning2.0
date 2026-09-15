import { NUMBER_LEVEL5_FIVE_FORMS, NUMBER_LEVEL5_FORMS, type NumberLevel5Form } from "./year5NumberFiveForms";

/** Owner-approved Level 5 content, with production identities distinct from review responses. */
export const YEAR5_NUMBER_RELEASED_FORMS = Object.fromEntries(NUMBER_LEVEL5_FORMS.map((form) => [form,
  NUMBER_LEVEL5_FIVE_FORMS[form].map((item, index) => ({
    ...structuredClone(item),
    id: `y5-number-${form === "pretest" ? "pre" : form === "posttest" ? "post" : form}-${String(index + 1).padStart(2, "0")}-v3`,
    version: "3.0.0",
    form: form === "pretest" ? "pretest" as const : "posttest" as const,
    sourcePool: form === "pretest" ? "pretest" as const : "posttest" as const,
    bankId: `number-nexus-level-5-${form}-v3`,
  })),
])) as Record<NumberLevel5Form, Array<Omit<typeof NUMBER_LEVEL5_FIVE_FORMS.posttest[number], "sourcePool" | "form"> & { form: "pretest" | "posttest"; sourcePool: "pretest" | "posttest" }>>;
