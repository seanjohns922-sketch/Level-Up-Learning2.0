import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const featureEnabled = process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED === "true";
  const expected = process.env.DEMO_ACCESS_CODE?.trim();

  let submittedCode = "";
  try {
    const body = (await request.json()) as { code?: unknown };
    submittedCode = typeof body.code === "string" ? body.code : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const submitted = submittedCode.trim();
  const matches = Boolean(expected && submitted && submitted === expected);

  console.log("[DemoAccessRoute]", {
    featureEnabledRaw: process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED,
    hasExpectedCode: Boolean(process.env.DEMO_ACCESS_CODE),
    expectedCodeLength: process.env.DEMO_ACCESS_CODE?.length ?? 0,
    submittedCodeLength: submittedCode.length,
    submittedTrimmedLength: submitted.length,
    trimmedComparisonPasses: matches,
  });

  if (!featureEnabled || !expected) {
    return NextResponse.json(
      process.env.NODE_ENV === "development"
        ? {
            ok: false,
            debug: {
              featureEnabledRaw: process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED,
              hasExpectedCode: Boolean(process.env.DEMO_ACCESS_CODE),
              expectedCodeLength: process.env.DEMO_ACCESS_CODE?.length ?? 0,
            },
          }
        : { ok: false },
      { status: 404 }
    );
  }

  if (!submitted || !matches) {
    return NextResponse.json(
      process.env.NODE_ENV === "development"
        ? {
            ok: false,
            debug: {
              submittedCodeLength: submittedCode.length,
              submittedTrimmedLength: submitted.length,
              trimmedComparisonPasses: matches,
            },
          }
        : { ok: false },
      { status: 401 }
    );
  }

  return NextResponse.json({ ok: true });
}
