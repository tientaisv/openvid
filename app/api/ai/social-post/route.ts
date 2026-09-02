import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing GEMINI_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const { frames, prompt: userPrompt } = await req.json();

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
You are a top-tier viral tech marketer and copywriter who creates viral product launch posts for Twitter/X, LinkedIn, and Product Hunt.
Analyze the provided screenshots of the video demo / product showcase.

Generate high-impact, engaging copy in both Vietnamese and English:
1. "twitterPost": A captivating Twitter/X thread starter or tweet (hook + benefit + call to action, emojis included).
2. "linkedinPost": A professional, story-driven LinkedIn post showcasing the product and key achievements.
3. "productHuntTagline": A punchy one-liner tagline (< 60 chars) for Product Hunt.
4. "hashtags": 5-8 trending tech & product hashtags.
${userPrompt ? `Custom User Note: ${userPrompt}` : ""}
`;

    const imageParts = Array.isArray(frames)
      ? frames.slice(0, 5).map((base64: string) => ({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64.replace(/^data:image\/\w+;base64,/, ""),
          },
        }))
      : [];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [systemPrompt, ...imageParts],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            twitterPost: { type: Type.STRING, description: "Viral Twitter / X post" },
            linkedinPost: { type: Type.STRING, description: "Professional LinkedIn post" },
            productHuntTagline: { type: Type.STRING, description: "Punchy Product Hunt tagline" },
            hashtags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Relevant hashtags",
            },
          },
          required: ["twitterPost", "linkedinPost", "productHuntTagline", "hashtags"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("Gemini Social Post API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate social media post" },
      { status: 500 }
    );
  }
}
