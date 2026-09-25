"use client";
import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
type V = [
    number,
    number,
    number
];
const wood = "#846044", iron = "#35413c", stone = "#928e7e";
export function Box({ p, s, c = wood, r = [0, 0, 0], finish }: {
    p: V;
    s: V;
    c?: string;
    r?: V;
    finish?: "fabric";
}) {
    return <mesh position={p} rotation={r} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.86} userData={{ finish }}/></mesh>;
}
export function Ball({ p, s, c }: {
    p: V;
    s: V;
    c: string;
}) {
    return <mesh position={p} scale={s} castShadow receiveShadow><sphereGeometry args={[1, 16, 12]}/><meshStandardMaterial color={c} roughness={.86}/></mesh>;
}
export function Pole({ a, b, radius = .035, c = wood }: {
    a: V;
    b: V;
    radius?: number;
    c?: string;
}) {
    const mid = new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5);
    const direction = new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    return <mesh position={mid} quaternion={q} castShadow><cylinderGeometry args={[radius * .8, radius, direction.length(), 8]}/><meshStandardMaterial color={c} roughness={.85}/></mesh>;
}
export function Ring({ p, radius, tube = .035, c = iron }: {
    p: V;
    radius: number;
    tube?: number;
    c?: string;
}) {
    return <mesh position={p} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[radius, tube, 6, 28]}/><meshStandardMaterial color={c} roughness={.65}/></mesh>;
}
export function Roof({ y = 1.9, width = 1.9, depth = 1.6, c = "#5c716b" }: {
    y?: number;
    width?: number;
    depth?: number;
    c?: string;
}) {
    return <group>{[-1, 1].map(side => <group key={side}>{Array.from({ length: 8 }, (_, i) => <Box key={i} p={[side * width / 4, y, (i - 3.5) * depth / 8]} s={[width * .59, .065, depth / 8 - .012]} r={[0, 0, side * -.48]} c={i % 2 ? c : "#52645f"}/>)}</group>)}<Pole a={[0, y + width * .125, -depth / 2]} b={[0, y + width * .125, depth / 2]} radius={.05} c={c}/></group>;
}
export function Leaves({ centers, color = "#66844b", count = 65 }: {
    centers: V[];
    color?: string;
    count?: number;
}) {
    const ref = useRef<THREE.InstancedMesh>(null);
    useLayoutEffect(() => {
        if (!ref.current)
            return;
        const dummy = new THREE.Object3D();
        const shade = new THREE.Color();
        for (let i = 0; i < count; i++) {
            const a = i * 2.39996, center = centers[i % centers.length];
            const v = ((i * 37) % 101) / 101;
            dummy.position.set(center[0] + Math.cos(a) * Math.sqrt(v) * .58, center[1] + Math.sin(i * 5.7) * .35, center[2] + Math.sin(a) * Math.sqrt(v) * .58);
            dummy.scale.set(.16 + v * .13, .028 + v * .035, .09 + v * .11);
            dummy.rotation.set(i * .71, a, i * .27);
            dummy.updateMatrix();
            ref.current.setMatrixAt(i, dummy.matrix);
            ref.current.setColorAt(i, shade.set(color).multiplyScalar(.8 + v * .35));
        }
        ref.current.instanceMatrix.needsUpdate = true;
        if (ref.current.instanceColor)
            ref.current.instanceColor.needsUpdate = true;
    }, [centers, color, count]);
    return <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow receiveShadow><icosahedronGeometry args={[1, 1]}/><meshStandardMaterial roughness={.95}/></instancedMesh>;
}
export function Tree({ variant, tint }: {
    variant: string;
    tint?: string;
}) {
    const birch = variant === "birch_tree" || variant === "gum_tree", autumn = variant === "autumn_tree";
    const centers: V[] = variant === "gum_tree" ? [[-.65,2.6,.1],[.7,2.9,0],[.2,2.3,-.6],[-.2,3.1,.3]] : variant === "birch_tree" ? [[0,2.4,0],[-.3,2.7,.1],[.35,2.5,0],[0,3.25,0]] : [[0,2.5,0],[-.55,2.15,.1],[.6,2.1,0],[.1,2.2,-.55],[0,2.9,0]];
    return <group><Pole a={[0, 0, 0]} b={[.08, 2.8, 0]} radius={.16} c={birch ? "#d7d1bb" : wood}/>{centers.map((p, i) => <Pole key={i} a={[0, 1.3, 0]} b={p} radius={.055} c={birch ? "#c5c4b1" : wood}/>)}<Leaves centers={centers} color={tint ?? (autumn ? "#bc7535" : "#647e45")} count={300}/>{birch && Array.from({ length: 9 }, (_, i) => <Box key={i} p={[.015 + i * .004, .3 + i * .24, .145]} s={[.14, .025, .01]} c="#686b5e"/>)}{[0, 1, 2, 3, 4].map(i => <Pole key={i} a={[0, .18, 0]} b={[Math.cos(i * 1.25) * .4, .02, Math.sin(i * 1.25) * .4]} radius={.05}/>)}</group>;
}
export function Flower({ p, color, sunflower = false }: {
    p: V;
    color: string;
    sunflower?: boolean;
}) {
    return <group position={p}><Pole a={[0, 0, 0]} b={[0, .55, 0]} c="#4b703c" radius={.015}/><Ball p={[.09, .25, 0]} s={[.13, .025, .06]} c="#527a43"/>{Array.from({ length: sunflower ? 10 : 6 }, (_, i) => { const a = i * Math.PI * 2 / (sunflower ? 10 : 6); return <Ball key={i} p={[Math.cos(a) * .09, .55 + Math.sin(a) * .09, 0]} s={[.075, .065, .028]} c={color}/>; })}<Ball p={[0, .55, .028]} s={[.055, .055, .025]} c={sunflower ? "#56402d" : "#d1a745"}/></group>;
}
function Garden({ variant, tint }: {
    variant: string;
    tint?: string;
}) {
    const raised = variant === "vegetable_bed";
    return <group><Box p={[0, .08, 0]} s={[1.05, .12, .85]} c="#493d2b"/>{[-1, 1].map(side => <group key={side}><Box p={[side * .55, .13, 0]} s={[.08, .25, .95]}/><Box p={[0, .13, side * .46]} s={[1.16, .25, .08]}/></group>)}{Array.from({ length: 9 }, (_, i) => { const p: V = [(i % 3 - 1) * .3, .15, (Math.floor(i / 3) - 1) * .25]; return raised ? <group key={i} position={p}><Leaves centers={[[0, .12, 0]]} count={7} color={tint ?? "#647744"}/><Ball p={[0, .15, .08]} s={[.065, .065, .065]} c="#bd6240"/></group> : variant === "lavender" ? <group key={i} position={p}><Pole a={[0, 0, 0]} b={[0, .65, 0]} radius={.012} c="#667e48"/>{[0, 1, 2, 3, 4].map(j => <Ball key={j} p={[0, .36 + j * .06, 0]} s={[.045 - j * .004, .045, .04]} c={tint ?? "#9683b1"}/>)}</group> : <Flower key={i} p={p} sunflower={variant === "sunflower"} color={tint ?? (variant === "lavender" ? "#9683b1" : variant === "sunflower" ? "#dcb64e" : "#c67b8b")}/>; })}</group>;
}
export function Bench({ picnic = false, tint }: {
    picnic?: boolean;
    tint?: string;
}) {
    return <group>{[-.62, .62].map(x => <group key={x}>{[-.27, .27].map(z => <Pole key={z} a={[x, 0, z * 1.3]} b={[x, .57, z]} radius={.045} c={iron}/>)}{!picnic && <Pole a={[x, .25, .3]} b={[x, 1.02, .43]} c={iron}/>}</group>)}{Array.from({ length: 4 }, (_, i) => <Box key={i} p={[0, .56, (i - 1.5) * .14]} s={[1.65, .065, .12]} c={tint ?? wood}/>)}{picnic ? <group>{[-.55, .55].map(z => <Box key={z} p={[0, .33, z]} s={[1.7, .08, .24]} c={tint ?? wood}/>)}</group> : <group>{[.75, .93].map(y => <Box key={y} p={[0, y, .38]} s={[1.65, .13, .06]} c={tint ?? wood}/>)}</group>}</group>;
}
export function Pond({ birdbath = false, lilies = false, tint }: {
    birdbath?: boolean;
    lilies?: boolean;
    tint?: string;
}) {
    const y = birdbath ? .85 : .08, radius = birdbath ? .4 : .9;
    return <group>{birdbath && <Pole a={[0, 0, 0]} b={[0, y, 0]} radius={.13} c={stone}/>}<mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[radius, 40]}/><meshStandardMaterial color={tint ?? "#4f8e92"} metalness={.3} roughness={.18}/></mesh>{Array.from({ length: birdbath ? 14 : 18 }, (_, i) => { const a = i * 2 * Math.PI / (birdbath ? 14 : 18); return <Ball key={i} p={[Math.cos(a) * radius, y, Math.sin(a) * radius]} s={[birdbath ? .1 : .19, birdbath ? .065 : .11, birdbath ? .09 : .16]} c={i % 2 ? "#8d907d" : "#a1a38d"}/>; })}{!birdbath && lilies && [0, 1, 2].map(i => <group key={i} position={[.3 - i * .25, y + .015, .2 - i * .22]}><Ball p={[0, 0, 0]} s={[.18, .014, .14]} c="#5e8349"/><Flower p={[0, -.48, 0]} color="#e0b8b4"/></group>)}</group>;
}
export function Shelter({ variant, tint }: {
    variant: string;
    tint?: string;
}) {
    const arch = variant === "garden_arch", market = variant === "market_stall", swing = variant === "swing";
    return <group>{[-.7, .7].flatMap(x => [-.55, .55].map(z => <Pole key={`${x},${z}`} a={[x, 0, z]} b={[x, 1.8, z]} radius={.065}/>))}<Box p={[0, 1.75, 0]} s={[1.65, .12, .15]}/>{arch ? <group>{[-.7, .7].map(x => <group key={x}>{[.5, .9, 1.3].map(y => <Box key={y} p={[x, y, 0]} s={[.06, .035, 1.2]}/>)}<Leaves centers={[[x, 1.5, 0], [x, 1.9, 0]]} count={30} color={tint ?? "#69814c"}/></group>)}</group> : swing ? <group>{[-.32, .32].map(x => <Pole key={x} a={[x, 1.7, 0]} b={[x, .5, 0]} radius={.012} c="#b6ac8d"/>)}<Box p={[0, .48, 0]} s={[.78, .07, .35]} c={tint ?? wood}/></group> : <Roof c={tint}/>} {market && <group><Box p={[0, .75, .45]} s={[1.65, .1, .6]}/>{[-.45, 0, .45].map(x => <group key={x}><Box p={[x, .84, .45]} s={[.4, .13, .45]} c="#9d7b55"/><Ball p={[x, .97, .45]} s={[.13, .13, .13]} c={x === 0 ? "#b9a653" : "#a95946"}/></group>)}</group>}</group>;
}
export function Animal({ variant, tint }: {
    variant: string;
    tint?: string;
}) {
    const duck = variant === "duck", rabbit = variant === "rabbit" || variant === "bilby", dog = variant === "blue_heeler", platypus = variant === "platypus";
    const c = tint ?? (duck ? "#a49173" : dog ? "#78888c" : platypus ? "#705a43" : "#a2917b");
    return <group><Ball p={[0, dog ? .46 : platypus ? .25 : .35, 0]} s={[.28, platypus ? .17 : .27, dog ? .48 : .43]} c={c}/><Ball p={[0, dog ? .78 : platypus ? .34 : .57, dog ? .44 : .35]} s={[.2, .2, .22]} c={duck ? "#496b52" : c}/>{[-1, 1].map(side => <group key={side}><Ball p={[side * .16, dog ? .24 : .12, .23]} s={[.075, dog ? .24 : .12, .12]} c={c}/><Ball p={[side * .18, dog ? .24 : .12, -.3]} s={[.08, dog ? .24 : .13, .12]} c={c}/><Ball p={[side * .14, dog ? .83 : platypus ? .38 : .62, dog ? .59 : .48]} s={[.025, .03, .023]} c="#252b27"/><Ball p={[side * .14, dog ? .84 : platypus ? .39 : .63, dog ? .607 : .497]} s={[.008, .009, .007]} c="#eee4d3"/>{!duck && !platypus && !dog && <group><Ball p={[side * .12, rabbit ? .89 : .77, .32]} s={[.065, rabbit ? .26 : .14, .055]} c={c}/><Ball p={[side * .12, rabbit ? .9 : .8, .367]} s={[.033, rabbit ? .17 : .07, .012]} c="#b38f85"/></group>}</group>)}<Ball p={[0, dog ? .72 : platypus ? .28 : .51, dog ? .66 : variant === "bilby" ? .65 : .55]} s={[duck || platypus ? .19 : .095, .055, duck || platypus ? .18 : variant === "bilby" ? .2 : dog ? .14 : .09]} c={duck ? "#b18a45" : platypus ? "#514939" : "#33332f"}/>{dog && [-1, 1].map(side => <mesh key={side} position={[side * .13, 1, .4]} rotation={[0, 0, side * -.18]} castShadow><coneGeometry args={[.1, .28, 3]}/><meshStandardMaterial color="#495450"/></mesh>)}{dog && <Ball p={[0, .46, .3]} s={[.2, .2, .11]} c="#b2afa0"/>}<Ball p={[0, .28, -.45]} s={[platypus ? .22 : .12, .07, platypus || dog ? .3 : variant === "bilby" ? .4 : .12]} c={c}/>{duck && [-1, 1].map(side => <Ball key={side} p={[side * .24, .4, -.05]} s={[.06, .15, .3]} c="#827b6d"/>)}</group>;
}
export const DETAILED_SCENERY_KEYS = new Set(["gum_tree", "shrub", "hedge", "palm_tree", "pine_tree", "fountain", "boulder", "rock_pile", "well", "tree", "birch_tree", "autumn_tree", "flower_bed", "lavender", "sunflower", "vegetable_bed", "bench", "picnic_table", "pond", "lily_pond", "birdbath", "garden_arch", "gazebo", "market_stall", "swing", "rabbit", "duck", "platypus", "blue_heeler", "bilby", "fire_pit", "stepping_stones", "mossy_boulder", "birdhouse", "stone_wall", "wood_gate", "campsite", "lamp_post", "bridge"]);
export function DetailedScenery({ assetKey, tint }: {
    assetKey: string;
    tint?: string;
}) {
    if (["tree", "birch_tree", "autumn_tree", "gum_tree"].includes(assetKey))
        return <Tree variant={assetKey} tint={tint}/>;
    if (assetKey === "shrub" || assetKey === "hedge")
        return <group>{assetKey === "hedge" && <Box p={[0, .4, 0]} s={[1.7, .7, .55]} c={tint ?? "#516542"}/>}<Leaves centers={assetKey === "hedge" ? [[-.6, .65, 0], [0, .65, 0], [.6, .65, 0]] : [[0, .4, 0], [-.22, .3, 0], [.25, .3, 0]]} count={assetKey === "hedge" ? 100 : 60} color={tint ?? "#607e46"}/></group>;
    if (assetKey === "pine_tree")
        return <group><Pole a={[0, 0, 0]} b={[0, 3.9, 0]} radius={.14}/>{Array.from({ length: 7 }, (_, row) => <group key={row}>{Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4 + row * .4, r = 1 - row * .12, y = 1 + row * .43; return <group key={i}><Pole a={[0, y + .3, 0]} b={[Math.cos(a) * r, y, Math.sin(a) * r]} radius={.025}/><mesh position={[Math.cos(a) * r * .5, y + .15, Math.sin(a) * r * .5]} rotation={[Math.sin(a) * .45, 0, -Math.cos(a) * .45]} castShadow><coneGeometry args={[r * .36, .85, 7]}/><meshStandardMaterial color={tint ?? (row % 2 ? "#526c46" : "#61794b")} roughness={.95}/></mesh></group>; })}</group>)}</group>;
    if (assetKey === "palm_tree")
        return <group><Pole a={[0, 0, 0]} b={[.15, 2.7, 0]} radius={.14}/>{Array.from({ length: 14 }, (_, i) => <Ring key={i} p={[i * .01, .15 + i * .18, 0]} radius={.14 - i * .003} tube={.014} c="#745b41"/>)}{Array.from({ length: 9 }, (_, i) => { const a = i * Math.PI * 2 / 9; return <group key={i} rotation={[0, a, 0]} position={[.15, 2.7, 0]}><Pole a={[0, 0, 0]} b={[1.3, -.25, 0]} radius={.025} c="#718349"/>{Array.from({ length: 8 }, (_, j) => <group key={j}>{[-1, 1].map(side => <mesh key={side} position={[.14 + j * .14, -j * j * .004, side * .13]} rotation={[side * .15, -side * .5, 0]} scale={[.3 - j * .015, .015, .07]} castShadow><sphereGeometry args={[1, 8, 6]}/><meshStandardMaterial color={tint ?? (j % 2 ? "#697b40" : "#798b4a")} roughness={.9}/></mesh>)}</group>)}</group>; })}{[-.1, .1].map(x => <Ball key={x} p={[.15 + x, 2.58, .08]} s={[.1, .13, .1]} c="#775a39"/>)}</group>;
    if (assetKey === "boulder" || assetKey === "rock_pile")
        return <group>{Array.from({ length: assetKey === "boulder" ? 3 : 5 }, (_, i) => <mesh key={i} position={[Math.sin(i * 4) * .45, .2 + (i === 0 ? .3 : 0), Math.cos(i * 4) * .3]} rotation={[i * .7, i * .3, i * .13]} scale={i === 0 ? [.72, .62, .58] : [.34, .3, .3]} castShadow receiveShadow><icosahedronGeometry args={[1, 1]}/><meshStandardMaterial color={tint ?? (i % 2 ? "#8a8b7e" : "#a1a18f")} roughness={1}/></mesh>)}</group>;
    if (assetKey === "fountain")
        return <group><Pond tint={tint}/><Pole a={[0, 0, 0]} b={[0, 1.3, 0]} radius={.15} c={stone}/><Ring p={[0, 1.1, 0]} radius={.4} tube={.08} c={stone}/><mesh position={[0, 1.13, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.38, 32]}/><meshStandardMaterial color={tint ?? "#71a3a0"} roughness={.2} metalness={.3}/></mesh>{Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return <Pole key={i} a={[Math.cos(a) * .37, 1.1, Math.sin(a) * .37]} b={[Math.cos(a) * .5, .12, Math.sin(a) * .5]} radius={.018} c={tint ?? "#a9c7bb"}/>; })}<Ball p={[0, 1.35, 0]} s={[.12, .14, .12]} c={stone}/></group>;
    if (assetKey === "well")
        return <group>{Array.from({ length: 4 }, (_, row) => Array.from({ length: 12 }, (_, i) => { const a = (i + row % 2 * .5) * Math.PI / 6; return <Box key={`${row}-${i}`} p={[Math.cos(a) * .57, .1 + row * .2, Math.sin(a) * .57]} s={[.29, .18, .24]} r={[0, -a, 0]} c={tint ?? (i % 2 ? "#979582" : "#858572")}/>; }))}<mesh position={[0, .2, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.5, 24]}/><meshStandardMaterial color="#304c4c"/></mesh>{[-.7, .7].map(x => <Pole key={x} a={[x, 0, 0]} b={[x, 1.9, 0]} radius={.055}/>)}<Roof y={2} width={1.8} depth={1.4}/><Pole a={[-.78, 1.55, 0]} b={[.78, 1.55, 0]} radius={.065}/><Pole a={[.78, 1.55, 0]} b={[.78, 1.3, 0]} radius={.03}/><Pole a={[.78, 1.3, 0]} b={[.93, 1.3, 0]} radius={.03}/><Pole a={[0, 1.55, 0]} b={[0, .68, 0]} radius={.01} c="#baaa85"/><Ring p={[0, .72, 0]} radius={.13} tube={.035} c={wood}/><mesh position={[0, .6, 0]}><cylinderGeometry args={[.13, .1, .22, 12]}/><meshStandardMaterial color={wood}/></mesh></group>;
    if (["flower_bed", "lavender", "sunflower", "vegetable_bed"].includes(assetKey))
        return <Garden variant={assetKey} tint={tint}/>;
    if (["bench", "picnic_table"].includes(assetKey))
        return <Bench picnic={assetKey === "picnic_table"} tint={tint}/>;
    if (["pond", "lily_pond", "birdbath"].includes(assetKey))
        return <Pond birdbath={assetKey === "birdbath"} lilies={assetKey === "lily_pond"} tint={tint}/>;
    if (["garden_arch", "gazebo", "market_stall", "swing"].includes(assetKey))
        return <Shelter variant={assetKey} tint={tint}/>;
    if (["rabbit", "duck", "platypus", "blue_heeler", "bilby"].includes(assetKey))
        return <Animal variant={assetKey} tint={tint}/>;
    if (assetKey === "birdhouse")
        return <group><Pole a={[0, 0, 0]} b={[0, 1.6, 0]} radius={.06}/><Box p={[0, 1.7, 0]} s={[.45, .5, .4]} c={tint ?? "#9e7752"}/><Ball p={[0, 1.77, .205]} s={[.075, .075, .008]} c="#302f29"/><Pole a={[0, 1.56, .2]} b={[0, 1.56, .35]} radius={.018}/><Roof y={2} width={.6} depth={.6}/></group>;
    if (assetKey === "fire_pit")
        return <group>{Array.from({ length: 12 }, (_, i) => <Ball key={i} p={[Math.cos(i * Math.PI / 6) * .48, .13, Math.sin(i * Math.PI / 6) * .48]} s={[.16, .13, .14]} c={stone}/>)}{[-1, 1].map(i => <Pole key={i} a={[-.28, .1, i * .22]} b={[.28, .2, -i * .22]} radius={.07}/>)}<mesh position={[0, .22, 0]}><icosahedronGeometry args={[.14, 1]}/><meshStandardMaterial color={tint ?? "#d19345"} emissive="#df7928" emissiveIntensity={.7}/></mesh></group>;
    if (assetKey === "stepping_stones" || assetKey === "mossy_boulder")
        return <group>{Array.from({ length: assetKey === "stepping_stones" ? 5 : 3 }, (_, i) => <group key={i}><Ball p={[(i % 2 - .5) * .28, .08, (i - 2) * .26]} s={assetKey === "stepping_stones" ? [.27, .06, .19] : [.38, .24 + i * .09, .3]} c={stone}/>{assetKey === "mossy_boulder" && <Ball p={[(i % 2 - .5) * .28, .28 + i * .09, (i - 2) * .26]} s={[.25, .045, .22]} c={tint ?? "#6d774b"}/>}</group>)}</group>;
    if (assetKey === "stone_wall")
        return <group>{[0, 1, 2, 3].flatMap(row => [0, 1, 2, 3].map(col => <Box key={`${row}-${col}`} p={[(col - 1.5) * .48, row * .22 + .12, 0]} s={[.46, .2, .36]} c={tint ?? (col % 2 ? "#999b88" : "#818777")}/>))}</group>;
    if (assetKey === "wood_gate")
        return <group>{[-.8, .8].map(x => <Pole key={x} a={[x, 0, 0]} b={[x, 1.1, 0]} radius={.07}/>)}{[.3, .55, .8].map(y => <Box key={y} p={[0, y, 0]} s={[1.5, .12, .08]} c={tint ?? wood}/>)}<Pole a={[-.7, .2, 0]} b={[.7, .87, 0]} radius={.04}/><Box p={[.62, .7, .07]} s={[.16, .05, .06]} c={iron}/></group>;
    if (assetKey === "campsite")
        return <group><Box p={[0, .03, 0]} s={[1.5, .06, 1.6]} c="#5c6650"/>{[-1, 1].map(side => <Box key={side} p={[side * .37, .55, 0]} s={[1.25, .025, 1.6]} r={[0, 0, -side * .9]} c={tint ?? "#aa8957"}/>)}<Pole a={[0, 0, .78]} b={[0, 1.1, .78]} radius={.025}/><Pole a={[0, 0, -.78]} b={[0, 1.1, -.78]} radius={.025}/><Box p={[0, .12, 0]} s={[.4, .13, 1.1]} c="#556e70"/></group>;
    if (assetKey === "bridge")
        return <group>{Array.from({ length: 13 }, (_, i) => <Box key={i} p={[(i - 6) * .17, .2 + Math.cos((i - 6) * .19) * .16, 0]} s={[.155, .09, .72]} c={tint ?? (i % 2 ? "#957453" : "#816144")}/>)}{[-.38, .38].map(z => <group key={z}>{[-1, 0, 1].map(x => <Pole key={x} a={[x, .15, z]} b={[x, .85, z]} radius={.04}/>)}<Pole a={[-1, .83, z]} b={[1, .83, z]} radius={.035}/></group>)}</group>;
    if (assetKey === "lamp_post")
        return <group><Pole a={[0, 0, 0]} b={[0, 2.2, 0]} radius={.055} c={iron}/><Box p={[0, .1, 0]} s={[.25, .18, .25]} c={stone}/><Box p={[0, 2.12, 0]} s={[.32, .06, .32]} c={iron}/><Box p={[0, 2.49, 0]} s={[.36, .06, .36]} c={iron}/>{[-.13, .13].flatMap(x => [-.13, .13].map(z => <Pole key={`${x}-${z}`} a={[x, 2.12, z]} b={[x, 2.49, z]} radius={.015} c={iron}/>))}<mesh position={[0, 2.3, 0]}><boxGeometry args={[.2, .28, .2]}/><meshStandardMaterial color={tint ?? "#ead5a0"} emissive={tint ?? "#e7bc68"} emissiveIntensity={.45} roughness={.3}/></mesh></group>;
    return null;
}
// Shared fine relief adds grain to timber, fabric and stone throughout the
// original catalogue too. Preserve original colours, glass, metal and emissive parts.
const reliefMaps = new Map<string, THREE.DataTexture>();
function detailMap(kind = "grain") {
    const cached = reliefMaps.get(kind);
    if (cached)
        return cached;
    const size = 128, data = new Uint8Array(size * size * 4);
    let seed = 391;
    for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            let n = 207 + seed % 40;
            if (kind === "stone") {
                const row = Math.floor(y / 32), shifted = (x + (row % 2) * 32) % 64;
                n = y % 32 < 2 || shifted < 2 ? 115 : 217 + seed % 30;
            }
            else if (kind === "timber") {
                n = 210 + Math.sin(x * .65 + Math.sin(y * .045) * 2) * 17 + seed % 16;
            }
            data.set([n, n, n, 255], (y * size + x) * 4);
        }
    const map = new THREE.DataTexture(data, size, size);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.magFilter = THREE.LinearFilter;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.generateMipmaps = true;
    map.needsUpdate = true;
    reliefMaps.set(kind, map);
    return map;
}
export function SceneryFinish({ children, assetKey = "" }: {
    children: ReactNode;
    assetKey?: string;
}) {
    const ref = useRef<THREE.Group>(null);
    const maps = useMemo(() => ({ grain: detailMap(), stone: detailMap("stone"), timber: detailMap("timber") }), []);
    useLayoutEffect(() => {
        ref.current?.traverse(obj => {
            if (!(obj instanceof THREE.Mesh))
                return;
            obj.castShadow = true;
            obj.receiveShadow = true;
            const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
            for (const material of materials) {
                if (!(material instanceof THREE.MeshStandardMaterial) || material.roughness < .55 || material.bumpMap)
                    continue;
                const hsl = material.color.getHSL({ h: 0, s: 0, l: 0 });
                const masonry = !(obj instanceof THREE.InstancedMesh) && (assetKey.startsWith("castle_") || assetKey === "stone_wall" || assetKey === "well") && hsl.s < .3 && hsl.l > .12;
                const timber = material.userData.finish !== "fabric" && hsl.h > .035 && hsl.h < .13 && hsl.s > .25 && hsl.l < .5;
                const map = masonry ? maps.stone : timber ? maps.timber : maps.grain;
                material.bumpMap = map;
                material.bumpScale = masonry ? .06 : timber ? .035 : .015;
                if ((masonry || timber) && !material.map)
                    material.map = map;
                material.needsUpdate = true;
            }
        });
    }, [children, maps, assetKey]);
    return <group ref={ref}>{children}</group>;
}
export function Window({ x, y, z }: {
    x: number;
    y: number;
    z: number;
}) {
    return <group><Box p={[x, y, z]} s={[.57, .66, .05]} c="#d5ccae"/><Box p={[x, y, z + .035]} s={[.45, .54, .025]} c="#486a70"/><Box p={[x, y, z + .06]} s={[.035, .56, .025]} c="#e3d7b9"/><Box p={[x, y, z + .06]} s={[.48, .035, .025]} c="#e3d7b9"/><Box p={[x, y - .35, z]} s={[.65, .06, .14]} c="#bbae8e"/></group>;
}
function Pavilion({ shed = false }: {
    shed?: boolean;
}) {
    return <group><Box p={[0, .08, 0]} s={[3.6, .16, 2.8]} c={stone}/><Box p={[0, 1, 0]} s={[3, 1.8, 2.2]} c={shed ? "#7d897d" : "#c9b695"}/>{Array.from({ length: 10 }, (_, i) => <Box key={i} p={[0, .24 + i * .16, 1.115]} s={[3, .018, .02]} c={shed ? "#677166" : "#b1a185"}/>)}<Roof y={2.05} width={3.6} depth={2.75} c={shed ? "#6c7876" : "#536d67"}/><Box p={[0, .68, 1.14]} s={[.65, 1.2, .06]} c={wood}/><Box p={[.22, .72, 1.185]} s={[.035, .07, .025]} c="#c5b077"/>{[-1, 1].map(x => <Window key={x} x={x} y={1.05} z={1.15}/>)}<Box p={[0, .18, 1.35]} s={[1, .16, .5]} c={stone}/>{shed ? <group><Ball p={[-1.2, .24, 1.8]} s={[.15, .12, .24]} c="#a45b40"/>{[-1.65, 1.65].map(x => <Pole key={x} a={[x, 0, -1.4]} b={[x, 3.2, -1.4]} radius={.035} c="#dfd8bd"/>)}<Pole a={[-1.65, 1.4, -1.4]} b={[1.65, 1.4, -1.4]} c="#dfd8bd"/></group> : <group><Box p={[0, 1.52, 1.35]} s={[3.1, .1, .5]} r={[.16, 0, 0]} c="#946653"/>{[-.9, .9].map(x => <group key={x}><Box p={[x, .53, 1.65]} s={[.45, .9, .4]} c="#3d4d50"/><Box p={[x, .71, 1.87]} s={[.31, .32, .025]} c="#829ea0"/><Box p={[x, .45, 1.92]} s={[.38, .08, .2]} c="#997d4c"/></group>)}</group>}</group>;
}
export const DETAILED_REWARD_KEYS = new Set(["games_room", "training_centre", "arcade", "treehouse", "puppy_yard", "bunny_garden", "pony_paddock", "adventure_playground", "trampoline_park", "cinema", "party_house", "backyard_pool", "splash_pool"]);
export function DetailedReward({ assetKey }: {
    assetKey: string;
}) {
    if (["games_room", "arcade", "training_centre"].includes(assetKey))
        return <Pavilion shed={assetKey === "training_centre"}/>;
    if (assetKey === "treehouse")
        return <group><group position={[-.6, 0, -.4]} scale={1.35}><Tree variant="tree"/></group><Box p={[0, 1.55, .25]} s={[2.4, .17, 1.8]}/><Box p={[0, 2.15, 0]} s={[1.7, 1.15, 1.35]} c="#b38f5b"/><Roof y={2.85} width={2.15} depth={1.7}/><Window x={.43} y={2.2} z={.7}/><Box p={[-.43, 2.04, .69]} s={[.45, .85, .04]} c="#514538"/>{[-.25, .25].map(x => <Pole key={x} a={[x, 0, 1.35]} b={[x, 1.6, .85]} radius={.04}/>)}{Array.from({ length: 7 }, (_, i) => <Pole key={i} a={[-.28, .16 + i * .21, 1.3 - i * .07]} b={[.28, .16 + i * .21, 1.3 - i * .07]} radius={.035}/>)}{[-1, 1].map(x => <group key={x}><Pole a={[x, 1.6, .95]} b={[x, 2.2, .95]} radius={.035}/><Pole a={[x, 2.2, -.5]} b={[x, 2.2, .95]} radius={.035}/></group>)}</group>;
    if (["puppy_yard", "bunny_garden", "pony_paddock"].includes(assetKey))
        return <group>{[-1, 1].flatMap(side => [-1.9, 0, 1.9].map(x => <Pole key={`${side}-${x}`} a={[x, 0, side * 1.7]} b={[x, .8, side * 1.7]} radius={.055}/>))}{[-1, 1].flatMap(side => [.3, .65].map(y => <Pole key={`${side}-${y}`} a={[-1.9, y, side * 1.7]} b={[1.9, y, side * 1.7]} radius={.035}/>))}<group position={[-1, 0, -.8]} scale={.8}><Shelter variant="gazebo"/></group>{assetKey === "pony_paddock" ? <group position={[.55, 0, .4]}><Ball p={[0, .9, 0]} s={[.33, .4, .65]} c="#936c48"/><Ball p={[0, 1.4, .5]} s={[.22, .4, .23]} c="#936c48"/><Ball p={[0, 1.63, .69]} s={[.18, .2, .29]} c="#a27c55"/>{[-1, 1].flatMap(x => [-1, 1].map(z => <Pole key={`${x}-${z}`} a={[x * .23, .1, z * .4]} b={[x * .23, .86, z * .4]} radius={.07} c="#815c3e"/>))}{[-.1, .1].map(x => <Ball key={x} p={[x, 1.88, .58]} s={[.06, .15, .06]} c="#815c3e"/>)}<Pole a={[0, 1.1, -.55]} b={[0, .4, -.85]} radius={.08} c="#473c30"/><Ball p={[.17, 1.69, .69]} s={[.025, .025, .025]} c="#242923"/><Ball p={[-.17, 1.69, .69]} s={[.025, .025, .025]} c="#242923"/></group> : <group position={[.55, 0, .4]} scale={1.35}><Animal variant={assetKey === "puppy_yard" ? "blue_heeler" : "bilby"}/></group>}<Ring p={[1.3, .1, -.8]} radius={.22} tube={.065} c="#8c958b"/></group>;
    if (assetKey === "trampoline_park")
        return <group><mesh position={[0, .55, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.55, 40]}/><meshStandardMaterial color="#343e3b" roughness={.95}/></mesh><Ring p={[0, .55, 0]} radius={1.6} tube={.12} c="#688a85"/>{Array.from({ length: 8 }, (_, i) => { const x = Math.cos(i * Math.PI / 4) * 1.65, z = Math.sin(i * Math.PI / 4) * 1.65; return <Pole key={i} a={[x, 0, z]} b={[x, 2.25, z]} radius={.035} c={iron}/>; })}<Ring p={[0, 2.25, 0]} radius={1.65}/>{Array.from({ length: 40 }, (_, i) => { const x = Math.cos(i * Math.PI / 20) * 1.65, z = Math.sin(i * Math.PI / 20) * 1.65; return <Pole key={i} a={[x, .65, z]} b={[x, 2.25, z]} radius={.005} c="#586460"/>; })}{[.9, 1.25, 1.6, 1.95].map(y => <Ring key={y} p={[0, y, 0]} radius={1.65} tube={.005} c="#586460"/>)}</group>;
    if (assetKey === "adventure_playground")
        return <group><group position={[-.9, 0, 0]}><Shelter variant="gazebo" tint="#a58651"/><Box p={[0, .95, 0]} s={[1.4, .12, 1.2]}/><Box p={[0, .55, 1.25]} s={[.65, .06, 1.9]} r={[.5, 0, 0]} c="#7d9c98"/>{[-.36, .36].map(x => <Box key={x} p={[x, .62, 1.25]} s={[.055, .15, 1.9]} r={[.5, 0, 0]} c="#516d69"/>)}{Array.from({ length: 5 }, (_, i) => <Pole key={i} a={[-.75, .15 + i * .2, -.2]} b={[-.75, .15 + i * .2, .2]} radius={.04}/>)}</group><group position={[1, 0, 0]} scale={.8}><Shelter variant="swing"/></group></group>;
    if (assetKey === "cinema")
        return <group><Box p={[0, 1.8, -1.3]} s={[3.8, 2, .15]} c="#3e4b46"/><Box p={[0, 1.8, -1.2]} s={[3.55, 1.75, .025]} c="#d3d7c9"/>{[-1.4, 1.4].map(x => <Pole key={x} a={[x, 0, -1.3]} b={[x, 2, -1.3]} radius={.08} c={iron}/>)}{[-.95, .95].map(x => <group key={x}><Box p={[x, .27, .75]} s={[.7, .35, 1.2]} c={x < 0 ? "#8b5c4c" : "#749187"}/><Box p={[x, .54, .7]} s={[.6, .28, .6]} c="#adbbad"/>{[-1, 1].flatMap(side => [-.35, .35].map(z => <Ball key={`${side}-${z}`} p={[x + side * .36, .16, .75 + z]} s={[.08, .14, .14]} c="#303732"/>))}</group>)}</group>;
    if (assetKey === "party_house")
        return <group><group position={[-.75, 0, -.5]} scale={1.1}><Shelter variant="gazebo"/></group><group position={[-.75, 0, .25]}><Bench picnic/></group><Box p={[1.3, .7, 0]} s={[.8, .18, .55]} c={iron}/>{[-1, 1].flatMap(x => [-1, 1].map(z => <Pole key={`${x}-${z}`} a={[1.3 + x * .3, 0, z * .2]} b={[1.3 + x * .3, .7, z * .2]} radius={.03} c={iron}/>))}{Array.from({ length: 8 }, (_, i) => <Pole key={i} a={[1 + i * .08, .81, -.23]} b={[1 + i * .08, .81, .23]} radius={.012} c="#a2a794"/>)}</group>;
    if (assetKey === "splash_pool") return <group><mesh position={[0,.08,0]}><cylinderGeometry args={[1.8,1.9,.16,48]}/><meshStandardMaterial color="#c6bc9c"/></mesh><mesh position={[0,.17,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[1.55,48]}/><meshStandardMaterial color="#79a5a0" roughness={.2} metalness={.2}/></mesh><Pole a={[0,.18,0]} b={[0,1.5,0]} radius={.09} c="#829780"/><mesh position={[0,1.5,0]}><coneGeometry args={[.7,.25,24]}/><meshStandardMaterial color="#c4aa76"/></mesh>{Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return <Pole key={i} a={[Math.cos(a)*.65,1.42,Math.sin(a)*.65]} b={[Math.cos(a)*.9,.2,Math.sin(a)*.9]} radius={.012} c="#b8d0bc"/>;})}{[-1,1].map(side=><group key={side} position={[side*1.4,0,0]}><Pole a={[0,.1,0]} b={[0,.75,0]} radius={.06} c="#a4835b"/><Ball p={[0,.82,0]} s={[.09,.12,.09]} c="#9fbbb0"/></group>)}</group>;
    if (assetKey === "backyard_pool")
        return <group><Box p={[0, .08, 0]} s={[4.2, .16, 3.6]} c="#bfb79b"/><Box p={[0, .18, 0]} s={[3.5, .14, 2.8]} c="#e0dac4"/><mesh position={[0, .26, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[3.15, 2.45]}/><meshStandardMaterial color="#699f9e" roughness={.16} metalness={.25}/></mesh>{[-.22, .22].map(x => <Pole key={x} a={[x, .2, 1.3]} b={[x, .75, 1.3]} radius={.025} c="#aeb8b1"/>)}{[.3, .48, .65].map(y => <Pole key={y} a={[-.22, y, 1.3]} b={[.22, y, 1.3]} radius={.02} c="#aeb8b1"/>)}<Ring p={[.8, .3, -.4]} radius={.3} tube={.07} c="#d6b27b"/></group>;
    return null;
}
export function LandmarkDetails({ variant }: {
    variant: string;
}) {
    if (variant === "observatory")
        return <group>{Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12; return <Box key={i} p={[Math.sin(a) * .94, 6.3, Math.cos(a) * .94]} s={[.18, .38, .035]} r={[0, a, 0]} c="#536b68"/>; })}<Ring p={[0, 5.75, 0]} radius={.95} c="#9a8753"/><Ring p={[0, 6.65, 0]} radius={1} c="#d2b16b"/></group>;
    if (variant === "clubhouse")
        return <group>{[-1.15, 1.15].map(x => <Window key={x} x={x} y={2.45} z={1.73}/>)}{[-1, 1].map(side => <group key={side}><Box p={[side * 1.1, 1.92, 1.88]} s={[1.1, .07, .07]} c="#e2d8be"/>{Array.from({ length: 5 }, (_, i) => <Box key={i} p={[side * (.65 + i * .22), 1.68, 1.88]} s={[.035, .46, .035]} c="#e2d8be"/>)}</group>)}{Array.from({ length: 5 }, (_, i) => <Box key={i} p={[0, .14 + i * .2, 2.75 - i * .15]} s={[1.05, .2, .3]} c="#aa8257"/>)}{Array.from({ length: 10 }, (_, i) => <Box key={i} p={[0, 1.7 + i * .15, 1.705]} s={[3.6, .015, .012]} c="#b6c3bf"/>)}</group>;
    if (variant === "workshop")
        return <group>{[-1.2, .3].map(x => <Window key={x} x={x} y={1.6} z={1.34}/>)}<Window x={1.55} y={3.95} z={1.06}/><Box p={[1.55, 3.45, 1.07]} s={[1.6, .1, .2]} c="#c5c3ae"/><Box p={[-.35, .83, 1.34]} s={[.65, 1.15, .04]} c="#6b796f"/><Ring p={[-1.4, .65, 1.45]} radius={.22} tube={.065} c="#d2b583"/></group>;
    if (variant === "farmyard")
        return <group>{[-1.4, .55].map(x => <Window key={x} x={x} y={1.65} z={1.43}/>)}<Box p={[-.45, .85, 1.44]} s={[.62, 1.2, .05]} c="#806449"/>{Array.from({ length: 11 }, (_, i) => <Box key={i} p={[-.4, .5 + i * .15, 1.405]} s={[3.5, .016, .014]} c="#c7bba1"/>)}<Box p={[-.4, 1.95, 1.85]} s={[2.6, .07, 1]} r={[.1, 0, 0]} c="#a4aba0"/>{[-1.55, .75].map(x => <Pole key={x} a={[x, .3, 2.1]} b={[x, 1.95, 2.1]} radius={.055} c="#d6d0bb"/>)}</group>;
    return null;
}
