import * as THREE from "three";

/** Measure in model space, independent of a saved placement's world rotation,
 * translation or its parent's scale. Instances count as actual geometry. */
export function measureLocalModel(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const bounds = new THREE.Box3();
  const relative = new THREE.Matrix4();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    let box: THREE.Box3 | null;
    if (object instanceof THREE.InstancedMesh) {
      object.computeBoundingBox();
      box = object.boundingBox;
    } else {
      object.geometry.computeBoundingBox();
      box = object.geometry.boundingBox;
    }
    if (!box) return;
    relative.multiplyMatrices(inverse, object.matrixWorld);
    bounds.union(box.clone().applyMatrix4(relative));
  });
  return bounds;
}
