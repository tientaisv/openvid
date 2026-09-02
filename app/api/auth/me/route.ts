import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userCookie = request.cookies.get("openvid_local_user")?.value;
  const profileCookie = request.cookies.get("openvid_local_profile")?.value;

  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie));
      const profile = profileCookie ? JSON.parse(decodeURIComponent(profileCookie)) : null;
      return NextResponse.json({ user, profile });
    } catch {
      // ignore
    }
  }
  return NextResponse.json({ user: null, profile: null });
}
