import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const featureEnabled = process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED === "true";
  const expectedCode = process.env.DEMO_ACCESS_CODE?.trim();

  if (!featureEnabled || !expectedCode) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let submittedCode = "";
  try {
    const body = (await request.json()) as { code?: unknown };
    submittedCode = typeof body.code === "string" ? body.code.trim() : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!submittedCode || submittedCode !== expectedCode) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
