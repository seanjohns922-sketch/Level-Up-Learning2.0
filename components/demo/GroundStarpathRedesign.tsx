"use client";

import Link from "next/link";
import { useState, type CSSProperties, type PointerEvent } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { ShapeVisual } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import { getRealmTheme } from "@/lib/useRealmTheme";
import { stopSpeaking } from "@/lib/speak";
import { isTriangle, isComposedSquare, isBeside, type Piece, type Point } from "@/lib/starpath-ground-prototype";
import styles from "./GroundStarpathRedesign.module.css";

const examples = [
  { title: "Tap the rectangle.", instruction: "", name: "Recognise", note: "AC9MFSP01 · Naming: no target picture, colour match or spoken shape names on the choices. A square is not used as a competing answer to rectangle." },
  { title: "Choose all the triangles.", instruction: "Tap a shape to choose it. Tap it again to put it back.", name: "Sort", note: "AC9MFSP01 · Sorting: triangles vary in colour, size and orientation. Select a reason as well as the group. Selected reasons sample explanation; they do not replace a child's spoken reasoning." },
  { title: "Make a triangle.", instruction: "Tap the dots to join them. Press Done when you have finished.", name: "Create", note: "AC9MFSP01 · Creating: any three different, non-collinear dots count. No prescribed starting point, model triangle or hidden orientation. Undo and Clear are available." },
  { title: "Use both pieces to make a square.", instruction: "Move the pieces together. Tap a piece to choose it. Use Turn to turn it.", name: "Build", note: "AC9MFSP01 · Creating: two equal triangles compose a square. Drag pieces, or choose a piece and tap a dot to move it. All four valid orientations and all board locations count. This is a bounded composition task, not evidence of open-ended picture making." },
  { title: "Where is the moon compared with the rocket?", instruction: "", name: "Describe", note: "AC9MFSP02 · Describing relative position: one named reference object and one target. Audio reads the question and options, without narrating the answer." },
  { title: "Put the explorer beside the rocket.", instruction: "Tap a space to put the explorer there.", name: "Position", note: "AC9MFSP02 · Interpreting relative position: either side of the rocket counts. This complements, but does not replace, describing positions and real-world observation." },
];
const sortShapes = ["triangle", "circle", "rectangle", "triangle", "square", "triangle"] as const;
const colours = ["#fbbf24", "#fbbf24", "#a78bfa", "#67e8f9", "#67e8f9", "#a78bfa"];
const reasons = ["They are the same colour.", "They have three straight sides.", "They are the same size."];
const cellNames = ["top left", "top middle", "top right", "middle left", "middle", "middle right", "bottom left", "bottom middle", "bottom right"];

type Answer = { choice: number | null; selected: number[]; reason: number | null; points: Point[]; pieces: Piece[]; cell: number | null; submitted: boolean; skipped: boolean };
const fresh = (): Answer => ({ choice: null, selected: [], reason: null, points: [], pieces: [{ x: 60, y: 120, turn: 0 }, { x: 260, y: 120, turn: 1 }], cell: null, submitted: false, skipped: false });

