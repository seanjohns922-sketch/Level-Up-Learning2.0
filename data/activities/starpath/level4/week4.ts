import { lessonContent, taskSet, teaching } from "./lessonUtils";
import {
  cellToReferenceTask,
  labelGridTask,
  landmarkToReferenceTask,
  placeAtReferenceTask,
  referenceDebugTask,
  referenceToCellTask,
  referenceToLandmarkTask,
  repairLabelsTask,
} from "./gridReference";

export const createReadGridTaskSet = () => taskSet(
  [referenceToCellTask, cellToReferenceTask, referenceDebugTask],
  teaching("Read the Grid", "A grid reference names one cell.", "Read the column letter first, then the row number. B3 means column B and row 3. A grid reference names a cell, not the lines around it."),
);

export const createLocateFeatureTaskSet = () => taskSet(
  [referenceToLandmarkTask, landmarkToReferenceTask, placeAtReferenceTask],
  teaching("Locate the Feature", "References make crowded maps precise.", "Use a reference to find a landmark, report a landmark's reference, and place a new feature in an exact cell."),
  20,
);

export const createBuildGridTaskSet = () => taskSet(
  [labelGridTask, placeAtReferenceTask, repairLabelsTask],
  teaching("Build the Grid System", "A useful system labels every row and column consistently.", "Build the labels in order, use the finished system to place a feature, then repair any missing or repeated label."),
  30,
);

export const READ_GRID_CONTENT = lessonContent({
  title: "Read the Grid",
  brief: "Decode orbital sector references in both directions and find the report that names the wrong cell.",
  criteria: ["read the column letter first", "read the row number second", "check the exact cell"],
  activities: ["Reference to Cell", "Cell to Reference", "Reference Debug"],
  reflection: "How does a grid reference name one cell?",
  reflectionOptions: ["The letter names the column", "The number names the row", "I use both labels together"],
  skills: ["Interpret grid references", "Name referenced cells", "Detect reference errors"],
  next: "Locate the Feature",
  createTaskSet: createReadGridTaskSet,
});

export const LOCATE_FEATURE_CONTENT = lessonContent({
  title: "Locate the Feature",
  brief: "Use grid references to find, report and place mission landmarks precisely on crowded maps.",
  criteria: ["find the referenced cell", "report a landmark reference", "place a feature precisely"],
  activities: ["Find the Landmark", "Report the Position", "Place the Supply Pod"],
  reflection: "Why are grid references useful on a busy map?",
  reflectionOptions: ["They identify one exact cell", "They remove vague location clues", "Another navigator can use them"],
  skills: ["Locate map features", "Generate references", "Place features from references"],
  next: "Build the Grid System",
  createTaskSet: createLocateFeatureTaskSet,
});

export const BUILD_GRID_CONTENT = lessonContent({
  title: "Build the Grid System",
  brief: "Create, use and repair a complete reference system that another navigator can interpret.",
  criteria: ["label every column", "label every row", "repair inconsistent labels"],
  activities: ["Label the Grid", "Place and Report", "Navigator Test"],
  reflection: "What makes a grid reference system unambiguous?",
  reflectionOptions: ["Every label has one place", "Labels follow a consistent order", "Every cell has one reference"],
  skills: ["Create a reference system", "Use a created grid", "Debug grid labels"],
  next: "Week 4 Voyage Quiz",
  createTaskSet: createBuildGridTaskSet,
});
