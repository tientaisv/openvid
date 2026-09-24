import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const LANGUAGE_NAMES: Record<string, string> = {
  vi: "Tiếng Việt (Vietnamese)",
  en: "English",
  es: "Spanish (Español)",
  ko: "Korean (한국어)",
  ru: "Russian (Русский)",
};

const TONE_INSTRUCTIONS: Record<string, string> = {
  friendly: "Thân thiện, gần gũi, ấm áp, giải thích tự nhiên như một người bạn đồng hành.",
  professional: "Chuyên nghiệp, chuẩn mực, rành mạch, phù hợp cho bài thuyết trình sản phẩm B2B.",
  concise: "Súc tích, ngắn gọn, vào thẳng trọng tâm từng thao tác, không dài dòng.",
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing GEMINI_API_KEY in environment variables" },
        { status: 500 }
      );
    }

    const {
      frames,
      duration,
      language = "vi",
      tone = "friendly",
      existingZoomFragments = [],
    } = await req.json();

    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { success: false, error: "No video frames provided for AI tutorial analysis" },
        { status: 400 }
      );
    }

    const videoDuration = typeof duration === "number" && duration > 0 ? duration : frames.length;
    const targetLangName = LANGUAGE_NAMES[language] || "Tiếng Việt";
    const toneDescription = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.friendly;

    // Optional context if Smart Zoom already detected actions
    let actionContext = "";
    if (Array.isArray(existingZoomFragments) && existingZoomFragments.length > 0) {
      actionContext = `
DETECTED KEY ACTIONS ON SCREEN (Reference timestamps and actions):
${existingZoomFragments
  .map(
    (f: { startTime?: number; endTime?: number; actionLabel?: string }, idx: number) =>
      `- Step ${idx + 1}: ${f.startTime?.toFixed(1)}s - ${f.endTime?.toFixed(1)}s: ${f.actionLabel || "User Click/Interaction"}`
  )
  .join("\n")}
`;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a world-class software tutorial creator and video voiceover director.
Your mission is to watch the screen recording frames of this software / digital product demo (Total duration: ${videoDuration.toFixed(1)} seconds) and generate a STEP-BY-STEP TUTORIAL VOICEOVER SCRIPT with synchronized timestamps.

TARGET LANGUAGE: ${targetLangName}
TONE OF VOICE: ${toneDescription}
${actionContext}

CRITICAL RULES FOR VOICE NARRATION:
1. Divide the video walkthrough into sequential, logical tutorial steps.
   - For a short video (<= 15s): 2 to 4 clear steps.
   - For a medium video (15s - 30s): 4 to 6 steps.
   - For a long video (> 30s): 6 to 10 steps.
2. TIMING & PACING:
   - 'startTime' is the exact second when the voice narration for this step starts.
   - 'endTime' is when the narration ends.
   - Speech rate is roughly 2.5 words per second. The 'narrationText' MUST be concise enough to be spoken naturally within (endTime - startTime).
   - Leave a 0.5s pause between consecutive steps so voiceovers never overlap.
3. CONTENT OF NARRATION:
   - The 'narrationText' must be written in fluent, natural ${targetLangName}.
   - Explain WHAT the user is doing and WHY, guiding the viewer smoothly.
   - Example 1: "Trước tiên, hãy nhấp vào nút Tạo dự án ở góc trên bên phải."
   - Example 2: "Tiếp theo, hãy chọn mẫu giao diện 3D mà bạn muốn hiển thị."
   - Example 3: "Cuối cùng, nhấn Xuất video để hoàn tất."
4. ACCURACY:
   - startTime must be >= 0.
   - endTime must be <= ${videoDuration.toFixed(1)}.
   - Step timestamps must be strictly sequential (startTime_step2 >= endTime_step1 + 0.3s).
`;

    const imageParts = frames.map((frameItem: string | { dataUrl?: string; image?: string }) => {
      const base64 =
        typeof frameItem === "string" ? frameItem : frameItem.dataUrl || frameItem.image || "";
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");

      return {
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64,
        },
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt, ...imageParts],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Engaging and descriptive tutorial title",
            },
            summary: {
              type: Type.STRING,
              description: "Brief 1-2 sentence summary of what this tutorial demonstrates",
            },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  startTime: {
                    type: Type.NUMBER,
                    description: "Start time in seconds for this narration line",
                  },
                  endTime: {
                    type: Type.NUMBER,
                    description: "End time in seconds when this narration line completes",
                  },
                  actionDescription: {
                    type: Type.STRING,
                    description: "Short label of user action (e.g. 'Click Đăng nhập', 'Chọn mockup')",
                  },
                  narrationText: {
                    type: Type.STRING,
                    description: "The exact voiceover words spoken aloud in the target language",
                  },
                },
                required: ["startTime", "endTime", "actionDescription", "narrationText"],
              },
            },
          },
          required: ["title", "summary", "steps"],
        },
      },
    });

    const rawText = response.text || "{}";
    const data = JSON.parse(rawText);

    interface RawStep {
      startTime?: number;
      endTime?: number;
      actionDescription?: string;
      narrationText?: string;
    }

    const rawSteps: RawStep[] = Array.isArray(data.steps) ? data.steps : [];

    // Filter, sort and validate chronological ordering & non-overlapping
    const sorted = rawSteps
      .filter(
        (s): s is Required<RawStep> =>
          typeof s.startTime === "number" &&
          typeof s.endTime === "number" &&
          s.endTime > s.startTime &&
          typeof s.narrationText === "string" &&
          s.narrationText.trim().length > 0
      )
      .sort((a, b) => a.startTime - b.startTime);

    interface ValidatedStep {
      id: string;
      startTime: number;
      endTime: number;
      duration: number;
      actionDescription: string;
      narrationText: string;
    }

    const validatedSteps: ValidatedStep[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const step = sorted[i];
      let start = Math.max(0, Math.min(videoDuration - 0.8, step.startTime));
      let end = Math.max(start + 1.2, Math.min(videoDuration, step.endTime));

      // Prevent overlap with previous step
      if (validatedSteps.length > 0) {
        const prev = validatedSteps[validatedSteps.length - 1];
        if (start < prev.endTime + 0.4) {
          start = prev.endTime + 0.4;
          end = Math.max(start + 1.2, end);
        }
      }

      if (start >= videoDuration - 0.3) continue;
      end = Math.min(videoDuration, end);

      validatedSteps.push({
        id: `tutorial_step_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        startTime: Number(start.toFixed(2)),
        endTime: Number(end.toFixed(2)),
        duration: Number((end - start).toFixed(2)),
        actionDescription: step.actionDescription || `Bước ${i + 1}`,
        narrationText: step.narrationText.trim(),
      });
    }

    return NextResponse.json({
      success: true,
      title: data.title || "Video Hướng Dẫn Sản Phẩm",
      summary: data.summary || `Đã tạo ${validatedSteps.length} bước thuyết minh cho video.`,
      steps: validatedSteps,
    });
  } catch (error: unknown) {
    console.error("Gemini Tutorial Script API error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate AI tutorial script";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
