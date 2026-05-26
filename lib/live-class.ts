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
  checkInIdleSeconds: 540,
  idleSeconds: 600,
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

  // ── Place value / MAB ──
  if (skillTag.includes("place_value") || skillTag.includes("mab") || skillTag.includes("base_ten") ||
      questionText.includes("mab") || questionText.includes("hundreds") || questionText.includes("tens") ||
      questionText.includes("ones") || questionText.includes("digit") || (questionText.includes("value") && !questionText.includes("per "))) {
    return "May be confusing the value of each position — mixing up hundreds, tens and ones.";
  }
  // ── Number lines ──
  if (skillTag.includes("number_line") || questionText.includes("number line") || questionText.includes("place") && questionText.match(/\d{2,}/)) {
    return "May not be partitioning the intervals correctly to locate the number.";
  }
  // ── Rounding ──
  if (skillTag.includes("round") || questionText.includes("round") || questionText.includes("nearest")) {
    return "May be rounding to the wrong place value or not identifying the midpoint correctly.";
  }
  // ── Skip counting / sequences ──
  if (skillTag.includes("skip_count") || skillTag.includes("count_by") || questionText.includes("skip") ||
      questionText.includes("count by") || questionText.includes("rule") || questionText.includes("sequence")) {
    return "May not have identified the rule before extending the sequence.";
  }
  // ── Addition / subtraction with regrouping ──
  if (skillTag.includes("addition") || skillTag.includes("subtraction") || skillTag.includes("regroup") ||
      skillTag.includes("carrying") || questionText.includes("add") || questionText.includes("subtract") ||
      questionText.includes("difference") || questionText.includes("total")) {
    return "May be struggling with regrouping (carrying or trading) across place value columns.";
  }
  // ── Multiplication / times tables ──
  if (skillTag.includes("multiplication") || skillTag.includes("times_table") || skillTag.includes("factor") ||
      questionText.includes("multiply") || questionText.includes("times") || questionText.includes("product")) {
    return "May not have a reliable strategy — could be guessing rather than using a known fact or array.";
  }
  // ── Division ──
  if (skillTag.includes("division") || questionText.includes("divid") || questionText.includes("share") || questionText.includes("groups of")) {
    return "May be unsure of the relationship between multiplication and division, or losing track of remainders.";
  }
  // ── Fractions ──
  if (skillTag.includes("fraction") || questionText.includes("fraction") || questionText.includes("numerator") ||
      questionText.includes("denominator") || questionText.includes("/") || questionText.includes("half") || questionText.includes("quarter")) {
    return "May be treating the numerator and denominator as separate whole numbers rather than as a ratio.";
  }
  // ── Time ──
  if (skillTag.includes("time") || skillTag.includes("clock") || questionText.includes("o'clock") ||
      questionText.includes("minutes") || questionText.includes("hours") || questionText.includes("duration")) {
    return "May be misreading the clock hands or not converting between hours and minutes correctly.";
  }
  // ── Money ──
  if (skillTag.includes("money") || skillTag.includes("change") || questionText.includes("$") ||
      questionText.includes("change") || questionText.includes("cost") || questionText.includes("price")) {
    return "May be struggling to calculate change — subtracting the cost from the amount paid.";
  }
  // ── Measurement ──
  if (skillTag.includes("measurement") || skillTag.includes("length") || skillTag.includes("mass") ||
      skillTag.includes("volume") || skillTag.includes("capacity") || questionText.includes("cm") ||
      questionText.includes("metre") || questionText.includes("kg") || questionText.includes("litre")) {
    return "May be confusing units or not converting between units (e.g. cm to m) correctly.";
  }
  // ── Area / perimeter ──
  if (skillTag.includes("area") || skillTag.includes("perimeter") || questionText.includes("area") || questionText.includes("perimeter")) {
    return "May be mixing up area (total squares) and perimeter (total edge length).";
  }
  // ── Data / graphs ──
  if (skillTag.includes("data") || skillTag.includes("graph") || skillTag.includes("tally") ||
      questionText.includes("graph") || questionText.includes("tally") || questionText.includes("table")) {
    return "May be misreading the scale or not matching data labels to the correct values.";
  }
  // ── Patterns ──
  if (skillTag.includes("pattern") || questionText.includes("pattern")) {
    return "May not have identified the rule before extending the pattern.";
  }
  // ── Geometry / shape ──
  if (skillTag.includes("shape") || skillTag.includes("geometry") || skillTag.includes("angle") ||
      questionText.includes("shape") || questionText.includes("angle") || questionText.includes("triangle")) {
    return "May be relying on appearance rather than properties to identify the shape.";
  }
  // ── Order of operations (upper years) ──
  if (skillTag.includes("order") || questionText.includes("÷") || questionText.includes("×") || questionText.includes("bracket")) {
    return "May be solving left-to-right instead of following the operation priority.";
  }
  // ── Percentages / discount ──
  if (skillTag.includes("discount") || skillTag.includes("percent") || questionText.includes("%") || questionText.includes("discount")) {
    return "May be mixing up the discount amount and the final price.";
  }
  // ── Unit rates / best buys ──
  if (skillTag.includes("unit_rate") || questionText.includes("per ")) {
    return "May not be comparing both options using the same unit.";
  }
  // ── Coordinates ──
  if (skillTag.includes("coordinate") || questionText.includes("quadrant") || questionText.includes("grid")) {
    return "May be mixing up x and y or the direction of negatives on the grid.";
  }
  // ── Equations / unknowns ──
  if (skillTag.includes("equation") || questionText.includes("unknown") || questionText.includes("= ?")) {
    return "May need to undo the outer operation first to isolate the unknown.";
  }

  return "May need a strategy check — ask them to explain what they tried before answering.";
}