export default function GroundStarpathRedesign() {
  const theme = getRealmTheme("space");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(() => examples.map(fresh));
  const [piece, setPiece] = useState(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const a = answers[index];
  const example = examples[index];
  const update = (value: Partial<Answer>) => setAnswers(old => old.map((answer, i) => i === index ? { ...answer, ...value, submitted: false, skipped: false } : answer));
  const moveTo = (next: number) => { stopSpeaking(); setIndex(next); setShowResult(false); setDrag(null); };
  const ready = [a.choice !== null, a.selected.length > 0 && a.reason !== null, a.points.length > 0, true, a.choice !== null, a.cell !== null][index];
  const correct = [a.choice === 1, a.selected.length === 3 && [0, 3, 5].every(n => a.selected.includes(n)) && a.reason === 1, isTriangle(a.points), isComposedSquare(a.pieces), a.choice === 0, isBeside(a.cell)][index];
  const submit = (skipped = false) => setAnswers(old => old.map((answer, i) => i === index ? { ...answer, submitted: true, skipped } : answer));
  const setPiecePoint = (p: number, x: number, y: number) => update({ pieces: a.pieces.map((v, i) => i === p ? { ...v, x, y } : v) });
  const dragMove = (event: PointerEvent<SVGSVGElement>) => {
    if (drag === null) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setPiecePoint(drag, Math.max(60, Math.min(260, Math.round((event.clientX - rect.left) / rect.width * 320 / 20) * 20)), Math.max(60, Math.min(180, Math.round((event.clientY - rect.top) / rect.height * 240 / 20) * 20)));
  };
  const shapeButton = (shape: typeof sortShapes[number] | "oval", n: number, selected: boolean, onClick: () => void, colour: string, rotation = 0, scale = 1) => (
    <button key={n} className={styles.shape} aria-label={`Shape ${String.fromCharCode(65 + n)}`} aria-pressed={selected} onClick={onClick}>
      <span className={styles.letter}>{String.fromCharCode(65 + n)}{selected ? " ✓" : ""}</span>
      <span style={{ transform: `rotate(${rotation}deg)` }}><ShapeVisual shape={shape} colour={colour} scale={scale} className={styles.shapeArt} /></span>
    </button>
  );
  return (
    <main className={styles.page} style={{ "--accent": theme.accentText, "--selected": theme.ctaFrom, "--ring": theme.borderRing, "--cta": theme.ctaGradientCss, "--surface": theme.cardSurface, "--tint": theme.surfaceTint } as CSSProperties}>
      <div className={styles.shell}>
        <header className={styles.header}><div><p>STARPATH · GROUND LEVEL</p><h1>A fresh start</h1></div><Link href="/demo-review/starpath-ground">Back to five forms</Link></header>
        <div className={styles.reviewBar}><span>Design review · 6 examples · answers stay on this page</span><nav aria-label="Review examples">{examples.map((e, n) => <button key={e.name} onClick={() => moveTo(n)} aria-current={index === n ? "step" : undefined}>{n + 1}<span> {e.name}</span></button>)}</nav></div>
        <section className={styles.card} aria-labelledby="question-heading">
          <div className={styles.question}><div><p className={styles.counter}>Question {index + 1} of 6</p><h2 id="question-heading">{example.title}</h2></div><ReadAloudBtn text={`${example.title} ${example.instruction}`} label="Read question" size="md" className={styles.voice} /></div>
          {example.instruction && <p className={styles.instruction}>{example.instruction}</p>}
          <div className={styles.activity}>
            {index === 0 && <div className={styles.choices}>{(["triangle", "rectangle", "oval"] as const).map((s, n) => shapeButton(s, n, a.choice === n, () => update({ choice: n }), "#a78bfa", [12, -24, 0][n]))}</div>}
            {index === 1 && <div className={styles.sortLayout}><div className={styles.sortGrid}>{sortShapes.map((s, n) => shapeButton(s, n, a.selected.includes(n), () => update({ selected: a.selected.includes(n) ? a.selected.filter(v => v !== n) : [...a.selected, n] }), colours[n], [0, 0, 22, 90, 0, -30][n], n === 5 ? .65 : 1))}</div><div className={styles.reasons}><div className={styles.inline}><h3>Why do they belong together?</h3><ReadAloudBtn text="Why do they belong together?" className={styles.voice} /></div>{reasons.map((r, n) => <div className={styles.optionRow} key={r}><button aria-pressed={a.reason === n} onClick={() => update({ reason: n })}>{r}</button><ReadAloudBtn text={r} kind="option" className={styles.voice} /></div>)}</div></div>}
            {index === 2 && <div className={styles.workshop}><div className={styles.dotBoard}><svg viewBox="0 0 300 300" aria-hidden="true"><polygon points={a.points.map(p => `${p.x},${p.y}`).join(" ")} fill={a.points.length >= 3 ? "#ede9fe" : "none"} stroke="#6d28d9" strokeWidth="4" /></svg>{Array.from({ length: 9 }, (_, n) => { const p = { x: 50 + n % 3 * 100, y: 50 + Math.floor(n / 3) * 100 }; return <button key={n} data-tap-feedback="false" style={{ left: `${p.x / 3}%`, top: `${p.y / 3}%` }} aria-label={`Dot ${cellNames[n]}`} aria-pressed={a.points.some(v => v.x === p.x && v.y === p.y)} onClick={() => { if (!a.points.some(v => v.x === p.x && v.y === p.y)) update({ points: [...a.points, p] }); }} />; })}</div><div className={styles.tools}><button disabled={!a.points.length} onClick={() => update({ points: a.points.slice(0, -1) })}>↶ Undo</button><button disabled={!a.points.length} onClick={() => update({ points: [] })}>Clear</button></div></div>}
            {index === 3 && <div className={styles.workshop}><svg className={styles.pieceBoard} viewBox="0 0 320 240" onPointerMove={dragMove} onPointerUp={() => setDrag(null)} onPointerCancel={() => setDrag(null)} aria-label="Work area for two pieces">{Array.from({length: 77}, (_, n) => <circle key={n} cx={60 + n % 11 * 20} cy={60 + Math.floor(n / 11) * 20} r="2" fill="#b9b1cd" onClick={() => setPiecePoint(piece, 60 + n % 11 * 20, 60 + Math.floor(n / 11) * 20)} />)}{a.pieces.map((p, n) => <g key={n} transform={`translate(${p.x} ${p.y}) rotate(${p.turn * 90})`} onPointerDown={e => { setPiece(n); setDrag(n); e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId); }}><path d="M-40 -40 L40 40 L-40 40 Z" fill={n === 0 ? "#67e8f9" : "#c4b5fd"} stroke="#433878" strokeWidth="2" /><text x="-15" y="24" fontSize="15" fill="#21143f" pointerEvents="none">{n + 1}</text></g>)}</svg><div className={styles.tools}>{[0, 1].map(n => <button key={n} aria-pressed={piece === n} onClick={() => setPiece(n)}>Piece {n + 1}</button>)}<button onClick={() => update({ pieces: a.pieces.map((p, n) => n === piece ? { ...p, turn: (p.turn + 1) % 4 } : p) })}>↻ Turn</button><button onClick={() => update({ pieces: fresh().pieces })}>Reset</button></div><div className={styles.tools} aria-label="Move selected piece">{[{ label: "←", name: "left", x: -20, y: 0 }, { label: "↑", name: "up", x: 0, y: -20 }, { label: "↓", name: "down", x: 0, y: 20 }, { label: "→", name: "right", x: 20, y: 0 }].map(d => <button key={d.name} aria-label={`Move piece ${d.name}`} onClick={() => setPiecePoint(piece, Math.max(60, Math.min(260, a.pieces[piece].x + d.x)), Math.max(60, Math.min(180, a.pieces[piece].y + d.y)))}>{d.label}</button>)}<ReadAloudBtn text="Choose piece one or piece two. Use the arrows to move it, or drag it. Turn rotates the piece. Reset puts both pieces back." label="Read controls" className={styles.voice} /></div></div>}
            {index === 4 && <div className={styles.positionLayout}><div className={styles.scene}><PositionObjectVisual objectId="moon" className={styles.moon} /><PositionObjectVisual objectId="rocket" className={styles.rocket} /></div><div className={styles.reasons}>{["Above the rocket", "Below the rocket", "Beside the rocket"].map((r, n) => <div key={r} className={styles.optionRow}><button onClick={() => update({ choice: n })} aria-pressed={a.choice === n}>{r}</button><ReadAloudBtn text={r} kind="option" className={styles.voice} /></div>)}</div></div>}
            {index === 5 && <div className={styles.positionGrid}>{cellNames.map((name, n) => n === 4 ? <div key={n} className={styles.reference}><PositionObjectVisual objectId="rocket" className={styles.object} /></div> : <button key={n} aria-label={`Place explorer ${name}`} aria-pressed={a.cell === n} onClick={() => update({ cell: n })}>{a.cell === n ? <PositionObjectVisual objectId="explorer" className={styles.object} /> : <span>+</span>}</button>)}</div>}
          </div>
          <div className={styles.status} role="status">{a.submitted ? a.skipped ? "You chose ‘I don’t know’." : "Answer recorded." : ""}</div>
          <footer className={styles.footer}><button disabled={index === 0} onClick={() => moveTo(index - 1)}>← Back</button><button onClick={() => submit(true)}>I don’t know</button>{a.submitted ? <button className={styles.primary} disabled={index === 5} onClick={() => moveTo(index + 1)}>Next →</button> : <button className={styles.primary} disabled={!ready} onClick={() => submit()}>Done ✓</button>}</footer>
        </section>
        <details className={styles.notes} key={index}><summary>Reviewer notes & scoring</summary><p>{example.note}</p><button onClick={() => setShowResult(v => !v)}>{showResult ? "Hide" : "Show"} review result</button>{showResult && <p>{!a.submitted ? "Press Done to record an answer first." : a.skipped ? "I don’t know — no evidence recorded." : correct ? "This response meets the criterion." : "This response does not yet meet the criterion."}</p>}<p>Prototype only. No student results are saved. The full redesign will contain five matched forms of 20 questions, with new contexts and controlled difficulty.</p></details>
      </div>
    </main>
  );
}
