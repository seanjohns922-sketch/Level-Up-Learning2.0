import { buildTask, classifyTask, selectValidTask } from "./netTasks";
import { nameSolidTask, solidFacesTask } from "./solidTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathNet", "starpathNet", "starpathNet"] as const;

export const createArrangeTaskSet = () => taskSet([buildTask, classifyTask, buildTask], teaching("Arrange the Faces", "Build your own net that folds into a cube.", "Place six faces edge to edge so they fold up into a cube with no overlaps. Use Fold it to test your net and fix it if two faces clash."));
export const createTestFoldTaskSet = () => taskSet([classifyTask, classifyTask, selectValidTask], teaching("Test the Fold", "Test a net for overlaps and gaps.", "A net fails if two faces overlap, or if a face is missing. Fold it up and watch what happens."), 20);
export const createCompareNetsTaskSet = () => taskSet([
  (r, t) => nameSolidTask(r, t, "triPrism"),
  (r, t) => solidFacesTask(r, t, "pyramid"),
  (r, t) => nameSolidTask(r, t, "cuboid"),
], teaching("Name the Solid", "Tell the solids apart by their nets.", "A rectangular prism, a triangular prism and a square pyramid each fold from their own net. Fold each one up and name the solid it makes."), 10);

export const ARRANGE_CONTENT = lessonContent({
  title: "Arrange the Faces",
  brief: "Design a valid cube net by arranging six faces, then fold to test it.",
  criteria: ["arrange six connected faces", "avoid overlaps when folded", "test and revise a net"],
  activities: ["Build a Net", "Test It", "Build Another"],
  kinds,
  reflection: "How do you know your net will fold?",
  reflectionOptions: ["Fold it and no faces overlap", "It has six faces of one colour", "It is a straight line"],
  skills: ["Construct a net", "Test a fold", "Revise a layout"],
  next: "Test the Fold",
  createTaskSet: createArrangeTaskSet,
});

export const TEST_FOLD_CONTENT = lessonContent({
  title: "Test the Fold",
  brief: "Diagnose whether a net folds cleanly, overlaps, or is missing a face.",
  criteria: ["diagnose overlap and gap faults", "confirm a clean fold", "sort valid from invalid nets"],
  activities: ["What Happens?", "Fault Finder", "Choose the Valid Nets"],
  kinds,
  reflection: "What can go wrong when a net folds?",
  reflectionOptions: ["Overlap or a missing face", "The colour changes", "Nothing ever goes wrong"],
  skills: ["Diagnose fold faults", "Confirm valid nets", "Sort nets"],
  next: "Week 3 Voyage Quiz",
  createTaskSet: createTestFoldTaskSet,
});

export const COMPARE_NETS_CONTENT = lessonContent({
  title: "Name the Solid",
  brief: "Tell cubes, prisms and pyramids apart by folding their nets.",
  criteria: ["fold a net into its solid", "compare face counts", "name each 3D solid"],
  activities: ["Prism or Pyramid?", "Count the Faces", "Name the Prism"],
  kinds,
  reflection: "Which solids have five faces?",
  reflectionOptions: ["A triangular prism and a square pyramid", "A cube and a cuboid", "Only a cube"],
  skills: ["Name 3D solids", "Compare face counts", "Match a net to its solid"],
  next: "Arrange the Faces",
  createTaskSet: createCompareNetsTaskSet,
});
