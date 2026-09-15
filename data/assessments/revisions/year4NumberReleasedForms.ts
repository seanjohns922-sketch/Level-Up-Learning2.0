import { NUMBER_LEVEL4_FIVE_FORMS, NUMBER_LEVEL4_FORMS, type NumberLevel4Form } from "./year4NumberFiveForms";

/** Owner-approved Level 4 content, with production identities distinct from review responses. */
export const YEAR4_NUMBER_RELEASED_FORMS = Object.fromEntries(NUMBER_LEVEL4_FORMS.map((form) => [form,
  NUMBER_LEVEL4_FIVE_FORMS[form].map((item, index) => ({
    ...structuredClone(item),
    id: `y4-number-${form === "pretest" ? "pre" : form === "posttest" ? "post" : form}-${String(index + 1).padStart(2, "0")}-v3`,
    version: "3.0.0",
    form: form === "pretest" ? "pretest" as const : "posttest" as const,
    sourcePool: form === "pretest" ? "pretest" as const : "posttest" as const,
    bankId: `number-nexus-level-4-${form}-v3`,
  })),
])) as Record<NumberLevel4Form, Array<Omit<typeof NUMBER_LEVEL4_FIVE_FORMS.posttest[number], "sourcePool" | "form"> & { form: "pretest" | "posttest"; sourcePool: "pretest" | "posttest" }>>;
