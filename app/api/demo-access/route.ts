import { NextResponse } from "next/server";

export const runtime = "nodejs";

function buildDemoAccessDebug(
  featureEnabledRaw: string | undefined,
  hasExpectedCode: boolean,
  expectedCodeLength: number,
  submittedCodeLength: number,
  submittedTrimmedLength: number,
  trimmedComparisonPasses: boolean
) {
  return {
    featureEnabledRaw: featureEnabledRaw ?? null,
    hasExpectedCode,
    expectedCodeLength,
    submittedCodeLength,
    submittedTrimmedLength,
    trimmedComparisonPasses,
  };
}

export async function POST(request: Request) {
  try {
    const featureEnabled = process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED === "true";
    const expected = process.env.DEMO_ACCESS_CODE?.trim();

    let submittedCode = "";
    try {
      const body = (await request.json()) as { code?: unknown };
      submittedCode = typeof body.code === "string" ? body.code : "";
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
    }

    const submitted = submittedCode.trim();
    const matches = Boolean(expected && submitted && submitted === expected);
    const debug = buildDemoAccessDebug(
      process.env.NEXT_PUBLIC_DEMO_ACCESS_ENABLED,
      Boolean(process.env.DEMO_ACCESS_CODE),
      process.env.DEMO_ACCESS_CODE?.length ?? 0,
      submittedCode.length,
      submitted.length,
      matches
    );

    console.log("[DemoAccessRoute]", debug);

    if (!featureEnabled || !expected) {
      return NextResponse.json({ ok: false, error: "missing_feature_or_code", debug }, { status: 404 });
    }

    if (!submitted || !matches) {
      return NextResponse.json({ ok: false, error: "code_mismatch", debug }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DemoAccessRoute] unhandled error", error);
    return NextResponse.json(
      {
        ok: false,
        error: "route_exception",
        message: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 }
    );
  }
}
