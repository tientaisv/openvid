import { NextResponse } from "next/server";

export async function GET() {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_TOKEN !== "dummy_token") {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch("https://api.github.com/repos/CristianOlivera1/openvid", {
      headers,
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ stars: 2300 });
    }

    const data = await res.json();
    return NextResponse.json({ stars: data.stargazers_count ?? 2300 });
  } catch (error) {
    return NextResponse.json({ stars: 2300 });
  }
}
