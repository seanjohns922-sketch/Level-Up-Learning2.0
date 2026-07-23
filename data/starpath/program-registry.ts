import type { StarpathLevelId } from "@/lib/starpath-levels";

export const STARPATH_PROGRAM_STATUS = "planned" as const;
export const STARPATH_WEEK_COUNT = 8 as const;
export const STARPATH_LESSONS_PER_WEEK = 3 as const;
export const STARPATH_QUIZ_WEEKS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export const STARPATH_ASSESSMENT_QUESTION_COUNT = 20 as const;
export const STARPATH_QUIZ_QUESTIONS_PER_LESSON = 5 as const;

export type StarpathCurriculumStatus = "planned" | "approved" | "implemented" | "validated";
export type StarpathSequenceRole = "build" | "develop" | "apply";
export type StarpathReportingCategory =
  | "shape-and-object-reasoning"
  | "position-and-navigation"
  | "spatial-representation"
  | "symmetry-and-transformation"
  | "construction-and-visualisation";

export type StarpathDescriptor = {
  code: string;
  text: string;
  sourceUrl: string;
};

export type StarpathSkill = {
  id: string;
  studentName: string;
  teacherDescription: string;
  level: StarpathLevelId;
  descriptorCodes: string[];
  prerequisiteSkillIds: string[];
  weeks: number[];
  reportingCategory: StarpathReportingCategory;
  assessmentEligible: boolean;
  targetedPathwayEligible: boolean;
  status: StarpathCurriculumStatus;
};

export type StarpathLessonPlan = {
  id: string;
  title: string;
  sequenceRole: StarpathSequenceRole;
  focus: string;
  learningIntention: string;
  skillIds: string[];
  activityMechanics: readonly [string, string, string];
  status: StarpathCurriculumStatus;
};

export type StarpathWeekPlan = {
  week: number;
  title: string;
  centralConcept: string;
  descriptorCodes: string[];
  lessons: readonly [StarpathLessonPlan, StarpathLessonPlan, StarpathLessonPlan];
  vocabulary: string[];
  skillIds: string[];
  misconceptions: string[];
  quiz: { id: string; coverage: string; questionCount: 15; status: StarpathCurriculumStatus } | null;
  status: StarpathCurriculumStatus;
};

export type StarpathLevelProgram = {
  realmId: "space";
  level: StarpathLevelId;
  yearLabel: string;
  programId: string;
  title: string;
  summary: string;
  descriptors: StarpathDescriptor[];
  achievementStandardConnection: string;
  prerequisites: string[];
  likelyMisconceptions: string[];
  progressionRationale: string;
  skills: StarpathSkill[];
  weeks: StarpathWeekPlan[];
  assessments: {
    preTest: { id: string; questionCount: 20; status: StarpathCurriculumStatus } | null;
    postTest: { id: string; questionCount: 20; unlockAfterLessonId: string; status: StarpathCurriculumStatus };
  };
  status: StarpathCurriculumStatus;
};

type WeekDefinition = {
  title: string;
  concept: string;
  descriptors: string[];
  skill: Omit<StarpathSkill, "level" | "weeks" | "status">;
  lessons: readonly [readonly [string, string], readonly [string, string], readonly [string, string]];
  mechanics: readonly [string, string, string];
  vocabulary: string[];
  misconceptions: string[];
  quiz: string;
};

type LevelDefinition = Omit<StarpathLevelProgram, "realmId" | "programId" | "skills" | "weeks" | "assessments" | "status"> & {
  prefix: string;
  weeks: WeekDefinition[];
};

const QCAA_SEQUENCE = "https://www.qcaa.qld.edu.au/downloads/aciqv9/mathematics/curriculum/ac9_maths_prep-yr10_as_cd_sequence_aspects.pdf";

const descriptor = (code: string, text: string): StarpathDescriptor => ({ code, text, sourceUrl: QCAA_SEQUENCE });
const skill = (
  id: string,
  studentName: string,
  teacherDescription: string,
  descriptorCodes: string[],
  reportingCategory: StarpathReportingCategory,
  prerequisiteSkillIds: string[] = [],
): WeekDefinition["skill"] => ({
  id,
  studentName,
  teacherDescription,
  descriptorCodes,
  prerequisiteSkillIds,
  reportingCategory,
  assessmentEligible: true,
  targetedPathwayEligible: true,
});

const W = (
  title: string,
  concept: string,
  descriptors: string[],
  weekSkill: WeekDefinition["skill"],
  lessons: WeekDefinition["lessons"],
  mechanics: WeekDefinition["mechanics"],
  vocabulary: string[],
  misconceptions: string[],
  quiz: string,
): WeekDefinition => ({ title, concept, descriptors, skill: weekSkill, lessons, mechanics, vocabulary, misconceptions, quiz });

