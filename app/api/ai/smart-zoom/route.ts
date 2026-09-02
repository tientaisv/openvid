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

    const { frames, duration } = await req.json();

    if (!Array.isArray(frames) || frames.length === 0) {
      return NextResponse.json(
        { success: false, error: "No video frames provided for AI analysis" },
        { status: 400 }
      );
    }

    const videoDuration = typeof duration === "number" && duration > 0 ? duration : frames.length;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are a precision video director AI. Your task is to perform FULL-TIMELINE AUTOMATED ZOOM ANALYSIS for a ${videoDuration.toFixed(1)}s screen recording in a SINGLE PASS.

MANDATORY 100% TIMELINE COMPLETION RULE:
- YOU MUST COVER THE ENTIRE VIDEO FROM START (0.0s) TO FINISH (${videoDuration.toFixed(1)}s) IN THIS SINGLE PASS.
- Do NOT output only 1, 2, or 3 fragments. You MUST generate as many zoom keyframes as needed to cover EVERY click, mouse movement, and user interaction throughout the entire video.
  * For a 10s video: generate 3 to 5 zoom keyframes.
  * For a 20s video: generate 6 to 10 zoom keyframes.
  * For a 30s+ video: generate 10 to 18+ zoom keyframes.
- Ensure zoom fragments are chronologically distributed across the entire duration from 0s to ${videoDuration.toFixed(1)}s so the user does NOT need to run AI multiple times.

PRECISION COORDINATES (focusX, focusY):
- Coordinates are 0 to 100 percentages:
  * focusX: 0 = left edge, 50 = center, 100 = right edge.
  * focusY: 0 = top edge, 50 = center, 100 = bottom edge.
- Set focusX and focusY directly at the center of the clicked button/input/menu/card or the apex tip of the mouse cursor (↖).
- Common UI positions:
  * Top navigation / search / tabs: focusY ≈ 6 - 15
  * Left sidebar / navigation: focusX ≈ 8 - 20, focusY ≈ 20 - 80
  * Main central workspace / modal / form: focusX ≈ 35 - 65, focusY ≈ 30 - 70
  * Bottom-right submit / action buttons: focusX ≈ 70 - 92, focusY ≈ 75 - 92

ZOOM SETTINGS:
- Standard 2D zoom only (zoomLevel between 1.5 and 1.8).
- speed: 5 or 6 (smooth, natural easing).
- startTime: starts approx 0.2s before the click.
- endTime: lasts 1.6s to 2.5s per action.
- Leave 0.3s - 0.5s gap between different zooms so the camera pulls out smoothly before zooming into the next target.
`;

    const imageParts = frames.map((frameItem: any, index: number) => {
      const base64 = typeof frameItem === "string" ? frameItem : frameItem.dataUrl || frameItem.image || "";
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
            summary: { type: Type.STRING, description: "Short summary of detected click interactions" },
            zoomFragments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  startTime: { type: Type.NUMBER, description: "Start time in seconds (>=0, < duration)" },
                  endTime: { type: Type.NUMBER, description: "End time in seconds (> startTime, <= duration)" },
                  focusX: { type: Type.NUMBER, description: "Exact horizontal center percentage (0-100) of clicked element" },
                  focusY: { type: Type.NUMBER, description: "Exact vertical center percentage (0-100) of clicked element" },
                  zoomLevel: { type: Type.NUMBER, description: "Zoom factor between 1.5 and 1.8" },
                  speed: { type: Type.NUMBER, description: "Zoom speed (5 or 6)" },
                  actionLabel: { type: Type.STRING, description: "Clear label of clicked element (e.g. 'Click Đăng nhập', 'Nhập tìm kiếm')" },
                },
                required: ["startTime", "endTime", "focusX", "focusY", "zoomLevel", "speed"],
              },
            },
          },
          required: ["zoomFragments"],
        },
      },
    });

    const rawText = response.text || "{}";
    const data = JSON.parse(rawText);

    const rawFragments = data.zoomFragments || [];
    
    // Sort and ensure no overlapping intervals, pure 2D coordinates
    const validatedFragments: any[] = [];
    const sorted = rawFragments
      .filter((f: any) => typeof f.startTime === "number" && typeof f.endTime === "number" && f.endTime > f.startTime)
      .sort((a: any, b: any) => a.startTime - b.startTime);

    for (let i = 0; i < sorted.length; i++) {
      const f = sorted[i];
      let start = Math.max(0, Math.min(videoDuration - 0.5, f.startTime));
      let end = Math.max(start + 1.2, Math.min(videoDuration, f.endTime));

      // Avoid overlapping with previous fragment
      if (validatedFragments.length > 0) {
        const prev = validatedFragments[validatedFragments.length - 1];
        if (start < prev.endTime + 0.3) {
          start = prev.endTime + 0.3;
          end = Math.max(start + 1.2, end);
        }
      }

      if (start >= videoDuration - 0.2) continue;
      end = Math.min(videoDuration, end);

      const focusX = Math.max(5, Math.min(95, Number(f.focusX.toFixed(1))));
      const focusY = Math.max(5, Math.min(95, Number(f.focusY.toFixed(1))));

      validatedFragments.push({
        id: `ai_zoom_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        startTime: Number(start.toFixed(2)),
        endTime: Number(end.toFixed(2)),
        focusX,
        focusY,
        zoomLevel: Math.max(1.4, Math.min(2.0, Number((f.zoomLevel ?? 1.6).toFixed(1)))),
        speed: Math.max(4, Math.min(7, Math.round(f.speed ?? 5))),
        enable3D: false, // Pure clean 2D zoom only - no 3D tilt/distortion
        perspective3DIntensity: 0,
        perspective3DAngleX: 0,
        perspective3DAngleY: 0,
        actionLabel: f.actionLabel || `Click ${i + 1}`,
      });
    }

    return NextResponse.json({
      success: true,
      summary: data.summary || `Đã tự động tạo ${validatedFragments.length} đoạn zoom bám sát vị trí click chuột`,
      zoomFragments: validatedFragments,
    });
  } catch (error: any) {
    console.error("Gemini Smart Zoom API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI zoom keyframes" },
      { status: 500 }
    );
  }
}
