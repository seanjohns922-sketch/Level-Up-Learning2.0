import { buildTask, classifyTask, selectValidTask } from "./netTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathNet", "starpathNet", "starpathNet"] as const;

export const createArrangeTaskSet = () => taskSet([buildTask, classifyTask, buildTask], teaching("Arrange the Faces", "Build your own net that folds into a cube.", "Place six faces edge to edge so they fold up into a cube with no overlaps. Use Fold it to test your net and fix it if two faces clash."));
export const createTestFoldTaskSet = () => taskSet([classifyTask, classifyTask, selectValidTask], teaching("Test the Fold", "Test a net for overlaps and gaps.", "A net fails if two faces overlap, or if a face is missing. Fold it up and watch what happens."), 20);
export const createCompareNetsTaskSet = () => taskSet([selectValidTask, buildTask, selectValidTask], teaching("Compare Valid Nets", "Many different nets fold into the same cube.", "A cube has eleven different nets. Choose every flat shape that folds into a cube — more than one works."), 30);

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
  next: "Compare Valid Nets",
  createTaskSet: createTestFoldTaskSet,
});

export const COMPARE_NETS_CONTENT = lessonContent({
  title: "Compare Valid Nets",
  brief: "Show that different nets can fold into the same cube.",
  criteria: ["find several valid nets", "compare different layouts", "build one of your own"],
  activities: ["Choose the Valid Nets", "Build One", "Find Them All"],
  kinds,
  reflection: "How many nets fold into a cube?",
  reflectionOptions: ["Many different ones (eleven)", "Only one", "Exactly six"],
  skills: ["Compare valid nets", "Recognise many solutions", "Construct a net"],
  next: "Week 3 Voyage Quiz",
  createTaskSet: createCompareNetsTaskSet,
});
