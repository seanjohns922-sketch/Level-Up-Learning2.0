"use client";

export type LiveStudentStatus = "on_track" | "check_in" | "needs_support" | "idle";

export type LiveStudentStatusLabel = "On Track" | "Check-in" | "Needs Support" | "Idle / Away";

export type LiveLearningEventType =
  | "lesson_started"
  | "activity_started"
  | "question_loaded"
  | "answer_submitted"
  | "answer_correct"
  | "answer_incorrect"
  | "hint_used"
  | "lesson_completed"
  | "quiz_started"
  | "quiz_completed"
  | "idle_detected";

export type LiveStudentInsight = {
  status: LiveStudentStatus;
  statusLabel: LiveStudentStatusLabel;
  issue: string;
  likelyGap: string;
  suggestedTeacherAction: string;
};

export type LiveStatusThresholds = {
  checkInTimeOnQuestionSeconds: number;
  needsSupportTimeOnQuestionSeconds: number;
  checkInIdleSeconds: number;
  idleSeconds: number;
  checkInHintCount: number;
  needsSupportSameQuestionAttempts: number;
  needsSupportRecentIncorrectCount: number;
};

export const DEFAULT_LIVE_STATUS_THRESHOLDS: LiveStatusThresholds = {
  checkInTimeOnQuestionSeconds: 90,
  needsSupportTimeOnQuestionSeconds: 180,
  checkInIdleSeconds: 90,
  idleSeconds: 120,
  checkInHintCount: 2,
  needsSupportSameQuestionAttempts: 2,
  needsSupportRecentIncorrectCount: 3,
};

export type LiveStudentSnapshot = {
  studentId: string;
  studentName?: string | null;
  classId: string;
  currentLevel?: string | null;
  currentStrand?: string | null;
  currentWeek?: number | null;
  currentLesson?: string | null;
  currentLessonTitle?: string | null;
  currentActivityId?: string | null;
  currentActivityLabel?: string | null;
  currentQuestionId?: string | null;
  currentQuestionText?: string | null;
  currentQuestionType?: string | null;
  currentQuestionOptions?: string[] | null;
  currentStepLabel?: string | null;
  progressPercent?: number | null;
  progressLabel?: string | null;
  latestEventType?: LiveLearningEventType | null;
  latestAnswerCorrect?: boolean | null;
  latestSelectedAnswer?: string | null;
  latestCorrectAnswer?: string | null;
  lastEventText?: string | null;
  timeOnCurrentQuestion?: number | null;
  currentQuestionAttempts?: number | null;
  sessionIncorrectCount?: number | null;
  consecutiveIncorrectCount?: number | null;
  sessionHintCount?: number | null;
  attemptNumber?: number | null;
  skillTag?: string | null;
  misconceptionTag?: string | null;
  lastActiveAt?: string | null;
  updatedAt?: string | null;
};

export type LiveClassInsight = {
  headline: string;
  suggestedAction: string;
};

const STATUS_LABELS: Record<LiveStudentStatus, LiveStudentStatusLabel> = {
  on_track: "On Track",
  check_in: "Check-in",
  needs_support: "Needs Support",
  idle: "Idle / Away",
};

function normalizeText(value?: string | null) {
  return String(value ?? "").trim();
}

function sentenceCase(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withCapital = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(withCapital) ? withCapital : `${withCapital}.`;
}

export function formatLiveStatusLabel(status: LiveStudentStatus) {
  return STATUS_LABELS[status];
}

export function getLiveStatusTone(status: LiveStudentStatus) {
  switch (status) {
    case "needs_support":
      return {
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700 border-rose-200",
        border: "border-rose-200",
      };
    case "check_in":
      return {
        dot: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        border: "border-amber-200",
      };
    case "idle":
      return {
        dot: "bg-slate-400",
        badge: "bg-slate-100 text-slate-600 border-slate-200",
        border: "border-slate-200",
      };
    default:
      return {
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
        border: "border-emerald-200",
      };
  }
}

