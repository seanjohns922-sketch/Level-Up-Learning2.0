import { ASSESSMENT_FORMS, ASSESSMENT_DESIGN_VERSION, type DesignedForm } from "../../design/assessmentContract";
import { NUMBER_SLOTS } from "../../design/number";

/** Authoring specifications, not live Question objects. Renderer and persistence
 * integration are release gates; do not feed these directly into the live API. */
export type Year1NumberTask =
  | {kind:"build-tens";target:number;standard:boolean}
  | {kind:"order";cards:number[]}
  | {kind:"number-line";min:100;max:120;step:1;target:number}
  | {kind:"two-partitions";small:number;large:number;exchangeTens:1}
  | {kind:"count-tens";groups:12;perGroup:10}
  | {kind:"make-groups";total:number;groupSize:5}
  | {kind:"add";left:number;right:number}
  | {kind:"subtract";whole:number;removed:number}
  | {kind:"missing-part";whole:number;known:number;reasonChoices:string[]}
  | {kind:"addition-story";initial:number;arrive:number;objects:string}
  | {kind:"subtraction-story";initial:number;leave:number;objects:string}
  | {kind:"money";wallet:number[];price:number;object:string}
  | {kind:"share";total:number;recipients:3;objects:string}
  | {kind:"group";total:number;size:3;objects:string}
  | {kind:"unequal-share";groups:[number,number,number];reasonChoices:string[]}
  | {kind:"skip-two";terms:(number|null)[]}
  | {kind:"create-tens";start:number;stages:3}
  | {kind:"continue-pattern";unit:[string,string,string];repetitions:2;blanks:3}
  | {kind:"create-pattern";unit:[string,string,string];repetitions:3};

