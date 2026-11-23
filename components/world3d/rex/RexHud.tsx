"use client";
// Rex's panels over the hub: the warning while he chases, five easy questions to tame him (typed,
// marked here, a worked hint when wrong), the reward, and the reminder that a lesson sends him home.
import { useMemo, useRef, useState } from "react";
import { readRexAnswer, rexQuestion, rexRandom, REX_QUESTIONS } from "@/lib/rex";
import type { RexState } from "@/lib/rex-client";

const VIOLET = "#C94DF2", INK = "rgba(20,14,40,.94)";
const card: React.CSSProperties = { background: INK, color: "#fff", borderRadius: 22, border: `2px solid ${VIOLET}99`, boxShadow: "0 18px 50px rgba(0,0,0,.4)", fontFamily: "Inter, system-ui, sans-serif" };
const bigButton = (background: string, color = "#fff"): React.CSSProperties => ({ minHeight: 54, border: 0, borderRadius: 14, background, color, fontWeight: 900, fontSize: 18, letterSpacing: ".04em", cursor: "pointer", fontFamily: "Montserrat, Inter, sans-serif" });

const seedFrom = (text: string) => [...text].reduce((hash, ch) => (hash * 31 + ch.charCodeAt(0)) >>> 0, 7);

function Dots({ done }: { done: number }) {
  return <div style={{ display: "flex", gap: 6 }} aria-label={`${done} of ${REX_QUESTIONS} right`}>{Array.from({ length: REX_QUESTIONS }, (_, i) => <span key={i} style={{ width: 14, height: 14, borderRadius: 99, background: i < done ? "#7dff8a" : "rgba(255,255,255,.22)" }} />)}</div>;
}