function inferSuggestedAction(snapshot: LiveStudentSnapshot) {
  const skillTag = normalizeText(snapshot.skillTag).toLowerCase();
  const questionText = normalizeText(snapshot.currentQuestionText).toLowerCase();

  // ── Place value / MAB ──
  if (skillTag.includes("place_value") || skillTag.includes("mab") || skillTag.includes("base_ten") ||
      questionText.includes("mab") || questionText.includes("hundreds") || questionText.includes("tens") ||
      questionText.includes("ones") || questionText.includes("digit") || (questionText.includes("value") && !questionText.includes("per "))) {
    return "Ask the student to draw or build the number using MAB blocks — one column at a time — before writing the answer.";
  }
  // ── Number lines ──
  if (skillTag.includes("number_line") || questionText.includes("number line") || questionText.includes("place") && questionText.match(/\d{2,}/)) {
    return "Ask the student to identify the start and end values first, count the intervals, then estimate where the number sits.";
  }
  // ── Rounding ──
  if (skillTag.includes("round") || questionText.includes("round") || questionText.includes("nearest")) {
    return "Ask the student to underline the digit they're rounding and look at the next digit to decide up or down.";
  }
  // ── Skip counting / sequences ──
  if (skillTag.includes("skip_count") || skillTag.includes("count_by") || questionText.includes("skip") ||
      questionText.includes("count by") || questionText.includes("rule") || questionText.includes("sequence")) {
    return "Ask the student to say the pattern aloud, identify the jump size, then continue the sequence step by step.";
  }
  // ── Addition / subtraction ──
  if (skillTag.includes("addition") || skillTag.includes("subtraction") || skillTag.includes("regroup") ||
      skillTag.includes("carrying") || questionText.includes("add") || questionText.includes("subtract") ||
      questionText.includes("difference") || questionText.includes("total")) {
    return "Ask the student to line up the digits by place value and work through regrouping one column at a time.";
  }
  // ── Multiplication ──
  if (skillTag.includes("multiplication") || skillTag.includes("times_table") || skillTag.includes("factor") ||
      questionText.includes("multiply") || questionText.includes("times") || questionText.includes("product")) {
    return "Ask the student to use an array or repeated addition to build the answer from a fact they know.";
  }
  // ── Division ──
  if (skillTag.includes("division") || questionText.includes("divid") || questionText.includes("share") || questionText.includes("groups of")) {
    return "Ask the student to think of the related multiplication fact — what times the divisor gets close to the dividend?";
  }
  // ── Fractions ──
  if (skillTag.includes("fraction") || questionText.includes("fraction") || questionText.includes("numerator") ||
      questionText.includes("denominator") || questionText.includes("half") || questionText.includes("quarter")) {
    return "Ask the student to draw a model (bar or circle) and shade the fraction before choosing the answer.";
  }
  // ── Time ──
  if (skillTag.includes("time") || skillTag.includes("clock") || questionText.includes("o'clock") ||
      questionText.includes("minutes") || questionText.includes("hours") || questionText.includes("duration")) {
    return "Ask the student to sketch the clock or timeline and count the intervals rather than guessing.";
  }
  // ── Money ──
  if (skillTag.includes("money") || skillTag.includes("change") || questionText.includes("$") ||
      questionText.includes("change") || questionText.includes("cost") || questionText.includes("price")) {
    return "Ask the student to count up from the price to the amount paid to find the change.";
  }
  // ── Measurement ──
  if (skillTag.includes("measurement") || skillTag.includes("length") || skillTag.includes("mass") ||
      skillTag.includes("volume") || questionText.includes("cm") || questionText.includes("metre") || questionText.includes("kg")) {
    return "Ask the student to write the conversion factor (e.g. 100 cm = 1 m) and then apply it.";
  }
  // ── Area / perimeter ──
  if (skillTag.includes("area") || skillTag.includes("perimeter") || questionText.includes("area") || questionText.includes("perimeter")) {
    return "Ask the student to label whether they need the total inside (area) or the total edge (perimeter), then choose the right formula.";
  }
  // ── Data / graphs ──
  if (skillTag.includes("data") || skillTag.includes("graph") || skillTag.includes("tally") ||
      questionText.includes("graph") || questionText.includes("tally") || questionText.includes("table")) {
    return "Point to the scale or key and ask the student to re-read the value for the category in question.";
  }
  // ── Patterns ──
  if (skillTag.includes("pattern") || questionText.includes("pattern")) {
    return "Ask the student to say the rule aloud before finding the next term.";
  }
  // ── Geometry ──
  if (skillTag.includes("shape") || skillTag.includes("geometry") || skillTag.includes("angle") ||
      questionText.includes("shape") || questionText.includes("angle")) {
    return "Ask the student to list the properties (sides, angles) of the shape rather than going by looks alone.";
  }
  // ── Order of operations ──
  if (skillTag.includes("order") || questionText.includes("÷") || questionText.includes("×") || questionText.includes("bracket")) {
    return "Ask the student to highlight the operation they must solve first before doing any calculation.";
  }
  // ── Percentages / discount ──
  if (skillTag.includes("discount") || skillTag.includes("percent") || questionText.includes("%") || questionText.includes("discount")) {
    return "Ask the student to find the discount amount first, then subtract it from the original price.";
  }
  // ── Unit rates ──
  if (skillTag.includes("unit_rate") || questionText.includes("per ")) {
    return "Ask the student to compare both options per one unit before deciding.";
  }
  // ── Coordinates ──
  if (skillTag.includes("coordinate") || questionText.includes("quadrant") || questionText.includes("grid")) {
    return "Point to the axes and ask the student to move across first (x), then up or down (y).";
  }
  // ── Equations / unknowns ──
  if (skillTag.includes("equation") || questionText.includes("unknown") || questionText.includes("= ?")) {
    return "Ask the student which operation happened last and how they would undo it to find the missing value.";
  }

  return "Sit with the student and ask them to talk through what they tried — listen for where their reasoning breaks down.";
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
  // Use consecutive incorrect count (resets on correct answer / new activity) rather than
  // session total, which accumulates across all lessons and causes false "Needs Support"
  const incorrectCount = Math.max(0, snapshot.consecutiveIncorrectCount ?? snapshot.sessionIncorrectCount ?? 0);
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
    const name = snapshot.studentName ?? "This student";
    const activityLabel = snapshot.currentActivityLabel ?? snapshot.currentLessonTitle ?? null;
    const issueText =
      questionAttempts >= thresholds.needsSupportSameQuestionAttempts
        ? `${name} has made ${questionAttempts} attempt${questionAttempts !== 1 ? "s" : ""} on the same question${activityLabel ? ` in ${activityLabel}` : ""} without success`
        : incorrectCount >= thresholds.needsSupportRecentIncorrectCount
        ? `${name} has got ${incorrectCount} in a row wrong${activityLabel ? ` on ${activityLabel}` : ""}`
        : `${name} has been on the same question for ${Math.floor(timeOnQuestion / 60)} min${Math.floor(timeOnQuestion / 60) !== 1 ? "s" : ""}${activityLabel ? ` in ${activityLabel}` : ""}`;
    return {
      status: "needs_support",
      statusLabel: STATUS_LABELS.needs_support,
      issue: sentenceCase(issueText),
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
    const isInactiveCheckIn = secondsSinceActive >= thresholds.checkInIdleSeconds;
    const name = snapshot.studentName ?? "This student";
    const activityLabel = snapshot.currentActivityLabel ?? snapshot.currentLessonTitle ?? null;
    const issueText = isInactiveCheckIn
      ? `${name} has been inactive for ${Math.floor(secondsSinceActive / 60)} minute${Math.floor(secondsSinceActive / 60) !== 1 ? "s" : ""}`
      : latestEventType === "answer_incorrect"
      ? `${name} just answered incorrectly${activityLabel ? ` on ${activityLabel}` : ""}`
      : hintCount >= thresholds.checkInHintCount
      ? `${name} has used ${hintCount} hints${activityLabel ? ` on ${activityLabel}` : ""} — may need guidance`
      : `${name} has been on the current question for ${Math.floor(timeOnQuestion / 60)} min${Math.floor(timeOnQuestion / 60) !== 1 ? "s" : ""}`;
    return {
      status: "check_in",
      statusLabel: STATUS_LABELS.check_in,
      issue: sentenceCase(issueText),
      likelyGap: isInactiveCheckIn
        ? "The task may be incomplete, or the student may have stepped away from the app."
        : inferLikelyGap(snapshot),
      suggestedTeacherAction: isInactiveCheckIn
        ? "Check whether the student has paused the task and decide whether to restart or continue."
        : inferSuggestedAction(snapshot),
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
