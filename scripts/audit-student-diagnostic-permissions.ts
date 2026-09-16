import assert from 'node:assert/strict';
import {readdirSync,readFileSync} from 'node:fs';
const root='supabase/migrations/';
const states=new Map<string,Set<string>>();
for(const file of readdirSync(root).filter(f=>f.endsWith('.sql')).sort()){
 const sql=readFileSync(root+file,'utf8').replace(/--[^\n]*/g,'');
 const actions=/(?:create\s+(?:or\s+replace\s+)?function\s+public\.(get_pending_whole_math_diagnostic\w*)\s*\()|(?:(grant|revoke)\s+(?:all(?:\s+privileges)?|execute)\s+on\s+function\s+public\.(get_pending_whole_math_diagnostic\w*)\s*\([^)]*\)\s+(?:to|from)\s+([^;]+);)/gi;
 for(const match of sql.matchAll(actions)){
  const name=(match[1]??match[3]).toLowerCase();
  if(!states.has(name))states.set(name,new Set());
  if(match[2])for(const role of match[4].toLowerCase().split(',').map(s=>s.trim())){
   if(match[2].toLowerCase()==='grant')states.get(name)!.add(role);else states.get(name)!.delete(role);
  }
 }
}
assert.ok(states.size>=10,'Expected the complete diagnostic RPC chain');
for(const [name,roles] of states)for(const role of ['anon','authenticated'])assert.ok(roles.has(role),`${name} must explicitly allow ${role}; student sessions use anon with the existing session-header guard`);
console.log(`Student login permission audit: ${states.size} diagnostic lookups explicitly allow both validated student-session and authenticated callers.`);
