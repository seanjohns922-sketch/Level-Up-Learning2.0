import fs from 'node:fs';
import ts from 'typescript';
export const auditRealms=['number','space','pattern','statistics','chance'];
export function realmInventory(h,realm){
 const file=`data/activities/level8/${realm}.ts`,source=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,source,99,true),names=[];let sequence=[];
 function visit(node){if(ts.isVariableDeclaration(node)){if(node.type?.getText(ast)==='Form[]')names.push(node.name.getText(ast));if(node.name.getText(ast)==='W'&&ts.isArrayLiteralExpression(node.initializer))sequence=node.initializer.elements.map(n=>n.getText(ast));}ts.forEachChild(node,visit);}visit(ast);
 const data=h.load(file,[...names,...(realm==='chance'?['chooseRepresentation']:[])]);
 const groups=names.map(name=>({name,forms:data[name].map((run,i)=>({id:`${realm}/${name}/${i+1}`,run}))}));
 const byName=Object.fromEntries(groups.map(g=>[g.name,g.forms]));
 const lessons=sequence.length?sequence.map(n=>byName[n]):groups.map(g=>g.forms);
 if(sequence.length){const slices=realm==='pattern'?[[0,15],[27,33],[18,27]]:realm==='statistics'?[[0,9],[9,21],[21,27]]:[[0,6],[6,21],[21,27]];for(const [a,b]of slices)lessons.push(sequence.slice(a,b).flatMap(n=>byName[n]));}
 const forms=groups.flatMap(g=>g.forms);
 if(realm==='chance'){const extra={id:'chance/chooseRepresentation/1',run:data.chooseRepresentation};forms.push(extra);lessons[27].push(extra);}
 return {forms,lessons};
}
