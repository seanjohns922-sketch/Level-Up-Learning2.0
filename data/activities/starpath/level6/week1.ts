import { sliceShapeTask, sliceChangeTask, predictTask } from "./crossTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathCrossSection", "starpathCrossSection", "starpathCrossSection"] as const;

export const createSliceSeeTaskSet = () => taskSet([sliceShapeTask, sliceShapeTask, sliceShapeTask], teaching("Cross-sections", "A cross-section is the flat shape a cut makes.", "When you slice straight through an object, the flat face you reveal is its cross-section. Slide the cut to see the 2D shape appear."));
export const createSliceSequenceTaskSet = () => taskSet([sliceChangeTask, sliceChangeTask, sliceChangeTask], teaching("Parallel Slices", "Compare slices at different heights.", "Take several parallel cuts up the object. Some objects give the same slice every time; others give a slice that keeps changing size."), 20);
export const createPredictTaskSet = () => taskSet([predictTask, predictTask, predictTask], teaching("Predict the Cut", "Picture the slice before you cut.", "A horizontal cut makes the same shape as the object's base. Picture the base, predict the section, then slide to check."), 30);

export const SLICE_SEE_CONTENT = lessonContent({
  title: "Slice and See",
  brief: "Slice objects and name the 2D cross-section each cut reveals.",
  criteria: ["see a cross-section as a flat slice", "name the section shape", "connect the cut to the object's base"],
  activities: ["Name the Slice", "Slice Again", "Match the Section"],
  kinds,
  reflection: "What is a cross-section?",
  reflectionOptions: ["The flat shape a cut reveals", "The shadow of an object", "The net of an object"],
  skills: ["Recognise a cross-section", "Name 2D section shapes", "Relate a cut to the base"],
  next: "Parallel Slice Sequence",
  createTaskSet: createSliceSeeTaskSet,
});

export const SLICE_SEQUENCE_CONTENT = lessonContent({
  title: "Parallel Slice Sequence",
  brief: "Compare parallel cross-sections and decide whether they stay the same or change.",
  criteria: ["take parallel slices", "compare section sizes", "spot constant vs changing sections"],
  activities: ["Same or Changing?", "Slice by Slice", "Compare the Cuts"],
  kinds,
  reflection: "What happens to a pyramid's slices as you go up?",
  reflectionOptions: ["They get smaller", "They stay the same", "They get bigger"],
  skills: ["Compare parallel slices", "Detect changing sections", "Reason about height"],
  next: "Predict Before Cutting",
  createTaskSet: createSliceSequenceTaskSet,
});

export const PREDICT_CONTENT = lessonContent({
  title: "Predict Before Cutting",
  brief: "Predict a cross-section from the object's base, then test the prediction.",
  criteria: ["predict a section before slicing", "use the base to reason", "check a prediction by slicing"],
  activities: ["Predict the Shape", "Base to Section", "Check by Slicing"],
  kinds,
  reflection: "How can you predict a horizontal cross-section?",
  reflectionOptions: ["It matches the object's base", "It is always a circle", "It is always smaller"],
  skills: ["Predict a section", "Reason from the base", "Verify by slicing"],
  next: "Prism or Not?",
  createTaskSet: createPredictTaskSet,
});
