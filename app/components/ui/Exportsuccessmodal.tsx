"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export type ExportSuccessMediaType = "video" | "photo";

interface ExportSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType?: ExportSuccessMediaType;
  fileName?: string;
  githubUrl?: string;
  thumbnailDataUrl?: string;
}

const emptySubscribe = () => () => { };

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface ActionCardProps {
  href: string;
  icon: string;
  title: string;
  glowClassName: string;
  showStar?: boolean;
}

function ActionCard({ href, icon, title, glowClassName, showStar }: ActionCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative group flex items-center justify-between w-full overflow-hidden squircle-element border border-border dark:border-white/10 bg-card dark:bg-[#0E0E12] p-4 transition-all hover:border-foreground/20 dark:hover:border-white/20 hover:bg-accent/50 dark:hover:bg-white/4 active:scale-[0.99]"
      aria-label={title}
    >
      <div
        className={`absolute -right-16 -top-16 h-48 w-48 rounded-full blur-[70px] pointer-events-none transition-opacity group-hover:opacity-100 opacity-30 dark:opacity-50 ${glowClassName}`}
      />
      <div className="relative z-10 flex items-center gap-3.5 min-w-0">
        <div className="relative flex h-10 w-10 items-center justify-center squircle-element bg-muted dark:bg-white/5 text-foreground dark:text-white border border-border dark:border-white/10 group-hover:bg-accent dark:group-hover:bg-white/10 transition-colors shrink-0">
          <Icon icon={icon} width="20" height="20" aria-hidden="true" />
          {showStar && (
            <div className="absolute -top-1 -right-1 flex text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              <Icon
                icon="streamline-stickies-color:star"
                width="16"
                height="16"
                aria-hidden="true"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col text-left min-w-0">
          <h4 className="text-sm font-medium text-foreground dark:text-white tracking-tight truncate">
            {title}
          </h4>
        </div>
      </div>
      <Icon
        icon="carbon:arrow-right"
        width="18"
        className="relative z-10 text-muted-foreground dark:text-neutral-600 group-hover:text-foreground dark:group-hover:text-white transition-all transform group-hover:translate-x-1 shrink-0 ml-2"
        aria-hidden="true"
      />
    </a>
  );
}

export function ExportSuccessModal({
  isOpen,
  onClose,
  mediaType = "video",
  fileName,
  githubUrl = "https://github.com/tientaisv/openvid",
  thumbnailDataUrl,
}: ExportSuccessModalProps) {
  const t = useTranslations("exportSuccess");
  const isClient = useIsClient();

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPostData, setAiPostData] = useState<{
    twitterPost?: string;
    linkedinPost?: string;
    productHuntTagline?: string;
    hashtags?: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"twitter" | "linkedin" | "ph">("twitter");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerateSocialPost = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/ai/social-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: thumbnailDataUrl ? [thumbnailDataUrl] : [],
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiPostData(data);
      }
    } catch (e) {
      console.error("AI post generation error:", e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen || !isClient) return null;

  const subtitle = mediaType === "photo" ? t("photoSuccess") : t("videoSuccess");

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-success-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all duration-500 overflow-y-auto"
    >
      <div className="relative p-7 sm:p-8 bg-popover dark:bg-[#0c0c10] border border-border dark:border-white/10 squircle-element-camera shadow-2xl w-full max-w-xl mx-auto my-auto max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
        >
          <Icon icon="lucide:x" width="18" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center h-14 w-14 rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-500 dark:text-green-400 svg-check-animated"
            >
              <path d="M4.5 12.75l6 6 9-13.5" className="svg-check-path" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2
            id="export-success-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1"
          >
            {t("title")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {subtitle}
          </p>
          {fileName && (
            <p className="text-[11px] text-muted-foreground/60 font-mono italic mt-1 tracking-wide truncate">
              {fileName}
            </p>
          )}
        </div>

        {/* AI Marketing Post Generator Card */}
        <div className="mb-6 p-4 rounded-xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Icon icon="solar:magic-stick-3-bold-duotone" width="16" />
              </div>
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                AI Social Launch Copy
              </span>
            </div>
            {!aiPostData && (
              <Button
                size="sm"
                variant="default"
                disabled={isGeneratingAI}
                onClick={handleGenerateSocialPost}
                className="text-xs h-7 px-3 bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
              >
                {isGeneratingAI ? (
                  <>
                    <Icon icon="lucide:loader-2" className="animate-spin mr-1" width="12" />
                    Đang viết...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:stars-minimalistic-bold" className="mr-1" width="12" />
                    Tạo bài viết
                  </>
                )}
              </Button>
            )}
          </div>

          {aiPostData && (
            <div className="flex flex-col gap-2.5 pt-1 border-t border-border/50">
              <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("twitter")}
                  className={`flex-1 text-[11px] font-medium py-1 px-2 rounded-md transition-all ${
                    activeTab === "twitter"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Twitter / X
                </button>
                <button
                  onClick={() => setActiveTab("linkedin")}
                  className={`flex-1 text-[11px] font-medium py-1 px-2 rounded-md transition-all ${
                    activeTab === "linkedin"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  LinkedIn
                </button>
                <button
                  onClick={() => setActiveTab("ph")}
                  className={`flex-1 text-[11px] font-medium py-1 px-2 rounded-md transition-all ${
                    activeTab === "ph"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Product Hunt
                </button>
              </div>

              <div className="relative p-3 rounded-lg bg-background/80 border border-border text-xs leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap text-foreground/90 font-sans">
                {activeTab === "twitter" && (aiPostData.twitterPost || "Chưa có nội dung")}
                {activeTab === "linkedin" && (aiPostData.linkedinPost || "Chưa có nội dung")}
                {activeTab === "ph" && (aiPostData.productHuntTagline || "Chưa có nội dung")}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground truncate">
                  {aiPostData.hashtags?.map((h) => `#${h}`).join(" ")}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs px-2.5 shrink-0 ml-2"
                  onClick={() => {
                    const text =
                      activeTab === "twitter"
                        ? `${aiPostData.twitterPost}\n\n${aiPostData.hashtags?.map((h) => `#${h}`).join(" ")}`
                        : activeTab === "linkedin"
                        ? `${aiPostData.linkedinPost}\n\n${aiPostData.hashtags?.map((h) => `#${h}`).join(" ")}`
                        : aiPostData.productHuntTagline || "";
                    handleCopy(text, activeTab);
                  }}
                >
                  <Icon
                    icon={copiedKey === activeTab ? "lucide:check" : "lucide:copy"}
                    width="12"
                    className="mr-1"
                  />
                  {copiedKey === activeTab ? "Đã chép!" : "Sao chép"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2.5 mb-6">
          <ActionCard
            href={githubUrl}
            icon="mdi:github"
            title={t("starGithub")}
            glowClassName="bg-amber-400/15"
            showStar={true}
          />
        </div>

        <Button onClick={onClose} variant="outline" className="w-full h-10 text-xs">
          <Icon icon="iconoir:cancel" width="14" className="mr-2" />
          {t("close")}
        </Button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}