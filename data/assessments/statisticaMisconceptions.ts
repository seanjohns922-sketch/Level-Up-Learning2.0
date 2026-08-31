export type StatisticaMisconception = {
  id: string;
  label: string;
  description: string;
  descriptorCodes: readonly string[];
};

export const STATISTICA_MISCONCEPTION_LIBRARY: readonly StatisticaMisconception[] = [
  { id: "data-is-only-numbers", label: "Data means numbers only", description: "Treats categories, observations or responses as not being data.", descriptorCodes: ["AC9M1ST01", "AC9M2ST01", "AC9M3ST01"] },
  { id: "category-overlap", label: "Categories may overlap", description: "Uses categories that allow one response to be counted more than once.", descriptorCodes: ["AC9M1ST01", "AC9M2ST01", "AC9M3ST01", "AC9M5ST01"] },
  { id: "tally-total-confusion", label: "Tallies are labels", description: "Reads tally groups or list entries without counting their frequency.", descriptorCodes: ["AC9M1ST01", "AC9M2ST01", "AC9M3ST01"] },
  { id: "picture-count-not-key", label: "Counts pictures, not the key", description: "Assumes every symbol represents one item in a many-to-one display.", descriptorCodes: ["AC9M1ST02", "AC9M2ST02", "AC9M4ST01"] },
  { id: "height-without-scale", label: "Reads height without scale", description: "Uses visual height but ignores labels, intervals or the graph scale.", descriptorCodes: ["AC9M2ST02", "AC9M3ST02", "AC9M4ST01", "AC9M5ST02", "AC9M6ST01"] },
  { id: "largest-means-majority", label: "Largest means majority", description: "Assumes the largest category must contain more than half the data.", descriptorCodes: ["AC9M1ST02", "AC9M2ST02", "AC9M3ST02", "AC9M4ST02", "AC9M6ST02"] },
  { id: "question-not-statistical", label: "Any question is statistical", description: "Does not recognise that a statistical question anticipates varying responses.", descriptorCodes: ["AC9M2ST01", "AC9M3ST03", "AC9M4ST03", "AC9M5ST03", "AC9M6ST03"] },
  { id: "unsupported-conclusion", label: "Conclusion exceeds evidence", description: "Makes an absolute, causal or population-wide claim unsupported by the collected data.", descriptorCodes: ["AC9M3ST02", "AC9M3ST03", "AC9M4ST02", "AC9M4ST03", "AC9M5ST02", "AC9M5ST03", "AC9M6ST02", "AC9M6ST03"] },
  { id: "display-choice-is-decoration", label: "Display choice is decoration", description: "Chooses a display by appearance rather than the data type and question.", descriptorCodes: ["AC9M2ST02", "AC9M3ST02", "AC9M4ST02", "AC9M5ST01"] },
  { id: "variation-is-largest-value", label: "Variation is the maximum", description: "Confuses spread or variation with the single largest observation.", descriptorCodes: ["AC9M4ST02", "AC9M5ST01", "AC9M6ST01"] },
  { id: "mode-is-largest-number", label: "Mode is the largest value", description: "Selects the greatest value rather than the value occurring most often.", descriptorCodes: ["AC9M5ST01", "AC9M6ST01"] },
  { id: "range-adds-extremes", label: "Range adds extremes", description: "Adds the minimum and maximum instead of subtracting minimum from maximum.", descriptorCodes: ["AC9M6ST01"] },
  { id: "data-type-by-value", label: "Data type follows size", description: "Classifies data by how large its values are instead of whether it is categorical, counted or measured.", descriptorCodes: ["AC9M3ST01", "AC9M5ST01", "AC9M6ST01"] },
  { id: "line-graph-for-any-data", label: "Line graph fits every comparison", description: "Uses connected points for unrelated categories or ignores ordered change over time.", descriptorCodes: ["AC9M5ST02"] },
  { id: "sample-represents-everyone", label: "Any sample represents everyone", description: "Generalises from a biased, voluntary or narrowly selected sample.", descriptorCodes: ["AC9M4ST03", "AC9M5ST03", "AC9M6ST02", "AC9M6ST03"] },
  { id: "cleaning-means-delete", label: "Cleaning means deleting", description: "Removes inconvenient data instead of checking errors against collection rules.", descriptorCodes: ["AC9M5ST01"] },
  { id: "truncated-axis-is-zero", label: "Columns always begin at zero", description: "Interprets visible column length as the full value when the axis is truncated.", descriptorCodes: ["AC9M6ST02"] },
  { id: "graphic-area-is-linear", label: "Picture area grows linearly", description: "Misses that increasing both width and height exaggerates area quadratically.", descriptorCodes: ["AC9M6ST02"] },
  { id: "selected-data-is-complete", label: "Published data is complete", description: "Does not check whether periods, categories or responses were omitted.", descriptorCodes: ["AC9M6ST02", "AC9M6ST03"] },
] as const;

const misconceptionMap = new Map(STATISTICA_MISCONCEPTION_LIBRARY.map((entry) => [entry.id, entry]));

export function getStatisticaMisconception(id: string) {
  return misconceptionMap.get(id) ?? null;
}
