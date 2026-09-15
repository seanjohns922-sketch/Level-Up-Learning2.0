import { NUMBER_LEVEL7_FIVE_FORMS, NUMBER_LEVEL7_FORMS, type NumberLevel7Form } from "./year7NumberFiveForms";

/** Owner-approved Level 7 content, with production identities distinct from review responses. */
export const YEAR7_NUMBER_RELEASED_FORMS = Object.fromEntries(NUMBER_LEVEL7_FORMS.map((form) => [form,
  NUMBER_LEVEL7_FIVE_FORMS[form].map((item, index) => ({
    ...structuredClone(item),
    id: `y7-number-${form === "pretest" ? "pre" : form === "posttest" ? "post" : form}-${String(index + 1).padStart(2, "0")}-v1`,
    version: "1.0.0",
    form: form === "pretest" ? "pretest" as const : "posttest" as const,
    sourcePool: form === "pretest" ? "pretest" as const : "posttest" as const,
    bankId: `number-nexus-level-7-${form}-v1`,
  })),
])) as Record<NumberLevel7Form, Array<Omit<typeof NUMBER_LEVEL7_FIVE_FORMS.posttest[number], "sourcePool" | "form"> & { form: "pretest" | "posttest"; sourcePool: "pretest" | "posttest" }>>;
