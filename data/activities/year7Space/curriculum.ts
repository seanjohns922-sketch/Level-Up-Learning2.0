import type {WeekPlan} from "@/data/programs/year1";
const SPACE7_SOURCE_WEEKS = [
 {
  "title": "Nets and solid objects",
  "code": "AC9M7SP01",
  "lessons": [
   [
    "Recognise cube nets",
    "identify nets that fold to a cube",
    "A cube net has six connected squares which fold to six different faces without overlap.",
    "Six squares alone do not guarantee a valid cube net."
   ],
   [
    "Track faces when folding",
    "reason about adjacent and opposite cube faces",
    "Opposite faces end on opposite sides of the folded cube; trace the folds rather than relying on distance in the flat net.",
    "Squares separated in the drawing can meet after folding."
   ],
   [
    "Represent prisms with nets",
    "connect prism faces to their nets",
    "A prism has two matching end faces and one side face for every edge of an end.",
    "A pyramid has one base and triangular sides, not two matching ends."
   ]
  ]
 },
 {
  "title": "Read plans and views",
  "code": "AC9M7SP01",
  "lessons": [
   [
    "Read a footprint",
    "interpret a top view of stacks of cubes",
    "A footprint shows occupied ground positions. A height plan also records the number of cubes in each stack.",
    "A footprint does not tell you the height of a stack."
   ],
   [
    "Infer a front view",
    "find front-view heights from a plan",
    "Looking from the marked front, the tallest stack in each column determines the visible height.",
    "Do not add stacks behind one another to find a front-view height."
   ],
   [
    "Infer a side view",
    "find side-view heights from a plan",
    "A side view uses the tallest stack across each row. Keep the plan’s front and back directions fixed.",
    "A side view and a front view may group stacks differently."
   ]
  ]
 },
 {
  "title": "Choose useful representations",
  "code": "AC9M7SP01",
  "lessons": [
   [
    "Reconstruct a cube model",
    "use a height plan to determine cubes in a model",
    "Add the heights of all occupied columns to count the unit cubes, including cubes hidden from view.",
    "Counting only visible faces is not counting cubes."
   ],
   [
    "Identify missing information",
    "explain what a view does and does not reveal",
    "Different objects can have the same footprint or silhouette. Additional heights or views can remove ambiguity.",
    "A single view does not always determine an object uniquely."
   ],
   [
    "Choose a representation",
    "justify a representation for a practical purpose",
    "A net shows connected faces, a height plan records stacks, and an isometric view helps show the overall form.",
    "Choose according to the information needed, not the most attractive picture."
   ]
  ]
 },
 {
  "title": "Classify triangles",
  "code": "AC9M7SP02",
  "lessons": [
   [
    "Classify by side lengths",
    "distinguish equilateral, isosceles and scalene triangles",
    "Equal-side markings and lengths are evidence. In this sorter, isosceles means exactly two equal sides.",
    "A rotated triangle keeps the same side properties."
   ],
   [
    "Classify by angle properties",
    "classify triangles as acute, right-angled or obtuse",
    "An acute triangle has three acute angles; a right triangle has one right angle; an obtuse triangle has one obtuse angle.",
    "One acute angle alone does not make an acute triangle."
   ],
   [
    "Test possible triangles",
    "use the triangle inequality to test three lengths",
    "The sum of the two shorter sides must be greater than the longest side to enclose a triangle.",
    "Equality creates a straight line, not a triangle."
   ]
  ]
 },
 {
  "title": "Quadrilateral families",
  "code": "AC9M7SP02",
  "lessons": [
   [
    "Connect quadrilateral properties",
    "reason about rectangles, rhombuses and parallelograms",
    "A parallelogram has two pairs of parallel opposite sides. Rectangles add four right angles; rhombuses add four equal sides.",
    "Opposite equal sides do not imply all four sides are equal."
   ],
   [
    "Place squares in families",
    "explain why squares belong to several shape families",
    "A square is both a rectangle and a rhombus, so it is also a parallelogram.",
    "The most specific name does not erase broader family membership."
   ],
   [
    "Compare kites and trapeziums",
    "classify using adjacent equal sides and parallel sides",
    "State the definitions before sorting. Here a trapezium has exactly one pair of parallel sides, and a kite has two pairs of equal adjacent sides.",
    "Inclusive and exclusive definitions must not be silently mixed."
   ]
  ]
 },
 {
  "title": "Polygon relationships",
  "code": "AC9M7SP02",
  "lessons": [
   [
    "Test regularity",
    "use both side and angle conditions for regular polygons",
    "A regular polygon has all sides equal and all interior angles equal. Both conditions are needed.",
    "An equal-sided rhombus need not be regular."
   ],
   [
    "Distinguish concave and convex",
    "classify a polygon using its interior angles",
    "A simple polygon is concave if at least one interior angle exceeds 180 degrees; otherwise it is convex.",
    "A polygon with an inward dent is not regular."
   ],
   [
    "Reason about family claims",
    "use counterexamples to check polygon-family statements",
    "One valid counterexample disproves an always claim; a few supporting examples do not prove it.",
    "Use defining properties rather than the orientation of the drawing."
   ]
  ]
 },
 {
  "title": "Translations on the plane",
  "code": "AC9M7SP03",
  "lessons": [
   [
    "Translate a point",
    "apply a horizontal and vertical translation to a coordinate",
    "Add the horizontal change to x and the vertical change to y.",
    "Moving down decreases y; it does not change x."
   ],
   [
    "Translate a whole shape",
    "apply the same translation to every vertex",
    "Every vertex moves by the same vector, preserving lengths and angles.",
    "Moving only one vertex changes the shape."
   ],
   [
    "Describe a translation",
    "find a translation vector from a point and its image",
    "Subtract the original coordinates from the image coordinates.",
    "Keep the direction from original to image consistent."
   ]
  ]
 },
 {
  "title": "Reflections on the plane",
  "code": "AC9M7SP03",
  "lessons": [
   [
    "Reflect in the x-axis",
    "reflect coordinates across the horizontal axis",
    "Reflection in the x-axis keeps x and changes the sign of y.",
    "The distance from the axis stays the same."
   ],
   [
    "Reflect in the y-axis",
    "reflect coordinates across the vertical axis",
    "Reflection in the y-axis changes the sign of x and keeps y.",
    "The axis name is not the coordinate whose sign changes."
   ],
   [
    "Combine parallel reflections",
    "describe two reflections in parallel vertical lines",
    "Reflecting in x = a sends x to 2a − x. Two parallel reflections produce a translation twice the directed gap between the lines.",
    "Reversing the order reverses the translation direction."
   ]
  ]
 },
 {
  "title": "Rotations and combinations",
  "code": "AC9M7SP03",
  "lessons": [
   [
    "Rotate about the origin",
    "rotate a point through a specified angle and direction",
    "A 90-degree clockwise turn maps (x,y) to (y,−x); a 180-degree turn maps it to (−x,−y).",
    "State the centre, angle and direction."
   ],
   [
    "Rotate about a given centre",
    "rotate points relative to a centre other than the origin",
    "Subtract the centre, rotate the relative coordinates, then add the centre back.",
    "Rotating about the origin gives a different result when the centre is elsewhere."
   ],
   [
    "Compare transformation sequences",
    "reason about the order and equivalence of transformations",
    "Apply each operation to the current image. Changing the order can change the final position.",
    "Do not apply each operation separately to the original point."
   ]
  ]
 },
 {
  "title": "Trace and repair classifiers",
  "code": "AC9M7SP04",
  "lessons": [
   [
    "Trace a triangle sorter",
    "follow decisions to classify a triangle",
    "Evaluate each condition in order and follow exactly one branch at every decision. Here isosceles means exactly two equal sides.",
    "Do not skip an earlier condition just because a later one looks familiar."
   ],
   [
    "Choose a decision rule",
    "choose a condition which sends the intended shapes down each branch",
    "A useful decision question separates the intended categories using a defining property.",
    "A condition can be too broad even if some examples work."
   ],
   [
    "Separate overlapping families",
    "design a tree that distinguishes squares, rectangles and rhombuses",
    "Test both right angles and equal sides to separate overlapping families into exclusive output groups.",
    "Testing for rectangles first and stopping can hide all squares."
   ]
  ]
 },
 {
  "title": "Build and test algorithms",
  "code": "AC9M7SP04",
  "lessons": [
   [
    "Sort polygon attributes",
    "combine decisions about concavity and regularity",
    "Check for an inward angle first, then test both equal sides and equal angles on the convex branch.",
    "Equal sides alone are not enough for regularity."
   ],
   [
    "Find a counterexample",
    "test a classifier with a shape that exposes an incorrect branch",
    "Trace a carefully chosen boundary case through the algorithm and compare its output with the definition.",
    "A counterexample must actually reach the faulty output."
   ],
   [
    "Complete a classification algorithm",
    "select steps that classify every intended shape group",
    "Specify the input set, test distinguishing properties and ensure every branch ends at a valid output.",
    "Leaving out a branch makes the algorithm incomplete."
   ]
  ]
 },
 {
  "title": "Spatial reasoning expedition",
  "code": "AC9M7SP04",
  "lessons": [
   [
    "Classify before and after a move",
    "explain which classification properties survive transformations",
    "Translations, reflections and rotations preserve side lengths, angle sizes and regularity.",
    "Position and orientation can change while shape classification stays the same."
   ],
   [
    "Compare decision trees",
    "explain how different decision orders can give the same outputs",
    "Two algorithms can test properties in different orders yet classify every input consistently.",
    "Compare all input categories, not just one example."
   ],
   [
    "Justify a complete classifier",
    "design and justify a classifier with clear definitions",
    "A complete classifier uses explicit definitions, covers every input, and survives tests with boundary cases.",
    "Check a square, a non-square rectangle, a non-square rhombus and a general quadrilateral."
   ]
  ]
 }
] as const;