function inferLikelyGap(snapshot: LiveStudentSnapshot) {
  const misconception = normalizeText(snapshot.misconceptionTag);
  if (misconception) return sentenceCase(misconception);

  const skillTag = normalizeText(snapshot.skillTag).toLowerCase();
  const questionText = normalizeText(snapshot.currentQuestionText).toLowerCase();

  if (skillTag.includes("discount") || questionText.includes("%") || questionText.includes("discount")) {
    return "May be mixing up the discount amount and the final price.";
  }
  if (skillTag.includes("unit_rate") || questionText.includes("per ") || questionText.includes("value")) {
    return "May not be comparing both options using the same unit.";
  }
  if (skillTag.includes("pattern") || questionText.includes("rule") || questionText.includes("sequence")) {
    return "May not have identified the rule before extending the pattern.";
  }
  if (skillTag.includes("coordinate") || questionText.includes("(") || questionText.includes("quadrant")) {
    return "May be mixing up x and y or the direction of negatives.";
  }
  if (skillTag.includes("equation") || questionText.includes("x") || questionText.includes("unknown")) {
    return "May need to undo the outer operation first to isolate the unknown.";
  }
  if (skillTag.includes("order") || questionText.includes("÷") || questionText.includes("×") || questionText.includes("bracket")) {
    return "May be solving left-to-right instead of following the operation priority.";
  }

  return "May need a quick strategy check before continuing.";
}

function inferSuggestedAction(snapshot: LiveStudentSnapshot) {
  const skillTag = normalizeText(snapshot.skillTag).toLowerCase();
  const questionText = normalizeText(snapshot.currentQuestionText).toLowerCase();

  if (skillTag.includes("discount") || questionText.includes("discount")) {
    return "Ask the student to find the discount amount first, then subtract it.";
  }
  if (skillTag.includes("unit_rate") || questionText.includes("per ")) {
    return "Ask the student to compare both options per one unit before choosing.";
  }
  if (skillTag.includes("pattern") || questionText.includes("sequence")) {
    return "Ask the student to say the rule aloud before finding the next term.";
  }
  if (skillTag.includes("coordinate") || questionText.includes("quadrant")) {
    return "Point to the axes and ask the student to move across first, then up or down.";
  }
  if (skillTag.includes("equation") || questionText.includes("unknown")) {
    return "Ask the student which operation happened last and how to undo it.";
  }
  if (skillTag.includes("order") || questionText.includes("÷") || questionText.includes("×")) {
    return "Ask the student to highlight the operation they must solve first.";
  }

  return "Check in now and ask the student to explain the strategy before solving.";
}

export function buildLiveStudentInsight(
  snapshot: LiveStudentSnapshot,
  thresholds: LiveStatusThresholds = DEFAULT_LIVE_STATUS_THRESHOLDS,
  now = Date.now()
): LiveStudentInsight {
  const lastActiveMs = snapshot.lastActiveAt ? new Date(snapshot.lastActiveAt).getTime() : 0;
  const secondsSinceActive =
    lastActiveMs > 0 ? Math.max(0, Math.round((now - lastActiveMs) / 1000)) : thresholds.idleSeconds;
  const timeOnQuestion = Math.max(0, snapshot.timeOnCurrentQuestion ?? 0);
  const questionAttempts = Math.max(0, snapshot.currentQuestionAttempts ?? 0);
  const incorrectCount = Math.max(0, snapshot.sessionIncorrectCount ?? 0);
  const hintCount = Math.max(0, snapshot.sessionHintCount ?? 0);
  const latestEventType = snapshot.latestEventType ?? null;

  if (secondsSinceActive >= thresholds.idleSeconds) {
    return {
      status: "idle",
      statusLabel: STATUS_LABELS.idle,
      issue: "No recent learning activity has been recorded.",
      likelyGap: "Student may be away from the task or needs a restart prompt.",
      suggestedTeacherAction: "Prompt the student to resume the current activity.",
    };
  }

  if (
    questionAttempts >= thresholds.needsSupportSameQuestionAttempts ||
    incorrectCount >= thresholds.needsSupportRecentIncorrectCount ||
    timeOnQuestion >= thresholds.needsSupportTimeOnQuestionSeconds
  ) {
    return {
      status: "needs_support",
      statusLabel: STATUS_LABELS.needs_support,
      issue: sentenceCase(
        latestEventType === "answer_incorrect"
          ? `${snapshot.studentName ?? "This student"} has repeated errors on the current question`
          : `${snapshot.studentName ?? "This student"} has been stuck on the same task for too long`
      ),
      likelyGap: inferLikelyGap(snapshot),
      suggestedTeacherAction: inferSuggestedAction(snapshot),
    };
  }

  if (
    timeOnQuestion >= thresholds.checkInTimeOnQuestionSeconds ||
    hintCount >= thresholds.checkInHintCount ||
    latestEventType === "answer_incorrect" ||
    secondsSinceActive >= thresholds.checkInIdleSeconds
  ) {
    return {
      status: "check_in",
      statusLabel: STATUS_LABELS.check_in,
      issue: sentenceCase(
        latestEventType === "answer_incorrect"
          ? `${snapshot.studentName ?? "This student"} has just missed a question`
          : `${snapshot.studentName ?? "This student"} may need a quick check-in soon`
      ),
      likelyGap: inferLikelyGap(snapshot),
      suggestedTeacherAction: inferSuggestedAction(snapshot),
    };
  }

  return {
    status: "on_track",
    statusLabel: STATUS_LABELS.on_track,
    issue: "Student is working steadily through the current task.",
    likelyGap: "No immediate gap is showing in the live data.",
    suggestedTeacherAction: "Let the student continue independently.",
  };
}