const LEVEL_DEFINITIONS: LevelDefinition[] = [
  {
    level: "ground",
    yearLabel: "Foundation",
    prefix: "ground",
    title: "Starpath Ground Level: Shape and Space Explorers",
    summary: "Young Space Explorers recognise, create, sort and find familiar shapes, then describe and apply position and movement language in a final Starpath adventure.",
    descriptors: [
      descriptor("AC9MFSP01", "Sort, name and create familiar shapes; recognise and describe familiar shapes within objects in the environment, giving reasons."),
      descriptor("AC9MFSP02", "Describe position and movement of self and objects in relation to other objects and locations within a familiar space."),
    ],
    achievementStandardConnection: "Students describe familiar shapes and the position and location of themselves and objects relative to other objects and people in familiar spaces.",
    prerequisites: ["Everyday experience with objects, movement and simple location words."],
    likelyMisconceptions: ["A shape changes name when rotated.", "Size or colour determines a shape.", "Position words have a fixed viewpoint."],
    progressionRationale: "The sequence deliberately moves from recognise to create, sort, describe and apply. Changing the context from shape spotting to building, environmental searches, navigation and a final Space Graduation keeps Foundation practice varied while remaining aligned to AC9MFSP01 and AC9MFSP02. Completion is planned to unlock the Ground Level Starpath Graduate title.",
    weeks: [
      W("Shape Spotters", "Recognise and name familiar two-dimensional shapes in varied Starpath scenes.", ["AC9MFSP01"], skill("space-ground-shape-recognition", "Spot familiar shapes", "Recognises and names circles, squares, triangles and rectangles despite changes in size, colour or orientation.", ["AC9MFSP01"], "shape-and-object-reasoning"), [["Meet the Shapes", "Recognise circles, squares, triangles and rectangles."], ["Shape Detectives", "Find familiar shapes hidden inside everyday objects."], ["Match the Shapes", "Match and simply sort familiar shapes."]], ["shape-introduction", "scene-shape-hunt", "shape-match-sort"], ["circle", "square", "triangle", "rectangle", "shape"], ["A shape changes name when it is turned.", "The colour or size determines the shape."], "Recognition, naming, matching and simple sorting."),
      W("Shape Builders", "Create familiar shapes and pictures from lines, parts and smaller shapes.", ["AC9MFSP01"], skill("space-ground-shape-creation", "Make shapes", "Creates familiar shapes and simple pictures from lines, parts and smaller shapes while using shape language.", ["AC9MFSP01"], "construction-and-visualisation", ["space-ground-shape-recognition"]), [["Build with Shapes", "Create familiar shapes using sticks, stars and lines."], ["Complete the Shape", "Add missing sides or parts to finish a familiar shape."], ["Draw with Shapes", "Create a rocket, house, tree or robot from familiar shapes."]], ["line-shape-builder", "missing-part-completer", "shape-picture-studio"], ["build", "side", "line", "part", "picture"], ["A shape must be drawn in one particular way.", "A picture can contain only one shape."], "Shape construction, completion and picture composition."),
      W("Shape Sorters", "Sort and compare familiar shapes using Foundation language.", ["AC9MFSP01"], skill("space-ground-shape-sorting", "Sort shapes with a reason", "Sorts and compares familiar shapes using corners, sides and round or not-round language.", ["AC9MFSP01"], "shape-and-object-reasoning", ["space-ground-shape-recognition"]), [["Sort by Shape", "Group familiar shapes by their names."], ["What's Different?", "Compare corners, sides and whether shapes are round or not round."], ["Shape Families", "Group similar shapes and explain what belongs together."]], ["drag-shape-sort", "feature-compare", "shape-family-builder"], ["sort", "same", "different", "corner", "round"], ["There is only one way to sort a group of shapes.", "Shapes that look different cannot belong to the same family."], "Sorting, visible-feature comparison and simple explanations."),
      W("Shapes Around Us", "Recognise familiar shapes within space and everyday objects.", ["AC9MFSP01"], skill("space-ground-shapes-in-objects", "Find shapes in objects", "Identifies familiar shapes within environmental objects and gives a simple reason for the match.", ["AC9MFSP01"], "spatial-representation", ["space-ground-shape-recognition"]), [["Space Objects", "Find familiar shapes in rockets, planets and satellites."], ["Home Objects", "Find familiar shapes in everyday environments."], ["Treasure Hunt", "Find every object that matches a chosen shape."]], ["space-object-hotspot", "home-shape-match", "target-shape-hunt"], ["object", "rocket", "planet", "match", "find"], ["An object must be exactly one shape.", "Only space objects contain useful shapes."], "Environmental shape recognition across space and familiar contexts."),
      W("Space Positions", "Use positional language to describe where objects are.", ["AC9MFSP02"], skill("space-ground-position-language", "Say where things are", "Uses above, below, beside, in, on, under and behind from a clear viewpoint.", ["AC9MFSP02"], "position-and-navigation"), [["Above, Below, Beside", "Identify and describe simple relative positions."], ["In, On, Under, Behind", "Use containment and relative position words in familiar scenes."], ["Move the Object", "Drag an object to a location described by a positional clue."]], ["position-word-match", "position-scene-choice", "drag-to-position"], ["above", "below", "beside", "in", "under"], ["A position word describes an object without a reference object.", "On and above always mean the same thing."], "Relational position vocabulary and interactive placement."),
      W("Space Adventures", "Follow and apply positional clues in playful movement and location missions.", ["AC9MFSP02"], skill("space-ground-movement-pathways", "Follow space clues", "Follows positional clues to move through a familiar space and locate hidden objects.", ["AC9MFSP02"], "position-and-navigation", ["space-ground-position-language"]), [["Guide the Rocket", "Move a rocket by following simple positional directions."], ["Help Geospin", "Follow positional clues to help Geospin reach a destination."], ["Hidden Treasure", "Find an object by applying a sequence of location clues."]], ["rocket-position-guide", "character-clue-path", "hidden-object-clues"], ["move", "clue", "location", "next", "behind"], ["Clues can be followed in any order.", "The destination alone tells us how to move."], "Applying position and movement language in ordered adventures."),
      W("Build Starpath", "Combine familiar shapes and positions to create and describe a space scene.", ["AC9MFSP01", "AC9MFSP02"], skill("space-ground-shape-position-composition", "Build and describe a space scene", "Combines familiar shapes in a space scene and describes where objects are using simple positional language.", ["AC9MFSP01", "AC9MFSP02"], "construction-and-visualisation", ["space-ground-shape-creation", "space-ground-position-language"]), [["Build a Planet", "Combine familiar shapes to create a planet design."], ["Create a Space Scene", "Arrange shape-built objects in a Starpath scene."], ["Describe Your Picture", "Use simple oral positional language to describe the scene."]], ["planet-shape-builder", "space-scene-composer", "oral-scene-description"], ["create", "planet", "scene", "beside", "describe"], ["A scene has only one correct arrangement.", "A listener can see where everything is without position words."], "Combining shape creation, scene composition and positional description."),
      W("Space Graduation", "Apply shape recognition, creation, sorting and position language in a final adventure.", ["AC9MFSP01", "AC9MFSP02"], skill("space-ground-spatial-mission", "Complete Space Graduation", "Integrates shape recognition, creation, sorting and positional language to solve a cumulative Starpath mission.", ["AC9MFSP01", "AC9MFSP02"], "spatial-representation", ["space-ground-shape-sorting", "space-ground-shapes-in-objects", "space-ground-movement-pathways", "space-ground-shape-position-composition"]), [["Shape Explorer Challenge", "Recognise, create and sort familiar shapes in a cumulative challenge."], ["Position Explorer Challenge", "Describe positions and follow location clues in a cumulative challenge."], ["Geospin's Final Mission", "Help Geospin complete an adventure combining all Ground Level skills."]], ["shape-explorer-challenge", "position-explorer-challenge", "geospin-final-mission"], ["shape", "sort", "position", "mission", "explorer"], ["Only one type of shape or position clue can appear in a mission.", "A successful answer does not need a reason or description."], "Cumulative Ground Level learning; completion is planned to unlock the Ground Level Starpath Graduate title."),
    ],
  },
  {
    level: "level-1", yearLabel: "Year 1", prefix: "y1", title: "Starpath Level 1: Shape Makers and Pathfinders",
    summary: "Students compare and classify familiar shapes and objects, then give and follow directions within spaces.",
    descriptors: [descriptor("AC9M1SP01", "Make, compare and classify familiar shapes; recognise familiar shapes and objects in the environment, identifying similarities and differences."), descriptor("AC9M1SP02", "Give and follow directions to move people and objects to different locations within a space.")],
    achievementStandardConnection: "Students make, compare and classify familiar shapes and objects and give and follow directions to move within a space.",
    prerequisites: ["Recognise common shapes.", "Use basic relational position and movement words."],
    likelyMisconceptions: ["Orientation changes a shape's identity.", "Directions work without a starting position.", "An object has only one useful shape description."],
    progressionRationale: "Foundation recognition develops into comparison, classification and construction; familiar movement develops into ordered, communicable routes.",
    weeks: [
      W("Shape Features", "Compare familiar shapes using observable features.", ["AC9M1SP01"], skill("space-l1-shape-features", "Compare shape features", "Compares familiar shapes using sides, corners, curved surfaces and straight edges.", ["AC9M1SP01"], "shape-and-object-reasoning", ["space-ground-shape-recognition"]), [["Feature Detectives", "Notice sides, corners, straight and curved boundaries."], ["Compare Two Shapes", "State a similarity and a difference."], ["Which One Belongs?", "Justify a choice using shape features."]], ["feature-hotspot", "compare-panel", "odd-one-out"], ["side", "corner", "straight", "curved", "feature"], ["Size is a defining feature.", "Curved shapes cannot have corners."], "Observable features, similarities and differences."),
      W("Shape Families", "Classify shapes and objects using shared features.", ["AC9M1SP01"], skill("space-l1-shape-classification", "Build shape families", "Classifies familiar shapes and objects and explains the shared feature.", ["AC9M1SP01"], "shape-and-object-reasoning", ["space-l1-shape-features"]), [["Meet the Families", "Group shapes by a given feature."], ["Make Your Own Rule", "Classify a mixed collection in a useful way."], ["Two Ways to Sort", "Reclassify the same set and compare rules."]], ["guided-sort", "open-sort", "reclassify-challenge"], ["classify", "family", "rule", "similar", "different"], ["There is only one correct classification.", "Objects with different uses cannot share shape features."], "Classification rules and flexible grouping."),
      W("Build and Take Apart", "Make shapes and identify parts within composites.", ["AC9M1SP01"], skill("space-l1-shape-composition", "Build shapes from parts", "Composes and decomposes familiar shapes while describing constituent parts.", ["AC9M1SP01"], "construction-and-visualisation", ["space-l1-shape-classification"]), [["Build the Target", "Compose a target from familiar shapes."], ["Find the Hidden Parts", "Decompose a composite into familiar shapes."], ["Design Two Ways", "Create and compare two valid constructions."]], ["shape-composer", "decompose-overlay", "design-builder"], ["compose", "decompose", "part", "whole", "overlap"], ["Parts cannot overlap.", "A composite has only one decomposition."], "Composition, decomposition and multiple solutions."),
      W("Objects and Views", "Connect familiar objects with simple shape representations.", ["AC9M1SP01"], skill("space-l1-objects-and-views", "Match objects and views", "Recognises shape features in simple pictures and views of familiar objects.", ["AC9M1SP01"], "spatial-representation", ["space-l1-shape-features"]), [["Object or Picture?", "Match familiar objects to simple representations."], ["Look from Here", "Compare how one object appears from two viewpoints."], ["Choose the Best View", "Select and explain a useful representation."]], ["object-picture-match", "viewpoint-toggle", "view-reasoning"], ["object", "picture", "view", "front", "top"], ["An object looks identical from every viewpoint.", "A picture is the object itself."], "Object-shape connections and simple viewpoints."),
      W("Direction Words", "Use precise movement and turn language.", ["AC9M1SP02"], skill("space-l1-direction-language", "Use direction words", "Uses forward, backward, left, right and turn language from a stated orientation.", ["AC9M1SP02"], "position-and-navigation", ["space-ground-movement-pathways"]), [["Face and Move", "Connect orientation with forward and backward."], ["Left and Right Turns", "Follow turns from a visible viewpoint."], ["Say the Move", "Describe a demonstrated movement precisely."]], ["orientation-mover", "turn-simulator", "movement-describer"], ["forward", "backward", "left", "right", "turn"], ["Left and right are fixed on the screen.", "A turn and a step are the same action."], "Orientation-aware directional language."),
      W("Follow the Route", "Follow ordered directions to reach locations.", ["AC9M1SP02"], skill("space-l1-follow-directions", "Follow a route", "Follows multi-step directions from a specified start and orientation.", ["AC9M1SP02"], "position-and-navigation", ["space-l1-direction-language"]), [["Start Here", "Identify start, destination and facing direction."], ["Mission Route", "Follow a sequence of moves in order."], ["Find the Error", "Diagnose an incorrect route and repair it."]], ["start-state-match", "route-runner", "route-debugger"], ["start", "finish", "order", "route", "step"], ["Directions can be followed in any order.", "The destination alone determines the route."], "Following and debugging ordered directions."),
      W("Give the Route", "Create unambiguous directions for others.", ["AC9M1SP02"], skill("space-l1-give-directions", "Give clear directions", "Creates and checks ordered directions that move a person or object to a location.", ["AC9M1SP02"], "position-and-navigation", ["space-l1-follow-directions"]), [["Build a Route", "Choose moves that connect a start and destination."], ["Directions for a Friend", "Record an ordered route another character can follow."], ["Test and Improve", "Run, revise and explain a route."]], ["route-builder", "direction-sequencer", "route-test-lab"], ["instruction", "sequence", "destination", "check", "improve"], ["The route is clear without a start or facing direction.", "A failed route must be discarded rather than revised."], "Creating, testing and communicating routes."),
      W("Pathfinder Challenge", "Integrate classification, views and directions.", ["AC9M1SP01", "AC9M1SP02"], skill("space-l1-pathfinder-reasoning", "Solve a pathfinder challenge", "Uses shape information and directions together to solve and explain spatial problems.", ["AC9M1SP01", "AC9M1SP02"], "spatial-representation", ["space-l1-objects-and-views", "space-l1-give-directions"]), [["Find the Shape Landmark", "Use shape clues to identify route landmarks."], ["Plan Around Obstacles", "Create a valid pathway through a familiar space."], ["Explain Your Path", "Compare routes and justify a solution."]], ["landmark-clue-match", "obstacle-route-planner", "route-compare"], ["landmark", "obstacle", "path", "compare", "explain"], ["The shortest-looking route always works.", "Different valid routes cannot share a destination."], "Cumulative shape classification and route reasoning."),
    ],
  },
  {
    level: "level-2", yearLabel: "Year 2", prefix: "y2", title: "Starpath Level 2: Shape Systems and Map Missions",
    summary: "Students classify regular and irregular shapes and objects, use two-dimensional representations, and reason about one-step transformations.",
    descriptors: [descriptor("AC9M2SP01", "Recognise, compare and classify shapes, referencing the number of sides and using spatial terms such as opposite, parallel, curved and straight."), descriptor("AC9M2SP02", "Locate and identify positions of features in two-dimensional representations and move position by following directions and pathways.")],
    achievementStandardConnection: "Students compare and classify shapes using formal spatial terms, locate features in two-dimensional representations and follow directions and pathways.",
    prerequisites: ["Compare and classify familiar shapes.", "Give and follow ordered directions."],
    likelyMisconceptions: ["Regular means common.", "Parallel lines must be horizontal.", "A transformation changes size or shape."],
    progressionRationale: "Feature language becomes more precise, maps become representational rather than pictorial, and movement reasoning extends from paths to transformations.",
    weeks: [
      W("Regular and Irregular", "Recognise regular and irregular shapes in varied orientations.", ["AC9M2SP01"], skill("space-l2-regular-irregular-shapes", "Compare regular and irregular shapes", "Recognises and compares regular and irregular shapes using visible properties rather than orientation.", ["AC9M2SP01"], "shape-and-object-reasoning", ["space-l1-shape-classification"]), [["What Makes It Regular?", "Compare equal and unequal side or angle appearances."], ["Turn and Compare", "Classify examples shown in varied orientations."], ["Defend the Group", "Explain why a shape belongs in a chosen group."]], ["regularity-sort", "orientation-classifier", "classification-reasoning"], ["regular", "irregular", "equal", "property", "orientation"], ["Regular means upright.", "All familiar shapes are regular."], "Regularity, orientation and justified classification."),
      W("Sides and Boundaries", "Describe shapes with straight, curved and parallel boundaries.", ["AC9M2SP01"], skill("space-l2-shape-properties", "Describe shape properties", "Uses sides, curves, vertices and parallel relationships to describe and distinguish shapes.", ["AC9M2SP01"], "shape-and-object-reasoning", ["space-l2-regular-irregular-shapes"]), [["Boundary Lab", "Identify straight and curved boundaries and vertices."], ["Parallel Trackers", "Recognise parallel sides in different orientations."], ["Property Riddles", "Identify a shape from a set of property clues."]], ["boundary-highlighter", "parallel-detector", "property-riddle"], ["boundary", "vertex", "straight", "curved", "parallel"], ["Parallel lines must be vertical.", "Curved boundaries count as straight sides."], "Precise shape properties and spatial terms."),
      W("Classification Rules", "Build and test multi-feature classification rules.", ["AC9M2SP01"], skill("space-l2-multi-feature-classification", "Classify with several clues", "Classifies shapes and objects using more than one property and tests borderline examples.", ["AC9M2SP01"], "shape-and-object-reasoning", ["space-l2-shape-properties"]), [["Two-Clue Sort", "Classify using two stated properties."], ["Sorting Machine", "Create a decision rule for a mixed set."], ["Challenge the Rule", "Test exceptions and refine a classification."]], ["multi-rule-sort", "decision-machine", "counterexample-tester"], ["property", "rule", "belongs", "exception", "classify"], ["One matching feature is always enough.", "A counterexample proves all classification is impossible."], "Multi-property classification and counterexamples."),
      W("Map Representations", "Connect familiar spaces with two-dimensional representations.", ["AC9M2SP02"], skill("space-l2-map-representations", "Read a simple map", "Connects features and relative positions in a familiar space with a two-dimensional representation.", ["AC9M2SP02"], "spatial-representation", ["space-l1-objects-and-views"]), [["Space to Map", "Match a familiar scene to a top-view representation."], ["Map Symbols", "Interpret symbols for key features and landmarks."], ["Which Map Works?", "Select and explain an accurate representation."]], ["scene-map-match", "symbol-key-match", "representation-compare"], ["map", "symbol", "key", "feature", "top view"], ["A map must be a realistic picture.", "Symbols must have the same size as features."], "Two-dimensional representation, symbols and relative position."),
      W("Locate the Feature", "Use relative positions to locate map features.", ["AC9M2SP02"], skill("space-l2-relative-map-position", "Locate features on a map", "Identifies map features using relative position and landmark language.", ["AC9M2SP02"], "position-and-navigation", ["space-l2-map-representations"]), [["Landmark Language", "Describe features relative to a shared landmark."], ["Place the Features", "Position symbols from relational clues."], ["Mystery Location", "Combine several clues to identify one location."]], ["landmark-match", "map-symbol-placement", "location-deduction"], ["landmark", "relative", "between", "opposite", "next to"], ["One clue always identifies a unique location.", "Relative position does not depend on a reference."], "Landmarks, relative position and location deduction."),
      W("Pathways on Maps", "Follow and compare pathways on two-dimensional maps.", ["AC9M2SP02"], skill("space-l2-map-pathways", "Navigate a map pathway", "Follows, records and compares pathways on a simple two-dimensional representation.", ["AC9M2SP02"], "position-and-navigation", ["space-l2-relative-map-position"]), [["Trace the Path", "Follow a route using map directions."], ["Choose a Pathway", "Compare valid pathways around obstacles."], ["Write the Route", "Record and check directions for a map pathway."]], ["map-route-runner", "path-compare", "map-direction-builder"], ["pathway", "route", "landmark", "direction", "obstacle"], ["A visually direct path can cross obstacles.", "A route needs no ordered directions."], "Map navigation, pathway comparison and communication."),
      W("Create and Compare Routes", "Create, test and compare pathways on two-dimensional representations.", ["AC9M2SP02"], skill("space-l2-route-reasoning", "Compare map routes", "Creates and checks pathways, comparing routes against stated location and movement constraints.", ["AC9M2SP02"], "position-and-navigation", ["space-l2-map-pathways"]), [["Create the Path", "Build an ordered pathway between two map positions."], ["Test the Directions", "Follow another route and identify ambiguous or missing steps."], ["Compare Two Routes", "Choose and justify a route for a stated constraint."]], ["map-route-builder", "direction-debugger", "route-constraint-compare"], ["pathway", "direction", "position", "constraint", "compare"], ["A route is clear without a start position.", "The shortest route is always the most suitable."], "Creating, testing and comparing map pathways."),
      W("Shape and Map Mission", "Apply shape classification, map location and pathway reasoning together.", ["AC9M2SP01", "AC9M2SP02"], skill("space-l2-spatial-systems", "Solve a spatial systems mission", "Integrates shape properties, map locations and pathways to solve and explain spatial problems.", ["AC9M2SP01", "AC9M2SP02"], "spatial-representation", ["space-l2-multi-feature-classification", "space-l2-route-reasoning"]), [["Decode the Map", "Use property clues to locate shape landmarks."], ["Plan the Cargo Route", "Build a pathway that satisfies map constraints."], ["Justify the Solution", "Compare solutions and explain spatial decisions."]], ["map-code-decoder", "constraint-route-planner", "spatial-solution-compare"], ["property", "representation", "pathway", "location", "justify"], ["Shape clues and map clues are unrelated.", "Only one pathway can solve a spatial task."], "Cumulative classification, maps, locations and pathway reasoning."),
    ],
  },
  {
    level: "level-3", yearLabel: "Year 3", prefix: "y3", title: "Starpath Level 3: Object Design and Mapmaking",
    summary: "Students compare and classify objects for purpose and interpret and create two-dimensional representations of familiar environments.",
    descriptors: [descriptor("AC9M3SP01", "Make, compare and classify objects, identifying key features and explaining why those features make them suited to their uses."), descriptor("AC9M3SP02", "Interpret and create two-dimensional representations of familiar environments, locating key landmarks and objects relative to each other.")],
    achievementStandardConnection: "Students make and compare objects using key features and interpret and create two-dimensional representations of familiar environments.",
    prerequisites: ["Classify shapes and objects using several properties.", "Read simple maps and follow pathways."],
    likelyMisconceptions: ["Objects with the same use must have the same form.", "A map has one correct scale or orientation.", "A useful view must show every feature."],
    progressionRationale: "Students move from describing features to reasoning about function, then from reading simple maps to selecting, creating and evaluating representations.",
    weeks: [
      W("Object Features", "Identify and compare structural features of three-dimensional objects.", ["AC9M3SP01"], skill("space-l3-object-features", "Describe object features", "Identifies faces, edges, vertices and surfaces and uses them to compare objects.", ["AC9M3SP01"], "shape-and-object-reasoning", ["space-l2-shape-properties"]), [["Explore the Object", "Identify faces, edges, vertices and curved surfaces."], ["Compare Objects", "Compare shared and different structural features."], ["Object Riddles", "Identify and justify an object from feature clues."]], ["object-inspector", "object-compare", "feature-riddle"], ["face", "edge", "vertex", "surface", "object"], ["A face means only the front.", "Curved surfaces contain straight edges."], "Three-dimensional object features and comparison."),
      W("Classify for Purpose", "Connect object features to uses and constraints.", ["AC9M3SP01"], skill("space-l3-object-purpose", "Match objects to their purpose", "Explains why structural features make an object suited or unsuited to a purpose.", ["AC9M3SP01"], "shape-and-object-reasoning", ["space-l3-object-features"]), [["Feature and Function", "Match structural features with practical effects."], ["Best Object for the Job", "Choose an object for a stated use."], ["Defend the Design", "Justify a choice and reject a less suitable alternative."]], ["feature-function-match", "design-choice", "design-argument"], ["purpose", "suitable", "stable", "roll", "stack"], ["Appearance alone determines suitability.", "There is always one universally best object."], "Feature-function relationships and design reasoning."),
      W("Build and Improve", "Construct objects and refine designs against spatial criteria.", ["AC9M3SP01"], skill("space-l3-spatial-construction", "Build and improve an object", "Constructs and revises objects to satisfy stated spatial and functional criteria.", ["AC9M3SP01"], "construction-and-visualisation", ["space-l3-object-purpose"]), [["Build from Solids", "Combine objects to meet one design criterion."], ["Test the Structure", "Evaluate stability, rolling or stacking behaviour."], ["Improve the Design", "Revise and explain a construction against criteria."]], ["solid-object-builder", "virtual-design-test", "constraint-redesign"], ["construct", "combine", "criterion", "test", "revise"], ["A first design cannot be changed.", "Adding more pieces always improves a structure."], "Spatial construction, testing and iterative design."),
      W("Views of Objects", "Represent three-dimensional objects in useful two-dimensional views.", ["AC9M3SP01", "AC9M3SP02"], skill("space-l3-object-views", "Connect objects and views", "Interprets and selects front, side and top views that communicate object features.", ["AC9M3SP01", "AC9M3SP02"], "spatial-representation", ["space-l3-object-features"]), [["Front, Side, Top", "Match an object to views from stated viewpoints."], ["Hidden Features", "Reason about features visible or hidden in a view."], ["Choose a Useful View", "Select and justify a representation for a purpose."]], ["view-matcher", "hidden-feature-reasoning", "view-selection"], ["front view", "side view", "top view", "visible", "hidden"], ["Every view shows all features.", "Rotating an object changes its structure."], "Object views, visibility and representational purpose."),
      W("Read Familiar Maps", "Interpret symbols, landmarks and relative locations in maps.", ["AC9M3SP02"], skill("space-l3-map-interpretation", "Interpret a familiar map", "Interprets a two-dimensional representation using its key, orientation and relative landmark positions.", ["AC9M3SP02"], "spatial-representation", ["space-l2-map-representations"]), [["Read the Key", "Interpret symbols and map conventions."], ["Landmarks in Relation", "Describe locations relative to multiple landmarks."], ["Map Evidence", "Use map evidence to evaluate location claims."]], ["map-key-decoder", "relative-location-builder", "map-claim-checker"], ["key", "symbol", "landmark", "relative", "orientation"], ["A map symbol has a fixed universal meaning.", "Map orientation never changes."], "Map conventions, relative location and evidence."),
      W("Create a Map", "Create a coherent two-dimensional representation of a familiar environment.", ["AC9M3SP02"], skill("space-l3-map-creation", "Create a useful map", "Creates a two-dimensional representation with selected features, landmarks, relative positions and a key.", ["AC9M3SP02"], "spatial-representation", ["space-l3-map-interpretation"]), [["Select the Features", "Choose important features for a map purpose."], ["Place and Symbolise", "Position landmarks and create a consistent key."], ["Check the Map", "Test whether another user can interpret the representation."]], ["feature-selector", "map-maker", "map-usability-test"], ["represent", "feature", "landmark", "key", "accurate"], ["A useful map includes every real detail.", "Decorative accuracy matters more than relative position."], "Purposeful map creation and usability."),
      W("Routes and Landmarks", "Use created maps to communicate and compare routes.", ["AC9M3SP02"], skill("space-l3-landmark-navigation", "Navigate with landmarks", "Uses relative landmark positions to create, follow and compare routes on a map.", ["AC9M3SP02"], "position-and-navigation", ["space-l3-map-creation"]), [["Route from Landmarks", "Follow directions anchored to map features."], ["Create Two Routes", "Plan alternative pathways between locations."], ["Which Route Fits?", "Choose and justify a route for stated constraints."]], ["landmark-route-runner", "multi-route-builder", "route-constraint-choice"], ["route", "landmark", "relative", "direct", "constraint"], ["Shortest distance is always the best route.", "Landmark directions need no sequence."], "Landmark navigation and route comparison."),
      W("Design a Star Base", "Integrate object design, views and mapmaking.", ["AC9M3SP01", "AC9M3SP02"], skill("space-l3-spatial-design", "Design and represent a space", "Integrates suitable object features and a coherent two-dimensional representation to communicate a spatial design.", ["AC9M3SP01", "AC9M3SP02"], "construction-and-visualisation", ["space-l3-spatial-construction", "space-l3-object-views", "space-l3-landmark-navigation"]), [["Choose the Structures", "Select objects whose features suit base functions."], ["Map the Base", "Create a representation with landmarks and routes."], ["Present the Design", "Use views and map evidence to justify decisions."]], ["constraint-object-selector", "environment-map-builder", "design-presentation"], ["design", "structure", "representation", "route", "justify"], ["Object design and map design can be considered separately.", "One representation communicates every purpose equally well."], "Cumulative object, view, map and design reasoning."),
    ],
  },
  {
    level: "level-4", yearLabel: "Year 4", prefix: "y4", title: "Starpath Level 4: Composite Worlds and Symmetry Systems",
    summary: "Students represent composite shapes and objects, create and interpret grid references, and reason about line and rotational symmetry.",
    descriptors: [descriptor("AC9M4SP01", "Represent and approximate composite shapes and objects using combinations of familiar shapes and objects."), descriptor("AC9M4SP02", "Create and interpret grid reference systems, using grid references and directions to locate and describe positions and pathways."), descriptor("AC9M4SP03", "Recognise line and rotational symmetry in shapes and create symmetrical patterns and pictures.")],
    achievementStandardConnection: "Students create and interpret grid references and identify line and rotational symmetry while representing composite shapes and objects.",
    prerequisites: ["Construct and compare three-dimensional objects.", "Interpret and create familiar maps."],
    likelyMisconceptions: ["Composite figures have one decomposition.", "Grid references identify lines rather than cells.", "Rotational symmetry means any rotation."],
    progressionRationale: "Construction becomes representational and approximate, maps become indexed grid systems, and visual invariance is formalised through two forms of symmetry.",
    weeks: [
      W("Composite Shapes", "Compose, decompose and represent complex two-dimensional shapes.", ["AC9M4SP01"], skill("space-l4-composite-shapes", "Build composite shapes", "Represents composite shapes using combinations of familiar shapes and compares decompositions.", ["AC9M4SP01"], "construction-and-visualisation", ["space-l2-multi-feature-classification"]), [["Shapes Within Shapes", "Identify familiar components in a composite."], ["Build the Outline", "Compose a target using selected shapes."], ["Compare Decompositions", "Explain two representations of the same composite."]], ["composite-highlighter", "shape-composer", "decomposition-compare"], ["composite", "component", "outline", "overlap", "represent"], ["Components cannot overlap.", "A composite has one exact decomposition."], "Composite construction and equivalent representations."),
      W("Composite Objects", "Represent three-dimensional objects with combinations and simple views.", ["AC9M4SP01"], skill("space-l4-composite-objects", "Represent composite objects", "Builds and represents composite objects from familiar solids, including partially hidden components.", ["AC9M4SP01"], "construction-and-visualisation", ["space-l3-spatial-construction", "space-l3-object-views"]), [["Combine the Solids", "Construct an object from specified components."], ["Match Build and View", "Connect a composite object with a two-dimensional view."], ["Hidden Block Reasoning", "Infer components needed to support a visible structure."]], ["solid-composer", "build-view-match", "hidden-block-inference"], ["solid", "layer", "view", "hidden", "support"], ["Only visible components exist.", "A single view uniquely determines every object."], "Composite objects, views and hidden structure."),
      W("Approximate and Represent", "Choose familiar components to approximate real forms.", ["AC9M4SP01"], skill("space-l4-spatial-approximation", "Approximate a complex form", "Selects and combines familiar shapes or objects to make a useful approximation and explains limitations.", ["AC9M4SP01"], "spatial-representation", ["space-l4-composite-shapes", "space-l4-composite-objects"]), [["Simplify the Form", "Identify useful familiar components in a complex object."], ["Create an Approximation", "Build a representation that preserves key spatial features."], ["Evaluate the Model", "Explain what the approximation captures and omits."]], ["form-simplifier", "approximation-builder", "model-evaluator"], ["approximate", "model", "feature", "accurate", "limitation"], ["Approximate means careless or incorrect.", "A more detailed model is always more useful."], "Purposeful approximation and model evaluation."),
      W("Grid Reference Systems", "Understand and create labelled grid reference systems.", ["AC9M4SP02"], skill("space-l4-grid-references", "Use grid references", "Creates and interprets a consistent labelled grid system to identify cells and features.", ["AC9M4SP02"], "position-and-navigation", ["space-l3-map-interpretation"]), [["Read the Grid", "Use row and column labels in the agreed order."], ["Locate the Feature", "Assign and interpret grid references."], ["Build a Grid Key", "Create a consistent reference system for a map."]], ["grid-reference-reader", "grid-locator", "grid-system-builder"], ["grid", "row", "column", "reference", "cell"], ["Row and column order can change mid-map.", "A reference names a grid line rather than a cell."], "Grid conventions and precise location."),
      W("Pathways on Grids", "Describe and compare routes using grids, references and directions.", ["AC9M4SP02"], skill("space-l4-grid-navigation", "Navigate a grid", "Uses references and directional sequences to locate, trace and compare pathways on a grid.", ["AC9M4SP02"], "position-and-navigation", ["space-l4-grid-references"]), [["Reference to Reference", "Trace a route between labelled cells."], ["Write the Path", "Create directions using references and movement language."], ["Route Under Constraints", "Compare pathways that satisfy spatial constraints."]], ["grid-route-runner", "grid-direction-builder", "constrained-route-planner"], ["pathway", "reference", "direction", "route", "constraint"], ["A sequence of references automatically describes the moves between them.", "The fewest cells is always the best route."], "Grid pathways, directions and route constraints."),
      W("Line Symmetry", "Recognise and construct line-symmetric figures.", ["AC9M4SP03"], skill("space-l4-line-symmetry", "Find line symmetry", "Identifies lines of symmetry and completes figures by matching corresponding positions and features.", ["AC9M4SP03"], "symmetry-and-transformation", ["space-l2-one-step-transformations"]), [["Mirror Match", "Test whether two halves correspond across a line."], ["Complete the Reflection", "Construct the missing half on a grid."], ["How Many Lines?", "Compare possible symmetry lines and justify counts."]], ["symmetry-test", "mirror-grid-builder", "symmetry-line-counter"], ["symmetry", "line of symmetry", "mirror", "corresponding", "equal distance"], ["Any line through the centre is a symmetry line.", "Matching colour alone proves symmetry."], "Line symmetry, corresponding points and construction."),
      W("Rotational Symmetry", "Recognise and create figures that match after rotation.", ["AC9M4SP03"], skill("space-l4-rotational-symmetry", "Find rotational symmetry", "Recognises rotational symmetry and describes matching positions within one full turn.", ["AC9M4SP03"], "symmetry-and-transformation", ["space-l4-line-symmetry"]), [["Turn and Match", "Test a figure at marked rotations."], ["Count the Matches", "Determine the number of matching positions in a full turn."], ["Create a Turning Pattern", "Construct and justify a rotationally symmetric design."]], ["rotation-tester", "rotational-order-counter", "radial-pattern-builder"], ["rotational symmetry", "centre", "full turn", "match", "order"], ["A full turn is the only matching turn.", "Line symmetry guarantees rotational symmetry."], "Rotational invariance and pattern construction."),
      W("Symmetric Grid World", "Integrate composite representation, grids and symmetry.", ["AC9M4SP01", "AC9M4SP02", "AC9M4SP03"], skill("space-l4-symmetric-grid-design", "Design a symmetric grid world", "Uses composite forms, grid references and symmetry constraints to create and explain a spatial design.", ["AC9M4SP01", "AC9M4SP02", "AC9M4SP03"], "construction-and-visualisation", ["space-l4-spatial-approximation", "space-l4-grid-navigation", "space-l4-rotational-symmetry"]), [["Decode the Design Brief", "Identify composite, grid and symmetry constraints."], ["Build the World", "Construct a referenced symmetrical grid design."], ["Audit and Explain", "Check constraints and justify representational choices."]], ["constraint-decoder", "symmetric-map-builder", "design-auditor"], ["composite", "grid reference", "symmetry", "constraint", "justify"], ["Meeting one constraint compensates for missing another.", "Visual balance always proves mathematical symmetry."], "Cumulative composite, grid and symmetry reasoning."),
    ],
  },
  {
    level: "level-5", yearLabel: "Year 5", prefix: "y5", title: "Starpath Level 5: Nets, Coordinates and Transformations",
    summary: "Students connect objects and nets, use grid coordinates, perform transformations and develop shape-classification algorithms.",
    descriptors: [descriptor("AC9M5SP01", "Connect objects to their nets and build objects from their nets using spatial and geometric reasoning."), descriptor("AC9M5SP02", "Construct a grid coordinate system that uses coordinates to locate positions within a space; use coordinates and directional language to describe position and movement."), descriptor("AC9M5SP03", "Describe and perform translations, reflections and rotations of shapes, using dynamic geometric software where appropriate; recognise what changes and what remains the same, and identify any symmetries.")],
    achievementStandardConnection: "Students connect objects with nets, use coordinates to locate and move, perform transformations and apply algorithms to classify shapes and objects.",
    prerequisites: ["Represent composite objects and views.", "Use labelled grids.", "Recognise line and rotational symmetry."],
    likelyMisconceptions: ["Any arrangement of faces forms a valid net.", "Coordinates can be read in either order.", "Transformations change side lengths or angles."],
    progressionRationale: "Students coordinate multiple representations of objects, formalise location with ordered coordinates, analyse transformations through invariants, and express classification reasoning algorithmically.",
    weeks: [
      W("Objects and Nets", "Connect faces of objects with two-dimensional net layouts.", ["AC9M5SP01"], skill("space-l5-object-net-connections", "Connect objects and nets", "Matches objects to possible nets by tracking faces, adjacency and folding relationships.", ["AC9M5SP01"], "construction-and-visualisation", ["space-l4-composite-objects"]), [["Unfold the Object", "Relate object faces to a flattened arrangement."], ["Which Net Folds?", "Predict whether a candidate net forms the target object."], ["Explain the Match", "Use face and adjacency evidence to justify a net."]], ["virtual-unfolder", "net-validity-predictor", "net-evidence-reasoning"], ["net", "face", "fold", "edge", "adjacent"], ["The same number of faces guarantees a valid net.", "Faces that touch in a net always touch after folding."], "Object-net correspondence and folding prediction."),
      W("Construct from Nets", "Mentally and virtually fold nets to construct objects.", ["AC9M5SP01"], skill("space-l5-net-construction", "Fold nets into objects", "Uses spatial visualisation to construct objects from nets and identify face relationships.", ["AC9M5SP01"], "construction-and-visualisation", ["space-l5-object-net-connections"]), [["Track a Face", "Follow one labelled face through a virtual fold."], ["Fold the Net", "Sequence folds to form an object."], ["Opposite and Adjacent", "Determine face relationships after construction."]], ["face-tracker", "net-fold-simulator", "folded-relation-challenge"], ["fold", "adjacent", "opposite", "orientation", "construct"], ["A face keeps the same screen orientation after folding.", "Opposite faces are opposite in the flat net."], "Mental folding and face relationships."),
      W("Create and Test Nets", "Design, test and refine nets for familiar objects.", ["AC9M5SP01"], skill("space-l5-net-design", "Design a valid net", "Creates and tests nets, revising layouts using overlap and adjacency evidence.", ["AC9M5SP01"], "construction-and-visualisation", ["space-l5-net-construction"]), [["Arrange the Faces", "Build a candidate net from required faces."], ["Test the Fold", "Identify overlap, gaps or incorrect adjacency."], ["Compare Valid Nets", "Explain how different nets can form the same object."]], ["net-builder", "fold-test-lab", "net-compare"], ["layout", "overlap", "gap", "valid", "revise"], ["Each object has one net.", "A connected arrangement always folds without overlap."], "Net creation, validation and multiple solutions."),
      W("Coordinate Systems", "Construct and interpret ordered grid coordinate systems.", ["AC9M5SP02"], skill("space-l5-grid-coordinates", "Use grid coordinates", "Constructs axes and locates positions using consistently ordered coordinate pairs.", ["AC9M5SP02"], "position-and-navigation", ["space-l4-grid-references"]), [["Build the Axes", "Establish origin, axes, scale and coordinate order."], ["Plot and Read", "Locate and identify positions from ordered pairs."], ["Find the Coordinate Error", "Diagnose swapped or mis-scaled coordinates."]], ["coordinate-system-builder", "coordinate-plotter", "coordinate-debugger"], ["coordinate", "ordered pair", "origin", "axis", "scale"], ["Coordinate order is interchangeable.", "Axes can use inconsistent intervals."], "Coordinate conventions, plotting and error analysis."),
      W("Coordinate Movement", "Describe and calculate movement between coordinate positions.", ["AC9M5SP02"], skill("space-l5-coordinate-navigation", "Navigate with coordinates", "Uses coordinate changes and directional language to describe and plan movement on a grid.", ["AC9M5SP02"], "position-and-navigation", ["space-l5-grid-coordinates"]), [["Move Along an Axis", "Relate horizontal and vertical moves to coordinate changes."], ["Follow Coordinate Commands", "Apply an ordered sequence of position changes."], ["Plan an Efficient Route", "Compare coordinate pathways under constraints."]], ["coordinate-mover", "coordinate-command-runner", "coordinate-route-planner"], ["horizontal", "vertical", "increase", "decrease", "movement"], ["Both coordinates change for every move.", "Direction words can replace coordinate amounts."], "Coordinate changes, movement sequences and route planning."),
      W("Translations", "Describe and perform translations with invariant features.", ["AC9M5SP03"], skill("space-l5-translations", "Translate a shape", "Performs translations and describes movement while recognising invariant lengths, angles and orientation.", ["AC9M5SP03"], "symmetry-and-transformation", ["space-l5-coordinate-navigation"]), [["Slide Every Point", "Apply a common horizontal and vertical movement."], ["Describe the Translation", "Express movement using directional or coordinate language."], ["Check the Image", "Use invariants to evaluate a claimed translation."]], ["point-translation-simulator", "translation-describer", "transform-validator"], ["translation", "image", "horizontal", "vertical", "invariant"], ["Different points can move different amounts.", "Translation changes orientation."], "Translations, movement vectors and invariants."),
      W("Reflections and Rotations", "Perform and compare reflections and rotations.", ["AC9M5SP03"], skill("space-l5-reflections-rotations", "Reflect and rotate shapes", "Performs reflections and rotations and explains invariant size, shape and corresponding distances.", ["AC9M5SP03"], "symmetry-and-transformation", ["space-l4-line-symmetry", "space-l4-rotational-symmetry"]), [["Reflect Across a Line", "Place corresponding points at equal perpendicular distances."], ["Rotate About a Point", "Turn a figure around a stated centre and amount."], ["Compare the Transformations", "Identify action, changes and invariants from image pairs."]], ["reflection-builder", "rotation-simulator", "transformation-classifier"], ["reflection", "rotation", "line", "centre", "corresponding"], ["Reflection is a horizontal slide.", "Rotation can use any centre without changing the image position."], "Reflections, rotations and transformation comparison."),
      W("Spatial Design Challenge", "Integrate nets, coordinates and transformations in a reasoned design.", ["AC9M5SP01", "AC9M5SP02", "AC9M5SP03"], skill("space-l5-spatial-design", "Complete a spatial design", "Integrates net visualisation, coordinate movement and transformations to create and justify a spatial design.", ["AC9M5SP01", "AC9M5SP02", "AC9M5SP03"], "construction-and-visualisation", ["space-l5-net-design", "space-l5-coordinate-navigation", "space-l5-reflections-rotations"]), [["Interpret the Brief", "Connect net, coordinate and transformation constraints."], ["Build and Transform", "Create a valid object representation and position its transformed images."], ["Test and Defend", "Check invariants and justify each spatial decision."]], ["design-constraint-decoder", "coordinate-transform-builder", "spatial-design-auditor"], ["net", "coordinate", "transformation", "invariant", "justify"], ["Each representation can be solved independently.", "A visually plausible design needs no spatial evidence."], "Cumulative nets, coordinates, transformations and reasoning."),
    ],
  },
  {
    level: "level-6", yearLabel: "Year 6", prefix: "y6", title: "Starpath Level 6: Cross-sections, Cartesian Space and Tessellations",
    summary: "Students reason about parallel cross-sections, four-quadrant coordinates and combined transformations used in tessellations and geometric investigations.",
    descriptors: [descriptor("AC9M6SP01", "Compare the parallel cross-sections of objects and recognise their relationships to right prisms."), descriptor("AC9M6SP02", "Locate points in the four quadrants of a Cartesian plane; describe changes to the coordinates when a point is moved to a different position in the plane."), descriptor("AC9M6SP03", "Recognise and use combinations of transformations to create tessellations and other geometric patterns, using dynamic geometric software where appropriate.")],
    achievementStandardConnection: "Students compare cross-sections of objects, use four-quadrant Cartesian coordinates and apply combinations of transformations to create and analyse geometric patterns.",
    prerequisites: ["Connect and construct objects from nets.", "Use ordered grid coordinates.", "Perform translations, reflections and rotations."],
    likelyMisconceptions: ["All parallel cross-sections are congruent.", "Negative coordinates mean negative distance.", "Any repeated shape tessellates without gaps."],
    progressionRationale: "Spatial visualisation moves inside objects through cross-sections, coordinate reasoning expands to four quadrants, and transformations combine into generative patterns and tested conjectures.",
    weeks: [
      W("Cross-section Foundations", "Visualise and compare cross-sections made by parallel cuts.", ["AC9M6SP01"], skill("space-l6-parallel-cross-sections", "Visualise cross-sections", "Predicts and compares two-dimensional cross-sections formed by parallel planes through objects.", ["AC9M6SP01"], "construction-and-visualisation", ["space-l5-net-construction"]), [["Slice and See", "Connect a cut direction and position with a cross-section."], ["Parallel Slice Sequence", "Compare sections from several parallel cuts."], ["Predict Before Cutting", "Use object structure to justify a predicted section."]], ["cross-section-slicer", "slice-sequence-viewer", "cross-section-predictor"], ["cross-section", "plane", "parallel", "slice", "predict"], ["A cross-section is always the same shape as a face.", "Parallel cuts always produce congruent sections."], "Cross-section visualisation and parallel-cut comparison."),
      W("Prisms and Changing Sections", "Relate constant and changing parallel cross-sections to object structure.", ["AC9M6SP01"], skill("space-l6-prism-cross-sections", "Connect prisms and cross-sections", "Uses parallel cross-sections to identify prism relationships and explain when section size or shape changes.", ["AC9M6SP01"], "shape-and-object-reasoning", ["space-l6-parallel-cross-sections"]), [["Prism or Not?", "Compare parallel sections to identify right-prism behaviour."], ["Constant or Changing", "Track how sections vary through different objects."], ["Explain the Structure", "Infer object properties from a section sequence."]], ["section-prism-classifier", "section-change-grapher", "object-inference"], ["prism", "congruent", "constant", "vary", "structure"], ["Every object with one polygonal section is a prism.", "All non-prism sections change in the same way."], "Prism relationships and structural inference."),
      W("Four-Quadrant Coordinates", "Locate and interpret ordered pairs across four quadrants.", ["AC9M6SP02"], skill("space-l6-four-quadrant-coordinates", "Plot in four quadrants", "Locates and interprets points with positive, negative and zero coordinates on a Cartesian plane.", ["AC9M6SP02"], "position-and-navigation", ["space-l5-grid-coordinates"]), [["Extend the Axes", "Connect signed values with direction from the origin."], ["Plot Every Quadrant", "Locate ordered pairs across four quadrants and axes."], ["Coordinate Reasoning", "Infer signs and positions without plotting every point."]], ["four-quadrant-builder", "cartesian-plotter", "coordinate-deduction"], ["Cartesian plane", "quadrant", "positive", "negative", "origin"], ["A negative coordinate is an impossible distance.", "Points on axes belong to a quadrant."], "Four-quadrant conventions, signs and plotting."),
      W("Coordinate Change", "Describe movement and transformation through coordinate change.", ["AC9M6SP02"], skill("space-l6-coordinate-change", "Reason about coordinate change", "Predicts and explains how ordered pairs change under horizontal, vertical and combined movement.", ["AC9M6SP02"], "position-and-navigation", ["space-l6-four-quadrant-coordinates", "space-l5-coordinate-navigation"]), [["Change One Coordinate", "Relate axis-aligned movement to one changing value."], ["Cross the Axes", "Track signs and values through multi-quadrant movement."], ["Reverse the Movement", "Infer a movement rule from original and image points."]], ["coordinate-change-simulator", "axis-crossing-runner", "movement-rule-inference"], ["change", "difference", "direction", "sign", "rule"], ["Crossing an axis swaps coordinate order.", "A negative change always ends at a negative coordinate."], "Coordinate differences, axis crossing and inverse reasoning."),
      W("Combined Transformations", "Compose transformations and track cumulative effects.", ["AC9M6SP03"], skill("space-l6-combined-transformations", "Combine transformations", "Performs and describes ordered combinations of translations, reflections and rotations.", ["AC9M6SP03"], "symmetry-and-transformation", ["space-l5-translations", "space-l5-reflections-rotations"]), [["Transform in Order", "Apply two transformations in a stated sequence."], ["Does Order Matter?", "Compare reversed transformation sequences."], ["Find the Transformation Chain", "Infer a sequence from original and final figures."]], ["transform-chain-runner", "order-comparison-lab", "transform-sequence-inference"], ["composition", "sequence", "original", "image", "equivalent"], ["Transformation order never matters.", "Only the final position identifies the full sequence."], "Transformation composition, order and inverse inference."),
      W("Tessellation Design", "Create and analyse patterns with no gaps or overlaps.", ["AC9M6SP03"], skill("space-l6-tessellations", "Create a tessellation", "Uses repeated transformations to create and justify tessellations without gaps or overlaps.", ["AC9M6SP03"], "symmetry-and-transformation", ["space-l6-combined-transformations"]), [["Will It Tessellate?", "Test repeated shapes for gaps and overlaps."], ["Transformation Pattern", "Generate a tessellation using an explicit transformation rule."], ["Explain the Fit", "Use spatial relationships to justify a design."]], ["tessellation-tester", "pattern-transform-builder", "tessellation-reasoning"], ["tessellation", "repeat", "gap", "overlap", "pattern"], ["Any repeated shape tessellates.", "Decorative patterns are automatically tessellations."], "Tessellation conditions and transformation-generated patterns."),
      W("Transformation Investigations", "Investigate how transformation combinations generate and alter geometric patterns.", ["AC9M6SP03"], skill("space-l6-transformation-reasoning", "Investigate transformation patterns", "Systematically varies transformation combinations and uses evidence to explain resulting geometric patterns.", ["AC9M6SP03"], "symmetry-and-transformation", ["space-l5-spatial-design", "space-l6-combined-transformations"]), [["Notice the Pattern Rule", "Connect repeated images with a transformation sequence."], ["Vary One Transformation", "Compare patterns after changing one part of the sequence."], ["Explain with Evidence", "Use original and image relationships to justify a pattern rule."]], ["pattern-rule-detector", "transform-experiment-lab", "pattern-evidence-reasoning"], ["sequence", "combination", "pattern", "evidence", "result"], ["The same transformations always produce the same result in any order.", "A visual pattern needs no stated transformation rule."], "Transformation combinations, geometric patterns and evidence."),
      W("Orbital Design Investigation", "Integrate cross-sections, coordinates and transformations in a spatial investigation.", ["AC9M6SP01", "AC9M6SP02", "AC9M6SP03"], skill("space-l6-spatial-investigation", "Complete a spatial investigation", "Integrates object visualisation, Cartesian reasoning and transformation evidence to solve and communicate a complex spatial problem.", ["AC9M6SP01", "AC9M6SP02", "AC9M6SP03"], "spatial-representation", ["space-l6-prism-cross-sections", "space-l6-coordinate-change", "space-l6-tessellations", "space-l6-transformation-reasoning"]), [["Analyse the System", "Interpret sections, coordinates and pattern constraints."], ["Build and Test", "Create a solution and test its transformation rules."], ["Defend the Model", "Use multiple representations and evidence to justify conclusions."]], ["multi-representation-analyser", "spatial-model-lab", "evidence-presentation"], ["model", "constraint", "coordinate", "cross-section", "evidence"], ["Each representation can be interpreted independently.", "A visually plausible solution needs no mathematical evidence."], "Cumulative spatial visualisation, coordinate and transformation reasoning."),
    ],
  },
];

