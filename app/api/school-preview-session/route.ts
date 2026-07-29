import { NextResponse } from "next/server";
import {
  getMySchoolContexts,
  isSchoolPlatformPreviewEnabled,
  SCHOOL_PREVIEW_COOKIE,
  verifyAdultAccessToken,
} from "@/lib/school-platform-server";

function denied(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  if (!isSchoolPlatformPreviewEnabled()) {
    return denied(404, "School platform preview is disabled");
  }

  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  const user = await verifyAdultAccessToken(accessToken);
  if (!user) {
    return denied(403, "An active educator or platform account is required");
  }

  const schools = await getMySchoolContexts(accessToken);
  if (schools.length === 0) {
    return denied(
      403,
      "No active school membership is available for this educator",
    );
  }

  const response = NextResponse.json({ authenticated: true, schools });
  response.cookies.set(SCHOOL_PREVIEW_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(SCHOOL_PREVIEW_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
