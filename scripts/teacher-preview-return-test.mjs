import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Run the real preview-mode logic against a fake browser.
function previewMode({search='',activeStudent=null,demoFlag=false}){
 const storage=new Map();
 if(activeStudent!==null)storage.set('lul_active_student_v1',activeStudent);
 if(demoFlag)storage.set('lul_demo_preview_mode_v1','1');
 globalThis.window={location:{search},localStorage:{getItem:k=>storage.get(k)??null},addEventListener(){},removeEventListener(){}};
 const module={exports:{}};
 const js=ts.transpileModule(fs.readFileSync('lib/demo-mode.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','module','exports',js)(name=>name==='react'?{useSyncExternalStore:()=>false}:name==='@/data/config'?{DEMO_MODE:false}:{},module,module.exports);
 return module.exports.isDemoPreviewMode();
}
assert.equal(previewMode({search:'?teacher_preview=1'}),true,'A teacher preview link enters preview mode');
assert.equal(previewMode({search:'?teacher_preview=1',activeStudent:'student-123'}),false,'The flag never unlocks a real student journey');
assert.equal(previewMode({search:'',activeStudent:null}),false,'Without the flag a teacher link leaves preview mode, so the flag must be carried');
delete globalThis.window;

// Round trip: the lesson's "Back to Week" keeps the flag, and the week page passes it on to its links.
const lesson=fs.readFileSync('app/lesson/page.tsx','utf8');
const back=lesson.slice(lesson.indexOf('function goBackToProgram()'),lesson.indexOf('\n  }\n',lesson.indexOf('function goBackToProgram()')));
assert.ok(back.includes('${previewMode ? "&teacher_preview=1" : ""}'),'Back to Week must keep teacher_preview while previewing');
const program=fs.readFileSync('app/program/page.tsx','utf8');
assert.ok(program.includes('const teacherPreview = sp.get("teacher_preview") === "1" && demoPreviewMode;'));
assert.ok(program.includes('${lessonRoute}${teacherPreview ? `${previewSep}teacher_preview=1` : ""}'),'Week page lesson links carry the flag onward');
console.log('PASS teacher preview survives lesson → week → next lesson, and the URL flag never unlocks a real student.');
