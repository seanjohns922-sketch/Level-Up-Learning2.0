import { NextResponse } from "next/server";
import {
  PLATFORM_ADMIN_COOKIE,
  verifyPlatformOwnerToken,
} from "@/lib/platform-admin-server";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const access = await verifyPlatformOwnerToken(accessToken);
  if (!access) {
    return NextResponse.json({ error: "Platform owner access required" }, { status: 403 });
  }

  const response = NextResponse.json({ authenticated: true, destination: "/admin" });
  response.cookies.set(PLATFORM_ADMIN_COOKIE, accessToken, {
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
  response.cookies.set(PLATFORM_ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
