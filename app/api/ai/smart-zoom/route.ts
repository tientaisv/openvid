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
You are an expert AI Video Editor specializing in automated cursor-tracking and cinematic product demo zooms (like Screen Studio, Apple, and Linear).
You are given a chronological sequence of ${frames.length} high-resolution screenshots from a screen recording of duration ${videoDuration.toFixed(1)}s.

Your objective: Scan the entire video timeline, detect EVERY mouse click / user interaction, and generate a Zoom Keyframe ("zoomFragment") for each click across the entire video.

DETECTION INSTRUCTIONS:
1. CURSOR TRACKING:
   - Carefully inspect each frame for the mouse cursor: arrow (↖), pointing hand (👆), text beam (I), or click circle animation.
   - Look for where the mouse cursor moves, hovers, and clicks.
   - Detect state changes caused by clicks: button press highlights, dropdown menus opening, input fields receiving focus/typing, modal popups opening, tab switching, or form submission.

2. FULL VIDEO AUTO-ZOOM (COVER ALL CLICKS):
   - Generate zoom keyframes for ALL significant click events from start (0s) to end (${videoDuration.toFixed(1)}s).
   - Do NOT stop after 1 or 2 clicks; cover the full timeline so the whole video feels professionally directed and dynamic.

3. PRECISE COORDINATES (focusX, focusY):
   - focusX: 0 = far left, 50 = center, 100 = far right. Calculate the EXACT percentage location of the cursor tip or clicked UI component.
   - focusY: 0 = top edge, 50 = middle, 100 = bottom edge. Calculate the EXACT percentage location.
   - For example:
     * Top-left navigation/logo: focusX ≈ 15, focusY ≈ 10
     * Top-center search bar: focusX ≈ 50, focusY ≈ 12
     * Top-right profile/actions: focusX ≈ 88, focusY ≈ 10
     * Center main dialog/modal: focusX ≈ 50, focusY ≈ 45
     * Bottom-right submit button: focusX ≈ 85, focusY ≈ 85

4. DURATION & SPACING:
   - startTime: starts approx 0.2s - 0.4s before or right at the click timestamp.
   - endTime: startTime + 1.8s to 3.0s (enough time to clearly watch the action and result).
   - zoomLevel: between 1.6 and 2.4 (clean, readable zoom).
   - speed: between 5 and 8 (snappy, smooth transition).
   - If two clicks happen close together (< 1.5s) in the same area, extend the single zoom fragment to cover both. If they are in different screen areas, leave a 0.4s gap between zoom fragments so the camera zooms out before zooming into the next location.
`;

    const imageParts = frames.map((frameItem: any, index: number) => {
      const base64 = typeof frameItem === "string" ? frameItem : frameItem.dataUrl || frameItem.image || "";
      const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, "");
      const timeInfo = typeof frameItem === "object" && typeof frameItem.time === "number" ? ` [t=${frameItem.time.toFixed(1)}s]` : ` [frame ${index + 1}]`;

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
            summary: { type: Type.STRING, description: "Summary of detected clicks and zoom actions" },
            zoomFragments: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  startTime: { type: Type.NUMBER, description: "Start time in seconds (>=0, < duration)" },
                  endTime: { type: Type.NUMBER, description: "End time in seconds (> startTime, <= duration)" },
                  focusX: { type: Type.NUMBER, description: "Exact horizontal focus point percentage (0-100)" },
                  focusY: { type: Type.NUMBER, description: "Exact vertical focus point percentage (0-100)" },
                  zoomLevel: { type: Type.NUMBER, description: "Zoom factor (1.5 - 2.8)" },
                  speed: { type: Type.NUMBER, description: "Zoom transition speed (4 - 8)" },
                  enable3D: { type: Type.BOOLEAN, description: "Enable subtle 3D tilt effect" },
                  actionLabel: { type: Type.STRING, description: "Label of clicked element (e.g. 'Click Sign In', 'Search Box')" },
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
    
    // Sort and ensure no overlapping intervals
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

      const focusX = Math.max(5, Math.min(95, Math.round(f.focusX ?? 50)));
      const focusY = Math.max(5, Math.min(95, Math.round(f.focusY ?? 50)));

      validatedFragments.push({
        id: `ai_zoom_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        startTime: Number(start.toFixed(2)),
        endTime: Number(end.toFixed(2)),
        focusX,
        focusY,
        zoomLevel: Math.max(1.4, Math.min(3.0, Number((f.zoomLevel ?? 1.8).toFixed(1)))),
        speed: Math.max(4, Math.min(8, Math.round(f.speed ?? 6))),
        enable3D: !!f.enable3D,
        perspective3DIntensity: 45,
        perspective3DAngleX: f.enable3D ? (focusY < 50 ? 12 : -12) : 0,
        perspective3DAngleY: f.enable3D ? (focusX < 50 ? -12 : 12) : 0,
        actionLabel: f.actionLabel || `Click ${i + 1}`,
      });
    }

    return NextResponse.json({
      success: true,
      summary: data.summary || `Đã tự động tạo ${validatedFragments.length} đoạn zoom bám theo click chuột`,
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
