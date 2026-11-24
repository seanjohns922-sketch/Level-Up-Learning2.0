"use client";
// One battle being played: 20 questions at my level, the clock (it starts at LAUNCH), my friend's score
// (live, or a pretend friend in demo), streaks and POWER UPs, and sending my score when it's over.
import { useEffect, useMemo, useRef, useState } from "react";
import { BATTLE_QUESTIONS, BATTLE_SECONDS, battleQuestions } from "@/lib/battle-questions";
import { clashPoint, submitBattleScore, useLiveBattle, type BattleResult, type BattleToPlay } from "@/lib/battles";
import { readRexAnswer } from "@/lib/rex";

/** Right answers in a row for a POWER UP. */
export const POWER_UP_STREAK = 3;

export type BattleAnswer = "right" | "wrong" | "power";

/** Each explorer's own questions: the battle's seed mixed with who they are. */
function mySeed(battleSeed: number, studentId: string | null) {
  return battleSeed + [...(studentId ?? "demo")].reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 0);
}

export function useBattleGame({ battle, level, studentId, demo, running }: { battle: BattleToPlay; level: number; studentId: string | null; demo: boolean; running: boolean }) {
  const questions = useMemo(() => battleQuestions(battle.realm, level, mySeed(battle.seed, studentId)), [battle, level, studentId]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [powerUps, setPowerUps] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(BATTLE_SECONDS);
  const [quit, setQuit] = useState(false);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [demoFriend, setDemoFriend] = useState(0);
  const done = quit || index >= questions.length || secondsLeft <= 0;
  const live = useLiveBattle(battle.mode === "live" && !demo ? battle.id : null, studentId, correct, done);
  /** Live (or demo): the friend's score as they play. Take turns: unknown until the result. */
  const showLive = battle.mode === "live" || demo;
  const friendCorrect = demo ? demoFriend : showLive ? live.correct : 0;
  const submitted = useRef(false);

  useEffect(() => {
    if (!running || done) return;
    const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(tick);
  }, [running, done]);
  // The demo friend answers as you go, getting about three in four right.
  useEffect(() => {
    if (!demo || !running || done) return;
    const tick = window.setInterval(() => setDemoFriend((n) => Math.min(BATTLE_QUESTIONS, n + (Math.random() < 0.75 ? 1 : 0))), 6000);
    return () => window.clearInterval(tick);
  }, [demo, running, done]);
  useEffect(() => {
    if (!done || submitted.current) return;
    submitted.current = true;
    void submitBattleScore(studentId, demo, battle.id, correct, level, demo ? demoFriend : undefined)
      .then(setResult)
      .catch(() => setResult({ status: "error", xp: 0, myScore: correct }));
  }, [done, studentId, demo, battle.id, correct, level, demoFriend]);

  /** Checks a typed answer and moves on. Null when there's nothing to check. */
  const answer = (typed: string): BattleAnswer | null => {
    const value = readRexAnswer(typed);
    if (value === null || done || !running) return null;
    const right = value === questions[index].answer;
    setIndex((i) => i + 1);
    if (!right) { setStreak(0); return "wrong"; }
    setCorrect((n) => n + 1);
    const next = streak + 1;
    setStreak(next);
    if (next % POWER_UP_STREAK === 0) { setPowerUps((n) => n + 1); return "power"; }
    return "right";
  };

  return {
    question: done ? null : questions[index], index, total: questions.length, correct, friendCorrect, showLive,
    streak, powerUps, secondsLeft, done, result, answer, leave: () => setQuit(true),
    clash: clashPoint(correct, friendCorrect),
  };
}
