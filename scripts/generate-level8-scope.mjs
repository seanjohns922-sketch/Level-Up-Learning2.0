// Writes each realm's Level 8 scope and sequence to public/curriculum for the live week pages.
// Run: node --no-warnings --experimental-strip-types --experimental-loader ./scripts/typescript-alias-loader.mjs scripts/generate-level8-scope.mjs [--check]
import fs from 'node:fs';
import assert from 'node:assert/strict';
const {level8ScopeCsv}=await import('../data/activities/level8/curriculum.ts');
const {LEVEL8_WEEK_COUNTS}=await import('../lib/level8-config.ts');
for(const realm of Object.keys(LEVEL8_WEEK_COUNTS)){
 const csv=level8ScopeCsv(realm),file=`public/curriculum/${realm}-level8-scope-and-sequence.csv`;
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),csv,`${file} is out of date: rerun without --check`);else fs.writeFileSync(file,csv);
 console.log(`PASS ${realm}: Level 8 scope and sequence, ${LEVEL8_WEEK_COUNTS[realm]} weeks.`);
}
