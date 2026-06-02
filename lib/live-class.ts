"use client";

export type LiveStudentStatus = "on_track" | "check_in" | "needs_support" | "idle";

/**
 * Richer per-student learning state derived from live telemetry.
 * Sits on top of the coarser LiveStudentStatus to give teachers more nuanced coaching cues.
 */
export type LearningState =
  | "confident"    // Answering correctly, good pace
  | "mastering"    // High accuracy + high progress
  | "improving"    // Getting it right after earlier errors
  | "recovering"   // Just got one right after a run of wrong
  | "struggling"   // Multiple consecutive incorrect answers
  | "persistent"   // Retrying same question without giving up
  | "guessing"     // Very fast wrong answers — likely not reading
  | "rushing"      // Fast answers, not checking work
  | "hesitating"   // Long time on question before attempting
  | "disengaged";  // Inactive but not fully idle

export function getLearningStateMeta(state: LearningState): {
  label: string;
  badge: string;
  dot: string;
  description: string;
} {
  switch (state) {
    case "mastering":
      return { label: "Mastering", badge: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500", description: "High accuracy at pace — let them lead." };
    case "confident":
      return { label: "Confident", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400", description: "Working steadily through the task." };
    case "improving":
      return { label: "Improving", badge: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500", description: "Getting it now after earlier errors." };
    case "recovering":
      return { label: "Recovering", badge: "bg-lime-50 text-lime-700 border-lime-200", dot: "bg-lime-500", description: "Just got one right — momentum returning." };
    case "struggling":
      return { label: "Struggling", badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", description: "Repeated errors — needs direct support." };
    case "persistent":
      return { label: "Persisting", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", description: "Trying again without giving up — guide the strategy." };
    case "guessing":
      return { label: "Guessing", badge: "bg-amber-50 text-amber-800 border-amber-200", dot: "bg-amber-500", description: "Choosing answers too fast — not reading the question." };
    case "rushing":
      return { label: "Rushing", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", description: "Moving fast — answers may not be thought through." };
    case "hesitating":
      return { label: "Hesitating", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", description: "Long pause before answering — may feel stuck." };
    case "disengaged":
      return { label: "Drifting", badge: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", description: "Not actively working — may need a prompt." };
  }
}

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
  learningState: LearningState;
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
  questionsAnswered?: number | null;
  correctCount?: number | null;
  accuracy?: number | null;
  completedAt?: string | null;
  skillTag?: string | null;
  misconceptionTag?: string | null;
  lastActiveAt?: string | null;
  updatedAt?: string | null;
};

export type LiveClassInsight = {
  title: string;
  headline: string;
  detail?: string;
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

function formatInactiveDuration(seconds: number): string {
  if (seconds >= 86400) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days !== 1 ? "s" : ""}`;
  }
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  const mins = Math.floor(seconds / 60);
  return `${mins} minute${mins !== 1 ? "s" : ""}`;
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

function determineLearningState(
  snapshot: LiveStudentSnapshot,
  secondsSinceActive: number,
  thresholds: LiveStatusThresholds
): LearningState {
  const timeOnQuestion = Math.max(0, snapshot.timeOnCurrentQuestion ?? 0);
  const questionAttempts = Math.max(0, snapshot.currentQuestionAttempts ?? 0);
  const consecutiveIncorrect = Math.max(0, snapshot.consecutiveIncorrectCount ?? 0);
  const sessionIncorrect = Math.max(0, snapshot.sessionIncorrectCount ?? 0);
  const progressPercent = Math.max(0, snapshot.progressPercent ?? 0);
  const latestCorrect = snapshot.latestAnswerCorrect;
  const latestEventType = snapshot.latestEventType;

  // Drifting — inactive but not fully idle
  if (secondsSinceActive >= 180 && secondsSinceActive < thresholds.idleSeconds) {
    return "disengaged";
  }

  // Guessing — answers very quickly but keeps getting it wrong
  if (timeOnQuestion > 0 && timeOnQuestion < 8 && consecutiveIncorrect >= 2 && latestCorrect === false) {
    return "guessing";
  }

  // Rushing — fast answer that was wrong
  if (timeOnQuestion > 0 && timeOnQuestion < 12 && latestCorrect === false && questionAttempts <= 1) {
    return "rushing";
  }

  // Struggling — consecutive wrong answers or repeated attempts on same question
  if (consecutiveIncorrect >= thresholds.needsSupportRecentIncorrectCount ||
      questionAttempts >= thresholds.needsSupportSameQuestionAttempts) {
    return "struggling";
  }

  // Persisting — retrying same question, hasn't given up
  if (questionAttempts >= 2 && latestCorrect !== true) {
    return "persistent";
  }

  // Hesitating — long time on question, no attempt yet
  if (timeOnQuestion >= thresholds.checkInTimeOnQuestionSeconds && questionAttempts === 0) {
    return "hesitating";
  }

  // Recovering — just got one right after a bad run
  if (latestCorrect === true && consecutiveIncorrect === 0 && sessionIncorrect >= 3) {
    return "recovering";
  }

  // Mastering — high progress, all correct, moving fast
  if (progressPercent >= 80 && consecutiveIncorrect === 0 && sessionIncorrect === 0 &&
      (latestEventType === "answer_correct" || latestEventType === "lesson_completed")) {
    return "mastering";
  }

  // Improving — recent correct answer after some earlier mistakes
  if (latestCorrect === true && sessionIncorrect > 0 && consecutiveIncorrect === 0) {
    return "improving";
  }

  // Confident — working well, answering correctly
  if (latestCorrect === true && consecutiveIncorrect === 0) {
    return "confident";
  }

  return "confident";
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

  const learningState = determineLearningState(snapshot, secondsSinceActive, thresholds);

  if (secondsSinceActive >= thresholds.idleSeconds) {
    const name = snapshot.studentName ?? "This student";
    return {
      status: "idle",
      statusLabel: STATUS_LABELS.idle,
      learningState,
      issue: `${name} has not submitted an answer for ${formatInactiveDuration(secondsSinceActive)}.`,
      likelyGap: "Student may be away from the device or needs a prompt to continue.",
      suggestedTeacherAction: "Prompt the student to continue their lesson.",
    };
  }

  // Accuracy alert — enough data and below 60%
  const sessionAccuracy = typeof snapshot.accuracy === "number" ? snapshot.accuracy : null;
  const qAnswered = snapshot.questionsAnswered ?? 0;
  if (sessionAccuracy !== null && sessionAccuracy < 60 && qAnswered >= 5) {
    const name = snapshot.studentName ?? "This student";
    return {
      status: "needs_support",
      statusLabel: STATUS_LABELS.needs_support,
      learningState,
      issue: `${name} has ${Math.round(sessionAccuracy)}% accuracy over ${qAnswered} questions.`,
      likelyGap: inferLikelyGap(snapshot),
      suggestedTeacherAction: "Teacher check-in recommended. Sit with the student to identify where they are getting stuck.",
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
      learningState === "guessing"
        ? `${name} is choosing answers too quickly — likely not reading the question`
        : learningState === "rushing"
        ? `${name} is rushing through questions without checking their work`
        : questionAttempts >= thresholds.needsSupportSameQuestionAttempts
        ? `${name} has made ${questionAttempts} attempt${questionAttempts !== 1 ? "s" : ""} on the same question${activityLabel ? ` in ${activityLabel}` : ""} without success`
        : incorrectCount >= thresholds.needsSupportRecentIncorrectCount
        ? `${name} has ${incorrectCount} consecutive incorrect answers${activityLabel ? ` on ${activityLabel}` : ""}`
        : `${name} has been on the same question for ${Math.floor(timeOnQuestion / 60)} min${Math.floor(timeOnQuestion / 60) !== 1 ? "s" : ""}${activityLabel ? ` in ${activityLabel}` : ""}`;
    return {
      status: "needs_support",
      statusLabel: STATUS_LABELS.needs_support,
      learningState,
      issue: sentenceCase(issueText),
      likelyGap: inferLikelyGap(snapshot),
      suggestedTeacherAction:
        learningState === "guessing"
          ? "Ask the student to read each option aloud before choosing — slow them down."
          : learningState === "rushing"
          ? "Ask the student to check their answer makes sense before submitting."
          : incorrectCount >= thresholds.needsSupportRecentIncorrectCount
          ? "Provide a worked example for this question type, then have the student try a similar problem."
          : inferSuggestedAction(snapshot),
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
    const qMins = Math.floor(timeOnQuestion / 60);
    const issueText = isInactiveCheckIn
      ? `${name} has no activity for ${formatInactiveDuration(secondsSinceActive)}`
      : learningState === "hesitating"
      ? `${name} has been reading the question for ${qMins} min without attempting${activityLabel ? ` in ${activityLabel}` : ""}`
      : latestEventType === "answer_incorrect"
      ? `${name} just answered incorrectly${activityLabel ? ` on ${activityLabel}` : ""}`
      : hintCount >= thresholds.checkInHintCount
      ? `${name} has used ${hintCount} hints${activityLabel ? ` on ${activityLabel}` : ""}`
      : `${name} has been on the current question for ${qMins} min${qMins !== 1 ? "s" : ""}`;
    return {
      status: "check_in",
      statusLabel: STATUS_LABELS.check_in,
      learningState,
      issue: sentenceCase(issueText),
      likelyGap: isInactiveCheckIn
        ? "Student may have stepped away or needs a prompt to continue."
        : inferLikelyGap(snapshot),
      suggestedTeacherAction: isInactiveCheckIn
        ? "Prompt the student to continue."
        : learningState === "hesitating"
        ? "Sit with the student — ask what they understand about the question before they attempt it."
        : latestEventType === "answer_incorrect"
        ? "Check in — ask the student to talk through their thinking on the question."
        : inferSuggestedAction(snapshot),
    };
  }

  const name = snapshot.studentName ?? "This student";
  const onTrackIssue =
    learningState === "mastering"
      ? `${name} is on a strong run — high accuracy and good pace.`
      : learningState === "recovering"
      ? `${name} corrected their errors and is back on track.`
      : learningState === "improving"
      ? `${name} has stopped making errors — momentum is building.`
      : null;

  const onTrackAction =
    learningState === "mastering"
      ? "Consider offering an extension challenge — they are ready for more."
      : learningState === "recovering" || learningState === "improving"
      ? "A brief acknowledgement will help maintain their momentum."
      : "No action needed — let the student continue independently.";

  return {
    status: "on_track",
    statusLabel: STATUS_LABELS.on_track,
    learningState,
    issue: onTrackIssue ?? "",
    likelyGap: "",
    suggestedTeacherAction: onTrackAction,
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
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days}d ${remainingHours}h ago`;
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

type ClassInsightRow = {
  studentId: string;
  studentName?: string | null;
  classId: string;
  skillTag?: string | null;
  misconceptionTag?: string | null;
  aiStatus?: LiveStudentStatus | null;
  learningState?: LearningState | null;
  accuracyPercent?: number | null;
  questionsAnswered?: number | null;
};

export function buildLiveClassInsight(rows: ClassInsightRow[]): LiveClassInsight {
  const total = rows.length;

  // Students with enough data to have meaningful accuracy
  const withAccuracy = rows.filter(
    (r) => r.accuracyPercent != null && (r.questionsAnswered ?? 0) >= 5
  );

  // Priority 1 — Accuracy Alert: 2+ students below 60%
  const lowAccuracy = withAccuracy.filter((r) => (r.accuracyPercent ?? 100) < 60);
  if (lowAccuracy.length >= 2) {
    const names = lowAccuracy
      .map((r) => r.studentName)
      .filter(Boolean)
      .slice(0, 3)
      .join(", ");
    return {
      title: "Accuracy Alert",
      headline: `${lowAccuracy.length} of ${total} students below 60% accuracy.`,
      detail: names || undefined,
      suggestedAction: "Check in with these students now. They may be stuck on a core concept.",
    };
  }

  const needsSupportRows = rows.filter((r) => (r.aiStatus ?? "on_track") === "needs_support");
  const flagged = rows.filter(
    (r) => (r.aiStatus ?? "on_track") === "needs_support" || (r.aiStatus ?? "on_track") === "check_in"
  );

  // Priority 2 — Most Struggled Skill: shared topic + multiple students below 70%
  const skillCounts = new Map<string, { count: number; names: string[] }>();
  for (const row of flagged) {
    const key = normalizeText(row.skillTag) || normalizeText(row.misconceptionTag) || null;
    if (!key) continue;
    const existing = skillCounts.get(key) ?? { count: 0, names: [] };
    existing.count += 1;
    if (row.studentName) existing.names.push(row.studentName);
    skillCounts.set(key, existing);
  }
  const [topSkill, topSkillData] =
    [...skillCounts.entries()].sort((a, b) => b[1].count - a[1].count)[0] ?? [null, null];

  if (topSkill && topSkillData && topSkillData.count >= 2) {
    const skillLabel = topSkill.replace(/_/g, " ");
    const pct = total > 0 ? Math.round((topSkillData.count / total) * 100) : 0;
    return {
      title: "Most Struggled Skill",
      headline: skillLabel,
      detail: `${topSkillData.count} of ${total} students flagged (${pct}%)`,
      suggestedAction: "Small-group reteach recommended. Pull these students together for a 10-minute targeted session.",
    };
  }

  // Priority 3 — Intervention Group: 2+ needs-support students
  if (needsSupportRows.length >= 2) {
    const names = needsSupportRows
      .map((r) => r.studentName)
      .filter(Boolean)
      .slice(0, 4)
      .join(", ");

    // Find any shared topic across them
    const groupTopics = new Map<string, number>();
    for (const r of needsSupportRows) {
      const key = normalizeText(r.skillTag) || normalizeText(r.misconceptionTag) || null;
      if (key) groupTopics.set(key, (groupTopics.get(key) ?? 0) + 1);
    }
    const [sharedTopic] = [...groupTopics.entries()].sort((a, b) => b[1] - a[1])[0] ?? [null];
    const topicLabel = sharedTopic ? sharedTopic.replace(/_/g, " ") : "current content";

    return {
      title: "Intervention Group",
      headline: names || `${needsSupportRows.length} students`,
      detail: `Shared difficulty: ${topicLabel}`,
      suggestedAction: "10-minute targeted intervention recommended for this group.",
    };
  }

  // Priority 4 — Single urgent student
  if (needsSupportRows.length === 1) {
    const row = needsSupportRows[0]!;
    const skill = normalizeText(row.skillTag) || normalizeText(row.misconceptionTag) || "current task";
    return {
      title: "Student Needs Support",
      headline: row.studentName ?? "1 student needs support",
      detail: skill !== "current task" ? skill.replace(/_/g, " ") : undefined,
      suggestedAction: "Check in with this student before continuing to circulate.",
    };
  }

  // Priority 5 — Class Accuracy (positive)
  if (withAccuracy.length >= 2) {
    const avg = Math.round(
      withAccuracy.reduce((sum, r) => sum + (r.accuracyPercent ?? 0), 0) / withAccuracy.length
    );
    const detail = `${withAccuracy.length} of ${total} students have lesson data`;
    if (avg >= 80) {
      return {
        title: "Class Accuracy",
        headline: `${avg}% class average`,
        detail,
        suggestedAction: "Students are progressing well. Consider extension challenges for high performers.",
      };
    }
    if (avg >= 65) {
      return {
        title: "Class Accuracy",
        headline: `${avg}% class average`,
        detail,
        suggestedAction: "Monitor for students dropping below 60%. Check in if accuracy falls.",
      };
    }
    return {
      title: "Class Accuracy",
      headline: `${avg}% class average — lower than expected`,
      detail,
      suggestedAction: "Consider pausing to review the current concept with the whole class.",
    };
  }

  // Fallback — not enough data yet
  return {
    title: "Class Insight",
    headline: "Waiting for lesson data",
    suggestedAction: "Ensure students have started their lesson. Insights will appear as they work.",
  };
}
