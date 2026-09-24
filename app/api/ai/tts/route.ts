import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";

// Fallback helper to fetch audio from Google TTS (splits into <= 180 char chunks if needed)
function fetchGoogleTTSChunk(text: string, lang: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${encodeURIComponent(lang)}&client=tw-ob`;
    https
      .get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000 }, (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Google TTS returned status ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      })
      .on("error", reject);
  });
}

async function fetchGoogleTTS(text: string, lang: string): Promise<Buffer> {
  // Split into chunks of around 150-180 characters on sentence boundaries
  const maxLen = 160;
  if (text.length <= maxLen) {
    return fetchGoogleTTSChunk(text, lang);
  }

  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const s of sentences) {
    if ((current + " " + s).trim().length <= maxLen) {
      current = (current + " " + s).trim();
    } else {
      if (current) chunks.push(current);
      current = s.trim();
    }
  }
  if (current) chunks.push(current);

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const buf = await fetchGoogleTTSChunk(chunk, lang);
    buffers.push(buf);
  }
  return Buffer.concat(buffers);
}

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;
  try {
    const {
      text,
      voice = "vi-VN-HoaiMyNeural",
      lang: requestedLang,
      rate = "default",
      pitch = "default",
    } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Text is required for TTS generation." },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const resolvedLang =
      requestedLang ||
      (voice.includes("-") ? voice.split("-")[0] : "vi");

    // Attempt 1: Try Edge-TTS (high quality neural voice)
    try {
      const tempDir = os.tmpdir();
      const uniqueId = `tts_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      tempFilePath = path.join(tempDir, `${uniqueId}.mp3`);

      const edgeLang = voice.includes("-")
        ? voice.split("-").slice(0, 2).join("-")
        : "vi-VN";

      const tts = new EdgeTTS({
        voice,
        lang: edgeLang,
        rate,
        pitch,
        outputFormat: "audio-24khz-48kbitrate-mono-mp3",
        timeout: 6000,
      });

      await tts.ttsPromise(trimmedText, tempFilePath);

      if (fs.existsSync(tempFilePath)) {
        const audioBuffer = fs.readFileSync(tempFilePath);
        try {
          fs.unlinkSync(tempFilePath);
          tempFilePath = null;
        } catch {
          // ignore
        }

        return new NextResponse(new Uint8Array(audioBuffer), {
          status: 200,
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.length.toString(),
            "X-TTS-Engine": "edge-neural",
            "Cache-Control": "public, max-age=3600",
          },
        });
      }
    } catch (edgeErr) {
      console.warn("EdgeTTS attempt failed, falling back to Google TTS:", edgeErr);
    } finally {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch {
          // ignore
        }
        tempFilePath = null;
      }
    }

    // Attempt 2: Fallback to Google TTS (instant, reliable, no external dependencies)
    const audioBuffer = await fetchGoogleTTS(trimmedText, resolvedLang);

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "X-TTS-Engine": "google-tts",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    console.error("TTS generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate speech.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
