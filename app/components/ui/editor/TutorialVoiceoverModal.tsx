"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
    TUTORIAL_VOICE_OPTIONS,
    type TutorialLanguage,
    type TutorialTone,
    type TutorialStep,
    type TutorialScriptResult,
} from "@/types/tutorial.types";
import type { AudioTrack, UploadedAudio } from "@/types/audio.types";
import type { TextElement } from "@/types/canvas-elements.types";
import { Button } from "@/components/ui/button";

interface TutorialVoiceoverModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl?: string | null;
    videoDuration: number;
    existingZoomFragments?: unknown[];
    onApplyTutorial: (
        tracks: AudioTrack[],
        audios: UploadedAudio[],
        captions?: TextElement[]
    ) => void;
}

const LANGUAGE_LABELS: { id: TutorialLanguage; label: string; flag: string }[] = [
    { id: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
    { id: "en", label: "English", flag: "🇺🇸" },
    { id: "es", label: "Español", flag: "🇪🇸" },
    { id: "ko", label: "한국어", flag: "🇰🇷" },
    { id: "ru", label: "Русский", flag: "🇷🇺" },
];

const TONE_OPTIONS: { id: TutorialTone; label: string; desc: string }[] = [
    { id: "friendly", label: "Thân thiện", desc: "Gần gũi, tự nhiên như trò chuyện" },
    { id: "professional", label: "Chuyên nghiệp", desc: "Trang trọng, chuẩn mực cho demo B2B" },
    { id: "concise", label: "Súc tích", desc: "Ngắn gọn, đi thẳng vào thao tác" },
];

export function TutorialVoiceoverModal({
    isOpen,
    onClose,
    videoUrl,
    videoDuration,
    existingZoomFragments = [],
    onApplyTutorial,
}: TutorialVoiceoverModalProps) {
    const [step, setStep] = useState<"setup" | "review" | "generating" | "complete">("setup");
    const [language, setLanguage] = useState<TutorialLanguage>("vi");
    const [tone, setTone] = useState<TutorialTone>("friendly");
    const [selectedVoiceId, setSelectedVoiceId] = useState<string>("vi-VN-HoaiMyNeural");
    const [generateCaptions, setGenerateCaptions] = useState<boolean>(true);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [scriptResult, setScriptResult] = useState<TutorialScriptResult | null>(null);
    const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
    const [playingStepId, setPlayingStepId] = useState<string | null>(null);
    const [testingTtsStepId, setTestingTtsStepId] = useState<string | null>(null);

    const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

    // Handle language change and update default voice
    const handleLanguageChange = (newLang: TutorialLanguage) => {
        setLanguage(newLang);
        const availableVoices = TUTORIAL_VOICE_OPTIONS.filter((v) => v.language === newLang);
        if (availableVoices.length > 0) {
            setSelectedVoiceId(availableVoices[0].id);
        }
    };

    // Cleanup audio preview on unmount
    useEffect(() => {
        return () => {
            if (audioPreviewRef.current) {
                audioPreviewRef.current.pause();
                audioPreviewRef.current = null;
            }
            if (previewAudioUrl) {
                URL.revokeObjectURL(previewAudioUrl);
            }
        };
    }, [previewAudioUrl]);

    // Helper: sample video frames
    const extractFrames = useCallback(async (): Promise<{ dataUrl: string; time: number }[]> => {
        if (!videoUrl) return [];

        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.crossOrigin = "anonymous";
            video.src = videoUrl;
            video.muted = true;
            video.playsInline = true;

            const canvas = document.createElement("canvas");
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext("2d");

            video.onloadedmetadata = async () => {
                const duration = video.duration || videoDuration;
                if (!duration || duration <= 0) {
                    return resolve([]);
                }

                // Sample between 6 and 14 frames depending on length
                const sampleCount = Math.max(6, Math.min(14, Math.round(duration / 3)));
                const interval = duration / (sampleCount + 1);
                const extracted: { dataUrl: string; time: number }[] = [];

                for (let i = 1; i <= sampleCount; i++) {
                    const targetTime = Number((i * interval).toFixed(2));
                    video.currentTime = targetTime;

                    await new Promise((res) => {
                        const onSeeked = () => {
                            video.removeEventListener("seeked", onSeeked);
                            if (ctx) {
                                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                extracted.push({
                                    time: targetTime,
                                    dataUrl: canvas.toDataURL("image/jpeg", 0.8),
                                });
                            }
                            res(null);
                        };
                        video.addEventListener("seeked", onSeeked);
                    });
                }

                resolve(extracted);
            };

            video.onerror = () => reject(new Error("Không thể tải video để trích xuất khung hình."));
        });
    }, [videoUrl, videoDuration]);

    // Handle initial script generation with Gemini
    const handleGenerateScript = async () => {
        try {
            setIsAnalyzing(true);
            setErrorMessage(null);
            setStatusMessage("Đang trích xuất khung hình từ video...");

            const frames = await extractFrames();
            if (frames.length === 0) {
                throw new Error("Không thể trích xuất khung hình từ video.");
            }

            setStatusMessage(`AI Gemini đang quan sát thao tác màn hình (${frames.length} frames)...`);

            const res = await fetch("/api/ai/tutorial-script", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    frames,
                    duration: videoDuration,
                    language,
                    tone,
                    existingZoomFragments,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Không thể tạo kịch bản hướng dẫn.");
            }

            setScriptResult({
                title: data.title,
                summary: data.summary,
                steps: data.steps,
            });

            setStep("review");
        } catch (err: unknown) {
            console.error("AI Tutorial script generation failed:", err);
            const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo kịch bản tutorial.";
            setErrorMessage(msg);
        } finally {
            setIsAnalyzing(false);
            setStatusMessage("");
        }
    };

    // Test a single step's voice
    const handlePreviewStepVoice = async (stepItem: TutorialStep) => {
        try {
            if (audioPreviewRef.current) {
                audioPreviewRef.current.pause();
                audioPreviewRef.current = null;
            }
            if (playingStepId === stepItem.id) {
                setPlayingStepId(null);
                return;
            }

            setTestingTtsStepId(stepItem.id);

            const res = await fetch("/api/ai/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: stepItem.narrationText,
                    voice: selectedVoiceId,
                    lang: language,
                }),
            });

            if (!res.ok) {
                throw new Error("Không thể tạo giọng đọc thử nghiệm.");
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            setPreviewAudioUrl(blobUrl);

            const audio = new Audio(blobUrl);
            audioPreviewRef.current = audio;
            setPlayingStepId(stepItem.id);

            audio.onended = () => {
                setPlayingStepId(null);
            };

            await audio.play();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Lỗi tạo giọng nói thử nghiệm.";
            alert(msg);
            setPlayingStepId(null);
        } finally {
            setTestingTtsStepId(null);
        }
    };

    // Update text of a specific step
    const handleUpdateStepText = (id: string, text: string) => {
        if (!scriptResult) return;
        setScriptResult({
            ...scriptResult,
            steps: scriptResult.steps.map((s) => (s.id === id ? { ...s, narrationText: text } : s)),
        });
    };

    // Delete a step
    const handleDeleteStep = (id: string) => {
        if (!scriptResult) return;
        setScriptResult({
            ...scriptResult,
            steps: scriptResult.steps.filter((s) => s.id !== id),
        });
    };

    // Generate audio for all steps and apply to timeline
    const handleGenerateAllAndApply = async () => {
        if (!scriptResult || scriptResult.steps.length === 0) return;

        try {
            setStep("generating");
            setStatusMessage("Đang khởi tạo các đoạn lồng tiếng...");

            const total = scriptResult.steps.length;
            const generatedTracks: AudioTrack[] = [];
            const generatedAudios: UploadedAudio[] = [];
            const generatedCaptions: TextElement[] = [];

            for (let i = 0; i < total; i++) {
                const s = scriptResult.steps[i];
                setStatusMessage(`Đang tạo giọng đọc bước ${i + 1}/${total}: "${s.actionDescription}"...`);

                const res = await fetch("/api/ai/tts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        text: s.narrationText,
                        voice: selectedVoiceId,
                        lang: language,
                    }),
                });

                if (!res.ok) {
                    throw new Error(`Lỗi sinh giọng đọc cho bước ${i + 1}`);
                }

                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);

                // Determine accurate duration of generated audio
                const audioEl = new Audio(blobUrl);
                const measuredDuration = await new Promise<number>((resolve) => {
                    audioEl.onloadedmetadata = () => {
                        resolve(audioEl.duration && !isNaN(audioEl.duration) ? audioEl.duration : s.duration || 3);
                    };
                    audioEl.onerror = () => resolve(s.duration || 3);
                });

                const audioId = `voice_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`;
                const trackId = `track_${audioId}`;

                // Add to uploaded audio register
                const uploadedAudio: UploadedAudio = {
                    id: audioId,
                    name: `Voiceover: ${s.actionDescription}`,
                    url: blobUrl,
                    duration: measuredDuration,
                    fileSize: blob.size,
                    mimeType: "audio/mpeg",
                };
                generatedAudios.push(uploadedAudio);

                // Add to timeline audio track
                const audioTrack: AudioTrack = {
                    id: trackId,
                    audioId,
                    name: `Voice: ${s.actionDescription}`,
                    startTime: s.startTime,
                    duration: measuredDuration,
                    volume: 1.0,
                    loop: false,
                };
                generatedTracks.push(audioTrack);

                // Create dynamic caption if enabled
                if (generateCaptions) {
                    const captionId = `caption_${Date.now()}_${i}`;
                    const caption: TextElement = {
                        id: captionId,
                        type: "text",
                        x: 10,
                        y: 84, // bottom centered
                        width: 80,
                        height: 10,
                        rotation: 0,
                        opacity: 1,
                        zIndex: 200 + i,
                        startTime: s.startTime,
                        endTime: s.startTime + measuredDuration + 0.3,
                        content: s.narrationText,
                        fontSize: 24,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: "bold",
                        color: "#FFFFFF",
                    };
                    generatedCaptions.push(caption);
                }
            }

            // Apply all tracks & captions
            onApplyTutorial(generatedTracks, generatedAudios, generateCaptions ? generatedCaptions : undefined);

            setStep("complete");
            setTimeout(() => {
                onClose();
                setStep("setup");
            }, 1800);
        } catch (err: unknown) {
            console.error("Audio generation batch failed:", err);
            const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo tệp âm thanh.";
            setErrorMessage(msg);
            setStep("review");
        }
    };

    if (!isOpen) return null;

    const availableVoices = TUTORIAL_VOICE_OPTIONS.filter((v) => v.language === language);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-card-foreground">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Icon icon="solar:magic-stick-3-bold-duotone" width="22" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-base text-foreground">AI Tutorial Voiceover Studio</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                                    Gemini 2.5 + Neural TTS
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Tự động phân tích thao tác màn hình, soạn kịch bản và lồng tiếng tự nhiên
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isAnalyzing || step === "generating"}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-40"
                    >
                        <Icon icon="lucide:x" width="18" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                    {errorMessage && (
                        <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2.5">
                            <Icon icon="solar:danger-triangle-bold" width="18" className="shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Step 1: Setup */}
                    {step === "setup" && (
                        <div className="flex flex-col gap-5">
                            {/* Language Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-foreground">Ngôn ngữ thuyết minh</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {LANGUAGE_LABELS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => handleLanguageChange(item.id)}
                                            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                                                language === item.id
                                                    ? "border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm"
                                                    : "border-border/60 hover:border-border hover:bg-muted/30 text-muted-foreground"
                                            }`}
                                        >
                                            <span className="text-base">{item.flag}</span>
                                            <span>{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Voice Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-foreground">Giọng đọc AI</label>
                                <div className="grid grid-cols-2 gap-2.5">
                                    {availableVoices.map((voice) => (
                                        <button
                                            key={voice.id}
                                            type="button"
                                            onClick={() => setSelectedVoiceId(voice.id)}
                                            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                                selectedVoiceId === voice.id
                                                    ? "border-purple-500 bg-purple-500/10 shadow-sm"
                                                    : "border-border/60 hover:border-border hover:bg-muted/30"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-foreground">
                                                    {voice.nativeName}
                                                </span>
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                                    {voice.gender === "female" ? "Nữ" : "Nam"}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground leading-snug">
                                                {voice.description}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tone Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-medium text-foreground">Phong cách dẫn chuyện</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {TONE_OPTIONS.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setTone(item.id)}
                                            className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                                                tone === item.id
                                                    ? "border-purple-500 bg-purple-500/10 text-purple-400 shadow-sm"
                                                    : "border-border/60 hover:border-border hover:bg-muted/30 text-muted-foreground"
                                            }`}
                                        >
                                            <span className="text-xs font-semibold text-foreground">{item.label}</span>
                                            <span className="text-[10px] text-muted-foreground line-clamp-1">{item.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Options Checkbox */}
                            <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                        <Icon icon="solar:subtitles-bold-duotone" width="18" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-medium text-foreground">
                                            Tự động tạo phụ đề (Dynamic Captions)
                                        </div>
                                        <div className="text-[11px] text-muted-foreground">
                                            Hiển thị dòng chữ thuyết minh đồng bộ nổi bật ở cạnh dưới video
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={generateCaptions}
                                    onChange={(e) => setGenerateCaptions(e.target.checked)}
                                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-border"
                                />
                            </div>

                            {/* Progress & Start Button */}
                            {isAnalyzing ? (
                                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex flex-col items-center justify-center gap-3 py-6">
                                    <Icon
                                        icon="svg-spinners:180-ring-with-bg"
                                        width="32"
                                        className="text-purple-500 animate-spin"
                                    />
                                    <span className="text-xs font-medium text-purple-300 animate-pulse">
                                        {statusMessage || "Đang phân tích video..."}
                                    </span>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleGenerateScript}
                                    className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                                >
                                    <Icon icon="solar:stars-minimalistic-bold" width="18" />
                                    <span>Bắt đầu Phân Tích & Soạn Lời Thoại</span>
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Step 2: Review & Edit Script */}
                    {step === "review" && scriptResult && (
                        <div className="flex flex-col gap-5">
                            {/* Summary banner */}
                            <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                                        {scriptResult.title}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                        {scriptResult.steps.length} bước thuyết minh
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {scriptResult.summary}
                                </p>
                            </div>

                            {/* Step list */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                                    <span>Các đoạn thoại theo dòng thời gian</span>
                                    <span>Bạn có thể chỉnh sửa câu từ trước khi lồng tiếng</span>
                                </div>

                                <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1">
                                    {scriptResult.steps.map((stepItem, idx) => (
                                        <div
                                            key={stepItem.id}
                                            className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-purple-500/40 transition-colors flex flex-col gap-2.5"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-bold flex items-center justify-center">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-semibold text-foreground">
                                                        {stepItem.actionDescription}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                                                        {stepItem.startTime.toFixed(1)}s - {stepItem.endTime.toFixed(1)}s
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePreviewStepVoice(stepItem)}
                                                        disabled={testingTtsStepId === stepItem.id}
                                                        className="px-2 py-1 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {testingTtsStepId === stepItem.id ? (
                                                            <Icon icon="svg-spinners:ring-resize" width="12" />
                                                        ) : playingStepId === stepItem.id ? (
                                                            <Icon icon="solar:stop-bold" width="12" className="text-red-400" />
                                                        ) : (
                                                            <Icon icon="solar:play-bold" width="12" />
                                                        )}
                                                        <span>{playingStepId === stepItem.id ? "Dừng" : "Nghe thử"}</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteStep(stepItem.id)}
                                                        className="p-1 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        title="Xóa bước này"
                                                    >
                                                        <Icon icon="lucide:trash-2" width="14" />
                                                    </button>
                                                </div>
                                            </div>

                                            <textarea
                                                value={stepItem.narrationText}
                                                onChange={(e) => handleUpdateStepText(stepItem.id, e.target.value)}
                                                rows={2}
                                                className="w-full text-xs bg-muted/40 border border-border/50 rounded-lg p-2.5 focus:outline-none focus:border-purple-500 text-foreground resize-none leading-relaxed"
                                                placeholder="Nội dung thuyết minh cho bước này..."
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-2 border-t border-border/60">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setStep("setup")}
                                    className="rounded-xl text-xs h-10 px-4"
                                >
                                    Quay lại Cài đặt
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleGenerateAllAndApply}
                                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/25 flex items-center gap-2"
                                >
                                    <Icon icon="solar:soundwave-bold" width="16" />
                                    <span>Lồng Tiếng & Thêm Vào Video</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Generating Audio Batch */}
                    {step === "generating" && (
                        <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center animate-pulse">
                                    <Icon icon="solar:soundwave-bold-duotone" width="36" />
                                </div>
                                <Icon
                                    icon="svg-spinners:180-ring-with-bg"
                                    width="48"
                                    className="text-purple-500 absolute -top-2 -left-2"
                                />
                            </div>
                            <div className="flex flex-col gap-1 max-w-sm">
                                <h4 className="text-sm font-semibold text-foreground">Đang tổng hợp giọng nói AI</h4>
                                <p className="text-xs text-muted-foreground">{statusMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Complete */}
                    {step === "complete" && (
                        <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Icon icon="solar:check-circle-bold" width="36" />
                            </div>
                            <h4 className="text-sm font-semibold text-foreground">Đã thêm lồng tiếng thành công!</h4>
                            <p className="text-xs text-muted-foreground">
                                Các đoạn voiceover và phụ đề đã được đặt vào timeline video.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
