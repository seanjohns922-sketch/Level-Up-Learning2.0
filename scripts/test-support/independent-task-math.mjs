// Independent answer checks from displayed operands/model data, without calling
// the generator's answer helpers. Unsupported families remain explicitly untested.
export function checkIndependentTaskMath(q, check) {
 const number = value => { const s=String(value).replaceAll(',','').trim();const mixed=s.match(/^(-?)(\d+) (\d+)\/(\d+)$/);if(mixed)return (mixed[1]?-1:1)*(+mixed[2]+mixed[3]/mixed[4]);const f=s.match(/^(-?\d+)\/(\d+)$/);if(f)return f[1]/f[2];return s.endsWith('%')?Number(s.slice(0,-1))/100:Number(s); };
 const equal=(actual,expected,label)=>check(Number.isFinite(number(actual))&&Math.abs(number(actual)-expected)<1e-7,`${label}: ${actual} should equal ${expected}`);
 const answer=(expected)=>equal(q.answer,expected,q.kind);
 if(q.kind==='groupCountVisual')answer(q.groups*q.perGroup);
 if(q.kind==='groupingEstimate')answer(q.tensGroups*10+q.ones);
 if(q.kind==='mentalAdd')answer(q.a+q.b);
 if(q.kind==='mentalSubtract')answer(q.total-q.remove);
 if(q.kind==='storySolve')answer(q.op==='add'?q.a+q.b:q.a-q.b);
 if(q.kind==='twoMats')answer(q.mode==='add'?q.a+q.b:q.a-q.b);
 if(q.kind==='buildStory')answer(q.mode==='add'?q.start+q.change:q.start-q.change);
 if(q.kind==='barModel')answer(q.total-q.part);
 if(q.kind==='ppw')equal(q.whole,q.a+q.b,'parts make whole');
 if(q.kind==='moneyEnough')check(q.answer===(q.have>=q.cost?'YES':'NO'),'money affordability');
 if(q.kind==='groundCompare'&&['more','less'].includes(q.comparisonType)) {const target=Math[q.comparisonType==='more'?'max':'min'](...q.groups.map(g=>g.quantity));equal(q.groups.find(g=>g.id===q.correctGroupId)?.quantity,target,'comparison choice');}
 if(q.kind.startsWith('ground')&&q.correctOptionId&&q.options?.every(o=>typeof o.numeral==='number'))equal(q.options.find(o=>o.id===q.correctOptionId)?.numeral,q.targetNumber,'count choice');
 if(q.kind==='groundHunt')for(const tile of q.tiles)check(tile.isTarget===(tile.numeral===q.targetNumber),'hunt target');
 if(q.kind==='area_model_select'&&q.models&&q.correctModelId){const matches=q.models.filter(m=>Math.abs(m.numerator/m.denominator-q.numerator/q.denominator)<1e-7);check(matches.length===1&&matches[0].id===q.correctModelId,'fraction model must have exactly one correct option');for(const m of q.models)check(m.shadedParts.length===m.numerator,'fraction shaded parts');}
 if(q.kind==='equivalent_fraction_build'||q.kind==='equivalent_fraction_match'){const target=q.source??q.target,options=q.options??q.choices,id=q.correctOptionId??q.correctChoiceId;const matches=options.filter(o=>o.numerator*target.denominator===target.numerator*o.denominator);check(matches.length===1&&matches[0].id===id,'equivalent fraction unique answer');}
 if(q.kind==='equivalent_fraction_yes_no'&&q.prompt==='Are these bar models equivalent?')check(q.answer===(q.left.numerator*q.right.denominator===q.right.numerator*q.left.denominator?'yes':'no'),'equivalent fraction yes/no');
 if(q.kind==='fraction_decimal_percent_match')for(const s of q.sets){equal(s.decimal,number(s.fraction),'decimal conversion');equal(s.percent,number(s.fraction),'percent conversion');}
 if(q.kind==='benchmark_sort')for(const v of q.values)check(v.category===(number(v.label)<.5?'less':number(v.label)>.5?'greater':'equal'),'half benchmark');
 if(q.kind==='number_line_place'&&q.pointOptions){const matches=q.pointOptions.filter(p=>Math.abs(number(p.fraction)-number(q.targetFraction))<1e-7);check(matches.length===1&&matches[0].id===q.answer,'unique number line point');}
 if(q.kind==='fraction_compare') {const left=number(q.leftFraction),right=number(q.rightFraction);if(['symbol_compare','visual_compare'].includes(q.mode))check(q.answer===(left>right?'>':left<right?'<':'='),'fraction comparison');if(q.mode==='greater_less_visual')check(q.answer===(left>right?'left':'right'),'greater fraction side');if(q.mode==='equivalent_to_compare'){if(left===right)check(q.answer==='They are equal','equal comparison');else equal(q.answer,Math.max(left,right),'greater fraction');}}
 if(q.kind==='odd_even_sort'){check(q.answer.odd.every(n=>n%2!==0)&&q.answer.even.every(n=>n%2===0),'parity categories');check([...q.answer.odd,...q.answer.even].sort((a,b)=>a-b).join()===q.numbers.slice().sort((a,b)=>a-b).join(),'parity covers all numbers');}
 if(q.kind==='mixed_word_problem'&&q.mode==='quantity_estimation'&&q.visual?.type==='array')answer(Math.round(q.visual.rows*q.visual.columns/10)*10);
 if(q.kind==='mixed_word_problem'&&q.mode==='money_equivalence'&&q.visual?.pieces)answer(q.visual.pieces.reduce((s,p)=>s+p.value,0)*100);
 if(q.visual?.type==='receipt'&&/total cost/.test(q.prompt))answer(q.visual.lines.reduce((s,l)=>s+l.price*l.quantity,0));
 if(q.visual?.type==='australian_money'&&q.visual.itemPrice!==undefined&&/change/.test(q.prompt))answer(q.visual.pieces.reduce((s,p)=>s+p.value,0)-q.visual.itemPrice*(q.visual.quantity??1));
 if(q.kind==='fractionTurn'&&q.scene==='fraction')check(q.correctOption===({2:'one half',4:'one quarter',8:'one eighth'}[q.parts])&&q.shadedParts===1,'unit fraction answer');
}
