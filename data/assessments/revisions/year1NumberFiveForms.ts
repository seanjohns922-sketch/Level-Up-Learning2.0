/** Review set based on the original post-test, before the v3 difficulty reductions.
 * Six owner-reviewed slots are strengthened equally in every form.
 * These forms do not replace student banks until owner review and versioned activation.
 */
import { YEAR1_NUMBER_NEXUS_INDEPENDENT_POSTTEST_ITEMS as benchmark } from "../year1NumberNexusIndependentBanks";
import { createUncalibratedItemStatistics } from "../assessmentItemStandard";

export const NUMBER_LEVEL1_FORMS = ["pretest", "posttest", "start", "mid", "end"] as const;
export type NumberLevel1Form = typeof NUMBER_LEVEL1_FORMS[number];
export const NUMBER_LEVEL1_FORM_LABELS: Record<NumberLevel1Form, string> = {
  pretest: "Pre-Test", posttest: "Post-Test", start: "Start", mid: "Mid", end: "End",
};
export type NumberLevel1ReviewItem = Omit<typeof benchmark[number], "form" | "sourcePool"> & {
  form: NumberLevel1Form;
  sourcePool: "assessment_review";
  benchmarkQuestionId: string;
  slotId: string;
};
type Example = { prompt?: string; correctAnswer: string; visual: Record<string, unknown>; options?: string[]; type?: "numeric"; skillLabel?: string; cognitiveCategory?: "reasoning" | "application" };
const numeric = (answer: number, visual: Record<string, unknown>, prompt?: string): Example => ({ correctAnswer: String(answer), visual, ...(prompt ? { prompt } : {}) });
const profiles = {
  pretest: { tens:5, ones:8, partTens:40, partOnes:2, groups:6, add:[8,7], seedlings:[8,5], share:12, twos:6, pattern:["star","robot"], path:107, whole:17, part:12, partition:[75,40], largeGroups:25, subtract:[17,9], money:[7,6], division:21, fives:15, order:[120,96,108], coins:[4,3], names:["Mia","Sam"], equalShare:4 },
  start: { tens:6, ones:2, partTens:50, partOnes:6, groups:4, add:[8,6], seedlings:[7,6], share:18, twos:8, pattern:["crystal","star"], path:127, whole:19, part:13, partition:[86,50], largeGroups:26, subtract:[16,8], money:[7,5], division:15, fives:20, order:[120,95,107], coins:[5,3], names:["Ava","Leo"], equalShare:6 },
  mid: { tens:8, ones:5, partTens:70, partOnes:9, groups:7, add:[9,6], seedlings:[9,4], share:9, twos:10, pattern:["star","crystal"], path:137, whole:16, part:11, partition:[53,20], largeGroups:27, subtract:[15,8], money:[8,5], division:12, fives:25, order:[120,94,106], coins:[5,4], names:["Zoe","Max"], equalShare:3 },
  end: { tens:4, ones:7, partTens:80, partOnes:3, groups:3, add:[7,6], seedlings:[8,6], share:21, twos:12, pattern:["robot","star"], path:147, whole:18, part:14, partition:[97,60], largeGroups:28, subtract:[14,6], money:[9,5], division:24, fives:30, order:[120,93,105], coins:[6,4], names:["Ivy","Ben"], equalShare:7 },
} as const;

