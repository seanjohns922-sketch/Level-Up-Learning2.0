import { NUMBER_LEVEL1_FIVE_FORMS, NUMBER_LEVEL1_FORMS, type NumberLevel1Form } from "./year1NumberFiveForms";

/** Approved content, with production identities distinct from review responses. */
export const YEAR1_NUMBER_RELEASED_FORMS = Object.fromEntries(NUMBER_LEVEL1_FORMS.map(form => [form,
  NUMBER_LEVEL1_FIVE_FORMS[form].map((item,index) => ({
    ...structuredClone(item),
    id:`y1-number-${form === "pretest" ? "pre" : form === "posttest" ? "post" : form}-${String(index+1).padStart(2,"0")}-v5`,
    version:"5.0.0",
    form:form === "pretest" ? "pretest" as const : "posttest" as const,
    sourcePool:form === "pretest" ? "pretest" as const : "posttest" as const,
    bankId:`number-nexus-level-1-${form}-v5`,
  })),
])) as Record<NumberLevel1Form, Array<Omit<typeof NUMBER_LEVEL1_FIVE_FORMS.posttest[number],"sourcePool"|"form"> & {form:"pretest"|"posttest";sourcePool:"pretest"|"posttest"}>>;
