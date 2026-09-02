import { type User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export type SessionUpdateResult = {
  user: User | null;
  applyAuthCookies: (target: NextResponse) => boolean;
};

function isVideoEditorPath(pathname: string, searchParams: URLSearchParams) {
  return pathname.endsWith("/editor") && searchParams.get("mode") !== "photo";
}

function isLoginPath(pathname: string) {
  return pathname.endsWith("/login");
}

export function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("-auth-token") || cookie.name === "openvid_local_user");
}

export function shouldRefreshSession(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;
  if (isVideoEditorPath(pathname, searchParams) || isLoginPath(pathname)) {
    return true;
  }
  return hasSupabaseAuthCookie(request);
}

export function getSafeInternalPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }
  return value;
}

export async function updateSession(
  request: NextRequest,
): Promise<SessionUpdateResult> {
  const localUserCookie = request.cookies.get("openvid_local_user")?.value;
  if (localUserCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(localUserCookie));
      return {
        user,
        applyAuthCookies: () => false,
      };
    } catch {}
  }

  return { user: null, applyAuthCookies: () => false };
}

export function enforceAuthRoutes(
  request: NextRequest,
  user: User | null,
): NextResponse | null {
  const pathname = request.nextUrl.pathname;
  const { searchParams } = request.nextUrl;

  if (user && isLoginPath(pathname)) {
    const fallback = pathname.replace(/\/login$/, "/editor");
    const destination = getSafeInternalPath(
      searchParams.get("redirectedFrom"),
      fallback,
    );

    const url = request.nextUrl.clone();
    const destUrl = new URL(destination, request.nextUrl.origin);
    url.pathname = destUrl.pathname;
    url.search = destUrl.search;

    return NextResponse.redirect(url);
  }

  return null;
}