export function buildLastEventText(
  eventType: LiveLearningEventType,
  meta: {
    isCorrect?: boolean | null;
    timeOnQuestion?: number | null;
    progressLabel?: string | null;
  } = {}
) {
  switch (eventType) {
    case "lesson_started":
      return "Started lesson";
    case "activity_started":
      return "Started activity";
    case "question_loaded":
      return meta.timeOnQuestion && meta.timeOnQuestion > 0
        ? `On question for ${meta.timeOnQuestion}s`
        : "Opened a new question";
    case "answer_correct":
      return "Answered correctly just now";
    case "answer_incorrect":
      return "Answered incorrectly just now";
    case "hint_used":
      return "Used a hint";
    case "lesson_completed":
      return "Completed lesson";
    case "quiz_started":
      return "Started weekly quiz";
    case "quiz_completed":
      return "Completed weekly quiz";
    case "idle_detected":
      return "No recent activity";
    case "answer_submitted":
      return meta.isCorrect ? "Submitted a correct answer" : "Submitted an answer";
    default:
      return meta.progressLabel ? `Working on ${meta.progressLabel}` : "Working";
  }
}

export function formatRelativeTime(iso?: string | null, now = Date.now()) {
  if (!iso) return "No recent activity";
  const diffSeconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (diffSeconds < 10) return "active now";
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function formatTimeActive(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "0m";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const leftoverMinutes = minutes % 60;
  return leftoverMinutes > 0 ? `${hours}h ${leftoverMinutes}m` : `${hours}h`;
}

export function buildLiveClassInsight(
  rows: Array<LiveStudentSnapshot & { aiStatus?: LiveStudentStatus | null }>
): LiveClassInsight {
  const flagged = rows.filter((row) => (row.aiStatus ?? "on_track") === "needs_support" || (row.aiStatus ?? "on_track") === "check_in");
  if (flagged.length === 0) {
    return {
      headline: "Class Insight: Most students are moving steadily through their current work.",
      suggestedAction: "Suggested Action: Continue circulating and check completion pace.",
    };
  }

  const gapBuckets = new Map<string, number>();
  for (const row of flagged) {
    const key = normalizeText(row.skillTag) || normalizeText(row.misconceptionTag) || "current task";
    gapBuckets.set(key, (gapBuckets.get(key) ?? 0) + 1);
  }

  const [topGap, topCount] =
    [...gapBuckets.entries()].sort((left, right) => right[1] - left[1])[0] ?? ["current task", 0];

  const label =
    topGap === "current task"
      ? `${topCount} students need support on their current task`
      : `${topCount} students are struggling with ${topGap.replace(/_/g, " ")}`;

  const suggestedAction =
    topGap.toLowerCase().includes("discount")
      ? "Pause for a quick reteach on finding the discount amount before subtracting."
      : topGap.toLowerCase().includes("coordinate")
      ? "Model one example on the axes: across first, then up or down."
      : topGap.toLowerCase().includes("equation")
      ? "Reteach how to undo the outside operation first."
      : "Check in with the flagged students first, then decide if a brief reteach is needed.";

  return {
    headline: `Class Insight: ${label}.`,
    suggestedAction: `Suggested Action: ${suggestedAction}`,
  };
}
