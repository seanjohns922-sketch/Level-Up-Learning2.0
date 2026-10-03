import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {loadCave7} from './cave7-loader.mjs';
const require=createRequire(import.meta.url),contract=loadCave7('lib/level7-answer.ts');
let state=[],cursor=0;
const react={...require('react'),useState(initial){const i=cursor++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],v=>{state[i]=typeof v==='function'?v(state[i]):v;}];}};
const module={exports:{}};
new Function('require','module','exports',ts.transpileModule(fs.readFileSync('components/activities/Level7AnswerInput.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText)(name=>name==='react'?react:name==='@/lib/level7-answer'?contract:name==='@/lib/useRealmTheme'?{getRealmTheme:()=>({borderRing:'#345',ctaFrom:'#456'})}:name==='@/components/ReadAloudBtn'?{default:()=>null}:require(name),module,module.exports);
const Component=module.exports.default;
const walk=(e,p)=>!e?[]:Array.isArray(e)?e.flatMap(x=>walk(x,p)):typeof e!=='object'?[]:[...(p(e)?[e]:[]),...walk(e.props?.children,p)];
let answers=[],edits=0,props;
function render(){cursor=0;return Component(props);}
function setup(kind,expected,initialValue=''){state=[];answers=[];edits=0;props={spec:{kind,expected,prompt:''},initialValue,onAnswer:(...x)=>answers.push(x),onEditing:()=>edits++};return render();}
function enter(i,value){const input=walk(render(),e=>e.type==='input')[i];input.props.onChange({target:{value}});}
function submit(){render().props.onSubmit({preventDefault(){}});}
setup('fraction','1/2');assert.equal(walk(render(),e=>e.type==='input').length,2);submit();assert.equal(answers.length,0);enter(0,'2');enter(1,'0');submit();assert.equal(answers.length,0);enter(1,'4');submit();assert.deepEqual(answers.at(-1),[true,'2/4']);assert.ok(edits>0);
setup('fraction','1/2','0.5');assert.equal(walk(render(),e=>e.type==='input').length,1);submit();assert.deepEqual(answers.at(-1),[true,'0.5']);
setup('coordinates','(-2, 3)');enter(0,'-2');enter(1,'3');submit();assert.deepEqual(answers.at(-1),[true,'-2, 3']);enter(1,'4');submit();assert.deepEqual(answers.at(-1),[false,'-2, 4']);
setup('ratio','2:3');enter(0,'4');enter(1,'6');submit();assert.deepEqual(answers.at(-1),[true,'4:6']);
setup('expression','2(n+3)');enter(0,'2*n+6');submit();assert.deepEqual(answers.at(-1),[true,'2*n+6']);
setup('set','1, 2, 3');enter(0,'3, 2, 1');submit();assert.deepEqual(answers.at(-1),[true,'3, 2, 1']);
console.log('PASS answer controls: labelled fields, blanks, zero denominator, fraction equivalence, restored decimal input, coordinates, ratios, expressions, sets and edit invalidation.');
const sessionSource=fs.readFileSync('app/session/page.tsx','utf8');
const ast=ts.createSourceFile('session.tsx',sessionSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const bodies=ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&['isQuizQuestionCorrect','buildQuizQuestionResults'].includes(n.name?.text)).map(n=>n.getText(ast)).join('\n');
const snapshotFns=new Function(ts.transpileModule(bodies,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText+'\nreturn {buildQuizQuestionResults};')();
const rows=snapshotFns.buildQuizQuestionResults([{id:'fraction',kind:'lessonActivity',prompt:'Find half',lessonTag:1,questionData:{answer:'1/2'}},{id:'wrong',kind:'lessonActivity',prompt:'Find half',lessonTag:1,questionData:{answer:'1/2'}}],{},{},{},{},{},{},{fraction:{attempted:true,correct:true,response:'2/4'},wrong:{attempted:true,correct:false,response:'3/4'}});
assert.equal(rows[0].selectedAnswer,'2/4');assert.equal(rows[0].correctAnswer,'1/2');assert.equal(rows[0].correct,true);assert.equal(rows[1].selectedAnswer,'3/4');assert.equal(rows[1].correct,false);
console.log('PASS actual quiz report builder retains entered fractions and canonical answers with the saved score.');
