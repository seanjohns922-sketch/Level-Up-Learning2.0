type IncorrectFeedbackSpeechInput = {
  prompt?: string | null;
  studentAnswer?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
};

export function buildIncorrectFeedbackSpeech({
  prompt,
  studentAnswer,
  correctAnswer,
  explanation,
}: IncorrectFeedbackSpeechInput) {
  return [
    prompt?.trim() ? `Question. ${prompt.trim()}` : null,
    "Not quite.",
    studentAnswer?.trim() ? `Your answer was ${studentAnswer.trim()}.` : null,
    correctAnswer?.trim() ? `The correct answer is ${correctAnswer.trim()}.` : null,
    explanation?.trim() || null,
  ]
    .filter((part): part is string => Boolean(part))
    .join(" ");
}
