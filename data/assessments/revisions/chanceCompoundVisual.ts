export type ChanceTree={first:string[];second:string[]};
export type ChanceVenn={labels:[string,string];counts:[number,number,number,number]};
export function chanceTreeSpeech(tree:ChanceTree){return `First result: ${tree.first.join(', ')}. For each first result, the second can be ${tree.second.join(', ')}. Pairs shown: ${tree.first.flatMap(a=>tree.second.map(b=>`${a} then ${b}`)).join('; ')}.`;}
export function chanceVennSpeech(venn:ChanceVenn){const [a,b]=venn.labels,[onlyA,both,onlyB,neither]=venn.counts;return `${a} only: ${onlyA}. Both ${a} and ${b}: ${both}. ${b} only: ${onlyB}. Neither: ${neither}.`;}
