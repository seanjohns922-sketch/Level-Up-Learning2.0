import { chooseNetTask, foldPredictTask, reasonTask } from "./netTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathNet", "starpathNet", "starpathNet"] as const;

export const createUnfoldTaskSet = () => taskSet([chooseNetTask, foldPredictTask, chooseNetTask], teaching("Objects and Nets", "A net is a flat shape that folds into a solid.", "A cube has six square faces. When you unfold it you get a flat net of six squares joined edge to edge. Fold a net back up and the squares close into the cube."));
export const createWhichNetTaskSet = () => taskSet([foldPredictTask, foldPredictTask, chooseNetTask], teaching("Which Net Folds?", "Only some flat shapes fold into a cube.", "Six squares are not enough on their own — they must fold up without two faces landing on the same spot. Fold it to test."), 20);
export const createExplainMatchTaskSet = () => taskSet([reasonTask, foldPredictTask, reasonTask], teaching("Explain the Match", "Use folding evidence to explain why a net works.", "A net folds into a cube when its six faces meet edge to edge and close with no gaps and no overlaps."), 30);

export const UNFOLD_CONTENT = lessonContent({
  title: "Unfold the Object",
  brief: "Match cubes to the flat nets they unfold into and learn what a net is.",
  criteria: ["see a net as an unfolded object", "match a cube to a valid net", "reject shapes that cannot fold"],
  activities: ["Meet the Net", "Fold to Test", "Match the Cube"],
  kinds,
  reflection: "What is a net?",
  reflectionOptions: ["A flat shape that folds into a solid", "Any six squares joined together", "A picture of a cube"],
  skills: ["Recognise a net", "Connect a net to its object", "Test a fold"],
  next: "Which Net Folds?",
  createTaskSet: createUnfoldTaskSet,
});

export const WHICH_NET_CONTENT = lessonContent({
  title: "Which Net Folds?",
  brief: "Predict whether a flat arrangement of six squares folds into a closed cube.",
  criteria: ["predict a fold before testing", "spot overlapping faces", "confirm a valid cube net"],
  activities: ["Predict the Fold", "Overlap Check", "Choose the Net"],
  kinds,
  reflection: "Why do some six-square shapes fail to fold?",
  reflectionOptions: ["Two faces would overlap", "They have too few faces", "Their colour is wrong"],
  skills: ["Predict fold outcomes", "Detect overlaps", "Identify valid nets"],
  next: "Explain the Match",
  createTaskSet: createWhichNetTaskSet,
});

export const EXPLAIN_MATCH_CONTENT = lessonContent({
  title: "Explain the Match",
  brief: "Justify why a net folds into a cube using face and edge evidence.",
  criteria: ["explain with folding evidence", "reject colour-only reasoning", "confirm six non-overlapping faces"],
  activities: ["Best Reason", "Fold to Check", "Explain It"],
  kinds,
  reflection: "What proves a net folds into a cube?",
  reflectionOptions: ["Six faces fold without overlapping", "It has one straight line of faces", "Every face is the same colour"],
  skills: ["Reason about folds", "Use edge evidence", "Justify a net"],
  next: "Week 1 Voyage Quiz",
  createTaskSet: createExplainMatchTaskSet,
});
