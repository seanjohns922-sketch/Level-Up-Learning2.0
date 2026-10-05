import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const bytes=fs.readFileSync('public/avatars/models/codemaster-premium.glb');
const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'',resolve,reject));
const root=gltf.scene;root.updateMatrixWorld(true);
const bounds=new THREE.Box3().setFromObject(root),size=bounds.getSize(new THREE.Vector3());
assert.ok(size.y>2&&size.y<2.6,'Full-height character, no displaced mesh above head');
assert.ok(Math.abs(bounds.min.y)<.02,'Feet are grounded');
let triangles=0,meshes=0;const materials=new Set();
root.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m.name);});
for(const name of ['Head','Torso','ArmL','ArmR','LegL','LegR'])assert.ok(root.getObjectByName(name),`Animation part exists: ${name}`);
for(const name of ['Skin','Hair','Gold trim','Armour','Crystal','Boot leather'])assert.ok(materials.has(name),`Appearance material: ${name}`);
assert.ok(meshes<50,'Static surfaces batched by part and material');assert.ok(triangles<71000,'Review mesh polygon budget');assert.ok(bytes.length<2_000_000,'Uncompressed asset budget');
console.log(`PASS: GLTF loaded with ${meshes} meshes, ${Math.round(triangles)} triangles, ${(bytes.length/1024/1024).toFixed(2)} MiB and all six animation pivots.`);

// Equipment is parented to the moving wrist rather than floating beside the body.
const arm = root.getObjectByName('ArmR');
const grip = new THREE.Object3D(); grip.position.set(.05,-.69,.1); arm.add(grip);
root.updateMatrixWorld(true);
const resting = grip.getWorldPosition(new THREE.Vector3());
assert.ok(resting.y>.6 && resting.y<.9, 'Grip meets the right hand');
assert.ok(resting.x>.3 && resting.x<.5, 'Grip is on the right side');
arm.rotation.x=.4; root.updateMatrixWorld(true);
assert.ok(grip.getWorldPosition(new THREE.Vector3()).distanceTo(resting)>.2, 'Equipment follows the arm during stride');
const isolated = root.clone(true);
isolated.getObjectByName('ArmR').rotation.x = -.2;
assert.ok(Math.abs(arm.rotation.x-.4)<1e-9, 'Cloned avatars animate independently');
arm.rotation.x=0; arm.remove(grip);
console.log('PASS: wrist anchor and articulated equipment motion.');

const {createPremiumExplorerHead} = await import('../lib/avatar/premium-explorer-head.ts');
const appearance = {skin:'#f1c8a6',skinShade:'#d6a07a',hair:'#4a2e1c',hairShade:'#2e1a0e'};
const first = createPremiumExplorerHead(root, appearance);
const second = createPremiumExplorerHead(root, {...appearance,hair:'#267bc4'});
const headBounds = new THREE.Box3().setFromObject(first.root);
assert.ok(headBounds.min.y>.6 && headBounds.max.y<1.6, 'Head fits the existing explorer neck and height');
const hairMesh = head => {let found; head.traverse(o=>{if(o.isMesh && o.material.name==='Hair')found=o;}); return found;};
assert.notEqual(hairMesh(first.root).material,hairMesh(second.root).material,'Per-avatar hair materials are independent');
assert.equal(hairMesh(second.root).material.color.getHexString(),'267bc4','Hair picker colour reaches the sculpted hair');
assert.equal(hairMesh(first.root).material.color.getHexString(),'4a2e1c','Recolouring another avatar preserves the first');
// A forward ray through each pupil must reach the face before the scalp.
first.root.updateMatrixWorld(true);
for(const x of [-.12,.12]) {
 const hits = new THREE.Raycaster(new THREE.Vector3(x,1.171,2),new THREE.Vector3(0,0,-1)).intersectObject(first.root,true);
 assert.ok(hits.length,'Eye is visible');
 assert.notEqual(hits[0].object.material.name,'Hair','Hair does not cover the eyes');
}
first.dispose(); second.dispose();
console.log('PASS: independent sculpted head fit, hair colours and unobstructed eyes.');

const {createExplorerHairGeometry} = await import('../lib/avatar/explorer-hair-geometry.ts');
const sculptedHair = createExplorerHairGeometry();
const scalpMesh = new THREE.Mesh(sculptedHair.scalp, new THREE.MeshStandardMaterial());
scalpMesh.updateMatrixWorld(true);
for(const x of [-.115,.115]) {
 const ray = new THREE.Raycaster(new THREE.Vector3(x,1.16,2),new THREE.Vector3(0,0,-1));
 const hits = ray.intersectObject(scalpMesh);
 assert.ok(hits.every(hit=>hit.point.z<0), 'Swept hair keeps both eyes clear');
}
const foreheadRay = new THREE.Raycaster(new THREE.Vector3(.1,1.46,2),new THREE.Vector3(0,0,-1));
assert.ok(foreheadRay.intersectObject(scalpMesh).length, 'Scalp faces outwards and covers the crown');
sculptedHair.scalp.computeBoundingBox();
assert.ok(sculptedHair.scalp.boundingBox.max.y<1.66,'Hair stays proportionate to the head');
sculptedHair.scalp.dispose(); sculptedHair.strands.forEach(strand=>strand.dispose()); scalpMesh.material.dispose();
console.log('PASS: connected swept scalp has outward faces and clear eyes.');
