import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";
import { pickElapsed, fmtDur } from "@/data/activities/year4Measurelands/week6Common";

// ── Measurelands · Level 4 · Week 6 · Lesson 2 — "Elapsed Time" (AC9M4M03) ──
// Calculate how long (end − start) and the finish time (start + duration), using
// interactive setters and the reusable timeline. 12-hour am/pm, no midday cross.
//   A. howLong    — set the duration between the start and finish clocks.
//   B. finishTime — set the finish time from a start + duration.
//   C. timeline   — tap the timeline to set the finish.

type TimeTask = Extract<PracticeTask, { kind: "timeQuest" }>;

type LessonMemory = { introShown: boolean; cursor: number };
const lessonMemory = new Map<string, LessonMemory>();
const ROTATION: Array<"howLong" | "finishTime" | "timeline"> = ["howLong", "finishTime", "timeline", "howLong", "finishTime", "timeline"];

function getMemory(lessonId: string): LessonMemory {
  const existing = lessonMemory.get(lessonId);
  if (existing) return existing;
  const created: LessonMemory = { introShown: false, cursor: 0 };
  lessonMemory.set(lessonId, created);
  return created;
}

function floorHour(min: number) { return Math.floor(min / 60) * 60; }
function ceilHour(min: number) { return Math.ceil(min / 60) * 60; }

function buildIntroTask(): TimeTask {
  const { start, dur, finish } = pickElapsed(90);
  return {
    kind: "timeQuest",
    scene: "intro",
    prompt: "Elapsed time is the time that passes.",
    speakText:
      "Professor Gauge says: elapsed time tells us how much time passes between a start and a finish. Picture a timeline — mark the start, mark the finish, and the gap between them is the duration.",
    badgeLabel: "Meazurex Mission",
    startMin: start, finishMin: finish, durationMin: dur,
    feedback: { correct: "Let's calculate!", wrong: "Let's calculate!" },
  };
}

// Activity A — How Long? (set the duration).
function buildHowLongTask(): TimeTask {
  const { start, dur, finish } = pickElapsed(120);
  return {
    kind: "timeQuest",
    scene: "howLong",
    prompt: "How long is it from start to finish?",
    speakText: "Look at the start and finish clocks. Set how much time passes between them.",
    badgeLabel: "How Long?",
    startMin: start, finishMin: finish, durationMin: dur,
    feedback: { correct: `Yes — that's ${fmtDur(dur)}.`, wrong: `Count on from the start time — it's ${fmtDur(dur)}.` },
  };
}

// Activity B — Finish Time (set the finish clock).
function buildFinishTask(): TimeTask {
  const { start, dur, finish } = pickElapsed(120);
  return {
    kind: "timeQuest",
    scene: "finishTime",
    prompt: "What time does it finish?",
    speakText: "It starts at the time shown and lasts for the duration. Set the finish time.",
    badgeLabel: "Finish Time",
    startMin: start, durationMin: dur, answerMin: finish,
    feedback: { correct: "Yes — that's the finish time.", wrong: "Count on by the duration from the start time." },
  };
}

// Activity C — Timeline Challenge (tap to set the finish).
function buildTimelineTask(): TimeTask {
  const { start, dur, finish } = pickElapsed(120);
  return {
    kind: "timeQuest",
    scene: "timeline",
    prompt: `It starts at the green mark and lasts ${fmtDur(dur)}. Tap where it finishes.`,
    speakText: `The event starts at the green mark and lasts ${fmtDur(dur)}. Tap the timeline where it finishes.`,
    badgeLabel: "Timeline Challenge",
    startMin: start, durationMin: dur, answerMin: finish,
    rangeStartMin: floorHour(start), rangeEndMin: ceilHour(finish) + 60,
    feedback: { correct: `Yes — it finishes then, ${fmtDur(dur)} later.`, wrong: `Move ${fmtDur(dur)} along from the start.` },
  };
}

export function generateY4MeasurelandsWeek6Lesson2Task(lessonId: string, _difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (!memory.introShown) { memory.introShown = true; return buildIntroTask(); }
  const activity = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  if (activity === "finishTime") return buildFinishTask();
  if (activity === "timeline") return buildTimelineTask();
  return buildHowLongTask();
}

export function resetY4MeasurelandsWeek6Lesson2TaskSessionState() { lessonMemory.clear(); }

export function buildY4MeasurelandsWeek6Lesson2QuizTasks(): PracticeTask[] {
  return [buildHowLongTask(), buildFinishTask(), buildTimelineTask(), buildHowLongTask(), buildFinishTask()];
}
