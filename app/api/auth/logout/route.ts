import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("openvid_local_user");
  response.cookies.delete("openvid_local_profile");
  return response;
}
