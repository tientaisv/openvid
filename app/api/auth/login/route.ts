import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const validEmail = (email || "").trim().toLowerCase();
    const validPass = (password || "").trim();

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@openvid.app").toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (validEmail === adminEmail && validPass === adminPassword) {
      const user = {
        id: "usr_admin_01",
        app_metadata: { provider: "local", providers: ["local"] },
        user_metadata: {
          full_name: "Admin User",
          name: "Admin User",
          first_name: "Admin",
          last_name: "User",
          avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
          provider: "local",
        },
        aud: "authenticated",
        email: validEmail,
        created_at: new Date().toISOString(),
      };

      const profile = {
        id: "usr_admin_01",
        email: validEmail,
        full_name: "Admin User",
        first_name: "Admin",
        last_name: "User",
        avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
        provider: "local",
        theme: "dark",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = NextResponse.json({
        success: true,
        user,
        profile,
      });

      response.cookies.set("openvid_local_user", encodeURIComponent(JSON.stringify(user)), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });

      response.cookies.set("openvid_local_profile", encodeURIComponent(JSON.stringify(profile)), {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Email hoặc mật khẩu không chính xác!" },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}
