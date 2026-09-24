export type ChanceTree={first:string[];second:string[];blanks?:Record<string,string>};
export type ChanceVenn={labels:[string,string];counts:[number,number,number,number];regions?:[string,string,string,string]};
export function treeLabel(tree:ChanceTree,key:string,value:string){return tree.blanks?.[key]?`[${tree.blanks[key]}]`:value;}
export function chanceTreeSpeech(tree:ChanceTree){return tree.first.map((a,i)=>`First branch ${i+1}: ${treeLabel(tree,`first-${i}`,a)}. ${tree.second.map((b,j)=>`Second branch ${j+1}: ${treeLabel(tree,`second-${i}-${j}`,b)}. Pair: ${treeLabel(tree,`pair-${i}-${j}`,`${a}, ${b}`)}`).join('. ')}`).join('. ');}
export function chanceVennSpeech(venn:ChanceVenn){const [a,b]=venn.labels,[onlyA,both,onlyB,neither]=venn.regions??venn.counts;return `${a} only: ${onlyA}. Both ${a} and ${b}: ${both}. ${b} only: ${onlyB}. Neither: ${neither}.`;}