/** The five questions. Wrong answers show how to work it out, then a fresh question. */
function RexQuestions({ level, seed, onTamed, onClose }: { level: number; seed: string; onTamed: (correct: number) => void; onClose: () => void }) {
  const rnd = useMemo(() => rexRandom(seedFrom(seed)), [seed]);
  const [question, setQuestion] = useState(() => rexQuestion(level, rnd));
  const [right, setRight] = useState(0);
  const [typed, setTyped] = useState("");
  const [wrong, setWrong] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const next = () => { setQuestion(rexQuestion(level, rnd)); setTyped(""); setWrong(null); requestAnimationFrame(() => input.current?.focus()); };
  const check = () => {
    const value = readRexAnswer(typed);
    if (value === null) return;
    if (value === question.answer) {
      const done = right + 1;
      setRight(done);
      if (done >= REX_QUESTIONS) onTamed(done); else next();
    } else setWrong(typed.trim());
  };
  return (
    <div role="dialog" aria-label="Tame Rex" style={{ ...card, position: "absolute", right: "max(16px, 4vw)", top: "50%", transform: "translateY(-50%)", width: "min(400px, calc(100vw - 32px))", padding: 24, display: "flex", flexDirection: "column", gap: 14, zIndex: 60, borderColor: wrong ? "#ff8a5a" : `${VIOLET}99` }}
      onPointerDown={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()} onKeyUp={(event) => event.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: ".12em", color: wrong ? "#ffc2a8" : "#e9b8fa" }}>{wrong ? "NOT QUITE" : `QUESTION ${right + 1} OF ${REX_QUESTIONS}`}</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}><Dots done={right} /><button type="button" onClick={onClose} aria-label="Run away instead" style={{ border: 0, background: "transparent", color: "#fff", fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button></div>
      </div>
      <div style={{ fontSize: 46, fontWeight: 900, fontFamily: "Montserrat, Inter, sans-serif", lineHeight: 1.1 }}>{question.prompt}</div>
      {wrong ? <>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>You said {wrong}. The answer is <b>{question.answer}</b>. {question.help}</p>
        <button type="button" onClick={next} style={bigButton("#ffcf4a", "#3a2a00")} autoFocus>TRY ANOTHER</button>
        <p style={{ margin: 0, fontSize: 13, opacity: .75 }}>Rex snaps, but he never catches you. A wrong answer just means one more question.</p>
      </> : <form onSubmit={(event) => { event.preventDefault(); check(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input ref={input} value={typed} onChange={(event) => setTyped(event.target.value)} inputMode="decimal" autoComplete="off" autoFocus aria-label="Your answer"
          style={{ height: 62, borderRadius: 14, border: 0, background: "#fff", color: "#1f2328", fontSize: 32, fontWeight: 900, padding: "0 18px" }} />
        <button type="submit" disabled={readRexAnswer(typed) === null} style={{ ...bigButton("#7dff8a", "#103a17"), opacity: readRexAnswer(typed) === null ? 0.55 : 1 }}>CHECK</button>
      </form>}
      <a href="/credits" target="_blank" rel="noreferrer" style={{ fontSize: 11, opacity: .55, color: "#fff" }}>Rex model by quander (CC BY 4.0)</a>
    </div>
  );
}

const SENT_BY: Record<string, string> = { teacher: "Your teacher sent Rex!", parent: "Rex has come to visit!", timer: "You've been building for a while…" };

export function RexHud({ rex, level, onStartLesson }: { rex: RexState; level: number; onStartLesson: () => void }) {
  if (rex.phase === "away" || !rex.visit) return null;
  const banner = (text: string, background: string) => (
    <div style={{ position: "absolute", top: "max(168px, calc(env(safe-area-inset-top) + 160px))", left: "50%", transform: "translateX(-50%)", zIndex: 55, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none", width: "min(560px, calc(100vw - 32px))" }}>
      <div style={{ background, color: "#fff", padding: "11px 24px", borderRadius: 999, fontFamily: "Montserrat, Inter, sans-serif", fontWeight: 900, fontSize: "clamp(16px, 2.4vw, 22px)", letterSpacing: ".04em", boxShadow: "0 10px 30px rgba(0,0,0,.35)", textAlign: "center" }}>{text}</div>
    </div>
  );
  if (rex.phase === "answering") return <>{banner("FACE REX: 5 RIGHT TAMES HIM", VIOLET)}<RexQuestions level={level} seed={rex.visit.id} onTamed={(correct) => void rex.tame(correct)} onClose={rex.stopAnswering} /></>;
  if (rex.phase === "chasing") return <>
    {banner("REX IS AWAKE! RUN!", "#e5302a")}
    <div style={{ ...card, position: "absolute", top: "max(226px, calc(env(safe-area-inset-top) + 218px))", left: "50%", transform: "translateX(-50%)", zIndex: 55, padding: "14px 18px", width: "min(420px, calc(100vw - 32px))", display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 900, fontSize: 16 }}>{SENT_BY[rex.visit.source]}</div><div style={{ opacity: .8, fontSize: 14 }}>Answer {REX_QUESTIONS} easy questions to tame him.</div></div>
      <button type="button" onClick={rex.startAnswering} style={{ ...bigButton(VIOLET), padding: "0 20px" }}>ANSWER</button>
    </div>
  </>;
  // Tamed: the reward once, then the lesson reminder.
  return <>
    {banner(rex.paidXp ? `REX IS TAMED · +${rex.paidXp} XP` : "REX IS TAMED", "#6d3fd6")}
    <div style={{ ...card, position: "absolute", top: "max(226px, calc(env(safe-area-inset-top) + 218px))", left: "50%", transform: "translateX(-50%)", zIndex: 55, padding: "14px 18px", width: "min(440px, calc(100vw - 32px))", display: "flex", gap: 14, alignItems: "center" }}>
      <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 900, fontSize: 16 }}>Rex is following you</div><div style={{ opacity: .8, fontSize: 14 }}>{rex.paidXp === 0 ? `You've had today's Rex XP. ` : ""}Finish a lesson to send him home.</div></div>
      <button type="button" onClick={() => { rex.leaveForLesson(); onStartLesson(); }} style={{ ...bigButton("#7dff8a", "#103a17"), padding: "0 18px" }}>START A LESSON</button>
    </div>
  </>;
}
