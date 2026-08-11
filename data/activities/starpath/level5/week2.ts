import { trackCellTask, countTask, relationTask } from "./netTasks";
import { solidFacesTask, solidPartsTask } from "./solidTasks";
import { lessonContent, taskSet, teaching } from "./lessonUtils";

const kinds = ["starpathNet", "starpathNet", "starpathNet"] as const;

export const createTrackFaceTaskSet = () => taskSet([trackCellTask, trackCellTask, countTask], teaching("Track a Face", "Follow one face through the fold.", "Pick a face on the net and imagine folding the cube. Opposite faces end up on far sides and never touch."));
export const createFoldNetTaskSet = () => taskSet([
  (r, t) => solidPartsTask(r, t, "triPrism"),
  (r, t) => solidFacesTask(r, t, "pyramid"),
  (r, t) => solidPartsTask(r, t, "cuboid"),
], teaching("Parts of a Solid", "Every flat piece of a net becomes a face.", "A solid's net is made of its faces laid out flat. A triangular prism is three rectangles and two triangles; a pyramid is a square and four triangles. Fold it up and count the faces."), 20);
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
  next: "Parts of a Solid",
  createTaskSet: createTrackFaceTaskSet,
});

export const FOLD_NET_CONTENT = lessonContent({
  title: "Parts of a Solid",
  brief: "Break a solid's net into its flat shapes and count its faces.",
  criteria: ["see faces as the parts of a net", "name the shapes in a net", "count a solid's faces"],
  activities: ["Shapes in the Net", "Count the Faces", "Build from Parts"],
  kinds,
  reflection: "What are the parts of a net?",
  reflectionOptions: ["The flat faces of the solid", "Only squares", "The solid's shadow"],
  skills: ["Identify faces in a net", "Name flat shapes", "Count a solid's faces"],
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
