"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { ZoomFragment } from "@/types/zoom.types";
import { formatZoomTime, zoomLevelToFactor } from "@/types/zoom.types";

interface ZoomGlobalConfigProps {
    fragments: ZoomFragment[];
    onSelectFragment: (fragmentId: string) => void;
    onAddFragment: () => void;
    videoUrl?: string | null;
    videoDuration?: number;
    getThumbnailForTime?: (time: number) => { dataUrl: string } | null;
    onApplyAIFragments?: (fragments: ZoomFragment[]) => void;
}

export function ZoomGlobalConfig({
    fragments,
    onSelectFragment,
    onAddFragment,
    videoUrl,
    videoDuration = 0,
    getThumbnailForTime,
    onApplyAIFragments,
}: ZoomGlobalConfigProps) {
    const t = useTranslations("zoomGlobalConfig");

    const [isAILoading, setIsAILoading] = useState(false);
    const [aiStatus, setAiStatus] = useState<string>("");
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleRunAISmartZoom = async () => {
        if (!videoUrl && (!fragments || fragments.length === 0) && videoDuration <= 0) {
            setAiError("Vui lòng thêm hoặc quay video trước khi chạy AI Zoom.");
            return;
        }

        setIsAILoading(true);
        setAiError(null);
        setAiSummary(null);
        setAiStatus("Đang trích xuất khung hình video...");

        try {
            const duration = videoDuration > 0 ? videoDuration : 10;
            // Denser sampling across the entire timeline (1 frame every 0.65s, up to 45 frames)
            const sampleCount = Math.min(45, Math.max(10, Math.floor(duration / 0.65)));
            const interval = duration / (sampleCount + 1);

            let frames: Array<{ time: number; dataUrl: string }> = [];

            // 1. Try getThumbnailForTime first
            if (getThumbnailForTime) {
                for (let i = 1; i <= sampleCount; i++) {
                    const time = Number((i * interval).toFixed(2));
                    const thumb = getThumbnailForTime(time);
                    if (thumb?.dataUrl) {
                        frames.push({ time, dataUrl: thumb.dataUrl });
                    }
                }
            }

            // 2. If thumbnails not ready or low density, extract high-res frames via offscreen video
            if (frames.length < 5 && videoUrl) {
                frames = await new Promise<Array<{ time: number; dataUrl: string }>>((resolve) => {
                    const video = document.createElement("video");
                    video.crossOrigin = "anonymous";
                    video.src = videoUrl;
                    video.muted = true;
                    video.playsInline = true;

                    const extracted: Array<{ time: number; dataUrl: string }> = [];
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    video.onloadedmetadata = async () => {
                        const videoW = video.videoWidth || 1280;
                        const videoH = video.videoHeight || 720;
                        const targetW = 960;
                        const targetH = Math.round((videoH / videoW) * targetW) || 540;
                        canvas.width = targetW;
                        canvas.height = targetH;

                        for (let i = 1; i <= sampleCount; i++) {
                            const targetTime = Number(Math.min(duration - 0.05, i * interval).toFixed(2));
                            video.currentTime = targetTime;
                            await new Promise((r) => {
                                const onSeeked = () => {
                                    video.removeEventListener("seeked", onSeeked);
                                    if (ctx) {
                                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                                        extracted.push({
                                            time: targetTime,
                                            dataUrl: canvas.toDataURL("image/jpeg", 0.85),
                                        });
                                    }
                                    r(null);
                                };
                                video.addEventListener("seeked", onSeeked);
                            });
                        }
                        resolve(extracted);
                    };

                    video.onerror = () => resolve(frames);
                });
            }

            if (frames.length === 0) {
                throw new Error("Không thể trích xuất khung hình từ video để phân tích.");
            }

            setAiStatus(`Đang phân tích con trỏ chuột & từng cú click (${frames.length} khung hình)...`);

            const response = await fetch("/api/ai/smart-zoom", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    frames,
                    duration,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Không thể tạo AI Zoom Keyframes.");
            }

            if (data.zoomFragments && data.zoomFragments.length > 0) {
                onApplyAIFragments?.(data.zoomFragments);
                setAiSummary(data.summary || `Đã tự động tạo ${data.zoomFragments.length} đoạn Zoom bám theo thao tác click.`);
            } else {
                setAiSummary("Không phát hiện thêm thao tác click chuột cần Zoom.");
            }
        } catch (err: any) {
            console.error("AI Smart Zoom failed:", err);
            setAiError(err.message || "Đã xảy ra lỗi khi chạy AI Smart Zoom.");
        } finally {
            setIsAILoading(false);
            setAiStatus("");
        }
    };

    return (
        <div className="p-4 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-medium">
                    <Icon icon="iconamoon:zoom-in-bold" width="20" aria-hidden="true" />
                    <span>{t("title")}</span>
                </div>
            </div>

            {/* AI Auto Zoom by Click Card */}
            <div className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent p-3.5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <Icon icon="solar:magic-stick-3-bold-duotone" width="18" />
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            Tự động Zoom theo Click chuột
                        </h4>
                        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                            Tự động phát hiện chuột & tạo Keyframe Zoom cho toàn bộ video
                        </p>
                    </div>
                </div>

                {isAILoading && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 animate-pulse">
                        <Icon icon="lucide:loader-2" className="animate-spin" width="14" />
                        <span className="text-[11px] font-medium">{aiStatus}</span>
                    </div>
                )}

                {aiSummary && !isAILoading && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400">
                        <Icon icon="lucide:check-circle-2" width="14" className="shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug">{aiSummary}</span>
                    </div>
                )}

                {aiError && !isAILoading && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
                        <Icon icon="lucide:alert-triangle" width="14" className="shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug">{aiError}</span>
                    </div>
                )}

                <Button
                    variant="default"
                    size="sm"
                    disabled={isAILoading}
                    onClick={handleRunAISmartZoom}
                    className="w-full text-xs font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-500/25 h-8"
                >
                    <Icon icon="solar:stars-minimalistic-bold" width="14" className="mr-1.5" />
                    {isAILoading ? "Đang xử lý..." : "✨ Tự động Zoom toàn bộ video"}
                </Button>
            </div>

            {fragments.length > 0 && (
                <div className="space-y-2">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                        {t("fragments.title", { count: fragments.length })}
                    </div>
                    <div
                        className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1"
                        role="list"
                        aria-label={t("fragments.title", { count: fragments.length })}
                    >
                        {fragments.map((fragment, index) => (
                            <button
                                key={fragment.id}
                                onClick={() => onSelectFragment(fragment.id)}
                                className="w-full flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                                role="listitem"
                                aria-label={`${t("fragments.label", { index: index + 1 })}, ${formatZoomTime(
                                    fragment.startTime
                                )} to ${formatZoomTime(fragment.endTime)}, ${zoomLevelToFactor(
                                    fragment.zoomLevel
                                ).toFixed(1)}× zoom`}
                            >
                                <div className="size-7 rounded-md bg-blue-500/20 flex items-center justify-center">
                                    <Icon
                                        icon="iconamoon:zoom-in-bold"
                                        width="13"
                                        className="text-blue-600 dark:text-blue-400"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="flex flex-col items-start flex-1 min-w-0">
                                    <span className="text-xs text-foreground/90 font-medium truncate">
                                        {(fragment as any).actionLabel || t("fragments.label", { index: index + 1 })}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                        {formatZoomTime(fragment.startTime)} - {formatZoomTime(fragment.endTime)}
                                    </span>
                                </div>
                                <div className="text-[11px] text-muted-foreground/80 font-mono">
                                    {zoomLevelToFactor(fragment.zoomLevel).toFixed(1)}×
                                </div>
                                <Icon
                                    icon="ph:caret-right"
                                    width="14"
                                    className="text-muted-foreground/50 group-hover:text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <Button
                variant="outline"
                className="w-full text-xs"
                onClick={onAddFragment}
                aria-label={t("fragments.add")}
            >
                <Icon icon="ph:plus-bold" width="14" aria-hidden="true" />
                {t("fragments.add")}
            </Button>

            <div className="text-[11px] text-muted-foreground space-y-1 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">{t("shortcuts.keys.delete")}</kbd>
                    <span>{t("shortcuts.delete")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">{t("shortcuts.keys.esc")}</kbd>
                    <span>{t("shortcuts.esc")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">{t("shortcuts.keys.click")}</kbd>
                    <span>{t("shortcuts.clickTrack")}</span>
                </div>
            </div>
        </div>
    );
}