import assert from 'node:assert/strict';
import { isTriangle, isComposedSquare, isBeside } from '../lib/starpath-ground-prototype.ts';
assert.equal(isTriangle([{x:0,y:0},{x:1,y:0},{x:0,y:1}]),true);
assert.equal(isTriangle([{x:2,y:1},{x:0,y:2},{x:1,y:0}]),true);
assert.equal(isTriangle([{x:0,y:0},{x:1,y:1},{x:2,y:2}]),false);
assert.equal(isTriangle([{x:0,y:0},{x:0,y:0},{x:1,y:2}]),false);
assert.equal(isTriangle([]),false);
assert.equal(isTriangle([{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}]),false);
for(let turn=0;turn<4;turn++) for(const x of [60,160,260]) {
 assert.equal(isComposedSquare([{x,y:120,turn},{x,y:120,turn:(turn+2)%4}]),true);
 assert.equal(isComposedSquare([{x,y:120,turn},{x:x+20,y:120,turn:(turn+2)%4}]),false);
 assert.equal(isComposedSquare([{x,y:120,turn},{x,y:120,turn}]),false);
 assert.equal(isComposedSquare([{x,y:120,turn},{x,y:120,turn:(turn+1)%4}]),false);
}
for(let cell=0;cell<9;cell++) assert.equal(isBeside(cell),cell===3||cell===5);
assert.equal(isBeside(null),false);
console.log('PASS Ground prototype: alternative triangles, invalid constructions, all square orientations, both beside positions.');