function rotated<T>(values: readonly T[], places: number): T[] {
  const offset = places % values.length;
  return [...values.slice(offset), ...values.slice(0, offset)];
}
function examples(form: Exclude<NumberLevel1Form,"posttest">): Example[] {
  const p = profiles[form];
  const position = NUMBER_LEVEL1_FORMS.indexOf(form);
  const [a,b] = p.pattern;
  const groupChoices = rotated([{count:p.largeGroups,size:5},{count:Math.ceil(p.largeGroups/2),size:5},{count:p.largeGroups-4,size:5}], position);
  return [
    numeric(p.tens*10+p.ones,{type:"number_y1_place_value",tens:p.tens,ones:p.ones}),
    numeric(p.partTens+p.partOnes,{type:"number_y1_part_whole",whole:null,parts:[p.partTens,p.partOnes]}),
    numeric(p.groups*5,{type:"number_y1_groups",groups:Array(p.groups).fill(5)}),
    numeric(p.add[0]+p.add[1],{type:"number_y1_equation",expression:`${p.add[0]} + ${p.add[1]} = ?`},`What is ${p.add[0]} + ${p.add[1]}?`),
    numeric(p.seedlings[0]+p.seedlings[1],{type:"number_y1_change",start:p.seedlings[0],change:p.seedlings[1],action:"combine",token:"seedling"},`${p.seedlings[0]} seedlings grow here. ${p.seedlings[1]} grow there. How many seedlings?`),
    numeric(p.share/3,{type:"number_y1_share",total:p.share,groups:3},`Share ${p.share} equally onto 3 plates. How many on each?`),
    numeric(p.twos+6,{type:"number_y1_sequence",values:[p.twos,p.twos+2,p.twos+4,null]}),
    {correctAnswer:a,options:rotated(["star","robot","crystal"],position),visual:{type:"number_y1_pattern",sequence:[a,b,a,b,"?"],answerSlots:1}},
    numeric(p.path+2,{type:"number_y1_sequence",values:[p.path,p.path+1,null,p.path+3]}),
    numeric(p.whole-p.part,{type:"number_y1_part_whole",whole:p.whole,parts:[p.part,null]},`The whole is ${p.whole}. One part is ${p.part}. Find the other part.`),
    numeric(p.partition[0]-p.partition[1],{type:"number_y1_part_whole",whole:p.partition[0],parts:[p.partition[1],null]},`${p.partition[0]} is ${p.partition[1]} and what other part?`),
    {prompt:`Which grouping represents ${p.largeGroups*5} counters?`,correctAnswer:`${p.largeGroups} groups of 5`,options:groupChoices.map(c=>`${c.count} groups of ${c.size}`),visual:{type:"number_y1_group_choices",totals:groupChoices.map(c=>c.count*c.size),choices:groupChoices}},
    numeric(p.subtract[0]-p.subtract[1],{type:"number_y1_equation",expression:`${p.subtract[0]} - ${p.subtract[1]} = ?`},`What is ${p.subtract[0]} - ${p.subtract[1]}?`),
    numeric(p.money[0]+p.money[1],{type:"number_y1_money",amounts:[...p.money],labels:["Puzzle","Kite"],unit:"$"},`A puzzle costs $${p.money[0]}. A kite costs $${p.money[1]}. How much altogether?`),
    numeric(p.division/3,{type:"number_y1_groups",total:p.division,groupSize:3},`Put ${p.division} into groups of 3. How many groups?`),
    numeric(p.fives+15,{type:"number_y1_sequence",values:[p.fives,p.fives+5,p.fives+10,null]}),
    {correctAnswer:`${a}||${a}`,options:rotated(["crystal","robot","star"],position),visual:{type:"number_y1_pattern",sequence:[a,a,b,a,a,b,"?","?"],answerSlots:2}},
    {correctAnswer:[...p.order].sort((x,y)=>x-y).join("||"),options:p.order.map(String),visual:{type:"number_y1_number_cards",values:[...p.order]}},
    {prompt:`${p.names[0]} has more coins. Does that always mean more money?`,correctAnswer:"No. Coin values matter.",options:rotated(["No. Coin values matter.","Yes. All coins have the same value.","Yes. More coins means more money."],position+1),visual:{type:"number_y1_money_compare",groups:[Array(p.coins[0]).fill(1),Array(p.coins[1]).fill(2)],labels:[...p.names]}},
    {correctAnswer:"Yes",options:rotated(["Yes","No"],position),visual:{type:"number_y1_groups",groups:[p.equalShare,p.equalShare]}},
  ];
}

