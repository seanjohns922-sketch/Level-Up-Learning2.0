import type { StarpathLevelId } from "@/lib/starpath-levels";

export const STARPATH_PROGRAM_STATUS = "planned" as const;
export const STARPATH_WEEK_COUNT = 8 as const;
export const STARPATH_LESSONS_PER_WEEK = 3 as const;
export const STARPATH_QUIZ_WEEKS = [1, 2, 3, 4, 5, 6, 7] as const;
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
    summary: "Young Space Explorers recognise, create, sort and find familiar shapes, then describe people and objects relative to named references in a final Starpath adventure.",
    descriptors: [
      descriptor("AC9MFSP01", "sort, name and create familiar shapes; recognise and describe familiar shapes within objects in the environment, giving reasons"),
      descriptor("AC9MFSP02", "describe the position and location of themselves and objects in relation to other people and objects within a familiar space"),
    ],
    achievementStandardConnection: "Students describe familiar shapes and the position and location of themselves and objects relative to other objects and people in familiar spaces.",
    prerequisites: ["Everyday experience with familiar objects, people and simple location words."],
    likelyMisconceptions: ["A shape changes name when rotated.", "Size or colour determines a shape.", "Position words have a fixed viewpoint."],
    progressionRationale: "The sequence runs shapes first, then space. Weeks 1-3 recognise, create, sort and compare familiar shapes (AC9MFSP01). Weeks 4-6 describe the position and location of objects and people relative to named references in familiar spaces (AC9MFSP02). Weeks 7-8 combine both descriptors to build, locate and describe a space scene and complete a cumulative Space Graduation. Completion is planned to unlock the Ground Level Starpath Graduate title.",
    weeks: [
      W("Shape Spotters", "Recognise and name familiar two-dimensional shapes in varied Starpath scenes.", ["AC9MFSP01"], skill("space-ground-shape-recognition", "Spot familiar shapes", "Recognises and names circles, squares, triangles and rectangles despite changes in size, colour or orientation.", ["AC9MFSP01"], "shape-and-object-reasoning"), [["Meet the Shapes", "Recognise circles, squares, triangles and rectangles."], ["Shape Detectives", "Find familiar shapes hidden inside everyday objects."], ["Shape Masters", "Recognise and sort familiar shapes independently."]], ["shape-introduction", "scene-shape-hunt", "shape-match-sort"], ["circle", "square", "triangle", "rectangle", "shape"], ["A shape changes name when it is turned.", "The colour or size determines the shape."], "Recognition, naming, matching and simple sorting."),
      W("Shape Builders", "Use familiar shapes as building blocks to create pictures and explain the shapes within them.", ["AC9MFSP01"], skill("space-ground-shape-creation", "Build with shapes", "Creates familiar shape pictures, recognises the shapes within completed objects and explains simple visual reasoning.", ["AC9MFSP01"], "construction-and-visualisation", ["space-ground-shape-recognition"]), [["Build with Shapes", "Use familiar shapes to build simple pictures."], ["Shape Creators", "Combine familiar shapes to create new pictures."], ["Space Builders", "Build and explain shape creations using visual reasoning."]], ["finish-the-picture", "shape-builder", "shape-reasoning"], ["build", "shape", "combine", "picture", "explain"], ["A picture can contain only one shape.", "A creation must match one exact arrangement."], "Guided construction, creative composition and visual shape reasoning."),
      W("Shape Sorters", "Sort and compare familiar shapes by noticing simple visual similarities and differences.", ["AC9MFSP01"], skill("space-ground-shape-sorting", "Sort shapes with a reason", "Sorts and compares familiar shapes despite changes in colour and size, then gives a simple reason for a choice.", ["AC9MFSP01"], "shape-and-object-reasoning", ["space-ground-shape-recognition"]), [["Shape Families", "Sort familiar shapes into matching groups."], ["Same or Different?", "Compare familiar shapes despite changes in colour and size."], ["Shape Challenge", "Apply shape recognition, sorting and comparing together."]], ["shape-families", "same-or-different", "mixed-shape-challenge"], ["sort", "same", "different", "family", "belong"], ["Colour changes the name of a shape.", "Size changes the name of a shape."], "Shape-family sorting, visual comparison and simple explanations."),
      W("Space Positions", "Describe where objects are using simple positional language within a familiar space.", ["AC9MFSP02"], skill("space-ground-describe-position", "Say where things are", "Describes the position and location of objects in relation to other objects using above, below, beside, behind, in front and inside.", ["AC9MFSP02"], "position-and-navigation", ["space-ground-shape-recognition"]), [["Where Is It?", "Describe where objects are using above, below and beside."], ["Around Starpath", "Describe where objects are using behind, in front and inside."], ["Position Challenge", "Follow positional clues to complete a space mission."]], ["find-it", "place-it", "which-picture"], ["above", "below", "beside", "behind", "inside"], ["A position word describes an object without a reference object.", "Above and on always mean the same thing."], "Positional language: above, below, beside, behind, in front and inside."),
      W("People and Positions", "Describe where people and objects are relative to named references in familiar spaces.", ["AC9MFSP02"], skill("space-ground-follow-directions", "Compare people and positions", "Describes where they, other people and objects are relative to a named person or object.", ["AC9MFSP02"], "position-and-navigation", ["space-ground-describe-position"]), [["Where Am I?", "Describe where the explorer is relative to Geospin and familiar objects."], ["Where Are We?", "Compare where two people are relative to a shared reference."], ["Position Mission", "Place people and objects to match relative-position clues."]], ["describe-self", "compare-people", "build-position"], ["above", "below", "beside", "person", "reference"], ["A position word makes sense without naming a reference.", "People and objects cannot share the same position word."], "Describing people and objects relative to explicit references."),
      W("Location Clues", "Use relative-position clues to locate people and hidden objects in familiar spaces.", ["AC9MFSP02"], skill("space-ground-movement-pathways", "Use location clues", "Uses one or more relative-position clues to locate a person or object and explain the reference used.", ["AC9MFSP02"], "position-and-navigation", ["space-ground-follow-directions"]), [["Find the Explorer", "Locate the explorer from a clue naming another person or object."], ["Help Geospin", "Locate Geospin by comparing positions in a familiar scene."], ["Hidden Treasure", "Find an object by applying several relative-location clues."]], ["find-person", "compare-scene", "hidden-object-clues"], ["clue", "location", "person", "object", "reference"], ["A clue does not need a reference.", "The closest object must always be the answer."], "Locating people and objects from explicit relative-position clues."),
      W("Build Starpath", "Combine familiar shapes and positions to create and describe a space scene.", ["AC9MFSP01", "AC9MFSP02"], skill("space-ground-shape-position-composition", "Build and describe a space scene", "Combines familiar shapes in a space scene and describes where objects are using simple positional language.", ["AC9MFSP01", "AC9MFSP02"], "construction-and-visualisation", ["space-ground-shape-creation", "space-ground-describe-position"]), [["Build a Planet", "Combine familiar shapes to create a planet design."], ["Create a Space Scene", "Arrange shape-built objects in a Starpath scene."], ["Describe Your Picture", "Use simple oral positional language to describe the scene."]], ["planet-shape-builder", "space-scene-composer", "oral-scene-description"], ["create", "planet", "scene", "beside", "describe"], ["A scene has only one correct arrangement.", "A listener can see where everything is without position words."], "Combining shape creation, scene composition and positional description."),
      W("Space Graduation", "Apply shape recognition, creation, sorting and relative-position language in a final adventure.", ["AC9MFSP01", "AC9MFSP02"], skill("space-ground-spatial-mission", "Complete Space Graduation", "Integrates shape recognition, creation, sorting and relative-position language to solve a cumulative Starpath mission.", ["AC9MFSP01", "AC9MFSP02"], "spatial-representation", ["space-ground-shape-sorting", "space-ground-describe-position", "space-ground-movement-pathways", "space-ground-shape-position-composition"]), [["Shape Explorer Challenge", "Recognise, create and sort familiar shapes in a cumulative challenge."], ["Position Explorer Challenge", "Describe and create positions from location clues."], ["Geospin's Final Mission", "Help Geospin complete an adventure combining all Ground Level skills."]], ["shape-explorer-challenge", "position-explorer-challenge", "geospin-final-mission"], ["shape", "sort", "position", "reference", "explorer"], ["Only one type of shape or position clue can appear in a mission.", "A position answer does not need a named reference."], "Cumulative Ground Level learning; completion is planned to unlock the Ground Level Starpath Graduate title."),
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
      W("Shape Experts", "Recognise and compare familiar shapes despite changes in colour, size and orientation.", ["AC9M1SP01"], skill("space-l1-shape-features", "Become a shape expert", "Recognises and compares familiar shapes in varied forms, identifying simple similarities and differences.", ["AC9M1SP01"], "shape-and-object-reasoning", ["space-ground-shape-recognition"]), [["Shape Disguise Mission", "Recognise familiar shapes after changes in colour, size or orientation."], ["Shape Face-Off", "Compare close shape pairs and identify similarities and differences."], ["Mystery Shape Rescue", "Use several visual clues to identify and check familiar shapes."]], ["shape-disguise-lab", "shape-face-off", "mystery-shape-rescue"], ["shape", "same", "different", "compare", "clue"], ["Colour or size changes a shape's identity.", "A small turn makes a familiar shape into a new shape."], "Shape invariance, close-shape comparison and visual clue reasoning."),
      W("Shape Families", "Classify shapes and objects using shared features.", ["AC9M1SP01"], skill("space-l1-shape-classification", "Build shape families", "Classifies familiar shapes and objects and explains the shared feature.", ["AC9M1SP01"], "shape-and-object-reasoning", ["space-l1-shape-features"]), [["Meet the Families", "Group shapes by a given feature."], ["Make Your Own Rule", "Classify a mixed collection in a useful way."], ["Two Ways to Sort", "Reclassify the same set and compare rules."]], ["guided-sort", "open-sort", "reclassify-challenge"], ["classify", "family", "rule", "similar", "different"], ["There is only one correct classification.", "Objects with different uses cannot share shape features."], "Classification rules and flexible grouping."),
      W("Shape Detectives", "Take pictures apart into their familiar shapes and count each kind.", ["AC9M1SP01"], skill("space-l1-shape-composition", "Find shapes in pictures", "Decomposes a picture into its familiar shapes and finds and counts every shape of each kind.", ["AC9M1SP01"], "construction-and-visualisation", ["space-l1-shape-classification"]), [["Shape Detectives", "Find and count every familiar shape in a picture."], ["Hidden Shape Hunt", "Find every hidden shape in busier pictures."], ["Master Detective", "Find every shape in the busiest pictures."]], ["shape-hunt", "hidden-shape-hunt", "master-hunt"], ["find", "count", "shape", "how many", "hidden"], ["A shape stops being that shape inside a picture.", "You can stop before finding every shape."], "Finding and counting familiar shapes hidden in pictures."),
      W("Shapes in the World", "Recognise familiar shapes in everyday objects and compare their similarities and differences.", ["AC9M1SP01"], skill("space-l1-objects-and-views", "Find shapes in the world", "Recognises familiar shapes in everyday objects and identifies similarities and differences between them.", ["AC9M1SP01"], "shape-and-object-reasoning", ["space-l1-shape-features"]), [["Shapes Around Us", "Spot the familiar shapes in everyday objects."], ["Same or Different?", "Compare two objects and say what is the same or different."], ["Shape Match", "Pair up objects that share a shape."]], ["shape-spotter", "same-or-different", "shape-match"], ["object", "shape", "same", "different", "match"], ["Everyday objects have no shape.", "Two different objects cannot share a shape."], "Recognising shapes in objects and comparing similarities and differences."),
      W("Shape Workshop", "Construct, repair and compare familiar shapes using points and line segments.", ["AC9M1SP01"], skill("space-l1-make-shapes", "Construct and compare shapes", "Makes familiar shapes by joining points, repairs incomplete shapes and compares completed constructions.", ["AC9M1SP01"], "construction-and-visualisation", ["space-l1-shape-features"]), [["Connect the Stars", "Construct familiar shapes by joining points in order."], ["Shape Repair Crew", "Find and repair a missing side in an incomplete shape."], ["Build and Compare", "Compare completed shape constructions and explain similarities and differences."]], ["construct-constellations", "repair-shapes", "compare-constructions"], ["construct", "corner", "side", "repair", "compare"], ["A shape does not need to be closed.", "Changing size or orientation creates a new shape."], "Deliberate construction, repair and comparison of familiar shapes."),
      W("Build a Route", "Create routes, then plan increasingly complex missions that follow spatial rules.", ["AC9M1SP02"], skill("space-l1-give-directions", "Build and plan routes", "Creates ordered routes and plans pathways that satisfy checkpoints, obstacles and destinations across familiar grids.", ["AC9M1SP02"], "position-and-navigation", ["space-ground-follow-directions"]), [["Build a Route", "Choose any valid sequence of moves that reaches the goal."], ["Mission Routes", "Plan routes on a 4 by 4 grid that follow one mission rule."], ["Wide Grid Route Designer", "Plan longer routes across an 8 by 4 grid with multiple constraints."]], ["route-builder", "mission-route-planner", "wide-grid-route-designer"], ["build", "order", "route", "checkpoint", "obstacle"], ["Only the shortest route can be correct.", "Reaching the goal is enough even when a mission rule was missed."], "Creating routes, applying one constraint, then combining constraints across a wider grid."),
      W("Test & Fix", "Test a route, find the broken step and improve it.", ["AC9M1SP02"], skill("space-l1-fix-routes", "Test and fix a route", "Runs a route, diagnoses an incorrect step and revises a route until it reaches the goal.", ["AC9M1SP02"], "position-and-navigation", ["space-l1-give-directions"]), [["Find the Error", "Diagnose the wrong step in a route."], ["Fix the Route", "Finish a started route across an 8 by 4 grid."], ["Test and Improve", "Run, repair and improve routes across an 8 by 4 grid."]], ["route-debugger", "route-fixer", "route-test-lab"], ["test", "wrong", "fix", "improve", "route"], ["A failed route must be thrown away rather than fixed.", "A route only ever has one thing wrong."], "Testing, debugging and improving routes."),
      W("Pathfinder Challenge", "Integrate classification, views and directions.", ["AC9M1SP01", "AC9M1SP02"], skill("space-l1-pathfinder-reasoning", "Solve a pathfinder challenge", "Uses shape information and directions together to solve and explain spatial problems.", ["AC9M1SP01", "AC9M1SP02"], "spatial-representation", ["space-l1-objects-and-views", "space-l1-give-directions"]), [["Find the Shape Landmark", "Use shape clues to identify route landmarks."], ["Plan Around Obstacles", "Create a valid pathway through a familiar space."], ["Explain Your Path", "Compare routes and justify a solution."]], ["landmark-clue-match", "obstacle-route-planner", "route-compare"], ["landmark", "obstacle", "path", "compare", "explain"], ["The shortest-looking route always works.", "Different valid routes cannot share a destination."], "Cumulative shape classification and route reasoning."),
    ],
  },
  {
    level: "level-2", yearLabel: "Year 2", prefix: "y2", title: "Starpath Level 2: Space Mapper",
    summary: "Space Mappers recognise shape features using number of sides and spatial terms, then read two-dimensional maps and follow and give pathways across Starpath.",
    descriptors: [descriptor("AC9M2SP01", "recognise, compare and classify shapes, referencing the number of sides and using spatial terms such as opposite, parallel, curved and straight"), descriptor("AC9M2SP02", "locate positions in two-dimensional representations of a familiar space; move positions by following directions and pathways")],
    achievementStandardConnection: "Students compare and classify shapes using number of sides and spatial terms, locate positions in two-dimensional representations and follow and give directions and pathways.",
    prerequisites: ["Compare and classify familiar shapes.", "Give and follow ordered directions."],
    likelyMisconceptions: ["A curved edge counts as a straight side.", "Turning a shape changes its number of sides.", "Places have no fixed position on a map."],
    progressionRationale: "Weeks 1-4 sharpen shape features (straight/curved, number of sides, opposite/parallel, and comparing two shapes) using simple Year 2 language. Weeks 5-7 build two-dimensional map skills in a clear progression: reading a map to find named places (W5), identifying and describing positions on it (W6), then following and giving ordered routes (W7) - foregrounding the new Year-2 map-reading skill rather than repeating Year-1 direction-following. Week 8 combines shapes, maps and pathways in a Space Mapper mission before the Post-Test.",
    weeks: [
      W("Straight and Curved", "Tell straight sides from curved edges.", ["AC9M2SP01"], skill("space-l2-straight-curved", "Tell straight from curved", "Identifies whether a familiar shape has straight sides or curved edges.", ["AC9M2SP01"], "shape-and-object-reasoning", ["space-l1-shape-features"]), [["Straight or Curved?", "Decide if a shape has straight sides or curved edges."], ["Sort by Edge", "Group shapes by straight or curved edges."], ["Edge Challenge", "Mixed straight and curved review."]], ["straight-curved", "edge-sort", "edge-challenge"], ["straight", "curved", "side", "edge", "shape"], ["A curved edge is a straight side.", "Turning a shape changes its edges."], "Straight sides versus curved edges."),
      W("Count the Sides", "Classify shapes by the number of sides.", ["AC9M2SP01"], skill("space-l2-count-sides", "Count and classify sides", "Classifies familiar shapes by counting the number of sides.", ["AC9M2SP01"], "shape-and-object-reasoning", ["space-l2-straight-curved"]), [["Count the Sides", "Count how many sides a shape has."], ["Sides Sort", "Group shapes by their number of sides."], ["Sides Challenge", "Mixed side-counting review."]], ["count-sides", "sides-sort", "sides-challenge"], ["side", "count", "three", "four", "classify"], ["A turned shape has fewer sides.", "Bigger shapes have more sides."], "Classifying shapes by number of sides."),
      W("Parallel and Opposite", "Recognise opposite and parallel sides.", ["AC9M2SP01"], skill("space-l2-parallel-opposite", "Find parallel and opposite sides", "Recognises opposite sides and parallel sides on familiar shapes.", ["AC9M2SP01"], "shape-and-object-reasoning", ["space-l2-count-sides"]), [["Opposite Sides", "Find the sides across from each other."], ["Parallel Tracks", "Recognise parallel sides like train tracks."], ["Parallel Challenge", "Mixed opposite and parallel review."]], ["opposite-sides", "parallel-tracks", "parallel-challenge"], ["opposite", "parallel", "side", "across", "tracks"], ["Parallel sides must be flat or horizontal.", "Opposite sides always touch."], "Opposite and parallel sides."),
      W("Compare Shapes", "Compare two shapes by their features and say what is the same and what is different.", ["AC9M2SP01"], skill("space-l2-compare", "Compare two shapes", "Compares two familiar shapes and identifies what is the same and what is different about their features.", ["AC9M2SP01"], "shape-and-object-reasoning", ["space-l2-parallel-opposite"]), [["What Is the Same?", "Find what is the same about two shapes."], ["What Is Different?", "Find what is different about two shapes."], ["Compare Challenge", "Mixed same and different review."]], ["compare-same", "compare-different", "compare-challenge"], ["compare", "same", "different", "feature", "side"], ["Two different shapes cannot share a feature.", "Comparing only means finding differences."], "Comparing two shapes by same and different features."),
      W("Star Maps", "Read a two-dimensional map both ways: find a named place, and name the place at a spot.", ["AC9M2SP02"], skill("space-l2-map-reading", "Read a star map", "Locates a named place on a simple two-dimensional map, and names the place at a marked spot.", ["AC9M2SP02"], "spatial-representation", ["space-l2-compare"]), [["Find the Place", "Read a name and tap that place on the map."], ["What Is Here?", "Name the place at a marked spot."], ["Map Reading Challenge", "Find places and name spots on your own."]], ["find-a-place", "what-is-here", "map-reading-challenge"], ["map", "place", "find", "label", "above"], ["A map shows things from the side.", "Places have no fixed position on a map."], "Reading a two-dimensional map: locating named places and naming marked spots."),
      W("Positions on a Map", "Describe how places sit next to, above and below each other, then combine clues to pin down one place.", ["AC9M2SP02"], skill("space-l2-positions", "Describe positions on a map", "Describes which place is next to, above or below another, and combines two position clues to identify a single place on a two-dimensional map.", ["AC9M2SP02"], "spatial-representation", ["space-l2-map-reading"]), [["Next To and Beside", "Find the place to the left or right of another."], ["Above and Below", "Find the place above or below another."], ["Position Detective", "Combine two clues to find the one place that fits both."]], ["next-to", "above-below", "position-detective"], ["position", "next to", "above", "below", "clue"], ["Position words need no reference place.", "One clue is always enough to find a place."], "Describing positions and combining position clues to locate a place on a map."),
      W("Pathways on a Map", "Follow a route, plan a route that obeys mission rules, then test a route and fix the broken step.", ["AC9M2SP02"], skill("space-l2-navigation", "Plan and debug routes", "Follows a pathway to a named place, plans a route that visits a checkpoint and avoids hazards, and finds the broken step in a faulty route on a two-dimensional map.", ["AC9M2SP02"], "position-and-navigation", ["space-l2-positions"]), [["Follow the Path", "Follow directions to a place."], ["Plan a Mission", "Plan a route that visits a checkpoint and dodges hazards."], ["Test and Fix", "Find the step that breaks a route and fix it."]], ["follow-path", "plan-a-mission", "test-and-fix"], ["path", "route", "plan", "mission", "fix"], ["Any path reaches any place.", "A route needs no order."], "Following, planning under rules, and debugging ordered routes on a map."),
      W("Master Mapper", "Combine shapes, maps and pathways.", ["AC9M2SP01", "AC9M2SP02"], skill("space-l2-master-mapper", "Become a Master Mapper", "Combines shape features, map reading and pathway following to complete a cumulative mission.", ["AC9M2SP01", "AC9M2SP02"], "spatial-representation", ["space-l2-compare", "space-l2-navigation"]), [["Shape and Map", "Combine shape features and map reading."], ["Pathway Master", "Follow and give pathways."], ["Master Mission", "Complete the final Space Mapper mission."]], ["shape-and-map", "pathway-master", "master-mission"], ["shape", "map", "pathway", "position", "mission"], ["Shapes and maps are unrelated.", "Only one route can solve a mission."], "Cumulative shapes, maps and pathways; the Post-Test unlocks the Space Mapper title."),
    ],
  },
  {
    level: "level-3", yearLabel: "Year 3", prefix: "y3", title: "Starpath Level 3: Cosmic Navigator",
    summary: "Students become Cosmic Navigators — making, comparing and classifying 3D objects, then moving from following maps to creating and navigating them.",
    descriptors: [descriptor("AC9M3SP01", "Make, compare and classify objects, identifying key features and explaining why those features make them suited to their uses."), descriptor("AC9M3SP02", "Interpret and create two-dimensional representations of familiar environments, locating key landmarks and objects relative to each other.")],
    achievementStandardConnection: "Students make and compare objects using key features and interpret and create two-dimensional representations of familiar environments.",
    prerequisites: ["Recognise and compare familiar shapes by their features.", "Read a simple map and follow pathways."],
    likelyMisconceptions: ["Objects with the same use must have the same form.", "A place can go anywhere on a map.", "Any path is as good as any other."],
    progressionRationale: "Students make, compare and classify 3D objects using faces, surfaces, edges and vertices, then explain how features suit a purpose. They then move from interpreting maps to creating and navigating their own. Composite objects and multiple object views are reserved for Level 4.",
    weeks: [
      W("3D Discoveries", "Recognise common three-dimensional objects and identify their key features.", ["AC9M3SP01"], skill("space-l3-object-recognition", "Recognise 3D objects", "Recognises cubes, spheres, cylinders, cones, rectangular prisms and pyramids using faces, surfaces, edges and vertices.", ["AC9M3SP01"], "shape-and-object-reasoning", ["space-l2-compare"]), [["Meet the Space Objects", "Recognise and name six 3D objects."], ["Objects at Work", "Connect familiar objects with their geometric form."], ["3D Object Challenge", "Use key feature clues to recognise objects independently."]], ["meet-the-objects", "find-the-object", "object-challenge"], ["3D object", "face", "curved surface", "edge", "vertex", "pyramid"], ["Curved surfaces are flat faces.", "Every 3D object has vertices."], "Recognition progressing from names and context to precise feature clues."),
      W("Object Detectives", "Compare and classify 3D objects using key features.", ["AC9M3SP01"], skill("space-l3-object-features", "Compare 3D objects", "Compares and classifies 3D objects using the number and type of faces or surfaces, edges and vertices.", ["AC9M3SP01"], "shape-and-object-reasoning", ["space-l3-object-recognition"]), [["Which Object Is It?", "Identify an object from precise feature clues."], ["Compare Space Objects", "Compare faces, surfaces, edges and vertices."], ["Space Object Sort", "Classify a complete set using one feature rule."]], ["which-object", "compare-objects", "object-sort"], ["face", "surface", "edge", "vertex", "classify"], ["A curved surface is a face.", "Objects in one group must look identical."], "Comparing and classifying objects by precise geometric features."),
      W("Building Starpath", "Construct models, choose objects whose features suit a purpose, and explain why.", ["AC9M3SP01"], skill("space-l3-object-design", "Build and choose objects for a purpose", "Constructs models from familiar objects, chooses features suited to a stated purpose and explains why they are suitable.", ["AC9M3SP01"], "construction-and-visualisation", ["space-l3-object-features"]), [["Build Starpath Models", "Construct complete models from several 3D objects."], ["Choose the Best Shape", "Decode a design requirement and choose the object whose features fit."], ["Space Engineering", "Justify design choices using feature-to-purpose reasons."]], ["build-the-rover", "choose-best-shape", "space-engineering"], ["purpose", "suitable", "because", "stable", "construct"], ["The best-looking object is the best.", "Anything that rolls makes a useful wheel."], "Construction, requirement decoding and explicit feature-to-purpose justification."),
      W("Reading Space Maps", "Interpret a top-view map using its symbols, key and landmarks.", ["AC9M3SP02"], skill("space-l3-map-reading", "Read a space map", "Interprets a two-dimensional map using a key, symbols and the relative positions of landmarks.", ["AC9M3SP02"], "spatial-representation", ["space-l2-navigation"]), [["Map Symbols", "Read what a symbol stands for using the key."], ["Explorer's View", "Read directions from the explorer's point of view."], ["Map Explorer", "Read a map to answer questions about places."]], ["map-symbols", "find-landmark", "map-explorer"], ["map", "key", "symbol", "landmark", "relative"], ["A map shows things from the side.", "A symbol means whatever it looks like."], "Interpreting map symbols, keys and relative landmark positions."),
      W("Creating Maps", "Create a top-view map by placing landmarks in the right positions.", ["AC9M3SP02"], skill("space-l3-map-creation", "Create a space map", "Creates a two-dimensional map by placing landmarks in correct positions relative to each other.", ["AC9M3SP02"], "spatial-representation", ["space-l3-map-reading"]), [["Draw My Space Camp", "Place landmarks to make a simple map."], ["Place the Landmarks", "Place landmarks relative to each other."], ["Map Builder", "Build a complete map others could read."]], ["draw-camp", "place-landmarks", "map-builder"], ["create", "place", "position", "relative", "accurate"], ["A place can go anywhere on a map.", "A map only needs to make sense to me."], "Creating a two-dimensional map with correct relative positions."),
      W("Landmark Navigation", "Use a map and its landmarks to navigate to places.", ["AC9M3SP02"], skill("space-l3-navigation", "Navigate by landmarks", "Uses landmarks on a map to follow directions, plan routes and complete navigation missions.", ["AC9M3SP02"], "position-and-navigation", ["space-l3-map-creation"]), [["Which Way Now?", "Track the rover's heading through turns."], ["First Move", "Choose the first steer toward a landmark."], ["Drive the Rover", "Plan and drive a route by turning and moving forward."]], ["treasure-hunt", "find-observatory", "mission-control"], ["heading", "turn", "forward", "steer", "route"], ["Left and right stay the same when the rover turns.", "Forward always goes the same way."], "Steering a rover by its heading: turn left or right, then go forward to reach a landmark."),
      W("Cosmic Missions", "Combine 3D-object reasoning with mapping and navigation.", ["AC9M3SP01", "AC9M3SP02"], skill("space-l3-missions", "Complete cosmic missions", "Combines object knowledge, map reading and navigation to complete multi-step explorer missions.", ["AC9M3SP01", "AC9M3SP02"], "position-and-navigation", ["space-l3-object-design", "space-l3-navigation"]), [["Explorer Challenge", "Use object and map skills together."], ["Rescue Mission", "Plan a mission using objects and a map."], ["Navigator Challenge", "Complete a full explorer mission."]], ["explorer-challenge", "rescue-mission", "navigator-challenge"], ["object", "map", "route", "mission", "plan"], ["Object skills and map skills are separate.", "One route always fits a mission."], "Integrating object, map and navigation skills in missions."),
      W("Cosmic Navigator Graduation", "Demonstrate mastery across both descriptors.", ["AC9M3SP01", "AC9M3SP02"], skill("space-l3-cosmic-navigator", "Become a Cosmic Navigator", "Integrates object reasoning, map creation and navigation to complete a cumulative graduation mission.", ["AC9M3SP01", "AC9M3SP02"], "spatial-representation", ["space-l3-missions"]), [["3D Objects Review", "Recognise, compare and choose objects."], ["Map Master Challenge", "Read, create and navigate maps."], ["Final Navigation Mission", "Put every skill together."]], ["objects-review", "map-master", "final-mission"], ["object", "map", "navigate", "mission", "master"], ["Objects and maps are unrelated.", "Only one route can solve a mission."], "Cumulative object, map and navigation reasoning; the Post-Test unlocks the Cosmic Navigator title."),
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
      W("Composite Shapes", "Compose, decompose and represent complex two-dimensional shapes.", ["AC9M4SP01"], skill("space-l4-composite-shapes", "Build composite shapes", "Represents composite shapes using combinations of familiar shapes and compares decompositions.", ["AC9M4SP01"], "construction-and-visualisation", ["space-l2-multi-feature-classification"]), [["Shapes Within Shapes", "Identify familiar components in a composite."], ["Build the Outline", "Compose a target using selected shapes."], ["Different Builds, Same Shape", "Create and compare different representations of the same composite."]], ["composite-highlighter", "shape-composer", "decomposition-compare"], ["composite", "component", "outline", "overlap", "represent"], ["Components cannot overlap.", "A composite has one exact decomposition."], "Composite construction and equivalent representations."),
      W("Composite Objects", "Represent three-dimensional objects with combinations and simple views.", ["AC9M4SP01"], skill("space-l4-composite-objects", "Represent composite objects", "Builds and represents composite objects from familiar solids, including partially hidden components.", ["AC9M4SP01"], "construction-and-visualisation", ["space-l3-spatial-construction", "space-l3-object-views"]), [["Combine the Solids", "Construct an object from specified components."], ["Build from a View", "Connect a composite object with front, side and top views."], ["Hidden Structure", "Infer components needed to support a visible structure."]], ["solid-composer", "build-view-match", "hidden-block-inference"], ["solid", "layer", "view", "hidden", "support"], ["Only visible components exist.", "A single view uniquely determines every object."], "Composite objects, views and hidden structure."),
      W("Approximate and Represent", "Choose familiar components to approximate real forms.", ["AC9M4SP01"], skill("space-l4-spatial-approximation", "Approximate a complex form", "Selects and combines familiar shapes or objects to make a useful approximation and explains limitations.", ["AC9M4SP01"], "spatial-representation", ["space-l4-composite-shapes", "space-l4-composite-objects"]), [["Simplify the Form", "Identify useful familiar components in a complex object."], ["Create the Model", "Build a representation that preserves key spatial features."], ["Evaluate the Representation", "Judge and improve what an approximation communicates."]], ["form-simplifier", "approximation-builder", "model-evaluator"], ["approximate", "model", "feature", "accurate", "limitation"], ["Approximate means careless or incorrect.", "A more detailed model is always more useful."], "Purposeful approximation and model evaluation."),
      W("Grid Reference Systems", "Understand and create labelled grid reference systems.", ["AC9M4SP02"], skill("space-l4-grid-references", "Use grid references", "Creates and interprets a consistent labelled grid system to identify cells and features.", ["AC9M4SP02"], "position-and-navigation", ["space-l3-map-interpretation"]), [["Read the Grid", "Use row and column labels in the agreed order."], ["Locate the Feature", "Assign and interpret grid references."], ["Build a Grid Key", "Create a consistent reference system for a map."]], ["grid-reference-reader", "grid-locator", "grid-system-builder"], ["grid", "row", "column", "reference", "cell"], ["Row and column order can change mid-map.", "A reference names a grid line rather than a cell."], "Grid conventions and precise location."),
      W("Pathways on Grids", "Describe and compare routes using grids, references and directions.", ["AC9M4SP02"], skill("space-l4-grid-navigation", "Navigate a grid", "Uses references and directional sequences to locate, trace and compare pathways on a grid.", ["AC9M4SP02"], "position-and-navigation", ["space-l4-grid-references"]), [["Reference to Reference", "Trace a route between labelled cells."], ["Write the Path", "Create directions using references and movement language."], ["Route Under Constraints", "Compare pathways that satisfy spatial constraints."]], ["grid-route-runner", "grid-direction-builder", "constrained-route-planner"], ["pathway", "reference", "direction", "route", "constraint"], ["A sequence of references automatically describes the moves between them.", "The fewest cells is always the best route."], "Grid pathways, directions and route constraints."),
      W("Line Symmetry", "Recognise and construct line-symmetric figures.", ["AC9M4SP03"], skill("space-l4-line-symmetry", "Find line symmetry", "Identifies lines of symmetry and completes figures by matching corresponding positions and features.", ["AC9M4SP03"], "symmetry-and-transformation", ["space-l2-one-step-transformations"]), [["Mirror Match", "Test whether two halves correspond across a line."], ["Complete the Reflection", "Construct the missing half on a grid."], ["Create a Symmetric Picture", "Create and audit an original line-symmetric design."]], ["symmetry-test", "mirror-grid-builder", "symmetry-line-counter"], ["symmetry", "line of symmetry", "mirror", "corresponding", "equal distance"], ["Any line through the centre is a symmetry line.", "Matching colour alone proves symmetry."], "Line symmetry, corresponding points and construction."),
      W("Rotational Symmetry", "Recognise and create figures that match after rotation.", ["AC9M4SP03"], skill("space-l4-rotational-symmetry", "Find rotational symmetry", "Recognises rotational symmetry and describes matching positions within one full turn.", ["AC9M4SP03"], "symmetry-and-transformation", ["space-l4-line-symmetry"]), [["Turn and Test", "Test a figure at marked rotations."], ["Record the Matches", "Test and record matching positions in a full turn."], ["Create a Turning Pattern", "Construct and justify a rotationally symmetric design."]], ["rotation-tester", "rotational-order-counter", "radial-pattern-builder"], ["rotational symmetry", "centre", "full turn", "match", "order"], ["A full turn is the only matching turn.", "Line symmetry guarantees rotational symmetry."], "Rotational invariance and pattern construction."),
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
      W("Construct from Nets", "Mentally and virtually fold nets to construct objects.", ["AC9M5SP01"], skill("space-l5-net-construction", "Fold nets into objects", "Uses spatial visualisation to construct objects from nets and identify face relationships.", ["AC9M5SP01"], "construction-and-visualisation", ["space-l5-object-net-connections"]), [["Parts of a Solid", "Break a net into its faces and count them across different solids."], ["Track a Face", "Follow one labelled face through a virtual fold."], ["Opposite and Adjacent", "Determine face relationships after construction."]], ["face-tracker", "net-fold-simulator", "folded-relation-challenge"], ["fold", "adjacent", "opposite", "orientation", "construct"], ["A face keeps the same screen orientation after folding.", "Opposite faces are opposite in the flat net."], "Mental folding and face relationships."),
      W("Create and Test Nets", "Design, test and refine nets for familiar objects.", ["AC9M5SP01"], skill("space-l5-net-design", "Design a valid net", "Creates and tests nets, revising layouts using overlap and adjacency evidence.", ["AC9M5SP01"], "construction-and-visualisation", ["space-l5-net-construction"]), [["Name the Solid", "Fold different nets and name the 3D solid each makes."], ["Arrange the Faces", "Build a candidate net from required faces."], ["Test the Fold", "Identify overlap, gaps or incorrect adjacency."]], ["net-builder", "fold-test-lab", "net-compare"], ["layout", "overlap", "gap", "valid", "revise"], ["Each object has one net.", "A connected arrangement always folds without overlap."], "Net creation, validation and multiple solutions."),
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
  "shape-name-recall",
  "shape-sorter",
] as const;
const SHAPE_DETECTIVES_MECHANICS = [
  "space-object-match",
  "shape-explorer",
  "shape-detective-hunt",
] as const;
const SHAPE_MASTERS_MECHANICS = [
  "which-one-doesnt-belong",
  "space-shape-sort",
  "cosmic-mission",
] as const;
const BUILD_WITH_SHAPES_MECHANICS = [
  "finish-the-picture",
  "shape-builder",
  "which-shapes-did-you-use",
] as const;
const SHAPE_CREATORS_MECHANICS = [
  "copy-my-picture",
  "shape-challenge",
  "find-the-missing-shape",
] as const;
const SPACE_BUILDERS_MECHANICS = [
  "cosmic-construction",
  "match-the-build",
  "space-museum",
] as const;
const SHAPE_FAMILIES_WEEK3_MECHANICS = [
  "sorting-station",
  "collect-the-family",
  "find-the-odd-shape",
] as const;
const SAME_OR_DIFFERENT_MECHANICS = [
  "same-or-different",
  "twins-in-disguise",
  "what-changed",
] as const;
const SHAPE_CHALLENGE_MECHANICS = [
  "mixed-shape-hunt",
  "same-or-different-recap",
  "shape-sprint",
] as const;
const WHERE_IS_IT_MECHANICS = [
  "find-it",
  "place-it",
  "which-picture",
] as const;
const AROUND_STARPATH_MECHANICS = [
  "hide-and-seek",
  "space-explorer",
  "match-the-position",
] as const;
const POSITION_CHALLENGE_MECHANICS = [
  "follow-the-clues",
  "space-map",
  "explorer-mission",
] as const;
const MOVE_IT_THERE_MECHANICS = ["describe-self", "match-position", "place-explorer"] as const;
const WHICH_WAY_MECHANICS = ["compare-people", "choose-scene", "place-person"] as const;
const DIRECTION_MISSION_MECHANICS = ["say-position", "check-scene", "build-position"] as const;
const GUIDE_THE_ROCKET_MECHANICS = ["find", "describe", "picture"] as const;
const HELP_GEOSPIN_MECHANICS = ["find", "describe", "picture"] as const;
const HIDDEN_TREASURE_MECHANICS = ["clue-one", "check-scene", "treasure"] as const;
const BUILD_A_PLANET_MECHANICS = ["build-object", "finish-picture", "name-the-shapes"] as const;
const SPACE_SCENE_MECHANICS = ["build-for-scene", "place-in-scene", "which-scene"] as const;
const DESCRIBE_PICTURE_MECHANICS = ["say-where", "find-in-scene", "scene-reasoning"] as const;
const SHAPE_EXPLORER_MECHANICS = ["recognise", "odd-one-out", "compare"] as const;
const POSITION_EXPLORER_MECHANICS = ["find-by-position", "say-where", "place-person"] as const;
const FINAL_MISSION_MECHANICS = ["sort-shapes", "which-picture", "final-clues"] as const;
const LEVEL_ONE_SHAPE_REVIEW_MECHANICS = [
  "hologram-stabiliser",
  "turntable-scanner",
  "disguise-match",
] as const;
const LEVEL_ONE_COMPARE_SHAPES_MECHANICS = [
  "close-pair",
  "similarity-scan",
  "difference-scan",
] as const;
const LEVEL_ONE_SHAPE_DETECTIVE_MECHANICS = [
  "clue-decoder",
  "shape-elimination",
  "label-repair",
] as const;
const L1_MEET_FAMILIES_MECHANICS = ["meet-the-families", "family-check", "family-mastery"] as const;
const L1_MAKE_RULE_MECHANICS = ["find-the-rule", "rule-check", "rule-mastery"] as const;
const L1_TWO_WAYS_MECHANICS = ["another-way", "another-way-2", "rule-recap"] as const;
const L1_SHAPE_HUNT_MECHANICS = ["hunt-1", "hunt-2", "hunt-3"] as const;
const L1_SHAPE_SPOTTER_MECHANICS = ["spot-1", "spot-2", "spot-3"] as const;
const L1_SAME_DIFFERENT_MECHANICS = ["compare-1", "compare-2", "compare-3"] as const;
const L1_SHAPE_MATCH_MECHANICS = ["match-1", "match-2", "match-3"] as const;
const L1_CONNECT_STARS_MECHANICS = ["construct-1", "construct-2", "construct-3"] as const;
const L1_SHAPE_REPAIR_MECHANICS = ["repair-1", "repair-2", "repair-3"] as const;
const L1_BUILD_COMPARE_MECHANICS = ["compare-build-1", "compare-build-2", "compare-build-3"] as const;
const L1_FIND_ERROR_MECHANICS = ["debug-1", "debug-2", "debug-3"] as const;
const L1_BUILD_ROUTE_MECHANICS = ["build-1", "build-2", "build-3"] as const;
const L1_MISSION_ROUTES_MECHANICS = ["mission-1", "mission-2", "mission-3"] as const;
const L1_ROUTE_DESIGNER_MECHANICS = ["design-1", "design-2", "design-3"] as const;
const L1_FIX_ROUTE_MECHANICS = ["fix-1", "fix-2", "fix-3"] as const;
const L1_TEST_IMPROVE_MECHANICS = ["improve-1", "improve-2", "improve-3"] as const;
const L1_FIND_LANDMARK_MECHANICS = ["landmark-classify", "landmark-view", "landmark-match"] as const;
const L1_PLAN_OBSTACLES_MECHANICS = ["plan-build", "plan-repair", "plan-follow"] as const;
const L1_EXPLAIN_PATH_MECHANICS = ["explain-route", "explain-move", "explain-shape"] as const;

// Ground Level lessons with real, playable content (keyed by registry id).
const IMPLEMENTED_GROUND_LESSONS: Record<
  string,
  { learningIntention: string; mechanics: readonly [string, string, string] }
> = {
  "ground-space-w1-l1": { learningIntention: "I can recognise and name familiar shapes.", mechanics: MEET_THE_SHAPES_MECHANICS },
  "ground-space-w1-l2": { learningIntention: "I can find familiar shapes in the world around me.", mechanics: SHAPE_DETECTIVES_MECHANICS },
  "ground-space-w1-l3": { learningIntention: "I can recognise shapes by myself.", mechanics: SHAPE_MASTERS_MECHANICS },
  "ground-space-w2-l1": { learningIntention: "I can use shapes to build pictures.", mechanics: BUILD_WITH_SHAPES_MECHANICS },
  "ground-space-w2-l2": { learningIntention: "I can make new things using shapes.", mechanics: SHAPE_CREATORS_MECHANICS },
  "ground-space-w2-l3": { learningIntention: "I can build and explain my creations.", mechanics: SPACE_BUILDERS_MECHANICS },
  "ground-space-w3-l1": { learningIntention: "I can sort shapes into groups.", mechanics: SHAPE_FAMILIES_WEEK3_MECHANICS },
  "ground-space-w3-l2": { learningIntention: "I can compare familiar shapes.", mechanics: SAME_OR_DIFFERENT_MECHANICS },
  "ground-space-w3-l3": { learningIntention: "I can recognise, sort and compare familiar shapes.", mechanics: SHAPE_CHALLENGE_MECHANICS },
  "ground-space-w4-l1": { learningIntention: "I can describe where objects are.", mechanics: WHERE_IS_IT_MECHANICS },
  "ground-space-w4-l2": { learningIntention: "I can describe where objects are in space.", mechanics: AROUND_STARPATH_MECHANICS },
  "ground-space-w4-l3": { learningIntention: "I can use positional language to complete a mission.", mechanics: POSITION_CHALLENGE_MECHANICS },
  "ground-space-w5-l1": { learningIntention: "I can describe where I am compared with a person or object.", mechanics: MOVE_IT_THERE_MECHANICS },
  "ground-space-w5-l2": { learningIntention: "I can compare where people are using a named reference.", mechanics: WHICH_WAY_MECHANICS },
  "ground-space-w5-l3": { learningIntention: "I can place people and objects to match position clues.", mechanics: DIRECTION_MISSION_MECHANICS },
  "ground-space-w6-l1": { learningIntention: "I can locate the explorer from a relative-position clue.", mechanics: GUIDE_THE_ROCKET_MECHANICS },
  "ground-space-w6-l2": { learningIntention: "I can locate Geospin by comparing positions.", mechanics: HELP_GEOSPIN_MECHANICS },
  "ground-space-w6-l3": { learningIntention: "I can use several location clues to find a hidden object.", mechanics: HIDDEN_TREASURE_MECHANICS },
  "ground-space-w7-l1": { learningIntention: "I can build pictures using shapes.", mechanics: BUILD_A_PLANET_MECHANICS },
  "ground-space-w7-l2": { learningIntention: "I can build objects and arrange them in a scene.", mechanics: SPACE_SCENE_MECHANICS },
  "ground-space-w7-l3": { learningIntention: "I can describe where objects are in my scene.", mechanics: DESCRIBE_PICTURE_MECHANICS },
  "ground-space-w8-l1": { learningIntention: "I can recognise, sort and compare shapes.", mechanics: SHAPE_EXPLORER_MECHANICS },
  "ground-space-w8-l2": { learningIntention: "I can find, describe and create relative positions.", mechanics: POSITION_EXPLORER_MECHANICS },
  "ground-space-w8-l3": { learningIntention: "I can combine all my skills to complete a mission.", mechanics: FINAL_MISSION_MECHANICS },
};

const IMPLEMENTED_LEVEL_ONE_LESSONS: Record<
  string,
  { learningIntention: string; mechanics: readonly [string, string, string] }
> = {
  "y1-space-w1-l1": {
    learningIntention: "I can recognise familiar shapes even when they look different.",
    mechanics: LEVEL_ONE_SHAPE_REVIEW_MECHANICS,
  },
  "y1-space-w1-l2": {
    learningIntention: "I can compare familiar shapes and explain what is the same or different.",
    mechanics: LEVEL_ONE_COMPARE_SHAPES_MECHANICS,
  },
  "y1-space-w1-l3": {
    learningIntention: "I can use shape clues to solve a shape challenge.",
    mechanics: LEVEL_ONE_SHAPE_DETECTIVE_MECHANICS,
  },
  "y1-space-w2-l1": { learningIntention: "I can sort shapes into families by their features.", mechanics: L1_MEET_FAMILIES_MECHANICS },
  "y1-space-w2-l2": { learningIntention: "I can work out the rule behind a group of shapes.", mechanics: L1_MAKE_RULE_MECHANICS },
  "y1-space-w2-l3": { learningIntention: "I can sort the same shapes in more than one way.", mechanics: L1_TWO_WAYS_MECHANICS },
  "y1-space-w3-l1": { learningIntention: "I can find and count the shapes hidden in a picture.", mechanics: L1_SHAPE_HUNT_MECHANICS },
  "y1-space-w3-l2": { learningIntention: "I can find every shape hidden in a busier picture.", mechanics: L1_SHAPE_HUNT_MECHANICS },
  "y1-space-w3-l3": { learningIntention: "I can find every shape in the busiest pictures.", mechanics: L1_SHAPE_HUNT_MECHANICS },
  "y1-space-w4-l1": { learningIntention: "I can spot the familiar shapes in everyday objects.", mechanics: L1_SHAPE_SPOTTER_MECHANICS },
  "y1-space-w4-l2": { learningIntention: "I can compare two objects and say what is the same or different.", mechanics: L1_SAME_DIFFERENT_MECHANICS },
  "y1-space-w4-l3": { learningIntention: "I can pair up objects that share a shape.", mechanics: L1_SHAPE_MATCH_MECHANICS },
  "y1-space-w5-l1": { learningIntention: "I can make familiar shapes by joining points.", mechanics: L1_CONNECT_STARS_MECHANICS },
  "y1-space-w5-l2": { learningIntention: "I can find and repair a missing side.", mechanics: L1_SHAPE_REPAIR_MECHANICS },
  "y1-space-w5-l3": { learningIntention: "I can construct and compare familiar shapes.", mechanics: L1_BUILD_COMPARE_MECHANICS },
  "y1-space-w6-l1": { learningIntention: "I can build a route to reach a goal.", mechanics: L1_BUILD_ROUTE_MECHANICS },
  "y1-space-w6-l2": { learningIntention: "I can plan a route that follows a mission rule.", mechanics: L1_MISSION_ROUTES_MECHANICS },
  "y1-space-w6-l3": { learningIntention: "I can plan a longer route that follows several mission rules.", mechanics: L1_ROUTE_DESIGNER_MECHANICS },
  "y1-space-w7-l1": { learningIntention: "I can find the wrong step in a route.", mechanics: L1_FIND_ERROR_MECHANICS },
  "y1-space-w7-l2": { learningIntention: "I can finish a route so it reaches the goal.", mechanics: L1_FIX_ROUTE_MECHANICS },
  "y1-space-w7-l3": { learningIntention: "I can test a route and improve it.", mechanics: L1_TEST_IMPROVE_MECHANICS },
  "y1-space-w8-l1": { learningIntention: "I can use shapes and views to find landmarks.", mechanics: L1_FIND_LANDMARK_MECHANICS },
  "y1-space-w8-l2": { learningIntention: "I can plan and repair a route.", mechanics: L1_PLAN_OBSTACLES_MECHANICS },
  "y1-space-w8-l3": { learningIntention: "I can give and explain a clear route.", mechanics: L1_EXPLAIN_PATH_MECHANICS },
};

const L2_EDGE_MECHANICS = ["straight-curved", "edge-sort", "edge-challenge"] as const;
const L2_SIDES_MECHANICS = ["count-sides", "sides-sort", "sides-challenge"] as const;
const L2_PARALLEL_MECHANICS = ["opposite-sides", "parallel-tracks", "parallel-challenge"] as const;
const L2_COMPARE_MECHANICS = ["same-feature", "what-different", "compare-challenge"] as const;
const L2_READMAP_MECHANICS = ["find-a-place", "what-is-here", "map-reading-challenge"] as const;
const L2_POSITIONS_MECHANICS = ["next-to", "above-below", "position-detective"] as const;
const L2_ROUTE_MECHANICS = ["follow-path", "plan-a-mission", "test-and-fix"] as const;
const L2_MASTER_MECHANICS = ["shape-and-map", "pathway-master", "master-mission"] as const;

const IMPLEMENTED_LEVEL_TWO_LESSONS: Record<
  string,
  { learningIntention: string; mechanics: readonly [string, string, string] }
> = {
  "y2-space-w1-l1": { learningIntention: "I can tell straight sides from curved edges.", mechanics: L2_EDGE_MECHANICS },
  "y2-space-w1-l2": { learningIntention: "I can find shapes with straight or curved edges.", mechanics: L2_EDGE_MECHANICS },
  "y2-space-w1-l3": { learningIntention: "I can tell straight and curved apart.", mechanics: L2_EDGE_MECHANICS },
  "y2-space-w2-l1": { learningIntention: "I can count the sides of a shape.", mechanics: L2_SIDES_MECHANICS },
  "y2-space-w2-l2": { learningIntention: "I can find a shape by its number of sides.", mechanics: L2_SIDES_MECHANICS },
  "y2-space-w2-l3": { learningIntention: "I can classify shapes by their sides.", mechanics: L2_SIDES_MECHANICS },
  "y2-space-w3-l1": { learningIntention: "I can tell if a shape has parallel sides.", mechanics: L2_PARALLEL_MECHANICS },
  "y2-space-w3-l2": { learningIntention: "I can find shapes with parallel sides.", mechanics: L2_PARALLEL_MECHANICS },
  "y2-space-w3-l3": { learningIntention: "I can reason about parallel sides.", mechanics: L2_PARALLEL_MECHANICS },
  "y2-space-w4-l1": { learningIntention: "I can say what is the same about two shapes.", mechanics: L2_COMPARE_MECHANICS },
  "y2-space-w4-l2": { learningIntention: "I can say what is different about two shapes.", mechanics: L2_COMPARE_MECHANICS },
  "y2-space-w4-l3": { learningIntention: "I can compare two shapes by their features.", mechanics: L2_COMPARE_MECHANICS },
  "y2-space-w5-l1": { learningIntention: "I can find a named place on the star map.", mechanics: L2_READMAP_MECHANICS },
  "y2-space-w5-l2": { learningIntention: "I can name the place at a marked spot.", mechanics: L2_READMAP_MECHANICS },
  "y2-space-w5-l3": { learningIntention: "I can find places and name spots on my own.", mechanics: L2_READMAP_MECHANICS },
  "y2-space-w6-l1": { learningIntention: "I can find the place next to another, left or right.", mechanics: L2_POSITIONS_MECHANICS },
  "y2-space-w6-l2": { learningIntention: "I can find the place above or below another.", mechanics: L2_POSITIONS_MECHANICS },
  "y2-space-w6-l3": { learningIntention: "I can combine two clues to find one place.", mechanics: L2_POSITIONS_MECHANICS },
  "y2-space-w7-l1": { learningIntention: "I can follow a path to a place on the map.", mechanics: L2_ROUTE_MECHANICS },
  "y2-space-w7-l2": { learningIntention: "I can plan a route that visits a checkpoint and avoids hazards.", mechanics: L2_ROUTE_MECHANICS },
  "y2-space-w7-l3": { learningIntention: "I can test a route and fix the step that breaks it.", mechanics: L2_ROUTE_MECHANICS },
  "y2-space-w8-l1": { learningIntention: "I can use shape and map skills together.", mechanics: L2_MASTER_MECHANICS },
  "y2-space-w8-l2": { learningIntention: "I can read, follow and give pathways.", mechanics: L2_MASTER_MECHANICS },
  "y2-space-w8-l3": { learningIntention: "I can combine shapes, maps and pathways.", mechanics: L2_MASTER_MECHANICS },
};

const L3_OBJECT_RECOGNITION_MECHANICS = ["meet-the-objects", "find-the-object", "object-challenge"] as const;
const L3_OBJECT_FEATURES_MECHANICS = ["which-object", "compare-objects", "object-sort"] as const;
const L3_OBJECT_DESIGN_MECHANICS = ["build-the-rover", "choose-best-shape", "space-engineering"] as const;
const L3_MAP_READING_MECHANICS = ["map-symbols", "find-landmark", "map-explorer"] as const;
const L3_MAP_CREATION_MECHANICS = ["draw-camp", "place-landmarks", "map-builder"] as const;
const L3_NAVIGATION_MECHANICS = ["treasure-hunt", "find-observatory", "mission-control"] as const;
const L3_MISSION_MECHANICS = ["explorer-challenge", "rescue-mission", "navigator-challenge"] as const;
const L3_GRADUATION_MECHANICS = ["objects-review", "map-master", "final-mission"] as const;
const L4_GRID_REFERENCE_MECHANICS = ["read-grid", "locate-feature", "build-grid-system"] as const;
const L4_COMPOSITE_SHAPE_MECHANICS = ["analyse-components", "open-composite-canvas", "compare-decompositions"] as const;
const L4_COMPOSITE_OBJECT_MECHANICS = ["solid-assembly", "multi-view-build", "hidden-structure"] as const;
const L4_APPROXIMATION_MECHANICS = ["feature-simplifier", "model-builder", "model-evaluator"] as const;
const L4_GRID_ROUTE_MECHANICS = ["trace-references", "author-route", "route-audit"] as const;
const L4_LINE_SYMMETRY_MECHANICS = ["line-test", "reflection-builder", "line-design"] as const;
const L4_ROTATION_MECHANICS = ["turn-test", "turn-recorder", "rotation-builder"] as const;
const L4_INTEGRATION_MECHANICS = ["decode-brief", "build-world", "audit-world"] as const;

// Level 3 lessons with real, playable content (keyed by registry id). Weeks fill
// in as they are built; unlisted lessons render the in-development screen.
const IMPLEMENTED_LEVEL_THREE_LESSONS: Record<
  string,
  { learningIntention: string; mechanics: readonly [string, string, string] }
> = {
  "y4-space-w1-l1": { learningIntention: "I can identify useful familiar components in a composite shape.", mechanics: L4_COMPOSITE_SHAPE_MECHANICS },
  "y4-space-w1-l2": { learningIntention: "I can choose and arrange components to construct a target outline.", mechanics: L4_COMPOSITE_SHAPE_MECHANICS },
  "y4-space-w1-l3": { learningIntention: "I can create different valid decompositions of the same shape.", mechanics: L4_COMPOSITE_SHAPE_MECHANICS },
  "y4-space-w2-l1": { learningIntention: "I can combine familiar solids to meet a design brief.", mechanics: L4_COMPOSITE_OBJECT_MECHANICS },
  "y4-space-w2-l2": { learningIntention: "I can build a composite object from more than one view.", mechanics: L4_COMPOSITE_OBJECT_MECHANICS },
  "y4-space-w2-l3": { learningIntention: "I can infer hidden components using views and support rules.", mechanics: L4_COMPOSITE_OBJECT_MECHANICS },
  "y4-space-w3-l1": { learningIntention: "I can preserve defining features when I simplify a form.", mechanics: L4_APPROXIMATION_MECHANICS },
  "y4-space-w3-l2": { learningIntention: "I can construct a useful approximation from a brief.", mechanics: L4_APPROXIMATION_MECHANICS },
  "y4-space-w3-l3": { learningIntention: "I can evaluate and improve a representation using spatial evidence.", mechanics: L4_APPROXIMATION_MECHANICS },
  "y3-space-w1-l1": { learningIntention: "I can name six familiar 3D objects.", mechanics: L3_OBJECT_RECOGNITION_MECHANICS },
  "y3-space-w1-l2": { learningIntention: "I can find a named 3D object in a scene.", mechanics: L3_OBJECT_RECOGNITION_MECHANICS },
  "y3-space-w1-l3": { learningIntention: "I can identify objects using faces, surfaces, edges and vertices.", mechanics: L3_OBJECT_RECOGNITION_MECHANICS },
  "y3-space-w2-l1": { learningIntention: "I can identify an object from a precise feature clue.", mechanics: L3_OBJECT_FEATURES_MECHANICS },
  "y3-space-w2-l2": { learningIntention: "I can compare objects using their key features.", mechanics: L3_OBJECT_FEATURES_MECHANICS },
  "y3-space-w2-l3": { learningIntention: "I can classify objects using one feature rule.", mechanics: L3_OBJECT_FEATURES_MECHANICS },
  "y3-space-w3-l1": { learningIntention: "I can choose the right object for each part.", mechanics: L3_OBJECT_DESIGN_MECHANICS },
  "y3-space-w3-l2": { learningIntention: "I can choose the best object for a job and say why.", mechanics: L3_OBJECT_DESIGN_MECHANICS },
  "y3-space-w3-l3": { learningIntention: "I can choose and justify objects for a design.", mechanics: L3_OBJECT_DESIGN_MECHANICS },
  "y3-space-w4-l1": { learningIntention: "I can use a key to explain what map symbols mean.", mechanics: L3_MAP_READING_MECHANICS },
  "y3-space-w4-l2": { learningIntention: "I can locate landmarks and describe what is near them.", mechanics: L3_MAP_READING_MECHANICS },
  "y3-space-w4-l3": { learningIntention: "I can interpret a map using symbols, positions and clues.", mechanics: L3_MAP_READING_MECHANICS },
  "y3-space-w5-l1": { learningIntention: "I can place landmarks to show a described layout.", mechanics: L3_MAP_CREATION_MECHANICS },
  "y3-space-w5-l2": { learningIntention: "I can create a map from relative position clues.", mechanics: L3_MAP_CREATION_MECHANICS },
  "y3-space-w5-l3": { learningIntention: "I can build a readable map that meets every condition.", mechanics: L3_MAP_CREATION_MECHANICS },
  "y3-space-w6-l1": { learningIntention: "I can follow a route between landmarks.", mechanics: L3_NAVIGATION_MECHANICS },
  "y3-space-w6-l2": { learningIntention: "I can plan a route to a named landmark.", mechanics: L3_NAVIGATION_MECHANICS },
  "y3-space-w6-l3": { learningIntention: "I can locate, route and fix a navigation mission.", mechanics: L3_NAVIGATION_MECHANICS },
  "y3-space-w7-l1": { learningIntention: "I can choose an object and navigate to use it.", mechanics: L3_MISSION_MECHANICS },
  "y3-space-w7-l2": { learningIntention: "I can choose equipment and plan a rescue route.", mechanics: L3_MISSION_MECHANICS },
  "y3-space-w7-l3": { learningIntention: "I can combine object, map and route reasoning.", mechanics: L3_MISSION_MECHANICS },
  "y3-space-w8-l1": { learningIntention: "I can recognise, classify, build and choose 3D objects.", mechanics: L3_GRADUATION_MECHANICS },
  "y3-space-w8-l2": { learningIntention: "I can read, create and navigate maps.", mechanics: L3_GRADUATION_MECHANICS },
  "y3-space-w8-l3": { learningIntention: "I can complete a full Cosmic Navigator mission.", mechanics: L3_GRADUATION_MECHANICS },
};

const IMPLEMENTED_LEVEL_FOUR_LESSONS: Record<
  string,
  { learningIntention: string; mechanics: readonly [string, string, string] }
> = {
  "y4-space-w4-l1": { learningIntention: "I can read a grid reference in both directions.", mechanics: L4_GRID_REFERENCE_MECHANICS },
  "y4-space-w4-l2": { learningIntention: "I can use grid references to find, report and place map features.", mechanics: L4_GRID_REFERENCE_MECHANICS },
  "y4-space-w4-l3": { learningIntention: "I can create and repair a consistent grid reference system.", mechanics: L4_GRID_REFERENCE_MECHANICS },
  "y4-space-w5-l1": { learningIntention: "I can trace movement between referenced cells.", mechanics: L4_GRID_ROUTE_MECHANICS },
  "y4-space-w5-l2": { learningIntention: "I can author precise grid-referenced directions.", mechanics: L4_GRID_ROUTE_MECHANICS },
  "y4-space-w5-l3": { learningIntention: "I can test and improve routes against constraints.", mechanics: L4_GRID_ROUTE_MECHANICS },
  "y4-space-w6-l1": { learningIntention: "I can test corresponding features across a line of symmetry.", mechanics: L4_LINE_SYMMETRY_MECHANICS },
  "y4-space-w6-l2": { learningIntention: "I can complete vertical, horizontal and diagonal reflections.", mechanics: L4_LINE_SYMMETRY_MECHANICS },
  "y4-space-w6-l3": { learningIntention: "I can create and test an original line-symmetric picture.", mechanics: L4_LINE_SYMMETRY_MECHANICS },
  "y4-space-w7-l1": { learningIntention: "I can test a design after a stated rotation about a centre.", mechanics: L4_ROTATION_MECHANICS },
  "y4-space-w7-l2": { learningIntention: "I can test and record which rotations reproduce a design.", mechanics: L4_ROTATION_MECHANICS },
  "y4-space-w7-l3": { learningIntention: "I can create, test and repair a rotationally symmetric pattern.", mechanics: L4_ROTATION_MECHANICS },
  "y4-space-w8-l1": { learningIntention: "I can translate an integrated design brief into testable constraints.", mechanics: L4_INTEGRATION_MECHANICS },
  "y4-space-w8-l2": { learningIntention: "I can build a connected composite, grid and symmetry world.", mechanics: L4_INTEGRATION_MECHANICS },
  "y4-space-w8-l3": { learningIntention: "I can audit and repair a complete spatial design.", mechanics: L4_INTEGRATION_MECHANICS },
};

const L5_NET_W1_MECHANICS = ["net-unfolder", "fold-predictor", "net-reasoning"] as const;
const L5_NET_W2_MECHANICS = ["face-tracker", "fold-simulator", "face-relations"] as const;
const L5_NET_W3_MECHANICS = ["net-builder", "fold-fault-finder", "net-comparer"] as const;
const L5_COORD_W4_MECHANICS = ["coordinate-system-builder", "coordinate-plotter", "coordinate-debugger"] as const;
const L5_COORD_W5_MECHANICS = ["coordinate-mover", "coordinate-command-runner", "coordinate-route-planner"] as const;
const L5_TRANS_W6_MECHANICS = ["point-translation-simulator", "translation-describer", "transform-validator"] as const;
const L5_TRANS_W7_MECHANICS = ["reflection-builder", "rotation-simulator", "transformation-classifier"] as const;
const L5_INTEGRATE_W8_MECHANICS = ["design-constraint-decoder", "coordinate-transform-builder", "spatial-design-auditor"] as const;
const IMPLEMENTED_LEVEL_FIVE_LESSONS: Record<
  string,
  { learningIntention: string; mechanics: readonly [string, string, string] }
> = {
  "y5-space-w1-l1": { learningIntention: "I can fold a net and name the 3D solid it makes.", mechanics: L5_NET_W1_MECHANICS },
  "y5-space-w1-l2": { learningIntention: "I can predict whether a net folds into a cube.", mechanics: L5_NET_W1_MECHANICS },
  "y5-space-w1-l3": { learningIntention: "I can explain why a net folds into a cube.", mechanics: L5_NET_W1_MECHANICS },
  "y5-space-w2-l1": { learningIntention: "I can break a solid's net into its faces and count them.", mechanics: L5_NET_W2_MECHANICS },
  "y5-space-w2-l2": { learningIntention: "I can track a face through a fold and find its opposite.", mechanics: L5_NET_W2_MECHANICS },
  "y5-space-w2-l3": { learningIntention: "I can tell whether two faces end up opposite or adjacent.", mechanics: L5_NET_W2_MECHANICS },
  "y5-space-w3-l1": { learningIntention: "I can fold different nets and name each 3D solid.", mechanics: L5_NET_W3_MECHANICS },
  "y5-space-w3-l2": { learningIntention: "I can build a net that folds into a cube.", mechanics: L5_NET_W3_MECHANICS },
  "y5-space-w3-l3": { learningIntention: "I can test a net for overlaps and gaps.", mechanics: L5_NET_W3_MECHANICS },
  "y5-space-w4-l1": { learningIntention: "I can set up axes and read a coordinate across then up.", mechanics: L5_COORD_W4_MECHANICS },
  "y5-space-w4-l2": { learningIntention: "I can plot points and read their coordinates.", mechanics: L5_COORD_W4_MECHANICS },
  "y5-space-w4-l3": { learningIntention: "I can find and fix a swapped or mis-scaled coordinate.", mechanics: L5_COORD_W4_MECHANICS },
  "y5-space-w5-l1": { learningIntention: "I can move along an axis and say which coordinate changed.", mechanics: L5_COORD_W5_MECHANICS },
  "y5-space-w5-l2": { learningIntention: "I can follow and build coordinate command sequences.", mechanics: L5_COORD_W5_MECHANICS },
  "y5-space-w5-l3": { learningIntention: "I can plan the shortest valid route to a goal.", mechanics: L5_COORD_W5_MECHANICS },
  "y5-space-w6-l1": { learningIntention: "I can translate a figure so every point moves the same.", mechanics: L5_TRANS_W6_MECHANICS },
  "y5-space-w6-l2": { learningIntention: "I can describe a translation using across-and-up movement.", mechanics: L5_TRANS_W6_MECHANICS },
  "y5-space-w6-l3": { learningIntention: "I can check an image against the invariants of a translation.", mechanics: L5_TRANS_W6_MECHANICS },
  "y5-space-w7-l1": { learningIntention: "I can reflect a figure across a mirror line.", mechanics: L5_TRANS_W7_MECHANICS },
  "y5-space-w7-l2": { learningIntention: "I can rotate a figure about a centre by a stated turn.", mechanics: L5_TRANS_W7_MECHANICS },
  "y5-space-w7-l3": { learningIntention: "I can identify a translation, reflection or rotation.", mechanics: L5_TRANS_W7_MECHANICS },
  "y5-space-w8-l1": { learningIntention: "I can read a brief's object, location and movement constraints.", mechanics: L5_INTEGRATE_W8_MECHANICS },
  "y5-space-w8-l2": { learningIntention: "I can build an object, place it and transform it together.", mechanics: L5_INTEGRATE_W8_MECHANICS },
  "y5-space-w8-l3": { learningIntention: "I can test and defend every part of a spatial design.", mechanics: L5_INTEGRATE_W8_MECHANICS },
};

const L6_CROSS_W1_MECHANICS = ["cross-section-slicer", "slice-sequence-viewer", "cross-section-predictor"] as const;
const L6_CROSS_W2_MECHANICS = ["section-prism-classifier", "section-change-grapher", "object-inference"] as const;
const L6_COORD_W3_MECHANICS = ["four-quadrant-builder", "cartesian-plotter", "coordinate-deduction"] as const;
const L6_COORD_W4_MECHANICS = ["coordinate-change-simulator", "axis-crossing-runner", "movement-rule-inference"] as const;
const L6_TRANS_W5_MECHANICS = ["transform-chain-runner", "order-comparison-lab", "transform-sequence-inference"] as const;
const L6_TRANS_W6_MECHANICS = ["tessellation-tester", "pattern-transform-builder", "tessellation-reasoning"] as const;
const L6_TRANS_W7_MECHANICS = ["pattern-rule-detector", "transform-experiment-lab", "pattern-evidence-reasoning"] as const;
const L6_INTEGRATE_W8_MECHANICS = ["multi-representation-analyser", "spatial-model-lab", "evidence-presentation"] as const;

// Level 6 · all 24 lessons: W1-2 cross-sections (SP01), W3-4 four-quadrant
// coordinates (SP02), W5-7 transformations + tessellations (SP03), W8 integration.
const IMPLEMENTED_LEVEL_SIX_LESSONS: Record<
  string,
  { learningIntention: string; mechanics: readonly [string, string, string] }
> = {
  "y6-space-w1-l1": { learningIntention: "I can slice an object and name its cross-section.", mechanics: L6_CROSS_W1_MECHANICS },
  "y6-space-w1-l2": { learningIntention: "I can compare parallel slices and see whether they stay the same.", mechanics: L6_CROSS_W1_MECHANICS },
  "y6-space-w1-l3": { learningIntention: "I can predict a cross-section from an object's base.", mechanics: L6_CROSS_W1_MECHANICS },
  "y6-space-w2-l1": { learningIntention: "I can use cross-sections to decide whether an object is a prism.", mechanics: L6_CROSS_W2_MECHANICS },
  "y6-space-w2-l2": { learningIntention: "I can classify cross-sections as constant or shrinking.", mechanics: L6_CROSS_W2_MECHANICS },
  "y6-space-w2-l3": { learningIntention: "I can explain an object's structure from its cross-sections.", mechanics: L6_CROSS_W2_MECHANICS },
  "y6-space-w3-l1": { learningIntention: "I can plot and read points with negative coordinates.", mechanics: L6_COORD_W3_MECHANICS },
  "y6-space-w3-l2": { learningIntention: "I can plot ordered pairs in all four quadrants.", mechanics: L6_COORD_W3_MECHANICS },
  "y6-space-w3-l3": { learningIntention: "I can name a point's quadrant from the signs of its coordinates.", mechanics: L6_COORD_W3_MECHANICS },
  "y6-space-w4-l1": { learningIntention: "I can say which coordinate changes when a point moves along an axis.", mechanics: L6_COORD_W4_MECHANICS },
  "y6-space-w4-l2": { learningIntention: "I can move a point across an axis and flip a coordinate's sign.", mechanics: L6_COORD_W4_MECHANICS },
  "y6-space-w4-l3": { learningIntention: "I can describe the move that takes a point to its image.", mechanics: L6_COORD_W4_MECHANICS },
  "y6-space-w5-l1": { learningIntention: "I can apply two transformations in order and find the result.", mechanics: L6_TRANS_W5_MECHANICS },
  "y6-space-w5-l2": { learningIntention: "I can decide whether the order of two transformations changes the result.", mechanics: L6_TRANS_W5_MECHANICS },
  "y6-space-w5-l3": { learningIntention: "I can work out the sequence of transformations from an image.", mechanics: L6_TRANS_W5_MECHANICS },
  "y6-space-w6-l1": { learningIntention: "I can decide whether a shape tessellates.", mechanics: L6_TRANS_W6_MECHANICS },
  "y6-space-w6-l2": { learningIntention: "I can name the transformation rule that makes a tessellation.", mechanics: L6_TRANS_W6_MECHANICS },
  "y6-space-w6-l3": { learningIntention: "I can explain why tiles fit using angles at a corner.", mechanics: L6_TRANS_W6_MECHANICS },
  "y6-space-w7-l1": { learningIntention: "I can notice the transformation rule in a pattern.", mechanics: L6_TRANS_W7_MECHANICS },
  "y6-space-w7-l2": { learningIntention: "I can predict how changing a transformation changes a pattern.", mechanics: L6_TRANS_W7_MECHANICS },
  "y6-space-w7-l3": { learningIntention: "I can justify a tessellation with evidence.", mechanics: L6_TRANS_W7_MECHANICS },
  "y6-space-w8-l1": { learningIntention: "I can interpret an object, a coordinate and a pattern together.", mechanics: L6_INTEGRATE_W8_MECHANICS },
  "y6-space-w8-l2": { learningIntention: "I can build a model across object, coordinate and transformation.", mechanics: L6_INTEGRATE_W8_MECHANICS },
  "y6-space-w8-l3": { learningIntention: "I can defend a spatial model with evidence from every strand.", mechanics: L6_INTEGRATE_W8_MECHANICS },
};

function buildLevel(definition: LevelDefinition): StarpathLevelProgram {
  const weeks = definition.weeks.map((week, index): StarpathWeekPlan => {
    const weekNumber = index + 1;
    const lessons = week.lessons.map(([title, focus], lessonIndex): StarpathLessonPlan => {
      const lessonId = `${definition.prefix}-space-w${weekNumber}-l${lessonIndex + 1}`;
      const implemented =
        IMPLEMENTED_GROUND_LESSONS[lessonId] ??
        IMPLEMENTED_LEVEL_ONE_LESSONS[lessonId] ??
        IMPLEMENTED_LEVEL_TWO_LESSONS[lessonId] ??
        IMPLEMENTED_LEVEL_THREE_LESSONS[lessonId] ??
        IMPLEMENTED_LEVEL_FOUR_LESSONS[lessonId] ??
        IMPLEMENTED_LEVEL_FIVE_LESSONS[lessonId] ??
        IMPLEMENTED_LEVEL_SIX_LESSONS[lessonId];
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
      quiz: weekNumber === 8 ? null : {
        id: `${definition.prefix}-space-w${weekNumber}-quiz`,
        coverage: week.quiz,
        questionCount: STARPATH_QUIZ_QUESTIONS_PER_LESSON * STARPATH_LESSONS_PER_WEEK as 15,
        status: definition.prefix === "ground" || definition.prefix === "y1" || definition.prefix === "y2" || (definition.prefix === "y3" && weekNumber < 8) || definition.prefix === "y4" || definition.prefix === "y5" || definition.prefix === "y6"
          ? "implemented"
          : STARPATH_PROGRAM_STATUS,
      },
      status: definition.prefix === "ground" || definition.prefix === "y2" || definition.prefix === "y3" || definition.prefix === "y4" || definition.prefix === "y5" || definition.prefix === "y6" ? "implemented" : STARPATH_PROGRAM_STATUS,
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
    skills: definition.weeks.map((week, index) => ({
      ...week.skill,
      level: definition.level,
      weeks: [index + 1],
      status: definition.prefix === "ground" || definition.prefix === "y2" || definition.prefix === "y3" || definition.prefix === "y4" || definition.prefix === "y5" || definition.prefix === "y6" ? "implemented" : STARPATH_PROGRAM_STATUS,
    })),
    weeks,
    assessments: {
      preTest: definition.level === "ground" ? null : { id: `${definition.prefix}-space-pre-01`, questionCount: STARPATH_ASSESSMENT_QUESTION_COUNT, status: definition.prefix === "y1" || definition.prefix === "y2" || definition.prefix === "y4" || definition.prefix === "y5" || definition.prefix === "y6" ? "implemented" : STARPATH_PROGRAM_STATUS },
      postTest: { id: `${definition.prefix}-space-post-01`, questionCount: STARPATH_ASSESSMENT_QUESTION_COUNT, unlockAfterLessonId: `${definition.prefix}-space-w8-l3`, status: definition.prefix === "ground" || definition.prefix === "y1" || definition.prefix === "y2" || definition.prefix === "y3" || definition.prefix === "y4" || definition.prefix === "y5" || definition.prefix === "y6" ? "implemented" : STARPATH_PROGRAM_STATUS },
    },
    status: definition.prefix === "ground" || definition.prefix === "y2" || definition.prefix === "y3" || definition.prefix === "y4" || definition.prefix === "y5" || definition.prefix === "y6" ? "implemented" : STARPATH_PROGRAM_STATUS,
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