type Five<T> = readonly [T,T,T,T,T];
type AuthoredRow = {
  visual: string;
  rubric: string;
  prompts: Five<string>;
  tasks: Five<Year1NumberTask>;
};
const same=(text:string): Five<string> => [text,text,text,text,text];
const subtractionReasons=["Take the known part from the whole.","Add the whole and the known part.","Use the whole as the missing part."];
const sharingReasons=["Every tray must have the same number.","There are three trays, so it is equal.","Only the total matters, not each tray."];
export const YEAR1_NUMBER_AUTHORING_ROWS: readonly AuthoredRow[] = [
  {
    visual:"Editable tens rods made of ten visibly joined equal squares and separate ones. Blank labelled mat. Same controls and supply limits across forms; no target model.",
    rubric:"Exactly 11 tens and the requested ones. Save both counts; do not accept digit concatenation as construction evidence.",
    prompts:["Build 111 with tens and ones.","Build 114 with tens and ones.","Build 112 with tens and ones.","Build 115 with tens and ones.","Build 113 with tens and ones."],
    tasks:[{kind:"build-tens",target:111,standard:true},{kind:"build-tens",target:114,standard:true},{kind:"build-tens",target:112,standard:true},{kind:"build-tens",target:115,standard:true},{kind:"build-tens",target:113,standard:true}],
  },
  {
    visual:"Four unsorted numeral cards and an empty ordered row. Include one value below 100, then 100, 110 and 120 in every form. No visual length cues.",
    rubric:"All four numerals in ascending order. Save card order; numeric gaps vary slightly within the same boundary-crossing task.",
    prompts:same("Put the numbers in order. Smallest first."),
    tasks:[{kind:"order",cards:[120,96,110,100]},{kind:"order",cards:[100,120,97,110]},{kind:"order",cards:[110,98,100,120]},{kind:"order",cards:[99,120,110,100]},{kind:"order",cards:[110,100,120,95]}],
  },
  {
    visual:"Horizontal 100–120 line with 21 evenly spaced ticks and labels at 100, 110, 120. Tap-to-place marker starts absent. Targets all inside the final decade.",
    rubric:"Marker on the exact target tick. Save tick value and number-line scale; no freehand-pixel penalty.",
    prompts:["Mark 114 on the number line.","Mark 117 on the number line.","Mark 113 on the number line.","Mark 116 on the number line.","Mark 118 on the number line."],
    tasks:[{kind:"number-line",min:100,max:120,step:1,target:114},{kind:"number-line",min:100,max:120,step:1,target:117},{kind:"number-line",min:100,max:120,step:1,target:113},{kind:"number-line",min:100,max:120,step:1,target:116},{kind:"number-line",min:100,max:120,step:1,target:118}],
  },
  {
    visual:"Blank Tens and Ones mats with movable rods and unit squares. No hundred block and no pre-filled model.",
    rubric:"Standard tens/ones partition with fewer than ten ones; model value equals the requested number.",
    prompts:["Show 34 as tens and ones.","Show 37 as tens and ones.","Show 35 as tens and ones.","Show 38 as tens and ones.","Show 36 as tens and ones."],
    tasks:[{kind:"build-tens",target:34,standard:true},{kind:"build-tens",target:37,standard:true},{kind:"build-tens",target:35,standard:true},{kind:"build-tens",target:38,standard:true},{kind:"build-tens",target:36,standard:true}],
  },
  {
    visual:"Two explicitly separated parts: a small collection with two empty trays, then a standard tens/ones model and a blank alternative model. Exchange control conserves value; no correct alternative shown.",
    rubric:"Part A: two nonempty groups conserving the small total. Part B: exactly one fewer ten and ten more ones than the standard partition. Both parts required for one point. Accept every valid small partition.",
    prompts:["Split 7 into two parts. Then show 34 with one fewer ten.","Split 8 into two parts. Then show 37 with one fewer ten.","Split 9 into two parts. Then show 35 with one fewer ten.","Split 7 into two parts. Then show 38 with one fewer ten.","Split 8 into two parts. Then show 36 with one fewer ten."],
    tasks:[{kind:"two-partitions",small:7,large:34,exchangeTens:1},{kind:"two-partitions",small:8,large:37,exchangeTens:1},{kind:"two-partitions",small:9,large:35,exchangeTens:1},{kind:"two-partitions",small:7,large:38,exchangeTens:1},{kind:"two-partitions",small:8,large:36,exchangeTens:1}],
  },
  {
    visual:"Twelve visible ten-object bundles arranged in three rows of four. Every bundle visibly contains ten equal objects. No printed group count or total; materials differ by form, same layout density.",
    rubric:"Exact quantity 120. An entered number demonstrates quantification of grouped objects, not an observed counting strategy.",
    prompts:same("How many objects altogether?"),
    tasks:[{kind:"count-tens",groups:12,perGroup:10},{kind:"count-tens",groups:12,perGroup:10},{kind:"count-tens",groups:12,perGroup:10},{kind:"count-tens",groups:12,perGroup:10},{kind:"count-tens",groups:12,perGroup:10}],
  },
  {
    visual:"Ungrouped countable objects, empty group workspace and total field. Child creates groups; do not pre-draw the correct number of groups. Support multi-select to avoid grading motor endurance.",
    rubric:"All objects conserved in groups of five, plus exact entered total. Save group membership and total. Actual grouping must be submitted, not just a numeric answer.",
    prompts:same("Make groups of 5. How many objects altogether?"),
    tasks:[{kind:"make-groups",total:20,groupSize:5},{kind:"make-groups",total:25,groupSize:5},{kind:"make-groups",total:30,groupSize:5},{kind:"make-groups",total:25,groupSize:5},{kind:"make-groups",total:20,groupSize:5}],
  },
  {
    visual:"Clear addition expression with optional blank two-ten-frame workspace and counters. No completed groups or make-ten step. Same optional tools across forms.",
    rubric:"Exact sum. All examples cross ten, use two single-digit addends, and stay within 20. Strategy is available, not asserted from the answer.",
    prompts:["What is 8 + 5?","What is 9 + 5?","What is 8 + 6?","What is 7 + 5?","What is 9 + 6?"],
    tasks:[{kind:"add",left:8,right:5},{kind:"add",left:9,right:5},{kind:"add",left:8,right:6},{kind:"add",left:7,right:5},{kind:"add",left:9,right:6}],
  },
  {
    visual:"Clear subtraction expression, optional blank two-ten-frame workspace and counters. No crossed-out answer model or worked intermediate step.",
    rubric:"Exact difference. All examples subtract a single digit from a teen, crossing ten and leaving a single-digit result.",
    prompts:["What is 14 − 6?","What is 15 − 7?","What is 13 − 6?","What is 16 − 8?","What is 14 − 7?"],
    tasks:[{kind:"subtract",whole:14,removed:6},{kind:"subtract",whole:15,removed:7},{kind:"subtract",whole:13,removed:6},{kind:"subtract",whole:16,removed:8},{kind:"subtract",whole:14,removed:7}],
  },
  {
    visual:"Whole/known-part/blank-part model with labelled quantities; number response and neutral read-aloud reason choices. Rotate reason order without changing distractors.",
    rubric:"Correct missing part and inverse/whole-minus-known reason. A correct numeral with an additive misconception does not pass.",
    prompts:["The whole is 13. One part is 8. Find the missing part and explain.","The whole is 14. One part is 9. Find the missing part and explain.","The whole is 15. One part is 8. Find the missing part and explain.","The whole is 12. One part is 7. Find the missing part and explain.","The whole is 14. One part is 8. Find the missing part and explain."],
    tasks:[{kind:"missing-part",whole:13,known:8,reasonChoices:subtractionReasons},{kind:"missing-part",whole:14,known:9,reasonChoices:[subtractionReasons[1],subtractionReasons[0],subtractionReasons[2]]},{kind:"missing-part",whole:15,known:8,reasonChoices:[subtractionReasons[2],subtractionReasons[1],subtractionReasons[0]]},{kind:"missing-part",whole:12,known:7,reasonChoices:[subtractionReasons[2],subtractionReasons[0],subtractionReasons[1]]},{kind:"missing-part",whole:14,known:8,reasonChoices:[subtractionReasons[0],subtractionReasons[2],subtractionReasons[1]]}],
  },
  {
    visual:"Familiar scene labelled Here and Arriving, with blank modelling space and more objects than the required result. No displayed plus sign or final collection. Child creates the two source groups and result.",
    rubric:"Model shows both stated quantities and correct combined total; entered result matches. Object origin/grouping retained. No correct result-only shortcut.",
    prompts:["8 birds are here. 4 arrive. Show how many birds there are now.","9 frogs are here. 4 arrive. Show how many frogs there are now.","7 ducks are here. 5 arrive. Show how many ducks there are now.","8 cars are here. 5 arrive. Show how many cars there are now.","9 boats are here. 5 arrive. Show how many boats there are now."],
    tasks:[{kind:"addition-story",initial:8,arrive:4,objects:"birds"},{kind:"addition-story",initial:9,arrive:4,objects:"frogs"},{kind:"addition-story",initial:7,arrive:5,objects:"ducks"},{kind:"addition-story",initial:8,arrive:5,objects:"cars"},{kind:"addition-story",initial:9,arrive:5,objects:"boats"}],
  },
  {
    visual:"Scene with starting collection and empty Away area. Child moves the departing objects and enters the remainder. All objects remain inspectable, with no automatic correct removal.",
    rubric:"Original collection conserved across Here/Away; exactly the stated departures and correct remaining numeral. All cases cross ten.",
    prompts:["14 birds are here. 5 leave. Show how many birds stay.","15 frogs are here. 6 leave. Show how many frogs stay.","13 ducks are here. 5 leave. Show how many ducks stay.","16 cars are here. 7 leave. Show how many cars stay.","14 boats are here. 6 leave. Show how many boats stay."],
    tasks:[{kind:"subtraction-story",initial:14,leave:5,objects:"birds"},{kind:"subtraction-story",initial:15,leave:6,objects:"frogs"},{kind:"subtraction-story",initial:13,leave:5,objects:"ducks"},{kind:"subtraction-story",initial:16,leave:7,objects:"cars"},{kind:"subtraction-story",initial:14,leave:6,objects:"boats"}],
  },
  {
    visual:"Whole-dollar price tag and wallet of authentic Australian $1 and $2 coin representations with readable denominations, distinguishable sizes, paid/kept areas. Do not invent $3/$4 coins or imply coins are identical units.",
    rubric:"Choose available coins that pay exactly the price, retain every other coin and enter correct dollars left. Accept all valid coin combinations; no change-making required.",
    prompts:["You have $9. A pen costs $5. Pay exactly. How many dollars remain?","You have $11. A book costs $7. Pay exactly. How many dollars remain?","You have $13. A ball costs $9. Pay exactly. How many dollars remain?","You have $11. A toy costs $5. Pay exactly. How many dollars remain?","You have $13. A brush costs $7. Pay exactly. How many dollars remain?"],
    tasks:[{kind:"money",wallet:[2,1,2,2,2],price:5,object:"pen"},{kind:"money",wallet:[2,2,1,2,2,2],price:7,object:"book"},{kind:"money",wallet:[2,2,2,1,2,2,2],price:9,object:"ball"},{kind:"money",wallet:[2,2,2,2,1,2],price:5,object:"toy"},{kind:"money",wallet:[2,1,2,2,2,2,2],price:7,object:"brush"}],
  },
  {
    visual:"Three equal recipient mats and an unallocated collection. No objects pre-shared or count labels revealing share size. Same tap and multi-select controls.",
    rubric:"All original objects allocated equally to three recipients and exact each-share numeral. Save allocations and entered share; no remainder.",
    prompts:["Share 12 shells equally between 3 children. How many does each get?","Share 15 beads equally between 3 children. How many does each get?","Share 18 cards equally between 3 children. How many does each get?","Share 15 buttons equally between 3 children. How many does each get?","Share 12 leaves equally between 3 children. How many does each get?"],
    tasks:[{kind:"share",total:12,recipients:3,objects:"shells"},{kind:"share",total:15,recipients:3,objects:"beads"},{kind:"share",total:18,recipients:3,objects:"cards"},{kind:"share",total:15,recipients:3,objects:"buttons"},{kind:"share",total:12,recipients:3,objects:"leaves"}],
  },
  {
    visual:"Ungrouped objects and add-group control; no prebuilt number of trays. Child forms complete groups of three and enters how many groups.",
    rubric:"All objects conserved, each nonempty group has three, entered group count equals constructed group count. Save memberships, not just a quotient.",
    prompts:["Pack 12 shells in groups of 3. How many groups?","Pack 15 beads in groups of 3. How many groups?","Pack 18 cards in groups of 3. How many groups?","Pack 15 buttons in groups of 3. How many groups?","Pack 12 leaves in groups of 3. How many groups?"],
    tasks:[{kind:"group",total:12,size:3,objects:"shells"},{kind:"group",total:15,size:3,objects:"beads"},{kind:"group",total:18,size:3,objects:"cards"},{kind:"group",total:15,size:3,objects:"buttons"},{kind:"group",total:12,size:3,objects:"leaves"}],
  },
  {
    visual:"Three equally sized trays displaying a fixed unequal allocation. Yes/No and reason choices with neutral audio. Every example is repairable by moving one object.",
    rubric:"No, supported by the unequal per-tray quantities/equal-sharing criterion. Total conservation alone is not sufficient. Require choice and reason.",
    prompts:same("Is this sharing equal? Choose why."),
    tasks:[{kind:"unequal-share",groups:[5,3,4],reasonChoices:sharingReasons},{kind:"unequal-share",groups:[4,5,6],reasonChoices:[sharingReasons[1],sharingReasons[0],sharingReasons[2]]},{kind:"unequal-share",groups:[6,7,5],reasonChoices:[sharingReasons[2],sharingReasons[1],sharingReasons[0]]},{kind:"unequal-share",groups:[6,5,4],reasonChoices:[sharingReasons[2],sharingReasons[0],sharingReasons[1]]},{kind:"unequal-share",groups:[3,4,5],reasonChoices:[sharingReasons[0],sharingReasons[2],sharingReasons[1]]}],
  },
  {
    visual:"Five number cards with the fourth and fifth blank. First three numbers imply a step of two; do not print that rule in the question.",
    rubric:"Both missing values correctly continue the constant step. All starting values even; no odd/even offset mismatch across forms.",
    prompts:same("Fill both empty spaces."),
    tasks:[{kind:"skip-two",terms:[12,14,16,null,null]},{kind:"skip-two",terms:[14,16,18,null,null]},{kind:"skip-two",terms:[16,18,20,null,null]},{kind:"skip-two",terms:[18,20,22,null,null]},{kind:"skip-two",terms:[10,12,14,null,null]}],
  },
  {
    visual:"Three empty stage panels, each with tens-bundle and ones tools plus a numeral field. Starting number and +10 instruction supplied. No completed quantities. Use tens bundles, not dozens of required single-object clicks.",
    rubric:"Build and label three stages: start, start+10, start+20. Every stage's model and numeral agree. This creates a growing sequence, not a repeating picture.",
    prompts:["Start at 20. Add 10 each time. Build and label three steps.","Start at 30. Add 10 each time. Build and label three steps.","Start at 40. Add 10 each time. Build and label three steps.","Start at 50. Add 10 each time. Build and label three steps.","Start at 60. Add 10 each time. Build and label three steps."],
    tasks:[{kind:"create-tens",start:20,stages:3},{kind:"create-tens",start:30,stages:3},{kind:"create-tens",start:40,stages:3},{kind:"create-tens",start:50,stages:3},{kind:"create-tens",start:60,stages:3}],
  },
  {
    visual:"Two complete ABC units, then three blank continuation positions. Three symbols vary in shape and colour, with independent text/audio labels. Child also constructs the shortest unit in a separate blank strip.",
    rubric:"Correct shortest three-symbol unit and all three next symbols. Neither colour alone nor correct continuation without unit identification is enough.",
    prompts:same("Show the repeating part. Then build the next three shapes."),
    tasks:[{kind:"continue-pattern",unit:["blue-circle","gold-square","red-triangle"],repetitions:2,blanks:3},{kind:"continue-pattern",unit:["red-square","blue-triangle","gold-circle"],repetitions:2,blanks:3},{kind:"continue-pattern",unit:["gold-triangle","red-circle","blue-square"],repetitions:2,blanks:3},{kind:"continue-pattern",unit:["blue-square","gold-circle","red-triangle"],repetitions:2,blanks:3},{kind:"continue-pattern",unit:["red-circle","blue-square","gold-triangle"],repetitions:2,blanks:3}],
  },
  {
    visual:"Supplied three-symbol ABC unit, unsorted shape/colour palette and nine empty positions. No target sequence or next-symbol highlighting. Every form uses the same attribute and unit complexity.",
    rubric:"Actual nine-symbol construction consists of exactly three copies of the requested unit in order. Save all placed symbols; do not replace with a multiple-choice option.",
    prompts:same("Use this repeating part to build three repeats."),
    tasks:[{kind:"create-pattern",unit:["gold-circle","red-triangle","blue-square"],repetitions:3},{kind:"create-pattern",unit:["blue-triangle","gold-square","red-circle"],repetitions:3},{kind:"create-pattern",unit:["red-square","blue-circle","gold-triangle"],repetitions:3},{kind:"create-pattern",unit:["gold-square","red-circle","blue-triangle"],repetitions:3},{kind:"create-pattern",unit:["blue-circle","gold-triangle","red-square"],repetitions:3}],
  },
];

export const YEAR1_NUMBER_AUTHORING_VERSION="year1-number-authoring-2026-09-15-1";
const materials=["shells","beads","cards","buttons","leaves"] as const;
export const YEAR1_NUMBER_CANDIDATE_SPECS=Object.fromEntries(ASSESSMENT_FORMS.map((form,f)=>[form,
  YEAR1_NUMBER_AUTHORING_ROWS.map((row,i)=>({
    id:`number-1-${form}-${String(i+1).padStart(2,"0")}-candidate-1`,
    version:YEAR1_NUMBER_AUTHORING_VERSION,blueprintVersion:ASSESSMENT_DESIGN_VERSION,
    form,slot:NUMBER_SLOTS[1][i],prompt:row.prompts[f],task:row.tasks[f],
    visual:row.visual,materials:materials[f],rubric:row.rubric,maximumScore:1 as const,
    status:"authoring-only" as const,
  })),
])) as Record<DesignedForm,Array<{
  id:string;version:string;blueprintVersion:string;form:DesignedForm;
  slot:typeof NUMBER_SLOTS[1][number];prompt:string;task:Year1NumberTask;
  visual:string;materials:string;rubric:string;maximumScore:1;status:"authoring-only";
}>>;