// Fixed examples for the six revised end-of-Level-1 tasks. N04 stays within 20;
// challenge comes from the unknown position and modelling, not Year 2 arithmetic.
export const NUMBER_LEVEL1_STRENGTHENED_SLOTS = [3,4,12,13,18,19] as const;
const revisedProfiles = {
  pretest:  {add:[8,17], grow:[8,15], subtract:[8,7], prices:[7,6], coins:[[1,1,1,1,1,1,1,1],[2,2,2,2,2,2]], names:["Mia","Sam"], trays:[11,5]},
  posttest: {add:[9,17], grow:[9,16], subtract:[9,8], prices:[6,5], coins:[[1,1,1,1,1,1,1],[2,2,2,2,2,2]], names:["Liam","Aria"], trays:[12,4]},
  start:    {add:[7,15], grow:[7,15], subtract:[7,9], prices:[7,5], coins:[[1,1,1,1,1,1,1,1],[2,2,2,2,2,2,2]], names:["Ava","Leo"], trays:[10,4]},
  mid:      {add:[8,15], grow:[8,16], subtract:[8,9], prices:[8,5], coins:[[1,1,1,1,1,1,1,1,1],[2,2,2,2,2,2]], names:["Zoe","Max"], trays:[13,5]},
  end:      {add:[9,16], grow:[9,17], subtract:[9,7], prices:[9,5], coins:[[1,1,1,1,1,1,1,1,1],[2,2,2,2,2,2,2]], names:["Ivy","Ben"], trays:[12,6]},
} as const;
function strengthenedExamples(form: NumberLevel1Form): Record<number, Example> {
  const p = revisedProfiles[form];
  const total = (coins: readonly number[]) => coins.reduce((a,b)=>a+b,0);
  return {
    3: {...numeric(p.add[1]-p.add[0],{type:"number_y1_equation",expression:`${p.add[0]} + ? = ${p.add[1]}`},"What number makes this addition correct?"),skillLabel:"Find a Missing Addend",cognitiveCategory:"reasoning"},
    4: {...numeric(p.grow[1]-p.grow[0],{type:"number_y1_growth_story",before:p.grow[0],after:p.grow[1]},`There were ${p.grow[0]} seedlings. Now there are ${p.grow[1]}. How many were planted?`),skillLabel:"Find an Unknown Increase",cognitiveCategory:"application"},
    12: {...numeric(p.subtract[0]+p.subtract[1],{type:"number_y1_equation",expression:`? − ${p.subtract[0]} = ${p.subtract[1]}`},"What starting number makes this subtraction correct?"),skillLabel:"Find a Missing Starting Number",cognitiveCategory:"reasoning"},
    13: {...numeric(20-p.prices[0]-p.prices[1],{type:"number_y1_shop_change",paid:20,prices:[...p.prices],labels:["Puzzle","Kite"]},"You pay $20 for both toys. How much change?"),skillLabel:"Calculate Change for Two Items",cognitiveCategory:"application"},
    18: {...numeric(total(p.coins[1])-total(p.coins[0]),{type:"number_y1_money_compare",groups:p.coins.map(coins=>[...coins]),labels:[...p.names]},`How many more dollars does ${p.names[1]} have than ${p.names[0]}?`),type:"numeric",options:[],skillLabel:"Compare Coin Values",cognitiveCategory:"reasoning"},
    19: {...numeric((p.trays[0]-p.trays[1])/2,{type:"number_y1_balance_trays",groups:[...p.trays],labels:["Tray A","Tray B"]},"Move counters from Tray A to Tray B to make them equal. How many?"),type:"numeric",options:[],skillLabel:"Redistribute into Equal Shares",cognitiveCategory:"reasoning"},
  };
}

function makeForm(form: NumberLevel1Form): NumberLevel1ReviewItem[] {
  const variants = form === "posttest" ? null : examples(form);
  const strengthened = strengthenedExamples(form);
  return benchmark.map((base,index) => {
    const variant = strengthened[index] ?? variants?.[index];
    const type = variant?.type ?? base.type;
    const prompt = variant?.prompt ?? base.prompt;
    const correctAnswer = variant?.correctAnswer ?? String(base.correctAnswer);
    const visual = structuredClone(variant?.visual ?? base.visual) as Record<string, unknown>;
    const options = [...(variant?.options ?? base.options ?? [])] as string[];
    // Intended demand, not empirical calibration. The revised reasoning items are more demanding.
    const difficulty = [3,12,18,19].includes(index) ? "challenging" : [4,10,11,13,14,16,17].includes(index) ? "moderate" : "easy";
    const cognitiveCategory = variant?.cognitiveCategory ?? base.cognitiveCategory;
    return {
      ...base,
      id:`y1-number-review-${form}-${String(index+1).padStart(2,"0")}-v5`,
      version:"5.0.0-review.1", form, sourcePool:"assessment_review",
      bankId:`number-nexus-level-1-${form}-v5-review`,
      benchmarkQuestionId:base.id, slotId:`number-level-1-slot-${String(index+1).padStart(2,"0")}`,
      contextKey:`y1-number-review-${form}-${index+1}-v5`,
      structureKey:`y1-number-reviewed-slot-${index+1}-v5`,
      prompt,correctAnswer,answer:correctAnswer,visual,options,type,
      skillLabel:variant?.skillLabel ?? base.skillLabel,
      responseMode:type === "numeric" ? "constructed_response" : base.responseMode,
      inputMode:type === "numeric" ? "decimal" : base.inputMode,
      isTransfer:cognitiveCategory === "transfer",
      difficulty,cognitiveCategory,
      requiresReasoning:cognitiveCategory === "reasoning" || cognitiveCategory === "transfer",
      statistics:createUncalibratedItemStatistics(difficulty),
      selectedAnswerPosition:type === "mcq" ? options.indexOf(correctAnswer)+1 : undefined,
      renderer:{...base.renderer,type:type === "numeric" ? "numeric_entry" : base.renderer.type,payload:{prompt,correctAnswer,visual,...(options.length ? {options} : {})}},
      scoring:type === "numeric" ? {kind:"numeric_tolerance",correctResponse:correctAnswer,tolerance:0} : {...base.scoring,correctResponse:correctAnswer},
    };
  });
}
export const NUMBER_LEVEL1_FIVE_FORMS: Record<NumberLevel1Form, NumberLevel1ReviewItem[]> = {
  pretest:makeForm("pretest"),posttest:makeForm("posttest"),start:makeForm("start"),mid:makeForm("mid"),end:makeForm("end"),
};
