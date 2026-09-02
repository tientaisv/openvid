import {
    Input,
    Output,
    Mp4OutputFormat,
    BufferTarget,
    Conversion,
    ALL_FORMATS,
    BlobSource,
    MP4,
} from "mediabunny";

const TARGET_VIDEO_CODEC = "avc";
const TARGET_AUDIO_CODEC = "aac";

export interface VideoFormatCheck {
    needsConversion: boolean;
    reason?: string;
}

export async function checkVideoFormat(file: Blob): Promise<VideoFormatCheck> {
    try {
        const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
        try {
            const format = await input.getFormat();
            if (format !== MP4) {
                return { needsConversion: true, reason: `non-MP4 container (${format.name})` };
            }
            const videoTrack = await input.getPrimaryVideoTrack();
            if (!videoTrack) {
                return { needsConversion: false };
            }
            const videoCodec = await videoTrack.getCodec();
            const videoDecodable = await videoTrack.canDecode().catch(() => true);
            if (videoCodec !== TARGET_VIDEO_CODEC || !videoDecodable) {
                return { needsConversion: true, reason: `video codec ${videoCodec ?? "unknown"}` };
            }
            return { needsConversion: false };
        } finally {
            input.dispose();
        }
    } catch (err) {
        console.warn("Could not inspect the video format:", err);
        return { needsConversion: false };
    }
}

export async function convertToMp4(file: Blob): Promise<Blob> {
    try {
        const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
        try {
            const outputTarget = new BufferTarget();
            const output = new Output({ format: new Mp4OutputFormat(), target: outputTarget });

            const conversion = await Conversion.init({
                input,
                output,
                video: { hardwareAcceleration: "prefer-hardware", keyFrameInterval: 2 },
                audio: { codec: "aac", sampleRate: 48000, numberOfChannels: 2 },
            });

            if (!conversion.isValid) {
                console.warn("Discarded tracks / WebCodecs conversion not available:", conversion.discardedTracks);
                return file;
            }

            await conversion.execute();

            if (!outputTarget.buffer) {
                return file;
            }

            return new Blob([outputTarget.buffer], { type: "video/mp4" });
        } finally {
            input.dispose();
        }
    } catch (err) {
        console.warn("Conversion failed, falling back to original video file:", err);
        return file;
    }
}

export interface NormalizeResult {
    blob: Blob;
    wasConverted: boolean;
    reason?: string;
}

export async function normalizeVideoFile(file: Blob): Promise<NormalizeResult> {
    try {
        const { needsConversion, reason } = await checkVideoFormat(file);

        if (!needsConversion) {
            return { blob: file, wasConverted: false };
        }

        console.info(`Normalizing video to MP4/H.264 — reason: ${reason}`);
        const mp4Blob = await convertToMp4(file);
        return { blob: mp4Blob, wasConverted: mp4Blob !== file, reason };
    } catch (err) {
        console.warn("normalizeVideoFile fallback to original file:", err);
        return { blob: file, wasConverted: false, reason: "fallback-direct" };
    }
}
