import { trackCellTask, countTask, relationTask } from "./netTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathNet", "starpathNet", "starpathNet"] as const;

export const createTrackFaceTaskSet = () => taskSet([trackCellTask, trackCellTask, countTask], teaching("Track a Face", "Follow one face through the fold.", "Pick a face on the net and imagine folding the cube. Opposite faces end up on far sides and never touch."));
export const createFoldNetTaskSet = () => taskSet([countTask, trackCellTask, countTask], teaching("Fold the Net", "Fold the net and watch where faces go.", "As a cube folds, every face touches four others. Only the face across from it — the opposite face — never touches it."), 20);
export const createRelationTaskSet = () => taskSet([relationTask, relationTask, trackCellTask], teaching("Opposite and Adjacent", "Faces are opposite or next to each other.", "Two faces are opposite if they sit across the cube, or next to each other (adjacent) if they share an edge. Fold it up to be sure."), 30);

export const TRACK_FACE_CONTENT = lessonContent({
  title: "Track a Face",
  brief: "Follow a single face through a fold to find where it lands on the cube.",
  criteria: ["track a face while folding", "find the opposite face", "know opposite faces never touch"],
  activities: ["Find the Opposite", "Far Side", "Count the Touches"],
  kinds,
  reflection: "Where does the opposite face end up?",
  reflectionOptions: ["Across the cube, never touching", "Right next to it", "In the same place"],
  skills: ["Track faces through a fold", "Locate opposite faces", "Reason about a cube"],
  next: "Fold the Net",
  createTaskSet: createTrackFaceTaskSet,
});

export const FOLD_NET_CONTENT = lessonContent({
  title: "Fold the Net",
  brief: "Fold nets into cubes and work out how faces meet.",
  criteria: ["fold a net into a cube", "count faces that touch", "identify the one that does not"],
  activities: ["How Many Touch?", "Track a Face", "Touch Count"],
  kinds,
  reflection: "How many faces touch any one face of a cube?",
  reflectionOptions: ["Four", "Six", "Two"],
  skills: ["Fold nets mentally", "Count adjacent faces", "Spot the opposite face"],
  next: "Opposite and Adjacent",
  createTaskSet: createFoldNetTaskSet,
});

export const RELATION_CONTENT = lessonContent({
  title: "Opposite and Adjacent",
  brief: "Decide whether two faces end up opposite or next to each other after folding.",
  criteria: ["tell opposite from adjacent", "use shared edges as evidence", "check by folding"],
  activities: ["Opposite or Next To?", "Meet the Faces", "Find the Opposite"],
  kinds,
  reflection: "When are two faces adjacent?",
  reflectionOptions: ["When they share an edge", "When they sit across the cube", "When they are the same colour"],
  skills: ["Classify face relationships", "Use edges as evidence", "Verify with a fold"],
  next: "Week 2 Voyage Quiz",
  createTaskSet: createRelationTaskSet,
});
