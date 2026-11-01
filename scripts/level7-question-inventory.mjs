import fs from 'node:fs';
import {loadCave7 as load} from './cave7-loader.mjs';
const generators={number:load('data/activities/year7Number/questions.ts').number7Question,measurement:load('data/activities/year7Measurement/questions.ts').measurement7Question,space:load('data/activities/year7Space/questions.ts').space7Question,...load('data/activities/cave7/questions.ts').CAVE7_GENERATORS};
const snapshots=[];
for(const [realm,generate] of Object.entries(generators))for(let week=1;week<=({space:10,statistics:10,chance:8}[realm]??12);week++)for(let lesson=1;lesson<=3;lesson++)for(const role of ['fast_thinking','reasoning','apply_create'])for(let seed=1;seed<=2;seed++){
 const task=generate(week,lesson,seed*7919,role);snapshots.push({context:`${realm}:7:${task.lessonId}:${role}:${seed}`,task});
}
fs.writeFileSync(process.env.AUDIT_SNAPSHOTS ?? '/tmp/reliq-level7-snapshots.json',JSON.stringify(snapshots));
console.log(snapshots.length);
