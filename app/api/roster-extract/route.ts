import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://dqncplrxjxvjqbmwcyia.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo";
const MAX_REQUEST_CHARACTERS = 12_000_000;
const ALLOWED_IMAGE_PREFIXES = ["data:image/jpeg;base64,", "data:image/png;base64,", "data:image/webp;base64,"];

type ExtractedStudent = {
  firstName?: unknown;
  lastName?: unknown;
  fullName?: unknown;
  schoolYear?: unknown;
  username?: unknown;
  pin?: unknown;
};

function clean(value: unknown, maxLength: number) {
  return String(value ?? "").trim().slice(0, maxLength);
}

async function authenticateTeacher(authorization: string | null) {
  if (!authorization?.startsWith("Bearer ")) return false;

  const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: authorization },
    cache: "no-store",
  });
  if (!userResponse.ok) return false;
  const user = (await userResponse.json()) as { id?: string };
  if (!user.id) return false;

  const teacherResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/teachers?id=eq.${encodeURIComponent(user.id)}&select=id&limit=1`,
    {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: authorization },
      cache: "no-store",
    }
  );
  if (!teacherResponse.ok) return false;
  const teachers = (await teacherResponse.json()) as Array<{ id?: string }>;
  return teachers.some((teacher) => teacher.id === user.id);
}

export async function POST(request: NextRequest) {
  if (!(await authenticateTeacher(request.headers.get("authorization")))) {
    return NextResponse.json({ error: "Teacher login required" }, { status: 401 });
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_REQUEST_CHARACTERS) {
    return NextResponse.json({ error: "Image is too large" }, { status: 413 });
  }

  let body: { imageDataUrl?: unknown; defaultYear?: unknown };
  try {
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const imageDataUrl = clean(body.imageDataUrl, MAX_REQUEST_CHARACTERS);
  if (!ALLOWED_IMAGE_PREFIXES.some((prefix) => imageDataUrl.startsWith(prefix))) {
    return NextResponse.json({ error: "Use a PNG, JPEG or WebP image" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Roster image extraction is not configured" }, { status: 503 });
  }

  const defaultYear = clean(body.defaultYear, 20);
  const model = process.env.OPENAI_ROSTER_MODEL ?? process.env.OPENAI_INSIGHT_MODEL ?? "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Extract printed roster text only. Never identify a person from their face, appearance, seating position or photograph. Do not infer or invent missing names or credentials. Return JSON only.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Read up to 60 student rows from this roster screenshot. Return {"students":[{"firstName":"","lastName":"","fullName":"","schoolYear":"","username":"","pin":""}]}. Preserve printed spelling. A blank school year may use ${defaultYear || "an empty string"}. Leave every unavailable field empty.`,
            },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Could not read that roster image" }, { status: 502 });
  }

  const result = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  try {
    const parsed = JSON.parse(result.choices?.[0]?.message?.content ?? "{}") as { students?: ExtractedStudent[] };
    const students = (Array.isArray(parsed.students) ? parsed.students : []).slice(0, 60).map((student) => ({
      firstName: clean(student.firstName, 80),
      lastName: clean(student.lastName, 80),
      fullName: clean(student.fullName, 160),
      schoolYear: clean(student.schoolYear, 20),
      username: clean(student.username, 80),
      pin: clean(student.pin, 12),
    }));
    return NextResponse.json({ students });
  } catch {
    return NextResponse.json({ error: "The roster image could not be interpreted" }, { status: 422 });
  }
}
