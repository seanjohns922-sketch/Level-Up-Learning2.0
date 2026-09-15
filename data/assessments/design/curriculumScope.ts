/** Corrections after direct comparison with the supplied F–6 v9 PDF. These do not rewrite live bank metadata. */
export const DESCRIPTOR_SCOPE_CORRECTIONS: Record<string,string> = {
 AC9M3ST03:'Conduct guided investigations covering collection, representation and interpretation of categorical and discrete numerical data.',
 AC9M4ST01:'Acquire data for categorical and discrete numerical variables using digital tools; represent it with many-to-one pictographs, column graphs or other displays and interpret the information.',
 AC9M4P01:'Describe possible events and experimental outcomes, order their likelihoods, and identify independent or dependent events.',
 AC9M4P02:'Conduct repeated chance experiments to observe relationships between outcomes and describe variation in results.',
 AC9M5ST01:'Acquire, validate and represent nominal and ordinal categorical and discrete numerical data using software; describe mode and shape in context.',
 AC9M5ST02:'Interpret line graphs showing change over time and discuss the relationships and conclusions supported by them.',
 AC9M5P01:'List possible outcomes of equally likely chance experiments and compare with outcomes that are not equally likely; formal numerical probability is not required by this descriptor.',
 AC9M5P02:'Conduct repeated experiments with equally and unequally likely outcomes; record results and use frequencies to compare outcomes and estimate likelihoods.',
 AC9M6P01:'Represent probabilities on zero-to-one and zero-to-100-percent scales; use estimates, common fractions, decimals and percentages in context.',
};
const NO_CALCULATOR_DESCRIPTORS = new Set(['AC9M3N03','AC9M3A02','AC9M4N05','AC9M4A02','AC9M6N06']);
const CALCULATOR_ELIGIBLE_DESCRIPTORS = new Set(['AC9M3N06','AC9M4N06','AC9M4N08','AC9M5N06','AC9M5N07','AC9M5N09','AC9M6N04','AC9M6N07','AC9M6N09']);
export function assessmentToolPolicy(code:string){
 return {
  calculator: NO_CALCULATOR_DESCRIPTORS.has(code)?'prohibited-by-descriptor':CALCULATOR_ELIGIBLE_DESCRIPTORS.has(code)?'available-with-strategy-evidence':'not-provided',
  taskTools:'Provide the construction, measurement or data tools specified in the slot; identical controls across all five forms.',
  access:'Read-aloud and accessibility support remain available and must not supply a method or answer.',
 } as const;
}
