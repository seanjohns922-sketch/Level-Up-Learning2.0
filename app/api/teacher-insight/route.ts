import { NextResponse } from "next/server";
import { buildHeuristicTeacherInsight, type TeacherInsight, type TeacherInsightInput } from "@/lib/teacher-insights";

const OPENAI_INSIGHT_URL = "https://api.openai.com/v1/chat/completions";

function cleanInsight(candidate: Partial<TeacherInsight>, fallback: TeacherInsight): TeacherInsight {
  const pick = (value: unknown, backup: string) =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : backup;

  const allowedStatuses: TeacherInsight["status"][] = [
    "On Track",
    "Quick Check-in Recommended",
    "Needs Support",
    "Ready to Move On",
  ];

  const status = allowedStatuses.includes(candidate.status as TeacherInsight["status"])
    ? (candidate.status as TeacherInsight["status"])
    : fallback.status;

  return {
    status,
    strength: pick(candidate.strength, fallback.strength),
    gap: pick(candidate.gap, fallback.gap),
    likelyMisconception: pick(candidate.likelyMisconception, fallback.likelyMisconception),
    teacherAction: pick(candidate.teacherAction, fallback.teacherAction),
    recommendedRevisit: pick(candidate.recommendedRevisit, fallback.recommendedRevisit),
  };
}

async function generateAiInsight(input: TeacherInsightInput, fallback: TeacherInsight) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_INSIGHT_MODEL;
  if (!apiKey || !model) return fallback;

  const prompt = [
    "You are generating a short teacher dashboard insight from student maths attempt data.",
    "Return strict JSON with keys: status, strength, gap, likelyMisconception, teacherAction, recommendedRevisit.",
    "Rules:",
    "- Keep each field short and practical.",
    "- Focus on what the teacher should do next.",
    "- Do not shame the student.",
    "- Use one sentence per field.",
    `Attempt data: ${JSON.stringify(input)}`,
    `Fallback draft: ${JSON.stringify(fallback)}`,
  ].join("\n");

  const response = await fetch(OPENAI_INSIGHT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Generate concise teacher-facing maths lesson insights as JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) return fallback;

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) return fallback;

  try {
    return cleanInsight(JSON.parse(content) as Partial<TeacherInsight>, fallback);
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as TeacherInsightInput;
    if (!input || !input.studentId || !input.level || !input.week) {
      return NextResponse.json({ error: "Invalid insight request." }, { status: 400 });
    }

    const fallback = buildHeuristicTeacherInsight(input);
    const insight = await generateAiInsight(input, fallback);
    return NextResponse.json({ insight });
  } catch (error) {
    console.warn("[teacher-insight] failed", error);
    return NextResponse.json({ error: "Failed to build teacher insight." }, { status: 500 });
  }
}