const ROLES: readonly StarpathSequenceRole[] = ["build", "develop", "apply"];
const MEET_THE_SHAPES_MECHANICS = [
  "cosmic-shape-match",
  "shape-sorter",
  "starpath-environment-shape-find",
] as const;
const SHAPE_DETECTIVES_MECHANICS = [
  "space-object-match",
  "shape-explorer",
  "shape-detective-hunt",
] as const;

// Ground Level lessons with real, playable content (keyed by registry id).
const IMPLEMENTED_GROUND_LESSONS: Record<
  string,
  { learningIntention: string; mechanics: readonly [string, string, string] }
> = {
  "ground-space-w1-l1": { learningIntention: "I can recognise and name familiar shapes.", mechanics: MEET_THE_SHAPES_MECHANICS },
  "ground-space-w1-l2": { learningIntention: "I can find familiar shapes in the world around me.", mechanics: SHAPE_DETECTIVES_MECHANICS },
};

function buildLevel(definition: LevelDefinition): StarpathLevelProgram {
  const weeks = definition.weeks.map((week, index): StarpathWeekPlan => {
    const weekNumber = index + 1;
    const lessons = week.lessons.map(([title, focus], lessonIndex): StarpathLessonPlan => {
      const lessonId = `${definition.prefix}-space-w${weekNumber}-l${lessonIndex + 1}`;
      const implemented = IMPLEMENTED_GROUND_LESSONS[lessonId];
      return {
        id: lessonId,
        title,
        sequenceRole: ROLES[lessonIndex],
        focus,
        learningIntention: implemented
          ? implemented.learningIntention
          : `We are learning to ${focus.charAt(0).toLowerCase()}${focus.slice(1)}`,
        skillIds: [week.skill.id],
        activityMechanics: implemented ? implemented.mechanics : week.mechanics,
        status: implemented ? "implemented" : STARPATH_PROGRAM_STATUS,
      };
    }) as unknown as StarpathWeekPlan["lessons"];
    return {
      week: weekNumber,
      title: week.title,
      centralConcept: week.concept,
      descriptorCodes: week.descriptors,
      lessons,
      vocabulary: week.vocabulary,
      skillIds: [week.skill.id],
      misconceptions: week.misconceptions,
      quiz: {
        id: `${definition.prefix}-space-w${weekNumber}-quiz`,
        coverage: week.quiz,
        questionCount: STARPATH_QUIZ_QUESTIONS_PER_LESSON * STARPATH_LESSONS_PER_WEEK as 15,
        status: STARPATH_PROGRAM_STATUS,
      },
      status: STARPATH_PROGRAM_STATUS,
    };
  });

  return {
    realmId: "space",
    level: definition.level,
    yearLabel: definition.yearLabel,
    programId: `${definition.prefix}-space`,
    title: definition.title,
    summary: definition.summary,
    descriptors: definition.descriptors,
    achievementStandardConnection: definition.achievementStandardConnection,
    prerequisites: definition.prerequisites,
    likelyMisconceptions: definition.likelyMisconceptions,
    progressionRationale: definition.progressionRationale,
    skills: definition.weeks.map((week, index) => ({ ...week.skill, level: definition.level, weeks: [index + 1], status: STARPATH_PROGRAM_STATUS })),
    weeks,
    assessments: {
      preTest: definition.level === "ground" ? null : { id: `${definition.prefix}-space-pre-01`, questionCount: STARPATH_ASSESSMENT_QUESTION_COUNT, status: STARPATH_PROGRAM_STATUS },
      postTest: { id: `${definition.prefix}-space-post-01`, questionCount: STARPATH_ASSESSMENT_QUESTION_COUNT, unlockAfterLessonId: `${definition.prefix}-space-w8-l3`, status: STARPATH_PROGRAM_STATUS },
    },
    status: STARPATH_PROGRAM_STATUS,
  };
}

export const STARPATH_PROGRAMS = LEVEL_DEFINITIONS.map(buildLevel);
export const STARPATH_PROGRAM_BY_LEVEL = Object.fromEntries(STARPATH_PROGRAMS.map((program) => [program.level, program])) as Record<StarpathLevelId, StarpathLevelProgram>;
export const STARPATH_SKILLS = STARPATH_PROGRAMS.flatMap((program) => program.skills);
export const STARPATH_CURRICULUM_SOURCES = [
  { label: "Australian Curriculum v9 Mathematics: Space strand", url: "https://v9.australiancurriculum.edu.au/curriculum-information/understand-this-learning-area/mathematics" },
  { label: "QCAA achievement standard and content description sequence", url: QCAA_SEQUENCE },
] as const;

export function getStarpathProgram(level: StarpathLevelId): StarpathLevelProgram {
  return STARPATH_PROGRAM_BY_LEVEL[level];
}