// Every original skill is retained; related skills now share a lesson.
export const SPACE7_SKILL_GROUPS = [
 [[1],[2],[3]], [[4],[5],[6]], [[7],[8],[9]],
 [[10,11],[12],[13]], [[14,15],[16],[17,18]],
 [[19],[20],[21]], [[22,23],[24],[27]], [[25],[26],[34]],
 [[28],[29],[30]], [[31],[32,33],[35,36]],
];
// Bump whenever lesson content changes so saved resume snapshots are discarded.
export const SPACE7_READABILITY_REVISION = 2;
export function space7SourceGuide(key:number){const w=SPACE7_SOURCE_WEEKS[Math.floor((key-1)/3)],l=w.lessons[(key-1)%3];return {title:l[0],goal:l[1],idea:l[2],caution:l[3],code:w.code};}
const titles=['Nets and solid objects','Read plans and views','Choose useful representations','Triangles and quadrilateral properties','Polygon families and relationships','Translations on the plane','Reflections and transformation order','Rotations and preserved properties','Trace and repair classifiers','Create and justify classifiers'];
export const SPACE7_WEEKS=SPACE7_SKILL_GROUPS.map((groups,i)=>({title:titles[i],code:space7SourceGuide(groups[0][0]).code,lessons:groups.map(keys=>{const gs=keys.map(space7SourceGuide);return [gs.map(g=>g.title).join(' and '),gs.map(g=>g.goal).join('; '),gs.map(g=>g.idea).join(' '),gs.map(g=>g.caution).join(' ')] as const;})}));
export function space7Guide(week:number,lesson:number){const w=SPACE7_WEEKS[week-1],l=w?.lessons[lesson-1];return l?{title:l[0],goal:l[1],idea:l[2],caution:l[3],code:w.code}:undefined;}
export const SPACE7_PROGRAM:WeekPlan[]=SPACE7_WEEKS.map((w,i)=>({id:`y7-space-w${i+1}`,week:i+1,topic:w.title,curriculum:[w.code],lessons:w.lessons.map((l,j)=>({id:`y7-space-w${i+1}-l${j+1}`,week:i+1,lesson:j+1,title:l[0],focus:l[1],config:{teacherPreviewHref:`/demo-review/shattered-realms/space/lesson?realm_id=space&year=Year%207&week=${i+1}&lessonId=y7-space-w${i+1}-l${j+1}&expedition=1&teacher_preview=1&review=1`},curriculum:[...new Set(SPACE7_SKILL_GROUPS[i][j].map(key=>space7SourceGuide(key).code))],activityIdeas:[l[1],'justify my answer using the given spatial properties'],quizSafe:true,activities:['fast_thinking','reasoning','apply_create'].map(role=>({activityType:'multiple_choice' as const,weight:role==='fast_thinking'?4:1,config:{rotationRole:role,mode:`space7_v2_w${i+1}_l${j+1}_${role}`}}))}))}));
