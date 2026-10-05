import * as THREE from 'three';
import contours from './reference-hair-contour.json' with {type: 'json'};

/** Volumetric front/back shells traced from the actual wardrobe hair silhouette. */
export type ReferenceHairStyle = keyof typeof contours;
export function createExplorerHairGeometry(style: ReferenceHairStyle = "swept") {
  const contour = contours[style];
  const columns = contour.columns, rows = 24;
  const vertices: number[] = [], uvs: number[] = [], front: number[] = [], back: number[] = [], rim: number[] = [];
  for (let side = 0; side < 2; side++) for (const [pixelX, top, bottom] of columns) {
    for (let r = 0; r <= rows; r++) {
      const t = r / rows, pixelY = top + (bottom - top) * t;
      const x = (pixelX - (contour.minX + contour.maxX) / 2) / (contour.maxX - contour.minX) * .79;
      const y = 1.65 - (pixelY - contour.minY) / (contour.maxX - contour.minX) * .79;
      const width = Math.sqrt(Math.max(0, 1 - (x / .405) ** 2));
      // The front wraps around the temples, while the rear encloses the crown.
      const z = side === 0 ? .035 + width * (.19 + .09 * Math.sin(t * Math.PI / 2))
        : -.04 - width * (.20 + .035 * Math.sin(t * Math.PI));
      vertices.push(x, y, z);
      uvs.push(pixelX / contour.width, 1 - pixelY / contour.height);
    }
  }
  const count = columns.length * (rows + 1);
  for (let c = 0; c < columns.length - 1; c++) for (let r = 0; r < rows; r++) {
    const a = c * (rows + 1) + r, b = a + rows + 1;
    front.push(a,a+1,b,b,a+1,b+1);
    back.push(count+a,count+b,count+a+1,count+b,count+b+1,count+a+1);
  }
  const edge = (a:number,b:number) => rim.push(a,b,count+a,b,count+b,count+a);
  for(let c=0;c<columns.length-1;c++){edge(c*(rows+1),(c+1)*(rows+1));edge((c+1)*(rows+1)+rows,c*(rows+1)+rows);}
  for(let r=0;r<rows;r++){edge(r+1,r);const a=(columns.length-1)*(rows+1)+r;edge(a,a+1);}
  const make = (indices:number[]) => {
    const mesh = new THREE.BufferGeometry();
    mesh.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    mesh.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
    mesh.setIndex(indices);mesh.computeVertexNormals();return mesh;
  };
  return {scalp:make(front), rear:make([...back,...rim]), strands:[] as THREE.BufferGeometry[]};
}
