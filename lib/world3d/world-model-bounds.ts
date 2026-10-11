import * as THREE from "three";

/** Actual vertices in model space. Transforming an already axis-aligned box
 * inflates rotated roofs/canopies and used to shrink the rest of their model. */
export function measureLocalModel(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  const bounds = new THREE.Box3();
  const relative = new THREE.Matrix4(), instance = new THREE.Matrix4(), transform = new THREE.Matrix4();
  const vertex = new THREE.Vector3();
  root.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const positions = object.geometry.getAttribute("position");
    if (!positions) return;
    relative.multiplyMatrices(inverse, object.matrixWorld);
    const count = object instanceof THREE.InstancedMesh ? object.count : 1;
    for (let i = 0; i < count; i++) {
      if (object instanceof THREE.InstancedMesh) {
        object.getMatrixAt(i, instance);
        transform.multiplyMatrices(relative, instance);
      } else transform.copy(relative);
      for (let j = 0; j < positions.count; j++) bounds.expandByPoint(vertex.fromBufferAttribute(positions, j).applyMatrix4(transform));
    }
  });
  return bounds;
}
