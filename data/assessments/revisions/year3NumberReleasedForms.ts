import { level3SpokenPrompt, NUMBER_LEVEL3_FIVE_FORMS, NUMBER_LEVEL3_FORMS, type NumberLevel3Form } from "./year3NumberFiveForms";

/** Owner-approved Level 3 content, with production identities distinct from review responses. */
export const YEAR3_NUMBER_RELEASED_FORMS = Object.fromEntries(NUMBER_LEVEL3_FORMS.map((form) => [form,
  NUMBER_LEVEL3_FIVE_FORMS[form].map((item, index) => ({
    ...structuredClone(item),
    readAloudText: level3SpokenPrompt(item),
    id: `y3-number-${form === "pretest" ? "pre" : form === "posttest" ? "post" : form}-${String(index + 1).padStart(2, "0")}-v3`,
    version: "3.0.0",
    form: form === "pretest" ? "pretest" as const : "posttest" as const,
    sourcePool: form === "pretest" ? "pretest" as const : "posttest" as const,
    bankId: `number-nexus-level-3-${form}-v3`,
  })),
])) as unknown as Record<NumberLevel3Form, Array<Omit<typeof NUMBER_LEVEL3_FIVE_FORMS.posttest[number], "sourcePool" | "form"> & { form: "pretest" | "posttest"; sourcePool: "pretest" | "posttest" }>>;
